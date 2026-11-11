import { useEffect, useRef } from 'react';
import { PanelRightClose } from 'lucide-react';
import AskAtlasPanel from './AskAtlasPanel';

interface AskAtlasDockProps {
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  onClose: () => void;
}

function AskAtlasDock({
  selectedQuestionId,
  onSelectQuestion,
  onClose,
}: AskAtlasDockProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <aside
      id="executive-atlas-dock"
      className="atlas-dock"
      aria-labelledby="executive-atlas-dock-title"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <header className="atlas-dock-toolbar">
        <div>
          <h2
            id="executive-atlas-dock-title"
            ref={headingRef}
            tabIndex={-1}
          >
            Your analytical workspace
          </h2>
          <p>Keep the dashboard in view while you investigate.</p>
        </div>

        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close AskAtlas and restore dashboard width"
          title="Close AskAtlas"
        >
          <PanelRightClose size={21} aria-hidden="true" />
        </button>
      </header>

      <div className="atlas-dock-scroll">
        <AskAtlasPanel
          selectedQuestionId={selectedQuestionId}
          onSelectQuestion={onSelectQuestion}
        />
      </div>

      <footer className="atlas-dock-footer">
        <span>Illustrative prototype data</span>
        <button
          type="button"
          className="atlas-dock-close-text"
          onClick={onClose}
        >
          Return to full dashboard
        </button>
      </footer>
    </aside>
  );
}

export default AskAtlasDock;