// App Settings Page
// General application preferences and configurations

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

interface SettingsItem {
  id: string;
  title: string;
  description?: string;
  type: 'switch' | 'navigation' | 'action';
  value?: boolean;
  icon: string;
  iconColor: string;
  onPress?: () => void;
  route?: string;
}

interface SettingsSection {
  id: string;
  title: string;
  items: SettingsItem[];
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    notifications: true,
    pushNotifications: true,
    emailNotifications: false,
    locationServices: true,
    analytics: false,
    darkMode: false,
    biometrics: true,
    autoSync: true,
    dataOptimization: true,
    crashReporting: true,
  });

  const handleBackPress = () => {
    router.back();
  };

  const handleToggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
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
          onPress: () => {
            setSettings({
              notifications: true,
              pushNotifications: true,
              emailNotifications: false,
              locationServices: true,
              analytics: false,
              darkMode: false,
              biometrics: true,
              autoSync: true,
              dataOptimization: true,
              crashReporting: true,
            });
            Alert.alert('Settings Reset', 'All settings have been reset to default values.');
          }
        }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. The app may run slower until data is reloaded.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          onPress: () => {
            // Simulate cache clearing
            Alert.alert('Cache Cleared', 'App cache has been cleared successfully.');
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your data will be exported and saved to your device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // Simulate data export
            Alert.alert('Export Complete', 'Your data has been exported successfully.');
          }
        }
      ]
    );
  };

  const settingsSections: SettingsSection[] = [
    {
      id: 'notifications',
      title: 'Notifications',
      items: [
        {
          id: 'pushNotifications',
          title: 'Push Notifications',
          description: 'Receive push notifications for orders, offers, and updates',
          type: 'switch',
          value: settings.pushNotifications,
          icon: 'notifications-outline',
          iconColor: '#8B5CF6',
          onPress: () => handleToggleSetting('pushNotifications'),
        },
        {
          id: 'emailNotifications',
          title: 'Email Notifications',
          description: 'Receive updates and offers via email',
          type: 'switch',
          value: settings.emailNotifications,
          icon: 'mail-outline',
          iconColor: '#06B6D4',
          onPress: () => handleToggleSetting('emailNotifications'),
        },
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      items: [
        {
          id: 'locationServices',
          title: 'Location Services',
          description: 'Allow app to access your location for delivery and recommendations',
          type: 'switch',
          value: settings.locationServices,
          icon: 'location-outline',
          iconColor: '#EF4444',
          onPress: () => handleToggleSetting('locationServices'),
        },
        {
          id: 'biometrics',
          title: 'Biometric Authentication',
          description: 'Use fingerprint or face ID to secure your account',
          type: 'switch',
          value: settings.biometrics,
          icon: 'finger-print-outline',
          iconColor: '#10B981',
          onPress: () => handleToggleSetting('biometrics'),
        },
        {
          id: 'analytics',
          title: 'Analytics & Tracking',
          description: 'Help improve the app by sharing usage data',
          type: 'switch',
          value: settings.analytics,
          icon: 'analytics-outline',
          iconColor: '#F59E0B',
          onPress: () => handleToggleSetting('analytics'),
        },
      ],
    },
    {
      id: 'data',
      title: 'Data & Storage',
      items: [
        {
          id: 'autoSync',
          title: 'Auto Sync',
          description: 'Automatically sync data when connected to WiFi',
          type: 'switch',
          value: settings.autoSync,
          icon: 'sync-outline',
          iconColor: '#8B5CF6',
          onPress: () => handleToggleSetting('autoSync'),
        },
        {
          id: 'dataOptimization',
          title: 'Data Optimization',
          description: 'Reduce data usage by compressing images and content',
          type: 'switch',
          value: settings.dataOptimization,
          icon: 'cellular-outline',
          iconColor: '#06B6D4',
          onPress: () => handleToggleSetting('dataOptimization'),
        },
        {
          id: 'clearCache',
          title: 'Clear Cache',
          description: 'Free up space by clearing cached data',
          type: 'action',
          icon: 'trash-outline',
          iconColor: '#EF4444',
          onPress: handleClearCache,
        },
      ],
    },
    {
      id: 'account',
      title: 'Account Management',
      items: [
        {
          id: 'profile',
          title: 'Edit Profile',
          description: 'Update your personal information and preferences',
          type: 'navigation',
          icon: 'person-outline',
          iconColor: '#8B5CF6',
          route: '/profile/edit',
        },
        {
          id: 'payment',
          title: 'Payment Methods',
          description: 'Manage your payment cards and methods',
          type: 'navigation',
          icon: 'card-outline',
          iconColor: '#10B981',
          route: '/account/payment',
        },
        {
          id: 'delivery',
          title: 'Delivery Addresses',
          description: 'Manage your saved delivery addresses',
          type: 'navigation',
          icon: 'location-outline',
          iconColor: '#F59E0B',
          route: '/account/delivery',
        },
        {
          id: 'wishlist',
          title: 'My Wishlist',
          description: 'View and manage your saved items',
          type: 'navigation',
          icon: 'heart-outline',
          iconColor: '#EF4444',
          route: '/wishlist',
        },
      ],
    },
    {
      id: 'support',
      title: 'Support & Feedback',
      items: [
        {
          id: 'help',
          title: 'Help & FAQ',
          description: 'Get answers to common questions',
          type: 'navigation',
          icon: 'help-circle-outline',
          iconColor: '#8B5CF6',
          route: '/help',
        },
        {
          id: 'contact',
          title: 'Contact Support',
          description: 'Get help from our customer support team',
          type: 'navigation',
          icon: 'chatbubble-outline',
          iconColor: '#06B6D4',
          route: '/help/contact',
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          description: 'Share your thoughts and suggestions',
          type: 'navigation',
          icon: 'star-outline',
          iconColor: '#F59E0B',
          route: '/help/feedback',
        },
      ],
    },
    {
      id: 'advanced',
      title: 'Advanced',
      items: [
        {
          id: 'crashReporting',
          title: 'Crash Reporting',
          description: 'Automatically send crash reports to help fix issues',
          type: 'switch',
          value: settings.crashReporting,
          icon: 'bug-outline',
          iconColor: '#EF4444',
          onPress: () => handleToggleSetting('crashReporting'),
        },
        {
          id: 'exportData',
          title: 'Export My Data',
          description: 'Download a copy of your personal data',
          type: 'action',
          icon: 'download-outline',
          iconColor: '#10B981',
          onPress: handleExportData,
        },
        {
          id: 'resetSettings',
          title: 'Reset Settings',
          description: 'Reset all settings to default values',
          type: 'action',
          icon: 'refresh-outline',
          iconColor: '#F59E0B',
          onPress: handleResetSettings,
        },
      ],
    },
  ];

  const renderSettingsItem = (item: SettingsItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingsItem}
      onPress={() => {
        if (item.route) {
          router.push(item.route as any);
        } else if (item.onPress) {
          item.onPress();
        }
      }}
      disabled={item.type === 'switch'}
      activeOpacity={item.type === 'switch' ? 1 : 0.7}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.settingsIcon, { backgroundColor: item.iconColor + '15' }]}>
          <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
        </View>
        
        <View style={styles.settingsText}>
          <ThemedText style={styles.settingsTitle}>{item.title}</ThemedText>
          {item.description && (
            <ThemedText style={styles.settingsDescription}>
              {item.description}
            </ThemedText>
          )}
        </View>
      </View>
      
      <View style={styles.settingsItemRight}>
        {item.type === 'switch' && (
          <Switch
            value={item.value}
            onValueChange={item.onPress}
            trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
            thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
          />
        )}
        {item.type === 'navigation' && (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        )}
        {item.type === 'action' && (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (section: SettingsSection) => (
    <View key={section.id} style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
      <View style={styles.sectionItems}>
        {section.items.map(renderSettingsItem)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#8B5CF6"
        translucent={false}
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#A855F7']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>Settings</ThemedText>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {settingsSections.map(renderSection)}
        
        {/* App Info */}
        <View style={styles.appInfo}>
          <ThemedText style={styles.appInfoText}>
            Rez App v1.0.0
          </ThemedText>
          <ThemedText style={styles.appInfoText}>
            © 2024 Rez Technologies
          </ThemedText>
        </View>
        
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 20 : 0,
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
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionItems: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsText: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  settingsDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  settingsItemRight: {
    marginLeft: 12,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  appInfoText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  bottomSpace: {
    height: 20,
  },
});