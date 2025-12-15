// DiscoverAndShopSection.tsx - Main container for Discover & Shop feature
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DiscoverTabType, CategoryCard } from '@/types/discover.types';
import { useDiscoverContent } from '@/hooks/useDiscoverContent';
import DiscoverAndShopHeader from './DiscoverAndShopHeader';
import DiscoverAndShopTabBar from './DiscoverAndShopTabBar';
import ReelsTab from './content/ReelsTab';
import PostsTab from './content/PostsTab';
import ArticlesTab from './content/ArticlesTab';
import ImagesTab from './content/ImagesTab';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DiscoverAndShopSectionProps {
  /** Whether to show the header with category cards */
  showHeader?: boolean;
  /** Whether to show category cards in header */
  showCategories?: boolean;
  /** Initial tab to show */
  initialTab?: DiscoverTabType;
  /** Custom category cards */
  categories?: CategoryCard[];
  /** Maximum height for the section (useful for homepage embedding) */
  maxHeight?: number;
  /** Callback when category card is pressed */
  onCategoryPress?: (category: CategoryCard) => void;
}

export default function DiscoverAndShopSection({
  showHeader = true,
  showCategories = true,
  initialTab = 'reels',
  categories,
  maxHeight,
  onCategoryPress,
}: DiscoverAndShopSectionProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DiscoverTabType>(initialTab);
  const [refreshing, setRefreshing] = useState(false);

  // Content hook
  const { state, actions } = useDiscoverContent();

  // Fetch initial content for active tab
  useEffect(() => {
    actions.fetchTabContent(activeTab, true);
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = useCallback((tab: DiscoverTabType) => {
    setActiveTab(tab);
    // Check if we already have data for this tab
    const tabData = state[tab];
    if (!tabData || tabData.length === 0) {
      actions.fetchTabContent(tab, true);
    }
  }, [state, actions]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await actions.fetchTabContent(activeTab, true);
    setRefreshing(false);
  }, [activeTab, actions]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!state.loadingByTab[activeTab] && state.pagination[activeTab].hasMore) {
      actions.loadMoreContent(activeTab);
    }
  }, [activeTab, state, actions]);

  // Handle category press - Navigate to category browse page
  const handleCategoryPress = useCallback((category: CategoryCard) => {
    if (onCategoryPress) {
      onCategoryPress(category);
    } else {
      // Navigate to category page using slug route
      const categorySlug = category.categoryId || category.id;
      router.push(`/category/${categorySlug}` as any);
    }
  }, [router, onCategoryPress]);

  // Render active tab content
  const renderTabContent = useMemo(() => {
    const loading = state.loadingByTab[activeTab];
    const hasMore = state.pagination[activeTab].hasMore;

    switch (activeTab) {
      case 'reels':
        return (
          <ReelsTab
            data={state.reels}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        );

      case 'posts':
        return (
          <PostsTab
            data={state.posts}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        );

      case 'articles':
        return (
          <ArticlesTab
            data={state.articles}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        );

      case 'images':
        return (
          <ImagesTab
            data={state.images}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        );

      default:
        return null;
    }
  }, [activeTab, state, handleLoadMore, handleRefresh, refreshing]);

  const containerStyle = useMemo(() => [
    styles.container,
    maxHeight ? { maxHeight, height: maxHeight } : { flex: 1 },
  ], [maxHeight]);

  return (
    <View style={containerStyle}>
      {/* Header with category cards */}
      {showHeader && (
        <DiscoverAndShopHeader
          categories={categories}
          onCategoryPress={handleCategoryPress}
          showCategories={showCategories}
        />
      )}

      {/* Tab Bar */}
      <DiscoverAndShopTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {renderTabContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
