import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X } from 'lucide-react';
import {
  businessUnits,
  executiveKpis,
  performanceMetrics,
} from '../../data/executiveData';
import { groupReportData } from '../../data/groupReportData';
import '../../styles/pdfReport.css';

interface GroupReportPdfProps {
  onClose: () => void;
}

function ReportFooter({ page }: { page: number }) {
  return (
    <footer className="pdf-page-footer">
      <span>Atlas · Illustrative prototype data</span>
      <span>{groupReportData.reference} · {page} / 3</span>
    </footer>
  );
}

function ReportHeading({
  section,
  title,
}: {
  section: string;
  title: string;
}) {
  return (
    <header className="pdf-section-heading">
      <span className="pdf-eyebrow">{section}</span>
      <h2>{title}</h2>
      <p>{groupReportData.period} · Illustrative draft</p>
    </header>
  );
}

function GroupReportPdf({ onClose }: GroupReportPdfProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousTitle = useRef(document.title);
  const [generatedAt] = useState(() =>
    new Date().toLocaleString('en-SG'),
  );

  const revenue = performanceMetrics.find(
    (metric) => metric.id === 'revenue',
  )!;

  const maximumRevenue = Math.max(
    ...revenue.data.flatMap((point) => [
      point.actual,
      point.priorYear,
    ]),
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    previousTitle.current = document.title;
    document.title = 'Atlas-Group-Management-Pack-FY2026-Illustrative';
    document.body.style.overflow = 'hidden';

    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    return () => {
      document.title = previousTitle.current;
      document.body.style.overflow = previousOverflow;

      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

  return createPortal(
    <div id="atlas-pdf-root">
      <dialog
        ref={dialogRef}
        className="pdf-report-dialog"
        aria-labelledby="pdf-preview-title"
        onCancel={(event) => {
          event.preventDefault();
          onClose();
        }}
      >
        <header className="pdf-preview-toolbar">
          <div>
            <h2 id="pdf-preview-title">Group Management Pack</h2>
            <p>Three-page report · Print or save as PDF</p>
          </div>

          <div className="pdf-preview-actions">
            <button
              type="button"
              className="button-primary"
              onClick={() => window.print()}
            >
              <Printer size={17} aria-hidden="true" />
              Print / Save PDF
            </button>

            <button
              type="button"
              className="icon-button"
              onClick={onClose}
              aria-label="Close Group Management Pack preview"
            >
              <X size={21} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="pdf-export-instructions">
          Choose <strong>Save as PDF</strong> in the browser print dialog.
          Use A4, portrait, 100% scale and turn off browser headers and footers.
        </div>

        <div className="pdf-document">
          <section className="pdf-page">
            <header className="pdf-cover-heading">
              <div className="pdf-brand">Atlas</div>
              <span className="pdf-eyebrow">Finance intelligence / Group reporting</span>
              <h1>{groupReportData.title}</h1>
              <p className="pdf-cover-subtitle">{groupReportData.subtitle}</p>

              <div className="pdf-report-period">
                <strong>{groupReportData.period}</strong>
                <span>Illustrative prototype data</span>
              </div>
            </header>

            <dl className="pdf-metadata">
              <div>
                <dt>Prepared for</dt>
                <dd>Finance Atlas proposal demonstration</dd>
              </div>
              <div>
                <dt>Accountable owner</dt>
                <dd>{groupReportData.owner}</dd>
              </div>
              <div>
                <dt>Generated locally</dt>
                <dd>{generatedAt}</dd>
              </div>
              <div>
                <dt>Edition</dt>
                <dd>{groupReportData.version}</dd>
              </div>
            </dl>

            <div className="pdf-status-notice">{groupReportData.status}</div>

            <h2 className="pdf-content-title">Executive summary</h2>
            <p>{groupReportData.executiveSummary}</p>

            <div className="pdf-kpi-grid">
              {executiveKpis.map((kpi) => (
                <article key={kpi.id}>
                  <h3>{kpi.label}</h3>
                  <strong>{kpi.value}</strong>
                  <p>{kpi.change}</p>
                </article>
              ))}
            </div>

            <div className="pdf-callout">
              <strong>What requires attention?</strong>
              <p>
                Reconcile performance drivers, challenge development
                cost-to-complete and validate funding sensitivities before
                approving management commentary.
              </p>
            </div>

            <p className="pdf-small-text">
              Source [1]. KPI values are illustrative. No actual Frasers Property
              financial data is used.
            </p>

            <ReportFooter page={1} />
          </section>

          <section className="pdf-page">
            <ReportHeading
              section="01 / Financial performance"
              title="Performance and selected business drivers"
            />

            <div className="pdf-chart-heading">
              <h3>Revenue trend</h3>
              <span>SGD million · Illustrative</span>
            </div>

            <div className="pdf-chart-legend">
              <span><i className="pdf-legend-prior" />Prior year</span>
              <span><i className="pdf-legend-actual" />Actual</span>
            </div>

            <div
              className="pdf-revenue-chart"
              role="img"
              aria-label="Illustrative revenue actual versus prior year from FY2022 to FY2026. Exact values are printed below each bar group."
            >
              {revenue.data.map((point) => (
                <div className="pdf-chart-column" key={point.year}>
                  <div className="pdf-chart-bars">
                    <span
                      className="pdf-chart-bar pdf-chart-bar--prior"
                      style={{
                        height: `${(point.priorYear / maximumRevenue) * 100}%`,
                      }}
                    />
                    <span
                      className="pdf-chart-bar pdf-chart-bar--actual"
                      style={{
                        height: `${(point.actual / maximumRevenue) * 100}%`,
                      }}
                    />
                  </div>
                  <strong>{point.year}</strong>
                  <small>
                    {point.priorYear.toLocaleString('en-SG')} /{' '}
                    {point.actual.toLocaleString('en-SG')}
                  </small>
                </div>
              ))}
            </div>

            <h3 className="pdf-content-title">Performance by business unit</h3>
            <p className="pdf-small-text">
              FY2026 · SGD million · Independent illustrative schedule [1]
            </p>

            <table className="pdf-table">
              <thead>
                <tr>
                  <th scope="col">Business unit</th>
                  <th scope="col">Revenue</th>
                  <th scope="col">Operating profit</th>
                  <th scope="col">YoY</th>
                </tr>
              </thead>
              <tbody>
                {businessUnits.map((unit) => (
                  <tr key={unit.id}>
                    <th scope="row">{unit.name}</th>
                    <td>{unit.revenue.toLocaleString('en-SG')}</td>
                    <td>{unit.operatingProfit.toLocaleString('en-SG')}</td>
                    <td>{unit.yearOnYear}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 className="pdf-content-title">Management commentary</h3>
            <div className="pdf-commentary-list">
              {groupReportData.commentary.map((item) => (
                <article key={item.title}>
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>

            <ReportFooter page={2} />
          </section>

          <section className="pdf-page">
            <ReportHeading
              section="02 / Governance and action"
              title="Priorities, evidence and accountability"
            />

            <div className="pdf-action-list">
              {groupReportData.actions.map((action) => (
                <article key={action.priority}>
                  <span>{action.priority}</span>
                  <div>
                    <h3>{action.title}</h3>
                    <p>{action.action}</p>
                    <strong>Accountable role: {action.owner}</strong>
                  </div>
                </article>
              ))}
            </div>

            <h3 className="pdf-content-title">Source references</h3>
            <ol className="pdf-source-list">
              {groupReportData.sources.map((source) => (
                <li key={source.number}>
                  <strong>[{source.number}] {source.title}</strong>
                  <span>{source.location}</span>
                  <p>{source.description}</p>
                </li>
              ))}
            </ol>

            <h3 className="pdf-content-title">Assumptions and limitations</h3>
            <ul className="pdf-limitation-list">
              {groupReportData.limitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>

            <div className="pdf-callout">
              <strong>
                Automation of analysis, without automation of accountability.
              </strong>
              <p>
                Finance reviews source evidence, challenges assumptions and owns
                reporting approval. This report remains an illustrative draft.
              </p>
            </div>

            <ReportFooter page={3} />
          </section>
        </div>
      </dialog>
    </div>,
    document.body,
  );
}

export default GroupReportPdf;