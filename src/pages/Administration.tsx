import Panel from '../components/common/Panel';
import LiveGovernance from '../components/engine/LiveGovernance';
import PageHeader from '../components/layout/PageHeader';
import {
  governanceAudit,
  governanceControls,
  governanceMetrics,
  governanceRoles,
} from '../data/previewData';

function Administration() {
  return (
    <>
      <PageHeader
        title="Administration"
        subtitle="Illustrative administration and governance view"
      />

      <div className="preview-hub-content">
        <div className="preview-scope-notice">
          The first three panels are live for this session: the role model that the
          agent tools enforce, the prompt in use, and the audit log. The panels below
          them are illustrative. No authentication or persistent logging is enabled.
        </div>

        <LiveGovernance />

        <section className="preview-metric-grid" aria-label="Illustrative administration metrics">
          {governanceMetrics.map((metric) => (
            <article className="preview-metric-card" key={metric.label}>
              <h2>{metric.label}</h2>
              <strong>{metric.value}</strong>
              <p>{metric.note}</p>
            </article>
          ))}
        </section>

        <Panel
          title="Users, roles and proposed access"
          subtitle="Illustrative role matrix · All demo routes remain accessible"
        >
          <div className="table-scroll">
            <table className="data-table governance-role-table">
              <caption className="sr-only">
                Illustrative roles and proposed scopes, not enforced permissions
              </caption>
              <thead>
                <tr>
                  <th scope="col">Role</th>
                  <th scope="col">Proposed row-level scope</th>
                  <th scope="col">Proposed hub access</th>
                  <th scope="col" className="numeric-cell">Mock users</th>
                </tr>
              </thead>
              <tbody>
                {governanceRoles.map((role) => (
                  <tr key={role.role}>
                    <th scope="row">{role.role}</th>
                    <td>{role.scope}</td>
                    <td>{role.hubs}</td>
                    <td className="numeric-cell">{role.users}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <section className="governance-control-grid" aria-label="Illustrative governance controls">
          {governanceControls.map((control) => (
            <article className="governance-control" key={control.title}>
              <h2>{control.title}</h2>
              <p>{control.detail}</p>
            </article>
          ))}
        </section>

        <Panel
          title="Audit log"
          subtitle="Fixed illustrative events · Not the Investor workflow action trail"
        >
          <div className="table-scroll">
            <table className="data-table governance-audit-table">
              <caption className="sr-only">
                Fixed mock administration audit events
              </caption>
              <thead>
                <tr>
                  <th scope="col">Mock timestamp</th>
                  <th scope="col">Illustrative action</th>
                  <th scope="col">Illustrative actor</th>
                </tr>
              </thead>
              <tbody>
                {governanceAudit.map((event) => (
                  <tr key={event.action}>
                    <td>{event.time}</td>
                    <th scope="row">{event.action}</th>
                    <td>{event.actor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}

export default Administration;