// User Settings Screen
// Comprehensive settings management across 8 categories

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useUserSettings } from '@/hooks/useUserSettings';

type SettingsSection = 'general' | 'notifications' | 'privacy' | 'security' | 'delivery' | 'payment' | 'preferences';

export default function SettingsPage() {
  const router = useRouter();
  const {
    settings,
    isLoading,
    refetch,
    updateGeneralSettings,
    updateNotifications,
    updatePrivacy,
    updateSecurity,
    updateDelivery,
    updatePayment,
    updateAppPreferences,
    resetSettings,
  } = useUserSettings(true);

  const [expandedSection, setExpandedSection] = useState<SettingsSection | null>(null);

  const toggleSection = (section: SettingsSection) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const success = await resetSettings();
            if (success) {
              Alert.alert('Success', 'Settings reset to defaults');
            }
          },
        },
      ]
    );
  };

  if (!settings) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityLabel="Go back"
              accessibilityRole="button"
              accessibilityHint="Navigate to previous screen"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle} accessibilityRole="header">Settings</ThemedText>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ThemedText
            style={styles.loadingText}
            accessibilityRole="progressbar"
            accessibilityLabel="Loading settings"
          >
            Loading settings...
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Navigate to previous screen"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle} accessibilityRole="header">Settings</ThemedText>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetSettings}
            accessibilityLabel="Reset all settings"
            accessibilityRole="button"
            accessibilityHint="Double tap to reset all settings to default values"
          >
            <Ionicons name="refresh" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {/* General Settings */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('general')}
            activeOpacity={0.7}
            accessibilityLabel={`General settings${expandedSection === 'general' ? ', expanded' : ', collapsed'}`}
            accessibilityRole="button"
            accessibilityState={{ expanded: expandedSection === 'general' }}
            accessibilityHint={`Double tap to ${expandedSection === 'general' ? 'collapse' : 'expand'} general settings section`}
          >
            <View style={styles.sectionTitleRow}>
              <Ionicons name="settings-outline" size={24} color="#8B5CF6" />
              <ThemedText style={styles.sectionTitle}>General</ThemedText>
            </View>
            <Ionicons
              name={expandedSection === 'general' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {expandedSection === 'general' && (
            <View style={styles.sectionContent}>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => router.push('/account/language')}
                activeOpacity={0.7}
                accessibilityLabel={`Language and Region. Current setting: ${settings.general.language.toUpperCase()}, ${settings.general.currency}`}
                accessibilityRole="button"
                accessibilityHint="Double tap to change language and region settings"
              >
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>Language & Region</ThemedText>
                  <ThemedText style={styles.settingValue}>
                    {settings.general.language.toUpperCase()} • {settings.general.currency}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>Currency</ThemedText>
                  <ThemedText style={styles.settingValue}>{settings.general.currency}</ThemedText>
                </View>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>Time Format</ThemedText>
                </View>
                <View style={styles.toggleGroup}>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      settings.general.timeFormat === '12h' && styles.toggleButtonActive,
                    ]}
                    onPress={() => { updateGeneralSettings({ timeFormat: '12h' }); }}
                    accessibilityLabel={`12 hour format${settings.general.timeFormat === '12h' ? ', selected' : ''}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: settings.general.timeFormat === '12h' }}
                    accessibilityHint="Double tap to use 12 hour time format"
                  >
                    <ThemedText
                      style={[
                        styles.toggleButtonText,
                        settings.general.timeFormat === '12h' && styles.toggleButtonTextActive,
                      ]}
                    >
                      12h
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      settings.general.timeFormat === '24h' && styles.toggleButtonActive,
                    ]}
                    onPress={() => { updateGeneralSettings({ timeFormat: '24h' }); }}
                    accessibilityLabel={`24 hour format${settings.general.timeFormat === '24h' ? ', selected' : ''}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: settings.general.timeFormat === '24h' }}
                    accessibilityHint="Double tap to use 24 hour time format"
                  >
                    <ThemedText
                      style={[
                        styles.toggleButtonText,
                        settings.general.timeFormat === '24h' && styles.toggleButtonTextActive,
                      ]}
                    >
                      24h
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('notifications')}
            activeOpacity={0.7}
            accessibilityLabel={`Notifications section${expandedSection === 'notifications' ? ', expanded' : ', collapsed'}`}
            accessibilityRole="button"
            accessibilityState={{ expanded: expandedSection === 'notifications' }}
            accessibilityHint={`Double tap to ${expandedSection === 'notifications' ? 'collapse' : 'expand'} notifications section`}
          >
            <View style={styles.sectionTitleRow}>
              <Ionicons name="notifications-outline" size={24} color="#8B5CF6" />
              <ThemedText style={styles.sectionTitle}>Notifications</ThemedText>
            </View>
            <Ionicons
              name={expandedSection === 'notifications' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {expandedSection === 'notifications' && (
            <View style={styles.sectionContent}>
              <View style={styles.subsectionTitle}>
                <ThemedText style={styles.subsectionText}>Push Notifications</ThemedText>
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Enable Push</ThemedText>
                <Switch
                  value={settings.notifications.push.enabled}
                  onValueChange={(value) => {
                    updateNotifications({ push: { ...settings.notifications.push, enabled: value } });
                  }}
                  accessibilityLabel={`Push notifications${settings.notifications.push.enabled ? ', enabled' : ', disabled'}`}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: settings.notifications.push.enabled }}
                  accessibilityHint={`Toggle to ${settings.notifications.push.enabled ? 'disable' : 'enable'} push notifications`}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              {settings.notifications.push.enabled && (
                <>
                  <View style={styles.settingRow}>
                    <ThemedText style={styles.settingLabel}>Order Updates</ThemedText>
                    <Switch
                      value={settings.notifications.push.orderUpdates}
                      onValueChange={(value) => {
                        updateNotifications({
                          push: { ...settings.notifications.push, orderUpdates: value },
                        });
                      }}
                      accessibilityLabel={`Order updates notifications${settings.notifications.push.orderUpdates ? ', enabled' : ', disabled'}`}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: settings.notifications.push.orderUpdates }}
                      accessibilityHint={`Toggle to ${settings.notifications.push.orderUpdates ? 'disable' : 'enable'} order updates notifications`}
                      trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                    />
                  </View>

                  <View style={styles.settingRow}>
                    <ThemedText style={styles.settingLabel}>Promotions</ThemedText>
                    <Switch
                      value={settings.notifications.push.promotions}
                      onValueChange={(value) => {
                        updateNotifications({
                          push: { ...settings.notifications.push, promotions: value },
                        });
                      }}
                      accessibilityLabel={`Promotions notifications${settings.notifications.push.promotions ? ', enabled' : ', disabled'}`}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: settings.notifications.push.promotions }}
                      accessibilityHint={`Toggle to ${settings.notifications.push.promotions ? 'disable' : 'enable'} promotions notifications`}
                      trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                    />
                  </View>

                  <View style={styles.settingRow}>
                    <ThemedText style={styles.settingLabel}>Recommendations</ThemedText>
                    <Switch
                      value={settings.notifications.push.recommendations}
                      onValueChange={(value) => {
                        updateNotifications({
                          push: { ...settings.notifications.push, recommendations: value },
                        });
                      }}
                      accessibilityLabel={`Recommendations notifications${settings.notifications.push.recommendations ? ', enabled' : ', disabled'}`}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: settings.notifications.push.recommendations }}
                      accessibilityHint={`Toggle to ${settings.notifications.push.recommendations ? 'disable' : 'enable'} recommendations notifications`}
                      trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                    />
                  </View>
                </>
              )}

              <View style={styles.subsectionTitle}>
                <ThemedText style={styles.subsectionText}>Email Notifications</ThemedText>
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Enable Email</ThemedText>
                <Switch
                  value={settings.notifications.email.enabled}
                  onValueChange={(value) => {
                    updateNotifications({ email: { ...settings.notifications.email, enabled: value } });
                  }}
                  accessibilityLabel={`Email notifications${settings.notifications.email.enabled ? ', enabled' : ', disabled'}`}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: settings.notifications.email.enabled }}
                  accessibilityHint={`Toggle to ${settings.notifications.email.enabled ? 'disable' : 'enable'} email notifications`}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              {settings.notifications.email.enabled && (
                <>
                  <View style={styles.settingRow}>
                    <ThemedText style={styles.settingLabel}>Order Receipts</ThemedText>
                    <Switch
                      value={settings.notifications.email.orderReceipts}
                      onValueChange={(value) => {
                        updateNotifications({
                          email: { ...settings.notifications.email, orderReceipts: value },
                        });
                      }}
                      accessibilityLabel={`Order receipts emails${settings.notifications.email.orderReceipts ? ', enabled' : ', disabled'}`}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: settings.notifications.email.orderReceipts }}
                      accessibilityHint={`Toggle to ${settings.notifications.email.orderReceipts ? 'disable' : 'enable'} order receipts emails`}
                      trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                    />
                  </View>

                  <View style={styles.settingRow}>
                    <ThemedText style={styles.settingLabel}>Weekly Digest</ThemedText>
                    <Switch
                      value={settings.notifications.email.weeklyDigest}
                      onValueChange={(value) => {
                        updateNotifications({
                          email: { ...settings.notifications.email, weeklyDigest: value },
                        });
                      }}
                      accessibilityLabel={`Weekly digest emails${settings.notifications.email.weeklyDigest ? ', enabled' : ', disabled'}`}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: settings.notifications.email.weeklyDigest }}
                      accessibilityHint={`Toggle to ${settings.notifications.email.weeklyDigest ? 'disable' : 'enable'} weekly digest emails`}
                      trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                    />
                  </View>
                </>
              )}
            </View>
          )}
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('privacy')}
            activeOpacity={0.7}
            accessibilityLabel={`Privacy settings${expandedSection === 'privacy' ? ', expanded' : ', collapsed'}`}
            accessibilityRole="button"
            accessibilityState={{ expanded: expandedSection === 'privacy' }}
            accessibilityHint={`Double tap to ${expandedSection === 'privacy' ? 'collapse' : 'expand'} privacy settings section`}
          >
            <View style={styles.sectionTitleRow}>
              <Ionicons name="lock-closed-outline" size={24} color="#8B5CF6" />
              <ThemedText style={styles.sectionTitle}>Privacy</ThemedText>
            </View>
            <Ionicons
              name={expandedSection === 'privacy' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {expandedSection === 'privacy' && (
            <View style={styles.sectionContent}>
              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Profile Visibility</ThemedText>
                <ThemedText style={styles.settingValue}>{settings.privacy.profileVisibility}</ThemedText>
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Show Activity</ThemedText>
                <Switch
                  value={settings.privacy.showActivity}
                  onValueChange={(value) => { updatePrivacy({ showActivity: value }); }}
                  accessibilityLabel={`Show activity${settings.privacy.showActivity ? ', enabled' : ', disabled'}`}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: settings.privacy.showActivity }}
                  accessibilityHint={`Toggle to ${settings.privacy.showActivity ? 'hide' : 'show'} your activity status`}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Allow Messaging</ThemedText>
                <Switch
                  value={settings.privacy.allowMessaging}
                  onValueChange={(value) => { updatePrivacy({ allowMessaging: value }); }}
                  accessibilityLabel={`Allow messaging${settings.privacy.allowMessaging ? ', enabled' : ', disabled'}`}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: settings.privacy.allowMessaging }}
                  accessibilityHint={`Toggle to ${settings.privacy.allowMessaging ? 'disable' : 'enable'} messaging from other users`}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              <View style={styles.subsectionTitle}>
                <ThemedText style={styles.subsectionText}>Data Sharing</ThemedText>
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Analytics Tracking</ThemedText>
                <Switch
                  value={settings.privacy.analytics.allowUsageTracking}
                  onValueChange={(value) => {
                    updatePrivacy({
                      analytics: { ...settings.privacy.analytics, allowUsageTracking: value },
                    });
                  }}
                  accessibilityLabel={`Analytics tracking${settings.privacy.analytics.allowUsageTracking ? ', enabled' : ', disabled'}`}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: settings.privacy.analytics.allowUsageTracking }}
                  accessibilityHint={`Toggle to ${settings.privacy.analytics.allowUsageTracking ? 'disable' : 'enable'} usage analytics tracking`}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Crash Reporting</ThemedText>
                <Switch
                  value={settings.privacy.analytics.allowCrashReporting}
                  onValueChange={(value) => {
                    updatePrivacy({
                      analytics: { ...settings.privacy.analytics, allowCrashReporting: value },
                    });
                  }}
                  accessibilityLabel={`Crash reporting${settings.privacy.analytics.allowCrashReporting ? ', enabled' : ', disabled'}`}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: settings.privacy.analytics.allowCrashReporting }}
                  accessibilityHint={`Toggle to ${settings.privacy.analytics.allowCrashReporting ? 'disable' : 'enable'} crash reporting`}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>
            </View>
          )}
        </View>

        {/* Security */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('security')}
            activeOpacity={0.7}
            accessibilityLabel={`Security settings${expandedSection === 'security' ? ', expanded' : ', collapsed'}`}
            accessibilityRole="button"
            accessibilityState={{ expanded: expandedSection === 'security' }}
            accessibilityHint={`Double tap to ${expandedSection === 'security' ? 'collapse' : 'expand'} security settings section`}
          >
            <View style={styles.sectionTitleRow}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#8B5CF6" />
              <ThemedText style={styles.sectionTitle}>Security</ThemedText>
            </View>
            <Ionicons
              name={expandedSection === 'security' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {expandedSection === 'security' && (
            <View style={styles.sectionContent}>
              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Two-Factor Authentication</ThemedText>
                <Switch
                  value={settings.security.twoFactorAuth.enabled}
                  onValueChange={(value) => {
                    updateSecurity({
                      twoFactorAuth: { ...settings.security.twoFactorAuth, enabled: value },
                    });
                  }}
                  accessibilityLabel={`Two-factor authentication${settings.security.twoFactorAuth.enabled ? ', enabled' : ', disabled'}`}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: settings.security.twoFactorAuth.enabled }}
                  accessibilityHint={`Toggle to ${settings.security.twoFactorAuth.enabled ? 'disable' : 'enable'} two-factor authentication`}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Login Alerts</ThemedText>
                <Switch
                  value={settings.security.loginAlerts}
                  onValueChange={(value) => { updateSecurity({ loginAlerts: value }); }}
                  accessibilityLabel={`Login alerts${settings.security.loginAlerts ? ', enabled' : ', disabled'}`}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: settings.security.loginAlerts }}
                  accessibilityHint={`Toggle to ${settings.security.loginAlerts ? 'disable' : 'enable'} login alerts`}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Allow Multiple Sessions</ThemedText>
                <Switch
                  value={settings.security.sessionManagement.allowMultipleSessions}
                  onValueChange={(value) => {
                    updateSecurity({
                      sessionManagement: {
                        ...settings.security.sessionManagement,
                        allowMultipleSessions: value,
                      },
                    });
                  }}
                  accessibilityLabel={`Allow multiple sessions${settings.security.sessionManagement.allowMultipleSessions ? ', enabled' : ', disabled'}`}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: settings.security.sessionManagement.allowMultipleSessions }}
                  accessibilityHint={`Toggle to ${settings.security.sessionManagement.allowMultipleSessions ? 'disable' : 'enable'} multiple login sessions`}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>
            </View>
          )}
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('preferences')}
            activeOpacity={0.7}
            accessibilityLabel={`App preferences${expandedSection === 'preferences' ? ', expanded' : ', collapsed'}`}
            accessibilityRole="button"
            accessibilityState={{ expanded: expandedSection === 'preferences' }}
            accessibilityHint={`Double tap to ${expandedSection === 'preferences' ? 'collapse' : 'expand'} app preferences section`}
          >
            <View style={styles.sectionTitleRow}>
              <Ionicons name="apps-outline" size={24} color="#8B5CF6" />
              <ThemedText style={styles.sectionTitle}>App Preferences</ThemedText>
            </View>
            <Ionicons
              name={expandedSection === 'preferences' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {expandedSection === 'preferences' && (
            <View style={styles.sectionContent}>
              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Animations</ThemedText>
                <Switch
                  value={settings.preferences.animations}
                  onValueChange={(value) => { updateAppPreferences({ animations: value }); }}
                  accessibilityLabel={`Animations${settings.preferences.animations ? ', enabled' : ', disabled'}`}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: settings.preferences.animations }}
                  accessibilityHint={`Toggle to ${settings.preferences.animations ? 'disable' : 'enable'} app animations`}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Sounds</ThemedText>
                <Switch
                  value={settings.preferences.sounds}
                  onValueChange={(value) => { updateAppPreferences({ sounds: value }); }}
                  accessibilityLabel={`Sounds${settings.preferences.sounds ? ', enabled' : ', disabled'}`}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: settings.preferences.sounds }}
                  accessibilityHint={`Toggle to ${settings.preferences.sounds ? 'disable' : 'enable'} app sounds`}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Haptic Feedback</ThemedText>
                <Switch
                  value={settings.preferences.hapticFeedback}
                  onValueChange={(value) => { updateAppPreferences({ hapticFeedback: value }); }}
                  accessibilityLabel={`Haptic feedback${settings.preferences.hapticFeedback ? ', enabled' : ', disabled'}`}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: settings.preferences.hapticFeedback }}
                  accessibilityHint={`Toggle to ${settings.preferences.hapticFeedback ? 'disable' : 'enable'} haptic feedback`}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Data Saver</ThemedText>
                <Switch
                  value={settings.preferences.dataSaver}
                  onValueChange={(value) => { updateAppPreferences({ dataSaver: value }); }}
                  accessibilityLabel={`Data saver mode${settings.preferences.dataSaver ? ', enabled' : ', disabled'}`}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: settings.preferences.dataSaver }}
                  accessibilityHint={`Toggle to ${settings.preferences.dataSaver ? 'disable' : 'enable'} data saver mode`}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>High Quality Images</ThemedText>
                <Switch
                  value={settings.preferences.highQualityImages}
                  onValueChange={(value) => { updateAppPreferences({ highQualityImages: value }); }}
                  accessibilityLabel={`High quality images${settings.preferences.highQualityImages ? ', enabled' : ', disabled'}`}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: settings.preferences.highQualityImages }}
                  accessibilityHint={`Toggle to ${settings.preferences.highQualityImages ? 'disable' : 'enable'} high quality images`}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>
            </View>
          )}
        </View>

        {/* Legal & About */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="document-text-outline" size={24} color="#8B5CF6" />
              <ThemedText style={styles.sectionTitle}>Legal & About</ThemedText>
            </View>
          </View>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/legal/about')}
              activeOpacity={0.7}
              accessibilityLabel="About ReZ"
              accessibilityRole="button"
            >
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>About ReZ</ThemedText>
                <ThemedText style={styles.settingValue}>Learn about us</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/legal/terms')}
              activeOpacity={0.7}
              accessibilityLabel="Terms and Conditions"
              accessibilityRole="button"
            >
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>Terms & Conditions</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/legal/privacy')}
              activeOpacity={0.7}
              accessibilityLabel="Privacy Policy"
              accessibilityRole="button"
            >
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>Privacy Policy</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/legal/refund-policy')}
              activeOpacity={0.7}
              accessibilityLabel="Refund Policy"
              accessibilityRole="button"
            >
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>Refund Policy</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Developer Tools */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="flask-outline" size={24} color="#F59E0B" />
              <ThemedText style={styles.sectionTitle}>Developer Tools</ThemedText>
            </View>
          </View>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/dev/test-pages')}
              activeOpacity={0.7}
              accessibilityLabel="Test All Pages"
              accessibilityRole="button"
            >
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>Test All Pages</ThemedText>
                <ThemedText style={styles.settingValue}>Navigate to all 38 new pages</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={styles.resetAllButton}
          onPress={handleResetSettings}
          accessibilityLabel="Reset all settings to defaults"
          accessibilityRole="button"
          accessibilityHint="Double tap to restore all settings to their default values"
        >
          <Ionicons name="refresh-circle-outline" size={24} color="#EF4444" />
          <ThemedText style={styles.resetAllText}>Reset All Settings</ThemedText>
        </TouchableOpacity>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  subsectionTitle: {
    paddingVertical: 12,
    paddingTop: 16,
  },
  subsectionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 13,
    color: '#8B5CF6',
    marginTop: 2,
    fontWeight: '600',
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  toggleButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleButtonTextActive: {
    color: 'white',
  },
  resetAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resetAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    height: 20,
  },
});