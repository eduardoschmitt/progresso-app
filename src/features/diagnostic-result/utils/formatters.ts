import type {
  DiagnosticConclusionResult,
  DiagnosticConclusionResultSkill,
} from '@/features/diagnostic-result/types';

const CATEGORY_TITLES: Record<string, string> = {
  barreira: 'Barreiras',
  motivacao: 'Motivação',
  competencia: 'Competências',
};

export function getCategoryTitle(category: string): string {
  return CATEGORY_TITLES[category] ?? category;
}

export function formatPercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const percentage = Math.round(value * 100);
  return Math.max(0, Math.min(100, percentage));
}

export function calculateAccuracy(result: DiagnosticConclusionResult): number {
  if (result.totalQuestoes <= 0) {
    return 0;
  }

  return result.totalCorretas / result.totalQuestoes;
}

export function normalizeSkills(
  skills: DiagnosticConclusionResultSkill[],
): DiagnosticConclusionResultSkill[] {
  return [...skills].sort((a, b) => {
    if (a.categoria === b.categoria) {
      return a.nome.localeCompare(b.nome);
    }

    return a.categoria.localeCompare(b.categoria);
  });
}
