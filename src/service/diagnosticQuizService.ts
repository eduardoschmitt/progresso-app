import { ApiError, request, withAuthorization } from '@/api/httpClient';
import type {
  DiagnosticAnswerPayload,
  DiagnosticConclusionPayload,
  DiagnosticQuizPayload,
  DiagnosticSessionPayload,
  DiagnosticSessionStatusPayload,
} from '@/model/diagnostic';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const shouldFallback = (error: unknown) =>
  error instanceof ApiError && [403, 404, 405, 409, 422, 500].includes(error.status);

export const getDiagnosticQuiz = (token: string) =>
  request<DiagnosticQuizPayload>({
    url: '/api/quizzes/diagnostico',
    method: 'GET',
    ...withAuthorization(token),
  });

export const createDiagnosticQuizSession = (token: string, usuarioId: string) =>
  request<DiagnosticSessionPayload>({
    url: '/api/quizzes/diagnostico/sessoes',
    method: 'POST',
    data: { usuarioId },
    ...withAuthorization(token),
  });

export const getDiagnosticQuizSessionStatus = (token: string, usuarioId: string) =>
  request<DiagnosticSessionStatusPayload>({
    url: `/api/quizzes/diagnostico/sessoes/usuarios/${usuarioId}/status`,
    method: 'GET',
    ...withAuthorization(token),
  });

export const submitDiagnosticQuizAnswer = (
  token: string,
  sessaoId: string,
  payload: { questaoId: string; opcaoId: string },
) =>
  request<DiagnosticAnswerPayload>({
    url: `/api/quizzes/diagnostico/sessoes/${sessaoId}/respostas`,
    method: 'POST',
    data: payload,
    ...withAuthorization(token),
  });

export const concludeDiagnosticQuizSession = (token: string, sessaoId: string) =>
  request<DiagnosticConclusionPayload>({
    url: `/api/quizzes/diagnostico/sessoes/${sessaoId}/concluir`,
    method: 'POST',
    ...withAuthorization(token),
  });

export const updateDiagnosticQuizAnswer = async (
  token: string,
  sessaoId: string,
  questionId: string,
  optionId: string,
) => {
  const basePath = `/api/quizzes/diagnostico/sessoes/${sessaoId}/respostas`;

  const attempts: {
    method: HttpMethod;
    url: string;
    data: Record<string, string>;
  }[] = [
    {
      method: 'POST',
      url: basePath,
      data: { questaoId: questionId, opcaoId: optionId },
    },
    { method: 'PUT', url: `${basePath}/${questionId}`, data: { opcaoId: optionId } },
    {
      method: 'PUT',
      url: basePath,
      data: { questaoId: questionId, opcaoId: optionId },
    },
    { method: 'PATCH', url: `${basePath}/${questionId}`, data: { opcaoId: optionId } },
    {
      method: 'PATCH',
      url: basePath,
      data: { questaoId: questionId, opcaoId: optionId },
    },
  ];

  let lastError: ApiError | null = null;

  for (const { method, url, data } of attempts) {
    try {
      return await request<DiagnosticAnswerPayload>({
        url,
        method,
        data,
        ...withAuthorization(token),
      });
    } catch (error) {
      if (error instanceof ApiError) {
        lastError = error;

        if (shouldFallback(error)) {
          continue;
        }
      }

      throw error;
    }
  }

  try {
    await request<void>({
      url: `${basePath}/${questionId}`,
      method: 'DELETE',
      ...withAuthorization(token),
    });
  } catch (error) {
    if (!(error instanceof ApiError) || !shouldFallback(error)) {
      throw error;
    }
  }

  try {
    return await request<DiagnosticAnswerPayload>({
      url: basePath,
      method: 'POST',
      data: { questaoId: questionId, opcaoId: optionId },
      ...withAuthorization(token),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      lastError = error;
    }

    throw lastError ?? error;
  }
};
