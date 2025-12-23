/**
 * CategoryCashbackGrid Component
 * 2-column grid of category cards showing cashback percentages
 * Static grid layout - no slider
 */

import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import cashbackService, { CashbackCampaign } from '@/services/cashbackApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Category images - reused from CategoryTabBar
const CATEGORY_IMAGES = {
  dining: require('../../assets/category-icons/FOOD-DINING/Family-restaurants.png'),
  events: require('../../assets/category-icons/ENTERTAINMENT/Live-events.png'),
  stores: require('../../assets/images/stores/shopping-bags.png'),
  grocery: require('../../assets/category-icons/GROCERY-ESSENTIALS/Supermarkets.png'),
  beauty: require('../../assets/category-icons/BEAUTY-WELLNESS/Beauty-services.png'),
  health: require('../../assets/category-icons/HEALTHCARE/Pharmacy.png'),
  fashion: require('../../assets/category-icons/Shopping/Fashion.png'),
  fitness: require('../../assets/category-icons/FITNESS-SPORTS/Gyms.png'),
  education: require('../../assets/category-icons/EDUCATION-LEARNING/Coaching-center.png'),
  travel: require('../../assets/category-icons/TRAVEL-EXPERIENCES/Hotels.png'),
};

// Category configuration with routes and default cashback rates
const CATEGORIES = [
  { id: 'dining', label: 'Dining', image: CATEGORY_IMAGES.dining, route: '/MainCategory/food-dining', defaultCashback: 20, iconBg: '#FFF5F5' },
  { id: 'grocery', label: 'Grocery', image: CATEGORY_IMAGES.grocery, route: '/MainCategory/grocery-essentials', defaultCashback: 20, iconBg: '#F0FDF4' },
  { id: 'fashion', label: 'Fashion', image: CATEGORY_IMAGES.fashion, route: '/MainCategory/fashion', defaultCashback: 20, iconBg: '#FDF2F8' },
  { id: 'beauty', label: 'Beauty', image: CATEGORY_IMAGES.beauty, route: '/MainCategory/beauty-wellness', defaultCashback: 20, iconBg: '#FFF7ED' },
  { id: 'health', label: 'Health', image: CATEGORY_IMAGES.health, route: '/MainCategory/healthcare', defaultCashback: 20, iconBg: '#EFF6FF' },
  { id: 'fitness', label: 'Fitness', image: CATEGORY_IMAGES.fitness, route: '/MainCategory/fitness-sports', defaultCashback: 20, iconBg: '#ECFDF5' },
  { id: 'events', label: 'Events', image: CATEGORY_IMAGES.events, route: '/EventsListPage', defaultCashback: 20, iconBg: '#FEF3C7' },
  { id: 'stores', label: 'Stores', image: CATEGORY_IMAGES.stores, route: '/StoreListPage', defaultCashback: 20, iconBg: '#F3E8FF' },
  { id: 'education', label: 'Education', image: CATEGORY_IMAGES.education, route: '/MainCategory/education-learning', defaultCashback: 20, iconBg: '#E0F2FE' },
  { id: 'travel', label: 'Travel', image: CATEGORY_IMAGES.travel, route: '/MainCategory/travel-experiences', defaultCashback: 20, iconBg: '#F0FDFA' },
] as const;

// Category ID to campaign category name mappings for API matching
const CATEGORY_MAPPINGS: Record<string, string[]> = {
  dining: ['dining', 'food', 'restaurant', 'food-dining', 'food & dining', 'restaurants'],
  events: ['events', 'entertainment', 'live events', 'shows'],
  stores: ['stores', 'shopping', 'retail', 'shop'],
  grocery: ['grocery', 'essentials', 'grocery-essentials', 'supermarket', 'groceries'],
  beauty: ['beauty', 'wellness', 'beauty-wellness', 'spa', 'salon'],
  health: ['health', 'healthcare', 'medical', 'pharmacy', 'medicine'],
  fashion: ['fashion', 'clothing', 'apparel', 'clothes'],
  fitness: ['fitness', 'sports', 'fitness-sports', 'gym', 'workout'],
  education: ['education', 'learning', 'education-learning', 'courses', 'training'],
  travel: ['travel', 'experiences', 'travel-experiences', 'hotels', 'tourism'],
};

interface CategoryCashbackGridProps {
  onCategoryPress?: (categoryId: string) => void;
  style?: any;
}

// Skeleton loading component
const CategoryCashbackGridSkeleton: React.FC = memo(() => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      style={styles.scrollView}
    >
      {Array.from({ length: 10 }).map((_, index) => (
        <Animated.View key={index} style={[styles.card, styles.skeletonCard, { opacity }]}>
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonName} />
          <View style={styles.skeletonCashback} />
        </Animated.View>
      ))}
    </ScrollView>
  );
});

CategoryCashbackGridSkeleton.displayName = 'CategoryCashbackGridSkeleton';

const CategoryCashbackGrid: React.FC<CategoryCashbackGridProps> = memo(({ onCategoryPress, style }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cashbackRates, setCashbackRates] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCashbackRates();
  }, []);

  const fetchCashbackRates = async () => {
    setLoading(true);
    try {
      const response = await cashbackService.getActiveCampaigns();
      if (response.success && response.data?.campaigns) {
        const rates = mapCampaignsToCategories(response.data.campaigns);
        setCashbackRates(rates);
      }
    } catch (err) {
      console.error('Failed to fetch cashback rates:', err);
      // Silently fail - will use default rates
    } finally {
      setLoading(false);
    }
  };

  // Map campaigns to category cashback rates (get max rate per category)
  const mapCampaignsToCategories = (campaigns: CashbackCampaign[]): Record<string, number> => {
    const rates: Record<string, number> = {};

    campaigns.forEach(campaign => {
      if (!campaign.isActive) return;

      campaign.categories.forEach(campaignCategory => {
        const normalizedCampaignCat = campaignCategory.toLowerCase().trim();

        // Find matching category ID
        for (const [categoryId, aliases] of Object.entries(CATEGORY_MAPPINGS)) {
          if (aliases.some(alias =>
            normalizedCampaignCat.includes(alias) || alias.includes(normalizedCampaignCat)
          )) {
            rates[categoryId] = Math.max(rates[categoryId] || 0, campaign.cashbackRate);
          }
        }
      });
    });

    return rates;
  };

  // Get cashback rate for a category (API rate or default)
  const getCashbackRate = useCallback((categoryId: string): number => {
    if (cashbackRates[categoryId]) {
      return cashbackRates[categoryId];
    }
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category?.defaultCashback || 10;
  }, [cashbackRates]);

  const handleCategoryPress = useCallback((category: typeof CATEGORIES[number]) => {
    if (onCategoryPress) {
      onCategoryPress(category.id);
    }
    if (category.route) {
      router.push(category.route as any);
    }
  }, [router, onCategoryPress]);

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="gift" size={18} color="#059669" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Earn rewards in every category</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Shop smarter across all your needs</Text>
        <CategoryCashbackGridSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="gift" size={18} color="#059669" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Earn rewards in every category</Text>
        </View>
      </View>
      <Text style={styles.headerSubtitle}>Shop smarter across all your needs</Text>

      {/* Horizontal Scrollable Grid - 2 rows */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
        nestedScrollEnabled
      >
        <View>
          {/* First Row */}
          <View style={styles.gridRow}>
            {CATEGORIES.slice(0, Math.ceil(CATEGORIES.length / 2)).map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.card}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${category.label} category with ${getCashbackRate(category.id)}% cashback`}
              >
                <View style={[styles.iconContainer, { backgroundColor: category.iconBg }]}>
                  <Image
                    source={category.image}
                    style={styles.categoryIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.categoryName}>{category.label}</Text>
                <View style={styles.cashbackContainer}>
                  <Ionicons name="logo-bitcoin" size={10} color="#F59E0B" />
                  <Text style={styles.cashbackText}>
                    Up to {getCashbackRate(category.id)}%
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {/* Second Row */}
          <View style={styles.gridRow}>
            {CATEGORIES.slice(Math.ceil(CATEGORIES.length / 2)).map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.card}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${category.label} category with ${getCashbackRate(category.id)}% cashback`}
              >
                <View style={[styles.iconContainer, { backgroundColor: category.iconBg }]}>
                  <Image
                    source={category.image}
                    style={styles.categoryIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.categoryName}>{category.label}</Text>
                <View style={styles.cashbackContainer}>
                  <Ionicons name="logo-bitcoin" size={10} color="#F59E0B" />
                  <Text style={styles.cashbackText}>
                    Up to {getCashbackRate(category.id)}%
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Pay in Store Promo Card */}
      <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/pay-in-store' as any)}>
        <LinearGradient
          colors={['#059669', '#10B981', '#34D399']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.promoCard}
        >
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Pay in Store</Text>
            <Text style={styles.promoSubtitle}>
              Scan & pay at nearby stores.{'\n'}Earn cashback instantly.
            </Text>

            <View style={styles.promoButton}>
              <Ionicons name="qr-code-outline" size={20} color="#059669" />
              <Text style={styles.promoButtonText}>Scan QR & Pay</Text>
            </View>
          </View>

          <View style={styles.promoFooter}>
            <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.promoFooterText}>Works just like UPI — but rewards you</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
});

CategoryCashbackGrid.displayName = 'CategoryCashbackGrid';

const CARD_WIDTH = 100; // Fixed width for horizontal scroll
const CARD_HEIGHT = 120; // Height for 2-row layout

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 2,
    backgroundColor: '#E6F9F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B2240',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  scrollView: {
    marginHorizontal: -16, // Offset container padding for full-width scroll
  },
  scrollContainer: {
    paddingHorizontal: 16, // Restore padding inside scroll
    paddingBottom: 4,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B2240',
    textAlign: 'center',
    marginTop: 2,
  },
  cashbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cashbackText: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '600',
  },
  // Promo Card styles
  promoCard: {
    marginTop: 6,
    marginBottom: 4,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 6px 16px rgba(5, 150, 105, 0.25)',
      },
    }),
  },
  promoContent: {
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  promoSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    minWidth: 200,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  promoButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
  },
  promoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    gap: 6,
  },
  promoFooterText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  // Skeleton styles
  skeletonCard: {
    backgroundColor: '#F3F4F6',
  },
  skeletonIcon: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    marginBottom: 10,
    alignSelf: 'center',
  },
  skeletonName: {
    width: 80,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginBottom: 6,
    alignSelf: 'center',
  },
  skeletonCashback: {
    width: 120,
    height: 11,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
  },
});

export default CategoryCashbackGrid;
