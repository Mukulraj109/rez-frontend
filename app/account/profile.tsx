// Account Profile Page
// User's account information and settings overview

import React, { useState, useEffect } from 'react';
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
import { useRouter, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useSecurity } from '@/contexts/SecurityContext';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';
import userSettingsApi from '@/services/userSettingsApi';

interface UserSettings {
  _id: string;
  user: string;
  general: {
    language: string;
    currency: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
  };
  notifications: {
    push: { enabled: boolean };
    email: { enabled: boolean };
    sms: { enabled: boolean };
  };
  privacy: {
    profileVisibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
    showActivity: boolean;
  };
  security: {
    twoFactorAuth: { enabled: boolean };
    biometric: { fingerprintEnabled: boolean; faceIdEnabled: boolean };
  };
  preferences: {
    animations: boolean;
    sounds: boolean;
    hapticFeedback: boolean;
  };
}

export default function AccountProfilePage() {
  const router = useRouter();
  const { state } = useAuth();
  const user = state.user;
  const { settings: notificationSettings, updateSettings: updateNotificationSettings } = useNotifications();
  const { securitySettings, privacySettings, updateSecuritySettings, updatePrivacySettings } = useSecurity();
  const { preferences: appPreferences, updatePreferences: updateAppPreferences } = useAppPreferences();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await userSettingsApi.getUserSettings();
      if (response.success && response.data) {
        setSettings(response.data as any);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSettings();
    setRefreshing(false);
  };

  const handleToggleSetting = async (path: string, value: boolean) => {
    if (!settings) return;

    try {
      // Optimistic update
      const newSettings = { ...settings };
      const keys = path.split('.');
      let current: any = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      setSettings(newSettings);

      // Build nested update object for API
      const buildNestedObject = (keys: string[], value: any): any => {
        if (keys.length === 1) {
          return { [keys[0]]: value };
        }
        return { [keys[0]]: buildNestedObject(keys.slice(1), value) };
      };

      const updateData = buildNestedObject(keys, value);

      // Handle notification settings through global context
      if (keys[0] === 'notifications') {
        const success = await updateNotificationSettings(updateData.notifications);
        if (!success) {
          await loadSettings();
          Alert.alert('Error', 'Failed to update notification setting');
        }
        return;
      }

      // API update - use specific endpoint based on top-level key
      let response;
      const topLevelKey = keys[0];

      switch (topLevelKey) {
        case 'privacy':
          response = await userSettingsApi.updatePrivacySettings(updateData.privacy);
          break;
        case 'security':
          response = await userSettingsApi.updateSecuritySettings(updateData.security);
          break;
        case 'preferences':
          response = await userSettingsApi.updateAppPreferences(updateData.preferences);
          break;
        default:
          response = await userSettingsApi.updateSettings(updateData);
      }

      if (!response.success) {
        // Revert on failure
        await loadSettings();
        Alert.alert('Error', 'Failed to update setting');
      }
    } catch (error) {
      await loadSettings();
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleNavigateToSetting = (route: string) => {
    router.push(route as any);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText
          accessibilityRole="progressbar"
          accessibilityLabel="Loading account profile"
        >
          Loading...
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#A78BFA', '#C4B5FD']}
        style={styles.header}
      >
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

          <View style={styles.headerTitleSection}>
            <ThemedText style={styles.headerTitle}>Account Settings</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Manage your preferences
            </ThemedText>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/profile/edit' as any)}
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
            accessibilityHint="Navigate to edit profile screen"
          >
            <Ionicons name="create-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* User Info Card */}
        {user && (
          <View style={styles.userCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>
                  {user.profile?.firstName?.[0]}{user.profile?.lastName?.[0]}
                </ThemedText>
              </View>
            </View>
            <View style={styles.userInfo}>
              <ThemedText style={styles.userName}>
                {user.profile?.firstName} {user.profile?.lastName}
              </ThemedText>
              <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
              <ThemedText style={styles.userPhone}>
                {user.profile?.phoneNumber}
              </ThemedText>
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* General Settings */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>General</ThemedText>

          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleNavigateToSetting('/account/language')}
              accessibilityLabel={`Language and Region. Current setting: ${settings?.general.language.toUpperCase()}, ${settings?.general.currency}`}
              accessibilityRole="button"
              accessibilityHint="Double tap to change language and region settings"
            >
              <View style={styles.settingIcon}>
                <Ionicons name="language" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingTitle}>Language & Region</ThemedText>
                <ThemedText style={styles.settingValue}>
                  {settings?.general.language.toUpperCase()} • {settings?.general.currency}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notifications</ThemedText>

          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="notifications" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingTitle}>Push Notifications</ThemedText>
                <ThemedText style={styles.settingSubtitle}>
                  Order updates, promotions
                </ThemedText>
              </View>
              <Switch
                value={notificationSettings?.push.enabled || false}
                onValueChange={(value) => handleToggleSetting('notifications.push.enabled', value)}
                accessibilityLabel={`Push notifications${notificationSettings?.push.enabled ? ', enabled' : ', disabled'}`}
                accessibilityRole="switch"
                accessibilityState={{ checked: notificationSettings?.push.enabled || false }}
                accessibilityHint={`Toggle to ${notificationSettings?.push.enabled ? 'disable' : 'enable'} push notifications`}
                trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
                thumbColor={notificationSettings?.push.enabled ? '#8B5CF6' : '#F3F4F6'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="mail" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingTitle}>Email Notifications</ThemedText>
                <ThemedText style={styles.settingSubtitle}>
                  Receipts, updates
                </ThemedText>
              </View>
              <Switch
                value={notificationSettings?.email.enabled || false}
                onValueChange={(value) => handleToggleSetting('notifications.email.enabled', value)}
                accessibilityLabel={`Email notifications${notificationSettings?.email.enabled ? ', enabled' : ', disabled'}`}
                accessibilityRole="switch"
                accessibilityState={{ checked: notificationSettings?.email.enabled || false }}
                accessibilityHint={`Toggle to ${notificationSettings?.email.enabled ? 'disable' : 'enable'} email notifications`}
                trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
                thumbColor={notificationSettings?.email.enabled ? '#8B5CF6' : '#F3F4F6'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="phone-portrait" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingTitle}>SMS Notifications</ThemedText>
                <ThemedText style={styles.settingSubtitle}>
                  Delivery alerts, OTP
                </ThemedText>
              </View>
              <Switch
                value={notificationSettings?.sms.enabled || false}
                onValueChange={(value) => handleToggleSetting('notifications.sms.enabled', value)}
                accessibilityLabel={`SMS notifications${notificationSettings?.sms.enabled ? ', enabled' : ', disabled'}`}
                accessibilityRole="switch"
                accessibilityState={{ checked: notificationSettings?.sms.enabled || false }}
                accessibilityHint={`Toggle to ${notificationSettings?.sms.enabled ? 'disable' : 'enable'} SMS notifications`}
                trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
                thumbColor={notificationSettings?.sms.enabled ? '#8B5CF6' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Privacy & Security</ThemedText>

          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/account/profile-visibility' as any)}
              accessibilityLabel={`Profile visibility. Current setting: ${privacySettings?.profileVisibility || 'FRIENDS'}`}
              accessibilityRole="button"
              accessibilityHint="Double tap to change who can see your profile"
            >
              <View style={styles.settingIcon}>
                <Ionicons name="eye" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingTitle}>Profile Visibility</ThemedText>
                <ThemedText style={styles.settingValue}>
                  {privacySettings?.profileVisibility || 'FRIENDS'}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/account/two-factor-auth' as any)}
              accessibilityLabel={`Two-factor authentication. Status: ${securitySettings?.twoFactorAuth.enabled ? 'Enabled' : 'Disabled'}`}
              accessibilityRole="button"
              accessibilityHint="Double tap to manage two-factor authentication settings"
            >
              <View style={styles.settingIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingTitle}>Two-Factor Authentication</ThemedText>
                <ThemedText style={styles.settingSubtitle}>
                  Extra security for your account
                </ThemedText>
              </View>
              <View style={styles.settingStatus}>
                <ThemedText style={styles.settingValue}>
                  {securitySettings?.twoFactorAuth.enabled ? 'Enabled' : 'Disabled'}
                </ThemedText>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="finger-print" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingTitle}>Biometric Login</ThemedText>
                <ThemedText style={styles.settingSubtitle}>
                  Fingerprint or Face ID
                </ThemedText>
              </View>
              <Switch
                value={securitySettings?.biometric.fingerprintEnabled || securitySettings?.biometric.faceIdEnabled || false}
                onValueChange={async (value) => {
                  const success = await updateSecuritySettings({
                    biometric: {
                      ...securitySettings?.biometric,
                      fingerprintEnabled: value,
                      faceIdEnabled: value,
                    }
                  });
                  if (!success) {
                    Alert.alert('Error', 'Failed to update biometric settings');
                  }
                }}
                accessibilityLabel={`Biometric login${securitySettings?.biometric.fingerprintEnabled || securitySettings?.biometric.faceIdEnabled ? ', enabled' : ', disabled'}`}
                accessibilityRole="switch"
                accessibilityState={{ checked: securitySettings?.biometric.fingerprintEnabled || securitySettings?.biometric.faceIdEnabled || false }}
                accessibilityHint={`Toggle to ${securitySettings?.biometric.fingerprintEnabled ? 'disable' : 'enable'} fingerprint or face ID login`}
                trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
                thumbColor={securitySettings?.biometric.fingerprintEnabled ? '#8B5CF6' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>App Preferences</ThemedText>

          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="flash" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingTitle}>Animations</ThemedText>
                <ThemedText style={styles.settingSubtitle}>
                  Smooth transitions
                </ThemedText>
              </View>
              <Switch
                value={appPreferences?.animations || false}
                onValueChange={async (value) => {
                  const success = await updateAppPreferences({ animations: value });
                  if (!success) {
                    Alert.alert('Error', 'Failed to update animations setting');
                  }
                }}
                accessibilityLabel={`Animations${appPreferences?.animations ? ', enabled' : ', disabled'}`}
                accessibilityRole="switch"
                accessibilityState={{ checked: appPreferences?.animations || false }}
                accessibilityHint={`Toggle to ${appPreferences?.animations ? 'disable' : 'enable'} app animations`}
                trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
                thumbColor={appPreferences?.animations ? '#8B5CF6' : '#F3F4F6'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="volume-medium" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingTitle}>Sounds</ThemedText>
                <ThemedText style={styles.settingSubtitle}>
                  App sounds and alerts
                </ThemedText>
              </View>
              <Switch
                value={appPreferences?.sounds || false}
                onValueChange={async (value) => {
                  const success = await updateAppPreferences({ sounds: value });
                  if (!success) {
                    Alert.alert('Error', 'Failed to update sounds setting');
                  }
                }}
                accessibilityLabel={`Sounds${appPreferences?.sounds ? ', enabled' : ', disabled'}`}
                accessibilityRole="switch"
                accessibilityState={{ checked: appPreferences?.sounds || false }}
                accessibilityHint={`Toggle to ${appPreferences?.sounds ? 'disable' : 'enable'} app sounds`}
                trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
                thumbColor={appPreferences?.sounds ? '#8B5CF6' : '#F3F4F6'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="phone-portrait" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingTitle}>Haptic Feedback</ThemedText>
                <ThemedText style={styles.settingSubtitle}>
                  Vibration on actions
                </ThemedText>
              </View>
              <Switch
                value={appPreferences?.hapticFeedback || false}
                onValueChange={async (value) => {
                  const success = await updateAppPreferences({ hapticFeedback: value });
                  if (!success) {
                    Alert.alert('Error', 'Failed to update haptic feedback setting');
                  }
                }}
                accessibilityLabel={`Haptic feedback${appPreferences?.hapticFeedback ? ', enabled' : ', disabled'}`}
                accessibilityRole="switch"
                accessibilityState={{ checked: appPreferences?.hapticFeedback || false }}
                accessibilityHint={`Toggle to ${appPreferences?.hapticFeedback ? 'disable' : 'enable'} haptic feedback`}
                trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
                thumbColor={appPreferences?.hapticFeedback ? '#8B5CF6' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account</ThemedText>

          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/profile/edit' as any)}
              accessibilityLabel="Edit profile information"
              accessibilityRole="button"
              accessibilityHint="Navigate to edit profile screen"
            >
              <View style={styles.settingIcon}>
                <Ionicons name="person" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingTitle}>Edit Profile</ThemedText>
                <ThemedText style={styles.settingSubtitle}>
                  Update your information
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/account/change-password' as any)}
              accessibilityLabel="Change password"
              accessibilityRole="button"
              accessibilityHint="Navigate to change password screen"
            >
              <View style={styles.settingIcon}>
                <Ionicons name="key" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingTitle}>Change Password</ThemedText>
                <ThemedText style={styles.settingSubtitle}>
                  Update your password
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/account/delete-account' as any)}
              accessibilityLabel="Delete account permanently"
              accessibilityRole="button"
              accessibilityHint="Navigate to account deletion screen. Warning: This action is permanent"
            >
              <View style={[styles.settingIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="trash" size={20} color="#EF4444" />
              </View>
              <View style={styles.settingInfo}>
                <ThemedText style={[styles.settingTitle, { color: '#EF4444' }]}>
                  Delete Account
                </ThemedText>
                <ThemedText style={styles.settingSubtitle}>
                  Permanently delete your account
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 50 : 45,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleSection: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  settingValue: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  settingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 68,
  },
});
