// Shared synthetic dataset. Every hub, recommendation and agent tool reads from here,
// so numbers reconcile across the demo. In the target architecture this is BigQuery.
import type { HubName } from '../types';

export const FY = [2022, 2023, 2024, 2025, 2026];

// Matches the Executive Hub fixtures (KPI cards and performance charts).
export const GROUP = {
  revenue: [3900, 4250, 4620, 4906, 5200],
  op: [760, 825, 920, 1019, 1100],
  nav: [10400, 11000, 11600, 12190, 12800],
  roce: [6.2, 6.6, 7.0, 7.3, 7.9],
  valuationHistory: [10650, 11100, 11600, 11900],
};

export interface BusinessUnitRow {
  id: string;
  name: string;
  rev25: number;
  rev26: number;
  op25: number;
  op26: number;
  plan26: number;
}

export const BU: BusinessUnitRow[] = [
  { id: 'COM', name: 'Commercial', rev25: 1963, rev26: 2100, op25: 440, op26: 520, plan26: 500 },
  { id: 'RET', name: 'Retail', rev25: 1190, rev26: 1250, op25: 300, op26: 310, plan26: 315 },
  { id: 'IND', name: 'Industrial & Logistics', rev25: 925, rev26: 980, op25: 140, op26: 180, plan26: 170 },
  { id: 'HOS', name: 'Hospitality', rev25: 519, rev26: 540, op25: 105, op26: 110, plan26: 115 },
  { id: 'RES', name: 'Residential development', rev25: 303, rev26: 330, op25: 150, op26: 70, plan26: 110 },
  { id: 'CORP', name: 'Corporate & others', rev25: 6, rev26: 0, op25: -116, op26: -90, plan26: -95 },
];

export const ALL_BU = BU.map((b) => b.id);
export const buName = (id: string) => BU.find((b) => b.id === id)?.name ?? id;

export interface Asset {
  id: string;
  name: string;
  bu: string;
  country: string;
  v25: number;
  v26: number;
  occ25: number;
  occ26: number;
  noi25: number;
  noi26: number;
  opex25: number;
  opex26: number;
  cap: number;
  added?: boolean;
}

const assetRows: [string, string, string, string, number, number, number, number, number, number, number, number, number][] = [
  ['A01', 'Marina Quay Tower', 'COM', 'Singapore', 2150, 2260, 94, 96, 96, 104, 31, 30, 3.8],
  ['A02', 'Orchard Gate Offices', 'COM', 'Singapore', 1480, 1545, 92, 95, 64, 70, 22, 22, 3.9],
  ['A03', 'Southbank Exchange', 'COM', 'Australia', 980, 1000, 90, 91, 47, 49, 17, 17, 5.2],
  ['A04', 'Thames Court', 'COM', 'United Kingdom', 760, 735, 88, 87, 36, 35, 14, 15, 5.6],
  ['A05', 'Northgate Mall', 'RET', 'Singapore', 1320, 1290, 97, 92, 66, 61, 24, 25, 4.7],
  ['A06', 'Eastfield Plaza', 'RET', 'Singapore', 890, 880, 96, 91, 44, 41, 16, 17, 4.8],
  ['A07', 'Chao Phraya Galleria', 'RET', 'Thailand', 610, 660, 93, 95, 30, 33, 12, 12, 5.6],
  ['A08', 'Jurong Logistics Hub', 'IND', 'Singapore', 720, 790, 98, 99, 39, 44, 8, 8, 5.4],
  ['A09', 'Western Sydney Distribution Park', 'IND', 'Australia', 940, 1040, 99, 100, 50, 57, 9, 9, 5.1],
  ['A10', 'Rhine Logistics Centre', 'IND', 'Germany', 560, 600, 97, 98, 29, 32, 6, 6, 5.0],
  ['A11', 'Sentosa Bay Resort', 'HOS', 'Singapore', 680, 690, 78, 80, 34, 33, 41, 46, 4.9],
  ['A12', 'Kyoto Garden Hotel', 'HOS', 'Japan', 420, 425, 74, 77, 19, 18, 26, 30, 4.4],
  ['A13', 'Collins Street Suites', 'HOS', 'Australia', 390, 400, 81, 82, 20, 21, 22, 23, 5.3],
];

const buildAssets = (): Asset[] =>
  assetRows.map((a) => ({
    id: a[0], name: a[1], bu: a[2], country: a[3], v25: a[4], v26: a[5], occ25: a[6], occ26: a[7],
    noi25: a[8], noi26: a[9], opex25: a[10], opex26: a[11], cap: a[12],
  }));

export let ASSETS: Asset[] = buildAssets();

export const FUNDS = [
  { name: 'Commercial Trust', bu: 'COM', fee: 38, ret: 6.4, target: 6.0 },
  { name: 'Retail Trust', bu: 'RET', fee: 21, ret: 4.9, target: 5.8 },
  { name: 'Logistics & Industrial Trust', bu: 'IND', fee: 19, ret: 8.1, target: 7.0 },
  { name: 'Hospitality Trust', bu: 'HOS', fee: 11, ret: 4.2, target: 5.5 },
];

export const PROJECTS = [
  { id: 'P-A', name: 'Verdant Residences', country: 'Singapore', stage: 'Planning', pct: 20, budget: 620, incurred: 95, ctcPlan: 525, ctcFcst: 533, units: 480, sold: 0, velPlan: 0, velAct: 0, donePlan: 'Q2 FY2029', doneFcst: 'Q2 FY2029', slip: 0, mPlan: 14.0, mFcst: 13.8 },
  { id: 'P-B', name: 'Skyline Quarter', country: 'Singapore', stage: 'Construction', pct: 55, budget: 940, incurred: 440, ctcPlan: 500, ctcFcst: 560, units: 520, sold: 320, velPlan: 22, velAct: 21, donePlan: 'Q4 FY2027', doneFcst: 'Q4 FY2027', slip: 0, mPlan: 16.0, mFcst: 11.5 },
  { id: 'P-C', name: 'Lakeside Gardens', country: 'Australia', stage: 'Sales', pct: 75, budget: 480, incurred: 365, ctcPlan: 115, ctcFcst: 121, units: 1100, sold: 640, velPlan: 40, velAct: 26, donePlan: 'Q1 FY2027', doneFcst: 'Q1 FY2027', slip: 0, mPlan: 15.0, mFcst: 13.2 },
  { id: 'P-D', name: 'Parkview Central', country: 'Thailand', stage: 'Construction', pct: 40, budget: 560, incurred: 228, ctcPlan: 332, ctcFcst: 347, units: 600, sold: 210, velPlan: 18, velAct: 17, donePlan: 'Q1 FY2028', doneFcst: 'Q2 FY2028', slip: 3, mPlan: 17.0, mFcst: 15.6 },
  { id: 'P-E', name: 'Harbour Edge', country: 'United Kingdom', stage: 'Planning', pct: 10, budget: 390, incurred: 38, ctcPlan: 352, ctcFcst: 352, units: 350, sold: 0, velPlan: 0, velAct: 0, donePlan: 'Q1 FY2030', doneFcst: 'Q1 FY2030', slip: 0, mPlan: 13.0, mFcst: 13.0 },
];

const debtRows: [string, string, string, number, number, 'fixed' | 'floating', number, boolean][] = [
  ['D01', 'Bank loan', 'SGD', 700, 2027, 'floating', 4.6, false],
  ['D02', 'Medium-term note', 'SGD', 800, 2027, 'fixed', 3.4, false],
  ['D03', 'Bank loan', 'AUD', 900, 2027, 'floating', 5.1, true],
  ['D04', 'Bank loan', 'SGD', 1100, 2028, 'floating', 4.5, false],
  ['D05', 'Bond', 'SGD', 1000, 2028, 'fixed', 3.9, false],
  ['D06', 'Bank loan', 'EUR', 600, 2028, 'floating', 4.2, true],
  ['D07', 'Bond', 'USD', 900, 2029, 'fixed', 4.4, false],
  ['D08', 'Bank loan', 'GBP', 500, 2029, 'floating', 5.4, false],
  ['D09', 'Green bond', 'SGD', 1200, 2030, 'fixed', 3.6, false],
  ['D10', 'Bank loan', 'JPY', 400, 2030, 'floating', 1.8, false],
  ['D11', 'Bond', 'SGD', 1700, 2031, 'fixed', 4.1, false],
];

export const DEBT = debtRows.map((d) => ({
  id: d[0], type: d[1], ccy: d[2], amt: d[3], fy: d[4], basis: d[5], rate: d[6], hedged: d[7],
}));

export const TSY = { cash: 2900, undrawn: 3400 };
export const FX: [string, number, number][] = [
  ['SGD', 58, 100], ['AUD', 17, 72], ['THB', 8, 40], ['GBP', 7, 65], ['EUR', 6, 80], ['JPY', 4, 55],
];

export interface AtlasDoc {
  id: string;
  scope: string; // BU id, 'TSY' or 'GRP'
  title: string;
  date: string;
  text: string;
}

const baseDocs: AtlasDoc[] = [
  { id: 'DOC-VAL-A05', scope: 'RET', title: 'Valuation report: Northgate Mall', date: '30 Sep 2026', text: 'Market value SGD 1,290M (prior SGD 1,320M). Capitalisation rate expanded 10bp to 4.7%. Committed occupancy fell to 92% after the anchor department-store tenant (about 5% of net lettable area) exited in March 2026. Re-letting assumes 9 months of void and incentives of 3 months rent.' },
  { id: 'DOC-LEASE-RET', scope: 'RET', title: 'Retail leasing review, Q4 FY2026', date: '12 Oct 2026', text: 'Tenant churn rose to 14% (FY2025: 9%) at Northgate Mall and Eastfield Plaza. Eastfield Plaza lost two mini-anchor fashion tenants; replacement food and beverage tenants are at heads-of-terms stage and would restore occupancy to about 95% by Q2 FY2027. Chao Phraya Galleria is unaffected, with positive rental reversion of 4%.' },
  { id: 'DOC-VAL-A04', scope: 'COM', title: 'Valuation report: Thames Court, London', date: '30 Sep 2026', text: 'Market value SGD 735M equivalent (prior SGD 760M). Yields for secondary London offices expanded 25bp. Occupancy is 87%. The valuer flags a lease expiry covering 18% of income in FY2028.' },
  { id: 'DOC-BOARD-PB', scope: 'RES', title: 'Board paper: Skyline Quarter cost review', date: '18 Aug 2026', text: 'Forecast cost-to-complete is SGD 560M against a plan of SGD 500M (+12%). Drivers: piling redesign after ground conditions (SGD 28M), structural steel price escalation (SGD 22M) and extended preliminaries (SGD 10M). Forecast development margin falls from 16.0% to 11.5%. Management proposes facade value engineering (saving SGD 12M), subject to approval.' },
  { id: 'DOC-SALES-PC', scope: 'RES', title: 'Sales report: Lakeside Gardens', date: '30 Sep 2026', text: 'Sales velocity averaged 26 units a month against a plan of 40. Buyer financing approvals slowed after lender tightening. Two-bedroom stock is ageing: 210 units unsold for more than 9 months. Options: a targeted pricing review of two-bedroom units, or a deferred-payment scheme.' },
  { id: 'DOC-PROG-PD', scope: 'RES', title: 'Programme report: Parkview Central', date: '05 Sep 2026', text: 'Completion forecast moves from Q1 FY2028 to Q2 FY2028 (three months) because of a delayed authority permit for the basement works. Prolongation cost of SGD 15M is already in the forecast.' },
  { id: 'DOC-HOS-OPS', scope: 'HOS', title: 'Hospitality operations review, FY2026', date: '08 Oct 2026', text: 'Operating costs rose 12% at Sentosa Bay Resort and 15% at Kyoto Garden Hotel, driven by energy contracts repriced in January 2026 and agency labour during refurbishment. RevPAR grew 4%, so NOI margin narrowed. A new energy contract tender is planned for Q2 FY2027.' },
  { id: 'DOC-TSY-POL', scope: 'TSY', title: 'Group Treasury Policy', date: 'Approved FY2025', text: 'No more than 25% of total debt should mature in any single financial year. At least 70% of debt should be fixed-rate or hedged. Refinancing of maturing facilities should be launched at least 12 months before maturity. Liquidity (cash plus undrawn committed facilities) should cover at least 1.5 times the debt maturing in the next 12 months. Covenants: net gearing not above 80%; interest cover not below 2.0 times.' },
  { id: 'DOC-FIN-MAT', scope: 'GRP', title: 'Finance materiality guideline', date: 'Approved FY2025', text: 'A variance is material when it exceeds 5% of plan or SGD 20M at business-unit level. Material variances require commentary with source evidence. AI-generated analysis that feeds external reporting or valuation requires explicit human approval.' },
];

export let DOCS: AtlasDoc[] = [...baseDocs];

// Governed metric definitions (the semantic layer). In the target this is Looker.
export const METRICS: [string, string, string, string, string, string][] = [
  ['revenue', 'Revenue', 'Recognised revenue by business unit and year', 'SUM(revenue)', 'Group Finance', 'curated.fin_performance'],
  ['operating_profit', 'Operating profit', 'Profit before interest and tax, after corporate costs', 'SUM(revenue) - SUM(operating_costs)', 'Group Finance', 'curated.fin_performance'],
  ['nav', 'Net asset value', 'Total assets less total liabilities', 'total_assets - total_liabilities', 'Group Finance', 'curated.fin_balance_sheet'],
  ['roce', 'Return on capital employed', 'Operating profit over average capital employed', 'operating_profit / AVG(capital_employed)', 'Group Finance', 'curated.fin_balance_sheet'],
  ['portfolio_valuation', 'Portfolio valuation', 'Latest independent valuation of investment properties', 'SUM(asset.valuation)', 'Investor Finance', 'curated.asset_valuation'],
  ['occupancy', 'Committed occupancy', 'Committed lettable area over total lettable area', 'committed_nla / total_nla', 'Asset Management', 'curated.asset_operations'],
  ['noi', 'Net operating income', 'Property revenue less property operating costs', 'property_revenue - property_opex', 'Asset Management', 'curated.asset_operations'],
  ['cost_to_complete', 'Cost-to-complete', 'Forecast remaining cost to finish a development', 'forecast_cost - incurred_cost', 'Development Finance', 'curated.dev_projects'],
  ['net_gearing', 'Net gearing', 'Net debt over total equity', '(debt - cash) / equity', 'Group Treasury', 'curated.tsy_debt'],
  ['interest_cover', 'Interest cover', 'Operating profit over annual interest cost', 'operating_profit / interest', 'Group Treasury', 'curated.tsy_debt'],
];

export type RoleKey = 'cfo' | 'retail' | 'treasurer';

export interface AtlasRole {
  name: string;
  bus: string[];
  treasury: boolean;
  assets: boolean;
  dev: boolean;
  hubs: HubName[];
}

export const ROLES: Record<RoleKey, AtlasRole> = {
  cfo: { name: 'Group CFO', bus: ALL_BU, treasury: true, assets: true, dev: true, hubs: ['Executive Hub', 'Investor Hub', 'Developer Hub', 'Manager Hub', 'Treasury & Capital Hub'] },
  retail: { name: 'Head of Retail', bus: ['RET'], treasury: false, assets: true, dev: false, hubs: ['Investor Hub', 'Manager Hub'] },
  treasurer: { name: 'Group Treasurer', bus: ALL_BU, treasury: true, assets: false, dev: false, hubs: ['Executive Hub', 'Treasury & Capital Hub'] },
};

export const AGENTS: [string, string, string][] = [
  ['Supervisory Finance Agent', 'Plans the work, picks specialists, checks evidence, writes the answer', 'present_answer'],
  ['Finance Analysis Agent', 'Group and business-unit performance, variance drivers', 'get_metric, explain_variance'],
  ['Asset & Fund Agent / Valuation Agent', 'Asset valuation, occupancy, NOI, fund returns', 'get_assets'],
  ['Development Agent', 'Project cost, sales, programme and margin', 'get_developments'],
  ['Treasury Agent', 'Liquidity, maturities, exposure, covenants, rate scenarios', 'get_treasury_position, run_rate_scenario'],
  ['Document Intelligence Agent', 'Retrieves passages from approved documents the user may see', 'search_documents'],
];

// ---- session state shared with the tools (the React store mirrors it) ----
export interface AuditEntry {
  time: string;
  role: string;
  kind: string;
  detail: string;
}

export const session: { role: RoleKey; audit: AuditEntry[]; valuationLoaded: boolean } = {
  role: 'cfo',
  audit: [],
  valuationLoaded: false,
};

export const role = () => ROLES[session.role];

export function audit(kind: string, detail: string) {
  session.audit.unshift({
    time: new Date().toLocaleTimeString('en-SG'),
    role: role().name,
    kind,
    detail,
  });
}

// Called when Finance validates the sample valuation in the Investor Hub.
export function loadValuationRecord() {
  if (session.valuationLoaded) return;
  session.valuationLoaded = true;
  ASSETS.push({
    id: 'FP-VAL-001', name: 'Riverside Commercial Tower', bu: 'COM', country: 'Singapore',
    v25: 485, v26: 485, occ25: 92.4, occ26: 92.4, noi25: 21.1, noi26: 21.1, opex25: 6, opex26: 6, cap: 4.35, added: true,
  });
  DOCS.push({
    id: 'DOC-VAL-FP001', scope: 'COM', title: 'Valuation report: Riverside Commercial Tower', date: '30 Jun 2026',
    text: 'Adopted valuation SGD 485,000,000 as at 30 June 2026. Capitalisation rate 4.35%. Occupancy 92.4%. Net property income SGD 21,100,000, confirmed by Finance during validation.',
  });
  audit('Valuation record loaded', 'Riverside Commercial Tower (SGD 485M) added to curated.asset_valuation after Finance validation');
}

export function resetEngine() {
  ASSETS = buildAssets();
  DOCS = [...baseDocs];
  session.role = 'cfo';
  session.audit = [];
  session.valuationLoaded = false;
}

// ---- helpers ----
export const sum = <T,>(rows: T[], pick: (row: T) => number) => rows.reduce((total, row) => total + pick(row), 0);
export const r1 = (x: number) => Math.round(x * 10) / 10;
export const pct = (a: number, b: number) => r1(((a - b) / b) * 100);
export const fmt = (n: number) => n.toLocaleString('en-SG');
export const visibleAssets = () => (role().assets ? ASSETS.filter((a) => role().bus.includes(a.bu)) : []);
export const portfolioValue = () => sum(ASSETS, (a) => a.v26);

export function treasury() {
  const total = sum(DEBT, (d) => d.amt);
  const interest = r1(sum(DEBT, (d) => (d.amt * d.rate) / 100));
  const byFy = [2027, 2028, 2029, 2030, 2031].map((year) => {
    const rows = DEBT.filter((d) => d.fy === year);
    return {
      fy: `FY${year}${year === 2031 ? '+' : ''}`,
      amount: sum(rows, (d) => d.amt),
      share_pct: r1((sum(rows, (d) => d.amt) / total) * 100),
      bank_loans: sum(rows.filter((d) => d.type === 'Bank loan'), (d) => d.amt),
      bonds_notes: sum(rows.filter((d) => d.type !== 'Bank loan'), (d) => d.amt),
    };
  });
  const fixed = sum(DEBT.filter((d) => d.basis === 'fixed'), (d) => d.amt);
  const hedged = sum(DEBT.filter((d) => d.basis === 'floating' && d.hedged), (d) => d.amt);
  const unhedged = total - fixed - hedged;
  const net = total - TSY.cash;
  const next12 = byFy[0].amount;
  const liquidity = TSY.cash + TSY.undrawn;
  return {
    total, interest, byFy, fixed, hedged, unhedged, net, next12, liquidity,
    avgCost: Math.round((interest / total) * 10000) / 100,
    fixedHedgedPct: r1(((fixed + hedged) / total) * 100),
    gearing: r1((net / GROUP.nav[4]) * 100),
    icr: Math.round((GROUP.op[4] / interest) * 100) / 100,
    cover: Math.round((liquidity / next12) * 100) / 100,
  };
}
