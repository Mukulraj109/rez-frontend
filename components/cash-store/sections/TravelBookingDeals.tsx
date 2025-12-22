/**
 * TravelBookingDeals Component
 *
 * Premium 2x2 grid of travel category cards (Flights, Hotels, Cabs, Experiences)
 * Features: Animated entries, travel-themed gradients, partner logos, decorative elements
 */

import React, { memo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TravelDeal, getTravelDealGradient } from '../../../types/cash-store.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 16px padding + 16px gap

interface TravelBookingDealsProps {
  deals: TravelDeal[];
  isLoading?: boolean;
  onDealPress: (deal: TravelDeal) => void;
  onViewAllPress: () => void;
}

const TravelCard: React.FC<{
  deal: TravelDeal;
  index: number;
  onPress: () => void;
}> = memo(({ deal, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const iconFloatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating icon animation
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(iconFloatAnim, {
          toValue: -4,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(iconFloatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();

    // Cleanup: stop animation on unmount
    return () => {
      floatLoop.stop();
    };
  }, [index]);

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

  const gradientColors = deal.gradientColors || getTravelDealGradient(deal.category);
  const iconName = deal.icon as any;

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
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Decorative elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeLine} />

          {/* Bonus Coins Badge */}
          {deal.bonusCoins && (
            <View style={styles.bonusBadge}>
              <Ionicons name="flash" size={10} color="#FFC857" />
              <Text style={styles.bonusText}>+{deal.bonusCoins} coins</Text>
            </View>
          )}

          {/* Icon Container */}
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ translateY: iconFloatAnim }] },
            ]}
          >
            <Ionicons name={iconName} size={32} color="#FFFFFF" />
          </Animated.View>

          {/* Content */}
          <View style={styles.cardContent}>
            <Text style={styles.categoryTitle}>{deal.title}</Text>
            <View style={styles.cashbackContainer}>
              <Text style={styles.cashbackLabel}>Cashback</Text>
              <Text style={styles.cashbackRate}>Up to {deal.cashbackRate}%</Text>
            </View>
          </View>

          {/* Partners Preview */}
          {deal.partners && deal.partners.length > 0 && (
            <View style={styles.partnersContainer}>
              <Text style={styles.partnersLabel}>Partners:</Text>
              <Text style={styles.partnersText} numberOfLines={1}>
                {deal.partners.slice(0, 3).join(', ')}
              </Text>
            </View>
          )}

          {/* Arrow Button */}
          <View style={styles.arrowContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
              style={styles.arrowGradient}
            >
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </LinearGradient>
          </View>
        </LinearGradient>
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
    <View style={styles.cardWrapper}>
      <Animated.View
        style={[
          styles.card,
          {
            opacity: shimmerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1],
            }),
          },
        ]}
      >
        <View style={[styles.cardGradient, styles.skeleton]} />
      </Animated.View>
    </View>
  );
});

const TravelBookingDeals: React.FC<TravelBookingDealsProps> = ({
  deals,
  isLoading = false,
  onDealPress,
  onViewAllPress,
}) => {
  const displayDeals = deals.slice(0, 4); // Max 4 for 2x2 grid
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const planeBounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Plane animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(planeBounceAnim, {
          toValue: 6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(planeBounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerFadeAnim }]}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>Travel & Booking</Text>
            <Animated.View style={{ transform: [{ translateX: planeBounceAnim }] }}>
              <Ionicons name="airplane" size={20} color="#667EEA" />
            </Animated.View>
          </View>
          <Text style={styles.subtitle}>Earn cashback on every trip</Text>
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

      {/* 2x2 Grid */}
      <View style={styles.grid}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={`skeleton-${index}`} index={index} />)
          : displayDeals.map((deal, index) => (
              <TravelCard key={deal.id} deal={deal} index={index} onPress={() => onDealPress(deal)} />
            ))}
      </View>
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
  headerTitle: {
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
    backgroundColor: '#667EEA',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginHorizontal: 4,
    marginBottom: 12,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#667EEA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardGradient: {
    padding: 18,
    minHeight: 140,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -25,
    left: -25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorativeLine: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    transform: [{ rotate: '45deg' }],
  },
  bonusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 1,
  },
  bonusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFC857',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cardContent: {
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  cashbackContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  cashbackLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  cashbackRate: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  partnersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  partnersLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  partnersText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    flex: 1,
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 14,
    right: 14,
  },
  arrowGradient: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Skeleton
  skeleton: {
    backgroundColor: '#E5E7EB',
    minHeight: 140,
  },
});

export default memo(TravelBookingDeals);
