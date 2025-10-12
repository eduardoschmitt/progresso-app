import { useMemo } from 'react';

import type { DiagnosticQuizResultPayload, DiagnosticQuizResultViewModel } from '@/model/quizResult';
import { buildQuizResultViewModel } from '@/utils/quizResult';

export type UseDiagnosticQuizResultReturn = {
  result: DiagnosticQuizResultViewModel | null;
};

export function useDiagnosticQuizResult(
  payload: DiagnosticQuizResultPayload | null | undefined,
): UseDiagnosticQuizResultReturn {
  const result = useMemo(
    () => (payload ? buildQuizResultViewModel(payload) : null),
    [payload],
  );

  return { result };
}
