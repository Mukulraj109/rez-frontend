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
  CategoryGridSection,
  PopularProductsSection,
  NearbyProductsSection,
  HotDealsSection,
  FeaturedCategoriesContainer,
  BestDiscountSection,
  BestSellerSection,
  QuickActionsSection,
} from '@/components/homepage';
import HomeTabSection, { TabId } from '@/components/homepage/HomeTabSection';
import ServiceCategoriesSection from '@/components/homepage/ServiceCategoriesSection';
import PopularServicesSection from '@/components/homepage/PopularServicesSection';
import PromoBanner from '@/components/homepage/PromoBanner';
import GlobeBanner from '@/components/homepage/GlobeBanner';
import RecentlyViewedSection from '@/components/category/RecentlyViewedSection';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import GoingOutSection from '@/components/homepage/GoingOutSection';
import HomeDeliverySection from '@/components/homepage/HomeDeliverySection';
import ServiceSection from '@/components/homepage/ServiceSection';
import { useHomepage, useHomepageNavigation } from '@/hooks/useHomepage';
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
import { GreetingDisplay, LocationDisplay } from '@/components/location';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/authApi';
import TierBadge from '@/components/subscription/TierBadge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import NotificationBell from '@/components/common/NotificationBell';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import categoriesApi from '@/services/categoriesApi';
import vouchersService from '@/services/realVouchersApi';
import realOffersApi from '@/services/realOffersApi';

// Lazy-loaded components (below-the-fold)
const ProfileMenuModal = React.lazy(() => import('@/components/profile/ProfileMenuModal'));
const VoucherNavButton = React.lazy(() => import('@/components/voucher/VoucherNavButton'));
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

export default function HomeScreen() {
  const router = useRouter();
  const { state, actions } = useHomepage();
  const { handleItemPress, handleAddToCart } = useHomepageNavigation();
  const { user, isModalVisible, showModal, hideModal } = useProfile();
  const { handleMenuItemPress } = useProfileMenu();
  const { state: cartState, refreshCart } = useCart();
  const { state: authState, actions: authActions } = useAuth();
  const { state: subscriptionState } = useSubscription();
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
  const [activeTab, setActiveTab] = React.useState<TabId>('rez'); // Home tab bar state
  const [voucherCount, setVoucherCount] = React.useState(0); // Active voucher count
  const [newOffersCount, setNewOffersCount] = React.useState(0); // New offers count

  // Get recently viewed items
  const { items: recentlyViewedItems, isLoading: isLoadingRecentlyViewed } = useRecentlyViewed();

  const animatedHeight = React.useRef(new Animated.Value(0)).current;
  const animatedOpacity = React.useRef(new Animated.Value(0)).current;
  const scrollY = React.useRef(new Animated.Value(0)).current; // For sticky header
  const statsLoadedRef = React.useRef(false); // Prevent redundant loads

  // Initialize push notifications
  usePushNotifications();

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
        const [goingOutRes, homeDeliveryRes] = await Promise.all([
          categoriesApi.getCategories({ type: 'going_out', isActive: true }),
          categoriesApi.getCategories({ type: 'home_delivery', isActive: true }),
        ]);

        const goingOut = goingOutRes?.data || goingOutRes || [];
        const homeDelivery = homeDeliveryRes?.data || homeDeliveryRes || [];

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

  // Load quick actions data (vouchers and new offers)
  React.useEffect(() => {
    const loadQuickActionsData = async () => {
      // Only load if user is authenticated
      if (!authState.isAuthenticated || !authState.user) {
        setVoucherCount(0);
        setNewOffersCount(0);
        return;
      }

      try {
        // Fetch active vouchers count - include BOTH gift card vouchers AND offer redemptions
        // This matches what the My Vouchers page shows
        // Note: API limit is max 50, so we use that and rely on pagination.total for accurate count
        const [vouchersResponse, redemptionsResponse] = await Promise.all([
          vouchersService.getUserVouchers({
            status: 'active',
            page: 1,
            limit: 50, // API max limit is 50
          }).catch((error) => {
            console.error('❌ [HOME] Error fetching vouchers:', error);
            return { success: false, data: [], meta: undefined };
          }),
          realOffersApi.getUserRedemptions({
            status: 'active',
            page: 1,
            limit: 50, // API max limit is 50
          }).catch((error) => {
            console.error('❌ [HOME] Error fetching offer redemptions:', error);
            return { success: false, data: [], meta: undefined };
          }),
        ]);

        console.log('🔍 [HOME] Vouchers response:', JSON.stringify(vouchersResponse, null, 2));
        console.log('🔍 [HOME] Redemptions response:', JSON.stringify(redemptionsResponse, null, 2));

        let totalVoucherCount = 0;

        // Count gift card vouchers - use pagination total if available, otherwise count array
        if (vouchersResponse.success) {
          const activeVouchers = vouchersResponse.data || [];
          const paginationTotal = vouchersResponse.meta?.pagination?.total;
          
          if (paginationTotal !== undefined) {
            totalVoucherCount += paginationTotal;
            console.log('✅ [HOME] Gift card vouchers count (from pagination):', paginationTotal);
          } else {
            totalVoucherCount += activeVouchers.length;
            console.log('✅ [HOME] Gift card vouchers count (from array):', activeVouchers.length);
          }
        }

        // Count offer redemptions (cashback vouchers) - use pagination total if available
        if (redemptionsResponse.success) {
          const activeRedemptions = redemptionsResponse.data || [];
          const paginationTotal = redemptionsResponse.meta?.pagination?.total;
          
          if (paginationTotal !== undefined) {
            totalVoucherCount += paginationTotal;
            console.log('✅ [HOME] Offer redemptions count (from pagination):', paginationTotal);
          } else {
            totalVoucherCount += activeRedemptions.length;
            console.log('✅ [HOME] Offer redemptions count (from array):', activeRedemptions.length);
          }
        }

        // If we got 0 with 'active' status, try fetching all vouchers (no status filter)
        // This handles cases where vouchers might not have the exact status we expect
        if (totalVoucherCount === 0) {
          console.log('⚠️ [HOME] No active vouchers found, trying to fetch all vouchers...');
          
          const allVouchersResponse = await vouchersService.getUserVouchers({
            page: 1,
            limit: 50, // API max limit is 50
          }).catch(() => ({ success: false, data: [], meta: undefined }));
          
          const allRedemptionsResponse = await realOffersApi.getUserRedemptions({
            page: 1,
            limit: 50, // API max limit is 50
          }).catch(() => ({ success: false, data: [], meta: undefined }));
          
          let allCount = 0;
          
          if (allVouchersResponse.success) {
            const allVouchers = allVouchersResponse.data || [];
            const paginationTotal = allVouchersResponse.meta?.pagination?.total;
            allCount += paginationTotal !== undefined ? paginationTotal : allVouchers.length;
            console.log('✅ [HOME] All gift card vouchers count:', paginationTotal !== undefined ? paginationTotal : allVouchers.length);
          }
          
          if (allRedemptionsResponse.success) {
            const allRedemptions = allRedemptionsResponse.data || [];
            const paginationTotal = allRedemptionsResponse.meta?.pagination?.total;
            allCount += paginationTotal !== undefined ? paginationTotal : allRedemptions.length;
            console.log('✅ [HOME] All offer redemptions count:', paginationTotal !== undefined ? paginationTotal : allRedemptions.length);
          }
          
          if (allCount > 0) {
            console.log('✅ [HOME] Found vouchers without status filter, using total:', allCount);
            setVoucherCount(allCount);
            return; // Exit early since we found vouchers
          }
        }

        console.log('✅ [HOME] Total vouchers count:', totalVoucherCount);
        setVoucherCount(totalVoucherCount);

        // Fetch active offers count (all available offers, not just "new" ones)
        // This gives a better representation of available offers to the user
        const offersResponse = await realOffersApi.getOffers({
          page: 1,
          limit: 1, // We only need the total count from pagination
        }).catch((error) => {
          console.error('❌ [HOME] Error fetching offers count:', error);
          return { success: false, data: { items: [], totalCount: 0 } };
        });

        if (offersResponse.success && offersResponse.data) {
          // PaginatedResponse has items array and totalCount
          const paginatedData = offersResponse.data;
          const totalOffersCount = paginatedData.totalCount || 0;
          console.log('✅ [HOME] Offers count loaded:', totalOffersCount);
          setNewOffersCount(totalOffersCount);
        } else {
          // If API call fails, try to get count from items array as fallback
          console.warn('⚠️ [HOME] Could not get offers totalCount, trying fallback');
          const fallbackResponse = await realOffersApi.getOffers({
            page: 1,
            limit: 100,
          }).catch(() => ({ success: false, data: { items: [] } }));
          
          if (fallbackResponse.success && fallbackResponse.data) {
            const items = fallbackResponse.data.items || [];
            console.log('✅ [HOME] Offers count (fallback):', items.length);
            setNewOffersCount(items.length);
          } else {
            console.warn('⚠️ [HOME] Could not load offers count');
            setNewOffersCount(0);
          }
        }
      } catch (error) {
        console.error('❌ [HOME] Error loading quick actions data:', error);
        // Don't set to 0 on error, keep previous values
      }
    };

    // Only load after interactions complete to avoid blocking initial render
    if (interactionsComplete && authState.isAuthenticated) {
      loadQuickActionsData();
    }
  }, [authState.isAuthenticated, authState.user, interactionsComplete]);

  // Load user points and statistics (optimized with cache check)
  React.useEffect(() => {
    if (authState.user && !statsLoadedRef.current && !isLoadingStats && interactionsComplete) {
      statsLoadedRef.current = true;
      loadUserStatistics();
    }
  }, [authState.user, interactionsComplete]);

  // Refresh wallet balance and cart data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only refresh if user is authenticated
      if (authState.user) {
        // Always refresh cart data to update cart badge
        refreshCart();

        // Refresh wallet balance (only if we've done initial load to avoid double-loading on mount)
        if (statsLoadedRef.current) {
          statsLoadedRef.current = false;
          loadUserStatistics();
        }
      }
    }, [authState.user, refreshCart])
  );

  const loadUserStatistics = async () => {
    if (isLoadingStats) return; // Prevent concurrent calls

    try {
      setIsLoadingStats(true);
      // Loading user statistics
      const response = await authService.getUserStatistics();
      if (response.success && response.data) {
        setUserStats(response.data);

        // Calculate loyalty points based on the documentation:
        // Shop: 1 point per ₹10 spent
        // Review: 50 points per review
        // Refer: 200 points per referral
        // Video: 100 points per video

        const stats = response.data;
        const shopPoints = Math.floor((stats.orders?.totalSpent || 0) / 10); // 1 point per ₹10
        const reviewPoints = 0; // Reviews not available in current API response
        const referralPoints = (stats.user?.totalReferrals || 0) * 200; // 200 points per referral
        const videoPoints = (stats.videos?.totalCreated || 0) * 100; // 100 points per video

        const totalLoyaltyPoints = shopPoints + reviewPoints + referralPoints + videoPoints;

        // NEW: Sync loyalty points with wallet
        try {
          const walletApi = (await import('@/services/walletApi')).default;
          const walletResponse = await walletApi.getBalance();

          if (walletResponse.success && walletResponse.data) {
            const wasilCoin = walletResponse.data.coins.find((c: any) => c.type === 'wasil');
            const actualWalletCoins = wasilCoin?.amount || 0;

            // If loyalty points > wallet coins, sync the difference
            if (totalLoyaltyPoints > actualWalletCoins) {
              const difference = totalLoyaltyPoints - actualWalletCoins;

              setSyncStatus('syncing');

              const creditResponse = await walletApi.creditLoyaltyPoints({
                amount: difference,
                source: {
                  type: 'loyalty_sync',
                  description: 'Syncing loyalty points to wallet',
                  metadata: {
                    shopPoints,
                    referralPoints,
                    videoPoints,
                    totalCalculated: totalLoyaltyPoints,
                    previousWalletBalance: actualWalletCoins
                  }
                }
              });

              if (creditResponse.success && creditResponse.data) {

                // Display the synced wallet coins
                setUserPoints(creditResponse.data.balance.available);
                setSyncStatus('success');
              } else {
                console.error('❌ [HOME] Failed to sync loyalty points:', creditResponse.error);
                // Fallback to calculated loyalty points
                setUserPoints(totalLoyaltyPoints);
                setSyncStatus('error');
              }
            } else {
              // Wallet has more or equal coins, use wallet balance

              setUserPoints(actualWalletCoins);
              setSyncStatus('success');
            }
          } else {
            console.warn('⚠️ [HOME] Could not get wallet balance, using calculated loyalty points');
            setUserPoints(totalLoyaltyPoints);
          }
        } catch (walletError) {
          console.error('❌ [HOME] Error syncing with wallet:', walletError);
          // Fallback to calculated loyalty points
          setUserPoints(totalLoyaltyPoints);
        }
      } else {
        // Fallback to wallet data if statistics API fails
        const loyaltyPoints = authState.user?.wallet?.totalEarned || authState.user?.wallet?.balance || 0;
        setUserPoints(loyaltyPoints);

      }
    } catch (error) {
      console.error('❌ [HOME] Error loading user statistics:', error);
      // Fallback to wallet data
      const loyaltyPoints = authState.user?.wallet?.totalEarned || authState.user?.wallet?.balance || 0;
      setUserPoints(loyaltyPoints);
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

        // Refresh user statistics in background (non-blocking)
        if (authState.user) {
          statsLoadedRef.current = false; // Allow reload
          loadUserStatistics().catch(err => {
            console.error('Failed to refresh stats:', err);
          });

          // Refresh quick actions data (vouchers and offers)
          Promise.all([
            Promise.all([
              vouchersService.getUserVouchers({ status: 'active', page: 1, limit: 50 }),
              realOffersApi.getUserRedemptions({ status: 'active', page: 1, limit: 50 }),
            ])
              .then(([vouchersRes, redemptionsRes]) => {
                let count = 0;
                if (vouchersRes.success) count += (vouchersRes.data || []).length;
                if (redemptionsRes.success) count += (redemptionsRes.data || []).length;
                setVoucherCount(count);
              })
              .catch(() => {}),
            realOffersApi.getOffers({ page: 1, limit: 1 })
              .then(res => {
                if (res.success && res.data) {
                  const paginatedData = res.data;
                  const count = paginatedData.totalCount || 0;
                  setNewOffersCount(count);
                }
              })
              .catch(() => {}),
          ]).catch(() => {});
        }
      } catch (error) {
        console.error('❌ [HOME] Failed to refresh homepage:', error);
      } finally {
        setRefreshing(false);
      }
    },
    [actions, authState.user]);

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
      {/* Sticky Search Header with Glass Effect */}
      <StickySearchHeader
        scrollY={scrollY}
        showThreshold={280}
        onSearchPress={handleSearchPress}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <Animated.ScrollView
        style={viewStyles.container}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00C06A" colors={['#00C06A']} />
        }
      >
      {/* Header - Light Green gradient (stays same) */}
      <LinearGradient
        colors={['#86EFAC', '#A7F3D0', '#D1FAE5', '#ECFDF5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={viewStyles.header}
      >
        <View style={viewStyles.headerTop}>
          <Pressable
            style={viewStyles.locationContainer}
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
            accessibilityHint={showDetailedLocation ? "Double tap to collapse location details" : "Double tap to expand location details"}
            accessibilityState={{ expanded: showDetailedLocation }}
          >
            <LocationDisplay
              compact={true}
              showCoordinates={false}
              showLastUpdated={false}
              showRefreshButton={false}
              style={viewStyles.locationDisplay}
              textStyle={textStyles.locationText}
            />
            <Ionicons
              name={showDetailedLocation ? "chevron-up" : "chevron-down"}
              size={16}
              color="#1a1a1a"
              style={viewStyles.locationArrow}
            />
          </Pressable>

          <View style={viewStyles.headerRight}>
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === 'ios') {
                  setTimeout(() => router.push('/subscription/plans'), 50);
                } else {
                  router.push('/subscription/plans');
                }
              }}
              activeOpacity={0.7}
              style={{ marginRight: 12 }}
              accessibilityLabel={`Subscription tier: ${subscriptionState.currentSubscription?.tier || 'free'}`}
              accessibilityRole="button"
              accessibilityHint="Double tap to view subscription plans and upgrade options"
            >
              <TierBadge
                tier={subscriptionState.currentSubscription?.tier || 'free'}
                size="small"
              />
            </TouchableOpacity>

            <NotificationBell iconSize={24} iconColor="#1a1a1a" />

            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === 'ios') {
                  setTimeout(() => router.push('/CartPage'), 50);
                } else {
                  router.push('/CartPage');
                }
              }}
              activeOpacity={Platform.OS === 'ios' ? 0.6 : 0.7}
              delayPressIn={Platform.OS === 'ios' ? 50 : 0}
              accessibilityLabel={`Shopping cart: ${cartState.totalItems} items`}
              accessibilityRole="button"
              accessibilityHint="Double tap to view your shopping cart"
              style={{ position: 'relative' }}
            >
              <Ionicons name="cart-outline" size={24} color="#1a1a1a" />
              {cartState.totalItems > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    backgroundColor: '#FF5252',
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 10,
                      fontWeight: 'bold',
                    }}
                  >
                    {cartState.totalItems > 99 ? '99+' : cartState.totalItems}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={viewStyles.profileAvatar}
              onPress={() => {
                // Only open modal if user is authenticated
                if (authState.isAuthenticated && authState.user) {
                  showModal();
                }
              }}
              activeOpacity={0.7}
              accessibilityLabel="User profile menu"
              accessibilityRole="button"
              accessibilityHint="Double tap to open profile menu and account settings"
            >
              <ThemedText style={textStyles.profileText}>
                {user?.initials ||
                  (authState.user?.profile?.firstName ? authState.user.profile.firstName.charAt(0).toUpperCase() :
                    (authState.isAuthenticated ? 'U' : '?')
                  )}
              </ThemedText>
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
                outputRange: [0, 120], // Adjust based on content height
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
                <Ionicons name="location" size={16} color="#00C06A" />
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

            {/* Coordinates Section */}
            <View style={viewStyles.coordinatesSection}>
              <View style={viewStyles.coordinatesHeader}>
                <Ionicons name="navigate" size={14} color="#666" />
                <Text style={viewStyles.coordinatesHeaderText}>Coordinates</Text>
              </View>
              <LocationDisplay
                compact={true}
                showCoordinates={true}
                showLastUpdated={false}
                showRefreshButton={false}
                style={viewStyles.coordinatesDisplay}
                textStyle={viewStyles.coordinatesText}
              />
            </View>

            {/* Refresh Button */}
            <View style={viewStyles.refreshSection}>
              <LocationDisplay
                compact={true}
                showCoordinates={false}
                showLastUpdated={true}
                showRefreshButton={true}
                style={viewStyles.refreshDisplay}
                textStyle={viewStyles.refreshText}
              />
            </View>
          </View>
        </Animated.View>

        </LinearGradient>

      {/* Home Tab Section - Outside gradient */}
      <HomeTabSection
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
      <View style={viewStyles.content}>
        {/* Quick Actions Section - Voucher, Wallet, Offers, Store - Only show when "rez" tab is active */}
        {activeTab === 'rez' && (
          <QuickActionsSection
            voucherCount={voucherCount}
            walletBalance={userPoints}
            newOffersCount={newOffersCount}
          />
        )}

        {/* Online Voucher Button (Exclusive Deals) - Lazy Loaded - Only show when "rez" tab is active */}
        {activeTab === 'rez' && (
          <Suspense fallback={<BelowFoldFallback />}>
            <VoucherNavButton variant="minimal" style={{ marginBottom: 20 }} />
          </Suspense>
        )}

        {/* Recently Viewed Section - Only show when "rez" tab is active */}
        {activeTab === 'rez' && recentlyViewedItems.length > 0 && (
          <RecentlyViewedSection
            items={recentlyViewedItems}
            isLoading={isLoadingRecentlyViewed}
            maxItems={10}
          />
        )}

        {/* Going Out Section - Only show when "rez" tab is active */}
        {activeTab === 'rez' && (
          <GoingOutSection />
        )}

        {/* Just for you Section - Only show when "rez" tab is active */}
        {React.useMemo(() => {
          if (activeTab !== 'rez') return null;
          const justForYouSection = state.sections.find(section => section.id === 'just_for_you');
          if (!justForYouSection || !justForYouSection.items || justForYouSection.items.length === 0) return null;
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
        }, [activeTab, state.sections, handleItemPress, actions, renderRecommendationCard])}

        {/* Home Delivery Section - Only show when "rez" tab is active */}
        {activeTab === 'rez' && (
          <HomeDeliverySection />
        )}

        {/* Service Section - Only show when "rez" tab is active */}
        {activeTab === 'rez' && (
          <ServiceSection />
        )}

        {/* Other Sections from state (excluding just_for_you) - Progressive loading with memoization - Only show when "rez" tab is active */}
        {React.useMemo(() => {
          if (activeTab !== 'rez') return null;
          return state.sections
            .filter(section => section.id !== 'just_for_you' && section.items && section.items.length > 0)
            .map(section => (
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
                  section.id === 'new_arrivals' ? 180 :
                    section.type === 'branded_stores' ? 200 : 280
                }
                spacing={
                  section.id === 'new_arrivals' ? 12 : 16
                }
                showIndicator={false}
              />
            ));
        }, [activeTab, state.sections, handleItemPress, actions, renderEventCard, renderRecommendationCard, renderStoreCard, renderBrandedStoreCard, renderProductCard])}

        {/* Categories Grid Section - Shows all 11 main categories - Only show when "rez" tab is active */}
        {activeTab === 'rez' && (
          <CategoryGridSection title="Categories" maxCategories={11} />
        )}

        {/* Promotional Banner - Only show when "rez" tab is active */}
        {activeTab === 'rez' && <PromoBanner />}

        {/* Best Discount Categories Section - Only show when "rez" tab is active */}
        {activeTab === 'rez' && <BestDiscountSection title="Best Discount" limit={10} />}

        {/* Best Seller Categories Section - Only show when "rez" tab is active */}
        {activeTab === 'rez' && <BestSellerSection title="Best Seller" limit={10} />}

        {/* Popular Products Section - Shows products with highest order count - Only show when "rez" tab is active */}
        {activeTab === 'rez' && <PopularProductsSection title="Popular" limit={10} />}

        {/* In Your Area Section - Shows products from nearby stores - Only show when "rez" tab is active */}
        {activeTab === 'rez' && <NearbyProductsSection title="In Your Area" limit={10} radius={10} />}

        {/* Globe Banner - Best Deals on Internet - Only show when "rez" tab is active */}
        {activeTab === 'rez' && <GlobeBanner />}

        {/* Services Sections - Only show when "rez" tab is active */}
        {activeTab === 'rez' && <ServiceCategoriesSection />}
        {activeTab === 'rez' && <PopularServicesSection />}

        {/* Hot Deals Section - Shows products with hot-deal tag or high cashback - Only show when "rez" tab is active */}
        {activeTab === 'rez' && <HotDealsSection title="Hot deals" limit={10} />}

        {/* Featured Category Sections - Dynamic sections by category - Only show when "rez" tab is active */}
        {activeTab === 'rez' && <FeaturedCategoriesContainer productsPerCategory={10} />}

        {/* Feature Highlights - Lazy Loaded (moved to bottom) - Only show when "rez" tab is active */}
        {activeTab === 'rez' && (
          <Suspense fallback={<BelowFoldFallback />}>
            <FeatureHighlights />
          </Suspense>
        )}

        {/* Show content for other tabs when not "rez" */}
        {activeTab !== 'rez' && (
          <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <ThemedText style={{ fontSize: 16, color: '#9AA7B2' }}>
              {activeTab === 'rez-mall' && 'Rez Mall content coming soon...'}
              {activeTab === 'cash-store' && 'Cash Store content coming soon...'}
              {activeTab === '1-rupee-store' && '1₹ Store content coming soon...'}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Profile Menu Modal - Lazy Loaded */}
      {user && (
        <Suspense fallback={<ModalFallback />}>
          <ProfileMenuModal visible={isModalVisible} onClose={hideModal} user={user} menuSections={profileMenuSections} onMenuItemPress={handleMenuItemPress} />
        </Suspense>
      )}

      {/* Quick Access FAB - Lazy Loaded */}
      <Suspense fallback={<FABFallback />}>
        <QuickAccessFAB />
      </Suspense>
      </Animated.ScrollView>
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
    shadowColor: '#00796B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.1)',
  },
  detailedLocationContent: {
    padding: 16,
  },
  addressSection: {
    marginBottom: 12,
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
