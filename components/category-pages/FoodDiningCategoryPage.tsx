/**
 * Food & Dining Category Page - ENHANCED
 * Based on Rez_v-2-main FoodDining.jsx design
 * Features: Tabs (delivery, dineIn, offers, experiences), mode filters, cuisine filters,
 * Restaurant cards, 60-min delivery, loyalty hub, pay at restaurant
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity, TextInput, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import CategoryHeader from '@/components/CategoryHeader';
import { getCategoryConfig } from '@/config/categoryConfig';
import QuickActionBar from '@/components/category/QuickActionBar';
import StreakLoyaltySection from '@/components/category/StreakLoyaltySection';
import FooterTrustSection from '@/components/category/FooterTrustSection';
// New enhanced components
import BrowseCategoryGrid from '@/components/category/BrowseCategoryGrid';
import EnhancedAISuggestionsSection from '@/components/category/EnhancedAISuggestionsSection';
import EnhancedUGCSocialProofSection from '@/components/category/EnhancedUGCSocialProofSection';
import OffersSection from '@/components/category/OffersSection';
import ExperiencesSection from '@/components/category/ExperiencesSection';
import OrderAgainSection from '@/components/category/OrderAgainSection';
// API Hook for real data
import { useCategoryPageData } from '@/hooks/useCategoryPageData';
import { useWallet } from '@/hooks/useWallet';
// Error and Loading States
import { ErrorBoundary } from '@/components/ErrorBoundary';
import EmptyState from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
// Fallback dummy data for cuisine filters
import { foodCategoryData } from '@/data/category';
// API for loyalty stats and recent orders
import { categoriesApi } from '@/services/categoriesApi';
import ordersApi, { Order } from '@/services/ordersApi';
import { storesApi } from '@/services/storesApi'; // Import storesApi specifically
import { useRegion } from '@/contexts/RegionContext';

// Rez Brand Colors
const COLORS = {
  primaryGreen: '#00C06A',
  primaryGold: '#F59E0B',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  background: '#F5F5F5',
};

const FOOD_TABS = [
  { id: 'delivery', label: 'Delivery', icon: 'bicycle-outline' },
  { id: 'dineIn', label: 'Dine-In', icon: 'restaurant-outline' },
  { id: 'offers', label: 'Offers', icon: 'pricetag-outline' },
  { id: 'experiences', label: 'Experiences', icon: 'sparkles-outline' },
];

// Restaurant Card Component - Enhanced with all features
const RestaurantCard = ({ restaurant, variant = 'default', userVisitCount = 0 }: { restaurant: any; variant?: 'default' | 'compact'; userVisitCount?: number }) => {
  const router = useRouter();
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();
  const isCompact = variant === 'compact';
  const [imageError, setImageError] = useState(false);

  // Get image URI from restaurant data
  const getImageUri = (): string | undefined => {
    // Handle banner array (banner is string[] in Store model)
    if (restaurant.banner) {
      if (Array.isArray(restaurant.banner) && restaurant.banner.length > 0) {
        return restaurant.banner[0];
      }
      if (typeof restaurant.banner === 'string') {
        return restaurant.banner;
      }
    }

    // Fallback to logo, then image
    return restaurant.logo || restaurant.image || undefined;
  };

  const imageUri = getImageUri();

  // Get cuisine tags for display (first 3 tags)
  const getCuisineTags = (): string => {
    if (restaurant.tags && Array.isArray(restaurant.tags) && restaurant.tags.length > 0) {
      // Filter out dietary tags for cuisine display
      const cuisineTags = restaurant.tags.filter((tag: string) =>
        !['halal', 'pure-veg', 'veg', 'non-veg', 'jain'].includes(tag.toLowerCase())
      );
      return cuisineTags.slice(0, 3).map((t: string) => t.charAt(0).toUpperCase() + t.slice(1)).join(' • ') || restaurant.category?.name || 'Restaurant';
    }
    return restaurant.category?.name || 'Restaurant';
  };

  // Check dietary tags
  const isHalal = restaurant.tags?.some((t: string) => t.toLowerCase() === 'halal');
  const isPureVeg = restaurant.tags?.some((t: string) => ['pure-veg', 'veg', 'vegetarian'].includes(t.toLowerCase()));

  // Calculate coins earned (based on cashback percentage or reward rules)
  const coinsEarned = restaurant.rewardRules?.baseCashbackPercent
    ? Math.round(restaurant.rewardRules.baseCashbackPercent * 10)
    : Math.round((restaurant.offers?.cashback || 10) * 4.5);

  // Review bonus coins
  const reviewBonus = restaurant.rewardRules?.reviewBonusCoins || 20;

  // Visit milestone (first milestone or default)
  const visitMilestone = restaurant.rewardRules?.visitMilestoneRewards?.[0]?.visits || 5;

  return (
    <TouchableOpacity
      style={[styles.restaurantCard, isCompact && styles.restaurantCardCompact]}
      onPress={() => router.push(`/MainStorePage?storeId=${restaurant._id || restaurant.id}` as any)}
      activeOpacity={0.8}
    >
      <View style={[styles.restaurantImageContainer, isCompact && styles.restaurantImageContainerCompact]}>
        {imageUri && !imageError ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.restaurantImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.restaurantImage, styles.restaurantImagePlaceholder]}>
            <Ionicons name="restaurant" size={40} color={COLORS.textSecondary} />
            <Text style={styles.restaurantImagePlaceholderText}>{restaurant.name}</Text>
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.restaurantImageGradient}
        />

        {/* Badges Row */}
        <View style={styles.restaurantBadges}>
          {restaurant.deliveryCategories?.fastDelivery && (
            <View style={styles.badge60Min}>
              <Ionicons name="flash" size={10} color="#000" />
              <Text style={styles.badge60MinText}>60 min</Text>
            </View>
          )}
          {isHalal && (
            <View style={styles.badgeHalal}>
              <Text style={styles.badgeHalalText}>Halal</Text>
            </View>
          )}
          {isPureVeg && (
            <View style={styles.badgePureVeg}>
              <Text style={styles.badgePureVegText}>Pure Veg</Text>
            </View>
          )}
          {restaurant.offers?.cashback && (
            <View style={styles.badgeCashbackPurple}>
              <Text style={styles.badgeCashbackPurpleText}>{restaurant.offers.cashback}% cashback</Text>
            </View>
          )}
        </View>

        {/* Rating Badge */}
        <View style={styles.restaurantRating}>
          <Ionicons name="star" size={12} color={COLORS.primaryGold} />
          <Text style={styles.restaurantRatingText}>
            {restaurant.ratings?.average?.toFixed(1) || '4.5'}
          </Text>
          <Text style={styles.restaurantRatingCount}>
            ({restaurant.ratings?.count || 0})
          </Text>
        </View>
      </View>

      <View style={styles.restaurantContent}>
        {/* Name and Cuisine */}
        <Text style={styles.restaurantName} numberOfLines={1}>{restaurant.name}</Text>
        <Text style={styles.restaurantCuisine} numberOfLines={1}>
          {getCuisineTags()}
        </Text>

        {/* Meta Info Row: Distance, Time, Price */}
        <View style={styles.restaurantMeta}>
          <View style={styles.restaurantMetaItem}>
            <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.restaurantMetaText}>
              {restaurant.distance ? `${restaurant.distance} km` : restaurant.location?.city || 'Nearby'}
            </Text>
          </View>
          <View style={styles.restaurantMetaItem}>
            <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.restaurantMetaText}>
              {restaurant.operationalInfo?.deliveryTime || '30-35 min'}
            </Text>
          </View>
          {restaurant.priceForTwo && (
            <Text style={styles.restaurantPriceForTwo}>
              {currencySymbol}{restaurant.priceForTwo} for two
            </Text>
          )}
        </View>

        {/* Coins and Review Bonus Row */}
        <View style={styles.restaurantRewardsRow}>
          <View style={styles.restaurantCoins}>
            <Ionicons name="star" size={14} color={COLORS.primaryGold} />
            <Text style={styles.restaurantCoinsText}>
              Earn {currencySymbol}{coinsEarned} coins
            </Text>
          </View>
          <Text style={styles.reviewBonusText}>
            +{currencySymbol}{reviewBonus} for review
          </Text>
        </View>

        {/* Visit Progress Row */}
        <View style={styles.visitProgressRow}>
          <Text style={styles.visitProgressText}>
            {userVisitCount}/{visitMilestone} visits
          </Text>
          {userVisitCount < visitMilestone && (
            <TouchableOpacity onPress={() => router.push('/my-visits' as any)}>
              <Text style={styles.unlockRewardText}>Unlock reward</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};


export default function FoodDiningCategoryPage() {
  const router = useRouter();
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();
  const slug = 'food-dining';
  const categoryConfig = getCategoryConfig(slug);

  // Use the new hook for real data with fallback
  const {
    subcategories,
    stores,
    ugcPosts,
    aiPlaceholders,
    isLoading,
    error,
    refetch,
  } = useCategoryPageData(slug);

  // Get wallet data for savings display
  const { walletState } = useWallet({ autoFetch: true });
  const savingsThisMonth = walletState.data?.savingsInsights?.thisMonth || 0;

  // User visits map (storeId -> count)
  const [visitCounts, setVisitCounts] = useState<Record<string, number>>({});

  // Fetch user visits to calculate progress
  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const response = await storesApi.getUserVisitHistory(1, 100); // Fetch last 100 visits
        if (response.success && response.data?.visits) {
          const counts: Record<string, number> = {};
          response.data.visits.forEach(visit => {
            const storeId = visit.store.id;
            counts[storeId] = (counts[storeId] || 0) + 1;
          });
          setVisitCounts(counts);
        }
      } catch (error) {
        console.error('❌ [FOOD DINING] Error fetching user visits:', error);
      }
    };

    fetchVisits();
  }, []);

  const [activeTab, setActiveTab] = useState('delivery');
  const [activeCuisine, setActiveCuisine] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Real data states for loyalty hub and ticker
  const [loyaltyStats, setLoyaltyStats] = useState<{ ordersCount: number; brandsCount: number }>({ ordersCount: 0, brandsCount: 0 });
  const [recentOrders, setRecentOrders] = useState<{ userName: string; storeName: string; timeAgo: string }[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [tickerIndex, setTickerIndex] = useState(0);

  const placeholders = [
    'Search biryani, pizza, burgers...',
    'Find restaurants near you...',
    'What are you craving?',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Fetch loyalty stats and recent orders
  useEffect(() => {
    const fetchLoyaltyData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          categoriesApi.getCategoryLoyaltyStats(slug),
          categoriesApi.getRecentOrders(slug, 5)
        ]);
        if (statsRes.success && statsRes.data) {
          setLoyaltyStats(statsRes.data);
        }
        if (ordersRes.success && ordersRes.data?.orders) {
          setRecentOrders(ordersRes.data.orders);
        }
      } catch (err) {
      }
    };
    fetchLoyaltyData();
  }, [slug]);

  // Fetch user's personal orders for Order Again section
  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const res = await ordersApi.getOrders({ limit: 10, sort: 'newest' });
        if (res.success && res.data?.orders) {
          setMyOrders(res.data.orders);
        }
      } catch (err) {
      }
    };
    fetchMyOrders();
  }, []);

  // Animation ref for ticker fade effect
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Cycle through recent orders for ticker with fade animation
  useEffect(() => {
    if (recentOrders.length > 1) {
      const timer = setInterval(() => {
        // Fade out
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // Update index
          setTickerIndex((prev) => (prev + 1) % recentOrders.length);
          // Fade in
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        });
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [recentOrders.length, fadeAnim]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Filter stores by active cuisine
  const filteredStores = useMemo(() => {
    if (activeCuisine === 'all') {
      return stores;
    }

    // Map cuisine IDs to tag patterns for filtering
    const cuisineTagMap: Record<string, string[]> = {
      'indian': ['indian', 'north indian', 'south indian', 'biryani', 'curry'],
      'chinese': ['chinese', 'szechuan', 'cantonese'],
      'italian': ['italian', 'pizza', 'pasta'],
      'thai': ['thai'],
      'mexican': ['mexican', 'tex-mex'],
      'south-indian': ['south indian', 'dosa', 'idli', 'vada'],
      'north-indian': ['north indian', 'punjabi', 'mughlai'],
      'continental': ['continental', 'european'],
      'japanese': ['japanese', 'sushi'],
      'thali': ['thali', 'meals', 'platter'],
      'ice-cream': ['ice cream', 'ice-cream', 'dessert', 'desert'],
      'street-food': ['street food', 'chaat', 'snack'],
      'biryani': ['biryani', 'kebab'],
      'healthy': ['healthy', 'salad', 'diet'],
      'cafe': ['cafe', 'coffee', 'bakery'],
      'desserts': ['dessert', 'sweet', 'cake'],
    };

    const cuisineTags = cuisineTagMap[activeCuisine] || [activeCuisine];

    return stores.filter((store: any) => {
      // Check if store has tags matching the cuisine
      if (store.tags && Array.isArray(store.tags)) {
        const storeTags = store.tags.map((tag: string) => tag.toLowerCase());
        return cuisineTags.some(cuisineTag =>
          storeTags.some((storeTag: string) => storeTag.includes(cuisineTag.toLowerCase()))
        );
      }

      // Fallback: check category name or store name
      const categoryName = store.category?.name?.toLowerCase() || '';
      const storeName = store.name?.toLowerCase() || '';
      return cuisineTags.some(cuisineTag =>
        categoryName.includes(cuisineTag.toLowerCase()) ||
        storeName.includes(cuisineTag.toLowerCase())
      );
    });
  }, [stores, activeCuisine]);

  const fastDeliveryStores = filteredStores.filter((s: any) => s.is60Min);
  const topRatedStores = filteredStores.filter((s: any) => (s.rating || 0) >= 4.5);

  // Handle category press - navigate to search with cuisine tag for better results
  const handleCategoryPress = (category: any) => {
    // Use search with cuisine tag to find matching stores
    const cuisineTag = category.slug || category.id;
    router.push(`/search?q=${encodeURIComponent(cuisineTag)}&category=${slug}` as any);
  };

  // Handle AI search
  const handleAISearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}&category=${slug}`);
  };

  if (!categoryConfig) return null;

  // Show loading state
  if (isLoading && !refreshing && stores.length === 0) {
    return <LoadingState message="Loading restaurants..." />;
  }

  // Show error state with retry
  if (error && stores.length === 0) {
    return (
      <EmptyState
        icon="🍽️"
        title="Unable to load restaurants"
        message={error || "Something went wrong. Please try again."}
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }

  return (
    <ErrorBoundary onError={(err) => console.error('[FoodDiningPage] Error:', err)}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[categoryConfig.primaryColor]}
          />
        }
      >
        <CategoryHeader
          categoryName={categoryConfig.name}
          primaryColor={categoryConfig.primaryColor}
          banner={categoryConfig.banner}
          gradientColors={categoryConfig.gradientColors}
        />

        {/* Social Proof Strip - with fade animation */}
        {recentOrders.length > 0 && (
          <View style={styles.socialProofStrip}>
            <Animated.View style={[styles.socialProofContent, { opacity: fadeAnim }]}>
              <Text style={styles.socialProofEmoji}>👤</Text>
              <Text style={styles.socialProofText}>
                <Text style={styles.socialProofUser}>{recentOrders[tickerIndex]?.userName || 'Someone'}</Text>
                <Text> just ordered from </Text>
                <Text style={styles.socialProofRestaurant}>{recentOrders[tickerIndex]?.storeName || 'a restaurant'}</Text>
              </Text>
              <Text style={styles.socialProofTime}>{recentOrders[tickerIndex]?.timeAgo || 'recently'}</Text>
            </Animated.View>
          </View>
        )}

        {/* Loyalty Hub CTA */}
        <TouchableOpacity
          style={styles.loyaltyHub}
          onPress={() => router.push('/my-visits' as any)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(0, 192, 106, 0.2)', 'rgba(0, 137, 107, 0.2)', 'rgba(251, 191, 36, 0.2)']}
            style={styles.loyaltyHubGradient}
          >
            <View style={styles.loyaltyHubHeader}>
              <View style={styles.loyaltyHubIcon}>
                <Ionicons name="trophy" size={24} color={COLORS.primaryGreen} />
              </View>
              <View style={styles.loyaltyHubText}>
                <Text style={styles.loyaltyHubTitle}>Food Loyalty Hub</Text>
                <Text style={styles.loyaltyHubSubtitle}>Track streaks, unlock rewards</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </View>
            <View style={styles.loyaltyHubStats}>
              <View style={styles.loyaltyHubStat}>
                <Text style={styles.loyaltyHubStatLabel}>Total Visits</Text>
                <Text style={styles.loyaltyHubStatValue}>{loyaltyStats.ordersCount}</Text>
              </View>
              <View style={styles.loyaltyHubStat}>
                <Text style={styles.loyaltyHubStatLabel}>Active Brands</Text>
                <Text style={[styles.loyaltyHubStatValue, { color: COLORS.primaryGold }]}>{loyaltyStats.brandsCount}</Text>
              </View>
              <View style={styles.loyaltyHubStat}>
                <Text style={styles.loyaltyHubStatLabel}>Next Reward</Text>
                <Ionicons name="gift" size={20} color={COLORS.primaryGreen} />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
            {FOOD_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[
                  styles.tab,
                  activeTab === tab.id && styles.tabActive,
                ]}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={18}
                  color={activeTab === tab.id ? COLORS.white : COLORS.textSecondary}
                />
                <Text style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.tabLabelActive,
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <QuickActionBar categorySlug={slug} />

        {/* Enhanced AI Suggestions Section */}
        <EnhancedAISuggestionsSection
          categorySlug={slug}
          categoryName={categoryConfig.name}
          placeholders={aiPlaceholders}
          onSearch={handleAISearch}
        />

        {/* Browse Category Grid */}
        <BrowseCategoryGrid
          categories={subcategories}
          title="What are you craving?"
          onCategoryPress={handleCategoryPress}
          itemCountLabel="places"
        />

        {/* Delivery Tab Content */}
        {activeTab === 'delivery' && (
          <View style={styles.tabContent}>
            {/* Cuisine Filters */}
            <View style={styles.cuisineContainer}>
              <Text style={styles.cuisineTitle}>What are you craving?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cuisineFilters}>
                {foodCategoryData.cuisineFilters.map((cuisine) => (
                  <TouchableOpacity
                    key={cuisine.id}
                    onPress={() => setActiveCuisine(cuisine.id)}
                    style={[
                      styles.cuisineChip,
                      activeCuisine === cuisine.id && styles.cuisineChipActive,
                    ]}
                  >
                    <Text style={styles.cuisineIcon}>{cuisine.icon}</Text>
                    <Text style={[
                      styles.cuisineLabel,
                      activeCuisine === cuisine.id && styles.cuisineLabelActive,
                    ]}>
                      {cuisine.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Order Again Section */}
            {myOrders.length > 0 && (
              <OrderAgainSection orders={myOrders} />
            )}

            {/* 60-Min Delivery */}
            {fastDeliveryStores.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="flash-outline" size={20} color={COLORS.primaryGold} />
                  <Text style={styles.sectionTitle}>60-Min Delivery</Text>
                  <TouchableOpacity onPress={() => router.push(`/stores?category=${slug}&filter=try-buy` as any)}>
                    <Text style={styles.sectionSeeAll}>View All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.restaurantsList}>
                  {fastDeliveryStores.slice(0, 5).map((store) => (
                    <RestaurantCard
                      key={store.id}
                      restaurant={store}
                      variant="compact"
                      userVisitCount={visitCounts[store.id] || 0}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Top Rated */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionEmoji}>🔥</Text>
                <Text style={styles.sectionTitle}>Top Rated Near You</Text>
                <TouchableOpacity onPress={() => router.push(`/stores?category=${slug}&filter=top-rated`)}>
                  <Text style={styles.sectionSeeAll}>View All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.restaurantsGrid}>
                {topRatedStores.slice(0, 4).map((store) => (
                  <RestaurantCard
                    key={store.id}
                    restaurant={store}
                    userVisitCount={visitCounts[store.id] || 0}
                  />
                ))}
              </View>
            </View>

            {/* All Restaurants */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="restaurant-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.sectionTitle}>All Restaurants</Text>
                <Text style={styles.sectionCount}>{filteredStores.length} places</Text>
              </View>
              <View style={styles.restaurantsGrid}>
                {filteredStores.map((store) => (
                  <RestaurantCard
                    key={store.id}
                    restaurant={store}
                    userVisitCount={visitCounts[store.id] || 0}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Dine-In Tab Content */}
        {activeTab === 'dineIn' && (
          <View style={styles.tabContent}>
            <View style={styles.bookTableBanner}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
                style={styles.bookTableGradient}
              >
                <Text style={styles.bookTableTitle}>Book a Table</Text>
                <Text style={styles.bookTableSubtitle}>
                  Reserve now, pay at restaurant & earn cashback
                </Text>
                <View style={styles.bookTableBonus}>
                  <Ionicons name="star" size={16} color={COLORS.primaryGold} />
                  <Text style={styles.bookTableBonusText}>Bonus coins on check-in!</Text>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Dine-In Nearby</Text>
                <Text style={styles.sectionCount}>{filteredStores.length} places</Text>
              </View>
              <View style={styles.restaurantsGrid}>
                {filteredStores.map((store) => (
                  <RestaurantCard key={store.id} restaurant={store} />
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Offers Tab Content */}
        {activeTab === 'offers' && (
          <View style={styles.tabContent}>
            <OffersSection categorySlug={slug} />
          </View>
        )}

        {/* Experiences Tab Content */}
        {activeTab === 'experiences' && (
          <View style={styles.tabContent}>
            <ExperiencesSection categorySlug={slug} />
          </View>
        )}

        {/* Value Proposition */}
        <View style={styles.valueProp}>
          <Text style={styles.valuePropTitle}>
            Eat out or order in — ReZ makes every meal rewarding.
          </Text>
          <View style={styles.valuePropGrid}>
            <View style={styles.valuePropItem}>
              <Text style={styles.valuePropIcon}>💰</Text>
              <Text style={styles.valuePropText}>Cashback on every order</Text>
            </View>
            <View style={styles.valuePropItem}>
              <Text style={styles.valuePropIcon}>🪙</Text>
              <Text style={styles.valuePropText}>Earn coins to reuse</Text>
            </View>
            <View style={styles.valuePropItem}>
              <Text style={styles.valuePropIcon}>📱</Text>
              <Text style={styles.valuePropText}>Pay at restaurant</Text>
            </View>
            <View style={styles.valuePropItem}>
              <Text style={styles.valuePropIcon}>🎁</Text>
              <Text style={styles.valuePropText}>Loyalty rewards</Text>
            </View>
          </View>
        </View>

        {/* Savings Summary */}
        <View style={styles.savingsSummary}>
          <View style={styles.savingsContent}>
            <Text style={styles.savingsLabel}>Total saved on food this month</Text>
            <Text style={styles.savingsAmount}>{currencySymbol}{savingsThisMonth.toLocaleString()}</Text>
          </View>
          {/* Loyalty Hub CTA */}
          <TouchableOpacity
            style={styles.loyaltyHub}
            onPress={() => router.push('/my-visits' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.savingsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>

        <StreakLoyaltySection />

        {/* Enhanced UGC Social Proof Section */}
        <EnhancedUGCSocialProofSection
          categorySlug={slug}
          categoryName={categoryConfig.name}
          posts={ugcPosts}
          title="Real Foodies, Real Reviews"
          subtitle="See what others are eating - Get inspired!"
          onPostPress={(post) => router.push(`/ugc/${post.id}` as any)}
          onSharePress={() => router.push('/share' as any)}
        />

        <FooterTrustSection />
      </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  socialProofStrip: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  socialProofContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  socialProofEmoji: {
    fontSize: 16,
  },
  socialProofText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  socialProofUser: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  socialProofRestaurant: {
    color: COLORS.primaryGreen,
    fontWeight: '500',
  },
  socialProofTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  loyaltyHub: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  loyaltyHubGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.3)',
  },
  loyaltyHubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  loyaltyHubIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 192, 106, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loyaltyHubText: {
    flex: 1,
  },
  loyaltyHubTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  loyaltyHubSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  loyaltyHubStats: {
    flexDirection: 'row',
    gap: 8,
  },
  loyaltyHubStat: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  loyaltyHubStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  loyaltyHubStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tabsContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 8,
  },
  tabs: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    gap: 6,
  },
  tabActive: {
    backgroundColor: COLORS.primaryGreen,
  },
  tabLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  tabLabelActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  tabContent: {
    paddingTop: 16,
  },
  cuisineContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cuisineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  cuisineFilters: {
    gap: 8,
  },
  cuisineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    gap: 6,
  },
  cuisineChipActive: {
    backgroundColor: COLORS.primaryGreen,
  },
  cuisineIcon: {
    fontSize: 16,
  },
  cuisineLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cuisineLabelActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionEmoji: {
    fontSize: 20,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectionSeeAll: {
    fontSize: 12,
    color: COLORS.primaryGreen,
    fontWeight: '500',
  },
  sectionCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  restaurantsList: {
    gap: 12,
    paddingRight: 16,
  },
  restaurantsGrid: {
    gap: 16,
  },
  restaurantCard: {
    borderRadius: 16,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    marginBottom: 16,
  },
  restaurantCardCompact: {
    minWidth: 200,
    marginRight: 12,
    marginBottom: 0,
  },
  restaurantImageContainer: {
    height: 180,
    position: 'relative',
  },
  restaurantImageContainerCompact: {
    height: 120,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  restaurantImagePlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantImagePlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  restaurantImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  restaurantBadges: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  badge60Min: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGold,
    gap: 3,
  },
  badge60MinText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  badgeCashback: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  badgeCashbackText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.primaryGreen,
  },
  restaurantRating: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    gap: 4,
  },
  restaurantRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  restaurantRatingCount: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  restaurantContent: {
    padding: 12,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  restaurantCuisine: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  restaurantMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  restaurantMetaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  restaurantCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  restaurantCoinsText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primaryGold,
  },
  // New badge styles
  badgeHalal: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#0D9488',
  },
  badgeHalalText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  badgePureVeg: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#22C55E',
  },
  badgePureVegText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  badgeCashbackPurple: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
  },
  badgeCashbackPurpleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Price for two
  restaurantPriceForTwo: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  // Rewards row
  restaurantRewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  reviewBonusText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  // Visit progress row
  visitProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  visitProgressText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  unlockRewardText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  bookTableBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bookTableGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  bookTableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  bookTableSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  bookTableBonus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookTableBonusText: {
    fontSize: 14,
    color: COLORS.primaryGold,
    fontWeight: '500',
  },
  experienceBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  experienceGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  experienceSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  comingSoon: {
    padding: 24,
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  valueProp: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.white,
  },
  valuePropTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  valuePropGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  valuePropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    gap: 8,
  },
  valuePropIcon: {
    fontSize: 18,
  },
  valuePropText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  savingsSummary: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savingsContent: {
    flex: 1,
  },
  savingsLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  savingsAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  savingsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  savingsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
