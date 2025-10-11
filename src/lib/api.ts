import { Platform } from 'react-native';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
};

const AUTH_HEADER_KEY = 'Authorization';

export type RegisterPayload = {
  nome: string;
  email: string;
  senha: string;
};

export type LoginPayload = {
  email: string;
  senha: string;
};

export type LoginResponse = {
  id: string;
  nome: string;
  email: string;
  senha: string | null;
  token: string;
  tokenType: string;
  expiresAt: string;
};

class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const FALLBACK_DEV_URL = 'http://10.0.2.2:8080';

const normalizedBaseUrl = (() => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  if (__DEV__) {
    return FALLBACK_DEV_URL;
  }

  return undefined;
})();

if (!normalizedBaseUrl) {
  throw new Error(
    'EXPO_PUBLIC_API_URL não configurada. Defina a variável de ambiente para apontar para sua API de produção.',
  );
}

const buildUrl = (path: string) => {
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBaseUrl}${sanitizedPath}`;
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, headers } = options;

  const response = await fetch(buildUrl(path), {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload || 'Erro ao comunicar com o servidor.'
        : payload?.message || 'Erro ao comunicar com o servidor.';

    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
};

const withAuthorization = (token: string, options: RequestOptions = {}): RequestOptions => {
  const nextHeaders: Record<string, string> = {
    ...(options.headers ?? {}),
    [AUTH_HEADER_KEY]: `Bearer ${token}`,
  };

  return {
    ...options,
    headers: nextHeaders,
  };
};

export const registrarUsuario = (dados: RegisterPayload) =>
  request<void>('/api/usuarios/registrar', { method: 'POST', body: dados });

export const loginUsuario = (dados: LoginPayload) =>
  request<LoginResponse>('/api/usuarios/login', { method: 'POST', body: dados });

export type DiagnosticQuizOption = {
  id: string;
  rotulo: string;
  correta?: boolean;
  iconeUrl: string | null;
};

export type DiagnosticQuizQuestion = {
  id: string;
  enunciado: string;
  tipo: string;
  ordem: number;
  opcoes: DiagnosticQuizOption[];
};

export type DiagnosticQuizPayload = {
  id: string;
  titulo: string;
  descricao: string;
  questoes: DiagnosticQuizQuestion[];
  concluido?: boolean;
  status?: string;
};

export type DiagnosticSessionPayload = {
  id?: string;
  sessaoId?: string;
  status?: string;
};

export type DiagnosticAnswerPayload = {
  concluido?: boolean;
  mensagem?: string;
};

export const getDiagnosticQuiz = (token: string) =>
  request<DiagnosticQuizPayload>('/api/quizzes/diagnostico', withAuthorization(token));

export const createDiagnosticQuizSession = (token: string, usuarioId: string) =>
  request<DiagnosticSessionPayload>('/api/quizzes/diagnostico/sessoes',
    withAuthorization(token, { method: 'POST', body: { usuarioId } }));

export const submitDiagnosticQuizAnswer = (
  token: string,
  sessaoId: string,
  payload: { questaoId: string; opcaoId: string },
) =>
  request<DiagnosticAnswerPayload>(
    `/api/quizzes/diagnostico/sessoes/${sessaoId}/respostas`,
    withAuthorization(token, { method: 'POST', body: payload }),
  );

export const updateDiagnosticQuizAnswer = async (
  token: string,
  sessaoId: string,
  questionId: string,
  optionId: string,
) => {
  const basePath = `/api/quizzes/diagnostico/sessoes/${sessaoId}/respostas`;

  try {
    return await request<DiagnosticAnswerPayload>(
      `${basePath}/${questionId}`,
      withAuthorization(token, { method: 'PUT', body: { opcaoId: optionId } }),
    );
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
      return request<DiagnosticAnswerPayload>(
        basePath,
        withAuthorization(token, {
          method: 'PUT',
          body: { questaoId: questionId, opcaoId: optionId },
        }),
      );
    }

    throw error;
  }
};

export const apiConfig = {
  baseUrl: normalizedBaseUrl,
  isUsingFallback: !process.env.EXPO_PUBLIC_API_URL && __DEV__,
  platform: Platform.OS,
};

export { ApiError };
