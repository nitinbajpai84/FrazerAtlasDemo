import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { MessageSquareText, Send } from 'lucide-react';
import {
  askAtlasResponses,
  askAtlasTrustStatement,
  getAskAtlasResponse,
} from '../../data/askAtlasResponses';
import { askAtlas, getStatus } from '../../engine/agent';
import type { AgentRun, AgentStep, AtlasStatus } from '../../engine/agent';
import { useEngine } from '../../engine/store';
import ChatMessage from './ChatMessage';
import SourcesDrawer from './SourcesDrawer';
import SuggestedQuestions from './SuggestedQuestions';

interface AskAtlasPanelProps {
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
}

// A question id is either one of the suggested questions or "q:<free text>".
const questionText = (id: string) => (id.startsWith('q:') ? id.slice(2) : getAskAtlasResponse(id)?.question);

function AskAtlasPanel({
  selectedQuestionId,
  onSelectQuestion,
}: AskAtlasPanelProps) {
  const instanceId = useId();
  const { roleKey, touch } = useEngine();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<AtlasStatus | null>(null);
  const [run, setRun] = useState<AgentRun | null>(null);
  const [trace, setTrace] = useState<AgentStep[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [sourceResponseId, setSourceResponseId] = useState<string | null>(null);
  const [highlightedSource, setHighlightedSource] = useState<number | null>(null);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const answerRef = useRef<HTMLDivElement>(null);
  const sourcesRef = useRef<HTMLDivElement>(null);
  const sourceTriggerRef = useRef<HTMLElement | null>(null);
  const history = useRef<{ q: string; a: string }[]>([]);
  const lastAsked = useRef<string | null>(null);
  const runToken = useRef(0);

  useEffect(() => {
    void getStatus().then(setStatus);
  }, []);

  const ask = useCallback(
    async (question: string) => {
      const token = (runToken.current += 1);
      setPending(question);
      setTrace([]);
      setSourcesOpen(false);
      const result = await askAtlas(question, history.current, (steps) => {
        if (runToken.current === token) setTrace(steps);
      });
      if (runToken.current !== token) return;
      history.current = [...history.current, { q: question, a: result.response.shortAnswer }].slice(-4);
      setRun(result);
      setTrace(result.trace);
      setPending(null);
      touch(); // refresh the audit log and any open hub
      window.requestAnimationFrame(() => answerRef.current?.focus());
    },
    [touch],
  );

  // Ask when the selected question changes, and again when the role changes,
  // so the same question shows what a different role is allowed to see.
  useEffect(() => {
    if (!selectedQuestionId) return;
    const key = `${selectedQuestionId}|${roleKey}`;
    if (lastAsked.current === key) return;
    lastAsked.current = key;
    const question = questionText(selectedQuestionId);
    if (question) void ask(question);
  }, [selectedQuestionId, roleKey, ask]);

  const response = run?.response;
  const showSources = sourcesOpen && response !== undefined && sourceResponseId === response.id;

  function openSources(number?: number) {
    if (!response) return;
    sourceTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setHighlightedSource(number ?? null);
    setSourceResponseId(response.id);
    setSourcesOpen(true);
    window.requestAnimationFrame(() => {
      sourcesRef.current?.focus();
      sourcesRef.current?.scrollIntoView({ block: 'nearest' });
    });
  }

  function closeSources() {
    setSourcesOpen(false);
    sourceTriggerRef.current?.focus();
  }

  const live = status?.live ?? false;

  return (
    <section className="ask-atlas-panel" aria-labelledby={`${instanceId}-title`}>
      <header className="atlas-panel-header">
        <div className="atlas-panel-title">
          <span className="atlas-panel-icon">
            <MessageSquareText size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 id={`${instanceId}-title`}>AskAtlas</h2>
            <p>Finance questions. Evidence-led answers.</p>
          </div>
        </div>

        <span className={`mock-mode-label ${live ? 'mock-mode-label--live' : ''}`}>
          {status === null ? 'Checking AI…' : live ? `Live · ${status.model}` : 'Offline planner'}
        </span>
      </header>

      <div className="atlas-panel-content">
        <p className="atlas-mode-note">
          {live
            ? 'Ask anything about the Finance data. Gemini plans the work, calls approved tools under your role, and every figure is checked against the tool results.'
            : 'No Gemini key is configured, so answers are assembled by an offline planner from the same approved tools. Add GEMINI_API_KEY to .env.local and restart for live AI.'}
        </p>

        <SuggestedQuestions
          questions={askAtlasResponses}
          selectedId={selectedQuestionId}
          onSelect={onSelectQuestion}
        />

        <form
          className="atlas-question-form"
          onSubmit={(event) => {
            event.preventDefault();
            const text = input.trim();
            if (!text || pending) return;
            const id = `q:${text}`;
            lastAsked.current = `${id}|${roleKey}`;
            onSelectQuestion(id);
            setInput('');
            void ask(text);
          }}
        >
          <label htmlFor={`${instanceId}-question`}>Ask a Finance question</label>
          <div className="atlas-input-row">
            <input
              id={`${instanceId}-question`}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="For example: why is Residential behind plan?"
              aria-describedby={`${instanceId}-input-help`}
            />
            <button type="submit" className="button-primary" disabled={pending !== null}>
              <Send size={16} aria-hidden="true" />
              <span>Ask</span>
            </button>
          </div>
          <p id={`${instanceId}-input-help`} className="atlas-input-help">
            Answers use only approved tools and documents your role may see.
          </p>
        </form>

        {(pending || trace.length > 0) && (
          <details className="agent-trace" open={pending !== null}>
            <summary>
              {pending ? 'Working…' : 'Agent trace'} ({trace.length} step{trace.length === 1 ? '' : 's'})
            </summary>
            <ol>
              {trace.map((step, index) => (
                <li key={index} className={step.ok ? 'agent-step' : 'agent-step agent-step--failed'}>
                  <strong>{step.ok ? '✓' : '✕'} {step.title}</strong>
                  <span>{step.detail}</span>
                </li>
              ))}
            </ol>
          </details>
        )}

        <div
          ref={answerRef}
          className="atlas-answer-region"
          tabIndex={-1}
          aria-label="AskAtlas response"
          aria-busy={pending !== null}
        >
          {pending ? (
            <div className="atlas-empty-state">
              <MessageSquareText size={24} aria-hidden="true" />
              <p>Working on: {pending}</p>
            </div>
          ) : run && response ? (
            <ChatMessage
              response={response}
              trace={run.trace}
              badge={run.mode === 'gemini' ? 'Live AI · grounded' : run.mode === 'blocked' ? 'Blocked' : 'Offline planner'}
              note={run.note}
              onViewSource={openSources}
              onSelectQuestion={onSelectQuestion}
            />
          ) : (
            <div className="atlas-empty-state">
              <MessageSquareText size={24} aria-hidden="true" />
              <p>
                Choose or type a question. You will see which agents and tools were used,
                the sources, and a check that the figures exist in those sources.
              </p>
            </div>
          )}
        </div>

        {showSources && response && (
          <div
            ref={sourcesRef}
            tabIndex={-1}
            className="sources-focus-region"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation();
                closeSources();
              }
            }}
          >
            <SourcesDrawer
              id={`${instanceId}-sources`}
              sources={response.sourceCitations}
              highlightedNumber={highlightedSource}
              onClose={closeSources}
            />
          </div>
        )}
      </div>

      <footer className="atlas-trust-statement">
        {askAtlasTrustStatement}
      </footer>
    </section>
  );
}

export default AskAtlasPanel;
