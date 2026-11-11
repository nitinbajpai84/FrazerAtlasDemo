import type { ReactNode } from 'react';
import { MessageSquareText } from 'lucide-react';
import type { PreviewHubData } from '../../data/previewData';
import { useAtlasWorkspace } from '../../context/AtlasWorkspaceContext';
import Badge from '../common/Badge';
import Panel from '../common/Panel';
import PageHeader from './PageHeader';

interface PreviewHubProps {
  data: PreviewHubData;
  children?: ReactNode;
}

function PreviewHub({ data, children }: PreviewHubProps) {
  const { openAtlas, closeAtlas, atlasOpen } = useAtlasWorkspace();

  return (
    <>
      <PageHeader title={data.title} subtitle={data.subtitle} />

      <div className="shared-hub-actions">
        <p>
          Review the workspace and investigate with AskAtlas alongside it.
        </p>

        <button
          type="button"
          className="button-secondary"
          onClick={() => {
            if (atlasOpen) {
              closeAtlas();
            } else {
              openAtlas();
            }
          }}
          aria-expanded={atlasOpen}
          aria-controls={atlasOpen ? 'executive-atlas-dock' : undefined}
        >
          <MessageSquareText size={17} aria-hidden="true" />
          {atlasOpen ? 'Close AskAtlas' : 'Open AskAtlas'}
        </button>
      </div>

      <div className="preview-hub-content">
        <div className="preview-scope-notice">
          Simplified hub preview · All figures illustrative · Workspace
          selectors do not filter or convert these fixtures.
        </div>

        <section
          className="preview-metric-grid"
          aria-label="Illustrative hub metrics"
        >
          {data.metrics.map((metric) => (
            <article className="preview-metric-card" key={metric.label}>
              <h2>{metric.label}</h2>
              <strong>{metric.value}</strong>
              <p>{metric.note}</p>
            </article>
          ))}
        </section>

        {children}

        <Panel
          title={data.tableTitle}
          subtitle="Fixed illustrative exceptions, not live alerts"
        >
          <div className="table-scroll">
            <table className="data-table preview-watchlist">
              <caption className="sr-only">
                {data.tableTitle} · Illustrative
              </caption>

              <thead>
                <tr>
                  {data.columns.map((column) => (
                    <th scope="col" key={column}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.name}>
                    <th scope="row">{row.name}</th>
                    <td>{row.measure}</td>
                    <td>{row.detail}</td>
                    <td>
                      <Badge
                        tone={
                          row.status === 'Review required'
                            ? 'review'
                            : 'neutral'
                        }
                      >
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <section className="hub-question-callout">
          <MessageSquareText size={23} aria-hidden="true" />

          <div>
            <h2>A question for AskAtlas</h2>
            <p>{data.question}</p>

            <button
              type="button"
              className="button-secondary"
              onClick={() => openAtlas(data.responseId)}
            >
              Explore predefined analysis
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

export default PreviewHub;