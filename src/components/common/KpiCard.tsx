import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  ChartNoAxesCombined,
  Coins,
  Minus,
  Target,
} from 'lucide-react';
import {
  executiveKpiVisuals,
  executiveTrendYears,
} from '../../data/executiveVisualData';
import type { Kpi } from '../../types';

interface KpiCardProps {
  kpi: Kpi;
}

const icons = {
  revenue: ChartNoAxesCombined,
  profit: Coins,
  assets: Building2,
  return: Target,
};

function KpiCard({ kpi }: KpiCardProps) {
  const visual = executiveKpiVisuals[kpi.id];

  const TrendIcon =
    kpi.trend === 'positive'
      ? ArrowUpRight
      : kpi.trend === 'negative'
        ? ArrowDownRight
        : Minus;

  const MetricIcon = visual
    ? icons[visual.icon]
    : ChartNoAxesCombined;

  const values = visual?.values ?? [];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || 1;

  const points = values
    .map((value, index) => {
      const x = 4 + (index / Math.max(values.length - 1, 1)) * 112;
      const y = 39 - ((value - minimum) / range) * 30;

      return `${x},${y}`;
    })
    .join(' ');

  const trendDescription = visual
    ? `Illustrative ${kpi.label} trend: ${values
        .map(
          (value, index) =>
            `${executiveTrendYears[index]}: ${value.toLocaleString('en-SG')}`,
        )
        .join('; ')}. Unit: ${visual.unit}. Sparkline uses an independent vertical scale.`
    : '';

  return (
    <article
      className="kpi-card kpi-card--visual"
      aria-label={`${kpi.label}: ${kpi.value}. ${kpi.change}. Illustrative.`}
    >
      <div className="visual-kpi-heading">
        <span className="visual-kpi-icon">
          <MetricIcon size={22} strokeWidth={1.7} aria-hidden="true" />
        </span>
        <h2>{kpi.label}</h2>
      </div>

      <div className="visual-kpi-body">
        <p className="kpi-value">{kpi.value}</p>

        {visual && (
          <svg
            className="kpi-sparkline"
            viewBox="0 0 120 48"
            role="img"
            aria-label={trendDescription}
          >
            <title>{trendDescription}</title>
            <line
              x1="4"
              y1="44"
              x2="116"
              y2="44"
              stroke="#E2E8F0"
            />
            <polyline
              points={points}
              fill="none"
              stroke="#FD5108"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="116"
              cy={39 - ((values[values.length - 1] - minimum) / range) * 30}
              r="3"
              fill="#FD5108"
            />
          </svg>
        )}
      </div>

      <p className={`kpi-change kpi-change--${kpi.trend}`}>
        <TrendIcon size={15} aria-hidden="true" />
        <span>{kpi.change}</span>
      </p>

      <div className="visual-kpi-footer">
        <span className="kpi-period">FY2026 · Illustrative</span>
        {visual && <span>5-year trend</span>}
      </div>
    </article>
  );
}

export default KpiCard;