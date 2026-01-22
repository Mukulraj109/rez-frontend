import React, { Suspense, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  RefreshControl,
  Platform,
  InteractionManager,
  Image,
  Animated,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, ClipPath, Image as SvgImage, Text as SvgText, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import MaskedView from '@react-native-masked-view/masked-view';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { ThemedText } from '@/components/ThemedText';
import {
  HorizontalScrollSection,
  EventCard,
  StoreCard,
  ProductCard,
  BrandedStoreCard,
  RecommendationCard,
  ReZCoin,
  CategoryTabBar,
  StickySearchHeader,
  PopularProductsSection,
  NearbyProductsSection,
  HotDealsSection,
  FeaturedCategoriesContainer,
  BestDiscountSection,
  BestSellerSection,
  QuickActionsSection,
  HeroBanner,
  StoreDiscoverySection,
} from '@/components/homepage';
import { SectionSkeleton } from '@/components/homepage/skeletons';
import HomeTabSection, { TabId } from '@/components/homepage/HomeTabSection';
import MallHeroBanner from '@/components/mall/MallHeroBanner';
import HowRezWorksCard from '@/components/homepage/HowRezWorksCard';
import EarnRezCoinsSection from '@/components/homepage/EarnRezCoinsSection';
import PlayAndEarnSectionV2 from '@/components/homepage/PlayAndEarnSectionV2';
import NewOnRezSection from '@/components/homepage/NewOnRezSection';
import EventsExperiencesSection from '@/components/homepage/EventsExperiencesSection';
import ShopByCategorySection from '@/components/homepage/ShopByCategorySection';
import BeautyWellnessSection from '@/components/homepage/BeautyWellnessSection';
import FitnessSportsSection from '@/components/homepage/FitnessSportsSection';
import GroceryEssentialsSection from '@/components/homepage/GroceryEssentialsSection';
import HealthcareSection from '@/components/homepage/HealthcareSection';
import HomeServicesSection from '@/components/homepage/HomeServicesSection';
import FinancialServicesSection from '@/components/homepage/FinancialServicesSection';
import TravelSection from '@/components/homepage/TravelSection';
import ExcitingDealsSection from '@/components/homepage/ExcitingDealsSection';
import ShopByExperienceSection from '@/components/homepage/ShopByExperienceSection';
import { useMallSection } from '@/hooks/useMallSection';
import PromoBanner from '@/components/homepage/PromoBanner';
import GlobeBanner from '@/components/homepage/GlobeBanner';
import RecentlyViewedSection from '@/components/category/RecentlyViewedSection';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import GoingOutSection from '@/components/homepage/GoingOutSection';
import HomeDeliverySection from '@/components/homepage/HomeDeliverySection';
import ServiceSection from '@/components/homepage/ServiceSection';
import DealsThatSaveMoney from '@/components/homepage/DealsThatSaveMoney';
import WalletSnapshotCard from '@/components/homepage/WalletSnapshotCard';
import LoyaltyRewardsHubCard from '@/components/homepage/LoyaltyRewardsHubCard';
import FeatureTryCards from '@/components/homepage/FeatureTryCards';
import { useLoyaltySection } from '@/hooks/useLoyaltySection';
import StoresNearYou from '@/components/homepage/StoresNearYou';
import PickedForYou from '@/components/homepage/PickedForYou';
import BrandPartnerships from '@/components/homepage/BrandPartnerships';
import StreaksGamification from '@/components/homepage/StreaksGamification';
import TrendingNearYou from '@/components/homepage/TrendingNearYou';
import FlashSales from '@/components/homepage/FlashSales';
import ZeroEMICard from '@/components/homepage/ZeroEMICard';
import { StoreExperiencesSection } from '@/components/homepage/StoreExperiencesSection';
import PlayAndEarnSection from '@/components/homepage/PlayAndEarnSection';
import SocialProofSection from '@/components/homepage/SocialProofSection';
import { DiscoverAndShopSection } from '@/components/discover';
import MallSectionContainer from '@/components/mall/MallSectionContainer';
import CashStoreSectionContainer from '@/components/cash-store/CashStoreSectionContainer';
import { PriveSectionContainer, PriveMemberCard } from '@/components/prive';
import { usePriveSection } from '@/hooks/usePriveSection';
import CashbackSummaryHeaderCard from '@/components/cash-store/sections/CashbackSummaryHeaderCard';
import { useHomepage, useHomepageNavigation } from '@/hooks/useHomepage';
import { useCashStoreSection } from '@/hooks/useCashStoreSection';
import {
  EventItem,
  StoreItem,
  ProductItem,
  BrandedStoreItem,
  RecommendationItem,
  HomepageSectionItem,
} from '@/types/homepage.types';
import { useProfile, useProfileMenu } from '@/contexts/ProfileContext';
import { profileMenuSections } from '@/data/profileData';
import { GreetingDisplay, LocationDisplay, LocationPickerModal } from '@/components/location';
import { useCurrentLocation } from '@/hooks/useLocation';
import { AddressSearchResult } from '@/types/location.types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/authApi';
import TierBadge from '@/components/subscription/TierBadge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import NotificationBell from '@/components/common/NotificationBell';
import WhatsNewBadge from '@/components/common/WhatsNewBadge';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import categoriesApi from '@/services/categoriesApi';
import vouchersService from '@/services/realVouchersApi';
import realOffersApi from '@/services/realOffersApi';
import { useHomeTab } from '@/contexts/HomeTabContext';

// Lazy-loaded components (below-the-fold)
const ProfileMenuModal = React.lazy(() => import('@/components/profile/ProfileMenuModal'));
const NavigationShortcuts = React.lazy(() => import('@/components/navigation/NavigationShortcuts'));
const QuickAccessFAB = React.lazy(() => import('@/components/navigation/QuickAccessFAB'));
const FeatureHighlights = React.lazy(() => import('@/components/homepage/FeatureHighlights'));
const CategoryIconGrid = React.lazy(() => import('@/components/categories/CategoryIconGrid'));
const CategoryGridSkeleton = React.lazy(() => import('@/components/skeletons/CategoryGridSkeleton'));

// Fallback components for Suspense boundaries
const BelowFoldFallback = () => (
  <View style={{ paddingVertical: 20, alignItems: 'center' }}>
    <ActivityIndicator size="small" color="#00C06A" />
  </View>
);

const ModalFallback = () => null; // No loader for modals

const FABFallback = () => null; // No loader for FAB

// Badge/Shield shaped avatar component - green/golden light mix with person icon
interface BadgeAvatarProps {
  size?: number;
  color?: string;
}

const BadgeAvatar: React.FC<BadgeAvatarProps> = ({ size = 24, color }) => {
  const width = size;
  const height = size * 1.23;
  
  // Default to green, use provided color or theme-based color
  const shieldColor = color || '#4ADE80';
  const iconColor = color === '#0284C7' ? '#0EA5E9' : color === '#C9A962' ? '#D4AF37' : '#16A34A';

  // Shield path with tapered sides and smooth rounded bottom
  const shieldPath = `
    M ${width * 0.15} 0
    Q 0 0 0 ${height * 0.12}
    L 0 ${height * 0.55}
    Q 0 ${height * 0.7} ${width * 0.2} ${height * 0.78}
    Q ${width * 0.35} ${height * 0.88} ${width * 0.5} ${height * 0.92}
    Q ${width * 0.65} ${height * 0.88} ${width * 0.8} ${height * 0.78}
    Q ${width} ${height * 0.7} ${width} ${height * 0.55}
    L ${width} ${height * 0.12}
    Q ${width} 0 ${width * 0.85} 0
    Z
  `;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Path d={shieldPath} fill={shieldColor} />
      </Svg>
      <View style={{ position: 'absolute', width, height, justifyContent: 'center', alignItems: 'center', paddingBottom: height * 0.1 }}>
        <Ionicons name="person" size={size * 0.5} color={iconColor} />
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { state, actions } = useHomepage();
  const { handleItemPress, handleAddToCart } = useHomepageNavigation();
  const { user, isModalVisible, showModal, hideModal } = useProfile();
  const { handleMenuItemPress } = useProfileMenu();
  const { state: cartState, refreshCart } = useCart();
  const { state: authState, actions: authActions } = useAuth();
  const { state: subscriptionState, actions: subscriptionActions } = useSubscription();
  // Get mode context for 4-mode system
  const {
    activeTab,
    setActiveTab,
    priveEligibility,
    isPriveEligible,
    activeHomeTab,
    setActiveHomeTab,
    registerScrollToTop,
  } = useHomeTab();
  const [refreshing, setRefreshing] = React.useState(false);
  const [showDetailedLocation, setShowDetailedLocation] = React.useState(false);
  const [userPoints, setUserPoints] = React.useState(0);
  const [userStats, setUserStats] = React.useState<any>(null);
  const [syncStatus, setSyncStatus] = React.useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [isLoadingStats, setIsLoadingStats] = React.useState(false);
  const [interactionsComplete, setInteractionsComplete] = React.useState(false); // Deferred render flag
  const [selectedCategory, setSelectedCategory] = React.useState('for-you'); // Category tab state
  const [homeCategories, setHomeCategories] = React.useState<any[]>([]); // Homepage category icons
  const [categoriesLoading, setCategoriesLoading] = React.useState(true);
  // activeTab now comes directly from useHomeTab() context
  const [voucherCount, setVoucherCount] = React.useState(0); // Active voucher count
  const [newOffersCount, setNewOffersCount] = React.useState(0); // New offers count
  const [isLocationModalVisible, setIsLocationModalVisible] = React.useState(false); // Location picker modal
  const [totalSaved, setTotalSaved] = React.useState(0); // Total savings (cashback + refunds)

  // Handler for tab changes
  const handleTabChange = React.useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, [setActiveTab]);

  // Get current location hook for editable location
  const { currentLocation, updateLocation: updateUserLocation } = useCurrentLocation();

  // Get recently viewed items
  const { items: recentlyViewedItems, isLoading: isLoadingRecentlyViewed, refresh: refreshRecentlyViewed } = useRecentlyViewed();

  // Get mall section data for hero banners
  const { heroBanners: mallHeroBanners, isLoading: isMallLoading } = useMallSection();

  // Get cash store data for header card - only fetch when tab is active
  const {
    cashbackSummary: cashStoreSummary,
    isLoading: isCashStoreLoading
  } = useCashStoreSection({ autoFetch: activeTab === 'cash' });

  // Get loyalty section data for homepage cards - only fetch when near-u tab is active
  const {
    loyaltyHub,
    featuredLockProduct,
    trendingService,
    isLoading: isLoyaltySectionLoading
  } = useLoyaltySection({ autoFetch: activeTab === 'near-u' });

  // Get prive section data for member card in header - only fetch when prive tab is active
  const { userData: priveUserData } = usePriveSection();

  const animatedHeight = React.useRef(new Animated.Value(0)).current;
  const animatedOpacity = React.useRef(new Animated.Value(0)).current;
  const scrollY = React.useRef(new Animated.Value(0)).current; // For sticky header
  const statsLoadedRef = React.useRef(false); // Prevent redundant loads
  const lastFocusRefreshRef = React.useRef(0); // Throttle focus refreshes
  const scrollViewRef = React.useRef<Animated.ScrollView>(null); // ScrollView ref for scrollToTop

  // Initialize push notifications
  usePushNotifications();

  // Register scroll to top callback
  React.useEffect(() => {
    registerScrollToTop(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
  }, [registerScrollToTop]);

  // Defer heavy renders until after animations complete
  React.useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      setInteractionsComplete(true);
    });

    return () => handle.cancel();
  }, []);

  // Load homepage categories for icon grid
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const [goingOutRes, homeDeliveryRes] = await Promise.allSettled([
          categoriesApi.getCategories({ type: 'going_out' }),
          categoriesApi.getCategories({ type: 'home_delivery' }),
        ]);

        // Safely extract data from settled promises
        const goingOut = goingOutRes.status === 'fulfilled' 
          ? (Array.isArray(goingOutRes.value?.data) ? goingOutRes.value.data : 
             Array.isArray(goingOutRes.value) ? goingOutRes.value : [])
          : [];
        const homeDelivery = homeDeliveryRes.status === 'fulfilled'
          ? (Array.isArray(homeDeliveryRes.value?.data) ? homeDeliveryRes.value.data :
             Array.isArray(homeDeliveryRes.value) ? homeDeliveryRes.value : [])
          : [];

        const combined = [...goingOut, ...homeDelivery]
          .map((cat: any) => ({ ...cat, id: cat._id || cat.id || cat.slug }))
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .slice(0, 8);

        setHomeCategories(combined);
      } catch (error) {
        console.error('Failed to load homepage categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Load quick actions data (vouchers and new offers) - extracted as callback for reuse
  const loadQuickActionsData = useCallback(async () => {
    // Only load if user is authenticated
    if (!authState.isAuthenticated || !authState.user) {
      setVoucherCount(0);
      setNewOffersCount(0);
      return;
    }

    try {
      // Fetch active vouchers count - include BOTH gift card vouchers AND offer redemptions
      const [vouchersResponse, redemptionsResponse] = await Promise.all([
        vouchersService.getUserVouchers({
          status: 'active',
          page: 1,
          limit: 50,
        }).catch((error) => {
          console.error('❌ [HOME] Error fetching vouchers:', error);
          return { success: false, data: [], meta: undefined };
        }),
        realOffersApi.getUserRedemptions({
          status: 'active',
          page: 1,
          limit: 50,
        }).catch((error) => {
          console.error('❌ [HOME] Error fetching offer redemptions:', error);
          return { success: false, data: [], meta: undefined };
        }),
      ]);

      let totalVoucherCount = 0;

      // Count gift card vouchers
      if (vouchersResponse.success) {
        const activeVouchers = vouchersResponse.data || [];
        const paginationTotal = vouchersResponse.meta?.pagination?.total;
        totalVoucherCount += paginationTotal !== undefined ? paginationTotal : activeVouchers.length;
      }

      // Count offer redemptions
      if (redemptionsResponse.success) {
        const activeRedemptions = redemptionsResponse.data || [];
        const paginationTotal = redemptionsResponse.meta?.pagination?.total;
        totalVoucherCount += paginationTotal !== undefined ? paginationTotal : activeRedemptions.length;
      }

      // If we got 0 with 'active' status, try fetching all vouchers
      if (totalVoucherCount === 0) {
        const [allVouchersResponse, allRedemptionsResponse] = await Promise.all([
          vouchersService.getUserVouchers({ page: 1, limit: 50 }).catch(() => ({ success: false, data: [], meta: undefined })),
          realOffersApi.getUserRedemptions({ page: 1, limit: 50 }).catch(() => ({ success: false, data: [], meta: undefined })),
        ]);

        let allCount = 0;
        if (allVouchersResponse.success) {
          const paginationTotal = allVouchersResponse.meta?.pagination?.total;
          allCount += paginationTotal !== undefined ? paginationTotal : (allVouchersResponse.data || []).length;
        }
        if (allRedemptionsResponse.success) {
          const paginationTotal = allRedemptionsResponse.meta?.pagination?.total;
          allCount += paginationTotal !== undefined ? paginationTotal : (allRedemptionsResponse.data || []).length;
        }

        if (allCount > 0) {
          setVoucherCount(allCount);
          // Continue to load offers count
        }
      } else {
        setVoucherCount(totalVoucherCount);
      }

      // Fetch active offers count
      const offersResponse = await realOffersApi.getOffers({
        page: 1,
        limit: 1,
      }).catch(() => ({ success: false, data: { items: [], totalCount: 0 } }));

      if (offersResponse.success && offersResponse.data) {
        const totalOffersCount = offersResponse.data.totalCount || 0;
        setNewOffersCount(totalOffersCount);
      } else {
        // Fallback
        const fallbackResponse = await realOffersApi.getOffers({ page: 1, limit: 100 })
          .catch(() => ({ success: false, data: { items: [] } }));
        if (fallbackResponse.success && fallbackResponse.data) {
          setNewOffersCount(fallbackResponse.data.items?.length || 0);
        }
      }
    } catch (error) {
      console.error('❌ [HOME] Error loading quick actions data:', error);
    }
  }, [authState.isAuthenticated, authState.user]);

  // Initial load of quick actions data after interactions complete
  React.useEffect(() => {
    if (interactionsComplete && authState.isAuthenticated) {
      loadQuickActionsData();
    }
  }, [authState.isAuthenticated, interactionsComplete, loadQuickActionsData]);

  // Load user points and statistics on first login
  React.useEffect(() => {
    // Load stats when user is authenticated, regardless of interactionsComplete
    // This ensures coin balance shows immediately after login
    if (authState.user && authState.isAuthenticated && !statsLoadedRef.current && !isLoadingStats) {
      statsLoadedRef.current = true;
      loadUserStatistics();
    }
    // Reset the ref when user logs out so it loads again on next login
    if (!authState.user && !authState.isAuthenticated) {
      statsLoadedRef.current = false;
    }
  }, [authState.user, authState.isAuthenticated, isLoadingStats]);

  // Refresh all dynamic data when screen comes into focus (throttled to prevent continuous refreshing)
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const timeSinceLastRefresh = now - lastFocusRefreshRef.current;

      // Throttle: only refresh if more than 5 seconds since last refresh
      if (timeSinceLastRefresh < 5000) {
        return;
      }

      lastFocusRefreshRef.current = now;

      // Always refresh recently viewed items when returning to homepage
      refreshRecentlyViewed();

      // Only refresh user data if authenticated
      if (authState.user && authState.isAuthenticated) {
        // Refresh cart data to update cart badge
        refreshCart();

        // Refresh wallet/coin balance
        loadUserStatistics();

        // Refresh voucher and offers count
        loadQuickActionsData();

        // Refresh subscription status (in case user upgraded/downgraded)
        subscriptionActions.refreshSubscription().catch(() => {});
      }
    }, [authState.user, authState.isAuthenticated, refreshCart, refreshRecentlyViewed, loadQuickActionsData, subscriptionActions])
  );

  const loadUserStatistics = async () => {
    if (isLoadingStats) return; // Prevent concurrent calls

    try {
      setIsLoadingStats(true);
      // Loading user statistics
      const response = await authService.getUserStatistics();
      if (response.success && response.data) {
        setUserStats(response.data);

        // Simply fetch and display wallet balance (coins are earned via games, achievements, daily check-in)
        try {
          const walletApi = (await import('@/services/walletApi')).default;
          const walletResponse = await walletApi.getBalance();

          if (walletResponse.success && walletResponse.data) {
            const rezCoin = walletResponse.data.coins.find((c: any) => c.type === 'rez');
            const actualWalletCoins = rezCoin?.amount || 0;

            // Display the actual wallet balance (no calculation/sync - just show the real balance)
            setUserPoints(actualWalletCoins);
            setSyncStatus('success');

            // Calculate total savings from wallet statistics
            const walletStats = walletResponse.data.statistics;
            if (walletStats) {
              const cashback = walletStats.totalCashback || 0;
              const refunds = walletStats.totalRefunds || 0;
              const totalSavings = cashback + refunds;
              setTotalSaved(totalSavings);
            }
          } else {
            console.warn('⚠️ [HOME] Could not get wallet balance');
            setUserPoints(0);
            setTotalSaved(0);
          }
        } catch (walletError) {
          console.error('❌ [HOME] Error fetching wallet:', walletError);
          setUserPoints(0);
          setTotalSaved(0);
        }
      } else {
        // Fallback to wallet data if statistics API fails
        const loyaltyPoints = authState.user?.wallet?.balance || 0;
        setUserPoints(loyaltyPoints);
        setTotalSaved(0);
      }
    } catch (error) {
      console.error('❌ [HOME] Error loading user statistics:', error);
      // Fallback to wallet data
      const loyaltyPoints = authState.user?.wallet?.balance || 0;
      setUserPoints(loyaltyPoints);
      setTotalSaved(0);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Check auth status if not authenticated
  React.useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated && !authState.user) {
      // User not authenticated, checking auth status
      authActions.checkAuthStatus();
    }
  }, [authState.isLoading, authState.isAuthenticated, authState.user, authActions]);

  // Debug function removed for production

  // Debug user and modal state (removed for production)

  const handleRefresh = React.useCallback(
    async () => {
      setRefreshing(true);
      try {
        // Refresh sections first (visual feedback)
        await actions.refreshAllSections();

        // Refresh all user data in background (non-blocking)
        if (authState.user && authState.isAuthenticated) {
          // Refresh wallet/coin balance
          loadUserStatistics().catch(err => {
            console.error('Failed to refresh stats:', err);
          });

          // Refresh vouchers and offers count
          loadQuickActionsData().catch(err => {
            console.error('Failed to refresh quick actions:', err);
          });

          // Refresh cart
          refreshCart();

          // Refresh recently viewed
          refreshRecentlyViewed();
        }
      } catch (error) {
        console.error('❌ [HOME] Failed to refresh homepage:', error);
      } finally {
        setRefreshing(false);
      }
    },
    [actions, authState.user, authState.isAuthenticated, loadQuickActionsData, refreshCart, refreshRecentlyViewed]);

  const handleFashionPress = () => {
    router.push('/MainCategory/fashion');
  };

  const handleMainStorePress = () => {
    router.push('/Store');
  };

  const handleWalletPress = () => {
    router.push('/WalletScreen');
  };

  const handleOffersPress = () => {
    router.push('/offers');
  };

  const handlePartnerPress = () => {
    router.push('/profile/partner');
  };

  const handleSearchPress = () => {
    router.push('/search');
  };

  const handleGoingOutViewAll = () => {
    router.push('/going-out');
  };

  const handleHomeDeliveryViewAll = () => {
    router.push('/home-delivery');
  };

  const handleCategoryPress = (categorySlug: string) => {
    router.push(`/category/${categorySlug}` as any);
  };

  // Handle location selection from the picker modal
  const handleLocationSelect = async (selectedLocation: AddressSearchResult) => {
    try {
      const coordinates = {
        latitude: selectedLocation.coordinates.latitude,
        longitude: selectedLocation.coordinates.longitude,
      };
      // Pass city/state/pincode from search results
      await updateUserLocation(coordinates, selectedLocation.formattedAddress, 'manual', {
        city: selectedLocation.city,
        state: selectedLocation.state,
        pincode: selectedLocation.pincode,
      });
      setIsLocationModalVisible(false);
    } catch (error) {
      console.error('Failed to update location:', error);
      Alert.alert('Error', 'Failed to update location. Please try again.');
    }
  };

  // Memoize card renderers to prevent unnecessary re-renders
  const renderEventCard = React.useCallback((item: HomepageSectionItem) => {
    const event = item as EventItem;
    return (
      <EventCard
        event={event}
        onPress={eventItem => {
          actions.trackSectionView('events');
          actions.trackItemClick('events', eventItem.id);
          handleItemPress('events', eventItem);
        }}
      />
    );
  }, [actions, handleItemPress]);

  const renderRecommendationCard = React.useCallback((item: HomepageSectionItem) => {
    const recommendation = item as RecommendationItem;
    return (
      <RecommendationCard
        recommendation={recommendation}
        onPress={rec => {
          actions.trackSectionView('just_for_you');
          actions.trackItemClick('just_for_you', rec.id);
          handleItemPress('just_for_you', rec);
        }}
        onAddToCart={rec => {
          actions.trackItemClick('just_for_you', rec.id);
          handleAddToCart(rec);
        }}
      />
    );
  }, [actions, handleItemPress, handleAddToCart]);

  const renderStoreCard = React.useCallback((item: HomepageSectionItem, sectionId: string) => {
    const store = item as StoreItem;
    return (
      <StoreCard
        store={store}
        onPress={storeItem => {
          actions.trackSectionView(sectionId);
          actions.trackItemClick(sectionId, storeItem.id);
          handleItemPress(sectionId, storeItem);
        }}
      />
    );
  }, [actions, handleItemPress]);

  const renderBrandedStoreCard = React.useCallback((item: HomepageSectionItem) => {
    const store = item as BrandedStoreItem;
    return (
      <BrandedStoreCard
        store={store}
        onPress={storeItem => {
          actions.trackSectionView('top_stores');
          actions.trackItemClick('top_stores', storeItem.id);
          handleItemPress('top_stores', storeItem);
        }}
        width={200}
      />
    );
  }, [actions, handleItemPress]);

  const renderProductCard = React.useCallback((item: HomepageSectionItem) => {
    const product = item as ProductItem;

    return (
      <ProductCard
        product={product}
        onPress={productItem => {
          actions.trackSectionView('new_arrivals');
          actions.trackItemClick('new_arrivals', productItem.id);
          handleItemPress('new_arrivals', productItem);
        }}
        onAddToCart={productItem => {
          actions.trackItemClick('new_arrivals', productItem.id);
          handleAddToCart(productItem);
        }}
      />
    );
  }, [actions, handleItemPress, handleAddToCart]);

  return (
    <View style={viewStyles.mainContainer}>
      <Animated.ScrollView
        ref={scrollViewRef}
        style={viewStyles.container}
        contentContainerStyle={viewStyles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00C06A" colors={['#00C06A']} />
        }
      >
      {/* Header - Dynamic gradient based on active tab */}
      <LinearGradient
        colors={activeTab === 'prive'
          ? ['#1F2937', '#1F2937', '#111827', '#111827']
          : activeTab === 'mall'
            ? ['#BAE6FD', '#E0F2FE', '#F0F9FF', '#FFFFFF']
            : activeTab === 'near-u'
              ? ['#86EFAC', '#A7F3D0', '#D1FAE5', '#ECFDF5']
              : ['#86EFAC', '#A7F3D0', '#D1FAE5', '#ECFDF5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={viewStyles.header}
      >
        <View style={viewStyles.headerTop}>
          {/* Modern Location Pill - Tap to expand details */}
          <Pressable
            style={viewStyles.locationPill}
            onPress={() => {
              const newState = !showDetailedLocation;
              setShowDetailedLocation(newState);

              // Smooth animation for expand/collapse
              Animated.parallel([
                Animated.timing(animatedHeight, {
                  toValue: newState ? 1 : 0,
                  duration: 300,
                  useNativeDriver: false,
                }),
                Animated.timing(animatedOpacity, {
                  toValue: newState ? 1 : 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]).start();
            }}
            accessibilityLabel="Current location"
            accessibilityHint={showDetailedLocation ? "Tap to collapse location details" : "Tap to expand location details"}
            accessibilityState={{ expanded: showDetailedLocation }}
          >
            <View style={[
              viewStyles.locationIconWrapper,
              activeTab === 'prive' && { backgroundColor: '#C9A962' },
              activeTab === 'mall' && { backgroundColor: '#0284C7' }
            ]}>
              <Ionicons name="location" size={14} color="#FFFFFF" />
            </View>
            <LocationDisplay
              compact={true}
              showCoordinates={false}
              showLastUpdated={false}
              showRefreshButton={false}
              style={viewStyles.locationDisplay}
              textStyle={activeTab === 'prive' ? { color: '#FFFFFF', fontSize: 14, fontWeight: '600' } : textStyles.locationText}
            />
            <View style={viewStyles.locationChevron}>
              <Ionicons
                name={showDetailedLocation ? "chevron-up" : "chevron-down"}
                size={14}
                color={activeTab === 'prive' ? '#C9A962' : activeTab === 'mall' ? '#0284C7' : '#666'}
              />
            </View>
          </Pressable>

          {/* Modern Header Actions */}
          <View style={viewStyles.headerActions}>
            {/* Coin Balance Display - Horizontal Pill Style */}
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === 'ios') {
                  setTimeout(() => router.push('/CoinPage'), 50);
                } else {
                  router.push('/CoinPage');
                }
              }}
              activeOpacity={0.7}
              style={[
                viewStyles.headerCoinContainer,
                activeTab === 'prive' && { backgroundColor: 'rgba(201, 169, 98, 0.2)', borderColor: 'rgba(201, 169, 98, 0.4)' },
                activeTab === 'mall' && { backgroundColor: 'rgba(2, 132, 199, 0.15)', borderColor: 'rgba(2, 132, 199, 0.3)' }
              ]}
            >
              <Image
                source={require('@/assets/images/rez-coin.png')}
                style={viewStyles.headerCoinImage}
                resizeMode="contain"
              />
              <Text style={[
                viewStyles.headerCoinText, 
                activeTab === 'prive' && { color: '#C9A962' },
                activeTab === 'mall' && { color: '#0284C7' }
              ]}>{userPoints}</Text>
            </TouchableOpacity>

            {/* What's New Badge */}
            <WhatsNewBadge
              onPress={() => router.push('/whats-new')}
              style={viewStyles.whatsNewBadge}
              variant={activeTab === 'mall' ? 'blue' : activeTab === 'prive' ? 'gold' : 'green'}
            />

            {/* Cart Button with Modern Badge */}
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === 'ios') {
                  setTimeout(() => router.push('/CartPage'), 50);
                } else {
                  router.push('/CartPage');
                }
              }}
              activeOpacity={0.7}
              accessibilityLabel={`Shopping cart: ${cartState.totalItems} items`}
              accessibilityRole="button"
              accessibilityHint="Double tap to view your shopping cart"
              style={viewStyles.headerIconButton}
            >
              <Ionicons name="cart-outline" size={24} color={activeTab === 'prive' ? '#FFFFFF' : activeTab === 'mall' ? '#0284C7' : '#1a1a1a'} />
              {cartState.totalItems > 0 && (
                <LinearGradient
                  colors={['#FF6B6B', '#FF5252']}
                  style={viewStyles.cartBadgeModern}
                >
                  <Text style={viewStyles.cartBadgeTextModern}>
                    {cartState.totalItems > 9 ? '9+' : cartState.totalItems}
                  </Text>
                </LinearGradient>
              )}
            </TouchableOpacity>

            {/* Profile Badge Avatar with Savings - Badge then text pill */}
            <TouchableOpacity
              onPress={() => {
                if (authState.isAuthenticated && authState.user) {
                  showModal();
                }
              }}
              activeOpacity={0.7}
              accessibilityLabel="User profile menu"
              accessibilityRole="button"
              accessibilityHint="Double tap to open profile menu and account settings"
              style={viewStyles.profileSavingsContainer}
            >
              {/* Text pill - on left */}
              <View style={[
                viewStyles.savedTextPill,
                activeTab === 'prive' && { backgroundColor: 'rgba(201, 169, 98, 0.25)' },
                activeTab === 'mall' && { backgroundColor: 'rgba(2, 132, 199, 0.2)' }
              ]}>
                <Text style={[
                  viewStyles.savedText,
                  activeTab === 'prive' && { color: '#C9A962' },
                  activeTab === 'mall' && { color: '#0284C7' }
                ]}>
                  ₹{totalSaved} saved
                </Text>
              </View>
              {/* Badge on right - overlaps text slightly with negative margin */}
              <View style={viewStyles.badgeOverlay}>
                <BadgeAvatar color={activeTab === 'mall' ? '#0284C7' : activeTab === 'prive' ? '#C9A962' : undefined} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Detailed Location Section - Animated */}
        <Animated.View
          style={[
            viewStyles.detailedLocationContainer,
            {
              height: animatedHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 145], // Height for address and change button only
              }),
              opacity: animatedOpacity,
              overflow: 'hidden',
            },
          ]}
        >
          <View style={viewStyles.detailedLocationContent}>
            {/* Full Address Section */}
            <View style={viewStyles.addressSection}>
              <View style={viewStyles.addressHeader}>
                <Ionicons name="location" size={16} color={activeTab === 'mall' ? '#0284C7' : '#00C06A'} />
                <Text style={viewStyles.addressHeaderText}>Current Location</Text>
              </View>
              <LocationDisplay
                compact={false}
                showCoordinates={false}
                showLastUpdated={false}
                showRefreshButton={false}
                style={viewStyles.detailedLocationDisplay}
                textStyle={viewStyles.detailedLocationText}
              />
            </View>

            {/* Change Location Button */}
            <TouchableOpacity
              style={[
                viewStyles.changeLocationButton,
                activeTab === 'mall' && { 
                  backgroundColor: '#E0F2FE', 
                  borderColor: '#BAE6FD' 
                }
              ]}
              onPress={() => {
                setShowDetailedLocation(false);
                // Collapse animation then open modal
                Animated.parallel([
                  Animated.timing(animatedHeight, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                  }),
                  Animated.timing(animatedOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                  }),
                ]).start(() => {
                  setIsLocationModalVisible(true);
                });
              }}
              activeOpacity={0.7}
            >
              <View style={[
                viewStyles.changeLocationIconWrapper,
                activeTab === 'mall' && { backgroundColor: '#0EA5E9' }
              ]}>
                <Ionicons name="search" size={12} color="#FFFFFF" />
              </View>
              <Text style={viewStyles.changeLocationText}>Change Location</Text>
              <Ionicons name="chevron-forward" size={14} color={activeTab === 'mall' ? '#0284C7' : '#00C06A'} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Hero Banner - Dynamic content based on user - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <HeroBanner totalSaved={totalSaved} />}

        {/* Mall Hero Banner - Auto-scrolling carousel for "mall" tab */}
        {activeTab === 'mall' && (
          <MallHeroBanner
            banners={mallHeroBanners}
            isLoading={isMallLoading && !mallHeroBanners.length}
          />
        )}

        {/* Cash Store Header - Cashback Summary Card for "cash" tab */}
        {activeTab === 'cash' && (
          <CashbackSummaryHeaderCard
            total={cashStoreSummary.total}
            pending={cashStoreSummary.pending}
            confirmed={cashStoreSummary.confirmed}
            available={cashStoreSummary.available}
            isLoading={isCashStoreLoading}
          />
        )}

        {/* Privé Member Card - Premium card in header for "prive" tab */}
        {activeTab === 'prive' && priveUserData && (
          <PriveMemberCard
            memberName={priveUserData.name}
            tier={priveUserData.tier}
            tierProgress={priveUserData.tierProgress}
            nextTier={priveUserData.nextTier}
            pointsToNext={priveUserData.pointsToNext}
            memberId={priveUserData.memberId}
            validThru={priveUserData.validThru}
            totalScore={priveUserData.totalScore}
          />
        )}

        </LinearGradient>

      {/* Home Tab Section with 4 Tabs - Outside gradient */}
      <HomeTabSection
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isPriveEligible={isPriveEligible}
        onPriveLockedPress={() => router.push('/prive/eligibility')}
        onSearchPress={handleSearchPress}
        coinBalance={userPoints}
        onCoinPress={() => {
          if (Platform.OS === 'ios') {
            setTimeout(() => router.push('/CoinPage'), 50);
          } else {
            router.push('/CoinPage');
          }
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Content */}
      <View style={[
        viewStyles.content,
        activeTab === 'mall' && viewStyles.mallContent,
        activeTab === 'cash' && viewStyles.cashStoreContent,
        activeTab === 'prive' && viewStyles.priveContent
      ]}>
        {/* Quick Actions Section - Voucher, Wallet, Offers, Store - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && (
          <QuickActionsSection
            voucherCount={voucherCount}
            walletBalance={userPoints}
            newOffersCount={newOffersCount}
          />
        )}

        {/* How ReZ Works Card - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <HowRezWorksCard />}

        {/* Earn ReZ Coins Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <EarnRezCoinsSection />}

        {/* Play & Earn Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <PlayAndEarnSectionV2 />}

        {/* New on ReZ Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <NewOnRezSection />}

        {/* Events & Experiences Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <EventsExperiencesSection />}

        {/* Shop by Category Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <ShopByCategorySection />}

        {/* Beauty & Wellness Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <BeautyWellnessSection />}

        {/* Fitness & Sports Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <FitnessSportsSection />}

        {/* Grocery & Essentials Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <GroceryEssentialsSection />}

        {/* Healthcare Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <HealthcareSection />}

        {/* Home Services Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <HomeServicesSection />}

        {/* Financial Services Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <FinancialServicesSection />}

        {/* Travel Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <TravelSection />}

        {/* Exciting Deals Section - All deal categories (Cashback, Coins, Bank Offers, etc.) - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <ExcitingDealsSection />}

        {/* Shop by Experience Section - Curated shopping experiences grid - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <ShopByExperienceSection />}

        {/* Deals that save you money - Offers, Cashback, Exclusive tabs - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <DealsThatSaveMoney />}

        {/* Recently Viewed Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && recentlyViewedItems.length > 0 && (
          <RecentlyViewedSection
            items={recentlyViewedItems}
            isLoading={isLoadingRecentlyViewed}
            maxItems={10}
          />
        )}

        {/* Store Discovery Section - Today's Top Stores & Popular Near You - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <StoreDiscoverySection limit={10} />}

        {/* Trending Near You Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <TrendingNearYou />}

        {/* Flash Sales Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <FlashSales />}

        {/* New Arrivals Section - Only show when "near-u" tab is active */}
        {React.useMemo(() => {
          if (activeTab !== 'near-u') return null;
          
          const newArrivalsSection = state.sections.find(section => section.id === 'new_arrivals');
          
          // Show skeleton while loading (global or section-level) or if section doesn't exist yet
          const isGlobalLoading = state.loading;
          const isSectionLoading = newArrivalsSection?.loading;
          const hasNoItems = !newArrivalsSection?.items || newArrivalsSection.items.length === 0;
          
          // Show skeleton if: global loading (even if section doesn't exist), section loading, or section doesn't exist and we're loading
          if (isGlobalLoading || !newArrivalsSection || (isSectionLoading && hasNoItems)) {
            return (
              <SectionSkeleton
                cardType="product"
                cardWidth={160}
                spacing={16}
                numCards={4}
                showIndicator={false}
              />
            );
          }
          
          // If section has items, show the actual section
          if (!hasNoItems) {
            return (
              <HorizontalScrollSection
                key={newArrivalsSection.id}
                section={newArrivalsSection}
                onItemPress={item => handleItemPress(newArrivalsSection.id, item)}
                onRefresh={() => actions.refreshSection(newArrivalsSection.id)}
                renderCard={item => renderProductCard(item)}
                cardWidth={160}
                spacing={16}
                showIndicator={false}
              />
            );
          }
          
          return null;
        }, [activeTab, state.sections, state.loading, handleItemPress, actions, renderProductCard])}

        {/* Popular Products Section - Shows products with highest order count - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <PopularProductsSection title="Popular Near You" limit={3} />}

        {/* Going Out Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && (
          <GoingOutSection />
        )}

        {/* Just for you Section - Only show when "near-u" tab is active */}
        {React.useMemo(() => {
          if (activeTab !== 'near-u') return null;
          const justForYouSection = state.sections.find(section => section.id === 'just_for_you');
          
          // Show skeleton while loading (global or section-level) or if section doesn't exist yet
          const isGlobalLoading = state.loading;
          const isSectionLoading = justForYouSection?.loading;
          const hasNoItems = !justForYouSection?.items || justForYouSection.items.length === 0;
          
          // Show skeleton if: global loading, section loading, section doesn't exist, OR section has no items (will show skeleton until data loads)
          if (isGlobalLoading || !justForYouSection || (isSectionLoading && hasNoItems) || hasNoItems) {
            return (
              <SectionSkeleton
                cardType="recommendation"
                cardWidth={230}
                spacing={12}
                numCards={4}
                showIndicator={false}
              />
            );
          }
          
          // If section has items, show the actual section
          return (
            <HorizontalScrollSection
              key={justForYouSection.id}
              section={justForYouSection}
              onItemPress={item => handleItemPress(justForYouSection.id, item)}
              onRefresh={() => actions.refreshSection(justForYouSection.id)}
              renderCard={item => renderRecommendationCard(item)}
              cardWidth={230}
              spacing={12}
              showIndicator={false}
            />
          );
        }, [activeTab, state.sections, state.loading, handleItemPress, actions, renderRecommendationCard])}

        {/* Home Delivery Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && (
          <HomeDeliverySection />
        )}

        {/* Service Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && (
          <ServiceSection />
        )}

        {/* Other Sections from state (excluding just_for_you) - Progressive loading with memoization - Only show when "near-u" tab is active */}
        {React.useMemo(() => {
          if (activeTab !== 'near-u') return null;
          
          const filteredSections = state.sections.filter(section => {
            // Only show sections with real data (not fallback/error states)
            if (section.id === 'just_for_you') return false;
            if (section.id === 'new_arrivals') return false; // New arrivals is rendered separately above
            // Don't show if section has error and is using fallback data
            if (section.error && section.error.includes('fallback')) return false;
            return true;
          });
          
          const isGlobalLoading = state.loading;
          
          return filteredSections.map(section => {
            const isSectionLoading = section.loading;
            const hasNoItems = !section.items || section.items.length === 0;
            
            // Show skeleton for trending stores while loading (global or section-level) OR if it has no items
            if (section.id === 'trending_stores' && (isGlobalLoading || (isSectionLoading && hasNoItems) || hasNoItems)) {
              return (
                <SectionSkeleton
                  key={`skeleton-${section.id}`}
                  cardType="store"
                  cardWidth={280}
                  spacing={16}
                  numCards={4}
                  showIndicator={false}
                />
              );
            }
            
            // Don't render section if it has no items and is not loading (for other sections)
            if (hasNoItems && !isGlobalLoading && !isSectionLoading) {
              return null;
            }
            
            return (
              <HorizontalScrollSection
                key={section.id}
                section={section}
                onItemPress={item => handleItemPress(section.id, item)}
                onRefresh={() => actions.refreshSection(section.id)}
                renderCard={item => {
                  switch (section.type) {
                    case 'events':
                      return renderEventCard(item);
                    case 'recommendations':
                      return renderRecommendationCard(item);
                    case 'stores':
                      return renderStoreCard(item, section.id);
                    case 'branded_stores':
                      return renderBrandedStoreCard(item);
                    case 'products':
                      return renderProductCard(item);
                    default:
                      return renderStoreCard(item, section.id);
                  }
                }}
                cardWidth={
                  section.id === 'new_arrivals' ? 160 :
                    section.type === 'branded_stores' ? 200 : 280
                }
                spacing={
                  section.id === 'new_arrivals' ? 12 : 16
                }
                showIndicator={false}
              />
            );
          });
        }, [activeTab, state.sections, state.loading, handleItemPress, actions, renderEventCard, renderRecommendationCard, renderStoreCard, renderBrandedStoreCard, renderProductCard])}

        {/* Promotional Banner - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <PromoBanner />}

        {/* Best Discount Categories Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <BestDiscountSection title="Best Discount" limit={10} />}

        {/* Best Seller Categories Section - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <BestSellerSection title="Best Seller" limit={10} />}

        {/* Discover & Shop Section - UGC Reels, Posts, Articles, Images with product tagging - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && (
          <View style={{ marginHorizontal: -20, marginTop: 16, marginBottom: 16 }}>
            <DiscoverAndShopSection
              showHeader={true}
              showCategories={true}
              initialTab="reels"
              maxHeight={600}
            />
          </View>
        )}

        {/* In Your Area Section - Shows products from nearby stores - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <NearbyProductsSection title="In Your Area" limit={10} radius={10} />}

        {/* Stores Near You Section - Shows nearby stores with live status, distance, wait times, and cashback - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <StoresNearYou />}

        {/* Picked For You Section - AI-powered product recommendations with match percentages - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <PickedForYou limit={2} />}

        {/* Brand Partnerships Section - Exclusive deals on top brands - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <BrandPartnerships />}

        {/* Globe Banner - Best Deals on Internet - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <GlobeBanner />}

        {/* Hot Deals Section - Shows products with hot-deal tag or high cashback - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <HotDealsSection title="Hot deals" limit={10} />}

        {/* Featured Category Sections - Dynamic sections by category - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <FeaturedCategoriesContainer productsPerCategory={10} />}

        {/* Feature Highlights - Lazy Loaded (moved to bottom) - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && (
          <Suspense fallback={<BelowFoldFallback />}>
            <FeatureHighlights />
          </Suspense>
        )}

        {/* Wallet Snapshot Card - Shows coin balance, cashback earned, and quick actions - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <WalletSnapshotCard />}

        {/* Loyalty & Rewards Hub Card - Shows loyalty progress, streaks, unlocked rewards, and tiers - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && (
          <LoyaltyRewardsHubCard
            activeBrands={loyaltyHub?.activeBrands}
            streaks={loyaltyHub?.streaks}
            unlocked={loyaltyHub?.unlocked}
            tiers={loyaltyHub?.tiers}
            isLoading={isLoyaltySectionLoading}
          />
        )}

        {/* Feature Try Cards - Product Lock and Service Booking feature cards - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && (
          <FeatureTryCards
            lockProduct={featuredLockProduct}
            trendingService={trendingService}
            isLoading={isLoyaltySectionLoading}
          />
        )}

        {/* Streaks Gamification - Saving streak and weekly missions - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <StreaksGamification />}

        {/* Zero EMI Card - Promotional card for 0% EMI payment option - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <ZeroEMICard />}

        {/* Store Experiences Section - 60-min delivery, ₹1 store, luxury, organic - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <StoreExperiencesSection />}

        {/* Play & Earn More Section - Daily spin, challenges, streak rewards, surprise drops - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <PlayAndEarnSection />}

        {/* Social Proof Section - People near you are earning - Only show when "near-u" tab is active */}
        {activeTab === 'near-u' && <SocialProofSection />}

        {/* Mall Tab Content */}
        {activeTab === 'mall' && (
          <MallSectionContainer />
        )}

        {/* Cash Store Tab Content */}
        {activeTab === 'cash' && (
          <CashStoreSectionContainer />
        )}

        {/* Privé Tab Content */}
        {activeTab === 'prive' && (
          <PriveSectionContainer />
        )}
      </View>

      {/* Profile Menu Modal - Lazy Loaded */}
      {user && (
        <Suspense fallback={<ModalFallback />}>
          <ProfileMenuModal visible={isModalVisible} onClose={hideModal} user={user} menuSections={profileMenuSections} onMenuItemPress={handleMenuItemPress} />
        </Suspense>
      )}

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={isLocationModalVisible}
        onClose={() => setIsLocationModalVisible(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={currentLocation}
      />

      {/* Quick Access FAB - Lazy Loaded */}
      <Suspense fallback={<FABFallback />}>
        <QuickAccessFAB />
      </Suspense>
      </Animated.ScrollView>

      {/* Sticky Search Header with Glass Effect - Rendered after ScrollView to avoid blocking touches */}
      {/* showThreshold should be high enough so sticky header only appears after category section scrolls out of view */}
      {/* Hide for Privé tab as it has its own dark theme */}
      {activeTab !== 'prive' && (
        <StickySearchHeader
          scrollY={scrollY}
          showThreshold={580}
          onSearchPress={handleSearchPress}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      )}
    </View>
  );
}

/* ---------------------------
   Styles: split into textStyles and viewStyles
   --------------------------- */

const textStyles = StyleSheet.create({
  locationText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '600',
  },
  coinsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  profileText: {
    color: '#333',
    fontWeight: '700',
    fontSize: 14,
  },
  greeting: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#666',
  },
  partnerLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  level1: {
    fontSize: 12,
    color: '#666',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFC857',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
  },
  actionLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    marginTop: 8,
  },
  actionValue: {
    fontSize: 12,
    color: '#00C06A',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#00796B',
  },
  viewAllText: {
    fontSize: 14,
    color: '#00C06A',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  categoryLabel: {
    fontSize: 11,
    color: '#0B2240',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 8,
  },
});

const viewStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        touchAction: 'pan-y', // Only handle vertical scrolling, let children handle horizontal
        WebkitOverflowScrolling: 'touch',
      },
    }),
  },
  scrollContentContainer: {
    flexGrow: 1,
    ...Platform.select({
      web: {
        minHeight: '100%',
      },
    }),
  },
  categoryTabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 192, 106, 0.1)',
  },
  categoriesSection: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 50,
    paddingHorizontal: 20,
    paddingBottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerExtended: {
    paddingTop: Platform.OS === 'ios' ? 56 : 50,
    paddingHorizontal: 20,
    paddingBottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  // Modern Location Pill Style
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  locationIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00C06A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  locationChevron: {
    marginLeft: 4,
  },
  // Modern Header Actions
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // What's New Badge
  whatsNewBadge: {
    // aligned with other elements
  },
  // Header Coin - Horizontal Pill Style
  headerCoinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 200, 87, 0.18)',
    borderRadius: 12,
    paddingVertical: 2,
    paddingLeft: 2,
    paddingRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 87, 0.35)',
    gap: 2,
  },
  headerCoinImage: {
    width: 18,
    height: 18,
  },
  headerCoinText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadgeModern: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeTextModern: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  profileAvatarWrapper: {
    // Wrapper for shadow on Android
  },
  // Container for badge + text pill - badge overlaps pill
  profileSavingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Text pill with background - positioned to the left of badge
  savedTextPill: {
    backgroundColor: 'rgba(255, 200, 87, 0.35)',
    paddingLeft: 6,
    paddingRight: 4,
    paddingVertical: 2,
    borderRadius: 0,
    marginRight: -4,
    marginTop: -6,
  },
  // Badge overlay - overlaps text from right
  badgeOverlay: {
    zIndex: 1,
  },
  // Savings text
  savedText: {
    color: '#B45309',
    fontSize: 8,
    fontWeight: '600',
  },
  // Badge avatar wrapper with shadow (legacy - not used)
  profileBadgeWrapper: {
    ...Platform.select({
      ios: {
        shadowColor: '#FF9F1C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  // Legacy styles - kept for backward compatibility
  profileAvatarModern: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#FF9F1C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileTextModern: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      android: {
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
  locationDisplay: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    padding: 0,
  },
  locationArrow: {
    marginLeft: 8,
  },
  detailedLocationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#00796B',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.1)',
  },
  detailedLocationContent: {
    padding: 16,
  },
  addressSection: {
    marginBottom: -10,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00796B',
    marginLeft: 6,
  },
  coordinatesSection: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 121, 107, 0.1)',
  },
  coordinatesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  coordinatesHeaderText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  coordinatesDisplay: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    padding: 0,
  },
  coordinatesText: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  refreshSection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 121, 107, 0.1)',
    alignItems: 'center',
  },
  refreshDisplay: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    padding: 0,
    alignSelf: 'stretch',
  },
  refreshText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  changeLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  changeLocationIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00C06A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  changeLocationText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#00C06A',
  },
  detailedLocationDisplay: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    padding: 0,
  },
  detailedLocationText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
  },
  greetingContainer: {
    marginVertical: 8,
  },
  greetingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowOpacity: 0,
    elevation: 0,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  tabSectionContainer: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginHorizontal: 0,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    gap: 8,
  },
  searchContainer: {
    flex: 3,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  pharmacyButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  pharmacyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669', // Emerald-600
    letterSpacing: -0.3,
  },
  pharmacyPlus: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981', // Emerald-500
  },
  content: {
    padding: 20,
    paddingBottom: 100,
    backgroundColor: '#FFFFFF',
  },
  mallContent: {
    padding: 0,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
  cashStoreContent: {
    padding: 0,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
  priveContent: {
    padding: 0,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
  partnerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.15)',
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 8px 20px rgba(0, 192, 106, 0.15)',
      },
    }),
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.2)',
  },
  partnerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  progressDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00C06A',
    marginHorizontal: 6,
  },
  partnerArrow: {
    padding: 4,
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 6px 16px rgba(0, 192, 106, 0.12)',
      },
    }),
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.15)',
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllButton: {
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.2)',
  },
  viewAll: {
    // view-only; if you want text, use textStyles.viewAll
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  horizontalScrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  webScrollContainer: {
    paddingHorizontal: 4,
  },
  webScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalCategoryItem: {
    alignItems: 'center',
    minWidth: 70,
    marginRight: 12,
  },
  horizontalCategorySpacing: {
    marginLeft: 8,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 8px rgba(0, 192, 106, 0.1)',
      },
    }),
  },
  iosActionWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  defaultActionWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  // ============ ZEPTO STYLE HEADER ============
  zeptoHeader: {
    backgroundColor: '#E8F5E9', // Light green (like Zepto's light purple)
    paddingTop: Platform.OS === 'ios' ? 56 : 45,
    paddingBottom: 16,
  },
  zeptoHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  deliveryTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTimeBolt: {
    fontSize: 18,
    marginRight: 4,
  },
  deliveryTimeText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  zeptoHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zeptoIconButton: {
    padding: 6,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  zeptoProfileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  zeptoProfileText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  zeptoLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  zeptoLocationDisplay: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    padding: 0,
    flex: 1,
  },
  zeptoLocationText: {
    color: '#1a1a1a',
    fontSize: 13,
    fontWeight: '500',
  },
  zeptoLocationDetailText: {
    color: '#666',
    fontSize: 12,
  },
  zeptoDetailedLocation: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  zeptoSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 10,
  },
  zeptoSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  zeptoSearchPlaceholder: {
    fontSize: 15,
    color: '#9CA3AF',
    marginLeft: 10,
    flex: 1,
  },
  zeptoPharmacyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  zeptoPharmacyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00796B',
  },
  zeptoPharmacyPlus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00C06A',
    marginLeft: 2,
  },
});
