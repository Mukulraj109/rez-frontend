// usePaymentMethods Hook
// Manages user payment methods (cards, UPI, bank accounts, wallets)

import { useState, useEffect, useCallback } from 'react';
import paymentMethodApi, {
  PaymentMethod,
  PaymentMethodCreate,
  PaymentMethodUpdate,
} from '@/services/paymentMethodApi';

interface UsePaymentMethodsReturn {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addPaymentMethod: (data: PaymentMethodCreate) => Promise<PaymentMethod | null>;
  updatePaymentMethod: (id: string, data: PaymentMethodUpdate) => Promise<PaymentMethod | null>;
  deletePaymentMethod: (id: string) => Promise<boolean>;
  setDefaultPaymentMethod: (id: string) => Promise<PaymentMethod | null>;
  getPaymentMethodById: (id: string) => Promise<PaymentMethod | null>;
  defaultPaymentMethod: PaymentMethod | null;
  clearError: () => void;
}

export const usePaymentMethods = (autoFetch: boolean = true): UsePaymentMethodsReturn => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    console.log('[usePaymentMethods] Fetching payment methods...');
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentMethodApi.getUserPaymentMethods();
      console.log('[usePaymentMethods] Fetch response:', response);

      if (response.success && response.data) {
        console.log('[usePaymentMethods] Setting payment methods, count:', response.data.length);
        console.log('[usePaymentMethods] Payment methods:', response.data);
        setPaymentMethods(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch payment methods');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch payment methods';
      setError(errorMessage);
      console.error('[usePaymentMethods] Error fetching payment methods:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addPaymentMethod = useCallback(async (data: PaymentMethodCreate): Promise<PaymentMethod | null> => {
    setError(null);

    try {
      const response = await paymentMethodApi.createPaymentMethod(data);

      if (response.success && response.data) {
        await fetchPaymentMethods(); // Refresh list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to add payment method');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add payment method';
      setError(errorMessage);
      console.error('Error adding payment method:', err);
      return null;
    }
  }, [fetchPaymentMethods]);

  const updatePaymentMethod = useCallback(
    async (id: string, data: PaymentMethodUpdate): Promise<PaymentMethod | null> => {
      setError(null);

      try {
        const response = await paymentMethodApi.updatePaymentMethod(id, data);

        if (response.success && response.data) {
          await fetchPaymentMethods(); // Refresh list
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to update payment method');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to update payment method';
        setError(errorMessage);
        console.error('Error updating payment method:', err);
        return null;
      }
    },
    [fetchPaymentMethods]
  );

  const deletePaymentMethod = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    console.log('[usePaymentMethods] Deleting payment method ID:', id);

    try {
      const response = await paymentMethodApi.deletePaymentMethod(id);
      console.log('[usePaymentMethods] Delete API response:', response);

      if (response.success) {
        console.log('[usePaymentMethods] Delete successful, fetching updated list...');
        await fetchPaymentMethods(); // Refresh list
        console.log('[usePaymentMethods] Fetch complete');
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete payment method');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete payment method';
      setError(errorMessage);
      console.error('[usePaymentMethods] Error deleting payment method:', err);
      return false;
    }
  }, [fetchPaymentMethods]);

  const setDefaultPaymentMethod = useCallback(async (id: string): Promise<PaymentMethod | null> => {
    setError(null);

    try {
      const response = await paymentMethodApi.setDefaultPaymentMethod(id);

      if (response.success && response.data) {
        await fetchPaymentMethods(); // Refresh list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to set default payment method');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to set default payment method';
      setError(errorMessage);
      console.error('Error setting default payment method:', err);
      return null;
    }
  }, [fetchPaymentMethods]);

  const getPaymentMethodById = useCallback(async (id: string): Promise<PaymentMethod | null> => {
    setError(null);

    try {
      const response = await paymentMethodApi.getPaymentMethodById(id);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch payment method');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch payment method';
      setError(errorMessage);
      console.error('Error fetching payment method by ID:', err);
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get default payment method
  const defaultPaymentMethod = paymentMethods.find(pm => pm.isDefault && pm.isActive) || null;

  useEffect(() => {
    if (autoFetch) {
      fetchPaymentMethods();
    }
  }, [autoFetch, fetchPaymentMethods]);

  return {
    paymentMethods,
    isLoading,
    error,
    refetch: fetchPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    getPaymentMethodById,
    defaultPaymentMethod,
    clearError,
  };
};

export default usePaymentMethods;