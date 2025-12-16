/**
 * HighCashbackDeals Component
 *
 * Section showing high cashback deals with Shop Now button
 */

import React, { memo } from 'react';
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
import { HighCashbackDeal, getBadgeColor } from '../../../types/cash-store.types';

interface HighCashbackDealsProps {
  deals: HighCashbackDeal[];
  isLoading?: boolean;
  onDealPress: (deal: HighCashbackDeal) => void;
  onViewAllPress: () => void;
}

const DealCard: React.FC<{
  deal: HighCashbackDeal;
  onPress: () => void;
}> = ({ deal, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
    {/* Badge */}
    {deal.badge && (
      <View style={[styles.badge, { backgroundColor: getBadgeColor(deal.badge) }]}>
        <Text style={styles.badgeText}>{deal.badge.toUpperCase()}</Text>
      </View>
    )}

    {/* Brand Section */}
    <View style={styles.brandSection}>
      <View style={styles.logoContainer}>
        {deal.brand.logo ? (
          <Image source={{ uri: deal.brand.logo }} style={styles.brandLogo} resizeMode="contain" />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoInitial}>{deal.brand.name.charAt(0)}</Text>
          </View>
        )}
      </View>
      <View style={styles.brandInfo}>
        <Text style={styles.brandName}>{deal.brand.name}</Text>
        <Text style={styles.dealTitle} numberOfLines={1}>
          {deal.title}
        </Text>
      </View>
    </View>

    {/* Cashback Highlight */}
    <View style={styles.cashbackHighlight}>
      <Text style={styles.cashbackRate}>{deal.cashbackRate}%</Text>
      <Text style={styles.cashbackLabel}>Cashback</Text>
    </View>

    {/* Bonus Coins */}
    {deal.bonusCoins && (
      <View style={styles.bonusRow}>
        <Ionicons name="flash" size={14} color="#FFC857" />
        <Text style={styles.bonusText}>+{deal.bonusCoins} bonus coins</Text>
      </View>
    )}

    {/* Shop Now Button */}
    <TouchableOpacity style={styles.shopButton} onPress={onPress}>
      <Text style={styles.shopButtonText}>Shop Now</Text>
      <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
    </TouchableOpacity>
  </TouchableOpacity>
);

const SkeletonCard: React.FC = () => (
  <View style={styles.card}>
    <View style={styles.brandSection}>
      <View style={[styles.logoContainer, styles.skeleton]} />
      <View style={styles.brandInfo}>
        <View style={[styles.skeletonText, { width: 80 }]} />
        <View style={[styles.skeletonText, { width: 100 }]} />
      </View>
    </View>
    <View style={[styles.cashbackHighlight, styles.skeleton]} />
  </View>
);

const HighCashbackDeals: React.FC<HighCashbackDealsProps> = ({
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
            <Text style={styles.headerTitle}>High Cashback Deals</Text>
            <Ionicons name="rocket" size={18} color="#00C06A" />
          </View>
          <Text style={styles.subtitle}>Best cashback offers today</Text>
        </View>
        <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#00C06A" />
        </TouchableOpacity>
      </View>

      {/* Horizontal List */}
      <FlatList
        data={isLoading ? Array.from({ length: 3 }) : deals}
        renderItem={({ item, index }) =>
          isLoading ? (
            <SkeletonCard key={`skeleton-${index}`} />
          ) : (
            <DealCard
              deal={item as HighCashbackDeal}
              onPress={() => onDealPress(item as HighCashbackDeal)}
            />
          )
        }
        keyExtractor={(item, index) => (isLoading ? `skeleton-${index}` : (item as HighCashbackDeal).id)}
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
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
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
    top: 10,
    right: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  brandLogo: {
    width: 32,
    height: 32,
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  logoInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  dealTitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  cashbackHighlight: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  cashbackRate: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00C06A',
  },
  cashbackLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#00796B',
  },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 12,
  },
  bonusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFC857',
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00C06A',
    paddingVertical: 10,
    borderRadius: 10,
  },
  shopButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
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

export default memo(HighCashbackDeals);
