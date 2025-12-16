/**
 * Brand Detail Page
 *
 * Displays detailed information about a mall brand
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { mallApi } from '../../../services/mallApi';
import { MallBrand, BrandBadge, BrandTier } from '../../../types/mall.types';
import BrandWebView from '../../../components/mall/BrandWebView';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.35;

const BADGE_COLORS: Record<BrandBadge, { bg: string; text: string }> = {
  exclusive: { bg: '#00C06A', text: '#FFFFFF' },
  premium: { bg: '#8B5CF6', text: '#FFFFFF' },
  new: { bg: '#F59E0B', text: '#FFFFFF' },
  trending: { bg: '#EC4899', text: '#FFFFFF' },
  'top-rated': { bg: '#3B82F6', text: '#FFFFFF' },
  verified: { bg: '#10B981', text: '#FFFFFF' },
};

const TIER_COLORS: Record<BrandTier, { gradient: string[]; badge: string }> = {
  standard: { gradient: ['#6B7280', '#4B5563'], badge: '#6B7280' },
  premium: { gradient: ['#8B5CF6', '#7C3AED'], badge: '#7C3AED' },
  exclusive: { gradient: ['#00C06A', '#059669'], badge: '#059669' },
  luxury: { gradient: ['#F59E0B', '#D97706'], badge: '#B45309' },
};

export default function BrandDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [brand, setBrand] = useState<MallBrand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(false);

  const fetchBrand = useCallback(async () => {
    if (!id) {
      console.log('[BrandDetail] No ID provided');
      return;
    }

    console.log('[BrandDetail] Fetching brand with ID:', id);

    try {
      setError(null);
      const data = await mallApi.getBrandById(id);

      // Debug logging
      console.log('[BrandDetail] Brand data received:', {
        id: data?.id || data?._id,
        name: data?.name,
        logo: data?.logo,
        tier: data?.tier,
        cashback: data?.cashback,
        ratings: data?.ratings,
        externalUrl: data?.externalUrl,
        badges: data?.badges,
        category: data?.mallCategory?.name,
      });

      setBrand(data);
    } catch (err: any) {
      console.error('[BrandDetail] Error fetching brand:', err);
      setError(err.message || 'Failed to load brand');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBrand();
  }, [fetchBrand]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchBrand();
  }, [fetchBrand]);

  const handleShopNow = useCallback(async () => {
    if (!brand?.externalUrl) return;

    // Track click
    await mallApi.trackBrandClick(brand.id || brand._id);

    // Show in-app WebView
    setShowWebView(true);
  }, [brand]);

  const handleCloseWebView = useCallback(() => {
    setShowWebView(false);
  }, []);

  // Show WebView
  if (showWebView && brand?.externalUrl) {
    return (
      <BrandWebView
        url={brand.externalUrl}
        brandName={brand.name}
        cashbackPercentage={brand.cashback.percentage}
        onClose={handleCloseWebView}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C06A" />
        <Text style={styles.loadingText}>Loading brand details...</Text>
      </View>
    );
  }

  // Error state
  if (error || !brand) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Unable to load brand</Text>
        <Text style={styles.errorText}>{error || 'Brand not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchBrand}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tierColors = TIER_COLORS[brand.tier];
  const cashbackDisplay = brand.cashback.maxAmount
    ? `Up to ₹${brand.cashback.maxAmount}`
    : `${brand.cashback.percentage}%`;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#FFFFFF"
            />
          }
        >
          {/* Hero Section */}
          <LinearGradient
            colors={tierColors.gradient as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroSection, { paddingTop: insets.top }]}
          >
            {/* Banner Image Background */}
            {brand.banner && brand.banner[0] && (
              <Image
                source={{ uri: brand.banner[0] }}
                style={styles.heroBannerImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.heroOverlay} />

            {/* Back Button */}
            <TouchableOpacity
              style={[styles.backButton, { marginTop: 12 }]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Logo & Brand Name */}
            <View style={styles.heroContent}>
              <View style={styles.logoContainer}>
                <Image
                  source={{ uri: brand.logo }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.brandName}>{brand.name}</Text>

              {/* Tier Badge */}
              <View style={[styles.tierBadge, { backgroundColor: tierColors.badge }]}>
                <Ionicons name="diamond-outline" size={14} color="#FFFFFF" />
                <Text style={styles.tierBadgeText}>
                  {brand.tier.charAt(0).toUpperCase() + brand.tier.slice(1)}
                </Text>
              </View>

              {/* Rating */}
              {brand.ratings.average > 0 && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={18} color="#FFC107" />
                  <Text style={styles.ratingText}>
                    {brand.ratings.average.toFixed(1)}
                  </Text>
                  <Text style={styles.ratingCount}>
                    ({brand.ratings.count} reviews)
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>

          {/* Cashback Card */}
          <View style={styles.cashbackCard}>
            <View style={styles.cashbackMain}>
              <Text style={styles.cashbackLabel}>Earn Cashback</Text>
              <Text style={styles.cashbackValue}>{cashbackDisplay}</Text>
              {brand.cashback.minPurchase > 0 && (
                <Text style={styles.cashbackCondition}>
                  Min. purchase ₹{brand.cashback.minPurchase}
                </Text>
              )}
            </View>
            {brand.cashback.earlyBirdBonus > 0 && (
              <View style={styles.bonusBadge}>
                <Ionicons name="flash" size={16} color="#F59E0B" />
                <Text style={styles.bonusText}>
                  +{brand.cashback.earlyBirdBonus}% Early Bird
                </Text>
              </View>
            )}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.statValue}>{brand.ratings.successRate}%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={24} color="#6366F1" />
              <Text style={styles.statValue}>{brand.analytics?.views || 0}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="cart-outline" size={24} color="#00C06A" />
              <Text style={styles.statValue}>{brand.analytics?.purchases || 0}</Text>
              <Text style={styles.statLabel}>Purchases</Text>
            </View>
          </View>

          {/* Description */}
          {brand.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{brand.description}</Text>
            </View>
          )}

          {/* Badges */}
          {brand.badges.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Badges</Text>
              <View style={styles.badgesContainer}>
                {brand.badges.map((badge) => (
                  <View
                    key={badge}
                    style={[
                      styles.badge,
                      { backgroundColor: BADGE_COLORS[badge]?.bg || '#6B7280' },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {badge.charAt(0).toUpperCase() + badge.slice(1).replace('-', ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Category */}
          {brand.mallCategory && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <TouchableOpacity
                style={styles.categoryItem}
                onPress={() => router.push(`/mall/category/${brand.mallCategory.slug}` as any)}
              >
                <Text style={styles.categoryIcon}>{brand.mallCategory.icon}</Text>
                <Text style={styles.categoryName}>{brand.mallCategory.name}</Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Collections */}
          {brand.collections && brand.collections.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Collections</Text>
              {brand.collections.map((collection) => (
                <TouchableOpacity
                  key={collection.id || collection._id}
                  style={styles.collectionItem}
                  onPress={() => router.push(`/mall/collection/${collection.slug}` as any)}
                >
                  <Text style={styles.collectionName}>{collection.name}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Tags */}
          {brand.tags && brand.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {brand.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Bottom Spacer for CTA button */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Fixed CTA Button */}
        {brand.externalUrl && (
          <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleShopNow}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#00C06A', '#00A05A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Ionicons name="cart-outline" size={22} color="#FFFFFF" />
                <Text style={styles.ctaText}>Shop Now</Text>
                <View style={styles.ctaCashback}>
                  <Text style={styles.ctaCashbackText}>
                    Earn {brand.cashback.percentage}%
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backLink: {
    padding: 8,
  },
  backLinkText: {
    fontSize: 14,
    color: '#00C06A',
    fontWeight: '500',
  },
  // Hero Section
  heroSection: {
    height: HERO_HEIGHT,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBannerImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logo: {
    width: '70%',
    height: '70%',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ratingCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Cashback Card
  cashbackCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cashbackMain: {
    alignItems: 'center',
  },
  cashbackLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  cashbackValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#00C06A',
  },
  cashbackCondition: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  bonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  bonusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B45309',
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  // Sections
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  collectionName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  bottomSpacer: {
    height: 180,
  },
  // CTA Button
  ctaContainer: {
    position: 'absolute',
    bottom: 80, // Account for tab bar height
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ctaCashback: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ctaCashbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
