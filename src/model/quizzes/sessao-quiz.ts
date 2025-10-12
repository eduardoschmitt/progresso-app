export type SessaoQuizStatus = 'em_andamento' | 'concluido' | 'abandonado';

export type SessaoQuiz = {
  id: string;
  usuarioId: string;
  quizId: string;
  iniciadoEm: string;
  concluidoEm: string | null;
  pontuacao: number | null;
  duracaoSeg: number | null;
  status: SessaoQuizStatus;
};
