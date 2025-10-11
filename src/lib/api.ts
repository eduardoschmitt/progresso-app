import { Platform } from 'react-native';

import { deleteToken, deleteUser, getToken } from './auth-storage';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
};

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

export class ApiError extends Error {
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

export const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
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

export const registrarUsuario = (dados: RegisterPayload) =>
  request<void>('/api/usuarios/registrar', { method: 'POST', body: dados });

export const loginUsuario = (dados: LoginPayload) =>
  request<LoginResponse>('/api/usuarios/login', { method: 'POST', body: dados });

export const authorizedRequest = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const token = await getToken();

  if (!token) {
    throw new ApiError('Sessão expirada. Faça login novamente.', 401);
  }

  try {
    return await request<T>(path, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await deleteToken();
      await deleteUser();
      throw new ApiError('Sessão expirada. Faça login novamente.', error.status, error.details);
    }

    throw error;
  }
};


export const apiConfig = {
  baseUrl: normalizedBaseUrl,
  isUsingFallback: !process.env.EXPO_PUBLIC_API_URL && __DEV__,
  platform: Platform.OS,
};

