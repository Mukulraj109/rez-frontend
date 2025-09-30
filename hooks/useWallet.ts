import { useState, useCallback, useEffect, useRef } from 'react';
import {
  WalletState,
  WalletData,
  WalletError,
  CoinBalance
} from '@/types/wallet';
import {
  createWalletError
} from '@/utils/mock-wallet-data';
import walletApi from '@/services/walletApi';

interface UseWalletOptions {
  userId?: string;
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

      // Call real backend API
      const response = await walletApi.getBalance();

      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch wallet');
      }

      // Transform backend response to frontend format
      const backendData = response.data;

      // Map backend coins to frontend format
      const coins = backendData.coins.map((coin, index) => ({
        id: `${coin.type}-${index}`,
        type: coin.type as 'wasil' | 'promotion' | 'cashback' | 'reward',
        name: coin.type === 'wasil' ? 'REZ Coin' :
              coin.type === 'promotion' ? 'Promo Coin' :
              coin.type === 'cashback' ? 'Cashback Coin' : 'Reward Coin',
        amount: coin.amount,
        currency: backendData.currency,
        formattedAmount: `${backendData.currency} ${coin.amount}`,
        description: coin.type === 'wasil'
          ? `Total earned: ${backendData.statistics.totalEarned} | Total spent: ${backendData.statistics.totalSpent}`
          : 'There is no cap or limit on the uses of this coin',
        iconPath: coin.type === 'wasil'
          ? require('@/assets/images/wasil-coin.png')
          : require('@/assets/images/promo-coin.png'),
        backgroundColor: coin.type === 'wasil' ? '#FFE9A9' : '#E8F4FD',
        isActive: coin.isActive,
        earnedDate: coin.earnedDate ? new Date(coin.earnedDate) : new Date(backendData.lastUpdated),
        lastUsed: coin.lastUsed ? new Date(coin.lastUsed) : new Date(backendData.lastUpdated),
        expiryDate: coin.expiryDate ? new Date(coin.expiryDate) : undefined,
      }));

      const walletData: WalletData = {
        userId: userId || 'unknown',
        totalBalance: backendData.balance.total,
        currency: backendData.currency,
        formattedTotalBalance: `${backendData.currency} ${backendData.balance.total}`,
        coins: coins,
        recentTransactions: [],
        lastUpdated: new Date(backendData.lastUpdated),
        isActive: backendData.status.isActive,
      };

      setWalletState({
        data: walletData,
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

      console.error('❌ [useWallet] Fetch error:', error);

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

      // Call real backend API
      const response = await walletApi.getBalance();

      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to refresh wallet');
      }

      // Transform backend response to frontend format
      const backendData = response.data;

      // Map backend coins to frontend format
      const coins = backendData.coins.map((coin, index) => ({
        id: `${coin.type}-${index}`,
        type: coin.type as 'wasil' | 'promotion' | 'cashback' | 'reward',
        name: coin.type === 'wasil' ? 'REZ Coin' :
              coin.type === 'promotion' ? 'Promo Coin' :
              coin.type === 'cashback' ? 'Cashback Coin' : 'Reward Coin',
        amount: coin.amount,
        currency: backendData.currency,
        formattedAmount: `${backendData.currency} ${coin.amount}`,
        description: coin.type === 'wasil'
          ? `Total earned: ${backendData.statistics.totalEarned} | Total spent: ${backendData.statistics.totalSpent}`
          : 'There is no cap or limit on the uses of this coin',
        iconPath: coin.type === 'wasil'
          ? require('@/assets/images/wasil-coin.png')
          : require('@/assets/images/promo-coin.png'),
        backgroundColor: coin.type === 'wasil' ? '#FFE9A9' : '#E8F4FD',
        isActive: coin.isActive,
        earnedDate: coin.earnedDate ? new Date(coin.earnedDate) : new Date(backendData.lastUpdated),
        lastUsed: coin.lastUsed ? new Date(coin.lastUsed) : new Date(backendData.lastUpdated),
        expiryDate: coin.expiryDate ? new Date(coin.expiryDate) : undefined,
      }));

      const walletData: WalletData = {
        userId: userId || 'unknown',
        totalBalance: backendData.balance.total,
        currency: backendData.currency,
        formattedTotalBalance: `${backendData.currency} ${backendData.balance.total}`,
        coins: coins,
        recentTransactions: [],
        lastUpdated: new Date(backendData.lastUpdated),
        isActive: backendData.status.isActive,
      };

      setWalletState(prev => ({
        ...prev,
        data: walletData,
        isRefreshing: false,
        lastFetched: new Date(),
      }));

      lastOperationRef.current = () => refreshWallet(forceRefresh);
    } catch (error) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      console.error('❌ [useWallet] Refresh error:', error);

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
    if (autoFetch) {
      fetchWallet();
    }
  }, [autoFetch, fetchWallet]);

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