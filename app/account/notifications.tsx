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
import apiClient from '../../services/apiClient';

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

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/user-settings/notifications/all');

      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      Alert.alert('Error', 'Failed to load notification settings');
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
      const response = await apiClient.put('/user-settings/notifications/push', newPushSettings);

      if (!response.success) {
        Alert.alert('Error', 'Failed to update push notification settings');
        await loadSettings(); // Reload on error
      }
    } catch (error) {
      console.error('Error updating push notifications:', error);
      Alert.alert('Error', 'Failed to update push notification settings');
      await loadSettings();
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
      const response = await apiClient.put('/user-settings/notifications/email', newEmailSettings);

      if (!response.success) {
        Alert.alert('Error', 'Failed to update email notification settings');
        await loadSettings();
      }
    } catch (error) {
      console.error('Error updating email notifications:', error);
      Alert.alert('Error', 'Failed to update email notification settings');
      await loadSettings();
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
      const response = await apiClient.put('/user-settings/notifications/sms', newSMSSettings);

      if (!response.success) {
        Alert.alert('Error', 'Failed to update SMS notification settings');
        await loadSettings();
      }
    } catch (error) {
      console.error('Error updating SMS notifications:', error);
      Alert.alert('Error', 'Failed to update SMS notification settings');
      await loadSettings();
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
      const response = await apiClient.put('/user-settings/notifications/inapp', newInAppSettings);

      if (!response.success) {
        Alert.alert('Error', 'Failed to update in-app notification settings');
        await loadSettings();
      }
    } catch (error) {
      console.error('Error updating in-app notifications:', error);
      Alert.alert('Error', 'Failed to update in-app notification settings');
      await loadSettings();
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
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load settings</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSettings}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Push Notifications */}
        {renderSection('Push Notifications', 'notifications', (
          <>
            {renderSettingItem(
              'Enable Push Notifications',
              settings.push.enabled,
              (value) => updatePushSettings({ enabled: value })
            )}
            {renderSettingItem(
              'Order Updates',
              settings.push.orderUpdates,
              (value) => updatePushSettings({ orderUpdates: value }),
              !settings.push.enabled
            )}
            {renderSettingItem(
              'Delivery Updates',
              settings.push.deliveryUpdates,
              (value) => updatePushSettings({ deliveryUpdates: value }),
              !settings.push.enabled
            )}
            {renderSettingItem(
              'Payment Updates',
              settings.push.paymentUpdates,
              (value) => updatePushSettings({ paymentUpdates: value }),
              !settings.push.enabled
            )}
            {renderSettingItem(
              'Promotions & Offers',
              settings.push.promotions,
              (value) => updatePushSettings({ promotions: value }),
              !settings.push.enabled
            )}
            {renderSettingItem(
              'Price Alerts',
              settings.push.priceAlerts,
              (value) => updatePushSettings({ priceAlerts: value }),
              !settings.push.enabled
            )}
            {renderSettingItem(
              'Recommendations',
              settings.push.recommendations,
              (value) => updatePushSettings({ recommendations: value }),
              !settings.push.enabled
            )}
            {renderSettingItem(
              'Security Alerts',
              settings.push.securityAlerts,
              (value) => updatePushSettings({ securityAlerts: value }),
              !settings.push.enabled
            )}
            {renderSettingItem(
              'Chat Messages',
              settings.push.chatMessages,
              (value) => updatePushSettings({ chatMessages: value }),
              !settings.push.enabled
            )}
          </>
        ))}

        {/* Email Notifications */}
        {renderSection('Email Notifications', 'mail', (
          <>
            {renderSettingItem(
              'Enable Email Notifications',
              settings.email.enabled,
              (value) => updateEmailSettings({ enabled: value })
            )}
            {renderSettingItem(
              'Order Receipts',
              settings.email.orderReceipts,
              (value) => updateEmailSettings({ orderReceipts: value }),
              !settings.email.enabled
            )}
            {renderSettingItem(
              'Newsletters',
              settings.email.newsletters,
              (value) => updateEmailSettings({ newsletters: value }),
              !settings.email.enabled
            )}
            {renderSettingItem(
              'Weekly Digest',
              settings.email.weeklyDigest,
              (value) => updateEmailSettings({ weeklyDigest: value }),
              !settings.email.enabled
            )}
            {renderSettingItem(
              'Promotional Emails',
              settings.email.promotions,
              (value) => updateEmailSettings({ promotions: value }),
              !settings.email.enabled
            )}
            {renderSettingItem(
              'Account Updates',
              settings.email.accountUpdates,
              (value) => updateEmailSettings({ accountUpdates: value }),
              !settings.email.enabled
            )}
            {renderSettingItem(
              'Security Alerts',
              settings.email.securityAlerts,
              (value) => updateEmailSettings({ securityAlerts: value }),
              !settings.email.enabled
            )}
          </>
        ))}

        {/* SMS Notifications */}
        {renderSection('SMS Notifications', 'chatbox', (
          <>
            {renderSettingItem(
              'Enable SMS Notifications',
              settings.sms.enabled,
              (value) => updateSMSSettings({ enabled: value })
            )}
            {renderSettingItem(
              'Order Updates',
              settings.sms.orderUpdates,
              (value) => updateSMSSettings({ orderUpdates: value }),
              !settings.sms.enabled
            )}
            {renderSettingItem(
              'Delivery Alerts',
              settings.sms.deliveryAlerts,
              (value) => updateSMSSettings({ deliveryAlerts: value }),
              !settings.sms.enabled
            )}
            {renderSettingItem(
              'Payment Confirmations',
              settings.sms.paymentConfirmations,
              (value) => updateSMSSettings({ paymentConfirmations: value }),
              !settings.sms.enabled
            )}
            {renderSettingItem(
              'Security Alerts',
              settings.sms.securityAlerts,
              (value) => updateSMSSettings({ securityAlerts: value }),
              !settings.sms.enabled
            )}
            {renderSettingItem(
              'OTP Messages',
              settings.sms.otpMessages,
              (value) => updateSMSSettings({ otpMessages: value }),
              !settings.sms.enabled
            )}
          </>
        ))}

        {/* In-App Notifications */}
        {renderSection('In-App Notifications', 'phone-portrait', (
          <>
            {renderSettingItem(
              'Enable In-App Notifications',
              settings.inApp.enabled,
              (value) => updateInAppSettings({ enabled: value })
            )}
            {renderSettingItem(
              'Show Badges',
              settings.inApp.showBadges,
              (value) => updateInAppSettings({ showBadges: value }),
              !settings.inApp.enabled
            )}
            {renderSettingItem(
              'Sound',
              settings.inApp.soundEnabled,
              (value) => updateInAppSettings({ soundEnabled: value }),
              !settings.inApp.enabled
            )}
            {renderSettingItem(
              'Vibration',
              settings.inApp.vibrationEnabled,
              (value) => updateInAppSettings({ vibrationEnabled: value }),
              !settings.inApp.enabled
            )}
          </>
        ))}
      </ScrollView>

      {/* Saving Indicator */}
      {saving && (
        <View style={styles.savingIndicator}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.savingText}>Saving...</Text>
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
});
