/**
 * MainCategoryPage Router
 * Routes to category-specific page components for better performance
 * Each category has its own optimized component
 */

import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Category-specific page components (lazy loaded for better performance)
import FoodDiningCategoryPage from '@/components/category-pages/FoodDiningCategoryPage';
import FashionCategoryPage from '@/components/category-pages/FashionCategoryPage';
import BeautyCategoryPage from '@/components/category-pages/BeautyCategoryPage';
import GroceryCategoryPage from '@/components/category-pages/GroceryCategoryPage';
import HealthcareCategoryPage from '@/components/category-pages/HealthcareCategoryPage';
import FitnessCategoryPage from '@/components/category-pages/FitnessCategoryPage';
import EducationCategoryPage from '@/components/category-pages/EducationCategoryPage';
import HomeServicesCategoryPage from '@/components/category-pages/HomeServicesCategoryPage';
import TravelCategoryPage from '@/components/category-pages/TravelCategoryPage';
import EntertainmentCategoryPage from '@/components/category-pages/EntertainmentCategoryPage';
import FinancialCategoryPage from '@/components/category-pages/FinancialCategoryPage';

// Category slug to component mapping
const CATEGORY_COMPONENTS: Record<string, React.ComponentType> = {
  'food-dining': FoodDiningCategoryPage,
  'fashion': FashionCategoryPage,
  'beauty-wellness': BeautyCategoryPage,
  'grocery-essentials': GroceryCategoryPage,
  'healthcare': HealthcareCategoryPage,
  'fitness-sports': FitnessCategoryPage,
  'education-learning': EducationCategoryPage,
  'home-services': HomeServicesCategoryPage,
  'travel-experiences': TravelCategoryPage,
  'entertainment': EntertainmentCategoryPage,
  'financial-lifestyle': FinancialCategoryPage,
};

export default function MainCategoryPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  // Get the appropriate component for this category
  const CategoryComponent = slug ? CATEGORY_COMPONENTS[slug] : null;

  // If category component exists, render it
  if (CategoryComponent) {
    return <CategoryComponent />;
  }

  // If category not found, show error page
  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorContent}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Category Not Found</Text>
        <Text style={styles.errorText}>
          The category "{slug}" does not exist or is not available.
        </Text>
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C06A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#00C06A',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
