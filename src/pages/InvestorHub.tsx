import { useCallback, useEffect, useRef, useState } from 'react';
import { useEngine } from '../engine/store';
import { CheckCircle2, ClipboardList, RotateCcw } from 'lucide-react';
import PortfolioChart from '../components/charts/PortfolioChart';
import Panel from '../components/common/Panel';
import PageHeader from '../components/layout/PageHeader';
import DocumentUpload from '../components/investor/DocumentUpload';
import ExtractionProgress from '../components/investor/ExtractionProgress';
import InvestorReporting from '../components/investor/InvestorReporting';
import ValidationPanel from '../components/investor/ValidationPanel';
import ValuationRecord from '../components/investor/ValuationRecord';
import {
  extractionStageDuration,
  extractionStages,
  illustrativeValuationRecord,
  sampleValuationFilename,
} from '../data/investorData';
import { portfolioImpactData } from '../data/reports';
import type { AuditEvent, ValuationField } from '../types/investor';

type WorkflowStatus = 'idle' | 'processing' | 'ready';

function InvestorHub() {
  const { validateValuation } = useEngine();
  const [workflowStatus, setWorkflowStatus] =
    useState<WorkflowStatus>('idle');
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null);
  const [completedStages, setCompletedStages] = useState(0);
  const [selectedField, setSelectedField] = useState<ValuationField | null>(null);
  const [confirmedNpi, setConfirmedNpi] = useState<number | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  const validationRef = useRef<HTMLDivElement>(null);
  const fieldTriggerRef = useRef<HTMLElement | null>(null);
  const workflowRef = useRef<HTMLDivElement>(null);
  const auditSequence = useRef(0);

  const npiValidated = confirmedNpi !== null;
  const contribution =
    (portfolioImpactData.recordAddition / portfolioImpactData.currentValue) *
    100;

  const addAuditEvent = useCallback((action: string, detail: string) => {
    auditSequence.current += 1;

    const event: AuditEvent = {
      id: `investor-audit-${auditSequence.current}`,
      timestamp: new Date().toISOString(),
      actor: 'Investor Finance (demo user)',
      action,
      detail,
    };

    setAuditEvents((events) => [...events, event]);
  }, []);

  useEffect(() => {
    if (workflowStatus !== 'processing') {
      return;
    }

    const timer = window.setTimeout(() => {
      const nextStage = completedStages + 1;
      setCompletedStages(nextStage);

      if (nextStage >= extractionStages.length) {
        setWorkflowStatus('ready');
      }
    }, extractionStageDuration);

    return () => window.clearTimeout(timer);
  }, [workflowStatus, completedStages]);

  function resetWorkflow() {
    setWorkflowStatus('idle');
    setSelectedFilename(null);
    setCompletedStages(0);
    setSelectedField(null);
    setConfirmedNpi(null);
    setAuditEvents([]);
    auditSequence.current = 0;
    workflowRef.current?.focus();
  }

  function useSample() {
    setSelectedField(null);
    setConfirmedNpi(null);
    setCompletedStages(0);
    setWorkflowStatus('processing');

    addAuditEvent(
      'Sample simulation started',
      `${sampleValuationFilename}: predefined Riverside scenario selected. No file bytes read or transferred.`,
    );
  }

  function selectField(field: ValuationField) {
    fieldTriggerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    setSelectedField(field);

    window.requestAnimationFrame(() => {
      validationRef.current?.focus();
      validationRef.current?.scrollIntoView({ block: 'nearest' });
    });
  }

  function closeField() {
    setSelectedField(null);
    fieldTriggerRef.current?.focus();
  }

  return (
    <>
      <PageHeader
        title="Investor Hub"
        subtitle="From valuation documents to governed portfolio intelligence."
      />

      <div className="investor-toolbar">
        <p>
          <span className="investor-step-label">01</span> Select sample
          <span aria-hidden="true"> → </span>
          <span className="investor-step-label">02</span> Validate
          <span aria-hidden="true"> → </span>
          <span className="investor-step-label">03</span> Review impact
          <span aria-hidden="true"> → </span>
          <span className="investor-step-label">04</span> Review report
        </p>

        <button
          type="button"
          className="button-secondary"
          onClick={resetWorkflow}
        >
          <RotateCcw size={16} aria-hidden="true" />
          Reset workflow
        </button>
      </div>

      <div className="investor-workspace">
        <div
          ref={workflowRef}
          tabIndex={-1}
          className="investor-workflow-anchor"
          aria-label="Investor document workflow"
        >
          <Panel
            title="Valuation document intake"
            subtitle="Illustrative document-to-record workflow"
          >
            {workflowStatus === 'idle' ? (
              <DocumentUpload
                selectedFilename={selectedFilename}
                onSelectFilename={(filename) => {
                  setSelectedFilename(filename);
                  addAuditEvent(
                    'Local filename recorded',
                    `${filename}. File contents were not read or uploaded.`,
                  );
                }}
                onUseSample={useSample}
              />
            ) : (
              <>
                <div className="processing-document-name">
                  <ClipboardList size={18} aria-hidden="true" />
                  <span>{sampleValuationFilename}</span>
                  <strong>Predefined sample scenario</strong>
                </div>

                <ExtractionProgress
                  completedStages={completedStages}
                  complete={workflowStatus === 'ready'}
                />
              </>
            )}
          </Panel>
        </div>

        {workflowStatus === 'ready' && (
          <>
            <ValuationRecord
              record={illustrativeValuationRecord}
              npiValidated={npiValidated}
              confirmedNpi={confirmedNpi}
              onSelectField={selectField}
            />

            {selectedField && (
              <div
                ref={validationRef}
                className="investor-validation-anchor"
                tabIndex={-1}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.stopPropagation();
                    closeField();
                  }
                }}
              >
                <ValidationPanel
                  key={selectedField.id}
                  field={selectedField}
                  validated={selectedField.id === 'npi' && npiValidated}
                  confirmedNpi={confirmedNpi}
                  onClose={closeField}
                  onConfirm={(value) => {
                    if (confirmedNpi !== null) {
                      return;
                    }

                    setConfirmedNpi(value);
                    // Publish the validated record to the shared dataset: other hubs,
                    // Atlas Recommends and AskAtlas now see Riverside Commercial Tower.
                    validateValuation();
                    addAuditEvent(
                      'Net Property Income validated',
                      `Extracted: SGD 21,100,000. Confirmed: SGD ${value.toLocaleString(
                        'en-SG',
                        { maximumFractionDigits: 2 },
                      )}. Synthetic source page 12 reviewed.`,
                    );
                  }}
                />
              </div>
            )}

            {confirmedNpi !== null ? (
              <>
                <section className="investor-validation-success" role="status">
                  <CheckCircle2 size={23} aria-hidden="true" />
                  <div>
                    <h2>Required field validated by Finance</h2>
                    <p>
                      The low-confidence Net Property Income field is confirmed.
                      The illustrative portfolio scenario and report controls
                      are now available. Other extracted fields remain subject
                      to Finance review.
                    </p>
                  </div>
                </section>

                <Panel
                  title="Portfolio impact"
                  subtitle="Illustrative record-addition scenario · Released after required field validation"
                >
                  <div className="portfolio-impact-content">
                    <div className="portfolio-impact-metrics">
                      <article>
                        <span>Prior portfolio value</span>
                        <strong>SGD 12.315B</strong>
                        <small>Illustrative starting total</small>
                      </article>
                      <article>
                        <span>Current illustrative portfolio value</span>
                        <strong>SGD 12.800B</strong>
                        <small>Fixed scenario total</small>
                      </article>
                      <article>
                        <span>Valuation movement</span>
                        <strong>+SGD 485M</strong>
                        <small>Record addition, not an economic gain</small>
                      </article>
                      <article>
                        <span>Portfolio contribution</span>
                        <strong>{contribution.toFixed(2)}%</strong>
                        <small>485M ÷ 12,800M · illustrative</small>
                      </article>
                    </div>

                    <div className="portfolio-impact-context">
                      <strong>Relevant asset-class impact</strong>
                      <p>
                        {portfolioImpactData.assetClass}: +SGD 485M from the
                        Riverside record inclusion. No complete asset-class
                        balance or other movements are modelled.
                      </p>
                    </div>

                    <p className="chart-unit portfolio-chart-unit">
                      SGD million · Illustrative
                    </p>
                    <PortfolioChart />

                    <p className="investor-small-note">
                      The fixed valuation is not recalculated from confirmed
                      Net Property Income. Changes to that field flow into
                      the report, not into this portfolio scenario. Confirm
                      record inclusion and avoid double counting before
                      interpreting a portfolio movement.
                    </p>
                  </div>
                </Panel>

                <InvestorReporting
                  confirmedNpi={confirmedNpi}
                  onAudit={addAuditEvent}
                />
              </>
            ) : (
              <div className="investor-review-reminder">
                <strong>Finance review required</strong>
                <p>
                  Open Net Property Income, inspect its source evidence and
                  confirm or amend the extracted amount. Portfolio impact and
                  report generation remain unavailable until confirmation.
                </p>
              </div>
            )}
          </>
        )}

        <Panel
          title="Finance action trail"
          subtitle="In-memory demonstration log · Not a production audit service"
        >
          {auditEvents.length === 0 ? (
            <p className="investor-audit-empty">
              No actions yet. Select a local filename or start the sample
              workflow.
            </p>
          ) : (
            <ol className="investor-audit-list">
              {auditEvents.map((event) => (
                <li key={event.id}>
                  <div className="investor-audit-heading">
                    <strong>{event.action}</strong>
                    <time dateTime={event.timestamp}>
                      {new Date(event.timestamp).toLocaleTimeString('en-SG', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                      })}
                    </time>
                  </div>
                  <p>{event.detail}</p>
                  <span>{event.actor}</span>
                </li>
              ))}
            </ol>
          )}

          <p className="investor-audit-disclaimer">
            This log and the workflow state clear on reset, page reload or
            navigation away from Investor Hub. No user identity is authenticated.
          </p>
        </Panel>

        <section className="accountability-note">
          <strong>AI drafts. Finance reviews. Approved content is published.</strong>
          <p>
            This prototype uses predefined commentary and browser previews.
            No actual AI drafting, native report generation, publication or
            external workflow is connected.
          </p>
        </section>
      </div>
    </>
  );
}

export default InvestorHub;