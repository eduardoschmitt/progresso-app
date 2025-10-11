import type { DiagnosticQuizQuestion } from './quiz-api';

export const countAnsweredQuestions = (
  answers: Record<string, string | string[]>,
): number =>
  Object.values(answers).reduce<number>((acc, value) => {
    if (Array.isArray(value)) {
      return value.length > 0 ? acc + 1 : acc;
    }

    return value ? acc + 1 : acc;
  }, 0);

export const calculateCompletionPercentage = (
  answered: number,
  total: number,
): number => {
  if (total <= 0) {
    return 0;
  }

  const ratio = answered / total;
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
};

export const clampQuestionIndex = (
  index: number,
  questions: DiagnosticQuizQuestion[] | undefined,
): number => {
  if (!questions?.length) {
    return 0;
  }

  if (Number.isNaN(index) || index < 0) {
    return 0;
  }

  if (index >= questions.length) {
    return questions.length - 1;
  }

  return index;
};
