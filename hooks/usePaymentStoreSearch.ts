/**
 * Payment Store Search Hook
 *
 * Custom hook for managing store search in the Pay-In-Store flow.
 * Handles search, nearby stores, recent payments, and popular stores.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import {
  PaymentStoreInfo,
  PaymentSearchCategory,
  PaymentSearchError,
  UsePaymentStoreSearchReturn,
  UserLocation,
  PAYMENT_CATEGORIES,
  PAYMENT_SEARCH_CONSTANTS,
} from '@/types/paymentStoreSearch.types';
import { useCurrentLocation } from '@/hooks/useLocation';
import { useAuth } from '@/contexts/AuthContext';
import { storeSearchService } from '@/services/storeSearchService';
import storePaymentApi from '@/services/storePaymentApi';
import apiClient from '@/services/apiClient';

/**
 * Transform backend store data to PaymentStoreInfo format
 */
const transformToPaymentStore = (store: any, distance?: number): PaymentStoreInfo => ({
  _id: store._id,
  name: store.name,
  slug: store.slug,
  logo: store.logo,
  category: {
    _id: store.category?._id || '',
    name: store.category?.name || 'General',
    slug: store.category?.slug || 'general',
    icon: store.category?.icon,
  },
  location: {
    address: store.location?.address || '',
    city: store.location?.city || '',
    state: store.location?.state,
    pincode: store.location?.pincode,
    coordinates: store.location?.coordinates,
  },
  distance: distance || store.distance,
  paymentSettings: {
    acceptUPI: store.paymentSettings?.acceptUPI ?? true,
    acceptCards: store.paymentSettings?.acceptCards ?? true,
    acceptPayLater: store.paymentSettings?.acceptPayLater ?? false,
    acceptRezCoins: store.paymentSettings?.acceptRezCoins ?? true,
    acceptPromoCoins: store.paymentSettings?.acceptPromoCoins ?? true,
    acceptPayBill: store.paymentSettings?.acceptPayBill ?? false,
    maxCoinRedemptionPercent: store.paymentSettings?.maxCoinRedemptionPercent ?? 50,
    allowHybridPayment: store.paymentSettings?.allowHybridPayment ?? true,
    allowOffers: store.paymentSettings?.allowOffers ?? true,
    allowCashback: store.paymentSettings?.allowCashback ?? true,
    upiId: store.paymentSettings?.upiId,
    upiName: store.paymentSettings?.upiName,
  },
  rewardRules: {
    baseCashbackPercent: store.rewardRules?.baseCashbackPercent ?? 2,
    reviewBonusCoins: store.rewardRules?.reviewBonusCoins ?? 10,
    socialShareBonusCoins: store.rewardRules?.socialShareBonusCoins ?? 5,
    minimumAmountForReward: store.rewardRules?.minimumAmountForReward ?? 25,
    extraRewardThreshold: store.rewardRules?.extraRewardThreshold,
    extraRewardCoins: store.rewardRules?.extraRewardCoins,
    visitMilestoneRewards: store.rewardRules?.visitMilestoneRewards,
  },
  ratings: {
    average: store.ratings?.average || 0,
    count: store.ratings?.count || 0,
  },
  isActive: store.isActive ?? true,
  hasRezPay: store.operationalInfo?.acceptsWalletPayment ?? store.hasRezPay ?? true,
  maxCashback: store.rewardRules?.baseCashbackPercent ?? store.maxCashback ?? 5,
  lastPaidAt: store.lastPaidAt,
  totalPayments: store.totalPayments,
  popularityScore: store.popularityScore,
});

/**
 * Debounce helper
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Main hook for payment store search
 */
export const usePaymentStoreSearch = (): UsePaymentStoreSearchReturn => {
  const { state: authState } = useAuth();
  const { currentLocation, refreshLocation, isLoading: isLoadingLocationContext } = useCurrentLocation();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PaymentStoreInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<PaymentSearchError | null>(null);

  // Section data
  const [nearbyStores, setNearbyStores] = useState<PaymentStoreInfo[]>([]);
  const [recentStores, setRecentStores] = useState<PaymentStoreInfo[]>([]);
  const [popularStores, setPopularStores] = useState<PaymentStoreInfo[]>([]);

  // Loading states
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Category filter - default to 'all' to show all stores initially
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');

  // Pagination
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Location state
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Refs
  const searchAbortController = useRef<AbortController | null>(null);
  const isInitialFetchDone = useRef(false);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, PAYMENT_SEARCH_CONSTANTS.DEBOUNCE_DELAY);

  /**
   * Format location for API
   */
  const formatLocationForAPI = useCallback((location: UserLocation): string => {
    return `${location.longitude},${location.latitude}`;
  }, []);

  /**
   * Request location permission and get current location
   */
  const requestLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      const location = await refreshLocation();
      if (location) {
        setUserLocation({
          latitude: location.coordinates[1],
          longitude: location.coordinates[0],
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Unable to get your location. Please enable location services.');
    } finally {
      setIsLoadingLocation(false);
    }
  }, [refreshLocation]);

  /**
   * Fetch nearby stores
   */
  const fetchNearbyStores = useCallback(async () => {
    if (!userLocation) return;

    setIsLoadingNearby(true);

    try {
      const locationString = formatLocationForAPI(userLocation);
      const response = await storeSearchService.getNearbyStores({
        location: locationString,
        radius: PAYMENT_SEARCH_CONSTANTS.DEFAULT_RADIUS,
        limit: PAYMENT_SEARCH_CONSTANTS.NEARBY_LIMIT,
      });

      if (response.success && response.data.stores) {
        const transformedStores = response.data.stores.map((store: any) =>
          transformToPaymentStore(store, store.distance)
        );
        setNearbyStores(transformedStores);
      }
    } catch (error) {
      console.error('Error fetching nearby stores:', error);
    } finally {
      setIsLoadingNearby(false);
    }
  }, [userLocation, formatLocationForAPI]);

  /**
   * Fetch recent payment stores (from payment history)
   */
  const fetchRecentStores = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    setIsLoadingRecent(true);

    try {
      const response = await storePaymentApi.getHistory({
        limit: PAYMENT_SEARCH_CONSTANTS.RECENT_LIMIT,
      });

      if (response.transactions && response.transactions.length > 0) {
        // Transform transaction history to PaymentStoreInfo
        // We need to fetch full store data for each unique store
        const uniqueStoreIds = [...new Set(response.transactions.map(t => t.storeId))];
        const storePromises = uniqueStoreIds.slice(0, 5).map(async (storeId) => {
          try {
            const storeInfo = await storePaymentApi.getStorePaymentInfo(storeId);
            const transaction = response.transactions.find(t => t.storeId === storeId);
            return {
              ...transformToPaymentStore(storeInfo),
              lastPaidAt: transaction?.completedAt || transaction?.createdAt,
            };
          } catch (err) {
            console.warn(`Failed to fetch store ${storeId}:`, err);
            return null;
          }
        });

        const stores = (await Promise.all(storePromises)).filter(Boolean) as PaymentStoreInfo[];
        setRecentStores(stores);
      }
    } catch (error) {
      console.error('Error fetching recent stores:', error);
    } finally {
      setIsLoadingRecent(false);
    }
  }, [authState.isAuthenticated]);

  /**
   * Fetch popular stores
   */
  const fetchPopularStores = useCallback(async () => {
    setIsLoadingPopular(true);

    try {
      // Use featured stores as popular stores
      const response = await storeSearchService.getFeaturedStores({
        limit: PAYMENT_SEARCH_CONSTANTS.POPULAR_LIMIT,
      });

      if (response.success && response.data.stores) {
        const transformedStores = response.data.stores.map((store: any) =>
          transformToPaymentStore(store)
        );
        setPopularStores(transformedStores);
      }
    } catch (error) {
      console.error('Error fetching popular stores:', error);
      // Fallback: try to get all stores sorted by rating
      try {
        const fallbackResponse = await storeSearchService.searchStoresByCategory({
          category: 'all',
          sortBy: 'rating',
          limit: PAYMENT_SEARCH_CONSTANTS.POPULAR_LIMIT,
        });

        if (fallbackResponse.success && fallbackResponse.data.stores) {
          const transformedStores = fallbackResponse.data.stores.map((store: any) =>
            transformToPaymentStore(store)
          );
          setPopularStores(transformedStores);
        }
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
      }
    } finally {
      setIsLoadingPopular(false);
    }
  }, []);

  /**
   * Execute search query
   */
  const executeSearch = useCallback(async (query: string, category: string | null, page: number = 1) => {
    // Cancel previous search
    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }
    searchAbortController.current = new AbortController();

    // Only return early if no query and no category (null, not 'all')
    if (!query.trim() && category === null) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    if (page === 1) {
      setIsSearching(true);
    } else {
      setIsLoadingMore(true);
    }
    setSearchError(null);

    try {
      const locationParam = userLocation ? formatLocationForAPI(userLocation) : undefined;
      let response;

      // Handle 'all' category or no category - fetch all stores
      if (!query.trim() && (!category || category === 'all')) {
        response = await storeSearchService.searchStoresByCategory({
          category: 'all',
          page,
          limit: PAYMENT_SEARCH_CONSTANTS.DEFAULT_PAGE_SIZE,
          sortBy: userLocation ? 'distance' : 'rating',
          ...(locationParam && {
            location: locationParam,
            radius: PAYMENT_SEARCH_CONSTANTS.DEFAULT_RADIUS,
          }),
        });
      } else {
        // Build search term - use query or category name
        const searchTerm = query.trim() || category || '';

        // Use advanced search for text/category search
        response = await storeSearchService.advancedStoreSearch({
          search: searchTerm,
          page,
          limit: PAYMENT_SEARCH_CONSTANTS.DEFAULT_PAGE_SIZE,
          sortBy: userLocation ? 'distance' : 'rating',
          ...(locationParam && {
            location: locationParam,
            radius: PAYMENT_SEARCH_CONSTANTS.DEFAULT_RADIUS,
          }),
        });
      }

      if (response.success && response.data.stores) {
        const transformedStores = response.data.stores.map((store: any) =>
          transformToPaymentStore(store, store.distance)
        );

        if (page === 1) {
          setSearchResults(transformedStores);
        } else {
          setSearchResults(prev => [...prev, ...transformedStores]);
        }

        setHasMore(response.data.pagination.hasNext);
        setCurrentPage(page);
      } else {
        if (page === 1) {
          setSearchResults([]);
        }
        setHasMore(false);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;

      console.error('Search error:', error);
      setSearchError({
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to search stores',
        recoverable: true,
      });
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  }, [userLocation, formatLocationForAPI]);

  /**
   * Load more search results
   */
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !debouncedSearchQuery) return;
    await executeSearch(debouncedSearchQuery, selectedCategory, currentPage + 1);
  }, [isLoadingMore, hasMore, debouncedSearchQuery, selectedCategory, currentPage, executeSearch]);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    setIsInitialLoading(true);

    const promises: Promise<void>[] = [
      fetchPopularStores(),
    ];

    if (authState.isAuthenticated) {
      promises.push(fetchRecentStores());
    }

    if (userLocation) {
      promises.push(fetchNearbyStores());
    }

    await Promise.all(promises);
    setIsInitialLoading(false);
  }, [authState.isAuthenticated, userLocation, fetchNearbyStores, fetchRecentStores, fetchPopularStores]);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all'); // Reset to 'all' to show all stores
    setSearchError(null);
    setCurrentPage(1);
    setHasMore(false);
  }, []);

  /**
   * Retry after error
   */
  const retry = useCallback(() => {
    setSearchError(null);
    if (debouncedSearchQuery || selectedCategory) {
      executeSearch(debouncedSearchQuery, selectedCategory, 1);
    } else {
      refresh();
    }
  }, [debouncedSearchQuery, selectedCategory, executeSearch, refresh]);

  // Initialize location from context
  useEffect(() => {
    if (currentLocation && !userLocation) {
      setUserLocation({
        latitude: currentLocation.coordinates[1],
        longitude: currentLocation.coordinates[0],
        timestamp: Date.now(),
      });
    }
  }, [currentLocation, userLocation]);

  // Initial data fetch
  useEffect(() => {
    if (!isInitialFetchDone.current && authState.isAuthenticated) {
      isInitialFetchDone.current = true;
      refresh();
    }
  }, [authState.isAuthenticated, refresh]);

  // Fetch nearby stores when location becomes available
  useEffect(() => {
    if (userLocation && nearbyStores.length === 0 && !isLoadingNearby) {
      fetchNearbyStores();
    }
  }, [userLocation, nearbyStores.length, isLoadingNearby, fetchNearbyStores]);

  // Execute search when debounced query or category changes
  useEffect(() => {
    if (debouncedSearchQuery || selectedCategory) {
      executeSearch(debouncedSearchQuery, selectedCategory, 1);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery, selectedCategory, executeSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchAbortController.current) {
        searchAbortController.current.abort();
      }
    };
  }, []);

  return {
    // Search
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchError,

    // Data sections
    nearbyStores,
    recentStores,
    popularStores,

    // Loading states
    isLoadingNearby,
    isLoadingRecent,
    isLoadingPopular,
    isInitialLoading,

    // Category filter
    selectedCategory,
    setSelectedCategory,
    categories: PAYMENT_CATEGORIES,

    // Pagination
    hasMore,
    loadMore,
    isLoadingMore,

    // Actions
    refresh,
    clearSearch,
    retry,

    // Location
    userLocation,
    isLoadingLocation: isLoadingLocation || isLoadingLocationContext,
    locationError,
    requestLocation,
  };
};

export default usePaymentStoreSearch;
