/**
 * Mobile Recharge Page
 * Allows users to recharge mobile, DTH, etc. with cashback
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

const OPERATORS = [
  { id: 'jio', name: 'Jio', color: '#0A2463' },
  { id: 'airtel', name: 'Airtel', color: '#ED1C24' },
  { id: 'vi', name: 'Vi', color: '#EE4B2B' },
  { id: 'bsnl', name: 'BSNL', color: '#00529C' },
];

const QUICK_AMOUNTS = ['99', '149', '199', '299', '399', '499', '599', '699'];

const POPULAR_PLANS = [
  { amount: 199, data: '1.5GB/day', validity: '28 days', calls: 'Unlimited', cashback: 10 },
  { amount: 299, data: '2GB/day', validity: '28 days', calls: 'Unlimited', cashback: 12 },
  { amount: 399, data: '2.5GB/day', validity: '56 days', calls: 'Unlimited', cashback: 15 },
  { amount: 599, data: '3GB/day', validity: '84 days', calls: 'Unlimited', cashback: 18 },
];

export default function RechargePage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialAmount = params.amount as string || '';

  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [amount, setAmount] = useState(initialAmount);
  const [selectedPlan, setSelectedPlan] = useState<typeof POPULAR_PLANS[0] | null>(null);

  const handleProceed = () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      return;
    }
    router.push(`/payment?type=recharge&amount=${amount}&mobile=${mobileNumber}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mobile Recharge</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cashback Banner */}
        <View style={styles.cashbackBanner}>
          <LinearGradient
            colors={['rgba(0, 192, 106, 0.15)', 'rgba(251, 191, 36, 0.15)']}
            style={styles.cashbackGradient}
          >
            <Ionicons name="gift" size={24} color={COLORS.primaryGold} />
            <View style={styles.cashbackText}>
              <Text style={styles.cashbackTitle}>Get up to 20% Cashback</Text>
              <Text style={styles.cashbackSubtitle}>+ Earn ReZ Coins on every recharge</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Mobile Number */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mobile Number</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit mobile number"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="phone-pad"
              maxLength={10}
              value={mobileNumber}
              onChangeText={setMobileNumber}
            />
            {mobileNumber.length === 10 && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primaryGreen} />
            )}
          </View>
        </View>

        {/* Operator Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Operator</Text>
          <View style={styles.operatorsGrid}>
            {OPERATORS.map((op) => (
              <TouchableOpacity
                key={op.id}
                style={[
                  styles.operatorCard,
                  selectedOperator === op.id && styles.operatorCardActive,
                ]}
                onPress={() => setSelectedOperator(op.id)}
              >
                <View style={[styles.operatorIcon, { backgroundColor: op.color + '20' }]}>
                  <Text style={[styles.operatorInitial, { color: op.color }]}>
                    {op.name[0]}
                  </Text>
                </View>
                <Text style={styles.operatorName}>{op.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Amounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Recharge</Text>
          <View style={styles.amountsGrid}>
            {QUICK_AMOUNTS.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[
                  styles.amountCard,
                  amount === amt && styles.amountCardActive,
                ]}
                onPress={() => {
                  setAmount(amt);
                  setSelectedPlan(null);
                }}
              >
                <Text style={[styles.amountText, amount === amt && styles.amountTextActive]}>
                  ₹{amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Or Enter Amount</Text>
          <View style={styles.customAmountContainer}>
            <Text style={styles.rupeeSymbol}>₹</Text>
            <TextInput
              style={styles.customAmountInput}
              placeholder="Enter amount"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="number-pad"
              value={amount}
              onChangeText={(val) => {
                setAmount(val);
                setSelectedPlan(null);
              }}
            />
          </View>
        </View>

        {/* Popular Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Plans</Text>
          <View style={styles.plansList}>
            {POPULAR_PLANS.map((plan, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.planCard,
                  selectedPlan?.amount === plan.amount && styles.planCardActive,
                ]}
                onPress={() => {
                  setSelectedPlan(plan);
                  setAmount(plan.amount.toString());
                }}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planAmount}>₹{plan.amount}</Text>
                  <View style={styles.planCashback}>
                    <Text style={styles.planCashbackText}>{plan.cashback}% cashback</Text>
                  </View>
                </View>
                <View style={styles.planDetails}>
                  <View style={styles.planDetail}>
                    <Ionicons name="cellular-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.planDetailText}>{plan.data}</Text>
                  </View>
                  <View style={styles.planDetail}>
                    <Ionicons name="call-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.planDetailText}>{plan.calls}</Text>
                  </View>
                  <View style={styles.planDetail}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.planDetailText}>{plan.validity}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      {amount && (
        <View style={styles.bottomCta}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>₹{amount}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.proceedButton,
              (!mobileNumber || mobileNumber.length !== 10) && styles.proceedButtonDisabled,
            ]}
            onPress={handleProceed}
            disabled={!mobileNumber || mobileNumber.length !== 10}
          >
            <Text style={styles.proceedButtonText}>Proceed to Pay</Text>
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
  cashbackBanner: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cashbackGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  cashbackText: {
    flex: 1,
  },
  cashbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  cashbackSubtitle: {
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 14,
  },
  operatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  operatorCard: {
    width: '23%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  operatorCardActive: {
    borderColor: COLORS.primaryGreen,
  },
  operatorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  operatorInitial: {
    fontSize: 20,
    fontWeight: '700',
  },
  operatorName: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  amountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amountCard: {
    width: '23%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  amountCardActive: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  amountTextActive: {
    color: COLORS.primaryGreen,
  },
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  rupeeSymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  customAmountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingVertical: 14,
  },
  plansList: {
    gap: 12,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardActive: {
    borderColor: COLORS.primaryGreen,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  planCashback: {
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planCashbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  planDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  planDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planDetailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  bottomCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalSection: {},
  totalLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  proceedButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
