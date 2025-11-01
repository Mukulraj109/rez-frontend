// Global Security Context
// Manages security settings and applies them globally across the app

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import with fallback for when expo-local-authentication is not available
let LocalAuthentication: any = null;
try {
  LocalAuthentication = require('expo-local-authentication');
} catch (error) {
  console.warn('expo-local-authentication not available:', error);
}
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import userSettingsApi from '@/services/userSettingsApi';

// Security Settings Interface
export interface SecuritySettings {
  twoFactorAuth: {
    enabled: boolean;
    method: '2FA_SMS' | '2FA_EMAIL' | '2FA_APP';
    backupCodes: string[];
    lastUpdated?: string;
  };
  biometric: {
    fingerprintEnabled: boolean;
    faceIdEnabled: boolean;
    voiceEnabled: boolean;
    availableMethods: ('FINGERPRINT' | 'FACE_ID' | 'VOICE')[];
  };
  sessionManagement: {
    autoLogoutTime: number;
    allowMultipleSessions: boolean;
    rememberMe: boolean;
  };
  loginAlerts: boolean;
}

// Privacy Settings Interface
export interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  showActivity: boolean;
  showPurchaseHistory: boolean;
  allowMessaging: boolean;
  allowFriendRequests: boolean;
  dataSharing: {
    shareWithPartners: boolean;
    shareForMarketing: boolean;
    shareForRecommendations: boolean;
    shareForAnalytics: boolean;
    sharePurchaseData: boolean;
  };
  analytics: {
    allowUsageTracking: boolean;
    allowCrashReporting: boolean;
    allowPerformanceTracking: boolean;
    allowLocationTracking: boolean;
  };
}

// Context Interface
interface SecurityContextType {
  securitySettings: SecuritySettings | null;
  privacySettings: PrivacySettings | null;
  isLoading: boolean;
  error: string | null;
  biometricAvailable: boolean;
  biometricEnrolled: boolean;
  updateSecuritySettings: (updates: Partial<SecuritySettings>) => Promise<boolean>;
  updatePrivacySettings: (updates: Partial<PrivacySettings>) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  enableTwoFactorAuth: (method: '2FA_SMS' | '2FA_EMAIL' | '2FA_APP') => Promise<boolean>;
  disableTwoFactorAuth: () => Promise<boolean>;
  generateBackupCodes: () => string[];
  isProfileVisible: (visibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE') => boolean;
}

// Default Settings
const defaultSecuritySettings: SecuritySettings = {
  twoFactorAuth: {
    enabled: false,
    method: '2FA_SMS',
    backupCodes: [],
  },
  biometric: {
    fingerprintEnabled: false,
    faceIdEnabled: false,
    voiceEnabled: false,
    availableMethods: [],
  },
  sessionManagement: {
    autoLogoutTime: 30,
    allowMultipleSessions: true,
    rememberMe: true,
  },
  loginAlerts: true,
};

const defaultPrivacySettings: PrivacySettings = {
  profileVisibility: 'FRIENDS',
  showActivity: false,
  showPurchaseHistory: false,
  allowMessaging: true,
  allowFriendRequests: true,
  dataSharing: {
    shareWithPartners: false,
    shareForMarketing: false,
    shareForRecommendations: true,
    shareForAnalytics: false,
    sharePurchaseData: false,
  },
  analytics: {
    allowUsageTracking: true,
    allowCrashReporting: true,
    allowPerformanceTracking: true,
    allowLocationTracking: false,
  },
};

// Create Context
const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

// Storage Keys
const STORAGE_KEYS = {
  SECURITY_SETTINGS: 'security_settings',
  PRIVACY_SETTINGS: 'privacy_settings',
  LAST_SYNC: 'security_last_sync',
};

// Provider Component
interface SecurityProviderProps {
  children: ReactNode;
}

export function SecurityProvider({ children }: SecurityProviderProps) {
  const { state } = useAuth();
  const { user, isAuthenticated } = state;
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);

  // Check biometric availability
  const checkBiometricAvailability = async () => {
    try {
      if (!LocalAuthentication) {
        console.warn('LocalAuthentication not available');
        setBiometricAvailable(false);
        setBiometricEnrolled(false);
        return;
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      setBiometricAvailable(hasHardware);
      setBiometricEnrolled(isEnrolled);

      // Update available methods
      const availableMethods: ('FINGERPRINT' | 'FACE_ID' | 'VOICE')[] = [];
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        availableMethods.push('FINGERPRINT');
      }
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        availableMethods.push('FACE_ID');
      }
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.VOICE)) {
        availableMethods.push('VOICE');
      }

      // Update settings with available methods
      if (securitySettings) {
        setSecuritySettings({
          ...securitySettings,
          biometric: {
            ...securitySettings.biometric,
            availableMethods,
          },
        });
      }
    } catch (error) {
      console.error('Failed to check biometric availability:', error);
      setBiometricAvailable(false);
      setBiometricEnrolled(false);
    }
  };

  // Load settings from storage or backend
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isAuthenticated && user) {
        // Load from backend
        const response = await userSettingsApi.getUserSettings();
        if (response.success && response.data) {
          setSecuritySettings(response.data.security || defaultSecuritySettings);
          setPrivacySettings(response.data.privacy || defaultPrivacySettings);
          
          // Save to local storage
          await AsyncStorage.setItem(STORAGE_KEYS.SECURITY_SETTINGS, JSON.stringify(response.data.security || defaultSecuritySettings));
          await AsyncStorage.setItem(STORAGE_KEYS.PRIVACY_SETTINGS, JSON.stringify(response.data.privacy || defaultPrivacySettings));
          await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
        } else {
          // Fallback to local storage
          await loadFromStorage();
        }
      } else {
        // Load from local storage
        await loadFromStorage();
      }

      // Check biometric availability
      await checkBiometricAvailability();
    } catch (err) {
      console.error('Failed to load security settings:', err);
      setError('Failed to load security settings');
      await loadFromStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // Load from local storage
  const loadFromStorage = async () => {
    try {
      const [securityStored, privacyStored] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SECURITY_SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.PRIVACY_SETTINGS),
      ]);

      if (securityStored) {
        setSecuritySettings(JSON.parse(securityStored));
      } else {
        setSecuritySettings(defaultSecuritySettings);
      }

      if (privacyStored) {
        setPrivacySettings(JSON.parse(privacyStored));
      } else {
        setPrivacySettings(defaultPrivacySettings);
      }
    } catch (err) {
      console.error('Failed to load from storage:', err);
      setSecuritySettings(defaultSecuritySettings);
      setPrivacySettings(defaultPrivacySettings);
    }
  };

  // Update security settings
  const updateSecuritySettings = async (updates: Partial<SecuritySettings>): Promise<boolean> => {
    try {
      if (!securitySettings) return false;

      const newSettings = { ...securitySettings, ...updates };
      setSecuritySettings(newSettings);

      // Save to local storage immediately
      await AsyncStorage.setItem(STORAGE_KEYS.SECURITY_SETTINGS, JSON.stringify(newSettings));

      // Sync with backend if authenticated
      if (isAuthenticated && user) {
        try {
          const response = await userSettingsApi.updateSecuritySettings(newSettings);
          if (response.success) {
            await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
            return true;
          } else {
            console.error('Failed to sync security settings with backend:', response.message);
            return false;
          }
        } catch (err) {
          console.error('Failed to sync security settings with backend:', err);
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error('Failed to update security settings:', err);
      setError('Failed to update security settings');
      return false;
    }
  };

  // Update privacy settings
  const updatePrivacySettings = async (updates: Partial<PrivacySettings>): Promise<boolean> => {
    try {
      if (!privacySettings) return false;

      const newSettings = { ...privacySettings, ...updates };
      setPrivacySettings(newSettings);

      // Save to local storage immediately
      await AsyncStorage.setItem(STORAGE_KEYS.PRIVACY_SETTINGS, JSON.stringify(newSettings));

      // Sync with backend if authenticated
      if (isAuthenticated && user) {
        try {
          const response = await userSettingsApi.updatePrivacySettings(newSettings);
          if (response.success) {
            await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
            return true;
          } else {
            console.error('Failed to sync privacy settings with backend:', response.message);
            return false;
          }
        } catch (err) {
          console.error('Failed to sync privacy settings with backend:', err);
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error('Failed to update privacy settings:', err);
      setError('Failed to update privacy settings');
      return false;
    }
  };

  // Refresh settings from backend
  const refreshSettings = async () => {
    await loadSettings();
  };

  // Authenticate with biometric
  const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
      if (!LocalAuthentication) {
        Alert.alert('Biometric Authentication', 'Biometric authentication is not available on this device.');
        return false;
      }

      if (!biometricAvailable || !biometricEnrolled) {
        Alert.alert('Biometric Authentication', 'Biometric authentication is not available or not enrolled.');
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      Alert.alert('Authentication Failed', 'Biometric authentication failed. Please try again.');
      return false;
    }
  };

  // Enable two-factor authentication
  const enableTwoFactorAuth = async (method: '2FA_SMS' | '2FA_EMAIL' | '2FA_APP'): Promise<boolean> => {
    try {
      const response = await userSettingsApi.enableTwoFactorAuth(method);
      
      if (response.success) {
        // Update local state
        await updateSecuritySettings({
          twoFactorAuth: {
            enabled: true,
            method,
            backupCodes: response.data.backupCodes,
            lastUpdated: new Date().toISOString(),
          },
        });

        Alert.alert(
          'Two-Factor Authentication Enabled',
          `Two-factor authentication has been enabled using ${method}. Please save your backup codes: ${response.data.backupCodes.join(', ')}`,
          [{ text: 'OK' }]
        );
        return true;
      } else {
        Alert.alert('Error', 'Failed to enable two-factor authentication.');
        return false;
      }
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      Alert.alert('Error', 'Failed to enable two-factor authentication.');
      return false;
    }
  };

  // Disable two-factor authentication
  const disableTwoFactorAuth = async (): Promise<boolean> => {
    try {
      const response = await userSettingsApi.disableTwoFactorAuth();
      
      if (response.success) {
        // Update local state
        await updateSecuritySettings({
          twoFactorAuth: {
            enabled: false,
            method: '2FA_SMS',
            backupCodes: [],
          },
        });

        Alert.alert('Two-Factor Authentication Disabled', 'Two-factor authentication has been disabled.');
        return true;
      } else {
        Alert.alert('Error', 'Failed to disable two-factor authentication.');
        return false;
      }
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      Alert.alert('Error', 'Failed to disable two-factor authentication.');
      return false;
    }
  };

  // Generate backup codes
  const generateBackupCodes = (): string[] => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
    return codes;
  };

  // Check if profile is visible based on privacy settings
  const isProfileVisible = (visibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE'): boolean => {
    if (!privacySettings) return false;
    return privacySettings.profileVisibility === visibility;
  };

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

  const value: SecurityContextType = {
    securitySettings,
    privacySettings,
    isLoading,
    error,
    biometricAvailable,
    biometricEnrolled,
    updateSecuritySettings,
    updatePrivacySettings,
    refreshSettings,
    authenticateWithBiometric,
    enableTwoFactorAuth,
    disableTwoFactorAuth,
    generateBackupCodes,
    isProfileVisible,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

// Hook to use security context
export function useSecurity(): SecurityContextType {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
