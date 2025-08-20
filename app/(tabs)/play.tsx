import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { usePlayPageData } from '@/hooks/usePlayPageData';
import { UGCVideoItem, CategoryTab, PLAY_PAGE_COLORS } from '@/types/playPage.types';
import { useVideoPreload } from '@/services/videoPreloadService';

// New Play Page Components
import CategoryHeader from '@/components/playPage/CategoryHeader';
import FeaturedVideoCard from '@/components/playPage/FeaturedVideoCard';
import MainContentSection from '@/components/playPage/MainContentSection';
import ArticleSection from '@/components/playPage/ArticleSection';
import HorizontalVideoSection from '@/components/playPage/HorizontalVideoSection';

export default function PlayScreen() {
  const router = useRouter();
  const { state, actions } = usePlayPageData();
  const { preloadVideos, isPreloaded } = useVideoPreload();

  const handleRefresh = React.useCallback(async () => {
    try {
      await actions.refreshVideos();
      if (state.allVideos.length > 0) {
        await preloadVideos(state.allVideos.slice(0, 5), 0);
      }
    } catch (error) {
      console.error('Failed to refresh play data:', error);
    }
  }, [actions, preloadVideos, state.allVideos]);

  const handleVideoPress = React.useCallback((video: UGCVideoItem) => {
    actions.navigateToDetail(video);
  }, [actions]);

  const handleCategoryPress = React.useCallback((category: CategoryTab) => {
    actions.setActiveCategory(category.type);
  }, [actions]);

  const handleLikeVideo = React.useCallback(async (videoId: string) => {
    const success = await actions.likeVideo(videoId);
    if (!success) {
      Alert.alert('Error', 'Failed to like video. Please try again.');
    }
  }, [actions]);

  const handleShareVideo = React.useCallback(async (video: UGCVideoItem) => {
    await actions.shareVideo(video);
  }, [actions]);

  const handleLoadMore = React.useCallback(() => {
    actions.loadMoreVideos();
  }, [actions]);

  const handleViewAllPress = React.useCallback(() => {
    console.log('Navigate to all videos for category:', state.activeCategory);
  }, [state.activeCategory]);

  React.useEffect(() => {
    const preloadCurrentVideos = async () => {
      const currentVideos = getCurrentVideos();
      if (currentVideos.length > 0) {
        await preloadVideos(currentVideos.slice(0, 5), 0);
      }
    };

    if (!state.loading && state.allVideos.length > 0) {
      preloadCurrentVideos();
    }
  }, [state.loading, state.allVideos, state.activeCategory, preloadVideos]);

  const getCurrentVideos = () => {
    switch (state.activeCategory) {
      case 'trending_me':
        return state.trendingVideos;
      case 'trending_her':
        return state.trendingVideos;
      case 'article':
        return state.articleVideos;
      default:
        return state.allVideos;
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={state.refreshing}
          onRefresh={handleRefresh}
          tintColor={PLAY_PAGE_COLORS.primary}
          colors={[PLAY_PAGE_COLORS.primary]}
        />
      }
    >
      {/* Category Header */}
      <CategoryHeader
        categories={state.categories}
        onCategoryPress={handleCategoryPress}
        activeCategory={state.activeCategory}
      />

      <View style={styles.content}>
        {/* Error message */}
        {state.error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{state.error}</ThemedText>
          </View>
        )}

        {/* Featured Video */}
        {state.featuredVideo && state.activeCategory === 'trending_me' && (
          <FeaturedVideoCard
            item={state.featuredVideo}
            onPress={handleVideoPress}
            onLike={handleLikeVideo}
            onShare={handleShareVideo}
            autoPlay={true}
          />
        )}

        {/* Trending Horizontal Section */}
        {state.activeCategory === 'trending_me' && state.trendingVideos.length > 0 && (
          <View style={styles.sectionCard}>
            <HorizontalVideoSection
              videos={state.trendingVideos.slice(0, 4)}
              onVideoPress={handleVideoPress}
            />
          </View>
        )}

        {/* Main Content Grid */}
        <MainContentSection
          videos={getCurrentVideos()}
          onVideoPress={handleVideoPress}
          autoPlay={true}
          loading={state.loading}
          showLoadMore={state.hasMoreVideos}
          onLoadMore={handleLoadMore}
        />

        {/* Articles */}
 
        {state.articleVideos.length > 0 && state.activeCategory !== 'article' && (
          <ArticleSection
            articles={state.articleVideos.slice(0, 4)}
            onArticlePress={handleVideoPress}
            onViewAllPress={() => actions.setActiveCategory('article')}
            loading={state.loading}
          />
        )}
      
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PLAY_PAGE_COLORS.background,
  },
  content: {
    flex: 1,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  sectionCard: {
    marginBottom: 32,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 16,
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
    lineHeight: 22,
  },
});
