/**
 * TravelBookingDeals Component
 *
 * 2x2 grid of travel category cards (Flights, Hotels, Cabs, Experiences)
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TravelDeal, getTravelDealGradient } from '../../../types/cash-store.types';

interface TravelBookingDealsProps {
  deals: TravelDeal[];
  isLoading?: boolean;
  onDealPress: (deal: TravelDeal) => void;
  onViewAllPress: () => void;
}

const TravelCard: React.FC<{
  deal: TravelDeal;
  onPress: () => void;
}> = ({ deal, onPress }) => {
  const gradientColors = deal.gradientColors || getTravelDealGradient(deal.category);
  const iconName = deal.icon as any;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={28} color="#FFFFFF" />
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.categoryTitle}>{deal.title}</Text>
          <Text style={styles.cashbackText}>Up to {deal.cashbackRate}%</Text>
        </View>

        {/* Bonus Coins */}
        {deal.bonusCoins && (
          <View style={styles.bonusBadge}>
            <Ionicons name="flash" size={10} color="#FFC857" />
            <Text style={styles.bonusText}>+{deal.bonusCoins}</Text>
          </View>
        )}

        {/* Arrow */}
        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const SkeletonCard: React.FC = () => (
  <View style={styles.card}>
    <View style={[styles.cardGradient, styles.skeleton]} />
  </View>
);

const TravelBookingDeals: React.FC<TravelBookingDealsProps> = ({
  deals,
  isLoading = false,
  onDealPress,
  onViewAllPress,
}) => {
  const displayDeals = deals.slice(0, 4); // Max 4 for 2x2 grid

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>Travel & Booking Deals</Text>
            <Ionicons name="airplane" size={18} color="#667EEA" />
          </View>
          <Text style={styles.subtitle}>Earn on your travels</Text>
        </View>
        <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#00C06A" />
        </TouchableOpacity>
      </View>

      {/* 2x2 Grid */}
      <View style={styles.grid}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={`skeleton-${index}`} />)
          : displayDeals.map((deal) => (
              <TravelCard key={deal.id} deal={deal} onPress={() => onDealPress(deal)} />
            ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00C06A',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  card: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardGradient: {
    padding: 16,
    minHeight: 110,
    position: 'relative',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardContent: {},
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cashbackText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  bonusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  bonusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFC857',
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  // Skeleton
  skeleton: {
    backgroundColor: '#E5E7EB',
    minHeight: 110,
  },
});

export default memo(TravelBookingDeals);
