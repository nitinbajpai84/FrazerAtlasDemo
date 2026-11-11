import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquareText, RotateCcw } from 'lucide-react';
import AskAtlasDock from '../askAtlas/AskAtlasDock';
import DemoDataNotice from '../common/DemoDataNotice';
import { AtlasWorkspaceContext } from '../../context/AtlasWorkspaceContext';
import GuidedDemo from '../engine/GuidedDemo';
import { useEngine } from '../../engine/store';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import '../../styles/atlasDock.css';
import '../../styles/sharedAtlasDock.css';

function AppShell() {
  const [navigationOpen, setNavigationOpen] = useState(
    () => window.matchMedia('(min-width: 1100px)').matches,
  );
  const [demoVersion, setDemoVersion] = useState(0);
  const [resetMessage, setResetMessage] = useState('');

  const [dockState, setDockState] = useState<{
    pathname: string;
    open: boolean;
    selectedQuestionId: string | null;
  }>({
    pathname: '',
    open: false,
    selectedQuestionId: null,
  });

  const location = useLocation();
  const navigate = useNavigate();
  const engine = useEngine();

  const contentRef = useRef<HTMLElement>(null);
  const previousPath = useRef(location.pathname);
  const atlasTriggerRef = useRef<HTMLElement | null>(null);
  const atlasLauncherRef = useRef<HTMLButtonElement>(null);

  const usesSharedDock =
    location.pathname !== '/executive' &&
    location.pathname !== '/ask-atlas';

  const atlasOpen =
    usesSharedDock &&
    dockState.pathname === location.pathname &&
    dockState.open;

  const selectedQuestionId =
    dockState.pathname === location.pathname
      ? dockState.selectedQuestionId
      : null;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1100px)');

    const handleViewportChange = (event: MediaQueryListEvent) => {
      setNavigationOpen(event.matches);
    };

    mediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, []);

  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname;
      contentRef.current?.focus();
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && navigationOpen) {
        setNavigationOpen(false);

        document
          .querySelector<HTMLButtonElement>('.navigation-toggle')
          ?.focus();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [navigationOpen]);

  function handleNavigate() {
    setResetMessage('');

    setDockState({
      pathname: '',
      open: false,
      selectedQuestionId: null,
    });

    if (!window.matchMedia('(min-width: 1100px)').matches) {
      setNavigationOpen(false);
    }
  }

  function openAtlas(responseId?: string) {
    if (!usesSharedDock) {
      return;
    }

    atlasTriggerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    setDockState((current) => ({
      pathname: location.pathname,
      open: true,
      selectedQuestionId:
        responseId ??
        (current.pathname === location.pathname
          ? current.selectedQuestionId
          : null),
    }));
  }

  function closeAtlas() {
    setDockState((current) => ({
      ...current,
      open: false,
    }));

    window.requestAnimationFrame(() => {
      const previousTrigger = atlasTriggerRef.current;

      if (
        previousTrigger &&
        previousTrigger.isConnected &&
        !previousTrigger.closest('[inert]')
      ) {
        previousTrigger.focus({ preventScroll: true });
      } else {
        atlasLauncherRef.current?.focus({ preventScroll: true });
      }
    });
  }

  function resetDemo() {
    const confirmed = window.confirm(
      'Reset the demonstration? Current page interactions, Investor validation and report review will be cleared.',
    );

    if (!confirmed) {
      return;
    }

    setDockState({
      pathname: '',
      open: false,
      selectedQuestionId: null,
    });
    engine.reset();
    setDemoVersion((version) => version + 1);
    setNavigationOpen(window.matchMedia('(min-width: 1100px)').matches);
    setResetMessage('Demonstration reset. Executive Hub is ready.');
    navigate('/executive');

    window.requestAnimationFrame(() => {
      contentRef.current?.focus();
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
  }

  return (
    <AtlasWorkspaceContext.Provider
      value={{
        openAtlas,
        closeAtlas,
        atlasOpen,
      }}
    >
      <div
        className={`app-shell ${
          navigationOpen ? 'app-shell--navigation-open' : ''
        }`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <Sidebar
          open={navigationOpen}
          onNavigate={handleNavigate}
          onClose={() => setNavigationOpen(false)}
        />

        {navigationOpen && (
          <button
            type="button"
            className="navigation-backdrop"
            onClick={() => setNavigationOpen(false)}
            aria-label="Dismiss navigation"
          />
        )}

        <div className="workspace">
          <TopBar
            key={`toolbar-${demoVersion}`}
            navigationOpen={navigationOpen}
            onToggleNavigation={() => setNavigationOpen((current) => !current)}
          />

          <div className="workspace-status">
            <DemoDataNotice />

            <div className="workspace-demo-controls">
              <span className="workspace-status-description">
                Proposal demonstration · Synthetic data
              </span>

              <button
                type="button"
                className="demo-reset-button"
                onClick={resetDemo}
              >
                <RotateCcw size={14} aria-hidden="true" />
                Reset demo
              </button>
            </div>
          </div>

          <GuidedDemo key={`guide-${demoVersion}`} />

          {resetMessage && (
            <p className="demo-reset-message" role="status">
              {resetMessage}
            </p>
          )}

          <main
            id="main-content"
            className={`workspace-main ${
              atlasOpen ? 'workspace-main--shared-atlas-open' : ''
            }`}
            ref={contentRef}
            tabIndex={-1}
          >
            <div key={`workspace-${demoVersion}`} className="route-workspace">
              <Outlet />
            </div>
          </main>

          <footer className="workspace-footer">
            <span>Finance Atlas</span>
            <span>
              Automation of analysis, without automation of accountability.
            </span>
          </footer>
        </div>

        {usesSharedDock && !atlasOpen && (
          <button
            ref={atlasLauncherRef}
            type="button"
            className="executive-atlas-launcher"
            onClick={() => openAtlas()}
            aria-label="Open AskAtlas alongside the current workspace"
            aria-expanded={false}
          >
            <MessageSquareText size={20} aria-hidden="true" />
            AskAtlas
          </button>
        )}

        {atlasOpen && (
          <AskAtlasDock
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={(id) => {
              setDockState({
                pathname: location.pathname,
                open: true,
                selectedQuestionId: id,
              });
            }}
            onClose={closeAtlas}
          />
        )}
      </div>
    </AtlasWorkspaceContext.Provider>
  );
}

export default AppShell;