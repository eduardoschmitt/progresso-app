import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth.token';
const SESSION_KEY = 'auth.session';
const DIAGNOSTIC_STATUS_KEY = 'diagnostic.status';

let secureStoreAvailable: boolean | null = null;

const memoryStorage = new Map<string, string | null>();

const isWeb = Platform.OS === 'web';

async function checkSecureStore(): Promise<boolean> {
  if (secureStoreAvailable !== null) {
    return secureStoreAvailable;
  }

  try {
    secureStoreAvailable = await SecureStore.isAvailableAsync();
  } catch (error) {
    console.warn('SecureStore availability check failed:', error);
    secureStoreAvailable = false;
  }

  return secureStoreAvailable;
}

function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

async function setItem(key: string, value: string | null): Promise<void> {
  if (await checkSecureStore()) {
    if (value === null) {
      await SecureStore.deleteItemAsync(key);
      return;
    }

    await SecureStore.setItemAsync(key, value);
    return;
  }

  if (isWeb && hasLocalStorage()) {
    if (value === null) {
      window.localStorage.removeItem(key);
      return;
    }

    window.localStorage.setItem(key, value);
    return;
  }

  memoryStorage.set(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (await checkSecureStore()) {
    return SecureStore.getItemAsync(key);
  }

  if (isWeb && hasLocalStorage()) {
    return window.localStorage.getItem(key);
  }

  return memoryStorage.get(key) ?? null;
}

export async function saveToken(token: string): Promise<void> {
  await setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return getItem(TOKEN_KEY);
}

export async function deleteToken(): Promise<void> {
  await setItem(TOKEN_KEY, null);
}

export type StoredUser = {
  id: string;
  nome: string;
  email: string;
};

export type AuthSession = {
  token: string;
  user: StoredUser;
};

export async function saveSession(session: AuthSession): Promise<void> {
  await saveToken(session.token);
  await setItem(SESSION_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<AuthSession | null> {
  const raw = await getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    return parsed;
  } catch (error) {
    console.warn('Failed to parse stored session', error);
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  await deleteToken();
  await setItem(SESSION_KEY, null);
}

export async function saveDiagnosticStatus(complete: boolean): Promise<void> {
  const payload = JSON.stringify({ complete, updatedAt: new Date().toISOString() });
  await setItem(DIAGNOSTIC_STATUS_KEY, payload);
}

export async function getDiagnosticStatus(): Promise<boolean> {
  const raw = await getItem(DIAGNOSTIC_STATUS_KEY);

  if (!raw) {
    return false;
  }

  try {
    const parsed = JSON.parse(raw) as { complete?: boolean };
    return Boolean(parsed.complete);
  } catch (error) {
    console.warn('Failed to parse diagnostic status', error);
    return false;
  }
}

export async function clearDiagnosticStatus(): Promise<void> {
  await setItem(DIAGNOSTIC_STATUS_KEY, null);
}
