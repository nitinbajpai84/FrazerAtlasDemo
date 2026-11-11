export const groupReportData = {
  title: 'Group Management Pack',
  subtitle: 'Performance, drivers and priorities for Finance review',
  period: 'FY2026',
  reference: 'ATLAS-DEMO-GMP-001',
  version: 'Illustrative edition 1.0',
  owner: 'Group Finance',
  status: 'Illustrative draft — not approved for publication',
  executiveSummary:
    'The illustrative Group dashboard shows revenue of SGD 5.2B, operating profit of SGD 1.1B and net asset value of SGD 12.8B. Positive selected operating trends are accompanied by development-cost and funding questions that warrant Finance investigation. These figures demonstrate the reporting experience and are not actual Frasers Property results.',
  commentary: [
    {
      title: 'Operating performance',
      text:
        'The KPI scenario shows operating profit increasing by 8% against the prior year. The predefined analytical narrative attributes selected positive contributions to Commercial and Industrial & Logistics. These selected drivers are not a complete reconciliation to the Group KPI.',
    },
    {
      title: 'Development exposure',
      text:
        'The separate operating-profit bridge includes a Development movement of −SGD 80M. Procurement escalation, contractor variations and project sequencing are predefined investigation areas, not verified root causes.',
    },
    {
      title: 'Funding sensitivity',
      text:
        'The illustrative Treasury scenario assumes SGD 2.0B of unhedged floating-rate debt. A full-year +100 bp change produces approximately SGD 20M of additional interest expense before other effects. This is a sensitivity, not a forecast.',
    },
  ],
  actions: [
    {
      priority: '01',
      title: 'Reconcile the operating-performance explanation',
      owner: 'Group Finance',
      action:
        'Validate reporting scope, comparator periods and a complete driver bridge before using the explanation in management reporting.',
    },
    {
      priority: '02',
      title: 'Challenge development cost-to-complete',
      owner: 'Development Finance',
      action:
        'Review procurement packages, contractor variations, project stage and remaining cost-to-complete with project owners.',
    },
    {
      priority: '03',
      title: 'Assess refinancing and rate scenarios',
      owner: 'Treasury',
      action:
        'Validate maturity timing, facility availability, covenants and actual hedge exposure before considering funding actions.',
    },
  ],
  sources: [
    {
      number: 1,
      title: 'Executive dashboard fixtures',
      location: 'src/data/executiveData.ts',
      description:
        'KPI values, performance-series values, business-unit table and standalone variance bridge. These are independent mock schedules.',
    },
    {
      number: 2,
      title: 'Predefined AskAtlas analytical scenarios',
      location: 'src/data/askAtlasResponses.ts',
      description:
        'Synthetic Group-performance, development-cost and interest-rate narratives. No source documents or AI model were used.',
    },
    {
      number: 3,
      title: 'Illustrative Treasury preview',
      location: 'src/data/previewData.ts',
      description:
        'Fixed maturity and funding examples. Facility conditions, covenant tests and cash-flow forecasts are not modelled.',
    },
  ],
  limitations: [
    'All values, narratives and source references are illustrative, not actual Frasers Property financial information.',
    'The KPI scenario, variance bridge and business-unit schedule are independent demonstration fixtures and do not fully reconcile.',
    'The operating-profit KPI is SGD 1.1B; the separate bridge closes at SGD 1.150B. They must not be treated as the same reconciled schedule.',
    'Workspace year, view and currency selectors do not filter or convert this report.',
    'No accounting verification, document extraction, live AI analysis or production approval has occurred.',
    'Exporting or saving this PDF does not constitute Finance approval or publication.',
  ],
};