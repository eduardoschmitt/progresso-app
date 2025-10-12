export type TipoQuestao =
  | 'multipla_escolha'
  | 'escala'
  | 'motivos'
  | 'reconhecimento_visual';

export type Questao = {
  id: string;
  quizId: string;
  enunciado: string;
  tipoQuestao: TipoQuestao;
  dificuldade: number;
  elegivelAdaptativa: boolean;
  ordem: number;
};
