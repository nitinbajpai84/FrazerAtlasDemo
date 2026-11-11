import type { Recommendation } from '../types';

export const recommendations: Recommendation[] = [
  {
    id: 'development-cost',
    title: 'Development-cost movement',
    detected: 'Selected development costs are above plan.',
    whyItMatters:
      'Forecast margin may decline if recent cost movements continue.',
    evidence: [
      'Development Cost and Margin Review, synthetic page 6: selected costs are above plan.',
      'Executive standalone bridge: Development movement of −SGD 80M.',
      'These fixtures identify an investigation area, not a verified causal reconciliation.',
    ],
    suggestedAnalysis:
      'Review cost category, contractor, project stage and remaining cost-to-complete.',
    accountableRole: 'Development Finance',
    severity: 'Attention required',
    originatingHub: 'Developer Hub',
    askAtlasResponseId: 'development-costs',
  },
  {
    id: 'retail-occupancy',
    title: 'Retail occupancy',
    detected: 'Occupancy declined across selected retail assets.',
    whyItMatters: 'Rental income and asset performance may be affected.',
    evidence: [
      'Illustrative Retail Leasing Watchlist, synthetic page 3: selected assets show lower occupancy.',
      'No quantified occupancy bridge or tenant-level evidence is connected in this prototype.',
    ],
    suggestedAnalysis:
      'Review tenant churn, lease expiries and leasing pipeline. The linked AskAtlas response provides wider portfolio context, not a retail root-cause answer.',
    accountableRole: 'Asset Management',
    severity: 'Review required',
    originatingHub: 'Manager Hub',
    askAtlasResponseId: 'portfolio-movement',
  },
  {
    id: 'refinancing',
    title: 'Refinancing concentration',
    detected: 'A concentration of debt maturities is approaching.',
    whyItMatters: 'Liquidity headroom and cost of funding may be affected.',
    evidence: [
      'Illustrative Debt Maturity Schedule, synthetic page 2: SGD 1.2B in the 2027 bucket.',
      'Illustrative Liquidity and Facilities Summary, synthetic page 4: SGD 1.8B available facilities, with conditions not modelled.',
    ],
    suggestedAnalysis:
      'Compare refinancing and interest-rate scenarios, including timing, facility conditions and covenant assumptions.',
    accountableRole: 'Treasury',
    severity: 'Review required',
    originatingHub: 'Treasury & Capital Hub',
    askAtlasResponseId: 'debt-maturity',
  },
  {
    id: 'valuation',
    title: 'Valuation review',
    detected:
      'A sample valuation field has extraction confidence below the illustrative review threshold.',
    whyItMatters:
      'The field should be validated before the valuation record is approved.',
    evidence: [
      'Riverside sample Net Property Income: SGD 21.1M, illustrative extraction confidence 82%.',
      'Illustrative review threshold: 90%. This recommendation is a fixed scenario, not a live validation-status check.',
    ],
    suggestedAnalysis:
      'Open the source page and confirm the extracted value in the Investor Hub workflow when that increment is available.',
    accountableRole: 'Investor Finance',
    severity: 'Information',
    originatingHub: 'Investor Hub',
    askAtlasResponseId: 'valuation-review',
  },
];