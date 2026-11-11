import Panel from '../components/common/Panel';
import { Bars, DataTable, Delta, HubFrame } from '../components/engine/HubKit';
import { FUNDS, buName, fmt, pct, r1, role, sum, visibleAssets } from '../engine/data';

function ManagerHub() {
  const assets = visibleAssets();
  const funds = FUNDS.filter((f) => role().bus.includes(f.bu));
  const noi25 = sum(assets, (a) => a.noi25);
  const noi26 = sum(assets, (a) => a.noi26);
  const occupancy = assets.length ? r1(sum(assets, (a) => a.occ26) / assets.length) : 0;

  return (
    <HubFrame
      hub="Manager Hub"
      title="Manager Hub"
      subtitle="Asset and fund performance, brought into focus."
      question="Which assets are driving the largest movement in portfolio performance, and what explains it?"
      metrics={[
        { label: 'Assets under management', value: `SGD ${fmt(sum(assets, (a) => a.v26))}M`, note: `${assets.length} assets in scope` },
        { label: 'Net operating income', value: `SGD ${fmt(r1(noi26))}M`, note: `${noi26 >= noi25 ? '+' : ''}${pct(noi26, noi25)}% against FY2025` },
        { label: 'Average occupancy', value: `${occupancy}%`, note: 'Simple average across assets' },
        { label: 'Fee income', value: `SGD ${fmt(sum(funds, (f) => f.fee))}M`, note: `${funds.length} funds in scope` },
        { label: 'Funds below target', value: `${funds.filter((f) => f.ret < f.target).length}`, note: 'Return against target return' },
      ]}
    >
      <Panel title="Net operating income by asset" subtitle="SGD million · FY2025 and FY2026">
        <Bars
          horizontal
          height={Math.max(240, assets.length * 34)}
          data={assets.map((a) => ({ asset: a.name, fy2025: a.noi25, fy2026: a.noi26 }))}
          category="asset"
          series={[
            { key: 'fy2025', name: 'FY2025', color: '#CBD1D6' },
            { key: 'fy2026', name: 'FY2026', color: '#FD5108' },
          ]}
        />
      </Panel>

      <Panel title="Asset operations" subtitle="Occupancy, income and cost by asset">
        <DataTable
          caption="Asset operations"
          head={['Asset', 'Class', 'Country', 'Occupancy', 'Change', 'NOI FY2026', 'NOI change', 'Opex change', 'NOI margin']}
          numeric={[3, 4, 5, 6, 7, 8]}
          rows={assets.map((a) => [
            a.name,
            buName(a.bu),
            a.country,
            `${a.occ26}%`,
            <Delta value={r1(a.occ26 - a.occ25)} unit=" pts" />,
            a.noi26,
            <Delta value={r1(a.noi26 - a.noi25)} />,
            <Delta value={pct(a.opex26, a.opex25)} unit="%" invert />,
            `${Math.round((a.noi26 / (a.noi26 + a.opex26)) * 100)}%`,
          ])}
        />
      </Panel>

      <Panel title="Fund returns against target" subtitle="Return, target and fee income by fund">
        <DataTable
          caption="Fund returns"
          head={['Fund', 'Fee income (SGD M)', 'Return', 'Target', 'Vs target']}
          numeric={[1, 2, 3, 4]}
          rows={funds.map((f) => [f.name, f.fee, `${f.ret}%`, `${f.target}%`, <Delta value={r1(f.ret - f.target)} unit=" pp" />])}
        />
      </Panel>
    </HubFrame>
  );
}

export default ManagerHub;
