import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';

import { HomeDeliveryHeader } from '@/components/home-delivery/HomeDeliveryHeader';
import { CategoryTabs } from '@/components/home-delivery/CategoryTabs';
import { FilterChips } from '@/components/home-delivery/FilterChips';
import { ProductSection } from '@/components/home-delivery/ProductSection';
import { ProductGrid } from '@/components/home-delivery/ProductGrid';
import { useHomeDeliveryPage } from '@/hooks/useHomeDeliveryPage';
import { HomeDeliveryProduct } from '@/types/home-delivery.types';

export default function HomeDeliveryPage() {
  const router = useRouter();
  const { state, actions, handlers } = useHomeDeliveryPage();

  const handleBack = () => {
    router.back();
  };

  const handleProductPress = (product: HomeDeliveryProduct) => {
    router.push(`/product/${product.id}` as any);
  };

  const handleViewAllSection = (sectionId: string) => {
    router.push(`/home-delivery/section/${sectionId}` as any);
  };

  const handleHideSearch = () => {
    if (handlers.handleHideSearch) {
      handlers.handleHideSearch();
    }
  };

  const handleShowSearch = () => {
    if (handlers.handleShowSearch) {
      handlers.handleShowSearch();
    }
  };

  // Get active filters for FilterChips
  const activeFilters = [
    ...state.filters.shipping.map(s => `shipping_${s}`),
    ...state.filters.ratings.map(r => `rating_${r}`),
    ...state.filters.deliveryTime.map(d => `delivery_${d}`),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      {/* Header */}
      <HomeDeliveryHeader
        searchQuery={state.searchQuery}
        onSearchChange={handlers.handleSearchChange}
        onSearchSubmit={handlers.handleSearchSubmit}
        onBack={handleBack}
        onHideSearch={handleHideSearch}
        onShowSearch={handleShowSearch}
        showSearchBar={state.showSearchBar}
      />

      <TouchableWithoutFeedback onPress={handleHideSearch}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Category Tabs */}
          <CategoryTabs
            categories={state.categories}
            activeCategory={state.activeCategory}
            onCategoryChange={handlers.handleCategoryChange}
          />

          {/* Filter Chips */}
          <FilterChips
            filters={state.filters}
            onFilterChange={handlers.handleFilterChange}
            activeFilters={activeFilters}
          />

          {/* Product Sections - Only show when no search query */}
          {!state.searchQuery.trim() && (
            <>
              {state.sections.map((section) => (
                <ProductSection
                  key={section.id}
                  section={section}
                  onProductPress={handleProductPress}
                  onViewAll={() => handleViewAllSection(section.id)}
                />
              ))}
            </>
          )}

          {/* Search Results - Show when there's a search query */}
          {state.searchQuery.trim() && (
            <View style={styles.searchResultsContainer}>
              <ProductGrid
                products={state.filteredProducts}
                loading={state.loading}
                onProductPress={handleProductPress}
                onLoadMore={handlers.handleLoadMore}
                hasMore={state.hasMore}
                numColumns={2}
              />
            </View>
          )}

          {/* All Products Grid - Show when no search query and scrolled past sections */}
          {!state.searchQuery.trim() && (
            <View style={styles.allProductsContainer}>
              <ProductGrid
                products={state.filteredProducts}
                loading={state.loading}
                onProductPress={handleProductPress}
                onLoadMore={handlers.handleLoadMore}
                hasMore={state.hasMore}
                numColumns={2}
              />
            </View>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  searchResultsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  allProductsContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 24,
    paddingTop: 20,
  },
});