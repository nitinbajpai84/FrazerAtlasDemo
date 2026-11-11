// A presenter aid: walks through the proposal's journeys one step at a time.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Presentation, X } from 'lucide-react';
import type { RoleKey } from '../../engine/data';
import { useEngine } from '../../engine/store';

interface Step {
  title: string;
  say: string;
  path: string;
  role?: RoleKey;
  question?: string;
}

const MATURITY_QUESTION =
  'How does the upcoming debt maturity profile affect liquidity headroom and refinancing exposure?';

const steps: Step[] = [
  { title: 'Group performance', say: 'Start in the Executive Hub: KPIs, the profit bridge and what needs attention.', path: '/executive', role: 'cfo' },
  { title: 'Ask why', say: 'AskAtlas explains the movement. Open the agent trace and the sources.', path: '/ask-atlas', question: 'What are the principal drivers of the change in Group operating profit in FY2026?' },
  { title: 'Valuation documents', say: 'Use the sample report, validate the low-confidence field, and see the portfolio update.', path: '/investor' },
  { title: 'Development risk', say: 'Atlas Recommends flags Skyline Quarter. Open the card, review the evidence and investigate.', path: '/developer' },
  { title: 'Treasury foresight', say: 'Move the rate slider, then check the policy table for the maturity concentration.', path: '/treasury' },
  { title: 'Ask Treasury', say: 'The Treasury Agent answers with the policy document as evidence.', path: '/ask-atlas', question: MATURITY_QUESTION },
  { title: 'Same question, different role', say: 'Now signed in as Head of Retail. The Treasury tool refuses, so the agent cannot answer.', path: '/ask-atlas', role: 'retail', question: MATURITY_QUESTION },
  { title: 'How it is grounded', say: 'The semantic layer, agent tools, access rules and audit log behind every answer.', path: '/how-it-works', role: 'cfo' },
];

function GuidedDemo() {
  const [index, setIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const { setRole, roleKey } = useEngine();

  function go(next: number) {
    const step = steps[next];
    if (step.role && step.role !== roleKey) setRole(step.role);
    navigate(step.path, step.question ? { state: { q: step.question } } : undefined);
    setIndex(next);
  }

  if (index === null) {
    return (
      <div className="guided-demo guided-demo--idle">
        <button type="button" className="button-secondary" onClick={() => go(0)}>
          <Presentation size={16} aria-hidden="true" />
          Start guided demo
        </button>
      </div>
    );
  }

  const step = steps[index];

  return (
    <section className="guided-demo" aria-label="Guided demo">
      <div className="guided-demo-text">
        <strong>
          Step {index + 1} of {steps.length} · {step.title}
        </strong>
        <span>{step.say}</span>
      </div>
      <div className="guided-demo-actions">
        <button type="button" className="button-secondary" onClick={() => go(index - 1)} disabled={index === 0}>
          <ChevronLeft size={16} aria-hidden="true" />
          Back
        </button>
        <button type="button" className="button-primary" onClick={() => go(index + 1)} disabled={index === steps.length - 1}>
          Next
          <ChevronRight size={16} aria-hidden="true" />
        </button>
        <button type="button" className="icon-button" onClick={() => setIndex(null)} aria-label="Exit guided demo">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export default GuidedDemo;
