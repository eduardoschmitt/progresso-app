import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { DiagnosticConclusionPayload } from '@/model/diagnostic';

type DiagnosticQuizResultContextValue = {
  result: DiagnosticConclusionPayload | null;
  setResult: (payload: DiagnosticConclusionPayload | null) => void;
  clearResult: () => void;
};

const DiagnosticQuizResultContext = createContext<DiagnosticQuizResultContextValue | undefined>(
  undefined,
);

export function DiagnosticQuizResultProvider({ children }: { children: React.ReactNode }) {
  const [result, setResultState] = useState<DiagnosticConclusionPayload | null>(null);

  const setResult = useCallback((payload: DiagnosticConclusionPayload | null) => {
    setResultState(payload);
  }, []);

  const clearResult = useCallback(() => {
    setResultState(null);
  }, []);

  const value = useMemo(
    () => ({
      result,
      setResult,
      clearResult,
    }),
    [result, setResult, clearResult],
  );

  return (
    <DiagnosticQuizResultContext.Provider value={value}>
      {children}
    </DiagnosticQuizResultContext.Provider>
  );
}

export function useDiagnosticQuizResultContext() {
  const context = useContext(DiagnosticQuizResultContext);

  if (!context) {
    throw new Error('useDiagnosticQuizResultContext must be used within DiagnosticQuizResultProvider');
  }

  return context;
}
