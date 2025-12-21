// Delete Account Page
// Allows users to permanently delete their account with confirmation

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/services/apiClient';

export default function DeleteAccountPage() {
  const router = useRouter();
  const { actions } = useAuth();
  const [confirmationText, setConfirmationText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const requiredText = 'DELETE';

  const handleDeleteAccount = async () => {
    if (confirmationText !== requiredText) {
      Alert.alert('Confirmation Required', `Please type "${requiredText}" to confirm account deletion.`);
      return;
    }

    Alert.alert(
      'Delete Account',
      'Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.delete('/auth/account');

      if (response.data.success) {
        Alert.alert(
          'Account Deleted',
          'Your account has been successfully deleted. You will be redirected to the login page.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await actions.logout();
                router.replace('/sign-in');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to delete account');
      }
    } catch (error: any) {
      console.error('Account deletion error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete account. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#EF4444" />

      {/* Header */}
      <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Double tap to return to previous screen"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle}>Delete Account</ThemedText>

          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Warning Card */}
        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={24} color="#F59E0B" />
            <ThemedText style={styles.warningTitle}>Warning</ThemedText>
          </View>
          <ThemedText style={styles.warningText}>
            This action cannot be undone. Deleting your account will permanently remove all your data, 
            including your profile, settings, and account history.
          </ThemedText>
        </View>

        {/* What Will Be Deleted */}
        <View style={styles.deletionCard}>
          <ThemedText style={styles.deletionTitle}>What will be deleted:</ThemedText>
          <View style={styles.deletionList}>
            <View style={styles.deletionItem}>
              <Ionicons name="trash" size={16} color="#EF4444" />
              <ThemedText style={styles.deletionText}>Your profile and personal information</ThemedText>
            </View>
            <View style={styles.deletionItem}>
              <Ionicons name="trash" size={16} color="#EF4444" />
              <ThemedText style={styles.deletionText}>All your settings and preferences</ThemedText>
            </View>
            <View style={styles.deletionItem}>
              <Ionicons name="trash" size={16} color="#EF4444" />
              <ThemedText style={styles.deletionText}>Your account history and data</ThemedText>
            </View>
            <View style={styles.deletionItem}>
              <Ionicons name="trash" size={16} color="#EF4444" />
              <ThemedText style={styles.deletionText}>Access to all app features</ThemedText>
            </View>
          </View>
        </View>

        {/* Confirmation Input */}
        <View style={styles.confirmationContainer}>
          <ThemedText style={styles.confirmationLabel}>
            To confirm, type <ThemedText style={styles.requiredText}>{requiredText}</ThemedText> in the box below:
          </ThemedText>
          <TextInput
            style={styles.confirmationInput}
            value={confirmationText}
            onChangeText={setConfirmationText}
            placeholder={`Type "${requiredText}" here`}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            autoCorrect={false}
            accessibilityLabel="Delete account confirmation"
            accessibilityHint={`Type the word ${requiredText} to confirm account deletion`}
          />
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={[
            styles.deleteButton,
            (confirmationText !== requiredText || isLoading) && styles.deleteButtonDisabled
          ]}
          onPress={handleDeleteAccount}
          disabled={confirmationText !== requiredText || isLoading}
          accessibilityRole="button"
          accessibilityLabel="Delete my account permanently"
          accessibilityHint="Double tap to permanently delete your account. This action cannot be undone"
          accessibilityState={{ disabled: confirmationText !== requiredText || isLoading }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="trash" size={20} color="white" />
              <ThemedText style={styles.deleteButtonText}>Delete Account</ThemedText>
            </>
          )}
        </TouchableOpacity>

        {/* Alternative Options */}
        <View style={styles.alternativesCard}>
          <ThemedText style={styles.alternativesTitle}>Before you go...</ThemedText>
          <ThemedText style={styles.alternativesText}>
            Consider these alternatives to deleting your account:
          </ThemedText>
          <View style={styles.alternativesList}>
            <TouchableOpacity
              style={styles.alternativeItem}
              onPress={() => router.push('/account/settings')}
              accessibilityRole="button"
              accessibilityLabel="Update your privacy settings"
              accessibilityHint="Double tap to adjust your account privacy settings instead of deleting"
            >
              <Ionicons name="settings" size={16} color="#8B5CF6" />
              <ThemedText style={styles.alternativeText}>Update your privacy settings</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.alternativeItem}
              onPress={() => router.push('/account/notifications')}
              accessibilityRole="button"
              accessibilityLabel="Disable notifications"
              accessibilityHint="Double tap to turn off notifications instead of deleting your account"
            >
              <Ionicons name="notifications-off" size={16} color="#8B5CF6" />
              <ThemedText style={styles.alternativeText}>Disable notifications</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.alternativeItem}
              onPress={() => router.push('/support')}
              accessibilityRole="button"
              accessibilityLabel="Contact support for help"
              accessibilityHint="Double tap to get help from our support team"
            >
              <Ionicons name="help-circle" size={16} color="#8B5CF6" />
              <ThemedText style={styles.alternativeText}>Contact support for help</ThemedText>
            </TouchableOpacity>
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
  warningCard: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  deletionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  deletionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  deletionList: {
    gap: 8,
  },
  deletionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deletionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  confirmationContainer: {
    marginBottom: 24,
  },
  confirmationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  requiredText: {
    fontWeight: '700',
    color: '#EF4444',
  },
  confirmationInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  deleteButtonDisabled: {
    backgroundColor: '#FCA5A5',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  alternativesCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  alternativesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  alternativesText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  alternativesList: {
    gap: 8,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  alternativeText: {
    fontSize: 14,
    color: '#8B5CF6',
    marginLeft: 8,
  },
  footer: {
    height: 20,
  },
});
