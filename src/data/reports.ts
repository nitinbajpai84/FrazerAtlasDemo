export type ReportFormat = 'PowerPoint' | 'Word' | 'PDF' | 'Excel';

export type ReportApprovalState =
  | 'Draft generated'
  | 'Finance review'
  | 'Commentary updated'
  | 'Approved for publication';

export const reportGenerationStages = [
  'Gathering governed data',
  'Generating charts',
  'Drafting management commentary',
  'Adding source references',
  'Ready for Finance review',
];

export const reportApprovalStates: ReportApprovalState[] = [
  'Draft generated',
  'Finance review',
  'Commentary updated',
  'Approved for publication',
];

export const reportFormats: ReportFormat[] = [
  'PowerPoint',
  'Word',
  'PDF',
  'Excel',
];

export const investorReportDefinition = {
  title: 'Investor Valuation Review',
  period: '30 June 2026',
  scope: 'Riverside Commercial Tower · Illustrative record-addition scenario',
  owner: 'Investor Finance',
  initialCommentary:
    'The illustrative portfolio scenario adds Riverside Commercial Tower at SGD 485M, increasing the portfolio record total from SGD 12.315B to SGD 12.800B. This is a record inclusion, not an economic valuation gain. Finance has confirmed the sample Net Property Income field. Other extracted fields remain subject to Finance review.',
  sourceReferences: [
    {
      number: 1,
      title: 'Illustrative Riverside Valuation Report',
      page: '4',
      excerpt:
        'The illustrative adopted valuation is SGD 485,000,000. This is synthetic evidence, not an extracted PDF page.',
    },
    {
      number: 2,
      title: 'Illustrative Riverside Valuation Report',
      page: '12',
      excerpt:
        'The predefined extracted Net Property Income is SGD 21,100,000. The Finance-confirmed value is shown separately in the report and may differ.',
    },
    {
      number: 3,
      title: 'Illustrative Portfolio Movement Register',
      page: '2',
      excerpt:
        'Prior portfolio value: SGD 12.315B. Record inclusion: SGD 485M. Current scenario value: SGD 12.800B. No other movements are modelled.',
    },
  ],
};

export const portfolioImpactData = {
  priorValue: 12315000000,
  recordAddition: 485000000,
  currentValue: 12800000000,
  assetClass: 'Commercial Office',
  chart: [
    { name: 'Prior portfolio', existing: 12315, addition: 0 },
    { name: 'Current scenario', existing: 12315, addition: 485 },
  ],
};