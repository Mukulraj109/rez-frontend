import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  SearchState, 
  SearchFilters, 
  SearchResults, 
  SearchError 
} from '@/types/store-search';
import { 
  mockSearchStores, 
  defaultSearchFilters 
} from '@/utils/mock-store-search-data';
import { SEARCH_CONFIG } from '@/constants/search-constants';

interface UseStoreSearchOptions {
  initialQuery?: string;
  initialFilters?: Partial<SearchFilters>;
  autoSearch?: boolean;
  debounceDelay?: number;
}

interface UseStoreSearchReturn {
  searchState: SearchState;
  search: (query: string, filters?: SearchFilters) => Promise<void>;
  updateQuery: (query: string) => void;
  updateFilters: (filters: SearchFilters) => void;
  clearSearch: () => void;
  retry: () => Promise<void>;
  refreshResults: () => Promise<void>;
}

export const useStoreSearch = ({
  initialQuery = '',
  initialFilters = {},
  autoSearch = true,
  debounceDelay = SEARCH_CONFIG.DEBOUNCE_DELAY,
}: UseStoreSearchOptions = {}): UseStoreSearchReturn => {
  
  // Initialize state
  const [searchState, setSearchState] = useState<SearchState>({
    query: initialQuery,
    filters: { ...defaultSearchFilters, ...initialFilters },
    results: null,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    lastSearchTime: null,
  });

  // Refs for managing async operations
  const debounceTimeoutRef = useRef<NodeJS.Timeout>(null);
  const lastSearchParamsRef = useRef<{ query: string; filters: SearchFilters } | null>(null);
  const abortControllerRef = useRef<AbortController>(null);

  // Helper function to create search error
  const createSearchError = (
    code: SearchError['code'],
    message: string,
    details?: string
  ): SearchError => ({
    code,
    message,
    details,
    timestamp: new Date(),
    recoverable: code !== 'INVALID_QUERY',
  });

  // Main search function
  const search = useCallback(async (
    query: string,
    filters: SearchFilters = searchState.filters
  ): Promise<void> => {
    try {
      // Cancel any ongoing search
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Validate query
      if (query.trim().length > 0 && query.trim().length < SEARCH_CONFIG.MIN_SEARCH_LENGTH) {
        const error = createSearchError(
          'INVALID_QUERY',
          `Search query must be at least ${SEARCH_CONFIG.MIN_SEARCH_LENGTH} characters`,
          'Please enter a longer search term'
        );
        setSearchState(prev => ({ ...prev, error, isLoading: false }));
        return;
      }

      // Update state to loading
      setSearchState(prev => ({
        ...prev,
        query,
        filters,
        isLoading: true,
        error: null,
      }));

      // Store search parameters for retry
      lastSearchParamsRef.current = { query, filters };

      // Perform search (simulate network delay)
      const results = await mockSearchStores(query, filters);

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      // Update state with results
      setSearchState(prev => ({
        ...prev,
        results,
        isLoading: false,
        lastSearchTime: new Date(),
      }));

    } catch (error) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const searchError = createSearchError(
        'NETWORK_ERROR',
        'Failed to search stores',
        error instanceof Error ? error.message : 'Unknown error occurred'
      );

      setSearchState(prev => ({
        ...prev,
        error: searchError,
        isLoading: false,
      }));
    }
  }, [searchState.filters]);

  // Debounced search function
  const debouncedSearch = useCallback((query: string, filters: SearchFilters) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      search(query, filters);
    }, debounceDelay) as any;
  }, [search, debounceDelay]);

  // Update query function
  const updateQuery = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query }));
    
    if (autoSearch) {
      // Always search, even with empty query to show dummy data by default
      debouncedSearch(query, searchState.filters);
    }
  }, [autoSearch, debouncedSearch, searchState.filters]);

  // Update filters function
  const updateFilters = useCallback((filters: SearchFilters) => {
    setSearchState(prev => ({ ...prev, filters }));
    
    if (autoSearch) {
      // Immediate search when filters change (no debounce), even with empty query
      search(searchState.query, filters);
    }
  }, [autoSearch, search, searchState.query]);

  // Clear search function
  const clearSearch = useCallback(() => {
    // Cancel any ongoing operations
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setSearchState({
      query: '',
      filters: defaultSearchFilters,
      results: null,
      isLoading: false,
      isLoadingMore: false,
      error: null,
      lastSearchTime: null,
    });

    lastSearchParamsRef.current = null;
  }, []);

  // Retry last search function
  const retry = useCallback(async (): Promise<void> => {
    if (lastSearchParamsRef.current) {
      const { query, filters } = lastSearchParamsRef.current;
      await search(query, filters);
    } else if (searchState.query.trim()) {
      await search(searchState.query, searchState.filters);
    }
  }, [search, searchState.query, searchState.filters]);

  // Refresh current results
  const refreshResults = useCallback(async (): Promise<void> => {
    if (searchState.results) {
      await search(searchState.query, searchState.filters);
    }
  }, [search, searchState.query, searchState.filters, searchState.results]);

  // Initial search on mount if autoSearch is enabled
  useEffect(() => {
    if (autoSearch) {
      // Always search on mount to show default dummy data, even with empty query
      search(initialQuery, { ...defaultSearchFilters, ...initialFilters });
    }
  }, []); // Only run on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    searchState,
    search,
    updateQuery,
    updateFilters,
    clearSearch,
    retry,
    refreshResults,
  };
};

export default useStoreSearch;