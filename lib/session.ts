import { STORAGE_KEYS } from '@/constants/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// The login token lives in the phone's encrypted storage; the rest of the
// profile stays in AsyncStorage, which isn't encrypted.
const TOKEN_KEY = 'authToken';

export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);

export const saveSession = async <T extends { token: string }>({ token, ...profile }: T) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await AsyncStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(profile));
};

export const loadSession = async <T extends { token: string }>(): Promise<T | null> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.authUser);
  if (!raw) return null;
  const saved = JSON.parse(raw);
  // Earlier versions kept the token inside the profile: move it over once.
  if (saved.token) {
    await saveSession(saved);
    return saved;
  }
  const token = await getToken();
  return token ? { ...saved, token } : null;
};

export const clearSession = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await AsyncStorage.removeItem(STORAGE_KEYS.authUser);
};
