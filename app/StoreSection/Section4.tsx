import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
  ActivityIndicator,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface Section4Props {
  title?: string;
  subtitle?: string;
  iconEmoji?: string;
  // accept either a remote URL (string) or a local image module (number/object)
  cardImageUri?: string | number;
  testID?: string;
}

const PURPLE = "#6c63ff";
const BG = "#fbf9ff";
const SECONDARY_TEXT = "#666666";

// default to the local card image in assets
const DEFAULT_CARD_IMAGE = require('@/assets/images/card.jpg');

export default function Section4({
  title = "Upto 10% card offers",
  subtitle = "On 3 card & payment offers",
  iconEmoji = "🛍️",
  cardImageUri = DEFAULT_CARD_IMAGE,
  testID,
}: Section4Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [errored, setErrored] = useState<boolean>(false);

  // resolve Image source: remote -> { uri: ... } ; local module -> use directly
  const resolvedSource =
    typeof cardImageUri === "string" ? { uri: cardImageUri } : cardImageUri;

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.card}>
        {/* Left icon */}
        <View
          style={styles.iconContainer}
          accessible
          accessibilityRole="image"
          accessibilityLabel="card-offer-icon"
        >
          <ThemedText style={styles.icon}>{iconEmoji}</ThemedText>
        </View>

        {/* Middle text */}
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        </View>

        {/* Right rotated card/coupon */}
        <View style={styles.rightContainer} accessibilityElementsHidden>
          <View style={styles.coupon}>
            {/* loading spinner */}
            {loading && !errored && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color="#ffffff" />
              </View>
            )}

            {/* Image fills the coupon; onError swaps to fallback */}
            {!errored ? (
              <Image
                // resolvedSource will be either { uri: 'https://...' } or require('./card.jpg')
                source={resolvedSource as any}
                style={styles.couponImage}
                resizeMode="cover"
                onLoad={() => setLoading(false)}
                onError={(e) => {
                  console.warn("Coupon image failed to load:", e.nativeEvent);
                  setErrored(true);
                  setLoading(false);
                }}
                accessibilityLabel="card-offer-image"
              />
            ) : (
              // fallback visual (keeps layout & style)
              <View style={styles.fallback}>
                <ThemedText style={styles.fallbackPercent}>%</ThemedText>
              </View>
            )}

            <View style={styles.couponBadge}>
              <ThemedText style={styles.couponBadgeText}>%</ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* dashed divider */}
      <View style={styles.divider} />
    </View>
  );
}

/* --- Styles --- */
interface Styles {
  container: ViewStyle;
  card: ViewStyle;
  iconContainer: ViewStyle;
  icon: TextStyle;
  textContainer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  rightContainer: ViewStyle;
  coupon: ViewStyle;
  couponImage: ImageStyle;
  loaderContainer: ViewStyle;
  fallback: ViewStyle;
  fallbackPercent: TextStyle;
  couponBadge: ViewStyle;
  couponBadgeText: TextStyle;
  divider: ViewStyle;
}

const shadowIos = {
  shadowColor: PURPLE,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.14,
  shadowRadius: 8,
};

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
    paddingVertical: 12,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#efe8ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    ...Platform.select({
      ios: {
        shadowColor: PURPLE,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  icon: {
    fontSize: 22,
    color: PURPLE,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: PURPLE,
    marginBottom: 4,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 13,
    color: SECONDARY_TEXT,
    lineHeight: 18,
  },

  // Right area with rotated coupon/card
  rightContainer: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  coupon: {
    width: 60,
    height: 44,
    borderRadius: 10,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "10deg" }],
    overflow: "hidden", // child image clipped to rounded corners
    ...Platform.select({
      ios: { ...shadowIos },
      android: { elevation: 4 },
    }),
  },
  couponImage: {
    width: "100%",
    height: "100%",
  },
  loaderContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.0)",
  },
  fallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ecd9ff",
  },
  fallbackPercent: {
    color: PURPLE,
    fontSize: 20,
    fontWeight: "800",
  },
  couponBadge: {
    position: "absolute",
    right: -6,
    top: 6,
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-10deg" }],
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  couponBadgeText: {
    color: PURPLE,
    fontWeight: "800",
    fontSize: 12,
  },

  divider: {
    marginTop: 14,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderColor: "#eee",
    opacity: 0.95,
  },
});
