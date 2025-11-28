import React, { useState, useEffect, memo, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { triggerImpact, triggerNotification } from "@/utils/haptics";
import { ThemedText } from "@/components/ThemedText";
import discountsApi, { Discount } from "@/services/discountsApi";
import { ImageSourcePropType } from "react-native";
import {
  Colors,
  Spacing,
  Shadows,
  BorderRadius,
  Typography,
  IconSize,
  Timing,
} from "@/constants/DesignSystem";

interface Section4Props {
  title?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  // accept either a remote URL (string) or a local image module (number/object)
  cardImageUri?: string | ImageSourcePropType;
  productPrice?: number;
  storeId?: string; // NEW: Store ID for filtering card offers
  testID?: string;
  onPress?: () => void;
}

// default to the local card image in assets
const DEFAULT_CARD_IMAGE = require('@/assets/images/card.jpg');

export default memo(function Section4({
  title: initialTitle = "Upto 10% card offers",
  subtitle: initialSubtitle = "On 3 card & payment offers",
  icon = "card-outline",
  cardImageUri = DEFAULT_CARD_IMAGE,
  productPrice = 1000,
  storeId,
  testID,
  onPress,
}: Section4Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [errored, setErrored] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [cardOffers, setCardOffers] = useState<Discount[]>([]);
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);

  // Animation ref for micro-interactions
  const cardScaleAnim = useRef(new Animated.Value(1)).current;

  // Animation helper
  const animateScale = (animValue: Animated.Value, toValue: number) => {
    Animated.spring(animValue, {
      toValue,
      useNativeDriver: true,
      ...Timing.springBouncy,
    }).start();
  };

  // Handle card press with haptic feedback
  const handlePress = () => {
    if (!onPress) return;

    triggerImpact('Light');

    onPress();
  };

  useEffect(() => {
    fetchCardOffers();
  }, [productPrice, storeId]);

  const fetchCardOffers = async () => {
    try {
      setLoading(true);

      // Use new getCardOffers API with storeId filtering
      const response = await discountsApi.getCardOffers({
        storeId,
        orderValue: productPrice,
        page: 1,
        limit: 10,
      });

      if (response.success && response.data?.discounts && response.data.discounts.length > 0) {
        setCardOffers(response.data.discounts);

        // Update title based on best offer
        const bestOffer = response.data.discounts[0];
        const maxDiscount = bestOffer.type === 'percentage' ? bestOffer.value : null;

        if (maxDiscount) {
          setTitle(`Upto ${maxDiscount}% card offers`);
        }

        const offersCount = response.data.discounts.length;
        setSubtitle(`On ${offersCount} card & payment offer${offersCount > 1 ? 's' : ''}`);
      } else {
        // Reset to defaults if no offers
        setTitle(initialTitle);
        setSubtitle(initialSubtitle);
        setCardOffers([]);
      }
    } catch (error) {
      // Silent fail - show default content
      setTitle(initialTitle);
      setSubtitle(initialSubtitle);
      setCardOffers([]);
    } finally {
      setLoading(false);
    }
  };

  // resolve Image source: remote -> { uri: ... } ; local module -> use directly
  const resolvedSource: ImageSourcePropType =
    typeof cardImageUri === "string" ? { uri: cardImageUri } : cardImageUri;

  // Wrap in TouchableOpacity if onPress is provided
  const CardWrapper = onPress ? TouchableOpacity : View;
  const cardWrapperProps = onPress
    ? {
        activeOpacity: 0.8,
        onPress: handlePress,
        onPressIn: () => animateScale(cardScaleAnim, 0.97),
        onPressOut: () => animateScale(cardScaleAnim, 1),
      }
    : {};

  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityRole="region"
      accessibilityLabel="Card payment offers"
    >
      <Animated.View style={{ transform: [{ scale: cardScaleAnim }] }}>
        <CardWrapper
          style={styles.card}
          accessibilityLabel={`${title}. ${subtitle}`}
          accessibilityRole={onPress ? "button" : "summary"}
          accessibilityHint={onPress ? "Double tap to view offer details" : undefined}
          {...cardWrapperProps}
        >
          {/* Left icon */}
          <View
            style={styles.iconContainer}
            accessible
            accessibilityRole="image"
            accessibilityLabel="card-offer-icon"
          >
            <Ionicons name={icon} size={IconSize.lg} color={Colors.primary[600]} />
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
            {imageLoading && !errored && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color="#ffffff" />
              </View>
            )}

            {/* Image fills the coupon; onError swaps to fallback */}
            {!errored ? (
              <Image
                // resolvedSource will be either { uri: 'https://...' } or require('./card.jpg')
                source={resolvedSource}
                style={styles.couponImage}
                resizeMode="cover"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setErrored(true);
                  setImageLoading(false);
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
        </CardWrapper>
      </Animated.View>

      {/* dashed divider */}
      <View style={styles.divider} />
    </View>
  );
});

/* --- Styles --- */
interface Styles {
  container: ViewStyle;
  card: ViewStyle;
  iconContainer: ViewStyle;
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

const styles = StyleSheet.create<Styles>({
  // Modern Container
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    backgroundColor: Colors.background.primary,
  },

  // Modern Card with Purple Tint
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.purpleLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    ...Shadows.subtle,
  },

  // Modern Icon Container
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
    ...Shadows.purpleSubtle,
  },

  textContainer: {
    flex: 1,
    justifyContent: "center",
  },

  // Modern Typography
  title: {
    ...Typography.bodyLarge,
    fontWeight: "700",
    color: Colors.primary[600],
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.gray[600],
    lineHeight: 18,
  },

  // Modern Rotated Coupon Area
  rightContainer: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
  coupon: {
    width: 60,
    height: 44,
    borderRadius: BorderRadius.md - 2,
    backgroundColor: Colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "10deg" }],
    overflow: "hidden",
    ...Shadows.purpleMedium,
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
    backgroundColor: Colors.primary[100],
  },
  fallbackPercent: {
    color: Colors.primary[600],
    fontSize: 20,
    fontWeight: "800",
  },

  // Modern Badge
  couponBadge: {
    position: "absolute",
    right: -6,
    top: 6,
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background.primary,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-10deg" }],
    ...Shadows.subtle,
  },
  couponBadgeText: {
    color: Colors.primary[600],
    fontWeight: "800",
    fontSize: 12,
  },

  // Modern Divider
  divider: {
    marginTop: Spacing.md,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.gray[100],
    opacity: 0.95,
  },
});
