import { request, withAuthorization } from '@/api/httpClient';
import type {
  TreinoConclusaoPayload,
  TreinoProximaQuestaoPayload,
  TreinoRespostaPayload,
  TreinoSessaoPayload,
  TreinoSessaoTipo,
  TreinoCluster,
} from '@/model/treino';

export type CriarSessaoTreinoPayload = {
  usuarioId: string;
  tipo?: TreinoSessaoTipo | null;
  cluster?: TreinoCluster | null;
  totalQuestoes?: number | null;
};

export const criarSessaoTreino = (token: string, payload: CriarSessaoTreinoPayload) =>
  request<TreinoSessaoPayload>({
    url: '/api/treinos/sessoes',
    method: 'POST',
    data: payload,
    ...withAuthorization(token),
  });

export const buscarProximaQuestaoTreino = (token: string, sessaoId: string) =>
  request<TreinoProximaQuestaoPayload>({
    url: `/api/treinos/sessoes/${sessaoId}/proxima`,
    method: 'GET',
    ...withAuthorization(token),
  });

export const enviarRespostaTreino = (
  token: string,
  sessaoId: string,
  payload: { questaoId: string; opcaoId: string },
) =>
  request<TreinoRespostaPayload>({
    url: `/api/treinos/sessoes/${sessaoId}/respostas`,
    method: 'POST',
    data: payload,
    ...withAuthorization(token),
  });

export const concluirSessaoTreino = (token: string, sessaoId: string) =>
  request<TreinoConclusaoPayload>({
    url: `/api/treinos/sessoes/${sessaoId}/concluir`,
    method: 'POST',
    ...withAuthorization(token),
  });
