import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth.token';

let secureStoreAvailable: boolean | null = null;

const memoryStorage: { value: string | null } = {
  value: null,
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

export async function saveToken(token: string): Promise<void> {
  if (await checkSecureStore()) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return;
  }

  if (isWeb && hasLocalStorage()) {
    window.localStorage.setItem(TOKEN_KEY, token);
    return;
  }

  memoryStorage.value = token;
}

export async function getToken(): Promise<string | null> {
  if (await checkSecureStore()) {
    return SecureStore.getItemAsync(TOKEN_KEY);
  }

  if (isWeb && hasLocalStorage()) {
    return window.localStorage.getItem(TOKEN_KEY);
  }

  return memoryStorage.value;
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

  memoryStorage.value = null;
}
