/**
 * MallNewArrivalCard Component
 *
 * Premium card component for displaying new arrival brands
 * with enhanced visuals, gradients, and modern styling
 */

import React, { memo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MallBrand } from '../../../types/mall.types';

interface MallNewArrivalCardProps {
  brand: MallBrand;
  onPress: (brand: MallBrand) => void;
  width?: number;
  index?: number;
}

const MallNewArrivalCard: React.FC<MallNewArrivalCardProps> = ({
  brand,
  onPress,
  width = 174,
  index = 0,
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={() => onPress(brand)}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        {/* Background Gradient */}
        <LinearGradient
          colors={['#FFFFFF', '#FAFAFA']}
          style={styles.cardGradient}
        >
          {/* NEW Badge - Premium Style */}
          <View style={styles.newBadgeContainer}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.newBadge}
            >
              <Ionicons name="sparkles" size={10} color="#FFFFFF" />
              <Text style={styles.newBadgeText}>NEW</Text>
            </LinearGradient>
          </View>

          {/* Logo Container with Glow Effect */}
          <View style={styles.logoWrapper}>
            <View style={styles.logoGlow} />
            <View style={styles.logoContainer}>
              {!imageError && brand.logo ? (
                <Image
                  source={{ uri: brand.logo }}
                  style={styles.logo}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.logoFallback}
                >
                  <Text style={styles.logoFallbackText}>
                    {getInitials(brand.name)}
                  </Text>
                </LinearGradient>
              )}
            </View>
          </View>

          {/* Brand Name */}
          <Text style={styles.brandName} numberOfLines={1}>
            {brand.name}
          </Text>

          {/* Category */}
          {brand.mallCategory && (
            <View style={styles.categoryContainer}>
              <Ionicons name="pricetag-outline" size={12} color="#9CA3AF" />
              <Text style={styles.categoryText} numberOfLines={1}>
                {brand.mallCategory.name}
              </Text>
            </View>
          )}

          {/* Cashback Section */}
          <View style={styles.cashbackSection}>
            {/* Early Bird Bonus */}
            {brand.cashback.earlyBirdBonus && brand.cashback.earlyBirdBonus > 0 && (
              <View style={styles.earlyBirdContainer}>
                <View style={styles.earlyBirdIcon}>
                  <Ionicons name="gift" size={12} color="#D97706" />
                </View>
                <Text style={styles.earlyBirdText}>
                  +{brand.cashback.earlyBirdBonus} bonus coins
                </Text>
              </View>
            )}

            {/* Regular Cashback */}
            <View style={styles.cashbackRow}>
              <View style={styles.cashbackBadge}>
                <Ionicons name="wallet-outline" size={12} color="#00C06A" />
                <Text style={styles.cashbackText}>
                  {brand.cashback.percentage}% cashback
                </Text>
              </View>
            </View>
          </View>

          {/* Shop Now Button */}
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => onPress(brand)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#00C06A', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shopButtonGradient}
            >
              <Text style={styles.shopButtonText}>Explore</Text>
              <View style={styles.shopButtonArrow}>
                <Ionicons name="arrow-forward" size={14} color="#00C06A" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 14,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardGradient: {
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  newBadgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 14,
    marginTop: 8,
  },
  logoGlow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    top: -5,
    left: -5,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  logoFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFallbackText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  cashbackSection: {
    width: '100%',
    marginBottom: 12,
    gap: 6,
  },
  earlyBirdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  earlyBirdIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  earlyBirdText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  cashbackRow: {
    alignItems: 'center',
  },
  cashbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  shopButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  shopButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  shopButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shopButtonArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(MallNewArrivalCard);
