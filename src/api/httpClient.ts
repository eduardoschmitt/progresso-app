import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { Platform } from 'react-native';

const FALLBACK_DEV_URL = 'http://10.0.2.2:8080';
const AUTH_HEADER_KEY = 'Authorization';

type Headers = Record<string, string>;

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

const httpClient: AxiosInstance = axios.create({
  baseURL: normalizedBaseUrl,
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers = (config.headers ?? {}) as Headers;

  if (!headers.Accept) {
    headers.Accept = 'application/json';
  }

  if (config.data !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  config.headers = headers;
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;
      let message = 'Erro ao comunicar com o servidor.';

      if (typeof data === 'string' && data.trim().length > 0) {
        message = data;
      } else if (data && typeof data === 'object' && 'message' in data) {
        const maybeMessage = (data as { message?: string }).message;
        if (maybeMessage) {
          message = maybeMessage;
        }
      }

      throw new ApiError(message, status, data);
    }

    if (error.request) {
      throw new ApiError('Nenhuma resposta recebida do servidor.', 0, null);
    }

    throw new ApiError(error.message, 0, null);
  },
);

export type HttpRequestConfig = Omit<AxiosRequestConfig, 'headers'> & {
  headers?: Headers;
};

export const request = async <T>(config: HttpRequestConfig): Promise<T> => {
  const response = await httpClient.request<T>(config as AxiosRequestConfig);
  return response.data;
};

export const withAuthorization = (
  token: string,
  config: HttpRequestConfig = {},
): HttpRequestConfig => ({
  ...config,
  headers: {
    ...(config.headers ?? {}),
    [AUTH_HEADER_KEY]: `Bearer ${token}`,
  },
});

export const apiConfig = {
  baseUrl: normalizedBaseUrl,
  isUsingFallback: !process.env.EXPO_PUBLIC_API_URL && __DEV__,
  platform: Platform.OS,
};

export { httpClient };
