import type {
  ExtractionStage,
  ValuationRecord,
} from '../types/investor';

export const sampleValuationFilename = 'sample-valuation-report.pdf';

export const extractionStageDuration = 800;

export const extractionStages: ExtractionStage[] = [
  { id: 'upload', label: 'Uploading document' },
  { id: 'classify', label: 'Classifying document' },
  { id: 'extract', label: 'Extracting valuation attributes' },
  { id: 'validate', label: 'Validating extracted information' },
  { id: 'record', label: 'Creating valuation record' },
  { id: 'portfolio', label: 'Updating portfolio analysis' },
  { id: 'review', label: 'Ready for Finance review' },
];

export const illustrativeValuationRecord: ValuationRecord = {
  property: 'Riverside Commercial Tower',
  propertyId: 'FP-VAL-001',
  location: 'Singapore',
  assetType: 'Commercial Office',
  valuationDate: '30 June 2026',
  valuation: 485000000,
  currency: 'SGD',
  valuer: 'Illustrative Independent Valuer',
  fields: [
    {
      id: 'property',
      label: 'Property name',
      value: 'Riverside Commercial Tower',
      confidence: 99,
      requiresReview: false,
      sourcePage: '2',
      sourceText:
        'Property: Riverside Commercial Tower. This synthetic excerpt is provided for demonstration only.',
    },
    {
      id: 'location',
      label: 'Location',
      value: 'Singapore',
      confidence: 98,
      requiresReview: false,
      sourcePage: '2',
      sourceText:
        'The subject property is located in Singapore. Synthetic demonstration text.',
    },
    {
      id: 'valuation-date',
      label: 'Valuation date',
      value: '30 June 2026',
      confidence: 97,
      requiresReview: false,
      sourcePage: '3',
      sourceText:
        'The illustrative valuation is effective as at 30 June 2026.',
    },
    {
      id: 'valuation',
      label: 'Valuation amount',
      value: 'SGD 485,000,000',
      confidence: 99,
      requiresReview: false,
      sourcePage: '4',
      sourceText:
        'The illustrative adopted valuation is SGD 485,000,000.',
    },
    {
      id: 'capitalisation-rate',
      label: 'Capitalisation rate',
      value: '4.35%',
      confidence: 94,
      requiresReview: false,
      sourcePage: '11',
      sourceText:
        'The illustrative adopted capitalisation rate is 4.35%.',
    },
    {
      id: 'occupancy',
      label: 'Occupancy',
      value: '92.4%',
      confidence: 91,
      requiresReview: false,
      sourcePage: '8',
      sourceText:
        'The illustrative occupancy at the valuation date is 92.4%.',
    },
    {
      id: 'npi',
      label: 'Net property income',
      value: 'SGD 21,100,000',
      confidence: 82,
      requiresReview: true,
      sourcePage: '12',
      sourceText:
        'The illustrative net property income adopted for the valuation is SGD 21,100,000. This is synthetic source text for demonstration.',
    },
  ],
};