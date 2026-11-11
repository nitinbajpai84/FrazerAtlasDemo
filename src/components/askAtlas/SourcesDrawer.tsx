import { FileText, X } from 'lucide-react';
import type { SourceCitation } from '../../types';

interface SourcesDrawerProps {
  id: string;
  sources: SourceCitation[];
  highlightedNumber: number | null;
  onClose: () => void;
}

function SourcesDrawer({
  id,
  sources,
  highlightedNumber,
  onClose,
}: SourcesDrawerProps) {
  return (
    <section
      id={id}
      className="sources-drawer"
      aria-label="Illustrative source evidence"
    >
      <header className="evidence-header">
        <div>
          <h3>Source evidence</h3>
          <p>
            Tool results and document passages this answer was built from.
            Synthetic demonstration data.
          </p>
        </div>

        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close source evidence"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="source-records">
        {sources.map((source) => (
          <article
            key={source.id}
            className={`source-record ${
              highlightedNumber === source.number
                ? 'source-record--highlighted'
                : ''
            }`}
          >
            <div className="source-record-title">
              <FileText size={17} aria-hidden="true" />
              <h4>
                [{source.number}] {source.title}
              </h4>
            </div>

            <p className="source-metadata">
              {source.page !== 'n/a' ? `${source.page} · ` : ''}{source.section}
            </p>

            <blockquote>{source.excerpt}</blockquote>

            <span className="source-period">{source.period}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default SourcesDrawer;