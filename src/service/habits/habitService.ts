import { apiConfig, request, withAuthorization } from '@/api/httpClient';
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

type WithIconUrl = { iconeUrl?: string | null };

const asPngPath = (path: string): string => {
  if (/\.png(\?.*)?$/i.test(path)) {
    return path;
  }

  if (/\.svg(\?.*)?$/i.test(path)) {
    return path.replace(/\.svg(\?.*)?$/i, (_match, query = '') => `.png${query}`);
  }

  return path;
};

const toAbsoluteUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = apiConfig.baseUrl?.replace(/\/$/, '') ?? '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

const resolveHabitIconUrl = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const pngPath = asPngPath(value);
  return toAbsoluteUrl(pngPath);
};

const mapIconUrl = <T extends WithIconUrl>(input: T): T => {
  const resolved = resolveHabitIconUrl(input.iconeUrl);

  if (resolved === input.iconeUrl) {
    return input;
  }

  return { ...input, iconeUrl: resolved };
};

const mapHabit = (habit: Habit): Habit => mapIconUrl(habit);

const mapRecommendation = (recommendation: HabitRecommendation): HabitRecommendation =>
  mapIconUrl(recommendation);

const mapHabitIcon = (icon: HabitIcon): HabitIcon => mapIconUrl(icon);

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

  const response = await request<Habit>({
    url: '/api/habitos',
    method: 'POST',
    data: payload,
    ...withAuthorization(token),
  });

  return mapHabit(response);
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

  const response = await request<Habit[]>({
    url: `/api/habitos?${sp.toString()}`,
    method: 'GET',
    ...withAuthorization(token),
  });

  return response.map(mapHabit);
};

export const getHabitById = async (habitId: string): Promise<Habit> => {
  if (!habitId) {
    throw new Error('Identificador do hábito é obrigatório.');
  }

  const { token } = await ensureAuth();

  const response = await request<Habit>({
    url: `/api/habitos/${habitId}`,
    method: 'GET',
    ...withAuthorization(token),
  });

  return mapHabit(response);
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

  const list = Array.isArray(response.habitos) ? response.habitos : [];
  return list.map(mapRecommendation);
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

  const response = await request<Habit>({
    url: `/api/habitos/${habitId}/marcar`,
    method: 'POST',
    data,
    ...withAuthorization(token),
  });

  return mapHabit(response);
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

  const response = await request<Habit>({
    url: `/api/habitos/${habitId}/desmarcar`,
    method: 'POST',
    data,
    ...withAuthorization(token),
  });

  return mapHabit(response);
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

  const response = await request<Habit>({
    url: `/api/habitos/${habitId}`,
    method: 'PATCH',
    data,
    ...withAuthorization(token),
  });

  return mapHabit(response);
};

export const deleteHabit = async (habitId: string): Promise<void> => {
  if (!habitId) {
    throw new Error('Identificador do hábito é obrigatório.');
  }

  const { token, usuarioId } = await ensureAuth();

  if (!usuarioId) {
    throw new Error('Usuário não identificado. Não foi possível remover o hábito.');
  }

  const sp = new URLSearchParams();
  sp.set('usuarioId', usuarioId);

  await request<void>({
    url: `/api/habitos/${habitId}?${sp.toString()}`,
    method: 'DELETE',
    ...withAuthorization(token),
  });
};

export const getHabitIcons = async (): Promise<HabitIcon[]> => {
  const { token } = await ensureAuth();

  const response = await request<HabitIcon[]>({
    url: '/api/habitos/icones',
    method: 'GET',
    ...withAuthorization(token),
  });

  return response.map(mapHabitIcon);
};
