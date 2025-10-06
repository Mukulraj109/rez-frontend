// Payment Settings Screen
// Manage payment methods, preferences, and security settings

import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ACCOUNT_COLORS } from '@/types/account.types';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { PaymentMethod as APIPaymentMethod, PaymentMethodType, CardBrand } from '@/services/paymentMethodApi';
import { useUserSettings } from '@/hooks/useUserSettings';
import { PaymentPreferences as BackendPaymentPreferences } from '@/services/userSettingsApi';

// Local preferences interface for UI
interface LocalPaymentPreferences {
  saveCards: boolean;
  autoFillCVV: boolean;
  biometricPayments: boolean;
  oneClickPayments: boolean;
}

export default function PaymentSettingsScreen() {
  const router = useRouter();

  // Backend integration for payment methods
  const {
    paymentMethods,
    isLoading,
    error,
    refetch,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    defaultPaymentMethod,
  } = usePaymentMethods(true);

  // Backend integration for user settings (payment preferences)
  const {
    settings: userSettings,
    isLoading: settingsLoading,
    error: settingsError,
    updatePayment: updatePaymentPreferences,
  } = useUserSettings(true);

  // Local state for UI preferences
  const [preferences, setPreferences] = useState<LocalPaymentPreferences>({
    saveCards: true,
    autoFillCVV: false,
    biometricPayments: false,
    oneClickPayments: false,
  });

  // Track if preferences are being saved
  const [isSavingPreference, setIsSavingPreference] = useState(false);

  // Load preferences from backend settings
  useEffect(() => {
    if (userSettings?.payment) {
      const backendPrefs = userSettings.payment;
      setPreferences({
        saveCards: backendPrefs.autoPayEnabled ?? true,
        autoFillCVV: false, // Not in backend, keep local
        biometricPayments: backendPrefs.biometricPaymentEnabled ?? false,
        oneClickPayments: !backendPrefs.paymentPinEnabled ?? false,
      });
      console.log('[Payment Settings] Loaded preferences from backend:', backendPrefs);
    }
  }, [userSettings]);

  // Debug: Log payment methods when they change
  useEffect(() => {
    console.log('Payment methods updated:', {
      count: paymentMethods.length,
      methods: paymentMethods.map(pm => ({
        id: pm.id,
        type: pm.type,
        isDefault: pm.isDefault,
        hasId: !!pm.id
      }))
    });
  }, [paymentMethods]);

  // Refetch payment methods when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('[Payment Settings] Screen focused, refetching payment methods...');
      refetch();
    }, [refetch])
  );

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/account' as any);
    }
  };

  const handleAddPaymentMethod = () => {
    // Navigate to payment-methods page which has full add/edit functionality
    router.push('/account/payment-methods' as any);
  };

  const handleSetDefault = async (methodId: string) => {
    console.log('handleSetDefault called with ID:', methodId);

    if (!methodId) {
      if (Platform.OS === 'web') {
        window.alert('Invalid payment method ID. Please restart the app and try again.');
      } else {
        Alert.alert('Error', 'Invalid payment method ID. Please restart the app and try again.');
      }
      return;
    }

    const success = await setDefaultPaymentMethod(methodId);
    if (success) {
      // Refetch to update the UI with the new default
      await refetch();
      if (Platform.OS === 'web') {
        window.alert('Default payment method updated');
      } else {
        Alert.alert('Success', 'Default payment method updated');
      }
    } else {
      if (Platform.OS === 'web') {
        window.alert('Failed to set default payment method');
      } else {
        Alert.alert('Error', 'Failed to set default payment method');
      }
    }
  };

  const handleDeleteMethod = async (method: APIPaymentMethod) => {
    console.log('handleDeleteMethod called with method:', method);
    console.log('Method ID:', method.id);

    if (!method.id) {
      if (Platform.OS === 'web') {
        window.alert('Invalid payment method ID. Please restart the app and try again.');
      } else {
        Alert.alert('Error', 'Invalid payment method ID. Please restart the app and try again.');
      }
      return;
    }

    const methodName = method.type === PaymentMethodType.CARD && method.card
      ? `Card ending ${method.card.lastFourDigits}`
      : method.type === PaymentMethodType.UPI && method.upi
      ? method.upi.vpa
      : method.type === PaymentMethodType.BANK_ACCOUNT && method.bankAccount
      ? `Bank account ${method.bankAccount.bankName}`
      : 'Payment method';

    // Use window.confirm for web, Alert.alert for native
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to delete ${methodName}?`);

      if (!confirmed) {
        console.log('Delete cancelled by user');
        return;
      }

      console.log('Delete confirmed, deleting method ID:', method.id);

      try {
        const success = await deletePaymentMethod(method.id);
        console.log('Delete API response - success:', success);

        if (success) {
          console.log('Deletion successful, refetching payment methods...');
          // Refetch to update the UI
          await refetch();
          console.log('Refetch complete, payment methods count:', paymentMethods.length);
          window.alert('Payment method deleted successfully');
        } else {
          console.error('Deletion failed');
          window.alert('Failed to delete payment method');
        }
      } catch (error) {
        console.error('Error during deletion:', error);
        window.alert('An error occurred while deleting the payment method');
      }
    } else {
      // Native platform - use Alert.alert
      Alert.alert(
        'Delete Payment Method',
        `Are you sure you want to delete ${methodName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              console.log('Delete confirmed, deleting method ID:', method.id);

              try {
                const success = await deletePaymentMethod(method.id);
                console.log('Delete API response - success:', success);

                if (success) {
                  console.log('Deletion successful, refetching payment methods...');
                  await refetch();
                  console.log('Refetch complete, payment methods count:', paymentMethods.length);
                  Alert.alert('Success', 'Payment method deleted');
                } else {
                  console.error('Deletion failed');
                  Alert.alert('Error', 'Failed to delete payment method');
                }
              } catch (error) {
                console.error('Error during deletion:', error);
                Alert.alert('Error', 'An error occurred while deleting the payment method');
              }
            }
          }
        ]
      );
    }
  };

  const handleVerifyMethod = (methodId: string) => {
    console.log('handleVerifyMethod called with ID:', methodId);

    if (!methodId) {
      if (Platform.OS === 'web') {
        window.alert('Invalid payment method ID. Please restart the app and try again.');
      } else {
        Alert.alert('Error', 'Invalid payment method ID. Please restart the app and try again.');
      }
      return;
    }

    if (Platform.OS === 'web') {
      const verify = window.confirm('Please verify your payment method to ensure secure transactions. Verify now?');

      if (verify) {
        console.log('Verify method:', methodId);
        // TODO: Implement verification flow
        window.alert('Payment method verification will be available soon.');
      }
    } else {
      Alert.alert(
        'Verify Payment Method',
        'Please verify your payment method to ensure secure transactions',
        [
          { text: 'Later' },
          {
            text: 'Verify Now',
            onPress: () => {
              console.log('Verify method:', methodId);
              // TODO: Implement verification flow
              Alert.alert('Coming Soon', 'Payment method verification will be available soon.');
            }
          }
        ]
      );
    }
  };

  const togglePreference = async (key: keyof LocalPaymentPreferences) => {
    const newValue = !preferences[key];

    // Optimistic UI update
    setPreferences(prev => ({
      ...prev,
      [key]: newValue
    }));

    // Map local preferences to backend format
    const backendPreferences: Partial<BackendPaymentPreferences> = {
      autoPayEnabled: key === 'saveCards' ? newValue : preferences.saveCards,
      biometricPaymentEnabled: key === 'biometricPayments' ? newValue : preferences.biometricPayments,
      paymentPinEnabled: key === 'oneClickPayments' ? !newValue : !preferences.oneClickPayments,
    };

    console.log(`[Payment Settings] Saving ${key} = ${newValue} to backend...`);
    setIsSavingPreference(true);

    try {
      const updated = await updatePaymentPreferences(backendPreferences);

      if (updated) {
        console.log('[Payment Settings] Preference saved successfully');
        if (Platform.OS === 'web') {
          // Don't show alert for every toggle on web - it's annoying
        } else {
          // On mobile, could show a toast
        }
      } else {
        throw new Error('Failed to save preference');
      }
    } catch (error) {
      console.error('[Payment Settings] Error saving preference:', error);

      // Revert optimistic update on error
      setPreferences(prev => ({
        ...prev,
        [key]: !newValue
      }));

      if (Platform.OS === 'web') {
        window.alert(`Failed to save ${key} preference. Please try again.`);
      } else {
        Alert.alert('Error', `Failed to save ${key} preference. Please try again.`);
      }
    } finally {
      setIsSavingPreference(false);
    }
  };

  const getPaymentMethodIcon = (type: PaymentMethodType) => {
    switch (type) {
      case PaymentMethodType.CARD: return 'card';
      case PaymentMethodType.BANK_ACCOUNT: return 'business';
      case PaymentMethodType.UPI: return 'flash';
      default: return 'card';
    }
  };

  const getPaymentMethodColor = (type: PaymentMethodType) => {
    switch (type) {
      case PaymentMethodType.CARD: return ACCOUNT_COLORS.primary;
      case PaymentMethodType.BANK_ACCOUNT: return ACCOUNT_COLORS.info;
      case PaymentMethodType.UPI: return '#F59E0B';
      default: return ACCOUNT_COLORS.primary;
    }
  };

  const getPaymentMethodTitle = (method: APIPaymentMethod): string => {
    if (method.type === PaymentMethodType.CARD && method.card) {
      return `${method.card.brand} **** ${method.card.lastFourDigits}`;
    }
    if (method.type === PaymentMethodType.UPI && method.upi) {
      return `UPI - ${method.upi.vpa}`;
    }
    if (method.type === PaymentMethodType.BANK_ACCOUNT && method.bankAccount) {
      return method.bankAccount.bankName;
    }
    return 'Payment Method';
  };

  const getPaymentMethodSubtitle = (method: APIPaymentMethod): string => {
    if (method.type === PaymentMethodType.CARD && method.card) {
      return `Expires ${String(method.card.expiryMonth).padStart(2, '0')}/${String(method.card.expiryYear).slice(-2)}`;
    }
    if (method.type === PaymentMethodType.UPI && method.upi) {
      return method.upi.nickname || 'UPI Payment';
    }
    if (method.type === PaymentMethodType.BANK_ACCOUNT && method.bankAccount) {
      return `Account ending in ${method.bankAccount.accountNumber.slice(-4)}`;
    }
    return '';
  };

  const renderPaymentMethod = (method: APIPaymentMethod) => {
    console.log('Rendering payment method:', {
      id: method.id,
      type: method.type,
      isDefault: method.isDefault,
      hasId: !!method.id
    });

    const isVerified = method.type === PaymentMethodType.CARD && method.card
      ? true // Cards are verified by default
      : method.type === PaymentMethodType.UPI && method.upi
      ? method.upi.isVerified
      : method.type === PaymentMethodType.BANK_ACCOUNT && method.bankAccount
      ? method.bankAccount.isVerified
      : false;

    return (
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
                  {getPaymentMethodTitle(method)}
                </ThemedText>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <ThemedText style={styles.defaultBadgeText}>Default</ThemedText>
                  </View>
                )}
                {!isVerified && (
                  <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={() => handleVerifyMethod(method.id)}
                  >
                    <ThemedText style={styles.verifyButtonText}>Verify</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
              <ThemedText style={styles.paymentMethodSubtitle}>
                {getPaymentMethodSubtitle(method)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.paymentMethodActions}>
            {isVerified && (
              <Ionicons name="checkmark-circle" size={20} color={ACCOUNT_COLORS.success} />
            )}
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
            onPress={() => handleDeleteMethod(method)}
          >
            <ThemedText style={[styles.actionButtonText, styles.dangerButtonText]}>Remove</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ACCOUNT_COLORS.primary} />
          <ThemedText style={styles.loadingText}>Loading payment methods...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={ACCOUNT_COLORS.error} />
          <ThemedText style={styles.errorText}>Failed to load payment methods</ThemedText>
          {error && (
            <ThemedText style={styles.errorDetailText}>{error}</ThemedText>
          )}
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={ACCOUNT_COLORS.primary}
            />
          }
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

          {paymentMethods && paymentMethods.length > 0 ? (
            <View style={styles.paymentMethodsList}>
              {paymentMethods.map(renderPaymentMethod)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={48} color={ACCOUNT_COLORS.textSecondary} />
              <ThemedText style={styles.emptyStateText}>No payment methods saved</ThemedText>
              <ThemedText style={styles.emptyStateSubtext}>
                Add a payment method to make checkout faster
              </ThemedText>
            </View>
          )}
        </View>

        {/* Payment Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Payment Preferences</ThemedText>
            {isSavingPreference && (
              <View style={styles.savingIndicator}>
                <ActivityIndicator size="small" color={ACCOUNT_COLORS.primary} />
                <ThemedText style={styles.savingText}>Saving...</ThemedText>
              </View>
            )}
          </View>

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
                disabled={isSavingPreference}
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
                disabled={isSavingPreference}
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
                disabled={isSavingPreference}
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
                disabled={isSavingPreference}
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
              </View>
            </View>
          </View>
        </View>

          {/* Footer Space */}
          <View style={styles.footer} />
        </ScrollView>
      )}
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
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savingText: {
    fontSize: 12,
    color: ACCOUNT_COLORS.primary,
    fontWeight: '500',
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

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: ACCOUNT_COLORS.textSecondary,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDetailText: {
    fontSize: 12,
    color: ACCOUNT_COLORS.error,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: ACCOUNT_COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },

  // Empty State
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: ACCOUNT_COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});