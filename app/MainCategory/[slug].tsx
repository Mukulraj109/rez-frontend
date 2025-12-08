/**
 * MainCategoryPage - Dynamic Category Page
 * Replaces hardcoded FashionPage with a dynamic page that supports all categories
 * Route: /MainCategory/[slug] (e.g., /MainCategory/fashion, /MainCategory/food-dining)
 */

import React from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Components
import CategoryHeader from '@/components/CategoryHeader';
import useCategoryData from '@/hooks/useCategoryData';
import { getCategoryConfig } from '@/config/categoryConfig';

// Production-ready components (reused from FashionPage)
import ProductionStoreList from '@/src/components/ProductionStoreList';
import ProductionBrandList from '@/src/components/ProductionBrandList';
import ProductionCategorySlider from '@/src/components/ProductionCategorySlider';
import ProductionProductCarousel from '@/src/components/ProductionProductCarousel';
import ProductionQuickButtons from '@/src/components/ProductionQuickButtons';
import StepsCard from '@/src/components/StepsCard';

export default function MainCategoryPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  // Get category configuration
  const categoryConfig = getCategoryConfig(slug || '');

  // Fetch category-specific data
  const {
    featuredStores,
    categoryStores,
    featuredProducts,
    subcategories,
    isLoading,
    isLoadingStores,
    isLoadingProducts,
    isLoadingCategories,
    storesError,
    productsError,
    refetchAll,
  } = useCategoryData(slug || '');

  // Handle invalid slug - show error page
  if (!categoryConfig) {
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetchAll}
          colors={[categoryConfig.primaryColor]}
          tintColor={categoryConfig.primaryColor}
        />
      }
    >
      {/* Dynamic Category Header */}
      <CategoryHeader
        categoryName={categoryConfig.name}
        primaryColor={categoryConfig.primaryColor}
        banner={categoryConfig.banner}
        gradientColors={categoryConfig.gradientColors}
      />

      {/* Category Slider - Hardcoded Subcategories from config */}
      <ProductionCategorySlider
        categories={categoryConfig.subcategories.map((sub, index) => {
          // Different colors for each subcategory to make it vibrant
          const colors = [
            '#8B5CF6', // Purple
            '#F59E0B', // Amber/Yellow
            '#3B82F6', // Blue
            '#EC4899', // Pink
            '#10B981', // Green
            '#EF4444', // Red
            '#6366F1', // Indigo
            '#14B8A6', // Teal
          ];
          return {
            _id: sub.slug,
            name: sub.name,
            slug: sub.slug,
            icon: sub.icon,
            metadata: { color: colors[index % colors.length] },
          };
        })}
        isLoading={false}
      />

      {/* Product Carousel - Featured products */}
      <ProductionProductCarousel
        products={featuredProducts}
        isLoading={isLoadingProducts}
        error={productsError}
      />

      {/* Quick Buttons */}
      <ProductionQuickButtons />

      {/* Steps Card - How to use vouchers */}
      <StepsCard />

      {/* Store List - Featured stores */}
      <ProductionStoreList
        stores={featuredStores}
        isLoading={isLoadingStores}
        error={storesError}
        onRefresh={refetchAll}
      />

      {/* Brand List - All category stores/brands */}
      <ProductionBrandList
        stores={categoryStores}
        isLoading={isLoadingStores}
        error={storesError}
        onRefresh={refetchAll}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 100, // Space for bottom tab navigation
  },
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
