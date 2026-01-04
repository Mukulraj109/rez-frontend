/**
 * Shop by Category Section - Connected to /api/categories
 * Icon card grid with Electronics, Fashion, Food & Dining
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { categoriesApi, Category } from '@/services/categoriesApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray300: '#D1D5DB',
  gray600: '#6B7280',
  green500: '#22C55E',
  emerald500: '#10B981',
};

// Category style configurations
const CATEGORY_STYLES: Record<string, {
  gradientColors: string[];
  icon: string;
  cashback: string;
  badge?: string;
  badgeType?: 'trending' | 'popular';
}> = {
  electronics: {
    gradientColors: ['#3B82F6', '#06B6D4', '#2563EB'],
    icon: '📱',
    cashback: '10-15%',
  },
  fashion: {
    gradientColors: ['#EC4899', '#9333EA'],
    icon: '👗',
    cashback: '15-25%',
    badge: 'Trending',
    badgeType: 'trending',
  },
  'food-dining': {
    gradientColors: ['#F97316', '#DC2626'],
    icon: '🍽️',
    cashback: '10-20%',
    badge: 'Popular',
    badgeType: 'popular',
  },
  food: {
    gradientColors: ['#F97316', '#DC2626'],
    icon: '🍽️',
    cashback: '10-20%',
    badge: 'Popular',
    badgeType: 'popular',
  },
  grocery: {
    gradientColors: ['#22C55E', '#16A34A'],
    icon: '🥬',
    cashback: '5-10%',
  },
  beauty: {
    gradientColors: ['#F472B6', '#DB2777'],
    icon: '💄',
    cashback: '15-20%',
    badge: 'Trending',
    badgeType: 'trending',
  },
  health: {
    gradientColors: ['#06B6D4', '#0891B2'],
    icon: '💊',
    cashback: '10-15%',
  },
};

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  icon: string;
  subtitle: string;
  cashback: string;
  gradientColors: string[];
  badge?: string;
  badgeType?: 'trending' | 'popular';
}

// Fallback categories
const FALLBACK_CATEGORIES: CategoryData[] = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    icon: '📱',
    subtitle: 'Phones, laptops, gadgets',
    cashback: '10-15%',
    gradientColors: ['#3B82F6', '#06B6D4', '#2563EB'],
  },
  {
    id: '2',
    name: 'Fashion',
    slug: 'fashion',
    icon: '👗',
    subtitle: 'Clothing & accessories',
    cashback: '15-25%',
    gradientColors: ['#EC4899', '#9333EA'],
    badge: 'Trending',
    badgeType: 'trending',
  },
  {
    id: '3',
    name: 'Food & Dining',
    slug: 'food-dining',
    icon: '🍽️',
    subtitle: 'Restaurants & cafes',
    cashback: '10-20%',
    gradientColors: ['#F97316', '#DC2626'],
    badge: 'Popular',
    badgeType: 'popular',
  },
];

const ShopByCategorySection: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryData[]>(FALLBACK_CATEGORIES);
  const [totalCategories, setTotalCategories] = useState(15);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await categoriesApi.getFeaturedCategories(undefined, 5);

        if (response.success && response.data && response.data.length > 0) {
          const transformed = response.data.slice(0, 3).map((cat: Category) => {
            const style = CATEGORY_STYLES[cat.slug] || CATEGORY_STYLES.electronics;
            return {
              id: cat._id,
              name: cat.name,
              slug: cat.slug,
              icon: cat.icon || style.icon,
              subtitle: cat.description || `${cat.name} & more`,
              cashback: cat.maxCashback ? `Up to ${cat.maxCashback}%` : style.cashback,
              gradientColors: style.gradientColors,
              badge: style.badge,
              badgeType: style.badgeType,
            };
          });
          setCategories(transformed);

          // Get total count
          const allResponse = await categoriesApi.getCategories({ isActive: true });
          if (allResponse.success && allResponse.data) {
            setTotalCategories(allResponse.data.length);
          }
        }
      } catch (error) {
        console.error('❌ [ShopByCategorySection] Error fetching categories:', error);
        // Keep using fallback data
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handlePress = (slug: string) => {
    router.push(`/categories/${slug}` as any);
  };

  const handleViewAll = () => {
    router.push('/categories' as any);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.green500} />
      </View>
    );
  }

  const featuredCategory = categories[0];
  const otherCategories = categories.slice(1, 3);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🛍️ Shop by Category</Text>
          <Text style={styles.headerSubtitle}>Cashback on every purchase</Text>
        </View>
      </View>

      {/* Cards Grid */}
      <View style={styles.grid}>
        {/* Featured Large Card */}
        {featuredCategory && (
          <TouchableOpacity
            style={styles.electronicsCard}
            onPress={() => handlePress(featuredCategory.slug)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={featuredCategory.gradientColors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.electronicsGradient}
            >
              <View style={styles.electronicsIconBox}>
                <Text style={styles.electronicsIcon}>{featuredCategory.icon}</Text>
              </View>
              <View style={styles.electronicsContent}>
                <Text style={styles.electronicsTitle}>{featuredCategory.name}</Text>
                <Text style={styles.electronicsSubtitle}>{featuredCategory.subtitle}</Text>
                <View style={styles.electronicsBadges}>
                  <View style={styles.cashbackBadge}>
                    <Text style={styles.cashbackText}>{featuredCategory.cashback} cashback</Text>
                  </View>
                  <Text style={styles.coinsText}>+ 2x coins</Text>
                </View>
              </View>
              <Text style={styles.electronicsArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Other Categories Row */}
        <View style={styles.row}>
          {otherCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handlePress(category.slug)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={category.gradientColors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.categoryGradient}
              >
                <View style={styles.categoryIconBox}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                </View>
                <Text style={styles.categoryTitle}>{category.name}</Text>
                <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
                <View style={styles.categoryFooter}>
                  <Text style={styles.categoryPercent}>{category.cashback}</Text>
                  {category.badge && (
                    <View style={category.badgeType === 'trending' ? styles.trendingBadge : styles.popularBadge}>
                      <Text style={category.badgeType === 'trending' ? styles.trendingText : styles.popularText}>
                        {category.badge}
                      </Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* View All Categories */}
      <TouchableOpacity
        style={styles.viewAllButton}
        onPress={handleViewAll}
        activeOpacity={0.8}
      >
        <Text style={styles.viewAllButtonText}>View All {totalCategories}+ Categories</Text>
        <Text style={styles.viewAllArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 2,
  },
  grid: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },

  // Electronics Card
  electronicsCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  electronicsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  electronicsIconBox: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  electronicsIcon: {
    fontSize: 36,
  },
  electronicsContent: {
    flex: 1,
  },
  electronicsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  electronicsSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  electronicsBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cashbackBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  coinsText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  electronicsArrow: {
    fontSize: 24,
    color: COLORS.white,
  },

  // Row
  row: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },

  // Category Cards (Fashion, Food)
  categoryCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryGradient: {
    padding: 16,
  },
  categoryIconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 26,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  categoryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  trendingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  trendingText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  popularBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  popularText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },

  // View All Button
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.gray300,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  viewAllArrow: {
    fontSize: 16,
    color: COLORS.gray600,
  },
});

export default ShopByCategorySection;
