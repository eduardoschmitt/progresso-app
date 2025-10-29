import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TreinoSessionConfigurator } from '@/features/treino/components/TreinoSessionConfigurator';
import { TreinoSessionOverview } from '@/features/treino/components/TreinoSessionOverview';
import {
  CLUSTER_OPTIONS,
  TIPO_OPTIONS,
  TOTAL_MAX_QUESTOES,
  TOTAL_MIN_QUESTOES,
} from '@/features/treino/constants';
import { useAdaptiveTreinoSession } from '@/features/treino/hooks/useAdaptiveTreinoSession';
import { useAuth } from '@/hooks/use-auth';
import type { TreinoCluster, TreinoSessaoTipo } from '@/model/treino';

export default function ActivitiesPage() {
  const { session } = useAuth();

  const [tipoSelecionado, setTipoSelecionado] = useState<TreinoSessaoTipo>('quiz');
  const [clusterSelecionado, setClusterSelecionado] = useState<TreinoCluster>('reciclagem');
  const [totalQuestoes, setTotalQuestoes] = useState<number>(6);

  const { state, actions } = useAdaptiveTreinoSession(session?.token, session?.user?.id);

  const podeIniciar = useMemo(() => Boolean(session?.user && session?.token), [session]);

  const descricaoLogin = useMemo(() => {
    if (podeIniciar) {
      return null;
    }

    return 'Entre com sua conta para iniciar um treino adaptativo.';
  }, [podeIniciar]);

  const incrementarTotalQuestoes = useCallback(() => {
    setTotalQuestoes((current) => Math.min(TOTAL_MAX_QUESTOES, current + 1));
  }, []);

  const decrementarTotalQuestoes = useCallback(() => {
    setTotalQuestoes((current) => Math.max(TOTAL_MIN_QUESTOES, current - 1));
  }, []);

  const iniciarSessao = useCallback(() => {
    actions.inicializarSessao({
      tipo: tipoSelecionado,
      cluster: clusterSelecionado,
      totalQuestoes,
    });
  }, [actions, tipoSelecionado, clusterSelecionado, totalQuestoes]);

  const podeAvancar = useMemo(() => Boolean(state.respostaAtual), [state.respostaAtual]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Atividades</Text>
          <Text style={styles.subtitle}>
            Configure e inicie um treino adaptativo para reforçar as habilidades que mais precisam de atenção.
          </Text>
        </View>

        <TreinoSessionConfigurator
          tipo={tipoSelecionado}
          onSelectTipo={setTipoSelecionado}
          tipoOptions={TIPO_OPTIONS}
          cluster={clusterSelecionado}
          onSelectCluster={setClusterSelecionado}
          clusterOptions={CLUSTER_OPTIONS}
          totalQuestoes={totalQuestoes}
          onIncrementTotal={incrementarTotalQuestoes}
          onDecrementTotal={decrementarTotalQuestoes}
          totalMin={TOTAL_MIN_QUESTOES}
          totalMax={TOTAL_MAX_QUESTOES}
          onStartSession={iniciarSessao}
          isStarting={state.isInicializando}
          canStart={podeIniciar}
          errorMessage={state.erroInicializacao}
          helperMessage={descricaoLogin}
        />

        {state.isInicializando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#1D4ED8" />
            <Text style={styles.loadingText}>Preparando sua sessão...</Text>
          </View>
        ) : null}

        {state.sessao ? (
          <TreinoSessionOverview
            sessao={state.sessao}
            status={state.status}
            progresso={state.progresso}
            reforcoEspacado={state.reforcoEspacado}
            questaoAtual={state.questaoAtual}
            respostaAtual={state.respostaAtual}
            conclusao={state.conclusao}
            erroQuestao={state.erroQuestao}
            erroConclusao={state.erroConclusao}
            isCarregandoQuestao={state.isCarregandoQuestao}
            isConcluindo={state.isConcluindo}
            onEnviarResposta={actions.enviarResposta}
            opcaoSelecionadaId={state.opcaoSelecionadaId}
            isEnviandoResposta={state.isEnviandoResposta}
            podeAvancar={podeAvancar}
            onAvancar={actions.avancarOuConcluir}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 24,
  },
  header: {
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#475569',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#1D4ED8',
  },
});
