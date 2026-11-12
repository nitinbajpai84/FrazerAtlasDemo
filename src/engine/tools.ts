// Agent tools and the Atlas Recommends signal engine.
// Tools are the only way an agent can read data. Each one applies the signed-in role's access.
import type { HubName, Recommendation } from '../types';
import {
  ALL_BU, ASSETS, BU, BU_HISTORY, BUDGET_FY2027, CASH_FLOW, DOCS, ESG, FUNDS, FY, GROUP, LEASES, PROJECTS, QUARTERLY, TSY,
  buName, pct, portfolioValue, r1, role, sum, treasury, visibleAssets,
} from './data';
import { searchLocalDocuments } from './semanticSearch';

export interface AtlasTool {
  name: string;
  agent: string;
  description: string;
  parameters?: Record<string, unknown>; // Gemini function-declaration schema
  run: (input: Record<string, unknown>) => Record<string, any>;
}

const deny = (what: string): never => {
  throw new Error(`access_denied: role "${role().name}" has no access to ${what}`);
};

const fullScope = () => role().bus.length === ALL_BU.length;
const scopeLabel = () => (fullScope() ? 'all business units' : `filtered to ${role().bus.map(buName).join(', ')}`);

export const TOOLS: AtlasTool[] = [
  {
    name: 'get_metric',
    agent: 'Finance Analysis Agent',
    description:
      "Returns a governed metric from the semantic layer. metric: revenue | operating_profit | nav | roce | portfolio_valuation. by: 'group' gives the FY2022-FY2026 trend; 'business_unit' gives FY2025, FY2026, change and plan per business unit (revenue and operating_profit only).",
    parameters: {
      type: 'OBJECT',
      properties: { metric: { type: 'STRING' }, by: { type: 'STRING', enum: ['group', 'business_unit'] } },
      required: ['metric'],
    },
    run(input) {
      const metric = String(input.metric ?? '');
      const key = ({ revenue: 'revenue', operating_profit: 'op', nav: 'nav', roce: 'roce', portfolio_valuation: 'val' } as Record<string, string>)[metric];
      if (!key) throw new Error('unknown metric; use revenue, operating_profit, nav, roce or portfolio_valuation');

      if (input.by === 'business_unit' && (metric === 'revenue' || metric === 'operating_profit')) {
        const isOp = metric === 'operating_profit';
        return {
          source: `curated.fin_performance via semantic layer metric '${metric}'`,
          row_level_security: scopeLabel(),
          unit: 'SGD M',
          rows: BU.filter((b) => role().bus.includes(b.id)).map((b) => ({
            business_unit: b.name,
            fy2025: isOp ? b.op25 : b.rev25,
            fy2026: isOp ? b.op26 : b.rev26,
            change: isOp ? b.op26 - b.op25 : b.rev26 - b.rev25,
            ...(isOp ? { plan_fy2026: b.plan26, vs_plan: b.op26 - b.plan26 } : {}),
          })),
        };
      }

      if (!fullScope()) deny(`Group totals (only ${role().bus.map(buName).join(', ')} data)`);
      const series: number[] =
        key === 'val' ? [...GROUP.valuationHistory, portfolioValue()] : (GROUP as Record<string, number[]>)[key];
      return {
        source: `curated.${key === 'val' ? 'asset_valuation' : key === 'nav' || key === 'roce' ? 'fin_balance_sheet' : 'fin_performance'} via semantic layer metric '${metric}'`,
        unit: metric === 'roce' ? '%' : 'SGD M',
        trend: FY.map((year, index) => ({ fy: `FY${year}`, value: series[index] })),
        fy2026_vs_fy2025_change: r1(series[4] - series[3]),
        ...(metric === 'roce' ? {} : { change_pct: pct(series[4], series[3]) }),
      };
    },
  },
  {
    name: 'explain_variance',
    agent: 'Finance Analysis Agent',
    description:
      "Decomposes the FY2026 vs FY2025 movement in revenue or operating_profit into business-unit drivers, with variance to plan, the assets with the largest NOI movement and the development projects with margin erosion. Use for 'what changed and why' questions.",
    parameters: {
      type: 'OBJECT',
      properties: { metric: { type: 'STRING', enum: ['operating_profit', 'revenue'] } },
      required: ['metric'],
    },
    run(input) {
      const isOp = input.metric !== 'revenue';
      const rows = BU.filter((b) => role().bus.includes(b.id));
      const from = sum(rows, (b) => (isOp ? b.op25 : b.rev25));
      const to = sum(rows, (b) => (isOp ? b.op26 : b.rev26));
      const out: Record<string, any> = {
        source: 'curated.fin_performance + curated.asset_operations + curated.dev_projects',
        metric: isOp ? 'operating_profit' : 'revenue',
        unit: 'SGD M',
        scope: fullScope() ? 'Group' : rows.map((b) => b.name).join(', '),
        fy2025: from,
        fy2026: to,
        change: to - from,
        change_pct: pct(to, from),
        drivers: rows
          .map((b) => ({
            business_unit: b.name,
            change: isOp ? b.op26 - b.op25 : b.rev26 - b.rev25,
            ...(isOp ? { vs_plan: b.op26 - b.plan26 } : {}),
          }))
          .sort((a, b) => Math.abs(b.change) - Math.abs(a.change)),
      };
      if (isOp) {
        out.plan_fy2026 = sum(rows, (b) => b.plan26);
        out.vs_plan = to - out.plan_fy2026;
        out.largest_asset_noi_movements = visibleAssets()
          .map((a) => ({ asset: a.name, business_unit: buName(a.bu), noi_change: r1(a.noi26 - a.noi25), occupancy_change_pts: r1(a.occ26 - a.occ25) }))
          .sort((a, b) => Math.abs(b.noi_change) - Math.abs(a.noi_change))
          .slice(0, 5);
        if (role().dev) {
          out.development_margin_erosion = PROJECTS.filter((p) => p.mPlan - p.mFcst >= 1).map((p) => ({
            project: p.name, margin_plan_pct: p.mPlan, margin_forecast_pct: p.mFcst,
          }));
        }
      }
      return out;
    },
  },
  {
    name: 'get_assets',
    agent: 'Asset & Fund Agent',
    description:
      'Returns investment assets with valuation (FY2025, FY2026, change %), cap rate, occupancy, NOI and operating cost change, plus fund returns against target. Optional business_unit filter: Commercial | Retail | Industrial & Logistics | Hospitality.',
    parameters: { type: 'OBJECT', properties: { business_unit: { type: 'STRING' } } },
    run(input) {
      if (!role().assets) deny('asset-level data');
      const filter = String(input.business_unit ?? '').toLowerCase().slice(0, 5);
      const rows = visibleAssets().filter((a) => !filter || buName(a.bu).toLowerCase().includes(filter));
      return {
        source: 'curated.asset_valuation + curated.asset_operations',
        row_level_security: fullScope() ? 'all assets' : scopeLabel(),
        unit: 'SGD M',
        assets: rows.map((a) => ({
          asset: a.name, business_unit: buName(a.bu), country: a.country,
          valuation_fy2025: a.v25, valuation_fy2026: a.v26, valuation_change_pct: pct(a.v26, a.v25), cap_rate_pct: a.cap,
          occupancy_fy2025: a.occ25, occupancy_fy2026: a.occ26, occupancy_change_pts: r1(a.occ26 - a.occ25),
          noi_fy2025: a.noi25, noi_fy2026: a.noi26, opex_change_pct: pct(a.opex26, a.opex25),
        })),
        funds: FUNDS.filter((f) => role().bus.includes(f.bu)).map((f) => ({
          fund: f.name, fee_income: f.fee, return_pct: f.ret, target_return_pct: f.target, vs_target_pts: r1(f.ret - f.target),
        })),
      };
    },
  },
  {
    name: 'get_developments',
    agent: 'Development Agent',
    description:
      'Returns development projects with stage, percent complete, budget vs forecast cost, cost-to-complete vs plan, units sold, sales velocity vs plan, completion slippage in months and plan vs forecast margin.',
    run() {
      if (!role().dev) deny('development project data');
      return {
        source: 'curated.dev_projects',
        unit: 'SGD M',
        projects: PROJECTS.map((p) => ({
          project: p.name, country: p.country, stage: p.stage, pct_complete: p.pct, budget: p.budget,
          forecast_cost: p.incurred + p.ctcFcst, forecast_vs_budget_pct: pct(p.incurred + p.ctcFcst, p.budget),
          cost_to_complete_plan: p.ctcPlan, cost_to_complete_forecast: p.ctcFcst, cost_to_complete_vs_plan_pct: pct(p.ctcFcst, p.ctcPlan),
          units_sold: p.sold, units_total: p.units, sales_per_month_plan: p.velPlan, sales_per_month_actual: p.velAct,
          completion_plan: p.donePlan, completion_forecast: p.doneFcst, slip_months: p.slip,
          margin_plan_pct: p.mPlan, margin_forecast_pct: p.mFcst,
        })),
      };
    },
  },
  {
    name: 'get_treasury_position',
    agent: 'Treasury Agent',
    description:
      'Returns the Group treasury position: cash and undrawn facilities, liquidity cover of next-12-month maturities, debt maturity profile by year with share of total, fixed / hedged / unhedged split, average cost of debt, net gearing and interest cover with covenant limits.',
    run() {
      if (!role().treasury) deny('Treasury data');
      const t = treasury();
      return {
        source: 'curated.tsy_debt + curated.tsy_liquidity',
        unit: 'SGD M',
        cash: TSY.cash, undrawn_committed_facilities: TSY.undrawn, total_liquidity: t.liquidity,
        debt_maturing_next_12_months: t.next12, liquidity_cover_times: t.cover,
        total_debt: t.total, net_debt: t.net, maturity_profile: t.byFy,
        fixed_rate: t.fixed, floating_hedged: t.hedged, floating_unhedged: t.unhedged, fixed_or_hedged_pct: t.fixedHedgedPct,
        average_cost_of_debt_pct: t.avgCost, annual_interest: t.interest,
        net_gearing_pct: t.gearing, net_gearing_covenant_max_pct: 80,
        interest_cover_times: t.icr, interest_cover_covenant_min_times: 2.0,
      };
    },
  },
  {
    name: 'run_rate_scenario',
    agent: 'Treasury Agent',
    description:
      'Approved calculation tool. Applies a parallel interest-rate shift (basis points) to unhedged floating-rate debt and returns the change in annual interest cost and the resulting interest cover.',
    parameters: { type: 'OBJECT', properties: { shift_bps: { type: 'NUMBER' } }, required: ['shift_bps'] },
    run(input) {
      if (!role().treasury) deny('Treasury scenarios');
      return rateScenario(Number(input.shift_bps) || 0);
    },
  },
  {
    name: 'get_business_unit_history',
    agent: 'Finance Analysis Agent',
    description:
      'Returns FY2022-FY2026 revenue, operating profit and plan operating profit for each business unit the user may see, with five-year growth (CAGR) and the best and worst year against plan. Use for trend, history and multi-year questions. Optional business_unit filter.',
    parameters: { type: 'OBJECT', properties: { business_unit: { type: 'STRING' } } },
    run(input) {
      const filter = String(input.business_unit ?? '').toLowerCase().slice(0, 5);
      const units = BU.filter((b) => role().bus.includes(b.id) && (!filter || b.name.toLowerCase().includes(filter)));
      const cagr = (first: number, last: number) => (first > 0 && last > 0 ? r1((Math.pow(last / first, 1 / 4) - 1) * 100) : null);
      return {
        source: 'curated.fin_performance (five-year history)',
        row_level_security: scopeLabel(),
        unit: 'SGD M',
        business_units: units.map((b) => {
          const rows = BU_HISTORY.filter((h) => h.id === b.id);
          const vsPlan = rows.map((h) => ({ fy: `FY${h.fiscal_year}`, vs_plan: h.operating_profit_sgd_m - h.plan_operating_profit_sgd_m }));
          const sorted = [...vsPlan].sort((x, y) => x.vs_plan - y.vs_plan);
          return {
            business_unit: b.name,
            years: rows.map((h) => ({
              fy: `FY${h.fiscal_year}`, revenue: h.revenue_sgd_m, operating_profit: h.operating_profit_sgd_m,
              plan_operating_profit: h.plan_operating_profit_sgd_m, vs_plan: h.operating_profit_sgd_m - h.plan_operating_profit_sgd_m,
            })),
            revenue_cagr_pct_fy2022_fy2026: cagr(rows[0].revenue_sgd_m, rows[4].revenue_sgd_m),
            operating_profit_cagr_pct_fy2022_fy2026: cagr(rows[0].operating_profit_sgd_m, rows[4].operating_profit_sgd_m),
            worst_year_vs_plan: sorted[0],
            best_year_vs_plan: sorted[sorted.length - 1],
          };
        }),
      };
    },
  },
  {
    name: 'get_quarterly_performance',
    agent: 'Finance Analysis Agent',
    description:
      'Returns FY2026 revenue, operating profit and plan operating profit by quarter for each business unit the user may see, with each quarter against plan and the weakest quarter. Use for quarter, Q1-Q4, run-rate and in-year questions.',
    parameters: { type: 'OBJECT', properties: { business_unit: { type: 'STRING' } } },
    run(input) {
      const filter = String(input.business_unit ?? '').toLowerCase().slice(0, 5);
      const units = BU.filter((b) => role().bus.includes(b.id) && (!filter || b.name.toLowerCase().includes(filter)));
      const quarters = ['Q1 FY2026', 'Q2 FY2026', 'Q3 FY2026', 'Q4 FY2026'];
      return {
        source: 'curated.fin_performance_quarterly',
        row_level_security: scopeLabel(),
        unit: 'SGD M',
        business_units: units.map((b) => {
          const rows = QUARTERLY.filter((q) => q.id === b.id).map((q) => ({ quarter: q.quarter, revenue: q.revenue, operating_profit: q.op, plan_operating_profit: q.planOp, vs_plan: q.op - q.planOp }));
          const weakest = [...rows].sort((x, y) => x.vs_plan - y.vs_plan)[0];
          return { business_unit: b.name, quarters: rows, weakest_quarter_vs_plan: weakest };
        }),
        totals_by_quarter: quarters.map((quarter) => {
          const rows = QUARTERLY.filter((q) => q.quarter === quarter && role().bus.includes(q.id));
          return { quarter, revenue: sum(rows, (q) => q.revenue), operating_profit: sum(rows, (q) => q.op), plan_operating_profit: sum(rows, (q) => q.planOp) };
        }),
      };
    },
  },
  {
    name: 'get_budget',
    agent: 'Finance Analysis Agent',
    description:
      'Returns the FY2027 budget by business unit (revenue and operating profit) against FY2026 actual, with growth and the key assumption behind each line. Use for budget, outlook, forecast, next-year and target questions.',
    parameters: { type: 'OBJECT', properties: { business_unit: { type: 'STRING' } } },
    run(input) {
      const filter = String(input.business_unit ?? '').toLowerCase().slice(0, 5);
      const units = BU.filter((b) => role().bus.includes(b.id) && (!filter || b.name.toLowerCase().includes(filter)));
      const rows = units.map((b) => {
        const budget = BUDGET_FY2027.find((x) => x.id === b.id)!;
        return {
          business_unit: b.name, revenue_fy2026: b.rev26, revenue_budget_fy2027: budget.revenue,
          operating_profit_fy2026: b.op26, operating_profit_budget_fy2027: budget.op, operating_profit_growth: budget.op - b.op26,
          key_assumption: budget.assumption,
        };
      });
      return {
        source: 'curated.fin_budget',
        row_level_security: scopeLabel(),
        unit: 'SGD M',
        total_revenue_budget_fy2027: sum(rows, (r) => r.revenue_budget_fy2027),
        total_operating_profit_budget_fy2027: sum(rows, (r) => r.operating_profit_budget_fy2027),
        total_operating_profit_fy2026: sum(rows, (r) => r.operating_profit_fy2026),
        business_units: rows.sort((a, b) => b.operating_profit_growth - a.operating_profit_growth),
      };
    },
  },
  {
    name: 'get_leases',
    agent: 'Asset & Fund Agent',
    description:
      'Returns major tenant leases for assets the user may see: tenant, sector, share of asset income, annual rent and expiry year, plus the lease expiry profile by year, weighted average lease expiry (WALE) and tenant concentration. Use for lease expiry, tenant risk and income concentration questions.',
    parameters: { type: 'OBJECT', properties: { business_unit: { type: 'STRING' } } },
    run(input) {
      if (!role().assets) deny('lease and tenant data');
      const filter = String(input.business_unit ?? '').toLowerCase().slice(0, 5);
      const assets = visibleAssets().filter((a) => !filter || buName(a.bu).toLowerCase().includes(filter));
      const leases = LEASES.flatMap((l) => {
        const asset = assets.find((a) => a.id === l.assetId);
        if (!asset) return [];
        return [{
          tenant: l.tenant, sector: l.sector, asset: asset.name, business_unit: buName(asset.bu),
          share_of_asset_income_pct: l.share, annual_rent: r1(((asset.noi26 + asset.opex26) * l.share) / 100), expiry_fy: l.expiry,
        }];
      });
      const totalRent = sum(leases, (l) => l.annual_rent);
      const expiryYears = [...new Set(leases.map((l) => l.expiry_fy))].sort();
      const bySector = [...new Set(leases.map((l) => l.sector))].map((sector) => ({
        sector, annual_rent: r1(sum(leases.filter((l) => l.sector === sector), (l) => l.annual_rent)),
      })).sort((a, b) => b.annual_rent - a.annual_rent);
      return {
        source: 'curated.lease_schedule',
        row_level_security: fullScope() ? 'all assets' : scopeLabel(),
        unit: 'SGD M',
        major_lease_rent_total: r1(totalRent),
        wale_years_from_fy2026: totalRent ? r1(sum(leases, (l) => l.annual_rent * (l.expiry_fy - 2026)) / totalRent) : 0,
        expiry_profile: expiryYears.map((fy) => {
          const rows = leases.filter((l) => l.expiry_fy === fy);
          return { fy: `FY${fy}`, annual_rent: r1(sum(rows, (l) => l.annual_rent)), share_of_major_lease_rent_pct: r1((sum(rows, (l) => l.annual_rent) / totalRent) * 100), tenants: rows.map((l) => l.tenant) };
        }),
        rent_by_sector: bySector,
        tenants_above_20pct_of_asset_income: leases.filter((l) => l.share_of_asset_income_pct > 20).map((l) => `${l.tenant} (${l.asset}, ${l.share_of_asset_income_pct}%)`),
        leases: [...leases].sort((a, b) => a.expiry_fy - b.expiry_fy || b.annual_rent - a.annual_rent),
      };
    },
  },
  {
    name: 'get_cash_flow',
    agent: 'Finance Analysis Agent',
    description:
      'Returns Group cash flow for FY2022-FY2026: operating cash flow, development and asset-enhancement capex, acquisitions, divestments, dividends, free cash flow and dividend cover. Use for cash generation, capex, dividend and capital recycling questions.',
    run() {
      if (!fullScope()) deny('Group cash flow');
      const c = CASH_FLOW;
      const years = FY.map((year, i) => {
        const fcf = c.operating[i] - c.enhancementCapex[i];
        return {
          fy: `FY${year}`, operating_cash_flow: c.operating[i], development_capex: c.developmentCapex[i],
          asset_enhancement_capex: c.enhancementCapex[i], acquisitions: c.acquisitions[i], divestments: c.divestments[i],
          dividends: c.dividends[i], free_cash_flow: fcf, dividend_cover_times: Math.round((fcf / c.dividends[i]) * 100) / 100,
          net_capital_recycling: c.divestments[i] - c.acquisitions[i],
        };
      });
      return {
        source: 'curated.fin_cash_flow',
        unit: 'SGD M',
        definitions: 'free cash flow = operating cash flow - asset-enhancement capex; dividend cover = free cash flow / dividends',
        years,
        five_year_totals: {
          operating_cash_flow: sum(c.operating, (x) => x), development_capex: sum(c.developmentCapex, (x) => x),
          acquisitions: sum(c.acquisitions, (x) => x), divestments: sum(c.divestments, (x) => x), dividends: sum(c.dividends, (x) => x),
        },
      };
    },
  },
  {
    name: 'get_esg',
    agent: 'Asset & Fund Agent',
    description:
      'Returns sustainability data for assets the user may see: green certification, energy intensity (kWh per square metre) and carbon emissions (tCO2e) for FY2025 and FY2026, plus the share of portfolio value that is green-certified. Use for ESG, carbon, energy and certification questions.',
    parameters: { type: 'OBJECT', properties: { business_unit: { type: 'STRING' } } },
    run(input) {
      if (!role().assets) deny('asset ESG data');
      const filter = String(input.business_unit ?? '').toLowerCase().slice(0, 5);
      const assets = visibleAssets().filter((a) => !filter || buName(a.bu).toLowerCase().includes(filter));
      const rows = assets.flatMap((a) => {
        const e = ESG.find((x) => x.assetId === a.id);
        if (!e) return [];
        return [{
          asset: a.name, business_unit: buName(a.bu), valuation_fy2026: a.v26, certification: e.cert,
          energy_intensity_fy2025: e.energy25, energy_intensity_fy2026: e.energy26, energy_change_pct: pct(e.energy26, e.energy25),
          carbon_tco2e_fy2025: e.carbon25, carbon_tco2e_fy2026: e.carbon26, carbon_change_pct: pct(e.carbon26, e.carbon25),
        }];
      });
      const value = sum(rows, (r) => r.valuation_fy2026);
      const certified = sum(rows.filter((r) => r.certification !== 'None'), (r) => r.valuation_fy2026);
      return {
        source: 'curated.esg_assets',
        row_level_security: fullScope() ? 'all assets' : scopeLabel(),
        green_certified_share_of_value_pct: value ? r1((certified / value) * 100) : 0,
        target_green_certified_share_fy2030_pct: 80,
        total_carbon_tco2e_fy2025: sum(rows, (r) => r.carbon_tco2e_fy2025),
        total_carbon_tco2e_fy2026: sum(rows, (r) => r.carbon_tco2e_fy2026),
        uncertified_assets: rows.filter((r) => r.certification === 'None').map((r) => r.asset),
        assets: rows.sort((a, b) => b.energy_change_pct - a.energy_change_pct),
      };
    },
  },
  {
    name: 'search_documents',
    agent: 'Document Intelligence Agent',
    description:
      'Searches approved documents the user may see (valuation reports, leasing, board, sales and programme reports, treasury policy, materiality guideline) and returns the most relevant passages with document id, title and date. Use it to explain why a number moved and to quote policy thresholds.',
    parameters: { type: 'OBJECT', properties: { query: { type: 'STRING' } }, required: ['query'] },
    run(input) {
      const allowed = DOCS.filter((d) =>
        d.scope === 'GRP' ? true : d.scope === 'TSY' ? role().treasury : role().bus.includes(d.scope) && (d.scope !== 'RES' || role().dev),
      );
      const allowedIds = new Set(allowed.map((doc) => doc.id));
      const hits = searchLocalDocuments(String(input.query ?? ''), 5).filter((hit) => allowedIds.has(hit.document_id));
      return {
        source: 'local in-memory TF-IDF vector index (permission-aware; no embeddings or database)',
        retrieval: { method: 'sparse TF-IDF vectors with finance synonym expansion', candidates: DOCS.length, returned: hits.length },
        passages: hits,
        ...(hits.length ? {} : { note: 'no permitted document matched' }),
      };
    },
  },
];

export function rateScenario(shiftBps: number) {
  const t = treasury();
  const extra = r1((t.unhedged * shiftBps) / 10000);
  return {
    source: 'approved calculation: rate sensitivity on curated.tsy_debt',
    unit: 'SGD M',
    shift_bps: shiftBps,
    unhedged_floating_debt: t.unhedged,
    additional_annual_interest: extra,
    annual_interest_before: t.interest,
    annual_interest_after: r1(t.interest + extra),
    interest_cover_before_times: t.icr,
    interest_cover_after_times: Math.round((GROUP.op[4] / (t.interest + extra)) * 100) / 100,
    covenant_min_times: 2.0,
  };
}

// ---------------- Atlas Recommends ----------------
// Threshold rules scanned over the data. In the target these are BigQuery ML signals.
export interface Signal extends Recommendation {
  question: string;
  scope: string; // BU id or 'TSY'
}

function signal(
  id: string, hub: HubName, scope: string, high: boolean, title: string, detected: string,
  whyItMatters: string, evidence: string[], question: string, accountableRole: string,
): Signal {
  return {
    id, title, detected, whyItMatters, evidence, question, scope, accountableRole,
    suggestedAnalysis: question,
    severity: high ? 'Attention required' : 'Review required',
    originatingHub: hub,
    askAtlasResponseId: `q:${question}`,
  };
}

export function signals(): Signal[] {
  const out: Signal[] = [];
  const who = role();
  const t = treasury();

  ASSETS.filter((a) => a.occ26 - a.occ25 <= -3).forEach((a) =>
    out.push(signal(`occ-${a.id}`, 'Manager Hub', a.bu, true, `Occupancy decline at ${a.name}`,
      `Committed occupancy fell from ${a.occ25}% to ${a.occ26}% and NOI is down SGD ${a.noi25 - a.noi26}M.`,
      'Rental income, fund returns and the next valuation may be affected.',
      ['curated.asset_operations: occupancy and NOI by asset', 'DOC-LEASE-RET: Retail leasing review, Q4 FY2026'],
      `What happened to occupancy at ${a.name} and what do the leasing and valuation reports say?`, 'Asset Management')));

  ASSETS.filter((a) => pct(a.opex26, a.opex25) >= 10).forEach((a) =>
    out.push(signal(`opex-${a.id}`, 'Manager Hub', a.bu, false, `Operating costs up ${pct(a.opex26, a.opex25)}% at ${a.name}`,
      `Operating cost rose from SGD ${a.opex25}M to SGD ${a.opex26}M while NOI was flat or lower.`,
      'NOI margin narrows if cost growth continues to outpace revenue.',
      ['curated.asset_operations: operating cost by asset', 'DOC-HOS-OPS: Hospitality operations review, FY2026'],
      `Why did operating costs rise at ${a.name} and what is planned?`, 'Asset Management')));

  FUNDS.filter((f) => f.ret - f.target <= -0.5).forEach((f) =>
    out.push(signal(`fund-${f.bu}`, 'Manager Hub', f.bu, false, `${f.name} is below its target return`,
      `Return is ${f.ret}% against a target of ${f.target}%.`,
      'Performance fees and investor reporting depend on returns against target.',
      ['curated.fund_performance: return against target'],
      `Why is ${f.name} below its target return, and which assets explain it?`, 'Fund Management')));

  ASSETS.filter((a) => pct(a.v26, a.v25) <= -2).forEach((a) =>
    out.push(signal(`val-${a.id}`, 'Investor Hub', a.bu, false, `Valuation down ${Math.abs(pct(a.v26, a.v25))}% at ${a.name}`,
      `Valuation moved from SGD ${a.v25}M to SGD ${a.v26}M.`,
      'Valuation movements feed NAV, gearing and investor reporting.',
      ['curated.asset_valuation: valuation by asset', 'Valuation report for the asset'],
      `Why did the valuation of ${a.name} fall, and what does the valuation report say?`, 'Investor Finance')));

  if (who.dev) {
    PROJECTS.filter((p) => pct(p.ctcFcst, p.ctcPlan) >= 10).forEach((p) =>
      out.push(signal(`ctc-${p.id}`, 'Developer Hub', 'RES', true, `${p.name}: cost-to-complete ${pct(p.ctcFcst, p.ctcPlan)}% above plan`,
        `Forecast cost-to-complete is SGD ${p.ctcFcst}M against a plan of SGD ${p.ctcPlan}M. Margin forecast is ${p.mFcst}% against ${p.mPlan}%.`,
        'Forecast margin and Group operating profit fall if the overrun is not recovered.',
        ['curated.dev_projects: cost-to-complete and margin', 'DOC-BOARD-PB: Skyline Quarter cost review'],
        `What is driving the cost-to-complete overrun at ${p.name} and what options has management proposed?`, 'Development Finance')));

    PROJECTS.filter((p) => p.velPlan > 0 && p.velAct / p.velPlan < 0.8).forEach((p) =>
      out.push(signal(`vel-${p.id}`, 'Developer Hub', 'RES', true, `${p.name}: sales velocity below plan`,
        `${p.velAct} units a month against a plan of ${p.velPlan}. ${p.units - p.sold} units remain unsold.`,
        'Slower sales delay cash inflows and raise the risk of ageing inventory.',
        ['curated.dev_projects: sales by month', 'DOC-SALES-PC: Lakeside Gardens sales report'],
        `Why is sales velocity below plan at ${p.name} and what are the options?`, 'Development Finance')));

    PROJECTS.filter((p) => p.slip > 0).forEach((p) =>
      out.push(signal(`slip-${p.id}`, 'Developer Hub', 'RES', false, `${p.name}: completion delayed ${p.slip} months`,
        `Completion forecast moved from ${p.donePlan} to ${p.doneFcst}.`,
        'Delays move revenue recognition and can add prolongation cost.',
        ['curated.dev_projects: programme milestones', 'DOC-PROG-PD: Parkview Central programme report'],
        `What caused the delay at ${p.name} and is there a cost impact?`, 'Development Finance')));
  }

  if (who.treasury) {
    t.byFy.filter((y) => y.share_pct > 25).forEach((y) =>
      out.push(signal(`mat-${y.fy}`, 'Treasury & Capital Hub', 'TSY', true, `Refinancing concentration in ${y.fy}`,
        `${y.share_pct}% of debt (SGD ${y.amount.toLocaleString('en-SG')}M) matures in ${y.fy}. Policy limit is 25% in any one year.`,
        'Liquidity headroom and cost of funding may be affected if markets tighten.',
        ['curated.tsy_debt: maturity profile', 'DOC-TSY-POL: Group Treasury Policy'],
        'How does the upcoming debt maturity profile affect liquidity headroom and refinancing exposure, and are we within Treasury policy?', 'Group Treasury')));

    if (t.fixedHedgedPct < 75) {
      out.push(signal('hedge', 'Treasury & Capital Hub', 'TSY', false, 'Hedge ratio close to the policy floor',
        `${t.fixedHedgedPct}% of debt is fixed or hedged. Policy floor is 70%.`,
        'A rate rise would flow through to interest cost on the unhedged portion.',
        ['curated.tsy_debt: fixed, hedged and unhedged split', 'DOC-TSY-POL: Group Treasury Policy'],
        'What is the impact of a 100bp rate rise on interest cost and interest cover, and how close are we to the hedging policy floor?', 'Group Treasury'));
    }
  }

  return out
    .filter((s) => s.scope === 'TSY' || who.bus.includes(s.scope))
    .sort((a, b) => (a.severity === 'Attention required' ? 0 : 1) - (b.severity === 'Attention required' ? 0 : 1));
}
