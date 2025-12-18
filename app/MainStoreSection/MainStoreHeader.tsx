// MainStoreHeader.tsx - Redesigned for new MainStorePage UI
import React, { useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  StatusBar,
  Animated,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { triggerImpact } from "@/utils/haptics";
import { ThemedText } from "@/components/ThemedText";
import ReZCoin from "@/components/homepage/ReZCoin";
import {
  Colors,
  Spacing,
  Shadows,
  BorderRadius,
} from "@/constants/DesignSystem";

export interface MainStoreHeaderProps {
  storeName?: string;
  storeCategory?: string;
  onBack?: () => void;
  onFavoritePress?: () => void;
  isFavorited?: boolean;
  showBack?: boolean;
  userCoins?: number;
  storeId?: string;
}

export default function MainStoreHeader({
  storeName = "Store",
  storeCategory = "Store",
  onBack,
  onFavoritePress,
  isFavorited = false,
  showBack = true,
  userCoins = 0,
  storeId,
}: MainStoreHeaderProps) {
  const router = useRouter();
  const { width, height } = Dimensions.get("window");
  const isSmall = width < 360;
  const topPadding =
    Platform.OS === "ios" ? (height >= 812 ? 44 : 20) : StatusBar.currentHeight ?? 24;

  // Animation refs
  const backButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const favoriteScaleAnim = useRef(new Animated.Value(1)).current;
  const shareScaleAnim = useRef(new Animated.Value(1)).current;

  // Handlers with haptic feedback
  const handleBack = () => {
    triggerImpact('Medium');
    if (onBack) onBack();
    else router.back();
  };

  const handleFavoritePress = () => {
    triggerImpact('Light');
    if (onFavoritePress) onFavoritePress();
  };

  const handleSharePress = async () => {
    triggerImpact('Light');
    try {
      await Share.share({
        message: `Check out ${storeName} on ReZ! Get amazing cashback and rewards.`,
        title: storeName,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleCoinPress = () => {
    triggerImpact('Light');
    if (Platform.OS === 'ios') {
      setTimeout(() => router.push('/CoinPage'), 50);
    } else {
      router.push('/CoinPage');
    }
  };

  // Animation handlers
  const animateScale = (animValue: Animated.Value, toValue: number) => {
    Animated.spring(animValue, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.inner}>
        {/* Back Button */}
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: backButtonScaleAnim }] },
          ]}
        >
          {showBack && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleBack}
              onPressIn={() => animateScale(backButtonScaleAnim, 0.9)}
              onPressOut={() => animateScale(backButtonScaleAnim, 1)}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.iconButton}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Title & Subtitle */}
        <View style={styles.titleContainer}>
          <ThemedText style={[styles.title, isSmall && styles.titleSmall]} numberOfLines={1}>
            {storeName}
          </ThemedText>
          {storeCategory && (
            <ThemedText style={[styles.subtitle, isSmall && styles.subtitleSmall]} numberOfLines={1}>
              {storeCategory}
            </ThemedText>
          )}
        </View>

        {/* Right Actions */}
        <View style={styles.rightActions}>
          {/* Favorite Button */}
          <Animated.View style={{ transform: [{ scale: favoriteScaleAnim }] }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleFavoritePress}
              onPressIn={() => animateScale(favoriteScaleAnim, 0.9)}
              onPressOut={() => animateScale(favoriteScaleAnim, 1)}
              accessibilityRole="button"
              accessibilityLabel={isFavorited ? "Remove from favorites" : "Add to favorites"}
              style={styles.iconButton}
            >
              <Ionicons
                name={isFavorited ? "heart" : "heart-outline"}
                size={24}
                color={isFavorited ? "#FF4757" : Colors.text.secondary}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Share Button */}
          <Animated.View style={{ transform: [{ scale: shareScaleAnim }] }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSharePress}
              onPressIn={() => animateScale(shareScaleAnim, 0.9)}
              onPressOut={() => animateScale(shareScaleAnim, 1)}
              accessibilityRole="button"
              accessibilityLabel="Share store"
              style={styles.iconButton}
            >
              <Ionicons name="share-outline" size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
          </Animated.View>

          {/* Coin Display */}
          <ReZCoin
            balance={userCoins}
            size="small"
            onPress={handleCoinPress}
            style={styles.coinDisplay}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.06)",
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    minHeight: 56,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.full,
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  titleSmall: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  subtitleSmall: {
    fontSize: 11,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  coinDisplay: {
    backgroundColor: Colors.primary.DEFAULT || '#00C06A',
    marginLeft: 4,
  },
});
