import { Search, X } from 'lucide-react';
import type { Recommendation } from '../../types';

interface RecommendationDrawerProps {
  id: string;
  recommendation: Recommendation;
  onClose: () => void;
  onInvestigate: (responseId: string) => void;
  decision?: string;
  onDecide?: (decision: string) => void;
}

function RecommendationDrawer({
  id,
  recommendation,
  onClose,
  onInvestigate,
  decision,
  onDecide,
}: RecommendationDrawerProps) {
  return (
    <section
      id={id}
      className="recommendation-drawer"
      aria-labelledby={`${id}-title`}
    >
      <header className="evidence-header">
        <div>
          <p className="section-eyebrow">Atlas recommendation</p>
          <h3 id={`${id}-title`}>{recommendation.title}</h3>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close recommendation details"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="recommendation-detail-grid">
        <div>
          <h4>What was detected</h4>
          <p>{recommendation.detected}</p>

          <h4>Why it matters</h4>
          <p>{recommendation.whyItMatters}</p>
        </div>

        <div>
          <h4>Evidence</h4>
          <ul>
            {recommendation.evidence.map((evidence) => (
              <li key={evidence}>{evidence}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="recommendation-next-analysis">
        <h4>Suggested next analysis</h4>
        <p>{recommendation.suggestedAnalysis}</p>

        <button
          type="button"
          className="button-secondary"
          onClick={() => onInvestigate(recommendation.askAtlasResponseId)}
        >
          <Search size={16} aria-hidden="true" />
          Investigate with AskAtlas
        </button>

        {onDecide && !decision && (
          <div className="decision-gate">
            <button type="button" className="button-primary" onClick={() => onDecide('Approved for action')}>
              {recommendation.severity === 'Attention required' ? 'Approve for action (explicit sign-off)' : 'Mark reviewed'}
            </button>
            <button type="button" className="button-secondary" onClick={() => onDecide('Dismissed')}>
              Dismiss
            </button>
          </div>
        )}
        {decision && <p className="recommendation-decision">{decision} · recorded in the audit log</p>}
      </div>

      <p className="recommendation-accountability">
        Accountable role: <strong>{recommendation.accountableRole}</strong>.
        This signal is computed from synthetic data.
        Finance determines whether further action is appropriate.
      </p>
    </section>
  );
}

export default RecommendationDrawer;