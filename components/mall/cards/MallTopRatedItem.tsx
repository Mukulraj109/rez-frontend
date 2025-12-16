/**
 * MallTopRatedItem Component
 *
 * List item component for displaying top rated brands with success rate
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MallBrand } from '../../../types/mall.types';

interface MallTopRatedItemProps {
  brand: MallBrand;
  onPress: (brand: MallBrand) => void;
  index?: number;
}

const MallTopRatedItem: React.FC<MallTopRatedItemProps> = ({
  brand,
  onPress,
  index = 0,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(brand)}
      activeOpacity={0.85}
    >
      <View style={styles.card}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: brand.logo }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Brand Info */}
        <View style={styles.infoContainer}>
          {/* Name and Rating Row */}
          <View style={styles.nameRow}>
            <Text style={styles.brandName} numberOfLines={1}>
              {brand.name}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFC107" />
              <Text style={styles.ratingText}>
                {brand.ratings.average.toFixed(1)}
              </Text>
            </View>
          </View>

          {/* Category */}
          {brand.mallCategory && (
            <Text style={styles.categoryText} numberOfLines={1}>
              {brand.mallCategory.name}
            </Text>
          )}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.cashbackValue}>
                {brand.cashback.percentage}%
              </Text>
              <Text style={styles.cashbackLabel}>cashback</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.successValue}>
                {brand.ratings.successRate}%
              </Text>
              <Text style={styles.successLabel}>success</Text>
            </View>
          </View>
        </View>

        {/* Arrow */}
        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  logo: {
    width: 38,
    height: 38,
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    marginBottom: 2,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  cashbackValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00C06A',
  },
  cashbackLabel: {
    fontSize: 11,
    color: '#00C06A',
  },
  successValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  successLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default memo(MallTopRatedItem);
