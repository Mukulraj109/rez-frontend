import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';

import {
  PayBillPageState,
  PayBillFilters,
  UsePayBillPageReturn,
  PayBillTransaction,
  PayBillTransactionResponse,
  PAYBILL_CONSTANTS,
  PAYBILL_FILTERS,
} from '@/types/paybill.types';
import paybillApi from '@/services/paybillApi';

// Initial state
const initialState: PayBillPageState = {
  transactions: [],
  currentBalance: 0,
  filteredTransactions: [],
  loading: false,
  refreshing: false,
  error: null,
  pagination: {
    page: 1,
    limit: PAYBILL_CONSTANTS.DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {
    type: PAYBILL_FILTERS.TYPE.ALL,
    status: PAYBILL_FILTERS.STATUS.ALL,
    dateRange: {},
    amountRange: {},
  },
  searchQuery: '',
};

export function usePayBillPage(): UsePayBillPageReturn {
  const router = useRouter();
  const [state, setState] = useState<PayBillPageState>(initialState);

  // Load initial data on mount
  useEffect(() => {
    loadTransactions(1);
  }, []);

  // Apply filters whenever transactions or filters change
  useEffect(() => {
    applyFilters();
  }, [state.transactions, state.filters, state.searchQuery]);

  const loadTransactions = useCallback(async (page: number = 1, showLoader: boolean = true) => {
    if (showLoader) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {

      const response = await paybillApi.getTransactions({
        page,
        limit: PAYBILL_CONSTANTS.DEFAULT_PAGE_SIZE,
      });

      if (response.success && response.data) {
        const data = response.data as PayBillTransactionResponse;
        
        setState(prev => ({
          ...prev,
          transactions: page === 1 ? data.transactions : [...prev.transactions, ...data.transactions],
          currentBalance: data.currentBalance || 0,
          pagination: data.pagination || prev.pagination,
          loading: false,
          refreshing: false,
          error: null,
        }));

      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          refreshing: false,
          error: response.error || 'Failed to load transactions',
        }));
        console.error('❌ [PayBill] Failed to load transactions:', response.error);
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: error.message || 'Network error',
      }));
      console.error('❌ [PayBill] Error loading transactions:', error);
    }
  }, []);

  const loadMoreTransactions = useCallback(async () => {
    if (state.pagination.hasNext && !state.loading) {
      await loadTransactions(state.pagination.page + 1, false);
    }
  }, [state.pagination, state.loading, loadTransactions]);

  const refreshTransactions = useCallback(async () => {
    setState(prev => ({ ...prev, refreshing: true }));
    await loadTransactions(1, false);
  }, [loadTransactions]);

  const refreshBalance = useCallback(async () => {
    try {

      const response = await paybillApi.getBalance();
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          currentBalance: response.data?.paybillBalance || 0,
        }));

      }
    } catch (error: any) {
      console.error('❌ [PayBill] Error refreshing balance:', error);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...state.transactions];

    // Apply type filter
    if (state.filters.type !== PAYBILL_FILTERS.TYPE.ALL) {
      filtered = filtered.filter(txn => txn.type === state.filters.type);
    }

    // Apply status filter
    if (state.filters.status !== PAYBILL_FILTERS.STATUS.ALL) {
      filtered = filtered.filter(txn => txn.status.current === state.filters.status);
    }

    // Apply date range filter
    if (state.filters.dateRange.start || state.filters.dateRange.end) {
      filtered = filtered.filter(txn => {
        const txnDate = new Date(txn.createdAt);
        const startDate = state.filters.dateRange.start ? new Date(state.filters.dateRange.start) : null;
        const endDate = state.filters.dateRange.end ? new Date(state.filters.dateRange.end) : null;

        if (startDate && txnDate < startDate) return false;
        if (endDate && txnDate > endDate) return false;
        return true;
      });
    }

    // Apply amount range filter
    if (state.filters.amountRange.min !== undefined || state.filters.amountRange.max !== undefined) {
      filtered = filtered.filter(txn => {
        if (state.filters.amountRange.min !== undefined && txn.amount < state.filters.amountRange.min) return false;
        if (state.filters.amountRange.max !== undefined && txn.amount > state.filters.amountRange.max) return false;
        return true;
      });
    }

    // Apply search filter
    if (state.searchQuery.trim()) {
      const searchTerm = state.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(txn => 
        txn.description.toLowerCase().includes(searchTerm) ||
        txn.category?.toLowerCase().includes(searchTerm) ||
        txn.source?.type.toLowerCase().includes(searchTerm) ||
        txn.source?.description?.toLowerCase().includes(searchTerm)
      );
    }

    setState(prev => ({ ...prev, filteredTransactions: filtered }));
  }, [state.transactions, state.filters, state.searchQuery]);

  const setFilter = useCallback((filter: PayBillFilters['type']) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, type: filter },
    }));
  }, []);

  const setStatusFilter = useCallback((status: PayBillFilters['status']) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, status },
    }));
  }, []);

  const setDateRange = useCallback((start?: string, end?: string) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, dateRange: { start, end } },
    }));
  }, []);

  const setAmountRange = useCallback((min?: number, max?: number) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, amountRange: { min, max } },
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {
        type: PAYBILL_FILTERS.TYPE.ALL,
        status: PAYBILL_FILTERS.STATUS.ALL,
        dateRange: {},
        amountRange: {},
      },
      searchQuery: '',
    }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const searchTransactions = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  // Handlers
  const handleBack = useCallback(() => {
    try {
      if (router.canGoBack && router.canGoBack()) {
        router.back();
      } else {

        router.push('/wallet/index' as any);
      }
    } catch (error) {
      console.error('🔙 [PayBill] Navigation error, going to wallet:', error);
      router.push('/wallet/index' as any);
    }
  }, [router]);

  const handleTransactionPress = useCallback((transaction: PayBillTransaction) => {

    // Navigate to transaction details if needed
    // router.push(`/transaction-details/${transaction._id}` as any);
  }, []);

  const handleRefresh = useCallback(async () => {
    await refreshTransactions();
  }, [refreshTransactions]);

  const handleLoadMore = useCallback(async () => {
    await loadMoreTransactions();
  }, [loadMoreTransactions]);

  const handleFilterChange = useCallback((filter: PayBillFilters['type']) => {
    setFilter(filter);
  }, [setFilter]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  const handleSearchSubmit = useCallback((query: string) => {
    searchTransactions(query);
  }, [searchTransactions]);

  return {
    state,
    actions: {
      loadTransactions,
      loadMoreTransactions,
      refreshTransactions,
      setFilter,
      setStatusFilter,
      setDateRange,
      setAmountRange,
      clearFilters,
      setSearchQuery,
      searchTransactions,
      refreshBalance,
    },
    handlers: {
      handleBack,
      handleTransactionPress,
      handleRefresh,
      handleLoadMore,
      handleFilterChange,
      handleSearchChange,
      handleSearchSubmit,
    },
  };
}
