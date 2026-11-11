import Panel from '../components/common/Panel';
import { DataTable } from '../components/engine/HubKit';
import LiveGovernance from '../components/engine/LiveGovernance';
import PageHeader from '../components/layout/PageHeader';
import { AGENTS, DOCS, METRICS, buName } from '../engine/data';
import { useEngine } from '../engine/store';

const path: [string, string][] = [
  ['1 Permission gate', 'Role and row-level security'],
  ['2 Prompt screening', 'Injection and data-leak check'],
  ['3 Supervisory agent', 'Plans and picks specialists'],
  ['4 Specialist tools', 'Approved tools only'],
  ['5 Semantic layer', 'One definition per KPI'],
  ['6 Governed data and documents', 'Permission-aware'],
  ['7 Evidence gate', 'Citations and number check'],
  ['8 Decision gate', 'A person approves actions'],
];

const mapping: [string, string][] = [
  ['Shared dataset in src/engine/data.ts', 'BigQuery curated marts, loaded by Datastream, Connectors and Dataform'],
  ['Metric registry below', 'Looker semantic layer (LookML)'],
  ['Keyword document search', 'Vertex AI Search with document-level permissions'],
  ['Simulated document extraction', 'Document AI custom extractor with Gemini'],
  ['Gemini API through a local proxy', 'Gemini on Vertex AI, Singapore endpoint'],
  ['One model loop with agent-scoped tools', 'ADK supervisor and sub-agents on Vertex AI Agent Engine, tools through MCP Toolbox'],
  ['Pattern-based prompt screen', 'Model Armor'],
  ['Threshold rules for Atlas Recommends', 'BigQuery ML anomaly detection and forecasting'],
  ['Role switcher in the top bar', 'Entra ID sign-in, BigQuery row-level security and policy tags'],
  ['In-memory session audit log', 'Cloud Audit Logs and AI logs in BigQuery'],
];

function HowAtlasWorks() {
  useEngine(); // refresh when documents or the audit log change

  return (
    <>
      <PageHeader
        title="How Atlas works"
        subtitle="The context layer that keeps every agent grounded."
      />

      <div className="preview-hub-content">
        <div className="preview-scope-notice">
          Agents never read raw tables or the open web. They can only call approved tools, which answer
          from governed metrics and permitted documents, under the signed-in user's access.
        </div>

        <Panel title="Path of a question" subtitle="Every AskAtlas answer passes these eight steps">
          <ol className="flow-steps">
            {path.map(([title, detail]) => (
              <li key={title}>
                <strong>{title}</strong>
                <span>{detail}</span>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel title="Semantic layer" subtitle="Governed metric definitions the agents must use">
          <DataTable
            caption="Semantic layer metrics"
            head={['Metric id', 'Name', 'Definition', 'Formula', 'Owner', 'Source table']}
            rows={METRICS}
          />
        </Panel>

        <Panel title="Agent registry" subtitle="Approved tool boundary for each agent">
          <DataTable caption="Agent registry" head={['Agent', 'Purpose', 'Tools it may call']} rows={AGENTS} />
        </Panel>

        <Panel title="Document corpus" subtitle="What the Document Intelligence Agent may retrieve, and for whom">
          <DataTable
            caption="Document corpus"
            head={['Id', 'Title', 'Date', 'Visible to']}
            rows={DOCS.map((d) => [d.id, d.title, d.date, d.scope === 'GRP' ? 'Everyone' : d.scope === 'TSY' ? 'Treasury roles' : buName(d.scope)])}
          />
        </Panel>

        <LiveGovernance />

        <Panel title="Demo component and its Google Cloud target" subtitle="What stands in for what">
          <DataTable caption="Demo to target mapping" head={['In this demo', 'In the target architecture']} rows={mapping} />
        </Panel>
      </div>
    </>
  );
}

export default HowAtlasWorks;
