import React, { useEffect, useState } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  RefreshControl, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useCategory, useCategoryItems } from '@/contexts/CategoryContext';
import CategoryHeader from '@/components/category/CategoryHeader';
import CategoryGrid from '@/components/category/CategoryGrid';
import CategoryFilters from '@/components/category/CategoryFilters';
import CategoryBanner from '@/components/category/CategoryBanner';
import CategoryCarousel from '@/components/category/CategoryCarousel';
import { CategoryItem, CategoryCarouselItem } from '@/types/category.types';
import { handleCarouselAction } from '@/utils/carouselUtils';

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { state, actions } = useCategory();
  const { items, totalCount, filteredCount, hasMore, loading } = useCategoryItems();
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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
    // Navigate to item detail page (to be implemented)
    console.log('Item pressed:', item.name);
    // router.push(`/item/${item.id}`);
  };

  const handleAddToCart = (item: CategoryItem) => {
    actions.addToCart(item);
    // Show success feedback
    Alert.alert('Added to Cart', `${item.name} has been added to your cart.`);
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
        slug || '', 
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
        <ActivityIndicator size="large" color="#8B5CF6" />
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
        <ThemedText 
          style={styles.backButton} 
          onPress={handleBack}
        >
          Go Back
        </ThemedText>
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
        />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#8B5CF6"
              colors={['#8B5CF6']}
            />
          }
        >
          {/* Banners */}
          {category.banners && category.banners.length > 0 && (
            <View style={styles.bannersContainer}>
              {category.banners.map((banner) => (
                <CategoryBanner
                  key={banner.id}
                  banner={banner}
                  onPress={() => {
                    if (banner.action?.type === 'navigate') {
                      router.push(banner.action.target as any);
                    }
                  }}
                />
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
                    <ThemedText 
                      style={styles.viewAllButton}
                      onPress={() => router.push(section.viewAllLink as any)}
                    >
                      View all
                    </ThemedText>
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
                <ThemedText 
                  style={styles.clearFiltersButton}
                  onPress={handleResetFilters}
                >
                  Clear Filters
                </ThemedText>
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
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
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
    color: '#8B5CF6',
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
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  resultsText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
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
    color: '#111827',
  },
  viewAllButton: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearFiltersButton: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});