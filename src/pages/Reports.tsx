import { useRef, useState } from 'react';
import { FileText, Printer, X } from 'lucide-react';
import Badge from '../components/common/Badge';
import PageHeader from '../components/layout/PageHeader';
import GroupReportPdf from '../components/reports/GroupReportPdf';
import { libraryReports } from '../data/previewData';

function Reports() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [pdfOpen, setPdfOpen] = useState(false);

  const previewRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const selectedReport = libraryReports.find(
    (report) => report.id === selectedReportId,
  );

  function closePreview() {
    setSelectedReportId(null);
    triggerRef.current?.focus();
  }

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="From governed information to Finance-reviewed reporting."
      />

      <div className="preview-scope-notice">
        The Group Management Pack includes a printable three-page report
        that can be saved as PDF. Other formats remain browser previews.
        Library statuses are fixed mock records, not synchronised with
        Investor Hub. No report is automatically published.
      </div>

      <div className="report-library-grid">
        {libraryReports.map((report) => (
          <article className="library-report-card" key={report.id}>
            <div className="library-report-heading">
              <FileText size={22} aria-hidden="true" />
              <Badge
                tone={
                  report.status === 'Under Finance Review'
                    ? 'review'
                    : 'neutral'
                }
              >
                {report.status}
              </Badge>
            </div>

            <h2>{report.title}</h2>
            <p>{report.scope}</p>

            <dl className="library-report-metadata">
              <div>
                <dt>Reporting period</dt>
                <dd>{report.period}</dd>
              </div>
              <div>
                <dt>Owner</dt>
                <dd>{report.owner}</dd>
              </div>
              <div>
                <dt>Last generated</dt>
                <dd>{report.lastGenerated}</dd>
              </div>
            </dl>

            {report.id === 'group-pack' && (
              <p>
                Three-page illustrative PDF report with KPIs, revenue trend,
                business-unit performance and evidence notes.
              </p>
            )}

            <div
              className="library-format-buttons"
              aria-label={`${report.title} outputs`}
            >
              {report.formats.map((format) => {
                const printablePdf =
                  report.id === 'group-pack' && format === 'PDF';

                return (
                  <button
                    key={format}
                    type="button"
                    className={
                      printablePdf ? 'button-primary' : 'button-secondary'
                    }
                    onClick={() => {
                      if (printablePdf) {
                        setPdfOpen(true);
                        return;
                      }

                      triggerRef.current =
                        document.activeElement instanceof HTMLElement
                          ? document.activeElement
                          : null;

                      setSelectedReportId(report.id);
                      setSelectedFormat(format);

                      window.requestAnimationFrame(() => {
                        previewRef.current?.focus();
                        previewRef.current?.scrollIntoView({
                          block: 'nearest',
                        });
                      });
                    }}
                  >
                    {printablePdf && (
                      <Printer size={15} aria-hidden="true" />
                    )}
                    {printablePdf ? 'Open PDF report' : format}
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      {selectedReport && (
        <section
          ref={previewRef}
          tabIndex={-1}
          className="library-preview"
          aria-label="Illustrative library report preview"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              closePreview();
            }
          }}
        >
          <header className="evidence-header">
            <div>
              <p className="section-eyebrow">
                {selectedFormat} · Prototype output preview
              </p>
              <h3>{selectedReport.title}</h3>
            </div>

            <button
              type="button"
              className="icon-button"
              onClick={closePreview}
              aria-label="Close report library preview"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <Badge>{selectedReport.status} · Mock library status</Badge>
          <p>{selectedReport.summary}</p>
          <p className="preview-panel-note">
            This is a shared browser summary, not a native {selectedFormat}
            {' '}document. No authenticated approval or publication has occurred.
          </p>
        </section>
      )}

      <section className="accountability-note">
        <strong>
          Automation of analysis, without automation of accountability.
        </strong>
        <p>
          Saving a PDF does not approve its contents. Finance remains
          accountable for source validation, commentary and publication.
        </p>
      </section>

      {pdfOpen && (
        <GroupReportPdf onClose={() => setPdfOpen(false)} />
      )}
    </>
  );
}

export default Reports;