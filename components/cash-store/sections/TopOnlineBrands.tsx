/**
 * TopOnlineBrands Component
 *
 * 3x3 grid of top online brands with cashback percentages
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CashStoreBrand } from '../../../types/cash-store.types';

interface TopOnlineBrandsProps {
  brands: CashStoreBrand[];
  isLoading?: boolean;
  onBrandPress: (brand: CashStoreBrand) => void;
  onViewAllPress: () => void;
}

const BrandCard: React.FC<{
  brand: CashStoreBrand;
  onPress: () => void;
}> = ({ brand, onPress }) => (
  <TouchableOpacity style={styles.brandCard} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.brandLogoContainer}>
      {brand.logo ? (
        <Image source={{ uri: brand.logo }} style={styles.brandLogo} resizeMode="contain" />
      ) : (
        <View style={styles.brandLogoPlaceholder}>
          <Text style={styles.brandInitial}>{brand.name.charAt(0)}</Text>
        </View>
      )}
    </View>
    <Text style={styles.brandName} numberOfLines={1}>
      {brand.name}
    </Text>
    <View style={styles.cashbackBadge}>
      <Text style={styles.cashbackText}>Up to {brand.cashbackRate}%</Text>
    </View>
  </TouchableOpacity>
);

const SkeletonCard: React.FC = () => (
  <View style={styles.brandCard}>
    <View style={[styles.brandLogoContainer, styles.skeleton]} />
    <View style={[styles.skeletonText, { width: 60 }]} />
    <View style={[styles.skeletonBadge]} />
  </View>
);

const TopOnlineBrands: React.FC<TopOnlineBrandsProps> = ({
  brands,
  isLoading = false,
  onBrandPress,
  onViewAllPress,
}) => {
  const displayBrands = brands.slice(0, 9); // Max 9 for 3x3 grid

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Top Online Brands</Text>
          <Text style={styles.subtitle}>Earn cashback on every purchase</Text>
        </View>
        <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#00C06A" />
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {isLoading
          ? Array.from({ length: 9 }).map((_, index) => <SkeletonCard key={`skeleton-${index}`} />)
          : displayBrands.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                onPress={() => onBrandPress(brand)}
              />
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
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
    gap: 8,
  },
  brandCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  brandLogoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  brandLogo: {
    width: 40,
    height: 40,
  },
  brandLogoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  brandInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  brandName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    textAlign: 'center',
  },
  cashbackBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cashbackText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#00C06A',
  },
  // Skeleton styles
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  skeletonText: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonBadge: {
    width: 60,
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
  },
});

export default memo(TopOnlineBrands);
