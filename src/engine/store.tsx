// React bridge to the engine: role switching, re-render on data change, recommendation decisions.
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ROLES, audit, loadValuationRecord, resetEngine, session } from './data';
import type { RoleKey } from './data';

interface EngineContextValue {
  roleKey: RoleKey;
  version: number;
  decisions: Record<string, string>;
  setRole: (role: RoleKey) => void;
  decide: (id: string, decision: string) => void;
  validateValuation: () => void;
  touch: () => void;
  reset: () => void;
}

const EngineContext = createContext<EngineContextValue | null>(null);

export function EngineProvider({ children }: { children: ReactNode }) {
  const [roleKey, setRoleKey] = useState<RoleKey>(session.role);
  const [version, setVersion] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, string>>({});

  const touch = useCallback(() => setVersion((v) => v + 1), []);

  const value = useMemo<EngineContextValue>(
    () => ({
      roleKey,
      version,
      decisions,
      touch,
      setRole(next) {
        session.role = next;
        audit('Role switched', ROLES[next].name);
        setRoleKey(next);
        touch();
      },
      decide(id, decision) {
        audit('Decision gate', `${decision}: ${id}`);
        setDecisions((current) => ({ ...current, [id]: decision }));
        touch();
      },
      validateValuation() {
        loadValuationRecord();
        touch();
      },
      reset() {
        resetEngine();
        setRoleKey('cfo');
        setDecisions({});
        touch();
      },
    }),
    [roleKey, version, decisions, touch],
  );

  return <EngineContext.Provider value={value}>{children}</EngineContext.Provider>;
}

export function useEngine(): EngineContextValue {
  const context = useContext(EngineContext);
  if (!context) throw new Error('useEngine must be used within EngineProvider');
  return context;
}
