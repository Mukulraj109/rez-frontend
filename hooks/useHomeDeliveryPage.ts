import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';

import {
  HomeDeliveryPageState,
  HomeDeliveryFilters,
  UseHomeDeliveryPageReturn,
  HomeDeliveryProduct,
} from '@/types/home-delivery.types';
import {
  initialHomeDeliveryPageState,
  fetchHomeDeliveryProducts,
  fetchHomeDeliverySections,
  getProductsByCategory,
  searchHomeDeliveryProducts,
} from '@/data/homeDeliveryData';

export function useHomeDeliveryPage(): UseHomeDeliveryPageReturn {
  const router = useRouter();
  const [state, setState] = useState<HomeDeliveryPageState>(initialHomeDeliveryPageState);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [productsData, sectionsData] = await Promise.all([
        fetchHomeDeliveryProducts(),
        fetchHomeDeliverySections(),
      ]);

      setState(prev => ({
        ...prev,
        products: productsData.products,
        filteredProducts: productsData.products,
        categories: productsData.categories,
        sections: sectionsData.sections,
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
      let filteredProducts = prev.products;
      
      if (categoryId !== 'all') {
        filteredProducts = getProductsByCategory(categoryId);
      }
      
      // Apply current search query if exists
      if (prev.searchQuery.trim()) {
        const searchTerm = prev.searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.brand?.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      
      return {
        ...prev,
        activeCategory: categoryId,
        filteredProducts,
      };
    });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => {
      let filteredProducts = prev.products;
      
      // Apply category filter first
      if (prev.activeCategory !== 'all') {
        filteredProducts = getProductsByCategory(prev.activeCategory);
      }
      
      // Apply search filter
      if (query.trim()) {
        const searchTerm = query.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.brand?.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      
      return {
        ...prev,
        searchQuery: query,
        filteredProducts,
      };
    });
  }, []);

  const setSortBy = useCallback((sortBy: HomeDeliveryPageState['sortBy']) => {
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
          case 'delivery_time':
            // Sort by delivery time (Under 30min first)
            const timeOrder = { 'Under 30min': 0, '1-2 days': 1, '2-3 days': 2, '3-5 days': 3 };
            const aTime = timeOrder[a.deliveryTime as keyof typeof timeOrder] ?? 999;
            const bTime = timeOrder[b.deliveryTime as keyof typeof timeOrder] ?? 999;
            return aTime - bTime;
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

  const setFilters = useCallback((filters: HomeDeliveryFilters) => {
    setState(prev => ({ ...prev, filters }));
  }, []);

  const loadProducts = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await fetchHomeDeliveryProducts(
        state.activeCategory !== 'all' ? state.activeCategory : undefined,
        1,
        20
      );

      setState(prev => ({
        ...prev,
        products: data.products,
        filteredProducts: data.products,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to load products:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load products.',
      }));
    }
  }, [state.activeCategory]);

  const loadMoreProducts = useCallback(async () => {
    if (state.loading || !state.hasMore) return;

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const data = await fetchHomeDeliveryProducts(
        state.activeCategory !== 'all' ? state.activeCategory : undefined,
        state.page + 1,
        20
      );

      setState(prev => ({
        ...prev,
        products: [...prev.products, ...data.products],
        filteredProducts: [...prev.filteredProducts, ...data.products],
        hasMore: data.hasMore,
        page: prev.page + 1,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to load more products:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load more products.',
      }));
    }
  }, [state.activeCategory, state.page, state.loading, state.hasMore]);

  const searchProductsAction = useCallback(async (query: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await searchHomeDeliveryProducts(
        query,
        state.activeCategory !== 'all' ? state.activeCategory : undefined
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

  const applyFilters = useCallback(async (filters: HomeDeliveryFilters) => {
    setState(prev => ({ ...prev, loading: true, filters }));
    
    try {
      // Apply filters to existing products (mock implementation)
      let filteredProducts = prev.products;
      
      // Shipping filter
      if (filters.shipping.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          filters.shipping.includes(product.shipping.type)
        );
      }
      
      // Price range filter
      if (filters.priceRange.min > 0 || filters.priceRange.max < Infinity) {
        filteredProducts = filteredProducts.filter(product => 
          product.price.current >= filters.priceRange.min && 
          product.price.current <= filters.priceRange.max
        );
      }
      
      // Ratings filter
      if (filters.ratings.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          product.rating && filters.ratings.some(rating => product.rating!.value >= rating)
        );
      }
      
      // Delivery time filter
      if (filters.deliveryTime.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          filters.deliveryTime.includes(product.deliveryTime)
        );
      }
      
      // Brand filter
      if (filters.brands.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          product.brand && filters.brands.includes(product.brand)
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
      filters: initialHomeDeliveryPageState.filters,
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

  const handleProductPress = useCallback((product: HomeDeliveryProduct) => {
    console.log(`🏠 [HOME DELIVERY] Product pressed: ${product.name}`);
    router.push(`/product/${product.id}` as any);
  }, [router]);

  const handleSortChange = useCallback((sortBy: HomeDeliveryPageState['sortBy']) => {
    setSortBy(sortBy);
  }, [setSortBy]);

  const handleFilterChange = useCallback((filters: HomeDeliveryFilters) => {
    applyFilters(filters);
  }, [applyFilters]);

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
      setFilters,
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
      handleFilterChange,
      handleLoadMore,
      handleRefresh,
      handleHideSearch,
      handleShowSearch,
    },
  };
}