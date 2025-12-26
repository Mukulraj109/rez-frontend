/**
 * Gift Cards Redemption Page
 * Redeem coins for gift cards
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

interface GiftCardOption {
  id: string;
  name: string;
  logo: string;
  minCoins: number;
  denominations: number[];
}

const GIFT_CARDS: GiftCardOption[] = [
  { id: 'amazon', name: 'Amazon', logo: '🛒', minCoins: 500, denominations: [500, 1000, 2000, 5000] },
  { id: 'flipkart', name: 'Flipkart', logo: '📦', minCoins: 500, denominations: [500, 1000, 2000, 5000] },
  { id: 'swiggy', name: 'Swiggy', logo: '🍔', minCoins: 300, denominations: [300, 500, 1000, 2000] },
  { id: 'zomato', name: 'Zomato', logo: '🍕', minCoins: 300, denominations: [300, 500, 1000, 2000] },
  { id: 'myntra', name: 'Myntra', logo: '👗', minCoins: 500, denominations: [500, 1000, 2000] },
  { id: 'bookmyshow', name: 'BookMyShow', logo: '🎬', minCoins: 200, denominations: [200, 500, 1000] },
];

export default function GiftCardsScreen() {
  const router = useRouter();
  const { userData, refetch } = usePriveSection();
  const availableCoins = userData?.totalCoins || 0;

  const [selectedCard, setSelectedCard] = useState<GiftCardOption | null>(null);
  const [selectedDenomination, setSelectedDenomination] = useState<number | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState<Voucher | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const handleSelectCard = (card: GiftCardOption) => {
    setSelectedCard(card);
    setSelectedDenomination(null);
  };

  const handleSelectDenomination = (amount: number) => {
    setSelectedDenomination(amount);
  };

  const handleRedeem = async () => {
    if (!selectedCard || !selectedDenomination) return;

    if (availableCoins < selectedDenomination) {
      Alert.alert('Insufficient Coins', 'You don\'t have enough coins for this redemption.');
      return;
    }

    Alert.alert(
      'Confirm Redemption',
      `Redeem ${selectedDenomination.toLocaleString()} coins for a ${selectedCard.name} gift card?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsRedeeming(true);
            try {
              const response = await priveApi.redeemCoins({
                coinAmount: selectedDenomination,
                type: 'gift_card',
                category: selectedCard.name,
                partnerName: selectedCard.name,
              });

              if (response.success && response.data) {
                setGeneratedVoucher(response.data.voucher);
                setShowVoucherModal(true);
                refetch();
              } else {
                Alert.alert('Error', 'Failed to redeem coins. Please try again.');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to redeem coins');
            } finally {
              setIsRedeeming(false);
            }
          },
        },
      ]
    );
  };

  const getVoucherValue = (coins: number): number => {
    return Math.floor(coins * 0.10); // 1 coin = 0.10 INR
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
          <Text style={styles.headerTitle}>Gift Cards</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Balance */}
        <View style={styles.balanceBar}>
          <Text style={styles.balanceLabel}>Available:</Text>
          <Text style={styles.balanceAmount}>{availableCoins.toLocaleString()} coins</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Card Selection */}
          <Text style={styles.sectionTitle}>Select Brand</Text>
          <View style={styles.cardsGrid}>
            {GIFT_CARDS.map((card) => {
              const canAfford = availableCoins >= card.minCoins;
              const isSelected = selectedCard?.id === card.id;

              return (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.cardOption,
                    isSelected && styles.cardOptionSelected,
                    !canAfford && styles.cardOptionDisabled,
                  ]}
                  onPress={() => canAfford && handleSelectCard(card)}
                  disabled={!canAfford}
                >
                  <Text style={styles.cardLogo}>{card.logo}</Text>
                  <Text style={[styles.cardName, !canAfford && styles.cardNameDisabled]}>
                    {card.name}
                  </Text>
                  <Text style={styles.cardMin}>
                    {canAfford ? `Min ${card.minCoins}` : `Need ${card.minCoins - availableCoins} more`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Denomination Selection */}
          {selectedCard && (
            <>
              <Text style={styles.sectionTitle}>Select Amount</Text>
              <View style={styles.denominationsGrid}>
                {selectedCard.denominations.map((amount) => {
                  const canAfford = availableCoins >= amount;
                  const isSelected = selectedDenomination === amount;

                  return (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.denomOption,
                        isSelected && styles.denomOptionSelected,
                        !canAfford && styles.denomOptionDisabled,
                      ]}
                      onPress={() => canAfford && handleSelectDenomination(amount)}
                      disabled={!canAfford}
                    >
                      <Text style={[styles.denomCoins, !canAfford && styles.denomCoinsDisabled]}>
                        {amount.toLocaleString()}
                      </Text>
                      <Text style={styles.denomLabel}>coins</Text>
                      <View style={styles.denomDivider} />
                      <Text style={styles.denomValue}>Rs {getVoucherValue(amount)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Redeem Button */}
          {selectedCard && selectedDenomination && (
            <TouchableOpacity
              style={[styles.redeemButton, isRedeeming && styles.redeemButtonDisabled]}
              onPress={handleRedeem}
              disabled={isRedeeming}
            >
              {isRedeeming ? (
                <ActivityIndicator color={PRIVE_COLORS.background.primary} />
              ) : (
                <Text style={styles.redeemButtonText}>
                  Redeem {selectedDenomination.toLocaleString()} Coins
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Gift cards are valid for 1 year from the date of redemption.
              Present the voucher code at checkout.
            </Text>
          </View>
        </ScrollView>

        {/* Voucher Success Modal */}
        <Modal
          visible={showVoucherModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowVoucherModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.successIcon}>
                <Text style={styles.successEmoji}>🎉</Text>
              </View>
              <Text style={styles.modalTitle}>Voucher Generated!</Text>

              {generatedVoucher && (
                <>
                  <View style={styles.voucherCodeBox}>
                    <Text style={styles.voucherCode}>{generatedVoucher.code}</Text>
                  </View>
                  <Text style={styles.voucherValue}>
                    Value: Rs {generatedVoucher.value} | {generatedVoucher.category}
                  </Text>
                  <Text style={styles.voucherExpiry}>
                    Expires: {generatedVoucher.expiresIn}
                  </Text>

                  <View style={styles.voucherTerms}>
                    <Text style={styles.termsTitle}>How to use:</Text>
                    <Text style={styles.termsText}>{generatedVoucher.howToUse}</Text>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowVoucherModal(false);
                  setSelectedCard(null);
                  setSelectedDenomination(null);
                  setGeneratedVoucher(null);
                }}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.viewVouchersButton}
                onPress={() => {
                  setShowVoucherModal(false);
                  router.push('/prive/vouchers' as any);
                }}
              >
                <Text style={styles.viewVouchersText}>View All Vouchers</Text>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    marginBottom: PRIVE_SPACING.lg,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PRIVE_SPACING.md,
    marginBottom: PRIVE_SPACING.xl,
  },
  cardOption: {
    width: '31%',
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
  },
  cardOptionSelected: {
    borderColor: PRIVE_COLORS.gold.primary,
    backgroundColor: PRIVE_COLORS.transparent.gold10,
  },
  cardOptionDisabled: {
    opacity: 0.5,
  },
  cardLogo: {
    fontSize: 28,
    marginBottom: PRIVE_SPACING.sm,
  },
  cardName: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    marginBottom: 4,
  },
  cardNameDisabled: {
    color: PRIVE_COLORS.text.tertiary,
  },
  cardMin: {
    fontSize: 10,
    color: PRIVE_COLORS.text.tertiary,
  },
  denominationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PRIVE_SPACING.md,
    marginBottom: PRIVE_SPACING.xl,
  },
  denomOption: {
    width: '48%',
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
  },
  denomOptionSelected: {
    borderColor: PRIVE_COLORS.gold.primary,
    backgroundColor: PRIVE_COLORS.transparent.gold10,
  },
  denomOptionDisabled: {
    opacity: 0.5,
  },
  denomCoins: {
    fontSize: 20,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
  },
  denomCoinsDisabled: {
    color: PRIVE_COLORS.text.tertiary,
  },
  denomLabel: {
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
  },
  denomDivider: {
    width: 40,
    height: 1,
    backgroundColor: PRIVE_COLORS.transparent.white10,
    marginVertical: PRIVE_SPACING.sm,
  },
  denomValue: {
    fontSize: 14,
    fontWeight: '500',
    color: PRIVE_COLORS.gold.primary,
  },
  redeemButton: {
    backgroundColor: PRIVE_COLORS.gold.primary,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    alignItems: 'center',
    marginBottom: PRIVE_SPACING.lg,
  },
  redeemButtonDisabled: {
    opacity: 0.7,
  },
  redeemButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIVE_COLORS.background.primary,
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
    backgroundColor: PRIVE_COLORS.transparent.gold15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: PRIVE_SPACING.lg,
  },
  successEmoji: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    marginBottom: PRIVE_SPACING.xl,
  },
  voucherCodeBox: {
    backgroundColor: PRIVE_COLORS.background.primary,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    marginBottom: PRIVE_SPACING.md,
    width: '100%',
    alignItems: 'center',
  },
  voucherCode: {
    fontSize: 24,
    fontWeight: '700',
    color: PRIVE_COLORS.gold.primary,
    letterSpacing: 2,
  },
  voucherValue: {
    fontSize: 14,
    color: PRIVE_COLORS.text.secondary,
    marginBottom: PRIVE_SPACING.xs,
  },
  voucherExpiry: {
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
    marginBottom: PRIVE_SPACING.lg,
  },
  voucherTerms: {
    backgroundColor: PRIVE_COLORS.transparent.white08,
    borderRadius: PRIVE_RADIUS.md,
    padding: PRIVE_SPACING.md,
    width: '100%',
    marginBottom: PRIVE_SPACING.xl,
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    marginBottom: PRIVE_SPACING.xs,
  },
  termsText: {
    fontSize: 11,
    color: PRIVE_COLORS.text.tertiary,
    lineHeight: 16,
  },
  modalButton: {
    backgroundColor: PRIVE_COLORS.gold.primary,
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
    color: PRIVE_COLORS.background.primary,
  },
  viewVouchersButton: {
    padding: PRIVE_SPACING.md,
  },
  viewVouchersText: {
    fontSize: 14,
    color: PRIVE_COLORS.gold.primary,
  },
});
