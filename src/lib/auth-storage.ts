import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth.token';
const USER_KEY = 'auth.user';

let secureStoreAvailable: boolean | null = null;

type StoredUser = {
  id: string;
  nome: string;
  email: string;
};

const memoryStorage: { token: string | null; user: StoredUser | null } = {
  token: null,
  user: null,
};

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

export type { StoredUser };

export async function saveToken(token: string): Promise<void> {
  if (await checkSecureStore()) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return;
  }

  if (isWeb && hasLocalStorage()) {
    window.localStorage.setItem(TOKEN_KEY, token);
    return;
  }

  memoryStorage.token = token;
}

export async function getToken(): Promise<string | null> {
  if (await checkSecureStore()) {
    return SecureStore.getItemAsync(TOKEN_KEY);
  }

  if (isWeb && hasLocalStorage()) {
    return window.localStorage.getItem(TOKEN_KEY);
  }

  return memoryStorage.token;
}

export async function deleteToken(): Promise<void> {
  if (await checkSecureStore()) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    return;
  }

  if (isWeb && hasLocalStorage()) {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }

  memoryStorage.token = null;
}

export async function saveUser(user: StoredUser): Promise<void> {
  const serialized = JSON.stringify(user);

  if (await checkSecureStore()) {
    await SecureStore.setItemAsync(USER_KEY, serialized);
    return;
  }

  if (isWeb && hasLocalStorage()) {
    window.localStorage.setItem(USER_KEY, serialized);
    return;
  }

  memoryStorage.user = user;
}

export async function getUser(): Promise<StoredUser | null> {
  if (await checkSecureStore()) {
    const stored = await SecureStore.getItemAsync(USER_KEY);
    return stored ? (JSON.parse(stored) as StoredUser) : null;
  }

  if (isWeb && hasLocalStorage()) {
    const stored = window.localStorage.getItem(USER_KEY);
    return stored ? (JSON.parse(stored) as StoredUser) : null;
  }

  return memoryStorage.user;
}

export async function deleteUser(): Promise<void> {
  if (await checkSecureStore()) {
    await SecureStore.deleteItemAsync(USER_KEY);
    return;
  }

  if (isWeb && hasLocalStorage()) {
    window.localStorage.removeItem(USER_KEY);
    return;
  }

  memoryStorage.user = null;
}
