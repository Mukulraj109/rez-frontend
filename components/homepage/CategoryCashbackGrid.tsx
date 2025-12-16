/**
 * CategoryCashbackGrid Component
 * 2-column grid of category cards showing cashback percentages
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
    <View style={styles.grid}>
      {Array.from({ length: 10 }).map((_, index) => (
        <Animated.View key={index} style={[styles.card, styles.skeletonCard, { opacity }]}>
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonName} />
          <View style={styles.skeletonCashback} />
        </Animated.View>
      ))}
    </View>
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
          <Text style={styles.headerIcon}>🎉</Text>
          <Text style={styles.headerTitle}>Earn rewards in every category</Text>
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
        <Text style={styles.headerIcon}>🎉</Text>
        <Text style={styles.headerTitle}>Earn rewards in every category</Text>
      </View>
      <Text style={styles.headerSubtitle}>Shop smarter across all your needs</Text>

      {/* Grid */}
      <View style={styles.grid}>
        {CATEGORIES.map((category) => (
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
            <View style={styles.textContainer}>
              <Text style={styles.categoryName}>{category.label}</Text>
              <Text style={styles.cashbackText}>
                Earn up to {getCashbackRate(category.id)}% Cashback
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

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

const CARD_WIDTH = (SCREEN_WIDTH - 56) / 2; // narrower cards with more gap

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerIcon: {
    fontSize: 16,
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
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'stretch',
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
    width: 60,
    height: 60,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryIcon: {
    width: 42,
    height: 42,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
  },
  cashbackText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
    lineHeight: 15,
  },
  // Promo Card styles
  promoCard: {
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 18,
    paddingVertical: 24,
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
    marginBottom: 14,
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
    marginTop: 14,
    paddingTop: 12,
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
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    marginBottom: 10,
  },
  skeletonName: {
    width: 60,
    height: 15,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginBottom: 6,
  },
  skeletonCashback: {
    width: 90,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
});

export default CategoryCashbackGrid;
