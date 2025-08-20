// Payment Settings Screen
// Manage payment methods, preferences, and security settings

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ACCOUNT_COLORS } from '@/types/account.types';

interface PaymentMethod {
  id: string;
  type: 'CARD' | 'BANK' | 'UPI' | 'WALLET';
  title: string;
  subtitle: string;
  icon: string;
  isDefault: boolean;
  isVerified: boolean;
}

interface PaymentPreferences {
  saveCards: boolean;
  autoFillCVV: boolean;
  biometricPayments: boolean;
  oneClickPayments: boolean;
  rememberPreference: boolean;
}

export default function PaymentSettingsScreen() {
  const router = useRouter();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'CARD',
      title: 'Visa **** 4242',
      subtitle: 'Expires 12/26',
      icon: 'card',
      isDefault: true,
      isVerified: true,
    },
    {
      id: '2',
      type: 'CARD',
      title: 'Mastercard **** 8765',
      subtitle: 'Expires 08/25',
      icon: 'card',
      isDefault: false,
      isVerified: true,
    },
    {
      id: '3',
      type: 'UPI',
      title: 'UPI - user@okaxis',
      subtitle: 'Linked to Axis Bank',
      icon: 'phone-portrait',
      isDefault: false,
      isVerified: true,
    },
    {
      id: '4',
      type: 'BANK',
      title: 'Axis Bank Account',
      subtitle: 'Account ending in 1234',
      icon: 'business',
      isDefault: false,
      isVerified: false,
    },
  ]);

  const [preferences, setPreferences] = useState<PaymentPreferences>({
    saveCards: true,
    autoFillCVV: false,
    biometricPayments: true,
    oneClickPayments: true,
    rememberPreference: true,
  });

  const handleBackPress = () => {
    router.back();
  };

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'Choose a payment method to add',
      [
        { text: 'Credit/Debit Card', onPress: () => console.log('Add card') },
        { text: 'Bank Account', onPress: () => console.log('Add bank') },
        { text: 'UPI', onPress: () => console.log('Add UPI') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
  };

  const handleDeleteMethod = (methodId: string, methodTitle: string) => {
    Alert.alert(
      'Delete Payment Method',
      `Are you sure you want to delete ${methodTitle}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
          }
        }
      ]
    );
  };

  const handleVerifyMethod = (methodId: string) => {
    Alert.alert(
      'Verify Payment Method',
      'Please verify your payment method to ensure secure transactions',
      [
        { text: 'Later' },
        { text: 'Verify Now', onPress: () => console.log('Verify method') }
      ]
    );
  };

  const togglePreference = (key: keyof PaymentPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'CARD': return 'card';
      case 'BANK': return 'business';
      case 'UPI': return 'phone-portrait';
      case 'WALLET': return 'wallet';
      default: return 'card';
    }
  };

  const getPaymentMethodColor = (type: string) => {
    switch (type) {
      case 'CARD': return ACCOUNT_COLORS.primary;
      case 'BANK': return ACCOUNT_COLORS.info;
      case 'UPI': return ACCOUNT_COLORS.secondary;
      case 'WALLET': return ACCOUNT_COLORS.warning;
      default: return ACCOUNT_COLORS.primary;
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <View key={method.id} style={styles.paymentMethodCard}>
      <View style={styles.paymentMethodHeader}>
        <View style={styles.paymentMethodLeft}>
          <View style={[
            styles.paymentMethodIcon,
            { backgroundColor: getPaymentMethodColor(method.type) + '15' }
          ]}>
            <Ionicons 
              name={getPaymentMethodIcon(method.type) as any} 
              size={20} 
              color={getPaymentMethodColor(method.type)} 
            />
          </View>
          
          <View style={styles.paymentMethodText}>
            <View style={styles.paymentMethodTitleRow}>
              <ThemedText style={styles.paymentMethodTitle}>
                {method.title}
              </ThemedText>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <ThemedText style={styles.defaultBadgeText}>Default</ThemedText>
                </View>
              )}
              {!method.isVerified && (
                <TouchableOpacity 
                  style={styles.verifyButton}
                  onPress={() => handleVerifyMethod(method.id)}
                >
                  <ThemedText style={styles.verifyButtonText}>Verify</ThemedText>
                </TouchableOpacity>
              )}
            </View>
            <ThemedText style={styles.paymentMethodSubtitle}>
              {method.subtitle}
            </ThemedText>
          </View>
        </View>

        <View style={styles.paymentMethodActions}>
          {method.isVerified && (
            <Ionicons name="checkmark-circle" size={20} color={ACCOUNT_COLORS.success} />
          )}
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={16} color={ACCOUNT_COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.paymentMethodFooter}>
        {!method.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(method.id)}
          >
            <ThemedText style={styles.actionButtonText}>Set as Default</ThemedText>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={() => handleDeleteMethod(method.id, method.title)}
        >
          <ThemedText style={[styles.actionButtonText, styles.dangerButtonText]}>Remove</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={ACCOUNT_COLORS.primary}
        translucent={true}
      />
      
      {/* Header */}
      <LinearGradient
        colors={[ACCOUNT_COLORS.primary, ACCOUNT_COLORS.primaryLight]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>Payment Settings</ThemedText>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Payment Methods</ThemedText>
            <TouchableOpacity style={styles.addButton} onPress={handleAddPaymentMethod}>
              <Ionicons name="add" size={20} color={ACCOUNT_COLORS.primary} />
              <ThemedText style={styles.addButtonText}>Add New</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.paymentMethodsList}>
            {paymentMethods.map(renderPaymentMethod)}
          </View>
        </View>

        {/* Payment Preferences */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Payment Preferences</ThemedText>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="save" size={20} color={ACCOUNT_COLORS.primary} />
                <View style={styles.settingText}>
                  <ThemedText style={styles.settingTitle}>Save Payment Methods</ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Securely save cards and payment info
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={preferences.saveCards}
                onValueChange={() => togglePreference('saveCards')}
                trackColor={{ false: ACCOUNT_COLORS.border, true: ACCOUNT_COLORS.primary + '40' }}
                thumbColor={preferences.saveCards ? ACCOUNT_COLORS.primary : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="finger-print" size={20} color={ACCOUNT_COLORS.primary} />
                <View style={styles.settingText}>
                  <ThemedText style={styles.settingTitle}>Biometric Payments</ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Use fingerprint or face ID for payments
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={preferences.biometricPayments}
                onValueChange={() => togglePreference('biometricPayments')}
                trackColor={{ false: ACCOUNT_COLORS.border, true: ACCOUNT_COLORS.primary + '40' }}
                thumbColor={preferences.biometricPayments ? ACCOUNT_COLORS.primary : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="flash" size={20} color={ACCOUNT_COLORS.primary} />
                <View style={styles.settingText}>
                  <ThemedText style={styles.settingTitle}>One-Click Payments</ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Skip payment confirmation for faster checkout
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={preferences.oneClickPayments}
                onValueChange={() => togglePreference('oneClickPayments')}
                trackColor={{ false: ACCOUNT_COLORS.border, true: ACCOUNT_COLORS.primary + '40' }}
                thumbColor={preferences.oneClickPayments ? ACCOUNT_COLORS.primary : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="shield-checkmark" size={20} color={ACCOUNT_COLORS.success} />
                <View style={styles.settingText}>
                  <ThemedText style={styles.settingTitle}>Auto-fill CVV</ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Automatically fill CVV for saved cards
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={preferences.autoFillCVV}
                onValueChange={() => togglePreference('autoFillCVV')}
                trackColor={{ false: ACCOUNT_COLORS.border, true: ACCOUNT_COLORS.success + '40' }}
                thumbColor={preferences.autoFillCVV ? ACCOUNT_COLORS.success : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Security Info */}
        <View style={styles.section}>
          <View style={styles.securityCard}>
            <View style={styles.securityIcon}>
              <Ionicons name="lock-closed" size={24} color={ACCOUNT_COLORS.primary} />
            </View>
            <View style={styles.securityContent}>
              <ThemedText style={styles.securityTitle}>Secure Payments</ThemedText>
              <ThemedText style={styles.securityDescription}>
                All payment information is encrypted and stored securely. We never store your CVV or PIN.
              </ThemedText>
              <View style={styles.securityFeatures}>
                <View style={styles.securityFeature}>
                  <Ionicons name="checkmark-circle" size={16} color={ACCOUNT_COLORS.success} />
                  <ThemedText style={styles.securityFeatureText}>256-bit SSL encryption</ThemedText>
                </View>
                <View style={styles.securityFeature}>
                  <Ionicons name="checkmark-circle" size={16} color={ACCOUNT_COLORS.success} />
                  <ThemedText style={styles.securityFeatureText}>PCI DSS compliant</ThemedText>
                </View>
                <View style={styles.securityFeature}>
                  <Ionicons name="checkmark-circle" size={16} color={ACCOUNT_COLORS.success} />
                  <ThemedText style={styles.securityFeatureText}>Two-factor authentication</ThemedText>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Footer Space */}
        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACCOUNT_COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 50 : 45,
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
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 16,
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
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ACCOUNT_COLORS.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: ACCOUNT_COLORS.primary + '15',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCOUNT_COLORS.primary,
    marginLeft: 4,
  },

  // Payment Methods
  paymentMethodsList: {
    gap: 12,
  },
  paymentMethodCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: ACCOUNT_COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodText: {
    flex: 1,
  },
  paymentMethodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    marginRight: 8,
  },
  paymentMethodSubtitle: {
    fontSize: 13,
    color: ACCOUNT_COLORS.textSecondary,
  },
  defaultBadge: {
    backgroundColor: ACCOUNT_COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  verifyButton: {
    backgroundColor: ACCOUNT_COLORS.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifyButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  paymentMethodActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreButton: {
    padding: 4,
    marginLeft: 8,
  },
  paymentMethodFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: ACCOUNT_COLORS.surface,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: ACCOUNT_COLORS.primary,
  },
  dangerButton: {
    backgroundColor: ACCOUNT_COLORS.error + '15',
  },
  dangerButtonText: {
    color: ACCOUNT_COLORS.error,
  },

  // Settings
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: ACCOUNT_COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: ACCOUNT_COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: ACCOUNT_COLORS.textSecondary,
    lineHeight: 18,
  },

  // Security Card
  securityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    shadowColor: ACCOUNT_COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  securityIcon: {
    marginRight: 16,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ACCOUNT_COLORS.text,
    marginBottom: 8,
  },
  securityDescription: {
    fontSize: 14,
    color: ACCOUNT_COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  securityFeatures: {
    gap: 6,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityFeatureText: {
    fontSize: 13,
    color: ACCOUNT_COLORS.text,
    marginLeft: 8,
    fontWeight: '500',
  },

  footer: {
    height: 40,
  },
});