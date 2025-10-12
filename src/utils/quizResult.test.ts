import { describe, expect, it } from 'vitest';

import type { DiagnosticQuizResultPayload } from '@/model/quizResult';
import {
  buildQuizResultViewModel,
  calculateAccuracy,
  formatDomainPercentage,
  getDomainStatus,
  getPerformanceFeedback,
} from './quizResult';

describe('quizResult utils', () => {
  it('formats domain percentage within expected bounds', () => {
    expect(formatDomainPercentage(0)).toBe(0);
    expect(formatDomainPercentage(0.456)).toBe(46);
    expect(formatDomainPercentage(1.2)).toBe(100);
    expect(formatDomainPercentage(-1)).toBe(0);
  });

  it('returns the correct domain status for each threshold', () => {
    expect(getDomainStatus(0.9).status).toBe('excellent');
    expect(getDomainStatus(0.75).status).toBe('good');
    expect(getDomainStatus(0.4).status).toBe('developing');
    expect(getDomainStatus(0.1).status).toBe('attention');
  });

  it('calculates accuracy within 0 and 1', () => {
    expect(calculateAccuracy(8, 10)).toBe(0.8);
    expect(calculateAccuracy(0, 0)).toBe(0);
    expect(calculateAccuracy(-2, 10)).toBe(0);
    expect(calculateAccuracy(15, 10)).toBe(1);
  });

  it('generates feedback messages for each performance bracket', () => {
    expect(getPerformanceFeedback(0.9)).toContain('Excelente');
    expect(getPerformanceFeedback(0.65)).toContain('Bom');
    expect(getPerformanceFeedback(0.4)).toContain('progredindo');
    expect(getPerformanceFeedback(0.1)).toContain('Não desanime');
  });

  it('builds a view model grouped by category', () => {
    const payload: DiagnosticQuizResultPayload = {
      pontuacao: 0,
      totalQuestoes: 10,
      totalCorretas: 0,
      habilidades: [
        {
          habilidadeId: '1',
          codigo: 'barreira_nenhum',
          nome: 'Barreira: nenhum',
          dominio: 1,
          tentativas: 1,
          acertos: 1,
          categoria: 'barreira',
        },
        {
          habilidadeId: '2',
          codigo: 'mot_economia',
          nome: 'Motivação: economia',
          dominio: 0.6,
          tentativas: 1,
          acertos: 1,
          categoria: 'motivacao',
        },
        {
          habilidadeId: '3',
          codigo: 'reciclagem_conhecimento',
          nome: 'Reciclagem: conhecimento',
          dominio: 0.2,
          tentativas: 3,
          acertos: 0,
          categoria: 'competencia',
        },
      ],
      novasInsignias: [],
    };

    const viewModel = buildQuizResultViewModel(payload);

    expect(viewModel.summary.totalQuestions).toBe(10);
    expect(viewModel.categories).toHaveLength(3);
    expect(viewModel.categories[0].skills[0].id).toBe('1');
    expect(viewModel.categories.find((item) => item.category === 'competencia')?.skills[0].status).toBe(
      'attention',
    );
  });
});
