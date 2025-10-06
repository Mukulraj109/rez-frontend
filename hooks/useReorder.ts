// useReorder Hook
// Manages re-ordering functionality

import { useState, useCallback } from 'react';
import reorderService, {
  ReorderValidation,
  ReorderResult,
  FrequentlyOrderedItem,
  ReorderSuggestion
} from '@/services/reorderApi';
import { useCart } from '@/contexts/CartContext';
import { router } from 'expo-router';

interface UseReorderReturn {
  // State
  validating: boolean;
  reordering: boolean;
  validation: ReorderValidation | null;
  error: string | null;

  // Actions
  validateReorder: (orderId: string, itemIds?: string[]) => Promise<boolean>;
  reorderFull: (orderId: string) => Promise<boolean>;
  reorderSelected: (orderId: string, itemIds: string[]) => Promise<boolean>;
  clearValidation: () => void;
}

interface UseFrequentlyOrderedReturn {
  items: FrequentlyOrderedItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseReorderSuggestionsReturn {
  suggestions: ReorderSuggestion[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useReorder(): UseReorderReturn {
  const [validating, setValidating] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [validation, setValidation] = useState<ReorderValidation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { refreshCart } = useCart();

  const validateReorder = useCallback(async (
    orderId: string,
    itemIds?: string[]
  ): Promise<boolean> => {
    try {
      setValidating(true);
      setError(null);

      console.log('🔍 [useReorder] Validating reorder:', orderId);

      const response = await reorderService.validateReorder(orderId, itemIds);

      if (response.success && response.data) {
        setValidation(response.data);
        console.log('✅ [useReorder] Validation successful:', {
          canReorder: response.data.canReorder,
          itemCount: response.data.items.length,
          warnings: response.data.warnings.length
        });
        return response.data.canReorder;
      } else {
        throw new Error(response.message || 'Failed to validate reorder');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate reorder';
      console.error('❌ [useReorder] Validation error:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setValidating(false);
    }
  }, []);

  const reorderFull = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      setReordering(true);
      setError(null);

      console.log('🔄 [useReorder] Re-ordering full order:', orderId);

      const response = await reorderService.reorderFullOrder(orderId);

      if (response.success && response.data) {
        const result = response.data;

        console.log('✅ [useReorder] Reorder successful:', {
          addedItems: result.addedItems.length,
          skippedItems: result.skippedItems.length
        });

        // Refresh cart
        await refreshCart();

        // Store validation for display
        setValidation(result.validation);

        return true;
      } else {
        throw new Error(response.message || 'Failed to reorder');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder';
      console.error('❌ [useReorder] Reorder error:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setReordering(false);
    }
  }, [refreshCart]);

  const reorderSelected = useCallback(async (
    orderId: string,
    itemIds: string[]
  ): Promise<boolean> => {
    try {
      setReordering(true);
      setError(null);

      console.log('🔄 [useReorder] Re-ordering selected items:', orderId, itemIds);

      const response = await reorderService.reorderSelectedItems(orderId, itemIds);

      if (response.success && response.data) {
        const result = response.data;

        console.log('✅ [useReorder] Selective reorder successful:', {
          addedItems: result.addedItems.length,
          skippedItems: result.skippedItems.length
        });

        // Refresh cart
        await refreshCart();

        // Store validation for display
        setValidation(result.validation);

        return true;
      } else {
        throw new Error(response.message || 'Failed to reorder selected items');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder selected items';
      console.error('❌ [useReorder] Selective reorder error:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setReordering(false);
    }
  }, [refreshCart]);

  const clearValidation = useCallback(() => {
    setValidation(null);
    setError(null);
  }, []);

  return {
    validating,
    reordering,
    validation,
    error,
    validateReorder,
    reorderFull,
    reorderSelected,
    clearValidation
  };
}

export function useFrequentlyOrdered(limit: number = 10): UseFrequentlyOrderedReturn {
  const [items, setItems] = useState<FrequentlyOrderedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 [useFrequentlyOrdered] Loading frequently ordered items');

      const response = await reorderService.getFrequentlyOrdered(limit);

      if (response.success && response.data) {
        setItems(response.data);
        console.log('✅ [useFrequentlyOrdered] Loaded items:', response.data.length);
      } else {
        throw new Error(response.message || 'Failed to load frequently ordered items');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load frequently ordered items';
      console.error('❌ [useFrequentlyOrdered] Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  return {
    items,
    loading,
    error,
    refresh
  };
}

export function useReorderSuggestions(): UseReorderSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<ReorderSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('💡 [useReorderSuggestions] Loading reorder suggestions');

      const response = await reorderService.getReorderSuggestions();

      if (response.success && response.data) {
        setSuggestions(response.data);
        console.log('✅ [useReorderSuggestions] Loaded suggestions:', response.data.length);
      } else {
        throw new Error(response.message || 'Failed to load reorder suggestions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reorder suggestions';
      console.error('❌ [useReorderSuggestions] Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    suggestions,
    loading,
    error,
    refresh
  };
}
