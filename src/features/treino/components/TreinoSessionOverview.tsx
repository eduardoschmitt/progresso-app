import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type {
  TreinoConclusaoPayload,
  TreinoQuestaoPayload,
  TreinoRespostaPayload,
  TreinoSessaoPayload,
  TreinoSessaoProgresso,
  TreinoSessaoStatus,
} from '@/model/treino';

import { TreinoQuestionCard } from './TreinoQuestionCard';
import { TreinoFeedbackCard } from './TreinoFeedbackCard';
import { TreinoConclusionCard } from './TreinoConclusionCard';

type TreinoSessionOverviewProps = {
  sessao: TreinoSessaoPayload;
  status: TreinoSessaoStatus | null;
  progresso: TreinoSessaoProgresso | null;
  reforcoEspacado: boolean;
  questaoAtual: TreinoQuestaoPayload | null;
  respostaAtual: TreinoRespostaPayload | null;
  conclusao: TreinoConclusaoPayload | null;
  erroQuestao?: string | null;
  erroConclusao?: string | null;
  isCarregandoQuestao: boolean;
  isConcluindo: boolean;
  onEnviarResposta: (opcaoId: string) => void;
  opcaoSelecionadaId: string | null;
  isEnviandoResposta: boolean;
  podeAvancar: boolean;
  onAvancar: () => void;
};

export function TreinoSessionOverview({
  sessao,
  status,
  progresso,
  reforcoEspacado,
  questaoAtual,
  respostaAtual,
  conclusao,
  erroQuestao,
  erroConclusao,
  isCarregandoQuestao,
  isConcluindo,
  onEnviarResposta,
  opcaoSelecionadaId,
  isEnviandoResposta,
  podeAvancar,
  onAvancar,
}: TreinoSessionOverviewProps) {
  const progressoLabel = progresso
    ? `${progresso.respondidas}/${progresso.total} questões respondidas`
    : null;

  return (
    <View style={styles.container}>
      <Text style={styles.resultTitle}>Sessão iniciada!</Text>
      <Text style={styles.resultItem}>
        <Text style={styles.resultLabel}>ID da sessão: </Text>
        {sessao.sessaoId}
      </Text>
      <Text style={styles.resultItem}>
        <Text style={styles.resultLabel}>Tipo: </Text>
        {sessao.tipo === 'quiz' ? 'Quiz adaptativo' : 'Reconhecimento visual'}
      </Text>
      <Text style={styles.resultItem}>
        <Text style={styles.resultLabel}>Cluster: </Text>
        {sessao.cluster.charAt(0).toUpperCase() + sessao.cluster.slice(1)}
      </Text>
      <Text style={styles.resultItem}>
        <Text style={styles.resultLabel}>Total planejado: </Text>
        {sessao.totalQuestoes} questões
      </Text>
      {status ? (
        <Text style={styles.resultItem}>
          <Text style={styles.resultLabel}>Status: </Text>
          {status === 'concluida' ? 'Concluída' : 'Em andamento'}
        </Text>
      ) : null}
      {progressoLabel ? (
        <Text style={styles.resultItem}>
          <Text style={styles.resultLabel}>Progresso: </Text>
          {progressoLabel}
        </Text>
      ) : null}
      {reforcoEspacado ? (
        <Text style={styles.resultHighlight}>Modo reforço espaçado ativo para esta questão.</Text>
      ) : null}
      {erroQuestao ? <Text style={styles.errorText}>{erroQuestao}</Text> : null}
      {isCarregandoQuestao ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#F9B817" />
          <Text style={styles.loadingText}>Buscando próxima questão...</Text>
        </View>
      ) : null}

      {questaoAtual ? (
        <TreinoQuestionCard
          questao={questaoAtual}
          onSelecionarOpcao={onEnviarResposta}
          opcaoSelecionadaId={opcaoSelecionadaId}
          respostaRegistrada={respostaAtual}
          isEnviandoResposta={isEnviandoResposta}
        />
      ) : null}

      {respostaAtual ? (
        <TreinoFeedbackCard
          resposta={respostaAtual}
          statusSessao={status}
          podeAvancar={podeAvancar}
          onAvancar={onAvancar}
          isAvancando={isCarregandoQuestao || isConcluindo}
        />
      ) : null}

      {status === 'concluida' && conclusao ? (
        <TreinoConclusionCard conclusao={conclusao} erroConclusao={erroConclusao} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF4CC',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9B817',
  },
  resultItem: {
    fontSize: 14,
    color: '#1E293B',
  },
  resultLabel: {
    fontWeight: '600',
  },
  resultHighlight: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F9B817',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#F9B817',
  },
});
