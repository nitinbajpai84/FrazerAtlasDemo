import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AskAtlasPanel from '../components/askAtlas/AskAtlasPanel';
import PageHeader from '../components/layout/PageHeader';
import RecommendationsPanel from '../components/recommendations/RecommendationsPanel';

function AskAtlasPage() {
  const location = useLocation();
  const passed = (location.state as { q?: string } | null)?.q;

  const [selectedQuestionId, setSelectedQuestionId] =
    useState<string | null>(passed ? `q:${passed}` : null);

  const atlasSectionRef = useRef<HTMLElement>(null);

  // A question sent from the top bar, an alert or the guided demo.
  useEffect(() => {
    if (passed) {
      setSelectedQuestionId(`q:${passed}`);
    }
  }, [passed, location.key]);

  function investigate(responseId: string) {
    setSelectedQuestionId(responseId);
    atlasSectionRef.current?.scrollIntoView({ block: 'start' });
    atlasSectionRef.current?.focus();
  }

  return (
    <>
      <PageHeader
        title="AskAtlas"
        subtitle="Explore Finance questions with evidence-led analytical support."
      />

      <div className="ask-atlas-page">
        <section
          ref={atlasSectionRef}
          tabIndex={-1}
          className="atlas-section-anchor"
          aria-label="AskAtlas analytical workspace"
        >
          <AskAtlasPanel
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={setSelectedQuestionId}
          />
        </section>

        <RecommendationsPanel onInvestigate={investigate} />

        <section className="accountability-note">
          <strong>
            Automation of analysis, without automation of accountability.
          </strong>
          <p>
            Answers are built from approved tools over synthetic data, with
            citations and an evidence check. Finance reviews the evidence,
            challenges assumptions and owns decisions.
          </p>
        </section>
      </div>
    </>
  );
}

export default AskAtlasPage;
