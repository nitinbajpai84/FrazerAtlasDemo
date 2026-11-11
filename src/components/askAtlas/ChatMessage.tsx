import { ShieldCheck } from 'lucide-react';
import type { AskAtlasResponse } from '../../types';
import Badge from '../common/Badge';
import SourceCitation from '../common/SourceCitation';
import { FollowUpQuestions } from './SuggestedQuestions';

interface ChatMessageProps {
  response: AskAtlasResponse;
  onViewSource: (number?: number) => void;
  onSelectQuestion: (id: string) => void;
  badge?: string;
  note?: string;
}

function ChatMessage({
  response,
  onViewSource,
  onSelectQuestion,
  badge = 'Predefined response',
  note,
}: ChatMessageProps) {
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