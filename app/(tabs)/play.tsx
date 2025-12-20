import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert, TouchableOpacity, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { usePlayPageData } from '@/hooks/usePlayPageData';
import { UGCVideoItem, CategoryTab, PLAY_PAGE_COLORS } from '@/types/playPage.types';
import { Article } from '@/types/article.types';
import { useVideoPreload } from '@/services/videoPreloadService';
import { useAuth } from '@/contexts/AuthContext';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import articlesService from '@/services/articlesApi';

// New Play Page Components
import CategoryHeader from '@/components/playPage/CategoryHeader';
import MerchantVideoSection from '@/components/playPage/MerchantVideoSection';
import ArticleSection from '@/components/playPage/ArticleSection';
import UGCVideoSection from '@/components/playPage/UGCVideoSection';
import logger from '@/utils/logger';

export default function PlayScreen() {
  const router = useRouter();
  const { state, actions } = usePlayPageData();
  const { preloadVideos, isPreloaded } = useVideoPreload();
  const { state: authState } = useAuth();

  // Separate state for articles
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = React.useState(false);
  const [articlesError, setArticlesError] = React.useState<string>();

  // FAB animation
  const fabScale = React.useRef(new Animated.Value(0)).current;
  const [showFAB, setShowFAB] = React.useState(true);

  // Fetch articles
  const fetchArticles = React.useCallback(async () => {
    try {
      setArticlesLoading(true);
      setArticlesError(undefined);

      logger.debug('📰 [PlayPage] Fetching articles...');

      const response = await articlesService.getArticles({
        page: 1,
        limit: 6,
        sortBy: 'newest',
        isPublished: true
      });

      if (response.success) {
        setArticles(response.data.articles);
        logger.debug(`✅ [PlayPage] Loaded ${response.data.articles.length} articles`);
      } else {
        throw new Error(response.message || 'Failed to fetch articles');
      }
    } catch (error) {
      logger.error('❌ [PlayPage] Failed to fetch articles:', error);
      setArticlesError('Failed to load articles');
    } finally {
      setArticlesLoading(false);
    }
  }, []);

  // Animate FAB entrance on mount & fetch articles
  React.useEffect(() => {
    Animated.spring(fabScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Fetch articles on mount
    fetchArticles();
  }, [fetchArticles]);

  const handleRefresh = React.useCallback(async () => {
    try {
      // Refresh both videos and articles
      await Promise.all([
        actions.refreshVideos(),
        fetchArticles()
      ]);

      if (state.allVideos.length > 0) {
        await preloadVideos(state.allVideos.slice(0, 5), 0);
      }
    } catch (error) {
      logger.error('Failed to refresh play data:', error);
    }
  }, [actions, fetchArticles, preloadVideos, state.allVideos]);

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
    router.push('/products-videos');
  }, [router]);

  const handleArticlePress = React.useCallback((article: Article) => {
    router.push(`/article/${article.id}`);
  }, [router]);

  const handleArticlesViewAllPress = React.useCallback(() => {
    router.push('/articles');
  }, [router]);

  const handleRetry = React.useCallback(async () => {
    await Promise.all([
      actions.refreshVideos(),
      fetchArticles()
    ]);
  }, [actions, fetchArticles]);

  const handleRetryArticles = React.useCallback(async () => {
    await fetchArticles();
  }, [fetchArticles]);

  const handleUploadPress = React.useCallback(() => {
    // Check if user is authenticated
    if (!authState.isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to upload videos and share your content.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign In',
            onPress: () => router.push('/sign-in'),
          },
        ]
      );
      return;
    }

    // Navigate to upload screen
    router.push('/ugc/upload');
  }, [authState.isAuthenticated, router]);

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

  // Show full-screen error on initial load failure
  if (state.error && !state.refreshing && state.allVideos.length === 0) {
    return (
      <View style={styles.container}>
        <CategoryHeader
          categories={state.categories}
          onCategoryPress={handleCategoryPress}
          activeCategory={state.activeCategory}
        />
        <ErrorState
          message={state.error}
          onRetry={handleRetry}
        />
      </View>
    );
  }

  // Show full-screen loading on initial load
  if (state.loading && state.allVideos.length === 0 && !state.refreshing) {
    return (
      <View style={styles.container}>
        <CategoryHeader
          categories={state.categories}
          onCategoryPress={handleCategoryPress}
          activeCategory={state.activeCategory}
        />
        <LoadingState message="Loading amazing videos for you..." />
      </View>
    );
  }

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
        {/* Inline error banner for refresh failures */}
        {state.error && state.allVideos.length > 0 && (
          <TouchableOpacity
            style={styles.errorBanner}
            onPress={handleRetry}
            activeOpacity={0.8}
            accessibilityLabel={`Error loading content: ${state.error}`}
            accessibilityRole="button"
            accessibilityHint="Double tap to retry loading content"
          >
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <ThemedText style={styles.errorBannerText}>
              {state.error}
            </ThemedText>
            <Ionicons name="refresh" size={18} color="#DC2626" />
          </TouchableOpacity>
        )}

        {/* Merchant Videos Section */}
        {state.loading && state.merchantVideos.length === 0 ? (
          <View style={styles.sectionLoading}>
            <LoadingState message="Loading product videos..." size="small" />
          </View>
        ) : state.merchantVideos.length > 0 ? (
          <MerchantVideoSection
            videos={state.merchantVideos}
            onVideoPress={handleVideoPress}
            onViewAllPress={handleViewAllPress}
            loading={state.loading}
          />
        ) : null}

        {/* Article Section */}
        {articlesLoading && articles.length === 0 ? (
          <View style={styles.sectionLoading}>
            <LoadingState message="Loading articles..." size="small" />
          </View>
        ) : articlesError && articles.length === 0 ? (
          <View style={styles.sectionError}>
            <TouchableOpacity
              style={styles.sectionErrorButton}
              onPress={handleRetryArticles}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-circle" size={24} color="#EF4444" />
              <ThemedText style={styles.sectionErrorText}>
                Failed to load articles. Tap to retry.
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : articles.length > 0 ? (
          <ArticleSection
            articles={articles}
            onArticlePress={handleArticlePress}
            onViewAllPress={handleArticlesViewAllPress}
            loading={articlesLoading}
          />
        ) : null}

        {/* UGC Videos Section */}
        {state.loading && state.ugcVideos.length === 0 ? (
          <View style={styles.sectionLoading}>
            <LoadingState message="Loading UGC videos..." size="small" />
          </View>
        ) : state.ugcVideos.length > 0 ? (
          <UGCVideoSection
            videos={state.ugcVideos}
            onVideoPress={handleVideoPress}
            onViewAllPress={handleViewAllPress}
            onLoadMore={handleLoadMore}
            loading={state.loading}
            hasMore={state.hasMoreVideos}
          />
        ) : null}

        {/* Empty state when no content */}
        {!state.loading &&
         !articlesLoading &&
         state.merchantVideos.length === 0 &&
         articles.length === 0 &&
         state.ugcVideos.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="play-circle-outline" size={80} color={PLAY_PAGE_COLORS.textSecondary} />
            <ThemedText style={styles.emptyText}>No Videos Yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Check back soon for fresh content!
            </ThemedText>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleUploadPress}
              activeOpacity={0.8}
              accessibilityLabel="Be the first to upload"
              accessibilityRole="button"
              accessibilityHint="Double tap to upload the first video to this section"
            >
              <LinearGradient
                colors={['#00C06A', '#00A85C', '#00796B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emptyButtonGradient}
              >
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <ThemedText style={styles.emptyButtonText}>
                  Be the First to Upload
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

      </View>

      {/* Upload FAB Button */}
      {showFAB && (
        <Animated.View
          style={[
            styles.fabContainer,
            {
              transform: [{ scale: fabScale }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleUploadPress}
            style={styles.fab}
            accessibilityLabel="Upload video"
            accessibilityRole="button"
            accessibilityHint="Double tap to upload a video and share your content"
          >
            <LinearGradient
              colors={['#00C06A', '#00A85C', '#00796B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <Ionicons name="add" size={32} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
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
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionLoading: {
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  sectionError: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  sectionErrorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  sectionErrorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 999,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 80,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: PLAY_PAGE_COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: PLAY_PAGE_COLORS.textSecondary,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#00C06A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
