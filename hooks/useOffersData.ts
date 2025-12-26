import { useState, useEffect, useMemo, useCallback } from 'react';
import { Offer, OfferFilters, OfferSection } from '@/types/offers.types';
import { offersPageData } from '@/data/offersData';
import realOffersApi from '@/services/realOffersApi';

// Feature flag - set to true to use real API
const USE_REAL_API = process.env.EXPO_PUBLIC_MOCK_API !== 'true';

// Helper function to transform offers to ensure proper store structure
const transformOfferWithStore = (offer: any) => {
  if (!offer) return offer;

  // If store is already properly structured, return as-is
  if (offer.store && typeof offer.store === 'object' && offer.store.name) {
    return {
      ...offer,
      id: offer._id || offer.id,
    };
  }

  // Transform flat structure to nested store structure
  return {
    ...offer,
    id: offer._id || offer.id,
    store: {
      id: offer.storeId || offer.store?.id || offer.store?._id || '',
      name: offer.storeName || offer.store?.name || 'Store',
      logo: offer.storeLogo || offer.store?.logo || offer.image || '',
      rating: offer.storeRating || offer.store?.rating,
      verified: offer.storeVerified || offer.store?.verified,
    },
  };
};

// Helper to transform an array of offers
const transformOffersArray = (offers: any[]): any[] => {
  if (!Array.isArray(offers)) return [];
  return offers.map(transformOfferWithStore);
};

// Helper to transform flash sales to LightningDeal format (has stores[] array instead of store object)
const transformFlashSaleToLightningDeal = (flashSale: any) => {
  if (!flashSale) return flashSale;

  return {
    id: flashSale._id || flashSale.id,
    title: flashSale.title,
    subtitle: flashSale.description || '',
    image: flashSale.image,
    store: {
      id: flashSale.stores?.[0]?._id || flashSale.stores?.[0]?.id || '',
      name: flashSale.stores?.[0]?.name || 'Store',
      logo: flashSale.stores?.[0]?.logo || flashSale.image,
    },
    originalPrice: flashSale.originalPrice,
    discountedPrice: flashSale.flashSalePrice,
    discountPercentage: flashSale.discountPercentage,
    cashbackPercentage: flashSale.cashbackPercentage || 0,
    totalQuantity: flashSale.maxQuantity || 100,
    claimedQuantity: flashSale.soldQuantity || 0,
    endTime: flashSale.endTime,
    promoCode: flashSale.promoCode,
  };
};

// Transform flash sales array
const transformFlashSalesArray = (flashSales: any[]): any[] => {
  if (!Array.isArray(flashSales)) return [];
  return flashSales.map(transformFlashSaleToLightningDeal);
};

interface OffersPageApiData {
  // Existing sections
  lightningDeals: any[];
  nearbyOffers: any[];
  trendingOffers: any[];
  friendsRedeemed: any[];

  // Discount buckets (real-time counts)
  discountBuckets: any[];

  // Cashback tab
  hotspots: any[];
  doubleCashback: any[];
  coinDrops: any[];
  uploadBillStores: any[];
  bankOffers: any[];
  superCashbackStores: any[];

  // Exclusive tab
  exclusiveZones: any[];
  specialProfiles: any[];
  loyaltyMilestones: any[];

  // Offer types
  bogoOffers: any[];
  saleOffers: any[];
  freeDeliveryOffers: any[];

  // Additional sections (previously using dummy data)
  todaysOffers: any[];
  aiRecommendedOffers: any[];
  lastChanceOffers: any[];
  newTodayOffers: any[];
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
    discountBuckets: [],
    hotspots: [],
    doubleCashback: [],
    coinDrops: [],
    uploadBillStores: [],
    bankOffers: [],
    superCashbackStores: [],
    exclusiveZones: [],
    specialProfiles: [],
    loyaltyMilestones: [],
    bogoOffers: [],
    saleOffers: [],
    freeDeliveryOffers: [],
    todaysOffers: [],
    aiRecommendedOffers: [],
    lastChanceOffers: [],
    newTodayOffers: [],
  });

  // Fetch data from real APIs
  const fetchOffersData = useCallback(async () => {
    if (!USE_REAL_API) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [
        flashSalesRes,
        discountBucketsRes,
        trendingRes,
        nearbyRes,
        hotspotsRes,
        doubleCashbackRes,
        coinDropsRes,
        uploadBillRes,
        bankOffersRes,
        superCashbackStoresRes,
        exclusiveZonesRes,
        specialProfilesRes,
        loyaltyRes,
        bogoRes,
        saleRes,
        freeDeliveryRes,
        friendsRedeemedRes,
        // New API calls for remaining sections
        todaysOffersRes,
        aiRecommendedRes,
        lastChanceRes,
        newTodayRes,
      ] = await Promise.allSettled([
        realOffersApi.getFlashSales(10),
        realOffersApi.getDiscountBuckets(),
        realOffersApi.getTrendingOffers(10),
        realOffersApi.getNearbyOffers({ lat: 12.9716, lng: 77.5946, limit: 10 }), // Default to Bangalore
        realOffersApi.getHotspots({ limit: 10 }),
        realOffersApi.getDoubleCashbackCampaigns(5),
        realOffersApi.getCoinDrops({ limit: 20 }),
        realOffersApi.getUploadBillStores({ limit: 20 }),
        realOffersApi.getBankOffers({ limit: 10 }),
        realOffersApi.getSuperCashbackStores({ limit: 20 }),
        realOffersApi.getExclusiveZones(),
        realOffersApi.getSpecialProfiles(),
        realOffersApi.getLoyaltyMilestones(),
        realOffersApi.getBOGOOffers({ limit: 10 }),
        realOffersApi.getSaleOffers({ limit: 10 }),
        realOffersApi.getFreeDeliveryOffers(10),
        realOffersApi.getFriendsRedeemed(10),
        // New API calls for remaining sections
        realOffersApi.getTodaysOffers(10),
        realOffersApi.getRecommendedOffers(10),
        realOffersApi.getExpiringSoonOffers(10),
        realOffersApi.getNewArrivals(10),
      ]);

      // Extract data safely
      const extractData = (result: PromiseSettledResult<any>) => {
        if (result.status === 'fulfilled' && result.value?.success && result.value?.data) {
          return result.value.data;
        }
        return [];
      };

      const flashSalesData = extractData(flashSalesRes);
      const todaysData = extractData(todaysOffersRes);
      const aiRecommendedData = extractData(aiRecommendedRes);
      const lastChanceData = extractData(lastChanceRes);
      const newTodayData = extractData(newTodayRes);
      const friendsRedeemedData = extractData(friendsRedeemedRes);

      // Transform friends redeemed data to match frontend expected structure
      const transformedFriendsRedeemed = friendsRedeemedData.map((item: any) => ({
        id: item._id || item.id,
        friendId: item.friendId,
        friendName: item.friendName,
        friendAvatar: item.friendAvatar,
        offer: {
          id: item.offerId || item._id,
          title: item.offerTitle,
          image: item.offerImage,
          store: item.storeName,
          savings: item.savings || 0,
          cashbackPercentage: item.cashbackPercentage || 0,
        },
        redeemedAt: item.redeemedAt,
      }));

      console.log('⚡ [useOffersData] Lightning Deals from API:', flashSalesData.length);
      console.log('📅 [useOffersData] Today\'s Offers from API:', todaysData.length);
      console.log('🤖 [useOffersData] AI Recommended from API:', aiRecommendedData.length);
      console.log('⏰ [useOffersData] Last Chance from API:', lastChanceData.length);
      console.log('🆕 [useOffersData] New Today from API:', newTodayData.length);
      console.log('👥 [useOffersData] Friends Redeemed from API:', transformedFriendsRedeemed.length);

      const superCashbackData = extractData(superCashbackStoresRes);
      console.log('🔥 [useOffersData] Super Cashback Stores from API:', superCashbackData.length);

      setApiData({
        lightningDeals: flashSalesData, // Real flash sales from FlashSale model (transformed in OffersPageContent)
        discountBuckets: extractData(discountBucketsRes),
        // Transform all offer arrays to ensure proper store structure
        trendingOffers: transformOffersArray(extractData(trendingRes)),
        nearbyOffers: transformOffersArray(extractData(nearbyRes)),
        friendsRedeemed: transformedFriendsRedeemed,
        hotspots: extractData(hotspotsRes),
        doubleCashback: extractData(doubleCashbackRes),
        coinDrops: extractData(coinDropsRes),
        uploadBillStores: extractData(uploadBillRes),
        bankOffers: extractData(bankOffersRes),
        superCashbackStores: superCashbackData,
        exclusiveZones: extractData(exclusiveZonesRes),
        specialProfiles: extractData(specialProfilesRes),
        loyaltyMilestones: extractData(loyaltyRes),
        bogoOffers: transformOffersArray(extractData(bogoRes)),
        saleOffers: transformOffersArray(extractData(saleRes)),
        freeDeliveryOffers: transformOffersArray(extractData(freeDeliveryRes)),
        // New sections (previously using dummy data)
        todaysOffers: transformOffersArray(todaysData),
        aiRecommendedOffers: transformOffersArray(aiRecommendedData),
        lastChanceOffers: transformFlashSalesArray(lastChanceData), // Flash sales need special transformation
        newTodayOffers: transformOffersArray(newTodayData),
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
