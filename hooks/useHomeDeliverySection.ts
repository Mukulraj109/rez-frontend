/**
 * useHomeDeliverySection Hook
 * Custom hook for the homepage "Home Delivery" section
 * Handles subcategory selection, API fetching, and caching
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import productsApi from '@/services/productsApi';
import { HOME_DELIVERY_SUBCATEGORIES, HOME_DELIVERY_SECTION_CONFIG } from '@/config/homeDeliverySectionConfig';

// Product type for the Home Delivery section
export interface HomeDeliverySectionProduct {
  id: string;
  name: string;
  brand?: string;
  image: string | null;
  price: {
    current: number;
    original?: number;
    currency: string;
    discount?: number;
  };
  cashback: {
    percentage: number;
    maxAmount?: number;
  };
  rating?: {
    value: number;
    count: number;
  };
  deliveryTime?: string;
  priceForTwo?: number;
  store?: {
    id: string;
    name: string;
    logo?: string;
  };
}

export interface UseHomeDeliverySectionReturn {
  activeSubcategory: string;
  products: HomeDeliverySectionProduct[];
  loading: boolean;
  error: string | null;
  setActiveSubcategory: (id: string) => void;
  refreshProducts: () => Promise<void>;
}

// Helper function to map backend product to section product
const mapBackendProductToSection = (product: any): HomeDeliverySectionProduct => {
  // Extract image
  let image: string | null = null;
  if (Array.isArray(product.images) && product.images.length > 0) {
    image = product.images[0]?.url || product.images[0];
  } else if (product.image) {
    image = product.image;
  } else if (product.thumbnail) {
    image = product.thumbnail;
  } else if (product.media && Array.isArray(product.media) && product.media.length > 0) {
    image = product.media[0]?.url || product.media[0];
  }

  // Calculate discount
  const originalPrice = product.price?.original || product.pricing?.compare;
  const currentPrice = product.price?.current || product.pricing?.selling || 0;
  const discount = originalPrice && currentPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : (product.price?.discount || 0);

  return {
    id: product._id || product.id,
    name: product.name || product.title,
    brand: product.brand,
    image,
    price: {
      current: currentPrice,
      original: originalPrice,
      currency: product.price?.currency || '₹',
      discount,
    },
    cashback: {
      percentage: product.cashback?.percentage || 5,
      maxAmount: product.cashback?.maxAmount,
    },
    rating: product.rating ? {
      value: product.rating.value || product.rating.average || 0,
      count: product.rating.count || 0,
    } : (product.ratings ? {
      value: product.ratings.average || 0,
      count: product.ratings.count || 0,
    } : undefined),
    deliveryTime: product.deliveryTime || product.estimatedDelivery || '30-45 min',
    priceForTwo: product.priceForTwo || (currentPrice ? currentPrice * 2 : undefined),
    store: product.store ? {
      id: product.store._id || product.store.id || '',
      name: product.store.name || 'Store',
      logo: product.store.logo || product.store.image,
    } : undefined,
  };
};

export function useHomeDeliverySection(): UseHomeDeliverySectionReturn {
  const [activeSubcategory, setActiveSubcategoryState] = useState(HOME_DELIVERY_SUBCATEGORIES[0].id);
  const [products, setProducts] = useState<HomeDeliverySectionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache products by subcategory to avoid redundant API calls
  const cache = useRef<Record<string, HomeDeliverySectionProduct[]>>({});
  const fetchInProgress = useRef<Record<string, boolean>>({});

  const fetchProducts = useCallback(async (subcategorySlug: string) => {
    // Check cache first
    if (cache.current[subcategorySlug] && cache.current[subcategorySlug].length > 0) {
      setProducts(cache.current[subcategorySlug]);
      setLoading(false);
      setError(null);
      return;
    }

    // Prevent duplicate fetches
    if (fetchInProgress.current[subcategorySlug]) {
      return;
    }

    fetchInProgress.current[subcategorySlug] = true;
    setLoading(true);
    setError(null);

    try {
      const response = await productsApi.getProductsBySubcategory(
        subcategorySlug,
        HOME_DELIVERY_SECTION_CONFIG.productsPerCategory
      );

      console.log('[useHomeDeliverySection] API Response:', JSON.stringify(response, null, 2));

      if (response.success && response.data) {
        const rawProducts = Array.isArray(response.data) ? response.data : [];

        console.log('[useHomeDeliverySection] Raw products count:', rawProducts.length);
        if (rawProducts.length > 0) {
          console.log('[useHomeDeliverySection] First raw product:', JSON.stringify(rawProducts[0], null, 2));
        }

        const mappedProducts = rawProducts.map(mapBackendProductToSection);

        console.log('[useHomeDeliverySection] Mapped products count:', mappedProducts.length);
        if (mappedProducts.length > 0) {
          console.log('[useHomeDeliverySection] First mapped product:', JSON.stringify(mappedProducts[0], null, 2));
        }

        // Cache the results
        cache.current[subcategorySlug] = mappedProducts;
        setProducts(mappedProducts);
        setError(null);
      } else {
        // If API returns no products, set empty array (not an error)
        cache.current[subcategorySlug] = [];
        setProducts([]);
        setError(null);
      }
    } catch (err: any) {
      console.error('[useHomeDeliverySection] Error fetching products:', err);
      setError('Failed to load. Tap to retry.');
      setProducts([]);
    } finally {
      setLoading(false);
      fetchInProgress.current[subcategorySlug] = false;
    }
  }, []);

  const setActiveSubcategory = useCallback((id: string) => {
    setActiveSubcategoryState(id);
    const subcategory = HOME_DELIVERY_SUBCATEGORIES.find(s => s.id === id);
    if (subcategory) {
      fetchProducts(subcategory.slug);
    }
  }, [fetchProducts]);

  const refreshProducts = useCallback(async () => {
    // Clear cache for current subcategory and refetch
    const subcategory = HOME_DELIVERY_SUBCATEGORIES.find(s => s.id === activeSubcategory);
    if (subcategory) {
      delete cache.current[subcategory.slug];
      await fetchProducts(subcategory.slug);
    }
  }, [activeSubcategory, fetchProducts]);

  // Fetch initial products on mount
  useEffect(() => {
    const initialSubcategory = HOME_DELIVERY_SUBCATEGORIES[0];
    if (initialSubcategory) {
      fetchProducts(initialSubcategory.slug);
    }
  }, [fetchProducts]);

  return {
    activeSubcategory,
    products,
    loading,
    error,
    setActiveSubcategory,
    refreshProducts,
  };
}

export default useHomeDeliverySection;
