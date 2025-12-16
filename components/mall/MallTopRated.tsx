/**
 * MallTopRated Component
 *
 * List section for top-rated brands with ratings and success rate
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MallBrand } from '../../types/mall.types';
import MallTopRatedItem from './cards/MallTopRatedItem';

interface MallTopRatedProps {
  brands: MallBrand[];
  isLoading?: boolean;
  onBrandPress: (brand: MallBrand) => void;
  onViewAllPress?: () => void;
  limit?: number;
}

const MallTopRated: React.FC<MallTopRatedProps> = ({
  brands,
  isLoading = false,
  onBrandPress,
  onViewAllPress,
  limit = 5,
}) => {
  // Loading skeleton
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="trophy" size={20} color="#FFC107" />
            <Text style={styles.title}>Top Rated Brands</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FFC107" />
          <Text style={styles.loadingText}>Loading top brands...</Text>
        </View>
      </View>
    );
  }

  // Empty state
  if (!brands || brands.length === 0) {
    return null;
  }

  const displayBrands = brands.slice(0, limit);

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="trophy" size={20} color="#FFC107" />
          <Text style={styles.title}>Top Rated Brands</Text>
        </View>
        {onViewAllPress && brands.length > limit && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={onViewAllPress}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#FFC107" />
          </TouchableOpacity>
        )}
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Trusted by users with highest success rates
      </Text>

      {/* Stats Badge */}
      <View style={styles.statsRow}>
        <View style={styles.statBadge}>
          <Ionicons name="star" size={14} color="#FFC107" />
          <Text style={styles.statText}>4.5+ avg rating</Text>
        </View>
        <View style={styles.statBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#00C06A" />
          <Text style={styles.statText}>95%+ success rate</Text>
        </View>
      </View>

      {/* Brands List */}
      <View style={styles.listContainer}>
        {displayBrands.map((brand, index) => (
          <MallTopRatedItem
            key={brand.id || brand._id}
            brand={brand}
            onPress={onBrandPress}
            index={index}
          />
        ))}
      </View>

      {/* View More Button */}
      {brands.length > limit && onViewAllPress && (
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={onViewAllPress}
        >
          <Text style={styles.viewMoreText}>
            View {brands.length - limit} more brands
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#00C06A" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFC107',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 14,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    gap: 8,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00C06A',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default memo(MallTopRated);
