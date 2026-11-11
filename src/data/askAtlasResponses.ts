import type { AskAtlasResponse, SourceCitation } from '../types';

function source(
  id: string,
  number: number,
  title: string,
  page: string,
  section: string,
  excerpt: string,
): SourceCitation {
  return {
    id,
    number,
    title,
    page,
    section,
    excerpt,
    period: 'FY2026 illustrative scenario',
    illustrative: true,
  };
}

export const askAtlasTrustStatement =
  'AskAtlas provides analytical decision support. Finance remains accountable for review and action.';

export const askAtlasResponses: AskAtlasResponse[] = [
  {
    id: 'group-performance',
    question:
      'What are the principal drivers of the change in Group performance?',
    shortAnswer:
      'Stronger Commercial and Industrial & Logistics performance was partially offset by development project mix, timing and cost movements.',
    detailedAnswer:
      'In this illustrative analytical scenario, Commercial contributed approximately SGD 120M and Industrial & Logistics approximately SGD 60M. Development partially offset performance by approximately SGD 80M. These are selected drivers, not a complete reconciliation to the dashboard KPI or standalone variance bridge.',
    keyDrivers: [
      {
        text: 'Commercial contributed approximately SGD 120M through higher occupancy and rental rates.',
        sourceNumbers: [1, 2],
      },
      {
        text: 'Industrial & Logistics contributed approximately SGD 60M through lease renewals and lower operating costs.',
        sourceNumbers: [1],
      },
      {
        text: 'Development partially offset performance by approximately SGD 80M because of project mix and timing.',
        sourceNumbers: [3],
      },
    ],
    metrics: [
      {
        label: 'Commercial contribution',
        value: '+SGD 120M',
        note: 'Selected illustrative driver',
      },
      {
        label: 'Industrial & Logistics',
        value: '+SGD 60M',
        note: 'Selected illustrative driver',
      },
      {
        label: 'Development contribution',
        value: '−SGD 80M',
        note: 'Selected illustrative driver',
      },
    ],
    confidence: {
      label: 'High',
      score: 94,
      explanation:
        'Illustrative confidence indicator only. The mock narrative has supporting synthetic excerpts; this is not a measured AI accuracy score.',
    },
    sourceCitations: [
      source(
        'group-summary',
        1,
        'FY2026 Group Performance Summary',
        '4',
        'Selected operating drivers',
        'Commercial contribution: +SGD 120M. Industrial & Logistics contribution: +SGD 60M. Selected drivers only; other movements are excluded from this scenario.',
      ),
      source(
        'commercial-report',
        2,
        'Commercial Portfolio Operating Report',
        '7',
        'Occupancy and rental performance',
        'Higher occupancy and rental rates contributed to the illustrative improvement in Commercial operating performance.',
      ),
      source(
        'development-review',
        3,
        'Development Cost and Margin Review',
        '6',
        'Project mix and timing',
        'Development contribution reduced by approximately SGD 80M in the illustrative scenario, reflecting project mix, timing and selected cost movements.',
      ),
    ],
    followUpQuestions: [
      {
        question: 'What is causing the higher development costs?',
        responseId: 'development-costs',
      },
      {
        question: 'Which assets are driving the largest portfolio movement?',
        responseId: 'portfolio-movement',
      },
    ],
    relevantHub: 'Executive Hub',
    humanReviewNote:
      'Finance should reconcile the complete driver schedule and validate period, scope and accounting treatment before using this explanation in reporting.',
    assumptions: [
      'All figures and source excerpts are illustrative.',
      'Selected driver values are independent demonstration fixtures, not a complete financial reconciliation.',
      'No source documents or live financial records have been analysed.',
    ],
    matchTerms: ['group performance', 'principal drivers', 'what changed'],
  },
  {
    id: 'portfolio-movement',
    question: 'Which assets are driving the largest portfolio movement?',
    shortAnswer:
      'Riverside Commercial Tower is the largest selected positive movement in this illustrative portfolio scenario.',
    detailedAnswer:
      'The scenario introduces Riverside Commercial Tower at SGD 485M, moving the illustrative portfolio value from SGD 12.315B to SGD 12.800B. This is a record-addition scenario, not evidence of an economic revaluation gain.',
    keyDrivers: [
      {
        text: 'The Riverside valuation record contributes SGD 485M to the scenario.',
        sourceNumbers: [1],
      },
      {
        text: 'The Commercial Office asset class receives the full illustrated addition.',
        sourceNumbers: [2],
      },
      {
        text: 'Finance must check whether the record represents a new inclusion, replacement or revaluation before reporting a movement.',
        sourceNumbers: [1, 2],
      },
    ],
    metrics: [
      {
        label: 'Prior portfolio',
        value: 'SGD 12.315B',
        note: 'Illustrative starting value',
      },
      {
        label: 'Current portfolio',
        value: 'SGD 12.800B',
        note: 'Illustrative scenario value',
      },
      {
        label: 'Record contribution',
        value: '3.79%',
        note: '485M ÷ 12,800M, rounded',
      },
    ],
    confidence: {
      label: 'Review required',
      score: 88,
      explanation:
        'Illustrative indicator. Arithmetic is deterministic, but the interpretation depends on Finance confirming the record treatment.',
    },
    sourceCitations: [
      source(
        'portfolio-register',
        1,
        'Illustrative Portfolio Movement Register',
        '2',
        'Record inclusion scenario',
        'Prior portfolio value: SGD 12.315B. Riverside record addition: SGD 485M. Scenario closing value: SGD 12.800B. Record treatment requires Finance review.',
      ),
      source(
        'asset-class-summary',
        2,
        'Illustrative Asset-Class Summary',
        '3',
        'Commercial Office',
        'Riverside Commercial Tower is classified as Commercial Office, Singapore. The scenario allocates the full record addition to this asset class.',
      ),
    ],
    followUpQuestions: [
      {
        question: 'Which valuation records require review?',
        responseId: 'valuation-review',
      },
      {
        question:
          'What are the principal drivers of the change in Group performance?',
        responseId: 'group-performance',
      },
    ],
    relevantHub: 'Manager Hub',
    humanReviewNote:
      'Confirm portfolio inclusion and avoid double counting. A record addition must not automatically be described as a valuation gain.',
    assumptions: [
      'This is the predefined portfolio scenario, not a live portfolio calculation.',
      'No disposals, FX movements or other valuation changes are included.',
      'AskAtlas does not read the Investor Hub workflow state.',
    ],
    matchTerms: ['portfolio movement', 'which assets', 'portfolio performance'],
  },
  {
    id: 'forecast-margin',
    question:
      'Which developments have the largest movement in forecast margin?',
    shortAnswer:
      'Harbour Residences and Northbank Mixed Use show the largest selected downward forecast-margin movements.',
    detailedAnswer:
      'The illustrative review identifies procurement escalation at Harbour Residences and a revised delivery sequence at Northbank Mixed Use. Compare committed cost, remaining cost-to-complete and sales assumptions before accepting a revised forecast.',
    keyDrivers: [
      {
        text: 'Harbour Residences forecast margin declined by 2.4 percentage points, mainly reflecting procurement escalation.',
        sourceNumbers: [1],
      },
      {
        text: 'Northbank Mixed Use forecast margin declined by 1.6 percentage points following programme and preliminaries revisions.',
        sourceNumbers: [1, 2],
      },
      {
        text: 'Remaining cost-to-complete assumptions require project and Finance challenge.',
        sourceNumbers: [2],
      },
    ],
    metrics: [
      {
        label: 'Harbour margin movement',
        value: '−2.4 pp',
        note: 'Illustrative forecast change',
      },
      {
        label: 'Northbank margin movement',
        value: '−1.6 pp',
        note: 'Illustrative forecast change',
      },
    ],
    confidence: {
      label: 'Review required',
      score: 87,
      explanation:
        'Illustrative indicator. Forecast outcomes remain sensitive to unvalidated cost-to-complete and sales assumptions.',
    },
    sourceCitations: [
      source(
        'margin-register',
        1,
        'Illustrative Development Margin Register',
        '5',
        'Forecast exceptions',
        'Harbour Residences: forecast margin movement −2.4 pp. Northbank Mixed Use: forecast margin movement −1.6 pp. Values are selected mock exceptions.',
      ),
      source(
        'project-cost-review',
        2,
        'Illustrative Project Cost Review',
        '8',
        'Procurement and programme',
        'Procurement escalation and revised delivery sequencing are the selected scenario drivers. Cost-to-complete estimates await project and Finance challenge.',
      ),
    ],
    followUpQuestions: [
      {
        question: 'What is causing the higher development costs?',
        responseId: 'development-costs',
      },
    ],
    relevantHub: 'Developer Hub',
    humanReviewNote:
      'Development Finance and project owners should validate forecast changes and approve any revised margin assumptions.',
    assumptions: [
      'Project names and movements are fictional demonstration fixtures.',
      'No project-level forecast model is being calculated.',
    ],
    matchTerms: ['forecast margin', 'which developments', 'margin movement'],
  },
  {
    id: 'debt-maturity',
    question: 'How does the debt maturity profile affect liquidity headroom?',
    shortAnswer:
      'A selected concentration of maturities in 2027 makes refinancing timing and available facilities important areas for Treasury review.',
    detailedAnswer:
      'In the illustrative maturity schedule, SGD 1.2B falls due in 2027 against SGD 1.8B of available facilities. The simple SGD 0.6B difference is not a forecast liquidity headroom calculation: it excludes cash flows, restrictions, covenant conditions and facility availability at the maturity date.',
    keyDrivers: [
      {
        text: '2027 contains the largest selected maturity bucket at SGD 1.2B.',
        sourceNumbers: [1],
      },
      {
        text: 'Available facilities total SGD 1.8B in the scenario, subject to unmodelled terms and conditions.',
        sourceNumbers: [2],
      },
      {
        text: 'Compare refinancing timing and interest-rate scenarios rather than assuming all facilities are deployable.',
        sourceNumbers: [1, 2],
      },
    ],
    metrics: [
      {
        label: '2027 maturities',
        value: 'SGD 1.2B',
        note: 'Illustrative maturity bucket',
      },
      {
        label: 'Available facilities',
        value: 'SGD 1.8B',
        note: 'Illustrative, conditions not modelled',
      },
      {
        label: 'Simple difference',
        value: 'SGD 0.6B',
        note: 'Not forecast liquidity headroom',
      },
    ],
    confidence: {
      label: 'Review required',
      score: 85,
      explanation:
        'Illustrative indicator. Covenant terms, cash forecasts and facility conditions have not been evaluated.',
    },
    sourceCitations: [
      source(
        'debt-schedule',
        1,
        'Illustrative Debt Maturity Schedule',
        '2',
        '2026 to 2030+',
        'Selected maturity buckets: 2026, 2027, 2028, 2029 and 2030+. The 2027 scenario amount is SGD 1.2B.',
      ),
      source(
        'facility-summary',
        2,
        'Illustrative Liquidity and Facilities Summary',
        '4',
        'Available facilities',
        'Available facilities in the scenario total SGD 1.8B. Draw conditions, covenant tests and future availability are not modelled.',
      ),
    ],
    followUpQuestions: [
      {
        question: 'What is the impact of interest-rate changes on FY2027?',
        responseId: 'interest-rates',
      },
    ],
    relevantHub: 'Treasury & Capital Hub',
    humanReviewNote:
      'Treasury must validate cash forecasts, covenants, committed facilities and refinancing assumptions before taking funding decisions.',
    assumptions: [
      'All Treasury figures are illustrative.',
      'No covenant, maturity-date availability or cash-flow model is connected.',
    ],
    matchTerms: ['debt maturity', 'liquidity headroom', 'refinancing'],
  },
  {
    id: 'valuation-review',
    question: 'Which valuation records require review?',
    shortAnswer:
      'The predefined Riverside Commercial Tower scenario flags Net Property Income for Finance review at 82% extraction confidence.',
    detailedAnswer:
      'The sample Net Property Income value is SGD 21.1M. Its illustrative confidence is below the scenario review threshold of 90%. Finance should inspect the synthetic source excerpt and confirm or amend the field before approving the valuation record.',
    keyDrivers: [
      {
        text: 'Net Property Income is the selected low-confidence field at 82%.',
        sourceNumbers: [1],
      },
      {
        text: 'The predefined extracted value is SGD 21.1M.',
        sourceNumbers: [1],
      },
      {
        text: 'Source inspection and a Finance confirmation are required in the Investor workflow.',
        sourceNumbers: [2],
      },
    ],
    metrics: [
      {
        label: 'Extracted NPI',
        value: 'SGD 21.1M',
        note: 'Predefined sample value',
      },
      {
        label: 'Extraction confidence',
        value: '82%',
        note: 'Illustrative, not measured',
      },
      {
        label: 'Review threshold',
        value: '90%',
        note: 'Illustrative demonstration rule',
      },
    ],
    confidence: {
      label: 'Review required',
      score: 82,
      explanation:
        'Illustrative extraction indicator only. No document has been processed by a model.',
    },
    sourceCitations: [
      source(
        'riverside-valuation',
        1,
        'Illustrative Riverside Valuation Report',
        '12',
        'Income approach',
        'The illustrative net property income adopted for the valuation is SGD 21,100,000. This is synthetic source text for demonstration.',
      ),
      source(
        'validation-policy',
        2,
        'Illustrative Finance Validation Rules',
        '1',
        'Low-confidence fields',
        'Fields below the illustrative 90% review threshold require a human confirmation before the record can progress to approval.',
      ),
    ],
    followUpQuestions: [
      {
        question: 'Which assets are driving the largest portfolio movement?',
        responseId: 'portfolio-movement',
      },
    ],
    relevantHub: 'Investor Hub',
    humanReviewNote:
      'This fixed answer describes the sample review scenario. It does not reflect whether a user has subsequently validated the field in Investor Hub.',
    assumptions: [
      'No real valuation document has been extracted.',
      'The answer is predefined and is not a live workflow-status query.',
    ],
    matchTerms: ['valuation records', 'valuation review', 'confidence', 'npi'],
  },
  {
    id: 'development-costs',
    question: 'What is causing the higher development costs?',
    shortAnswer:
      'The mock scenario attributes higher development costs to procurement escalation, contractor variations and project sequencing.',
    detailedAnswer:
      'The selected Development movement in the Executive bridge is −SGD 80M. The illustrative cost review identifies three investigation areas, but does not provide a fully quantified cost-category reconciliation. Review project stage, contractor changes and remaining cost-to-complete before accepting the explanation.',
    keyDrivers: [
      {
        text: 'Procurement escalation increased selected material and package estimates.',
        sourceNumbers: [1],
      },
      {
        text: 'Contractor variations require validation against approved scope and commitments.',
        sourceNumbers: [1, 2],
      },
      {
        text: 'Revised project sequencing increased selected preliminaries and timing-related costs.',
        sourceNumbers: [2],
      },
    ],
    metrics: [
      {
        label: 'Development bridge movement',
        value: '−SGD 80M',
        note: 'Standalone illustrative bridge',
      },
      {
        label: 'Investigation areas',
        value: '3',
        note: 'Not a quantified reconciliation',
      },
    ],
    confidence: {
      label: 'Review required',
      score: 86,
      explanation:
        'Illustrative indicator. The scenario identifies investigation areas, not verified root causes or a complete cost bridge.',
    },
    sourceCitations: [
      source(
        'development-cost-margin',
        1,
        'Development Cost and Margin Review',
        '6',
        'Q2 selected exceptions',
        'Selected development costs are above plan. Procurement escalation and contractor variations are identified as review areas; cost-category attribution remains unvalidated.',
      ),
      source(
        'development-project-note',
        2,
        'Illustrative Project Controls Commentary',
        '9',
        'Programme and cost-to-complete',
        'Revised sequencing increased selected preliminaries. Finance and project owners should reconcile commitments, variations and remaining cost-to-complete.',
      ),
    ],
    followUpQuestions: [
      {
        question:
          'Which developments have the largest movement in forecast margin?',
        responseId: 'forecast-margin',
      },
      {
        question:
          'What are the principal drivers of the change in Group performance?',
        responseId: 'group-performance',
      },
    ],
    relevantHub: 'Developer Hub',
    humanReviewNote:
      'Development Finance owns the investigation. Project teams should substantiate cost explanations before management commentary is approved.',
    assumptions: [
      'Selected development drivers are synthetic and have not been independently verified.',
      'The −SGD 80M movement comes from the standalone illustrative bridge.',
    ],
    matchTerms: ['development costs', 'higher costs', 'cost overruns'],
  },
  {
    id: 'interest-rates',
    question: 'What is the impact of interest-rate changes on FY2027?',
    shortAnswer:
      'A 100-basis-point increase on an assumed SGD 2.0B unhedged floating-rate balance would increase annual interest expense by approximately SGD 20M.',
    detailedAnswer:
      'This simple illustrative sensitivity multiplies SGD 2.0B by 1.00%. It assumes the balance and rate change apply for a full year. It does not incorporate hedge effectiveness, refinancing, amortisation, tax, capitalisation or currency changes.',
    keyDrivers: [
      {
        text: 'Assumed unhedged floating-rate debt is SGD 2.0B.',
        sourceNumbers: [1],
      },
      {
        text: 'A +100 bp rate scenario produces approximately +SGD 20M annual interest expense.',
        sourceNumbers: [1, 2],
      },
      {
        text: 'Actual exposure depends on debt timing, hedge terms and funding decisions.',
        sourceNumbers: [2],
      },
    ],
    metrics: [
      {
        label: 'Assumed exposure',
        value: 'SGD 2.0B',
        note: 'Illustrative unhedged balance',
      },
      {
        label: 'Rate scenario',
        value: '+100 bp',
        note: '1.00 percentage point',
      },
      {
        label: 'Annual expense sensitivity',
        value: '+SGD 20M',
        note: 'Full-year, before other effects',
      },
    ],
    confidence: {
      label: 'Scenario only',
      score: 90,
      explanation:
        'Illustrative indicator. The arithmetic is deterministic; the assumed exposure has not been validated.',
    },
    sourceCitations: [
      source(
        'rate-exposure',
        1,
        'Illustrative Interest-Rate Exposure Summary',
        '3',
        'Floating-rate scenario',
        'Assumed unhedged floating-rate balance: SGD 2.0B. The scenario applies a full-year +100 bp parallel rate increase.',
      ),
      source(
        'rate-sensitivity',
        2,
        'Illustrative FY2027 Treasury Sensitivity',
        '5',
        'Scenario assumptions',
        'SGD 2.0B × 1.00% = SGD 20M annual interest expense sensitivity. Hedge changes, refinancing, tax, capitalisation and FX are excluded.',
      ),
    ],
    followUpQuestions: [
      {
        question: 'How does the debt maturity profile affect liquidity headroom?',
        responseId: 'debt-maturity',
      },
    ],
    relevantHub: 'Treasury & Capital Hub',
    humanReviewNote:
      'Treasury should validate the exposure and approved scenario assumptions. This sensitivity is not a forecast or hedging recommendation.',
    assumptions: [
      'Full-year parallel rate increase on a constant assumed balance.',
      'No hedge, tax, refinancing, amortisation or FX effects.',
      'All Treasury figures are illustrative.',
    ],
    matchTerms: ['interest-rate', 'interest rate', 'rates', 'fy2027'],
  },
];

export function getAskAtlasResponse(
  id: string | null,
): AskAtlasResponse | undefined {
  return askAtlasResponses.find((response) => response.id === id);
}

function normaliseQuestion(value: string): string {
  return value
    .toLowerCase()
    .replace(/[?!.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchAskAtlasQuestion(
  value: string,
): AskAtlasResponse | undefined {
  const normalised = normaliseQuestion(value);

  if (!normalised) {
    return undefined;
  }

  const exactMatch = askAtlasResponses.find(
    (response) => normaliseQuestion(response.question) === normalised,
  );

  if (exactMatch) {
    return exactMatch;
  }

  return askAtlasResponses.find((response) =>
    response.matchTerms.some((term) =>
      normalised.includes(normaliseQuestion(term)),
    ),
  );
}