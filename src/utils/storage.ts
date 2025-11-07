import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const isWeb = Platform.OS === 'web';

const webStorage = {
  async getItem(key: string) {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  },
  async deleteItem(key: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  },
};

export const storage = {
  getItem: (key: string) =>
    isWeb ? webStorage.getItem(key) : SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) =>
    isWeb ? webStorage.setItem(key, value) : SecureStore.setItemAsync(key, value),
  deleteItem: (key: string) =>
    isWeb ? webStorage.deleteItem(key) : SecureStore.deleteItemAsync(key),
};

export default storage;

