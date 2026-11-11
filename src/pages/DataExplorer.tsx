import { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import Panel from '../components/common/Panel';
import PageHeader from '../components/layout/PageHeader';
import { ASSETS, BU, DEBT, DOCS, FX, FUNDS, FY, GROUP, METRICS, PROJECTS, TSY } from '../engine/data';

type DataRow = Record<string, unknown>;
type DatasetKey = 'group' | 'business-units' | 'assets' | 'projects' | 'funds' | 'treasury' | 'documents' | 'metrics';

const datasets: { key: DatasetKey; label: string; source: string; sql: string; rows: () => DataRow[] }[] = [
  {
    key: 'group', label: 'Group performance', source: 'GROUP + FY · src/engine/data.ts',
    sql: 'SELECT fiscal_year, revenue, operating_profit, nav, roce\nFROM curated.fin_performance\nORDER BY fiscal_year;',
    rows: () => FY.map((year, i) => ({ fiscal_year: `FY${year}`, revenue_sgd_m: GROUP.revenue[i], operating_profit_sgd_m: GROUP.op[i], nav_sgd_m: GROUP.nav[i], roce_pct: GROUP.roce[i] })),
  },
  {
    key: 'business-units', label: 'Business units', source: 'BU · src/engine/data.ts',
    sql: 'SELECT business_unit, revenue_fy2025, revenue_fy2026, operating_profit_fy2025, operating_profit_fy2026, plan_fy2026\nFROM curated.fin_performance\nORDER BY business_unit;',
    rows: () => BU.map((row) => ({ business_unit: row.name, id: row.id, revenue_fy2025_sgd_m: row.rev25, revenue_fy2026_sgd_m: row.rev26, operating_profit_fy2025_sgd_m: row.op25, operating_profit_fy2026_sgd_m: row.op26, plan_fy2026_sgd_m: row.plan26 })),
  },
  {
    key: 'assets', label: 'Assets', source: 'ASSETS · src/engine/data.ts',
    sql: 'SELECT asset_name, business_unit, country, valuation_fy2025, valuation_fy2026, occupancy_fy2025, occupancy_fy2026, noi_fy2025, noi_fy2026\nFROM curated.asset_valuation\nJOIN curated.asset_operations USING (asset_id)\nORDER BY asset_name;',
    rows: () => ASSETS.map((row) => ({ asset: row.name, id: row.id, business_unit: row.bu, country: row.country, valuation_fy2025_sgd_m: row.v25, valuation_fy2026_sgd_m: row.v26, occupancy_fy2025_pct: row.occ25, occupancy_fy2026_pct: row.occ26, noi_fy2025_sgd_m: row.noi25, noi_fy2026_sgd_m: row.noi26, cap_rate_pct: row.cap, added_in_session: row.added ?? false })),
  },
  {
    key: 'projects', label: 'Development projects', source: 'PROJECTS · src/engine/data.ts',
    sql: 'SELECT project_name, stage, budget, cost_to_complete_plan, cost_to_complete_forecast, units_sold, sales_velocity_actual, completion_forecast\nFROM curated.dev_projects\nORDER BY project_name;',
    rows: () => PROJECTS.map((row) => ({ project: row.name, id: row.id, country: row.country, stage: row.stage, completion_pct: row.pct, budget_sgd_m: row.budget, incurred_sgd_m: row.incurred, cost_to_complete_plan_sgd_m: row.ctcPlan, cost_to_complete_forecast_sgd_m: row.ctcFcst, units_sold: row.sold, units_total: row.units, sales_velocity_plan: row.velPlan, sales_velocity_actual: row.velAct, completion_forecast: row.doneFcst, slip_months: row.slip, margin_plan_pct: row.mPlan, margin_forecast_pct: row.mFcst })),
  },
  {
    key: 'funds', label: 'Funds', source: 'FUNDS · src/engine/data.ts',
    sql: 'SELECT fund_name, business_unit, fee_income, return_pct, target_return_pct\nFROM curated.fund_performance\nORDER BY fund_name;',
    rows: () => FUNDS.map((row) => ({ fund: row.name, business_unit: row.bu, fee_income_sgd_m: row.fee, return_pct: row.ret, target_return_pct: row.target })),
  },
  {
    key: 'treasury', label: 'Treasury', source: 'DEBT + TSY + FX · src/engine/data.ts',
    sql: 'SELECT facility_id, instrument_type, currency, amount, maturity_year, rate_basis, rate_pct, hedged\nFROM curated.tsy_debt\nORDER BY maturity_year, facility_id;',
    rows: () => [
      ...DEBT.map((row) => ({ record_type: 'debt', id: row.id, instrument: row.type, currency: row.ccy, amount_sgd_m: row.amt, maturity_year: row.fy, rate_basis: row.basis, rate_pct: row.rate, hedged: row.hedged })),
      { record_type: 'liquidity', id: 'CASH', instrument: 'Cash', currency: 'SGD', amount_sgd_m: TSY.cash, maturity_year: null, rate_basis: null, rate_pct: null, hedged: null },
      { record_type: 'liquidity', id: 'UNDRAWN', instrument: 'Undrawn committed facilities', currency: 'SGD', amount_sgd_m: TSY.undrawn, maturity_year: null, rate_basis: null, rate_pct: null, hedged: null },
      ...FX.map(([currency, netAssetSharePct, hedgePct]) => ({ record_type: 'fx_exposure', id: currency, instrument: 'Net assets / hedged', currency, amount_sgd_m: null, maturity_year: null, rate_basis: null, rate_pct: null, net_asset_share_pct: netAssetSharePct, hedge_pct: hedgePct })),
    ],
  },
  {
    key: 'documents', label: 'Documents', source: 'DOCS · src/engine/data.ts',
    sql: 'SELECT document_id, scope, title, document_date, text\nFROM curated.finance_documents\nORDER BY document_date DESC;',
    rows: () => DOCS.map((row) => ({ id: row.id, scope: row.scope, title: row.title, date: row.date, text: row.text })),
  },
  {
    key: 'metrics', label: 'Metric definitions', source: 'METRICS · src/engine/data.ts',
    sql: 'SELECT metric_id, display_name, definition, formula, owner, source_table\nFROM semantic.metric_catalog\nORDER BY metric_id;',
    rows: () => METRICS.map(([id, name, definition, formula, owner, source]) => ({ id, metric: name, definition, formula, owner, source_table: source })),
  },
];

function csvValue(value: unknown) {
  const text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function DataExplorer() {
  const [activeKey, setActiveKey] = useState<DatasetKey>('group');
  const [search, setSearch] = useState('');
  const active = datasets.find((dataset) => dataset.key === activeKey) ?? datasets[0];
  const rows = useMemo(() => active.rows(), [activeKey]);
  const columns = rows.length ? Object.keys(rows[0]) : [];
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? rows.filter((row) => Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(query))) : rows;
  }, [rows, search]);

  function downloadCsv() {
    const content = [columns.map(csvValue).join(','), ...filtered.map((row) => columns.map((column) => csvValue(row[column])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `finance-atlas-${activeKey}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader title="Data Explorer" subtitle="Explore the synthetic records and governed metric definitions behind the demo." />
      <div className="data-explorer-page">
        <div className="data-explorer-notice">
          <strong>Demo dataset · synthetic records</strong>
          <span>AskAtlas tools read these in-memory TypeScript objects. No SQL engine or live finance database is connected.</span>
        </div>

        <div className="data-explorer-tabs" role="tablist" aria-label="Demo datasets">
          {datasets.map((dataset) => (
            <button key={dataset.key} type="button" role="tab" aria-selected={activeKey === dataset.key} className={activeKey === dataset.key ? 'data-explorer-tab data-explorer-tab--active' : 'data-explorer-tab'} onClick={() => { setActiveKey(dataset.key); setSearch(''); }}>
              {dataset.label}
            </button>
          ))}
        </div>

        <Panel title={active.label} subtitle={`${active.source} · ${filtered.length} of ${rows.length} records`}>
          <div className="data-explorer-controls">
            <label className="data-explorer-search">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Search this dataset</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${active.label.toLowerCase()}…`} />
            </label>
            <button type="button" className="button-secondary" onClick={downloadCsv} disabled={!filtered.length}>
              <Download size={16} aria-hidden="true" /> Download CSV
            </button>
          </div>
          <div className="table-scroll data-explorer-table-wrap">
            <table className="data-table compact-table data-explorer-table">
              <caption>{active.label} · Synthetic demonstration data</caption>
              <thead><tr>{columns.map((column) => <th key={column} scope="col">{column.replaceAll('_', ' ')}</th>)}</tr></thead>
              <tbody>
                {filtered.map((row, index) => <tr key={`${activeKey}-${index}`}>{columns.map((column) => <td key={column}>{row[column] == null ? '—' : String(row[column])}</td>)}</tr>)}
                {!filtered.length && <tr><td colSpan={Math.max(columns.length, 1)}>No matching records.</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Warehouse SQL equivalent" subtitle="Illustrative query only · this demo does not execute SQL">
          <p className="data-explorer-sql-note">These source names and query shapes show how the same governed data could be queried in a warehouse. The live demo reads the TypeScript dataset listed above.</p>
          <pre className="data-explorer-sql"><code>{active.sql}</code></pre>
        </Panel>
      </div>
    </>
  );
}

export default DataExplorer;
