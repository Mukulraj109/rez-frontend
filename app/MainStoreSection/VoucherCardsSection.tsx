// VoucherCardsSection.tsx - Magicpin-inspired horizontal voucher cards
import React, { memo, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ListRenderItemInfo,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { triggerImpact } from "@/utils/haptics";
import {
  Colors,
  Spacing,
  Shadows,
  BorderRadius,
  Typography,
  Gradients,
} from "@/constants/DesignSystem";

export interface VoucherCard {
  id: string;
  payAmount: number;
  getValue: number;
  savingsPercent: number;
  validityDays?: number;
  termsCount?: number;
  isPopular?: boolean;
}

interface VoucherCardsSectionProps {
  storeId: string;
  vouchers?: VoucherCard[];
  onBuyVoucher?: (voucherId: string) => void;
  onSeeAllPress?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = 280;
const CARD_GAP = Spacing.md;

// Format currency
const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString("en-IN")}`;
};

const VoucherCardItem = memo(function VoucherCardItem({
  voucher,
  onPress,
}: {
  voucher: VoucherCard;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.voucherCard}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`Pay ${formatCurrency(voucher.payAmount)}, Get ${formatCurrency(voucher.getValue)}. ${voucher.savingsPercent}% savings`}
    >
      {/* Gold Gradient Background */}
      <LinearGradient
        colors={["#FEF9E7", "#FEF3C7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Popular Badge */}
        {voucher.isPopular && (
          <View style={styles.popularBadge}>
            <Ionicons name="flame" size={10} color="#fff" />
            <ThemedText style={styles.popularText}>POPULAR</ThemedText>
          </View>
        )}

        {/* Savings Badge - Top Right */}
        <View style={styles.savingsBadge}>
          <ThemedText style={styles.savingsText}>
            {voucher.savingsPercent}% OFF
          </ThemedText>
        </View>

        {/* Voucher Content */}
        <View style={styles.voucherContent}>
          {/* Gift Icon */}
          <View style={styles.giftIconContainer}>
            <LinearGradient
              colors={Gradients.gold}
              style={styles.giftIconGradient}
            >
              <Ionicons name="gift" size={28} color="#fff" />
            </LinearGradient>
          </View>

          {/* Voucher Details */}
          <View style={styles.voucherDetails}>
            <View style={styles.amountRow}>
              <ThemedText style={styles.payLabel}>Pay</ThemedText>
              <ThemedText style={styles.payAmount}>
                {formatCurrency(voucher.payAmount)}
              </ThemedText>
            </View>
            <View style={styles.getRow}>
              <ThemedText style={styles.getLabel}>Get</ThemedText>
              <ThemedText style={styles.getAmount}>
                {formatCurrency(voucher.getValue)}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Validity Info */}
        {voucher.validityDays && (
          <View style={styles.validityRow}>
            <Ionicons name="time-outline" size={12} color={Colors.gray[500]} />
            <ThemedText style={styles.validityText}>
              Valid for {voucher.validityDays} days
            </ThemedText>
            {voucher.termsCount && (
              <ThemedText style={styles.termsText}>
                • {voucher.termsCount} T&C apply
              </ThemedText>
            )}
          </View>
        )}

        {/* Divider with circles */}
        <View style={styles.dividerContainer}>
          <View style={styles.circleLeft} />
          <View style={styles.dividerLine} />
          <View style={styles.circleRight} />
        </View>

        {/* Buy Now Button */}
        <TouchableOpacity
          style={styles.buyButton}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={Gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buyButtonGradient}
          >
            <ThemedText style={styles.buyButtonText}>Buy Now</ThemedText>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
});

export default memo(function VoucherCardsSection({
  storeId,
  vouchers,
  onBuyVoucher,
  onSeeAllPress,
}: VoucherCardsSectionProps) {
  // Don't render if no real vouchers provided - no dummy data
  if (!vouchers || vouchers.length === 0) return null;

  const handleBuyVoucher = useCallback(
    (voucherId: string) => {
      triggerImpact("Medium");
      if (onBuyVoucher) {
        onBuyVoucher(voucherId);
      }
    },
    [onBuyVoucher]
  );

  const renderVoucherCard = useCallback(
    ({ item }: ListRenderItemInfo<VoucherCard>) => (
      <VoucherCardItem
        voucher={item}
        onPress={() => handleBuyVoucher(item.id)}
      />
    ),
    [handleBuyVoucher]
  );

  const keyExtractor = useCallback((item: VoucherCard) => item.id, []);

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="ticket" size={20} color={Colors.gold} />
          </View>
          <View>
            <ThemedText style={styles.headerTitle}>Gift Vouchers</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Save more with prepaid vouchers
            </ThemedText>
          </View>
        </View>
        {onSeeAllPress && vouchers.length > 2 && (
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={onSeeAllPress}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.seeAllText}>See All</ThemedText>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary[700]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Voucher Cards Carousel */}
      <FlatList
        data={vouchers}
        renderItem={renderVoucherCard}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
    paddingHorizontal: 0,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEF9E7",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.gray[500],
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    ...Typography.labelSmall,
    color: Colors.primary[700],
  },
  carouselContent: {
    paddingLeft: 0,
    paddingRight: Spacing.base,
  },

  // Voucher Card Styles
  voucherCard: {
    width: CARD_WIDTH,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    ...Shadows.medium,
  },
  cardGradient: {
    padding: Spacing.base,
    position: "relative",
  },
  popularBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#EF4444",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderTopLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  popularText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  savingsBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: "#D97706",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  voucherContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  giftIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    ...Shadows.purpleSubtle,
  },
  giftIconGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  voucherDetails: {
    flex: 1,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.xs,
  },
  payLabel: {
    ...Typography.caption,
    color: Colors.gray[500],
  },
  payAmount: {
    ...Typography.h3,
    color: Colors.text.primary,
    fontWeight: "800",
  },
  getRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.xs,
    marginTop: 4,
  },
  getLabel: {
    ...Typography.caption,
    color: Colors.gray[500],
  },
  getAmount: {
    ...Typography.h4,
    color: Colors.primary[700],
    fontWeight: "700",
  },
  validityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: Spacing.md,
  },
  validityText: {
    ...Typography.caption,
    color: Colors.gray[500],
  },
  termsText: {
    ...Typography.caption,
    color: Colors.gray[400],
  },

  // Divider with circles (ticket style)
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.sm,
  },
  circleLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.background.secondary,
    marginLeft: -26,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray[200],
  },
  circleRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.background.secondary,
    marginRight: -26,
  },

  // Buy Button
  buyButton: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  buyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  buyButtonText: {
    ...Typography.button,
    color: "#fff",
    fontWeight: "700",
  },
});
