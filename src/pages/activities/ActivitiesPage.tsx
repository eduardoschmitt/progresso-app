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
import type {
  TreinoCluster,
  TreinoConclusaoPayload,
  TreinoQuestaoPayload,
  TreinoRespostaPayload,
  TreinoSessaoPayload,
  TreinoSessaoProgresso,
  TreinoSessaoStatus,
  TreinoSessaoTipo,
} from '@/model/treino';
import {
  buscarProximaQuestaoTreino,
  concluirSessaoTreino,
  criarSessaoTreino,
  enviarRespostaTreino,
} from '@/service/treinoService';

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
  const [statusSessao, setStatusSessao] = useState<TreinoSessaoStatus | null>(null);
  const [progressoSessao, setProgressoSessao] = useState<TreinoSessaoProgresso | null>(null);
  const [reforcoEspacadoAtivo, setReforcoEspacadoAtivo] = useState(false);
  const [questaoAtual, setQuestaoAtual] = useState<TreinoQuestaoPayload | null>(null);
  const [isCarregandoQuestao, setIsCarregandoQuestao] = useState(false);
  const [erroQuestao, setErroQuestao] = useState<string | null>(null);
  const [opcaoSelecionadaId, setOpcaoSelecionadaId] = useState<string | null>(null);
  const [isEnviandoResposta, setIsEnviandoResposta] = useState(false);
  const [respostaRegistrada, setRespostaRegistrada] = useState<TreinoRespostaPayload | null>(null);
  const [isConcluindo, setIsConcluindo] = useState(false);
  const [conclusaoSessao, setConclusaoSessao] = useState<TreinoConclusaoPayload | null>(null);
  const [erroConclusao, setErroConclusao] = useState<string | null>(null);

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

  const resetarEstadoSessao = useCallback(() => {
    setStatusSessao(null);
    setProgressoSessao(null);
    setReforcoEspacadoAtivo(false);
    setQuestaoAtual(null);
    setErroQuestao(null);
    setOpcaoSelecionadaId(null);
    setIsEnviandoResposta(false);
    setRespostaRegistrada(null);
    setConclusaoSessao(null);
    setErroConclusao(null);
    setIsConcluindo(false);
  }, []);

  const confirmarConclusaoSessao = useCallback(async () => {
    if (!session || !sessaoCriada) {
      return;
    }

    if (conclusaoSessao || isConcluindo) {
      return;
    }

    setIsConcluindo(true);
    setErroConclusao(null);

    try {
      const payload = await concluirSessaoTreino(session.token, sessaoCriada.sessaoId);
      setConclusaoSessao(payload);
    } catch (error) {
      if (error instanceof ApiError) {
        setErroConclusao(error.message);
      } else {
        setErroConclusao('Não foi possível concluir a sessão. Tente novamente.');
      }
    } finally {
      setIsConcluindo(false);
    }
  }, [session, sessaoCriada, conclusaoSessao, isConcluindo]);

  const carregarProximaQuestao = useCallback(
    async (sessao?: TreinoSessaoPayload) => {
      if (!session) {
        return;
      }

      const sessaoAtiva = sessao ?? sessaoCriada;

      if (!sessaoAtiva) {
        return;
      }

      setIsCarregandoQuestao(true);
      setErroQuestao(null);
      setOpcaoSelecionadaId(null);
      setRespostaRegistrada(null);

      try {
        const payload = await buscarProximaQuestaoTreino(session.token, sessaoAtiva.sessaoId);

        setStatusSessao(payload.status);
        setProgressoSessao(payload.progresso);
        setReforcoEspacadoAtivo(payload.reforcoEspacado);

        if (payload.questao) {
          setQuestaoAtual(payload.questao);
        } else {
          setQuestaoAtual(null);
        }

        if (payload.status === 'concluida' && !payload.questao) {
          await confirmarConclusaoSessao();
        }
      } catch (error) {
        if (error instanceof ApiError) {
          setErroQuestao(error.message);
        } else {
          setErroQuestao('Não foi possível carregar a próxima questão. Tente novamente.');
        }
      } finally {
        setIsCarregandoQuestao(false);
      }
    },
    [session, sessaoCriada, confirmarConclusaoSessao],
  );

  const iniciarSessao = useCallback(async () => {
    if (!session) {
      return;
    }

    setIsSubmitting(true);
    setErro(null);
    resetarEstadoSessao();

    try {
      const payload = await criarSessaoTreino(session.token, {
        usuarioId: session.user.id,
        tipo: tipoSelecionado,
        cluster: clusterSelecionado,
        totalQuestoes,
      });

      setSessaoCriada(payload);
      await carregarProximaQuestao(payload);
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
  }, [
    session,
    tipoSelecionado,
    clusterSelecionado,
    totalQuestoes,
    carregarProximaQuestao,
    resetarEstadoSessao,
  ]);

  const enviarResposta = useCallback(
    async (opcaoId: string) => {
      if (!session || !sessaoCriada || !questaoAtual) {
        return;
      }

      if (isEnviandoResposta || respostaRegistrada) {
        return;
      }

      setIsEnviandoResposta(true);
      setOpcaoSelecionadaId(opcaoId);
      setErroQuestao(null);

      try {
        const payload = await enviarRespostaTreino(session.token, sessaoCriada.sessaoId, {
          questaoId: questaoAtual.id,
          opcaoId,
        });

        setRespostaRegistrada(payload);
      } catch (error) {
        setOpcaoSelecionadaId(null);
        if (error instanceof ApiError) {
          setErroQuestao(error.message);
        } else {
          setErroQuestao('Não foi possível registrar sua resposta. Tente novamente.');
        }
      } finally {
        setIsEnviandoResposta(false);
      }
    },
    [session, sessaoCriada, questaoAtual, isEnviandoResposta, respostaRegistrada],
  );

  const avancarOuConcluir = useCallback(async () => {
    if (statusSessao === 'concluida') {
      await confirmarConclusaoSessao();
      return;
    }

    await carregarProximaQuestao();
  }, [statusSessao, confirmarConclusaoSessao, carregarProximaQuestao]);

  const progressoLabel = useMemo(() => {
    if (!progressoSessao) {
      return null;
    }

    return `${progressoSessao.respondidas}/${progressoSessao.total} questões respondidas`;
  }, [progressoSessao]);

  const podeAvancar = useMemo(() => Boolean(respostaRegistrada), [respostaRegistrada]);

  const formatarDominio = useCallback((valor: number) => valor.toFixed(3), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Atividades</Text>
          <Text style={styles.subtitle}>
            Configure e inicie um treino adaptativo para reforçar as habilidades que mais precisam de atenção.
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
            {statusSessao ? (
              <Text style={styles.resultItem}>
                <Text style={styles.resultLabel}>Status: </Text>
                {statusSessao === 'concluida' ? 'Concluída' : 'Em andamento'}
              </Text>
            ) : null}
            {progressoLabel ? (
              <Text style={styles.resultItem}>
                <Text style={styles.resultLabel}>Progresso: </Text>
                {progressoLabel}
              </Text>
            ) : null}
            {reforcoEspacadoAtivo ? (
              <Text style={styles.resultHighlight}>
                Modo reforço espaçado ativo para esta questão.
              </Text>
            ) : null}
            {erroQuestao ? <Text style={styles.errorText}>{erroQuestao}</Text> : null}
            {isCarregandoQuestao ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#1D4ED8" />
                <Text style={styles.loadingText}>Buscando próxima questão...</Text>
              </View>
            ) : null}
            {questaoAtual ? (
              <View style={styles.questionCard}>
                <Text style={styles.questionTitle}>{questaoAtual.enunciado}</Text>
                {questaoAtual.descricao ? (
                  <Text style={styles.questionDescription}>{questaoAtual.descricao}</Text>
                ) : null}
                <View style={styles.questionMeta}>
                  <Text style={styles.questionMetaText}>
                    Dificuldade sugerida: nível {questaoAtual.dificuldadeAlvo}
                  </Text>
                  <Text style={styles.questionMetaText}>
                    Dificuldade real: nível {questaoAtual.dificuldade}
                  </Text>
                </View>
                <View style={styles.skillCard}>
                  <Text style={styles.skillTitle}>{questaoAtual.habilidadeAlvo.nome}</Text>
                  <Text style={styles.skillCode}>{questaoAtual.habilidadeAlvo.codigo}</Text>
                  <Text style={styles.skillDomain}>
                    Domínio atual estimado: {formatarDominio(questaoAtual.habilidadeAlvo.dominio)}
                  </Text>
                </View>
                <View style={styles.optionsList}>
                  {questaoAtual.opcoes.map((opcao) => {
                    const isSelecionada = opcaoSelecionadaId === opcao.id;
                    const isRespostaEnviada = Boolean(respostaRegistrada);
                    const isCorreta =
                      isRespostaEnviada && isSelecionada && respostaRegistrada?.correta === true;
                    const isIncorreta =
                      isRespostaEnviada && isSelecionada && respostaRegistrada?.correta === false;

                    return (
                      <Pressable
                        key={opcao.id}
                        onPress={() => enviarResposta(opcao.id)}
                        style={[
                          styles.optionButton,
                          isSelecionada && styles.optionButtonSelected,
                          isCorreta && styles.optionButtonCorrect,
                          isIncorreta && styles.optionButtonIncorrect,
                          (isEnviandoResposta || isRespostaEnviada) && styles.optionButtonDisabled,
                        ]}
                        disabled={isEnviandoResposta || isRespostaEnviada}
                      >
                        <Text
                          style={[
                            styles.optionButtonText,
                            isSelecionada && styles.optionButtonTextSelected,
                          ]}
                        >
                          {opcao.descricao}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
            {respostaRegistrada ? (
              <View style={styles.feedbackCard}>
                <Text
                  style={[
                    styles.feedbackTitle,
                    respostaRegistrada.correta
                      ? styles.feedbackTitleSuccess
                      : styles.feedbackTitleError,
                  ]}
                >
                  {respostaRegistrada.correta ? 'Resposta correta!' : 'Resposta incorreta.'}
                </Text>
                <Text style={styles.feedbackMessage}>{respostaRegistrada.feedback}</Text>
                {respostaRegistrada.microdica ? (
                  <Text style={styles.feedbackHint}>{respostaRegistrada.microdica}</Text>
                ) : null}
                <View style={styles.skillDeltaList}>
                  {respostaRegistrada.habilidades.map((habilidade) => (
                    <View key={habilidade.id} style={styles.skillDeltaItem}>
                      <Text style={styles.skillDeltaTitle}>{habilidade.nome}</Text>
                      <Text style={styles.skillDeltaText}>
                        Domínio: {formatarDominio(habilidade.dominioAntes)} → {formatarDominio(habilidade.dominioDepois)} ({
                          habilidade.delta > 0 ? '+' : ''
                        }
                        {formatarDominio(habilidade.delta)})
                      </Text>
                    </View>
                  ))}
                </View>
                {respostaRegistrada.proximaRevisaoEm ? (
                  <Text style={styles.nextReviewText}>
                    Próxima revisão recomendada em: {respostaRegistrada.proximaRevisaoEm}
                  </Text>
                ) : null}
                <CustomButton
                  title={statusSessao === 'concluida' ? 'Finalizar sessão' : 'Avançar para a próxima'}
                  onPress={avancarOuConcluir}
                  disabled={!podeAvancar || isCarregandoQuestao || isConcluindo}
                  style={styles.nextButton}
                  textStyle={styles.nextButtonText}
                />
              </View>
            ) : null}
            {statusSessao === 'concluida' && conclusaoSessao ? (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Sessão concluída</Text>
                <Text style={styles.summaryText}>
                  Total planejado: {conclusaoSessao.totalQuestoesPlanejado} questões
                </Text>
                <Text style={styles.summaryText}>
                  Respondidas: {conclusaoSessao.totalRespondidas}
                </Text>
                <Text style={styles.summaryText}>
                  Corretas: {conclusaoSessao.totalCorretas}
                </Text>
                <Text style={styles.summaryText}>
                  Pontuação: {Math.round(conclusaoSessao.pontuacao)}%
                </Text>
                <Text style={styles.summaryText}>Concluído em: {conclusaoSessao.concluidoEm}</Text>
                {conclusaoSessao.novasInsignias.length > 0 ? (
                  <View style={styles.badgeList}>
                    <Text style={styles.badgeTitle}>Novas insignias:</Text>
                    {conclusaoSessao.novasInsignias.map((badge, index) => {
                      const nomeInsignia =
                        badge && typeof badge['nome'] === 'string'
                          ? (badge['nome'] as string)
                          : `Conquista #${index + 1}`;
                      return (
                        <Text key={index} style={styles.badgeItem}>
                          {nomeInsignia}
                        </Text>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.badgeEmpty}>Nenhuma nova insignia desta vez.</Text>
                )}
              </View>
            ) : null}
            {erroConclusao ? <Text style={styles.errorText}>{erroConclusao}</Text> : null}
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
    gap: 12,
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
  resultHighlight: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  questionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#CBD5F5',
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  questionDescription: {
    fontSize: 15,
    lineHeight: 21,
    color: '#475569',
  },
  questionMeta: {
    gap: 4,
  },
  questionMetaText: {
    fontSize: 13,
    color: '#334155',
  },
  skillCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  skillTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  skillCode: {
    fontSize: 13,
    color: '#475569',
  },
  skillDomain: {
    fontSize: 13,
    color: '#0F172A',
  },
  optionsList: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionButtonSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  optionButtonCorrect: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  optionButtonIncorrect: {
    borderColor: '#DC2626',
    backgroundColor: '#FEE2E2',
  },
  optionButtonDisabled: {
    opacity: 0.7,
  },
  optionButtonText: {
    fontSize: 15,
    color: '#0F172A',
  },
  optionButtonTextSelected: {
    fontWeight: '600',
    color: '#1D4ED8',
  },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  feedbackTitleSuccess: {
    color: '#16A34A',
  },
  feedbackTitleError: {
    color: '#DC2626',
  },
  feedbackMessage: {
    fontSize: 15,
    color: '#0F172A',
  },
  feedbackHint: {
    fontSize: 14,
    color: '#1D4ED8',
  },
  skillDeltaList: {
    gap: 12,
  },
  skillDeltaItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  skillDeltaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  skillDeltaText: {
    fontSize: 13,
    color: '#334155',
  },
  nextReviewText: {
    fontSize: 13,
    color: '#475569',
  },
  nextButton: {
    marginTop: 8,
    backgroundColor: '#1D4ED8',
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#E0ECFF',
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  summaryText: {
    fontSize: 14,
    color: '#0F172A',
  },
  badgeList: {
    marginTop: 12,
    gap: 6,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  badgeItem: {
    fontSize: 13,
    color: '#0F172A',
  },
  badgeEmpty: {
    marginTop: 12,
    fontSize: 13,
    color: '#475569',
  },
});
