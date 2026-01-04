import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import exploreApi, { HotProduct } from '@/services/exploreApi';

const { width } = Dimensions.get('window');

const sortOptions = [
  { id: 'trending', label: 'Trending' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'cashback', label: 'Highest Cashback' },
  { id: 'price', label: 'Price: Low to High' },
];

const ExploreHotPage = () => {
  const router = useRouter();
  const [selectedSort, setSelectedSort] = useState('trending');
  const [hotItems, setHotItems] = useState<HotProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch hot deals from API
  const fetchHotDeals = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await exploreApi.getHotDeals({ limit: 20 });

      if (response.success && response.data) {
        let products = response.data.products || [];

        // Sort locally based on selected sort option
        if (selectedSort === 'price') {
          products = [...products].sort((a, b) => a.price - b.price);
        } else if (selectedSort === 'cashback') {
          products = [...products].sort((a, b) => {
            const aDiscount = ((a.originalPrice - a.price) / a.originalPrice) * 100;
            const bDiscount = ((b.originalPrice - b.price) / b.originalPrice) * 100;
            return bDiscount - aDiscount;
          });
        }

        setHotItems(products);
      } else {
        setError(response.error || 'Failed to fetch hot deals');
      }
    } catch (err: any) {
      console.error('[HOT PAGE] Error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedSort]);

  // Initial fetch
  useEffect(() => {
    fetchHotDeals();
  }, [fetchHotDeals]);

  const onRefresh = useCallback(() => {
    fetchHotDeals(true);
  }, [fetchHotDeals]);

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0B2240" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>What's Hot</Text>
          <Text style={styles.headerSubtitle}>{hotItems.length} items trending</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={22} color="#0B2240" />
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortScroll}
        contentContainerStyle={styles.sortContainer}
      >
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.sortChip,
              selectedSort === option.id && styles.sortChipActive,
            ]}
            onPress={() => setSelectedSort(option.id)}
          >
            <Text
              style={[
                styles.sortLabel,
                selectedSort === option.id && styles.sortLabelActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Hot Items Grid */}
      <ScrollView
        style={styles.itemsScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.itemsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00C06A']} />
        }
      >
        {/* Loading State */}
        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00C06A" />
            <Text style={styles.loadingText}>Loading hot deals...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchHotDeals()}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && hotItems.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="flame-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No hot deals available</Text>
            <Text style={styles.emptySubtext}>Check back later for trending items</Text>
          </View>
        )}

        {/* Items Grid */}
        {!loading && !error && hotItems.length > 0 && (
        <View style={styles.grid}>
          {hotItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => navigateTo(`/MainStorePage?id=${item.id}`)}
            >
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />

                {/* Offer Badge */}
                <View style={styles.offerBadge}>
                  <Text style={styles.offerText}>{item.offer}</Text>
                </View>

                {/* Hot Badge */}
                <View style={styles.hotBadge}>
                  <Ionicons name="flame" size={12} color="#FFFFFF" />
                  <Text style={styles.hotText}>{item.buyers} bought</Text>
                </View>

                {/* Wishlist */}
                <TouchableOpacity style={styles.wishlistButton}>
                  <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.itemContent}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.storeRow}>
                  <Ionicons name="storefront" size={12} color="#6B7280" />
                  <Text style={styles.storeName}>{item.store}</Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
                  <Text style={styles.originalPrice}>
                    ₹{item.originalPrice.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.bottomRow}>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                    <Text style={styles.reviewsText}>({item.reviews})</Text>
                  </View>
                  <View style={styles.distanceBadge}>
                    <Ionicons name="location" size={12} color="#6B7280" />
                    <Text style={styles.distanceText}>{item.distance}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortScroll: {
    maxHeight: 50,
  },
  sortContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  sortChipActive: {
    backgroundColor: '#0B2240',
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  sortLabelActive: {
    color: '#FFFFFF',
  },
  itemsScroll: {
    flex: 1,
  },
  itemsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    minHeight: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
    paddingVertical: 60,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#00C06A',
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#9CA3AF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  imageContainer: {
    height: 140,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  offerBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#00C06A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  offerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hotBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  hotText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  wishlistButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    padding: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  storeName: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2240',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  reviewsText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    fontSize: 11,
    color: '#6B7280',
  },
});

export default ExploreHotPage;
