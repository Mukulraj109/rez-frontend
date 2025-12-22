/**
 * TrendingCashback Component
 *
 * Premium horizontal scroll section showing trending cashback deals
 * Features: Animated countdown timer, pulsing live indicator, progress bars
 */

import React, { memo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  TrendingDeal,
  formatTimeRemaining,
  getTimeRemainingMs,
  getBadgeColor,
} from '../../../types/cash-store.types';

interface TrendingCashbackProps {
  deals: TrendingDeal[];
  isLoading?: boolean;
  onDealPress: (deal: TrendingDeal) => void;
  onViewAllPress: () => void;
}

const TrendingDealCard: React.FC<{
  deal: TrendingDeal;
  index: number;
  onPress: () => void;
}> = memo(({ deal, index, onPress }) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemainingMs(deal.validUntil));
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const coinBounceAnim = useRef(new Animated.Value(0)).current;

  // Calculate progress (assuming 24h deals)
  const totalDuration = 24 * 60 * 60 * 1000; // 24 hours
  const progress = Math.min(Math.max((totalDuration - timeRemaining) / totalDuration, 0), 1);

  useEffect(() => {
    // Staggered entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for live indicator
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Coin bounce animation
    const coinLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(coinBounceAnim, {
          toValue: -3,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(coinBounceAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    coinLoop.start();

    // Update timer
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemainingMs(deal.validUntil));
    }, 1000); // Update every second

    // Cleanup: stop all animations and interval
    return () => {
      clearInterval(interval);
      pulseLoop.stop();
      coinLoop.stop();
    };
  }, [deal.validUntil, index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const isFlashSale = deal.isFlashSale || deal.badge === 'trending';

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Flash Sale / Live Indicator */}
        {isFlashSale && (
          <Animated.View
            style={[
              styles.liveIndicator,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </Animated.View>
        )}

        {/* Badge */}
        {deal.badge && !isFlashSale && (
          <LinearGradient
            colors={[getBadgeColor(deal.badge), getBadgeColor(deal.badge)]}
            style={styles.badge}
          >
            <Text style={styles.badgeText}>{deal.badge.toUpperCase()}</Text>
          </LinearGradient>
        )}

        {/* Brand Logo */}
        <View style={styles.logoContainer}>
          {deal.brand.logo ? (
            <Image
              source={{ uri: deal.brand.logo }}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          ) : (
            <LinearGradient
              colors={['#00C06A', '#059669']}
              style={styles.logoPlaceholder}
            >
              <Text style={styles.logoInitial}>{deal.brand.name.charAt(0)}</Text>
            </LinearGradient>
          )}
        </View>

        {/* Brand Name */}
        <Text style={styles.brandName} numberOfLines={1}>
          {deal.brand.name}
        </Text>

        {/* Cashback Rate - Highlighted */}
        <LinearGradient
          colors={['#00C06A', '#059669']}
          style={styles.cashbackContainer}
        >
          <Text style={styles.cashbackRate}>{deal.cashbackRate}%</Text>
          <Text style={styles.cashbackLabel}>Cashback</Text>
        </LinearGradient>

        {/* Bonus Coins */}
        {deal.bonusCoins && (
          <Animated.View
            style={[
              styles.bonusContainer,
              {
                transform: [{ translateY: coinBounceAnim }],
              },
            ]}
          >
            <Ionicons name="flash" size={14} color="#FFC857" />
            <Text style={styles.bonusText}>+{deal.bonusCoins} coins</Text>
          </Animated.View>
        )}

        {/* Timer with Progress Bar */}
        <View style={styles.timerWrapper}>
          <View style={styles.timerContainer}>
            <Ionicons name="time" size={12} color="#EF4444" />
            <Text style={styles.timerText}>{formatTimeRemaining(timeRemaining)}</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const SkeletonCard: React.FC<{ index: number }> = memo(({ index }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [index]);

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1],
          }),
        },
      ]}
    >
      <View style={styles.card}>
        <View style={[styles.logoContainer, styles.skeleton]} />
        <View style={[styles.skeletonText, { width: 80 }]} />
        <View style={[styles.skeletonBadge]} />
        <View style={[styles.skeletonText, { width: 60 }]} />
      </View>
    </Animated.View>
  );
});

const TrendingCashback: React.FC<TrendingCashbackProps> = ({
  deals,
  isLoading = false,
  onDealPress,
  onViewAllPress,
}) => {
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const flamePulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(headerFadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Flame pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(flamePulseAnim, {
          toValue: 1.15,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(flamePulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (deals.length === 0 && !isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerFadeAnim }]}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Trending Cashback</Text>
            <Animated.View style={{ transform: [{ scale: flamePulseAnim }] }}>
              <Ionicons name="flame" size={20} color="#EF4444" />
            </Animated.View>
          </View>
          <Text style={styles.subtitle}>Limited time offers - Don't miss out!</Text>
        </View>
        <TouchableOpacity
          onPress={onViewAllPress}
          style={styles.viewAllButton}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <View style={styles.viewAllArrow}>
            <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Horizontal List */}
      <FlatList
        data={isLoading ? Array.from({ length: 4 }) : deals}
        renderItem={({ item, index }) =>
          isLoading ? (
            <SkeletonCard key={`skeleton-${index}`} index={index} />
          ) : (
            <TrendingDealCard
              deal={item as TrendingDeal}
              index={index}
              onPress={() => onDealPress(item as TrendingDeal)}
            />
          )
        }
        keyExtractor={(item, index) =>
          isLoading ? `skeleton-${index}` : (item as TrendingDeal).id
        }
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    borderRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewAllArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  cardWrapper: {
    marginRight: 12,
  },
  card: {
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  liveIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    zIndex: 1,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  brandLogo: {
    width: 44,
    height: 44,
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitial: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  brandName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  cashbackContainer: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  cashbackRate: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  cashbackLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 1,
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  bonusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  timerWrapper: {
    width: '100%',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 6,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: -0.2,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#FEE2E2',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 2,
  },
  // Skeleton
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  skeletonText: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonBadge: {
    width: 80,
    height: 36,
    backgroundColor: '#E5E7EB',
    borderRadius: 14,
    marginBottom: 8,
  },
});

export default memo(TrendingCashback);
