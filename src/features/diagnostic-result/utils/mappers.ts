import type {
  DiagnosticConclusionResult,
  DiagnosticResultViewModel,
  DiagnosticSkillCategory,
  DiagnosticSkillViewModel,
} from '@/features/diagnostic-result/types';
import { getCategoryTitle, formatPercentage, normalizeSkills, calculateAccuracy } from './formatters';
import { buildSummaryFeedback, getSkillStatus } from './status';

export function mapDiagnosticResult(
  result: DiagnosticConclusionResult,
): DiagnosticResultViewModel {
  const accuracy = calculateAccuracy(result);
  const summary = buildSummaryFeedback(
    accuracy,
    result.pontuacao,
    result.totalQuestoes,
    result.totalCorretas,
  );

  const categoriesMap = new Map<string, DiagnosticSkillViewModel[]>();

  normalizeSkills(result.habilidades).forEach((skill) => {
    const status = getSkillStatus(skill.dominio);
    const categoryKey = skill.categoria;
    const categoryTitle = getCategoryTitle(categoryKey);

    const categorySkills = categoriesMap.get(categoryKey) ?? [];
    const viewModel: DiagnosticSkillViewModel = {
      id: skill.habilidadeId,
      code: skill.codigo,
      name: skill.nome,
      categoryKey,
      categoryTitle,
      attempts: skill.tentativas,
      correctAnswers: skill.acertos,
      domain: skill.dominio,
      domainPercentage: formatPercentage(skill.dominio),
      status,
    };

    categorySkills.push(viewModel);
    categoriesMap.set(categoryKey, categorySkills);
  });

  const categories: DiagnosticSkillCategory[] = Array.from(categoriesMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, skills]) => ({
      key: skills[0]?.categoryKey ?? 'outros',
      title: skills[0]?.categoryTitle ?? 'Outros',
      skills,
    }));

  return {
    summary,
    categories,
  };
}
