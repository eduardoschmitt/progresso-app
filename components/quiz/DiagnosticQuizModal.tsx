import { useMemo } from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CustomButton from '@/components/CustomButton';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDiagnosticQuiz } from '@/hooks/use-diagnostic-quiz';

export default function DiagnosticQuizModal() {
  const colorScheme = useColorScheme();
  const {
    quiz,
    status,
    errorMessage,
    showModal,
    currentQuestionIndex,
    answers,
    savingQuestionId,
    requiresReauthentication,
    selectOption,
    goToNext,
    goToPrevious,
    retry,
    finalize,
    resetError,
    navigateToLogin,
  } = useDiagnosticQuiz();

  const themeColors = Colors[colorScheme ?? 'light'];

  const question = quiz?.questoes[currentQuestionIndex] ?? null;
  const totalQuestions = quiz?.questoes.length ?? 0;
  const isLoading = status === 'loading';
  const isSaving = status === 'saving';
  const isFinalizing = status === 'finalizing';
  const isError = status === 'error';

  const progressText = useMemo(() => {
    if (!quiz || !question) {
      return '';
    }

    return `${currentQuestionIndex + 1} de ${totalQuestions}`;
  }, [quiz, question, currentQuestionIndex, totalQuestions]);
  const allAnswered = useMemo(() => {
    if (!quiz) {
      return false;
    }

    return quiz.questoes.every((item) => Boolean(answers[item.id]));
  }, [quiz, answers]);

  if (!showModal) {
    return null;
  }

  const handleRetry = () => {
    resetError();
    void retry();
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    resetError();
    void selectOption(questionId, optionId);
  };

  const handleFinalize = () => {
    resetError();
    void finalize();
  };

  const canGoNext = currentQuestionIndex < totalQuestions - 1;
  const canGoPrevious = currentQuestionIndex > 0;
  const questionAnswer = question ? answers[question.id] : undefined;

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {isLoading && (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={themeColors.tint} />
              <Text style={styles.loadingText}>Carregando diagnóstico...</Text>
            </View>
          )}

          {!isLoading && isError && (
            <View style={styles.centered}>
              <Text style={styles.errorText}>{errorMessage}</Text>
              <CustomButton
                title={requiresReauthentication ? 'Voltar ao login' : 'Tentar novamente'}
                onPress={
                  requiresReauthentication
                    ? () => {
                        void navigateToLogin();
                      }
                    : handleRetry
                }
                style={styles.retryButton}
              />
            </View>
          )}

          {!isLoading && !isError && question && (
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>{quiz?.titulo}</Text>
                <Text style={styles.subtitle}>{quiz?.descricao}</Text>
                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>Progresso</Text>
                  <Text style={styles.progressValue}>{progressText}</Text>
                </View>
              </View>

              {errorMessage && (
                <View style={styles.inlineError}>
                  <Ionicons name="warning" size={20} color="#b91c1c" />
                  <Text style={styles.inlineErrorText}>{errorMessage}</Text>
                </View>
              )}

              <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.questionContainer}>
                  <Text style={styles.questionOrder}>Pergunta {currentQuestionIndex + 1}</Text>
                  <Text style={styles.questionText}>{question.enunciado}</Text>
                </View>

                <View style={styles.optionsContainer}>
                  {question.opcoes.map((option) => {
                    const isSelected = questionAnswer === option.id;
                    const isDisabled = isSaving || isFinalizing || savingQuestionId === question.id;

                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[styles.option, isSelected && styles.optionSelected]}
                        onPress={() => handleSelectOption(question.id, option.id)}
                        disabled={isDisabled}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected, disabled: isDisabled }}
                      >
                        <View style={styles.optionContent}>
                          <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                            {option.rotulo}
                          </Text>
                          {isSelected && <Ionicons name="checkmark-circle" size={24} color={themeColors.tint} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <View style={styles.navigationRow}>
                  <TouchableOpacity
                    style={[styles.navButton, !canGoPrevious && styles.navButtonDisabled]}
                    onPress={goToPrevious}
                    disabled={!canGoPrevious || isSaving || isFinalizing}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !canGoPrevious }}
                  >
                    <Text style={styles.navButtonText}>Anterior</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
                    onPress={goToNext}
                    disabled={!canGoNext || isSaving || isFinalizing}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !canGoNext }}
                  >
                    <Text style={styles.navButtonText}>Próxima</Text>
                  </TouchableOpacity>
                </View>

                <CustomButton
                  title={isFinalizing ? 'Finalizando...' : 'Finalizar diagnóstico'}
                  onPress={handleFinalize}
                  disabled={!allAnswered || isSaving || isFinalizing}
                />

                {(isSaving || isFinalizing) && (
                  <View style={styles.savingRow}>
                    <ActivityIndicator size="small" color={themeColors.tint} />
                    <Text style={styles.savingText}>
                      {isFinalizing ? 'Confirmando conclusão...' : 'Salvando resposta...'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#0F172A',
    textAlign: 'center',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#b91c1c',
    textAlign: 'center',
    fontWeight: '600',
  },
  retryButton: {
    width: '100%',
  },
  content: {
    flex: 1,
  },
  header: {
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 16,
    color: '#334155',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  inlineError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  inlineErrorText: {
    color: '#b91c1c',
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  questionContainer: {
    marginBottom: 16,
    gap: 8,
  },
  questionOrder: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  optionSelected: {
    borderColor: '#F9B817',
    backgroundColor: '#FEF3C7',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#0F172A',
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '700',
  },
  footer: {
    gap: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#CBD5F5',
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.6,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  savingText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
});
