import Badge from '../components/common/Badge';
import Panel from '../components/common/Panel';
import { Bars, DataTable, Delta, HubFrame } from '../components/engine/HubKit';
import { PROJECTS, fmt, pct, sum } from '../engine/data';

function DeveloperHub() {
  const budget = sum(PROJECTS, (p) => p.budget);
  const forecast = sum(PROJECTS, (p) => p.incurred + p.ctcFcst);
  const units = sum(PROJECTS, (p) => p.units);
  const sold = sum(PROJECTS, (p) => p.sold);
  const review = PROJECTS.filter((p) => pct(p.ctcFcst, p.ctcPlan) >= 10 || p.slip > 0 || (p.velPlan > 0 && p.velAct / p.velPlan < 0.8));

  return (
    <HubFrame
      hub="Developer Hub"
      title="Developer Hub"
      subtitle="Connected visibility across development performance and risk."
      question="Which developments have experienced the largest movement in forecast margin, and what are the principal drivers?"
      metrics={[
        { label: 'Approved budget', value: `SGD ${fmt(budget)}M`, note: `${PROJECTS.length} projects in the pipeline` },
        { label: 'Forecast cost', value: `SGD ${fmt(forecast)}M`, note: `${pct(forecast, budget) > 0 ? '+' : ''}${pct(forecast, budget)}% against budget` },
        { label: 'Cost to complete', value: `SGD ${fmt(sum(PROJECTS, (p) => p.ctcFcst))}M`, note: `Plan SGD ${fmt(sum(PROJECTS, (p) => p.ctcPlan))}M` },
        { label: 'Units sold', value: `${Math.round((sold / units) * 100)}%`, note: `${fmt(sold)} of ${fmt(units)} units` },
        { label: 'Project exceptions', value: `${review.length} for review`, note: 'Cost, sales or programme outside threshold' },
      ]}
    >
      <Panel title="Cost by project" subtitle="SGD million · Incurred plus forecast cost-to-complete, against budget">
        <Bars
          data={PROJECTS.map((p) => ({ project: p.name, incurred: p.incurred, toComplete: p.ctcFcst, budget: p.budget }))}
          category="project"
          series={[
            { key: 'incurred', name: 'Incurred', color: '#17212B', stack: 'forecast' },
            { key: 'toComplete', name: 'Forecast cost-to-complete', color: '#FD5108', stack: 'forecast' },
            { key: 'budget', name: 'Budget', color: '#CBD1D6', stack: 'budget' },
          ]}
        />
      </Panel>

      <Panel title="Development portfolio" subtitle="Stage, cost, sales, programme and margin by project">
        <DataTable
          caption="Development projects"
          head={['Project', 'Stage', 'Complete', 'Budget', 'Forecast', 'Vs budget', 'Cost-to-complete vs plan', 'Units sold', 'Sales / month (plan)', 'Completion', 'Margin (plan)']}
          numeric={[2, 3, 4, 5, 6, 7, 8, 10]}
          rows={PROJECTS.map((p) => [
            <>{p.name} <span className="cell-note">{p.country}</span></>,
            p.stage,
            `${p.pct}%`,
            fmt(p.budget),
            fmt(p.incurred + p.ctcFcst),
            <Delta value={pct(p.incurred + p.ctcFcst, p.budget)} unit="%" invert />,
            <Delta value={pct(p.ctcFcst, p.ctcPlan)} unit="%" invert />,
            p.units ? `${fmt(p.sold)} / ${fmt(p.units)}` : '–',
            p.velPlan ? `${p.velAct} (${p.velPlan})` : '–',
            <>{p.doneFcst} {p.slip > 0 && <Badge tone="review">+{p.slip} months</Badge>}</>,
            `${p.mFcst}% (${p.mPlan}%)`,
          ])}
        />
      </Panel>
    </HubFrame>
  );
}

export default DeveloperHub;
