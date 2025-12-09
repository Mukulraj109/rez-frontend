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

// Our 11 main categories with icons and cashback info
const MAIN_CATEGORIES = [
  { slug: 'food-dining', name: 'Food & Dining', icon: 'restaurant-outline' as const, cashback: 18 },
  { slug: 'grocery-essentials', name: 'Grocery & Essentials', icon: 'cart-outline' as const, cashback: 5 },
  { slug: 'beauty-wellness', name: 'Beauty & Wellness', icon: 'sparkles-outline' as const, cashback: 12 },
  { slug: 'healthcare', name: 'Healthcare', icon: 'heart-outline' as const, cashback: 18 },
  { slug: 'fashion', name: 'Fashion', icon: 'shirt-outline' as const, cashback: 10 },
  { slug: 'fitness-sports', name: 'Fitness & Sports', icon: 'fitness-outline' as const, cashback: 5 },
  { slug: 'education-learning', name: 'Education & Learning', icon: 'school-outline' as const, cashback: 15 },
  { slug: 'home-services', name: 'Home Services', icon: 'home-outline' as const, cashback: 8 },
  { slug: 'travel-experiences', name: 'Travel & Experiences', icon: 'airplane-outline' as const, cashback: 10 },
  { slug: 'entertainment', name: 'Entertainment', icon: 'game-controller-outline' as const, cashback: 5 },
  { slug: 'financial-lifestyle', name: 'Financial & Lifestyle', icon: 'wallet-outline' as const, cashback: 8 },
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
              <Ionicons
                name={category.icon}
                size={28}
                color="#00C06A"
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
