import type {
  DiagnosticQuizResultPayload,
  DiagnosticQuizResultViewModel,
  DiagnosticQuizSkillViewModel,
  DiagnosticQuizBadge,
  DomainStatus,
} from '@/model/quizResult';

const STATUS_CONFIG: Array<{
  threshold: number;
  status: DomainStatus;
  label: string;
  color: string;
}> = [
  { threshold: 0.85, status: 'excellent', label: 'Excelente', color: '#15803d' },
  { threshold: 0.6, status: 'good', label: 'Bom', color: '#4d7c0f' },
  { threshold: 0.3, status: 'developing', label: 'Em desenvolvimento', color: '#b45309' },
];

const CATEGORY_LABELS: Record<string, string> = {
  barreira: 'Barreiras',
  motivacao: 'Motivações',
  competencia: 'Competências',
};

export const formatDomainPercentage = (value: number): number => {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  if (value > 1) {
    return 100;
  }

  return Math.round(value * 100);
};

export const getDomainStatus = (value: number): {
  status: DomainStatus;
  label: string;
  color: string;
} => {
  if (!Number.isFinite(value) || value < 0.3) {
    return { status: 'attention', label: 'Precisa de atenção', color: '#b91c1c' };
  }

  const match = STATUS_CONFIG.find((item) => value >= item.threshold);

  if (match) {
    return { status: match.status, label: match.label, color: match.color };
  }

  return { status: 'attention', label: 'Precisa de atenção', color: '#b91c1c' };
};

export const getCategoryTitle = (category: string): string =>
  CATEGORY_LABELS[category.toLowerCase()] ?? category;

export const calculateAccuracy = (totalCorrect: number, totalQuestions: number): number => {
  if (!totalQuestions || totalQuestions <= 0) {
    return 0;
  }

  const accuracy = totalCorrect / totalQuestions;

  return Math.min(Math.max(accuracy, 0), 1);
};

export const getPerformanceFeedback = (accuracy: number): string => {
  if (accuracy >= 0.85) {
    return 'Excelente desempenho! Você está dominando os temas do diagnóstico.';
  }

  if (accuracy >= 0.6) {
    return 'Bom trabalho! Continue revisando para consolidar seu conhecimento.';
  }

  if (accuracy >= 0.3) {
    return 'Você está progredindo. Reveja os conteúdos indicados para evoluir ainda mais.';
  }

  return 'Não desanime! Explore os materiais recomendados para melhorar nas próximas tentativas.';
};

const normalizeBadge = (
  badge: Record<string, unknown>,
  index: number,
): DiagnosticQuizBadge | null => {
  const id = typeof badge.id === 'string' ? badge.id : `badge-${index}`;
  const titleCandidate =
    (typeof badge.nome === 'string' && badge.nome) ||
    (typeof badge.titulo === 'string' && badge.titulo);

  if (!titleCandidate) {
    return null;
  }

  return {
    id,
    title: titleCandidate,
    description: typeof badge.descricao === 'string' ? badge.descricao : undefined,
    iconUrl: typeof badge.iconeUrl === 'string' ? badge.iconeUrl : undefined,
  };
};

const buildSkillViewModel = (
  skill: DiagnosticQuizResultPayload['habilidades'][number],
): DiagnosticQuizSkillViewModel => {
  const domain = Number.isFinite(skill.dominio) ? skill.dominio : 0;
  const domainPercentage = formatDomainPercentage(domain);
  const status = getDomainStatus(domain);

  return {
    id: skill.habilidadeId,
    name: skill.nome,
    category: skill.categoria,
    categoryLabel: getCategoryTitle(skill.categoria),
    attempts: skill.tentativas,
    hits: skill.acertos,
    domain,
    domainPercentage,
    status: status.status,
    statusLabel: status.label,
    statusColor: status.color,
  };
};

export const buildQuizResultViewModel = (
  payload: DiagnosticQuizResultPayload,
): DiagnosticQuizResultViewModel => {
  const accuracy = calculateAccuracy(payload.totalCorretas, payload.totalQuestoes);
  const feedback = getPerformanceFeedback(accuracy);
  const skills = payload.habilidades.map(buildSkillViewModel);

  const categoriesMap = new Map<string, DiagnosticQuizSkillViewModel[]>();

  for (const skill of skills) {
    const existing = categoriesMap.get(skill.category) ?? [];
    existing.push(skill);
    categoriesMap.set(skill.category, existing);
  }

  const categories = Array.from(categoriesMap.entries())
    .map(([category, items]) => ({
      category,
      title: getCategoryTitle(category),
      skills: items.sort((a, b) => b.domain - a.domain),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  const badges: DiagnosticQuizBadge[] = Array.isArray(payload.novasInsignias)
    ? payload.novasInsignias
        .map((badge, index) =>
          badge && typeof badge === 'object' ? normalizeBadge(badge as Record<string, unknown>, index) : null,
        )
        .filter((item): item is DiagnosticQuizBadge => Boolean(item))
    : [];

  return {
    summary: {
      score: payload.pontuacao,
      totalQuestions: payload.totalQuestoes,
      totalCorrect: payload.totalCorretas,
      accuracy,
      feedback,
    },
    categories,
    badges,
  };
};
