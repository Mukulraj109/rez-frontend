/**
 * Hook for Category Page Data - Production Ready
 * Fetches all category page data from backend APIs
 * Falls back to dummy data if API fails
 */

import { useState, useEffect, useCallback } from 'react';
import categoriesApi, {
  Category,
  CategoryVibe,
  CategoryOccasion,
  CategoryHashtag
} from '@/services/categoriesApi';
import { storesApi } from '@/services/storesApi';
import productsApi from '@/services/productsApi';

// Import dummy data as fallback
import { fashionCategoryData } from '@/data/category/fashionCategoryData';
import { foodCategoryData } from '@/data/category/foodCategoryData';
import { beautyCategoryData } from '@/data/category/beautyCategoryData';
import { groceryCategoryData } from '@/data/category/groceryCategoryData';
import { healthcareCategoryData } from '@/data/category/healthcareCategoryData';
import { educationCategoryData } from '@/data/category/educationCategoryData';
import { fitnessCategoryData } from '@/data/category/fitnessCategoryData';
import { homeServicesCategoryData } from '@/data/category/homeServicesCategoryData';
import { travelCategoryData } from '@/data/category/travelCategoryData';
import { entertainmentCategoryData } from '@/data/category/entertainmentCategoryData';
import { financialCategoryData } from '@/data/category/financialCategoryData';

// Subcategory interface for grid display
export interface SubcategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  cashback?: number;
  itemCount?: number;
  image?: string;
}

// Store interface for category page
export interface CategoryStoreItem {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  rating: number;
  cashback?: number;
  distance?: string;
  is60Min?: boolean;
  hasPickup?: boolean;
  categories?: string[];
}

// Product interface for category page
export interface CategoryProductItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  cashback?: number;
  storeName?: string;
}

// UGC Post interface
export interface UGCPostItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  image: string;
  hashtag: string;
  likes: number;
  comments: number;
  coinsEarned: number;
  isVerified: boolean;
}

// Exclusive Offer interface
export interface ExclusiveOfferItem {
  id: string;
  title: string;
  icon: string;
  discount: string;
  description: string;
  color: string;
  gradient?: string;
}

interface UseCategoryPageDataResult {
  // Category Info
  category: Category | null;
  categoryName: string;
  categorySlug: string;

  // Subcategories (for Browse Grid)
  subcategories: SubcategoryItem[];

  // Category Page Data
  vibes: CategoryVibe[];
  occasions: CategoryOccasion[];
  hashtags: CategoryHashtag[];

  // Stores & Products
  stores: CategoryStoreItem[];
  products: CategoryProductItem[];

  // UGC Data
  ugcPosts: UGCPostItem[];

  // Exclusive Offers
  exclusiveOffers: ExclusiveOfferItem[];

  // AI Search Data
  aiSuggestions: any[];
  aiFilterChips: any[];
  aiPlaceholders: string[];

  // Loading & Error States
  isLoading: boolean;
  isLoadingCategory: boolean;
  isLoadingStores: boolean;
  isLoadingProducts: boolean;
  error: string | null;

  // Actions
  refetch: () => Promise<void>;
}

// Map slug to dummy data
const getDummyData = (slug: string): any => {
  const dataMap: Record<string, any> = {
    'fashion': fashionCategoryData,
    'food-dining': foodCategoryData,
    'beauty-wellness': beautyCategoryData,
    'grocery-essentials': groceryCategoryData,
    'healthcare': healthcareCategoryData,
    'education-learning': educationCategoryData,
    'fitness-sports': fitnessCategoryData,
    'home-services': homeServicesCategoryData,
    'travel': travelCategoryData,
    'entertainment': entertainmentCategoryData,
    'financial-services': financialCategoryData,
  };
  return dataMap[slug] || fashionCategoryData;
};

export const useCategoryPageData = (slug: string): UseCategoryPageDataResult => {
  // Category state
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([]);
  const [vibes, setVibes] = useState<CategoryVibe[]>([]);
  const [occasions, setOccasions] = useState<CategoryOccasion[]>([]);
  const [hashtags, setHashtags] = useState<CategoryHashtag[]>([]);

  // Stores & Products
  const [stores, setStores] = useState<CategoryStoreItem[]>([]);
  const [products, setProducts] = useState<CategoryProductItem[]>([]);

  // UGC & Offers (from dummy data for now)
  const [ugcPosts, setUgcPosts] = useState<UGCPostItem[]>([]);
  const [exclusiveOffers, setExclusiveOffers] = useState<ExclusiveOfferItem[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiFilterChips, setAiFilterChips] = useState<any[]>([]);
  const [aiPlaceholders, setAiPlaceholders] = useState<string[]>([]);

  // Loading states
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch category data with vibes, occasions, hashtags
   */
  const fetchCategoryData = useCallback(async () => {
    if (!slug) return;

    try {
      setIsLoadingCategory(true);
      setError(null);

      console.log(`[CATEGORY PAGE] Fetching category data for: ${slug}`);
      const response = await categoriesApi.getCategoryPageData(slug);

      if (response.success && response.data) {
        const categoryData = response.data;
        setCategory(categoryData);

        // Extract subcategories from childCategories
        if (categoryData.childCategories && Array.isArray(categoryData.childCategories)) {
          // Fetch real counts for food-dining
          let cuisineCounts: any[] = [];
          if (slug === 'food-dining') {
            try {
              const countResponse = await storesApi.getCuisineCounts();
              if (countResponse.success && countResponse.data?.cuisines) {
                cuisineCounts = countResponse.data.cuisines;
                console.log(`[CATEGORY PAGE] Got ${cuisineCounts.length} cuisine counts to merge`);
              }
            } catch (e) {
              console.error('[CATEGORY PAGE] Failed to fetch cuisine counts:', e);
            }
          }

          // Map cuisine names to icons and colors for fallback
          const cuisineIconMap: Record<string, { icon: string; color: string }> = {
            'pizza': { icon: '🍕', color: '#EF4444' },
            'biryani': { icon: '🍗', color: '#D946EF' },
            'burgers': { icon: '🍔', color: '#F97316' },
            'chinese': { icon: '🥡', color: '#3B82F6' },
            'desserts': { icon: '🍦', color: '#10B981' },
            'healthy': { icon: '🥗', color: '#22C55E' },
            'indian': { icon: '🍛', color: '#F59E0B' },
            'italian': { icon: '🍝', color: '#EF4444' },
            'thai': { icon: '🍜', color: '#EC4899' },
            'mexican': { icon: '🌮', color: '#F97316' },
            'south indian': { icon: '🥘', color: '#8B5CF6' },
            'north indian': { icon: '🍛', color: '#F59E0B' },
            'continental': { icon: '🥩', color: '#6366F1' },
            'japanese': { icon: '🍣', color: '#3B82F6' },
            'street': { icon: '🌮', color: '#F59E0B' },
            'chaat': { icon: '🥘', color: '#F59E0B' },
            'cafe': { icon: '☕', color: '#78350F' },
            'thali': { icon: '🍱', color: '#F59E0B' },
            'ice-cream': { icon: '🍦', color: '#EC4899' },
            'healthy-food': { icon: '🥗', color: '#22C55E' },
          };

          const subs = categoryData.childCategories.map((child: any) => {
            const nameLower = (child.name || '').toLowerCase();
            const slugLower = (child.slug || '').toLowerCase();

            // Find matching cuisine icon/color
            let fallbackIcon = '🍽️';
            let fallbackColor = '#6B7280';
            let matchedCount = 0;

            for (const [key, value] of Object.entries(cuisineIconMap)) {
              if (nameLower.includes(key) || slugLower.includes(key)) {
                fallbackIcon = value.icon;
                fallbackColor = value.color;
                break;
              }
            }

            // Find matching real count if available
            if (cuisineCounts.length > 0) {
              const matchedCuisine = cuisineCounts.find(c =>
                nameLower.includes(c.id) || slugLower.includes(c.id) ||
                c.id.includes(slugLower) || c.name.toLowerCase() === nameLower
              );
              if (matchedCuisine) {
                matchedCount = matchedCuisine.count;
              }
            }

            // Use real count if we found one (and it's greater than 0), otherwise fall back to DB count
            const finalCount = matchedCount > 0 ? matchedCount : (child.productCount || child.storeCount);

            return {
              id: child._id || child.id,
              name: child.name,
              slug: child.slug,
              icon: child.icon || fallbackIcon || '🍽️',
              color: child.metadata?.color || fallbackColor,
              cashback: child.maxCashback,
              itemCount: finalCount,
              image: child.image,
            };
          });
          setSubcategories(subs);
          console.log(`[CATEGORY PAGE] Got ${subs.length} subcategories from API`);
        }

        // Extract vibes, occasions, hashtags from category
        setVibes(categoryData.vibes || []);
        setOccasions(categoryData.occasions || []);
        setHashtags(categoryData.trendingHashtags || []);

        console.log(`[CATEGORY PAGE] Category data loaded: ${categoryData.name}`);
      } else {
        // Fallback to dummy data
        console.log(`[CATEGORY PAGE] API failed, using dummy data for: ${slug}`);
        loadDummyData();
      }
    } catch (err: any) {
      console.error(`[CATEGORY PAGE] Error fetching category:`, err);
      setError(err.message || 'Failed to load category');
      loadDummyData();
    } finally {
      setIsLoadingCategory(false);
    }
  }, [slug]);

  /**
   * Fetch stores by category
   */
  const fetchStores = useCallback(async () => {
    if (!slug) return;

    try {
      setIsLoadingStores(true);

      console.log(`[CATEGORY PAGE] Fetching stores for: ${slug}`);
      const response = await storesApi.getStoresBySubcategorySlug(slug, 10);

      if (response.success && response.data) {
        const storesData = Array.isArray(response.data) ? response.data : [];
        const formattedStores = storesData.map((store: any) => ({
          // Basic fields
          id: store._id || store.id,
          _id: store._id || store.id, // Some components use _id
          name: store.name,
          slug: store.slug,
          logo: store.logo,
          banner: store.banner,
          rating: store.ratings?.average || store.rating || 4.5,
          ratings: store.ratings, // Full ratings object with count
          cashback: store.offers?.cashback || store.cashback,
          distance: store.distance || '2.0 km',
          is60Min: store.deliveryCategories?.fastDelivery || (store.operationalInfo?.deliveryTime ? parseInt(store.operationalInfo.deliveryTime) <= 60 : true),
          hasPickup: store.hasStorePickup || true,
          categories: store.category ? [store.category.name] : [],
          category: store.category, // Full category object
          // Enhanced card fields
          tags: store.tags || [],
          rewardRules: store.rewardRules,
          priceForTwo: store.priceForTwo,
          offers: store.offers,
          operationalInfo: store.operationalInfo,
          deliveryCategories: store.deliveryCategories,
          location: store.location,
          isFeatured: store.isFeatured,
        }));
        setStores(formattedStores);
        console.log(`[CATEGORY PAGE] Got ${formattedStores.length} stores with enhanced fields`);
      }
    } catch (err: any) {
      console.error(`[CATEGORY PAGE] Error fetching stores:`, err);
      // Use dummy stores
      const dummyData = getDummyData(slug);
      if (dummyData.stores) {
        setStores(dummyData.stores);
      }
    } finally {
      setIsLoadingStores(false);
    }
  }, [slug]);

  /**
   * Fetch products by category
   */
  const fetchProducts = useCallback(async () => {
    if (!slug) return;

    try {
      setIsLoadingProducts(true);

      console.log(`[CATEGORY PAGE] Fetching products for: ${slug}`);
      const response = await productsApi.getProductsByCategory(slug, { limit: 10 });

      if (response.success && response.data) {
        const productsData = response.data.products || [];
        const formattedProducts = productsData.map((product: any) => ({
          id: product._id || product.id,
          name: product.name,
          image: product.images?.[0]?.url || product.image,
          price: product.pricing?.salePrice || product.pricing?.basePrice || product.price,
          originalPrice: product.pricing?.basePrice,
          discount: product.pricing?.salePrice
            ? Math.round((1 - product.pricing.salePrice / product.pricing.basePrice) * 100)
            : undefined,
          rating: product.ratings?.average || product.rating,
          cashback: product.cashback?.percentage,
          storeName: product.store?.name,
        }));
        setProducts(formattedProducts);
        console.log(`[CATEGORY PAGE] Got ${formattedProducts.length} products`);
      }
    } catch (err: any) {
      console.error(`[CATEGORY PAGE] Error fetching products:`, err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [slug]);

  /**
   * Load dummy data as fallback
   */
  const loadDummyData = useCallback(() => {
    const dummyData = getDummyData(slug);

    // Map dummy categories to subcategories
    if (dummyData.categories) {
      const subs = dummyData.categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.id,
        icon: cat.icon,
        color: cat.color,
        cashback: cat.cashback,
        itemCount: cat.itemCount,
      }));
      setSubcategories(subs);
    }

    // Set vibes, occasions, hashtags from dummy data
    if (dummyData.vibes) setVibes(dummyData.vibes);
    if (dummyData.occasions) setOccasions(dummyData.occasions);
    if (dummyData.trendingHashtags) setHashtags(dummyData.trendingHashtags);

    // Set UGC posts
    if (dummyData.ugcData?.photos) {
      setUgcPosts(dummyData.ugcData.photos);
    }

    // Set exclusive offers
    if (dummyData.exclusiveOffers) {
      setExclusiveOffers(dummyData.exclusiveOffers);
    }

    // Set AI search data
    if (dummyData.aiSuggestions) setAiSuggestions(dummyData.aiSuggestions);
    if (dummyData.aiFilterChips) setAiFilterChips(dummyData.aiFilterChips);
    if (dummyData.aiPlaceholders) setAiPlaceholders(dummyData.aiPlaceholders);

    // Set stores from dummy
    if (dummyData.stores) {
      setStores(dummyData.stores);
    }

    console.log(`[CATEGORY PAGE] Loaded dummy data for: ${slug}`);
  }, [slug]);

  /**
   * Generate AI suggestions from category data (vibes, occasions, hashtags)
   */
  const generateAISuggestions = useCallback(() => {
    const suggestions: any[] = [];
    const filterChips: any[] = [];
    const placeholders: string[] = [];

    // Generate suggestions from vibes
    vibes.slice(0, 3).forEach((vibe) => {
      suggestions.push({
        id: `vibe-${vibe.id}`,
        text: `Find ${vibe.name.toLowerCase()} options`,
        icon: vibe.icon,
        color: vibe.color,
        type: 'vibe',
      });
    });

    // Generate suggestions from occasions
    occasions.slice(0, 3).forEach((occasion) => {
      suggestions.push({
        id: `occasion-${occasion.id}`,
        text: `${occasion.name} deals`,
        icon: occasion.icon,
        color: occasion.color,
        type: 'occasion',
        discount: occasion.discount,
      });
    });

    // Generate filter chips from hashtags
    hashtags.slice(0, 4).forEach((hashtag) => {
      filterChips.push({
        id: `hashtag-${hashtag.id}`,
        label: hashtag.tag,
        count: hashtag.count,
        color: hashtag.color,
        trending: hashtag.trending,
      });
    });

    // Generate search placeholders
    const categoryName = category?.name || slug.replace(/-/g, ' ');
    placeholders.push(
      `Search in ${categoryName}...`,
      `Find deals on ${categoryName.toLowerCase()}...`,
      vibes.length > 0 ? `Explore ${vibes[0].name.toLowerCase()} options...` : `Discover popular ${categoryName.toLowerCase()}...`,
    );

    setAiSuggestions(suggestions);
    setAiFilterChips(filterChips);
    setAiPlaceholders(placeholders);
  }, [vibes, occasions, hashtags, category, slug]);

  /**
   * Load UGC and other data
   */
  const loadUGCAndOffers = useCallback(() => {
    const dummyData = getDummyData(slug);

    // UGC posts - from dummy for now
    if (dummyData.ugcData?.photos) {
      setUgcPosts(dummyData.ugcData.photos);
    }

    // Exclusive offers - from dummy for now
    if (dummyData.exclusiveOffers) {
      setExclusiveOffers(dummyData.exclusiveOffers);
    }
  }, [slug]);

  /**
   * Refetch all data
   */
  const refetch = useCallback(async () => {
    await Promise.all([
      fetchCategoryData(),
      fetchStores(),
      fetchProducts(),
    ]);
    loadUGCAndOffers();
  }, [fetchCategoryData, fetchStores, fetchProducts, loadUGCAndOffers]);

  // Initial fetch
  useEffect(() => {
    if (slug) {
      fetchCategoryData();
      fetchStores();
      fetchProducts();
      loadUGCAndOffers();
    }
  }, [slug, fetchCategoryData, fetchStores, fetchProducts, loadUGCAndOffers]);

  // Generate AI suggestions when category data changes
  useEffect(() => {
    if (vibes.length > 0 || occasions.length > 0 || hashtags.length > 0) {
      generateAISuggestions();
      console.log(`[CATEGORY PAGE] Generated AI suggestions from ${vibes.length} vibes, ${occasions.length} occasions, ${hashtags.length} hashtags`);
    }
  }, [vibes, occasions, hashtags, generateAISuggestions]);

  // Computed loading state
  const isLoading = isLoadingCategory || isLoadingStores || isLoadingProducts;

  return {
    // Category Info
    category,
    categoryName: category?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    categorySlug: slug,

    // Subcategories
    subcategories,

    // Category Page Data
    vibes,
    occasions,
    hashtags,

    // Stores & Products
    stores,
    products,

    // UGC Data
    ugcPosts,

    // Exclusive Offers
    exclusiveOffers,

    // AI Search Data
    aiSuggestions,
    aiFilterChips,
    aiPlaceholders,

    // Loading & Error States
    isLoading,
    isLoadingCategory,
    isLoadingStores,
    isLoadingProducts,
    error,

    // Actions
    refetch,
  };
};

export default useCategoryPageData;
