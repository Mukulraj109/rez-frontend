// User Settings API Service
// Handles user preferences, notifications, privacy, security settings

import apiClient, { ApiResponse } from './apiClient';

// Notification Preferences
export interface NotificationPreferences {
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

// Privacy Settings
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

// Security Settings
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

// Delivery Preferences
export interface DeliveryPreferences {
  defaultAddressId?: string;
  deliveryInstructions?: string;
  deliveryTime: {
    preferred: 'ASAP' | 'SCHEDULED';
    workingDays: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[];
  };
  contactlessDelivery: boolean;
  deliveryNotifications: boolean;
}

// Payment Preferences
export interface PaymentPreferences {
  defaultPaymentMethodId?: string;
  autoPayEnabled: boolean;
  paymentPinEnabled: boolean;
  biometricPaymentEnabled: boolean;
  transactionLimits: {
    dailyLimit: number;
    weeklyLimit: number;
    monthlyLimit: number;
    singleTransactionLimit: number;
  };
}

// App Preferences
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

// General Settings
export interface GeneralSettings {
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  theme: 'light' | 'dark' | 'auto';
}

// Complete User Settings
export interface UserSettings {
  id: string;
  userId: string;
  general: GeneralSettings;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  security: SecuritySettings;
  delivery: DeliveryPreferences;
  payment: PaymentPreferences;
  preferences: AppPreferences;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

class UserSettingsApiService {
  private baseUrl = '/user-settings';

  // Get user settings
  async getUserSettings(): Promise<ApiResponse<UserSettings>> {
    return apiClient.get(this.baseUrl);
  }

  // Update general settings
  async updateGeneralSettings(data: Partial<GeneralSettings>): Promise<ApiResponse<UserSettings>> {
    return apiClient.put(`${this.baseUrl}/general`, data);
  }

  // Update notification preferences
  async updateNotificationPreferences(data: Partial<NotificationPreferences>): Promise<ApiResponse<UserSettings>> {
    return apiClient.put(`${this.baseUrl}/notifications`, data);
  }

  // Update privacy settings
  async updatePrivacySettings(data: Partial<PrivacySettings>): Promise<ApiResponse<UserSettings>> {
    return apiClient.put(`${this.baseUrl}/privacy`, data);
  }

  // Update security settings
  async updateSecuritySettings(data: Partial<SecuritySettings>): Promise<ApiResponse<UserSettings>> {
    return apiClient.put(`${this.baseUrl}/security`, data);
  }

  // Update delivery preferences
  async updateDeliveryPreferences(data: Partial<DeliveryPreferences>): Promise<ApiResponse<UserSettings>> {
    return apiClient.put(`${this.baseUrl}/delivery`, data);
  }

  // Update payment preferences
  async updatePaymentPreferences(data: Partial<PaymentPreferences>): Promise<ApiResponse<UserSettings>> {
    return apiClient.put(`${this.baseUrl}/payment`, data);
  }

  // Update app preferences
  async updateAppPreferences(data: Partial<AppPreferences>): Promise<ApiResponse<UserSettings>> {
    return apiClient.put(`${this.baseUrl}/preferences`, data);
  }

  // Reset settings to default
  async resetSettings(): Promise<ApiResponse<UserSettings>> {
    return apiClient.post(`${this.baseUrl}/reset`, {});
  }
}

export const userSettingsApi = new UserSettingsApiService();
export default userSettingsApi;