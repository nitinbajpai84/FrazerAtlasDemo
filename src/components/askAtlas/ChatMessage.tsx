import { ShieldCheck } from 'lucide-react';
import type { AskAtlasResponse } from '../../types';
import type { AgentStep } from '../../engine/agent';
import Badge from '../common/Badge';
import SourceCitation from '../common/SourceCitation';
import { FollowUpQuestions } from './SuggestedQuestions';

interface ChatMessageProps {
  response: AskAtlasResponse;
  trace: AgentStep[];
  onViewSource: (number?: number) => void;
  onSelectQuestion: (id: string) => void;
  badge?: string;
  note?: string;
}

function ChatMessage({
  response,
  trace,
  onViewSource,
  onSelectQuestion,
  badge = 'Predefined response',
  note,
}: ChatMessageProps) {
  const toolSteps = trace.filter((step) => step.title.includes(' → '));
  const queryExamples: Record<string, string> = {
    get_metric: 'SELECT fiscal_year, SUM(metric_value)\nFROM curated.fin_performance\nWHERE metric_name = :approved_metric\nGROUP BY fiscal_year\nORDER BY fiscal_year;',
    explain_variance: 'SELECT business_unit, SUM(actual_fy2026 - actual_fy2025) AS variance\nFROM curated.fin_performance\nGROUP BY business_unit\nORDER BY ABS(variance) DESC;',
    get_assets: 'SELECT asset_name, occupancy_fy2025, occupancy_fy2026, noi_fy2025, noi_fy2026\nFROM curated.asset_operations\nWHERE business_unit IN (:role_allowed_units);',
    get_developments: 'SELECT project_name, cost_to_complete_plan, cost_to_complete_forecast,\n       sales_velocity_actual, sales_velocity_plan\nFROM curated.dev_projects\nORDER BY project_name;',
    get_treasury_position: 'SELECT maturity_year, SUM(amount_sgd_m) AS amount_sgd_m\nFROM curated.tsy_debt\nGROUP BY maturity_year\nORDER BY maturity_year;',
    run_rate_scenario: 'SELECT SUM(amount_sgd_m * rate_pct / 100 * :rate_shock_pct / 100) AS interest_impact\nFROM curated.tsy_debt\nWHERE rate_basis = \'floating\' AND hedged = FALSE;',
    search_documents: 'SELECT document_id, title, document_date, matched_passage\nFROM curated.finance_documents\nWHERE role_can_read(:role, scope)\n  AND text_matches(:question);',
  };

  return (
    <article className="atlas-answer" aria-label="AskAtlas answer">
      <div className="atlas-user-question">
        <span className="message-author">Your question</span>
        <h3>{response.question}</h3>
      </div>

      <div className="atlas-response-body">
        <div className="answer-heading">
          <span className="atlas-wordmark">AskAtlas</span>
          <Badge>{badge}</Badge>
        </div>

        {note && <p className="answer-mode-note">{note}</p>}

        <p className="answer-summary">{response.shortAnswer}</p>
        <p className="answer-detail">{response.detailedAnswer}</p>

        <section className="answer-drivers" aria-label="Key drivers">
          <h4>Key drivers</h4>
          <ul>
            {response.keyDrivers.map((driver) => (
              <li key={driver.text}>
                <span>{driver.text}</span>{' '}
                {driver.sourceNumbers.map((number) => {
                  const citation = response.sourceCitations.find(
                    (source) => source.number === number,
                  );

                  return citation ? (
                    <SourceCitation
                      key={number}
                      number={number}
                      title={citation.title}
                      onClick={() => onViewSource(number)}
                    />
                  ) : null;
                })}
              </li>
            ))}
          </ul>
        </section>

        <div className="answer-metrics" aria-label="Illustrative metrics">
          {response.metrics.map((metric) => (
            <div className="answer-metric" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.note}</small>
            </div>
          ))}
        </div>

        <div className="answer-source-summary">
          <button
            type="button"
            className="button-secondary"
            onClick={() => onViewSource()}
          >
            View sources ({response.sourceCitations.length})
          </button>
          <span>Relevant hub: {response.relevantHub}</span>
        </div>

        <details className="answer-grounding">
          <summary>How this answer was built · tools, evidence and SQL equivalent</summary>
          <div className="answer-grounding-body">
            <p>AskAtlas checks the request and the active role, calls only approved data tools, drafts from their returned records, then checks answer figures against those records. The tool results and source passages are available under “View sources”.</p>
            <ol className="answer-grounding-steps">
              {trace.map((step, index) => <li key={`${step.title}-${index}`}><strong>{step.title}</strong><span>{step.detail}</span></li>)}
              <li><strong>Evidence check</strong><span>{response.confidence.explanation}</span></li>
            </ol>
            <h5>SQL equivalent for the tools used</h5>
            <p>This demo reads in-memory synthetic TypeScript objects. These are illustrative warehouse query shapes; no SQL is executed for this answer.</p>
            {toolSteps.map((step, index) => {
              const toolName = step.title.split(' → ').at(-1) ?? '';
              const query = queryExamples[toolName];
              return query ? <pre key={`${toolName}-${index}`}><code>{`-- ${step.title}\n${query}`}</code></pre> : null;
            })}
            {!toolSteps.some((step) => queryExamples[step.title.split(' → ').at(-1) ?? '']) && <p>No data query tools were called for this answer.</p>}
          </div>
        </details>

        <section className="answer-confidence" aria-label="Confidence and assumptions">
          <div className="confidence-heading">
            <ShieldCheck size={18} aria-hidden="true" />
            <h4>
              Confidence: {response.confidence.label} ·{' '}
              {response.confidence.score}%
            </h4>
          </div>

          <p>{response.confidence.explanation}</p>

          <details>
            <summary>View assumptions and limitations</summary>
            <ul>
              {response.assumptions.map((assumption) => (
                <li key={assumption}>{assumption}</li>
              ))}
            </ul>
          </details>
        </section>

        <div className="human-review-note">
          <strong>Human review</strong>
          <p>{response.humanReviewNote}</p>
        </div>

        <FollowUpQuestions
          questions={response.followUpQuestions}
          onSelect={onSelectQuestion}
        />
      </div>
    </article>
  );
}

export default ChatMessage;
