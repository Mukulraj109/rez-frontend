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
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import exploreApi, { ExploreStore, HotProduct } from '@/services/exploreApi';

const { width } = Dimensions.get('window');

type TabType = 'stores' | 'products';

const ExploreSearchPage = () => {
  const router = useRouter();
  const { q: initialQuery } = useLocalSearchParams();

  const [searchQuery, setSearchQuery] = useState(initialQuery as string || '');
  const [activeTab, setActiveTab] = useState<TabType>('stores');
  const [stores, setStores] = useState<ExploreStore[]>([]);
  const [products, setProducts] = useState<HotProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Search function
  const performSearch = useCallback(async (query: string, isRefresh = false) => {
    if (!query.trim()) {
      setStores([]);
      setProducts([]);
      setHasSearched(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      setHasSearched(true);

      // Search stores and products in parallel
      const [storesResponse, productsResponse] = await Promise.all([
        exploreApi.searchStores(query, { limit: 20 }),
        exploreApi.getHotDeals({ limit: 20 }),
      ]);

      if (storesResponse.success && storesResponse.data) {
        setStores(storesResponse.data.stores || []);
      }

      if (productsResponse.success && productsResponse.data) {
        // Filter products by search query (basic client-side filtering)
        const filteredProducts = productsResponse.data.products.filter((p: HotProduct) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          (p.store && p.store.toLowerCase().includes(query.toLowerCase()))
        );
        setProducts(filteredProducts);
      }
    } catch (err: any) {
      console.error('[SEARCH PAGE] Error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial search if query provided
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery as string);
    }
  }, [initialQuery, performSearch]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const onRefresh = useCallback(() => {
    performSearch(searchQuery, true);
  }, [searchQuery, performSearch]);

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setStores([]);
    setProducts([]);
    setHasSearched(false);
  };

  const currentResults = activeTab === 'stores' ? stores : products;
  const resultsCount = activeTab === 'stores' ? stores.length : products.length;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
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

          {/* Search Input */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stores, products..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={() => performSearch(searchQuery)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stores' && styles.tabActive]}
            onPress={() => setActiveTab('stores')}
          >
            <Ionicons
              name="storefront"
              size={16}
              color={activeTab === 'stores' ? '#00C06A' : '#6B7280'}
            />
            <Text style={[styles.tabText, activeTab === 'stores' && styles.tabTextActive]}>
              Stores ({stores.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'products' && styles.tabActive]}
            onPress={() => setActiveTab('products')}
          >
            <Ionicons
              name="pricetag"
              size={16}
              color={activeTab === 'products' ? '#00C06A' : '#6B7280'}
            />
            <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>
              Products ({products.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        <ScrollView
          style={styles.resultsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00C06A']} />
          }
        >
          {/* Loading State */}
          {loading && !refreshing && (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#00C06A" />
              <Text style={styles.centerText}>Searching...</Text>
            </View>
          )}

          {/* Error State */}
          {error && !loading && (
            <View style={styles.centerContainer}>
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => performSearch(searchQuery)}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Initial State - No Search Yet */}
          {!hasSearched && !loading && (
            <View style={styles.centerContainer}>
              <Ionicons name="search" size={48} color="#9CA3AF" />
              <Text style={styles.centerTitle}>Search ReZ</Text>
              <Text style={styles.centerSubtext}>Find stores, products, and deals near you</Text>
            </View>
          )}

          {/* Empty State */}
          {hasSearched && !loading && !error && currentResults.length === 0 && (
            <View style={styles.centerContainer}>
              <Ionicons name="search-outline" size={48} color="#9CA3AF" />
              <Text style={styles.centerTitle}>No {activeTab} found</Text>
              <Text style={styles.centerSubtext}>Try a different search term</Text>
            </View>
          )}

          {/* Store Results */}
          {!loading && !error && activeTab === 'stores' && stores.map((store) => (
            <TouchableOpacity
              key={store.id}
              style={styles.storeCard}
              onPress={() => navigateTo(`/MainStorePage?id=${store.id}`)}
            >
              {store.image ? (
                <Image source={{ uri: store.image }} style={styles.storeImage} />
              ) : (
                <View style={[styles.storeImage, styles.storePlaceholder]}>
                  <Ionicons name="storefront" size={28} color="#9CA3AF" />
                </View>
              )}

              <View style={styles.storeContent}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeCategory}>{store.category}</Text>

                <View style={styles.storeFooter}>
                  {store.rating && (
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.ratingText}>{store.rating}</Text>
                    </View>
                  )}
                  {store.distance && (
                    <View style={styles.infoBadge}>
                      <Ionicons name="location" size={12} color="#6B7280" />
                      <Text style={styles.infoText}>{store.distance}</Text>
                    </View>
                  )}
                </View>

                {store.cashback && (
                  <View style={styles.cashbackBadge}>
                    <Text style={styles.cashbackText}>{store.cashback} Cashback</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {/* Product Results */}
          {!loading && !error && activeTab === 'products' && products.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => navigateTo(`/ProductPage?cardId=${product.id}&cardType=product`)}
            >
              {product.image ? (
                <Image source={{ uri: product.image }} style={styles.productImage} />
              ) : (
                <View style={[styles.productImage, styles.productPlaceholder]}>
                  <Ionicons name="cube" size={28} color="#9CA3AF" />
                </View>
              )}

              <View style={styles.productContent}>
                <Text style={styles.productName}>{product.name}</Text>
                {product.store && <Text style={styles.productStore}>{product.store}</Text>}

                <View style={styles.priceRow}>
                  <Text style={styles.productPrice}>₹{product.price}</Text>
                  {product.originalPrice > product.price && (
                    <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
                  )}
                </View>

                {product.offer && (
                  <View style={styles.offerBadge}>
                    <Text style={styles.offerText}>{product.offer}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0B2240',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#00C06A',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#00C06A',
    fontWeight: '600',
  },
  resultsList: {
    flex: 1,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    minHeight: 300,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  centerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  centerText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  centerSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
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
  storeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storeImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  storePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B2240',
  },
  storeCategory: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  storeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  cashbackBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00C06A',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  productPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0B2240',
  },
  productStore: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2240',
  },
  originalPrice: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  offerBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  offerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00C06A',
  },
});

export default ExploreSearchPage;
