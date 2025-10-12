import { request } from '@/api/httpClient';
import type { LoginPayload, LoginResponse, RegisterPayload } from '@/model/auth';

export const registerUser = (payload: RegisterPayload) =>
  request<void>({
    url: '/api/usuarios/registrar',
    method: 'POST',
    data: payload,
  });

export const loginUser = (payload: LoginPayload) =>
  request<LoginResponse>({
    url: '/api/usuarios/login',
    method: 'POST',
    data: payload,
  });
