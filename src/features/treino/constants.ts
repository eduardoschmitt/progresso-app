import type { TreinoCluster, TreinoSessaoTipo } from '@/model/treino';

export type TreinoOption<T> = {
  label: string;
  description: string;
  value: T;
};

export const TIPO_OPTIONS: TreinoOption<TreinoSessaoTipo>[] = [
  {
    label: 'Quiz adaptativo',
    description: 'Questões de múltipla escolha com ajuste dinâmico de dificuldade.',
    value: 'quiz',
  },
  {
    label: 'Reconhecimento visual',
    description: 'Classifique imagens para reforçar padrões visuais essenciais.',
    value: 'reconhecimento_visual',
  },
];

export const CLUSTER_OPTIONS: TreinoOption<TreinoCluster>[] = [
  {
    label: 'Reciclagem',
    description: 'Foque nas bases para recuperar conteúdos fundamentais.',
    value: 'reciclagem',
  },
  {
    label: 'Prontidão',
    description: 'Reforce habilidades ligadas a situações do dia a dia.',
    value: 'prontidao',
  },
  {
    label: 'Mobilidade',
    description: 'Trabalhe competências para avançar no próximo nível.',
    value: 'mobilidade',
  },
];

export const TOTAL_MIN_QUESTOES = 1;
export const TOTAL_MAX_QUESTOES = 20;
