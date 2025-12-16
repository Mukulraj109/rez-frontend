/**
 * MallNewArrivals Component
 *
 * Modern, premium horizontal scrolling section for new arrival brands
 * with early-bird rewards and enhanced visual design
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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MallBrand } from '../../types/mall.types';
import MallNewArrivalCard from './cards/MallNewArrivalCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MallNewArrivalsProps {
  brands: MallBrand[];
  isLoading?: boolean;
  onBrandPress: (brand: MallBrand) => void;
  onViewAllPress?: () => void;
}

const MallNewArrivals: React.FC<MallNewArrivalsProps> = ({
  brands,
  isLoading = false,
  onBrandPress,
  onViewAllPress,
}) => {
  const renderBrand = useCallback(
    ({ item, index }: { item: MallBrand; index: number }) => (
      <MallNewArrivalCard brand={item} onPress={onBrandPress} index={index} />
    ),
    [onBrandPress]
  );

  const keyExtractor = useCallback((item: MallBrand) => item.id || item._id, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FFFBEB', '#FEF3C7', '#FDE68A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <View style={styles.headerRow}>
            <LinearGradient
              colors={['#FCD34D', '#F59E0B']}
              style={styles.iconWrapper}
            >
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.title}>New Arrivals</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#F59E0B" />
            <Text style={styles.loadingText}>Loading new brands...</Text>
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

        {/* Section Header - Row 1: Icon + Title + Badge + View All */}
        <View style={styles.headerRow}>
          <LinearGradient
            colors={['#FCD34D', '#F59E0B']}
            style={styles.iconWrapper}
          >
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.title}>New Arrivals</Text>
          <View style={styles.newBadge}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.newBadgeGradient}
            >
              <Text style={styles.newBadgeText}>NEW</Text>
            </LinearGradient>
          </View>
          <View style={styles.headerSpacer} />
          {onViewAllPress && (
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

        {/* Section Header - Row 2: Subtitle */}
        <Text style={styles.subtitle}>
          Fresh brands with exclusive early-bird rewards
        </Text>

        {/* Enhanced Early Bird Banner */}
        <View style={styles.earlyBirdWrapper}>
          <LinearGradient
            colors={['#FEF3C7', '#FDE68A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.earlyBirdBanner}
          >
            <View style={styles.earlyBirdIconContainer}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.earlyBirdIcon}
              >
                <Ionicons name="gift" size={16} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <View style={styles.earlyBirdContent}>
              <Text style={styles.earlyBirdTitle}>Early Bird Bonus!</Text>
              <Text style={styles.earlyBirdText}>
                Earn bonus coins when you shop new brands
              </Text>
            </View>
            <View style={styles.earlyBirdArrow}>
              <Ionicons name="chevron-forward" size={18} color="#B45309" />
            </View>
          </LinearGradient>
        </View>

        {/* Brands List */}
        <FlatList
          data={brands}
          renderItem={renderBrand}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          snapToInterval={190}
          decelerationRate="fast"
        />
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
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
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
    bottom: -30,
    left: -20,
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
        shadowColor: '#F59E0B',
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
  newBadge: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  newBadgeGradient: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#B45309',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
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
  earlyBirdWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  earlyBirdBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  earlyBirdIconContainer: {
    marginRight: 12,
  },
  earlyBirdIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earlyBirdContent: {
    flex: 1,
  },
  earlyBirdTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  earlyBirdText: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 16,
  },
  earlyBirdArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 4,
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

export default memo(MallNewArrivals);
