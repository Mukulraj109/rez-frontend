// Section4.tsx - Premium Glassmorphism Design
// Card Offers Section - Green & Gold Theme

import React, { useState, useEffect, memo, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { triggerImpact } from "@/utils/haptics";
import { ThemedText } from "@/components/ThemedText";
import discountsApi, { Discount } from "@/services/discountsApi";
import { ImageSourcePropType } from "react-native";

// Premium Glass Design Tokens - Green & Gold Theme
const GLASS = {
  lightBg: 'rgba(255, 255, 255, 0.8)',
  lightBorder: 'rgba(255, 255, 255, 0.5)',
  lightHighlight: 'rgba(255, 255, 255, 0.9)',
  frostedBg: 'rgba(255, 255, 255, 0.92)',
  tintedGreenBg: 'rgba(0, 192, 106, 0.08)',
  tintedGreenBorder: 'rgba(0, 192, 106, 0.2)',
  tintedGoldBg: 'rgba(255, 200, 87, 0.12)',
  tintedGoldBorder: 'rgba(255, 200, 87, 0.35)',
};

const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00996B',
  gold: '#FFC857',
  goldDark: '#E5A500',
  navy: '#0B2240',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  surface: '#F7FAFC',
};

interface Section4Props {
  title?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  cardImageUri?: string | ImageSourcePropType;
  productPrice?: number;
  storeId?: string;
  testID?: string;
  onPress?: () => void;
}

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

  // Animation refs
  const cardScale = useRef(new Animated.Value(1)).current;

  const animatePress = (toValue: number) => {
    Animated.spring(cardScale, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

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

      const response = await discountsApi.getCardOffers({
        storeId,
        orderValue: productPrice,
        page: 1,
        limit: 10,
      });

      if (response.success && response.data?.discounts && response.data.discounts.length > 0) {
        setCardOffers(response.data.discounts);

        const bestOffer = response.data.discounts[0];
        const maxDiscount = bestOffer.type === 'percentage' ? bestOffer.value : null;

        if (maxDiscount) {
          setTitle(`Upto ${maxDiscount}% card offers`);
        }

        const offersCount = response.data.discounts.length;
        setSubtitle(`On ${offersCount} card & payment offer${offersCount > 1 ? 's' : ''}`);
      } else {
        setTitle(initialTitle);
        setSubtitle(initialSubtitle);
        setCardOffers([]);
      }
    } catch (error) {
      setTitle(initialTitle);
      setSubtitle(initialSubtitle);
      setCardOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const resolvedSource: ImageSourcePropType =
    typeof cardImageUri === "string" ? { uri: cardImageUri } : cardImageUri;

  const CardWrapper = onPress ? TouchableOpacity : View;
  const cardWrapperProps = onPress
    ? {
        activeOpacity: 1,
        onPress: handlePress,
        onPressIn: () => animatePress(0.97),
        onPressOut: () => animatePress(1),
      }
    : {};

  return (
    <View style={styles.container} testID={testID}>
      <Animated.View style={[styles.cardWrapper, { transform: [{ scale: cardScale }] }]}>
        {/* Glass Card */}
        {Platform.OS === 'ios' ? (
          <BlurView intensity={50} tint="light" style={styles.card}>
            <CardWrapper
              style={styles.cardContent}
              accessibilityLabel={`${title}. ${subtitle}`}
              accessibilityRole={onPress ? "button" : "summary"}
              accessibilityHint={onPress ? "Double tap to view offer details" : undefined}
              {...cardWrapperProps}
            >
              {renderContent()}
            </CardWrapper>
          </BlurView>
        ) : (
          <View style={[styles.card, styles.cardAndroid]}>
            <CardWrapper
              style={styles.cardContent}
              accessibilityLabel={`${title}. ${subtitle}`}
              accessibilityRole={onPress ? "button" : "summary"}
              accessibilityHint={onPress ? "Double tap to view offer details" : undefined}
              {...cardWrapperProps}
            >
              {renderContent()}
            </CardWrapper>
          </View>
        )}
      </Animated.View>

      {/* Divider */}
      <View style={styles.divider} />
    </View>
  );

  function renderContent() {
    return (
      <>
        {/* Glass Highlight */}
        <View style={styles.glassHighlight} />

        {/* Left Icon */}
        <LinearGradient
          colors={[COLORS.gold, COLORS.goldDark]}
          style={styles.iconContainer}
        >
          <Ionicons name={icon} size={24} color={COLORS.navy} />
        </LinearGradient>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        </View>

        {/* Right Card/Coupon Visual */}
        <View style={styles.rightContainer}>
          <View style={styles.couponWrapper}>
            {imageLoading && !errored && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color={COLORS.white} />
              </View>
            )}

            {!errored ? (
              <Image
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
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.fallback}
              >
                <ThemedText style={styles.fallbackPercent}>%</ThemedText>
              </LinearGradient>
            )}

            {/* Percentage Badge */}
            <View style={styles.couponBadge}>
              <ThemedText style={styles.couponBadgeText}>%</ThemedText>
            </View>
          </View>
        </View>
      </>
    );
  }
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  cardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },

  cardAndroid: {
    backgroundColor: '#FFFFFF',
  },

  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },

  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 0,
  },

  // Icon Container
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  // Text Container
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: '#1F2937',
    marginBottom: 3,
    lineHeight: 20,
  },

  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    fontWeight: '500',
  },

  // Right Coupon Visual
  rightContainer: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },

  couponWrapper: {
    width: 60,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "6deg" }],
    overflow: "hidden",
    backgroundColor: '#F9FAFB',
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 2, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.15)',
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
    backgroundColor: '#00C06A',
  },

  fallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  fallbackPercent: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: "800",
  },

  // Badge
  couponBadge: {
    position: "absolute",
    right: -6,
    top: 2,
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-6deg" }],
    borderWidth: 2,
    borderColor: '#F59E0B',
    ...Platform.select({
      ios: {
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  couponBadgeText: {
    color: '#F59E0B',
    fontWeight: "800",
    fontSize: 13,
  },

  // Divider
  divider: {
    marginTop: 12,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderColor: '#E5E7EB',
  },
});
