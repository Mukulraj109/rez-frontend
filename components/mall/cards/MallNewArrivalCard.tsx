/**
 * MallNewArrivalCard Component
 *
 * Card component for displaying new arrival brands with early-bird rewards
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

interface MallNewArrivalCardProps {
  brand: MallBrand;
  onPress: (brand: MallBrand) => void;
  width?: number;
}

const MallNewArrivalCard: React.FC<MallNewArrivalCardProps> = ({
  brand,
  onPress,
  width = 160,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={() => onPress(brand)}
      activeOpacity={0.85}
    >
      <View style={styles.card}>
        {/* NEW Badge */}
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>

        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: brand.logo }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Brand Name */}
        <Text style={styles.brandName} numberOfLines={1}>
          {brand.name}
        </Text>

        {/* Category */}
        {brand.mallCategory && (
          <Text style={styles.categoryText} numberOfLines={1}>
            {brand.mallCategory.name}
          </Text>
        )}

        {/* Early Bird Bonus */}
        {brand.cashback.earlyBirdBonus && brand.cashback.earlyBirdBonus > 0 && (
          <View style={styles.earlyBirdContainer}>
            <Ionicons name="gift" size={14} color="#F59E0B" />
            <Text style={styles.earlyBirdText}>
              Early-bird: +{brand.cashback.earlyBirdBonus} coins
            </Text>
          </View>
        )}

        {/* Regular Cashback */}
        <Text style={styles.cashbackText}>
          {brand.cashback.percentage}% cashback
        </Text>

        {/* Explore Button */}
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => onPress(brand)}
        >
          <Text style={styles.exploreButtonText}>Explore</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  newBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  logoContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#F9FAFB',
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  logo: {
    width: 50,
    height: 50,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
    textAlign: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  earlyBirdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 8,
    gap: 4,
  },
  earlyBirdText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00C06A',
    marginBottom: 12,
  },
  exploreButton: {
    width: '100%',
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00C06A',
  },
});

export default memo(MallNewArrivalCard);
