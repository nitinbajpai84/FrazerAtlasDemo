import { useId, useRef, useState } from 'react';
import { signals } from '../../engine/tools';
import { useEngine } from '../../engine/store';
import type { HubName } from '../../types';
import Panel from '../common/Panel';
import RecommendationCard from './RecommendationCard';
import RecommendationDrawer from './RecommendationDrawer';

interface RecommendationsPanelProps {
  onInvestigate: (responseId: string) => void;
  hub?: HubName;
  limit?: number;
}

function RecommendationsPanel({
  onInvestigate,
  hub,
  limit = 6,
}: RecommendationsPanelProps) {
  const instanceId = useId();
  const { decisions, decide } = useEngine();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Computed from the shared dataset for the signed-in role on every render.
  const recommendations = signals()
    .filter((item) => !hub || item.originatingHub === hub)
    .slice(0, limit);

  const recommendation = recommendations.find((item) => item.id === selectedId);
  const detailsId = `${instanceId}-recommendation-details`;

  function closeDetails() {
    setSelectedId(null);
    triggerRef.current?.focus();
  }

  return (
    <Panel
      title="Atlas Recommends"
      subtitle="Signals found by scanning the shared data after each load"
    >
      {recommendations.length === 0 && (
        <p className="recommendations-disclaimer">No signals above threshold for your role.</p>
      )}

      <div className="recommendation-grid">
        {recommendations.map((item) => (
          <div key={item.id} className={decisions[item.id] ? 'recommendation-decided' : undefined}>
            <RecommendationCard
              recommendation={item}
              expanded={selectedId === item.id}
              detailsId={detailsId}
              onOpen={() => {
                if (selectedId === item.id) {
                  closeDetails();
                  return;
                }

                triggerRef.current =
                  document.activeElement instanceof HTMLElement
                    ? document.activeElement
                    : null;

                setSelectedId(item.id);

                window.requestAnimationFrame(() => {
                  detailsRef.current?.focus();
                  detailsRef.current?.scrollIntoView({ block: 'nearest' });
                });
              }}
            />
            {decisions[item.id] && <p className="recommendation-decision">{decisions[item.id]}</p>}
          </div>
        ))}
      </div>

      {recommendation && (
        <div
          ref={detailsRef}
          className="recommendation-focus-region"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              closeDetails();
            }
          }}
        >
          <RecommendationDrawer
            id={detailsId}
            recommendation={recommendation}
            decision={decisions[recommendation.id]}
            onDecide={(decision) => decide(recommendation.id, decision)}
            onClose={closeDetails}
            onInvestigate={onInvestigate}
          />
        </div>
      )}

      <p className="recommendations-disclaimer">
        Threshold rules over synthetic data. In the target platform these signals
        come from BigQuery ML. Finance decides whether to act.
      </p>
    </Panel>
  );
}

export default RecommendationsPanel;
