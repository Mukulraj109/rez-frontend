/**
 * MainCategoryPage - Dynamic Category Page
 * Replaces hardcoded FashionPage with a dynamic page that supports all categories
 * Route: /MainCategory/[slug] (e.g., /MainCategory/fashion, /MainCategory/food-dining)
 *
 * Updated with enhanced sections from Rez_v-2-main reference design
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Core Components
import CategoryHeader from '@/components/CategoryHeader';
import useCategoryData, { CategoryProduct } from '@/hooks/useCategoryData';
import { getCategoryConfig } from '@/config/categoryConfig';
import productsApi from '@/services/productsApi';
import storesApi from '@/services/storesApi';

// Production-ready components
import ProductionCategorySlider from '@/src/components/ProductionCategorySlider';
import ProductionProductCarousel from '@/src/components/ProductionProductCarousel';
import StepsCard from '@/src/components/StepsCard';
import { FashionCategory } from '@/hooks/useFashionData';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useFavoriteStores } from '@/hooks/useFavoriteStores';

// New Enhanced Category Sections
import QuickActionBar from '@/components/category/QuickActionBar';
import SmartAIBanner from '@/components/category/SmartAIBanner';
import TrendingHashtags from '@/components/category/TrendingHashtags';
import CategoryGridSection from '@/components/category/CategoryGridSection';
import ShopByVibeSection from '@/components/category/ShopByVibeSection';
import ShopByOccasionSection from '@/components/category/ShopByOccasionSection';
import ExclusiveOffersSection from '@/components/category/ExclusiveOffersSection';
import TryAndBuyBanner from '@/components/category/TryAndBuyBanner';
import TopBrandsSection from '@/components/category/TopBrandsSection';
import TrendingProductsSection from '@/components/category/TrendingProductsSection';
import SmartCompareBanner from '@/components/category/SmartCompareBanner';
import FavoriteStoresSection from '@/components/category/FavoriteStoresSection';
import NearbyStoresSection from '@/components/category/NearbyStoresSection';
import BankOffersSection from '@/components/category/BankOffersSection';
import BestDealsSection from '@/components/category/BestDealsSection';
import WalletReminderBanner from '@/components/category/WalletReminderBanner';
import RecentlyViewedSection from '@/components/category/RecentlyViewedSection';
import SocialProofSection from '@/components/category/SocialProofSection';
import UGCSocialProofSection from '@/components/category/UGCSocialProofSection';
import StreakLoyaltySection from '@/components/category/StreakLoyaltySection';
import FooterTrustSection from '@/components/category/FooterTrustSection';

export default function MainCategoryPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  // Get recently viewed items
  const { items: recentlyViewedItems, isLoading: isLoadingRecentlyViewed } = useRecentlyViewed();

  // Get favorite stores
  const { favoriteStores, isLoading: isLoadingFavorites, toggleFavorite } = useFavoriteStores();

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
        setSubcategoryProducts(featuredProducts);
        return;
      }

      setIsLoadingSubcategoryProducts(true);
      try {
        const response = await productsApi.getProductsBySubcategory(selectedSubcategory.slug, 10);

        if (response.success && response.data) {
          setSubcategoryProducts(response.data as CategoryProduct[]);
        } else {
          setSubcategoryProducts(featuredProducts);
        }
      } catch (error) {
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
        setSubcategoryStores(featuredStores);
        return;
      }

      setIsLoadingSubcategoryStores(true);
      try {
        const response = await storesApi.getStoresBySubcategorySlug(selectedSubcategory.slug, 10);

        if (response.success && response.data && response.data.length > 0) {
          setSubcategoryStores(response.data);
        } else {
          setSubcategoryStores(featuredStores);
        }
      } catch (error) {
        setSubcategoryStores(featuredStores);
      } finally {
        setIsLoadingSubcategoryStores(false);
      }
    };

    fetchSubcategoryStores();
  }, [selectedSubcategory?.slug, featuredStores]);

  // Prepare subcategories for the slider and grid
  const sliderCategories = categoryConfig?.subcategories.map((sub, index) => {
    const colors = [
      '#8B5CF6', '#F59E0B', '#3B82F6', '#EC4899',
      '#10B981', '#EF4444', '#6366F1', '#14B8A6',
    ];
    return {
      _id: sub.slug,
      id: sub.slug,
      name: sub.name,
      slug: sub.slug,
      icon: sub.icon,
      color: colors[index % colors.length],
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
      {/* 1. Dynamic Category Header */}
      <CategoryHeader
        categoryName={categoryConfig.name}
        primaryColor={categoryConfig.primaryColor}
        banner={categoryConfig.banner}
        gradientColors={categoryConfig.gradientColors}
      />

      {/* 2. Quick Action Bar (NEW - replaces ProductionQuickButtons) */}
      <QuickActionBar categorySlug={slug || ''} />

      {/* 3. Smart AI Banner (NEW) */}
      <SmartAIBanner
        categorySlug={slug || ''}
        categoryName={categoryConfig.name}
      />

      {/* 4. Category Slider - Subcategories */}
      <ProductionCategorySlider
        categories={sliderCategories}
        isLoading={false}
        selectedSlug={selectedSubcategory?.slug}
        onSelect={handleSubcategorySelect}
      />

      {/* 5. Trending Hashtags (NEW) */}
      <TrendingHashtags categorySlug={slug || ''} />

      {/* 6. Category Grid (NEW - 4-column subcategories) */}
      <CategoryGridSection
        subcategories={sliderCategories}
        categorySlug={slug || ''}
      />

      {/* 7. Product Carousel - Featured/filtered products */}
      <ProductionProductCarousel
        products={subcategoryProducts.length > 0 ? subcategoryProducts : featuredProducts}
        isLoading={isLoadingProducts || isLoadingSubcategoryProducts}
        error={productsError}
      />

      {/* 8. Shop by Vibe (NEW) */}
      <ShopByVibeSection categorySlug={slug || ''} />

      {/* 9. Shop by Occasion (NEW) */}
      <ShopByOccasionSection categorySlug={slug || ''} />

      {/* 10. Exclusive Offers (NEW) */}
      <ExclusiveOffersSection categorySlug={slug || ''} />

      {/* 11. Try & Buy Banner (NEW) */}
      <TryAndBuyBanner categorySlug={slug || ''} />

      {/* 12. Top Brands (NEW - replaces ProductionBrandList) */}
      <TopBrandsSection categorySlug={slug || ''} />

      {/* 13. Trending Products (NEW) */}
      <TrendingProductsSection categorySlug={slug || ''} />

      {/* 14. Smart Compare Banner (NEW) */}
      <SmartCompareBanner categorySlug={slug || ''} />

      {/* 15. Favorite Stores Section */}
      {favoriteStores.length > 0 && (
        <FavoriteStoresSection
          stores={favoriteStores}
          isLoading={isLoadingFavorites}
          onToggleFavorite={toggleFavorite}
          maxItems={10}
        />
      )}

      {/* 16. Nearby Stores (NEW - replaces ProductionStoreList) */}
      <NearbyStoresSection categorySlug={slug || ''} />

      {/* 17. Bank Offers (NEW) */}
      <BankOffersSection categorySlug={slug || ''} />

      {/* 18. Best Deals (NEW) */}
      <BestDealsSection categorySlug={slug || ''} />

      {/* 19. Steps Card - How to use vouchers */}
      <StepsCard />

      {/* 20. Wallet Reminder Banner (NEW) */}
      <WalletReminderBanner />

      {/* 21. Recently Viewed Section */}
      {recentlyViewedItems.length > 0 && (
        <RecentlyViewedSection
          items={recentlyViewedItems}
          isLoading={isLoadingRecentlyViewed}
          maxItems={10}
        />
      )}

      {/* 22. Social Proof (NEW) */}
      <SocialProofSection categoryName={categoryConfig.name} />

      {/* 23. UGC Social Proof (NEW - Uses existing backend) */}
      <UGCSocialProofSection
        categorySlug={slug || ''}
        categoryName={categoryConfig.name}
      />

      {/* 24. Streaks & Loyalty (NEW) */}
      <StreakLoyaltySection />

      {/* 25. Footer Trust Section (NEW) */}
      <FooterTrustSection />
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
