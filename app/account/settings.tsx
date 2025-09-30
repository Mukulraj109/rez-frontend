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
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Settings</ThemedText>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading settings...</ThemedText>
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle}>Settings</ThemedText>

          <TouchableOpacity style={styles.resetButton} onPress={handleResetSettings}>
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
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>Theme</ThemedText>
                  <ThemedText style={styles.settingValue}>{settings.general.theme}</ThemedText>
                </View>
                <View style={styles.themeSelector}>
                  {(['light', 'dark', 'auto'] as const).map((theme) => (
                    <TouchableOpacity
                      key={theme}
                      style={[
                        styles.themeButton,
                        settings.general.theme === theme && styles.themeButtonActive,
                      ]}
                      onPress={() => updateGeneralSettings({ theme })}
                    >
                      <ThemedText
                        style={[
                          styles.themeButtonText,
                          settings.general.theme === theme && styles.themeButtonTextActive,
                        ]}
                      >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>Language</ThemedText>
                  <ThemedText style={styles.settingValue}>{settings.general.language.toUpperCase()}</ThemedText>
                </View>
              </View>

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
                    onPress={() => updateGeneralSettings({ timeFormat: '12h' })}
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
                    onPress={() => updateGeneralSettings({ timeFormat: '24h' })}
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
                  onValueChange={(value) =>
                    updateNotifications({ push: { ...settings.notifications.push, enabled: value } })
                  }
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              {settings.notifications.push.enabled && (
                <>
                  <View style={styles.settingRow}>
                    <ThemedText style={styles.settingLabel}>Order Updates</ThemedText>
                    <Switch
                      value={settings.notifications.push.orderUpdates}
                      onValueChange={(value) =>
                        updateNotifications({
                          push: { ...settings.notifications.push, orderUpdates: value },
                        })
                      }
                      trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                    />
                  </View>

                  <View style={styles.settingRow}>
                    <ThemedText style={styles.settingLabel}>Promotions</ThemedText>
                    <Switch
                      value={settings.notifications.push.promotions}
                      onValueChange={(value) =>
                        updateNotifications({
                          push: { ...settings.notifications.push, promotions: value },
                        })
                      }
                      trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                    />
                  </View>

                  <View style={styles.settingRow}>
                    <ThemedText style={styles.settingLabel}>Recommendations</ThemedText>
                    <Switch
                      value={settings.notifications.push.recommendations}
                      onValueChange={(value) =>
                        updateNotifications({
                          push: { ...settings.notifications.push, recommendations: value },
                        })
                      }
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
                  onValueChange={(value) =>
                    updateNotifications({ email: { ...settings.notifications.email, enabled: value } })
                  }
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              {settings.notifications.email.enabled && (
                <>
                  <View style={styles.settingRow}>
                    <ThemedText style={styles.settingLabel}>Order Receipts</ThemedText>
                    <Switch
                      value={settings.notifications.email.orderReceipts}
                      onValueChange={(value) =>
                        updateNotifications({
                          email: { ...settings.notifications.email, orderReceipts: value },
                        })
                      }
                      trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                    />
                  </View>

                  <View style={styles.settingRow}>
                    <ThemedText style={styles.settingLabel}>Weekly Digest</ThemedText>
                    <Switch
                      value={settings.notifications.email.weeklyDigest}
                      onValueChange={(value) =>
                        updateNotifications({
                          email: { ...settings.notifications.email, weeklyDigest: value },
                        })
                      }
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
                  onValueChange={(value) => updatePrivacy({ showActivity: value })}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Allow Messaging</ThemedText>
                <Switch
                  value={settings.privacy.allowMessaging}
                  onValueChange={(value) => updatePrivacy({ allowMessaging: value })}
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
                  onValueChange={(value) =>
                    updatePrivacy({
                      analytics: { ...settings.privacy.analytics, allowUsageTracking: value },
                    })
                  }
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Crash Reporting</ThemedText>
                <Switch
                  value={settings.privacy.analytics.allowCrashReporting}
                  onValueChange={(value) =>
                    updatePrivacy({
                      analytics: { ...settings.privacy.analytics, allowCrashReporting: value },
                    })
                  }
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
                  onValueChange={(value) =>
                    updateSecurity({
                      twoFactorAuth: { ...settings.security.twoFactorAuth, enabled: value },
                    })
                  }
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Login Alerts</ThemedText>
                <Switch
                  value={settings.security.loginAlerts}
                  onValueChange={(value) => updateSecurity({ loginAlerts: value })}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Allow Multiple Sessions</ThemedText>
                <Switch
                  value={settings.security.sessionManagement.allowMultipleSessions}
                  onValueChange={(value) =>
                    updateSecurity({
                      sessionManagement: {
                        ...settings.security.sessionManagement,
                        allowMultipleSessions: value,
                      },
                    })
                  }
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
                  onValueChange={(value) => updateAppPreferences({ animations: value })}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Sounds</ThemedText>
                <Switch
                  value={settings.preferences.sounds}
                  onValueChange={(value) => updateAppPreferences({ sounds: value })}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Haptic Feedback</ThemedText>
                <Switch
                  value={settings.preferences.hapticFeedback}
                  onValueChange={(value) => updateAppPreferences({ hapticFeedback: value })}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Data Saver</ThemedText>
                <Switch
                  value={settings.preferences.dataSaver}
                  onValueChange={(value) => updateAppPreferences({ dataSaver: value })}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>High Quality Images</ThemedText>
                <Switch
                  value={settings.preferences.highQualityImages}
                  onValueChange={(value) => updateAppPreferences({ highQualityImages: value })}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>
            </View>
          )}
        </View>

        {/* Reset Button */}
        <TouchableOpacity style={styles.resetAllButton} onPress={handleResetSettings}>
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
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  themeButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  themeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  themeButtonTextActive: {
    color: 'white',
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