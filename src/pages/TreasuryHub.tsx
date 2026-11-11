import { useState } from 'react';
import Badge from '../components/common/Badge';
import Panel from '../components/common/Panel';
import { Bars, DataTable, Delta, HubFrame } from '../components/engine/HubKit';
import { FX, fmt, treasury } from '../engine/data';
import { rateScenario } from '../engine/tools';

function TreasuryHub() {
  const [shift, setShift] = useState(100);
  const t = treasury();
  const scenario = rateScenario(shift);
  const largestYear = Math.max(...t.byFy.map((y) => y.share_pct));

  return (
    <HubFrame
      hub="Treasury & Capital Hub"
      title="Treasury & Capital Hub"
      subtitle="Liquidity, funding, exposures and capital decisions in one forward-looking view."
      question="How does the upcoming debt maturity profile affect liquidity headroom and refinancing exposure?"
      metrics={[
        { label: 'Cash and undrawn facilities', value: `SGD ${fmt(t.liquidity)}M`, note: `${t.cover}x cover of next 12 months` },
        { label: 'Net debt', value: `SGD ${fmt(t.net)}M`, note: `Net gearing ${t.gearing}% (limit 80%)` },
        { label: 'Average cost of debt', value: `${t.avgCost}%`, note: `Interest SGD ${fmt(t.interest)}M a year` },
        { label: 'Fixed or hedged', value: `${t.fixedHedgedPct}%`, note: 'Policy floor 70%' },
        { label: 'Interest cover', value: `${t.icr}x`, note: 'Covenant minimum 2.0x' },
      ]}
    >
      <Panel title="Debt maturity profile" subtitle="SGD million · By financial year and instrument type">
        <Bars
          data={t.byFy.map((y) => ({ year: y.fy, loans: y.bank_loans, bonds: y.bonds_notes }))}
          category="year"
          series={[
            { key: 'loans', name: 'Bank loans', color: '#FD5108', stack: 'debt' },
            { key: 'bonds', name: 'Bonds and notes', color: '#A1A8B3', stack: 'debt' },
          ]}
        />
      </Panel>

      <Panel title="Rate scenario" subtitle="Approved calculation tool · The same tool the Treasury Agent calls">
        <label className="scenario-control" htmlFor="rate-shift">
          Parallel rate shift: <strong>+{shift} bp</strong>
          <input id="rate-shift" type="range" min={0} max={300} step={25} value={shift} onChange={(event) => setShift(Number(event.target.value))} />
        </label>
        <DataTable
          caption="Rate scenario result"
          head={['Measure', 'Before', 'After']}
          numeric={[1, 2]}
          rows={[
            ['Annual interest (SGD M)', fmt(scenario.annual_interest_before), <>{fmt(scenario.annual_interest_after)} <Delta value={scenario.additional_annual_interest} invert /></>],
            ['Interest cover (minimum 2.0x)', `${scenario.interest_cover_before_times}x`, `${scenario.interest_cover_after_times}x`],
          ]}
        />
        <p className="preview-panel-note">Applied to SGD {fmt(scenario.unhedged_floating_debt)}M of unhedged floating-rate debt.</p>
      </Panel>

      <Panel title="Policy and covenant check" subtitle="Actual position against Group Treasury Policy (DOC-TSY-POL)">
        <DataTable
          caption="Policy and covenant check"
          head={['Measure', 'Actual', 'Limit', 'Status']}
          numeric={[1, 2]}
          rows={[
            ['Largest single-year maturity', `${largestYear}%`, '25% max', largestYear > 25 ? <Badge tone="attention">Outside policy</Badge> : <Badge>Within</Badge>],
            ['Fixed or hedged debt', `${t.fixedHedgedPct}%`, '70% min', t.fixedHedgedPct < 75 ? <Badge tone="review">Close to floor</Badge> : <Badge>Within</Badge>],
            ['Liquidity cover', `${t.cover}x`, '1.5x min', <Badge>Within</Badge>],
            ['Net gearing', `${t.gearing}%`, '80% max', <Badge>Within</Badge>],
            ['Interest cover', `${t.icr}x`, '2.0x min', <Badge>Within</Badge>],
          ]}
        />
      </Panel>

      <Panel title="Interest-rate and currency exposure" subtitle="SGD million debt by rate basis · Net assets by currency">
        <Bars
          height={150}
          horizontal
          data={[{ label: 'Debt by rate basis', fixed: t.fixed, hedged: t.hedged, unhedged: t.unhedged }]}
          category="label"
          series={[
            { key: 'fixed', name: 'Fixed rate', color: '#17212B', stack: 'basis' },
            { key: 'hedged', name: 'Floating, hedged', color: '#A1A8B3', stack: 'basis' },
            { key: 'unhedged', name: 'Floating, unhedged', color: '#FD5108', stack: 'basis' },
          ]}
        />
        <DataTable
          caption="Net asset exposure by currency"
          head={['Currency', 'Share of net assets', 'Hedged']}
          numeric={[1, 2]}
          rows={FX.map((f) => [f[0], `${f[1]}%`, `${f[2]}%`])}
        />
      </Panel>
    </HubFrame>
  );
}

export default TreasuryHub;
