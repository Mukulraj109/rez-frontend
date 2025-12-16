/**
 * MallTopRated Component
 *
 * Premium list section for top-rated brands with ratings and success rate
 * Modern design with gradients, ranking badges, and enhanced visuals
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
        <LinearGradient
          colors={['#FFFBEB', '#FEF3C7', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientBackground}
        >
          <View style={styles.headerRow}>
            <LinearGradient
              colors={['#FFC107', '#F59E0B']}
              style={styles.iconWrapper}
            >
              <Ionicons name="trophy" size={18} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.title}>Top Rated Brands</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFC107" />
            <Text style={styles.loadingText}>Loading top brands...</Text>
          </View>
        </LinearGradient>
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
      {/* Premium Gradient Background */}
      <LinearGradient
        colors={['#FFFBEB', '#FEF3C7', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBackground}
      >
        {/* Decorative Elements */}
        <View style={styles.decorativeElements}>
          <View style={[styles.decorCircle, styles.decorCircle1]} />
          <View style={[styles.decorCircle, styles.decorCircle2]} />
        </View>

        {/* Section Header */}
        <View style={styles.headerRow}>
          <LinearGradient
            colors={['#FFC107', '#F59E0B']}
            style={styles.iconWrapper}
          >
            <Ionicons name="trophy" size={18} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.title}>Top Rated Brands</Text>
          <View style={styles.headerSpacer} />
          {onViewAllPress && brands.length > limit && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={onViewAllPress}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <View style={styles.viewAllArrow}>
                <Ionicons name="arrow-forward" size={14} color="#F59E0B" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Trusted by users with highest success rates
        </Text>

        {/* Premium Stats Row */}
        <View style={styles.statsWrapper}>
          <LinearGradient
            colors={['rgba(255, 193, 7, 0.15)', 'rgba(245, 158, 11, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statsContainer}
          >
            <View style={styles.statItem}>
              <View style={styles.statIconWrapper}>
                <Ionicons name="star" size={14} color="#FFC107" />
              </View>
              <View>
                <Text style={styles.statValue}>4.5+</Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIconWrapper, styles.successIconWrapper]}>
                <Ionicons name="checkmark-circle" size={14} color="#00C06A" />
              </View>
              <View>
                <Text style={[styles.statValue, styles.successValue]}>95%+</Text>
                <Text style={styles.statLabel}>Success Rate</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIconWrapper, styles.brandsIconWrapper]}>
                <Ionicons name="storefront" size={14} color="#8B5CF6" />
              </View>
              <View>
                <Text style={[styles.statValue, styles.brandsValue]}>{brands.length}</Text>
                <Text style={styles.statLabel}>Top Brands</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Brands List */}
        <View style={styles.listContainer}>
          {displayBrands.map((brand, index) => (
            <MallTopRatedItem
              key={brand.id || brand._id}
              brand={brand}
              onPress={onBrandPress}
              rank={index + 1}
            />
          ))}
        </View>

        {/* View More Button */}
        {brands.length > limit && onViewAllPress && (
          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={onViewAllPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#00C06A', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.viewMoreGradient}
            >
              <Text style={styles.viewMoreText}>
                View All {brands.length} Brands
              </Text>
              <View style={styles.viewMoreArrow}>
                <Ionicons name="arrow-forward" size={16} color="#00C06A" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  gradientBackground: {
    paddingVertical: 20,
    borderRadius: 24,
    marginHorizontal: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  decorativeElements: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  decorCircle1: {
    width: 150,
    height: 150,
    top: -50,
    right: -30,
  },
  decorCircle2: {
    width: 100,
    height: 100,
    bottom: 50,
    left: -30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 6,
    gap: 10,
  },
  headerSpacer: {
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FFC107',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#B45309',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
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
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
  },
  viewAllArrow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconWrapper: {
    backgroundColor: 'rgba(0, 192, 106, 0.15)',
  },
  brandsIconWrapper: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D97706',
  },
  successValue: {
    color: '#059669',
  },
  brandsValue: {
    color: '#7C3AED',
  },
  statLabel: {
    fontSize: 11,
    color: '#78716C',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  viewMoreButton: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  viewMoreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  viewMoreText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewMoreArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#92400E',
    fontWeight: '500',
  },
});

export default memo(MallTopRated);
