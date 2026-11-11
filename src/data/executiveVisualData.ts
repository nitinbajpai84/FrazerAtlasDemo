export interface KpiVisual {
  icon: 'revenue' | 'profit' | 'assets' | 'return';
  values: number[];
  unit: string;
}

export const executiveKpiVisuals: Record<string, KpiVisual> = {
  revenue: {
    icon: 'revenue',
    values: [3900, 4250, 4620, 4906, 5200],
    unit: 'SGD million',
  },
  'operating-profit': {
    icon: 'profit',
    values: [760, 825, 920, 1019, 1100],
    unit: 'SGD million',
  },
  nav: {
    icon: 'assets',
    values: [10400, 11000, 11600, 12190, 12800],
    unit: 'SGD million',
  },
  roce: {
    icon: 'return',
    values: [6.2, 6.6, 7.0, 7.3, 7.9],
    unit: 'percent',
  },
};

export const executiveTrendYears = [
  'FY2022',
  'FY2023',
  'FY2024',
  'FY2025',
  'FY2026',
];