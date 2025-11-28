// useRecommendations Hook
// Custom hook for managing product recommendations

import { useState, useEffect, useCallback } from 'react';
import recommendationService, {
  ProductRecommendation,
  BundleItem
} from '@/services/recommendationApi';
import { ProductItem } from '@/types/homepage.types';

export interface UseRecommendationsOptions {
  productId: string;
  autoFetch?: boolean;
  trackView?: boolean;
}

export interface UseRecommendationsResult {
  similar: ProductRecommendation[];
  frequentlyBought: BundleItem[];
  bundles: BundleItem[];
  loading: boolean;
  error: string | null;
  fetchSimilar: () => Promise<void>;
  fetchFrequentlyBought: () => Promise<void>;
  fetchBundles: () => Promise<void>;
  fetchAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useRecommendations({
  productId,
  autoFetch = true,
  trackView = true
}: UseRecommendationsOptions): UseRecommendationsResult {
  const [similar, setSimilar] = useState<ProductRecommendation[]>([]);
  const [frequentlyBought, setFrequentlyBought] = useState<BundleItem[]>([]);
  const [bundles, setBundles] = useState<BundleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch similar products
  const fetchSimilar = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await recommendationService.getSimilarProducts(productId, 6);
      if (response.success && response.data) {
        setSimilar(response.data.similarProducts);
      }
    } catch (err: any) {
      console.error('[useRecommendations] Error fetching similar products:', err);
      setError(err.message || 'Failed to fetch similar products');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Fetch frequently bought together
  const fetchFrequentlyBought = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await recommendationService.getFrequentlyBoughtTogether(productId, 4);
      if (response.success && response.data) {
        setFrequentlyBought(response.data.bundles);
      }
    } catch (err: any) {
      console.error('[useRecommendations] Error fetching frequently bought together:', err);
      setError(err.message || 'Failed to fetch frequently bought together');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Fetch bundle deals
  const fetchBundles = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await recommendationService.getBundleDeals(productId, 3);
      if (response.success && response.data) {
        setBundles(response.data.bundles);
      }
    } catch (err: any) {
      console.error('[useRecommendations] Error fetching bundle deals:', err);
      setError(err.message || 'Failed to fetch bundle deals');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Fetch all recommendations
  const fetchAll = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await recommendationService.getAllRecommendations(productId);
      setSimilar(result.similar);
      setFrequentlyBought(result.frequentlyBought);
      setBundles(result.bundles);
    } catch (err: any) {
      console.error('[useRecommendations] Error fetching all recommendations:', err);
      setError(err.message || 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Refresh all recommendations
  const refresh = useCallback(async () => {
    await fetchAll();
  }, [fetchAll]);

  // Track product view
  useEffect(() => {
    if (productId && trackView) {
      recommendationService.trackProductView(productId);
    }
  }, [productId, trackView]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (productId && autoFetch) {
      fetchAll();
    }
  }, [productId, autoFetch, fetchAll]);

  return {
    similar,
    frequentlyBought,
    bundles,
    loading,
    error,
    fetchSimilar,
    fetchFrequentlyBought,
    fetchBundles,
    fetchAll,
    refresh
  };
}

export interface UsePersonalizedRecommendationsOptions {
  autoFetch?: boolean;
  limit?: number;
  excludeProducts?: string[];
}

export interface UsePersonalizedRecommendationsResult {
  recommendations: ProductRecommendation[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePersonalizedRecommendations({
  autoFetch = true,
  limit = 10,
  excludeProducts = []
}: UsePersonalizedRecommendationsOptions = {}): UsePersonalizedRecommendationsResult {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch personalized recommendations
  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await recommendationService.getPersonalizedRecommendations(limit, excludeProducts);
      if (response.success && response.data) {
        setRecommendations(response.data.recommendations);
      }
    } catch (err: any) {
      console.error('[usePersonalizedRecommendations] Error fetching recommendations:', err);
      setError(err.message || 'Failed to fetch personalized recommendations');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  // Refresh recommendations
  const refresh = useCallback(async () => {
    await fetch();
  }, [fetch]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [autoFetch, fetch]);

  return {
    recommendations,
    loading,
    error,
    fetch,
    refresh
  };
}

export default useRecommendations;
