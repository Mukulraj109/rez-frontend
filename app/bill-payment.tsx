/**
 * Bill Payment Page
 * Pay utility bills with cashback
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  primaryGreen: '#00C06A',
  primaryGold: '#F59E0B',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  background: '#F5F5F5',
  border: '#E5E7EB',
};

const BILL_TYPES = [
  { id: 'electricity', name: 'Electricity', icon: 'flash-outline', color: '#F59E0B' },
  { id: 'water', name: 'Water', icon: 'water-outline', color: '#3B82F6' },
  { id: 'gas', name: 'Gas', icon: 'flame-outline', color: '#EF4444' },
  { id: 'internet', name: 'Internet', icon: 'wifi-outline', color: '#8B5CF6' },
  { id: 'mobile', name: 'Mobile', icon: 'phone-portrait-outline', color: '#10B981' },
  { id: 'broadband', name: 'Broadband', icon: 'tv-outline', color: '#EC4899' },
  { id: 'dth', name: 'DTH', icon: 'radio-outline', color: '#06B6D4' },
  { id: 'landline', name: 'Landline', icon: 'call-outline', color: '#6366F1' },
];

const PROVIDERS: Record<string, { id: string; name: string }[]> = {
  electricity: [
    { id: 'tata-power', name: 'Tata Power' },
    { id: 'adani', name: 'Adani Electricity' },
    { id: 'bses', name: 'BSES' },
    { id: 'bescom', name: 'BESCOM' },
  ],
  water: [
    { id: 'delhi-jal', name: 'Delhi Jal Board' },
    { id: 'bmc', name: 'BMC Water' },
    { id: 'cwss', name: 'CWSS' },
  ],
  gas: [
    { id: 'igl', name: 'IGL' },
    { id: 'mgl', name: 'MGL' },
    { id: 'adani-gas', name: 'Adani Gas' },
  ],
  internet: [
    { id: 'jio-fiber', name: 'Jio Fiber' },
    { id: 'airtel', name: 'Airtel Xstream' },
    { id: 'act', name: 'ACT Fibernet' },
  ],
};

export default function BillPaymentPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialType = params.type as string || '';

  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [consumerNumber, setConsumerNumber] = useState('');
  const [fetchedBill, setFetchedBill] = useState<{ amount: number; dueDate: string } | null>(null);

  const handleFetchBill = () => {
    // Simulate fetching bill
    setFetchedBill({
      amount: Math.floor(Math.random() * 3000) + 500,
      dueDate: '25 Jan 2025',
    });
  };

  const handlePayBill = () => {
    if (!fetchedBill) return;
    router.push(`/payment?type=bill&billType=${selectedType}&amount=${fetchedBill.amount}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill Payments</Text>
        <TouchableOpacity onPress={() => router.push('/bill-history')}>
          <Ionicons name="time-outline" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cashback Banner */}
        <View style={styles.banner}>
          <LinearGradient
            colors={['rgba(0, 192, 106, 0.15)', 'rgba(251, 191, 36, 0.15)']}
            style={styles.bannerGradient}
          >
            <Ionicons name="gift" size={24} color={COLORS.primaryGold} />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Get 10% Cashback</Text>
              <Text style={styles.bannerSubtitle}>+ Earn ReZ Coins on every bill payment</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Bill Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Bill Type</Text>
          <View style={styles.billTypesGrid}>
            {BILL_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.billTypeCard,
                  selectedType === type.id && styles.billTypeCardActive,
                ]}
                onPress={() => {
                  setSelectedType(type.id);
                  setSelectedProvider('');
                  setFetchedBill(null);
                }}
              >
                <View style={[styles.billTypeIcon, { backgroundColor: type.color + '20' }]}>
                  <Ionicons name={type.icon as any} size={24} color={type.color} />
                </View>
                <Text style={styles.billTypeName}>{type.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Provider Selection */}
        {selectedType && PROVIDERS[selectedType] && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Provider</Text>
            <View style={styles.providersList}>
              {PROVIDERS[selectedType].map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={[
                    styles.providerCard,
                    selectedProvider === provider.id && styles.providerCardActive,
                  ]}
                  onPress={() => {
                    setSelectedProvider(provider.id);
                    setFetchedBill(null);
                  }}
                >
                  <View style={styles.providerIcon}>
                    <Ionicons
                      name={BILL_TYPES.find((t) => t.id === selectedType)?.icon as any}
                      size={20}
                      color={COLORS.primaryGreen}
                    />
                  </View>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  {selectedProvider === provider.id && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primaryGreen} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Consumer Number */}
        {selectedProvider && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consumer/Account Number</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your consumer number"
                placeholderTextColor={COLORS.textSecondary}
                value={consumerNumber}
                onChangeText={setConsumerNumber}
              />
              <TouchableOpacity
                style={[
                  styles.fetchButton,
                  !consumerNumber && styles.fetchButtonDisabled,
                ]}
                onPress={handleFetchBill}
                disabled={!consumerNumber}
              >
                <Text style={styles.fetchButtonText}>Fetch Bill</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Fetched Bill Details */}
        {fetchedBill && (
          <View style={styles.billCard}>
            <View style={styles.billHeader}>
              <Ionicons name="receipt-outline" size={24} color={COLORS.primaryGreen} />
              <Text style={styles.billTitle}>Bill Details</Text>
            </View>
            <View style={styles.billDetails}>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Consumer Number</Text>
                <Text style={styles.billValue}>{consumerNumber}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Due Date</Text>
                <Text style={styles.billValue}>{fetchedBill.dueDate}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Bill Amount</Text>
                <Text style={styles.billAmount}>₹{fetchedBill.amount.toLocaleString()}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Cashback</Text>
                <Text style={styles.billCashback}>
                  - ₹{Math.round(fetchedBill.amount * 0.1).toLocaleString()} (10%)
                </Text>
              </View>
              <View style={styles.billDivider} />
              <View style={styles.billRow}>
                <Text style={styles.billTotalLabel}>You Pay</Text>
                <Text style={styles.billTotal}>
                  ₹{Math.round(fetchedBill.amount * 0.9).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Bills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Bills</Text>
          <View style={styles.recentList}>
            {[
              { type: 'Electricity', provider: 'Tata Power', amount: 2450, paid: true },
              { type: 'Water', provider: 'Delhi Jal Board', amount: 890, paid: false },
              { type: 'Gas', provider: 'IGL', amount: 1200, paid: true },
            ].map((bill, index) => (
              <TouchableOpacity key={index} style={styles.recentCard}>
                <View style={styles.recentIcon}>
                  <Ionicons
                    name={BILL_TYPES.find((t) => t.name === bill.type)?.icon as any || 'receipt-outline'}
                    size={20}
                    color={COLORS.primaryGreen}
                  />
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentType}>{bill.type}</Text>
                  <Text style={styles.recentProvider}>{bill.provider}</Text>
                </View>
                <View style={styles.recentAmount}>
                  <Text style={styles.recentAmountText}>₹{bill.amount}</Text>
                  <View style={[styles.recentStatus, bill.paid && styles.recentStatusPaid]}>
                    <Text style={[styles.recentStatusText, bill.paid && styles.recentStatusTextPaid]}>
                      {bill.paid ? 'Paid' : 'Due'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      {fetchedBill && (
        <View style={styles.bottomCta}>
          <TouchableOpacity style={styles.payButton} onPress={handlePayBill}>
            <Text style={styles.payButtonText}>Pay ₹{Math.round(fetchedBill.amount * 0.9).toLocaleString()}</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
  },
  banner: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  billTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  billTypeCard: {
    width: '23%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  billTypeCardActive: {
    borderColor: COLORS.primaryGreen,
  },
  billTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  billTypeName: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  providersList: {
    gap: 8,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  providerCardActive: {
    borderColor: COLORS.primaryGreen,
  },
  providerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fetchButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  fetchButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  fetchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  billCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  billDetails: {
    gap: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  billValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  billAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  billCashback: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  billDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  billTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  billTotal: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  recentList: {
    gap: 8,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentInfo: {
    flex: 1,
  },
  recentType: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  recentProvider: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  recentAmount: {
    alignItems: 'flex-end',
  },
  recentAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  recentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  recentStatusPaid: {
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
  },
  recentStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
  },
  recentStatusTextPaid: {
    color: COLORS.primaryGreen,
  },
  bottomCta: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
});
