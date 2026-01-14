/**
 * Travel Hub Page
 * Connected to /api/services (travel category)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import travelApi, { TravelService, TravelServiceCategory } from '@/services/travelApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  cyan500: '#06B6D4',
  amber500: '#F59E0B',
};

interface DisplayDeal {
  id: string;
  name: string;
  type: string;
  categorySlug?: string;
  price: string;
  cashback: string;
  image: string;
}

const TravelPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [featuredDeals, setFeaturedDeals] = useState<DisplayDeal[]>([]);
  const [categories, setCategories] = useState<TravelServiceCategory[]>([]);
  const [stats, setStats] = useState({ hotels: 0, maxCashback: 0, coinMultiplier: 2 });

  const fetchTravelData = useCallback(async () => {
    try {
      // Fetch categories
      const categoriesResponse = await travelApi.getCategories();
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }

      // Fetch featured services
      const featuredResponse = await travelApi.getFeatured(6);
      if (featuredResponse.success && featuredResponse.data) {
        const transformed = featuredResponse.data.slice(0, 6).map((service: TravelService) => ({
          id: service._id || service.id || '',
          name: service.name,
          type: service.serviceCategory?.name || 'Travel',
          price: service.pricing?.selling ? `₹${service.pricing.selling.toLocaleString('en-IN')}` : 'Price on request',
          cashback: service.cashback?.percentage ? `${service.cashback.percentage}%` : 
                   service.serviceCategory?.cashbackPercentage ? `${service.serviceCategory.cashbackPercentage}%` : '0%',
          image: service.images?.[0] || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400',
        }));
        setFeaturedDeals(transformed);
      }

      // Fetch stats
      const statsResponse = await travelApi.getStats();
      if (statsResponse.success && statsResponse.data) {
        setStats({
          hotels: statsResponse.data.hotels || 0,
          maxCashback: statsResponse.data.maxCashback || 0,
          coinMultiplier: statsResponse.data.coinMultiplier || 2,
        });
      }
    } catch (error) {
      console.error('Error fetching travel data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTravelData();
  }, [fetchTravelData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchTravelData();
  }, [fetchTravelData]);

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/travel/${categoryId}` as any);
  };

  const handleDealPress = (dealId: string) => {
    // Find the deal to get its category
    const deal = featuredDeals.find(d => d.id === dealId);
    if (!deal) {
      router.push(`/product/${dealId}` as any);
      return;
    }

    // Route based on category slug (most reliable)
    const categorySlug = deal.categorySlug || deal.type?.toLowerCase() || 'packages';
    if (categorySlug === 'flights') {
      router.push(`/flight/${dealId}` as any);
    } else if (categorySlug === 'hotels') {
      router.push(`/hotel/${dealId}` as any);
    } else if (categorySlug === 'trains') {
      router.push(`/train/${dealId}` as any);
    } else if (categorySlug === 'bus') {
      router.push(`/bus/${dealId}` as any);
    } else if (categorySlug === 'cab') {
      router.push(`/cab/${dealId}` as any);
    } else if (categorySlug === 'packages') {
      router.push(`/package/${dealId}` as any);
    } else {
      router.push(`/product/${dealId}` as any);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.cyan500} />
        <Text style={styles.loadingText}>Loading travel services...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#06B6D4', '#0891B2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Travel</Text>
            <Text style={styles.headerSubtitle}>Book trips, earn rewards</Text>
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={() => router.push('/search' as any)}>
            <Ionicons name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats.hotels >= 1000 ? `${Math.floor(stats.hotels / 1000)}k+` : stats.hotels > 0 ? `${stats.hotels}+` : '0'}
            </Text>
            <Text style={styles.statLabel}>Hotels</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats.maxCashback > 0 ? `${stats.maxCashback}%` : '0%'}
            </Text>
            <Text style={styles.statLabel}>Max Cashback</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.coinMultiplier}X</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.cyan500]} />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book Travel</Text>
          <View style={styles.categoriesGrid}>
            {categories.length > 0 ? categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(cat.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                  <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                </View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
                <Text style={styles.categoryCount}>{cat.count}</Text>
              </TouchableOpacity>
            )) : (
              // Show loading state for categories
              Array.from({ length: 6 }).map((_, index) => (
                <View key={index} style={[styles.categoryCard, { opacity: 0.5 }]}>
                  <View style={[styles.categoryIcon, { backgroundColor: '#E5E7EB' }]}>
                    <ActivityIndicator size="small" color={COLORS.cyan500} />
                  </View>
                  <Text style={styles.categoryTitle}>Loading...</Text>
                  <Text style={styles.categoryCount}>...</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hot Deals</Text>
            <TouchableOpacity onPress={() => router.push('/travel/deals' as any)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredDeals.length > 0 ? featuredDeals.map((deal) => (
              <TouchableOpacity
                key={deal.id}
                style={styles.dealCard}
                onPress={() => handleDealPress(deal.id)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: deal.image }} style={styles.dealImage} />
                <View style={styles.cashbackBadge}>
                  <Text style={styles.cashbackText}>{deal.cashback}</Text>
                </View>
                <View style={styles.dealInfo}>
                  <Text style={styles.dealName}>{deal.name}</Text>
                  <Text style={styles.dealType}>{deal.type}</Text>
                  <Text style={styles.dealPrice}>{deal.price}</Text>
                </View>
              </TouchableOpacity>
            )) : (
              <View style={{ padding: 20 }}>
                <Text style={{ color: COLORS.gray600 }}>No featured deals available</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.promoBanner}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoGradient}
          >
            <Text style={styles.promoEmoji}>🌴</Text>
            <Text style={styles.promoTitle}>New Year Travel Sale</Text>
            <Text style={styles.promoSubtitle}>Up to 40% off on hotels • Extra coins on bookings</Text>
            <TouchableOpacity
              style={styles.promoButton}
              onPress={() => router.push('/travel/packages' as any)}
            >
              <Text style={styles.promoButtonText}>Explore</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  searchButton: {
    padding: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.cyan500,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 56) / 3,
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.gray50,
    borderRadius: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 2,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 10,
    color: COLORS.gray600,
  },
  dealCard: {
    width: 220,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  dealImage: {
    width: '100%',
    height: 130,
  },
  cashbackBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.green500,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  dealInfo: {
    padding: 12,
  },
  dealName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 2,
  },
  dealType: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 4,
  },
  dealPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.green500,
  },
  promoBanner: {
    marginHorizontal: 16,
  },
  promoGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  promoEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  promoButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  promoButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
  },
});

export default TravelPage;
