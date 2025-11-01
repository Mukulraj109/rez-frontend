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
} from "./MainStoreSection";
import { MainStoreProduct, MainStorePageProps, CartItemFromProduct } from "@/types/mainstore";
import AboutModal from "@/components/AboutModal";
import WalkInDealsModal from "@/components/WalkInDealsModal";
import ReviewModal from "@/components/ReviewModal";
import { mockReviews, mockRatingBreakdown, mockReviewStats } from "@/utils/mock-reviews-data";
import reviewsApi from "@/services/reviewsApi";
import storesApi from "@/services/storesApi";

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

export default function MainStorePage({ productId, initialProduct }: MainStorePageProps = {}) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [screenData, setScreenData] = useState(Dimensions.get("window"));
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Dynamic store data state
  const [storeData, setStoreData] = useState<DynamicStoreData | null>(null);
  const [isDynamic, setIsDynamic] = useState(false);
  const [storeVideos, setStoreVideos] = useState<any[]>([]);

  // Parse dynamic store data from navigation params OR fetch from API if only storeId provided
  useEffect(() => {
    const loadStoreData = async () => {
      // If only storeId is provided (Visit Store button clicked), fetch from API
      if (params.storeId && !params.storeData) {
        try {

          const storeResponse = await storesApi.getStoreById(params.storeId as string);

          if (storeResponse.success && storeResponse.data) {
            const responseData = storeResponse.data;
            const backendStore = (responseData as any).store || responseData;

            // Transform backend store data
            const transformedData = transformBackendStoreData(backendStore as BackendStoreData);
            setStoreData(transformedData);
            setIsDynamic(true);

            // Transform store videos to UGC format
            if (backendStore.videos && backendStore.videos.length > 0) {
              const ugcVideos = backendStore.videos.map((video: any, index: number) => ({
                id: `store-video-${index}`,
                videoUrl: video.url,
                uri: video.thumbnail || backendStore.banner || backendStore.logo,
                viewCount: '0', // Can be updated if you track views
                description: video.title || `${backendStore.name} - Video ${index + 1}`,
                category: backendStore.category?.name || 'Store Video',
                author: backendStore.name,
                productThumb: backendStore.logo || backendStore.banner,
                productTitle: backendStore.name,
                productPrice: '',
              }));
              setStoreVideos(ugcVideos);

            }
          }
        } catch (error) {
          console.error('❌ [MAINSTORE] Failed to fetch store data:', error);
          setIsDynamic(false);
        }
      }
      // If storeData is provided in params (navigated from search/home)
      else if (params.storeData && params.storeId) {
        try {
          const parsedData = JSON.parse(params.storeData as string);

          // Check if it's backend store data (has _id) or legacy data (has id)
          let transformedData: DynamicStoreData;

          if (parsedData._id) {
            // New backend store data format
            transformedData = transformBackendStoreData(parsedData as BackendStoreData);

            // Transform store videos if available
            if (parsedData.videos && parsedData.videos.length > 0) {
              const ugcVideos = parsedData.videos.map((video: any, index: number) => ({
                id: `store-video-${index}`,
                videoUrl: video.url,
                uri: video.thumbnail || parsedData.banner || parsedData.logo,
                viewCount: '0',
                description: video.title || `${parsedData.name} - Video ${index + 1}`,
                category: parsedData.category?.name || 'Store Video',
                author: parsedData.name,
                productThumb: parsedData.logo || parsedData.banner,
                productTitle: parsedData.name,
                productPrice: '',
              }));
              setStoreVideos(ugcVideos);
            }
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
  }, [params]);

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

        // Build images array - use banner, logo, or defaults
        const storeImages = [
          { id: "1", uri: storeData.banner || storeData.image || storeData.logo || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900" },
          { id: "2", uri: storeData.logo || storeData.banner || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=900" },
          { id: "3", uri: storeData.banner || storeData.logo || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900" },
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
    Alert.alert("Image", imageId);
  }, []);

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

  const handleVisitStorePress = useCallback(() => {
    // Get store ID from dynamic store data or product data
    const storeId = isDynamic && storeData ? storeData.id : params.storeId || productData.storeId;

    if (!storeId) {
      Alert.alert("Error", "Store information is not available");
      return;
    }

    // Navigate to MainStorePage with storeId to show store details and videos
    router.push(`/MainStorePage?storeId=${storeId}`);
  }, [isDynamic, storeData, params.storeId, productData.storeId, router]);

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
          onBack={handleBackPress} 
        />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
            onViewAllPress={handleViewAllPress}
            onImagePress={handleImagePress}
            images={storeVideos.length > 0 ? storeVideos : undefined}
          />
        </View>
      </ScrollView>

      <View style={styles.fixedBottom}>
        <VisitStoreButton onPress={handleVisitStorePress} loading={isLoading} disabled={!!error} />
      </View>

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

      <WalkInDealsModal visible={showDealsModal} onClose={handleCloseDealsModal} storeId={productData.storeId} />

      <ReviewModal
        visible={showReviewModal}
        onClose={handleCloseReviewModal}
        storeName={isDynamic && storeData ? storeData.name || storeData.title : productData.storeName}
        storeId={productData.storeId}
        averageRating={isDynamic && storeData?.rating ? storeData.rating : mockReviewStats.averageRating}
        totalReviews={isDynamic && storeData?.ratingCount ? storeData.ratingCount : mockReviewStats.totalReviews}
        ratingBreakdown={ratingBreakdown}
        reviews={reviewsLoading ? mockReviews : storeReviews.length > 0 ? storeReviews : mockReviews}
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
      paddingBottom: 100,
      paddingTop: 16,
    },
    imageSection: {
      paddingHorizontal: HORIZONTAL_PADDING,
      paddingTop: 16,
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
