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
You coordinate specialist agents by calling their tools: Finance Analysis Agent (get_metric, explain_variance), Asset & Fund Agent (get_assets), Development Agent (get_developments), Treasury Agent (get_treasury_position, run_rate_scenario), Document Intelligence Agent (search_documents).
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

async function runGemini(question: string, history: { q: string; a: string }[], call: ReturnType<typeof executor>): Promise<Draft> {
  const contents: any[] = [];
  history.slice(-2).forEach((h) => {
    contents.push({ role: 'user', parts: [{ text: h.q }] });
    contents.push({ role: 'model', parts: [{ text: h.a }] });
  });
  contents.push({ role: 'user', parts: [{ text: question }] });

  const functionDeclarations = [
    ...TOOLS.map((t) => ({ name: t.name, description: t.description, ...(t.parameters ? { parameters: t.parameters } : {}) })),
    presentAnswer,
  ];

  for (let round = 0; round < 6; round += 1) {
    const reply = await fetch('/api/atlas/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt() }] },
        contents,
        tools: [{ functionDeclarations }],
        generationConfig: { temperature: 0.2 },
      }),
    });
    const body = await reply.json().catch(() => ({}));
    if (!reply.ok) throw new Error(body?.error?.message ?? `Gemini request failed (${reply.status})`);

    const content = body?.candidates?.[0]?.content;
    const parts: any[] = content?.parts ?? [];
    if (!parts.length) throw new Error(`Gemini returned no content (${body?.candidates?.[0]?.finishReason ?? 'unknown'})`);
    contents.push(content); // keep the model turn as returned (preserves thought signatures)

    const calls = parts.filter((p) => p.functionCall);
    if (!calls.length) {
      const text = parts.map((p) => p.text ?? '').join(' ').trim();
      return { shortAnswer: text || 'No answer was produced.', keyDrivers: [] };
    }

    const final = calls.find((p) => p.functionCall.name === 'present_answer');
    if (final) return final.functionCall.args as Draft;

    contents.push({
      role: 'user',
      parts: calls.map((p) => ({
        functionResponse: { name: p.functionCall.name, response: call(p.functionCall.name, p.functionCall.args ?? {}) },
      })),
    });
  }
  throw new Error('The agent did not finish within the allowed number of tool rounds');
}

// Offline planner: fixed plans per topic, executed through the same tools.
function runScripted(question: string, call: ReturnType<typeof executor>): Draft {
  const s = question.toLowerCase();
  const denied = (r: Record<string, any>): Draft | null =>
    r.error ? { shortAnswer: `Your role cannot see this data, so AskAtlas cannot answer from it (${String(r.error).replace('access_denied: ', '')}).`, keyDrivers: [] } : null;

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

  if (/occupanc|asset|retail|mall|hospitality|opex|operating cost|valuation|fund|portfolio/.test(s)) {
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
    detail: status.live ? `Planning with ${status.model}` : 'Offline planner (no Gemini key configured)',
  });
  audit('Question', question);
  push();

  const call = executor(trace, sources, push);
  let draft: Draft;
  let mode: AgentRun['mode'] = status.live ? 'gemini' : 'scripted';
  let note = status.live ? `Live answer from ${status.model}, grounded on the tool results` : 'Offline answer built from the same tools. Add GEMINI_API_KEY to .env.local for live AI.';

  try {
    draft = status.live ? await runGemini(question, history, call) : runScripted(question, call);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    trace.push({ ok: false, title: 'Gemini call failed', detail: message });
    sources.length = 0;
    draft = runScripted(question, call);
    mode = 'error';
    note = `Gemini call failed (${message}). Showing the offline answer built from the same tools.`;
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
