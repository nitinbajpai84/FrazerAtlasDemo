import { useEffect, useId, useRef, useState } from 'react';
import { Check, FileText, LoaderCircle, ShieldCheck } from 'lucide-react';
import {
  investorReportDefinition,
  reportApprovalStates,
  reportFormats,
  reportGenerationStages,
} from '../../data/reports';
import type {
  ReportApprovalState,
  ReportFormat,
} from '../../data/reports';
import Badge from '../common/Badge';
import Panel from '../common/Panel';
import ProgressBar from '../common/ProgressBar';
import ReportPreview from './ReportPreview';

interface InvestorReportingProps {
  confirmedNpi: number;
  onAudit: (action: string, detail: string) => void;
}

function InvestorReporting({
  confirmedNpi,
  onAudit,
}: InvestorReportingProps) {
  const instanceId = useId();
  const [generationState, setGenerationState] =
    useState<'idle' | 'generating' | 'ready'>('idle');
  const [completedStages, setCompletedStages] = useState(0);
  const [approvalState, setApprovalState] =
    useState<ReportApprovalState>('Draft generated');
  const [commentary, setCommentary] = useState(
    investorReportDefinition.initialCommentary,
  );
  const [editedCommentary, setEditedCommentary] = useState(
    investorReportDefinition.initialCommentary,
  );
  const [commentaryError, setCommentaryError] = useState('');
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [previewFormat, setPreviewFormat] = useState<ReportFormat | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const previewTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (generationState !== 'generating') {
      return;
    }

    const timer = window.setTimeout(() => {
      const nextStage = completedStages + 1;
      setCompletedStages(nextStage);

      if (nextStage >= reportGenerationStages.length) {
        setGenerationState('ready');
        setGeneratedAt(new Date().toISOString());
        onAudit(
          'Draft report generated',
          'Illustrative Investor Valuation Review prepared for Finance review. No Office file or PDF created.',
        );
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [generationState, completedStages, onAudit]);

  function closePreview() {
    setPreviewFormat(null);
    previewTriggerRef.current?.focus();
  }

  const currentApprovalIndex = reportApprovalStates.indexOf(approvalState);

  return (
    <Panel
      title="Management reporting"
      subtitle="Simulated generation with explicit Finance review controls"
    >
      <div className="investor-reporting">
        <p className="report-trust-statement">
          AI drafts. Finance reviews. Approved content is published.
        </p>
        <p className="investor-small-note">
          In this prototype, drafting is predefined and publication is not
          connected. Workflow labels demonstrate the proposed experience only.
        </p>

        {generationState === 'idle' && (
          <div className="report-generation-start">
            <div>
              <h3>Prepare the Investor Valuation Review</h3>
              <p>
                Use the illustrative valuation record, Finance-confirmed Net
                Property Income and fixed portfolio scenario.
              </p>
            </div>
            <button
              type="button"
              className="button-primary"
              onClick={() => {
                setCompletedStages(0);
                setGenerationState('generating');
                onAudit(
                  'Report generation started',
                  'Timed mock generation selected after Net Property Income validation.',
                );
              }}
            >
              <FileText size={16} aria-hidden="true" />
              Generate report
            </button>
          </div>
        )}

        {generationState === 'generating' && (
          <section className="report-generation-progress" aria-label="Report preparation">
            <ProgressBar
              value={
                (completedStages / reportGenerationStages.length) * 100
              }
              label="Illustrative report generation progress"
            />

            <p role="status" aria-live="polite">
              {reportGenerationStages[completedStages] ??
                'Ready for Finance review'}
            </p>

            <ol className="extraction-stage-list">
              {reportGenerationStages.map((stage, index) => {
                const done = index < completedStages;
                const active = index === completedStages;

                return (
                  <li
                    key={stage}
                    className={active ? 'extraction-stage--active' : ''}
                    aria-current={active ? 'step' : undefined}
                  >
                    {done ? (
                      <Check size={17} aria-hidden="true" />
                    ) : (
                      <LoaderCircle
                        size={17}
                        className={active ? 'processing-spinner' : ''}
                        aria-hidden="true"
                      />
                    )}
                    <span>{stage}</span>
                    <small>
                      {done ? 'Complete' : active ? 'In progress' : 'Waiting'}
                    </small>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {generationState === 'ready' && generatedAt && (
          <>
            <div className="report-ready-heading" role="status">
              <div>
                <h3>Prototype report prepared</h3>
                <p>
                  Generated {new Date(generatedAt).toLocaleString('en-SG')}
                </p>
              </div>
              <Badge>{approvalState}</Badge>
            </div>

            <ol className="approval-state-list" aria-label="Report review sequence">
              {reportApprovalStates.map((state, index) => (
                <li
                  key={state}
                  className={
                    index <= currentApprovalIndex ? 'approval-state--reached' : ''
                  }
                  aria-current={state === approvalState ? 'step' : undefined}
                >
                  <span>{index + 1}</span>
                  <div>
                    <strong>{state}</strong>
                    <small>
                      {state === approvalState
                        ? 'Current state'
                        : index < currentApprovalIndex
                          ? 'Completed'
                          : 'Not reached'}
                    </small>
                  </div>
                </li>
              ))}
            </ol>

            <div className="report-output-grid" aria-label="Illustrative report outputs">
              {reportFormats.map((format) => (
                <button
                  key={format}
                  type="button"
                  className="report-output-card"
                  onClick={() => {
                    previewTriggerRef.current =
                      document.activeElement instanceof HTMLElement
                        ? document.activeElement
                        : null;
                    setPreviewFormat(format);
                    onAudit(
                      'Report preview opened',
                      `${format} prototype content preview. No native output file generated.`,
                    );

                    window.requestAnimationFrame(() => {
                      previewRef.current?.focus();
                      previewRef.current?.scrollIntoView({ block: 'nearest' });
                    });
                  }}
                >
                  <FileText size={21} aria-hidden="true" />
                  <strong>{format}</strong>
                  <span>Open prototype preview</span>
                </button>
              ))}
            </div>

            <section className="report-review-controls" aria-label="Finance approval controls">
              {approvalState === 'Draft generated' && (
                <>
                  <h3>Draft awaits Finance review</h3>
                  <p>
                    Open an output preview, then explicitly move the draft into
                    Finance review. Nothing is approved automatically.
                  </p>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => {
                      setApprovalState('Finance review');
                      onAudit(
                        'Report moved to Finance review',
                        'Investor Finance (demo user) started the illustrative report review.',
                      );
                    }}
                  >
                    Move to Finance Review
                  </button>
                </>
              )}

              {approvalState === 'Finance review' && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const nextCommentary = editedCommentary.trim();

                    if (nextCommentary.length < 30) {
                      setCommentaryError(
                        'Enter at least 30 characters of reviewed commentary.',
                      );
                      return;
                    }

                    setCommentary(nextCommentary);
                    setCommentaryError('');
                    setApprovalState('Commentary updated');
                    onAudit(
                      'Report commentary updated',
                      `Finance saved reviewed commentary (${nextCommentary.length} characters). This does not validate every source field.`,
                    );
                  }}
                >
                  <h3>Review management commentary</h3>
                  <label htmlFor={`${instanceId}-commentary`}>
                    Finance-reviewed commentary
                  </label>
                  <textarea
                    id={`${instanceId}-commentary`}
                    rows={7}
                    value={editedCommentary}
                    onChange={(event) => {
                      setEditedCommentary(event.target.value);
                      setCommentaryError('');
                    }}
                    aria-invalid={commentaryError ? true : undefined}
                    aria-describedby={
                      commentaryError ? `${instanceId}-error` : undefined
                    }
                  />
                  {commentaryError && (
                    <p
                      id={`${instanceId}-error`}
                      className="validation-error"
                      role="alert"
                    >
                      {commentaryError}
                    </p>
                  )}
                  <p>
                    Review the record-addition treatment and any difference
                    between extracted and confirmed Net Property Income.
                    Commentary may be amended or explicitly retained.
                  </p>
                  <button type="submit" className="button-secondary">
                    Save reviewed commentary
                  </button>
                </form>
              )}

              {approvalState === 'Commentary updated' && (
                <>
                  <h3>Commentary saved for approval</h3>
                  <p>
                    Review the updated preview before approving. This control
                    records a demonstration report decision; it does not
                    independently validate every valuation field.
                  </p>
                  <button
                    type="button"
                    className="button-primary"
                    onClick={() => {
                      setApprovalState('Approved for publication');
                      onAudit(
                        'Report approved for publication',
                        'Explicit demonstration approval by Investor Finance (demo user). No publication, distribution or external workflow was triggered.',
                      );
                    }}
                  >
                    <ShieldCheck size={17} aria-hidden="true" />
                    Approve for publication
                  </button>
                </>
              )}

              {approvalState === 'Approved for publication' && (
                <div className="report-approved-notice" role="status">
                  <ShieldCheck size={23} aria-hidden="true" />
                  <div>
                    <h3>Approved for publication</h3>
                    <p>
                      Demonstration approval recorded. No report has been
                      published or distributed. Outputs remain browser previews.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {previewFormat && (
              <div
                ref={previewRef}
                tabIndex={-1}
                className="report-preview-anchor"
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.stopPropagation();
                    closePreview();
                  }
                }}
              >
                <ReportPreview
                  format={previewFormat}
                  approvalState={approvalState}
                  commentary={commentary}
                  confirmedNpi={confirmedNpi}
                  generatedAt={generatedAt}
                  onClose={closePreview}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Panel>
  );
}

export default InvestorReporting;