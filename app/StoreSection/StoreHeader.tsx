import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons , MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { triggerImpact, triggerNotification } from "@/utils/haptics";
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useGamification } from '@/contexts/GamificationContext';
import {
  Colors,
  Spacing,
  Shadows,
  BorderRadius,
  Typography,
  IconSize,
  Timing,
  Gradients,
} from '@/constants/DesignSystem';

interface StoreHeaderProps {
  dynamicData?: {
    title?: string;
    description?: string;
    image?: string;
    merchant?: string;
    category?: string;
    rating?: number;
    section?: string;
    [key: string]: any;
  } | null;
  cardType?: string;
}

export default function StoreHeader({ dynamicData, cardType }: StoreHeaderProps) {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const { coinBalance, isLoading: isLoadingPoints } = useGamification();

  // Animation refs
  const backScaleAnim = useRef(new Animated.Value(1)).current;
  const cartScaleAnim = useRef(new Animated.Value(1)).current;
  const heartScaleAnim = useRef(new Animated.Value(1)).current;

  // Haptic feedback handlers
  const handleBackPress = () => {
    triggerImpact('Medium');
    router.back();
  };

  const handleCartPress = () => {
    triggerImpact('Light');
    router.push('/CartPage');
  };

  const handleCoinPress = () => {
    triggerImpact('Light');
    router.push('/CoinPage');
  };

  const handleFavoritePress = () => {
    triggerImpact('Medium');
    // Add favorite logic here
  };

  // Animation helper
  const animateScale = (animValue: Animated.Value, toValue: number) => {
    Animated.spring(animValue, {
      toValue,
      useNativeDriver: true,
      ...Timing.springBouncy,
    }).start();
  };

  // Use dynamic data if available, otherwise use defaults
  const storeTitle = dynamicData?.title || "Featured Store";
  
  // Validate image URL - only use if it's a valid URL and not empty
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url || url.trim() === '') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  const storeImageUrl = isValidImageUrl(dynamicData?.image) 
    ? dynamicData.image 
    : null; // No fallback image - show placeholder instead
  const merchantName = dynamicData?.merchant || "Premium Merchant";
  const category = dynamicData?.category || "General";
  
  // Safely handle rating with proper type checking
  const rawRating = dynamicData?.rating;
  const rating = typeof rawRating === 'number' && !isNaN(rawRating) ? rawRating : 4.5;
  
  const sectionLabel = cardType === 'just_for_you' ? 'Recommended for You' : 
                      cardType === 'new_arrivals' ? 'New Arrival' : 'Featured';
  
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Top gradient overlay */}
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.05)', 'transparent']}
        style={styles.gradientOverlay}
      />
      
      {/* Header actions */}
      <View style={styles.header}>
        <Animated.View style={{ transform: [{ scale: backScaleAnim }] }}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: surfaceColor }]}
            onPress={handleBackPress}
            onPressIn={() => animateScale(backScaleAnim, 0.92)}
            onPressOut={() => animateScale(backScaleAnim, 1)}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Double tap to return to previous screen"
          >
            <Ionicons name="arrow-back" size={IconSize.md} color={textColor} />
          </TouchableOpacity>
        </Animated.View>
        
        <View style={styles.centerInfo}>
          <TouchableOpacity
            style={[styles.ratingBadge, { backgroundColor: primaryColor }]}
            onPress={handleCoinPress}
            accessibilityLabel={`Coin balance: ${isLoadingPoints ? 'Loading' : (coinBalance?.total ?? 0).toLocaleString()} coins`}
            accessibilityRole="button"
            accessibilityHint="Double tap to view coin details"
          >
            <Ionicons name="star" size={IconSize.sm} color="#FFD700" />
            <ThemedText style={styles.ratingText}>
              {isLoadingPoints ? '...' : (coinBalance?.total ?? 0).toLocaleString()}
            </ThemedText>
          </TouchableOpacity>
          {/* Dynamic section label */}
          {dynamicData && (
            <ThemedText style={[styles.sectionLabel, { color: primaryColor }]}>
              {sectionLabel}
            </ThemedText>
          )}
          {/* Dynamic category badge */}
          {dynamicData?.category && (
            <ThemedText style={[styles.categoryBadge, { backgroundColor: primaryColor + '20' }]}>
              {category}
            </ThemedText>
          )}
        </View>
        
        <View style={styles.rightIcons}>
          <Animated.View style={{ transform: [{ scale: cartScaleAnim }] }}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: surfaceColor }]}
              onPress={handleCartPress}
              onPressIn={() => animateScale(cartScaleAnim, 0.92)}
              onPressOut={() => animateScale(cartScaleAnim, 1)}
              accessibilityLabel="Open cart"
              accessibilityRole="button"
              accessibilityHint="Double tap to view shopping cart"
            >
              <Ionicons name="bag-outline" size={IconSize.md} color={textColor} />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: surfaceColor }]}
              onPress={handleFavoritePress}
              onPressIn={() => animateScale(heartScaleAnim, 0.92)}
              onPressOut={() => animateScale(heartScaleAnim, 1)}
              accessibilityLabel="Add to favorites"
              accessibilityRole="button"
              accessibilityHint="Double tap to add this item to favorites"
            >
              <Ionicons name="heart-outline" size={IconSize.md} color={textColor} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
      
      {/* Product / Store image */}
      <View style={[styles.productImageContainer, { backgroundColor: surfaceColor }]}>
        {storeImageUrl ? (
          <Image
            source={{ uri: storeImageUrl }}
            style={styles.productImage}
            resizeMode="cover"
            onError={(e) => {
              // Only log once, don't cause re-renders
              if (!e.nativeEvent.error) return;
              console.warn('⚠️ [STORE HEADER] Image load failed:', storeImageUrl);
            }}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="image-outline" size={64} color={Colors.gray[300]} />
            <ThemedText style={styles.placeholderText}>No Image Available</ThemedText>
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)']}
          style={styles.imageGradient}
        />

        {/* Brand icon badge */}
        <View style={[styles.brandBadge, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]}>
          <Ionicons name="storefront" size={IconSize.sm} color={primaryColor} />
        </View>
      </View>
    </View>
);
}

const styles = StyleSheet.create({
  container: { position: 'relative' },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 1,
  },

  // Modern Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    paddingTop: 50,
    zIndex: 2,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
  centerInfo: { alignItems: 'center' },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: 25,
    ...Shadows.medium,
    gap: Spacing.xs,
  },
  ratingText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text.white,
  },
  sectionLabel: {
    ...Typography.caption,
    fontWeight: '600',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  // Modern Product Image
  productImageContainer: {
    position: 'relative',
    height: 340,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.strong,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
  },
  placeholderText: {
    ...Typography.h4,
    color: Colors.gray[500],
    marginTop: Spacing.sm,
    fontWeight: '500',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
  },

  // Modern Brand Badge
  brandBadge: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    width: 48,
    height: 48,
    borderRadius: BorderRadius['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
  textOverlay: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: 80,
    paddingRight: Spacing.lg,
  },
  storeName: {
    ...Typography.h3,
    color: Colors.text.white,
  },
  storeCategory: {
    ...Typography.body,
    color: '#eee',
    marginTop: 2,
  },
});
