import { ArrowUpRight } from 'lucide-react';
import type {
  AskAtlasFollowUp,
  AskAtlasResponse,
} from '../../types';

interface SuggestedQuestionsProps {
  questions: AskAtlasResponse[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function FollowUpQuestions({
  questions,
  onSelect,
}: {
  questions: AskAtlasFollowUp[];
  onSelect: (id: string) => void;
}) {
  return (
    <section className="follow-up-questions" aria-label="Suggested next analysis">
      <h4>Suggested next analysis</h4>

      <div className="question-button-list">
        {questions.map((question) => (
          <button
            key={question.question}
            type="button"
            className="suggested-question"
            onClick={() => onSelect(question.responseId)}
          >
            <span>{question.question}</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}

function SuggestedQuestions({
  questions,
  selectedId,
  onSelect,
}: SuggestedQuestionsProps) {
  function renderQuestion(question: AskAtlasResponse) {
    return (
      <button
        key={question.id}
        type="button"
        className={`suggested-question ${
          selectedId === question.id ? 'suggested-question--selected' : ''
        }`}
        aria-pressed={selectedId === question.id}
        onClick={() => onSelect(question.id)}
      >
        <span>{question.question}</span>
        <ArrowUpRight size={16} aria-hidden="true" />
      </button>
    );
  }

  return (
    <section className="suggested-questions" aria-label="Suggested questions">
      <h3>Start with a Finance question</h3>

      <div className="question-button-list">
        {questions.slice(0, 3).map(renderQuestion)}
      </div>

      <details className="more-questions">
        <summary>More suggested questions</summary>
        <div className="question-button-list">
          {questions.slice(3).map(renderQuestion)}
        </div>
      </details>
    </section>
  );
}

export default SuggestedQuestions;