import { describe, expect, it } from 'vitest';

import {
  calculateCompletionPercentage,
  clampQuestionIndex,
  countAnsweredQuestions,
} from '@/src/lib/quiz-utils';

const sampleQuestions = [
  { id: '1', enunciado: 'Pergunta 1', tipo: 'UNICA_ESCOLHA', opcoes: [] },
  { id: '2', enunciado: 'Pergunta 2', tipo: 'UNICA_ESCOLHA', opcoes: [] },
  { id: '3', enunciado: 'Pergunta 3', tipo: 'UNICA_ESCOLHA', opcoes: [] },
];

describe('countAnsweredQuestions', () => {
  it('counts single-choice answers', () => {
    const answers = { '1': 'opcao-1', '2': '', '3': 'opcao-3' };
    expect(countAnsweredQuestions(answers)).toBe(2);
  });

  it('counts multi-choice arrays as answered when not empty', () => {
    const answers = { '1': ['opcao-1', 'opcao-2'], '2': [], '3': '' };
    expect(countAnsweredQuestions(answers)).toBe(1);
  });
});

describe('calculateCompletionPercentage', () => {
  it('returns 0 when total is zero', () => {
    expect(calculateCompletionPercentage(3, 0)).toBe(0);
  });

  it('caps at 100%', () => {
    expect(calculateCompletionPercentage(6, 4)).toBe(100);
  });

  it('rounds to the nearest integer', () => {
    expect(calculateCompletionPercentage(1, 3)).toBe(33);
  });
});

describe('clampQuestionIndex', () => {
  it('returns zero for negative values', () => {
    expect(clampQuestionIndex(-1, sampleQuestions)).toBe(0);
  });

  it('returns last index when greater than list size', () => {
    expect(clampQuestionIndex(10, sampleQuestions)).toBe(2);
  });

  it('keeps value when within bounds', () => {
    expect(clampQuestionIndex(1, sampleQuestions)).toBe(1);
  });

  it('returns zero when questions are empty', () => {
    expect(clampQuestionIndex(5, [])).toBe(0);
  });
});
