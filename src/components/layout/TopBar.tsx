import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../engine/data';
import type { RoleKey } from '../../engine/data';
import { useEngine } from '../../engine/store';
import { signals } from '../../engine/tools';
import { Bell, Menu, Search, UserRound, X } from 'lucide-react';

interface TopBarProps {
  navigationOpen: boolean;
  onToggleNavigation: () => void;
}

function TopBar({ navigationOpen, onToggleNavigation }: TopBarProps) {
  const [groupView, setGroupView] = useState('Group View');
  const [financialYear, setFinancialYear] = useState('FY2026');
  const [currency, setCurrency] = useState('SGD');
  const [search, setSearch] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const { roleKey, setRole } = useEngine();
  const alerts = signals();

  return (
    <header className="top-bar">
      <div className="top-bar-leading">
        <button
          type="button"
          className="icon-button navigation-toggle"
          onClick={onToggleNavigation}
          aria-label={navigationOpen ? 'Collapse navigation' : 'Open navigation'}
          aria-expanded={navigationOpen}
          aria-controls="primary-sidebar"
        >
          <Menu size={21} aria-hidden="true" />
        </button>

        <form
          className="workspace-search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            if (!search.trim()) {
              setSearchMessage('Enter a Finance question to send to AskAtlas.');
              return;
            }
            navigate('/ask-atlas', { state: { q: search.trim() } });
            setSearch('');
          }}
        >
          <Search size={17} aria-hidden="true" />
          <label htmlFor="workspace-search" className="sr-only">
            Search Finance Atlas
          </label>
          <input
            id="workspace-search"
            type="search"
            placeholder="Ask Finance Atlas a question"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setSearchMessage('');
            }}
          />
          <button type="submit" className="sr-only">
            Submit search
          </button>

          {searchMessage && (
            <div className="search-feedback" role="status">
              <span>{searchMessage}</span>
              <button
                type="button"
                className="icon-button"
                onClick={() => setSearchMessage('')}
                aria-label="Dismiss search message"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </form>
      </div>

      <div className="top-bar-controls">
        <label className="toolbar-selector">
          <span className="sr-only">Workspace view, demonstration only</span>
          <select
            value={groupView}
            onChange={(event) => setGroupView(event.target.value)}
            title="Demonstration selector; does not filter financial data yet"
          >
            <option>Group View</option>
            <option>Singapore View</option>
            <option>Australia View</option>
          </select>
        </label>

        <label className="toolbar-selector">
          <span className="sr-only">Financial year, demonstration only</span>
          <select
            value={financialYear}
            onChange={(event) => setFinancialYear(event.target.value)}
            title="Demonstration selector; does not filter financial data yet"
          >
            <option>FY2026</option>
            <option>FY2025</option>
            <option>FY2024</option>
          </select>
        </label>

        <label className="toolbar-selector toolbar-selector--currency">
          <span className="sr-only">Currency, demonstration only</span>
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            title="Demonstration selector; no currency conversion is performed"
          >
            <option>SGD</option>
            <option>AUD</option>
            <option>USD</option>
          </select>
        </label>

        <div className="notification-control">
          <button
            type="button"
            className="icon-button"
            onClick={() => setNotificationsOpen((current) => !current)}
            aria-label="View demonstration notifications"
            aria-expanded={notificationsOpen}
            aria-controls="notification-panel"
          >
            <Bell size={20} aria-hidden="true" />
            {alerts.length > 0 && (
              <span className="notification-count">{alerts.length}</span>
            )}
          </button>

          {notificationsOpen && (
            <section
              id="notification-panel"
              className="notification-panel"
              aria-label="Notifications"
            >
              <strong>Atlas Recommends · {alerts.length} signals</strong>
              <ul className="notification-list">
                {alerts.slice(0, 6).map((alert) => (
                  <li key={alert.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate('/ask-atlas', { state: { q: alert.question } });
                      }}
                    >
                      {alert.title}
                      <small>{alert.originatingHub} · {alert.severity}</small>
                    </button>
                  </li>
                ))}
              </ul>
              <span>Computed from the shared data for your role</span>
            </section>
          )}
        </div>

        <div className="user-profile" aria-label="Signed-in role">
          <span className="user-avatar">
            <UserRound size={19} aria-hidden="true" />
          </span>
          <span className="user-profile-text">
            <strong>Signed in as</strong>
            <select
              className="role-switch"
              aria-label="Switch role to see row-level security"
              value={roleKey}
              onChange={(event) => setRole(event.target.value as RoleKey)}
            >
              {(Object.keys(ROLES) as RoleKey[]).map((key) => (
                <option key={key} value={key}>
                  {ROLES[key].name}
                </option>
              ))}
            </select>
          </span>
        </div>
      </div>
    </header>
  );
}

export default TopBar;