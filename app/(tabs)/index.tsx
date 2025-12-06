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
} from '@/components/homepage';
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
      // Only refresh if user is authenticated and we've already done initial load
      if (authState.user && statsLoadedRef.current) {
        // Reset the flag so loadUserStatistics will run
        statsLoadedRef.current = false;
        loadUserStatistics();
        // Also refresh cart data to update cart badge
        refreshCart();
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
        }
      } catch (error) {
        console.error('❌ [HOME] Failed to refresh homepage:', error);
      } finally {
        setRefreshing(false);
      }
    },
    [actions, authState.user]);

  const handleFashionPress = () => {
    router.push('/FashionPage');
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
      {/* Header */}
      <LinearGradient
        colors={['#00C06A', '#00A16B', '#FFC857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
              color="white"
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

            {/* ReZ Coin - Branded coin display */}
            <ReZCoin
              balance={userPoints}
              size="small"
              onPress={() => {
                if (Platform.OS === 'ios') {
                  setTimeout(() => router.push('/CoinPage'), 50);
                } else {
                  router.push('/CoinPage');
                }
              }}
            />

            <NotificationBell iconSize={24} iconColor="white" />

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
              <Ionicons name="cart-outline" size={24} color="white" />
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

        <TouchableOpacity
          style={viewStyles.searchContainer}
          onPress={handleSearchPress}
          activeOpacity={0.85}
          accessibilityLabel="Search bar"
          accessibilityRole="search"
          accessibilityHint="Double tap to search for stores, products, and services"
        >
          <Ionicons name="search" size={20} color="#666" style={viewStyles.searchIcon} />
          <Text style={textStyles.searchPlaceholder}>Search for the service</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Content */}
      <View style={viewStyles.content}>
        {/* Partner Card */}
        <TouchableOpacity
          style={viewStyles.partnerCard}
          onPress={handlePartnerPress}
          activeOpacity={0.9}
          accessibilityLabel={`Partner Level 1: ${userPoints || 0} points earned`}
          accessibilityRole="button"
          accessibilityHint="Double tap to view partner program details and rewards"
        >
          <View style={viewStyles.partnerInfo}>
            <View style={viewStyles.partnerIcon}>
              <Ionicons name="star" size={20} color="#00C06A" />
            </View>
            <View>
              <ThemedText style={textStyles.partnerLevel}>Partner</ThemedText>
              <ThemedText style={textStyles.level1}>Level 1</ThemedText>
            </View>
          </View>

          <View style={viewStyles.partnerStats}>
            <View style={viewStyles.stat}>
              <ThemedText style={textStyles.statNumber}>{userPoints || 0}</ThemedText>
              <ThemedText style={textStyles.statLabel}>Points</ThemedText>
            </View>

            <View style={viewStyles.progressDot} />

            <View style={viewStyles.stat}>
              <ThemedText style={textStyles.statNumber}>Level 1</ThemedText>
              <ThemedText style={textStyles.statLabel}>Partner</ThemedText>
            </View>
          </View>

          <View style={viewStyles.partnerArrow}>
            <Ionicons name="chevron-forward" size={20} color="#00C06A" />
          </View>
        </TouchableOpacity>

        {/* Online Voucher Button - Lazy Loaded */}
        <Suspense fallback={<BelowFoldFallback />}>
          <VoucherNavButton variant="minimal" style={{ marginBottom: 20 }} />
        </Suspense>

        {/* Feature Highlights - Lazy Loaded */}
        <Suspense fallback={<BelowFoldFallback />}>
          <FeatureHighlights />
        </Suspense>

        {/* Sections from state - Progressive loading with memoization */}
        {React.useMemo(() => {
          return state.sections
            .filter(section => section.items && section.items.length > 0)
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
                    section.id === 'just_for_you' ? 230 :
                      section.type === 'branded_stores' ? 200 : 280
                }
                spacing={
                  section.id === 'new_arrivals' ? 12 :
                    section.id === 'just_for_you' ? 12 : 16
                }
                showIndicator={false}
              />
            ));
        }, [state.sections, handleItemPress, actions, renderEventCard, renderRecommendationCard, renderStoreCard, renderBrandedStoreCard, renderProductCard])}

        {/* Categories Grid Section - Shows 10 random parent categories */}
        <CategoryGridSection title="Categories" maxCategories={10} />

        {/* Popular Products Section - Shows products with highest order count */}
        <PopularProductsSection title="Popular" limit={10} />

        {/* In Your Area Section - Shows products from nearby stores */}
        <NearbyProductsSection title="In Your Area" limit={10} radius={10} />
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
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
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
    backgroundColor: '#F7FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
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
    paddingBottom: 20,
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
  searchContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        outline: 'none',
      },
    }),
  },
  searchIcon: {
    marginRight: 10,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
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
});
