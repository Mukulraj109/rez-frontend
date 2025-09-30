// hooks/useOnlineVoucher.ts - State management hook for Online Voucher system

import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import {
  VoucherState,
  UseVoucherReturn,
  Brand,
  Category,
  FilterOptions
} from '@/types/voucher.types';
import VoucherData from '@/data/voucherData';
import realVouchersApi from '@/services/realVouchersApi';

// Use real API or fall back to mock
const USE_REAL_API = process.env.EXPO_PUBLIC_MOCK_API !== 'true';

export const useOnlineVoucher = (): UseVoucherReturn => {
  const [state, setState] = useState<VoucherState>(VoucherData.initialState);

  // Initialize data on mount
  useEffect(() => {
    initializeVoucherData();
  }, []);

  const initializeVoucherData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      if (USE_REAL_API) {
        // Load from real backend API
        const [categoriesRes, brandsRes] = await Promise.all([
          realVouchersApi.getVoucherCategories(),
          realVouchersApi.getVoucherBrands({ page: 1, limit: 50 })
        ]);

        // Transform backend data to match frontend types
        const categories: Category[] = categoriesRes.data.map((cat: string) => ({
          id: cat,
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          icon: '🏷️',
          color: '#FF6B6B'
        }));

        const brands: Brand[] = brandsRes.data.map((brand: any) => ({
          id: brand._id,
          name: brand.name,
          logo: brand.logo,
          backgroundColor: brand.backgroundColor || '#F3F4F6',
          logoColor: brand.logoColor,
          cashBackPercentage: brand.cashbackRate,
          rating: brand.rating || 0,
          ratingCount: brand.ratingCount || 0,
          category: brand.category,
          isNewlyAdded: brand.isNewlyAdded,
          isFeatured: brand.isFeatured
        }));

        setState(prev => ({
          ...prev,
          loading: false,
          categories,
          brands,
          error: null
        }));
      } else {
        // Load from mock data
        const [categories, brands] = await Promise.all([
          VoucherData.api.getCategories(),
          VoucherData.api.getBrands()
        ]);

        setState(prev => ({
          ...prev,
          loading: false,
          categories,
          brands,
          error: null
        }));
      }
    } catch (error) {
      console.error('Failed to load voucher data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load voucher data'
      }));
    }
  }, []);

  const searchBrands = useCallback(async (query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      loading: true,
      currentView: query ? 'search' : 'main'
    }));

    try {
      if (USE_REAL_API) {
        if (query.trim()) {
          // Search brands from real API
          const brandsRes = await realVouchersApi.getVoucherBrands({
            search: query,
            page: 1,
            limit: 50
          });

          const brands: Brand[] = brandsRes.data.map((brand: any) => ({
            id: brand._id,
            name: brand.name,
            logo: brand.logo,
            backgroundColor: brand.backgroundColor || '#F3F4F6',
            logoColor: brand.logoColor,
            cashBackPercentage: brand.cashbackRate,
            rating: brand.rating || 0,
            ratingCount: brand.ratingCount || 0,
            category: brand.category,
            isNewlyAdded: brand.isNewlyAdded,
            isFeatured: brand.isFeatured
          }));

          setState(prev => ({
            ...prev,
            brands,
            loading: false,
            error: null
          }));
        } else {
          // Clear search, load all brands
          const brandsRes = await realVouchersApi.getVoucherBrands({ page: 1, limit: 50 });
          const brands: Brand[] = brandsRes.data.map((brand: any) => ({
            id: brand._id,
            name: brand.name,
            logo: brand.logo,
            backgroundColor: brand.backgroundColor || '#F3F4F6',
            logoColor: brand.logoColor,
            cashBackPercentage: brand.cashbackRate,
            rating: brand.rating || 0,
            ratingCount: brand.ratingCount || 0,
            category: brand.category,
            isNewlyAdded: brand.isNewlyAdded,
            isFeatured: brand.isFeatured
          }));

          setState(prev => ({
            ...prev,
            brands,
            loading: false,
            error: null
          }));
        }
      } else {
        // Mock data fallback
        if (query.trim()) {
          const searchResults = await VoucherData.api.searchBrands(query);
          setState(prev => ({
            ...prev,
            brands: searchResults,
            loading: false,
            error: null
          }));
        } else {
          const allBrands = await VoucherData.api.getBrands();
          setState(prev => ({
            ...prev,
            brands: allBrands,
            loading: false,
            error: null
          }));
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Search failed. Please try again.'
      }));
    }
  }, []);

  const selectCategory = useCallback(async (categoryId: string | null) => {
    setState(prev => ({
      ...prev,
      selectedCategory: categoryId,
      loading: true,
      currentView: categoryId ? 'category' : 'main',
      searchQuery: '' // Clear search when selecting category
    }));

    try {
      if (USE_REAL_API) {
        const brandsRes = await realVouchersApi.getVoucherBrands({
          category: categoryId || undefined,
          page: 1,
          limit: 50
        });

        const brands: Brand[] = brandsRes.data.map((brand: any) => ({
          id: brand._id,
          name: brand.name,
          logo: brand.logo,
          backgroundColor: brand.backgroundColor || '#F3F4F6',
          logoColor: brand.logoColor,
          cashBackPercentage: brand.cashbackRate,
          rating: brand.rating || 0,
          ratingCount: brand.ratingCount || 0,
          category: brand.category,
          isNewlyAdded: brand.isNewlyAdded,
          isFeatured: brand.isFeatured
        }));

        setState(prev => ({
          ...prev,
          brands,
          loading: false,
          error: null
        }));
      } else {
        const brands = await VoucherData.api.getBrands({ categoryId });
        setState(prev => ({
          ...prev,
          brands,
          loading: false,
          error: null
        }));
      }
    } catch (error) {
      console.error('Failed to load category brands:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load category brands'
      }));
    }
  }, []);

  const selectBrand = useCallback((brand: Brand) => {
    setState(prev => ({
      ...prev,
      selectedBrand: brand,
      currentView: 'brand'
    }));
  }, []);

  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchQuery: '',
      currentView: 'main',
      selectedCategory: null
    }));
    initializeVoucherData();
  }, [initializeVoucherData]);

  const refreshData = useCallback(async () => {
    await initializeVoucherData();
  }, [initializeVoucherData]);

  const updateFilters = useCallback(async (newFilters: Partial<FilterOptions>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      loading: true
    }));

    try {
      if (USE_REAL_API) {
        // Fetch brands with filters from real API
        const brandsRes = await realVouchersApi.getVoucherBrands({
          category: state.selectedCategory || undefined,
          search: state.searchQuery || undefined,
          page: 1,
          limit: 50
        });

        let brands: Brand[] = brandsRes.data.map((brand: any) => ({
          id: brand._id,
          name: brand.name,
          logo: brand.logo,
          backgroundColor: brand.backgroundColor || '#F3F4F6',
          logoColor: brand.logoColor,
          cashBackPercentage: brand.cashbackRate,
          rating: brand.rating || 0,
          ratingCount: brand.ratingCount || 0,
          category: brand.category,
          isNewlyAdded: brand.isNewlyAdded,
          isFeatured: brand.isFeatured
        }));

        // Apply client-side sorting based on sortBy filter
        const sortBy = newFilters.sortBy || state.filters.sortBy;
        if (sortBy === 'cashback') {
          brands.sort((a, b) => b.cashBackPercentage - a.cashBackPercentage);
        } else if (sortBy === 'rating') {
          brands.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'name') {
          brands.sort((a, b) => a.name.localeCompare(b.name));
        }

        setState(prev => ({
          ...prev,
          brands,
          loading: false,
          error: null
        }));
      } else {
        // Mock data fallback
        const brands = await VoucherData.api.getBrands({
          categoryId: state.selectedCategory,
          query: state.searchQuery,
          filters: { ...state.filters, ...newFilters }
        });

        // Apply sorting
        const sortedBrands = VoucherData.helpers.sortBrands(
          brands,
          newFilters.sortBy || state.filters.sortBy
        );

        setState(prev => ({
          ...prev,
          brands: sortedBrands,
          loading: false
        }));
      }
    } catch (error) {
      console.error('Failed to apply filters:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to apply filters'
      }));
    }
  }, [state.selectedCategory, state.searchQuery, state.filters]);

  // Handler functions for components
  const handleSearch = useCallback((query: string) => {
    searchBrands(query);
  }, [searchBrands]);

  const handleCategorySelect = useCallback((category: Category) => {
    selectCategory(category.id);
  }, [selectCategory]);

  const handleBrandSelect = useCallback((brand: Brand) => {
    console.log('🎯 VoucherHook: Navigating to brand detail:', brand.name);
    router.push(`/voucher/${brand.id}`);
  }, []);

  const handleBackNavigation = useCallback(() => {
    if (state.currentView === 'brand') {
      setState(prev => ({ ...prev, currentView: 'main', selectedBrand: null }));
    } else if (state.currentView === 'category') {
      setState(prev => ({ 
        ...prev, 
        currentView: 'main', 
        selectedCategory: null,
        searchQuery: ''
      }));
      initializeVoucherData();
    } else if (state.currentView === 'search') {
      clearSearch();
    } else {
      router.back();
    }
  }, [state.currentView, clearSearch, initializeVoucherData]);

  const handleShare = useCallback((brand?: Brand) => {
    const shareText = brand
      ? `Check out ${brand.name} - Get up to ${brand.cashBackPercentage}% cashback!`
      : 'Discover amazing cashback offers on your favorite brands!';

    console.log('📱 Share:', shareText);
    // TODO: Implement actual sharing functionality
  }, []);

  const handleFavorite = useCallback((brand: Brand) => {
    console.log('❤️ Favorite:', brand.name);
    // TODO: Implement favorite functionality
  }, []);

  // Clear error after some time
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, error: null }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  return {
    state,
    actions: {
      searchBrands,
      selectCategory,
      selectBrand,
      clearSearch,
      refreshData,
      updateFilters
    },
    handlers: {
      handleSearch,
      handleCategorySelect,
      handleBrandSelect,
      handleBackNavigation,
      handleShare,
      handleFavorite
    }
  };
};