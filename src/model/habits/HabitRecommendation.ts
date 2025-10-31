export type HabitRecommendationMetadata = {
  titulo?: string;
  descricao?: string;
  acao?: string;
  [key: string]: unknown;
};

export type HabitRecommendation = {
  modeloId: string;
  habilidadeCodigo: string;
  habilidadeNome: string;
  categoria: string;
  nivelSugerido: string;
  metadados?: HabitRecommendationMetadata;
  iconeCodigo: string;
  iconeNome: string;
  iconeUrl: string;
};

export type HabitRecommendationResponse = {
  habitos: HabitRecommendation[];
};
