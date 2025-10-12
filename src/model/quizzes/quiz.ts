export type TipoQuiz = 'diagnostico' | 'educativo';

export type Quiz = {
  id: string;
  titulo: string;
  descricao: string | null;
  tipoQuiz: TipoQuiz;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string | null;
};
