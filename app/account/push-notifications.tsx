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

export default function PushNotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PushNotifications | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotificationSettings();

      if (response.success && response.data) {
        setSettings(response.data.push);
      } else {
        console.warn('Failed to load push notification settings:', response.error);
        setSettings(getDefaultSettings());
      }
    } catch (error) {
      console.error('Error loading push notification settings:', error);
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSettings = (): PushNotifications => ({
    enabled: true,
    orderUpdates: true,
    promotions: false,
    recommendations: true,
    priceAlerts: true,
    deliveryUpdates: true,
    paymentUpdates: true,
    securityAlerts: true,
    chatMessages: true,
  });

  const updateSettings = async (updates: Partial<PushNotifications>) => {
    if (!settings) return;

    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    try {
      setSaving(true);
      const response = await notificationService.updatePushSettings(newSettings);

      if (!response.success) {
        console.warn('Failed to save push notification settings:', response.error);
        Alert.alert('Error', 'Failed to update push notification settings. Please try again.');
        setSettings(settings);
      } else {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 2000);
      }
    } catch (error) {
      console.error('Error updating push notifications:', error);
      Alert.alert('Error', 'Failed to update push notification settings. Please check your connection and try again.');
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
        accessibilityLabel={`${title}${value ? ', enabled' : ', disabled'}${disabled ? ', unavailable' : ''}`}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled: disabled || saving }}
        accessibilityHint={disabled ? 'Enable push notifications first' : `Toggle to ${value ? 'disable' : 'enable'} ${title.toLowerCase()}`}
        trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
        thumbColor={value ? '#FFFFFF' : '#F3F4F6'}
      />
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
          accessibilityLabel="Loading push notification settings"
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
          accessibilityLabel="Retry loading push notification settings"
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
          accessibilityHint="Navigate to notification settings"
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} accessibilityRole="header">Push Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Push Notification Settings</Text>
          </View>

          {renderSettingItem(
            'Enable Push Notifications',
            settings.enabled,
            (value) => updateSettings({ enabled: value })
          )}

          {renderSettingItem(
            'Order Updates',
            settings.orderUpdates,
            (value) => updateSettings({ orderUpdates: value }),
            !settings.enabled
          )}

          {renderSettingItem(
            'Delivery Updates',
            settings.deliveryUpdates,
            (value) => updateSettings({ deliveryUpdates: value }),
            !settings.enabled
          )}

          {renderSettingItem(
            'Payment Updates',
            settings.paymentUpdates,
            (value) => updateSettings({ paymentUpdates: value }),
            !settings.enabled
          )}

          {renderSettingItem(
            'Promotions & Offers',
            settings.promotions,
            (value) => updateSettings({ promotions: value }),
            !settings.enabled
          )}

          {renderSettingItem(
            'Price Alerts',
            settings.priceAlerts,
            (value) => updateSettings({ priceAlerts: value }),
            !settings.enabled
          )}

          {renderSettingItem(
            'Recommendations',
            settings.recommendations,
            (value) => updateSettings({ recommendations: value }),
            !settings.enabled
          )}

          {renderSettingItem(
            'Security Alerts',
            settings.securityAlerts,
            (value) => updateSettings({ securityAlerts: value }),
            !settings.enabled
          )}

          {renderSettingItem(
            'Chat Messages',
            settings.chatMessages,
            (value) => updateSettings({ chatMessages: value }),
            !settings.enabled
          )}
        </View>
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
});
