import { useState, useCallback, useEffect } from 'react';
import { useSearch } from './useSearch';
import { searchCacheService } from '@/services/searchCacheService';
import { searchAnalyticsService } from '@/services/searchAnalyticsService';
import { searchHistoryService } from '@/services/searchHistoryService';
import { SearchPageState, SearchSection, SearchCategory, SearchResult, SearchSuggestion, GroupedProductResult, SearchResultsSummary } from '@/types/search.types';
import { apiClient } from '@/utils/apiClient';
import searchService from '@/services/searchApi';

export const useSearchPage = () => {
  const { state: searchHookState, actions } = useSearch();
  
  const [state, setState] = useState<SearchPageState>({
    query: '',
    isSearching: false,
    sections: [],
    results: [],
    suggestions: [],
    activeFilters: {},
    availableFilters: [],
    sortBy: 'relevance',
    searchHistory: [],
    recentSearches: [],
    showSuggestions: false,
    showFilters: false,
    loading: true,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      hasMore: false,
    },
  });

  // New state for grouped products
  const [groupedProducts, setGroupedProducts] = useState<GroupedProductResult[]>([]);
  const [searchSummary, setSearchSummary] = useState<SearchResultsSummary | null>(null);
  const [matchingStores, setMatchingStores] = useState<any[]>([]);

  // Helper function to map backend categories to UI format
  const mapToSearchCategory = useCallback((cat: any): SearchCategory => {
    const imageUrl = cat.image || cat.bannerImage || '';
    
    return {
      id: cat._id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: imageUrl,
      cashbackPercentage: cat.cashbackPercentage || 10,
      isPopular: cat.metadata?.featured || cat.isFeatured || false,
    };
  }, []);

  // Helper function to map products to search results
  const mapProductToSearchResult = useCallback((product: any): SearchResult => ({
    id: product._id,
    title: product.name,
    description: product.shortDescription || product.description || '',
    image: product.images?.[0],
    category: product.category?.name || '',
    cashbackPercentage: product.cashback?.percentage || 0,
    rating: product.ratings?.average,
    price: {
      current: product.pricing?.selling || 0,
      original: product.pricing?.original,
      currency: 'INR'
    },
    tags: product.tags || [],
  }), []);

  // Helper function to map stores to search results
  const mapStoreToSearchResult = useCallback((store: any): SearchResult => ({
    id: store._id,
    title: store.name,
    description: store.description || '',
    image: store.logo,
    category: 'Store',
    cashbackPercentage: 10,
    rating: store.ratings?.average,
    location: store.location?.address,
  }), []);

  // Load categories from backend
  const loadCategories = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiClient.get('/categories', {
        featured: true
      });

      if (response.success && response.data) {
        const categories = Array.isArray(response.data) ? response.data : [];
        const goingOut = categories.filter((c: any) => c.type === 'going_out');
        const homeDelivery = categories.filter((c: any) => c.type === 'home_delivery');
        
        const sections: SearchSection[] = [];
        
        if (goingOut.length > 0) {
          sections.push({
            id: 'going-out',
            title: 'Going Out',
            subtitle: 'Services for when you\'re out and about',
            categories: goingOut.map(mapToSearchCategory),
          });
        }
        
        if (homeDelivery.length > 0) {
          sections.push({
            id: 'home-delivery',
            title: 'Home Delivery',
            subtitle: 'Everything delivered to your doorstep',
            categories: homeDelivery.map(mapToSearchCategory),
          });
        }
        
        setState(prev => ({
          ...prev,
          sections,
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      setState(prev => ({
        ...prev,
        sections: [],
        loading: false,
        error: 'Failed to load categories. Please check your connection and try again.',
      }));
    }
  }, [mapToSearchCategory]);

  // Load search suggestions based on query
  const loadSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      // Load recent searches when no query
      const recentSearches = await searchHistoryService.getRecentSearches();
      const suggestions: SearchSuggestion[] = recentSearches.map((search, index) => ({
        id: `recent-${index}`,
        text: search.query,
        type: 'product' as const,
        isRecent: true,
      }));

      setState(prev => ({
        ...prev,
        suggestions,
        showSuggestions: true,
      }));
      return;
    }

    try {
      // Get suggestions from backend
      const response = await searchService.getSearchSuggestions(query);

      if (response.success && response.data) {
        // Map API suggestions to UI suggestions with ids
        const suggestions: SearchSuggestion[] = response.data.map((suggestion: any, index: number) => ({
          id: `suggestion-${index}-${suggestion.text}`,
          text: suggestion.text,
          type: suggestion.type === 'store' ? 'product' : suggestion.type,
          categoryId: suggestion.categoryId,
          resultCount: suggestion.count,
          isRecent: false,
        }));

        setState(prev => ({
          ...prev,
          suggestions,
          showSuggestions: true,
        }));
      } else {
        // If backend doesn't support suggestions yet, show recent searches
        const recentSearches = await searchHistoryService.getRecentSearches();
        const filteredSearches = recentSearches
          .filter(s => s.query.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5);

        const suggestions: SearchSuggestion[] = filteredSearches.map((search, index) => ({
          id: `recent-${index}`,
          text: search.query,
          type: 'product' as const,
          isRecent: true,
        }));

        setState(prev => ({
          ...prev,
          suggestions,
          showSuggestions: true,
        }));
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      // Silently fail for suggestions
    }
  }, []);

  // Perform grouped product search (new method for seller comparison)
  const performGroupedSearch = useCallback(async (query: string, userLocation?: { latitude: number; longitude: number }) => {
    if (!query.trim()) return;

    setState(prev => ({
      ...prev,
      isSearching: true,
      loading: true,
      showSuggestions: false,
    }));

    try {
      const response = await searchService.searchProductsGrouped({
        q: query,
        limit: 20,
        lat: userLocation?.latitude,
        lon: userLocation?.longitude,
      });

      if (response.success && response.data) {
        const { groupedProducts: products, summary, matchingStores: stores } = response.data;

        setGroupedProducts(products || []);
        setSearchSummary(summary);
        setMatchingStores(stores || []);

        // Track analytics
        const totalResults = (products?.length || 0) + (stores?.length || 0);
        await searchAnalyticsService.trackSearch(query, totalResults || summary.sellerCount);

        // Save to search history
        await searchHistoryService.addSearch(query, totalResults || summary.sellerCount);

        setState(prev => ({
          ...prev,
          isSearching: false,
          loading: false,
          pagination: {
            ...prev.pagination,
            total: response.data.total,
            hasMore: response.data.hasMore,
          },
        }));
      } else {
        throw new Error('Failed to fetch grouped products');
      }
    } catch (error) {
      console.error('Grouped search failed:', error);
      setState(prev => ({
        ...prev,
        isSearching: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Search failed. Please try again.',
      }));
      setGroupedProducts([]);
      setMatchingStores([]);
      setSearchSummary(null);
    }
  }, []);

  // Perform search with debouncing and caching
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setState(prev => ({
      ...prev,
      isSearching: true,
      loading: true,
      showSuggestions: false,
    }));

    try {
      // Check cache first
      const cachedResults = await searchCacheService.getFromCache(query);

      if (cachedResults && cachedResults.length > 0) {
        setState(prev => ({
          ...prev,
          results: cachedResults,
          isSearching: false,
          loading: false,
        }));

        // Save to search history
        await searchHistoryService.addSearch(query, cachedResults.length);
        return;
      }

      // Use the search hook to search both products and stores
      await actions.searchAll(query);

      // Map results from hook state
      const results: SearchResult[] = [
        ...searchHookState.productResults.map(mapProductToSearchResult),
        ...searchHookState.storeResults.map(mapStoreToSearchResult),
      ];

      // Track analytics
      await searchAnalyticsService.trackSearch(query, results.length);

      // Save to search history
      await searchHistoryService.addSearch(query, results.length);

      // Cache the results
      await searchCacheService.saveToCache(query, results);

      setState(prev => ({
        ...prev,
        results,
        isSearching: false,
        loading: false,
        pagination: {
          ...prev.pagination,
          total: searchHookState.pagination.total,
          hasMore: searchHookState.pagination.hasMore,
        },
      }));
    } catch (error) {
      console.error('Search failed:', error);
      setState(prev => ({
        ...prev,
        isSearching: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Search failed. Please try again.',
      }));
    }
  }, [actions, searchHookState, mapProductToSearchResult, mapStoreToSearchResult]);

  // Handle search query change
  const handleSearchChange = useCallback((query: string) => {
    setState(prev => ({ ...prev, query }));

    // Load suggestions as user types
    if (query.length >= 2) {
      loadSuggestions(query);
    } else if (query.length === 0) {
      // Show recent searches when query is cleared
      loadSuggestions('');
    } else {
      // Hide suggestions for single character
      setState(prev => ({ ...prev, suggestions: [], showSuggestions: false }));
    }
  }, [loadSuggestions]);

  // Handle search submit
  const handleSearchSubmit = useCallback((query: string) => {
    if (query.trim().length >= 2) {
      performSearch(query);
    }
  }, [performSearch]);

  // Handle category press
  const handleCategoryPress = useCallback(async (category: SearchCategory) => {
    await searchAnalyticsService.trackCategoryClick(category.id, category.name);
  }, []);

  // Handle result press
  const handleResultPress = useCallback(async (result: SearchResult, position: number) => {
    const resultType = result.category === 'Store' ? 'store' : 'product';
    await searchAnalyticsService.trackResultClick(state.query, result.id, resultType, position);
  }, [state.query]);

  // Handle view all section
  const handleViewAllSection = useCallback((sectionId: string) => {
    // Navigation will be handled by the component
  }, []);

  // Load more results
  const handleLoadMore = useCallback(() => {
    if (state.pagination.hasMore && !state.loading) {
      actions.loadMore();
    }
  }, [state.pagination.hasMore, state.loading, actions]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      query: '',
      results: [],
      showSuggestions: false,
    }));
    setGroupedProducts([]);
    setMatchingStores([]);
    setSearchSummary(null);
  }, []);

  // Clear error
  const handleClearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Apply filters
  const applyFilters = useCallback((filters: SearchPageState['activeFilters']) => {
    setState(prev => ({ ...prev, activeFilters: filters }));

    // Re-search with new filters
    if (state.query) {
      performSearch(state.query);
    }
  }, [state.query, performSearch]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setState(prev => ({ ...prev, activeFilters: {} }));

    // Re-search without filters
    if (state.query) {
      performSearch(state.query);
    }
  }, [state.query, performSearch]);

  // Clear search history
  const clearSearchHistory = useCallback(async () => {
    try {
      await searchHistoryService.clearHistory();
      setState(prev => ({
        ...prev,
        searchHistory: [],
        recentSearches: [],
        suggestions: [],
      }));
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }, []);

  // Load categories and recent searches on mount
  useEffect(() => {
    loadCategories();
    loadSuggestions(''); // Load recent searches
  }, [loadCategories, loadSuggestions]);

  return {
    state,
    groupedProducts,
    matchingStores,
    searchSummary,
    actions: {
      handleSearchChange,
      handleSearchSubmit,
      handleCategoryPress,
      handleResultPress,
      handleViewAllSection,
      handleLoadMore,
      handleClearSearch,
      handleClearError,
      performSearch,
      performGroupedSearch,
      loadCategories,
      loadSuggestions,
      applyFilters,
      clearFilters,
      clearSearchHistory,
    },
  };
};
