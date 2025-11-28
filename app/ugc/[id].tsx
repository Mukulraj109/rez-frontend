// UGC (User Generated Content) Detail Page
// View individual UGC post with comments and interactions

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import CommentSystem, { Comment } from '@/components/common/CommentSystem';

const { width: screenWidth } = Dimensions.get('window');

interface UGCPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  thumbnailUrl?: string;
  likesCount: number;
  isLiked: boolean;
  viewsCount: number;
  createdAt: string;
  tags: string[];
  location?: string;
  productInfo?: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

export default function UGCDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [post, setPost] = useState<UGCPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUGCPost(id as string);
  }, [id]);

  const loadUGCPost = async (postId: string) => {
    try {
      // Mock data - in real app, this would fetch from API
      const mockPost: UGCPost = {
        id: postId,
        userId: 'user123',
        userName: 'Alex Thompson',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        content: 'Just got my new wireless headphones! The sound quality is incredible and the noise cancellation is perfect for my daily commute. Highly recommend! 🎧✨ #AudioTech #WirelessHeadphones #TechReview',
        mediaUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        mediaType: 'image',
        likesCount: 247,
        isLiked: false,
        viewsCount: 1530,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        tags: ['AudioTech', 'WirelessHeadphones', 'TechReview'],
        location: 'Bangalore, India',
        productInfo: {
          id: 'p1',
          name: 'Premium Wireless Headphones',
          price: 2999,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
        },
      };

      setPost(mockPost);

      // Mock comments
      const mockComments: Comment[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'Emma Wilson',
          userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b95d6667?w=150',
          content: 'Great review! I\'ve been looking for good headphones. How\'s the battery life?',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likesCount: 8,
          isLiked: false,
          canEdit: false,
          canDelete: false,
          replies: [
            {
              id: '2',
              userId: 'user123',
              userName: 'Alex Thompson',
              content: '@Emma The battery lasts about 25-30 hours with ANC on. Super impressive!',
              createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              likesCount: 3,
              isLiked: false,
              canEdit: true,
              canDelete: true,
              parentId: '1',
            }
          ]
        },
        {
          id: '3',
          userId: 'user2',
          userName: 'Mike Chen',
          content: 'I have the same ones! They\'re amazing for working out too. 💪',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          likesCount: 5,
          isLiked: true,
          canEdit: false,
          canDelete: false,
        },
      ];

      setComments(mockComments);
    } catch (error) {
      console.error('Error loading UGC post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleLikePost = () => {
    if (!post) return;
    
    setPost(prev => prev ? {
      ...prev,
      isLiked: !prev.isLiked,
      likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
    } : null);
  };

  const handleUserPress = () => {
    router.push('/profile' as any);
  };

  const handleProductPress = () => {
    if (post?.productInfo) {
      // Navigate to ProductPage (comprehensive product page)
      router.push({
        pathname: '/ProductPage',
        params: {
          cardId: post.productInfo.id,
          cardType: 'product',
        }
      } as any);
    }
  };

  // Comment handlers
  const handleAddComment = async (content: string, parentId?: string): Promise<void> => {
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'You',
      content,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLiked: false,
      canEdit: true,
      canDelete: true,
      parentId,
    };

    if (parentId) {
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), newComment] }
          : comment
      ));
    } else {
      setComments(prev => [newComment, ...prev]);
    }
  };

  const handleEditComment = async (commentId: string, content: string): Promise<void> => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, content, updatedAt: new Date().toISOString() }
        : {
            ...comment,
            replies: comment.replies?.map(reply => 
              reply.id === commentId 
                ? { ...reply, content, updatedAt: new Date().toISOString() }
                : reply
            )
          }
    ));
  };

  const handleDeleteComment = async (commentId: string): Promise<void> => {
    setComments(prev => prev.filter(comment => {
      if (comment.id === commentId) return false;
      if (comment.replies) {
        comment.replies = comment.replies.filter(reply => reply.id !== commentId);
      }
      return true;
    }));
  };

  const handleLikeComment = async (commentId: string): Promise<void> => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likesCount: comment.isLiked ? comment.likesCount - 1 : comment.likesCount + 1,
        };
      }
      if (comment.replies) {
        comment.replies = comment.replies.map(reply => 
          reply.id === commentId 
            ? {
                ...reply,
                isLiked: !reply.isLiked,
                likesCount: reply.isLiked ? reply.likesCount - 1 : reply.likesCount + 1,
              }
            : reply
        );
      }
      return comment;
    }));
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading post...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#666" />
          <ThemedText style={styles.errorTitle}>Post Not Found</ThemedText>
          <ThemedText style={styles.errorText}>
            The post you're looking for could not be found.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <ThemedText style={styles.headerTitle}>Post</ThemedText>
        
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <TouchableOpacity style={styles.userSection} onPress={handleUserPress}>
          <View style={styles.userInfo}>
            {post.userAvatar ? (
              <Image source={{ uri: post.userAvatar }} style={styles.userAvatar} />
            ) : (
              <View style={styles.userAvatarPlaceholder}>
                <ThemedText style={styles.userAvatarText}>
                  {post.userName.charAt(0)}
                </ThemedText>
              </View>
            )}
            
            <View style={styles.userDetails}>
              <ThemedText style={styles.userName}>{post.userName}</ThemedText>
              <View style={styles.postMeta}>
                <ThemedText style={styles.postTime}>{formatTimeAgo(post.createdAt)}</ThemedText>
                {post.location && (
                  <>
                    <ThemedText style={styles.metaSeparator}>•</ThemedText>
                    <Ionicons name="location" size={12} color="#666" />
                    <ThemedText style={styles.location}>{post.location}</ThemedText>
                  </>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Post Content */}
        <View style={styles.postContent}>
          <ThemedText style={styles.postText}>{post.content}</ThemedText>
        </View>

        {/* Media */}
        <View style={styles.mediaContainer}>
          {post.mediaType === 'image' ? (
            <Image
              source={{ uri: post.mediaUrl }}
              style={styles.mediaImage}
              resizeMode="cover"
            />
          ) : (
            <Video
              source={{ uri: post.mediaUrl }}
              style={styles.mediaVideo}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isLooping
              useNativeControls
            />
          )}
        </View>

        {/* Post Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statItem} onPress={handleLikePost}>
            <Ionicons 
              name={post.isLiked ? 'heart' : 'heart-outline'} 
              size={20} 
              color={post.isLiked ? '#EF4444' : '#666'} 
            />
            <ThemedText style={[styles.statText, post.isLiked && styles.likedText]}>
              {post.likesCount}
            </ThemedText>
          </TouchableOpacity>
          
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={20} color="#666" />
            <ThemedText style={styles.statText}>{post.viewsCount}</ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={20} color="#666" />
            <ThemedText style={styles.statText}>{comments.length}</ThemedText>
          </View>
        </View>

        {/* Product Info */}
        {post.productInfo && (
          <TouchableOpacity style={styles.productCard} onPress={handleProductPress}>
            <Image
              source={{ uri: post.productInfo.image }}
              style={styles.productImage}
            />
            <View style={styles.productDetails}>
              <ThemedText style={styles.productName} numberOfLines={2}>
                {post.productInfo.name}
              </ThemedText>
              <ThemedText style={styles.productPrice}>
                ₹{post.productInfo.price.toLocaleString()}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.map((tag, index) => (
              <TouchableOpacity key={index} style={styles.tag}>
                <ThemedText style={styles.tagText}>#{tag}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Comments */}
        <View style={styles.commentsContainer}>
          <CommentSystem
            entityId={post.id}
            entityType="ugc"
            comments={comments}
            onAddComment={handleAddComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            onLikeComment={handleLikeComment}
            placeholder="Share your thoughts on this post..."
            maxLength={500}
            allowReplies={true}
            currentUserId="current-user"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  userSection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postTime: {
    fontSize: 13,
    color: '#666',
  },
  metaSeparator: {
    fontSize: 13,
    color: '#666',
    marginHorizontal: 6,
  },
  location: {
    fontSize: 13,
    color: '#666',
    marginLeft: 2,
  },
  postContent: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  postText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  mediaContainer: {
    backgroundColor: 'white',
  },
  mediaImage: {
    width: screenWidth,
    height: screenWidth,
    backgroundColor: '#F3F4F6',
  },
  mediaVideo: {
    width: screenWidth,
    height: screenWidth,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  likedText: {
    color: '#EF4444',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  commentsContainer: {
    backgroundColor: 'white',
    minHeight: 400,
  },
});