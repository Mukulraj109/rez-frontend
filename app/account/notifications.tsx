import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import notificationService from '../../services/notificationService';

interface PushNotifications {
  enabled: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  recommendations: boolean;
  priceAlerts: boolean;
  deliveryUpdates: boolean;
  paymentUpdates: boolean;
  securityAlerts: boolean;
  chatMessages: boolean;
}

interface EmailNotifications {
  enabled: boolean;
  newsletters: boolean;
  orderReceipts: boolean;
  weeklyDigest: boolean;
  promotions: boolean;
  securityAlerts: boolean;
  accountUpdates: boolean;
}

interface SMSNotifications {
  enabled: boolean;
  orderUpdates: boolean;
  deliveryAlerts: boolean;
  paymentConfirmations: boolean;
  securityAlerts: boolean;
  otpMessages: boolean;
}

interface InAppNotifications {
  enabled: boolean;
  showBadges: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  bannerStyle: 'BANNER' | 'ALERT' | 'SILENT';
}

interface NotificationSettings {
  push: PushNotifications;
  email: EmailNotifications;
  sms: SMSNotifications;
  inApp: InAppNotifications;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const getDefaultSettings = (): NotificationSettings => ({
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
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotificationSettings();

      if (response.success && response.data) {
        setSettings(response.data as NotificationSettings);
      } else {
        console.warn('Failed to load notification settings:', response.error);
        // Set default settings if none exist
        setSettings(getDefaultSettings());
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      // Set default settings on error
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  };

  const updatePushSettings = async (updates: Partial<PushNotifications>) => {
    if (!settings) return;

    const newPushSettings = { ...settings.push, ...updates };
    setSettings({ ...settings, push: newPushSettings });

    try {
      setSaving(true);
      const response = await notificationService.updatePushSettings(newPushSettings);

      if (!response.success) {
        console.warn('Failed to save push notification settings:', response.error);
        Alert.alert('Error', 'Failed to update push notification settings. Please try again.');
        // Revert to previous state
        setSettings(settings);
      } else {
        // Show success message
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 2000);
      }
    } catch (error) {
      console.error('Error updating push notifications:', error);
      Alert.alert('Error', 'Failed to update push notification settings. Please check your connection and try again.');
      // Revert to previous state
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  const updateEmailSettings = async (updates: Partial<EmailNotifications>) => {
    if (!settings) return;

    const newEmailSettings = { ...settings.email, ...updates };
    setSettings({ ...settings, email: newEmailSettings });

    try {
      setSaving(true);
      const response = await notificationService.updateEmailSettings(newEmailSettings);

      if (!response.success) {
        console.warn('Failed to save email notification settings:', response.error);
        Alert.alert('Error', 'Failed to update email notification settings. Please try again.');
        setSettings(settings);
      } else {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 2000);
      }
    } catch (error) {
      console.error('Error updating email notifications:', error);
      Alert.alert('Error', 'Failed to update email notification settings. Please check your connection and try again.');
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  const updateSMSSettings = async (updates: Partial<SMSNotifications>) => {
    if (!settings) return;

    const newSMSSettings = { ...settings.sms, ...updates };
    setSettings({ ...settings, sms: newSMSSettings });

    try {
      setSaving(true);
      const response = await notificationService.updateSMSSettings(newSMSSettings);

      if (!response.success) {
        console.warn('Failed to save SMS notification settings:', response.error);
        Alert.alert('Error', 'Failed to update SMS notification settings. Please try again.');
        setSettings(settings);
      } else {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 2000);
      }
    } catch (error) {
      console.error('Error updating SMS notifications:', error);
      Alert.alert('Error', 'Failed to update SMS notification settings. Please check your connection and try again.');
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  const updateInAppSettings = async (updates: Partial<InAppNotifications>) => {
    if (!settings) return;

    const newInAppSettings = { ...settings.inApp, ...updates };
    setSettings({ ...settings, inApp: newInAppSettings });

    try {
      setSaving(true);
      const response = await notificationService.updateInAppSettings(newInAppSettings);

      if (!response.success) {
        console.warn('Failed to save in-app notification settings:', response.error);
        Alert.alert('Error', 'Failed to update in-app notification settings. Please try again.');
        setSettings(settings);
      } else {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 2000);
      }
    } catch (error) {
      console.error('Error updating in-app notifications:', error);
      Alert.alert('Error', 'Failed to update in-app notification settings. Please check your connection and try again.');
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  const renderSettingItem = (
    title: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    disabled?: boolean
  ) => (
    <View style={styles.settingItem}>
      <Text style={[styles.settingTitle, disabled && styles.disabledText]}>
        {title}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || saving}
        trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
        thumbColor={value ? '#FFFFFF' : '#F3F4F6'}
      />
    </View>
  );

  const renderSection = (title: string, icon: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon as any} size={24} color="#3B82F6" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#3B82F6"
          accessibilityLabel="Loading"
          accessibilityRole="progressbar"
        />
        <Text
          style={styles.loadingText}
          accessibilityLabel="Loading notification settings"
        >
          Loading settings...
        </Text>
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={styles.errorContainer}>
        <Text
          style={styles.errorText}
          accessibilityRole="alert"
        >
          Failed to load settings
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadSettings}
          accessibilityLabel="Retry loading notification settings"
          accessibilityRole="button"
          accessibilityHint="Double tap to try loading settings again"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityHint="Navigate to previous screen"
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} accessibilityRole="header">Notification Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Push Notifications */}
        <TouchableOpacity
          style={styles.notificationSection}
          onPress={() => router.push('/account/push-notifications')}
          accessibilityLabel="Push notifications settings"
          accessibilityRole="button"
          accessibilityHint="Navigate to manage push notification preferences"
        >
          <View style={styles.sectionIcon}>
            <Ionicons name="notifications" size={24} color="#3B82F6" />
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.notificationSectionTitle}>Push Notifications</Text>
            <Text style={styles.sectionDescription}>Manage push notification preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Email Notifications */}
        <TouchableOpacity
          style={styles.notificationSection}
          onPress={() => router.push('/account/email-notifications')}
          accessibilityLabel="Email notifications settings"
          accessibilityRole="button"
          accessibilityHint="Navigate to manage email notification settings"
        >
          <View style={styles.sectionIcon}>
            <Ionicons name="mail" size={24} color="#3B82F6" />
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.notificationSectionTitle}>Email Notifications</Text>
            <Text style={styles.sectionDescription}>Manage email notification settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* SMS Notifications */}
        <TouchableOpacity
          style={styles.notificationSection}
          onPress={() => router.push('/account/sms-notifications')}
          accessibilityLabel="SMS notifications settings"
          accessibilityRole="button"
          accessibilityHint="Navigate to manage SMS notification preferences"
        >
          <View style={styles.sectionIcon}>
            <Ionicons name="chatbox" size={24} color="#3B82F6" />
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.notificationSectionTitle}>SMS Notifications</Text>
            <Text style={styles.sectionDescription}>Manage SMS notification preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Notification History */}
        <TouchableOpacity
          style={styles.notificationSection}
          onPress={() => router.push('/account/notification-history')}
          accessibilityLabel="Notification history"
          accessibilityRole="button"
          accessibilityHint="Navigate to view all past notifications"
        >
          <View style={styles.sectionIcon}>
            <Ionicons name="time" size={24} color="#3B82F6" />
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.notificationSectionTitle}>Notification History</Text>
            <Text style={styles.sectionDescription}>View all past notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>

      {/* Saving Indicator */}
      {saving && (
        <View style={styles.savingIndicator}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.savingText}>Saving...</Text>
        </View>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <View style={styles.successIndicator}>
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.successText}>Settings saved!</Text>
        </View>
      )}
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  disabledText: {
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  savingIndicator: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  savingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  successIndicator: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  notificationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sectionContent: {
    flex: 1,
  },
  notificationSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
});
