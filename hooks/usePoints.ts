/**
 * usePoints Hook
 * Custom hook for managing user points/coins with real-time updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import pointsApi, {
  PointsBalance,
  PointTransaction,
  PointsStats,
  EarnPointsRequest,
  SpendPointsRequest,
} from '@/services/pointsApi';

interface UsePointsOptions {
  autoFetch?: boolean;
  pollingInterval?: number; // milliseconds
}

interface UsePointsReturn {
  balance: PointsBalance | null;
  stats: PointsStats | null;
  transactions: PointTransaction[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  earnPoints: (data: EarnPointsRequest) => Promise<boolean>;
  spendPoints: (data: SpendPointsRequest) => Promise<boolean>;
  refreshBalance: () => Promise<void>;
  refreshStats: () => Promise<void>;
  loadMoreTransactions: () => Promise<void>;
  claimPendingPoints: () => Promise<boolean>;
  hasMoreTransactions: boolean;
  totalPages: number;
  currentPage: number;
}

export function usePoints(options: UsePointsOptions = {}): UsePointsReturn {
  const { autoFetch = true, pollingInterval } = options;

  const [balance, setBalance] = useState<PointsBalance | null>(null);
  const [stats, setStats] = useState<PointsStats | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch balance
  const fetchBalance = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      const response = await pointsApi.getBalance();

      if (response.success && response.data) {
        setBalance(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch balance');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch balance';
      setError(errorMessage);
      console.error('[usePoints] Error fetching balance:', err);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setError(null);

      const response = await pointsApi.getStats();

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch stats');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch stats';
      console.error('[usePoints] Error fetching stats:', err);
    }
  }, []);

  // Fetch transactions
  const fetchTransactions = useCallback(
    async (page = 1, append = false) => {
      try {
        if (!append) {
          setIsLoading(true);
        }
        setError(null);

        const response = await pointsApi.getTransactions(page, 20);

        if (response.success && response.data) {
          const { transactions: newTransactions, pagination } = response.data;

          if (append) {
            setTransactions((prev) => [...prev, ...newTransactions]);
          } else {
            setTransactions(newTransactions);
          }

          setCurrentPage(pagination.page);
          setTotalPages(pagination.totalPages);
          setHasMoreTransactions(pagination.page < pagination.totalPages);
        } else {
          throw new Error(response.message || 'Failed to fetch transactions');
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to fetch transactions';
        setError(errorMessage);
        console.error('[usePoints] Error fetching transactions:', err);
      } finally {
        if (!append) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  // Earn points
  const earnPoints = useCallback(
    async (data: EarnPointsRequest): Promise<boolean> => {
      try {
        setError(null);

        const response = await pointsApi.earnPoints(data);

        if (response.success && response.data) {

          // Refresh balance after earning
          await fetchBalance(false);

          return true;
        } else {
          throw new Error(response.message || 'Failed to earn points');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to earn points';
        setError(errorMessage);
        console.error('[usePoints] Error earning points:', err);
        return false;
      }
    },
    [fetchBalance]
  );

  // Spend points
  const spendPoints = useCallback(
    async (data: SpendPointsRequest): Promise<boolean> => {
      try {
        setError(null);

        const response = await pointsApi.spendPoints(data);

        if (response.success && response.data) {

          // Update balance locally
          if (balance) {
            setBalance({
              ...balance,
              total: response.data.newBalance,
              spent: balance.spent + data.amount,
            });
          }

          // Refresh full data
          await fetchBalance(false);
          await fetchTransactions(1, false);

          return true;
        } else {
          throw new Error(response.message || 'Failed to spend points');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to spend points';
        setError(errorMessage);
        console.error('[usePoints] Error spending points:', err);
        return false;
      }
    },
    [balance, fetchBalance, fetchTransactions]
  );

  // Claim pending points
  const claimPendingPoints = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);

      const response = await pointsApi.claimPendingPoints();

      if (response.success && response.data) {

        // Refresh balance after claiming
        await fetchBalance(false);
        await fetchTransactions(1, false);

        return true;
      } else {
        throw new Error(response.message || 'Failed to claim pending points');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to claim pending points';
      setError(errorMessage);
      console.error('[usePoints] Error claiming pending points:', err);
      return false;
    }
  }, [fetchBalance, fetchTransactions]);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    setIsRefreshing(true);
    await fetchBalance(false);
    setIsRefreshing(false);
  }, [fetchBalance]);

  // Refresh stats
  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  // Load more transactions (pagination)
  const loadMoreTransactions = useCallback(async () => {
    if (hasMoreTransactions && !isLoading) {
      await fetchTransactions(currentPage + 1, true);
    }
  }, [hasMoreTransactions, isLoading, currentPage, fetchTransactions]);

  // Initial data fetch
  useEffect(() => {
    if (autoFetch) {
      fetchBalance();
      fetchStats();
      fetchTransactions();
    }
  }, [autoFetch]);

  // Polling for real-time updates
  useEffect(() => {
    // Clear existing interval before creating new one
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (pollingInterval && pollingInterval > 0) {
      pollingIntervalRef.current = setInterval(() => {
        fetchBalance(false);
      }, pollingInterval);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [pollingInterval, fetchBalance]);

  return {
    balance,
    stats,
    transactions,
    isLoading,
    isRefreshing,
    error,
    earnPoints,
    spendPoints,
    refreshBalance,
    refreshStats,
    loadMoreTransactions,
    claimPendingPoints,
    hasMoreTransactions,
    totalPages,
    currentPage,
  };
}

export default usePoints;
