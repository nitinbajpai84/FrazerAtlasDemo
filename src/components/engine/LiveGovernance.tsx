// Live governance panels: the access model the tools enforce, the prompt in use and the session audit log.
import Panel from '../common/Panel';
import { ALL_BU, ROLES, buName, session } from '../../engine/data';
import { systemPrompt } from '../../engine/agent';
import { useEngine } from '../../engine/store';
import { DataTable } from './HubKit';

function LiveGovernance() {
  const { roleKey } = useEngine();

  return (
    <>
      <Panel title="Access model in force" subtitle="Enforced inside every agent tool and hub · Switch role in the top bar">
        <DataTable
          caption="Roles and data scope"
          head={['Role', 'Business units', 'Treasury', 'Asset detail', 'Developments', 'Hubs']}
          rows={Object.entries(ROLES).map(([key, r]) => [
            <>{r.name}{key === roleKey ? ' (current)' : ''}</>,
            r.bus.length === ALL_BU.length ? 'All' : r.bus.map(buName).join(', '),
            r.treasury ? 'Yes' : 'No',
            r.assets ? 'Yes' : 'No',
            r.dev ? 'Yes' : 'No',
            r.hubs.map((h) => h.replace(' Hub', '')).join(', '),
          ])}
        />
      </Panel>

      <Panel title="Agent prompt in use" subtitle="Supervisory Finance Agent · version 1.0 · Rendered for the current role">
        <details className="prompt-view">
          <summary>View the system prompt</summary>
          <pre>{systemPrompt()}</pre>
        </details>
      </Panel>

      <Panel title="Session audit log" subtitle="Every question, tool call, gate and decision in this session · In memory only">
        {session.audit.length === 0 ? (
          <p className="preview-panel-note">Nothing yet. Ask AskAtlas a question or act on a recommendation.</p>
        ) : (
          <DataTable
            caption="Session audit log"
            head={['Time', 'Role', 'Event', 'Detail']}
            rows={session.audit.slice(0, 60).map((a) => [a.time, a.role, a.kind, a.detail])}
          />
        )}
      </Panel>
    </>
  );
}

export default LiveGovernance;
