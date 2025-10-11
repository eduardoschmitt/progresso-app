import { authorizedRequest } from './api';

export type DiagnosticQuizOption = {
  id: string;
  titulo?: string;
  descricao?: string;
};

export type DiagnosticQuizQuestion = {
  id: string;
  enunciado: string;
  tipo: 'UNICA_ESCOLHA' | 'MULTIPLA_ESCOLHA' | string;
  opcoes: DiagnosticQuizOption[];
};

export type DiagnosticQuizResponse = {
  concluido: boolean;
  questoes: DiagnosticQuizQuestion[];
};

export type DiagnosticQuizSessionPayload = {
  usuarioId: string;
};

export type DiagnosticQuizSessionResponse = {
  sessaoId: string;
};

export type DiagnosticQuizAnswerPayload = {
  questaoId: string;
  opcaoId: string;
};

export type DiagnosticQuizAnswerResponse = {
  concluido?: boolean;
  respondidas?: number;
  total?: number;
};

export const fetchDiagnosticQuiz = () =>
  authorizedRequest<DiagnosticQuizResponse>('/api/quizzes/diagnostico');

export const createOrResumeDiagnosticSession = (payload: DiagnosticQuizSessionPayload) =>
  authorizedRequest<DiagnosticQuizSessionResponse>(
    '/api/quizzes/diagnostico/sessoes',
    { method: 'POST', body: payload },
  );

export const submitDiagnosticAnswer = (
  sessaoId: string,
  payload: DiagnosticQuizAnswerPayload,
) =>
  authorizedRequest<DiagnosticQuizAnswerResponse>(
    `/api/quizzes/diagnostico/sessoes/${sessaoId}/respostas`,
    { method: 'POST', body: payload },
  );
