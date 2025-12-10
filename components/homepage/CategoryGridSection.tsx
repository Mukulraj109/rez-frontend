import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';

// Category icon images
const CATEGORY_ICONS = {
  'food-dining': require('../../assets/category-icons/FOOD-DINING/Cafes.png'),
  'grocery-essentials': require('../../assets/category-icons/GROCERY-ESSENTIALS/Supermarkets.png'),
  'beauty-wellness': require('../../assets/category-icons/BEAUTY-WELLNESS/Beauty-services.png'),
  'healthcare': require('../../assets/category-icons/HEALTHCARE/Clinics.png'),
  'fashion': require('../../assets/category-icons/Shopping/Fashion.png'),
  'fitness-sports': require('../../assets/category-icons/FITNESS-SPORTS/Gyms.png'),
  'education-learning': require('../../assets/category-icons/EDUCATION-LEARNING/Coaching-center.png'),
  'home-services': require('../../assets/category-icons/HOME-SERVICES/Cleaning.png'),
  'travel-experiences': require('../../assets/category-icons/TRAVEL-EXPERIENCES/Tours.png'),
  'entertainment': require('../../assets/category-icons/ENTERTAINMENT/Live-events.png'),
  'financial-lifestyle': require('../../assets/category-icons/FINANCIAL-LIFESTYLE/Bill-payments.png'),
};

// Our 11 main categories with icons and cashback info
const MAIN_CATEGORIES = [
  { slug: 'food-dining', name: 'Food & Dining', cashback: 18 },
  { slug: 'grocery-essentials', name: 'Grocery & Essentials', cashback: 5 },
  { slug: 'beauty-wellness', name: 'Beauty & Wellness', cashback: 12 },
  { slug: 'healthcare', name: 'Healthcare', cashback: 18 },
  { slug: 'fashion', name: 'Fashion', cashback: 10 },
  { slug: 'fitness-sports', name: 'Fitness & Sports', cashback: 5 },
  { slug: 'education-learning', name: 'Education & Learning', cashback: 15 },
  { slug: 'home-services', name: 'Home Services', cashback: 8 },
  { slug: 'travel-experiences', name: 'Travel & Experiences', cashback: 10 },
  { slug: 'entertainment', name: 'Entertainment', cashback: 5 },
  { slug: 'financial-lifestyle', name: 'Financial & Lifestyle', cashback: 8 },
];

interface CategoryGridSectionProps {
  title?: string;
  maxCategories?: number;
}

const CategoryGridSection: React.FC<CategoryGridSectionProps> = ({
  title = 'Categories',
  maxCategories = 11, // Show all 11 main categories by default
}) => {
  const router = useRouter();

  // Use static main categories - no API fetch needed
  const categories = MAIN_CATEGORIES.slice(0, maxCategories);

  const handleCategoryPress = (category: typeof MAIN_CATEGORIES[0]) => {
    // Navigate to MainCategory page with the category slug
    router.push(`/MainCategory/${category.slug}` as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category.slug}
            style={styles.card}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Image
                source={CATEGORY_ICONS[category.slug as keyof typeof CATEGORY_ICONS]}
                style={styles.categoryIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.categoryName} numberOfLines={2}>
              {category.name}
            </Text>
            <Text style={styles.cashbackText}>
              Up to {category.cashback}% cash back
            </Text>
          </TouchableOpacity>
        ))}
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  categoryIcon: {
    width: 56,
    height: 56,
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
