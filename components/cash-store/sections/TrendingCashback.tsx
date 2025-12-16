/**
 * TrendingCashback Component
 *
 * Horizontal scroll section showing trending cashback deals with countdown timers
 */

import React, { memo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TrendingDeal, formatTimeRemaining, getTimeRemainingMs, getBadgeColor } from '../../../types/cash-store.types';

interface TrendingCashbackProps {
  deals: TrendingDeal[];
  isLoading?: boolean;
  onDealPress: (deal: TrendingDeal) => void;
  onViewAllPress: () => void;
}

const TrendingDealCard: React.FC<{
  deal: TrendingDeal;
  onPress: () => void;
}> = ({ deal, onPress }) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemainingMs(deal.validUntil));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemainingMs(deal.validUntil));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deal.validUntil]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Badge */}
      {deal.badge && (
        <View style={[styles.badge, { backgroundColor: getBadgeColor(deal.badge) }]}>
          <Text style={styles.badgeText}>{deal.badge.toUpperCase()}</Text>
        </View>
      )}

      {/* Brand Logo */}
      <View style={styles.logoContainer}>
        {deal.brand.logo ? (
          <Image source={{ uri: deal.brand.logo }} style={styles.brandLogo} resizeMode="contain" />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoInitial}>{deal.brand.name.charAt(0)}</Text>
          </View>
        )}
      </View>

      {/* Brand Name */}
      <Text style={styles.brandName} numberOfLines={1}>
        {deal.brand.name}
      </Text>

      {/* Cashback Rate */}
      <Text style={styles.cashbackRate}>{deal.cashbackRate}% Cashback</Text>

      {/* Bonus Coins */}
      {deal.bonusCoins && (
        <View style={styles.bonusContainer}>
          <Ionicons name="flash" size={12} color="#FFC857" />
          <Text style={styles.bonusText}>+{deal.bonusCoins} coins</Text>
        </View>
      )}

      {/* Timer */}
      <View style={styles.timerContainer}>
        <Ionicons name="time-outline" size={12} color="#EF4444" />
        <Text style={styles.timerText}>{formatTimeRemaining(timeRemaining)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const SkeletonCard: React.FC = () => (
  <View style={styles.card}>
    <View style={[styles.logoContainer, styles.skeleton]} />
    <View style={[styles.skeletonText, { width: 80 }]} />
    <View style={[styles.skeletonText, { width: 60 }]} />
  </View>
);

const TrendingCashback: React.FC<TrendingCashbackProps> = ({
  deals,
  isLoading = false,
  onDealPress,
  onViewAllPress,
}) => {
  if (deals.length === 0 && !isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Trending Cashback</Text>
            <Ionicons name="flame" size={18} color="#EF4444" />
          </View>
          <Text style={styles.subtitle}>Limited time offers</Text>
        </View>
        <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#00C06A" />
        </TouchableOpacity>
      </View>

      {/* Horizontal List */}
      <FlatList
        data={isLoading ? Array.from({ length: 4 }) : deals}
        renderItem={({ item, index }) =>
          isLoading ? (
            <SkeletonCard key={`skeleton-${index}`} />
          ) : (
            <TrendingDealCard
              deal={item as TrendingDeal}
              onPress={() => onDealPress(item as TrendingDeal)}
            />
          )
        }
        keyExtractor={(item, index) => (isLoading ? `skeleton-${index}` : (item as TrendingDeal).id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
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
  title: {
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
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
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
    backgroundColor: '#E5E7EB',
  },
  logoInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  brandName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'center',
  },
  cashbackRate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00C06A',
    marginBottom: 6,
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  bonusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFC857',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  timerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EF4444',
  },
  // Skeleton
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  skeletonText: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 6,
  },
});

export default memo(TrendingCashback);
