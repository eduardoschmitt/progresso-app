export type Resposta = {
  id: string;
  sessaoId: string;
  questaoId: string;
  opcaoId: string;
  correta: boolean | null;
  respondidaEm: string;
};
