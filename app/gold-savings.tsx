/**
 * Gold Savings Page
 * Buy, sell, and invest in digital gold
 */

import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
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

const QUICK_AMOUNTS = ['100', '500', '1000', '2000', '5000', '10000'];

export default function GoldSavingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('buy');
  const [amount, setAmount] = useState('');
  const [goldPrice, setGoldPrice] = useState(6150); // Price per gram
  const [goldBalance, setGoldBalance] = useState(2.45); // User's gold balance in grams

  const goldAmount = amount ? parseFloat(amount) / goldPrice : 0;

  const handleProceed = () => {
    if (!amount || parseFloat(amount) < 1) return;
    router.push(`/payment?type=gold&action=${activeTab}&amount=${amount}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Digital Gold</Text>
        <TouchableOpacity onPress={() => router.push('/gold-savings/history' as any)}>
          <Ionicons name="time-outline" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Gold Balance Card */}
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.balanceGradient}
          >
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Your Gold Balance</Text>
              <Ionicons name="diamond" size={24} color={COLORS.white} />
            </View>
            <Text style={styles.balanceAmount}>{goldBalance.toFixed(4)} gm</Text>
            <Text style={styles.balanceValue}>
              ₹{(goldBalance * goldPrice).toLocaleString()}
            </Text>
            <View style={styles.priceStrip}>
              <Text style={styles.priceLabel}>24K Gold Price</Text>
              <Text style={styles.priceValue}>₹{goldPrice}/gm</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Buy/Sell Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'buy' && styles.tabActive]}
            onPress={() => setActiveTab('buy')}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={activeTab === 'buy' ? COLORS.white : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'buy' && styles.tabTextActive]}>
              Buy Gold
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sell' && styles.tabActive]}
            onPress={() => setActiveTab('sell')}
          >
            <Ionicons
              name="remove-circle-outline"
              size={20}
              color={activeTab === 'sell' ? COLORS.white : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'sell' && styles.tabTextActive]}>
              Sell Gold
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'buy' ? 'Enter Amount to Buy' : 'Enter Amount to Sell'}
          </Text>
          <View style={styles.inputContainer}>
            <Text style={styles.rupeeSymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          <View style={styles.goldConversion}>
            <Ionicons name="swap-vertical" size={20} color={COLORS.textSecondary} />
            <Text style={styles.goldConversionText}>
              = {goldAmount.toFixed(4)} gm Gold
            </Text>
          </View>
        </View>

        {/* Quick Amounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Select</Text>
          <View style={styles.quickAmountsGrid}>
            {QUICK_AMOUNTS.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[
                  styles.quickAmountCard,
                  amount === amt && styles.quickAmountCardActive,
                ]}
                onPress={() => setAmount(amt)}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    amount === amt && styles.quickAmountTextActive,
                  ]}
                >
                  ₹{parseInt(amt).toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Digital Gold?</Text>
          <View style={styles.benefitsList}>
            {[
              { icon: 'shield-checkmark', title: '100% Secure', desc: 'Insured & stored in secure vaults' },
              { icon: 'wallet', title: 'Start with ₹1', desc: 'No minimum investment required' },
              { icon: 'flash', title: 'Instant Buy/Sell', desc: 'Trade anytime, 24x7' },
              { icon: 'gift', title: 'Earn Rewards', desc: 'Get ReZ Coins on every transaction' },
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitCard}>
                <View style={styles.benefitIcon}>
                  <Ionicons name={benefit.icon as any} size={24} color={COLORS.primaryGold} />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDesc}>{benefit.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* SIP Option */}
        <View style={styles.sipCard}>
          <LinearGradient
            colors={['rgba(251, 191, 36, 0.15)', 'rgba(249, 115, 22, 0.15)']}
            style={styles.sipGradient}
          >
            <View style={styles.sipContent}>
              <View style={styles.sipIcon}>
                <Ionicons name="calendar" size={24} color={COLORS.primaryGold} />
              </View>
              <View style={styles.sipText}>
                <Text style={styles.sipTitle}>Start Gold SIP</Text>
                <Text style={styles.sipDesc}>Auto-invest daily, weekly, or monthly</Text>
              </View>
              <TouchableOpacity
                style={styles.sipButton}
                onPress={() => router.push('/gold-savings/sip' as any)}
              >
                <Text style={styles.sipButtonText}>Setup</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Trust Badges */}
        <View style={styles.trustSection}>
          <View style={styles.trustBadge}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primaryGreen} />
            <Text style={styles.trustText}>Powered by MMTC-PAMP</Text>
          </View>
          <View style={styles.trustBadge}>
            <Ionicons name="lock-closed" size={20} color={COLORS.primaryGreen} />
            <Text style={styles.trustText}>Bank-grade Security</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      {amount && parseFloat(amount) >= 1 && (
        <View style={styles.bottomCta}>
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>
              {activeTab === 'buy' ? 'You get' : 'You receive'}
            </Text>
            <Text style={styles.summaryValue}>
              {activeTab === 'buy'
                ? `${goldAmount.toFixed(4)} gm Gold`
                : `₹${amount}`}
            </Text>
          </View>
          <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
            <Text style={styles.proceedButtonText}>
              {activeTab === 'buy' ? 'Buy Gold' : 'Sell Gold'}
            </Text>
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
  balanceCard: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  balanceGradient: {
    padding: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  priceStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  priceLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  tabActive: {
    backgroundColor: COLORS.primaryGreen,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  section: {
    marginTop: 24,
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
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  rupeeSymbol: {
    fontSize: 32,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  goldConversion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  goldConversionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAmountCard: {
    width: '31%',
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  quickAmountCardActive: {
    borderColor: COLORS.primaryGold,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  quickAmountText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  quickAmountTextActive: {
    color: COLORS.primaryGold,
  },
  benefitsList: {
    gap: 12,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  sipCard: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sipGradient: {
    padding: 16,
  },
  sipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sipIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sipText: {
    flex: 1,
  },
  sipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  sipDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  sipButton: {
    backgroundColor: COLORS.primaryGold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 24,
    marginBottom: 100,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 12,
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
  summary: {},
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryGold,
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryGold,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
