import type {
  BusinessUnit,
  ExecutiveInsight,
  ExecutiveQuestion,
  Kpi,
  PerformanceMetricDefinition,
  VarianceItem,
} from '../types';

export const executiveKpis: Kpi[] = [
  {
    id: 'revenue',
    label: 'Revenue',
    value: 'SGD 5.2B',
    change: '+6% vs prior year',
    trend: 'positive',
    description: 'Illustrative Group revenue for FY2026.',
  },
  {
    id: 'operating-profit',
    label: 'Operating Profit',
    value: 'SGD 1.1B',
    change: '+8% vs prior year',
    trend: 'positive',
    description: 'Illustrative Group operating profit for FY2026.',
  },
  {
    id: 'nav',
    label: 'Net Asset Value',
    value: 'SGD 12.8B',
    change: '+5% vs prior year',
    trend: 'positive',
    description: 'Illustrative Group net asset value for FY2026.',
  },
  {
    id: 'roce',
    label: 'ROCE',
    value: '7.9%',
    change: '+0.6 percentage points vs prior year',
    trend: 'positive',
    description: 'Illustrative return on capital employed for FY2026.',
  },
];

export const performanceMetrics: PerformanceMetricDefinition[] = [
  {
    id: 'revenue',
    label: 'Revenue',
    unit: 'SGD million',
    data: [
      { year: 'FY2022', actual: 3900, priorYear: 3680 },
      { year: 'FY2023', actual: 4250, priorYear: 3900 },
      { year: 'FY2024', actual: 4620, priorYear: 4250 },
      { year: 'FY2025', actual: 4906, priorYear: 4620 },
      { year: 'FY2026', actual: 5200, priorYear: 4906 },
    ],
  },
  {
    id: 'operatingProfit',
    label: 'Operating Profit',
    unit: 'SGD million',
    data: [
      { year: 'FY2022', actual: 760, priorYear: 710 },
      { year: 'FY2023', actual: 825, priorYear: 760 },
      { year: 'FY2024', actual: 920, priorYear: 825 },
      { year: 'FY2025', actual: 1019, priorYear: 920 },
      { year: 'FY2026', actual: 1100, priorYear: 1019 },
    ],
  },
  {
    id: 'netProfit',
    label: 'Net Profit',
    unit: 'SGD million',
    data: [
      { year: 'FY2022', actual: 460, priorYear: 425 },
      { year: 'FY2023', actual: 510, priorYear: 460 },
      { year: 'FY2024', actual: 565, priorYear: 510 },
      { year: 'FY2025', actual: 610, priorYear: 565 },
      { year: 'FY2026', actual: 660, priorYear: 610 },
    ],
  },
  {
    id: 'cashFlow',
    label: 'Cash Flow',
    unit: 'SGD million',
    data: [
      { year: 'FY2022', actual: 580, priorYear: 620 },
      { year: 'FY2023', actual: 690, priorYear: 580 },
      { year: 'FY2024', actual: 640, priorYear: 690 },
      { year: 'FY2025', actual: 790, priorYear: 640 },
      { year: 'FY2026', actual: 860, priorYear: 790 },
    ],
  },
];

export const operatingProfitVariance: VarianceItem[] = [
  {
    id: 'opening',
    label: 'FY2025',
    value: 1019,
    kind: 'total',
    explanation:
      'Opening operating profit in this standalone illustrative bridge: SGD 1,019M.',
  },
  {
    id: 'property-operations',
    label: 'Property Operations',
    value: 135,
    kind: 'increase',
    explanation:
      'Illustrative improvement of SGD 135M from stronger property operations, including occupancy, rental performance and operating efficiency.',
  },
  {
    id: 'development',
    label: 'Development',
    value: -80,
    kind: 'decrease',
    explanation:
      'Illustrative reduction of SGD 80M from development project mix, timing and higher selected project costs. Review cost categories, contractor movements and remaining cost-to-complete.',
  },
  {
    id: 'corporate',
    label: 'Corporate and Others',
    value: 26,
    kind: 'increase',
    explanation:
      'Illustrative improvement of SGD 26M across Corporate and Others. Finance should review the component movements before drawing conclusions.',
  },
  {
    id: 'closing',
    label: 'FY2026',
    value: 1100,
    kind: 'total',
    explanation:
      'Closing operating profit in this standalone illustrative bridge: SGD 1,100M. It reconciles to the KPI cards and the business-unit table.',
  },
];

export const businessUnits: BusinessUnit[] = [
  {
    id: 'commercial',
    name: 'Commercial',
    revenue: 2100,
    operatingProfit: 520,
    yearOnYear: '+7%',
  },
  {
    id: 'retail',
    name: 'Retail',
    revenue: 1250,
    operatingProfit: 310,
    yearOnYear: '+5%',
  },
  {
    id: 'industrial',
    name: 'Industrial & Logistics',
    revenue: 980,
    operatingProfit: 180,
    yearOnYear: '+6%',
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    revenue: 540,
    operatingProfit: 110,
    yearOnYear: '+4%',
  },
  {
    id: 'residential',
    name: 'Residential',
    revenue: 330,
    operatingProfit: 70,
    yearOnYear: '+9%',
  },
];

export const executiveQuestions: ExecutiveQuestion[] = [
  {
    id: 'performance',
    number: '01',
    title: 'How are we performing?',
    topics: [
      'P&L, Balance Sheet and Cash Flow',
      'Group and BU performance',
      'NAV, ROCE and ROE',
      'Actuals versus comparator periods',
    ],
  },
  {
    id: 'change',
    number: '02',
    title: 'What has changed?',
    topics: [
      'Material variances',
      'Portfolio and BU movements',
      'KPI trends',
      'Exceptions and anomalies',
    ],
  },
  {
    id: 'drivers',
    number: '03',
    title: 'Why has it changed?',
    topics: [
      'Driver decomposition',
      'Root-cause analysis',
      'Drill-down from Group to BU, portfolio and asset',
      'Cross-financial-statement relationships',
    ],
  },
  {
    id: 'attention',
    number: '04',
    title: 'What requires attention?',
    topics: [
      'Atlas Recommends',
      'Emerging issues and exceptions',
      'Prioritised areas for investigation',
      'Suggested next analytical questions',
    ],
  },
];

export const executiveInsights: ExecutiveInsight[] = [
  {
    id: 'profit',
    category: 'Performance',
    kind: 'performance',
    text: 'Operating profit increased by 8%, driven by stronger Commercial and Industrial & Logistics performance.',
  },
  {
    id: 'cost',
    category: 'Cost review',
    kind: 'review',
    text: 'Development costs are higher than plan in Q2. Further root-cause analysis is recommended.',
  },
  {
    id: 'interest',
    category: 'Treasury',
    kind: 'treasury',
    text: 'Interest expense increased because of FX movements. Hedging options should be assessed.',
  },
  {
    id: 'suggested-analysis',
    category: 'Suggested analysis',
    kind: 'analysis',
    text: 'AskAtlas suggested analysis: Impact of interest-rate changes on FY2027.',
  },
];

export const executiveDataNote =
  'Illustrative schedules only. KPI, variance-bridge and business-unit values are independent demonstration fixtures and do not fully reconcile. Workspace selectors do not filter or convert these figures.';