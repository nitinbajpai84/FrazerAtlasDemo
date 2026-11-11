// Shared building blocks for the data-driven hubs, built on the existing Panel, Badge and table styles.
import type { ReactNode } from 'react';
import { Lock, MessageSquareText } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAtlasWorkspace } from '../../context/AtlasWorkspaceContext';
import { role } from '../../engine/data';
import { useEngine } from '../../engine/store';
import type { HubName } from '../../types';
import PageHeader from '../layout/PageHeader';
import RecommendationsPanel from '../recommendations/RecommendationsPanel';

export interface HubMetric {
  label: string;
  value: string;
  note: string;
}

interface HubFrameProps {
  hub: HubName;
  title: string;
  subtitle: string;
  question: string;
  metrics: HubMetric[];
  children: ReactNode;
}

export function HubFrame({ hub, title, subtitle, question, metrics, children }: HubFrameProps) {
  const { openAtlas, closeAtlas, atlasOpen } = useAtlasWorkspace();
  useEngine(); // re-render when role or data changes

  if (!role().hubs.includes(hub)) {
    return (
      <>
        <PageHeader title={title} subtitle={subtitle} />
        <section className="access-denied" role="status">
          <Lock size={22} aria-hidden="true" />
          <div>
            <h2>This hub is not available to {role().name}</h2>
            <p>
              Access follows the signed-in role. The same rule applies to every agent tool, so AskAtlas cannot
              read this hub's data for this role either. Switch role in the top bar to compare.
            </p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />

      <div className="shared-hub-actions">
        <p>Review the workspace and investigate with AskAtlas alongside it.</p>
        <button
          type="button"
          className="button-secondary"
          onClick={() => (atlasOpen ? closeAtlas() : openAtlas())}
          aria-expanded={atlasOpen}
        >
          <MessageSquareText size={17} aria-hidden="true" />
          {atlasOpen ? 'Close AskAtlas' : 'Open AskAtlas'}
        </button>
      </div>

      <div className="preview-hub-content">
        <div className="preview-scope-notice">
          Synthetic data · Shared dataset across all hubs · Viewing as {role().name}
        </div>

        <section className="preview-metric-grid" aria-label={`${title} metrics`}>
          {metrics.map((metric) => (
            <article className="preview-metric-card" key={metric.label}>
              <h2>{metric.label}</h2>
              <strong>{metric.value}</strong>
              <p>{metric.note}</p>
            </article>
          ))}
        </section>

        {children}

        <RecommendationsPanel hub={hub} onInvestigate={(id) => openAtlas(id)} />

        <section className="hub-question-callout">
          <MessageSquareText size={23} aria-hidden="true" />
          <div>
            <h2>A question for AskAtlas</h2>
            <p>{question}</p>
            <button type="button" className="button-secondary" onClick={() => openAtlas(`q:${question}`)}>
              Ask AskAtlas
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

interface BarsProps {
  data: Record<string, string | number>[];
  category: string;
  series: { key: string; name: string; color: string; stack?: string }[];
  horizontal?: boolean;
  height?: number;
}

export function Bars({ data, category, series, horizontal = false, height = 280 }: BarsProps) {
  const tick = { fill: '#64748B', fontSize: 12 };
  const number = (value: number) => value.toLocaleString('en-SG');
  return (
    <div style={{ width: '100%', height }} role="img" aria-label={`Chart of ${series.map((s) => s.name).join(', ')}`}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 12, right: 20, left: 0, bottom: 4 }}>
          <CartesianGrid vertical={horizontal} horizontal={!horizontal} stroke="#E2E8F0" strokeDasharray="3 3" />
          {horizontal ? (
            <>
              <XAxis type="number" axisLine={false} tickLine={false} tick={tick} tickFormatter={number} />
              <YAxis type="category" dataKey={category} width={190} axisLine={false} tickLine={false} tick={tick} />
            </>
          ) : (
            <>
              <XAxis dataKey={category} axisLine={false} tickLine={false} tick={tick} />
              <YAxis width={55} axisLine={false} tickLine={false} tick={tick} tickFormatter={number} />
            </>
          )}
          <Tooltip
            formatter={(value) => Number(value).toLocaleString('en-SG')}
            contentStyle={{ border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13 }}
          />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} stackId={s.stack} maxBarSize={44} isAnimationActive={false} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Delta({ value, unit = '', invert = false }: { value: number; unit?: string; invert?: boolean }) {
  const good = invert ? value < 0 : value > 0;
  const tone = value === 0 ? 'flat' : good ? 'up' : 'down';
  return (
    <span className={`delta delta--${tone}`}>
      {value > 0 ? '+' : ''}
      {value}
      {unit}
    </span>
  );
}

export function DataTable({ caption, head, rows, numeric = [] }: { caption: string; head: string[]; rows: ReactNode[][]; numeric?: number[] }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th scope="col" key={h} className={numeric.includes(i) ? 'numeric-cell' : undefined}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) =>
                i === 0 ? (
                  <th scope="row" key={i}>{cell}</th>
                ) : (
                  <td key={i} className={numeric.includes(i) ? 'numeric-cell' : undefined}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
