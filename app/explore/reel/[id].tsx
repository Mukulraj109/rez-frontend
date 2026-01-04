import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import reelApi, { Reel, ReelComment } from '@/services/reelApi';

const { width, height } = Dimensions.get('window');

const ReelDetailPage = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const reelId = Array.isArray(id) ? id[0] : id;

  // UI state
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // API state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reel, setReel] = useState<Reel | null>(null);
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [likesCount, setLikesCount] = useState(0);

  // Fetch reel data
  const fetchReelData = useCallback(async (isRefresh = false) => {
    if (!reelId) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [reelResponse, commentsResponse] = await Promise.all([
        reelApi.getReelById(reelId),
        reelApi.getComments(reelId, { limit: 20 }),
      ]);

      if (reelResponse.success && reelResponse.data) {
        setReel(reelResponse.data);
        setIsLiked(reelResponse.data.isLiked || false);
        setIsSaved(reelResponse.data.isBookmarked || false);
        setLikesCount(reelResponse.data.stats.likes);
      } else {
        setError(reelResponse.error || 'Failed to load reel');
      }

      if (commentsResponse.success && commentsResponse.data) {
        setComments(commentsResponse.data.comments || []);
      }

      // Track view
      reelApi.trackView(reelId).catch(() => {});
    } catch (err: any) {
      console.error('[REEL DETAIL] Error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [reelId]);

  // Initial fetch
  useEffect(() => {
    fetchReelData();
  }, [fetchReelData]);

  const onRefresh = useCallback(() => {
    fetchReelData(true);
  }, [fetchReelData]);

  // Handle like toggle
  const handleLike = async () => {
    if (!reelId) return;

    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

    try {
      const response = await reelApi.toggleLike(reelId);
      if (response.success && response.data) {
        setLikesCount(response.data.likesCount);
      }
    } catch (err) {
      // Revert on error
      setIsLiked(!newLiked);
      setLikesCount(prev => newLiked ? prev - 1 : prev + 1);
    }
  };

  // Handle bookmark toggle
  const handleBookmark = async () => {
    if (!reelId) return;

    const newSaved = !isSaved;
    setIsSaved(newSaved);

    try {
      await reelApi.toggleBookmark(reelId);
    } catch (err) {
      setIsSaved(!newSaved);
    }
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!reelId || !comment.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await reelApi.addComment(reelId, comment.trim());

      if (response.success && response.data) {
        setComments(prev => [response.data!, ...prev]);
        setComment('');
      } else {
        Alert.alert('Error', response.error || 'Failed to add comment');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  // Loading state
  if (loading && !reel) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00C06A" />
            <Text style={styles.loadingText}>Loading reel...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  // Error state
  if (error && !reel) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchReelData()}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButtonAlt} onPress={() => router.back()}>
              <Text style={styles.backButtonAltText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!reel) return null;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Full Screen Video/Image */}
      <View style={styles.mediaContainer}>
        {reel.videoUrl ? (
          Platform.OS === 'web' ? (
            <video
              src={reel.videoUrl}
              poster={reel.thumbnailUrl}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' } as any}
            />
          ) : (
            <Video
              source={{ uri: reel.videoUrl }}
              posterSource={reel.thumbnailUrl ? { uri: reel.thumbnailUrl } : undefined}
              style={styles.mediaVideo}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted={false}
              useNativeControls={false}
            />
          )
        ) : (
          <Image source={{ uri: reel.thumbnailUrl }} style={styles.mediaImage} />
        )}

        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Right Actions */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLike}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={28}
              color={isLiked ? '#EF4444' : '#FFFFFF'}
            />
            <Text style={styles.actionText}>{likesCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={26} color="#FFFFFF" />
            <Text style={styles.actionText}>{reel.stats.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social-outline" size={26} color="#FFFFFF" />
            <Text style={styles.actionText}>{reel.stats.shares}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleBookmark}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={26}
              color={isSaved ? '#F59E0B' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>

        {/* Bottom Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.bottomGradient}
        >
          {/* User Info */}
          <View style={styles.userInfo}>
            {reel.creator.avatar ? (
              <Image source={{ uri: reel.creator.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitials}>
                  {reel.creator.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <View style={styles.userText}>
              <Text style={styles.userName}>{reel.creator.name}</Text>
              <Text style={styles.timestamp}>{new Date(reel.createdAt).toLocaleDateString()}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing && styles.followingButton,
              ]}
              onPress={() => setIsFollowing(!isFollowing)}
            >
              <Text
                style={[
                  styles.followText,
                  isFollowing && styles.followingText,
                ]}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Product & Store */}
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{reel.title}</Text>
            {reel.store && (
              <TouchableOpacity
                style={styles.storeButton}
                onPress={() => navigateTo(`/MainStorePage?id=${reel.store?.id}`)}
              >
                <Ionicons name="storefront" size={14} color="#FFFFFF" />
                <Text style={styles.storeName}>{reel.store.name}</Text>
                {reel.products && reel.products.length > 0 && (
                  <View style={styles.cashbackBadge}>
                    <Text style={styles.cashbackText}>
                      ₹{reel.products[0].price}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Description */}
          {reel.description && (
            <Text style={styles.description} numberOfLines={2}>
              {reel.description}
            </Text>
          )}

          {/* Tags */}
          {reel.tags && reel.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {reel.tags.map((tag, index) => (
              <Text key={index} style={styles.tag}>
                {tag.startsWith('#') ? tag : `#${tag}`}
              </Text>
            ))}
          </View>
          )}

          {/* Savings Badge / Store Action */}
          {reel.store && (
          <View style={styles.savingsContainer}>
            <LinearGradient
              colors={['#00C06A', '#10B981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.savingsBadge}
            >
              <Ionicons name="eye" size={16} color="#FFFFFF" />
              <Text style={styles.savingsText}>{reel.stats.views} Views</Text>
            </LinearGradient>
            <TouchableOpacity
              style={styles.visitStoreButton}
              onPress={() => navigateTo(`/MainStorePage?id=${reel.store?.id}`)}
            >
              <Text style={styles.visitStoreText}>Visit Store</Text>
              <Ionicons name="arrow-forward" size={16} color="#00C06A" />
            </TouchableOpacity>
          </View>
          )}
        </LinearGradient>
      </View>

      {/* Comments Section */}
      <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>

        <ScrollView
          style={styles.commentsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00C06A']} />
          }
        >
          {comments.length === 0 ? (
            <View style={styles.emptyComments}>
              <Ionicons name="chatbubble-outline" size={32} color="#9CA3AF" />
              <Text style={styles.emptyCommentsText}>No comments yet</Text>
              <Text style={styles.emptyCommentsSubtext}>Be the first to comment!</Text>
            </View>
          ) : (
            comments.map((item) => (
              <View key={item.id} style={styles.commentItem}>
                {item.userAvatar ? (
                  <Image source={{ uri: item.userAvatar }} style={styles.commentAvatar} />
                ) : (
                  <View style={[styles.commentAvatar, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="person" size={14} color="#9CA3AF" />
                  </View>
                )}
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentUser}>{item.userName}</Text>
                    <Text style={styles.commentTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.commentText}>{item.comment}</Text>
                  <View style={styles.commentActions}>
                    <TouchableOpacity style={styles.commentAction}>
                      <Ionicons name={item.isLiked ? 'heart' : 'heart-outline'} size={14} color={item.isLiked ? '#EF4444' : '#6B7280'} />
                      <Text style={styles.commentActionText}>{item.likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.commentAction}>
                      <Text style={styles.commentActionText}>Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Comment Input */}
        <View style={styles.commentInputContainer}>
          <View style={[styles.myAvatar, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="person" size={14} color="#9CA3AF" />
          </View>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor="#9CA3AF"
            value={comment}
            onChangeText={setComment}
            editable={!submittingComment}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!comment.trim() || submittingComment) && { opacity: 0.5 }]}
            onPress={handleAddComment}
            disabled={!comment.trim() || submittingComment}
          >
            {submittingComment ? (
              <ActivityIndicator size="small" color="#00C06A" />
            ) : (
              <Ionicons name="send" size={20} color="#00C06A" />
            )}
          </TouchableOpacity>
        </View>
      </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#00C06A',
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  backButtonAlt: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  backButtonAltText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  emptyComments: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCommentsText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emptyCommentsSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#9CA3AF',
  },
  mediaContainer: {
    height: height * 0.6,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  mediaVideo: {
    width: '100%',
    height: '100%',
  },
  topHeader: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActions: {
    position: 'absolute',
    right: 12,
    bottom: 180,
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 2,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 60,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    backgroundColor: '#00C06A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userText: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  followButton: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  followText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  followingText: {
    color: '#FFFFFF',
  },
  productInfo: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  storeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeName: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  cashbackBadge: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  cashbackText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    fontSize: 12,
    color: '#60A5FA',
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  visitStoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  visitStoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00C06A',
  },
  commentsSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2240',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentContent: {
    flex: 1,
    marginLeft: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentUser: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B2240',
  },
  commentTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  commentText: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 6,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    fontSize: 11,
    color: '#6B7280',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 10,
  },
  myAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 13,
    color: '#0B2240',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReelDetailPage;
