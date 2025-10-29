import type { TipoQuestao } from './quizzes';

export type TreinoSessaoTipo = 'quiz' | 'reconhecimento_visual';

export type TreinoCluster = 'reciclagem' | 'prontidao' | 'mobilidade';

export type TreinoSessaoStatus = 'em_andamento' | 'concluida';

export type TreinoSessaoPayload = {
  sessaoId: string;
  totalQuestoes: number;
  tipo: TreinoSessaoTipo;
  cluster: TreinoCluster;
};

export type TreinoSessaoProgresso = {
  respondidas: number;
  total: number;
};

export type TreinoHabilidadeResumo = {
  id: string;
  codigo: string;
  nome: string;
  dominio: number;
};

export type TreinoQuestaoMetadados = Record<string, unknown>;

export type TreinoQuestaoOpcao = {
  id: string;
  rotulo: string;
  iconeUrl: string | null;
};

export type TreinoQuestaoPayload = {
  id: string;
  enunciado: string;
  descricao?: string | null;
  tipo: TipoQuestao;
  dificuldade: number;
  dificuldadeAlvo: number;
  opcoes: TreinoQuestaoOpcao[];
  habilidadeAlvo?: TreinoHabilidadeResumo | null;
  metadados?: TreinoQuestaoMetadados;
};

export type TreinoProximaQuestaoResponse = {
  sessaoId: string;
  questoesRespondidas: number;
  totalQuestoes: number;
  status: TreinoSessaoStatus;
  reforcoEspacado: boolean;
  questao?: {
    id: string;
    enunciado: string;
    descricao?: string | null;
    tipo: TipoQuestao;
    dificuldade: number;
    opcoes: TreinoQuestaoOpcao[];
    metadados?: TreinoQuestaoMetadados;
  } | null;
  habilidadeAlvo?: TreinoHabilidadeResumo | null;
  dificuldadeAlvo?: number | null;
};

export type TreinoRespostaHabilidadeDelta = {
  habilidadeId: string;
  codigo: string;
  nome: string;
  dominioAntes: number;
  dominioDepois: number;
  delta: number;
};

export type TreinoRespostaPayload = {
  questaoId: string;
  opcaoId: string;
  correta: boolean;
  feedback: string;
  microdica?: string | null;
  habilidades: TreinoRespostaHabilidadeDelta[];
  proximaRevisaoEm: string | null;
};

export type TreinoConclusaoPayload = {
  sessaoId: string;
  totalQuestoesPlanejado: number;
  totalRespondidas: number;
  totalCorretas: number;
  pontuacao: number;
  concluidoEm: string;
  novasInsignias: Record<string, unknown>[];
};
