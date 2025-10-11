import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ApiError } from '@/src/lib/api';
import { getUser, type StoredUser } from '@/src/lib/auth-storage';
import {
  createOrResumeDiagnosticSession,
  fetchDiagnosticQuiz,
  submitDiagnosticAnswer,
  type DiagnosticQuizAnswerResponse,
  type DiagnosticQuizQuestion,
  type DiagnosticQuizResponse,
} from '@/src/lib/quiz-api';
import {
  clearDiagnosticQuizProgress,
  getDiagnosticQuizProgress,
  saveDiagnosticQuizProgress,
} from '@/src/lib/quiz-session-storage';
import { calculateCompletionPercentage, clampQuestionIndex, countAnsweredQuestions } from '@/src/lib/quiz-utils';

interface DiagnosticQuizContextValue {
  status: 'idle' | 'loading' | 'error' | 'in_progress' | 'completed';
  quiz: DiagnosticQuizResponse | null;
  currentQuestion: DiagnosticQuizQuestion | null;
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>;
  initialize: (force?: boolean) => Promise<void>;
  retry: () => Promise<void>;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  selectOption: (questionId: string, optionId: string) => Promise<void>;
  isSubmittingAnswer: boolean;
  fetchError: string | null;
  answerError: string | null;
  clearAnswerError: () => void;
  progress: {
    answered: number;
    total: number;
    percentage: number;
  };
  completionMessage: string | null;
}

const DiagnosticQuizContext = createContext<DiagnosticQuizContextValue | undefined>(undefined);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export function DiagnosticQuizProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<DiagnosticQuizContextValue['status']>('idle');
  const [quiz, setQuiz] = useState<DiagnosticQuizResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);

  const userRef = useRef<StoredUser | null>(null);
  const isInitializingRef = useRef(false);

  const totalQuestions = quiz?.questoes.length ?? 0;

  const persistProgress = useCallback(
    async (
      partial?: Partial<{
        answers: Record<string, string | string[]>;
        currentQuestionIndex: number;
        sessaoId: string;
      }>,
    ) => {
      const effectiveSessionId = partial?.sessaoId ?? sessionId;

      if (!userRef.current || !effectiveSessionId) {
        return;
      }

      try {
        await saveDiagnosticQuizProgress({
          userId: userRef.current.id,
          sessaoId: effectiveSessionId,
          currentQuestionIndex: partial?.currentQuestionIndex ?? currentQuestionIndex,
          answers: partial?.answers ?? answers,
          updatedAt: new Date().toISOString(),
        });
      } catch (storageError) {
        console.warn('Não foi possível salvar o progresso local do quiz diagnóstico:', storageError);
      }
    },
    [answers, currentQuestionIndex, sessionId],
  );

  const resetState = useCallback(async () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setSessionId(null);
    setCompletionMessage(null);
    await clearDiagnosticQuizProgress();
  }, []);

  const initialize = useCallback(
    async (force = false) => {
      if (isInitializingRef.current) {
        return;
      }

      if (!force && (status === 'in_progress' || status === 'loading')) {
        return;
      }

      isInitializingRef.current = true;
      setStatus('loading');
      setFetchError(null);
      setCompletionMessage(null);

      try {
        const user = await getUser();

        if (!user) {
          throw new ApiError('Sessão expirada. Faça login novamente.', 401);
        }

        userRef.current = user;

        const [quizResponse, storedProgress, sessionResponse] = await Promise.all([
          fetchDiagnosticQuiz(),
          getDiagnosticQuizProgress(),
          createOrResumeDiagnosticSession({ usuarioId: user.id }),
        ]);

        if (quizResponse.concluido) {
          setQuiz(quizResponse);
          await resetState();
          setStatus('completed');
          setCompletionMessage('Diagnóstico concluído!');
          return;
        }

        const sanitizedIndex = clampQuestionIndex(
          storedProgress?.userId === user.id ? storedProgress.currentQuestionIndex : 0,
          quizResponse.questoes,
        );

        const storedAnswers =
          storedProgress?.userId === user.id ? storedProgress.answers : {};

        setQuiz(quizResponse);
        setAnswers(storedAnswers);
        setCurrentQuestionIndex(sanitizedIndex);
        setSessionId(sessionResponse.sessaoId);
        setStatus('in_progress');
        setCompletionMessage(null);

        await persistProgress({
          answers: storedAnswers,
          currentQuestionIndex: sanitizedIndex,
          sessaoId: sessionResponse.sessaoId,
        });
      } catch (error) {
        console.error('Falha ao carregar o quiz diagnóstico:', error);
        setStatus('error');
        setFetchError(
          getErrorMessage(error, 'Não foi possível carregar o quiz diagnóstico. Tente novamente.'),
        );
      } finally {
        isInitializingRef.current = false;
      }
    },
    [persistProgress, resetState, status],
  );

  const retry = useCallback(async () => {
    await initialize(true);
  }, [initialize]);

  const completeQuiz = useCallback(async () => {
    setStatus('completed');
    setCompletionMessage('Diagnóstico concluído! Vamos para a próxima etapa.');
    await resetState();
  }, [resetState]);

  const handleCompletionFromResponse = useCallback(
    async (response: DiagnosticQuizAnswerResponse | null, updatedAnswers: Record<string, string | string[]>) => {
      const answeredCount =
        response?.respondidas ?? countAnsweredQuestions(updatedAnswers);

      if (response?.concluido || (quiz && answeredCount >= quiz.questoes.length)) {
        await completeQuiz();
        return true;
      }

      return false;
    },
    [completeQuiz, quiz],
  );

  const selectOption = useCallback(
    async (questionId: string, optionId: string) => {
      if (!quiz || !sessionId || !userRef.current) {
        setAnswerError('Sessão do quiz não encontrada. Reabra o aplicativo para tentar novamente.');
        return;
      }

      const question = quiz.questoes.find((item) => item.id === questionId);

      if (!question) {
        setAnswerError('Questão selecionada não encontrada.');
        return;
      }

      const nextAnswers: Record<string, string | string[]> = { ...answers, [questionId]: optionId };

      setAnswers(nextAnswers);
      setAnswerError(null);
      setIsSubmittingAnswer(true);

      try {
        const response = await submitDiagnosticAnswer(sessionId, {
          questaoId: questionId,
          opcaoId: optionId,
        });

        const isCompleted = await handleCompletionFromResponse(response, nextAnswers);

        if (!isCompleted) {
          await persistProgress({ answers: nextAnswers });
        }
      } catch (error) {
        console.error('Falha ao enviar resposta do quiz diagnóstico:', error);
        setAnswerError(
          getErrorMessage(error, 'Não foi possível salvar sua resposta. Tente novamente.'),
        );
      } finally {
        setIsSubmittingAnswer(false);
      }
    },
    [answers, handleCompletionFromResponse, persistProgress, quiz, sessionId],
  );

  const updateQuestionIndex = useCallback(
    async (direction: 'next' | 'previous') => {
      if (!quiz) {
        return;
      }

      const delta = direction === 'next' ? 1 : -1;
      const nextIndex = clampQuestionIndex(currentQuestionIndex + delta, quiz.questoes);

      if (nextIndex === currentQuestionIndex) {
        return;
      }

      setCurrentQuestionIndex(nextIndex);
      await persistProgress({ currentQuestionIndex: nextIndex });
    },
    [currentQuestionIndex, persistProgress, quiz],
  );

  const goToNextQuestion = useCallback(() => {
    void updateQuestionIndex('next');
  }, [updateQuestionIndex]);

  const goToPreviousQuestion = useCallback(() => {
    void updateQuestionIndex('previous');
  }, [updateQuestionIndex]);

  const clearAnswerError = useCallback(() => {
    setAnswerError(null);
  }, []);

  const progress = useMemo(() => {
    const answered = countAnsweredQuestions(answers);
    return {
      answered,
      total: totalQuestions,
      percentage: calculateCompletionPercentage(answered, totalQuestions),
    };
  }, [answers, totalQuestions]);

  const currentQuestion = quiz?.questoes[currentQuestionIndex] ?? null;

  const value = useMemo<DiagnosticQuizContextValue>(
    () => ({
      status,
      quiz,
      currentQuestion,
      currentQuestionIndex,
      answers,
      initialize,
      retry,
      goToNextQuestion,
      goToPreviousQuestion,
      selectOption,
      isSubmittingAnswer,
      fetchError,
      answerError,
      clearAnswerError,
      progress,
      completionMessage,
    }),
    [
      answers,
      answerError,
      clearAnswerError,
      completionMessage,
      currentQuestion,
      currentQuestionIndex,
      fetchError,
      goToNextQuestion,
      goToPreviousQuestion,
      initialize,
      isSubmittingAnswer,
      progress,
      retry,
      selectOption,
      status,
      quiz,
    ],
  );

  return <DiagnosticQuizContext.Provider value={value}>{children}</DiagnosticQuizContext.Provider>;
}

export const useDiagnosticQuiz = (): DiagnosticQuizContextValue => {
  const context = useContext(DiagnosticQuizContext);

  if (!context) {
    throw new Error('useDiagnosticQuiz deve ser usado dentro de DiagnosticQuizProvider');
  }

  return context;
};
