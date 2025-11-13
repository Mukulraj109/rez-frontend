// MainStorePage.tsx
import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import {
  MainStoreHeader,
  ProductDisplay,
  TabNavigation,
  TabKey,
  ProductDetails,
  CashbackOffer,
  UGCSection,
} from "./MainStoreSection";
import StoreProductGrid from "@/components/store/StoreProductGrid";
import EmptyProducts from "@/components/store/EmptyProducts";
import ProductsErrorState from "@/components/store/ProductsErrorState";
import PayBillCard from "@/components/store/PayBillCard";
import VouchersSection from "@/components/store/VouchersSection";
import QuickActions from "@/components/store/QuickActions";
import { MainStoreProduct, MainStorePageProps, CartItemFromProduct } from "@/types/mainstore";
import AboutModal from "@/components/AboutModal";
import WalkInDealsModal from "@/components/WalkInDealsModal";
import ReviewModal from "@/components/ReviewModal";
import FilterModal, { FilterState } from "@/components/search/FilterModal";
import SortModal from "@/components/search/SortModal";
import PromotionsBanner from "@/components/store/PromotionsBanner";
import { mockReviews, mockRatingBreakdown, mockReviewStats } from "@/utils/mock-reviews-data";
import reviewsApi from "@/services/reviewsApi";
import storesApi from "@/services/storesApi";
import productsApi from "@/services/productsApi";
import { ProductItem } from "@/types/homepage.types";
import { detectStoreType, getStoreFeatures, shouldShowPayBill, StoreType } from "@/utils/storeFeatures";
import { PromotionBanner as PromotionBannerType } from "@/types/promotions.types";
import { offersApi } from "@/services/offersApi";

interface DynamicStoreData {
  id: string;
  name: string;
  title: string;
  description?: string;
  image?: string;
  logo?: string;
  banner?: string;
  rating: number;
  ratingCount: number;
  category?: string;
  categorySlug?: string;
  bookingType?: 'RESTAURANT' | 'SERVICE' | 'CONSULTATION' | 'RETAIL' | 'HYBRID';
  hasMenu?: boolean;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    coordinates?: [number, number];
    deliveryRadius?: number;
    landmark?: string;
    fullAddress?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    whatsapp?: string;
  };
  operationalInfo?: {
    hours?: {
      [key: string]: { open: string; close: string; closed?: boolean };
    };
    deliveryTime?: string;
    minimumOrder?: number;
    deliveryFee?: number;
    freeDeliveryAbove?: number;
    acceptsWalletPayment?: boolean;
    paymentMethods?: string[];
  };
  deliveryTime?: string;
  minimumOrder?: number;
  deliveryFee?: number;
  freeDeliveryAbove?: number;
  acceptsWalletPayment?: boolean;
  paymentMethods?: string[];
  cashback?: {
    percentage: number;
    minOrder: number;
    maxCashback: number;
    isPartner?: boolean;
    partnerLevel?: string;
  };
  discount?: {
    percentage: number;
    minOrder: number;
  };
  videos?: any[];
  tags?: string[];
  distance?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isVerified?: boolean;
  deliveryCategories?: any;
  section?: string;
  [key: string]: any;
}

// New interface for backend store data
interface BackendStoreData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  videos?: {
    url: string;
    thumbnail?: string;
    title?: string;
    duration?: number;
    uploadedAt?: Date;
  }[];
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  location: {
    address: string;
    city: string;
    state?: string;
    pincode?: string;
    coordinates?: [number, number];
    deliveryRadius?: number;
    landmark?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    whatsapp?: string;
  };
  ratings: {
    average: number;
    count: number;
    distribution?: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  offers?: {
    cashback?: number;
    minOrderAmount?: number;
    maxCashback?: number;
    isPartner?: boolean;
    partnerLevel?: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
  operationalInfo: {
    hours?: {
      monday?: { open: string; close: string; closed?: boolean };
      tuesday?: { open: string; close: string; closed?: boolean };
      wednesday?: { open: string; close: string; closed?: boolean };
      thursday?: { open: string; close: string; closed?: boolean };
      friday?: { open: string; close: string; closed?: boolean };
      saturday?: { open: string; close: string; closed?: boolean };
      sunday?: { open: string; close: string; closed?: boolean };
    };
    deliveryTime?: string;
    minimumOrder?: number;
    deliveryFee?: number;
    freeDeliveryAbove?: number;
    acceptsWalletPayment?: boolean;
    paymentMethods?: string[];
  };
  deliveryCategories: {
    fastDelivery: boolean;
    budgetFriendly: boolean;
    ninetyNineStore?: boolean;
    premium: boolean;
    organic: boolean;
    alliance: boolean;
    lowestPrice: boolean;
    mall: boolean;
    cashStore: boolean;
  };
  tags?: string[];
  distance?: number;
  isActive: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  merchantId?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper function to transform backend store data to MainStorePage format
const transformBackendStoreData = (backendData: BackendStoreData): DynamicStoreData => {
  if (!backendData) {
    console.error('❌ [DYNAMIC MAINSTORE] Backend data is null or undefined');
    return {} as DynamicStoreData;
  }

  // Calculate full address
  const fullAddress = [
    backendData.location?.address,
    backendData.location?.landmark,
    backendData.location?.city,
    backendData.location?.state,
    backendData.location?.pincode
  ].filter(Boolean).join(', ');

  return {
    id: backendData._id,
    name: backendData.name,
    title: backendData.name,
    description: backendData.description || `Welcome to ${backendData.name}. Quality products and great service.`,
    image: backendData.banner || backendData.logo,
    logo: backendData.logo,
    banner: backendData.banner,
    rating: backendData.ratings?.average || 0,
    ratingCount: backendData.ratings?.count || 0,
    category: backendData.category?.name || getCategoryFromDeliveryCategories(backendData.deliveryCategories),
    categorySlug: backendData.category?.slug,
    location: {
      address: backendData.location?.address,
      city: backendData.location?.city,
      state: backendData.location?.state,
      pincode: backendData.location?.pincode,
      coordinates: backendData.location?.coordinates,
      deliveryRadius: backendData.location?.deliveryRadius,
      landmark: backendData.location?.landmark,
      fullAddress: fullAddress
    },
    contact: {
      phone: backendData.contact?.phone,
      email: backendData.contact?.email,
      website: backendData.contact?.website,
      whatsapp: backendData.contact?.whatsapp
    },
    operationalInfo: {
      hours: backendData.operationalInfo?.hours,
      deliveryTime: backendData.operationalInfo?.deliveryTime || '30-45 mins',
      minimumOrder: backendData.operationalInfo?.minimumOrder || 0,
      deliveryFee: backendData.operationalInfo?.deliveryFee,
      freeDeliveryAbove: backendData.operationalInfo?.freeDeliveryAbove,
      acceptsWalletPayment: backendData.operationalInfo?.acceptsWalletPayment || false,
      paymentMethods: backendData.operationalInfo?.paymentMethods || []
    },
    deliveryTime: backendData.operationalInfo?.deliveryTime || '30-45 mins',
    minimumOrder: backendData.operationalInfo?.minimumOrder || 0,
    deliveryFee: backendData.operationalInfo?.deliveryFee,
    freeDeliveryAbove: backendData.operationalInfo?.freeDeliveryAbove,
    acceptsWalletPayment: backendData.operationalInfo?.acceptsWalletPayment,
    paymentMethods: backendData.operationalInfo?.paymentMethods,
    distance: backendData.distance,
    isActive: backendData.isActive,
    isFeatured: backendData.isFeatured,
    isVerified: backendData.isVerified,
    deliveryCategories: backendData.deliveryCategories,
    tags: backendData.tags || [],
    // Use actual cashback from store offers
    cashback: {
      percentage: backendData.offers?.cashback || 5,
      minOrder: backendData.offers?.minOrderAmount || backendData.operationalInfo?.minimumOrder || 100,
      maxCashback: backendData.offers?.maxCashback || 50,
      isPartner: backendData.offers?.isPartner || false,
      partnerLevel: backendData.offers?.partnerLevel
    },
    discount: {
      percentage: 10,
      minOrder: backendData.operationalInfo?.minimumOrder || 200,
    },
    videos: backendData.videos || [],
    section: 'stores',
  };
};

// Helper function to determine category from delivery categories
const getCategoryFromDeliveryCategories = (deliveryCategories: BackendStoreData['deliveryCategories']): string => {
  if (deliveryCategories.fastDelivery) return 'Fast Delivery';
  if (deliveryCategories.budgetFriendly) return 'Budget Friendly';
  if (deliveryCategories.premium) return 'Premium';
  if (deliveryCategories.organic) return 'Organic';
  if (deliveryCategories.alliance) return 'Alliance';
  if (deliveryCategories.lowestPrice) return 'Lowest Price';
  if (deliveryCategories.mall) return 'Mall';
  if (deliveryCategories.cashStore) return 'Cash Store';
  return 'General';
};

// Helper function to validate URLs
const isValidUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:');
};

// Placeholder image for missing content
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x300/E5E7EB/9CA3AF?text=Store+Video';

export default function MainStorePage({ productId, initialProduct }: MainStorePageProps = {}) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [screenData, setScreenData] = useState(Dimensions.get("window"));
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dynamic store data state
  const [storeData, setStoreData] = useState<DynamicStoreData | null>(null);
  const [isDynamic, setIsDynamic] = useState(false);
  const [storeVideos, setStoreVideos] = useState<any[]>([]);
  const [storeType, setStoreType] = useState<StoreType>('PRODUCT');

  // Modal and UI state
  const [activeTab, setActiveTab] = useState<TabKey>("deals");
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showDealsModal, setShowDealsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [storeReviews, setStoreReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [ratingBreakdown, setRatingBreakdown] = useState<any>(mockRatingBreakdown);

  // Product state management
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [hasProducts, setHasProducts] = useState(false);

  // Search, Filter, and Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    priceRange: { min: 0, max: 100000 },
    rating: null,
    categories: [],
    inStock: false,
    cashbackMin: 0,
  });
  const [sortOption, setSortOption] = useState<'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest' | 'popular' | 'cashback'>('newest');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<Array<{ id: string; name: string }>>([]);

  // Promotions state
  const [promotions, setPromotions] = useState<PromotionBannerType[]>([]);
  const [promotionsLoading, setPromotionsLoading] = useState(false);

  // Parse dynamic store data from navigation params OR fetch from API if only storeId provided
  useEffect(() => {
    const loadStoreData = async () => {
      console.log('🔍 [MAINSTORE] Loading store data with params:', {
        hasStoreId: !!params.storeId,
        hasStoreData: !!params.storeData,
        storeIdValue: params.storeId,
        storeIdType: typeof params.storeId,
        storeIdLength: params.storeId ? String(params.storeId).length : 0,
        isObjectIdFormat: params.storeId ? /^[0-9a-fA-F]{24}$/.test(String(params.storeId)) : false
      });

      // If only storeId is provided (Visit Store button clicked), fetch from API
      if (params.storeId && !params.storeData) {
        console.log('📡 [MAINSTORE] Case 1: Fetching store from backend by ID');
        try {

          const storeResponse = await storesApi.getStoreById(params.storeId as string);

          if (storeResponse.success && storeResponse.data) {
            const responseData = storeResponse.data;
            const backendStore = (responseData as any).store || responseData;

            // Transform backend store data
            const transformedData = transformBackendStoreData(backendStore as BackendStoreData);
            setStoreData(transformedData);
            setIsDynamic(true);

            // NOTE: Store videos are fetched via UGC API in UGCSection component
            // The UGC Section will combine store videos + user content automatically
            // No need to transform videos here - let UGCSection handle it
            console.log('✅ [MAINSTORE] Store data loaded, UGC section will fetch videos');
          }
        } catch (error) {
          console.error('❌ [MAINSTORE] Failed to fetch store data:', error);
          setIsDynamic(false);
        }
      }
      // If storeData is provided in params (navigated from search/home)
      else if (params.storeData && params.storeId) {
        console.log('📦 [MAINSTORE] Case 2: Using store data from navigation params');
        try {
          const parsedData = JSON.parse(params.storeData as string);
          console.log('✅ [MAINSTORE] Parsed store data:', {
            hasId: !!parsedData.id,
            has_Id: !!parsedData._id,
            idValue: parsedData.id || parsedData._id,
            name: parsedData.name,
            isBackendFormat: !!parsedData._id
          });

          // Check if it's backend store data (has _id) or legacy data (has id)
          let transformedData: DynamicStoreData;

          if (parsedData._id) {
            // New backend store data format
            transformedData = transformBackendStoreData(parsedData as BackendStoreData);

            // NOTE: Store videos are fetched via UGC API in UGCSection component
            // The UGC Section will combine store videos + user content automatically
            // No need to transform videos here - let UGCSection handle it
            console.log('✅ [MAINSTORE] Store data loaded from params, UGC section will fetch videos');
          } else {
            // Legacy store data format
            transformedData = parsedData as DynamicStoreData;

          }

          setStoreData(transformedData);
          setIsDynamic(true);

        } catch (error) {
          console.error('❌ [DYNAMIC MAINSTORE] Failed to parse store data:', error);
          setIsDynamic(false);
        }
      } else {

        setIsDynamic(false);
      }
    };

    loadStoreData();
  }, [params.storeId, params.storeData]); // Only depend on specific params, not the entire object

  // Detect store type when storeData changes
  useEffect(() => {
    if (storeData) {
      const detectedType = detectStoreType(
        storeData.category,
        storeData.tags,
        storeData.deliveryCategories
      );
      setStoreType(detectedType);
      console.log('🏪 [MAINSTORE] Detected store type:', detectedType, 'for', storeData.name);
      console.log('✅ [MAINSTORE] Store loaded successfully:', {
        name: storeData.name,
        id: storeData.id,
        idType: typeof storeData.id,
        idLength: String(storeData.id).length,
        isObjectId: /^[0-9a-fA-F]{24}$/.test(String(storeData.id)),
        isDynamic: true,
        storeType: detectedType
      });
      console.log('🎬 [MAINSTORE] This store ID will be used for UGC videos and products:', storeData.id);
    }
  }, [storeData]);

  // Load promotions when store data is available
  useEffect(() => {
    const loadPromotions = async () => {
      const currentStoreId = storeData?.id || params.storeId;
      if (!currentStoreId) return;

      try {
        setPromotionsLoading(true);

        // Check if the method exists before calling (real API may not have it yet)
        if (typeof offersApi.getStorePromotions === 'function') {
          const response = await offersApi.getStorePromotions(currentStoreId as string);

          if (response.success && response.data) {
            setPromotions(response.data.promotions);
            console.log('✅ [MAINSTORE] Loaded promotions:', response.data.promotions.length);
          }
        } else {
          console.log('ℹ️ [MAINSTORE] getStorePromotions not available in API');
        }
      } catch (error) {
        console.error('❌ [MAINSTORE] Error loading promotions:', error);
      } finally {
        setPromotionsLoading(false);
      }
    };

    if (storeData?.id || params.storeId) {
      loadPromotions();
    }
  }, [storeData?.id, params.storeId]);

  // PHASE 1 WEEK 1: Load products from API with search, filter, and sort
  useEffect(() => {
    const loadProducts = async () => {
      // Only fetch if we have a store ID
      const currentStoreId = storeData?.id || params.storeId;
      if (!currentStoreId) {
        return;
      }

      try {
        setProductsLoading(true);
        setProductsError(null);

        // Build query parameters (keep it simple for now - backend validation may be strict)
        const queryParams: any = {};

        // Only add search query if present
        if (debouncedSearchQuery.trim()) {
          queryParams.search = debouncedSearchQuery.trim();
        }

        // Add category filter if present
        if (filters.categories.length > 0) {
          queryParams.category = filters.categories[0];
        }

        // Add price range filter
        if (filters.priceRange.min > 0) {
          queryParams.minPrice = filters.priceRange.min;
        }
        if (filters.priceRange.max < 100000) {
          queryParams.maxPrice = filters.priceRange.max;
        }

        const response = await productsApi.getProductsByStore(
          currentStoreId as string,
          queryParams
        );

        if (response.success && response.data) {
          // Handle both response formats - array[0].products or direct .products
          let productsData: any[] = [];

          if (Array.isArray(response.data) && response.data.length > 0) {
            // Format: { data: [ { store: {...}, products: [...] } ] }
            productsData = response.data[0].products || [];
          } else if (response.data.products) {
            // Format: { data: { products: [...] } }
            productsData = response.data.products;
          }

          console.log('✅ [MAINSTORE] Loaded products:', productsData.length);
          setProducts(productsData);
          setHasProducts(productsData.length > 0);

          // Extract available categories from response if available
          if (response.data.filters?.categories) {
            setAvailableCategories(
              response.data.filters.categories.map((cat: any) => ({
                id: cat.id,
                name: cat.name
              }))
            );
          } else if (Array.isArray(response.data) && response.data[0]?.filters?.categories) {
            setAvailableCategories(
              response.data[0].filters.categories.map((cat: any) => ({
                id: cat.id,
                name: cat.name
              }))
            );
          }
        } else {
          setProductsError(response.message || 'Failed to load products');
          setProducts([]);
          setHasProducts(false);
        }
      } catch (error) {
        console.error('❌ [MAINSTORE] Error loading products:', error);
        setProductsError('Unable to load products. Please try again.');
        setProducts([]);
        setHasProducts(false);
      } finally {
        setProductsLoading(false);
      }
    };

    // Load products when store data is ready or filters change
    if (storeData?.id || params.storeId) {
      loadProducts();
    }
  }, [storeData?.id, params.storeId, debouncedSearchQuery, filters, sortOption]);

  // PHASE 1 WEEK 1: Retry function for error handling
  const handleRetryProducts = useCallback(async () => {
    const currentStoreId = storeData?.id || params.storeId;
    if (!currentStoreId) {
      return;
    }

    try {
      setProductsLoading(true);
      setProductsError(null);

      // Build query parameters (keep it simple for now - backend validation may be strict)
      const queryParams: any = {};

      // Only add search query if present
      if (debouncedSearchQuery.trim()) {
        queryParams.search = debouncedSearchQuery.trim();
      }

      // Add category filter if present
      if (filters.categories.length > 0) {
        queryParams.category = filters.categories[0];
      }

      // Add price range filter
      if (filters.priceRange.min > 0) {
        queryParams.minPrice = filters.priceRange.min;
      }
      if (filters.priceRange.max < 100000) {
        queryParams.maxPrice = filters.priceRange.max;
      }

      const response = await productsApi.getProductsByStore(
        currentStoreId as string,
        queryParams
      );

      if (response.success && response.data) {
        // Handle both response formats - array[0].products or direct .products
        let productsData: any[] = [];

        if (Array.isArray(response.data) && response.data.length > 0) {
          // Format: { data: [ { store: {...}, products: [...] } ] }
          productsData = response.data[0].products || [];
        } else if (response.data.products) {
          // Format: { data: { products: [...] } }
          productsData = response.data.products;
        }

        console.log('✅ [MAINSTORE] Retry loaded products:', productsData.length);
        setProducts(productsData);
        setHasProducts(productsData.length > 0);
      } else {
        setProductsError(response.message || 'Failed to load products');
        setProducts([]);
        setHasProducts(false);
      }
    } catch (error) {
      console.error('❌ [MAINSTORE] Error retrying products:', error);
      setProductsError('Unable to load products. Please try again.');
      setProducts([]);
      setHasProducts(false);
    } finally {
      setProductsLoading(false);
    }
  }, [storeData?.id, params.storeId, debouncedSearchQuery, filters, sortOption]);

  const HORIZONTAL_PADDING = screenData.width < 375 ? 12 : screenData.width > 768 ? 24 : 16;

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        setScreenData(window);
      }, 100);
    });

    return () => {
      subscription?.remove();
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const productData: MainStoreProduct = useMemo(
    () => {
      // Use dynamic store data if available, otherwise fallback to static data
      if (isDynamic && storeData) {

        // Build location string
        const locationStr = storeData.location?.city ||
                           storeData.location?.address ||
                           "BTM";

        // Build distance string
        const distanceStr = storeData.distance
          ? `${storeData.distance.toFixed(1)} Km`
          : "0.7 Km";

        // Build images array - use banner, logo, or defaults (with URL validation)
        const getValidImageUrl = (...urls: (string | undefined | null)[]): string => {
          for (const url of urls) {
            if (isValidUrl(url)) return url!;
          }
          // Return default fallback if no valid URL found
          return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900";
        };

        const storeImages = [
          { id: "1", uri: getValidImageUrl(storeData.banner, storeData.image, storeData.logo, "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900") },
          { id: "2", uri: getValidImageUrl(storeData.logo, storeData.banner, "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=900") },
          { id: "3", uri: getValidImageUrl(storeData.banner, storeData.logo, "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900") },
        ];

        return {
          id: storeData.id,
          title: storeData.name,
          description: storeData.description || `Welcome to ${storeData.name}. Quality products and great service.`,
          price: storeData.minimumOrder ? `₹${storeData.minimumOrder}` : "₹0", // Show min order as price
          location: locationStr,
          distance: distanceStr,
          isOpen: true, // Can be calculated from operational hours if needed
          images: storeImages,
          cashbackPercentage: storeData.cashback?.percentage?.toString() || "5",
          storeName: storeData.name,
          storeId: storeData.id,
          category: storeData.category || "General Store",
        };
      }

      // Fallback to existing logic for static mode
      return initialProduct || {
        id: productId || "product-001",
        title: "Little Big Comfort Tee",
        description:
          "Little Big Comfort Tee offers a perfect blend of relaxed fit and soft fabric for all-day comfort and effortless style.",
        price: "₹2,199",
        location: "BTM",
        distance: "0.7 Km",
        isOpen: true,
        images: [
          { id: "1", uri: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=1100&fit=crop&crop=center" },
          { id: "2", uri: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=900&h=1100&fit=crop&crop=center" },
          { id: "3", uri: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900&h=1100&fit=crop&crop=center" },
        ],
        cashbackPercentage: "10",
        storeName: "Reliance Trends",
        storeId: "store-001",
        category: "Fashion",
      };
    },
    [initialProduct, productId, isDynamic, storeData]
  );

  const handleSharePress = useCallback(async () => {
    try {
      setIsLoading(true);
      await Share.share({
        message: `Check out ${productData.title} at ${productData.storeName} for ${productData.price}`,
        url: `https://store.example.com/products/${productData.id}`,
        title: productData.title,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to share product.");
    } finally {
      setIsLoading(false);
    }
  }, [productData]);

  const handleFavoritePress = useCallback(() => {
    setIsFavorited((prev) => {
      const next = !prev;
      Alert.alert(
        next ? "Added to Favorites" : "Removed from Favorites",
        `${productData.title} ${next ? "added to" : "removed from"} favorites.`
      );
      return next;
    });
  }, [productData.title]);

  // Load reviews from backend
  const loadStoreReviews = useCallback(async (storeId: string) => {
    try {
      setReviewsLoading(true);

      const reviewsResponse = await reviewsApi.getTargetReviews('store', storeId, {
        page: 1,
        limit: 20,
        sort: 'newest'
      });

      if (reviewsResponse.success && reviewsResponse.data) {

        setStoreReviews(reviewsResponse.data.reviews);
        setRatingBreakdown(reviewsResponse.data.summary.ratingBreakdown);
      } else {
        console.warn('⚠️ [MAINSTORE] No reviews found, using mock data');
        setStoreReviews(mockReviews);
      }
    } catch (error) {
      console.error('❌ [MAINSTORE] Error loading reviews:', error);
      // Fallback to mock reviews on error
      setStoreReviews(mockReviews);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  // FIX: Allow reopening modals even if tab is already active
  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);

    if (tab === "about") {
      setShowAboutModal(true);
    } else if (tab === "deals") {
      setShowDealsModal(true);
    } else if (tab === "reviews") {
      // Load reviews when opening review modal
      const storeId = isDynamic && storeData ? storeData.id : productData.storeId;
      if (storeId) {
        loadStoreReviews(storeId);
      }
      setShowReviewModal(true);
    }
  }, [isDynamic, storeData, productData.storeId, loadStoreReviews]);

  const handleCloseAboutModal = useCallback(() => setShowAboutModal(false), []);
  const handleCloseDealsModal = useCallback(() => setShowDealsModal(false), []);
  const handleCloseReviewModal = useCallback(() => setShowReviewModal(false), []);

  const handleViewAllPress = useCallback(() => {
    Alert.alert("UGC", "View all UGC");
  }, []);

  const handleImagePress = useCallback((imageId: string) => {
    console.log('🎥 [MAINSTORE] Navigating to UGC detail:', imageId);
    router.push({
      pathname: '/UGCDetailScreen',
      params: { id: imageId }
    });
  }, [router]);

  const handleAddToCart = useCallback(() => {
    const cartItem: CartItemFromProduct = {
      id: productData.id,
      name: productData.title,
      price: parseInt(productData.price.replace("₹", "").replace(",", "")) || 0,
      image: productData.images[0]?.uri || "",
      cashback: `${productData.cashbackPercentage} cashback`,
      category: "products",
    };

    Alert.alert("Added to Cart", `${productData.title} has been added to your cart.`);
  }, [productData]);

  const handleBackPress = useCallback(() => router.back(), [router]);

  // Filter management functions
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.rating !== null) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 100000) count++;
    if (filters.inStock) count++;
    if (filters.cashbackMin > 0) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0 || searchQuery.trim() !== '';

  const handleApplyFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setShowFilterModal(false);
  }, []);

  const handleRemoveFilter = useCallback((filterType: string, value?: any) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      switch (filterType) {
        case 'category':
          newFilters.categories = prev.categories.filter(c => c !== value);
          break;
        case 'rating':
          newFilters.rating = null;
          break;
        case 'priceRange':
          newFilters.priceRange = { min: 0, max: 100000 };
          break;
        case 'inStock':
          newFilters.inStock = false;
          break;
        case 'cashback':
          newFilters.cashbackMin = 0;
          break;
      }
      return newFilters;
    });
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFilters({
      priceRange: { min: 0, max: 100000 },
      rating: null,
      categories: [],
      inStock: false,
      cashbackMin: 0,
    });
    setSearchQuery('');
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setSortOption(sort as any);
    setShowSortModal(false);
  }, []);

  const getSortLabel = useCallback(() => {
    switch (sortOption) {
      case 'relevance': return 'Most Relevant';
      case 'price_low': return 'Price: Low to High';
      case 'price_high': return 'Price: High to Low';
      case 'rating': return 'Highest Rated';
      case 'newest': return 'Newest First';
      case 'popular': return 'Most Popular';
      case 'cashback': return 'Highest Cashback';
      default: return 'Sort';
    }
  }, [sortOption]);

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => setError(null), 4500);
    return () => clearTimeout(id);
  }, [error]);

  const styles = useMemo(() => createStyles(HORIZONTAL_PADDING, screenData), [HORIZONTAL_PADDING, screenData]);

  return (
    <ThemedView style={styles.page}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />

      <LinearGradient colors={["#7C3AED", "#8B5CF6"]} style={styles.headerGradient}>
        <MainStoreHeader 
          storeName={isDynamic && storeData ? storeData.name || storeData.title : productData.storeName} 
          onBack={handleBackPress} 
        />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Promotions Banner */}
        {!promotionsLoading && promotions.length > 0 && (
          <PromotionsBanner
            banners={promotions}
            storeId={storeData?.id || (params.storeId as string)}
            storeName={storeData?.name}
            autoRotate={true}
            showCountdown={true}
            onBannerPress={(banner) => {
              console.log('Banner pressed:', banner.title);
              // Navigate to deals or specific offer page
            }}
          />
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter & Sort Controls */}
        <View style={styles.controlsBar}>
          <TouchableOpacity
            style={[styles.controlButton, activeFilterCount > 0 && styles.controlButtonActive]}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="filter" size={18} color={activeFilterCount > 0 ? "#FFFFFF" : "#7C3AED"} />
            <Text style={[styles.controlButtonText, activeFilterCount > 0 && styles.controlButtonTextActive]}>
              Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowSortModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-vertical" size={18} color="#7C3AED" />
            <Text style={styles.controlButtonText}>{getSortLabel()}</Text>
            <Ionicons name="chevron-down" size={16} color="#7C3AED" />
          </TouchableOpacity>
        </View>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <View style={styles.activeFiltersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFiltersScroll}>
              {searchQuery.trim() !== '' && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipText} numberOfLines={1}>
                    Search: "{searchQuery.substring(0, 15)}{searchQuery.length > 15 ? '...' : ''}"
                  </Text>
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color="#7C3AED" />
                  </TouchableOpacity>
                </View>
              )}
              {filters.categories.map((category) => (
                <View key={category} style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipText}>{category}</Text>
                  <TouchableOpacity onPress={() => handleRemoveFilter('category', category)}>
                    <Ionicons name="close-circle" size={16} color="#7C3AED" />
                  </TouchableOpacity>
                </View>
              ))}
              {filters.rating !== null && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipText}>{filters.rating}+ Stars</Text>
                  <TouchableOpacity onPress={() => handleRemoveFilter('rating')}>
                    <Ionicons name="close-circle" size={16} color="#7C3AED" />
                  </TouchableOpacity>
                </View>
              )}
              {(filters.priceRange.min > 0 || filters.priceRange.max < 100000) && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipText}>
                    ₹{filters.priceRange.min} - ₹{filters.priceRange.max}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveFilter('priceRange')}>
                    <Ionicons name="close-circle" size={16} color="#7C3AED" />
                  </TouchableOpacity>
                </View>
              )}
              {filters.inStock && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipText}>In Stock</Text>
                  <TouchableOpacity onPress={() => handleRemoveFilter('inStock')}>
                    <Ionicons name="close-circle" size={16} color="#7C3AED" />
                  </TouchableOpacity>
                </View>
              )}
              {filters.cashbackMin > 0 && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipText}>{filters.cashbackMin}%+ Cashback</Text>
                  <TouchableOpacity onPress={() => handleRemoveFilter('cashback')}>
                    <Ionicons name="close-circle" size={16} color="#7C3AED" />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={handleClearAllFilters}
                activeOpacity={0.7}
              >
                <Text style={styles.clearAllButtonText}>Clear All</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        <View style={styles.imageSection}>
          <View style={styles.imageCard}>
            <ProductDisplay
              images={productData.images}
              onSharePress={handleSharePress}
              onFavoritePress={handleFavoritePress}
              isFavorited={isFavorited}
            />
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        </View>

        <View style={styles.sectionCard}>
          <ProductDetails
            title={productData.title}
            description={productData.description}
            location={productData.location}
            distance={productData.distance}
            isOpen={productData.isOpen}
          />
        </View>

        <View style={styles.cashbackFullWidth}>
          <CashbackOffer percentage={productData.cashbackPercentage} />
        </View>

        <View style={styles.sectionCard}>
          <UGCSection
            storeId={isDynamic && storeData ? storeData.id : productData.storeId}
            onViewAllPress={handleViewAllPress}
            onImagePress={handleImagePress}
          />
        </View>

        {/* Service Store Features: PayBill, Vouchers, Quick Actions */}
        {shouldShowPayBill(storeType, storeData?.category) && (
          <PayBillCard productData={storeData || productData} discountPercentage={20} />
        )}

        {/* Vouchers Section - Show for all service-based stores */}
        {(storeType === 'SERVICE' || storeType === 'RESTAURANT' || storeType === 'HYBRID') && storeData && (
          <VouchersSection
            storeId={storeData.id}
            storeName={storeData.name}
          />
        )}

        {/* Quick Actions Grid - Show for all stores */}
        {storeData && (
          <QuickActions
            storeId={storeData.id}
            storeName={storeData.name}
            bookingType={storeData.bookingType || 'RETAIL'}
            contact={storeData.contact}
            location={storeData.location}
            hasMenu={storeData.hasMenu}
          />
        )}

        {/* PHASE 1 WEEK 1: Products Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Products</Text>
            {products.length > 0 && (
              <Text style={styles.productCount}>{products.length} items</Text>
            )}
          </View>

          {productsError ? (
            <ProductsErrorState
              message={productsError}
              onRetry={handleRetryProducts}
            />
          ) : productsLoading ? (
            <StoreProductGrid
              products={[]}
              loading={true}
              onProductPress={(product) => {
                router.push(`/product/${product.id}`);
              }}
            />
          ) : !hasProducts || products.length === 0 ? (
            <EmptyProducts
              storeName={isDynamic && storeData ? storeData.name : productData.storeName}
            />
          ) : (
            <StoreProductGrid
              products={products}
              loading={false}
              onProductPress={(product) => {
                router.push(`/product/${product.id}`);
              }}
            />
          )}
        </View>
      </ScrollView>

      {error && (
        <View style={styles.errorToast}>
          <TouchableOpacity onPress={() => setError(null)} activeOpacity={0.8}>
            <View style={styles.errorInner}>
              <View style={styles.errorDot} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.errorText as any}>{error}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Modals */}
      <AboutModal
        visible={showAboutModal}
        onClose={handleCloseAboutModal}
        storeData={{
          name: isDynamic && storeData ? storeData.name : productData.storeName,
          establishedYear: 2020, // Could be added to store model
          address: isDynamic && storeData?.location ? {
            doorNo: "",
            floor: "",
            street: storeData.location.address || "",
            area: storeData.location.landmark || "",
            city: storeData.location.city || "",
            state: storeData.location.state || "",
            pinCode: storeData.location.pincode || "",
          } : {
            doorNo: "40A",
            floor: "1st floor",
            street: "5th A Main Rd",
            area: "H Block, HBR Layout",
            city: "Bengaluru",
            state: "Karnataka",
            pinCode: "560043",
          },
          isOpen: productData.isOpen,
          categories: isDynamic && storeData
            ? [
                storeData.category || "General",
                ...(storeData.tags || []),
                "Gift cards",
                "Loyalty program"
              ]
            : ["Boys", "Girls", "Personal items", "Gift cards", "Loyalty program"],
          hours: isDynamic && storeData?.operationalInfo?.hours
            ? Object.entries(storeData.operationalInfo.hours).map(([day, hours]: [string, any]) => ({
                day: day.charAt(0).toUpperCase() + day.slice(1),
                time: hours.closed ? "Closed" : `${hours.open} - ${hours.close}`
              }))
            : [
                { day: "Monday", time: "10:00 AM - 6:00 PM" },
                { day: "Tuesday", time: "10:00 AM - 6:00 PM" },
                { day: "Wednesday", time: "10:00 AM - 6:00 PM" },
                { day: "Thursday", time: "10:00 AM - 6:00 PM" },
                { day: "Friday", time: "10:00 AM - 6:00 PM" },
                { day: "Saturday", time: "10:00 AM - 6:00 PM" },
                { day: "Sunday", time: "Closed" },
              ],
        }}
      />

      <WalkInDealsModal
        visible={showDealsModal}
        onClose={handleCloseDealsModal}
        storeId={isDynamic && storeData ? storeData.id : productData.storeId}
      />

      <ReviewModal
        visible={showReviewModal}
        onClose={handleCloseReviewModal}
        storeName={isDynamic && storeData ? storeData.name || storeData.title : productData.storeName}
        storeId={isDynamic && storeData ? storeData.id : productData.storeId}
        averageRating={isDynamic && storeData?.rating ? storeData.rating : mockReviewStats.averageRating}
        totalReviews={isDynamic && storeData?.ratingCount ? storeData.ratingCount : mockReviewStats.totalReviews}
        ratingBreakdown={ratingBreakdown}
        reviews={reviewsLoading ? mockReviews : storeReviews.length > 0 ? storeReviews : mockReviews}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />

      {/* Sort Modal */}
      <SortModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        onSelectSort={handleSortChange}
        currentSort={sortOption}
      />
    </ThemedView>
);
}

const createStyles = (HORIZONTAL_PADDING: number, screenData: { width: number; height: number }) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: "#F8FAFC",
    },
    headerGradient: {
      paddingBottom: 8,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      overflow: "hidden",
      shadowColor: "#7C3AED",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    },
    scrollContent: {
      paddingBottom: 180, // Increased to account for tab bar (70px) + Visit Store button (60px) + extra spacing (50px)
      paddingTop: 8,
    },
    // Search Bar Styles
    searchContainer: {
      paddingHorizontal: HORIZONTAL_PADDING,
      paddingVertical: 12,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: "#1F2937",
      paddingVertical: 4,
    },
    clearButton: {
      padding: 4,
    },
    // Control Bar Styles
    controlsBar: {
      flexDirection: "row",
      paddingHorizontal: HORIZONTAL_PADDING,
      paddingVertical: 8,
      gap: 10,
    },
    controlButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFFFFF",
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      gap: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1.5,
      borderColor: "#E5E7EB",
    },
    controlButtonActive: {
      backgroundColor: "#7C3AED",
      borderColor: "#7C3AED",
    },
    controlButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#7C3AED",
    },
    controlButtonTextActive: {
      color: "#FFFFFF",
    },
    // Active Filters Styles
    activeFiltersContainer: {
      paddingVertical: 8,
    },
    activeFiltersScroll: {
      paddingHorizontal: HORIZONTAL_PADDING,
      gap: 8,
    },
    activeFilterChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#EDE9FE",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 6,
      borderWidth: 1,
      borderColor: "#C4B5FD",
    },
    activeFilterChipText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#7C3AED",
      maxWidth: 150,
    },
    clearAllButton: {
      backgroundColor: "#FEE2E2",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "#FCA5A5",
    },
    clearAllButtonText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#DC2626",
    },
    imageSection: {
      paddingHorizontal: HORIZONTAL_PADDING,
      paddingTop: 8,
      paddingBottom: 16,
    },
    imageCard: {
      backgroundColor: "#fff",
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.8)",
    },
    tabsContainer: {
      marginTop: 16,
      marginHorizontal: HORIZONTAL_PADDING,
      marginBottom: 8,
    },
    sectionCard: {
      marginHorizontal: HORIZONTAL_PADDING,
      marginTop: 16,
      backgroundColor: "#fff",
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
      paddingHorizontal: 4,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: "#111827",
      letterSpacing: -0.5,
    },
    productCount: {
      fontSize: 14,
      fontWeight: "700",
      color: "#7C3AED",
      backgroundColor: "#F3E8FF",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    cashbackFullWidth: {
      marginHorizontal: HORIZONTAL_PADDING,
      marginTop: 16,
      paddingVertical: 18,
      paddingHorizontal: 20,
      borderRadius: 18,
    },
    fixedBottom: {
      position: "absolute",
      left: HORIZONTAL_PADDING,
      right: HORIZONTAL_PADDING,
      bottom: Platform.OS === "ios" ? 90 : 86, // Positioned above tab bar (70px) + extra spacing (16-20px)
    },
    errorToast: {
      position: "absolute",
      left: HORIZONTAL_PADDING + 4,
      right: HORIZONTAL_PADDING + 4,
      top: Platform.OS === "ios" ? 60 : 44,
    },
    errorInner: {
      backgroundColor: "#FEF2F2",
      borderLeftWidth: 6,
      borderLeftColor: "#EF4444",
      padding: 16,
      borderRadius: 16,
      flexDirection: "row",
      alignItems: "center",
    },
    errorDot: {
      width: 12,
      height: 12,
      borderRadius: 8,
      backgroundColor: "#EF4444",
    },
    errorText: {
      color: "#991B1B",
      fontSize: 14,
      fontWeight: "600",
    },
  });
