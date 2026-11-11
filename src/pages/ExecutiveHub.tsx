import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  ArrowRight,
  ChartNoAxesCombined,
  CircleHelp,
  Info,
  Landmark,
  MessageSquareText,
  Search,
} from 'lucide-react';
import AskAtlasDock from '../components/askAtlas/AskAtlasDock';
import BusinessUnitTable from '../components/charts/BusinessUnitTable';
import PerformanceChart from '../components/charts/PerformanceChart';
import VarianceBridge from '../components/charts/VarianceBridge';
import KpiCard from '../components/common/KpiCard';
import Panel from '../components/common/Panel';
import PageHeader from '../components/layout/PageHeader';
import RecommendationsPanel from '../components/recommendations/RecommendationsPanel';
import {
  executiveDataNote,
  executiveInsights,
  executiveKpis,
  executiveQuestions,
  operatingProfitVariance,
  performanceMetrics,
} from '../data/executiveData';
import type { PerformanceMetric, VarianceItem } from '../types';
import '../styles/atlasDock.css';
import '../styles/executiveRefresh.css';

const insightIcons = {
  performance: ChartNoAxesCombined,
  review: Search,
  treasury: Landmark,
  analysis: MessageSquareText,
};

function ExecutiveHub() {
  const [activeMetric, setActiveMetric] =
    useState<PerformanceMetric>('revenue');
  const [selectedVariance, setSelectedVariance] =
    useState<VarianceItem | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] =
    useState<string | null>(null);
  const [atlasOpen, setAtlasOpen] = useState(false);

  const metricTabsRef = useRef<HTMLDivElement>(null);
  const atlasTriggerRef = useRef<HTMLElement | null>(null);
  const atlasLauncherRef = useRef<HTMLButtonElement>(null);

  const currentMetric =
    performanceMetrics.find((metric) => metric.id === activeMetric) ??
    performanceMetrics[0];

  function rememberTrigger() {
    atlasTriggerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
  }

  function openAtlas() {
    rememberTrigger();
    setAtlasOpen(true);
  }

  function investigate(responseId: string) {
    rememberTrigger();
    setSelectedQuestionId(responseId);
    setAtlasOpen(true);
  }

  function closeAtlas() {
    setAtlasOpen(false);

    window.requestAnimationFrame(() => {
      const trigger = atlasTriggerRef.current;

      if (trigger && trigger.isConnected) {
        trigger.focus({ preventScroll: true });
      } else {
        atlasLauncherRef.current?.focus({ preventScroll: true });
      }
    });
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex = index;

    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % performanceMetrics.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex =
        (index - 1 + performanceMetrics.length) %
        performanceMetrics.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = performanceMetrics.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setActiveMetric(performanceMetrics[nextIndex].id);

    metricTabsRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextIndex]?.focus();
  }

  return (
    <>
      <div
        className={`executive-workspace executive-refresh ${
          atlasOpen ? 'executive-workspace--atlas-open' : ''
        }`}
      >
        <PageHeader
          title="Executive Hub"
          subtitle="Group performance. Connected insight. A sharper tomorrow."
        />

        <div className="executive-page-actions">
          <div className="executive-period-context">
            <span className="executive-period-pill">FY2026</span>
            <span>
              Group overview · SGD · Illustrative reporting scenario
            </span>
          </div>

          <button
            type="button"
            className="button-secondary"
            onClick={atlasOpen ? closeAtlas : openAtlas}
            aria-expanded={atlasOpen}
            aria-controls={atlasOpen ? 'executive-atlas-dock' : undefined}
          >
            <MessageSquareText size={17} aria-hidden="true" />
            {atlasOpen ? 'Close AskAtlas' : 'Ask about this performance'}
          </button>
        </div>

        <section className="kpi-grid" aria-label="Illustrative Group KPIs">
          {executiveKpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </section>

        <div className="executive-layout">
          <div className="executive-main">
            <div className="executive-chart-grid">
              <Panel
                title="Group financial performance"
                subtitle="Actual versus prior year · Illustrative"
                className="performance-panel"
              >
                <div
                  ref={metricTabsRef}
                  className="metric-tabs"
                  role="tablist"
                  aria-label="Financial performance metric"
                >
                  {performanceMetrics.map((metric, index) => (
                    <button
                      key={metric.id}
                      id={`metric-tab-${metric.id}`}
                      type="button"
                      role="tab"
                      aria-selected={activeMetric === metric.id}
                      aria-controls="performance-tabpanel"
                      tabIndex={activeMetric === metric.id ? 0 : -1}
                      className={`metric-tab ${
                        activeMetric === metric.id
                          ? 'metric-tab--active'
                          : ''
                      }`}
                      onClick={() => setActiveMetric(metric.id)}
                      onKeyDown={(event) =>
                        handleTabKeyDown(event, index)
                      }
                    >
                      {metric.label}
                    </button>
                  ))}
                </div>

                <div
                  id="performance-tabpanel"
                  role="tabpanel"
                  aria-labelledby={`metric-tab-${activeMetric}`}
                  tabIndex={0}
                >
                  <div className="chart-unit">{currentMetric.unit}</div>
                  <PerformanceChart metric={currentMetric} />
                </div>

                <div className="chart-investigate-row">
                  <button
                    type="button"
                    className="text-action"
                    onClick={() => investigate('group-performance')}
                  >
                    Investigate Group performance
                    <ArrowRight size={14} aria-hidden="true" />
                  </button>
                </div>
              </Panel>

              <Panel
                title="Operating-profit variance"
                subtitle="FY2025 to FY2026 · Independent illustrative bridge"
                className="variance-panel"
              >
                <div className="variance-heading-row">
                  <span className="chart-unit">SGD million</span>
                  <span className="chart-hint">Select a driver</span>
                </div>

                <VarianceBridge
                  items={operatingProfitVariance}
                  selectedId={selectedVariance?.id ?? null}
                  onSelect={setSelectedVariance}
                />

                <div
                  className={`variance-detail ${
                    selectedVariance ? 'variance-detail--selected' : ''
                  }`}
                  aria-live="polite"
                >
                  {selectedVariance ? (
                    <>
                      <strong>{selectedVariance.label}</strong>
                      <p>{selectedVariance.explanation}</p>

                      {selectedVariance.id === 'development' && (
                        <button
                          type="button"
                          className="button-secondary variance-ask-button"
                          onClick={() => investigate('development-costs')}
                        >
                          <MessageSquareText size={16} aria-hidden="true" />
                          Explain with AskAtlas
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <strong>What sits behind the movement?</strong>
                      <p>
                        Select Development to inspect the cost and
                        project-timing scenario, then investigate alongside
                        this chart.
                      </p>
                    </>
                  )}
                </div>

                <p className="schedule-note">
                  1,019 + 135 − 80 + 26 = 1,100. Reconciles to the KPI cards;
                  not reconciled to the KPI or business-unit fixtures.
                </p>
              </Panel>
            </div>

            <div className="executive-detail-grid">
              <Panel
                title="Performance by business unit"
                subtitle="FY2026 · SGD million · Illustrative"
                className="business-performance-panel"
              >
                <BusinessUnitTable />
                <p className="business-table-note">
                  Bars compare listed revenue values; they do not show
                  prior-year performance. This schedule is independent of
                  the Group KPI.
                </p>
              </Panel>

              <Panel
                title="Key insights"
                subtitle="Selected prompts for Finance investigation"
                className="executive-insights-panel"
              >
                <div className="executive-insights">
                  {executiveInsights.map((insight) => {
                    const Icon = insightIcons[insight.kind];

                    return (
                      <article className="executive-insight" key={insight.id}>
                        <span className="insight-icon">
                          <Icon size={18} aria-hidden="true" />
                        </span>

                        <div>
                          <h3>{insight.category}</h3>
                          <p>{insight.text}</p>

                          {insight.kind === 'analysis' && (
                            <button
                              type="button"
                              className="text-action"
                              onClick={() => investigate('interest-rates')}
                            >
                              Explore scenario
                              <ArrowRight size={14} aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="insights-review-note">
                  <Info size={15} aria-hidden="true" />
                  <span>
                    Illustrative observations, not verified findings.
                    Finance review is required.
                  </span>
                </div>
              </Panel>
            </div>

            <RecommendationsPanel onInvestigate={investigate} />
          </div>

          <aside
            className="executive-questions"
            aria-labelledby="executive-questions-title"
          >
            <header className="questions-header">
              <span className="questions-header-icon">
                <CircleHelp size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="section-eyebrow">The executive lens</p>
                <h2 id="executive-questions-title">
                  Four questions. Clearer focus.
                </h2>
              </div>
            </header>

            <div className="question-list">
              {executiveQuestions.map((question) => (
                <section className="executive-question" key={question.id}>
                  <span className="question-number">{question.number}</span>
                  <h3>{question.title}</h3>
                  <ul>
                    {question.topics.map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <div className="questions-footer">
              Evidence informs the answer. Finance determines the action.
            </div>
          </aside>
        </div>

        <section
          className="transformation-banner"
          aria-label="The Atlas transformation"
        >
          <div>
            <span className="transformation-label">From</span>
            <p>What does the report say?</p>
          </div>
          <ArrowRight size={23} aria-hidden="true" />
          <div>
            <span className="transformation-label">To</span>
            <p>What changed, why, and what should I investigate?</p>
          </div>
        </section>

        <p className="executive-data-note">
          <Info size={15} aria-hidden="true" />
          <span>{executiveDataNote}</span>
        </p>
      </div>

      {!atlasOpen && (
        <button
          ref={atlasLauncherRef}
          type="button"
          className="executive-atlas-launcher"
          onClick={openAtlas}
          aria-label="Open AskAtlas alongside the Executive dashboard"
          aria-expanded={false}
        >
          <MessageSquareText size={20} aria-hidden="true" />
          AskAtlas
        </button>
      )}

      {atlasOpen && (
        <AskAtlasDock
          selectedQuestionId={selectedQuestionId}
          onSelectQuestion={setSelectedQuestionId}
          onClose={closeAtlas}
        />
      )}
    </>
  );
}

export default ExecutiveHub;