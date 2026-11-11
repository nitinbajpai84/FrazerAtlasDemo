import { Check, Circle, LoaderCircle } from 'lucide-react';
import { extractionStages } from '../../data/investorData';
import ProgressBar from '../common/ProgressBar';

interface ExtractionProgressProps {
  completedStages: number;
  complete: boolean;
}

function ExtractionProgress({
  completedStages,
  complete,
}: ExtractionProgressProps) {
  const percentage =
    (completedStages / extractionStages.length) * 100;

  const activeLabel = complete
    ? 'Ready for Finance review'
    : extractionStages[completedStages]?.label ?? 'Preparing sample';

  return (
    <section className="extraction-progress" aria-label="Simulated extraction">
      <div className="extraction-progress-heading">
        <div>
          <h3>{complete ? 'Sample record prepared' : 'Preparing sample record'}</h3>
          <p>Timed simulation · No document processing or API calls</p>
        </div>
        <strong>{Math.round(percentage)}%</strong>
      </div>

      <ProgressBar
        value={percentage}
        label="Sample valuation workflow progress"
      />

      <p className="extraction-live-status" role="status" aria-live="polite">
        {activeLabel}
      </p>

      <ol className="extraction-stage-list">
        {extractionStages.map((stage, index) => {
          const done = index < completedStages;
          const active = !complete && index === completedStages;

          return (
            <li
              key={stage.id}
              className={active ? 'extraction-stage--active' : ''}
              aria-current={active ? 'step' : undefined}
            >
              {done ? (
                <Check size={17} aria-hidden="true" />
              ) : active ? (
                <LoaderCircle
                  size={17}
                  className="processing-spinner"
                  aria-hidden="true"
                />
              ) : (
                <Circle size={15} aria-hidden="true" />
              )}

              <span>{stage.label}</span>
              <small>{done ? 'Complete' : active ? 'In progress' : 'Waiting'}</small>
            </li>
          );
        })}
      </ol>

      <p className="investor-small-note">
        “Updating portfolio analysis” is a simulated stage label. Portfolio
        impact is not released until Finance validates the review-required
        field.
      </p>
    </section>
  );
}

export default ExtractionProgress;