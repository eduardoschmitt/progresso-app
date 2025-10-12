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
