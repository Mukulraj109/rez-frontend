/**
 * Charity Redemption Page
 * Donate coins to charitable causes
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PRIVE_COLORS, PRIVE_SPACING, PRIVE_RADIUS } from '@/components/prive/priveTheme';
import { usePriveSection } from '@/hooks/usePriveSection';
import priveApi, { Voucher } from '@/services/priveApi';

interface Charity {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

const CHARITIES: Charity[] = [
  {
    id: 'education',
    name: 'Education for All',
    description: 'Support underprivileged children\'s education',
    icon: '📚',
    category: 'Education',
  },
  {
    id: 'hunger',
    name: 'Feeding India',
    description: 'Provide meals to those in need',
    icon: '🍚',
    category: 'Food',
  },
  {
    id: 'health',
    name: 'Health Foundation',
    description: 'Medical care for underserved communities',
    icon: '🏥',
    category: 'Healthcare',
  },
  {
    id: 'environment',
    name: 'Green Earth Initiative',
    description: 'Plant trees and protect wildlife',
    icon: '🌱',
    category: 'Environment',
  },
  {
    id: 'animals',
    name: 'Animal Welfare',
    description: 'Shelter and care for stray animals',
    icon: '🐕',
    category: 'Animals',
  },
  {
    id: 'disaster',
    name: 'Disaster Relief',
    description: 'Emergency aid for disaster victims',
    icon: '🆘',
    category: 'Emergency',
  },
];

const DONATION_AMOUNTS = [100, 250, 500, 1000, 2500];

export default function CharityScreen() {
  const router = useRouter();
  const { userData, refetch } = usePriveSection();
  const availableCoins = userData?.totalCoins || 0;

  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState<Voucher | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const handleSelectCharity = (charity: Charity) => {
    setSelectedCharity(charity);
  };

  const handleSelectAmount = (amount: number) => {
    if (availableCoins >= amount) {
      setSelectedAmount(amount);
    }
  };

  const handleDonate = async () => {
    if (!selectedCharity || !selectedAmount) return;

    Alert.alert(
      'Confirm Donation',
      `Donate ${selectedAmount.toLocaleString()} coins (Rs ${getDonationValue(selectedAmount)}) to ${selectedCharity.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Donate',
          onPress: async () => {
            setIsRedeeming(true);
            try {
              const response = await priveApi.redeemCoins({
                coinAmount: selectedAmount,
                type: 'charity',
                category: selectedCharity.name,
                partnerName: selectedCharity.name,
              });

              if (response.success && response.data) {
                setGeneratedVoucher(response.data.voucher);
                setShowVoucherModal(true);
                refetch();
              } else {
                Alert.alert('Error', 'Failed to process donation. Please try again.');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to process donation');
            } finally {
              setIsRedeeming(false);
            }
          },
        },
      ]
    );
  };

  const getDonationValue = (coins: number): number => {
    return Math.floor(coins * 0.15); // 1 coin = 0.15 INR for charity (better rate)
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1F2937', '#111827', '#0A0A0A']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={PRIVE_COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Donate</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Balance */}
        <View style={styles.balanceBar}>
          <Text style={styles.balanceLabel}>Available:</Text>
          <Text style={styles.balanceAmount}>{availableCoins.toLocaleString()} coins</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.heroCard}>
            <Text style={styles.heroIcon}>💝</Text>
            <Text style={styles.heroTitle}>Make a Difference</Text>
            <Text style={styles.heroText}>
              Your coins can help change lives. Charity donations get a 50% bonus conversion rate!
            </Text>
          </View>

          {/* Charity Selection */}
          <Text style={styles.sectionTitle}>Choose a Cause</Text>
          <View style={styles.charityGrid}>
            {CHARITIES.map((charity) => {
              const isSelected = selectedCharity?.id === charity.id;

              return (
                <TouchableOpacity
                  key={charity.id}
                  style={[styles.charityCard, isSelected && styles.charityCardSelected]}
                  onPress={() => handleSelectCharity(charity)}
                >
                  <Text style={styles.charityIcon}>{charity.icon}</Text>
                  <Text style={styles.charityName}>{charity.name}</Text>
                  <Text style={styles.charityCategory}>{charity.category}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Amount Selection */}
          {selectedCharity && (
            <>
              <Text style={styles.sectionTitle}>Select Donation Amount</Text>
              <View style={styles.amountsRow}>
                {DONATION_AMOUNTS.map((amount) => {
                  const canAfford = availableCoins >= amount;
                  const isSelected = selectedAmount === amount;

                  return (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.amountChip,
                        isSelected && styles.amountChipSelected,
                        !canAfford && styles.amountChipDisabled,
                      ]}
                      onPress={() => handleSelectAmount(amount)}
                      disabled={!canAfford}
                    >
                      <Text style={[
                        styles.amountChipText,
                        isSelected && styles.amountChipTextSelected,
                        !canAfford && styles.amountChipTextDisabled,
                      ]}>
                        {amount}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selectedAmount && (
                <View style={styles.donationSummary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Coins:</Text>
                    <Text style={styles.summaryValue}>{selectedAmount.toLocaleString()}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Donation Value:</Text>
                    <Text style={styles.summaryValueGold}>Rs {getDonationValue(selectedAmount)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>To:</Text>
                    <Text style={styles.summaryValue}>{selectedCharity.name}</Text>
                  </View>
                </View>
              )}
            </>
          )}

          {/* Donate Button */}
          {selectedCharity && selectedAmount && (
            <TouchableOpacity
              style={[styles.donateButton, isRedeeming && styles.donateButtonDisabled]}
              onPress={handleDonate}
              disabled={isRedeeming}
            >
              {isRedeeming ? (
                <ActivityIndicator color={PRIVE_COLORS.background.primary} />
              ) : (
                <>
                  <Text style={styles.donateButtonEmoji}>💝</Text>
                  <Text style={styles.donateButtonText}>
                    Donate Rs {getDonationValue(selectedAmount)}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>📧</Text>
            <Text style={styles.infoText}>
              You will receive a tax receipt via email within 7 days of your donation.
              Thank you for your generosity!
            </Text>
          </View>
        </ScrollView>

        {/* Success Modal */}
        <Modal
          visible={showVoucherModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowVoucherModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.successIcon}>
                <Text style={styles.successEmoji}>🙏</Text>
              </View>
              <Text style={styles.modalTitle}>Thank You!</Text>
              <Text style={styles.modalSubtitle}>
                Your donation has been processed
              </Text>

              {generatedVoucher && (
                <>
                  <View style={styles.donationConfirm}>
                    <Text style={styles.confirmLabel}>Amount Donated</Text>
                    <Text style={styles.confirmValue}>Rs {generatedVoucher.value}</Text>
                    <Text style={styles.confirmCharity}>{generatedVoucher.category}</Text>
                  </View>

                  <View style={styles.receiptInfo}>
                    <Text style={styles.receiptTitle}>Receipt Reference</Text>
                    <Text style={styles.receiptCode}>{generatedVoucher.code}</Text>
                    <Text style={styles.receiptNote}>
                      Tax receipt will be sent to your registered email
                    </Text>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowVoucherModal(false);
                  setSelectedCharity(null);
                  setSelectedAmount(null);
                  setGeneratedVoucher(null);
                }}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.donateAgainButton}
                onPress={() => {
                  setShowVoucherModal(false);
                  setSelectedAmount(null);
                  setGeneratedVoucher(null);
                }}
              >
                <Text style={styles.donateAgainText}>Donate Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PRIVE_SPACING.xl,
    paddingVertical: PRIVE_SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  balanceBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: PRIVE_SPACING.md,
    backgroundColor: PRIVE_COLORS.transparent.gold10,
    gap: PRIVE_SPACING.sm,
  },
  balanceLabel: {
    fontSize: 14,
    color: PRIVE_COLORS.text.tertiary,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIVE_COLORS.gold.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: PRIVE_SPACING.xl,
    paddingTop: PRIVE_SPACING.xl,
  },
  heroCard: {
    backgroundColor: PRIVE_COLORS.transparent.gold10,
    borderRadius: PRIVE_RADIUS.xl,
    padding: PRIVE_SPACING.xl,
    alignItems: 'center',
    marginBottom: PRIVE_SPACING.xl,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.goldMuted,
  },
  heroIcon: {
    fontSize: 48,
    marginBottom: PRIVE_SPACING.md,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    marginBottom: PRIVE_SPACING.sm,
  },
  heroText: {
    fontSize: 13,
    color: PRIVE_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    marginBottom: PRIVE_SPACING.lg,
  },
  charityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PRIVE_SPACING.md,
    marginBottom: PRIVE_SPACING.xl,
  },
  charityCard: {
    width: '48%',
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
  },
  charityCardSelected: {
    borderColor: PRIVE_COLORS.gold.primary,
    backgroundColor: PRIVE_COLORS.transparent.gold10,
  },
  charityIcon: {
    fontSize: 32,
    marginBottom: PRIVE_SPACING.sm,
  },
  charityName: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  charityCategory: {
    fontSize: 11,
    color: PRIVE_COLORS.text.tertiary,
  },
  amountsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PRIVE_SPACING.sm,
    marginBottom: PRIVE_SPACING.lg,
  },
  amountChip: {
    paddingHorizontal: PRIVE_SPACING.lg,
    paddingVertical: PRIVE_SPACING.md,
    borderRadius: PRIVE_RADIUS.lg,
    backgroundColor: PRIVE_COLORS.background.card,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
  },
  amountChipSelected: {
    backgroundColor: PRIVE_COLORS.gold.primary,
    borderColor: PRIVE_COLORS.gold.primary,
  },
  amountChipDisabled: {
    opacity: 0.5,
  },
  amountChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
  },
  amountChipTextSelected: {
    color: PRIVE_COLORS.background.primary,
  },
  amountChipTextDisabled: {
    color: PRIVE_COLORS.text.tertiary,
  },
  donationSummary: {
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    marginBottom: PRIVE_SPACING.lg,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: PRIVE_SPACING.sm,
  },
  summaryLabel: {
    fontSize: 13,
    color: PRIVE_COLORS.text.tertiary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '500',
    color: PRIVE_COLORS.text.primary,
  },
  summaryValueGold: {
    fontSize: 15,
    fontWeight: '600',
    color: PRIVE_COLORS.gold.primary,
  },
  donateButton: {
    backgroundColor: '#E91E63',
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: PRIVE_SPACING.sm,
    marginBottom: PRIVE_SPACING.lg,
  },
  donateButtonDisabled: {
    opacity: 0.7,
  },
  donateButtonEmoji: {
    fontSize: 20,
  },
  donateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: PRIVE_COLORS.transparent.white08,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    gap: PRIVE_SPACING.md,
    marginBottom: PRIVE_SPACING.xxl,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: PRIVE_SPACING.xl,
  },
  modalContent: {
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.xl,
    padding: PRIVE_SPACING.xxl,
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(233, 30, 99, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: PRIVE_SPACING.lg,
  },
  successEmoji: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    marginBottom: PRIVE_SPACING.xs,
  },
  modalSubtitle: {
    fontSize: 14,
    color: PRIVE_COLORS.text.tertiary,
    marginBottom: PRIVE_SPACING.xl,
  },
  donationConfirm: {
    alignItems: 'center',
    marginBottom: PRIVE_SPACING.lg,
  },
  confirmLabel: {
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
    marginBottom: PRIVE_SPACING.xs,
  },
  confirmValue: {
    fontSize: 32,
    fontWeight: '300',
    color: '#E91E63',
    marginBottom: PRIVE_SPACING.xs,
  },
  confirmCharity: {
    fontSize: 14,
    color: PRIVE_COLORS.text.secondary,
  },
  receiptInfo: {
    backgroundColor: PRIVE_COLORS.transparent.white08,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    width: '100%',
    alignItems: 'center',
    marginBottom: PRIVE_SPACING.xl,
  },
  receiptTitle: {
    fontSize: 11,
    color: PRIVE_COLORS.text.tertiary,
    marginBottom: PRIVE_SPACING.xs,
  },
  receiptCode: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    marginBottom: PRIVE_SPACING.sm,
    letterSpacing: 1,
  },
  receiptNote: {
    fontSize: 11,
    color: PRIVE_COLORS.text.tertiary,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#E91E63',
    borderRadius: PRIVE_RADIUS.lg,
    paddingVertical: PRIVE_SPACING.md,
    paddingHorizontal: PRIVE_SPACING.xxl,
    width: '100%',
    alignItems: 'center',
    marginBottom: PRIVE_SPACING.md,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  donateAgainButton: {
    padding: PRIVE_SPACING.md,
  },
  donateAgainText: {
    fontSize: 14,
    color: PRIVE_COLORS.gold.primary,
  },
});
