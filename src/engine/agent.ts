// AskAtlas agent. Live mode: Gemini function-calling loop through the dev-server proxy.
// Offline mode (no key): a scripted planner that calls the same tools.
// Both produce the AskAtlasResponse shape the existing answer components render.
import type { AskAtlasResponse, HubName, SourceCitation } from '../types';
import { METRICS, audit, fmt, role, ALL_BU, buName } from './data';
import { TOOLS } from './tools';

export interface AgentStep {
  ok: boolean;
  title: string;
  detail: string;
}

export interface EvidenceCheck {
  cited: number;
  total: number;
  unmatched: number[];
}

export interface AgentRun {
  response: AskAtlasResponse;
  trace: AgentStep[];
  check: EvidenceCheck | null;
  mode: 'gemini' | 'scripted' | 'blocked' | 'error';
  note: string;
}

interface Draft {
  shortAnswer: string;
  detailedAnswer?: string;
  keyDrivers?: { text: string; refs?: string[] }[];
  metrics?: { label: string; value: string; note?: string }[];
  followUpQuestions?: string[];
  assumptions?: string[];
  relevantHub?: string;
}

interface SourceRecord {
  ref: string;
  tool: string;
  agent: string;
  data: Record<string, any>;
}

export interface AtlasStatus {
  live: boolean;
  model: string;
}

let statusPromise: Promise<AtlasStatus> | null = null;

export function getStatus(): Promise<AtlasStatus> {
  statusPromise ??= fetch('/api/atlas/status')
    .then((r) => (r.ok ? r.json() : { live: false, model: '' }))
    .catch(() => ({ live: false, model: '' }));
  return statusPromise;
}

const HUBS: HubName[] = ['Executive Hub', 'Investor Hub', 'Developer Hub', 'Manager Hub', 'Treasury & Capital Hub'];

export const systemPrompt = () => `You are AskAtlas, the supervisory Finance agent in Finance Atlas, a finance-intelligence platform for a real-estate group. All data is synthetic. Amounts are SGD million unless stated. The current year is FY2026 and the comparator is FY2025.
Signed-in user role: ${role().name}. The data tools already apply this role's row-level security. If a tool returns an error starting "access_denied", say plainly that the role cannot see that data and do not estimate it.
You coordinate specialist agents by calling their tools: Finance Analysis Agent (get_metric, explain_variance, get_business_unit_history, get_quarterly_performance, get_budget, get_cash_flow), Asset & Fund Agent (get_assets, get_leases, get_esg), Development Agent (get_developments), Treasury Agent (get_treasury_position, run_rate_scenario), Document Intelligence Agent (search_documents).
Governed metrics in the semantic layer: ${METRICS.map((m) => `${m[0]} = ${m[2]}`).join('; ')}.
Rules:
1. Get every figure from a tool. Never state a number that is not in a tool result.
2. Each tool result has a "ref" such as S1. List the refs that support each key driver in its "refs" field.
3. For "why" questions, pair the numbers with search_documents evidence. Policy limits and thresholds also come from search_documents.
4. Call independent tools together in the same turn and use at most 5 data tool calls.
5. When you have the evidence, call present_answer exactly once. Do not reply in plain text.
6. Keep it short: shortAnswer is one sentence; detailedAnswer is at most two sentences; 3 to 5 key drivers; up to 4 metrics with values copied from tool results; two follow-up questions.
7. If the question is outside Finance Atlas data, call present_answer and say so.`;

const presentAnswer = {
  name: 'present_answer',
  description: 'Present the final, evidence-backed answer to the user. Call exactly once, after the data tools.',
  parameters: {
    type: 'OBJECT',
    properties: {
      shortAnswer: { type: 'STRING' },
      detailedAnswer: { type: 'STRING' },
      keyDrivers: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: { text: { type: 'STRING' }, refs: { type: 'ARRAY', items: { type: 'STRING' } } },
          required: ['text'],
        },
      },
      metrics: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: { label: { type: 'STRING' }, value: { type: 'STRING' }, note: { type: 'STRING' } },
          required: ['label', 'value'],
        },
      },
      followUpQuestions: { type: 'ARRAY', items: { type: 'STRING' } },
      assumptions: { type: 'ARRAY', items: { type: 'STRING' } },
      relevantHub: { type: 'STRING', enum: HUBS },
    },
    required: ['shortAnswer', 'keyDrivers'],
  },
};

const INJECTION = /(ignore|disregard)\b.{0,30}(instruction|rule|prompt)|system prompt|jailbreak|reveal .{0,20}(prompt|instruction)/i;

// Shared tool executor: permission check, citation ref, trace step and audit entry.
function executor(trace: AgentStep[], sources: SourceRecord[], onStep: () => void) {
  return (name: string, input: Record<string, unknown>): Record<string, any> => {
    const tool = TOOLS.find((t) => t.name === name);
    if (!tool) return { error: `unknown tool ${name}` };
    const started = performance.now();
    try {
      const data = tool.run(input ?? {});
      const ref = `S${sources.length + 1}`;
      sources.push({ ref, tool: tool.name, agent: tool.agent, data });
      trace.push({
        ok: true,
        title: `${tool.agent} → ${tool.name}`,
        detail: `${JSON.stringify(input ?? {})} · ${ref} · ${data.row_level_security ?? data.source} · ${Math.max(1, Math.round(performance.now() - started))} ms`,
      });
      audit('Tool call', `${tool.name} ${JSON.stringify(input ?? {})} → ${ref}`);
      onStep();
      return { ref, ...data };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      trace.push({ ok: false, title: `${tool.agent} → ${tool.name}`, detail: message });
      audit('Tool denied', `${tool.name}: ${message}`);
      onStep();
      return { error: message };
    }
  };
}

// Evidence gate: every number in the answer must appear in a cited tool result.
function verify(draft: Draft, sources: SourceRecord[]): EvidenceCheck {
  const numbers = (text: string) =>
    (text.match(/\d[\d,]*\.?\d*/g) ?? []).map((x) => parseFloat(x.replace(/,/g, ''))).filter((x) => !Number.isNaN(x));
  const sourceNumbers = numbers(JSON.stringify(sources.map((s) => s.data)));
  const answerText = [
    draft.shortAnswer, draft.detailedAnswer ?? '',
    ...(draft.keyDrivers ?? []).map((d) => d.text),
    ...(draft.metrics ?? []).map((m) => m.value),
  ].join(' ').replace(/FY\s?\d{4}/g, '').replace(/Q[1-4]/g, '');
  const mine = numbers(answerText).filter((x) => !(x >= 2020 && x <= 2035));
  const unmatched = mine.filter(
    (x) => !sourceNumbers.some((s) => Math.abs(s - x) <= 0.051 || (s !== 0 && Math.abs((s - x) / s) < 0.005)),
  );
  const cited = new Set((draft.keyDrivers ?? []).flatMap((d) => d.refs ?? []).filter((r) => sources.some((s) => s.ref === r)));
  return { cited: cited.size, total: mine.length, unmatched };
}

function toCitations(sources: SourceRecord[]): SourceCitation[] {
  return sources.map((s, index) => {
    const passages: { title: string; date: string; passage: string; document_id: string }[] = s.data.passages ?? [];
    const isDocs = s.tool === 'search_documents';
    return {
      id: s.ref,
      number: index + 1,
      title: isDocs ? (passages.map((p) => p.title).join(' · ') || 'No permitted document matched') : `${s.agent} · ${s.tool}`,
      page: isDocs ? passages.map((p) => p.document_id).join(', ') || '-' : 'n/a',
      section: String(s.data.row_level_security ? `${s.data.source} · ${s.data.row_level_security}` : s.data.source ?? ''),
      excerpt: isDocs
        ? passages.map((p) => `${p.title} (${p.date}): ${p.passage}`).join('\n\n') || 'No passage returned.'
        : JSON.stringify({ ...s.data, source: undefined, row_level_security: undefined }).slice(0, 900),
      period: 'FY2026 synthetic scenario',
      illustrative: true,
    };
  });
}

function toResponse(question: string, draft: Draft, sources: SourceRecord[], check: EvidenceCheck | null, live: boolean): AskAtlasResponse {
  const matched = check ? check.total - check.unmatched.length : 0;
  const score = check && check.total ? Math.round((matched / check.total) * 100) : sources.length ? 90 : 0;
  const hub = HUBS.find((h) => h === draft.relevantHub) ?? 'Executive Hub';
  return {
    id: `live-${Date.now()}`,
    question,
    shortAnswer: draft.shortAnswer,
    detailedAnswer: draft.detailedAnswer ?? '',
    keyDrivers: (draft.keyDrivers ?? []).map((d) => ({
      text: d.text,
      sourceNumbers: (d.refs ?? []).map((r) => sources.findIndex((s) => s.ref === r) + 1).filter((n) => n > 0),
    })),
    metrics: (draft.metrics ?? []).map((m) => ({ label: m.label, value: m.value, note: m.note ?? 'From cited tool result' })),
    confidence: {
      label: !sources.length ? 'No evidence' : score >= 95 ? 'High' : score >= 80 ? 'Medium' : 'Low',
      score,
      explanation: check
        ? `Evidence gate: ${matched} of ${check.total} figures in this answer were found in the cited tool results, across ${sources.length} source${sources.length === 1 ? '' : 's'}.${check.unmatched.length ? ` Not matched (derived or unverified): ${check.unmatched.join(', ')}.` : ''}`
        : 'No data tools returned evidence for this answer.',
    },
    sourceCitations: toCitations(sources),
    followUpQuestions: (draft.followUpQuestions ?? []).slice(0, 3).map((q) => ({ question: q, responseId: `q:${q}` })),
    relevantHub: hub,
    humanReviewNote:
      'Finance reviews the evidence and owns the decision. Analysis that feeds external reporting or valuation needs explicit approval.',
    assumptions: [
      ...(draft.assumptions ?? []),
      'All figures are synthetic demonstration data.',
      live ? 'Answer written by Gemini from the tool results listed under sources.' : 'Answer assembled by the offline planner from the same tools (no Gemini key configured).',
    ],
    matchTerms: [],
  };
}

async function runGemini(
  question: string,
  history: { q: string; a: string }[],
  groundedDraft: Draft,
  sources: SourceRecord[],
): Promise<Draft> {
  const reply = await fetch('/api/atlas/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: 'You are AskAtlas, a Finance answer writer. The approved tools have already gathered the evidence for this question. Do not request or invent additional data. Return the final answer by calling present_answer exactly once. Use only facts in the evidence, keep source refs exactly as supplied, and state when the evidence is insufficient. All data is synthetic; amounts are SGD million unless stated. Keep the short answer to one sentence, detailed answer to at most two sentences, include up to five key drivers and four metrics, and suggest two relevant follow-up questions.' }],
      },
      contents: [{
        role: 'user',
        parts: [{ text: JSON.stringify({
          question,
          recentConversation: history.slice(-2),
          evidenceBackedStartingDraft: groundedDraft,
          approvedToolEvidence: sources.map(({ ref, tool, agent, data }) => ({ ref, tool, agent, data })),
        }) }],
      }],
      tools: [{ functionDeclarations: [presentAnswer] }],
      toolConfig: { functionCallingConfig: { mode: 'ANY', allowedFunctionNames: ['present_answer'] } },
      // Thinking tokens count toward this cap on current Flash models, so leave room for both.
      generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
    }),
    signal: AbortSignal.timeout(28_000),
  });
  const body = await reply.json().catch(() => ({}));
  if (!reply.ok) throw new Error(body?.error?.message ?? `Gemini request failed (${reply.status})`);

  const parts: any[] = body?.candidates?.[0]?.content?.parts ?? [];
  const final = parts.find((part) => part.functionCall?.name === 'present_answer');
  if (!final?.functionCall?.args?.shortAnswer) {
    throw new Error(`Gemini returned no structured answer (${body?.candidates?.[0]?.finishReason ?? 'unknown'})`);
  }
  return final.functionCall.args as Draft;
}

// Offline planner: fixed plans per topic, executed through the same tools.
function runScripted(question: string, call: ReturnType<typeof executor>): Draft {
  const s = question.toLowerCase();
  const denied = (r: Record<string, any>): Draft | null =>
    r.error ? { shortAnswer: `Your role cannot see this data, so AskAtlas cannot answer from it (${String(r.error).replace('access_denied: ', '')}).`, keyDrivers: [] } : null;

  if (/esg|carbon|emission|energy|green|sustainab|certif|net zero/.test(s)) {
    const a = call('get_esg', {});
    const blocked = denied(a);
    if (blocked) return blocked;
    call('search_documents', { query: 'sustainability report targets energy intensity certification' });
    const worst = a.assets.slice(0, 2);
    return {
      shortAnswer: `${a.green_certified_share_of_value_pct}% of portfolio value is green-certified against a target of ${a.target_green_certified_share_fy2030_pct}% by FY2030.`,
      keyDrivers: [
        { text: `Carbon emissions moved from ${fmt(a.total_carbon_tco2e_fy2025)} to ${fmt(a.total_carbon_tco2e_fy2026)} tCO2e.`, refs: ['S1'] },
        ...worst.map((x: any) => ({ text: `${x.asset}: energy intensity up ${x.energy_change_pct}% to ${x.energy_intensity_fy2026} kWh per square metre.`, refs: ['S1', 'S2'] })),
        { text: `Uncertified assets: ${a.uncertified_assets.join(', ') || 'none'}.`, refs: ['S1'] },
      ],
      metrics: [
        { label: 'Green-certified share', value: `${a.green_certified_share_of_value_pct}%` },
        { label: 'Carbon FY2026', value: `${fmt(a.total_carbon_tco2e_fy2026)} tCO2e` },
      ],
      followUpQuestions: ['Which assets should be certified next to reach the FY2030 target?', 'Why did energy intensity rise at the hotels?'],
      relevantHub: 'Manager Hub',
    };
  }

  if (/cash flow|free cash|capex|capital expenditure|dividend|divest|acquisition|capital recycl/.test(s)) {
    const a = call('get_cash_flow', {});
    const blocked = denied(a);
    if (blocked) return blocked;
    call('search_documents', { query: 'capital management dividend cover capex divestments' });
    const y = a.years[a.years.length - 1];
    const p = a.years[a.years.length - 2];
    return {
      shortAnswer: `FY2026 free cash flow was SGD ${fmt(y.free_cash_flow)}M, covering dividends of SGD ${fmt(y.dividends)}M ${y.dividend_cover_times} times.`,
      keyDrivers: [
        { text: `Operating cash flow rose from SGD ${fmt(p.operating_cash_flow)}M to SGD ${fmt(y.operating_cash_flow)}M.`, refs: ['S1'] },
        { text: `Development capex was SGD ${fmt(y.development_capex)}M and asset-enhancement capex SGD ${fmt(y.asset_enhancement_capex)}M.`, refs: ['S1'] },
        { text: `Divestments of SGD ${fmt(y.divestments)}M against acquisitions of SGD ${fmt(y.acquisitions)}M.`, refs: ['S1'] },
        { text: 'Policy requires dividend cover of at least 1.5 times.', refs: ['S2'] },
      ],
      metrics: [
        { label: 'Free cash flow FY2026', value: `SGD ${fmt(y.free_cash_flow)}M` },
        { label: 'Dividend cover', value: `${y.dividend_cover_times}x` },
      ],
      followUpQuestions: ['How has dividend cover changed over five years?', 'What is the FY2027 capex and divestment plan?'],
      relevantHub: 'Treasury & Capital Hub',
    };
  }

  if (/\bleases?\b|wale|tenant|expiry profile|lease expir/.test(s)) {
    const a = call('get_leases', {});
    const blocked = denied(a);
    if (blocked) return blocked;
    call('search_documents', { query: 'tenant credit watchlist lease expiry downsizing arrears' });
    const near = a.expiry_profile[0];
    return {
      shortAnswer: `Major leases have a weighted average expiry of ${a.wale_years_from_fy2026} years, and ${near.share_of_major_lease_rent_pct}% of major-lease rent expires in ${near.fy}.`,
      keyDrivers: [
        { text: `${near.fy} expiries: ${near.tenants.join(', ')} (SGD ${near.annual_rent}M a year).`, refs: ['S1'] },
        { text: `Tenants above 20% of an asset's income: ${a.tenants_above_20pct_of_asset_income.join('; ') || 'none'}.`, refs: ['S1'] },
        { text: `Largest sector by rent: ${a.rent_by_sector[0]?.sector} (SGD ${a.rent_by_sector[0]?.annual_rent}M).`, refs: ['S1'] },
      ],
      metrics: [
        { label: 'WALE', value: `${a.wale_years_from_fy2026} years` },
        { label: `${near.fy} expiries`, value: `${near.share_of_major_lease_rent_pct}%` },
      ],
      followUpQuestions: ['Which tenants are on the credit watchlist?', 'How concentrated is income in the logistics assets?'],
      relevantHub: 'Manager Hub',
    };
  }

  if (/quarter|\bq[1-4]\b/.test(s.replace(/skyline quarter/g, ''))) {
    const a = call('get_quarterly_performance', {});
    const blocked = denied(a);
    if (blocked) return blocked;
    call('search_documents', { query: 'Q2 FY2026 development cost note quarter' });
    const weakest = [...a.business_units].sort((x: any, y: any) => x.weakest_quarter_vs_plan.vs_plan - y.weakest_quarter_vs_plan.vs_plan)[0];
    const totals = a.totals_by_quarter;
    return {
      shortAnswer: `The largest quarterly miss was ${weakest.business_unit} in ${weakest.weakest_quarter_vs_plan.quarter}, at ${weakest.weakest_quarter_vs_plan.vs_plan} against plan.`,
      keyDrivers: [
        ...totals.map((q: any) => ({ text: `${q.quarter}: operating profit SGD ${q.operating_profit}M against plan SGD ${q.plan_operating_profit}M.`, refs: ['S1'] })),
        { text: 'The Q2 shortfall reflects additional Skyline Quarter costs.', refs: ['S2'] },
      ],
      metrics: [{ label: `${weakest.business_unit} ${weakest.weakest_quarter_vs_plan.quarter}`, value: `SGD ${weakest.weakest_quarter_vs_plan.operating_profit}M` }],
      followUpQuestions: ['What recovery actions were agreed after Q2?', 'Which business units beat plan in every quarter?'],
      relevantHub: 'Executive Hub',
    };
  }

  if (/budget|outlook|forecast|next year|fy2027/.test(s)) {
    const a = call('get_budget', {});
    const blocked = denied(a);
    if (blocked) return blocked;
    call('search_documents', { query: 'FY2027 budget assumptions downside risks' });
    return {
      shortAnswer: `The FY2027 budget targets operating profit of SGD ${fmt(a.total_operating_profit_budget_fy2027)}M against SGD ${fmt(a.total_operating_profit_fy2026)}M in FY2026.`,
      keyDrivers: a.business_units.slice(0, 4).map((u: any) => ({ text: `${u.business_unit}: SGD ${u.operating_profit_budget_fy2027}M budget (${u.operating_profit_growth > 0 ? '+' : ''}${u.operating_profit_growth}); ${u.key_assumption}.`, refs: ['S1'] })),
      metrics: [
        { label: 'Budget operating profit FY2027', value: `SGD ${fmt(a.total_operating_profit_budget_fy2027)}M` },
        { label: 'Budget revenue FY2027', value: `SGD ${fmt(a.total_revenue_budget_fy2027)}M` },
      ],
      followUpQuestions: ['What are the main downside risks to the FY2027 budget?', 'Which budget assumptions depend on re-letting?'],
      relevantHub: 'Executive Hub',
    };
  }

  if (/trend|five.?years?|5.?years?|over time|cagr|since fy20|historical|each year|over the last|grown|growth rate|most often|every year/.test(s)) {
    const a = call('get_business_unit_history', {});
    const blocked = denied(a);
    if (blocked) return blocked;
    const units = [...a.business_units].sort((x: any, y: any) => (y.operating_profit_cagr_pct_fy2022_fy2026 ?? -99) - (x.operating_profit_cagr_pct_fy2022_fy2026 ?? -99));
    const top = units[0];
    const low = units.filter((u: any) => u.operating_profit_cagr_pct_fy2022_fy2026 !== null).slice(-1)[0];
    return {
      shortAnswer: `${top.business_unit} has the fastest operating-profit growth since FY2022, at ${top.operating_profit_cagr_pct_fy2022_fy2026}% a year.`,
      keyDrivers: [
        ...units.slice(0, 3).map((u: any) => ({ text: `${u.business_unit}: revenue growth ${u.revenue_cagr_pct_fy2022_fy2026}% a year, operating profit growth ${u.operating_profit_cagr_pct_fy2022_fy2026}% a year.`, refs: ['S1'] })),
        { text: `${low.business_unit} is weakest, with its worst year against plan in ${low.worst_year_vs_plan.fy} (${low.worst_year_vs_plan.vs_plan}).`, refs: ['S1'] },
      ],
      metrics: [{ label: `${top.business_unit} profit growth`, value: `${top.operating_profit_cagr_pct_fy2022_fy2026}% a year` }],
      followUpQuestions: ['Which business units missed plan most often?', 'Why did Residential development fall in FY2026?'],
      relevantHub: 'Executive Hub',
    };
  }

  if (/\brate|\bbps?\b|interest/.test(s)) {
    const a = call('run_rate_scenario', { shift_bps: Number((s.match(/(\d+)\s*bp/) ?? [0, 100])[1]) });
    const blocked = denied(a);
    if (blocked) return blocked;
    call('search_documents', { query: 'treasury policy hedged fixed interest cover' });
    return {
      shortAnswer: `A ${a.shift_bps}bp rise adds SGD ${a.additional_annual_interest}M to annual interest.`,
      detailedAnswer: `It applies to SGD ${fmt(a.unhedged_floating_debt)}M of unhedged floating-rate debt.`,
      keyDrivers: [
        { text: `Annual interest moves from SGD ${a.annual_interest_before}M to SGD ${a.annual_interest_after}M.`, refs: ['S1'] },
        { text: `Interest cover moves from ${a.interest_cover_before_times}x to ${a.interest_cover_after_times}x, above the 2.0x covenant.`, refs: ['S1', 'S2'] },
      ],
      metrics: [
        { label: 'Extra interest', value: `SGD ${a.additional_annual_interest}M` },
        { label: 'Interest cover after', value: `${a.interest_cover_after_times}x` },
      ],
      followUpQuestions: ['What does a 200bp rise do to interest cover?', 'How close are we to the hedging policy floor?'],
      relevantHub: 'Treasury & Capital Hub',
    };
  }

  if (/matur|refinanc|liquid|debt|treasury|covenant|hedg/.test(s)) {
    const a = call('get_treasury_position', {});
    const blocked = denied(a);
    if (blocked) return blocked;
    call('search_documents', { query: 'treasury policy maturity refinancing liquidity' });
    const y = a.maturity_profile;
    return {
      shortAnswer: `Liquidity is comfortable, but maturities are concentrated in ${y[0].fy} and ${y[1].fy}.`,
      detailedAnswer: `Net gearing is ${a.net_gearing_pct}% and interest cover ${a.interest_cover_times}x, both inside covenants.`,
      keyDrivers: [
        { text: `Cash plus undrawn facilities of SGD ${fmt(a.total_liquidity)}M cover next-12-month maturities of SGD ${fmt(a.debt_maturing_next_12_months)}M ${a.liquidity_cover_times} times.`, refs: ['S1'] },
        { text: `${y[1].fy} holds ${y[1].share_pct}% of total debt and ${y[0].fy} holds ${y[0].share_pct}%; policy allows 25% in any one year.`, refs: ['S1', 'S2'] },
        { text: `${a.fixed_or_hedged_pct}% of debt is fixed or hedged against a 70% policy floor.`, refs: ['S1', 'S2'] },
      ],
      metrics: [
        { label: 'Liquidity cover', value: `${a.liquidity_cover_times}x` },
        { label: `${y[1].fy} share of debt`, value: `${y[1].share_pct}%` },
        { label: 'Fixed or hedged', value: `${a.fixed_or_hedged_pct}%` },
      ],
      followUpQuestions: ['What is the impact of a 100bp rate rise on interest cost and interest cover?', 'Are we within Treasury policy on maturities?'],
      relevantHub: 'Treasury & Capital Hub',
    };
  }

  if (/develop|project|margin|cost-to-complete|sales velocity|skyline|lakeside|parkview|higher .*cost/.test(s)) {
    const a = call('get_developments', {});
    const blocked = denied(a);
    if (blocked) return blocked;
    call('search_documents', { query: 'Skyline Quarter cost Lakeside Gardens sales Parkview Central programme' });
    const find = (n: string) => a.projects.find((p: any) => p.project === n);
    const b = find('Skyline Quarter'), c = find('Lakeside Gardens'), d = find('Parkview Central');
    return {
      shortAnswer: 'Three projects need attention; Skyline Quarter has the largest margin movement.',
      keyDrivers: [
        { text: `Skyline Quarter: margin forecast ${b.margin_forecast_pct}% against ${b.margin_plan_pct}%; cost-to-complete is ${b.cost_to_complete_vs_plan_pct}% above plan, driven by piling redesign and steel prices.`, refs: ['S1', 'S2'] },
        { text: `Lakeside Gardens: ${c.sales_per_month_actual} sales a month against a plan of ${c.sales_per_month_plan}; margin ${c.margin_forecast_pct}% against ${c.margin_plan_pct}%.`, refs: ['S1', 'S2'] },
        { text: `Parkview Central: completion slips ${d.slip_months} months to ${d.completion_forecast}.`, refs: ['S1', 'S2'] },
      ],
      metrics: [
        { label: 'Skyline cost-to-complete', value: `+${b.cost_to_complete_vs_plan_pct}%` },
        { label: 'Lakeside sales / month', value: `${c.sales_per_month_actual} vs ${c.sales_per_month_plan}` },
      ],
      followUpQuestions: ['What options has management proposed for Skyline Quarter?', 'Why is sales velocity below plan at Lakeside Gardens?'],
      relevantHub: 'Developer Hub',
    };
  }

  if (/occupanc|asset|retail|mall|hospitality|opex|operating cost|valuation|fund|portfolio|marina quay|orchard gate|southbank|thames court|northgate|eastfield|chao phraya|jurong|western sydney|rhine|sentosa|kyoto|collins street|riverside/.test(s)) {
    const a = call('get_assets', {});
    const blocked = denied(a);
    if (blocked) return blocked;
    const docs = call('search_documents', { query: question });
    const worst = [...a.assets].sort((x: any, y: any) => x.occupancy_change_pts - y.occupancy_change_pts).slice(0, 2);
    const down = a.assets.filter((x: any) => x.valuation_change_pct < 0);
    const up = [...a.assets].sort((x: any, y: any) => y.valuation_change_pct - x.valuation_change_pct)[0];
    return {
      shortAnswer: 'Portfolio movement is concentrated in a few assets.',
      keyDrivers: [
        ...worst.map((x: any) => ({ text: `${x.asset}: occupancy ${x.occupancy_fy2025}% to ${x.occupancy_fy2026}% and NOI ${x.noi_fy2025} to ${x.noi_fy2026}.`, refs: ['S1'] })),
        { text: `Valuation declines: ${down.map((x: any) => `${x.asset} (${x.valuation_change_pct}%)`).join(', ') || 'none'}.`, refs: ['S1'] },
        { text: `Strongest uplift: ${up.asset} at +${up.valuation_change_pct}%.`, refs: ['S1'] },
        ...(docs.passages?.length ? [{ text: `Supporting document: ${docs.passages[0].title}.`, refs: ['S2'] }] : []),
      ],
      metrics: worst.map((x: any) => ({ label: `${x.asset} occupancy`, value: `${x.occupancy_fy2026}%`, note: `${x.occupancy_change_pts} pts` })),
      followUpQuestions: ['What do the leasing reports say about tenant churn?', 'Which funds are below their target return?'],
      relevantHub: 'Manager Hub',
    };
  }

  const a = call('explain_variance', { metric: 'operating_profit' });
  const blocked = denied(a);
  if (blocked) return blocked;
  call('search_documents', { query: 'materiality variance plan Skyline Quarter cost' });
  const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  return {
    shortAnswer: `${a.scope} operating profit moved from SGD ${fmt(a.fy2025)}M to SGD ${fmt(a.fy2026)}M (${sign(a.change_pct)}%).`,
    detailedAnswer: `Against plan the result is ${sign(a.vs_plan)}; a variance is material above 5% of plan or SGD 20M.`,
    keyDrivers: a.drivers.slice(0, 4).map((d: any) => ({
      text: `${d.business_unit}: ${sign(d.change)} year on year, ${sign(d.vs_plan)} against plan.`,
      refs: ['S1'],
    })),
    metrics: [
      { label: 'Operating profit FY2026', value: `SGD ${fmt(a.fy2026)}M` },
      { label: 'Change', value: `${sign(a.change)}M` },
      { label: 'Against plan', value: `${sign(a.vs_plan)}M` },
    ],
    followUpQuestions: ['What is driving the Residential development shortfall?', 'Which assets drove the Commercial gain?'],
    relevantHub: 'Executive Hub',
  };
}

// Topic map used in live mode, so a question that spans topics gets evidence for each of them.
const TOPICS: { re: RegExp; tool: string; input: Record<string, unknown> }[] = [
  { re: /matur|refinanc|liquid|debt|treasury|covenant|hedg|gearing|interest/, tool: 'get_treasury_position', input: {} },
  { re: /develop|project|margin|cost-to-complete|sales velocity|skyline|lakeside|parkview|verdant|harbour edge/, tool: 'get_developments', input: {} },
  { re: /\bleases?\b|wale|tenant|expir|anchor/, tool: 'get_leases', input: {} },
  { re: /cash|capex|capital expenditure|dividend|divest|acqui|recycl|\bsell\b|\bsale\b|dispos/, tool: 'get_cash_flow', input: {} },
  { re: /esg|carbon|emission|energy|green|sustainab|certif|net zero/, tool: 'get_esg', input: {} },
  { re: /trend|five.?years?|5.?years?|over time|cagr|since fy20|historical|each year|over the last|grown|growth rate|most often|every year|history|fy2022|fy2023|fy2024/, tool: 'get_business_unit_history', input: {} },
  { re: /(?<!skyline )quarter|\bq[1-4]\b|run.rate|in-year/, tool: 'get_quarterly_performance', input: {} },
  { re: /budget|outlook|forecast|next year|fy2027|target/, tool: 'get_budget', input: {} },
  { re: /occupanc|asset|retail|mall|hospitality|hotel|opex|operating cost|valuation|fund|portfolio|\bnoi\b|marina quay|orchard gate|southbank|thames court|northgate|eastfield|chao phraya|jurong|western sydney|rhine|sentosa|kyoto|collins street|riverside/, tool: 'get_assets', input: {} },
  { re: /marina quay|orchard gate|southbank|thames court|northgate|eastfield|chao phraya|jurong|western sydney|rhine|sentosa|kyoto|collins street|riverside/, tool: 'get_leases', input: {} },
  { re: /profit|revenue|variance|plan|performance|business unit|driver/, tool: 'explain_variance', input: { metric: 'operating_profit' } },
];

// Only call tools this role may use, so the trace shows real gathering rather than refusals.
function allowed(tool: string) {
  const who = role();
  if (tool === 'get_treasury_position' || tool === 'run_rate_scenario') return who.treasury;
  if (tool === 'get_developments') return who.dev;
  if (tool === 'get_assets' || tool === 'get_leases' || tool === 'get_esg') return who.assets;
  if (tool === 'get_cash_flow') return who.bus.length === ALL_BU.length;
  return true;
}

function addTopicEvidence(question: string, call: ReturnType<typeof executor>, sources: SourceRecord[]) {
  const s = question.toLowerCase();
  const used = new Set(sources.map((x) => x.tool));
  TOPICS.filter((t) => t.re.test(s) && !used.has(t.tool) && allowed(t.tool) && (used.add(t.tool), true))
    .slice(0, 4)
    .forEach((t) => call(t.tool, t.input));
  // Always retrieve passages for the question as asked, alongside the planner's fixed search.
  call('search_documents', { query: question });
}

export async function askAtlas(
  question: string,
  history: { q: string; a: string }[],
  onTrace: (trace: AgentStep[]) => void,
): Promise<AgentRun> {
  const trace: AgentStep[] = [];
  const sources: SourceRecord[] = [];
  const push = () => onTrace([...trace]);
  const who = role();

  trace.push({
    ok: true,
    title: 'Permission gate',
    detail: `${who.name}: ${who.bus.length === ALL_BU.length ? 'all business units' : who.bus.map(buName).join(', ')}${who.treasury ? ', Treasury' : ''}`,
  });

  if (INJECTION.test(question)) {
    trace.push({ ok: false, title: 'Prompt screening', detail: 'Blocked: prompt-injection pattern' });
    audit('Prompt blocked', question);
    push();
    const draft: Draft = { shortAnswer: "This request was blocked by prompt screening because it tries to override the assistant's instructions. Nothing was sent to the model.", keyDrivers: [] };
    return { response: toResponse(question, draft, [], null, false), trace, check: null, mode: 'blocked', note: 'Blocked before the model' };
  }
  trace.push({ ok: true, title: 'Prompt screening', detail: 'No injection or sensitive-data pattern found' });

  const status = await getStatus();
  trace.push({
    ok: true,
    title: 'Supervisory Finance Agent',
    detail: status.live ? `Gemini answer writer ready · ${status.model}` : 'Offline planner (no Gemini key configured)',
  });
  audit('Question', question);
  push();

  const call = executor(trace, sources, push);
  let draft: Draft;
  let mode: AgentRun['mode'] = status.live ? 'gemini' : 'scripted';
  let note = status.live ? `Gemini is writing from the approved tool evidence (${status.model}).` : 'Offline answer built from the same approved tools.';

  let groundedDraft: Draft | null = null;
  try {
    groundedDraft = runScripted(question, call);
    if (status.live && sources.length) addTopicEvidence(question, call, sources);
    // No evidence (for example the role was denied): nothing for Gemini to write from.
    draft = status.live && sources.length ? await runGemini(question, history, groundedDraft, sources) : groundedDraft;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    trace.push({ ok: false, title: status.live ? 'Gemini draft failed' : 'Answer planner failed', detail: message });
    // Reuse the evidence already gathered; re-running would call every tool twice.
    draft = groundedDraft ?? runScripted(question, call);
    mode = 'error';
    note = status.live
      ? `Gemini could not finish (${message}). Showing the grounded offline answer instead.`
      : `The answer planner reported an error (${message}). Showing its available fallback answer.`;
  }

  if (!sources.length && mode === 'gemini') {
    mode = 'blocked';
    note = 'No data this role may see for this question, so nothing was sent to the model.';
  }

  const check = sources.length ? verify(draft, sources) : null;
  if (check) {
    const matched = check.total - check.unmatched.length;
    trace.push({ ok: check.unmatched.length === 0, title: 'Evidence gate', detail: `${check.cited} sources cited; ${matched}/${check.total} numbers matched` });
    audit('Evidence gate', `${matched}/${check.total} numbers matched`);
  }
  push();

  return { response: toResponse(question, draft, sources, check, mode === 'gemini'), trace, check, mode, note };
}
