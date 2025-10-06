// RezPay Settings Screen
// Manage RezPay wallet, payment methods, and transaction settings

import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ACCOUNT_COLORS } from '@/types/account.types';
import { useWallet } from '@/hooks/useWallet';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import walletApi, { TransactionResponse } from '@/services/walletApi';
import TopupModal from '@/components/wallet/TopupModal';
import SendMoneyModal from '@/components/wallet/SendMoneyModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RezPaySettings {
  autoPayEnabled: boolean;
  biometricEnabled: boolean;
  transactionLimits: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  notifications: {
    transactions: boolean;
    lowBalance: boolean;
    promotions: boolean;
  };
}

export default function RezPaySettingsScreen() {
  const router = useRouter();

  // Wallet data from backend API
  const { walletState, fetchWallet, refreshWallet, clearError } = useWallet({
    autoFetch: true
  });

  // Payment methods from backend
  const {
    paymentMethods,
    isLoading: paymentMethodsLoading,
    refetch: refetchPaymentMethods,
    defaultPaymentMethod
  } = usePaymentMethods(true);

  // Recent transactions state
  const [recentTransactions, setRecentTransactions] = useState<TransactionResponse[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(0);

  // Settings update loading state
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Daily spending limits from backend
  const [dailyLimitInfo, setDailyLimitInfo] = useState<{
    limit: number;
    spent: number;
    remaining: number;
  } | null>(null);

  // Modal states
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showSendMoneyModal, setShowSendMoneyModal] = useState(false);

  // Local settings (some synced with backend, some frontend-only)
  const [localSettings, setLocalSettings] = useState<RezPaySettings>({
    autoPayEnabled: false,
    biometricEnabled: false,
    transactionLimits: {
      daily: 10000, // Default, will be overridden by backend
      weekly: 50000,
      monthly: 200000,
    },
    notifications: {
      transactions: true,
      lowBalance: true,
      promotions: false,
    },
  });

  // Fetch wallet limits and spending info
  const fetchWalletLimits = async () => {
    try {
      const response = await walletApi.getBalance();
      if (response.success && response.data) {
        const limits = response.data.limits;
        setDailyLimitInfo({
          limit: limits.dailySpendLimit,
          spent: limits.dailySpentToday,
          remaining: limits.remainingToday
        });

        // Update local settings with backend limit
        setLocalSettings(prev => ({
          ...prev,
          transactionLimits: {
            daily: limits.dailySpendLimit,
            weekly: prev.transactionLimits.weekly,
            monthly: prev.transactionLimits.monthly,
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching wallet limits:', error);
    }
  };

  // Fetch recent transactions
  const fetchRecentTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const response = await walletApi.getTransactions({ limit: 3, page: 1 });
      if (response.success && response.data) {
        setRecentTransactions(response.data.transactions || []);
        setTransactionCount(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Load persisted notification preferences on mount
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem('wasilpay_notification_prefs');
        if (stored) {
          const prefs = JSON.parse(stored);
          setLocalSettings(prev => ({
            ...prev,
            notifications: {
              ...prev.notifications,
              transactions: prefs.transactions ?? prev.notifications.transactions,
              promotions: prefs.promotions ?? prev.notifications.promotions,
            }
          }));
        }
      } catch (error) {
        console.error('Error loading notification prefs:', error);
      }
    };
    loadNotificationSettings();
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchRecentTransactions();
    fetchWalletLimits();
  }, []);

  // Sync backend wallet settings to local state when wallet data loads
  useEffect(() => {
    if (walletState.data) {
      // Map backend settings to local state
      setLocalSettings(prev => ({
        ...prev,
        transactionLimits: {
          daily: walletState.data!.totalBalance || prev.transactionLimits.daily,
          weekly: prev.transactionLimits.weekly, // Backend doesn't have weekly/monthly yet
          monthly: prev.transactionLimits.monthly,
        }
      }));
    }
  }, [walletState.data]);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/account' as any);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      refreshWallet(),
      refetchPaymentMethods(),
      fetchRecentTransactions(),
      fetchWalletLimits()
    ]);
  };

  const handleHistoryPress = () => {
    router.push('/transactions' as any);
  };

  const toggleAutoPay = async () => {
    const newValue = !localSettings.autoPayEnabled;

    // Optimistic update
    setLocalSettings(prev => ({
      ...prev,
      autoPayEnabled: newValue
    }));

    setUpdatingSettings(true);
    try {
      const response = await walletApi.updateSettings({
        autoTopup: newValue
      });

      if (response.success) {
        // Success - wallet will be refreshed
        await fetchWallet();
      } else {
        // Revert on error
        setLocalSettings(prev => ({
          ...prev,
          autoPayEnabled: !newValue
        }));
        Alert.alert('Error', response.error || 'Failed to update auto-pay setting');
      }
    } catch (error) {
      // Revert on error
      setLocalSettings(prev => ({
        ...prev,
        autoPayEnabled: !newValue
      }));
      Alert.alert('Error', 'Failed to update auto-pay setting');
    } finally {
      setUpdatingSettings(false);
    }
  };

  const toggleBiometric = () => {
    setLocalSettings(prev => ({
      ...prev,
      biometricEnabled: !prev.biometricEnabled
    }));
    // Frontend-only setting (device security)
  };

  const toggleNotification = async (type: keyof RezPaySettings['notifications']) => {
    const newValue = !localSettings.notifications[type];

    // Optimistic update
    setLocalSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: newValue
      }
    }));

    // Only lowBalance is synced with backend wallet settings
    if (type === 'lowBalance') {
      setUpdatingSettings(true);
      try {
        const response = await walletApi.updateSettings({
          lowBalanceAlert: newValue
        });

        if (response.success) {
          await fetchWallet();
        } else {
          // Revert on error
          setLocalSettings(prev => ({
            ...prev,
            notifications: {
              ...prev.notifications,
              [type]: !newValue
            }
          }));
          Alert.alert('Error', response.error || 'Failed to update notification setting');
        }
      } catch (error) {
        // Revert on error
        setLocalSettings(prev => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            [type]: !newValue
          }
        }));
        Alert.alert('Error', 'Failed to update notification setting');
      } finally {
        setUpdatingSettings(false);
      }
    } else {
      // Persist transactions and promotions to AsyncStorage (frontend-only settings)
      try {
        const currentPrefs = {
          transactions: type === 'transactions' ? newValue : localSettings.notifications.transactions,
          promotions: type === 'promotions' ? newValue : localSettings.notifications.promotions,
        };
        await AsyncStorage.setItem('wasilpay_notification_prefs', JSON.stringify(currentPrefs));
      } catch (error) {
        console.error('Error saving notification prefs:', error);
        // Revert on error
        setLocalSettings(prev => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            [type]: !newValue
          }
        }));
        Alert.alert('Error', 'Failed to save notification preference');
      }
    }
  };

  const handleLimitEdit = (type: string, currentLimit: number) => {
    Alert.alert(
      `Edit ${type} Limit`,
      `Current limit: ₹${currentLimit.toLocaleString()}`,
      [
        { text: 'Cancel' },
        { text: 'Edit', onPress: () => console.log(`Edit ${type} limit`) }
      ]
    );
    // TODO: Update transaction limits via backend API
  };

  const handleAddPaymentMethod = () => {
    router.push('/account/payment-methods' as any);
  };

  const handlePaymentMethodPress = (methodId: string) => {
    router.push('/account/payment-methods' as any);
  };

  const handleTopupSuccess = async (amount: number) => {
    // Refresh wallet balance after successful topup
    await fetchWallet();
    await fetchWalletLimits();
    await fetchRecentTransactions();
  };

  const handleSendMoneySuccess = async (amount: number, recipient: string) => {
    // Refresh wallet balance after successful transfer
    await fetchWallet();
    await fetchWalletLimits();
    await fetchRecentTransactions();
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
          
          <ThemedText style={styles.headerTitle}>RezPay Settings</ThemedText>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={walletState.isRefreshing}
            onRefresh={handleRefresh}
            tintColor={ACCOUNT_COLORS.primary}
            colors={[ACCOUNT_COLORS.primary]}
          />
        }
      >
        {/* Error State */}
        {walletState.error && (
          <View style={styles.errorContainer}>
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle" size={24} color={ACCOUNT_COLORS.error} />
              <ThemedText style={styles.errorText}>
                {walletState.error.message}
              </ThemedText>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchWallet}
              >
                <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Wallet Overview */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Wallet Overview</ThemedText>

          <View style={styles.walletCard}>
            <LinearGradient
              colors={[ACCOUNT_COLORS.primary, ACCOUNT_COLORS.primaryLight]}
              style={styles.walletGradient}
            >
              <View style={styles.walletHeader}>
                <ThemedText style={styles.walletTitle}>RezPay Balance</ThemedText>
                <Ionicons name="wallet" size={24} color="white" />
              </View>

              {walletState.isLoading && !walletState.data ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="white" />
                  <ThemedText style={styles.loadingText}>Loading balance...</ThemedText>
                </View>
              ) : (
                <>
                  <ThemedText style={styles.walletBalance}>
                    ₹{walletState.data?.totalBalance?.toLocaleString() || '0'}
                  </ThemedText>
                  <ThemedText style={styles.walletSubtitle}>Available Balance</ThemedText>
                </>
              )}
              
              <View style={styles.walletActions}>
                <TouchableOpacity
                  style={styles.walletAction}
                  onPress={() => setShowTopupModal(true)}
                >
                  <Ionicons name="add-circle" size={16} color="white" />
                  <ThemedText style={styles.walletActionText}>Add Money</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.walletAction}
                  onPress={() => setShowSendMoneyModal(true)}
                >
                  <Ionicons name="send" size={16} color="white" />
                  <ThemedText style={styles.walletActionText}>Send</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.walletAction}
                  onPress={handleHistoryPress}
                >
                  <Ionicons name="time" size={16} color="white" />
                  <ThemedText style={styles.walletActionText}>History</ThemedText>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Recent Transactions */}
          {transactionsLoading ? (
            <View style={styles.transactionsLoading}>
              <ActivityIndicator size="small" color={ACCOUNT_COLORS.primary} />
            </View>
          ) : recentTransactions.length > 0 ? (
            <View style={styles.recentTransactionsCard}>
              <View style={styles.recentTransactionsHeader}>
                <ThemedText style={styles.recentTransactionsTitle}>
                  Recent Transactions
                </ThemedText>
                <TouchableOpacity onPress={handleHistoryPress}>
                  <ThemedText style={styles.viewAllLink}>
                    View All ({transactionCount})
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {recentTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={[
                    styles.transactionIcon,
                    transaction.type === 'credit'
                      ? styles.transactionIconCredit
                      : styles.transactionIconDebit
                  ]}>
                    <Ionicons
                      name={transaction.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                      size={16}
                      color={transaction.type === 'credit' ? ACCOUNT_COLORS.success : ACCOUNT_COLORS.error}
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <ThemedText style={styles.transactionDescription}>
                      {transaction.description}
                    </ThemedText>
                    <ThemedText style={styles.transactionDate}>
                      {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[
                      styles.transactionAmount,
                      transaction.type === 'credit'
                        ? styles.transactionAmountCredit
                        : styles.transactionAmountDebit
                    ]}
                  >
                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Security & Privacy</ThemedText>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="flash" size={20} color={ACCOUNT_COLORS.primary} />
                <View style={styles.settingText}>
                  <ThemedText style={styles.settingTitle}>Auto-Pay</ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Automatically pay from RezPay wallet
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={localSettings.autoPayEnabled}
                onValueChange={toggleAutoPay}
                trackColor={{ false: ACCOUNT_COLORS.border, true: ACCOUNT_COLORS.primary + '40' }}
                thumbColor={localSettings.autoPayEnabled ? ACCOUNT_COLORS.primary : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="finger-print" size={20} color={ACCOUNT_COLORS.primary} />
                <View style={styles.settingText}>
                  <ThemedText style={styles.settingTitle}>Biometric Authentication</ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Use fingerprint or face ID for payments
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={localSettings.biometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: ACCOUNT_COLORS.border, true: ACCOUNT_COLORS.primary + '40' }}
                thumbColor={localSettings.biometricEnabled ? ACCOUNT_COLORS.primary : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Transaction Limits */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Transaction Limits</ThemedText>
          
          <View style={styles.limitsCard}>
            <TouchableOpacity
              style={styles.limitItem}
              onPress={() => handleLimitEdit('Daily', localSettings.transactionLimits.daily)}
            >
              <View style={styles.limitLeft}>
                <Ionicons name="calendar" size={18} color={ACCOUNT_COLORS.primary} />
                <View style={styles.limitTextContainer}>
                  <ThemedText style={styles.limitTitle}>Daily Limit</ThemedText>
                  {dailyLimitInfo && (
                    <ThemedText style={styles.limitSubtext}>
                      Spent: ₹{dailyLimitInfo.spent.toLocaleString()} • Remaining: ₹{dailyLimitInfo.remaining.toLocaleString()}
                    </ThemedText>
                  )}
                </View>
              </View>
              <View style={styles.limitRight}>
                <ThemedText style={styles.limitAmount}>
                  ₹{localSettings.transactionLimits.daily.toLocaleString()}
                </ThemedText>
                <Ionicons name="chevron-forward" size={16} color={ACCOUNT_COLORS.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.limitItem}
              onPress={() => handleLimitEdit('Weekly', localSettings.transactionLimits.weekly)}
            >
              <View style={styles.limitLeft}>
                <Ionicons name="calendar-outline" size={18} color={ACCOUNT_COLORS.primary} />
                <ThemedText style={styles.limitTitle}>Weekly Limit</ThemedText>
              </View>
              <View style={styles.limitRight}>
                <ThemedText style={styles.limitAmount}>
                  ₹{localSettings.transactionLimits.weekly.toLocaleString()}
                </ThemedText>
                <Ionicons name="chevron-forward" size={16} color={ACCOUNT_COLORS.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.limitItem}
              onPress={() => handleLimitEdit('Monthly', localSettings.transactionLimits.monthly)}
            >
              <View style={styles.limitLeft}>
                <Ionicons name="stats-chart" size={18} color={ACCOUNT_COLORS.primary} />
                <ThemedText style={styles.limitTitle}>Monthly Limit</ThemedText>
              </View>
              <View style={styles.limitRight}>
                <ThemedText style={styles.limitAmount}>
                  ₹{localSettings.transactionLimits.monthly.toLocaleString()}
                </ThemedText>
                <Ionicons name="chevron-forward" size={16} color={ACCOUNT_COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Linked Payment Methods</ThemedText>
            <TouchableOpacity style={styles.addButton} onPress={handleAddPaymentMethod}>
              <Ionicons name="add" size={20} color={ACCOUNT_COLORS.primary} />
              <ThemedText style={styles.addButtonText}>Add</ThemedText>
            </TouchableOpacity>
          </View>

          {paymentMethodsLoading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color={ACCOUNT_COLORS.primary} />
              <ThemedText style={styles.loadingText}>Loading payment methods...</ThemedText>
            </View>
          ) : paymentMethods.length === 0 ? (
            <View style={styles.emptyPaymentMethods}>
              <Ionicons name="card-outline" size={48} color={ACCOUNT_COLORS.textSecondary} />
              <ThemedText style={styles.emptyTitle}>No Payment Methods</ThemedText>
              <ThemedText style={styles.emptyDescription}>
                Add a payment method to enable faster checkouts
              </ThemedText>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleAddPaymentMethod}
              >
                <ThemedText style={styles.emptyButtonText}>Add Payment Method</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.paymentMethodsList}>
              {paymentMethods.slice(0, 3).map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={styles.paymentMethod}
                  onPress={() => handlePaymentMethodPress(method.id)}
                >
                  <View style={styles.paymentMethodIcon}>
                    <Ionicons
                      name={
                        method.type === 'CARD'
                          ? 'card'
                          : method.type === 'UPI'
                          ? 'phone-portrait'
                          : method.type === 'BANK_ACCOUNT'
                          ? 'business'
                          : 'wallet'
                      }
                      size={20}
                      color={
                        method.type === 'CARD'
                          ? ACCOUNT_COLORS.primary
                          : method.type === 'UPI'
                          ? ACCOUNT_COLORS.info
                          : ACCOUNT_COLORS.success
                      }
                    />
                  </View>
                  <View style={styles.paymentMethodText}>
                    <ThemedText style={styles.paymentMethodTitle}>
                      {method.type === 'CARD' && method.card
                        ? `${method.card.brand} **** ${method.card.lastFourDigits}`
                        : method.type === 'UPI' && method.upi
                        ? method.upi.vpa
                        : method.type === 'BANK_ACCOUNT' && method.bankAccount
                        ? `${method.bankAccount.bankName}`
                        : 'Payment Method'}
                    </ThemedText>
                    <ThemedText style={styles.paymentMethodSubtitle}>
                      {method.type === 'CARD' && method.card
                        ? `Expires ${method.card.expiryMonth}/${method.card.expiryYear}`
                        : method.type === 'UPI' && method.upi
                        ? method.upi.nickname || 'UPI Payment'
                        : method.type === 'BANK_ACCOUNT' && method.bankAccount
                        ? `${method.bankAccount.accountType} Account`
                        : method.type}
                    </ThemedText>
                  </View>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <ThemedText style={styles.defaultBadgeText}>Default</ThemedText>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={16} color={ACCOUNT_COLORS.textSecondary} />
                </TouchableOpacity>
              ))}
              {paymentMethods.length > 3 && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={handleAddPaymentMethod}
                >
                  <ThemedText style={styles.viewAllText}>
                    View All ({paymentMethods.length})
                  </ThemedText>
                  <Ionicons name="arrow-forward" size={16} color={ACCOUNT_COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Notifications</ThemedText>
            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => router.push('/account/notifications' as any)}
            >
              <ThemedText style={styles.manageButtonText}>Manage All</ThemedText>
              <Ionicons name="chevron-forward" size={16} color={ACCOUNT_COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="receipt" size={20} color={ACCOUNT_COLORS.primary} />
                <View style={styles.settingText}>
                  <ThemedText style={styles.settingTitle}>Transaction Alerts</ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Get notified for all transactions
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={localSettings.notifications.transactions}
                onValueChange={() => toggleNotification('transactions')}
                trackColor={{ false: ACCOUNT_COLORS.border, true: ACCOUNT_COLORS.primary + '40' }}
                thumbColor={localSettings.notifications.transactions ? ACCOUNT_COLORS.primary : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="warning" size={20} color={ACCOUNT_COLORS.warning} />
                <View style={styles.settingText}>
                  <ThemedText style={styles.settingTitle}>Low Balance Alerts</ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Alert when balance is low
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={localSettings.notifications.lowBalance}
                onValueChange={() => toggleNotification('lowBalance')}
                trackColor={{ false: ACCOUNT_COLORS.border, true: ACCOUNT_COLORS.warning + '40' }}
                thumbColor={localSettings.notifications.lowBalance ? ACCOUNT_COLORS.warning : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="megaphone" size={20} color={ACCOUNT_COLORS.secondary} />
                <View style={styles.settingText}>
                  <ThemedText style={styles.settingTitle}>Promotional Offers</ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Receive offers and cashback alerts
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={localSettings.notifications.promotions}
                onValueChange={() => toggleNotification('promotions')}
                trackColor={{ false: ACCOUNT_COLORS.border, true: ACCOUNT_COLORS.secondary + '40' }}
                thumbColor={localSettings.notifications.promotions ? ACCOUNT_COLORS.secondary : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Footer Space */}
        <View style={styles.footer} />
      </ScrollView>

      {/* Topup Modal */}
      <TopupModal
        visible={showTopupModal}
        onClose={() => setShowTopupModal(false)}
        onSuccess={handleTopupSuccess}
        currentBalance={walletState.data?.totalBalance || 0}
      />

      {/* Send Money Modal */}
      <SendMoneyModal
        visible={showSendMoneyModal}
        onClose={() => setShowSendMoneyModal(false)}
        onSuccess={handleSendMoneySuccess}
        currentBalance={walletState.data?.totalBalance || 0}
      />
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
    marginBottom: 16,
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

  // Wallet Card
  walletCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: ACCOUNT_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  walletGradient: {
    padding: 20,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  walletBalance: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  walletSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  walletAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  walletActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginLeft: 4,
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

  // Limits
  limitsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: ACCOUNT_COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  limitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: ACCOUNT_COLORS.border,
  },
  limitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  limitTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  limitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
  },
  limitSubtext: {
    fontSize: 12,
    color: ACCOUNT_COLORS.textSecondary,
    marginTop: 4,
  },
  limitRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  limitAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: ACCOUNT_COLORS.primary,
    marginRight: 8,
  },

  // Payment Methods
  paymentMethodsList: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: ACCOUNT_COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: ACCOUNT_COLORS.border,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCOUNT_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodText: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    marginBottom: 2,
  },
  paymentMethodSubtitle: {
    fontSize: 13,
    color: ACCOUNT_COLORS.textSecondary,
  },
  defaultBadge: {
    backgroundColor: ACCOUNT_COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    textTransform: 'uppercase',
  },

  footer: {
    height: 40,
  },

  // Error States
  errorContainer: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACCOUNT_COLORS.error + '20',
  },
  errorText: {
    fontSize: 14,
    color: ACCOUNT_COLORS.error,
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: ACCOUNT_COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },

  // Loading States
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 12,
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: ACCOUNT_COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Empty States
  emptyPaymentMethods: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: ACCOUNT_COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: ACCOUNT_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: ACCOUNT_COLORS.primary,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },

  // View All Button
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: ACCOUNT_COLORS.surface,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCOUNT_COLORS.primary,
    marginRight: 8,
  },

  // Manage Button
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCOUNT_COLORS.primary,
  },

  // Recent Transactions
  transactionsLoading: {
    padding: 20,
    alignItems: 'center',
  },
  recentTransactionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: ACCOUNT_COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentTransactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTransactionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCOUNT_COLORS.primary,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ACCOUNT_COLORS.border,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconCredit: {
    backgroundColor: ACCOUNT_COLORS.success + '20',
  },
  transactionIconDebit: {
    backgroundColor: ACCOUNT_COLORS.error + '20',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: ACCOUNT_COLORS.text,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: ACCOUNT_COLORS.textSecondary,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  transactionAmountCredit: {
    color: ACCOUNT_COLORS.success,
  },
  transactionAmountDebit: {
    color: ACCOUNT_COLORS.error,
  },
});