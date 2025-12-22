import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSocial } from '../../contexts/SocialContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFollowSystem } from '../../hooks/useFollowSystem';
import { useFeedRealtime } from '../../hooks/useFeedRealtime';
import ActivityCard from '../../components/feed/ActivityCard';
import FollowButton from '../../components/social/FollowButton';

const ActivityFeedPage = () => {
  const {
    activities,
    isLoadingFeed,
    hasMoreActivities,
    loadFeed,
    loadMoreActivities,
    refreshFeed,
    likeActivity,
    commentOnActivity,
    suggestedUsers,
    loadSuggestedUsers
  } = useSocial();

  const { state: authState } = useAuth();
  const user = authState.user;
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [feedFilter, setFeedFilter] = useState<'all' | 'following'>('all');
  const newPostsBannerAnim = React.useRef(new Animated.Value(0)).current;

  // Follow system
  const {
    suggestions: followSuggestions,
    loadSuggestions,
    followersCount,
    followingCount,
  } = useFollowSystem(user?.id);

  // Real-time feed updates
  const {
    activities: realtimeActivities,
    newPostsCount,
    isConnected,
    loadPendingPosts,
    clearNewPostsCount,
  } = useFeedRealtime(activities, user?.id, {
    onNewPost: (activity) => {

      // Animate new posts banner
      Animated.spring(newPostsBannerAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    },
    onFollowUpdate: (userId, isFollowing) => {

      // Refresh suggestions if needed
      loadSuggestions(10);
    },
    autoLoadNewPosts: false, // Manual loading with banner
  });

  useEffect(() => {
    // Initial load
    loadFeed(true);
    loadSuggestions(10);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshFeed();
    await loadSuggestions(10);
    clearNewPostsCount();
    setRefreshing(false);
  };

  const handleLoadNewPosts = () => {
    loadPendingPosts();
    Animated.timing(newPostsBannerAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleLoadMore = () => {
    if (!isLoadingFeed && hasMoreActivities) {
      loadMoreActivities();
    }
  };

  const handleLike = async (activityId: string) => {
    try {
      await likeActivity(activityId);
    } catch (error) {
      console.error('Error liking activity:', error);
    }
  };

  const handleComment = async (activityId: string, comment: string) => {
    try {
      await commentOnActivity(activityId, comment);
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  const renderSuggestedUsers = () => {
    const displaySuggestions = followSuggestions.length > 0 ? followSuggestions : suggestedUsers;
    if (displaySuggestions.length === 0) return null;

    return (
      <View style={styles.suggestedSection}>
        <View style={styles.suggestedHeader}>
          <Text style={styles.suggestedTitle}>Suggested for you</Text>
          {followingCount > 0 && (
            <TouchableOpacity
              onPress={() => loadSuggestions(10)}
              accessibilityLabel="Refresh suggestions"
              accessibilityRole="button"
              accessibilityHint="Loads new user suggestions"
            >
              <Ionicons name="refresh" size={20} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestedScroll}>
          {displaySuggestions.map((suggestedUser) => (
            <View key={suggestedUser._id} style={styles.suggestedCard}>
              <View style={styles.suggestedAvatar}>
                {suggestedUser.profilePicture ? (
                  <Image source={{ uri: suggestedUser.profilePicture }} style={styles.suggestedAvatarImage} />
                ) : (
                  <View style={styles.suggestedAvatarPlaceholder}>
                    <Text style={styles.suggestedAvatarText}>
                      {suggestedUser.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.suggestedName} numberOfLines={1}>
                {suggestedUser.name}
              </Text>
              {(suggestedUser as any).isMutual === true && (
                <View style={styles.mutualBadge}>
                  <Ionicons name="people" size={10} color="#007AFF" />
                  <Text style={styles.mutualText}>Mutual</Text>
                </View>
              )}
              <FollowButton
                userId={suggestedUser._id}
                style={styles.suggestedFollowButton}
                onFollowChange={(isFollowing) => {
                  if (isFollowing) {
                    // Reload suggestions after following
                    setTimeout(() => loadSuggestions(10), 500);
                  }
                }}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      {renderSuggestedUsers()}
      <View style={styles.feedHeader}>
        <Text style={styles.feedTitle}>Activity Feed</Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingFeed) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoadingFeed) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.emptyText}>Loading activities...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>No activities yet</Text>
        <Text style={styles.emptyText}>
          Follow people to see their activities in your feed
        </Text>
        <TouchableOpacity
          style={styles.discoverButton}
          onPress={loadSuggestedUsers}
          accessibilityLabel="Discover people"
          accessibilityRole="button"
          accessibilityHint="Find new people to follow"
        >
          <Text style={styles.discoverButtonText}>Discover People</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Use real-time activities
  const displayActivities = realtimeActivities.length > 0 ? realtimeActivities : activities;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Social Feed</Text>
          {isConnected && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowFilterMenu(!showFilterMenu)}
            accessibilityLabel="Filter options"
            accessibilityRole="button"
            accessibilityState={{ expanded: showFilterMenu }}
            accessibilityHint="Opens filter menu to sort feed posts"
          >
            <Ionicons name="options-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            accessibilityLabel="Notifications"
            accessibilityRole="button"
            accessibilityHint="View your notifications"
          >
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Menu */}
      {showFilterMenu && (
        <View style={styles.filterMenu}>
          <TouchableOpacity
            style={[styles.filterOption, feedFilter === 'all' && styles.filterOptionActive]}
            onPress={() => {
              setFeedFilter('all');
              setShowFilterMenu(false);
            }}
          >
            <Text style={[styles.filterText, feedFilter === 'all' && styles.filterTextActive]}>
              All Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterOption, feedFilter === 'following' && styles.filterOptionActive]}
            onPress={() => {
              setFeedFilter('following');
              setShowFilterMenu(false);
            }}
          >
            <Text style={[styles.filterText, feedFilter === 'following' && styles.filterTextActive]}>
              Following
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* New Posts Banner */}
      {newPostsCount > 0 && (
        <Animated.View
          style={[
            styles.newPostsBanner,
            {
              opacity: newPostsBannerAnim,
              transform: [
                {
                  translateY: newPostsBannerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.newPostsButton}
            onPress={handleLoadNewPosts}
            accessibilityLabel={`Load ${newPostsCount} new ${newPostsCount === 1 ? 'post' : 'posts'}`}
            accessibilityRole="button"
            accessibilityHint="Loads new posts to the feed"
          >
            <Ionicons name="arrow-up" size={16} color="#fff" />
            <Text style={styles.newPostsText}>
              {newPostsCount} new {newPostsCount === 1 ? 'post' : 'posts'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <FlatList
        data={displayActivities}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ActivityCard
            activity={item}
            onLike={handleLike}
            onComment={handleComment}
            currentUserId={user?.id}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        initialNumToRender={5}
        windowSize={5}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000'
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CD964',
  },
  liveDot: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#4CD964',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8
  },
  filterMenu: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    gap: 12,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterOptionActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  newPostsBanner: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  newPostsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  newPostsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    flexGrow: 1
  },
  suggestedSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  suggestedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  suggestedScroll: {
    marginHorizontal: -4
  },
  suggestedCard: {
    width: 120,
    alignItems: 'center',
    marginHorizontal: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12
  },
  suggestedAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8
  },
  suggestedAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30
  },
  suggestedAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  suggestedAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600'
  },
  suggestedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
    width: '100%'
  },
  mutualBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 8,
  },
  mutualText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#007AFF',
  },
  suggestedFollowButton: {
    minWidth: 80,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  feedHeader: {
    marginBottom: 12
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000'
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20
  },
  discoverButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24
  },
  discoverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default ActivityFeedPage;
