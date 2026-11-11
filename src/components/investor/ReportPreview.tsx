import { FileText, X } from 'lucide-react';
import {
  investorReportDefinition,
  portfolioImpactData,
} from '../../data/reports';
import type {
  ReportApprovalState,
  ReportFormat,
} from '../../data/reports';
import { illustrativeValuationRecord } from '../../data/investorData';
import Badge from '../common/Badge';

interface ReportPreviewProps {
  format: ReportFormat;
  approvalState: ReportApprovalState;
  commentary: string;
  confirmedNpi: number;
  generatedAt: string;
  onClose: () => void;
}

function money(value: number): string {
  return `SGD ${value.toLocaleString('en-SG', {
    maximumFractionDigits: 2,
  })}`;
}

function ReportPreview({
  format,
  approvalState,
  commentary,
  confirmedNpi,
  generatedAt,
  onClose,
}: ReportPreviewProps) {
  const record = illustrativeValuationRecord;

  return (
    <section className="report-preview" aria-label={`${format} report preview`}>
      <header className="evidence-header">
        <div>
          <p className="section-eyebrow">
            {format} · Prototype output generated
          </p>
          <h3>{investorReportDefinition.title}</h3>
          <p>
            Shared content preview, not a native {format} file. No download has
            been created.
          </p>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close report preview"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="report-paper">
        <div className="report-paper-heading">
          <div>
            <span className="section-eyebrow">Finance Atlas</span>
            <h3>Investor Valuation Review</h3>
            <p>{investorReportDefinition.period} · Illustrative prototype data</p>
          </div>
          <Badge>{approvalState}</Badge>
        </div>

        <dl className="report-metadata">
          <div>
            <dt>Scope</dt>
            <dd>{investorReportDefinition.scope}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>{investorReportDefinition.owner}</dd>
          </div>
          <div>
            <dt>Generated</dt>
            <dd>{new Date(generatedAt).toLocaleString('en-SG')}</dd>
          </div>
        </dl>

        <h4>Valuation record</h4>
        <div className="table-scroll">
          <table className="data-table report-value-table">
            <caption className="sr-only">
              Illustrative valuation report values
            </caption>
            <thead>
              <tr>
                <th scope="col">Attribute</th>
                <th scope="col">Report value</th>
                <th scope="col">Evidence / review status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Property</th>
                <td>{record.property}</td>
                <td>Predefined sample record</td>
              </tr>
              <tr>
                <th scope="row">Valuation</th>
                <td>{money(record.valuation)}</td>
                <td>[1] Extracted fixture; not independently validated</td>
              </tr>
              <tr>
                <th scope="row">Net Property Income</th>
                <td>{money(confirmedNpi)}</td>
                <td>[2] Validated by Finance in the demo</td>
              </tr>
              <tr>
                <th scope="row">Current portfolio scenario</th>
                <td>{money(portfolioImpactData.currentValue)}</td>
                <td>[3] Deterministic record-addition scenario</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4>Management commentary</h4>
        <p className="report-commentary">{commentary}</p>

        <div className="report-npi-note">
          Finance-confirmed Net Property Income: <strong>{money(confirmedNpi)}</strong>.
          {confirmedNpi !== 21100000 && (
            <span>
              {' '}This differs from the predefined extracted value of SGD
              21,100,000; the confirmation is recorded in the action trail.
            </span>
          )}
        </div>

        <h4>Source references</h4>
        <ol className="report-source-list">
          {investorReportDefinition.sourceReferences.map((source) => (
            <li key={source.number}>
              <strong>
                [{source.number}] {source.title} · synthetic page {source.page}
              </strong>
              <p>{source.excerpt}</p>
            </li>
          ))}
        </ol>

        <div className="report-publication-note">
          <FileText size={18} aria-hidden="true" />
          <p>
            {approvalState === 'Approved for publication'
              ? 'Approved for publication in this demonstration only. Nothing has been published or distributed.'
              : 'Draft demonstration content. Not approved for publication.'}
            {' '}Source excerpts, approval controls and user identity are
            illustrative.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ReportPreview;