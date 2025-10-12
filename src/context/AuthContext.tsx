import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  AuthSession,
  clearDiagnosticStatus,
  deleteSession,
  getDiagnosticStatus,
  getSession,
  saveDiagnosticStatus,
  saveSession,
} from '@/service/storage/authStorage';

type AuthContextValue = {
  session: AuthSession | null;
  isLoading: boolean;
  isDiagnosticComplete: boolean;
  setSession: (session: AuthSession) => Promise<void>;
  clearSession: () => Promise<void>;
  markDiagnosticComplete: (complete: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDiagnosticComplete, setIsDiagnosticComplete] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const storedSession = await getSession();
        const diagnosticStatus = await getDiagnosticStatus();

        if (!isMounted) {
          return;
        }

        setSessionState(storedSession);
        setIsDiagnosticComplete(diagnosticStatus);
      } catch (error) {
        console.error('Failed to load stored session', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSetSession = useCallback(async (newSession: AuthSession) => {
    setSessionState(newSession);
    setIsDiagnosticComplete(false);
    await saveSession(newSession);
    await clearDiagnosticStatus();
  }, []);

  const handleClearSession = useCallback(async () => {
    setSessionState(null);
    setIsDiagnosticComplete(false);
    await deleteSession();
    await clearDiagnosticStatus();
  }, []);

  const markDiagnosticComplete = useCallback(async (complete: boolean) => {
    setIsDiagnosticComplete(complete);

    if (complete) {
      await saveDiagnosticStatus(true);
      return;
    }

    await clearDiagnosticStatus();
  }, []);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      isDiagnosticComplete,
      setSession: handleSetSession,
      clearSession: handleClearSession,
      markDiagnosticComplete,
    }),
    [session, isLoading, isDiagnosticComplete, handleSetSession, handleClearSession, markDiagnosticComplete],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}
