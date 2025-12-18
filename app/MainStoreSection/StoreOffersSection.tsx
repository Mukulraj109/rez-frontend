// StoreOffersSection.tsx - Offers at this store section
import React, { useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { triggerImpact } from "@/utils/haptics";
import { ThemedText } from "@/components/ThemedText";
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
} from "@/constants/DesignSystem";

export interface Offer {
  id: string;
  type: "percentage" | "flat" | "cashback";
  value: number;
  title: string;
  description: string;
  validity: string;
  coinsToEarn: number;
  code?: string;
  minOrder?: number;
}

export interface StoreOffersSectionProps {
  offers?: Offer[];
  onViewAll?: () => void;
  onApplyOffer?: (offer: Offer) => void;
}

// Sample offers for development
const SAMPLE_OFFERS: Offer[] = [
  {
    id: "1",
    type: "percentage",
    value: 20,
    title: "Buy 1 Get 1 Free on Beverages",
    description: "On orders above ₹300",
    validity: "Valid till Dec 31",
    coinsToEarn: 25,
  },
  {
    id: "2",
    type: "flat",
    value: 100,
    title: "Flat ₹100 off on first order",
    description: "Use code: FIRST100",
    validity: "Valid today",
    coinsToEarn: 50,
    code: "FIRST100",
  },
  {
    id: "3",
    type: "cashback",
    value: 15,
    title: "Extra 15% Cashback with UPI",
    description: "Max cashback ₹150",
    validity: "Valid for 7 days",
    coinsToEarn: 30,
  },
];

export default function StoreOffersSection({
  offers = SAMPLE_OFFERS,
  onViewAll,
  onApplyOffer,
}: StoreOffersSectionProps) {
  const getOfferBadge = (offer: Offer) => {
    switch (offer.type) {
      case "percentage":
        return `${offer.value}% OFF`;
      case "flat":
        return `₹${offer.value} OFF`;
      case "cashback":
        return `${offer.value}% CASHBACK`;
      default:
        return "OFFER";
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "percentage":
        return "#FF3B30";
      case "flat":
        return "#00C06A";
      case "cashback":
        return "#007AFF";
      default:
        return "#00C06A";
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>Offers at this store</ThemedText>
        <TouchableOpacity onPress={onViewAll} accessibilityRole="button">
          <ThemedText style={styles.viewAll}>View all</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Offers List */}
      <View style={styles.offersList}>
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            badgeText={getOfferBadge(offer)}
            badgeColor={getBadgeColor(offer.type)}
            onApply={() => onApplyOffer?.(offer)}
          />
        ))}
      </View>
    </View>
  );
}

interface OfferCardProps {
  offer: Offer;
  badgeText: string;
  badgeColor: string;
  onApply: () => void;
}

function OfferCard({ offer, badgeText, badgeColor, onApply }: OfferCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateScale = (toValue: number) => {
    Animated.spring(scaleAnim, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleApply = () => {
    triggerImpact('Light');
    onApply();
  };

  return (
    <View style={styles.offerCard}>
      {/* Badge and Validity */}
      <View style={styles.offerHeader}>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <ThemedText style={styles.badgeText}>{badgeText}</ThemedText>
        </View>
        <ThemedText style={styles.validity}>{offer.validity}</ThemedText>
      </View>

      {/* Offer Title */}
      <ThemedText style={styles.offerTitle}>{offer.title}</ThemedText>

      {/* Offer Description */}
      <ThemedText style={styles.offerDescription}>{offer.description}</ThemedText>

      {/* Coins and Apply Button */}
      <View style={styles.offerFooter}>
        <View style={styles.coinsEarn}>
          <Image
            source={require("@/assets/images/rez-coin.png")}
            style={styles.coinIcon}
            resizeMode="contain"
          />
          <ThemedText style={styles.coinsText}>Earn {offer.coinsToEarn} coins</ThemedText>
        </View>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={styles.applyButton}
            activeOpacity={0.8}
            onPress={handleApply}
            onPressIn={() => animateScale(0.95)}
            onPressOut={() => animateScale(1)}
            accessibilityRole="button"
            accessibilityLabel={`Apply offer: ${offer.title}`}
          >
            <ThemedText style={styles.applyButtonText}>Apply Offer</ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00C06A",
  },
  offersList: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  offerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    ...Shadows.subtle,
  },
  offerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  validity: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  offerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  coinsEarn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  coinIcon: {
    width: 20,
    height: 20,
  },
  coinsText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FF9500",
  },
  applyButton: {
    backgroundColor: "#00C06A",
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
