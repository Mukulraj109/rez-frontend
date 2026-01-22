/**
 * Grocery & Essentials Hub Page
 * Main entry point for grocery section with API integration
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
  RefreshControl,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GroceryHubSkeleton, GroceryStoreCard } from '@/components/grocery';
import { categoriesApi } from '@/services/categoriesApi';
import { storesApi } from '@/services/storesApi';
import { useRegion } from '@/contexts/RegionContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#6B7280',
  green500: '#22C55E',
  green600: '#16A34A',
  amber500: '#F59E0B',
};

// Static category configuration with icons
const categoryConfig: Record<string, { icon: string; color: string }> = {
  fruits: { icon: '🍎', color: '#FF6B6B' },
  veggies: { icon: '🥕', color: '#4CAF50' },
  dairy: { icon: '🥛', color: '#2196F3' },
  snacks: { icon: '🍪', color: '#FF9800' },
  beverages: { icon: '🥤', color: '#00BCD4' },
  staples: { icon: '🌾', color: '#795548' },
  essentials: { icon: '🧴', color: '#22C55E' },
  daily: { icon: '🥛', color: '#3B82F6' },
  supermarket: { icon: '🛒', color: '#F97316' },
  organic: { icon: '🌿', color: '#10B981' },
  deals: { icon: '🏷️', color: '#EF4444' },
  fresh: { icon: '🥬', color: '#84CC16' },
  'personal-care': { icon: '🧴', color: '#E91E63' },
  household: { icon: '🧹', color: '#9C27B0' },
};

// Default categories for display
const defaultCategories = [
  { id: 'fruits', title: 'Fruits', icon: '🍎', color: '#FF6B6B', count: 0 },
  { id: 'veggies', title: 'Vegetables', icon: '🥕', color: '#4CAF50', count: 0 },
  { id: 'dairy', title: 'Dairy & Eggs', icon: '🥛', color: '#2196F3', count: 0 },
  { id: 'snacks', title: 'Snacks', icon: '🍪', color: '#FF9800', count: 0 },
  { id: 'staples', title: 'Staples', icon: '🌾', color: '#795548', count: 0 },
  { id: 'beverages', title: 'Beverages', icon: '🥤', color: '#00BCD4', count: 0 },
];

interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
  count: number;
}

interface Store {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  cashback: string;
  image: string;
  logo?: string;
}

interface Stats {
  storeCount: number;
  maxCashback: number;
  fastestDelivery: string;
}

const GroceryPage: React.FC = () => {
  const router = useRouter();
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();

  // State
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [featuredStores, setFeaturedStores] = useState<Store[]>([]);
  const [quickStores, setQuickStores] = useState<Store[]>([]);
  const [stats, setStats] = useState<Stats>({ storeCount: 50, maxCashback: 25, fastestDelivery: '10 min' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch categories and stores in parallel
      const [categoriesRes, storesRes] = await Promise.all([
        categoriesApi.getCategoryTree('home_delivery'),
        storesApi.getStores({ category: 'grocery', limit: 10 }),
      ]);

      // Process categories
      if (categoriesRes.success && categoriesRes.data) {
        const groceryCategory = categoriesRes.data.find((cat: any) =>
          cat.slug === 'grocery' || cat.name?.toLowerCase().includes('grocery')
        );

        if (groceryCategory && groceryCategory.subcategories?.length > 0) {
          const mappedCategories = groceryCategory.subcategories.map((sub: any) => {
            const config = categoryConfig[sub.slug] || { icon: '🛒', color: '#22C55E' };
            return {
              id: sub.slug,
              title: sub.name,
              icon: config.icon,
              color: config.color,
              count: sub.productCount || 0,
            };
          });
          setCategories(mappedCategories.length > 0 ? mappedCategories : defaultCategories);
        }
      }

      // Process stores
      if (storesRes.success && storesRes.data?.stores) {
        const stores = storesRes.data.stores;

        // Map stores to display format
        const mappedStores: Store[] = stores.map((store: any) => ({
          id: store.id || store._id,
          name: store.name,
          rating: (store.ratings?.average || store.rating?.average) || 4.5,
          deliveryTime: store.operationalInfo?.deliveryTime
            ? store.operationalInfo?.deliveryTime || "15-30 min"
            : '30-45 min',
          cashback: `${(store.offers?.cashback || store.maxCashback) || 15}%`,
          image: store.banner || store.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
          logo: store.logo,
        }));

        setFeaturedStores(mappedStores.slice(0, 5));

        // Filter quick delivery stores
        const quick = stores
          .filter((s: any) =>
            s.deliveryCategories?.fastDelivery ||
            (s.operationalInfo?.deliveryTime?.includes("-") && parseInt(s.operationalInfo.deliveryTime.split("-")[1]) <= 30)
          )
          .map((store: any) => ({
            id: store.id || store._id,
            name: store.name,
            rating: (store.ratings?.average || store.rating?.average) || 4.5,
            deliveryTime: store.operationalInfo?.deliveryTime
              ? store.operationalInfo?.deliveryTime?.split("-")[0] + " min" || "15 min"
              : '15 min',
            cashback: `${(store.offers?.cashback || store.maxCashback) || 15}%`,
            image: store.banner || store.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
            logo: store.logo,
          }));
        setQuickStores(quick.slice(0, 4));

        // Calculate stats
        const maxCashback = Math.max(...stores.map((s: any) => s.maxCashback || 0), 25);
        const fastestTime = Math.min(
          ...stores.map((s: any) => s.operationalInfo?.deliveryTime?.min || 30),
          10
        );
        setStats({
          storeCount: stores.length,
          maxCashback,
          fastestDelivery: `${fastestTime} min`,
        });
      } else {
        // Use fallback data
        setFeaturedStores(getFallbackStores());
        setQuickStores(getFallbackStores().slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching grocery data:', err);
      setFeaturedStores(getFallbackStores());
      setQuickStores(getFallbackStores().slice(0, 3));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&category=grocery` as any);
    }
  };

  if (loading) {
    return <GroceryHubSkeleton />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#22C55E', '#16A34A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Grocery & Essentials</Text>
            <Text style={styles.headerSubtitle}>Fresh groceries delivered</Text>
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons name={showSearch ? 'close' : 'search'} size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.gray400} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search groceries..."
              placeholderTextColor={COLORS.gray400}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoFocus
            />
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.storeCount}+</Text>
            <Text style={styles.statLabel}>Stores</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.maxCashback}%</Text>
            <Text style={styles.statLabel}>Max Cashback</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.fastestDelivery}</Text>
            <Text style={styles.statLabel}>Fastest</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#22C55E']}
            tintColor="#22C55E"
          />
        }
      >
        {/* Categories Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() => router.push(`/grocery/${cat.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                  <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                </View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
                <Text style={styles.categoryCount}>
                  {cat.count > 0 ? `${cat.count} items` : 'Browse'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: '#FEF3C7' }]}
            onPress={() => router.push('/grocery/deals' as any)}
          >
            <Text style={styles.quickActionIcon}>🔥</Text>
            <Text style={styles.quickActionTitle}>Hot Deals</Text>
            <Text style={styles.quickActionSubtitle}>Save more</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: '#E0E7FF' }]}
            onPress={() => router.push('/grocery/compare' as any)}
          >
            <Text style={styles.quickActionIcon}>⚖️</Text>
            <Text style={styles.quickActionTitle}>Compare</Text>
            <Text style={styles.quickActionSubtitle}>Best price</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: '#D1FAE5' }]}
            onPress={() => router.push('/grocery/stores' as any)}
          >
            <Text style={styles.quickActionIcon}>🏪</Text>
            <Text style={styles.quickActionTitle}>Stores</Text>
            <Text style={styles.quickActionSubtitle}>Big Bazaar+</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Delivery Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="flash" size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Quick Delivery</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/grocery/quick' as any)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {quickStores.map((store) => (
              <TouchableOpacity
                key={store.id}
                style={styles.quickStoreCard}
                onPress={() => router.push(`/store/${store.id}` as any)}
                activeOpacity={0.9}
              >
                <View style={styles.quickBadge}>
                  <Ionicons name="flash" size={10} color="#FCD34D" />
                  <Text style={styles.quickBadgeText}>{store.deliveryTime}</Text>
                </View>
                <Image
                  source={{ uri: store.logo || store.image }}
                  style={styles.quickStoreLogo}
                />
                <Text style={styles.quickStoreName} numberOfLines={1}>{store.name}</Text>
                <Text style={styles.quickStoreCashback}>{store.cashback} cashback</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Stores */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Stores</Text>
            <TouchableOpacity onPress={() => router.push('/grocery/stores' as any)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredStores.map((store) => (
              <TouchableOpacity
                key={store.id}
                style={styles.storeCard}
                onPress={() => router.push(`/store/${store.id}` as any)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: store.image }} style={styles.storeImage} />
                <View style={styles.cashbackBadge}>
                  <Text style={styles.cashbackText}>{store.cashback}</Text>
                </View>
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <View style={styles.storeMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color={COLORS.amber500} />
                      <Text style={styles.ratingText}>{(store.rating || 4.5).toFixed(1)}</Text>
                    </View>
                    <Text style={styles.deliveryText}>{store.deliveryTime}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <LinearGradient
            colors={['#F97316', '#EA580C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoGradient}
          >
            <Text style={styles.promoEmoji}>🛒</Text>
            <Text style={styles.promoTitle}>First Order? Get {currencySymbol}100 Off</Text>
            <Text style={styles.promoSubtitle}>+ Free delivery on orders above {currencySymbol}199</Text>
            <TouchableOpacity
              style={styles.promoButton}
              onPress={() => router.push('/grocery/deals' as any)}
            >
              <Text style={styles.promoButtonText}>Order Now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

// Fallback stores data
function getFallbackStores(): Store[] {
  return [
    {
      id: 'bigbasket',
      name: 'BigBasket',
      rating: 4.5,
      deliveryTime: '30-45 min',
      cashback: '15%',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100',
    },
    {
      id: 'blinkit',
      name: 'Blinkit',
      rating: 4.6,
      deliveryTime: '8-15 min',
      cashback: '20%',
      image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400',
      logo: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100',
    },
    {
      id: 'zepto',
      name: 'Zepto',
      rating: 4.4,
      deliveryTime: '10-20 min',
      cashback: '25%',
      image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400',
      logo: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=100',
    },
    {
      id: 'dmart',
      name: 'DMart Ready',
      rating: 4.3,
      deliveryTime: '45-90 min',
      cashback: '10%',
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400',
      logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=100',
    },
  ];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.navy,
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
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green500,
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
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
  },
  quickActionSubtitle: {
    fontSize: 10,
    color: COLORS.gray600,
  },
  quickStoreCard: {
    width: 90,
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  quickBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.green500,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
    gap: 2,
  },
  quickBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.white,
  },
  quickStoreLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gray100,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    marginBottom: 6,
  },
  quickStoreName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.navy,
    textAlign: 'center',
  },
  quickStoreCashback: {
    fontSize: 10,
    color: COLORS.green500,
    fontWeight: '500',
  },
  storeCard: {
    width: 200,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  storeImage: {
    width: '100%',
    height: 120,
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
  storeInfo: {
    padding: 12,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  storeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.navy,
  },
  deliveryText: {
    fontSize: 12,
    color: COLORS.green500,
    fontWeight: '600',
  },
  promoBanner: {
    marginHorizontal: 16,
    marginTop: 20,
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
    color: '#F97316',
  },
});

export default GroceryPage;
