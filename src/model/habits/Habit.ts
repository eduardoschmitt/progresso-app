export type Habit = {
  id: string;
  usuarioId: string;
  nome: string;
  descricao: string | null;
  metaDiaria: number;
  ativo: boolean;
  contagemHoje: number;
  contagemTotal: number;
  dataHojeRef: string;
  streakAtual: number;
  streakMax: number;
  diasAtivosTotal: number;
  diasMetaBatidaTotal: number;
  ultimaMarcacaoEm: string | null;
  iconeCodigo: string | null;
  iconeNome: string | null;
  iconeUrl: string | null;
  concluidoHoje: boolean;
  novasInsignias: Record<string, unknown>[] | null;
};

export type HabitCreatePayload = {
  usuarioId: string;
  nome: string;
  descricao?: string | null;
  metaDiaria: number;
  iconeCodigo?: string | null;
};

export type HabitCreateInput = Omit<HabitCreatePayload, 'usuarioId'> & {
  usuarioId?: string;
};

export type HabitUpdatePayload = Partial<{
  nome: string;
  descricao: string | null;
  metaDiaria: number;
  ativo: boolean;
  iconeCodigo: string | null;
}>;

export type HabitListParams = {
  usuarioId?: string;
  incluirInativos?: boolean;
};
