import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import categoriesApi from '@/services/categoriesApi';

// Icon mapping for different category names/slugs
const getCategoryIcon = (name: string, slug: string): keyof typeof Ionicons.glyphMap => {
  const lowerName = name.toLowerCase();
  const lowerSlug = slug?.toLowerCase() || '';

  // Fashion & Clothing
  if (lowerName.includes('fashion') || lowerName.includes('cloth') || lowerName.includes('apparel')) return 'shirt-outline';
  if (lowerName.includes('men') && (lowerName.includes('fashion') || lowerName.includes('cloth'))) return 'man-outline';
  if (lowerName.includes('women') && (lowerName.includes('fashion') || lowerName.includes('cloth'))) return 'woman-outline';
  if (lowerName.includes('kid') || lowerName.includes('child')) return 'happy-outline';
  if (lowerName.includes('footwear') || lowerName.includes('shoe')) return 'footsteps-outline';
  if (lowerName.includes('accessor')) return 'watch-outline';

  // Food & Dining
  if (lowerName.includes('food') || lowerName.includes('dining') || lowerName.includes('restaurant')) return 'restaurant-outline';
  if (lowerName.includes('grocery') || lowerName.includes('essentials')) return 'cart-outline';
  if (lowerName.includes('fruit') || lowerName.includes('vegetable') || lowerName.includes('fresh') || lowerName.includes('produce')) return 'nutrition-outline';
  if (lowerName.includes('meat') || lowerName.includes('fish') || lowerName.includes('seafood')) return 'fish-outline';
  if (lowerName.includes('bakery') || lowerName.includes('bread')) return 'cafe-outline';
  if (lowerName.includes('beverage') || lowerName.includes('drink')) return 'wine-outline';
  if (lowerName.includes('organic')) return 'leaf-outline';

  // Electronics
  if (lowerName.includes('electronic') || lowerName.includes('gadget')) return 'phone-portrait-outline';
  if (lowerName.includes('mobile') || lowerName.includes('phone')) return 'call-outline';
  if (lowerName.includes('laptop') || lowerName.includes('computer')) return 'laptop-outline';
  if (lowerName.includes('appliance')) return 'tv-outline';

  // Home & Living
  if (lowerName.includes('home') || lowerName.includes('living') || lowerName.includes('furniture')) return 'home-outline';
  if (lowerName.includes('garden') || lowerName.includes('outdoor')) return 'flower-outline';
  if (lowerName.includes('kitchen')) return 'restaurant-outline';
  if (lowerName.includes('decor')) return 'color-palette-outline';

  // Health & Beauty
  if (lowerName.includes('beauty') || lowerName.includes('cosmetic') || lowerName.includes('makeup')) return 'sparkles-outline';
  if (lowerName.includes('health') || lowerName.includes('wellness')) return 'heart-outline';
  if (lowerName.includes('medicine') || lowerName.includes('pharmacy')) return 'medkit-outline';
  if (lowerName.includes('perfume') || lowerName.includes('fragrance')) return 'rose-outline';
  if (lowerName.includes('clinic') || lowerName.includes('hospital')) return 'medical-outline';

  // Services
  if (lowerName.includes('repair') || lowerName.includes('service')) return 'construct-outline';
  if (lowerName.includes('cleaning')) return 'sparkles-outline';
  if (lowerName.includes('salon') || lowerName.includes('spa')) return 'cut-outline';
  if (lowerName.includes('laundry')) return 'water-outline';

  // Entertainment & Sports
  if (lowerName.includes('entertainment') || lowerName.includes('movie') || lowerName.includes('gaming')) return 'game-controller-outline';
  if (lowerName.includes('sport') || lowerName.includes('fitness') || lowerName.includes('gym')) return 'fitness-outline';
  if (lowerName.includes('book') || lowerName.includes('stationery') || lowerName.includes('media')) return 'book-outline';
  if (lowerName.includes('toy') || lowerName.includes('game')) return 'extension-puzzle-outline';

  // Others
  if (lowerName.includes('pet') || lowerName.includes('animal')) return 'paw-outline';
  if (lowerName.includes('auto') || lowerName.includes('car') || lowerName.includes('vehicle')) return 'car-outline';
  if (lowerName.includes('jewel') || lowerName.includes('jewelry')) return 'diamond-outline';
  if (lowerName.includes('gift')) return 'gift-outline';
  if (lowerName.includes('travel') || lowerName.includes('hotel')) return 'airplane-outline';
  if (lowerName.includes('lifestyle')) return 'sunny-outline';
  if (lowerName.includes('fleet') || lowerName.includes('market')) return 'storefront-outline';

  // Default
  return 'grid-outline';
};

// Generate random cashback percentage
const getRandomCashback = (): number => {
  const cashbacks = [5, 8, 10, 12, 15, 18, 20];
  return cashbacks[Math.floor(Math.random() * cashbacks.length)];
};

interface CategoryGridSectionProps {
  title?: string;
  maxCategories?: number;
}

const CategoryGridSection: React.FC<CategoryGridSectionProps> = ({
  title = 'Categories',
  maxCategories = 20,
}) => {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch and randomize parent categories
  React.useEffect(() => {
    let isMounted = true;

    const doFetch = async () => {
      try {
        // Note: Backend only allows parent, type, featured as query params (not isActive)
        const response = await categoriesApi.getCategories({ parent: 'null' });

        if (!isMounted) return;

        const allCategories = response?.data || response || [];

        if (allCategories.length > 0) {
          // Shuffle array using Fisher-Yates algorithm
          const shuffled = [...allCategories];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }

          const selected = shuffled.slice(0, maxCategories);
          const categoriesWithCashback = selected.map((cat: any) => ({
            ...cat,
            id: cat._id || cat.id,
            cashback: getRandomCashback(),
          }));

          setCategories(categoriesWithCashback);
        }
      } catch (error) {
        console.error('[CategoryGrid] Error fetching categories:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    doFetch();

    return () => {
      isMounted = false;
    };
  }, [maxCategories]);

  const handleCategoryPress = (category: any) => {
    // Navigate to category page which handles loading and redirects to StoreListPage
    // This ensures childCategories are properly populated for subcategory dropdown
    router.push(`/category/${category.slug}` as any);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00C06A" />
        </View>
      </View>
    );
  }

  if (categories.length === 0) {
    return null; // Don't show section if no categories
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>
        {categories.map((category, index) => {
          // Safely extract string values to prevent rendering objects
          const categoryName = typeof category.name === 'string' ? category.name : 'Category';
          const categorySlug = typeof category.slug === 'string' ? category.slug : '';
          const cashbackValue = typeof category.cashback === 'number' ? category.cashback : 0;

          return (
            <TouchableOpacity
              key={category.id || index}
              style={styles.card}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getCategoryIcon(categoryName, categorySlug)}
                  size={28}
                  color="#00C06A"
                />
              </View>
              <Text style={styles.categoryName} numberOfLines={2}>
                {categoryName}
              </Text>
              <Text style={styles.cashbackText}>
                Up to {cashbackValue}% cash back
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00796B',
    marginBottom: 16,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 192, 106, 0.05)',
    borderRadius: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(11, 34, 64, 0.04), 0 8px 24px rgba(11, 34, 64, 0.08)',
      },
    }),
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.15)',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B2240',
    textAlign: 'center',
    marginBottom: 4,
    minHeight: 32,
  },
  cashbackText: {
    fontSize: 11,
    color: '#00796B',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default CategoryGridSection;
