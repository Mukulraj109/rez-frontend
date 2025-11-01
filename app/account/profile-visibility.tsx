// Profile Visibility Settings Page
// Manages user's profile visibility preferences

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useSecurity } from '@/contexts/SecurityContext';

type VisibilityOption = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

interface VisibilityOptionData {
  value: VisibilityOption;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const VISIBILITY_OPTIONS: VisibilityOptionData[] = [
  {
    value: 'PUBLIC',
    title: 'Public',
    description: 'Anyone can see your profile and activity',
    icon: 'globe-outline',
    color: '#10B981',
  },
  {
    value: 'FRIENDS',
    title: 'Friends Only',
    description: 'Only your friends can see your profile',
    icon: 'people-outline',
    color: '#8B5CF6',
  },
  {
    value: 'PRIVATE',
    title: 'Private',
    description: 'Only you can see your profile',
    icon: 'lock-closed-outline',
    color: '#EF4444',
  },
];

export default function ProfileVisibilityPage() {
  const router = useRouter();
  const { privacySettings, updatePrivacySettings, isLoading } = useSecurity();
  const [selectedVisibility, setSelectedVisibility] = useState<VisibilityOption>('FRIENDS');

  useEffect(() => {
    if (privacySettings) {
      setSelectedVisibility(privacySettings.profileVisibility);
    }
  }, [privacySettings]);

  const handleVisibilityChange = async (visibility: VisibilityOption) => {
    try {
      setSelectedVisibility(visibility);
      const success = await updatePrivacySettings({ profileVisibility: visibility });
      
      if (success) {
        Alert.alert(
          'Profile Visibility Updated',
          `Your profile is now ${visibility.toLowerCase()}.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to update profile visibility. Please try again.');
        // Revert on failure
        if (privacySettings) {
          setSelectedVisibility(privacySettings.profileVisibility);
        }
      }
    } catch (error) {
      console.error('Failed to update profile visibility:', error);
      Alert.alert('Error', 'Failed to update profile visibility. Please try again.');
      // Revert on failure
      if (privacySettings) {
        setSelectedVisibility(privacySettings.profileVisibility);
      }
    }
  };

  const renderVisibilityOption = (option: VisibilityOptionData) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.optionCard,
        selectedVisibility === option.value && styles.selectedOption,
      ]}
      onPress={() => handleVisibilityChange(option.value)}
      activeOpacity={0.7}
    >
      <View style={styles.optionHeader}>
        <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
          <Ionicons name={option.icon as any} size={24} color={option.color} />
        </View>
        
        <View style={styles.optionInfo}>
          <ThemedText style={styles.optionTitle}>{option.title}</ThemedText>
          <ThemedText style={styles.optionDescription}>{option.description}</ThemedText>
        </View>

        {selectedVisibility === option.value && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Profile Visibility</ThemedText>
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

          <ThemedText style={styles.headerTitle}>Profile Visibility</ThemedText>

          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Current Setting */}
        <View style={styles.currentSection}>
          <ThemedText style={styles.sectionTitle}>Current Setting</ThemedText>
          <View style={styles.currentCard}>
            <ThemedText style={styles.currentLabel}>Profile Visibility</ThemedText>
            <ThemedText style={styles.currentValue}>
              {selectedVisibility === 'PUBLIC' ? 'Public' :
               selectedVisibility === 'FRIENDS' ? 'Friends Only' : 'Private'}
            </ThemedText>
          </View>
        </View>

        {/* Options */}
        <View style={styles.optionsSection}>
          <ThemedText style={styles.sectionTitle}>Choose Visibility Level</ThemedText>
          {VISIBILITY_OPTIONS.map(renderVisibilityOption)}
        </View>

        {/* Information */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={20} color="#8B5CF6" />
              <ThemedText style={styles.infoTitle}>About Profile Visibility</ThemedText>
            </View>
            <ThemedText style={styles.infoText}>
              Your profile visibility setting controls who can see your profile information, 
              activity, and posts. You can change this setting at any time.
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
  currentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  currentCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  currentLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  currentValue: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  optionsSection: {
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  selectedIndicator: {
    marginLeft: 12,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    height: 20,
  },
});

