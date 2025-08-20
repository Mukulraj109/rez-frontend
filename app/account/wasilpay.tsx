// RezPay Settings Screen
// Manage RezPay wallet, payment methods, and transaction settings

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
  const [wasilPaySettings, setRezPaySettings] = useState<RezPaySettings>({
    autoPayEnabled: true,
    biometricEnabled: false,
    transactionLimits: {
      daily: 5000,
      weekly: 25000,
      monthly: 100000,
    },
    notifications: {
      transactions: true,
      lowBalance: true,
      promotions: false,
    },
  });

  const handleBackPress = () => {
    router.back();
  };

  const toggleAutoPay = () => {
    setRezPaySettings(prev => ({
      ...prev,
      autoPayEnabled: !prev.autoPayEnabled
    }));
  };

  const toggleBiometric = () => {
    setRezPaySettings(prev => ({
      ...prev,
      biometricEnabled: !prev.biometricEnabled
    }));
  };

  const toggleNotification = (type: keyof RezPaySettings['notifications']) => {
    setRezPaySettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
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
  };

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'Choose a payment method to add',
      [
        { text: 'Credit/Debit Card' },
        { text: 'Bank Account' },
        { text: 'UPI' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

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
          
          <ThemedText style={styles.headerTitle}>RezPay Settings</ThemedText>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
              
              <ThemedText style={styles.walletBalance}>₹2,384</ThemedText>
              <ThemedText style={styles.walletSubtitle}>Available Balance</ThemedText>
              
              <View style={styles.walletActions}>
                <TouchableOpacity style={styles.walletAction}>
                  <Ionicons name="add-circle" size={16} color="white" />
                  <ThemedText style={styles.walletActionText}>Add Money</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.walletAction}>
                  <Ionicons name="send" size={16} color="white" />
                  <ThemedText style={styles.walletActionText}>Send</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.walletAction}>
                  <Ionicons name="time" size={16} color="white" />
                  <ThemedText style={styles.walletActionText}>History</ThemedText>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
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
                value={wasilPaySettings.autoPayEnabled}
                onValueChange={toggleAutoPay}
                trackColor={{ false: ACCOUNT_COLORS.border, true: ACCOUNT_COLORS.primary + '40' }}
                thumbColor={wasilPaySettings.autoPayEnabled ? ACCOUNT_COLORS.primary : '#f4f3f4'}
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
                value={wasilPaySettings.biometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: ACCOUNT_COLORS.border, true: ACCOUNT_COLORS.primary + '40' }}
                thumbColor={wasilPaySettings.biometricEnabled ? ACCOUNT_COLORS.primary : '#f4f3f4'}
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
              onPress={() => handleLimitEdit('Daily', wasilPaySettings.transactionLimits.daily)}
            >
              <View style={styles.limitLeft}>
                <Ionicons name="calendar" size={18} color={ACCOUNT_COLORS.primary} />
                <ThemedText style={styles.limitTitle}>Daily Limit</ThemedText>
              </View>
              <View style={styles.limitRight}>
                <ThemedText style={styles.limitAmount}>
                  ₹{wasilPaySettings.transactionLimits.daily.toLocaleString()}
                </ThemedText>
                <Ionicons name="chevron-forward" size={16} color={ACCOUNT_COLORS.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.limitItem}
              onPress={() => handleLimitEdit('Weekly', wasilPaySettings.transactionLimits.weekly)}
            >
              <View style={styles.limitLeft}>
                <Ionicons name="calendar-outline" size={18} color={ACCOUNT_COLORS.primary} />
                <ThemedText style={styles.limitTitle}>Weekly Limit</ThemedText>
              </View>
              <View style={styles.limitRight}>
                <ThemedText style={styles.limitAmount}>
                  ₹{wasilPaySettings.transactionLimits.weekly.toLocaleString()}
                </ThemedText>
                <Ionicons name="chevron-forward" size={16} color={ACCOUNT_COLORS.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.limitItem}
              onPress={() => handleLimitEdit('Monthly', wasilPaySettings.transactionLimits.monthly)}
            >
              <View style={styles.limitLeft}>
                <Ionicons name="stats-chart" size={18} color={ACCOUNT_COLORS.primary} />
                <ThemedText style={styles.limitTitle}>Monthly Limit</ThemedText>
              </View>
              <View style={styles.limitRight}>
                <ThemedText style={styles.limitAmount}>
                  ₹{wasilPaySettings.transactionLimits.monthly.toLocaleString()}
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
          
          <View style={styles.paymentMethodsList}>
            <View style={styles.paymentMethod}>
              <View style={styles.paymentMethodIcon}>
                <Ionicons name="card" size={20} color={ACCOUNT_COLORS.primary} />
              </View>
              <View style={styles.paymentMethodText}>
                <ThemedText style={styles.paymentMethodTitle}>Visa **** 4242</ThemedText>
                <ThemedText style={styles.paymentMethodSubtitle}>Expires 12/26</ThemedText>
              </View>
              <View style={styles.defaultBadge}>
                <ThemedText style={styles.defaultBadgeText}>Default</ThemedText>
              </View>
            </View>

            <View style={styles.paymentMethod}>
              <View style={styles.paymentMethodIcon}>
                <Ionicons name="phone-portrait" size={20} color={ACCOUNT_COLORS.info} />
              </View>
              <View style={styles.paymentMethodText}>
                <ThemedText style={styles.paymentMethodTitle}>UPI - user@okaxis</ThemedText>
                <ThemedText style={styles.paymentMethodSubtitle}>Linked to Axis Bank</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notifications</ThemedText>
          
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
                value={wasilPaySettings.notifications.transactions}
                onValueChange={() => toggleNotification('transactions')}
                trackColor={{ false: ACCOUNT_COLORS.border, true: ACCOUNT_COLORS.primary + '40' }}
                thumbColor={wasilPaySettings.notifications.transactions ? ACCOUNT_COLORS.primary : '#f4f3f4'}
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
                value={wasilPaySettings.notifications.lowBalance}
                onValueChange={() => toggleNotification('lowBalance')}
                trackColor={{ false: ACCOUNT_COLORS.border, true: ACCOUNT_COLORS.warning + '40' }}
                thumbColor={wasilPaySettings.notifications.lowBalance ? ACCOUNT_COLORS.warning : '#f4f3f4'}
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
                value={wasilPaySettings.notifications.promotions}
                onValueChange={() => toggleNotification('promotions')}
                trackColor={{ false: ACCOUNT_COLORS.border, true: ACCOUNT_COLORS.secondary + '40' }}
                thumbColor={wasilPaySettings.notifications.promotions ? ACCOUNT_COLORS.secondary : '#f4f3f4'}
              />
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
  },
  limitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    marginLeft: 12,
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
});