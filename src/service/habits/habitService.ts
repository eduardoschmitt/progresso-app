import { request, withAuthorization } from '@/api/httpClient';
import type {
  Habit,
  HabitCreateInput,
  HabitCreatePayload,
  HabitListParams,
  HabitRecommendation,
  HabitRecommendationResponse,
  HabitUpdatePayload,
  HabitIcon,
} from '@/model/habits';
import { getSession, getToken } from '@/service/storage/authStorage';

const ensureAuth = async () => {
  const session = await getSession();
  const fallbackToken = await getToken();

  const token = session?.token ?? fallbackToken ?? null;
  const usuarioId = session?.user?.id ?? null;

  if (!token) {
    throw new Error('Sessão expirada. Entre novamente para continuar.');
  }

  return { token, usuarioId };
};

const sanitizePayload = <T extends Record<string, unknown>>(payload: T): T => {
  const entries = Object.entries(payload).filter(([, value]) => value !== undefined);
  return Object.fromEntries(entries) as T;
};

export const createHabit = async (input: HabitCreateInput): Promise<Habit> => {
  const { token, usuarioId: sessionUserId } = await ensureAuth();
  const usuarioId = input.usuarioId ?? sessionUserId;

  if (!usuarioId) {
    throw new Error('Usuário não identificado. Não foi possível criar o hábito.');
  }

  const payload: HabitCreatePayload = sanitizePayload({
    usuarioId,
    nome: input.nome,
    descricao: input.descricao ?? null,
    metaDiaria: input.metaDiaria,
    iconeCodigo: input.iconeCodigo ?? null,
  });

  return request<Habit>({
    url: '/api/habitos',
    method: 'POST',
    data: payload,
    ...withAuthorization(token),
  });
};

export const listHabits = async (params: HabitListParams = {}): Promise<Habit[]> => {
  const { token, usuarioId: sessionUserId } = await ensureAuth();
  const usuarioId = params.usuarioId ?? sessionUserId;

  if (!usuarioId) {
    throw new Error('Usuário não identificado. Não foi possível carregar os hábitos.');
  }

  const sp = new URLSearchParams();
  sp.set('usuarioId', usuarioId);

  if (typeof params.incluirInativos === 'boolean') {
    sp.set('incluirInativos', String(params.incluirInativos));
  }

  return request<Habit[]>({
    url: `/api/habitos?${sp.toString()}`,
    method: 'GET',
    ...withAuthorization(token),
  });
};

export const getHabitById = async (habitId: string): Promise<Habit> => {
  if (!habitId) {
    throw new Error('Identificador do hábito é obrigatório.');
  }

  const { token } = await ensureAuth();

  return request<Habit>({
    url: `/api/habitos/${habitId}`,
    method: 'GET',
    ...withAuthorization(token),
  });
};

export const getHabitRecommendations = async (
  usuarioId?: string,
): Promise<HabitRecommendation[]> => {
  const { token, usuarioId: sessionUserId } = await ensureAuth();
  const targetUserId = usuarioId ?? sessionUserId;

  if (!targetUserId) {
    throw new Error('Usuário não identificado. Não foi possível carregar recomendações.');
  }

  const sp = new URLSearchParams();
  sp.set('usuarioId', targetUserId);

  const response = await request<HabitRecommendationResponse>({
    url: `/api/habitos/recomendados?${sp.toString()}`,
    method: 'GET',
    ...withAuthorization(token),
  });

  return Array.isArray(response.habitos) ? response.habitos : [];
};

export const markHabit = async (
  habitId: string,
  opts: { quantidade?: number } = {},
): Promise<Habit> => {
  if (!habitId) {
    throw new Error('Identificador do hábito é obrigatório.');
  }

  const { token } = await ensureAuth();

  const data = opts.quantidade ? { quantidade: opts.quantidade } : undefined;

  return request<Habit>({
    url: `/api/habitos/${habitId}/marcar`,
    method: 'POST',
    data,
    ...withAuthorization(token),
  });
};

export const unmarkHabit = async (
  habitId: string,
  opts: { quantidade?: number } = {},
): Promise<Habit> => {
  if (!habitId) {
    throw new Error('Identificador do hábito é obrigatório.');
  }

  const { token } = await ensureAuth();

  const data = opts.quantidade ? { quantidade: opts.quantidade } : undefined;

  return request<Habit>({
    url: `/api/habitos/${habitId}/desmarcar`,
    method: 'POST',
    data,
    ...withAuthorization(token),
  });
};

export const updateHabit = async (
  habitId: string,
  payload: HabitUpdatePayload,
): Promise<Habit> => {
  if (!habitId) {
    throw new Error('Identificador do hábito é obrigatório.');
  }

  const { token } = await ensureAuth();

  const data = sanitizePayload(payload);

  return request<Habit>({
    url: `/api/habitos/${habitId}`,
    method: 'PATCH',
    data,
    ...withAuthorization(token),
  });
};

export const deleteHabit = async (habitId: string): Promise<void> => {
  if (!habitId) {
    throw new Error('Identificador do hábito é obrigatório.');
  }

  const { token } = await ensureAuth();

  await request<void>({
    url: `/api/habitos/${habitId}`,
    method: 'DELETE',
    ...withAuthorization(token),
  });
};

export const getHabitIcons = async (): Promise<HabitIcon[]> => {
  const { token } = await ensureAuth();

  return request<HabitIcon[]>({
    url: '/api/habitos/icones',
    method: 'GET',
    ...withAuthorization(token),
  });
};
