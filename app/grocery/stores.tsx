/**
 * Grocery Stores Directory Page
 * Browse all grocery stores with filtering
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  TextInput,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GroceryStoreCard, StoresListSkeleton } from '@/components/grocery';
import { storesApi } from '@/services/storesApi';

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
  orange500: '#F97316',
};

interface Store {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  banner?: string;
  rating?: { average?: number; count?: number };
  maxCashback?: number;
  operationalInfo?: {
    deliveryTime?: { min?: number; max?: number };
    minimumOrder?: number;
    freeDeliveryAbove?: number;
  };
  tags?: string[];
  deliveryCategories?: {
    fastDelivery?: boolean;
    budgetFriendly?: boolean;
    organic?: boolean;
    premium?: boolean;
  };
  isOpen?: boolean;
  distance?: string;
}

const GroceryStoresPage: React.FC = () => {
  const router = useRouter();

  // State
  const [stores, setStores] = useState<Store[]>([]);
  const [featuredStores, setFeaturedStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'All Stores', icon: 'grid-outline' },
    { key: 'fast', label: 'Fast Delivery', icon: 'flash-outline' },
    { key: 'cashback', label: 'High Cashback', icon: 'cash-outline' },
    { key: 'rating', label: 'Top Rated', icon: 'star-outline' },
    { key: 'organic', label: 'Organic', icon: 'leaf-outline' },
  ];

  // Fetch stores
  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);

      const [storesRes, featuredRes] = await Promise.all([
        storesApi.getStores({ category: 'grocery', limit: 20 }),
        storesApi.getFeaturedStores(5),
      ]);

      if (storesRes.success && storesRes.data?.stores) {
        let allStores = storesRes.data.stores;

        // Apply filters
        if (selectedFilter === 'fast') {
          allStores = allStores.filter((s: any) => s.deliveryCategories?.fastDelivery);
        } else if (selectedFilter === 'cashback') {
          allStores = allStores.sort((a: any, b: any) => (b.maxCashback || 0) - (a.maxCashback || 0));
        } else if (selectedFilter === 'rating') {
          allStores = allStores.sort((a: any, b: any) => (b.rating?.average || 0) - (a.rating?.average || 0));
        } else if (selectedFilter === 'organic') {
          allStores = allStores.filter((s: any) => s.deliveryCategories?.organic || s.tags?.includes('organic'));
        }

        setStores(allStores);
      } else {
        setStores(getFallbackStores());
      }

      if (featuredRes.success && featuredRes.data) {
        setFeaturedStores(Array.isArray(featuredRes.data) ? featuredRes.data.slice(0, 3) : []);
      } else {
        setFeaturedStores(getFallbackStores().slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
      setStores(getFallbackStores());
      setFeaturedStores(getFallbackStores().slice(0, 3));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedFilter]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStores();
  }, [fetchStores]);

  // Filter stores by search
  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render featured store card
  const renderFeaturedStore = (store: Store) => {
    const storeId = store.id || store._id || '';
    const deliveryTime = store.operationalInfo?.deliveryTime
      ? store.operationalInfo?.deliveryTime || "15-30 min"
      : '30-45 min';

    return (
      <TouchableOpacity
        key={storeId}
        style={styles.featuredCard}
        onPress={() => router.push(`/store/${storeId}` as any)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: store.banner || store.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300' }}
          style={styles.featuredImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.featuredOverlay}
        >
          {(store.offers?.cashback || store.maxCashback) && (store.offers?.cashback || store.maxCashback) > 0 && (
            <View style={styles.cashbackBadge}>
              <Text style={styles.cashbackText}>{store.offers?.cashback || store.maxCashback}% Cashback</Text>
            </View>
          )}
          <View style={styles.featuredContent}>
            {store.logo && (
              <Image source={{ uri: store.logo }} style={styles.storeLogo} />
            )}
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredName}>{store.name}</Text>
              <View style={styles.featuredMeta}>
                {store.rating?.average && (
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color={COLORS.amber500} />
                    <Text style={styles.ratingText}>{(store.ratings?.average || store.rating?.average || 4.5).toFixed(1)}</Text>
                  </View>
                )}
                <View style={styles.deliveryBadge}>
                  <Ionicons name="time-outline" size={12} color={COLORS.green500} />
                  <Text style={styles.deliveryText}>{deliveryTime}</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Render store list item
  const renderStoreItem = (store: Store) => {
    const storeId = store.id || store._id || '';
    const deliveryTime = store.operationalInfo?.deliveryTime
      ? store.operationalInfo?.deliveryTime || "15-30 min"
      : '30-45 min';

    // Build tags
    const tags: string[] = [];
    if (store.deliveryCategories?.fastDelivery) tags.push('Fast');
    if (store.deliveryCategories?.organic) tags.push('Organic');
    if (store.deliveryCategories?.premium) tags.push('Premium');

    return (
      <TouchableOpacity
        key={storeId}
        style={styles.storeCard}
        onPress={() => router.push(`/store/${storeId}` as any)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: store.logo || store.banner || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80' }}
          style={styles.storeImage}
        />
        {(store.offers?.cashback || store.maxCashback) && (store.offers?.cashback || store.maxCashback) > 0 && (
          <View style={styles.storeCashbackBadge}>
            <Text style={styles.storeCashbackText}>{store.offers?.cashback || store.maxCashback}%</Text>
          </View>
        )}
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{store.name}</Text>
          <View style={styles.storeMeta}>
            {store.rating?.average && (
              <>
                <Ionicons name="star" size={12} color={COLORS.amber500} />
                <Text style={styles.storeRating}>{(store.ratings?.average || store.rating?.average || 4.5).toFixed(1)}</Text>
              </>
            )}
            <View style={styles.dot} />
            <Text style={styles.storeDelivery}>{deliveryTime}</Text>
          </View>
          {tags.length > 0 && (
            <View style={styles.tagsRow}>
              {tags.map((tag, idx) => (
                <View key={idx} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#F97316', '#EA580C']}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Grocery Stores</Text>
              <Text style={styles.headerSubtitle}>Loading stores...</Text>
            </View>
          </View>
        </LinearGradient>
        <StoresListSkeleton count={5} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#F97316', '#EA580C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Grocery Stores</Text>
            <Text style={styles.headerSubtitle}>{stores.length} stores near you</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stores..."
            placeholderTextColor={COLORS.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Ionicons
                name={filter.icon as any}
                size={16}
                color={selectedFilter === filter.key ? COLORS.white : COLORS.gray600}
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter.key && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#F97316']}
            tintColor="#F97316"
          />
        }
      >
        {/* Featured Stores */}
        {featuredStores.length > 0 && !searchQuery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Stores</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScroll}
            >
              {featuredStores.map(renderFeaturedStore)}
            </ScrollView>
          </View>
        )}

        {/* All Stores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? `Results for "${searchQuery}"` : 'All Stores'}
          </Text>
          {filteredStores.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={48} color={COLORS.gray400} />
              <Text style={styles.emptyText}>No stores found</Text>
            </View>
          ) : (
            <View style={styles.storesList}>
              {filteredStores.map(renderStoreItem)}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

// Fallback stores
function getFallbackStores(): Store[] {
  return [
    {
      id: 'bigbasket',
      name: 'BigBasket',
      logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100',
      banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      rating: { average: 4.5, count: 12500 },
      maxCashback: 15,
      operationalInfo: { deliveryTime: '30-45 min' },
      deliveryCategories: { fastDelivery: true, organic: true },
      tags: ['grocery', 'supermarket'],
    },
    {
      id: 'blinkit',
      name: 'Blinkit',
      logo: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100',
      banner: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400',
      rating: { average: 4.6, count: 8500 },
      maxCashback: 20,
      operationalInfo: { deliveryTime: '8-15 min' },
      deliveryCategories: { fastDelivery: true, premium: true },
      tags: ['grocery', 'quick-delivery'],
    },
    {
      id: 'zepto',
      name: 'Zepto',
      logo: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=100',
      banner: 'https://images.unsplash.com/photo-1534723452862-4b7bb135bc9d?w=400',
      rating: { average: 4.4, count: 6200 },
      maxCashback: 25,
      operationalInfo: { deliveryTime: '10-20 min' },
      deliveryCategories: { fastDelivery: true },
      tags: ['grocery', 'quick-delivery'],
    },
    {
      id: 'dmart',
      name: 'DMart Ready',
      logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=100',
      banner: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400',
      rating: { average: 4.3, count: 9800 },
      maxCashback: 10,
      operationalInfo: { deliveryTime: '45-90 min' },
      deliveryCategories: { budgetFriendly: true },
      tags: ['grocery', 'supermarket', 'budget'],
    },
    {
      id: 'organic-garden',
      name: 'Organic Garden',
      logo: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=200',
      banner: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400',
      rating: { average: 4.7, count: 1800 },
      maxCashback: 20,
      operationalInfo: { deliveryTime: '60-120 min' },
      deliveryCategories: { organic: true, premium: true },
      tags: ['grocery', 'organic'],
    },
  ];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.navy,
  },
  filtersContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    marginRight: 8,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: COLORS.orange500,
  },
  filterChipText: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  section: {
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  featuredScroll: {
    paddingHorizontal: 16,
  },
  featuredCard: {
    width: 280,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 12,
  },
  cashbackBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.green500,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 10,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.white,
  },
  storesList: {
    paddingHorizontal: 16,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  storeImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
  },
  storeCashbackBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    backgroundColor: COLORS.green500,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  storeCashbackText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  storeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.navy,
  },
  storeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  storeRating: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
    marginLeft: 2,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.gray400,
    marginHorizontal: 6,
  },
  storeDelivery: {
    fontSize: 12,
    color: COLORS.green500,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  tagBadge: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray600,
    marginTop: 12,
  },
});

export default GroceryStoresPage;
