import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  WalletState, 
  WalletData, 
  WalletError, 
  CoinBalance 
} from '@/types/wallet';
import { 
  mockFetchWallet, 
  mockRefreshWallet,
  createWalletError 
} from '@/utils/mock-wallet-data';

interface UseWalletOptions {
  userId: string;
  autoFetch?: boolean;
  refreshInterval?: number;
}

interface UseWalletReturn {
  walletState: WalletState;
  fetchWallet: () => Promise<void>;
  refreshWallet: (forceRefresh?: boolean) => Promise<void>;
  clearError: () => void;
  resetWallet: () => void;
  retryLastOperation: () => Promise<void>;
}

export const useWallet = ({ 
  userId, 
  autoFetch = true,
  refreshInterval 
}: UseWalletOptions): UseWalletReturn => {
  const [walletState, setWalletState] = useState<WalletState>({
    data: null,
    isLoading: false,
    isRefreshing: false,
    error: null,
    lastFetched: null,
  });

  const lastOperationRef = useRef<() => Promise<void>>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout>(null);
  const abortControllerRef = useRef<AbortController>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Fetch wallet data
  const fetchWallet = useCallback(async (): Promise<void> => {
    try {
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setWalletState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null 
      }));

      const data = await mockFetchWallet(userId);
      
      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      setWalletState({
        data,
        isLoading: false,
        isRefreshing: false,
        error: null,
        lastFetched: new Date(),
      });

      lastOperationRef.current = fetchWallet;
    } catch (error) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const walletError = createWalletError(
        'NETWORK_ERROR',
        'Failed to load wallet data',
        error instanceof Error ? error.message : 'Unknown error occurred'
      );

      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: walletError,
      }));

      lastOperationRef.current = fetchWallet;
    }
  }, [userId]);

  // Refresh wallet data
  const refreshWallet = useCallback(async (forceRefresh = false): Promise<void> => {
    try {
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setWalletState(prev => ({ 
        ...prev, 
        isRefreshing: true, 
        error: null 
      }));

      const data = await mockRefreshWallet(userId, forceRefresh);
      
      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      setWalletState(prev => ({
        ...prev,
        data,
        isRefreshing: false,
        lastFetched: new Date(),
      }));

      lastOperationRef.current = () => refreshWallet(forceRefresh);
    } catch (error) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const walletError = createWalletError(
        'NETWORK_ERROR',
        'Failed to refresh wallet',
        error instanceof Error ? error.message : 'Unknown error occurred'
      );

      setWalletState(prev => ({
        ...prev,
        isRefreshing: false,
        error: walletError,
      }));

      lastOperationRef.current = () => refreshWallet(forceRefresh);
    }
  }, [userId]);

  // Clear error
  const clearError = useCallback(() => {
    setWalletState(prev => ({ ...prev, error: null }));
  }, []);

  // Reset wallet state
  const resetWallet = useCallback(() => {
    cleanup();
    setWalletState({
      data: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
      lastFetched: null,
    });
  }, [cleanup]);

  // Retry last operation
  const retryLastOperation = useCallback(async (): Promise<void> => {
    if (lastOperationRef.current) {
      await lastOperationRef.current();
    } else {
      await fetchWallet();
    }
  }, [fetchWallet]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && userId) {
      fetchWallet();
    }
  }, [autoFetch, userId, fetchWallet]);

  // Setup refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        if (!walletState.isLoading && !walletState.isRefreshing) {
          refreshWallet(false);
        }
      }, refreshInterval) as any;

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [refreshInterval, walletState.isLoading, walletState.isRefreshing, refreshWallet]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    walletState,
    fetchWallet,
    refreshWallet,
    clearError,
    resetWallet,
    retryLastOperation,
  };
};

export default useWallet;