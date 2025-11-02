import type { DiagnosticResultSummary, SkillStatus } from '@/features/diagnostic-result/types';

const SKILL_STATUS_THRESHOLDS = {
  excellent: 0.75,
  good: 0.5,
};

export function getSkillStatus(domain: number): SkillStatus {
  if (domain >= SKILL_STATUS_THRESHOLDS.excellent) {
    return {
      level: 'excelente',
      label: 'Excelente',
      message: 'Você demonstra alto domínio nesta habilidade. Continue fortalecendo esse resultado!',
    };
  }

  if (domain >= SKILL_STATUS_THRESHOLDS.good) {
    return {
      level: 'bom',
      label: 'Bom',
      message: 'Bom progresso! Com algumas práticas extras você chegará ao domínio completo.',
    };
  }

  return {
    level: 'atencao',
    label: 'Precisa de atenção',
    message: 'Vamos direcionar esforços para evoluir nesta habilidade. Conte com os próximos conteúdos!',
  };
}

export function buildSummaryFeedback(
  accuracy: number,
  score: number,
  totalQuestions: number,
  correctAnswers: number,
): DiagnosticResultSummary {
  if (accuracy >= 0.75) {
    return {
      score,
      totalQuestions,
      correctAnswers,
      accuracy,
      feedbackTitle: 'Excelente trabalho!',
      feedbackMessage: 'Você concluiu o diagnóstico com ótimo desempenho. Mantenha esse ritmo e avance para novos desafios.',
    };
  }

  if (accuracy >= 0.5) {
    return {
      score,
      totalQuestions,
      correctAnswers,
      accuracy,
      feedbackTitle: 'Bom caminho!',
      feedbackMessage: 'Você já domina parte importante dos temas. Pequenos ajustes vão elevar ainda mais seu resultado.',
    };
  }

  return {
    score,
    totalQuestions,
    correctAnswers,
    accuracy,
    feedbackTitle: 'Diagnóstico inicial concluído!',
    feedbackMessage:
      'Este é o ponto de partida para personalizarmos sua jornada. A partir daqui, vamos indicar conteúdos sob medida para evoluir no seu ritmo.',
  };
}
