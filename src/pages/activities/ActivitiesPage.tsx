import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import CustomButton from '@/components/CustomButton';
import { ApiError } from '@/api/httpClient';
import { useAuth } from '@/hooks/use-auth';
import type { TreinoCluster, TreinoSessaoPayload, TreinoSessaoTipo } from '@/model/treino';
import { criarSessaoTreino } from '@/service/treinoService';

type Option<T> = {
  label: string;
  description: string;
  value: T;
};

const TIPO_OPTIONS: Option<TreinoSessaoTipo>[] = [
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

const CLUSTER_OPTIONS: Option<TreinoCluster>[] = [
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

const TOTAL_MIN = 1;
const TOTAL_MAX = 20;

export default function ActivitiesPage() {
  const { session } = useAuth();

  const [tipoSelecionado, setTipoSelecionado] = useState<TreinoSessaoTipo>('quiz');
  const [clusterSelecionado, setClusterSelecionado] = useState<TreinoCluster>('reciclagem');
  const [totalQuestoes, setTotalQuestoes] = useState<number>(6);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sessaoCriada, setSessaoCriada] = useState<TreinoSessaoPayload | null>(null);

  const podeIniciar = useMemo(() => Boolean(session && session.user && session.token), [session]);

  const descricaoLogin = useMemo(() => {
    if (podeIniciar) {
      return null;
    }

    return 'Entre com sua conta para iniciar um treino adaptativo.';
  }, [podeIniciar]);

  const ajustarTotalQuestoes = useCallback((delta: number) => {
    setTotalQuestoes((current) => {
      const proximo = Math.min(TOTAL_MAX, Math.max(TOTAL_MIN, current + delta));
      return proximo;
    });
  }, []);

  const iniciarSessao = useCallback(async () => {
    if (!session) {
      return;
    }

    setIsSubmitting(true);
    setErro(null);

    try {
      const payload = await criarSessaoTreino(session.token, {
        usuarioId: session.user.id,
        tipo: tipoSelecionado,
        cluster: clusterSelecionado,
        totalQuestoes,
      });

      setSessaoCriada(payload);
    } catch (error) {
      if (error instanceof ApiError) {
        setErro(error.message);
      } else {
        setErro('Não foi possível iniciar o treino. Tente novamente.');
      }
      setSessaoCriada(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [session, tipoSelecionado, clusterSelecionado, totalQuestoes]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Atividades</Text>
          <Text style={styles.subtitle}>
            Configure e inicie um treino adaptativo para reforçar as habilidades que mais
            precisam de atenção.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de treino</Text>
          <View style={styles.optionList}>
            {TIPO_OPTIONS.map((option) => {
              const isSelected = option.value === tipoSelecionado;
              return (
                <Pressable
                  key={option.value}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => setTipoSelecionado(option.value)}
                >
                  <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cluster</Text>
          <View style={styles.optionList}>
            {CLUSTER_OPTIONS.map((option) => {
              const isSelected = option.value === clusterSelecionado;
              return (
                <Pressable
                  key={option.value}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => setClusterSelecionado(option.value)}
                >
                  <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total de questões</Text>
          <Text style={styles.sectionHelper}>Escolha entre 1 e 20 questões por sessão.</Text>

          <View style={styles.counterContainer}>
            <Pressable
              onPress={() => ajustarTotalQuestoes(-1)}
              style={[styles.counterButton, totalQuestoes === TOTAL_MIN && styles.counterButtonDisabled]}
              disabled={totalQuestoes === TOTAL_MIN}
            >
              <Text style={styles.counterButtonText}>-</Text>
            </Pressable>

            <View style={styles.counterValueContainer}>
              <Text style={styles.counterValue}>{totalQuestoes}</Text>
              <Text style={styles.counterValueSuffix}>questões</Text>
            </View>

            <Pressable
              onPress={() => ajustarTotalQuestoes(1)}
              style={[styles.counterButton, totalQuestoes === TOTAL_MAX && styles.counterButtonDisabled]}
              disabled={totalQuestoes === TOTAL_MAX}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </Pressable>
          </View>
        </View>

        {erro ? <Text style={styles.errorText}>{erro}</Text> : null}

        {descricaoLogin ? <Text style={styles.helperText}>{descricaoLogin}</Text> : null}

        <CustomButton
          title={isSubmitting ? 'Iniciando...' : 'Iniciar treino adaptativo'}
          onPress={iniciarSessao}
          disabled={!podeIniciar || isSubmitting}
          style={styles.startButton}
          textStyle={styles.startButtonText}
        />

        {isSubmitting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#1D4ED8" />
            <Text style={styles.loadingText}>Preparando sua sessão...</Text>
          </View>
        ) : null}

        {sessaoCriada ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Sessão iniciada!</Text>
            <Text style={styles.resultItem}>
              <Text style={styles.resultLabel}>ID da sessão: </Text>
              {sessaoCriada.sessaoId}
            </Text>
            <Text style={styles.resultItem}>
              <Text style={styles.resultLabel}>Tipo: </Text>
              {sessaoCriada.tipo === 'quiz' ? 'Quiz adaptativo' : 'Reconhecimento visual'}
            </Text>
            <Text style={styles.resultItem}>
              <Text style={styles.resultLabel}>Cluster: </Text>
              {sessaoCriada.cluster.charAt(0).toUpperCase() + sessaoCriada.cluster.slice(1)}
            </Text>
            <Text style={styles.resultItem}>
              <Text style={styles.resultLabel}>Total planejado: </Text>
              {sessaoCriada.totalQuestoes} questões
            </Text>
          </View>
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
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: '#0F172A0D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  sectionHelper: {
    fontSize: 14,
    color: '#64748B',
  },
  optionList: {
    gap: 12,
  },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 4,
  },
  optionCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#E0ECFF',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  optionTitleSelected: {
    color: '#1D4ED8',
  },
  optionDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonDisabled: {
    backgroundColor: '#CBD5F5',
  },
  counterButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  counterValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  counterValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
  },
  counterValueSuffix: {
    fontSize: 14,
    color: '#64748B',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
  },
  helperText: {
    fontSize: 14,
    color: '#475569',
  },
  startButton: {
    borderRadius: 20,
  },
  startButtonText: {
    fontSize: 15,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#1D4ED8',
  },
  resultCard: {
    backgroundColor: '#E0ECFF',
    padding: 20,
    borderRadius: 16,
    gap: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  resultItem: {
    fontSize: 14,
    color: '#1E293B',
  },
  resultLabel: {
    fontWeight: '600',
  },
});
