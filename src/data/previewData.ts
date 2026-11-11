export interface PreviewMetric {
  label: string;
  value: string;
  note: string;
}

export interface PreviewRow {
  name: string;
  measure: string;
  detail: string;
  status: string;
}

export interface PreviewHubData {
  title: string;
  subtitle: string;
  metrics: PreviewMetric[];
  tableTitle: string;
  columns: [string, string, string, string];
  rows: PreviewRow[];
  question: string;
  responseId: string;
}

export const developerPreview: PreviewHubData = {
  title: 'Developer Hub',
  subtitle: 'Connected visibility across development performance and risk.',
  metrics: [
    {
      label: 'Development pipeline',
      value: 'SGD 4.8B',
      note: 'Illustrative gross development value',
    },
    {
      label: 'Actual versus budget',
      value: 'SGD 640M / 620M',
      note: 'Selected period cost scenario',
    },
    {
      label: 'Committed cost',
      value: 'SGD 1.45B',
      note: 'Selected pipeline commitments',
    },
    {
      label: 'Cost to complete',
      value: 'SGD 920M',
      note: 'Mock remaining cost estimate',
    },
    {
      label: 'WIP',
      value: 'SGD 780M',
      note: 'Illustrative work in progress',
    },
    {
      label: 'Pre-sales',
      value: '68%',
      note: 'Selected residential inventory',
    },
    {
      label: 'Sales velocity',
      value: '24 units / month',
      note: 'Illustrative selected-project average',
    },
    {
      label: 'Unsold inventory',
      value: '310 units',
      note: 'Selected project scenario',
    },
    {
      label: 'Forecast margin',
      value: '18.6%',
      note: 'Illustrative selected-project average',
    },
    {
      label: 'Project exceptions',
      value: '2 for review',
      note: 'Fixed mock exceptions',
    },
  ],
  tableTitle: 'Development project exceptions',
  columns: ['Project', 'Margin movement', 'Selected driver', 'Review status'],
  rows: [
    {
      name: 'Harbour Residences',
      measure: '−2.4 pp',
      detail: 'Procurement escalation',
      status: 'Review required',
    },
    {
      name: 'Northbank Mixed Use',
      measure: '−1.6 pp',
      detail: 'Programme and preliminaries revisions',
      status: 'Review required',
    },
    {
      name: 'Westfield Logistics Park',
      measure: '+0.3 pp',
      detail: 'Selected package savings',
      status: 'Information',
    },
  ],
  question:
    'Which developments have experienced the largest movement in forecast margin, and what are the principal drivers?',
  responseId: 'forecast-margin',
};

export const managerPreview: PreviewHubData = {
  title: 'Manager Hub',
  subtitle: 'Asset and fund performance, brought into focus.',
  metrics: [
    {
      label: 'AUM',
      value: 'SGD 18.4B',
      note: 'Illustrative assets under management',
    },
    {
      label: 'Asset and fund performance',
      value: '6.2%',
      note: 'Mock annual total-return scenario',
    },
    {
      label: 'Occupancy',
      value: '94.1%',
      note: 'Selected operating portfolio',
    },
    {
      label: 'Rental performance',
      value: '+3.8%',
      note: 'Illustrative rental reversion',
    },
    {
      label: 'Operating costs',
      value: 'SGD 186M',
      note: 'Selected period scenario',
    },
    {
      label: 'Management fees',
      value: 'SGD 42M',
      note: 'Illustrative selected-period fees',
    },
    {
      label: 'Performance fees',
      value: 'SGD 8M',
      note: 'Illustrative selected-period fees',
    },
    {
      label: 'Assets requiring attention',
      value: '2',
      note: 'Fixed mock watchlist',
    },
  ],
  tableTitle: 'Asset and fund watchlist',
  columns: ['Asset / fund', 'Selected measure', 'Investigation area', 'Review status'],
  rows: [
    {
      name: 'Riverside Commercial Tower',
      measure: 'SGD 485M record inclusion',
      detail: 'Confirm record treatment and avoid double counting',
      status: 'Review required',
    },
    {
      name: 'Central Retail Centre',
      measure: 'Occupancy −1.8 pp',
      detail: 'Tenant churn and leasing pipeline',
      status: 'Review required',
    },
    {
      name: 'Illustrative Core Fund',
      measure: '6.2% return scenario',
      detail: 'Fixed demonstration performance',
      status: 'Information',
    },
  ],
  question:
    'Which assets are driving the largest movement in portfolio performance, and what operational factors explain the change?',
  responseId: 'portfolio-movement',
};

export const treasuryPreview: PreviewHubData = {
  title: 'Treasury & Capital Hub',
  subtitle: 'An illustrative view of liquidity, funding and capital.',
  metrics: [
    {
      label: 'Liquidity',
      value: 'SGD 2.4B',
      note: 'Illustrative cash and available facilities',
    },
    {
      label: 'Available facilities',
      value: 'SGD 1.8B',
      note: 'Illustrative; draw conditions not modelled',
    },
    {
      label: 'Debt maturity',
      value: 'SGD 1.2B in 2027',
      note: 'Illustrative largest maturity bucket',
    },
    {
      label: 'Leverage',
      value: '38.5%',
      note: 'Illustrative net debt / total assets',
    },
    {
      label: 'Interest coverage',
      value: '3.4×',
      note: 'Illustrative scenario ratio',
    },
    {
      label: 'Cost of funding',
      value: '4.2%',
      note: 'Illustrative weighted average',
    },
    {
      label: 'FX exposure',
      value: 'SGD 850M',
      note: 'Illustrative unhedged equivalent',
    },
    {
      label: 'Interest-rate exposure',
      value: 'SGD 2.0B',
      note: 'Illustrative unhedged floating-rate balance',
    },
    {
      label: 'Capital allocation',
      value: 'SGD 650M',
      note: 'Illustrative investment envelope',
    },
  ],
  tableTitle: 'Treasury investigation priorities',
  columns: ['Area', 'Illustrative measure', 'Next analysis', 'Review status'],
  rows: [
    {
      name: 'Refinancing concentration',
      measure: '2027: SGD 1.2B',
      detail: 'Compare timing, facilities and covenant assumptions',
      status: 'Review required',
    },
    {
      name: 'Interest-rate sensitivity',
      measure: '+100 bp → +SGD 20M',
      detail: 'Full-year scenario; validate actual exposure',
      status: 'Information',
    },
    {
      name: 'FX exposure',
      measure: 'SGD 850M equivalent',
      detail: 'Review currency mix and approved hedge policy',
      status: 'Review required',
    },
  ],
  question:
    'How does the upcoming debt maturity profile affect liquidity headroom and refinancing exposure?',
  responseId: 'debt-maturity',
};

export const maturityData = [
  { year: '2026', amount: 600 },
  { year: '2027', amount: 1200 },
  { year: '2028', amount: 900 },
  { year: '2029', amount: 700 },
  { year: '2030+', amount: 1100 },
];

export interface LibraryReport {
  id: string;
  title: string;
  period: string;
  scope: string;
  status: 'Draft' | 'Under Finance Review' | 'Approved' | 'Published';
  lastGenerated: string;
  owner: string;
  formats: string[];
  summary: string;
}

export const libraryReports: LibraryReport[] = [
  {
    id: 'group-pack',
    title: 'Group Management Pack',
    period: 'FY2026',
    scope: 'Illustrative Group performance',
    status: 'Under Finance Review',
    lastGenerated: '30 June 2026, 09:00 · mock timestamp',
    owner: 'Group Finance',
    formats: ['PowerPoint', 'PDF', 'Excel'],
    summary:
      'Illustrative revenue, operating profit, NAV and ROCE, supported by selected driver commentary. Independent demonstration schedules do not fully reconcile.',
  },
  {
    id: 'investor-review',
    title: 'Investor Valuation Review',
    period: '30 June 2026',
    scope: 'Illustrative portfolio valuation review',
    status: 'Draft',
    lastGenerated: '30 June 2026, 09:15 · mock timestamp',
    owner: 'Investor Finance',
    formats: ['PowerPoint', 'Word', 'PDF', 'Excel'],
    summary:
      'A fixed library example of valuation reporting. For the interactive report-generation and approval workflow, open Investor Hub.',
  },
  {
    id: 'development-review',
    title: 'Development Portfolio Review',
    period: 'Q2 FY2026',
    scope: 'Selected fictional developments',
    status: 'Under Finance Review',
    lastGenerated: '30 June 2026, 09:30 · mock timestamp',
    owner: 'Development Finance',
    formats: ['PowerPoint', 'PDF', 'Excel'],
    summary:
      'Illustrative project cost, forecast-margin and cost-to-complete exceptions. Forecast assumptions require Finance and project-owner review.',
  },
  {
    id: 'asset-review',
    title: 'Asset and Fund Performance',
    period: 'Q2 FY2026',
    scope: 'Selected illustrative assets and funds',
    status: 'Approved',
    lastGenerated: '30 June 2026, 09:45 · mock timestamp',
    owner: 'Asset Management',
    formats: ['Word', 'PDF', 'Excel'],
    summary:
      'Illustrative occupancy, rental performance and fund metrics. Approved is a fixed demonstration status, not an authenticated approval.',
  },
  {
    id: 'treasury-review',
    title: 'Treasury and Capital Review',
    period: 'Q2 FY2026',
    scope: 'Illustrative funding and liquidity scenarios',
    status: 'Published',
    lastGenerated: '30 June 2026, 10:00 · mock timestamp',
    owner: 'Treasury',
    formats: ['PowerPoint', 'PDF', 'Excel'],
    summary:
      'Illustrative maturity buckets from 2026 to 2030+ and funding sensitivities. Published is a mock status; no distribution has occurred.',
  },
];

export const governanceMetrics: PreviewMetric[] = [
  {
    label: 'User management',
    value: '24 users',
    note: 'Fixed illustrative directory count',
  },
  {
    label: 'Usage analytics',
    value: '142 sessions',
    note: 'Mock monthly usage; not measured',
  },
  {
    label: 'AskAtlas usage',
    value: '86 questions',
    note: 'Mock count; not tracked',
  },
  {
    label: 'Token consumption',
    value: '0 live tokens',
    note: 'No model calls; illustrative budget 250k',
  },
];

export const governanceRoles = [
  {
    role: 'Group CFO',
    scope: 'Group-wide illustrative scope',
    hubs: 'All Finance hubs',
    users: 1,
  },
  {
    role: 'Group Finance',
    scope: 'Group and business-unit scope',
    hubs: 'Executive, Reports, AskAtlas',
    users: 6,
  },
  {
    role: 'Investor Finance',
    scope: 'Assigned valuation portfolios',
    hubs: 'Investor, Reports, AskAtlas',
    users: 4,
  },
  {
    role: 'Development Finance',
    scope: 'Assigned development projects',
    hubs: 'Developer, Reports, AskAtlas',
    users: 4,
  },
  {
    role: 'Asset Management',
    scope: 'Assigned assets and funds',
    hubs: 'Manager, Reports, AskAtlas',
    users: 4,
  },
  {
    role: 'Treasury',
    scope: 'Illustrative Group funding scope',
    hubs: 'Treasury, Reports, AskAtlas',
    users: 3,
  },
  {
    role: 'Platform Administrator',
    scope: 'Configuration scope only in the proposed model',
    hubs: 'Administration',
    users: 2,
  },
];

export const governanceControls = [
  {
    title: 'Row-level access',
    detail:
      'Proposed scope dimensions: Group, business unit, portfolio and asset. No row-level security is enforced in this prototype.',
  },
  {
    title: 'Hub access',
    detail:
      'The table illustrates intended hub entitlements. Every demo route remains accessible; this is not a security boundary.',
  },
  {
    title: 'Prompt versions',
    detail:
      'Illustrative analytical template v0.3. Answers are static TypeScript fixtures; no prompt is submitted to a model.',
  },
  {
    title: 'User feedback',
    detail:
      'Illustrative theme: show evidence before action. Feedback collection and persistence are not connected.',
  },
];

export const governanceAudit = [
  {
    time: '30 Jun 2026, 10:00',
    action: 'Prompt template v0.3 reviewed',
    actor: 'Platform Administrator · mock event',
  },
  {
    time: '30 Jun 2026, 09:45',
    action: 'Illustrative role matrix reviewed',
    actor: 'Group Finance · mock event',
  },
  {
    time: '30 Jun 2026, 09:15',
    action: 'Sample valuation policy reviewed',
    actor: 'Investor Finance · mock event',
  },
];