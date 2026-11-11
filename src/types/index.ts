export type PerformanceMetric =
  | 'revenue'
  | 'operatingProfit'
  | 'netProfit'
  | 'cashFlow';

export interface Kpi {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface PerformanceSeries {
  year: string;
  actual: number;
  priorYear: number;
}

export interface PerformanceMetricDefinition {
  id: PerformanceMetric;
  label: string;
  unit: string;
  data: PerformanceSeries[];
}

export interface VarianceItem {
  id: string;
  label: string;
  value: number;
  kind: 'total' | 'increase' | 'decrease';
  explanation: string;
}

export interface BusinessUnit {
  id: string;
  name: string;
  revenue: number;
  operatingProfit: number;
  yearOnYear: string;
}

export interface ExecutiveQuestion {
  id: string;
  number: string;
  title: string;
  topics: string[];
}

export interface ExecutiveInsight {
  id: string;
  category: string;
  text: string;
  kind: 'performance' | 'review' | 'treasury' | 'analysis';
}

export type HubName =
  | 'Executive Hub'
  | 'Investor Hub'
  | 'Developer Hub'
  | 'Manager Hub'
  | 'Treasury & Capital Hub';

export interface SourceCitation {
  id: string;
  number: number;
  title: string;
  page: string;
  section: string;
  excerpt: string;
  period: string;
  illustrative: true;
}

export interface AnalysisMetric {
  label: string;
  value: string;
  note: string;
}

export interface AnalysisDriver {
  text: string;
  sourceNumbers: number[];
}

export interface AskAtlasFollowUp {
  question: string;
  responseId: string;
}

export interface AskAtlasResponse {
  id: string;
  question: string;
  shortAnswer: string;
  detailedAnswer: string;
  keyDrivers: AnalysisDriver[];
  metrics: AnalysisMetric[];
  confidence: {
    label: string;
    score: number;
    explanation: string;
  };
  sourceCitations: SourceCitation[];
  followUpQuestions: AskAtlasFollowUp[];
  relevantHub: HubName;
  humanReviewNote: string;
  assumptions: string[];
  matchTerms: string[];
}

export type RecommendationSeverity =
  | 'Information'
  | 'Review required'
  | 'Attention required';

export interface Recommendation {
  id: string;
  title: string;
  detected: string;
  whyItMatters: string;
  evidence: string[];
  suggestedAnalysis: string;
  accountableRole: string;
  severity: RecommendationSeverity;
  originatingHub: HubName;
  askAtlasResponseId: string;
  question?: string;
}