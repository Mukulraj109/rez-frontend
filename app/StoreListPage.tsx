// StoreListPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { getSubSubCategories, SubSubCategory } from '@/config/subSubCategoryConfig';
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

  // Parse sortBy from URL params (for Quick Buttons: Near me, Top rated)
  const sortByFromParams = (params.sortBy as string) as 'rating' | 'distance' | 'name' | 'newest' | undefined;
  const validSortBy = ['rating', 'distance', 'name', 'newest'].includes(sortByFromParams || '')
    ? sortByFromParams
    : 'rating';

  // Local state for search and filters
  const [searchQuery, setSearchQuery] = useState((params.query as string) || (params.search as string) || '');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(defaultSearchFilters);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortByLocal] = useState<'rating' | 'distance' | 'name' | 'newest'>(validSortBy!);
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters>({
    categories: [],
    genders: [],
    priceRanges: [],
    paymentMethods: [],
  });

  // Use search hook with category from params
  const categoryFromParams = (params.category as string) || 'all';

  // Parse subcategories from params
  const subcategoriesParam = params.subcategories as string;
  const subcategories = useMemo(() => {
    try {
      return subcategoriesParam ? JSON.parse(subcategoriesParam) : [];
    } catch {
      return [];
    }
  }, [subcategoriesParam]);

  // Subcategory selection state
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);

  // Sub-sub-category (cuisine/item type) filter state
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<string>('all');

  // Get available sub-sub-categories based on current category slug
  const availableSubSubCategories = useMemo((): SubSubCategory[] => {
    // The category param is now the subcategory slug (e.g., 'cafes', 'qsr-fast-food')
    return getSubSubCategories(categoryFromParams);
  }, [categoryFromParams]);

  // Always use parent category for fetching stores
  // Subcategory is used to filter products within stores
  const effectiveCategory = categoryFromParams;

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
    category: effectiveCategory,
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
  // Filter products by selected subcategory and sub-sub-category if chosen
  const searchResults: SearchResults | null = stores.length > 0 ? {
    query: searchQuery,
    totalResults: stores.length,
    totalStores: stores.length,
    stores: stores.map((store, storeIndex) => {
      // Filter products by subcategory if selected
      let filteredProducts = store.products || [];
      if (selectedSubcategory !== 'all' && filteredProducts.length > 0) {
        filteredProducts = filteredProducts.filter((product: any) =>
          product.subCategory === selectedSubcategory ||
          product.subCategory?._id === selectedSubcategory ||
          product.subcategory === selectedSubcategory
        );
      }

      // Filter products by sub-sub-category (cuisine/item type) if selected
      if (selectedSubSubCategory !== 'all' && filteredProducts.length > 0) {
        // Get the display name from config for the selected slug
        const selectedSubSubConfig = availableSubSubCategories.find(s => s.slug === selectedSubSubCategory);
        const selectedSubSubName = selectedSubSubConfig?.name || '';

        filteredProducts = filteredProducts.filter((product: any) => {
          const productSubSub = product.subSubCategory || '';

          // Match by exact slug
          if (productSubSub === selectedSubSubCategory) return true;

          // Match by exact name from config
          if (selectedSubSubName && productSubSub === selectedSubSubName) return true;

          // Match by partial name (case-insensitive)
          if (selectedSubSubName && productSubSub.toLowerCase().includes(selectedSubSubName.toLowerCase())) return true;
          if (productSubSub.toLowerCase().includes(selectedSubSubCategory.toLowerCase())) return true;

          // Match slug converted to words (e.g., 'espresso-drinks' -> 'espresso drinks')
          const slugAsWords = selectedSubSubCategory.replace(/-/g, ' ');
          if (productSubSub.toLowerCase().includes(slugAsWords)) return true;

          // Also check product tags for matching sub-sub-category
          if (product.tags && Array.isArray(product.tags)) {
            return product.tags.some((tag: string) =>
              tag.toLowerCase().includes(slugAsWords) ||
              (selectedSubSubName && tag.toLowerCase().includes(selectedSubSubName.toLowerCase()))
            );
          }

          return false;
        });
      }

      return {
      storeId: store._id,
      storeName: store.name || 'Unnamed Store',
      rating: store.ratings?.average || 0,
      reviewCount: store.ratings?.count || 0,
      distance: store.distance !== undefined ? store.distance : null,
      location: store.location?.city || store.location?.address || 'Location not available',
      isOpen: store.isActive !== false, // Default to true if not specified
      hasOnlineDelivery: true, // Assume online delivery is available
      hasFreeShipping: store.operationalInfo?.freeDeliveryAbove ? true : false,
      estimatedDelivery: store.operationalInfo?.deliveryTime || null,
      storeImage: Array.isArray(store.banner) ? store.banner[0] : store.banner || null, // Banner for main display (use first if array)
      logo: store.logo || null, // Logo for overlay
      description: store.description || '',
      deliveryCategories: store.deliveryCategories || {},
      products: filteredProducts.map((product: any) => {
        // Handle both old and new product data structures
        // New structure from backend transformation: { price: number, originalPrice: number, rating: number }
        // Old structure: { price: { current, original }, rating: { value, count } }
        const isNewStructure = typeof product.price === 'number';

        // Safe price extraction with fallback
        const getPrice = () => {
          if (isNewStructure) {
            return typeof product.price === 'number' ? product.price : 0;
          }
          return typeof product.price?.current === 'number' ? product.price.current : 0;
        };

        // Safe rating extraction with fallback
        const getRating = () => {
          if (isNewStructure) {
            return typeof product.rating === 'number' ? product.rating : 0;
          }
          if (typeof product.rating?.value === 'number') {
            return product.rating.value;
          }
          if (typeof product.rating?.value === 'string') {
            const parsed = parseFloat(product.rating.value);
            return isNaN(parsed) ? 0 : parsed;
          }
          return 0;
        };

        const transformedProduct = {
          productId: product._id || product.productId || '',
          name: product.name || product.title || '',
          description: product.description || '',
          price: getPrice(),
          originalPrice: isNewStructure ? (product.originalPrice || null) : (product.price?.original || null),
          discountPercentage: isNewStructure ? (product.discountPercentage || null) : (product.price?.discount || null),
          imageUrl: product.imageUrl || product.image || 'https://via.placeholder.com/150',
          imageAlt: product.imageAlt || product.name || product.title || 'Product image',
          hasRezPay: product.hasRezPay !== undefined ? product.hasRezPay : false,
          inStock: product.inStock !== undefined ? product.inStock : (product.inventory?.isAvailable !== undefined ? product.inventory.isAvailable : true),
          category: product.category || '',
          subcategory: product.subcategory || '',
          brand: product.brand || '',
          rating: getRating(),
          reviewCount: isNewStructure ? (product.reviewCount || 0) : (product.rating?.count || 0),
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
          colors: Array.isArray(product.colors) ? product.colors : [],
          tags: Array.isArray(product.tags) ? product.tags : [],
        };

        return transformedProduct;
      }),
      totalProductsFound: filteredProducts.length,
    };
    }),
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
    console.log('🔧 [STORE LIST] Navigating to ProductPage:', {
      productId: product.productId,
      storeId: store.storeId
    });

    // Navigate to ProductPage (comprehensive product page)
    // ✅ FIX: Use 'id' parameter instead of 'cardId' for consistency
    router.push({
      pathname: '/ProductPage',
      params: {
        id: product.productId,  // ✅ Changed from cardId to id
        cardType: 'product',
        storeId: store.storeId,
      },
    } as any);
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
        <StatusBar barStyle="light-content" backgroundColor="#00C06A" />

        {/* Fixed Header with Gradient - DOES NOT SCROLL */}
        <LinearGradient
          colors={['#E8FFF3', '#F0FFF7', '#F8FFFC'] as const}
          style={styles.headerContainer}
        >
          {/* Search Header */}
          <SearchHeader
            query={searchQuery}
            onQueryChange={handleSearchQueryChange}
            onBack={handleBack}
            isLoading={isLoading}
            title={params.title ? decodeURIComponent(params.title as string) : undefined}
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
              <Ionicons name="swap-vertical" size={16} color="#00C06A" />
              <Text style={styles.sortButtonText}>
                {sortBy === 'rating' ? 'Rating' :
                 sortBy === 'distance' ? 'Distance' :
                 sortBy === 'name' ? 'Name' : 'Newest'}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#00C06A" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Subcategory Filter Dropdown - Only show if subcategories exist */}
        {subcategories.length > 0 && (
          <View style={styles.subcategoryContainer}>
            <TouchableOpacity
              style={styles.subcategoryDropdown}
              onPress={() => setShowSubcategoryModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.subcategoryLabel}>
                {selectedSubcategory === 'all'
                  ? 'All Subcategories'
                  : (() => {
                      const found = subcategories.find((s: any) => s._id === selectedSubcategory);
                      if (!found) return 'All';
                      return typeof found.name === 'string' ? found.name : 'Subcategory';
                    })()}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#00C06A" />
            </TouchableOpacity>
          </View>
        )}

        {/* Sub-Sub-Category Filter Chips - Cuisine/Item Type Filters */}
        {availableSubSubCategories.length > 0 && (
          <View style={styles.subSubCategoryContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subSubCategoryScrollContent}
            >
              {/* "All" chip */}
              <TouchableOpacity
                style={[
                  styles.subSubCategoryChip,
                  selectedSubSubCategory === 'all' && styles.subSubCategoryChipActive
                ]}
                onPress={() => setSelectedSubSubCategory('all')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.subSubCategoryChipText,
                  selectedSubSubCategory === 'all' && styles.subSubCategoryChipTextActive
                ]}>
                  All
                </Text>
              </TouchableOpacity>

              {/* Sub-sub-category chips */}
              {availableSubSubCategories.map((subSub) => (
                <TouchableOpacity
                  key={subSub.slug}
                  style={[
                    styles.subSubCategoryChip,
                    selectedSubSubCategory === subSub.slug && styles.subSubCategoryChipActive
                  ]}
                  onPress={() => setSelectedSubSubCategory(subSub.slug)}
                  activeOpacity={0.7}
                >
                  {subSub.icon && (
                    <Ionicons
                      name={(subSub.icon + '-outline') as keyof typeof Ionicons.glyphMap}
                      size={14}
                      color={selectedSubSubCategory === subSub.slug ? '#FFFFFF' : '#00C06A'}
                      style={styles.subSubCategoryChipIcon}
                    />
                  )}
                  <Text style={[
                    styles.subSubCategoryChipText,
                    selectedSubSubCategory === subSub.slug && styles.subSubCategoryChipTextActive
                  ]}>
                    {subSub.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Scrollable Content Area - ONLY THIS SCROLLS */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor="#00C06A"
              colors={['#00C06A']}
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
                <Ionicons name="chevron-down" size={20} color="#00C06A" />
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
                  <Ionicons name="checkmark" size={20} color="#00C06A" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Subcategory Modal */}
      <Modal
        visible={showSubcategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSubcategoryModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSubcategoryModal(false)}
        >
          <View style={styles.sortModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Subcategory</Text>
              <TouchableOpacity onPress={() => setShowSubcategoryModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* All Subcategories Option */}
            <TouchableOpacity
              style={[
                styles.sortOption,
                selectedSubcategory === 'all' && styles.sortOptionActive
              ]}
              onPress={() => {
                setSelectedSubcategory('all');
                setShowSubcategoryModal(false);
              }}
            >
              <Text style={[
                styles.sortOptionText,
                selectedSubcategory === 'all' && styles.sortOptionTextActive
              ]}>
                All Subcategories
              </Text>
              {selectedSubcategory === 'all' && (
                <Ionicons name="checkmark" size={20} color="#00C06A" />
              )}
            </TouchableOpacity>

            {/* Individual Subcategory Options */}
            {subcategories.map((sub: any) => {
              // Safely extract string values
              const subId = typeof sub._id === 'string' ? sub._id : String(sub._id || '');
              const subName = typeof sub.name === 'string' ? sub.name : 'Subcategory';

              return (
                <TouchableOpacity
                  key={subId}
                  style={[
                    styles.sortOption,
                    selectedSubcategory === subId && styles.sortOptionActive
                  ]}
                  onPress={() => {
                    setSelectedSubcategory(subId);
                    setShowSubcategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.sortOptionText,
                    selectedSubcategory === subId && styles.sortOptionTextActive
                  ]}>
                    {subName}
                  </Text>
                  {selectedSubcategory === subId && (
                    <Ionicons name="checkmark" size={20} color="#00C06A" />
                  )}
                </TouchableOpacity>
              );
            })}
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
      backgroundColor: '#F8FFFC',
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
      borderColor: 'rgba(0, 192, 106, 0.2)',
      shadowColor: '#00C06A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    sortButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#00C06A',
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
      color: '#00C06A',
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
      backgroundColor: 'rgba(0, 192, 106, 0.1)',
    },
    sortOptionText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#374151',
    },
    sortOptionTextActive: {
      color: '#00C06A',
      fontWeight: '600',
    },
    subcategoryContainer: {
      paddingHorizontal: horizontalPadding,
      paddingVertical: 8,
      backgroundColor: '#F8F9FA',
    },
    subcategoryDropdown: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: 'rgba(0, 192, 106, 0.2)',
      shadowColor: '#00C06A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    subcategoryLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
    },
    // Sub-sub-category filter chip styles
    subSubCategoryContainer: {
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0, 192, 106, 0.1)',
    },
    subSubCategoryScrollContent: {
      paddingHorizontal: horizontalPadding,
      paddingVertical: 10,
      gap: 8,
      flexDirection: 'row',
    },
    subSubCategoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: '#F0FFF7',
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: 'rgba(0, 192, 106, 0.3)',
    },
    subSubCategoryChipActive: {
      backgroundColor: '#00C06A',
      borderColor: '#00C06A',
    },
    subSubCategoryChipIcon: {
      marginRight: 6,
    },
    subSubCategoryChipText: {
      fontSize: 13,
      fontWeight: '500',
      color: '#00C06A',
    },
    subSubCategoryChipTextActive: {
      color: '#FFFFFF',
    },
  });
};

export default StoreListPage;
