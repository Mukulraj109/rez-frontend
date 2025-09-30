// useUserStatistics Hook
// Fetches and manages user statistics from all phases

import { useState, useEffect, useCallback } from 'react';
import authService from '@/services/authApi';

export interface UserStatistics {
  orders: {
    total: number;
    delivered: number;
    cancelled: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
  };
  wallet: {
    balance: number;
    totalEarned: number;
    totalSpent: number;
    pendingAmount: number;
  };
  reviews: {
    total: number;
  };
  achievements: {
    total: number;
    unlocked: number;
  };
  activities: {
    total: number;
  };
  videos: {
    total: number;
    totalViews: number;
    totalEarnings: number;
  };
  projects: {
    total: number;
    totalEarned: number;
    completed: number;
    ongoing: number;
  };
  offers: {
    redeemed: number;
  };
  vouchers: {
    active: number;
    redeemed: number;
  };
}

interface UseUserStatisticsReturn {
  statistics: UserStatistics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useUserStatistics = (autoFetch: boolean = true): UseUserStatisticsReturn => {
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.getUserStatistics();

      if (response.success && response.data) {
        setStatistics(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch statistics');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch user statistics';
      setError(errorMessage);
      console.error('Error fetching user statistics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchStatistics();
    }
  }, [autoFetch, fetchStatistics]);

  return {
    statistics,
    isLoading,
    error,
    refetch: fetchStatistics,
    clearError,
  };
};

export default useUserStatistics;