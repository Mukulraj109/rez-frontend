/**
 * MallLuxuryZone Component
 *
 * Premium section for luxury brands with dark + gold theme
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MallBrand } from '../../types/mall.types';
import MallLuxuryBrandCard from './cards/MallLuxuryBrandCard';

interface MallLuxuryZoneProps {
  brands: MallBrand[];
  isLoading?: boolean;
  onBrandPress: (brand: MallBrand) => void;
  onViewAllPress?: () => void;
}

const MallLuxuryZone: React.FC<MallLuxuryZoneProps> = ({
  brands,
  isLoading = false,
  onBrandPress,
  onViewAllPress,
}) => {
  const renderBrand = useCallback(
    ({ item }: { item: MallBrand }) => (
      <MallLuxuryBrandCard brand={item} onPress={onBrandPress} />
    ),
    [onBrandPress]
  );

  const keyExtractor = useCallback((item: MallBrand) => item.id || item._id, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0B2240', '#1A365D', '#0B2240']}
          style={styles.gradientContainer}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Ionicons name="diamond" size={20} color="#FFD700" />
              <Text style={styles.title}>Luxury Zone</Text>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFD700" />
            <Text style={styles.loadingText}>Loading luxury brands...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Empty state
  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B2240', '#1A365D', '#0B2240']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        {/* Decorative Elements */}
        <View style={styles.decorativeTop} />
        <View style={styles.decorativeBottom} />

        {/* Section Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Ionicons name="diamond" size={22} color="#FFD700" />
              <Text style={styles.title}>Luxury Zone</Text>
            </View>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            </View>
          </View>
          {onViewAllPress && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={onViewAllPress}
            >
              <Text style={styles.viewAllText}>Explore All</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFD700" />
            </TouchableOpacity>
          )}
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Exclusive access to world-class luxury brands
        </Text>

        {/* Features Row */}
        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={16} color="#FFD700" />
            <Text style={styles.featureText}>Verified Authentic</Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <Ionicons name="gift" size={16} color="#FFD700" />
            <Text style={styles.featureText}>Premium Rewards</Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <Ionicons name="ribbon" size={16} color="#FFD700" />
            <Text style={styles.featureText}>VIP Service</Text>
          </View>
        </View>

        {/* Brands List */}
        <View style={styles.listWrapper}>
          {brands.map((brand) => (
            <MallLuxuryBrandCard
              key={brand.id || brand._id}
              brand={brand}
              onPress={onBrandPress}
            />
          ))}
        </View>

        {/* Bottom CTA */}
        <TouchableOpacity
          style={styles.bottomCta}
          onPress={onViewAllPress}
        >
          <LinearGradient
            colors={['#FFD700', '#FFC107', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Discover All Luxury Brands</Text>
            <Ionicons name="arrow-forward" size={18} color="#0B2240" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  gradientContainer: {
    paddingVertical: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeTop: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  decorativeBottom: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.03)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'column',
    gap: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featureDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    marginHorizontal: 4,
  },
  listWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bottomCta: {
    marginHorizontal: 20,
    borderRadius: 14,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B2240',
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default memo(MallLuxuryZone);
