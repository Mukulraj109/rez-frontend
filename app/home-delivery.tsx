import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { HomeDeliveryHeader } from '@/components/home-delivery/HomeDeliveryHeader';
import { CategoryTabs } from '@/components/home-delivery/CategoryTabs';
import { FilterChips } from '@/components/home-delivery/FilterChips';
import { ProductSection } from '@/components/home-delivery/ProductSection';
import { ProductGrid } from '@/components/home-delivery/ProductGrid';
import { ThemedText } from '@/components/ThemedText';
import { useHomeDeliveryPage } from '@/hooks/useHomeDeliveryPage';
import { HomeDeliveryProduct } from '@/types/home-delivery.types';

export default function HomeDeliveryPage() {
  const router = useRouter();
  const { state, actions, handlers } = useHomeDeliveryPage();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/'); // Fallback to home page
    }
  };

  const handleProductPress = (product: HomeDeliveryProduct) => {
    router.push(`/ProductPage?cardId=${product.id}&cardType=just_for_you&category=${product.categoryId}` as any);
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
        showSearchBar={true}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        accessibilityLabel="Home delivery products list"
        accessibilityRole="scrollbar"
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

          {/* Product Sections - Only show when no search query and "All" category is selected */}
          {!state.searchQuery.trim() && state.activeCategory === 'all' && (
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

          {/* Category Filtered Products - Show when a specific category is selected */}
          {!state.searchQuery.trim() && state.activeCategory !== 'all' && (
            <>
              {/* Simple Category Heading */}
              <View
                style={styles.simpleCategoryHeader}
                accessibilityRole="header"
                accessibilityLabel={`${state.categories.find(cat => cat.id === state.activeCategory)?.name || 'Products'} category`}
              >
                <ThemedText style={styles.simpleCategoryTitle}>
                  {state.categories.find(cat => cat.id === state.activeCategory)?.name || 'Products'}
                </ThemedText>
              </View>

              {state.filteredProducts.length > 0 ? (
                <View style={styles.productsContainer}>
                  <ProductGrid
                    products={state.filteredProducts}
                    onProductPress={handleProductPress}
                    loading={state.loading}
                    onLoadMore={handlers.handleLoadMore}
                    hasMore={state.hasMore}
                    numColumns={2}
                    showHeader={false}
                  />
                </View>
              ) : (
                <View
                  style={styles.emptyState}
                  accessibilityRole="alert"
                  accessibilityLabel="No products found in this category"
                >
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="search-outline" size={64} color="#D1D5DB" />
                  </View>
                  <ThemedText style={styles.emptyTitle}>No products found</ThemedText>
                  <ThemedText style={styles.emptySubtitle}>
                    We couldn't find any products in this category.{'\n'}Try selecting a different category or browse all products.
                  </ThemedText>
                  <View style={styles.emptyActionContainer}>
                    <TouchableOpacity
                      style={styles.emptyActionButton}
                      onPress={() => handlers.handleCategoryChange('all')}
                      accessibilityLabel="Browse all products"
                      accessibilityRole="button"
                      accessibilityHint="Double tap to view all available products"
                    >
                      <ThemedText style={styles.emptyActionText}>Browse All Products</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}

          {/* Search Results - Show when there's a search query */}
          {state.searchQuery.trim() && (
            <>
              {/* Search Results Header */}
              <View
                style={styles.searchResultsHeader}
                accessibilityRole="header"
                accessibilityLabel={state.searchQuery.trim().length < 2
                  ? "Search results. Type at least 2 characters to search"
                  : state.loading
                    ? "Searching for products"
                    : `Search results for ${state.searchQuery}. ${state.filteredProducts.length} ${state.filteredProducts.length === 1 ? 'product' : 'products'} found`}
              >
                <View style={styles.searchResultsTitleContainer}>
                  <Ionicons name="search" size={20} color="#8B5CF6" />
                  <ThemedText style={styles.searchResultsTitle}>
                    Search Results
                  </ThemedText>
                </View>
                {state.searchQuery.trim().length < 2 ? (
                  <ThemedText style={styles.searchHint}>
                    Type at least 2 characters to search...
                  </ThemedText>
                ) : (
                  <>
                    <ThemedText style={styles.searchResultsCount}>
                      {state.loading ? 'Searching...' : `${state.filteredProducts.length} ${state.filteredProducts.length === 1 ? 'product' : 'products'} found`}
                    </ThemedText>
                    <ThemedText style={styles.searchQueryText}>
                      for "{state.searchQuery}"
                    </ThemedText>
                  </>
                )}
              </View>

              {/* Search Results Grid */}
              {state.searchQuery.trim().length < 2 ? (
                // Show hint message for short queries
                <View
                  style={styles.searchHintContainer}
                  accessibilityRole="alert"
                  accessibilityLabel="Search hint. Enter at least 2 characters to start searching"
                >
                  <Ionicons name="information-circle-outline" size={48} color="#D1D5DB" />
                  <ThemedText style={styles.searchHintTitle}>Keep typing...</ThemedText>
                  <ThemedText style={styles.searchHintText}>
                    Enter at least 2 characters to start searching
                  </ThemedText>
                </View>
              ) : state.loading ? (
                <View
                  style={styles.loadingContainer}
                  accessibilityRole="progressbar"
                  accessibilityLabel="Searching for products"
                  accessibilityValue={{ text: "Loading" }}
                >
                  <ActivityIndicator size="large" color="#8B5CF6" />
                  <ThemedText style={styles.loadingText}>Searching products...</ThemedText>
                </View>
              ) : state.filteredProducts.length > 0 ? (
                <View style={styles.searchResultsContainer}>
                  <ProductGrid
                    products={state.filteredProducts}
                    loading={false}
                    onProductPress={handleProductPress}
                    onLoadMore={handlers.handleLoadMore}
                    hasMore={state.hasMore}
                    numColumns={2}
                    showHeader={false}
                  />
                </View>
              ) : (
                <View
                  style={styles.searchEmptyState}
                  accessibilityRole="alert"
                  accessibilityLabel={`No results found for ${state.searchQuery}. Try different keywords or browse our categories`}
                >
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="search-outline" size={80} color="#D1D5DB" />
                  </View>
                  <ThemedText style={styles.emptyTitle}>No results found</ThemedText>
                  <ThemedText style={styles.emptySubtitle}>
                    We couldn't find any products matching "{state.searchQuery}"
                  </ThemedText>
                  <ThemedText style={styles.emptySuggestion}>
                    Try different keywords or browse our categories
                  </ThemedText>
                  <View style={styles.emptyActionContainer}>
                    <TouchableOpacity
                      style={styles.emptyActionButton}
                      onPress={() => handlers.handleSearchChange('')}
                      accessibilityLabel="Clear search"
                      accessibilityRole="button"
                      accessibilityHint="Double tap to clear search and view all products"
                    >
                      <ThemedText style={styles.emptyActionText}>Clear Search</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
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
  scrollContent: {
    paddingBottom: 20,
  },
  searchResultsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderRadius: 24,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  allProductsContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 24,
    paddingTop: 20,
  },
  simpleCategoryHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  simpleCategoryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  categoryResults: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  categoryHeader: {
    marginBottom: 24,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  categoryCount: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  productsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyActionContainer: {
    width: '100%',
  },
  emptyActionButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 4px 8px rgba(139, 92, 246, 0.3)',
      },
    }),
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchResultsHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 16,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  searchResultsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  searchResultsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  searchHint: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  searchResultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  searchQueryText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  searchEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginHorizontal: 16,
  },
  emptySuggestion: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  searchHintContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginHorizontal: 16,
  },
  searchHintTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  searchHintText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});