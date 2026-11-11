export interface ValuationField {
  id: string;
  label: string;
  value: string;
  confidence: number;
  requiresReview: boolean;
  sourcePage: string;
  sourceText: string;
}

export interface ValuationRecord {
  property: string;
  propertyId: string;
  location: string;
  assetType: string;
  valuationDate: string;
  valuation: number;
  currency: string;
  valuer: string;
  fields: ValuationField[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
}

export interface ExtractionStage {
  id: string;
  label: string;
}