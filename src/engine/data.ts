// Shared synthetic dataset. Every hub, recommendation and agent tool reads from here,
// so numbers reconcile across the demo. It is local in-memory demo data, not BigQuery.
import type { HubName } from '../types';

export const FY = [2022, 2023, 2024, 2025, 2026];

// Five-year business-unit series. Every year reconciles exactly to GROUP revenue
// and operating profit; all values are illustrative synthetic SGD millions.
const BU_SERIES = [
  { id: 'COM', name: 'Commercial', revenue: [1590, 1710, 1850, 1963, 2100], op: [330, 350, 390, 440, 520], planOp: [320, 355, 380, 430, 500], plan: [1560, 1680, 1820, 1940, 2050] },
  { id: 'RET', name: 'Retail', revenue: [910, 1000, 1095, 1190, 1250], op: [195, 220, 250, 300, 310], planOp: [190, 215, 245, 290, 315], plan: [900, 980, 1075, 1180, 1270] },
  { id: 'IND', name: 'Industrial & Logistics', revenue: [680, 740, 840, 925, 980], op: [80, 95, 115, 140, 180], planOp: [78, 90, 112, 135, 170], plan: [670, 725, 820, 920, 970] },
  { id: 'HOS', name: 'Hospitality', revenue: [400, 430, 470, 519, 540], op: [60, 70, 85, 105, 110], planOp: [62, 68, 82, 100, 115], plan: [410, 425, 460, 510, 555] },
  { id: 'RES', name: 'Residential development', revenue: [260, 280, 300, 303, 330], op: [110, 115, 120, 150, 70], planOp: [105, 112, 118, 140, 110], plan: [240, 270, 290, 310, 320] },
  { id: 'CORP', name: 'Corporate & others', revenue: [60, 90, 65, 6, 0], op: [-15, -25, -40, -116, -90], planOp: [-20, -25, -38, -100, -95], plan: [45, 120, 35, -50, -65] },
];
export const BU_HISTORY = FY.flatMap((year, index) => BU_SERIES.map((unit) => ({
  fiscal_year: year, id: unit.id, business_unit: unit.name,
  revenue_sgd_m: unit.revenue[index], operating_profit_sgd_m: unit.op[index], plan_revenue_sgd_m: unit.plan[index], plan_operating_profit_sgd_m: unit.planOp[index],
})));
export const businessUnitsForYear = (year: number) => BU_HISTORY.filter((row) => row.fiscal_year === year);

// FY2026 by quarter, SGD million. Each business unit's four quarters sum to its FY2026 total.
// Residential development's Q2 dip is the Skyline Quarter cost recognition (see DOC-Q2-DEV).
const QUARTER_SERIES: Record<string, { revenue: number[]; op: number[]; planOp: number[] }> = {
  COM: { revenue: [515, 520, 525, 540], op: [125, 128, 131, 136], planOp: [125, 125, 125, 125] },
  RET: { revenue: [305, 310, 312, 323], op: [79, 76, 77, 78], planOp: [78, 79, 79, 79] },
  IND: { revenue: [238, 242, 246, 254], op: [42, 44, 46, 48], planOp: [42, 42, 43, 43] },
  HOS: { revenue: [125, 140, 130, 145], op: [24, 30, 26, 30], planOp: [27, 30, 28, 30] },
  RES: { revenue: [70, 60, 95, 105], op: [30, -5, 20, 25], planOp: [28, 27, 27, 28] },
  CORP: { revenue: [0, 0, 0, 0], op: [-22, -23, -22, -23], planOp: [-24, -24, -24, -23] },
};
export const QUARTERLY = Object.entries(QUARTER_SERIES).flatMap(([id, q]) =>
  q.revenue.map((revenue, i) => ({ id, quarter: `Q${i + 1} FY2026`, revenue, op: q.op[i], planOp: q.planOp[i] })),
);

// FY2027 budget by business unit, SGD million, with the main assumption behind each line.
export const BUDGET_FY2027 = [
  { id: 'COM', revenue: 2200, op: 545, assumption: 'Occupancy held at 95% or above; Halcyon Tech downsizing re-let by Q3 FY2027' },
  { id: 'RET', revenue: 1280, op: 325, assumption: 'Northgate anchor space re-let from Q3 FY2027; Eastfield back to 95% occupancy by Q2' },
  { id: 'IND', revenue: 1060, op: 200, assumption: 'Positive rental reversion of 6% on renewals; SwiftLog 3PL renews in FY2028' },
  { id: 'HOS', revenue: 570, op: 120, assumption: 'New energy contract from Q2 lowers cost; RevPAR up 3%' },
  { id: 'RES', revenue: 420, op: 95, assumption: 'Skyline Quarter value engineering saves SGD 12M; Lakeside pricing review lifts sales to 32 a month' },
  { id: 'CORP', revenue: 0, op: -92, assumption: 'Corporate costs flat in real terms' },
];

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

// Cost-free local vector-style retrieval and a lightweight entity graph are
// implemented in semanticSearch.ts. No embeddings API, Postgres or pgvector.

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

// Major leases by asset: [asset id, tenant, sector, share of asset income %, expiry FY].
// Annual rent is derived from the asset's FY2026 revenue (NOI + opex), so it reconciles.
const leaseRows: [string, string, string, number, number][] = [
  ['A01', 'Meridian Bank', 'Financial services', 22, 2029],
  ['A01', 'Halcyon Tech', 'Technology', 14, 2027],
  ['A01', 'Orion Legal', 'Professional services', 9, 2031],
  ['A02', 'Pacific Insurance', 'Financial services', 18, 2028],
  ['A02', 'Novus Consulting', 'Professional services', 12, 2027],
  ['A03', 'State Government Agency', 'Government', 25, 2032],
  ['A03', 'Koala Energy', 'Energy', 10, 2028],
  ['A04', 'Albion Capital', 'Financial services', 18, 2028],
  ['A04', 'Fenwick Media', 'Media', 11, 2029],
  ['A05', 'FreshMart Supermarket', 'Grocery', 9, 2030],
  ['A05', 'CineMax', 'Entertainment', 6, 2027],
  ['A05', 'StyleHub Fashion', 'Fashion', 5, 2027],
  ['A06', 'FreshMart Supermarket', 'Grocery', 10, 2029],
  ['A06', 'Urban Threads', 'Fashion', 7, 2027],
  ['A07', 'Siam Department Store', 'Department store', 15, 2030],
  ['A08', 'SwiftLog 3PL', 'Logistics', 40, 2028],
  ['A08', 'ColdChain Asia', 'Logistics', 25, 2030],
  ['A09', 'OzRetail Distribution', 'Retail logistics', 45, 2033],
  ['A10', 'EuroParts', 'Automotive', 55, 2029],
];

export const LEASES = leaseRows.map(([assetId, tenant, sector, share, expiry]) => ({
  assetId, tenant, sector, share, expiry,
}));

// Group cash flow, SGD million. Operating cash flow matches the Executive Hub cash-flow series.
export const CASH_FLOW = {
  operating: [580, 690, 640, 790, 860],
  developmentCapex: [420, 460, 510, 540, 600],
  enhancementCapex: [90, 110, 120, 140, 150],
  acquisitions: [300, 0, 450, 250, 180],
  divestments: [200, 350, 150, 420, 300],
  dividends: [310, 330, 345, 360, 380],
};

// ESG by asset: [asset id, certification, energy kWh/m2 FY2025, FY2026, tCO2e FY2025, FY2026].
const esgRows: [string, string, number, number, number, number][] = [
  ['A01', 'Green Mark Platinum', 152, 144, 9800, 9200],
  ['A02', 'Green Mark GoldPlus', 168, 165, 6100, 6000],
  ['A03', 'NABERS 5.5 star', 140, 136, 5200, 5000],
  ['A04', 'BREEAM Very Good', 175, 171, 3900, 3800],
  ['A05', 'Green Mark Gold', 255, 262, 11800, 12300],
  ['A06', 'None', 270, 268, 7600, 7500],
  ['A07', 'None', 290, 284, 6900, 6700],
  ['A08', 'Green Mark Platinum', 60, 55, 2100, 1900],
  ['A09', 'NABERS 6 star', 48, 44, 1800, 1650],
  ['A10', 'DGNB Gold', 52, 50, 1500, 1450],
  ['A11', 'None', 310, 335, 9300, 10100],
  ['A12', 'None', 295, 318, 5200, 5600],
  ['A13', 'NABERS 4 star', 240, 236, 3600, 3550],
];

export const ESG = esgRows.map(([assetId, cert, energy25, energy26, carbon25, carbon26]) => ({
  assetId, cert, energy25, energy26, carbon25, carbon26,
}));

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
  { id: 'DOC-CREDIT-COM', scope: 'COM', title: 'Tenant credit watchlist: Commercial', date: '15 Oct 2026', text: 'Halcyon Tech (Marina Quay Tower, 14% of asset income, lease expires FY2027) has given notice that it intends to downsize by half at expiry after a funding round fell through. Credit rating moved to watch. Leasing has started early marketing of two floors. Novus Consulting at Orchard Gate Offices (expiry FY2027) is expected to renew.' },
  { id: 'DOC-CREDIT-RET', scope: 'RET', title: 'Tenant credit watchlist: Retail', date: '15 Oct 2026', text: 'StyleHub Fashion (Northgate Mall, lease expires FY2027) is 60 days in arrears on SGD 0.9M of rent; a payment plan is under negotiation and the security deposit covers three months. Urban Threads at Eastfield Plaza has asked for a rent-to-sales lease at renewal. FreshMart Supermarket remains a strong anchor at both malls.' },
  { id: 'DOC-ESG-FY26', scope: 'GRP', title: 'Sustainability report highlights, FY2026', date: '30 Sep 2026', text: 'Targets: 80% of portfolio value green-certified by FY2030, and energy intensity 30% below FY2022 by FY2030. Logistics and commercial assets improved, helped by rooftop solar at Jurong Logistics Hub and Western Sydney Distribution Park. Energy intensity rose at Sentosa Bay Resort and Kyoto Garden Hotel during refurbishment works, and at Northgate Mall because of the anchor-space refit. Certification is planned for Eastfield Plaza and Chao Phraya Galleria in FY2027.' },
  { id: 'DOC-CAPMAN', scope: 'TSY', title: 'Capital management plan, FY2027', date: 'Approved Aug 2026', text: 'Dividends should be covered at least 1.5 times by free cash flow (operating cash flow less asset-enhancement capex). FY2027 capital expenditure plan is SGD 820M, mostly development. Target divestments of SGD 500M in FY2027 to recycle capital into logistics, prioritising non-core secondary offices such as Thames Court. Green-bond proceeds are reserved for certified assets.' },
  { id: 'DOC-Q2-DEV', scope: 'RES', title: 'Q2 FY2026 development cost note', date: '14 Feb 2026', text: 'Residential development recorded an operating loss of SGD 5M in Q2 FY2026 against a plan profit of SGD 27M. Most of the gap is SGD 30M of additional cost recognised on Skyline Quarter for piling redesign and structural steel, plus slower Lakeside Gardens settlements. Recovery actions: value engineering on the facade and re-tendering the steel package.' },
  { id: 'DOC-BUDGET-27', scope: 'GRP', title: 'FY2027 budget assumptions', date: 'Approved Oct 2026', text: 'The FY2027 budget targets Group revenue of SGD 5,530M and operating profit of SGD 1,193M. Key assumptions: commercial occupancy held at 95% or above, the Northgate Mall anchor space re-let from Q3, logistics rental reversion of 6%, a lower hotel energy contract from Q2, and Skyline Quarter value engineering. The main downside risks are slower residential sales and higher refinancing costs on FY2028 maturities.' },
  { id: 'DOC-MARKET-Q4', scope: 'GRP', title: 'Market outlook, Q4 FY2026', date: '20 Oct 2026', text: 'Singapore prime office rents are expected to rise 2-3% in FY2027 on limited new supply. Secondary London office yields may widen a further 10-25bp. Logistics demand in Singapore and Sydney remains strong, with vacancy below 2%. Retail footfall is recovering but fashion tenants remain under pressure. Interest-rate markets price about 50bp of cuts over 12 months, though the timing is uncertain.' },
  { id: 'DOC-HOS-CAPEX', scope: 'HOS', title: 'Hospitality refurbishment programme', date: '02 Jul 2026', text: 'Sentosa Bay Resort is refurbishing 180 rooms in two phases ending Q1 FY2027, with about 15% of rooms out of service during works. Kyoto Garden Hotel lobby and F&B refurbishment completes in Q4 FY2026. Agency labour costs will fall once works complete, and occupancy is expected to return to above 82% in FY2027.' },
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
  ['wale', 'Weighted average lease expiry', 'Rent-weighted years remaining on major leases', 'SUM(rent * years_to_expiry) / SUM(rent)', 'Asset Management', 'curated.lease_schedule'],
  ['free_cash_flow', 'Free cash flow', 'Operating cash flow less asset-enhancement capex', 'operating_cash_flow - enhancement_capex', 'Group Finance', 'curated.fin_cash_flow'],
  ['dividend_cover', 'Dividend cover', 'Free cash flow over dividends paid', 'free_cash_flow / dividends', 'Group Finance', 'curated.fin_cash_flow'],
  ['budget_vs_actual', 'Budget against actual', 'FY2027 budget compared with FY2026 actual by business unit', 'budget_fy2027 - actual_fy2026', 'Group Finance', 'curated.fin_budget'],
  ['energy_intensity', 'Energy intensity', 'Energy use per square metre of floor area', 'kwh / floor_area_m2', 'Sustainability', 'curated.esg_assets'],
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
  ['Finance Analysis Agent', 'Group and business-unit performance, five-year trends, variance drivers, cash flow', 'get_metric, explain_variance, get_business_unit_history, get_quarterly_performance, get_budget, get_cash_flow'],
  ['Asset & Fund Agent / Valuation Agent', 'Asset valuation, occupancy, NOI, fund returns, leases and tenants, ESG', 'get_assets, get_leases, get_esg'],
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
