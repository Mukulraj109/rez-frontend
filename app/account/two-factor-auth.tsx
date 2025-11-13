// Two-Factor Authentication Setup Page
// Manages 2FA setup and configuration

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useSecurity } from '@/contexts/SecurityContext';

type TwoFactorMethod = '2FA_SMS' | '2FA_EMAIL' | '2FA_APP';

interface TwoFactorOption {
  value: TwoFactorMethod;
  title: string;
  description: string;
  icon: string;
  color: string;
  available: boolean;
}

const TWO_FACTOR_OPTIONS: TwoFactorOption[] = [
  {
    value: '2FA_SMS',
    title: 'SMS',
    description: 'Receive verification codes via text message',
    icon: 'chatbubble-outline',
    color: '#10B981',
    available: true,
  },
  {
    value: '2FA_EMAIL',
    title: 'Email',
    description: 'Receive verification codes via email',
    icon: 'mail-outline',
    color: '#3B82F6',
    available: true,
  },
  {
    value: '2FA_APP',
    title: 'Authenticator App',
    description: 'Use Google Authenticator or similar app',
    icon: 'phone-portrait-outline',
    color: '#8B5CF6',
    available: true,
  },
];

export default function TwoFactorAuthPage() {
  const router = useRouter();
  const { 
    securitySettings, 
    updateSecuritySettings, 
    enableTwoFactorAuth, 
    disableTwoFactorAuth,
    generateBackupCodes,
    isLoading 
  } = useSecurity();
  
  const [selectedMethod, setSelectedMethod] = useState<TwoFactorMethod>('2FA_SMS');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const is2FAEnabled = securitySettings?.twoFactorAuth.enabled || false;
  const currentMethod = securitySettings?.twoFactorAuth.method || '2FA_SMS';

  const handleEnable2FA = async () => {
    try {
      setIsVerifying(true);
      
      // Generate backup codes
      const codes = generateBackupCodes();
      setBackupCodes(codes);
      
      // Enable 2FA
      const success = await enableTwoFactorAuth(selectedMethod);
      
      if (success) {
        setShowBackupCodes(true);
      }
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      Alert.alert('Error', 'Failed to enable two-factor authentication.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = () => {
    Alert.alert(
      'Disable Two-Factor Authentication',
      'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await disableTwoFactorAuth();
              if (success) {
                router.back();
              }
            } catch (error) {
              console.error('Failed to disable 2FA:', error);
              Alert.alert('Error', 'Failed to disable two-factor authentication.');
            }
          },
        },
      ]
    );
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code.');
      return;
    }

    try {
      setIsVerifying(true);
      
      // In a real app, you would verify the code with your backend
      // For demo purposes, we'll simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful verification
      Alert.alert(
        'Verification Successful',
        'Two-factor authentication has been enabled successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Verification failed:', error);
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const renderTwoFactorOption = (option: TwoFactorOption) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.optionCard,
        selectedMethod === option.value && styles.selectedOption,
        !option.available && styles.disabledOption,
      ]}
      onPress={() => option.available && setSelectedMethod(option.value)}
      activeOpacity={option.available ? 0.7 : 1}
      disabled={!option.available}
      accessibilityLabel={`${option.title}: ${option.description}${selectedMethod === option.value ? ', selected' : ''}`}
      accessibilityRole="radio"
      accessibilityState={{ checked: selectedMethod === option.value, disabled: !option.available }}
      accessibilityHint="Double tap to select this verification method"
    >
      <View style={styles.optionHeader}>
        <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
          <Ionicons name={option.icon as any} size={24} color={option.color} />
        </View>

        <View style={styles.optionInfo}>
          <ThemedText style={styles.optionTitle}>{option.title}</ThemedText>
          <ThemedText style={styles.optionDescription}>{option.description}</ThemedText>
        </View>

        {selectedMethod === option.value && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderBackupCodesModal = () => (
    <Modal
      visible={showBackupCodes}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <ThemedText style={styles.modalTitle}>Backup Codes</ThemedText>
          <TouchableOpacity
            onPress={() => setShowBackupCodes(false)}
            accessibilityLabel="Close backup codes modal"
            accessibilityRole="button"
            accessibilityHint="Double tap to close the backup codes screen"
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={24} color="#F59E0B" />
            <ThemedText style={styles.warningText}>
              Save these backup codes in a safe place. You can use them to access your account if you lose your phone.
            </ThemedText>
          </View>

          <View style={styles.codesContainer}>
            {backupCodes.map((code, index) => (
              <View key={index} style={styles.codeItem}>
                <ThemedText style={styles.codeText}>{code}</ThemedText>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => setShowBackupCodes(false)}
          >
            <ThemedText style={styles.continueButtonText}>I've Saved These Codes</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        <LinearGradient colors={['#8B5CF6', '#7C3AED'] as const} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Two-Factor Authentication</ThemedText>
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
      <LinearGradient colors={['#8B5CF6', '#7C3AED'] as const} style={styles.header}>
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

          <ThemedText style={styles.headerTitle}>Two-Factor Authentication</ThemedText>

          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Current Status */}
        <View style={styles.statusSection}>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Ionicons 
                name={is2FAEnabled ? "shield-checkmark" : "shield-outline"} 
                size={24} 
                color={is2FAEnabled ? "#10B981" : "#6B7280"} 
              />
              <ThemedText style={styles.statusTitle}>
                {is2FAEnabled ? 'Enabled' : 'Disabled'}
              </ThemedText>
            </View>
            <ThemedText style={styles.statusDescription}>
              {is2FAEnabled 
                ? `Two-factor authentication is enabled using ${currentMethod.replace('2FA_', '')}.`
                : 'Add an extra layer of security to your account.'
              }
            </ThemedText>
          </View>
        </View>

        {!is2FAEnabled ? (
          <>
            {/* Method Selection */}
            <View style={styles.methodSection}>
              <ThemedText style={styles.sectionTitle}>Choose Verification Method</ThemedText>
              {TWO_FACTOR_OPTIONS.map(renderTwoFactorOption)}
            </View>

            {/* Enable Button */}
            <TouchableOpacity
              style={styles.enableButton}
              onPress={handleEnable2FA}
              disabled={isVerifying}
              accessibilityLabel="Enable two-factor authentication"
              accessibilityRole="button"
              accessibilityState={{ disabled: isVerifying }}
              accessibilityHint="Double tap to enable two-factor authentication for your account"
            >
              <ThemedText style={styles.enableButtonText}>
                {isVerifying ? 'Setting up...' : 'Enable Two-Factor Authentication'}
              </ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Verification Code Input */}
            <View style={styles.verificationSection}>
              <ThemedText style={styles.sectionTitle}>Enter Verification Code</ThemedText>
              <View style={styles.codeInputContainer}>
                <TextInput
                  style={styles.codeInput}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholder="Enter 6-digit code"
                  keyboardType="numeric"
                  maxLength={6}
                  autoFocus
                  accessibilityLabel="Verification code"
                  accessibilityHint="Enter the 6-digit verification code"
                />
                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={handleVerifyCode}
                  disabled={isVerifying || !verificationCode.trim()}
                  accessibilityLabel="Verify code"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isVerifying || !verificationCode.trim() }}
                  accessibilityHint="Double tap to verify the entered code"
                >
                  <ThemedText style={styles.verifyButtonText}>
                    {isVerifying ? 'Verifying...' : 'Verify'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Disable Button */}
            <TouchableOpacity
              style={styles.disableButton}
              onPress={handleDisable2FA}
              accessibilityLabel="Disable two-factor authentication"
              accessibilityRole="button"
              accessibilityHint="Double tap to disable two-factor authentication for your account"
            >
              <ThemedText style={styles.disableButtonText}>Disable Two-Factor Authentication</ThemedText>
            </TouchableOpacity>
          </>
        )}

        {/* Information */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={20} color="#8B5CF6" />
              <ThemedText style={styles.infoTitle}>About Two-Factor Authentication</ThemedText>
            </View>
            <ThemedText style={styles.infoText}>
              Two-factor authentication adds an extra layer of security to your account. 
              You'll need to enter a verification code in addition to your password when signing in.
            </ThemedText>
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>

      {renderBackupCodesModal()}
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
  statusSection: {
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  statusDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  methodSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
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
  disabledOption: {
    opacity: 0.5,
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
  enableButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  enableButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  verificationSection: {
    marginBottom: 24,
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  codeInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginRight: 12,
  },
  verifyButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  disableButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  disableButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    marginLeft: 12,
    lineHeight: 20,
  },
  codesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  codeItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'monospace',
  },
  continueButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

