// Global App Preferences Context
// Manages app preferences and applies them globally across the app

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from './AuthContext';
import userSettingsApi from '@/services/userSettingsApi';

// App Preferences Interface
export interface AppPreferences {
  startupScreen: 'HOME' | 'EXPLORE' | 'LAST_VIEWED';
  defaultView: 'CARD' | 'LIST' | 'GRID';
  autoRefresh: boolean;
  offlineMode: boolean;
  dataSaver: boolean;
  highQualityImages: boolean;
  animations: boolean;
  sounds: boolean;
  hapticFeedback: boolean;
}

// Context Interface
interface AppPreferencesContextType {
  preferences: AppPreferences | null;
  isLoading: boolean;
  error: string | null;
  updatePreferences: (updates: Partial<AppPreferences>) => Promise<boolean>;
  refreshPreferences: () => Promise<void>;
  triggerHapticFeedback: (type?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
  playSound: (type?: 'success' | 'error' | 'notification' | 'click') => void;
  shouldAnimate: () => boolean;
  shouldPlaySounds: () => boolean;
  shouldUseHaptics: () => boolean;
}

// Default Preferences
const defaultPreferences: AppPreferences = {
  startupScreen: 'HOME',
  defaultView: 'CARD',
  autoRefresh: true,
  offlineMode: false,
  dataSaver: false,
  highQualityImages: true,
  animations: true,
  sounds: true,
  hapticFeedback: true,
};

// Create Context
const AppPreferencesContext = createContext<AppPreferencesContextType | undefined>(undefined);

// Storage Keys
const STORAGE_KEYS = {
  APP_PREFERENCES: 'app_preferences',
  LAST_SYNC: 'app_preferences_last_sync',
};

// Provider Component
interface AppPreferencesProviderProps {
  children: ReactNode;
}

export function AppPreferencesProvider({ children }: AppPreferencesProviderProps) {
  const { state: authState } = useAuth();
  const user = authState.user;
  const isAuthenticated = authState.isAuthenticated;
  const [preferences, setPreferences] = useState<AppPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load preferences from storage or backend
  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isAuthenticated && user) {
        // Load from backend
        const response = await userSettingsApi.getUserSettings();
        if (response.success && response.data) {
          setPreferences(response.data.preferences || defaultPreferences);
          
          // Save to local storage
          await AsyncStorage.setItem(STORAGE_KEYS.APP_PREFERENCES, JSON.stringify(response.data.preferences || defaultPreferences));
          await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
        } else {
          // Fallback to local storage
          await loadFromStorage();
        }
      } else {
        // Load from local storage
        await loadFromStorage();
      }
    } catch (err) {
      console.error('Failed to load app preferences:', err);
      setError('Failed to load app preferences');
      await loadFromStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // Load from local storage
  const loadFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.APP_PREFERENCES);
      if (stored) {
        setPreferences(JSON.parse(stored));
      } else {
        setPreferences(defaultPreferences);
      }
    } catch (err) {
      console.error('Failed to load from storage:', err);
      setPreferences(defaultPreferences);
    }
  };

  // Update preferences
  const updatePreferences = async (updates: Partial<AppPreferences>): Promise<boolean> => {
    try {
      if (!preferences) return false;

      const newPreferences = { ...preferences, ...updates };
      setPreferences(newPreferences);

      // Save to local storage immediately
      await AsyncStorage.setItem(STORAGE_KEYS.APP_PREFERENCES, JSON.stringify(newPreferences));

      // Sync with backend if authenticated
      if (isAuthenticated && user) {
        try {
          const response = await userSettingsApi.updateAppPreferences(newPreferences);
          if (response.success) {
            await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
            return true;
          } else {
            console.error('Failed to sync app preferences with backend:', response.message);
            return false;
          }
        } catch (err) {
          console.error('Failed to sync app preferences with backend:', err);
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error('Failed to update app preferences:', err);
      setError('Failed to update app preferences');
      return false;
    }
  };

  // Refresh preferences from backend
  const refreshPreferences = async () => {
    await loadPreferences();
  };

  // Trigger haptic feedback based on preferences
  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    if (!preferences?.hapticFeedback) return;

    try {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      console.error('Failed to trigger haptic feedback:', error);
    }
  };

  // Play sound based on preferences
  const playSound = (type: 'success' | 'error' | 'notification' | 'click' = 'click') => {
    if (!preferences?.sounds) return;

    try {
      // In a real app, you would use expo-av or react-native-sound
      // For now, we'll just log the sound type
      // You can implement actual sound playing here:
      // import { Audio } from 'expo-av';
      // const { sound } = await Audio.Sound.createAsync(require(`../assets/sounds/${type}.mp3`));
      // await sound.playAsync();
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  };

  // Check if animations should be enabled
  const shouldAnimate = (): boolean => {
    return preferences?.animations || false;
  };

  // Check if sounds should be played
  const shouldPlaySounds = (): boolean => {
    return preferences?.sounds || false;
  };

  // Check if haptic feedback should be used
  const shouldUseHaptics = (): boolean => {
    return preferences?.hapticFeedback || false;
  };

  // Load preferences on mount and when auth state changes
  useEffect(() => {
    loadPreferences();
  }, [isAuthenticated, user]);

  // Auto-sync with backend every 5 minutes
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const interval = setInterval(async () => {
      try {
        const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
        if (lastSync) {
          const lastSyncTime = new Date(lastSync).getTime();
          const now = new Date().getTime();
          const fiveMinutes = 5 * 60 * 1000;

          if (now - lastSyncTime > fiveMinutes) {
            await refreshPreferences();
          }
        }
      } catch (err) {
        console.error('Auto-sync failed:', err);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const value: AppPreferencesContextType = {
    preferences,
    isLoading,
    error,
    updatePreferences,
    refreshPreferences,
    triggerHapticFeedback,
    playSound,
    shouldAnimate,
    shouldPlaySounds,
    shouldUseHaptics,
  };

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
}

// Hook to use app preferences context
export function useAppPreferences(): AppPreferencesContextType {
  const context = useContext(AppPreferencesContext);
  if (context === undefined) {
    throw new Error('useAppPreferences must be used within an AppPreferencesProvider');
  }
  return context;
}
