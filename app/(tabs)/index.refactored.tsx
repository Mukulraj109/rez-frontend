/**
 * Homepage Screen (Refactored)
 *
 * Restructured from 1,298 lines to ~300 lines
 * Components extracted to separate files for maintainability
 *
 * @screen
 */

import React, { Suspense } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHomepage, useHomepageNavigation } from '@/hooks/useHomepage';
import { useProfile, useProfileMenu } from '@/contexts/ProfileContext';
import { profileMenuSections } from '@/data/profileData';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useUserStatistics } from '@/hooks/useUserStatistics';
import { useHomeRefresh } from '@/hooks/useHomeRefresh';

// Imported Components
import HomeHeader from '@/components/homepage/HomeHeader';
import PartnerCard from '@/components/homepage/PartnerCard';
import QuickActionsGrid, { QuickAction } from '@/components/homepage/QuickActionsGrid';
import CategorySections, { CategorySection } from '@/components/homepage/CategorySections';
import {
  HorizontalScrollSection,
  EventCard,
  StoreCard,
  ProductCard,
  BrandedStoreCard,
  RecommendationCard,
} from '@/components/homepage';

// Styles
import { textStyles, viewStyles } from '@/styles/homepage.styles';

// Types
import {
  EventItem,
  StoreItem,
  ProductItem,
  BrandedStoreItem,
  RecommendationItem,
  HomepageSectionItem,
} from '@/types/homepage.types';

// Lazy-loaded components
const ProfileMenuModal = React.lazy(() => import('@/components/profile/ProfileMenuModal'));
const VoucherNavButton = React.lazy(() => import('@/components/voucher/VoucherNavButton'));
const NavigationShortcuts = React.lazy(() => import('@/components/navigation/NavigationShortcuts'));
const QuickAccessFAB = React.lazy(() => import('@/components/navigation/QuickAccessFAB'));
const FeatureHighlights = React.lazy(() => import('@/components/homepage/FeatureHighlights'));

// Fallback components
const BelowFoldFallback = () => (
  <View style={{ paddingVertical: 20, alignItems: 'center' }}>
    <ActivityIndicator size="small" color="#8B5CF6" />
  </View>
);
const ModalFallback = () => null;
const FABFallback = () => null;

/**
 * HomeScreen Component
 *
 * Main homepage screen with:
 * - Header with location, user stats, and search
 * - Partner card
 * - Quick actions grid
 * - Category sections (Going Out, Home Delivery)
 * - Dynamic content sections from backend
 */
export default function HomeScreen() {
  const router = useRouter();
  const { state, actions } = useHomepage();
  const { handleItemPress, handleAddToCart } = useHomepageNavigation();
  const { user, isModalVisible, showModal, hideModal } = useProfile();
  const { handleMenuItemPress } = useProfileMenu();
  const { state: cartState } = useCart();
  const { state: authState } = useAuth();
  const { state: subscriptionState } = useSubscription();

  // Location animation state
  const [showDetailedLocation, setShowDetailedLocation] = React.useState(false);
  const animatedHeight = React.useRef(new Animated.Value(0)).current;
  const animatedOpacity = React.useRef(new Animated.Value(0)).current;

  // User statistics hook
  const { userPoints, userStats } = useUserStatistics(authState.user?.id);

  // Refresh hook
  const { refreshing, onRefresh } = useHomeRefresh(
    {
      refreshAllSections: actions.refreshAllSections,
      refreshUserStatistics: async () => {
        // User statistics refresh is handled by the hook
      },
    },
    !!authState.user
  );

  // Initialize push notifications
  usePushNotifications();

  // Navigation handlers
  const handleFashionPress = () => router.push('/FashionPage');
  const handleMainStorePress = () => router.push('/Store');
  const handleWalletPress = () => router.push('/WalletScreen');
  const handleOffersPress = () => router.push('/offers');
  const handlePartnerPress = () => router.push('/profile/partner');
  const handleSearchPress = () => router.push('/search');
  const handleGoingOutViewAll = () => router.push('/going-out');
  const handleHomeDeliveryViewAll = () => router.push('/home-delivery');
  const handleCategoryPress = (categorySlug: string) => {
    router.push(`/category/${categorySlug}` as any);
  };

  // Location toggle handler
  const handleToggleLocation = () => {
    const newState = !showDetailedLocation;
    setShowDetailedLocation(newState);

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
  };

  // Quick Actions configuration
  const quickActions: QuickAction[] = [
    {
      id: 'tracking',
      icon: 'location-outline',
      label: 'Track Orders',
      value: userStats
        ? `${Math.max(
            0,
            (userStats.orders?.total || 0) -
              (userStats.orders?.completed || 0) -
              (userStats.orders?.cancelled || 0)
          )} Active`
        : 'Loading...',
      onPress: () => router.push('/tracking'),
      accessibilityLabel: `Track orders: ${
        userStats
          ? Math.max(
              0,
              (userStats.orders?.total || 0) -
                (userStats.orders?.completed || 0) -
                (userStats.orders?.cancelled || 0)
            )
          : 0
      } active orders`,
      accessibilityHint: 'Double tap to track your active orders',
    },
    {
      id: 'wallet',
      icon: 'wallet-outline',
      label: 'Wallet',
      value: `₹ ${userPoints.toLocaleString()}`,
      onPress: handleWalletPress,
      accessibilityLabel: `Wallet balance: Rupees ${userPoints.toLocaleString()}`,
      accessibilityHint: 'Double tap to open your wallet and view transactions',
    },
    {
      id: 'offers',
      icon: 'pricetag-outline',
      label: 'Offers',
      value:
        userStats?.offers?.totalRedeemed !== undefined
          ? `${Math.max(0, 5 - (userStats.offers.totalRedeemed || 0))} New`
          : '5 New',
      onPress: handleOffersPress,
      accessibilityLabel: `Offers: ${
        userStats?.offers?.totalRedeemed !== undefined
          ? Math.max(0, 5 - (userStats.offers.totalRedeemed || 0))
          : 5
      } new offers available`,
      accessibilityHint: 'Double tap to view available offers and deals',
    },
    {
      id: 'store',
      icon: 'storefront-outline',
      label: 'Store',
      value: 'Explore',
      onPress: handleMainStorePress,
      accessibilityLabel: 'Store: Explore stores and products',
      accessibilityHint: 'Double tap to browse stores and their products',
      useIOSWrapper: true,
    },
  ];

  // Category Sections configuration
  const categorySections: CategorySection[] = [
    {
      title: 'Going Out',
      categories: [
        {
          id: 'fashion',
          slug: 'fashion',
          label: 'Fashion',
          icon: 'shirt-outline',
          onPress: handleFashionPress,
        },
        {
          id: 'fleet',
          slug: 'fleet',
          label: 'Fleet Market',
          icon: 'car-outline',
          onPress: () => handleCategoryPress('fleet'),
        },
        {
          id: 'gift',
          slug: 'gift',
          label: 'Gift',
          icon: 'gift-outline',
          onPress: () => handleCategoryPress('gift'),
        },
        {
          id: 'restaurant',
          slug: 'restaurant',
          label: 'Restaurant',
          icon: 'restaurant-outline',
          onPress: () => handleCategoryPress('restaurant'),
        },
        {
          id: 'electronics',
          slug: 'electronics',
          label: 'Electronic',
          icon: 'phone-portrait-outline',
          onPress: () => handleCategoryPress('electronics'),
        },
      ],
      onViewAll: handleGoingOutViewAll,
    },
    {
      title: 'Home Delivery',
      categories: [
        {
          id: 'organic',
          slug: 'organic',
          label: 'Organic',
          icon: 'leaf-outline',
          onPress: () => handleCategoryPress('organic'),
        },
        {
          id: 'grocery',
          slug: 'grocery',
          label: 'Grocery',
          icon: 'basket-outline',
          onPress: () => handleCategoryPress('grocery'),
        },
        {
          id: 'medicine',
          slug: 'medicine',
          label: 'Medicine',
          icon: 'medical-outline',
          onPress: () => handleCategoryPress('medicine'),
        },
        {
          id: 'fruit',
          slug: 'fruit',
          label: 'Fruit',
          icon: 'nutrition-outline',
          onPress: () => handleCategoryPress('fruit'),
        },
        {
          id: 'meat',
          slug: 'meat',
          label: 'Meat',
          icon: 'restaurant',
          onPress: () => handleCategoryPress('meat'),
        },
      ],
      onViewAll: handleHomeDeliveryViewAll,
    },
  ];

  // Card renderers
  const renderEventCard = (item: HomepageSectionItem) => {
    const event = item as EventItem;
    return (
      <EventCard
        event={event}
        onPress={(eventItem) => {
          actions.trackSectionView('events');
          actions.trackItemClick('events', eventItem.id);
          handleItemPress('events', eventItem);
        }}
      />
    );
  };

  const renderRecommendationCard = (item: HomepageSectionItem) => {
    const recommendation = item as RecommendationItem;
    return (
      <RecommendationCard
        recommendation={recommendation}
        onPress={(rec) => {
          actions.trackSectionView('just_for_you');
          actions.trackItemClick('just_for_you', rec.id);
          handleItemPress('just_for_you', rec);
        }}
        onAddToCart={(rec) => {
          actions.trackItemClick('just_for_you', rec.id);
          handleAddToCart(rec);
        }}
      />
    );
  };

  const renderStoreCard = (item: HomepageSectionItem, sectionId: string) => {
    const store = item as StoreItem;
    return (
      <StoreCard
        store={store}
        onPress={(storeItem) => {
          actions.trackSectionView(sectionId);
          actions.trackItemClick(sectionId, storeItem.id);
          handleItemPress(sectionId, storeItem);
        }}
      />
    );
  };

  const renderBrandedStoreCard = (item: HomepageSectionItem) => {
    const store = item as BrandedStoreItem;
    return (
      <BrandedStoreCard
        store={store}
        onPress={(storeItem) => {
          actions.trackSectionView('top_stores');
          actions.trackItemClick('top_stores', storeItem.id);
          handleItemPress('top_stores', storeItem);
        }}
        width={200}
      />
    );
  };

  const renderProductCard = (item: HomepageSectionItem) => {
    const product = item as ProductItem;
    return (
      <ProductCard
        product={product}
        onPress={(productItem) => {
          actions.trackSectionView('new_arrivals');
          actions.trackItemClick('new_arrivals', productItem.id);
          handleItemPress('new_arrivals', productItem);
        }}
        onAddToCart={(productItem) => {
          actions.trackItemClick('new_arrivals', productItem.id);
          handleAddToCart(productItem);
        }}
      />
    );
  };

  return (
    <ScrollView
      style={viewStyles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#8B5CF6"
          colors={['#8B5CF6']}
        />
      }
    >
      {/* Header */}
      <HomeHeader
        userPoints={userPoints}
        subscriptionTier={subscriptionState.currentSubscription?.tier}
        cartItemCount={cartState.items.length}
        showDetailedLocation={showDetailedLocation}
        onToggleLocation={handleToggleLocation}
        animatedHeight={animatedHeight}
        animatedOpacity={animatedOpacity}
        onSearchPress={handleSearchPress}
        onProfilePress={() => {
          if (authState.isAuthenticated && authState.user) {
            showModal();
          }
        }}
        userInitials={
          user?.initials ||
          (authState.user?.profile?.firstName
            ? authState.user.profile.firstName.charAt(0).toUpperCase()
            : authState.isAuthenticated
            ? 'U'
            : '?')
        }
        isAuthenticated={authState.isAuthenticated}
        headerStyles={viewStyles}
        textStyles={textStyles}
      />

      {/* Content */}
      <View style={viewStyles.content}>
        {/* Partner Card */}
        <PartnerCard points={userPoints} level="Level 1" onPress={handlePartnerPress} />

        {/* Quick Actions */}
        <QuickActionsGrid actions={quickActions} />

        {/* Online Voucher Button - Lazy Loaded */}
        <Suspense fallback={<BelowFoldFallback />}>
          <VoucherNavButton variant="minimal" style={{ marginBottom: 20 }} />
        </Suspense>

        {/* Navigation Shortcuts - Lazy Loaded */}
        <Suspense fallback={<BelowFoldFallback />}>
          <NavigationShortcuts />
        </Suspense>

        {/* Feature Highlights - Lazy Loaded */}
        <Suspense fallback={<BelowFoldFallback />}>
          <FeatureHighlights />
        </Suspense>

        {/* Category Sections (Going Out & Home Delivery) */}
        <CategorySections sections={categorySections} />

        {/* Dynamic Sections from Backend */}
        {state.sections
          .filter((section) => section.items && section.items.length > 0)
          .map((section) => (
            <HorizontalScrollSection
              key={section.id}
              section={section}
              onItemPress={(item) => handleItemPress(section.id, item)}
              onRefresh={() => actions.refreshSection(section.id)}
              renderCard={(item) => {
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
                section.id === 'new_arrivals'
                  ? 180
                  : section.id === 'just_for_you'
                  ? 230
                  : section.type === 'branded_stores'
                  ? 200
                  : 280
              }
              spacing={
                section.id === 'new_arrivals'
                  ? 12
                  : section.id === 'just_for_you'
                  ? 12
                  : 16
              }
              showIndicator={false}
            />
          ))}
      </View>

      {/* Profile Menu Modal - Lazy Loaded */}
      {user && (
        <Suspense fallback={<ModalFallback />}>
          <ProfileMenuModal
            visible={isModalVisible}
            onClose={hideModal}
            user={user}
            menuSections={profileMenuSections}
            onMenuItemPress={handleMenuItemPress}
          />
        </Suspense>
      )}

      {/* Quick Access FAB - Lazy Loaded */}
      <Suspense fallback={<FABFallback />}>
        <QuickAccessFAB />
      </Suspense>
    </ScrollView>
  );
}
