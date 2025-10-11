import { Alert } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';

import {
  createDiagnosticQuizSession,
  concludeDiagnosticQuizSession,
  DiagnosticAnswerPayload,
  DiagnosticQuizPayload,
  DiagnosticQuizQuestion,
  getDiagnosticQuiz,
  submitDiagnosticQuizAnswer,
  updateDiagnosticQuizAnswer,
  ApiError,
} from '@/src/lib/api';
import {
  clearDiagnosticProgress,
  getDiagnosticProgress,
  saveDiagnosticProgress,
} from '@/src/lib/quiz-storage';
import { useAuth } from '@/hooks/use-auth';

export type DiagnosticQuizQuestionWithOptions = DiagnosticQuizQuestion;

export type DiagnosticQuizData = {
  id: string;
  titulo: string;
  descricao: string;
  questoes: DiagnosticQuizQuestionWithOptions[];
};

type Status = 'idle' | 'loading' | 'ready' | 'saving' | 'finalizing' | 'error' | 'completed';

type DiagnosticQuizContextValue = {
  quiz: DiagnosticQuizData | null;
  status: Status;
  errorMessage: string | null;
  showModal: boolean;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  savingQuestionId: string | null;
  requiresReauthentication: boolean;
  selectOption: (questionId: string, optionId: string) => Promise<void>;
  goToNext: () => Promise<void>;
  goToPrevious: () => void;
  retry: () => Promise<void>;
  finalize: () => Promise<void>;
  resetError: () => void;
  navigateToLogin: () => Promise<void>;
};

const DiagnosticQuizContext = createContext<DiagnosticQuizContextValue | undefined>(undefined);

function isQuizCompleted(payload: DiagnosticQuizPayload): boolean {
  if (payload.concluido) {
    return true;
  }

  if (payload.status?.toUpperCase() === 'CONCLUIDO') {
    return true;
  }

  return false;
}

function extractQuizData(payload: DiagnosticQuizPayload): DiagnosticQuizData {
  const sortedQuestions = [...payload.questoes].sort((a, b) => a.ordem - b.ordem);

  return {
    id: payload.id,
    titulo: payload.titulo,
    descricao: payload.descricao,
    questoes: sortedQuestions,
  };
}

export function DiagnosticQuizProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, markDiagnosticComplete, clearSession } = useAuth();

  const [quiz, setQuiz] = useState<DiagnosticQuizData | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [requiresReauthentication, setRequiresReauthentication] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const sessionIdRef = useRef<string | null>(null);
  const initializingRef = useRef(false);
  const answersRef = useRef<Record<string, string>>({});
  const submittedAnswersRef = useRef<Record<string, string>>({});
  const pendingQuestionsRef = useRef<Set<string>>(new Set());
  const quizQuestions = useMemo(() => quiz?.questoes ?? [], [quiz]);
  const totalQuizQuestions = quizQuestions.length;

  const resetState = useCallback(async () => {
    setQuiz(null);
    setStatus('idle');
    setErrorMessage(null);
    setShowModal(false);
    setCurrentQuestionIndex(0);
    setSavingQuestionId(null);
    setRequiresReauthentication(false);
    sessionIdRef.current = null;
    initializingRef.current = false;
    answersRef.current = {};
    submittedAnswersRef.current = {};
    pendingQuestionsRef.current = new Set();
    setAnswers({});
    await clearDiagnosticProgress();
  }, []);

  const initialize = useCallback(async () => {
    if (!session) {
      return;
    }

    if (initializingRef.current) {
      return;
    }

    if (sessionIdRef.current) {
      setShowModal(true);

      setStatus((previousStatus) => (previousStatus === 'idle' ? 'ready' : previousStatus));
      return;
    }

    initializingRef.current = true;

    setStatus('loading');
    setErrorMessage(null);
    setShowModal(true);
    setRequiresReauthentication(false);

    try {
      const payload = await getDiagnosticQuiz(session.token);

      if (isQuizCompleted(payload)) {
        await markDiagnosticComplete(true);
        await resetState();
        return;
      }

      const quizData = extractQuizData(payload);
      setQuiz(quizData);

      let storedProgress = await getDiagnosticProgress();
      let sessionId = storedProgress?.sessionId ?? sessionIdRef.current ?? null;

      if (!sessionId) {
        const sessionResponse = await createDiagnosticQuizSession(session.token, session.user.id);
        sessionId = sessionResponse.id ?? sessionResponse.sessaoId ?? null;

        if (!sessionId) {
          throw new Error('Sessão de diagnóstico inválida.');
        }

        await saveDiagnosticProgress({
          sessionId,
          answers: {},
          currentQuestionIndex: 0,
          updatedAt: new Date().toISOString(),
        });

        storedProgress = null;
      }

      sessionIdRef.current = sessionId;

      if (storedProgress && storedProgress.sessionId === sessionId) {
        answersRef.current = storedProgress.answers;
        submittedAnswersRef.current = storedProgress.answers;
        setAnswers(storedProgress.answers);
        setCurrentQuestionIndex(
          Math.min(storedProgress.currentQuestionIndex, Math.max(quizData.questoes.length - 1, 0)),
        );
      } else {
        answersRef.current = {};
        submittedAnswersRef.current = {};
        setAnswers({});
        setCurrentQuestionIndex(0);

        await saveDiagnosticProgress({
          sessionId,
          answers: {},
          currentQuestionIndex: 0,
          updatedAt: new Date().toISOString(),
        });
      }

      setStatus('ready');
    } catch (error) {
      console.error('Failed to initialize diagnostic quiz', error);

      sessionIdRef.current = null;

      let message = 'Não foi possível carregar o quiz diagnóstico. Verifique sua conexão e tente novamente.';

      if (error instanceof ApiError) {
        if (error.status === 401) {
          message = 'Sua sessão expirou. Entre novamente para continuar.';
          setRequiresReauthentication(true);
        } else if (error.message) {
          message = error.message;
        }
      }

      setErrorMessage(message);
      setStatus('error');
      setShowModal(true);
    }
    finally {
      initializingRef.current = false;
    }
  }, [session, markDiagnosticComplete, resetState]);

  useEffect(() => {
    if (!session) {
      void resetState();
      return;
    }

    void initialize();
  }, [initialize, resetState, session]);

  const persistProgress = useCallback(
    async (index: number, answers?: Record<string, string>) => {
      if (!sessionIdRef.current) {
        return;
      }

      const snapshot = {
        sessionId: sessionIdRef.current,
        answers: answers ?? answersRef.current,
        currentQuestionIndex: index,
        updatedAt: new Date().toISOString(),
      };

      try {
        await saveDiagnosticProgress(snapshot);
      } catch (error) {
        console.warn('Failed to persist diagnostic quiz progress', error);
      }
    },
    [],
  );

  const finalizeQuiz = useCallback(
    async (serverResponse?: DiagnosticAnswerPayload) => {
      if (!session) {
        return;
      }

      if (status === 'finalizing') {
        return;
      }

      setStatus('finalizing');

      try {
        if (serverResponse?.concluido) {
          await markDiagnosticComplete(true);
          await resetState();
          Alert.alert(
            'Diagnóstico concluído!',
            'Obrigado por compartilhar suas respostas. Vamos redirecionar você para o dashboard.',
            [
              {
                text: 'Ir para o dashboard',
                onPress: () => router.replace('/(tabs)/index'),
              },
            ],
          );
          return;
        }

        const freshPayload = await getDiagnosticQuiz(session.token);

        if (isQuizCompleted(freshPayload)) {
          await markDiagnosticComplete(true);
          await resetState();
          Alert.alert(
            'Diagnóstico concluído!',
            'Obrigado por compartilhar suas respostas. Vamos redirecionar você para o dashboard.',
            [
              {
                text: 'Ir para o dashboard',
                onPress: () => router.replace('/(tabs)/index'),
              },
            ],
          );
          return;
        }

        setStatus('ready');
        if (serverResponse?.mensagem) {
          setErrorMessage(serverResponse.mensagem);
        } else {
          setErrorMessage('Não foi possível confirmar a conclusão do diagnóstico. Tente novamente.');
        }
      } catch (error) {
        console.error('Failed to confirm diagnostic completion', error);
        setStatus('ready');
        setErrorMessage('Não foi possível confirmar a conclusão. Tente novamente.');
      }
    },
    [markDiagnosticComplete, resetState, router, session, status],
  );

  const flushAnswerForQuestion = useCallback(
    async (questionId: string): Promise<DiagnosticAnswerPayload | undefined> => {
      if (!pendingQuestionsRef.current.has(questionId)) {
        return undefined;
      }

      if (!session || !sessionIdRef.current) {
        setErrorMessage('Sessão inválida. Faça login novamente.');
        return undefined;
      }

      const selectedOption = answersRef.current[questionId];

      if (!selectedOption) {
        pendingQuestionsRef.current.delete(questionId);
        return undefined;
      }

      const previouslySubmitted = submittedAnswersRef.current[questionId];

      setSavingQuestionId(questionId);
      setStatus('saving');

      try {
        let response: DiagnosticAnswerPayload | undefined;

        if (previouslySubmitted) {
          response = await updateDiagnosticQuizAnswer(
            session.token,
            sessionIdRef.current,
            questionId,
            selectedOption,
          );
        } else {
          response = await submitDiagnosticQuizAnswer(session.token, sessionIdRef.current, {
            questaoId: questionId,
            opcaoId: selectedOption,
          });
        }

        submittedAnswersRef.current = {
          ...submittedAnswersRef.current,
          [questionId]: selectedOption,
        };
        pendingQuestionsRef.current.delete(questionId);
        setSavingQuestionId(null);
        setStatus('ready');
        await persistProgress(currentQuestionIndex, { ...answersRef.current });

        return response;
      } catch (error) {
        console.error('Failed to submit diagnostic answer', error);

        setSavingQuestionId(null);
        setStatus('ready');

        if (error instanceof ApiError && error.status === 401) {
          setRequiresReauthentication(true);
          setErrorMessage('Sua sessão expirou. Faça login novamente.');
          return undefined;
        }

        setErrorMessage('Não foi possível salvar sua resposta. Verifique sua conexão e tente novamente.');

        return undefined;
      }
    },
    [currentQuestionIndex, persistProgress, session],
  );

  const flushAllPending = useCallback(async () => {
    const responses: DiagnosticAnswerPayload[] = [];

    for (const question of quizQuestions) {
      if (!pendingQuestionsRef.current.has(question.id)) {
        continue;
      }

      const response = await flushAnswerForQuestion(question.id);

      if (!response) {
        return responses;
      }

      responses.push(response);
    }

    return responses;
  }, [flushAnswerForQuestion, quizQuestions]);

  const selectOption = useCallback(
    async (questionId: string, optionId: string) => {
      if (!session || !sessionIdRef.current) {
        setErrorMessage('Sessão inválida. Faça login novamente.');
        return;
      }

      const snapshotBeforeChange = { ...answersRef.current };
      const previousValue = snapshotBeforeChange[questionId];

      if (previousValue === optionId) {
        return;
      }

      const optimisticAnswers = { ...snapshotBeforeChange, [questionId]: optionId };

      answersRef.current = optimisticAnswers;
      setAnswers(optimisticAnswers);
      pendingQuestionsRef.current.add(questionId);
      setErrorMessage(null);

      try {
        await persistProgress(currentQuestionIndex, optimisticAnswers);
      } catch (error) {
        console.warn('Failed to persist diagnostic quiz progress after selection', error);
      }
    },
    [currentQuestionIndex, persistProgress, session],
  );

  const goToNext = useCallback(async () => {
    const question = quizQuestions[currentQuestionIndex];

    if (question) {
      const response = await flushAnswerForQuestion(question.id);

      if (!response && pendingQuestionsRef.current.has(question.id)) {
        return;
      }
    }

    setCurrentQuestionIndex((prevIndex) => {
      const nextIndex = Math.min(prevIndex + 1, Math.max(totalQuizQuestions - 1, 0));

      if (nextIndex !== prevIndex) {
        void persistProgress(nextIndex);
      }

      return nextIndex;
    });
  }, [currentQuestionIndex, flushAnswerForQuestion, persistProgress, quizQuestions, totalQuizQuestions]);

  const goToPrevious = useCallback(() => {
    setCurrentQuestionIndex((prevIndex) => {
      const nextIndex = Math.max(prevIndex - 1, 0);

      if (nextIndex !== prevIndex) {
        void persistProgress(nextIndex);
      }

      return nextIndex;
    });
  }, [persistProgress]);

  const retry = useCallback(async () => {
    await initialize();
  }, [initialize]);

  const resetError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const finalize = useCallback(async () => {
    if (!quiz || !session || !sessionIdRef.current) {
      return;
    }

    const answeredCount = Object.keys(answersRef.current).length;

    if (answeredCount < totalQuizQuestions) {
      setErrorMessage('Responda todas as perguntas antes de finalizar.');
      return;
    }

    const responses = await flushAllPending();

    if (pendingQuestionsRef.current.size > 0) {
      return;
    }

    let response = responses.find((item) => item?.concluido);

    if (!response) {
      try {
        response = await concludeDiagnosticQuizSession(session.token, sessionIdRef.current);
      } catch (error) {
        console.error('Failed to conclude diagnostic quiz session', error);

        if (error instanceof ApiError) {
          if (error.status === 401) {
            setRequiresReauthentication(true);
            setErrorMessage('Sua sessão expirou. Faça login novamente.');
          } else {
            setErrorMessage(error.message || 'Não foi possível concluir o diagnóstico.');
          }
        } else {
          setErrorMessage('Não foi possível concluir o diagnóstico. Verifique sua conexão e tente novamente.');
        }

        return;
      }
    }

    await finalizeQuiz(response);
  }, [
    finalizeQuiz,
    flushAllPending,
    quiz,
    session,
    totalQuizQuestions,
  ]);

  const navigateToLogin = useCallback(async () => {
    await clearSession();
    router.replace('(auth)');
  }, [clearSession, router]);

  const contextValue = useMemo(
    () => ({
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
    }),
    [
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
    ],
  );

  return <DiagnosticQuizContext.Provider value={contextValue}>{children}</DiagnosticQuizContext.Provider>;
}

export function useDiagnosticQuizContext(): DiagnosticQuizContextValue {
  const context = useContext(DiagnosticQuizContext);

  if (!context) {
    throw new Error('useDiagnosticQuizContext must be used within DiagnosticQuizProvider');
  }

  return context;
}
