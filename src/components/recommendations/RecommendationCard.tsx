import { ArrowRight } from 'lucide-react';
import type { Recommendation } from '../../types';
import Badge from '../common/Badge';

interface RecommendationCardProps {
  recommendation: Recommendation;
  expanded: boolean;
  detailsId: string;
  onOpen: () => void;
}

function RecommendationCard({
  recommendation,
  expanded,
  detailsId,
  onOpen,
}: RecommendationCardProps) {
  const tone =
    recommendation.severity === 'Attention required'
      ? 'attention'
      : recommendation.severity === 'Review required'
        ? 'review'
        : 'neutral';

  return (
    <article className="recommendation-card">
      <div className="recommendation-card-top">
        <span className="recommendation-origin">
          {recommendation.originatingHub}
        </span>
        <Badge tone={tone}>{recommendation.severity}</Badge>
      </div>

      <h3>{recommendation.title}</h3>

      <p className="recommendation-detected">{recommendation.detected}</p>

      <div className="recommendation-why">
        <strong>Why it matters</strong>
        <p>{recommendation.whyItMatters}</p>
      </div>

      <dl className="recommendation-owner">
        <dt>Accountable role</dt>
        <dd>{recommendation.accountableRole}</dd>
      </dl>

      <button
        type="button"
        className="recommendation-open"
        onClick={onOpen}
        aria-expanded={expanded}
        aria-controls={expanded ? detailsId : undefined}
      >
        <span>{expanded ? 'Close investigation' : 'Review evidence and next analysis'}</span>
        <ArrowRight size={16} aria-hidden="true" />
      </button>
    </article>
  );
}

export default RecommendationCard;