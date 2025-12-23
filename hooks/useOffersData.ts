import { useState, useEffect, useMemo, useCallback } from 'react';
import { Offer, OfferFilters, OfferSection } from '@/types/offers.types';
import { offersPageData } from '@/data/offersData';
import realOffersApi from '@/services/realOffersApi';

// Feature flag - set to true to use real API
const USE_REAL_API = process.env.EXPO_PUBLIC_MOCK_API !== 'true';

interface OffersPageApiData {
  // Existing sections
  lightningDeals: any[];
  nearbyOffers: any[];
  trendingOffers: any[];
  friendsRedeemed: any[];

  // Cashback tab
  hotspots: any[];
  doubleCashback: any[];
  coinDrops: any[];
  uploadBillStores: any[];
  bankOffers: any[];

  // Exclusive tab
  exclusiveZones: any[];
  specialProfiles: any[];
  loyaltyMilestones: any[];

  // Offer types
  bogoOffers: any[];
  saleOffers: any[];
  freeDeliveryOffers: any[];
}

export function useOffersData() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFilters] = useState<OfferFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API data states
  const [apiData, setApiData] = useState<OffersPageApiData>({
    lightningDeals: [],
    nearbyOffers: [],
    trendingOffers: [],
    friendsRedeemed: [],
    hotspots: [],
    doubleCashback: [],
    coinDrops: [],
    uploadBillStores: [],
    bankOffers: [],
    exclusiveZones: [],
    specialProfiles: [],
    loyaltyMilestones: [],
    bogoOffers: [],
    saleOffers: [],
    freeDeliveryOffers: [],
  });

  // Fetch data from real APIs
  const fetchOffersData = useCallback(async () => {
    if (!USE_REAL_API) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [
        trendingRes,
        nearbyRes,
        hotspotsRes,
        doubleCashbackRes,
        coinDropsRes,
        uploadBillRes,
        bankOffersRes,
        exclusiveZonesRes,
        specialProfilesRes,
        loyaltyRes,
        bogoRes,
        saleRes,
        freeDeliveryRes,
        friendsRedeemedRes,
      ] = await Promise.allSettled([
        realOffersApi.getTrendingOffers(10),
        realOffersApi.getNearbyOffers({ lat: 12.9716, lng: 77.5946, limit: 10 }), // Default to Bangalore
        realOffersApi.getHotspots({ limit: 10 }),
        realOffersApi.getDoubleCashbackCampaigns(5),
        realOffersApi.getCoinDrops({ limit: 20 }),
        realOffersApi.getUploadBillStores({ limit: 20 }),
        realOffersApi.getBankOffers({ limit: 10 }),
        realOffersApi.getExclusiveZones(),
        realOffersApi.getSpecialProfiles(),
        realOffersApi.getLoyaltyMilestones(),
        realOffersApi.getBOGOOffers({ limit: 10 }),
        realOffersApi.getSaleOffers({ limit: 10 }),
        realOffersApi.getFreeDeliveryOffers(10),
        realOffersApi.getFriendsRedeemed(10),
      ]);

      // Extract data safely
      const extractData = (result: PromiseSettledResult<any>) => {
        if (result.status === 'fulfilled' && result.value?.success && result.value?.data) {
          return result.value.data;
        }
        return [];
      };

      setApiData({
        trendingOffers: extractData(trendingRes),
        nearbyOffers: extractData(nearbyRes),
        lightningDeals: extractData(trendingRes), // Use trending as lightning for now
        friendsRedeemed: extractData(friendsRedeemedRes),
        hotspots: extractData(hotspotsRes),
        doubleCashback: extractData(doubleCashbackRes),
        coinDrops: extractData(coinDropsRes),
        uploadBillStores: extractData(uploadBillRes),
        bankOffers: extractData(bankOffersRes),
        exclusiveZones: extractData(exclusiveZonesRes),
        specialProfiles: extractData(specialProfilesRes),
        loyaltyMilestones: extractData(loyaltyRes),
        bogoOffers: extractData(bogoRes),
        saleOffers: extractData(saleRes),
        freeDeliveryOffers: extractData(freeDeliveryRes),
      });
    } catch (err) {
      console.error('[useOffersData] Error fetching offers data:', err);
      setError('Failed to load offers data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    if (USE_REAL_API) {
      fetchOffersData();
    } else {
      setLoading(true);
      // Simulate loading delay for dummy data
      const timer = setTimeout(() => {
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [fetchOffersData]);

  // Filter offers based on current filters
  const filteredSections = useMemo(() => {
    if (!filters.category && !filters.priceRange && !filters.cashBackMin && !filters.sortBy) {
      return offersPageData.sections;
    }

    return offersPageData.sections.map(section => {
      let filteredOffers = [...section.offers];

      // Filter by category
      if (filters.category) {
        filteredOffers = filteredOffers.filter(offer =>
          offer.category.toLowerCase() === filters.category?.toLowerCase()
        );
      }

      // Filter by cash back minimum
      if (filters.cashBackMin) {
        filteredOffers = filteredOffers.filter(offer =>
          offer.cashBackPercentage >= filters.cashBackMin!
        );
      }

      // Filter by price range
      if (filters.priceRange && filters.priceRange.min >= 0) {
        filteredOffers = filteredOffers.filter(offer => {
          const price = offer.discountedPrice || offer.originalPrice || 0;
          return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
        });
      }

      // Sort offers
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'cashback':
            filteredOffers.sort((a, b) => b.cashBackPercentage - a.cashBackPercentage);
            break;
          case 'price':
            filteredOffers.sort((a, b) => {
              const priceA = a.discountedPrice || a.originalPrice || 0;
              const priceB = b.discountedPrice || b.originalPrice || 0;
              return priceA - priceB;
            });
            break;
          case 'newest':
            filteredOffers.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
            break;
          case 'distance':
            // Simple distance sorting (would be more complex in real app)
            filteredOffers.sort((a, b) => a.distance.localeCompare(b.distance));
            break;
        }
      }

      return {
        ...section,
        offers: filteredOffers
      };
    }).filter(section => section.offers.length > 0);
  }, [filters]);

  // Get favorite offers
  const favoriteOffers = useMemo(() => {
    const allOffers = offersPageData.sections.flatMap(section => section.offers);
    return allOffers.filter(offer => favorites.includes(offer.id));
  }, [favorites]);

  // Toggle favorite
  const toggleFavorite = (offerId: string) => {
    setFavorites(prev =>
      prev.includes(offerId)
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  // Clear all favorites
  const clearFavorites = () => {
    setFavorites([]);
  };

  // Update filters
  const updateFilters = (newFilters: Partial<OfferFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({});
  };

  // Get offers by category
  const getOffersByCategory = (category: string): Offer[] => {
    const allOffers = offersPageData.sections.flatMap(section => section.offers);
    return allOffers.filter(offer =>
      offer.category.toLowerCase() === category.toLowerCase()
    );
  };

  // Get trending offers
  const getTrendingOffers = (): Offer[] => {
    if (USE_REAL_API && apiData.trendingOffers.length > 0) {
      return apiData.trendingOffers;
    }
    const allOffers = offersPageData.sections.flatMap(section => section.offers);
    return allOffers.filter(offer => offer.isTrending);
  };

  // Get new offers
  const getNewOffers = (): Offer[] => {
    const allOffers = offersPageData.sections.flatMap(section => section.offers);
    return allOffers.filter(offer => offer.isNew);
  };

  // Get best sellers
  const getBestSellers = (): Offer[] => {
    const allOffers = offersPageData.sections.flatMap(section => section.offers);
    return allOffers.filter(offer => offer.isBestSeller);
  };

  // Search offers
  const searchOffers = (query: string): Offer[] => {
    if (!query.trim()) return [];

    const allOffers = offersPageData.sections.flatMap(section => section.offers);
    const lowercaseQuery = query.toLowerCase();

    return allOffers.filter(offer =>
      offer.title.toLowerCase().includes(lowercaseQuery) ||
      offer.category.toLowerCase().includes(lowercaseQuery) ||
      offer.store.name.toLowerCase().includes(lowercaseQuery)
    );
  };

  // Refresh data
  const refreshData = useCallback(() => {
    if (USE_REAL_API) {
      fetchOffersData();
    }
  }, [fetchOffersData]);

  return {
    // Data
    offersData: offersPageData,
    sections: filteredSections,
    favorites,
    favoriteOffers,
    filters,
    loading,
    error,

    // API Data (new)
    apiData,
    isUsingRealApi: USE_REAL_API,

    // Actions
    toggleFavorite,
    clearFavorites,
    updateFilters,
    resetFilters,
    refreshData,

    // Utilities
    getOffersByCategory,
    getTrendingOffers,
    getNewOffers,
    getBestSellers,
    searchOffers,
  };
}
