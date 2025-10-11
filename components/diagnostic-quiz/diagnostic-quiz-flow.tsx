import { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useDiagnosticQuiz } from '@/src/contexts/diagnostic-quiz-context';

const formatOptionLabel = (label?: string, fallback?: string) => label ?? fallback ?? 'Opção';

export function DiagnosticQuizFlow() {
  const {
    status,
    initialize,
    retry,
    fetchError,
    currentQuestion,
    currentQuestionIndex,
    progress,
    selectOption,
    answers,
    goToNextQuestion,
    goToPreviousQuestion,
    isSubmittingAnswer,
    answerError,
    clearAnswerError,
  } = useDiagnosticQuiz();

  useEffect(() => {
    if (status === 'idle') {
      void initialize();
    }
  }, [initialize, status]);

  useEffect(() => {
    if (!answerError) {
      return;
    }

    const timeout = setTimeout(() => {
      clearAnswerError();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [answerError, clearAnswerError]);

  if (status === 'loading' || status === 'idle') {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Carregando seu diagnóstico...</Text>
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Não foi possível carregar o diagnóstico.</Text>
        {fetchError ? <Text style={styles.errorMessage}>{fetchError}</Text> : null}
        <Pressable style={styles.retryButton} onPress={retry} accessibilityRole="button">
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (status === 'completed' || !currentQuestion) {
    return null;
  }

  const selected = answers[currentQuestion.id];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === progress.total - 1;

  const handleOptionPress = (optionId: string) => {
    if (isSubmittingAnswer) {
      return;
    }

    void selectOption(currentQuestion.id, optionId);
  };

  const isOptionSelected = (optionId: string) => {
    if (Array.isArray(selected)) {
      return selected.includes(optionId);
    }

    return selected === optionId;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Quiz diagnóstico</Text>
          <Text style={styles.progressText}>
            Pergunta {currentQuestionIndex + 1} de {progress.total}
          </Text>
          <View style={styles.progressBar} accessible accessibilityRole="progressbar">
            <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
          </View>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>{currentQuestion.enunciado}</Text>
          {currentQuestion.opcoes.map((option) => {
            const optionSelected = isOptionSelected(option.id);
            return (
              <Pressable
                key={option.id}
                style={[styles.option, optionSelected && styles.optionSelected]}
                onPress={() => handleOptionPress(option.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: optionSelected }}
              >
                <View style={[styles.optionIndicator, optionSelected && styles.optionIndicatorSelected]}>
                  {optionSelected ? <View style={styles.optionIndicatorDot} /> : null}
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>{formatOptionLabel(option.titulo, option.descricao)}</Text>
                  {option.descricao && option.descricao !== option.titulo ? (
                    <Text style={styles.optionDescription}>{option.descricao}</Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        {answerError ? <Text style={styles.answerError}>{answerError}</Text> : null}

        <View style={styles.navigation}>
          <Pressable
            style={[styles.navButton, isFirstQuestion && styles.navButtonDisabled]}
            onPress={goToPreviousQuestion}
            disabled={isFirstQuestion}
            accessibilityRole="button"
          >
            <Text style={[styles.navButtonText, isFirstQuestion && styles.navButtonTextDisabled]}>Anterior</Text>
          </Pressable>
          <Pressable
            style={[styles.navButton, isLastQuestion && styles.navButtonDisabled]}
            onPress={goToNextQuestion}
            disabled={isLastQuestion}
            accessibilityRole="button"
          >
            <Text style={[styles.navButtonText, isLastQuestion && styles.navButtonTextDisabled]}>Próxima</Text>
          </Pressable>
        </View>

        {isLastQuestion ? (
          <Text style={styles.helperText}>
            Ao responder esta pergunta o diagnóstico será finalizado automaticamente.
          </Text>
        ) : null}

        {isSubmittingAnswer ? (
          <View style={styles.savingContainer}>
            <ActivityIndicator size="small" />
            <Text style={styles.savingText}>Salvando resposta...</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
    backgroundColor: '#f4f6fb',
  },
  loadingText: {
    fontSize: 16,
    color: '#1f2933',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#b00020',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    gap: 24,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  progressText: {
    fontSize: 16,
    color: '#4b5563',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  questionContainer: {
    gap: 16,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  optionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIndicatorSelected: {
    borderColor: '#2563eb',
  },
  optionIndicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563eb',
  },
  optionTextContainer: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  optionDescription: {
    fontSize: 14,
    color: '#4b5563',
  },
  answerError: {
    color: '#b00020',
    fontSize: 14,
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  navButtonTextDisabled: {
    color: '#6b7280',
  },
  helperText: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  savingText: {
    fontSize: 14,
    color: '#4b5563',
  },
});
