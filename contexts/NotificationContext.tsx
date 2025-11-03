// Global Notification Context
// Manages notification settings and applies them globally across the app

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useAuth } from './AuthContext';
import userSettingsApi from '@/services/userSettingsApi';

// Notification Settings Interface
export interface NotificationSettings {
  push: {
    enabled: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    recommendations: boolean;
    priceAlerts: boolean;
    deliveryUpdates: boolean;
    paymentUpdates: boolean;
    securityAlerts: boolean;
    chatMessages: boolean;
  };
  email: {
    enabled: boolean;
    newsletters: boolean;
    orderReceipts: boolean;
    weeklyDigest: boolean;
    promotions: boolean;
    securityAlerts: boolean;
    accountUpdates: boolean;
  };
  sms: {
    enabled: boolean;
    orderUpdates: boolean;
    deliveryAlerts: boolean;
    paymentConfirmations: boolean;
    securityAlerts: boolean;
    otpMessages: boolean;
  };
  inApp: {
    enabled: boolean;
    showBadges: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    bannerStyle: 'BANNER' | 'ALERT' | 'SILENT';
  };
}

// Context Interface
interface NotificationContextType {
  settings: NotificationSettings | null;
  isLoading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<NotificationSettings>) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
  canSendPushNotification: (type: keyof NotificationSettings['push']) => boolean;
  canSendEmailNotification: (type: keyof NotificationSettings['email']) => boolean;
  canSendSMSNotification: (type: keyof NotificationSettings['sms']) => boolean;
  canShowInAppNotification: () => boolean;
}

// Default Settings
const defaultSettings: NotificationSettings = {
  push: {
    enabled: true,
    orderUpdates: true,
    promotions: false,
    recommendations: true,
    priceAlerts: true,
    deliveryUpdates: true,
    paymentUpdates: true,
    securityAlerts: true,
    chatMessages: true,
  },
  email: {
    enabled: true,
    newsletters: false,
    orderReceipts: true,
    weeklyDigest: true,
    promotions: false,
    securityAlerts: true,
    accountUpdates: true,
  },
  sms: {
    enabled: true,
    orderUpdates: true,
    deliveryAlerts: true,
    paymentConfirmations: true,
    securityAlerts: true,
    otpMessages: true,
  },
  inApp: {
    enabled: true,
    showBadges: true,
    soundEnabled: true,
    vibrationEnabled: true,
    bannerStyle: 'BANNER',
  },
};

// Create Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Storage Keys
const STORAGE_KEYS = {
  NOTIFICATION_SETTINGS: 'notification_settings',
  LAST_SYNC: 'notification_last_sync',
};

// Provider Component
interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user, isAuthenticated } = useAuth() as any;
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from storage or backend
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isAuthenticated && user) {
        // Load from backend
        const response = await userSettingsApi.getUserSettings();
        if (response.success && response.data?.notifications) {
          setSettings(response.data.notifications);
          await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(response.data.notifications));
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
      console.error('Failed to load notification settings:', err);
      setError('Failed to load notification settings');
      await loadFromStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // Load from local storage
  const loadFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
      if (stored) {
        setSettings(JSON.parse(stored));
      } else {
        setSettings(defaultSettings);
      }
    } catch (err) {
      console.error('Failed to load from storage:', err);
      setSettings(defaultSettings);
    }
  };

  // Update settings
  const updateSettings = async (updates: Partial<NotificationSettings>): Promise<boolean> => {
    try {
      if (!settings) return false;

      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);

      // Save to local storage immediately
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(newSettings));

      // Sync with backend if authenticated
      if (isAuthenticated && user) {
        try {
          const response = await userSettingsApi.updateNotificationPreferences(newSettings);
          if (response.success) {
            await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
            return true;
          } else {
            console.error('Failed to sync with backend:', response.message);
            return false;
          }
        } catch (err) {
          console.error('Failed to sync with backend:', err);
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError('Failed to update settings');
      return false;
    }
  };

  // Refresh settings from backend
  const refreshSettings = async () => {
    await loadSettings();
  };

  // Check if push notification can be sent
  const canSendPushNotification = (type: keyof NotificationSettings['push']): boolean => {
    if (!settings) return false;
    return settings.push.enabled && settings.push[type];
  };

  // Check if email notification can be sent
  const canSendEmailNotification = (type: keyof NotificationSettings['email']): boolean => {
    if (!settings) return false;
    return settings.email.enabled && settings.email[type];
  };

  // Check if SMS notification can be sent
  const canSendSMSNotification = (type: keyof NotificationSettings['sms']): boolean => {
    if (!settings) return false;
    return settings.sms.enabled && settings.sms[type];
  };

  // Check if in-app notification can be shown
  const canShowInAppNotification = (): boolean => {
    if (!settings) return false;
    return settings.inApp.enabled;
  };

  // Configure notification handler based on settings
  useEffect(() => {
    if (settings) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: settings.inApp.enabled && settings.inApp.bannerStyle !== 'SILENT',
          shouldPlaySound: settings.inApp.soundEnabled,
          shouldSetBadge: settings.inApp.showBadges,
          shouldShowBanner: settings.inApp.enabled && settings.inApp.bannerStyle === 'BANNER',
          shouldShowList: settings.inApp.enabled,
        }),
      });
    }
  }, [settings]);

  // Load settings on mount and when auth state changes
  useEffect(() => {
    loadSettings();
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
            await refreshSettings();
          }
        }
      } catch (err) {
        console.error('Auto-sync failed:', err);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const value: NotificationContextType = {
    settings,
    isLoading,
    error,
    updateSettings,
    refreshSettings,
    canSendPushNotification,
    canSendEmailNotification,
    canSendSMSNotification,
    canShowInAppNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook to use notification context
export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
