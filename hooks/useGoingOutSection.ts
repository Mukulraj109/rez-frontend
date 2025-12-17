/**
 * useGoingOutSection Hook
 * Custom hook for the homepage "Going Out" section
 * Handles subcategory selection, API fetching for stores, and caching
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import storesApi from '@/services/storesApi';
import { GOING_OUT_SUBCATEGORIES, GOING_OUT_SECTION_CONFIG } from '@/config/goingOutSectionConfig';

// Store type for the Going Out section
export interface GoingOutSectionStore {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  banner: string | null;
  rating: {
    average: number;
    count: number;
  };
  cuisine: string[];
  distance?: string;
  earnAmount: number;
  priceLevel?: string;
  location: {
    address: string;
    city: string;
  };
}

export interface UseGoingOutSectionReturn {
  activeSubcategory: string;
  stores: GoingOutSectionStore[];
  loading: boolean;
  error: string | null;
  setActiveSubcategory: (id: string) => void;
  refreshStores: () => Promise<void>;
}

// Helper function to map backend store to section store
const mapBackendStoreToSection = (store: any): GoingOutSectionStore => {
  // Extract image - prefer banner[0], then logo
  let banner: string | null = null;
  if (Array.isArray(store.banner) && store.banner.length > 0) {
    banner = store.banner[0];
  } else if (typeof store.banner === 'string') {
    banner = store.banner;
  }

  const logo = store.logo || null;

  // Calculate earn amount from cashback percentage
  const cashbackPercent = store.offers?.cashback || 0;
  const earnAmount = Math.round((cashbackPercent * GOING_OUT_SECTION_CONFIG.avgOrderValue) / 100);

  // Extract cuisine/tags
  const cuisine: string[] = [];
  if (Array.isArray(store.tags)) {
    cuisine.push(...store.tags.slice(0, 3));
  }
  if (store.category?.name && !cuisine.includes(store.category.name)) {
    cuisine.unshift(store.category.name);
  }

  // Determine price level from minOrderAmount or tags
  let priceLevel = '₹₹';
  if (store.operationalInfo?.minimumOrder) {
    const minOrder = store.operationalInfo.minimumOrder;
    if (minOrder < 100) priceLevel = '₹';
    else if (minOrder < 300) priceLevel = '₹₹';
    else if (minOrder < 500) priceLevel = '₹₹₹';
    else priceLevel = '₹₹₹₹';
  }

  return {
    id: store._id || store.id,
    name: store.name,
    slug: store.slug,
    logo,
    banner,
    rating: {
      average: store.ratings?.average || 0,
      count: store.ratings?.count || 0,
    },
    cuisine: cuisine.slice(0, 3),
    distance: store.distance ? `${store.distance.toFixed(1)} km` : undefined,
    earnAmount,
    priceLevel,
    location: {
      address: store.location?.address || '',
      city: store.location?.city || '',
    },
  };
};

export function useGoingOutSection(): UseGoingOutSectionReturn {
  const [activeSubcategory, setActiveSubcategoryState] = useState(GOING_OUT_SUBCATEGORIES[0].id);
  const [stores, setStores] = useState<GoingOutSectionStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache stores by subcategory to avoid redundant API calls
  const cache = useRef<Record<string, GoingOutSectionStore[]>>({});
  const fetchInProgress = useRef<Record<string, boolean>>({});

  const fetchStores = useCallback(async (subcategorySlug: string) => {
    console.log('[useGoingOutSection] 🔍 Fetching stores for subcategory:', subcategorySlug);

    // Check cache first
    if (cache.current[subcategorySlug] && cache.current[subcategorySlug].length > 0) {
      console.log('[useGoingOutSection] ✅ Using cached stores for:', subcategorySlug, 'Count:', cache.current[subcategorySlug].length);
      setStores(cache.current[subcategorySlug]);
      setLoading(false);
      setError(null);
      return;
    }

    // Prevent duplicate fetches
    if (fetchInProgress.current[subcategorySlug]) {
      console.log('[useGoingOutSection] ⏳ Fetch already in progress for:', subcategorySlug);
      return;
    }

    fetchInProgress.current[subcategorySlug] = true;
    setLoading(true);
    setError(null);

    try {
      console.log('[useGoingOutSection] 📡 Making API call for subcategory:', subcategorySlug);
      const response = await storesApi.getStoresBySubcategorySlug(
        subcategorySlug,
        GOING_OUT_SECTION_CONFIG.storesPerCategory
      );

      console.log('[useGoingOutSection] 📦 API Response for', subcategorySlug, ':', JSON.stringify(response, null, 2));

      if (response.success && response.data) {
        const rawStores = Array.isArray(response.data)
          ? response.data
          : (response.data.stores || []);

        console.log('[useGoingOutSection] Raw stores count:', rawStores.length);
        if (rawStores.length > 0) {
          console.log('[useGoingOutSection] First raw store:', JSON.stringify(rawStores[0], null, 2));
        }

        const mappedStores = rawStores.map(mapBackendStoreToSection);

        console.log('[useGoingOutSection] ✅ Mapped stores for', subcategorySlug, '- Count:', mappedStores.length);
        console.log('[useGoingOutSection] 📋 Store names:', mappedStores.map((s: any) => s.name).join(', '));

        // Cache the results
        cache.current[subcategorySlug] = mappedStores;
        setStores(mappedStores);
        setError(null);
      } else {
        // If API returns no stores, set empty array (not an error)
        cache.current[subcategorySlug] = [];
        setStores([]);
        setError(null);
      }
    } catch (err: any) {
      console.error('[useGoingOutSection] Error fetching stores:', err);
      setError('Failed to load. Tap to retry.');
      setStores([]);
    } finally {
      setLoading(false);
      fetchInProgress.current[subcategorySlug] = false;
    }
  }, []);

  const setActiveSubcategory = useCallback((id: string) => {
    console.log('[useGoingOutSection] 🔄 Tab changed to ID:', id);
    setActiveSubcategoryState(id);
    const subcategory = GOING_OUT_SUBCATEGORIES.find(s => s.id === id);
    if (subcategory) {
      console.log('[useGoingOutSection] 📋 Found subcategory:', subcategory.label, '-> slug:', subcategory.slug);
      fetchStores(subcategory.slug);
    } else {
      console.log('[useGoingOutSection] ❌ Subcategory not found for ID:', id);
    }
  }, [fetchStores]);

  const refreshStores = useCallback(async () => {
    // Clear cache for current subcategory and refetch
    const subcategory = GOING_OUT_SUBCATEGORIES.find(s => s.id === activeSubcategory);
    if (subcategory) {
      delete cache.current[subcategory.slug];
      await fetchStores(subcategory.slug);
    }
  }, [activeSubcategory, fetchStores]);

  // Fetch initial stores on mount
  useEffect(() => {
    const initialSubcategory = GOING_OUT_SUBCATEGORIES[0];
    if (initialSubcategory) {
      fetchStores(initialSubcategory.slug);
    }
  }, [fetchStores]);

  return {
    activeSubcategory,
    stores,
    loading,
    error,
    setActiveSubcategory,
    refreshStores,
  };
}

export default useGoingOutSection;
