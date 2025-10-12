import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'diagnostic.quiz.progress';

declare global {
  var __diagnosticQuizProgress: string | undefined;
}

const isWeb = Platform.OS === 'web';

let secureStoreAvailable: boolean | null = null;

async function isSecureStoreAvailable(): Promise<boolean> {
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

export type StoredDiagnosticProgress = {
  sessionId: string;
  answers: Record<string, string>;
  currentQuestionIndex: number;
  updatedAt: string;
};

export async function saveDiagnosticProgress(progress: StoredDiagnosticProgress): Promise<void> {
  const payload = JSON.stringify(progress);

  if (await isSecureStoreAvailable()) {
    await SecureStore.setItemAsync(STORAGE_KEY, payload);
    return;
  }

  if (isWeb && hasLocalStorage()) {
    window.localStorage.setItem(STORAGE_KEY, payload);
    return;
  }

  globalThis.__diagnosticQuizProgress = payload;
}

export async function getDiagnosticProgress(): Promise<StoredDiagnosticProgress | null> {
  let payload: string | null = null;

  if (await isSecureStoreAvailable()) {
    payload = await SecureStore.getItemAsync(STORAGE_KEY);
  } else if (isWeb && hasLocalStorage()) {
    payload = window.localStorage.getItem(STORAGE_KEY);
  } else if (typeof globalThis.__diagnosticQuizProgress === 'string') {
    payload = globalThis.__diagnosticQuizProgress;
  }

  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(payload) as StoredDiagnosticProgress;
  } catch (error) {
    console.warn('Failed to parse diagnostic quiz progress', error);
    return null;
  }
}

export async function clearDiagnosticProgress(): Promise<void> {
  if (await isSecureStoreAvailable()) {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    return;
  }

  if (isWeb && hasLocalStorage()) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  globalThis.__diagnosticQuizProgress = undefined;
}
