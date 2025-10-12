import { useMemo } from 'react';

import { useDiagnosticQuizResultContext } from '@/context/DiagnosticQuizResultContext';
import { mapDiagnosticResult } from '@/features/diagnostic-result/utils/mappers';
import type { DiagnosticResultViewModel } from '@/features/diagnostic-result/types';

export function useDiagnosticResultViewModel(): {
  viewModel: DiagnosticResultViewModel | null;
  clearResult: () => void;
} {
  const { result, clearResult } = useDiagnosticQuizResultContext();

  const viewModel = useMemo(() => {
    if (!result) {
      return null;
    }

    return mapDiagnosticResult(result);
  }, [result]);

  return { viewModel, clearResult };
}
