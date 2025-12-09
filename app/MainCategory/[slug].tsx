/**
 * MainCategoryPage - Dynamic Category Page
 * Replaces hardcoded FashionPage with a dynamic page that supports all categories
 * Route: /MainCategory/[slug] (e.g., /MainCategory/fashion, /MainCategory/food-dining)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Components
import CategoryHeader from '@/components/CategoryHeader';
import useCategoryData, { CategoryProduct } from '@/hooks/useCategoryData';
import { getCategoryConfig } from '@/config/categoryConfig';
import productsApi from '@/services/productsApi';
import storesApi from '@/services/storesApi';

// Production-ready components (reused from FashionPage)
import ProductionStoreList from '@/src/components/ProductionStoreList';
import ProductionBrandList from '@/src/components/ProductionBrandList';
import ProductionCategorySlider from '@/src/components/ProductionCategorySlider';
import ProductionProductCarousel from '@/src/components/ProductionProductCarousel';
import ProductionQuickButtons from '@/src/components/ProductionQuickButtons';
import StepsCard from '@/src/components/StepsCard';
import { FashionCategory } from '@/hooks/useFashionData';

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

  // State for selected subcategory and filtered products/stores
  const [selectedSubcategory, setSelectedSubcategory] = useState<FashionCategory | null>(null);
  const [subcategoryProducts, setSubcategoryProducts] = useState<CategoryProduct[]>([]);
  const [subcategoryStores, setSubcategoryStores] = useState<any[]>([]);
  const [isLoadingSubcategoryProducts, setIsLoadingSubcategoryProducts] = useState(false);
  const [isLoadingSubcategoryStores, setIsLoadingSubcategoryStores] = useState(false);

  // Handle subcategory selection from the slider
  const handleSubcategorySelect = useCallback((category: FashionCategory) => {
    setSelectedSubcategory(category);
  }, []);

  // Fetch products when selected subcategory changes
  useEffect(() => {
    const fetchSubcategoryProducts = async () => {
      if (!selectedSubcategory?.slug) {
        // If no subcategory selected, use featured products
        setSubcategoryProducts(featuredProducts);
        return;
      }

      setIsLoadingSubcategoryProducts(true);
      try {
        console.log(`[MainCategory] Fetching products for subcategory: ${selectedSubcategory.slug}`);
        const response = await productsApi.getProductsBySubcategory(selectedSubcategory.slug, 10);

        if (response.success && response.data) {
          console.log(`[MainCategory] Got ${response.data.length} products for ${selectedSubcategory.slug}`);
          setSubcategoryProducts(response.data as CategoryProduct[]);
        } else {
          // Fallback to featured products if API fails
          console.log(`[MainCategory] No products found for ${selectedSubcategory.slug}, using featured`);
          setSubcategoryProducts(featuredProducts);
        }
      } catch (error) {
        console.error('[MainCategory] Error fetching subcategory products:', error);
        setSubcategoryProducts(featuredProducts);
      } finally {
        setIsLoadingSubcategoryProducts(false);
      }
    };

    fetchSubcategoryProducts();
  }, [selectedSubcategory?.slug, featuredProducts]);

  // Fetch stores when selected subcategory changes
  useEffect(() => {
    const fetchSubcategoryStores = async () => {
      if (!selectedSubcategory?.slug) {
        // If no subcategory selected, use featured stores
        setSubcategoryStores(featuredStores);
        return;
      }

      setIsLoadingSubcategoryStores(true);
      try {
        console.log(`[MainCategory] Fetching stores for subcategory: ${selectedSubcategory.slug}`);
        const response = await storesApi.getStoresBySubcategorySlug(selectedSubcategory.slug, 10);

        if (response.success && response.data && response.data.length > 0) {
          console.log(`[MainCategory] Got ${response.data.length} stores for ${selectedSubcategory.slug}`);
          setSubcategoryStores(response.data);
        } else {
          // Fallback to featured stores if no stores found
          console.log(`[MainCategory] No stores found for ${selectedSubcategory.slug}, using featured`);
          setSubcategoryStores(featuredStores);
        }
      } catch (error) {
        console.error('[MainCategory] Error fetching subcategory stores:', error);
        setSubcategoryStores(featuredStores);
      } finally {
        setIsLoadingSubcategoryStores(false);
      }
    };

    fetchSubcategoryStores();
  }, [selectedSubcategory?.slug, featuredStores]);

  // Prepare subcategories for the slider (use config subcategories with colors)
  const sliderCategories = categoryConfig?.subcategories.map((sub, index) => {
    const colors = [
      '#8B5CF6', '#F59E0B', '#3B82F6', '#EC4899',
      '#10B981', '#EF4444', '#6366F1', '#14B8A6',
    ];
    return {
      _id: sub.slug,
      name: sub.name,
      slug: sub.slug,
      icon: sub.icon,
      metadata: { color: colors[index % colors.length] },
    };
  }) || [];

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

      {/* Category Slider - Subcategories with selection callback */}
      <ProductionCategorySlider
        categories={sliderCategories}
        isLoading={false}
        selectedSlug={selectedSubcategory?.slug}
        onSelect={handleSubcategorySelect}
      />

      {/* Product Carousel - Shows products filtered by selected subcategory */}
      <ProductionProductCarousel
        products={subcategoryProducts.length > 0 ? subcategoryProducts : featuredProducts}
        isLoading={isLoadingProducts || isLoadingSubcategoryProducts}
        error={productsError}
      />

      {/* Quick Buttons */}
      <ProductionQuickButtons />

      {/* Steps Card - How to use vouchers */}
      <StepsCard />

      {/* Store List - Stores filtered by selected subcategory */}
      <ProductionStoreList
        stores={subcategoryStores.length > 0 ? subcategoryStores : featuredStores}
        isLoading={isLoadingStores || isLoadingSubcategoryStores}
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
