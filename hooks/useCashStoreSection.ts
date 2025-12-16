/**
 * useCashStoreSection Hook
 *
 * Custom hook for managing cash store section data and state
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Clipboard } from 'react-native';
import { useRouter } from 'expo-router';
import cashbackService, { CashbackSummary } from '../services/cashbackApi';
import realVouchersApi from '../services/realVouchersApi';
import realOffersApi, { Offer } from '../services/realOffersApi';
import couponService, { Coupon } from '../services/couponApi';
import {
  CashStoreBrand,
  TrendingDeal,
  GiftCardBrand,
  CashStoreCoupon,
  HighCashbackDeal,
  TravelDeal,
  CashbackActivity,
  CashStoreHeroBanner,
  CashStoreQuickAction,
  UseCashStoreSectionReturn,
  getTimeRemainingMs,
} from '../types/cash-store.types';

interface UseCashStoreSectionOptions {
  autoFetch?: boolean;
  cacheTimeout?: number;
}

const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Default quick actions
const DEFAULT_QUICK_ACTIONS: CashStoreQuickAction[] = [
  {
    id: 'buy-coupons',
    title: 'Buy coupons & save instantly',
    subtitle: 'Get extra cashback on gift cards',
    icon: 'pricetag',
    backgroundColor: '#FF9F1C',
    gradientColors: ['#FF9F1C', '#F77F00'],
    action: 'buy-coupons',
  },
  {
    id: 'extra-coins',
    title: 'Extra ReZ Coins on brands',
    subtitle: 'Double rewards on selected stores',
    icon: 'wallet',
    backgroundColor: '#9B59B6',
    gradientColors: ['#9B59B6', '#8E44AD'],
    action: 'extra-coins',
  },
];

// Default hero banners
const DEFAULT_HERO_BANNERS: CashStoreHeroBanner[] = [
  {
    _id: 'hero-1',
    id: 'hero-1',
    title: 'Earn cashback on every online order',
    subtitle: 'Shop from 1000+ brands and get instant rewards',
    backgroundColor: '#FF9F1C',
    gradientColors: ['#FF9F1C', '#F77F00'],
    textColor: '#FFFFFF',
    ctaText: 'Start Shopping',
    ctaAction: 'shop',
    badge: 'Hot Deal',
    priority: 1,
    isActive: true,
  },
];

// Travel deals data
const DEFAULT_TRAVEL_DEALS: TravelDeal[] = [
  {
    _id: 'travel-flights',
    id: 'travel-flights',
    category: 'flights',
    title: 'Flights',
    cashbackRate: 5,
    icon: 'airplane',
    backgroundColor: '#667EEA',
    gradientColors: ['#667EEA', '#764BA2'],
  },
  {
    _id: 'travel-hotels',
    id: 'travel-hotels',
    category: 'hotels',
    title: 'Hotels',
    cashbackRate: 8,
    icon: 'bed',
    backgroundColor: '#F093FB',
    gradientColors: ['#F093FB', '#F5576C'],
  },
  {
    _id: 'travel-cabs',
    id: 'travel-cabs',
    category: 'cabs',
    title: 'Cabs',
    cashbackRate: 3,
    icon: 'car',
    backgroundColor: '#FFE259',
    gradientColors: ['#FFE259', '#FFA751'],
  },
  {
    _id: 'travel-experiences',
    id: 'travel-experiences',
    category: 'experiences',
    title: 'Experiences',
    cashbackRate: 6,
    icon: 'compass',
    backgroundColor: '#A18CD1',
    gradientColors: ['#A18CD1', '#FBC2EB'],
  },
];

export function useCashStoreSection(
  options: UseCashStoreSectionOptions = {}
): UseCashStoreSectionReturn {
  const { autoFetch = true, cacheTimeout = CACHE_TIMEOUT } = options;
  const router = useRouter();

  // State
  const [cashbackSummary, setCashbackSummary] = useState<{
    total: number;
    pending: number;
    confirmed: number;
    available: number;
  }>({
    total: 0,
    pending: 0,
    confirmed: 0,
    available: 0,
  });
  const [heroBanners, setHeroBanners] = useState<CashStoreHeroBanner[]>(DEFAULT_HERO_BANNERS);
  const [quickActions, setQuickActions] = useState<CashStoreQuickAction[]>(DEFAULT_QUICK_ACTIONS);
  const [topBrands, setTopBrands] = useState<CashStoreBrand[]>([]);
  const [trendingDeals, setTrendingDeals] = useState<TrendingDeal[]>([]);
  const [giftCardBrands, setGiftCardBrands] = useState<GiftCardBrand[]>([]);
  const [couponCodes, setCouponCodes] = useState<CashStoreCoupon[]>([]);
  const [highCashbackDeals, setHighCashbackDeals] = useState<HighCashbackDeal[]>([]);
  const [travelDeals, setTravelDeals] = useState<TravelDeal[]>(DEFAULT_TRAVEL_DEALS);
  const [recentActivity, setRecentActivity] = useState<CashbackActivity[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for caching
  const lastFetchRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  /**
   * Transform offer to trending deal
   */
  const transformOfferToTrendingDeal = useCallback((offer: Offer): TrendingDeal => {
    return {
      _id: offer._id,
      id: offer._id,
      brand: {
        id: offer.store?.id || '',
        name: offer.store?.name || offer.title,
        logo: offer.store?.logo || offer.image,
      },
      category: offer.category,
      cashbackRate: offer.cashbackPercentage,
      bonusCoins: offer.metadata?.isTrending ? 50 : undefined,
      validUntil: offer.validity.endDate,
      timeRemaining: getTimeRemainingMs(offer.validity.endDate),
      badge: offer.metadata?.isTrending ? 'trending' : offer.metadata?.isNew ? 'new' : undefined,
      isFlashSale: offer.metadata?.flashSale?.isActive || false,
      priority: offer.metadata?.priority || 0,
    };
  }, []);

  /**
   * Transform offer to high cashback deal
   */
  const transformOfferToHighCashbackDeal = useCallback((offer: Offer): HighCashbackDeal => {
    return {
      _id: offer._id,
      id: offer._id,
      brand: {
        id: offer.store?.id || '',
        name: offer.store?.name || offer.title,
        logo: offer.store?.logo || offer.image,
      },
      title: offer.title,
      subtitle: offer.subtitle,
      cashbackRate: offer.cashbackPercentage,
      bonusCoins: offer.metadata?.isBestSeller ? 75 : undefined,
      validUntil: offer.validity.endDate,
      badge: offer.metadata?.isBestSeller ? 'best-deal' : offer.cashbackPercentage >= 15 ? 'hot' : undefined,
    };
  }, []);

  /**
   * Transform coupon to cash store coupon
   */
  const transformCouponToCashStoreCoupon = useCallback((coupon: Coupon): CashStoreCoupon => {
    return {
      _id: coupon._id,
      id: coupon._id,
      code: coupon.couponCode,
      brand: {
        id: coupon.applicableTo?.stores?.[0] || '',
        name: coupon.title.split(' - ')[0] || coupon.title,
        logo: coupon.imageUrl,
      },
      title: coupon.title,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      maxDiscountCap: coupon.maxDiscountCap,
      validUntil: coupon.validTo,
      isVerified: true, // Featured coupons are verified
      isExclusive: coupon.tags?.includes('rez-exclusive') || false,
      usageCount: coupon.usageCount,
      successRate: 95, // Default success rate for verified coupons
      tags: coupon.tags,
    };
  }, []);

  /**
   * Fetch cashback summary
   */
  const fetchCashbackSummary = useCallback(async () => {
    try {
      const response = await cashbackService.getCashbackSummary();
      if (response.success && response.data && isMountedRef.current) {
        const summary = response.data;
        setCashbackSummary({
          total: summary.totalEarned || 0,
          pending: summary.pending || 0,
          confirmed: summary.credited || 0,
          available: summary.credited || 0, // Available = credited
        });
      }
    } catch (err) {
      console.error('[Cash Store] Error fetching cashback summary:', err);
    }
  }, []);

  /**
   * Fetch top brands (using trending offers as source)
   */
  const fetchTopBrands = useCallback(async () => {
    try {
      // Get offers and extract unique brands
      const response = await realOffersApi.getOffers({
        featured: true,
        limit: 20,
      });

      if (response.success && response.data && isMountedRef.current) {
        const offers = response.data.items || [];
        const brandsMap = new Map<string, CashStoreBrand>();

        offers.forEach((offer: Offer) => {
          if (offer.store && !brandsMap.has(offer.store.id)) {
            brandsMap.set(offer.store.id, {
              _id: offer.store.id,
              id: offer.store.id,
              name: offer.store.name,
              slug: offer.store.name.toLowerCase().replace(/\s+/g, '-'),
              logo: offer.store.logo || offer.image,
              category: offer.category as any,
              brandType: 'hybrid',
              cashbackRate: offer.cashbackPercentage,
              rating: offer.store.rating,
              isActive: true,
              isFeatured: offer.metadata?.featured || false,
              isTopBrand: true,
              createdAt: offer.createdAt,
              updatedAt: offer.updatedAt,
            });
          }
        });

        setTopBrands(Array.from(brandsMap.values()).slice(0, 9)); // Limit to 9 for 3x3 grid
      }
    } catch (err) {
      console.error('[Cash Store] Error fetching top brands:', err);
    }
  }, []);

  /**
   * Fetch trending deals
   */
  const fetchTrendingDeals = useCallback(async () => {
    try {
      const response = await realOffersApi.getOffers({
        trending: true,
        limit: 10,
      });

      if (response.success && response.data && isMountedRef.current) {
        const offers = response.data.items || [];
        setTrendingDeals(offers.map(transformOfferToTrendingDeal));
      }
    } catch (err) {
      console.error('[Cash Store] Error fetching trending deals:', err);
    }
  }, [transformOfferToTrendingDeal]);

  /**
   * Fetch gift card brands
   */
  const fetchGiftCardBrands = useCallback(async () => {
    try {
      const response = await realVouchersApi.getVoucherBrands({
        featured: true,
        limit: 10,
      });

      if (response.success && response.data && isMountedRef.current) {
        const brands = response.data || [];
        setGiftCardBrands(
          brands.map((brand: any) => ({
            _id: brand._id,
            id: brand._id,
            name: brand.name,
            logo: brand.logo,
            backgroundColor: brand.backgroundColor,
            cashbackRate: brand.cashbackRate,
            denominations: brand.denominations,
            category: brand.category,
            rating: brand.rating,
            ratingCount: brand.ratingCount,
            isFeatured: brand.isFeatured,
            isNewlyAdded: brand.isNewlyAdded,
            termsAndConditions: brand.termsAndConditions,
            purchaseCount: brand.purchaseCount,
          }))
        );
      }
    } catch (err) {
      console.error('[Cash Store] Error fetching gift card brands:', err);
    }
  }, []);

  /**
   * Fetch coupon codes
   */
  const fetchCouponCodes = useCallback(async () => {
    try {
      const response = await couponService.getFeaturedCoupons();

      if (response.success && response.data && isMountedRef.current) {
        const coupons = response.data.coupons || [];
        setCouponCodes(coupons.map(transformCouponToCashStoreCoupon));
      }
    } catch (err) {
      console.error('[Cash Store] Error fetching coupon codes:', err);
    }
  }, [transformCouponToCashStoreCoupon]);

  /**
   * Fetch high cashback deals
   */
  const fetchHighCashbackDeals = useCallback(async () => {
    try {
      // Use featured offers with high cashback instead of unsupported query params
      const response = await realOffersApi.getOffers({
        featured: true,
        limit: 20,
      });

      if (response.success && response.data && isMountedRef.current) {
        const offers = response.data.items || [];
        // Filter for high cashback (10%+) and sort by cashback percentage
        const highCashbackOffers = offers
          .filter((offer: Offer) => offer.cashbackPercentage >= 10)
          .sort((a: Offer, b: Offer) => b.cashbackPercentage - a.cashbackPercentage)
          .slice(0, 10);
        setHighCashbackDeals(highCashbackOffers.map(transformOfferToHighCashbackDeal));
      }
    } catch (err) {
      console.error('[Cash Store] Error fetching high cashback deals:', err);
    }
  }, [transformOfferToHighCashbackDeal]);

  /**
   * Fetch recent activity
   */
  const fetchRecentActivity = useCallback(async () => {
    try {
      const response = await cashbackService.getCashbackHistory({
        limit: 5,
      });

      if (response.success && response.data && isMountedRef.current) {
        const cashbacks = response.data.cashbacks || [];
        setRecentActivity(
          cashbacks.map((cb: any) => ({
            _id: cb._id,
            id: cb._id,
            brand: {
              id: cb.metadata?.storeId || '',
              name: cb.metadata?.storeName || 'ReZ Store',
              logo: '', // Would need store lookup
            },
            orderNumber: cb.order?.orderNumber,
            purchaseAmount: cb.metadata?.orderAmount || 0,
            cashbackAmount: cb.amount,
            status: cb.status === 'credited' ? 'confirmed' : cb.status,
            date: cb.earnedDate,
            source: cb.source,
          }))
        );
      }
    } catch (err) {
      console.error('[Cash Store] Error fetching recent activity:', err);
    }
  }, []);

  /**
   * Fetch all cash store data
   */
  const fetchCashStoreData = useCallback(
    async (forceRefresh: boolean = false) => {
      // Check cache
      const now = Date.now();
      if (!forceRefresh && lastFetchRef.current > 0 && now - lastFetchRef.current < cacheTimeout) {
        return; // Use cached data
      }

      try {
        if (!forceRefresh) {
          setIsLoading(true);
        }
        setError(null);

        // Fetch all data in parallel
        await Promise.all([
          fetchCashbackSummary(),
          fetchTopBrands(),
          fetchTrendingDeals(),
          fetchGiftCardBrands(),
          fetchCouponCodes(),
          fetchHighCashbackDeals(),
          fetchRecentActivity(),
        ]);

        if (isMountedRef.current) {
          lastFetchRef.current = now;
          setIsInitialLoad(false);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to load Cash Store data');
          console.error('[Cash Store] Error fetching data:', err);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [
      cacheTimeout,
      fetchCashbackSummary,
      fetchTopBrands,
      fetchTrendingDeals,
      fetchGiftCardBrands,
      fetchCouponCodes,
      fetchHighCashbackDeals,
      fetchRecentActivity,
    ]
  );

  /**
   * Refresh data (pull-to-refresh)
   */
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchCashStoreData(true);
  }, [fetchCashStoreData]);

  /**
   * Track brand click
   */
  const trackBrandClick = useCallback((brandId: string) => {
    // Fire and forget analytics
    console.log('[Cash Store] Brand clicked:', brandId);
  }, []);

  /**
   * Copy coupon code to clipboard
   */
  const copyCouponCode = useCallback(async (code: string): Promise<boolean> => {
    try {
      await Clipboard.setString(code);
      Alert.alert('Copied!', `Coupon code "${code}" copied to clipboard`);
      return true;
    } catch (err) {
      console.error('[Cash Store] Error copying coupon code:', err);
      return false;
    }
  }, []);

  /**
   * Navigate to brand
   */
  const navigateToBrand = useCallback(
    (brand: CashStoreBrand) => {
      trackBrandClick(brand.id);

      if (brand.brandType === 'in-app' && brand.storeId) {
        router.push(`/MainStorePage?storeId=${brand.storeId}` as any);
      } else if (brand.externalUrl) {
        // For external affiliates, we would open a WebView or external browser
        // For now, just log it
        console.log('[Cash Store] Navigate to external:', brand.externalUrl);
      }
    },
    [router, trackBrandClick]
  );

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true;

    if (autoFetch) {
      fetchCashStoreData();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [autoFetch, fetchCashStoreData]);

  return {
    // Data
    cashbackSummary,
    heroBanners,
    quickActions,
    topBrands,
    trendingDeals,
    giftCardBrands,
    couponCodes,
    highCashbackDeals,
    travelDeals,
    recentActivity,

    // Loading states
    isLoading,
    isRefreshing,
    isInitialLoad,

    // Error state
    error,

    // Actions
    refresh,
    trackBrandClick,
    copyCouponCode,
    navigateToBrand,
  };
}

export default useCashStoreSection;
