import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { storeSearchService, Store, StoreSearchParams, StoreCategory } from '@/services/storeSearchService';
import { useLocation } from '@/hooks/useLocation';

export interface UseStoreSearchOptions {
  category: string;
  autoFetch?: boolean;
  initialPage?: number;
  pageSize?: number;
  sortBy?: 'rating' | 'distance' | 'name' | 'newest';
}

export interface UseStoreSearchReturn {
  stores: Store[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalStores: number;
  totalPages: number;
  fetchStores: (page?: number, refresh?: boolean) => Promise<void>;
  refreshStores: () => Promise<void>;
  loadMoreStores: () => Promise<void>;
  setSortBy: (sortBy: 'rating' | 'distance' | 'name' | 'newest') => void;
  clearError: () => void;
}

export const useStoreSearch = (options: UseStoreSearchOptions): UseStoreSearchReturn => {
  const {
    category,
    autoFetch = true,
    initialPage = 1,
    pageSize = 20,
    sortBy: initialSortBy = 'rating'
  } = options;

  const { currentLocation } = useLocation();
  
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalStores, setTotalStores] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortByState] = useState(initialSortBy);

  const fetchStores = useCallback(async (page: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      }

      setError(null);

      const locationParam = currentLocation?.coordinates 
        ? storeSearchService.formatLocationForAPI(currentLocation)
        : undefined;

      const searchParams: StoreSearchParams = {
        category,
        page,
        limit: pageSize,
        sortBy,
        ...(locationParam && { 
          location: locationParam, 
          radius: 10 
        }),
      };

      const response = await storeSearchService.searchStoresByCategory(searchParams);

      if (response.success) {
        const newStores = response.data.stores;
        
        if (page === 1 || refresh) {
          setStores(newStores);
        } else {
          setStores(prev => [...prev, ...newStores]);
        }
        
        setHasMore(response.data.pagination.hasNext);
        setCurrentPage(page);
        setTotalStores(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        throw new Error(response.message || 'Failed to fetch stores');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error fetching stores:', err);
      
      // Only show alert for initial load, not for pagination
      if (page === 1) {
        Alert.alert('Error', 'Failed to load stores. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, currentLocation, pageSize, sortBy]);

  const refreshStores = useCallback(async () => {
    await fetchStores(1, true);
  }, [fetchStores]);

  const loadMoreStores = useCallback(async () => {
    if (!loading && hasMore) {
      await fetchStores(currentPage + 1);
    }
  }, [fetchStores, loading, hasMore, currentPage]);

  const setSortBy = useCallback((newSortBy: 'rating' | 'distance' | 'name' | 'newest') => {
    setSortByState(newSortBy);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch && category) {
      fetchStores(1);
    }
  }, [autoFetch, category, fetchStores]);

  // Refetch when sortBy changes
  useEffect(() => {
    if (autoFetch && category && sortBy !== initialSortBy) {
      fetchStores(1);
    }
  }, [sortBy, autoFetch, category, fetchStores, initialSortBy]);

  return {
    stores,
    loading,
    refreshing,
    error,
    hasMore,
    currentPage,
    totalStores,
    totalPages,
    fetchStores,
    refreshStores,
    loadMoreStores,
    setSortBy,
    clearError,
  };
};

// Hook for getting store categories
export const useStoreCategories = () => {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await storeSearchService.getStoreCategories();

      if (response.success) {
        setCategories(response.data.categories);
      } else {
        throw new Error(response.message || 'Failed to fetch categories');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error fetching store categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};

// Hook for getting a single store
export const useStore = (storeId: string | null) => {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStore = useCallback(async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await storeSearchService.getStoreById(storeId);

      if (response.success) {
        setStore(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch store');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error fetching store:', err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  return {
    store,
    loading,
    error,
    refetch: fetchStore,
  };
};

export default useStoreSearch;