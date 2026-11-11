import { NavLink } from 'react-router-dom';
import {
  Building2,
  ChartNoAxesCombined,
  ChevronRight,
  Database,
  FileText,
  HardHat,
  Landmark,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  ShieldCheck,
  Workflow,
  X,
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
  onClose: () => void;
}

const navigationItems = [
  {
    to: '/executive',
    label: 'Executive Hub',
    icon: LayoutDashboard,
  },
  {
    to: '/investor',
    label: 'Investor Hub',
    icon: Building2,
  },
  {
    to: '/developer',
    label: 'Developer Hub',
    icon: HardHat,
  },
  {
    to: '/manager',
    label: 'Manager Hub',
    icon: ChartNoAxesCombined,
  },
  {
    to: '/treasury',
    label: 'Treasury & Capital Hub',
    icon: Landmark,
  },
  {
    to: '/ask-atlas',
    label: 'AskAtlas',
    icon: MessageSquareText,
  },
  {
    to: '/data-explorer',
    label: 'Data Explorer',
    icon: Database,
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: FileText,
  },
  {
    to: '/administration',
    label: 'Administration',
    icon: Settings,
  },
  {
    to: '/how-it-works',
    label: 'How Atlas works',
    icon: Workflow,
  },
];

function Sidebar({ open, onNavigate, onClose }: SidebarProps) {
  return (
    <aside
      id="primary-sidebar"
      className={`sidebar ${open ? 'sidebar--open' : ''}`}
      aria-label="Atlas navigation"
      inert={!open}
    >
      <header className="sidebar-brand">
        <div>
          <img src="/logo.png" alt="PwC" className="brand-logo" />
          <p className="brand-title">
            Atlas
          </p>
          <p className="brand-caption">
            Connected Finance intelligence
          </p>
        </div>

        <button
          type="button"
          className="icon-button sidebar-close"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </header>

      <div className="sidebar-section-label">Workspaces</div>

      <nav className="sidebar-navigation" aria-label="Primary navigation">
        {navigationItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `navigation-link ${
                isActive ? 'navigation-link--active' : ''
              }`
            }
          >
            <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
            <span>{label}</span>
            <ChevronRight
              size={15}
              className="navigation-chevron"
              aria-hidden="true"
            />
          </NavLink>
        ))}
      </nav>

      <footer className="sidebar-footer">
        <ShieldCheck size={20} aria-hidden="true" />
        <div>
          <strong>Human-led. Evidence-backed.</strong>
          <p>Finance retains accountability.</p>
        </div>
      </footer>
    </aside>
  );
}

export default Sidebar;
