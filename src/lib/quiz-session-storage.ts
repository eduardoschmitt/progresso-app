import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type DiagnosticQuizProgress = {
  userId: string;
  sessaoId: string;
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>;
  updatedAt: string;
};

const STORAGE_KEY = 'quiz.diagnostic.session';

const isWeb = Platform.OS === 'web';
let secureStoreAvailable: boolean | null = null;

async function ensureSecureStore(): Promise<boolean> {
  if (secureStoreAvailable !== null) {
    return secureStoreAvailable;
  }

  try {
    secureStoreAvailable = await SecureStore.isAvailableAsync();
  } catch (error) {
    console.warn('SecureStore availability check failed for quiz storage:', error);
    secureStoreAvailable = false;
  }

  return secureStoreAvailable;
}

function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

const memoryStorage: { value: DiagnosticQuizProgress | null } = {
  value: null,
};

export async function saveDiagnosticQuizProgress(
  progress: DiagnosticQuizProgress,
): Promise<void> {
  const serialized = JSON.stringify(progress);

  if (await ensureSecureStore()) {
    await SecureStore.setItemAsync(STORAGE_KEY, serialized);
    return;
  }

  if (isWeb && hasLocalStorage()) {
    window.localStorage.setItem(STORAGE_KEY, serialized);
    return;
  }

  memoryStorage.value = progress;
}

export async function getDiagnosticQuizProgress(): Promise<DiagnosticQuizProgress | null> {
  if (await ensureSecureStore()) {
    const stored = await SecureStore.getItemAsync(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as DiagnosticQuizProgress) : null;
  }

  if (isWeb && hasLocalStorage()) {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as DiagnosticQuizProgress) : null;
  }

  return memoryStorage.value;
}

export async function clearDiagnosticQuizProgress(): Promise<void> {
  if (await ensureSecureStore()) {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    return;
  }

  if (isWeb && hasLocalStorage()) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  memoryStorage.value = null;
}
