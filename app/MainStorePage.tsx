// MainStorePage.tsx
import React, { useCallback, useMemo, useState, useEffect, useRef, Suspense, lazy } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  RefreshControl,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import {
  MainStoreHeader,
  ProductDisplay,
  TabNavigation,
  TabKey,
  ProductDetails,
  CashbackOffer,
  UGCSection,
  VisitStoreButton,
  StoreProducts,
} from "./MainStoreSection";
import Section1 from "./StoreSection/Section1";
import Section2 from "./StoreSection/Section2";
import Section3 from "./StoreSection/Section3";
import Section4 from "./StoreSection/Section4";
import Section5 from "./StoreSection/Section5";
import FollowStoreSection from "./StoreSection/FollowStoreSection";
import Section6 from "./StoreSection/Section6";
import CombinedSection78 from "./StoreSection/CombinedSection78";
import ProductInfo from "./StoreSection/ProductInfo";
import StoreActionButtons from "./StoreSection/StoreActionButtons";
import { MainStoreProduct, MainStorePageProps, CartItemFromProduct } from "@/types/mainstore";
import { useStoreReviews } from "@/hooks/useStoreReviews";
import reviewsApi from "@/services/reviewsApi";
import apiClient from "@/services/apiClient";
import {
  StoreHeaderSkeleton,
  ProductGridSkeleton,
  PromotionBannerSkeleton
} from "@/components/skeletons";
import FrequentlyBoughtTogether from '@/components/store/FrequentlyBoughtTogether';
import CrossStoreProductsSection from '@/components/store/CrossStoreProductsSection';
import SimilarStoresSection from '@/components/store/SimilarStoresSection';
import StoreGallerySection from '@/components/store/StoreGallerySection';
import { parsePrice } from '@/utils/priceParser';
import { platformAlert } from '@/utils/platformAlert';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import wishlistApi from '@/services/wishlistApi';
import { showAlert } from '@/components/common/CrossPlatformAlert';
import { useAuth } from '@/contexts/AuthContext';

// ============================================================================
// LAZY LOADED COMPONENTS - Code Splitting for Bundle Size Optimization
// ============================================================================
// These modals are heavy (50-80KB each) and only needed when user interaction occurs
// Lazy loading reduces initial bundle from ~800KB to ~500KB (37.5% reduction)

import {
  LazyAboutModal,
  LazyWalkInDealsModal,
  LazyReviewModal,
  SectionLoader
} from "@/components/lazy";
import WriteReviewModal from "@/components/WriteReviewModal";

// ============================================================================
// CUSTOM HOOKS - Data Management & State Logic Extraction
// ============================================================================
// These hooks encapsulate data fetching, filtering, and state management logic
// reducing component complexity and improving reusability

import { useStoreData } from "@/hooks/useStoreData";
import { useStoreProducts } from "@/hooks/useStoreProducts";
import { useStorePromotions } from "@/hooks/useStorePromotions";
import { useProductFilters } from "@/hooks/useProductFilters";

// NOTE: These hooks are currently ready but not actively used in this component
// because MainStorePage is currently using static/mock data from params.
// When backend integration is complete, replace the static productData logic with:
//
// const storeId = params.storeId as string;
// const { data: storeDetails, loading: storeLoading, error: storeError } = useStoreData(storeId);
// const { products, loading: productsLoading, loadMore, hasMore } = useStoreProducts(storeId);
// const { promotions, loading: promotionsLoading } = useStorePromotions(storeId);
// const { filters, setCategory, setSortBy, clearFilters } = useProductFilters();

// Future lazy-loaded components (ready for when implemented):
// import {
//   LazyFrequentlyBoughtTogether,
//   LazyRelatedProductsSection,
//   LazyCombinedSection78,
//   LazyCategoryRecommendationsGrid,
//   LazySection6,
// } from '@/components/lazy';

interface LocationData {
  address?: string;
  city?: string;
  distance?: string;
  [key: string]: unknown;
}

interface CashbackData {
  percentage?: number;
  [key: string]: unknown;
}

interface DynamicStoreData {
  id: string;
  name: string;
  title: string;
  description?: string;
  image?: string;
  logo?: string;
  rating: number;
  ratingCount: number;
  category?: string;
  location?: string | LocationData;
  deliveryTime?: string;
  minimumOrder?: number;
  cashback?: number | CashbackData;
  discount?: number | Record<string, unknown>;
  section?: string;
  operationalInfo?: {
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
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    whatsapp?: string;
  };
  tags?: string[];
  createdAt?: string | Date;
  [key: string]: unknown;
}

export default function MainStorePage({ productId, initialProduct }: MainStorePageProps = {}) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { state: authState } = useAuth();
  const isAuthenticated = authState?.isAuthenticated && !!authState?.user;
  const [screenData, setScreenData] = useState(Dimensions.get("window"));
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Responsive breakpoints
  const isWeb = Platform.OS === 'web';
  const isTablet = screenData.width >= 768;
  const isDesktop = screenData.width >= 1024;
  const isMobile = screenData.width < 768;

  // Dynamic store data state
  const [storeData, setStoreData] = useState<DynamicStoreData | null>(null);
  const [isDynamic, setIsDynamic] = useState(false);
  const initializedRef = useRef(false); // Prevent re-initialization
  const fullStoreDataRef = useRef<any>(null); // Store full fetched store data for modals

  // Parse dynamic store data from navigation params
  // FIX: Extract primitive values from params to prevent infinite loop
  const storeDataParam = params.storeData as string | undefined;
  const storeIdParam = params.storeId as string | undefined;
  const storeTypeParam = params.storeType as string | undefined;

  // ALWAYS fetch full store data from API if storeId is available
  // This ensures we have complete data (location with state/pincode, contact, operationalInfo, description)
  // even if storeDataParam is provided (which might be incomplete)
  const shouldFetchStore = !!storeIdParam;
  const { 
    data: fetchedStoreData, 
    loading: storeLoading, 
    error: storeError,
    refetch: refetchStore 
  } = useStoreData(shouldFetchStore ? storeIdParam : '');

  // Transform fetched store data to DynamicStoreData format
  // This runs whenever we fetch data from API (whether or not storeDataParam exists)
  useEffect(() => {
    if (fetchedStoreData && storeIdParam) {
      try {
        // Transform location object to string or keep as object
        let locationValue: string | LocationData = '';
        if (fetchedStoreData.location) {
          if (typeof fetchedStoreData.location === 'object') {
            locationValue = {
              address: fetchedStoreData.location.address || '',
              city: fetchedStoreData.location.city || '',
              state: fetchedStoreData.location.state || '',
              pincode: fetchedStoreData.location.pincode || '',
              landmark: fetchedStoreData.location.landmark || '',
              coordinates: fetchedStoreData.location.coordinates || undefined,
              deliveryRadius: fetchedStoreData.location.deliveryRadius || undefined,
            };
          } else {
            locationValue = fetchedStoreData.location;
          }
        }

        // Debug logging for image fields
        console.log('[MainStorePage] Raw fetchedStoreData image fields:', {
          banner: fetchedStoreData.banner,
          logo: fetchedStoreData.logo,
          image: fetchedStoreData.image,
          fullData: {
            _id: fetchedStoreData._id,
            name: fetchedStoreData.name,
            banner: fetchedStoreData.banner,
            logo: fetchedStoreData.logo,
            image: fetchedStoreData.image,
          }
        });

        const transformedData: DynamicStoreData = {
          id: fetchedStoreData._id || fetchedStoreData.id || storeIdParam,
          name: fetchedStoreData.name || 'Unnamed Store',
          title: fetchedStoreData.name || 'Unnamed Store',
          description: fetchedStoreData.description || '',
          image: fetchedStoreData.banner || fetchedStoreData.image || '', // Banner or image field - don't fallback to logo for main image
          logo: fetchedStoreData.logo || '',
          rating: fetchedStoreData.ratings?.average || 0,
          ratingCount: fetchedStoreData.ratings?.count || 0,
          category: fetchedStoreData.category?.name || fetchedStoreData.category || '',
          location: locationValue,
          deliveryTime: fetchedStoreData.operationalInfo?.deliveryTime || '',
          minimumOrder: fetchedStoreData.operationalInfo?.minimumOrder || 0,
          cashback: fetchedStoreData.offers?.cashback || 0,
          discount: fetchedStoreData.offers?.discount || 0,
          section: 'store',
          // Add additional fields for About modal
          operationalInfo: fetchedStoreData.operationalInfo,
          contact: fetchedStoreData.contact,
          tags: fetchedStoreData.tags || [],
          createdAt: fetchedStoreData.createdAt,
        };
        setStoreData(transformedData);
        setIsDynamic(true);
        fullStoreDataRef.current = fetchedStoreData; // Store full data for modals
        
      } catch (error) {
        console.error('❌ [MainStorePage] Failed to transform store data:', error);
        setError('Failed to load store details');
      }
    }
  }, [fetchedStoreData, storeIdParam, storeDataParam]);

  // Handle store loading state
  useEffect(() => {
    if (storeLoading) {
      setPageLoading(true);
    } else {
      // End page loading after a brief delay (for skeleton animation)
      loadingTimeoutRef.current = setTimeout(() => {
        setPageLoading(false);
      }, 300);
    }
  }, [storeLoading]);

  // Handle store error
  useEffect(() => {
    if (storeError) {
      console.error('❌ [MainStorePage] Store fetch error:', storeError);
      setError(storeError.message || 'Failed to load store details');
      setPageLoading(false);
    }
  }, [storeError]);

  useEffect(() => {
    // Only initialize once or when actual params change
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    setPageLoading(true); // Start page loading

    if (storeDataParam && storeIdParam && storeTypeParam) {
      try {
        // Parse storeDataParam for immediate display (might be incomplete)
        const parsedData = JSON.parse(storeDataParam);
        setStoreData(parsedData);
        setIsDynamic(true);
        // Note: We still fetch full data via useStoreData hook above
        // fullStoreDataRef.current will be set when fetchedStoreData arrives
      } catch (error) {
        console.error('Failed to parse store data:', error);
        setIsDynamic(false);
      }
    } else if (storeIdParam) {
      // If only storeId is provided, useStoreData hook will fetch it
    } else {
      setIsDynamic(false);
    }

    // Cleanup timeout on unmount
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      initializedRef.current = false; // Reset on unmount
    };
  }, [storeDataParam, storeIdParam, storeTypeParam]); // Use primitive values instead of params object

  // Responsive horizontal padding
  // Mobile: 12-16px, Tablet: 24px, Desktop: 32px, Large Desktop: max 1200px container
  const HORIZONTAL_PADDING = (() => {
    if (screenData.width < 375) return 12; // Small mobile
    if (screenData.width < 768) return 16; // Mobile
    if (screenData.width < 1024) return 24; // Tablet
    if (screenData.width < 1440) return 32; // Desktop
    // Large desktop: center content with max width
    return Math.max(32, (screenData.width - 1200) / 2);
  })();

  // Content max width for web
  const MAX_CONTENT_WIDTH = isDesktop ? 1200 : undefined;

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

  const [activeTab, setActiveTab] = useState<TabKey>("deals");
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // Master page loading state
  const [refreshing, setRefreshing] = useState(false); // Pull-to-refresh state
  const [error, setError] = useState<string | null>(null);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showDealsModal, setShowDealsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [checkingCanReview, setCheckingCanReview] = useState(false);

  // Always fetch reviews when store ID is available (not just when modal opens)
  // Use storeIdParam or storeData.id directly instead of productData.storeId to avoid initialization error
  const reviewStoreId = storeIdParam || storeData?.id || (isDynamic && storeData ? storeData.id : undefined);
  
  const {
    reviews: storeReviews,
    stats: reviewStats,
    ratingBreakdown: reviewRatingBreakdown,
    loading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews,
  } = useStoreReviews(
    reviewStoreId,
    { limit: 20, sort: 'newest' }
  );

  // Log review data when modal opens
  useEffect(() => {
    if (showReviewModal) {
      console.log('🚀 [MainStorePage] Review Modal Opened');
      console.log('📋 [MainStorePage] Review Store ID:', reviewStoreId);
      console.log('📊 [MainStorePage] Review Stats:', JSON.stringify(reviewStats, null, 2));
      console.log('⭐ [MainStorePage] Rating Breakdown:', JSON.stringify(reviewRatingBreakdown, null, 2));
      console.log('📝 [MainStorePage] Store Reviews Count:', storeReviews?.length || 0);
      console.log('📝 [MainStorePage] Store Reviews:', JSON.stringify(storeReviews, null, 2));
      console.log('⏳ [MainStorePage] Reviews Loading:', reviewsLoading);
      console.log('❌ [MainStorePage] Reviews Error:', reviewsError);
    }
  }, [showReviewModal, reviewStoreId, reviewStats, reviewRatingBreakdown, storeReviews, reviewsLoading, reviewsError]);

  // UGC content state
  const [ugcContent, setUgcContent] = useState<any[]>([]);
  const [ugcLoading, setUgcLoading] = useState(false);

  // Check if user can review when review modal opens
  useEffect(() => {
    if (showReviewModal && reviewStoreId) {
      const checkCanReview = async () => {
        try {
          setCheckingCanReview(true);
          const response = await import('@/services/reviewApi').then(m => m.default.canUserReviewStore(reviewStoreId));
          if (response.success && response.data) {
            setCanReview(response.data.canReview);
          }
        } catch (error) {
          console.error('Error checking can review:', error);
          setCanReview(true); // Default to true on error
        } finally {
          setCheckingCanReview(false);
        }
      };
      checkCanReview();
    }
  }, [showReviewModal, reviewStoreId]);

  // Check if user is following this store (for ProductDisplay heart icon)
  useEffect(() => {
    const checkFollowStatus = async () => {
      const storeIdToCheck = storeIdParam || storeData?.id;
      if (!storeIdToCheck || !isAuthenticated) {
        return;
      }

      try {
        const response = await wishlistApi.checkWishlistStatus('store', storeIdToCheck);
        if (response.success && response.data?.inWishlist) {
          setIsFavorited(true);
        } else {
          setIsFavorited(false);
        }
      } catch (error) {
        console.log('[MainStorePage] Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [storeIdParam, storeData?.id, isAuthenticated]);

  // Fetch UGC content when review modal is shown
  useEffect(() => {
    if (showReviewModal && reviewStoreId) {
      const fetchUGC = async () => {
        try {
          setUgcLoading(true);
          const response = await apiClient.get(`/ugc/store/${reviewStoreId}`, {
            limit: 20,
            offset: 0,
          });
          if (response.success && response.data) {
            // Transform UGC data to match ReviewModal expectations
            const content = (response.data as any).content || [];
            const transformed = content.map((item: any) => ({
              id: item._id || item.id,
              userId: item.userId || item.user?._id,
              userName: item.user?.profile?.firstName 
                ? `${item.user.profile.firstName} ${item.user.profile.lastName || ''}`.trim()
                : 'Anonymous',
              userAvatar: item.user?.profile?.avatar || '',
              contentType: item.type === 'video' ? 'video' : 'image',
              uri: item.url || item.thumbnail || '',
              caption: item.caption || '',
              likes: item.likes || 0,
              isLiked: item.isLiked || false,
              isBookmarked: item.isBookmarked || false,
              date: new Date(item.createdAt || item.updatedAt),
              productTags: item.tags || [],
            }));
            setUgcContent(transformed);
          }
        } catch (error) {
          console.error('[MainStorePage] Error fetching UGC:', error);
          setUgcContent([]);
        } finally {
          setUgcLoading(false);
        }
      };
      fetchUGC();
    }
  }, [showReviewModal, reviewStoreId]);

  // Refetch store data when review stats change (e.g., after approval)
  // Use a ref to track last fetched values to prevent unnecessary refetches
  const lastFetchedStatsRef = useRef<{ totalReviews: number; averageRating: number } | null>(null);
  const refetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    // Clear any pending refetch
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current);
    }
    
    if (reviewStats && reviewStats.totalReviews > 0 && refetchStore) {
      const currentStats = {
        totalReviews: reviewStats.totalReviews,
        averageRating: reviewStats.averageRating,
      };
      
      // Only refetch if stats actually changed significantly
      const lastStats = lastFetchedStatsRef.current;
      if (!lastStats || 
          lastStats.totalReviews !== currentStats.totalReviews || 
          Math.abs(lastStats.averageRating - currentStats.averageRating) > 0.01) {
        lastFetchedStatsRef.current = currentStats;
        // Debounce the refetch to prevent multiple rapid calls
        refetchTimeoutRef.current = setTimeout(() => {
          if (refetchStore) {
            refetchStore();
          }
          refetchTimeoutRef.current = null;
        }, 1000); // Increased debounce to 1 second
      }
    }
    
    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
        refetchTimeoutRef.current = null;
      }
    };
  }, [reviewStats?.totalReviews, reviewStats?.averageRating]); // Removed refetchStore from deps to prevent loops

  // Review action handlers
  const handleReviewHelpful = useCallback(async (reviewId: string) => {
    try {
      const response = await reviewsApi.markHelpful(reviewId);
      if (response.success) {
        // Refetch reviews to update helpful count
        await refetchReviews();
        // Note: Store data will be refetched automatically via useEffect when reviewStats change
      }
    } catch (error) {
      console.error('[MainStorePage] Error marking review helpful:', error);
    }
  }, [refetchReviews]);

  const handleReviewReport = useCallback(async (reviewId: string) => {
    try {
      const response = await reviewsApi.reportReview(reviewId, 'inappropriate');
      if (response.success) {
        if (Platform.OS === 'web') {
          window.alert('Review reported successfully. Thank you for helping keep our community safe.');
        } else {
          Alert.alert('Success', 'Review reported successfully. Thank you for helping keep our community safe.');
        }
      }
    } catch (error) {
      console.error('[MainStorePage] Error reporting review:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to report review. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to report review. Please try again.');
      }
    }
  }, []);

  const handleReviewLike = useCallback(async (reviewId: string) => {
    // Note: The backend doesn't have a separate "like" endpoint, 
    // but we can use helpful as a like mechanism
    await handleReviewHelpful(reviewId);
  }, [handleReviewHelpful]);

  const productData: MainStoreProduct = useMemo(
    () => {
      if (isDynamic && storeData) {

        // Extract location data properly - include all available fields
        let locationStr = "";
        let cityStr = "";
        let stateStr = "";
        let pincodeStr = "";

        if (storeData.location) {
          if (typeof storeData.location === 'object') {
            const locObj = storeData.location as LocationData;
            locationStr = locObj.address || "";
            cityStr = locObj.city || "";
            stateStr = (locObj as any).state || "";
            pincodeStr = (locObj as any).pincode || (locObj as any).pinCode || "";
          } else if (typeof storeData.location === 'string') {
            locationStr = storeData.location;
          }
        }

        // Combine address, city, state, and pincode for display
        // Format: "Address, City, State - Pincode" or simpler format if some fields are missing
        const locationParts = [locationStr, cityStr].filter(Boolean);
        const statePinParts = [stateStr, pincodeStr].filter(Boolean);
        const fullLocation = locationParts.length > 0
          ? locationParts.join(", ") + (statePinParts.length > 0 ? `, ${statePinParts.join(" - ")}` : "")
          : "Location not available";

        // Extract distance if available (from top-level or calculate based on user location)
        const distanceStr = (storeData as any).distance
          ? `${(storeData as any).distance} Km`
          : "";

        // Generate store images - prioritize banner, use logo only as last resort fallback
        // First image should be banner (main store picture), not logo
        // Handle banner as array or string (backward compatibility)
        const getBannerArray = (): string[] => {
          if (!storeData.image) {
            return storeData.logo ? [storeData.logo] : ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=1100&fit=crop&crop=center"];
          }
          if (Array.isArray(storeData.image)) {
            return storeData.image.length > 0 ? storeData.image : (storeData.logo ? [storeData.logo] : ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=1100&fit=crop&crop=center"]);
          }
          return [storeData.image];
        };
        
        const bannerImages = getBannerArray();
        const storeImages = bannerImages.map((uri, index) => ({ 
          id: `banner-${index + 1}`, 
          uri: typeof uri === 'string' ? uri : String(uri)
        }));
        
        // Only include logo as separate image if it exists and is different from all banner images
        if (storeData.logo && !bannerImages.includes(storeData.logo)) {
          storeImages.push({ id: "logo", uri: storeData.logo });
        }

        return {
          id: storeData.id,
          title: storeData.name || storeData.title || "Store",
          description: storeData.description || `Discover amazing products and services at ${storeData.name}.`,
          price: "View Products", // Store page - not a single product
          location: fullLocation,
          distance: distanceStr,
          isOpen: (() => {
            // Calculate isOpen based on operationalInfo hours if available
            const storeDataToUse = fullStoreDataRef.current;
            if (storeDataToUse?.operationalInfo?.hours) {
              const now = new Date();
              const currentDayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(); // 'monday', 'tuesday', etc.
              const dayHours = storeDataToUse.operationalInfo.hours[currentDayName as keyof typeof storeDataToUse.operationalInfo.hours];
              
              if (dayHours && !dayHours.closed && dayHours.open && dayHours.close) {
                const [openHour, openMin] = dayHours.open.split(':').map(Number);
                const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
                const currentTime = now.getHours() * 60 + now.getMinutes();
                const openTime = openHour * 60 + openMin;
                const closeTime = closeHour * 60 + closeMin;
                return currentTime >= openTime && currentTime <= closeTime;
              }
              return dayHours?.closed === false || dayHours?.closed === undefined;
            }
            return true; // Default to open if hours not available
          })(),
          images: storeImages,
          logo: storeData.logo || '', // Add logo to productData for circular display
          cashbackPercentage: typeof storeData.cashback === 'object'
            ? storeData.cashback.percentage?.toString() || "10"
            : storeData.cashback?.toString() || "10",
          storeName: storeData.name || storeData.title || "Store",
          storeId: storeData.id,
          category: storeData.category || "General",
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
      setError("Failed to share product.");
    } finally {
      setIsLoading(false);
    }
  }, [productData]);

  const handleFavoritePress = useCallback(async () => {
    if (!isAuthenticated) {
      showAlert(
        'Sign In Required',
        'Please sign in to follow stores and get updates on their offers.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/sign-in') },
        ],
        'info'
      );
      return;
    }

    const storeIdToUse = storeIdParam || storeData?.id || productData.storeId;
    if (!storeIdToUse) {
      showAlert('Error', 'Store information not available', undefined, 'error');
      return;
    }

    setIsFollowLoading(true);
    try {
      if (isFavorited) {
        // Unfollow store
        const response = await wishlistApi.removeFromWishlist('store', storeIdToUse);
        if (response.success) {
          setIsFavorited(false);
          showAlert(
            'Unfollowed',
            `You've unfollowed ${productData.title || productData.storeName}.`,
            undefined,
            'info'
          );
        } else {
          showAlert('Error', response.message || 'Failed to unfollow store', undefined, 'error');
        }
      } else {
        // Follow store
        const response = await wishlistApi.addToWishlist({
          itemType: 'store',
          itemId: storeIdToUse,
          notes: `Following ${productData.title || productData.storeName}`,
          priority: 'medium',
        });

        if (response.success) {
          setIsFavorited(true);
          showAlert(
            'Store Followed!',
            `You're now following ${productData.title || productData.storeName}. You'll see their latest offers in your feed.`,
            undefined,
            'success'
          );
        } else {
          showAlert('Error', response.message || 'Failed to follow store', undefined, 'error');
        }
      }
    } catch (error) {
      showAlert('Error', 'Something went wrong. Please try again.', undefined, 'error');
    } finally {
      setIsFollowLoading(false);
    }
  }, [isAuthenticated, isFavorited, storeIdParam, storeData?.id, productData.storeId, productData.title, productData.storeName, router]);

  // FIX: Allow reopening modals even if tab is already active
  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);

    if (tab === "about") {
      setShowAboutModal(true);
    } else if (tab === "deals") {
      setShowDealsModal(true);
    } else if (tab === "reviews") {
      setShowReviewModal(true);
    }
  }, [isDynamic, storeData, fetchedStoreData]);

  const handleCloseAboutModal = useCallback(() => setShowAboutModal(false), []);
  const handleCloseDealsModal = useCallback(() => setShowDealsModal(false), []);
  const handleCloseReviewModal = useCallback(() => setShowReviewModal(false), []);
  const handleWriteReview = useCallback(() => {
    if (canReview === false) {
      platformAlert(
        'Already Reviewed',
        'You have already reviewed this store. You can edit your existing review from your profile.',
        [{ text: 'OK' }]
      );
      return;
    }
    setShowReviewModal(false); // Close review modal first
    setTimeout(() => {
      setShowWriteReviewModal(true); // Open write review modal
    }, 300);
  }, [canReview]);
  const handleCloseWriteReviewModal = useCallback(() => setShowWriteReviewModal(false), []);
  const handleReviewSubmitted = useCallback(async (review: any) => {
    // Refresh reviews after submission
    if (reviewStoreId) {
      // Refetch reviews to show the new review
      if (refetchReviews) {
        await refetchReviews();
      }
      // Note: Store data will be refetched automatically via useEffect when reviewStats change
      // Show success message
      platformAlert(
        'Review Submitted',
        'Your review has been submitted successfully! It will be visible after merchant approval.',
        [{ text: 'OK' }]
      );
    }
  }, [reviewStoreId, refetchReviews]);

  const handleViewAllPress = useCallback(() => {
    platformAlert("UGC", "View all UGC");
  }, []);

  const handleImagePress = useCallback((imageId: string) => {
    platformAlert("Image", imageId);
  }, []);

  const handleAddToCart = useCallback(() => {
    const cartItem: CartItemFromProduct = {
      id: productData.id,
      name: productData.title,
      price: parsePrice(productData.price), // Use safe price parser
      image: productData.images[0]?.uri || "",
      cashback: `${productData.cashbackPercentage} cashback`,
      category: "products",
    };
    platformAlert("Added to Cart", `${productData.title} has been added to your cart.`);
  }, [productData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refetch store data if storeId is provided
      if (storeIdParam && !storeDataParam) {
        await refetchStore();
      } else {
        // Simulate refresh delay for smooth animation
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // In a real implementation, you would also:
      // - Reload products
      // - Refresh UGC content
      // - Update promotions/discounts

    } catch (error) {
      console.error('❌ [MainStorePage] Refresh error:', error);
      setError('Failed to refresh store data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleVisitStorePress = useCallback(() => {
    platformAlert("Visit Store", `Open ${productData.storeName}`);
  }, [productData.storeName]);

  const handleBackPress = useCallback(() => router.back(), [router]);

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
          subtitle={isDynamic && storeData ? (() => {
            const storeDataToUse = fullStoreDataRef.current;
            // Use reviewStats if available (more up-to-date), otherwise fall back to store data
            const rating = reviewStats?.averageRating || storeData.rating || storeDataToUse?.ratings?.average || 0;
            const ratingCount = reviewStats?.totalReviews || storeData.ratingCount || storeDataToUse?.ratings?.count || 0;
            const deliveryTime = storeData.deliveryTime || storeDataToUse?.operationalInfo?.deliveryTime || '30-45 mins';
            return `⭐ ${rating.toFixed(1)} (${ratingCount}) • ${deliveryTime}`;
          })() : undefined}
          onBack={handleBackPress}
        />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isWeb && styles.webScrollContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8B5CF6', '#7C3AED']} // Android
            tintColor="#8B5CF6" // iOS
            title="Pull to refresh" // iOS
            titleColor="#666"
          />
        }
      >
        <View style={[
          styles.contentWrapper,
          MAX_CONTENT_WIDTH && { maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%' }
        ]}>
          {/* SKELETON LOADING STATE - Amazon/Flipkart Style */}
          {pageLoading ? (
            <>
              {/* Promotion Banners Skeleton */}
              <PromotionBannerSkeleton count={2} />

              {/* Store Header Skeleton */}
              <StoreHeaderSkeleton />

              {/* Products Grid Skeleton */}
              <View style={{ paddingHorizontal: HORIZONTAL_PADDING, marginTop: 20 }}>
                <ProductGridSkeleton count={6} />
              </View>
            </>
          ) : (
            <>
            <View style={styles.imageSection}>
              <View style={styles.imageCard}>
                <ProductDisplay
                  images={productData.images}
                  onSharePress={handleSharePress}
                  onFavoritePress={handleFavoritePress}
                  isFavorited={isFavorited}
                />
                {/* Circular Logo Overlay - Positioned at bottom */}
                {productData.logo && (
                  <View style={styles.logoOverlay}>
                    <View style={styles.logoContainer}>
                      <Image
                        source={{ uri: productData.logo }}
                        style={styles.logoImage}
                        resizeMode="cover"
                      />
                    </View>
                  </View>
                )}
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

            {/* Cashback Offer */}
            <View style={styles.sectionCard}>
              <CashbackOffer
                percentage={productData.cashbackPercentage}
                title="Cash back"
                onPress={() => platformAlert('Cashback Details', `Get ${productData.cashbackPercentage}% cashback on purchases from this store!`)}
              />
            </View>

            {/* Store Products Grid */}
            {isDynamic && storeData && (
              <View style={styles.sectionCard}>
                <ErrorBoundary>
                  <StoreProducts storeId={productData.storeId} storeName={productData.storeName} />
                </ErrorBoundary>
              </View>
            )}

            {/* Frequently Bought Together */}
            {isDynamic && storeData && (
              <View style={styles.sectionCard}>
                <ErrorBoundary>
                  <FrequentlyBoughtTogether
                    currentProduct={{
                      id: productData.id,
                      type: 'product',
                      name: productData.title,
                      brand: productData.storeName,
                      image: productData.images[0]?.uri || '',
                      title: productData.title,
                      description: productData.description,
                      price: {
                        current: parsePrice(productData.price, { fallback: 1000 }), // Use safe price parser
                        currency: 'INR',
                        discount: 0,
                      },
                      category: productData.category,
                      availabilityStatus: productData.isOpen ? 'in_stock' : 'out_of_stock',
                      tags: [],
                    }}
                    onBundleAdded={() => {
                      platformAlert('Added to Cart', 'Bundle products have been added to your cart!');
                    }}
                  />
                </ErrorBoundary>
              </View>
            )}

            {/* Cross-Store Products Recommendations */}
            {(() => {
              return (
                <View style={styles.sectionCard}>
                  <ErrorBoundary>
                    <CrossStoreProductsSection
                      currentStoreId={productData.storeId}
                      limit={10}
                      onProductPress={(productId, product) => {
                        router.push({
                          pathname: '/ProductPage',
                          params: { cardId: productId, cardType: 'product' }
                        } as any);
                      }}
                    />
                  </ErrorBoundary>
                </View>
              );
            })()}

            <View style={styles.sectionCard}>
              {(() => {
                return (
                  <ErrorBoundary>
                    <UGCSection
                      storeId={productData.storeId}
                      onViewAllPress={handleViewAllPress}
                      onImagePress={handleImagePress}
                    />
                  </ErrorBoundary>
                );
              })()}
            </View>

            {/* Additional Store Sections */}
            {/* Store Gallery Section - Replaces old Section1 with real API data */}
            {storeIdParam ? (
              <View style={styles.sectionCard}>
                <ErrorBoundary>
                  <StoreGallerySection storeId={storeIdParam} />
                </ErrorBoundary>
              </View>
            ) : (
              // Fallback to old Section1 if no storeId (for backward compatibility)
              <View style={styles.sectionCard}>
                <Section1 dynamicData={isDynamic && storeData ? {
                  ...storeData,
                  // Ensure location is properly formatted
                  location: typeof storeData.location === 'object'
                    ? (storeData.location as LocationData)
                    : storeData.location
                } : null} />
              </View>
            )}

            <View style={styles.sectionCard}>
              <Section2 dynamicData={isDynamic && storeData ? {
                store: {
                  phone: (storeData as any).phone || (storeData as any).contact?.phone,
                  contact: (storeData as any).contact?.phone || (storeData as any).phone,
                  email: (storeData as any).contact?.email || (storeData as any).email,
                  location: typeof storeData.location === 'object' ? {
                    lat: (storeData.location as any).lat,
                    lng: (storeData.location as any).lng,
                    address: (storeData.location as LocationData).address || (storeData.location as LocationData).city
                  } : undefined
                },
                id: storeData.id, // This is the storeId for navigation
                _id: storeData.id,
                name: storeData.name,
                title: storeData.title,
                contact: storeData.contact,
              } : null} />
            </View>

            <View style={styles.sectionCard}>
              <ErrorBoundary>
                <Section3 productPrice={parsePrice(productData.price, { fallback: 1000 })} storeId={productData.storeId} />
              </ErrorBoundary>
            </View>

            <View style={styles.sectionCard}>
              <ErrorBoundary>
                <Section4 
                  productPrice={parsePrice(productData.price, { fallback: 1000 })} 
                  storeId={productData.storeId}
                  onPress={() => {
                    router.push({
                      pathname: '/CardOffersPage',
                      params: {
                        storeId: productData.storeId,
                        storeName: productData.storeName,
                        orderValue: parsePrice(productData.price, { fallback: 1000 }).toString(),
                      },
                    } as any);
                  }}
                />
              </ErrorBoundary>
            </View>

            <View style={styles.sectionCard}>
              <FollowStoreSection
                storeData={isDynamic && storeData ? {
                  id: storeData.id,
                  _id: storeData.id,
                  name: (storeData as any).name || (storeData as any).title,
                  title: (storeData as any).title || (storeData as any).name,
                  image: (storeData as any).image,
                  logo: (storeData as any).logo,
                  category: (storeData as any).category,
                  cashback: typeof (storeData as any).cashback === 'number'
                    ? (storeData as any).cashback
                    : (storeData as any).cashback?.percentage,
                  discount: typeof (storeData as any).discount === 'number'
                    ? (storeData as any).discount
                    : undefined,
                } : null}
                isFollowingProp={isFavorited}
                onFollowChange={setIsFavorited}
              />
            </View>

            <View style={styles.sectionCard}>
              <ErrorBoundary>
                <Section6 dynamicData={isDynamic && storeData ? {
                  id: storeData.id,
                  _id: storeData.id,
                  title: (storeData as any).title || (storeData as any).name,
                  name: (storeData as any).name || (storeData as any).title,
                  store: {
                    id: storeData.id,
                    _id: storeData.id,
                    name: (storeData as any).name || (storeData as any).title
                  }
                } : null} />
              </ErrorBoundary>
            </View>

            {/* Similar Stores Recommendations */}
            {(() => {
              return (
                <View style={styles.sectionCard}>
                  <ErrorBoundary>
                    <SimilarStoresSection
                      currentStoreId={productData.storeId}
                      currentStoreCategory={isDynamic && storeData ? storeData.category : undefined}
                      limit={8}
                      onStorePress={(storeId, storeData) => {
                        router.push({
                          pathname: '/MainStorePage',
                          params: {
                            storeId: storeId,
                            storeData: JSON.stringify(storeData),
                            storeType: 'dynamic'
                          }
                        } as any);
                      }}
                    />
                  </ErrorBoundary>
                </View>
              );
            })()}

            <View style={styles.sectionCard}>
              <CombinedSection78 />
            </View>

          </>
        )}
        </View>
      </ScrollView>
      {error && (
        <View style={styles.errorToast}>
          <TouchableOpacity onPress={() => setError(null)} activeOpacity={0.8}>
            <View style={styles.errorInner}>
              <View style={styles.errorDot} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* LAZY LOADED MODALS - Only loaded when user opens them */}
      {/* This reduces initial bundle size by ~150KB (3 modals × 50KB each) */}

      {showAboutModal && (
        <Suspense fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#7C3AED" /></View>}>
          <LazyAboutModal
            visible={showAboutModal}
            onClose={handleCloseAboutModal}
            storeData={(() => {
              // CRITICAL: Always prioritize fullStoreDataRef.current (raw API response)
              // This has ALL fields: location (with state, pincode, landmark), contact, operationalInfo, description
              const storeDataToUse = fullStoreDataRef.current || fetchedStoreData;
              
              // Use storeDataToUse if available (has full API data), otherwise fall back to storeData
              if (isDynamic && storeData && (storeDataToUse || storeData)) {
                // CRITICAL: Always use the raw location from storeDataToUse (fullStoreDataRef.current)
                // This has the complete location object with all fields from the API
                // storeData.location might be transformed/combined, so we use the raw API data
                const rawLocation = storeDataToUse?.location;
                
                // Ensure we have the location object with all fields
                // Priority: storeDataToUse.location (raw API) > storeData.location (transformed)
                let location: any = {};
                if (rawLocation && typeof rawLocation === 'object' && rawLocation !== null) {
                  // Use the raw location object directly - it has all fields (state, pincode, landmark, etc.)
                  location = rawLocation;
                } else if (storeData?.location && typeof storeData.location === 'object' && storeData.location !== null) {
                  // Fallback to storeData.location if rawLocation is not available
                  location = storeData.location;
                }
                
                
                const hours = storeDataToUse?.operationalInfo?.hours || storeData?.operationalInfo?.hours || {};
                
                // Format address from location object
                // Backend stores: address, city, state, pincode, landmark
                // AboutModal expects: doorNo, floor, street, area, city, state, pinCode
                const formatAddress = () => {
                  if (typeof location === 'string') {
                    // If location is a string, use it as street address
                    return {
                      doorNo: '',
                      floor: '',
                      street: location,
                      area: '',
                      city: '',
                      state: '',
                      pinCode: '',
                    };
                  }
                  if (typeof location === 'object' && location !== null) {
                    // Map backend fields to AboutModal format
                    // address -> street, landmark -> area
                    // Ensure we extract all fields from the location object
                    return {
                      doorNo: '', // Not collected in merchant form
                      floor: '', // Not collected in merchant form
                      street: location.address || location.street || '',
                      area: location.landmark || location.area || '',
                      city: location.city || '',
                      state: location.state || '',
                      pinCode: location.pincode || location.pinCode || location.zipCode || '',
                    };
                  }
                  return {
                    doorNo: '',
                    floor: '',
                    street: '',
                    area: '',
                    city: '',
                    state: '',
                    pinCode: '',
                  };
                };

                // Format hours from operationalInfo
                const formatHours = () => {
                  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                  
                  return days.map((day, idx) => {
                    const dayHours = hours[day as keyof typeof hours];
                    if (dayHours && !dayHours.closed && dayHours.open && dayHours.close) {
                      return {
                        day: dayNames[idx],
                        time: `${dayHours.open} - ${dayHours.close}`,
                      };
                    }
                    return {
                      day: dayNames[idx],
                      time: "Closed",
                    };
                  });
                };

                // Format categories - handle both object and string formats
                const categoryName = typeof storeDataToUse.category === 'object' 
                  ? (storeDataToUse.category?.name || storeDataToUse.category?.toString() || '')
                  : (storeDataToUse.category || '');
                
                const categoriesList = categoryName 
                  ? [categoryName, ...(storeDataToUse.tags || [])]
                  : (storeDataToUse.tags && storeDataToUse.tags.length > 0 
                      ? storeDataToUse.tags 
                      : ["General"]);

                // Extract contact info - prioritize storeDataToUse (raw API data)
                const contactFromStore = storeDataToUse.contact || storeData.contact;
                const contactData = contactFromStore && (
                  contactFromStore.phone || 
                  contactFromStore.email || 
                  contactFromStore.website || 
                  contactFromStore.whatsapp
                ) ? contactFromStore : undefined;
                
                
                // Extract operational info - prioritize storeDataToUse (raw API data)
                const operationalData = storeDataToUse.operationalInfo || storeData.operationalInfo;
                
                
                // Extract description - prioritize storeDataToUse (raw API data)
                const descriptionData = (storeDataToUse.description || storeData.description || '').trim() || undefined;
                
                
                // Build delivery info only if operationalData exists and has relevant fields
                const deliveryInfoData = operationalData && (
                  (operationalData.deliveryTime && operationalData.deliveryTime.trim()) || 
                  (operationalData.minimumOrder !== undefined && operationalData.minimumOrder !== null) || 
                  (operationalData.deliveryFee !== undefined && operationalData.deliveryFee !== null) || 
                  (operationalData.freeDeliveryAbove !== undefined && operationalData.freeDeliveryAbove !== null)
                ) ? {
                  deliveryTime: operationalData.deliveryTime?.trim() || undefined,
                  minimumOrder: (operationalData.minimumOrder !== undefined && operationalData.minimumOrder !== null) ? operationalData.minimumOrder : undefined,
                  deliveryFee: (operationalData.deliveryFee !== undefined && operationalData.deliveryFee !== null) ? operationalData.deliveryFee : undefined,
                  freeDeliveryAbove: (operationalData.freeDeliveryAbove !== undefined && operationalData.freeDeliveryAbove !== null) ? operationalData.freeDeliveryAbove : undefined,
                } : undefined;

                const aboutModalData = {
                  name: storeData?.name || storeData?.title || productData.storeName,
                  description: descriptionData,
                  establishedYear: (storeDataToUse as any).establishedYear || new Date((storeDataToUse.createdAt || Date.now()).toString()).getFullYear(),
                  address: formatAddress(),
                  contact: contactData,
                  deliveryInfo: deliveryInfoData,
                  isOpen: productData.isOpen,
                  categories: categoriesList,
                  hours: formatHours(),
                };
                
                
                return aboutModalData;
              }
              
              // Fallback to default data
              return {
                name: productData.storeName,
                description: undefined,
              establishedYear: 2020,
              address: {
                  doorNo: "",
                  floor: "",
                  street: productData.location || "",
                  area: "",
                  city: "",
                  state: "",
                  pinCode: "",
                },
                contact: undefined,
                deliveryInfo: undefined,
              isOpen: productData.isOpen,
                categories: ["General"],
              hours: [
                { day: "Monday", time: "10:00 AM - 6:00 PM" },
                { day: "Tuesday", time: "10:00 AM - 6:00 PM" },
                { day: "Wednesday", time: "10:00 AM - 6:00 PM" },
                { day: "Thursday", time: "10:00 AM - 6:00 PM" },
                { day: "Friday", time: "10:00 AM - 6:00 PM" },
                { day: "Saturday", time: "10:00 AM - 6:00 PM" },
                { day: "Sunday", time: "Closed" },
              ],
              };
            })()}
          />
        </Suspense>
      )}

      {showDealsModal && (
        <Suspense fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#7C3AED" /></View>}>
          <LazyWalkInDealsModal
            visible={showDealsModal}
            onClose={handleCloseDealsModal}
            storeId={productData.storeId}
          />
        </Suspense>
      )}

      {showReviewModal && (
        <Suspense fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#7C3AED" /></View>}>
          <LazyReviewModal
            visible={showReviewModal}
            onClose={handleCloseReviewModal}
            storeName={isDynamic && storeData ? storeData.name || storeData.title : productData.storeName}
            storeId={reviewStoreId || productData.storeId}
            averageRating={
              reviewStats?.averageRating || 
              (isDynamic && storeData?.rating ? storeData.rating : 0)
            }
            totalReviews={
              reviewStats?.totalReviews || 
              (isDynamic && storeData?.ratingCount ? storeData.ratingCount : 0)
            }
            ratingBreakdown={
              Object.keys(reviewRatingBreakdown).some(k => reviewRatingBreakdown[k as unknown as keyof typeof reviewRatingBreakdown] > 0)
                ? {
                    fiveStars: reviewRatingBreakdown[5] || 0,
                    fourStars: reviewRatingBreakdown[4] || 0,
                    threeStars: reviewRatingBreakdown[3] || 0,
                    twoStars: reviewRatingBreakdown[2] || 0,
                    oneStar: reviewRatingBreakdown[1] || 0,
                  }
                : {
                    fiveStars: 0,
                    fourStars: 0,
                    threeStars: 0,
                    twoStars: 0,
                    oneStar: 0,
                  }
            }
            reviews={storeReviews}
            onLikeReview={handleReviewLike}
            onReportReview={handleReviewReport}
            onHelpfulReview={handleReviewHelpful}
            onWriteReview={canReview !== false ? handleWriteReview : undefined}
            ugcContent={ugcContent}
            ugcLoading={ugcLoading}
          />
        </Suspense>
      )}

      {showWriteReviewModal && (
        <WriteReviewModal
          visible={showWriteReviewModal}
          onClose={handleCloseWriteReviewModal}
          storeId={reviewStoreId || productData.storeId}
          storeName={isDynamic && storeData ? storeData.name || storeData.title : productData.storeName}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}


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
      paddingBottom: 180,
      paddingTop: 0, // Remove top padding for edge-to-edge header
    },
    webScrollContent: {
      // Web-specific scroll styles
      paddingBottom: Platform.OS === 'web' ? 200 : 180,
    },
    contentWrapper: {
      // Wrapper for max-width constraint on web/desktop
      flex: 1,
    },
    imageSection: {
      paddingHorizontal: HORIZONTAL_PADDING,
      paddingTop: 16,
      paddingBottom: 16, // Increased bottom padding to accommodate logo overlay (half outside)
    },
    imageCard: {
      backgroundColor: "#fff",
      borderRadius: 24,
      overflow: "visible", // Changed to visible to allow logo to extend outside
      shadowColor: "#7C3AED",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 12,
      padding: 0,
      borderWidth: 0,
      position: "relative",
      marginBottom: 0, // No margin needed since logo is positioned absolutely
    },
    tabsContainer: {
      marginTop: 24,
      marginHorizontal: HORIZONTAL_PADDING,
      marginBottom: 12,
    },
    sectionCard: {
      marginHorizontal: HORIZONTAL_PADDING,
      marginTop: 20,
      backgroundColor: "#fff",
      borderRadius: 20,
      paddingVertical: 20,
      paddingHorizontal: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: "rgba(0, 0, 0, 0.04)",
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
      bottom: Platform.OS === "ios" ? 34 : 16,
    },
    errorToast: {
      position: "absolute",
      left: HORIZONTAL_PADDING + 4,
      right: HORIZONTAL_PADDING + 4,
      top: Platform.OS === "ios" ? 60 : 44,
    },
    logoOverlay: {
      position: "absolute",
      bottom: -1, // Positioned below the image card (half outside for modern look)
      left: 20,
      zIndex: 10,
      // Add subtle background for better visibility
      backgroundColor: "rgba(255, 255, 255, 0.98)",
      borderRadius: 40,
      padding: 6,
      // Enhanced shadow for separation from image
      shadowColor: "#7C3AED",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 10,
      borderWidth: 1,
      borderColor: "rgba(124, 58, 237, 0.1)",
    },
    logoContainer: {
      width: 72, // Reduced from 100 to 72 for better proportion
      height: 72, // Reduced from 100 to 72 for better proportion
      borderRadius: 36,
      backgroundColor: "#fff",
      borderWidth: 3, // Reduced border width
      borderColor: "#fff",
      overflow: "hidden",
    },
    logoImage: {
      width: "100%",
      height: "100%",
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
