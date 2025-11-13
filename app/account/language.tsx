// Language Settings Page
// Comprehensive language and localization settings

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  RefreshControl,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useApp } from '@/contexts/AppContext';

type Language = 'en' | 'hi' | 'te' | 'ta' | 'bn' | 'es' | 'fr' | 'de' | 'zh' | 'ja';
type Region = 'IN' | 'US' | 'GB' | 'CA' | 'AU' | 'DE' | 'FR' | 'ES' | 'IT' | 'BR' | 'CN' | 'JP';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  region: Region;
  isRTL: boolean;
}

interface RegionOption {
  code: Region;
  name: string;
  currency: string;
  timezone: string;
  dateFormat: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', region: 'US', isRTL: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'IN', isRTL: false },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', region: 'IN', isRTL: false },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', region: 'IN', isRTL: false },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', region: 'IN', isRTL: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', region: 'ES', isRTL: false },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'FR', isRTL: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'DE', isRTL: false },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', region: 'CN', isRTL: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'JP', isRTL: false },
];

const REGION_OPTIONS: RegionOption[] = [
  { code: 'IN', name: 'India', currency: 'INR', timezone: 'Asia/Kolkata', dateFormat: 'DD/MM/YYYY' },
  { code: 'US', name: 'United States', currency: 'USD', timezone: 'America/New_York', dateFormat: 'MM/DD/YYYY' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', timezone: 'Europe/London', dateFormat: 'DD/MM/YYYY' },
  { code: 'CA', name: 'Canada', currency: 'CAD', timezone: 'America/Toronto', dateFormat: 'DD/MM/YYYY' },
  { code: 'AU', name: 'Australia', currency: 'AUD', timezone: 'Australia/Sydney', dateFormat: 'DD/MM/YYYY' },
  { code: 'DE', name: 'Germany', currency: 'EUR', timezone: 'Europe/Berlin', dateFormat: 'DD.MM.YYYY' },
  { code: 'FR', name: 'France', currency: 'EUR', timezone: 'Europe/Paris', dateFormat: 'DD/MM/YYYY' },
  { code: 'ES', name: 'Spain', currency: 'EUR', timezone: 'Europe/Madrid', dateFormat: 'DD/MM/YYYY' },
  { code: 'IT', name: 'Italy', currency: 'EUR', timezone: 'Europe/Rome', dateFormat: 'DD/MM/YYYY' },
  { code: 'BR', name: 'Brazil', currency: 'BRL', timezone: 'America/Sao_Paulo', dateFormat: 'DD/MM/YYYY' },
  { code: 'CN', name: 'China', currency: 'CNY', timezone: 'Asia/Shanghai', dateFormat: 'YYYY/MM/DD' },
  { code: 'JP', name: 'Japan', currency: 'JPY', timezone: 'Asia/Tokyo', dateFormat: 'YYYY/MM/DD' },
];

export default function LanguageSettingsPage() {
  const router = useRouter();
  const { settings, isLoading, updateGeneralSettings, refetch } = useUserSettings(true);
  const { actions: appActions } = useApp();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [selectedRegion, setSelectedRegion] = useState<Region>('IN');
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize with current settings
  useEffect(() => {
    if (settings?.general) {
      setSelectedLanguage(settings.general.language as Language || 'en');
      // Map currency to region
      const region = REGION_OPTIONS.find(r => r.currency === settings.general.currency);
      if (region) {
        setSelectedRegion(region.code);
      }
    }
  }, [settings]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleLanguageChange = async (language: Language) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    setSelectedLanguage(language);

    try {
      // Update backend settings
      const success = await updateGeneralSettings({ language });
      
      if (success) {
        // Update app context
        await appActions.setLanguage(language);
        
        // Show success feedback
        Alert.alert(
          'Language Updated',
          `App language changed to ${LANGUAGE_OPTIONS.find(l => l.code === language)?.name}`,
          [{ text: 'OK' }]
        );
      } else {
        // Revert on failure
        setSelectedLanguage(settings?.general.language as Language || 'en');
        Alert.alert('Error', 'Failed to update language. Please try again.');
      }
    } catch (error) {
      console.error('Error updating language:', error);
      setSelectedLanguage(settings?.general.language as Language || 'en');
      Alert.alert('Error', 'Failed to update language. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRegionChange = async (region: Region) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    setSelectedRegion(region);

    const regionData = REGION_OPTIONS.find(r => r.code === region);
    if (!regionData) return;

    try {
      // Update backend settings
      const success = await updateGeneralSettings({
        currency: regionData.currency as 'INR' | 'USD' | 'GBP' | 'CAD' | 'AUD' | 'EUR' | 'BRL' | 'CNY' | 'JPY',
        timezone: regionData.timezone,
        dateFormat: regionData.dateFormat,
      });
      
      if (success) {
        Alert.alert(
          'Region Updated',
          `Region changed to ${regionData.name}`,
          [{ text: 'OK' }]
        );
      } else {
        // Revert on failure
        const currentRegion = REGION_OPTIONS.find(r => r.currency === settings?.general.currency);
        setSelectedRegion(currentRegion?.code || 'IN');
        Alert.alert('Error', 'Failed to update region. Please try again.');
      }
    } catch (error) {
      console.error('Error updating region:', error);
      const currentRegion = REGION_OPTIONS.find(r => r.currency === settings?.general.currency);
      setSelectedRegion(currentRegion?.code || 'IN');
      Alert.alert('Error', 'Failed to update region. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderLanguageOption = (language: LanguageOption) => (
    <TouchableOpacity
      key={language.code}
      style={[
        styles.languageOption,
        selectedLanguage === language.code && styles.selectedLanguageOption,
        isUpdating && styles.disabledOption,
      ]}
      onPress={() => handleLanguageChange(language.code)}
      disabled={isUpdating}
      activeOpacity={0.7}
      accessibilityLabel={`${language.name} - ${language.nativeName}${selectedLanguage === language.code ? ', selected' : ''}`}
      accessibilityRole="radio"
      accessibilityState={{ checked: selectedLanguage === language.code, disabled: isUpdating }}
      accessibilityHint="Double tap to select this language"
    >
      <View style={styles.languageContent}>
        <View style={styles.languageInfo}>
          <Text style={styles.flag}>{language.flag}</Text>
          <View style={styles.languageText}>
            <ThemedText style={[
              styles.languageName,
              selectedLanguage === language.code && styles.selectedLanguageName,
            ]}>
              {language.name}
            </ThemedText>
            <ThemedText style={[
              styles.languageNative,
              selectedLanguage === language.code && styles.selectedLanguageNative,
            ]}>
              {language.nativeName}
            </ThemedText>
          </View>
        </View>
        {selectedLanguage === language.code && (
          <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderRegionOption = (region: RegionOption) => (
    <TouchableOpacity
      key={region.code}
      style={[
        styles.regionOption,
        selectedRegion === region.code && styles.selectedRegionOption,
        isUpdating && styles.disabledOption,
      ]}
      onPress={() => handleRegionChange(region.code)}
      disabled={isUpdating}
      activeOpacity={0.7}
      accessibilityLabel={`${region.name}, ${region.currency}, ${region.timezone}${selectedRegion === region.code ? ', selected' : ''}`}
      accessibilityRole="radio"
      accessibilityState={{ checked: selectedRegion === region.code, disabled: isUpdating }}
      accessibilityHint="Double tap to select this region"
    >
      <View style={styles.regionContent}>
        <View style={styles.regionInfo}>
          <ThemedText style={[
            styles.regionName,
            selectedRegion === region.code && styles.selectedRegionName,
          ]}>
            {region.name}
          </ThemedText>
          <ThemedText style={[
            styles.regionDetails,
            selectedRegion === region.code && styles.selectedRegionDetails,
          ]}>
            {region.currency} • {region.timezone}
          </ThemedText>
        </View>
        {selectedRegion === region.code && (
          <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !settings) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Language & Region</ThemedText>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading language settings...</ThemedText>
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
            accessibilityHint="Double tap to return to previous screen"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle}>Language & Region</ThemedText>

          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Settings Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="globe-outline" size={24} color="#8B5CF6" />
            <ThemedText style={styles.summaryTitle}>Current Settings</ThemedText>
          </View>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryLabel}>Language</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage)?.name || 'English'}
              </ThemedText>
            </View>
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryLabel}>Region</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {REGION_OPTIONS.find(r => r.code === selectedRegion)?.name || 'India'}
              </ThemedText>
            </View>
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryLabel}>Currency</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {REGION_OPTIONS.find(r => r.code === selectedRegion)?.currency || 'INR'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="language-outline" size={24} color="#8B5CF6" />
            <ThemedText style={styles.sectionTitle}>App Language</ThemedText>
          </View>
          <ThemedText style={styles.sectionDescription}>
            Choose your preferred language for the app interface
          </ThemedText>
          
          <View style={styles.optionsContainer}>
            {LANGUAGE_OPTIONS.map(renderLanguageOption)}
          </View>
        </View>

        {/* Region Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={24} color="#8B5CF6" />
            <ThemedText style={styles.sectionTitle}>Region & Localization</ThemedText>
          </View>
          <ThemedText style={styles.sectionDescription}>
            Set your region for currency, timezone, and date format preferences
          </ThemedText>
          
          <View style={styles.optionsContainer}>
            {REGION_OPTIONS.map(renderRegionOption)}
          </View>
        </View>

        {/* Additional Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={24} color="#8B5CF6" />
            <ThemedText style={styles.sectionTitle}>Additional Settings</ThemedText>
          </View>
          
          <View style={styles.additionalSettings}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>Time Format</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Choose between 12-hour and 24-hour time format
                </ThemedText>
              </View>
              <View style={styles.toggleGroup}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    settings?.general.timeFormat === '12h' && styles.toggleButtonActive,
                  ]}
                  onPress={() => updateGeneralSettings({ timeFormat: '12h' })}
                  accessibilityLabel={`12-hour format${settings?.general.timeFormat === '12h' ? ', selected' : ''}`}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: settings?.general.timeFormat === '12h' }}
                  accessibilityHint="Double tap to use 12-hour time format"
                >
                  <ThemedText
                    style={[
                      styles.toggleButtonText,
                      settings?.general.timeFormat === '12h' && styles.toggleButtonTextActive,
                    ]}
                  >
                    12h
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    settings?.general.timeFormat === '24h' && styles.toggleButtonActive,
                  ]}
                  onPress={() => updateGeneralSettings({ timeFormat: '24h' })}
                  accessibilityLabel={`24-hour format${settings?.general.timeFormat === '24h' ? ', selected' : ''}`}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: settings?.general.timeFormat === '24h' }}
                  accessibilityHint="Double tap to use 24-hour time format"
                >
                  <ThemedText
                    style={[
                      styles.toggleButtonText,
                      settings?.general.timeFormat === '24h' && styles.toggleButtonTextActive,
                    ]}
                  >
                    24h
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color="#6B7280" />
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoTitle}>Language & Region Info</ThemedText>
            <ThemedText style={styles.infoText}>
              Changes to language and region settings will affect the app interface, 
              currency display, date formats, and timezone preferences. Some changes 
              may require an app restart to take full effect.
            </ThemedText>
          </View>
        </View>

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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  summaryContent: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 8,
  },
  languageOption: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLanguageOption: {
    backgroundColor: '#F0F4FF',
    borderColor: '#8B5CF6',
  },
  disabledOption: {
    opacity: 0.6,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  selectedLanguageName: {
    color: '#8B5CF6',
  },
  languageNative: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedLanguageNative: {
    color: '#8B5CF6',
  },
  regionOption: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedRegionOption: {
    backgroundColor: '#F0F4FF',
    borderColor: '#8B5CF6',
  },
  regionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  regionInfo: {
    flex: 1,
  },
  regionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  selectedRegionName: {
    color: '#8B5CF6',
  },
  regionDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedRegionDetails: {
    color: '#8B5CF6',
  },
  additionalSettings: {
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 16,
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  infoCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#0369A1',
    lineHeight: 18,
  },
  footer: {
    height: 20,
  },
});
