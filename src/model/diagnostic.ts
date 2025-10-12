import type {
  Opcao,
  Questao as QuestaoModel,
  QuestaoHabilidade,
  Quiz,
  Resposta,
  SessaoQuiz,
  SessaoQuizStatus,
} from './quizzes';

export type { Quiz, Opcao, QuestaoHabilidade, Resposta, SessaoQuiz, SessaoQuizStatus };

export type DiagnosticQuizQuestion = QuestaoModel & {
  opcoes: Opcao[];
  habilidades?: QuestaoHabilidade[];
};

export type DiagnosticQuiz = Quiz & {
  questoes: DiagnosticQuizQuestion[];
  concluido?: boolean;
  status?: SessaoQuizStatus;
};

export type DiagnosticQuizPayload = DiagnosticQuiz;

export type DiagnosticQuizQuestionPayload = DiagnosticQuizQuestion;

export type DiagnosticQuizOption = Opcao;

export type DiagnosticSessionPayload = Partial<SessaoQuiz> & {
  sessaoId?: string;
};

export type DiagnosticSessionStatusPayload = {
  quizRealizado: boolean;
  sessaoId: string | null;
  status: SessaoQuizStatus | null;
  totalQuestoes: number;
  totalRespondidas: number;
  ultimaQuestaoRespondidaId: string | null;
  ultimaQuestaoRespondidaOrdem: number | null;
  proximaQuestaoId: string | null;
  proximaQuestaoOrdem: number | null;
};

export type DiagnosticAnswerPayload = Resposta & {
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
