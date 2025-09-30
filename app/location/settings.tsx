import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocationPermission, useCurrentLocation } from '@/hooks/useLocation';
import { useGreetingCustomization } from '@/hooks/useGreeting';
import { LocationDisplay, TimeDisplay } from '@/components/location';

export default function LocationSettingsScreen() {
  const router = useRouter();
  const { permissionStatus, requestPermission } = useLocationPermission();
  const { currentLocation } = useCurrentLocation();
  const { customConfig, setLanguage, setEmojiEnabled, setPersonalized } = useGreetingCustomization();

  // Local state for settings
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [backgroundUpdates, setBackgroundUpdates] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);
  const [locationHistory, setLocationHistory] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handlePermissionRequest = async () => {
    try {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Location permission is required for location-based features. You can enable it in Settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request location permission');
    }
  };

  const handleClearLocationData = () => {
    Alert.alert(
      'Clear Location Data',
      'This will clear all your location history and reset location preferences. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // Implement clear location data
            Alert.alert('Success', 'Location data cleared successfully');
          },
        },
      ]
    );
  };

  const handleLanguageChange = (language: 'en' | 'hi' | 'te' | 'ta' | 'bn') => {
    setLanguage(language);
  };

  const getLanguageName = (code: string) => {
    const languages = {
      en: 'English',
      hi: 'Hindi',
      te: 'Telugu',
      ta: 'Tamil',
      bn: 'Bengali',
    };
    return languages[code as keyof typeof languages] || 'English';
  };

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'Enabled';
      case 'denied':
        return 'Disabled';
      case 'restricted':
        return 'Restricted';
      default:
        return 'Not Set';
    }
  };

  const getPermissionStatusColor = () => {
    switch (permissionStatus) {
      case 'granted':
        return '#34C759';
      case 'denied':
        return '#FF3B30';
      case 'restricted':
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon: string,
    disabled = false
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={24} color={disabled ? '#C7C7CC' : '#007AFF'} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, disabled && styles.disabledText]}>
            {title}
          </Text>
          <Text style={[styles.settingSubtitle, disabled && styles.disabledText]}>
            {subtitle}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  const renderLanguageOption = (code: 'en' | 'hi' | 'te' | 'ta' | 'bn') => (
    <TouchableOpacity
      key={code}
      style={[
        styles.languageOption,
        customConfig.language === code && styles.selectedLanguageOption,
      ]}
      onPress={() => handleLanguageChange(code)}
    >
      <Text
        style={[
          styles.languageText,
          customConfig.language === code && styles.selectedLanguageText,
        ]}
      >
        {getLanguageName(code)}
      </Text>
      {customConfig.language === code && (
        <Ionicons name="checkmark" size={20} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          <LocationDisplay
            showCoordinates={true}
            showLastUpdated={true}
            showRefreshButton={true}
            style={styles.locationCard}
          />
        </View>

        {/* Current Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Time</Text>
          <TimeDisplay
            showDate={true}
            showTimezone={true}
            showTimeOfDay={true}
            style={styles.timeCard}
          />
        </View>

        {/* Permission Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permission Status</Text>
          <View style={styles.permissionCard}>
            <View style={styles.permissionContent}>
              <View style={styles.permissionIcon}>
                <Ionicons name="location" size={24} color={getPermissionStatusColor()} />
              </View>
              <View style={styles.permissionText}>
                <Text style={styles.permissionTitle}>Location Access</Text>
                <Text style={[styles.permissionStatus, { color: getPermissionStatusColor() }]}>
                  {getPermissionStatusText()}
                </Text>
              </View>
            </View>
            {permissionStatus !== 'granted' && (
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={handlePermissionRequest}
              >
                <Text style={styles.permissionButtonText}>Enable</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Location Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Features</Text>
          {renderSettingItem(
            'Auto Update Location',
            'Automatically update your location when using the app',
            autoUpdate,
            setAutoUpdate,
            'refresh',
            permissionStatus !== 'granted'
          )}
          {renderSettingItem(
            'Background Updates',
            'Update location even when app is in background',
            backgroundUpdates,
            setBackgroundUpdates,
            'phone-portrait',
            permissionStatus !== 'granted'
          )}
          {renderSettingItem(
            'Share Location',
            'Allow sharing your location with other users',
            shareLocation,
            setShareLocation,
            'share',
            permissionStatus !== 'granted'
          )}
          {renderSettingItem(
            'Location History',
            'Save your location history for better recommendations',
            locationHistory,
            setLocationHistory,
            'time',
            permissionStatus !== 'granted'
          )}
        </View>

        {/* Greeting Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Greeting Settings</Text>
          {renderSettingItem(
            'Show Emoji',
            'Display emojis in greetings',
            customConfig.includeEmoji || false,
            setEmojiEnabled,
            'happy',
            false
          )}
          {renderSettingItem(
            'Personalized Greetings',
            'Include your name in greetings',
            customConfig.personalized || false,
            setPersonalized,
            'person',
            false
          )}
        </View>

        {/* Language Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Greeting Language</Text>
          <View style={styles.languageContainer}>
            {renderLanguageOption('en')}
            {renderLanguageOption('hi')}
            {renderLanguageOption('te')}
            {renderLanguageOption('ta')}
            {renderLanguageOption('bn')}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {renderSettingItem(
            'Location Notifications',
            'Get notified about location-based offers and updates',
            notifications,
            setNotifications,
            'notifications',
            false
          )}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClearLocationData}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionIcon}>
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Clear Location Data</Text>
                <Text style={styles.actionSubtitle}>
                  Remove all location history and reset preferences
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  locationCard: {
    marginBottom: 0,
  },
  timeCard: {
    marginBottom: 0,
  },
  permissionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permissionIcon: {
    marginRight: 12,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  permissionStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  settingItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  disabledText: {
    color: '#C7C7CC',
  },
  languageContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedLanguageOption: {
    backgroundColor: '#F0F8FF',
  },
  languageText: {
    fontSize: 16,
    color: '#333333',
  },
  selectedLanguageText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
});
