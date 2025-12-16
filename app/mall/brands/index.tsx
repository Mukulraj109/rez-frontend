/**
 * Brands Listing Page
 *
 * Displays all brands with search and filter functionality
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { mallApi } from '../../../services/mallApi';
import { MallBrand } from '../../../types/mall.types';
import SearchBar from '../../../components/mall/pages/SearchBar';
import FilterChips, { FilterType } from '../../../components/mall/pages/FilterChips';
import BrandFullWidthCard from '../../../components/mall/pages/BrandFullWidthCard';
import MallEmptyState from '../../../components/mall/pages/MallEmptyState';
import MallLoadingSkeleton from '../../../components/mall/pages/MallLoadingSkeleton';

export default function BrandsListingPage() {
  const { filter: initialFilter } = useLocalSearchParams<{ filter?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [brands, setBrands] = useState<MallBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>(
    (initialFilter as FilterType) || 'all'
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async (
    pageNum: number = 1,
    append: boolean = false
  ) => {
    try {
      setError(null);
      let data: MallBrand[] = [];
      let total = 0;

      // Handle search
      if (searchQuery.length >= 2) {
        data = await mallApi.searchBrands(searchQuery, 50);
        total = data.length;
      }
      // Handle filters
      else if (activeFilter === 'featured') {
        data = await mallApi.getFeaturedBrands(50);
        total = data.length;
      } else if (activeFilter === 'new') {
        data = await mallApi.getNewArrivals(50);
        total = data.length;
      } else if (activeFilter === 'top-rated') {
        data = await mallApi.getTopRatedBrands(50);
        total = data.length;
      } else if (activeFilter === 'luxury') {
        data = await mallApi.getLuxuryBrands(50);
        total = data.length;
      } else {
        // All brands with pagination
        const result = await mallApi.getBrands({ page: pageNum, limit: 20 });
        data = result.brands;
        total = result.total;
        setTotalPages(result.pages);
      }

      if (append) {
        setBrands(prev => [...prev, ...data]);
      } else {
        setBrands(data);
      }
    } catch (err: any) {
      console.error('Error fetching brands:', err);
      setError(err.message || 'Failed to load brands');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    setIsLoading(true);
    setPage(1);
    fetchBrands(1, false);
  }, [searchQuery, activeFilter]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPage(1);
    fetchBrands(1, false);
  }, [fetchBrands]);

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || page >= totalPages || activeFilter !== 'all' || searchQuery) {
      return;
    }
    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBrands(nextPage, true);
  }, [page, totalPages, isLoadingMore, activeFilter, searchQuery, fetchBrands]);

  const handleBrandPress = useCallback((brand: MallBrand) => {
    router.push(`/mall/brand/${brand.id || brand._id}` as any);
  }, [router]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setActiveFilter('all');
  }, []);

  const getHeaderTitle = useMemo(() => {
    if (searchQuery) {
      return `Results for "${searchQuery}"`;
    }
    switch (activeFilter) {
      case 'featured':
        return 'Featured Brands';
      case 'new':
        return 'New Arrivals';
      case 'top-rated':
        return 'Top Rated';
      case 'luxury':
        return 'Luxury Brands';
      default:
        return 'All Brands';
    }
  }, [activeFilter, searchQuery]);

  const renderItem = useCallback(({ item }: { item: MallBrand }) => (
    <BrandFullWidthCard brand={item} onPress={handleBrandPress} />
  ), [handleBrandPress]);

  const keyExtractor = useCallback((item: MallBrand) =>
    item.id || item._id, []);

  const ListHeader = useMemo(() => (
    <View style={styles.listHeader}>
      <Text style={styles.resultCount}>
        {brands.length} {brands.length === 1 ? 'brand' : 'brands'} found
      </Text>
    </View>
  ), [brands.length]);

  const ListFooter = useMemo(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color="#00C06A" />
        </View>
      );
    }
    return null;
  }, [isLoadingMore]);

  const ListEmpty = useMemo(() => {
    if (isLoading) return null;

    return (
      <MallEmptyState
        title={searchQuery ? 'No brands found' : 'No brands available'}
        message={
          searchQuery
            ? `No brands match "${searchQuery}"`
            : 'Try adjusting your filters'
        }
        icon={searchQuery ? 'search-outline' : 'storefront-outline'}
        actionLabel="Clear Filters"
        onAction={handleClearFilters}
      />
    );
  }, [isLoading, searchQuery, handleClearFilters]);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: getHeaderTitle,
        }}
      />

      <View style={[styles.container, { paddingTop: insets.top > 0 ? 0 : 8 }]}>
        {/* Search Bar */}
        <SearchBar
          placeholder="Search brands..."
          value={searchQuery}
          onSearch={handleSearch}
        />

        {/* Filter Chips */}
        <FilterChips
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />

        {/* Loading State */}
        {isLoading ? (
          <MallLoadingSkeleton count={6} type="list" />
        ) : error ? (
          <MallEmptyState
            title="Something went wrong"
            message={error}
            icon="alert-circle-outline"
            actionLabel="Try Again"
            onAction={handleRefresh}
          />
        ) : (
          <FlatList
            data={brands}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            ListEmptyComponent={ListEmpty}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#00C06A"
                colors={['#00C06A']}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
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
  listContent: {
    paddingBottom: 24,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
