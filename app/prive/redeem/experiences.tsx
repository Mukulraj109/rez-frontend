/**
 * Experiences Redemption Page
 * Redeem coins for exclusive experiences
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

interface Experience {
  id: string;
  name: string;
  description: string;
  icon: string;
  coinCost: number;
  value: number;
  highlights: string[];
}

const EXPERIENCES: Experience[] = [
  {
    id: 'spa',
    name: 'Luxury Spa Day',
    description: 'Full day spa experience at premium wellness centers',
    icon: '🧖',
    coinCost: 5000,
    value: 600,
    highlights: ['Full body massage', 'Facial treatment', 'Sauna access'],
  },
  {
    id: 'dining',
    name: 'Fine Dining Experience',
    description: '5-course meal at top-rated restaurants',
    icon: '🍽️',
    coinCost: 3000,
    value: 360,
    highlights: ['5-course tasting menu', 'Wine pairing', 'Chef\'s table'],
  },
  {
    id: 'staycation',
    name: 'Weekend Staycation',
    description: 'One night at premium hotels',
    icon: '🏨',
    coinCost: 8000,
    value: 960,
    highlights: ['Luxury room', 'Breakfast included', 'Late checkout'],
  },
  {
    id: 'adventure',
    name: 'Adventure Activity',
    description: 'Thrilling outdoor adventures',
    icon: '🎢',
    coinCost: 2000,
    value: 240,
    highlights: ['Choice of activity', 'Professional guide', 'Safety gear'],
  },
  {
    id: 'concert',
    name: 'Premium Event Tickets',
    description: 'VIP access to concerts & shows',
    icon: '🎵',
    coinCost: 4000,
    value: 480,
    highlights: ['VIP seating', 'Backstage access', 'Meet & greet'],
  },
  {
    id: 'workshop',
    name: 'Exclusive Workshop',
    description: 'Learn from industry experts',
    icon: '🎨',
    coinCost: 1500,
    value: 180,
    highlights: ['Expert instruction', 'Materials included', 'Certificate'],
  },
];

export default function ExperiencesScreen() {
  const router = useRouter();
  const { userData, refetch } = usePriveSection();
  const availableCoins = userData?.totalCoins || 0;

  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState<Voucher | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const handleSelectExperience = (exp: Experience) => {
    if (availableCoins >= exp.coinCost) {
      setSelectedExperience(exp);
    }
  };

  const handleRedeem = async () => {
    if (!selectedExperience) return;

    Alert.alert(
      'Confirm Redemption',
      `Redeem ${selectedExperience.coinCost.toLocaleString()} coins for "${selectedExperience.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsRedeeming(true);
            try {
              const response = await priveApi.redeemCoins({
                coinAmount: selectedExperience.coinCost,
                type: 'experience',
                category: selectedExperience.name,
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
          <Text style={styles.headerTitle}>Experiences</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Balance */}
        <View style={styles.balanceBar}>
          <Text style={styles.balanceLabel}>Available:</Text>
          <Text style={styles.balanceAmount}>{availableCoins.toLocaleString()} coins</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Exclusive Experiences</Text>
          <Text style={styles.sectionSubtitle}>
            Premium experiences curated for Prive members
          </Text>

          {EXPERIENCES.map((exp) => {
            const canAfford = availableCoins >= exp.coinCost;
            const isSelected = selectedExperience?.id === exp.id;

            return (
              <TouchableOpacity
                key={exp.id}
                style={[
                  styles.expCard,
                  isSelected && styles.expCardSelected,
                  !canAfford && styles.expCardDisabled,
                ]}
                onPress={() => handleSelectExperience(exp)}
                disabled={!canAfford}
              >
                <View style={styles.expHeader}>
                  <Text style={styles.expIcon}>{exp.icon}</Text>
                  <View style={styles.expTitleSection}>
                    <Text style={[styles.expName, !canAfford && styles.expNameDisabled]}>
                      {exp.name}
                    </Text>
                    <Text style={styles.expDesc}>{exp.description}</Text>
                  </View>
                </View>

                <View style={styles.expHighlights}>
                  {exp.highlights.map((h, i) => (
                    <View key={i} style={styles.highlightItem}>
                      <Text style={styles.highlightDot}>•</Text>
                      <Text style={styles.highlightText}>{h}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.expFooter}>
                  <View>
                    <Text style={[styles.expCoins, !canAfford && styles.expCoinsDisabled]}>
                      {exp.coinCost.toLocaleString()} coins
                    </Text>
                    <Text style={styles.expValue}>Worth Rs {exp.value}</Text>
                  </View>
                  {canAfford ? (
                    isSelected ? (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark" size={16} color={PRIVE_COLORS.gold.primary} />
                      </View>
                    ) : (
                      <Text style={styles.selectText}>Select</Text>
                    )
                  ) : (
                    <Text style={styles.needMore}>
                      Need {(exp.coinCost - availableCoins).toLocaleString()} more
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Redeem Button */}
          {selectedExperience && (
            <TouchableOpacity
              style={[styles.redeemButton, isRedeeming && styles.redeemButtonDisabled]}
              onPress={handleRedeem}
              disabled={isRedeeming}
            >
              {isRedeeming ? (
                <ActivityIndicator color={PRIVE_COLORS.background.primary} />
              ) : (
                <Text style={styles.redeemButtonText}>
                  Redeem {selectedExperience.name}
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>✨</Text>
            <Text style={styles.infoText}>
              Experience vouchers include a 20% premium conversion rate.
              Valid for 90 days. Book via our concierge.
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
                <Text style={styles.successEmoji}>✨</Text>
              </View>
              <Text style={styles.modalTitle}>Experience Booked!</Text>

              {generatedVoucher && (
                <>
                  <View style={styles.voucherCodeBox}>
                    <Text style={styles.voucherCode}>{generatedVoucher.code}</Text>
                  </View>
                  <Text style={styles.voucherCategory}>{generatedVoucher.category}</Text>
                  <Text style={styles.voucherValue}>Value: Rs {generatedVoucher.value}</Text>
                  <Text style={styles.voucherExpiry}>Valid for: {generatedVoucher.expiresIn}</Text>

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
                  setSelectedExperience(null);
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
    fontSize: 16,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    marginBottom: PRIVE_SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: PRIVE_COLORS.text.tertiary,
    marginBottom: PRIVE_SPACING.xl,
  },
  expCard: {
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
    marginBottom: PRIVE_SPACING.md,
  },
  expCardSelected: {
    borderColor: PRIVE_COLORS.gold.primary,
    backgroundColor: PRIVE_COLORS.transparent.gold10,
  },
  expCardDisabled: {
    opacity: 0.6,
  },
  expHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: PRIVE_SPACING.md,
    marginBottom: PRIVE_SPACING.md,
  },
  expIcon: {
    fontSize: 32,
  },
  expTitleSection: {
    flex: 1,
  },
  expName: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
  },
  expNameDisabled: {
    color: PRIVE_COLORS.text.tertiary,
  },
  expDesc: {
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
    marginTop: 2,
  },
  expHighlights: {
    marginBottom: PRIVE_SPACING.md,
    paddingLeft: PRIVE_SPACING.sm,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PRIVE_SPACING.sm,
    marginBottom: 4,
  },
  highlightDot: {
    fontSize: 10,
    color: PRIVE_COLORS.gold.primary,
  },
  highlightText: {
    fontSize: 12,
    color: PRIVE_COLORS.text.secondary,
  },
  expFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: PRIVE_SPACING.md,
    borderTopWidth: 1,
    borderTopColor: PRIVE_COLORS.transparent.white08,
  },
  expCoins: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIVE_COLORS.gold.primary,
  },
  expCoinsDisabled: {
    color: PRIVE_COLORS.text.tertiary,
  },
  expValue: {
    fontSize: 11,
    color: PRIVE_COLORS.text.tertiary,
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIVE_COLORS.transparent.gold15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectText: {
    fontSize: 13,
    color: PRIVE_COLORS.gold.primary,
    fontWeight: '500',
  },
  needMore: {
    fontSize: 11,
    color: PRIVE_COLORS.status.warning,
  },
  redeemButton: {
    backgroundColor: PRIVE_COLORS.gold.primary,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    alignItems: 'center',
    marginVertical: PRIVE_SPACING.lg,
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
  voucherCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    marginBottom: PRIVE_SPACING.sm,
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
