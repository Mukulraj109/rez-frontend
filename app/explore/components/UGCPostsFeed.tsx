import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import reelApi from '../../../services/reelApi';

const { width } = Dimensions.get('window');

const storeEmojis: Record<string, string> = {
  'food': '🍛',
  'restaurant': '🍽️',
  'cafe': '☕',
  'coffee': '☕',
  'fashion': '👗',
  'clothing': '👕',
  'shoes': '👟',
  'electronics': '📱',
  'grocery': '🛒',
  'beauty': '💄',
  'spa': '💆',
  'fitness': '💪',
  'gym': '🏋️',
  'default': '🏪',
};

const getStoreEmoji = (category?: string, storeName?: string): string => {
  if (category) {
    const lowerCat = category.toLowerCase();
    for (const [key, emoji] of Object.entries(storeEmojis)) {
      if (lowerCat.includes(key)) return emoji;
    }
  }
  if (storeName) {
    const lowerName = storeName.toLowerCase();
    for (const [key, emoji] of Object.entries(storeEmojis)) {
      if (lowerName.includes(key)) return emoji;
    }
  }
  return storeEmojis.default;
};

const formatTimeAgo = (dateString?: string): string => {
  if (!dateString) return '1 hour ago';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return 'Just now';
};

const UGCPostsFeed = () => {
  const router = useRouter();
  const [ugcPosts, setUgcPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUgcPosts = async () => {
      try {
        const response = await reelApi.getTrendingReels({ limit: 5 });
        if (response.success && response.data && response.data.length > 0) {
          const transformed = response.data.map((video: any, index: number) => ({
            id: video.id || video._id,
            // Use real storeId from backend
            storeId: video.storeId || video.store?.id || video.store?._id || null,
            user: {
              name: video.creator?.name || video.creator?.username ||
                    (video.creator?.profile ? `${video.creator.profile.firstName || ''} ${video.creator.profile.lastName || ''}`.trim() : null) ||
                    `User ${index + 1}`,
              avatar: video.creator?.avatar || video.creator?.profile?.avatar || `https://i.pravatar.cc/100?img=${10 + index}`,
              distance: `${(Math.random() * 2 + 0.3).toFixed(1)} km away`,
            },
            // Use real store name from backend
            store: video.storeName || video.store?.name || 'Local Store',
            storeEmoji: getStoreEmoji(video.category, video.storeName || video.store?.name),
            image: video.thumbnail || video.thumbnailUrl || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
            caption: video.description || video.caption || 'Great experience with ReZ cashback!',
            saved: video.amountSaved || Math.floor(Math.random() * 500) + 50,
            // Use real likes count from backend
            helpful: video.likesCount || video.likes || 0,
            // Use real comments count from backend
            comments: video.commentsCount || video.comments?.length || 0,
            time: formatTimeAgo(video.createdAt),
            // Use real isLiked status from backend
            isLiked: video.isLiked || false,
          }));
          setUgcPosts(transformed);
        }
      } catch (error) {
        console.error('[UGC POSTS FEED] Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUgcPosts();
  }, []);

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  // Handle like/helpful button
  const handleLike = async (postId: string) => {
    // Find the current post
    const currentPost = ugcPosts.find(p => p.id === postId);
    if (!currentPost) return;

    const wasLiked = currentPost.isLiked;

    // Optimistic update - immediately update UI
    setUgcPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !wasLiked,
          helpful: wasLiked ? Math.max(0, post.helpful - 1) : post.helpful + 1,
        };
      }
      return post;
    }));

    // Call API to persist like
    try {
      const response = await reelApi.toggleLike(postId);

      // Update with actual server response if available
      if (response.success && response.data) {
        setUgcPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: response.data.liked ?? response.data.isLiked ?? !wasLiked,
              helpful: response.data.likesCount ?? response.data.totalLikes ?? post.helpful,
            };
          }
          return post;
        }));
      }
    } catch (error) {
      // Revert on error
      setUgcPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: wasLiked,
            helpful: wasLiked ? post.helpful + 1 : Math.max(0, post.helpful - 1),
          };
        }
        return post;
      }));
    }
  };

  // Handle share button
  const handleShare = async (post: any) => {
    try {
      const result = await Share.share({
        message: `Check out this amazing experience at ${post.store}! They saved ₹${post.saved} with ReZ cashback. "${post.caption}" \n\nDownload ReZ to start saving too!`,
        title: `${post.user.name} saved ₹${post.saved} at ${post.store}`,
      });

      if (result.action === Share.sharedAction) {
      }
    } catch (error: any) {
      Alert.alert('Error', 'Unable to share at this moment');
    }
  };

  // Handle comment button - navigate to reel detail with comments
  const handleComment = (postId: string) => {
    navigateTo(`/explore/reel/${postId}?showComments=true`);
  };

  // Handle view store
  const handleViewStore = (storeId: string | null, storeName: string) => {
    if (storeId) {
      navigateTo(`/MainStorePage?id=${storeId}`);
    } else {
      // Search for the store by name if no ID
      navigateTo(`/explore/search?q=${encodeURIComponent(storeName)}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>People Are Saving Here</Text>
            <Text style={styles.sectionSubtitle}>Real experiences from your neighborhood</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00C06A" />
        </View>
      </View>
    );
  }

  // Empty state - don't render section if no data
  if (ugcPosts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>People Are Saving Here</Text>
          <Text style={styles.sectionSubtitle}>Real experiences from your neighborhood</Text>
        </View>
        <TouchableOpacity onPress={() => navigateTo('/explore/reels')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Posts List */}
      <View style={styles.postsList}>
        {ugcPosts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            {/* User Header */}
            <View style={styles.postHeader}>
              <Image source={{ uri: post.user.avatar }} style={styles.userAvatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{post.user.name}</Text>
                <View style={styles.userMeta}>
                  <Ionicons name="location-outline" size={12} color="#6B7280" />
                  <Text style={styles.userMetaText}>{post.user.distance}</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.userMetaText}>{post.time}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewStoreButton}
                onPress={() => handleViewStore(post.storeId, post.store)}
              >
                <Text style={styles.viewStoreText}>View Store</Text>
              </TouchableOpacity>
            </View>

            {/* Post Image */}
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() => navigateTo(`/explore/reel/${post.id}`)}
            >
              <Image source={{ uri: post.image }} style={styles.postImage} />

              {/* Savings Badge */}
              <View style={styles.savingsBadge}>
                <View style={styles.savingsIcon}>
                  <Ionicons name="wallet-outline" size={14} color="#FFFFFF" />
                </View>
                <Text style={styles.savingsText}>₹{post.saved}</Text>
              </View>
            </TouchableOpacity>

            {/* Store Name - Tappable */}
            <TouchableOpacity
              style={styles.storeRow}
              onPress={() => handleViewStore(post.storeId, post.store)}
            >
              <Text style={styles.storeEmoji}>{post.storeEmoji}</Text>
              <Text style={styles.storeName}>{post.store}</Text>
              <Ionicons name="chevron-forward" size={16} color="#00C06A" />
            </TouchableOpacity>

            {/* Caption */}
            <Text style={styles.caption}>{post.caption}</Text>

            {/* Actions Row */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleLike(post.id)}
              >
                <Ionicons
                  name={post.isLiked ? "thumbs-up" : "thumbs-up-outline"}
                  size={18}
                  color={post.isLiked ? "#00C06A" : "#6B7280"}
                />
                <Text style={[
                  styles.actionText,
                  post.isLiked && styles.actionTextActive
                ]}>
                  {post.helpful}
                </Text>
                <Text style={[
                  styles.actionLabel,
                  post.isLiked && styles.actionLabelActive
                ]}>
                  Helpful
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleComment(post.id)}
              >
                <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
                <Text style={styles.actionText}>{post.comments}</Text>
                <Text style={styles.actionLabel}>Comment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleShare(post)}
              >
                <Ionicons name="share-outline" size={18} color="#6B7280" />
                <Text style={styles.actionLabel}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2240',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 14,
    color: '#00C06A',
    fontWeight: '600',
  },
  postsList: {
    paddingHorizontal: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0B2240',
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  userMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  metaDot: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  viewStoreButton: {
    borderWidth: 1.5,
    borderColor: '#00C06A',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  viewStoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00C06A',
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  savingsBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C06A',
    paddingLeft: 6,
    paddingRight: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  savingsIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 6,
  },
  storeEmoji: {
    fontSize: 16,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00C06A',
  },
  caption: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 21,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  actionLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  actionTextActive: {
    color: '#00C06A',
  },
  actionLabelActive: {
    color: '#00C06A',
  },
});

export default UGCPostsFeed;
