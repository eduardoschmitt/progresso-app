export type DiagnosticQuizOption = {
  id: string;
  rotulo: string;
  correta?: boolean;
  iconeUrl: string | null;
};

export type DiagnosticQuizQuestion = {
  id: string;
  enunciado: string;
  tipo: string;
  ordem: number;
  opcoes: DiagnosticQuizOption[];
};

export type DiagnosticQuizPayload = {
  id: string;
  titulo: string;
  descricao: string;
  questoes: DiagnosticQuizQuestion[];
  concluido?: boolean;
  status?: string;
};

export type DiagnosticSessionPayload = {
  id?: string;
  sessaoId?: string;
  status?: string;
};

export type DiagnosticSessionStatusPayload = {
  quizRealizado: boolean;
  sessaoId: string | null;
  status: string | null;
  totalQuestoes: number;
  totalRespondidas: number;
  ultimaQuestaoRespondidaId: string | null;
  ultimaQuestaoRespondidaOrdem: number | null;
  proximaQuestaoId: string | null;
  proximaQuestaoOrdem: number | null;
};

export type DiagnosticAnswerPayload = {
  concluido?: boolean;
  mensagem?: string;
};

export type DiagnosticConclusionSkill = {
  habilidadeId: string;
  codigo: string;
  nome: string;
  dominio: number;
  tentativas: number;
  acertos: number;
  categoria: string;
};

export type DiagnosticConclusionPayload = {
  pontuacao: number;
  totalQuestoes: number;
  totalCorretas: number;
  habilidades: DiagnosticConclusionSkill[];
  novasInsignias: Record<string, unknown>[];
};
