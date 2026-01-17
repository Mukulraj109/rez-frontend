import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useCategory, useCategoryItems } from '@/contexts/CategoryContext';
import { useCart } from '@/contexts/CartContext';
import CategoryHeader from '@/components/category/CategoryHeader';
import CategoryGrid from '@/components/category/CategoryGrid';
import CategoryFilters from '@/components/category/CategoryFilters';
import CategoryBanner from '@/components/category/CategoryBanner';
import CategoryCarousel from '@/components/category/CategoryCarousel';
import { CategoryItem, CategoryCarouselItem } from '@/types/category.types';
import { handleCarouselAction } from '@/utils/carouselUtils';
import { showToast } from '@/components/common/ToastManager';

// New Components
import ShopByVibeSection from '@/components/category/ShopByVibeSection';
import ShopByOccasionSection from '@/components/category/ShopByOccasionSection';
import TopBrandsSection from '@/components/category/TopBrandsSection';
import TrendingHashtagsSection from '@/components/category/TrendingHashtagsSection';
import TrendingProductsSection from '@/components/category/TrendingProductsSection';
import LoyaltyHubSection from '../../../components/category/LoyaltyHubSection';
import { categoriesApi } from '@/services/categoriesApi';

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { state, actions } = useCategory();
  const { items, totalCount, filteredCount, hasMore, loading } = useCategoryItems();
  const { actions: cartActions } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loyaltyStats, setLoyaltyStats] = useState({ ordersCount: 0, brandsCount: 0 });

  // Load category data when component mounts or slug changes
  useEffect(() => {
    if (slug) {
      loadCategoryData();
    }
  }, [slug]);

  const loadCategoryData = async () => {
    if (!slug) return;

    try {
      await actions.loadCategory(slug);

      // Load user loyalty stats
      const statsRes = await categoriesApi.getCategoryLoyaltyStats(slug);
      if (statsRes.success && statsRes.data) {
        setLoyaltyStats(statsRes.data);
      }
    } catch (error) {
      console.error('Failed to load category:', error);
      Alert.alert(
        'Error',
        'Failed to load category. Please try again.',
        [
          { text: 'Retry', onPress: loadCategoryData },
          { text: 'Go Back', onPress: () => router.back() }
        ]
      );
    }
  };


  // Redirect logic removed - displaying rich category page instead

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCategoryData();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    actions.updateSearch(query);
  };

  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = { ...state.filters, [filterId]: value };
    actions.updateFilters(newFilters);
  };

  const handleResetFilters = () => {
    actions.resetFilters();
    setShowFilters(false);
  };

  const handleItemPress = (item: CategoryItem) => {
    // Navigate to product page like home-delivery

    router.push(`/ProductPage?cardId=${item.id}&cardType=category&category=${category?.id || slug}` as any);
  };

  const handleAddToCart = async (item: CategoryItem) => {
    try {
      // Extract product ID
      const productId = item.id;

      if (!productId) {
        console.error('❌ [CATEGORY] No product ID found');
        Alert.alert('Error', 'Cannot add item to cart - invalid product');
        return;
      }

      // Extract price - handle complex price objects
      let currentPrice = 0;
      let originalPrice = 0;

      if (item.price) {
        if (typeof item.price === 'number') {
          currentPrice = item.price;
          originalPrice = item.price;
        } else if (typeof item.price === 'object') {
          currentPrice = item.price.current || 0;
          originalPrice = item.price.original || item.price.current || 0;
        }
      }

      // Extract image - handle multiple possible formats
      let imageUrl = '';
      if (item.image) {
        imageUrl = item.image;
      } else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        imageUrl = item.images[0];
      }

      // Calculate discount percentage
      const discountPercentage = item.price?.discount || 0;

      // Prepare cart item data
      const cartItemData: any = {
        id: productId,
        productId: productId,
        name: item.name || 'Product',
        image: imageUrl,
        price: currentPrice,
        originalPrice: originalPrice,
        discountedPrice: currentPrice,
        discount: discountPercentage,
        quantity: 1,
      };

      // Add to cart via CartContext (CartContext will handle increasing quantity if it exists)
      await cartActions.addItem(cartItemData);

      // Wait a bit for the cart state to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Show success toast
      showToast({
        message: `${item.name || 'Item'} added to cart`,
        type: 'success',
        duration: 3000
      });

    } catch (error) {
      console.error('❌ [CATEGORY] Failed to add to cart via CartContext:', error);

      // Fallback: Try using cart API directly
      try {
        const cartApi = (await import('@/services/cartApi')).default;

        const cartResponse = await cartApi.addToCart({
          productId: item.id,
          quantity: 1
        });

        if (cartResponse.success) {
          showToast({
            message: `${item.name || 'Item'} added to cart`,
            type: 'success',
            duration: 3000
          });
        } else {
          throw new Error(cartResponse.message || 'Failed to add to cart');
        }
      } catch (fallbackError) {
        console.error('❌ [CATEGORY] Fallback cart API also failed:', fallbackError);
        showToast({
          message: 'Failed to add item to cart',
          type: 'error',
          duration: 3000
        });
      }
    }
  };

  const handleToggleFavorite = (item: CategoryItem) => {
    actions.toggleFavorite(item);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      actions.loadMore();
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleCarouselItemPress = async (carouselItem: CategoryCarouselItem) => {
    try {
      // Handle carousel action with backend-ready analytics and logging
      const actionResult = await handleCarouselAction(
        carouselItem,
        slug || ''
        // TODO: Get user ID from auth context
        // authContext.user?.id
      );

      if (actionResult.success && carouselItem.action) {
        switch (carouselItem.action.type) {
          case 'filter':
            const newFilters = {
              ...state.filters,
              [carouselItem.action.target]: carouselItem.action.params?.[carouselItem.action.target]
            };
            actions.updateFilters(newFilters);
            break;
          case 'search':
            actions.updateSearch(carouselItem.action.target);
            break;
          case 'navigate':
            router.push(carouselItem.action.target as any);
            break;
        }

        // TODO: Send analytics event to backend
        // if (actionResult.analyticsEvent) {
        //   await analyticsService.track(actionResult.analyticsEvent);
        // }
      }
    } catch (error) {
      console.error('Error handling carousel item press:', error);
    }
  };

  // Show loading state while category is being loaded
  if (!state.currentCategory && state.loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C06A" />
        <ThemedText style={styles.loadingText}>Loading category...</ThemedText>
      </ThemedView>
    );
  }

  // Show error state if category not found
  if (!state.currentCategory && !state.loading) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorTitle}>Category Not Found</ThemedText>
        <ThemedText style={styles.errorText}>
          The category &quot;{slug}&quot; could not be found.
        </ThemedText>
        <TouchableOpacity
          onPress={handleBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityHint="Double tap to return to previous screen"
        >
          <ThemedText style={styles.backButton}>
            Go Back
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const category = state.currentCategory!;

  return (
    <>
      <StatusBar style="light" />
      <ThemedView style={styles.container}>
        {/* Header */}
        <CategoryHeader
          category={category}
          onSearch={handleSearch}
          onBack={handleBack}
          searchQuery={state.searchQuery}
          onFilterPress={() => setShowFilters(!showFilters)}
          showFilterBadge={Object.keys(state.filters).length > 0}
          stats={{
            productCount: (category as any).productCount || 2000,
            storeCount: (category as any).storeCount || 50,
            maxCashback: (category as any).maxCashback || 25
          }}
        />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#00C06A"
              colors={['#00C06A']}
            />
          }
        >
          {/* Loyalty Hub */}
          <LoyaltyHubSection stats={loyaltyStats} categoryName={category.name} />

          {/* Banners */}
          {category.banners && category.banners.length > 0 && (
            <View style={styles.bannersContainer}>
              {category.banners.map((banner) => (
                <View
                  key={banner.id}
                  accessible={true}
                  accessibilityLabel={`Banner: ${banner.title || 'Featured content'}`}
                  accessibilityRole="image"
                  accessibilityHint={banner.subtitle ? banner.subtitle : undefined}
                >
                  <CategoryBanner
                    banner={banner}
                    onPress={() => {
                      if (banner.action?.type === 'navigate') {
                        router.push(banner.action.target as any);
                      }
                    }}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Carousel Section */}
          {category.carouselItems && category.carouselItems.length > 0 && (
            <CategoryCarousel
              items={category.carouselItems}
              onItemPress={handleCarouselItemPress}
              title={`Featured ${category.name}`}
            />
          )}

          {/* New Rich Sections */}
          <ShopByVibeSection categorySlug={slug || ''} />

          <TopBrandsSection categorySlug={slug || ''} />

          <ShopByOccasionSection categorySlug={slug || ''} />

          {/* Filtered Content Title */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Recommended for You
            </ThemedText>
          </View>

          {/* Filters */}
          {showFilters && category.filters && category.filters.length > 0 && (
            <CategoryFilters
              filters={category.filters}
              activeFilters={state.filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          )}

          {/* Results Summary */}
          {state.searchQuery.trim() && (
            <View style={styles.resultsSummary}>
              <ThemedText style={styles.resultsText}>
                {filteredCount} results for &quot;{state.searchQuery}&quot;
              </ThemedText>
            </View>
          )}

          {/* Category Sections or Items Grid */}
          {category.sections && category.sections.length > 0 ? (
            // Render sections
            category.sections.map((section) => (
              <View key={section.id} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={styles.sectionTitle}>
                    {section.title}
                  </ThemedText>
                  {section.viewAllLink && (
                    <TouchableOpacity
                      onPress={() => router.push(section.viewAllLink as any)}
                      accessibilityLabel={`View all ${section.title.toLowerCase()}`}
                      accessibilityRole="button"
                      accessibilityHint="Double tap to see all items in this section"
                    >
                      <ThemedText style={styles.viewAllButton}>
                        View all
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
                <CategoryGrid
                  items={section.items}
                  layoutConfig={{
                    ...category.layoutConfig,
                    type: section.layoutType === 'horizontal' ? 'cards' : category.layoutConfig.type
                  }}
                  onItemPress={handleItemPress}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  horizontal={section.layoutType === 'horizontal'}
                />
              </View>
            ))
          ) : (
            // Render items grid directly
            <CategoryGrid
              items={items}
              layoutConfig={category.layoutConfig}
              onItemPress={handleItemPress}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              loading={loading}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          )}

          {/* Empty State */}
          {items.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyTitle}>No items found</ThemedText>
              <ThemedText style={styles.emptyText}>
                Try adjusting your search or filters
              </ThemedText>
              {Object.keys(state.filters).length > 0 && (
                <TouchableOpacity
                  onPress={handleResetFilters}
                  accessibilityLabel="Clear all filters"
                  accessibilityRole="button"
                  accessibilityHint="Double tap to remove all active filters"
                >
                  <ThemedText style={styles.clearFiltersButton}>
                    Clear Filters
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#00C06A',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    fontSize: 16,
    color: '#00C06A',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  bannersContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  resultsSummary: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.15)',
  },
  resultsText: {
    fontSize: 14,
    color: '#00796B',
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 12,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.08)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2240',
  },
  viewAllButton: {
    fontSize: 14,
    color: '#00C06A',
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.1)',
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2240',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  clearFiltersButton: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
    backgroundColor: '#00C06A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    overflow: 'hidden',
  },
  bottomSpacing: {
    height: 100,
  },
});