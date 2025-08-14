// StoreListPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {  SearchFilters, StoreResult, ProductItem } from '@/types/store-search';
import { 
  defaultSearchFilters,
  mockAvailableFilters 
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
  
  // Use search hook
  const { 
    searchState, 
    updateQuery, 
    updateFilters, 
    refreshResults,
    retry,
    clearSearch
  } = useStoreSearch({
    initialQuery: (params.query as string) || '',
    initialFilters: {},
    autoSearch: true,
  });

  // Extract values from search state
  const { query: searchQuery, filters: searchFilters, results: searchResults, isLoading, error } = searchState;

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
    updateQuery(query);
  }, [updateQuery]);

  // Handle filter change
  const handleFilterChange = useCallback((newFilters: SearchFilters) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await refreshResults();
  }, [refreshResults]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    updateFilters(defaultSearchFilters);
  }, [updateFilters]);

  // Handle retry
  const handleRetry = useCallback(async () => {
    await retry();
  }, [retry]);

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
    console.log('Product selected:', product.name, 'from store:', store.storeName);
    // TODO: Navigate to product details page
    // router.push(`/product/${product.productId}?storeId=${store.storeId}`);
  }, []);

  // Handle store selection
  const handleStoreSelect = useCallback((store: StoreResult) => {
    console.log('Store selected:', store.storeName);
    // TODO: Navigate to store page
    // router.push(`/store/${store.storeId}`);
  }, []);

  // Create styles based on screen dimensions
  const styles = createStyles(screenData);

  return (
    <LinearGradient
      colors={['#F8F9FF', '#F0F2FF', '#E8EDFF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      
      {/* Search Header */}
      <SearchHeader
        query={searchQuery}
        onQueryChange={handleSearchQueryChange}
        onBack={handleBack}
        isLoading={isLoading}
      />

      {/* Filter Chips */}
      <FilterChips
        filters={searchFilters}
        availableFilters={mockAvailableFilters}
        onFilterChange={handleFilterChange}
        isLoading={isLoading}
      />

      {/* Main Content */}
      <ScrollView
        style={styles.content}
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
              onSuggestionPress={updateQuery}
            />
          </View>
        )}

        {/* Search Results */}
        {!isLoading && !error && searchResults && searchResults.stores.length > 0 && (
          <View style={styles.resultsContainer}>
            {searchResults.stores.map((store) => (
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
          </View>
        )}
        <View/>
      </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const createStyles = (screenData: { width: number; height: number }) => {
  const { width } = screenData;
  const isTablet = width > 768;
  const horizontalPadding = isTablet ? 24 : 16;

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    content: {
      flex: 1,
      paddingHorizontal: horizontalPadding,
      paddingTop: 12,
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
      // optional subtle card background for each result (StoreCard already has its own style,
      // keep this neutral to avoid style conflicts)
      backgroundColor: 'transparent',
    },
   
  });
};

export default StoreListPage;
