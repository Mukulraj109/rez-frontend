import React from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import FashionHeader from '@/components/FashionHeader';
import useFashionData from '@/hooks/useFashionData';

// Production-ready components with real API integration
import ProductionStoreList from '@/src/components/ProductionStoreList';
import ProductionBrandList from '@/src/components/ProductionBrandList';
import ProductionCategorySlider from '@/src/components/ProductionCategorySlider';
import ProductionProductCarousel from '@/src/components/ProductionProductCarousel';
import ProductionQuickButtons from '@/src/components/ProductionQuickButtons';

// Keep original StepsCard (informational only, no backend needed)
import StepsCard from '@/src/components/StepsCard';

export default function FashionPage() {
  // Fetch all fashion data using our production-ready hook
  const {
    featuredStores,
    fashionStores,
    featuredProducts,
    categories,
    isLoading,
    isLoadingStores,
    isLoadingProducts,
    isLoadingCategories,
    storesError,
    productsError,
    refetchAll,
  } = useFashionData();

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetchAll}
          colors={['#8B5CF6']}
          tintColor="#8B5CF6"
        />
      }
    >
      {/* Fashion Header - Already production ready with auth & wallet */}
      <FashionHeader />

      {/* Category Slider - Now with real categories from database */}
      <ProductionCategorySlider
        categories={categories}
        isLoading={isLoadingCategories}
      />

      {/* Product Carousel - Now with real featured products */}
      <ProductionProductCarousel
        products={featuredProducts}
        isLoading={isLoadingProducts}
        error={productsError}
      />

      {/* Quick Buttons - Now with real actions (geolocation, navigation) */}
      <ProductionQuickButtons />

      {/* Steps Card - Keep as is (informational, no backend needed) */}
      <StepsCard />

      {/* Store List - Production ready with real store data */}
      <ProductionStoreList
        stores={featuredStores}
        isLoading={isLoadingStores}
        error={storesError}
        onRefresh={refetchAll}
      />

      {/* Brand List - Production ready with real fashion brands */}
      <ProductionBrandList
        stores={fashionStores}
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
});