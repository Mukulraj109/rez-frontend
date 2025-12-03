/**
 * Auth Storage Utilities
 * Handles auth token storage for both web and native platforms
 * Uses localStorage for web (survives Stripe redirects) and AsyncStorage for native
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'auth_user',
};

/**
 * Save auth token
 * On web: Saves to both localStorage and AsyncStorage
 * On native: Saves to AsyncStorage only
 */
export async function saveAuthToken(token: string): Promise<void> {
  try {
    // Always save to AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);

    // On web, also save to localStorage for persistence across redirects
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    }
  } catch (error) {
    console.error('❌ [AUTH STORAGE] Error saving token:', error);
    throw error;
  }
}

/**
 * Save refresh token
 */
export async function saveRefreshToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    }
  } catch (error) {
    console.error('❌ [AUTH STORAGE] Error saving refresh token:', error);
    throw error;
  }
}

/**
 * Save user data
 */
export async function saveUser(user: any): Promise<void> {
  try {
    const userString = JSON.stringify(user);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, userString);

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEYS.USER, userString);
    }
  } catch (error) {
    console.error('❌ [AUTH STORAGE] Error saving user:', error);
    throw error;
  }
}

/**
 * Get auth token
 * On web: Tries localStorage first (survives redirects), then AsyncStorage
 * On native: Uses AsyncStorage only
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    // On web, try localStorage first
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      const localStorageToken = window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (localStorageToken) {
        // Sync to AsyncStorage
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, localStorageToken);
        return localStorageToken;
      }
    }

    // Fallback to AsyncStorage
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('❌ [AUTH STORAGE] Error getting token:', error);
    return null;
  }
}

/**
 * Get refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      const localStorageToken = window.localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (localStorageToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, localStorageToken);
        return localStorageToken;
      }
    }

    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('❌ [AUTH STORAGE] Error getting refresh token:', error);
    return null;
  }
}

/**
 * Get user data
 */
export async function getUser(): Promise<any | null> {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      const localStorageUser = window.localStorage.getItem(STORAGE_KEYS.USER);
      if (localStorageUser) {
        const user = JSON.parse(localStorageUser);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, localStorageUser);
        return user;
      }
    }

    const userString = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error('❌ [AUTH STORAGE] Error getting user:', error);
    return null;
  }
}

/**
 * Clear all auth data
 */
export async function clearAuthData(): Promise<void> {
  try {
    // Clear AsyncStorage
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);

    // Clear localStorage on web
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      window.localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      window.localStorage.removeItem(STORAGE_KEYS.USER);
    }

  } catch (error) {
    console.error('❌ [AUTH STORAGE] Error clearing auth data:', error);
    throw error;
  }
}

/**
 * Save all auth data at once
 */
export async function saveAuthData(accessToken: string, refreshToken: string, user: any): Promise<void> {
  try {
    await Promise.all([
      saveAuthToken(accessToken),
      saveRefreshToken(refreshToken),
      saveUser(user),
    ]);
  } catch (error) {
    console.error('❌ [AUTH STORAGE] Error saving auth data:', error);
    throw error;
  }
}
