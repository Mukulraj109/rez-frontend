// StoreListPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Modal,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { SearchFilters, StoreResult, ProductItem, SearchResults, SearchError, AvailableFilters } from '@/types/store-search';
import {
  defaultSearchFilters
} from '@/utils/mock-store-search-data';
import SearchHeader from '@/components/store-search/SearchHeader';
import FilterChips from '@/components/store-search/FilterChips';
import StoreCard from '@/components/store-search/StoreCard';
import StoreListSkeleton from '@/components/store-search/StoreListSkeleton';
import EmptySearchResults from '@/components/store-search/EmptySearchResults';
import ErrorState from '@/components/store-search/ErrorState';
import { useStoreSearch } from '@/hooks/useStoreSearch';

const StoreListPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Local state for search and filters
  const [searchQuery, setSearchQuery] = useState((params.query as string) || (params.search as string) || '');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(defaultSearchFilters);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortByLocal] = useState<'rating' | 'distance' | 'name' | 'newest'>('rating');
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters>({
    categories: [],
    genders: [],
    priceRanges: [],
    paymentMethods: [],
  });

  // Use search hook with category from params
  const category = (params.category as string) || 'all';
  const {
    stores,
    loading: isLoading,
    refreshing,
    error: errorMessage,
    fetchStores,
    refreshStores,
    loadMoreStores,
    hasMore,
    setSortBy: setSortByInHook,
    clearError
  } = useStoreSearch({
    category,
    searchQuery,
    autoFetch: true,
    sortBy,
  });

  // Derive available filters from fetched stores
  useEffect(() => {
    if (stores.length > 0) {
      // Extract unique payment methods from stores
      const paymentMethodsSet = new Set<string>();
      stores.forEach(store => {
        if (store.operationalInfo?.paymentMethods) {
          store.operationalInfo.paymentMethods.forEach(method => paymentMethodsSet.add(method));
        }
      });

      const derivedFilters: AvailableFilters = {
        categories: [
          { id: 'fashion', label: 'Fashion', value: 'fashion', count: 0, icon: 'shirt-outline' },
          { id: 'electronics', label: 'Electronics', value: 'electronics', count: 0, icon: 'phone-portrait-outline' },
          { id: 'home', label: 'Home & Living', value: 'home', count: 0, icon: 'home-outline' },
          { id: 'beauty', label: 'Beauty', value: 'beauty', count: 0, icon: 'flower-outline' },
        ],
        genders: [
          { id: 'men', label: 'Men', value: 'men', count: 0, icon: 'male-outline' },
          { id: 'women', label: 'Women', value: 'women', count: 0, icon: 'female-outline' },
          { id: 'unisex', label: 'Unisex', value: 'unisex', count: 0, icon: 'people-outline' },
          { id: 'kids', label: 'Kids', value: 'kids', count: 0, icon: 'child-outline' },
        ],
        priceRanges: [
          { id: 'under-500', label: 'Under ₹500', min: 0, max: 500 },
          { id: '500-1000', label: '₹500 - ₹1000', min: 500, max: 1000 },
          { id: '1000-2000', label: '₹1000 - ₹2000', min: 1000, max: 2000 },
          { id: '2000-plus', label: 'Above ₹2000', min: 2000, max: 999999 },
        ],
        paymentMethods: Array.from(paymentMethodsSet).map((method, index) => ({
          id: method.toLowerCase().replace(/\s+/g, '-'),
          label: method,
          value: method.toLowerCase().replace(/\s+/g, '-'),
          count: stores.filter(s => s.operationalInfo?.paymentMethods?.includes(method)).length,
          icon: method.toLowerCase().includes('wallet') ? 'wallet-outline' :
                method.toLowerCase().includes('cod') || method.toLowerCase().includes('cash') ? 'cash-outline' :
                'card-outline',
        })),
      };

      setAvailableFilters(derivedFilters);
      console.log('✅ [STORE LIST] Derived filters from', stores.length, 'stores');
    }
  }, [stores]);

  // Convert stores to SearchResults format
  const searchResults: SearchResults | null = stores.length > 0 ? {
    query: searchQuery,
    totalResults: stores.length,
    totalStores: stores.length,
    stores: stores.map(store => ({
      storeId: store._id,
      storeName: store.name,
      rating: store.ratings?.average || 0,
      reviewCount: store.ratings?.count || 0,
      distance: store.distance || 0,
      location: store.location?.city || store.location?.address || '',
      isOpen: store.isActive || false,
      hasOnlineDelivery: true,
      hasFreeShipping: store.operationalInfo?.freeDeliveryAbove ? true : false,
      estimatedDelivery: store.operationalInfo?.deliveryTime,
      storeImage: store.banner,
      products: (store.products || []).map(product => ({
        productId: product._id,
        name: product.name || product.title || '',
        description: '',
        price: product.price?.current || 0,
        originalPrice: product.price?.original,
        discountPercentage: product.price?.discount,
        imageUrl: product.image || 'https://via.placeholder.com/150',
        imageAlt: product.name || product.title,
        hasRezPay: false,
        inStock: product.inventory?.isAvailable || true,
        rating: typeof product.rating?.value === 'string' ? parseFloat(product.rating.value) : product.rating?.value || 0,
        reviewCount: product.rating?.count || 0,
      })),
      totalProductsFound: store.products?.length || 0,
    })),
    filters: availableFilters,
    pagination: {
      page: 1,
      pageSize: 20,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    },
    suggestions: [],
  } : null;

  const error = errorMessage ? {
    code: 'SERVER_ERROR' as const,
    message: errorMessage,
    timestamp: new Date(),
    recoverable: true,
  } : null;

  // Screen dimensions
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  // Handle screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

  // Handle search query change
  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((newFilters: SearchFilters) => {
    setSearchFilters(newFilters);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await refreshStores();
  }, [refreshStores]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setSearchFilters(defaultSearchFilters);
  }, []);

  // Handle retry
  const handleRetry = useCallback(async () => {
    clearError();
    await fetchStores(1);
  }, [clearError, fetchStores]);

  // Check if filters are active
  const hasActiveFilters: boolean = 
    searchFilters.categories.length > 0 ||
    searchFilters.gender.length > 0 ||
    searchFilters.hasRezPay ||
    !!searchFilters.priceRange ||
    !!searchFilters.distance ||
    (searchFilters.storeStatus && searchFilters.storeStatus.length > 0) ||
    false;

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Handle product selection
  const handleProductSelect = useCallback((product: ProductItem, store: StoreResult) => {
    // Navigate to product details page
    router.push(`/product/${product.productId}?storeId=${store.storeId}`);
  }, [router]);

  // Handle store selection
  const handleStoreSelect = useCallback((store: StoreResult) => {
    // Navigate to store page
    router.push(`/MainStorePage?storeId=${store.storeId}`);
  }, [router]);

  // Handle sort change
  const handleSortChange = useCallback((newSortBy: 'rating' | 'distance' | 'name' | 'newest') => {
    setSortByLocal(newSortBy);
    setSortByInHook(newSortBy);
    setShowSortModal(false);
  }, [setSortByInHook]);

  // Handle load more
  const handleLoadMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      await loadMoreStores();
    }
  }, [isLoading, hasMore, loadMoreStores]);

  // Create styles based on screen dimensions
  const styles = createStyles(screenData);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />

        {/* Fixed Header with Gradient - DOES NOT SCROLL */}
        <LinearGradient
          colors={['#F8F9FF', '#F0F2FF', '#E8EDFF'] as const}
          style={styles.headerContainer}
        >
          {/* Search Header */}
          <SearchHeader
            query={searchQuery}
            onQueryChange={handleSearchQueryChange}
            onBack={handleBack}
            isLoading={isLoading}
          />

          {/* Filter Chips and Sort */}
          <View style={styles.filtersContainer}>
            <View style={styles.filterChipsWrapper}>
              <FilterChips
                filters={searchFilters}
                availableFilters={availableFilters}
                onFilterChange={handleFilterChange}
                isLoading={isLoading}
              />
            </View>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="swap-vertical" size={16} color="#7C3AED" />
              <Text style={styles.sortButtonText}>
                {sortBy === 'rating' ? 'Rating' :
                 sortBy === 'distance' ? 'Distance' :
                 sortBy === 'name' ? 'Name' : 'Newest'}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#7C3AED" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Scrollable Content Area - ONLY THIS SCROLLS */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor="#7C3AED"
              colors={['#7C3AED']}
            />
          }
        >
        {/* Loading State */}
        {isLoading && !searchResults && (
          <View style={styles.section}>
            <StoreListSkeleton itemCount={3} />
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View style={styles.section}>
            <ErrorState
              error={error}
              onRetry={handleRetry}
              onGoBack={handleBack}
              showBackButton={false}
            />
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && searchResults && searchResults.stores.length === 0 && (
          <View style={styles.section}>
            <EmptySearchResults
              searchQuery={searchQuery}
              hasFilters={hasActiveFilters}
              onClearFilters={hasActiveFilters ? handleClearFilters : undefined}
              onTryAgain={handleRetry}
              suggestions={searchResults.suggestions}
              onSuggestionPress={setSearchQuery}
            />
          </View>
        )}

        {/* Search Results */}
        {!isLoading && !error && searchResults && searchResults.stores.length > 0 && (
          <View style={styles.resultsContainer}>
            {searchResults.stores.map((store: StoreResult) => (
              <View key={store.storeId} style={styles.resultCardWrapper}>
                <StoreCard
                  store={store}
                  onStoreSelect={handleStoreSelect}
                  onProductSelect={handleProductSelect}
                  showDistance={true}
                  maxProducts={4}
                />
              </View>
            ))}

            {/* Load More Button */}
            {hasMore && !isLoading && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
                activeOpacity={0.7}
              >
                <Text style={styles.loadMoreText}>Load More Stores</Text>
                <Ionicons name="chevron-down" size={20} color="#7C3AED" />
              </TouchableOpacity>
            )}
          </View>
        )}
        <View/>
      </ScrollView>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.sortModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {(['rating', 'distance', 'name', 'newest'] as const).map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sortOption,
                  sortBy === option && styles.sortOptionActive,
                ]}
                onPress={() => handleSortChange(option)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.sortOptionText,
                  sortBy === option && styles.sortOptionTextActive,
                ]}>
                  {option === 'rating' ? 'Rating (High to Low)' :
                   option === 'distance' ? 'Distance (Near to Far)' :
                   option === 'name' ? 'Name (A-Z)' : 'Newest First'}
                </Text>
                {sortBy === option && (
                  <Ionicons name="checkmark" size={20} color="#7C3AED" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      </SafeAreaView>
    </View>
  );
};

const createStyles = (screenData: { width: number; height: number }) => {
  const { width } = screenData;
  const isTablet = width > 768;
  const horizontalPadding = isTablet ? 24 : 16;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8F9FF',
    },
    safeArea: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    headerContainer: {
      // Fixed header - doesn't scroll
      backgroundColor: 'transparent',
      paddingBottom: 8,
      zIndex: 10,
    },
    content: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    contentContainer: {
      paddingHorizontal: horizontalPadding,
      paddingTop: 12,
      paddingBottom: 100, // Prevent content being hidden by bottom navigation
    },
    section: {
      marginTop: 12,
      backgroundColor: 'transparent',
    },
    // Wrap each StoreCard with a small card wrapper to add consistent spacing and subtle grouping
    resultsContainer: {
      paddingTop: 8,
      paddingBottom: 8,
    },
    resultCardWrapper: {
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: 'transparent',
    },
    filtersContainer: {
      paddingHorizontal: horizontalPadding,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#F8F9FA',
    },
    filterChipsWrapper: {
      flex: 1,
      minWidth: 0, // Allow shrinking
    },
    sortButton: {
      flexShrink: 0, // Don't shrink the sort button
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 4,
      borderWidth: 1.5,
      borderColor: '#E8E8E8',
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    sortButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#7C3AED',
      letterSpacing: 0.1,
    },
    loadMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      marginTop: 16,
      marginBottom: 24,
      gap: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    loadMoreText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#7C3AED',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    sortModalContent: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 24,
      paddingBottom: 32,
      paddingHorizontal: 24,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#111827',
    },
    sortOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: '#F9FAFB',
    },
    sortOptionActive: {
      backgroundColor: '#EDE9FE',
    },
    sortOptionText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#374151',
    },
    sortOptionTextActive: {
      color: '#7C3AED',
      fontWeight: '600',
    },
  });
};

export default StoreListPage;
