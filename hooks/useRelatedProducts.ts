import { useState, useEffect, useCallback } from 'react';
import productsApi from '@/services/productsApi';

/**
 * Hook for fetching and managing related products
 *
 * Features:
 * - Fetch similar products
 * - Fetch frequently bought together
 * - Fetch bundle products
 * - Automatic loading and error handling
 */

export interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  rating: number;
  reviewCount: number;
  brand?: string;
  cashback?: string;
}

interface UseRelatedProductsProps {
  productId: string;
  type: 'similar' | 'frequently-bought' | 'bundles';
  limit?: number;
  autoLoad?: boolean;
}

interface UseRelatedProductsReturn {
  products: RelatedProduct[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  hasProducts: boolean;
}

export const useRelatedProducts = ({
  productId,
  type,
  limit = 6,
  autoLoad = true,
}: UseRelatedProductsProps): UseRelatedProductsReturn => {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch related products based on type
   */
  const fetchProducts = useCallback(async () => {
    if (!productId) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log(`🔍 [useRelatedProducts] Fetching ${type} for product:`, productId);

      let response;

      switch (type) {
        case 'similar':
          response = await productsApi.getRelatedProducts(productId, limit);
          break;
        case 'frequently-bought':
          response = await productsApi.getFrequentlyBoughtTogether(productId, limit);
          break;
        case 'bundles':
          response = await productsApi.getBundleProducts?.(productId, limit);
          break;
        default:
          throw new Error(`Unknown type: ${type}`);
      }

      console.log(`✅ [useRelatedProducts] Response for ${type}:`, response);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch related products');
      }

      // Transform backend data to frontend format
      const transformedProducts: RelatedProduct[] = (response.data.products || response.data || []).map((product: any) => {
        const basePrice = product.pricing?.basePrice || product.price || 0;
        const salePrice = product.pricing?.salePrice || product.pricing?.basePrice || product.price || 0;

        return {
          id: product.id || product._id,
          name: product.name,
          price: salePrice,
          originalPrice: basePrice !== salePrice ? basePrice : undefined,
          discount: basePrice && salePrice
            ? Math.round(((basePrice - salePrice) / basePrice) * 100)
            : undefined,
          image: product.images?.[0]?.url || product.images?.[0] || product.image || '',
          rating: product.ratings?.average || product.rating || 0,
          reviewCount: product.ratings?.count || product.reviewCount || 0,
          brand: product.store?.name || product.brand || '',
          cashback: product.cashback?.percentage ? `${product.cashback.percentage}% cashback` : undefined,
        };
      });

      setProducts(transformedProducts);
      setIsLoading(false);

      console.log(`✅ [useRelatedProducts] Transformed ${transformedProducts.length} ${type} products`);
    } catch (err: any) {
      console.error(`❌ [useRelatedProducts] Error fetching ${type}:`, err);
      setError(err.message || `Failed to load ${type} products`);
      setIsLoading(false);
      // Set empty array on error
      setProducts([]);
    }
  }, [productId, type, limit]);

  /**
   * Refresh products
   */
  const refresh = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  /**
   * Auto-load on mount and when dependencies change
   */
  useEffect(() => {
    if (autoLoad) {
      fetchProducts();
    }
  }, [autoLoad, fetchProducts]);

  return {
    products,
    isLoading,
    error,
    refresh,
    hasProducts: products.length > 0,
  };
};

export default useRelatedProducts;
