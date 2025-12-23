/**
 * CashStoreQuickActions Component
 *
 * Premium 2x2 grid of quick action cards for Cash Store
 * Features: Animated icons, notification badges, gradient backgrounds
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
import { CashStoreQuickAction } from '../../../types/cash-store.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - (HORIZONTAL_PADDING * 2) - CARD_GAP) / 2;

// Default 4 quick actions if not provided
const DEFAULT_QUICK_ACTIONS: CashStoreQuickAction[] = [
  {
    id: 'buy-coupons',
    title: 'Buy Coupons',
    subtitle: 'Get extra cashback',
    icon: 'pricetag',
    backgroundColor: '#FF9F1C',
    gradientColors: ['#FF9F1C', '#F77F00'],
    action: 'buy-coupons',
  },
  {
    id: 'extra-coins',
    title: 'Extra ReZ Coins',
    subtitle: 'Double rewards',
    icon: 'wallet',
    backgroundColor: '#9B59B6',
    gradientColors: ['#9B59B6', '#8E44AD'],
    action: 'extra-coins',
  },
  {
    id: 'track-cashback',
    title: 'Track Cashback',
    subtitle: 'View your earnings',
    icon: 'trending-up',
    backgroundColor: '#F97316',
    gradientColors: ['#F97316', '#EA580C'],
    action: 'track-cashback',
  },
  {
    id: 'trending',
    title: 'Trending Offers',
    subtitle: 'Hot deals today',
    icon: 'flame',
    backgroundColor: '#EF4444',
    gradientColors: ['#EF4444', '#DC2626'],
    action: 'trending',
    badge: 'NEW',
  },
];

interface CashStoreQuickActionsProps {
  actions?: CashStoreQuickAction[];
  onActionPress: (actionId: string) => void;
}

const ActionCard: React.FC<{
  action: CashStoreQuickAction;
  index: number;
  onPress: () => void;
}> = memo(({ action, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const iconBounceAnim = useRef(new Animated.Value(1)).current;

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
  }, [index]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(iconBounceAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(iconBounceAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.actionCardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.actionCard}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={action.gradientColors || [action.backgroundColor, action.backgroundColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Decorative circles */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />

          {/* Badge */}
          {action.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{action.badge}</Text>
            </View>
          )}

          {/* Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: iconBounceAnim }],
              },
            ]}
          >
            <Ionicons
              name={action.icon as any}
              size={24}
              color="#FFFFFF"
            />
          </Animated.View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {action.title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {action.subtitle}
            </Text>
          </View>

          {/* Arrow */}
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.8)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

const CashStoreQuickActions: React.FC<CashStoreQuickActionsProps> = ({
  actions = DEFAULT_QUICK_ACTIONS,
  onActionPress,
}) => {
  // Use default actions if less than 4 provided
  const displayActions = actions.length >= 4 ? actions.slice(0, 4) : DEFAULT_QUICK_ACTIONS;

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {displayActions.map((action, index) => (
          <ActionCard
            key={action.id}
            action={action}
            index={index}
            onPress={() => onActionPress(action.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  actionCardWrapper: {
    width: CARD_WIDTH,
    minWidth: 150,
  },
  actionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 90,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -15,
    left: -15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  arrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
});

export default memo(CashStoreQuickActions);
