/**
 * PaymentStoreCard Component
 *
 * Premium store card for payment flow with animations, 3D shadows, and press feedback.
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeInDown,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import {
  PaymentStoreCardProps,
  PaymentStoreInfo,
  PAYMENT_SEARCH_COLORS,
  PAYMENT_SEARCH_SHADOWS,
  SEARCH_ANIMATIONS,
} from '@/types/paymentStoreSearch.types';
import { RezPayBadge } from './RezPayBadge';
import { RewardsBadge } from './RewardsBadge';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
  damping: SEARCH_ANIMATIONS.pressScale.damping,
  stiffness: SEARCH_ANIMATIONS.pressScale.stiffness,
};

export const PaymentStoreCard: React.FC<PaymentStoreCardProps> = ({
  store,
  onPress,
  index = 0,
  variant = 'full',
  showCTA = true,
}) => {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, SPRING_CONFIG);
    pressed.value = withTiming(1, { duration: 100 });
  }, [scale, pressed]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
    pressed.value = withTiming(0, { duration: 150 });
  }, [scale, pressed]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      pressed.value,
      [0, 1],
      [PAYMENT_SEARCH_SHADOWS.card.shadowOpacity, PAYMENT_SEARCH_SHADOWS.cardPressed.shadowOpacity],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale: scale.value }],
      shadowOpacity,
    };
  });

  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  const renderRating = () => {
    if (!store.ratings?.average) return null;
    return (
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={12} color="#FFC857" />
        <Text style={styles.ratingText}>{store.ratings.average.toFixed(1)}</Text>
        {store.ratings.count > 0 && (
          <Text style={styles.ratingCount}>({store.ratings.count})</Text>
        )}
      </View>
    );
  };

  if (variant === 'compact') {
    return (
      <AnimatedPressable
        onPress={() => onPress(store)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        entering={FadeInDown.delay(index * 80).springify().damping(15)}
        style={[styles.compactContainer, animatedContainerStyle, PAYMENT_SEARCH_SHADOWS.card]}
      >
        <View style={styles.compactLogoContainer}>
          {store.logo ? (
            <Image source={{ uri: store.logo }} style={styles.compactLogo} resizeMode="cover" />
          ) : (
            <View style={styles.compactLogoPlaceholder}>
              <Ionicons name="storefront" size={24} color="#9CA3AF" />
            </View>
          )}
        </View>
        <Text style={styles.compactName} numberOfLines={2}>{store.name}</Text>
        {store.distance !== undefined && (
          <Text style={styles.compactDistance}>{formatDistance(store.distance)}</Text>
        )}
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={() => onPress(store)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      entering={FadeInDown.delay(index * 80).springify().damping(15)}
      style={[styles.container, animatedContainerStyle, PAYMENT_SEARCH_SHADOWS.card]}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.logoContainer}>
          {store.logo ? (
            <Image source={{ uri: store.logo }} style={styles.logo} resizeMode="cover" />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Ionicons name="storefront" size={28} color="#9CA3AF" />
            </View>
          )}
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
          <View style={styles.metaRow}>
            {store.distance !== undefined && (
              <>
                <Ionicons name="location-outline" size={12} color={PAYMENT_SEARCH_COLORS.textSecondary} />
                <Text style={styles.metaText}>{formatDistance(store.distance)}</Text>
                <Text style={styles.metaDot}>•</Text>
              </>
            )}
            <Text style={styles.categoryText}>{store.category.name}</Text>
          </View>
        </View>

        {renderRating()}
      </View>

      {/* Badges Row */}
      <View style={styles.badgesRow}>
        {store.hasRezPay && <RezPayBadge size="small" />}
        {store.maxCashback && store.maxCashback > 0 && (
          <RewardsBadge cashbackPercent={store.maxCashback} size="small" />
        )}
      </View>

      {/* CTA Button */}
      {showCTA && (
        <LinearGradient
          colors={[PAYMENT_SEARCH_COLORS.primary, PAYMENT_SEARCH_COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaText}>Pay at Store</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={styles.ctaIcon} />
        </LinearGradient>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  // Full variant styles
  container: {
    backgroundColor: PAYMENT_SEARCH_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '700',
    color: PAYMENT_SEARCH_COLORS.textPrimary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: PAYMENT_SEARCH_COLORS.textSecondary,
    marginLeft: 2,
  },
  metaDot: {
    fontSize: 12,
    color: PAYMENT_SEARCH_COLORS.textTertiary,
    marginHorizontal: 6,
  },
  categoryText: {
    fontSize: 12,
    color: PAYMENT_SEARCH_COLORS.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: PAYMENT_SEARCH_COLORS.textPrimary,
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 10,
    color: PAYMENT_SEARCH_COLORS.textTertiary,
    marginLeft: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ctaIcon: {
    marginLeft: 6,
  },

  // Compact variant styles
  compactContainer: {
    backgroundColor: PAYMENT_SEARCH_COLORS.surface,
    borderRadius: 12,
    padding: 12,
    width: 120,
    alignItems: 'center',
    marginRight: 12,
  },
  compactLogoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
    position: 'relative',
  },
  compactLogo: {
    width: '100%',
    height: '100%',
  },
  compactLogoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  compactName: {
    fontSize: 12,
    fontWeight: '600',
    color: PAYMENT_SEARCH_COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  compactDistance: {
    fontSize: 10,
    color: PAYMENT_SEARCH_COLORS.textSecondary,
  },
});

export default PaymentStoreCard;
