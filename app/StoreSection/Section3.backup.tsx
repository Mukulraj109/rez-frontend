import React, { useState, useEffect } from "react";
import { View, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import discountsApi from "@/services/discountsApi";

interface Section3Props {
  productPrice?: number;
  storeId?: string;
}

export default function Section3({ productPrice = 1000, storeId }: Section3Props) {
  const [discount, setDiscount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDiscounts();
  }, [productPrice]);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await discountsApi.getBillPaymentDiscounts(productPrice);

      if (response.success && response.data && response.data.length > 0) {
        // Get the first/best discount
        setDiscount(response.data[0]);
      } else {
        // No discounts available, show default
        setDiscount(null);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      setError('Unable to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const displayText = discount?.metadata?.displayText || discount?.name || "Get Instant Discount";
  const discountText = discount
    ? `${discount.type === 'percentage' ? discount.value + '%' : '₹' + discount.value} Off${discount.applicableOn === 'bill_payment' ? ' on bill payment' : ''}`
    : "10% Off on bill payment";

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Middle text */}
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>{displayText}</ThemedText>
          {loading ? (
            <ActivityIndicator size="small" color="#666" />
          ) : (
            <ThemedText style={styles.subtitle}>{discountText}</ThemedText>
          )}
          {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
        </View>

        {/* Right icon badge */}
        <View style={styles.badge}>
          <ThemedText style={styles.badgeIcon}>⚡</ThemedText>
        </View>
      </View>
      {/* subtle dashed divider like the screenshot */}
      <View style={styles.divider} accessibilityElementsHidden />
    </View>
);
}

/* --- Styles --- */
interface Styles {
  container: ViewStyle;
  card: ViewStyle;
  image: ViewStyle;
  textContainer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  errorText: TextStyle;
  badge: ViewStyle;
  badgeIcon: TextStyle;
  divider: ViewStyle;
}

const PURPLE = "#6c63ff";
const BG = "#f8f9fa";
const PRIMARY_TEXT = "#333333";
const SECONDARY_TEXT = "#666666";

const styles = StyleSheet.create<Styles>({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG,
    paddingHorizontal: 14,
    paddingVertical: 17,
    borderRadius: 14,
    // subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: "#e9ecef",
    marginRight: 14,
   
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: PURPLE, // purple heading like screenshot
    marginBottom: 4,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 13,
    color: SECONDARY_TEXT,
    lineHeight: 18,
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    // elevated look
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ rotate: "0deg" }], // change if you want a tilt
  },
  badgeIcon: {
    fontSize: 22,
    color: "#fff",
    lineHeight: 22,
  },
  divider: {
    marginTop: 14,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderColor: "#eee",
    opacity: 0.9,
  },
});

