import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';

import {
  GoingOutPageState,
  GoingOutFilters,
  UseGoingOutPageReturn,
  GoingOutProduct,
} from '@/types/going-out.types';
import {
  initialGoingOutPageState,
  fetchGoingOutProducts,
  fetchCashbackHubSections,
  getProductsByCategory,
  searchProducts,
} from '@/data/goingOutData';

export function useGoingOutPage(): UseGoingOutPageReturn {
  const router = useRouter();
  const [state, setState] = useState<GoingOutPageState>(initialGoingOutPageState);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [productsData, cashbackData] = await Promise.all([
        fetchGoingOutProducts(),
        fetchCashbackHubSections(),
      ]);

      setState(prev => ({
        ...prev,
        products: productsData.products,
        filteredProducts: productsData.products,
        categories: productsData.categories,
        cashbackHubSections: cashbackData.sections,
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load products. Please try again.',
      }));
    }
  };

  // Actions
  const setActiveCategory = useCallback((categoryId: string) => {
    setState(prev => {
      const filteredProducts = categoryId === 'all' 
        ? prev.products 
        : getProductsByCategory(categoryId);
      
      return {
        ...prev,
        activeCategory: categoryId,
        filteredProducts,
        searchQuery: '', // Clear search when changing category
      };
    });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => {
      let filteredProducts = prev.products;
      
      if (query.trim()) {
        filteredProducts = searchProducts(query);
      } else {
        // If no search query, filter by active category
        filteredProducts = prev.activeCategory === 'all' 
          ? prev.products 
          : getProductsByCategory(prev.activeCategory);
      }
      
      return {
        ...prev,
        searchQuery: query,
        filteredProducts,
      };
    });
  }, []);

  const setSortBy = useCallback((sortBy: GoingOutPageState['sortBy']) => {
    setState(prev => {
      const sortedProducts = [...prev.filteredProducts].sort((a, b) => {
        switch (sortBy) {
          case 'price_low':
            return a.price.current - b.price.current;
          case 'price_high':
            return b.price.current - a.price.current;
          case 'cashback_high':
            return b.cashback.percentage - a.cashback.percentage;
          case 'rating':
            return (b.rating?.value || 0) - (a.rating?.value || 0);
          case 'newest':
            return a.isNew ? -1 : 1;
          default:
            return 0;
        }
      });

      return {
        ...prev,
        sortBy,
        filteredProducts: sortedProducts,
      };
    });
  }, []);

  const loadProducts = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await fetchGoingOutProducts(
        state.activeCategory !== 'all' ? state.activeCategory : undefined,
        state.searchQuery || undefined
      );

      setState(prev => ({
        ...prev,
        products: data.products,
        filteredProducts: data.products,
        loading: false,
        hasMore: data.pagination.hasMore,
        page: data.pagination.page,
      }));
    } catch (error) {
      console.error('Failed to load products:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load products. Please try again.',
      }));
    }
  }, [state.activeCategory, state.searchQuery]);

  const loadMoreProducts = useCallback(async () => {
    if (state.loading || !state.hasMore) return;

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const data = await fetchGoingOutProducts(
        state.activeCategory !== 'all' ? state.activeCategory : undefined,
        state.searchQuery || undefined
      );

      setState(prev => ({
        ...prev,
        products: [...prev.products, ...data.products],
        filteredProducts: [...prev.filteredProducts, ...data.products],
        loading: false,
        hasMore: data.pagination.hasMore,
        page: data.pagination.page,
      }));
    } catch (error) {
      console.error('Failed to load more products:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load more products.',
      }));
    }
  }, [state.activeCategory, state.searchQuery, state.loading, state.hasMore]);

  const searchProductsAction = useCallback(async (query: string) => {
    setState(prev => ({ ...prev, loading: true, error: null, searchQuery: query }));
    
    try {
      const data = await fetchGoingOutProducts(
        state.activeCategory !== 'all' ? state.activeCategory : undefined,
        query || undefined
      );

      setState(prev => ({
        ...prev,
        filteredProducts: data.products,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to search products:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Search failed. Please try again.',
      }));
    }
  }, [state.activeCategory]);

  const refreshProducts = useCallback(async () => {
    await loadProducts();
  }, [loadProducts]);

  const applyFilters = useCallback(async (filters: GoingOutFilters) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Apply filters to existing products (mock implementation)
      let filteredProducts = prev.products;
      
      // Price range filter
      if (filters.priceRange.min > 0 || filters.priceRange.max < Infinity) {
        filteredProducts = filteredProducts.filter(product => 
          product.price.current >= filters.priceRange.min && 
          product.price.current <= filters.priceRange.max
        );
      }
      
      // Cashback range filter
      if (filters.cashbackRange.min > 0 || filters.cashbackRange.max < 100) {
        filteredProducts = filteredProducts.filter(product => 
          product.cashback.percentage >= filters.cashbackRange.min && 
          product.cashback.percentage <= filters.cashbackRange.max
        );
      }
      
      // Brand filter
      if (filters.brands.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          product.brand && filters.brands.includes(product.brand)
        );
      }
      
      // Rating filter
      if (filters.ratings.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          product.rating && filters.ratings.some(rating => product.rating!.value >= rating)
        );
      }
      
      // Availability filter
      if (filters.availability.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          filters.availability.includes(product.availabilityStatus)
        );
      }

      setState(prev => ({
        ...prev,
        filteredProducts,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to apply filters:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to apply filters.',
      }));
    }
  }, []);

  const resetFilters = useCallback(async () => {
    setState(prev => ({
      ...prev,
      filteredProducts: prev.activeCategory === 'all' 
        ? prev.products 
        : getProductsByCategory(prev.activeCategory),
    }));
  }, []);

  // Handlers
  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
  }, [setActiveCategory]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  const handleSearchSubmit = useCallback((query: string) => {
    searchProductsAction(query);
  }, [searchProductsAction]);

  const handleProductPress = useCallback((product: GoingOutProduct) => {
    console.log(`🏪 [GOING OUT] Product pressed: ${product.name}`);
    router.push(`/product/${product.id}` as any);
  }, [router]);

  const handleSortChange = useCallback((sortBy: GoingOutPageState['sortBy']) => {
    setSortBy(sortBy);
  }, [setSortBy]);

  const handleLoadMore = useCallback(() => {
    loadMoreProducts();
  }, [loadMoreProducts]);

  const handleRefresh = useCallback(() => {
    refreshProducts();
  }, [refreshProducts]);

  const handleHideSearch = useCallback(() => {
    setState(prev => ({ ...prev, showSearchBar: false }));
  }, []);

  const handleShowSearch = useCallback(() => {
    setState(prev => ({ ...prev, showSearchBar: true }));
  }, []);

  return {
    state,
    actions: {
      setActiveCategory,
      setSearchQuery,
      setSortBy,
      loadProducts,
      loadMoreProducts,
      searchProducts: searchProductsAction,
      refreshProducts,
      applyFilters,
      resetFilters,
    },
    handlers: {
      handleCategoryChange,
      handleSearchChange,
      handleSearchSubmit,
      handleProductPress,
      handleSortChange,
      handleLoadMore,
      handleRefresh,
      handleHideSearch,
      handleShowSearch,
    },
  };
}