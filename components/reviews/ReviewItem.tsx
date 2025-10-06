import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import RatingStars from './RatingStars';
import { Review } from '@/types/review.types';
import reviewService from '@/services/reviewApi';

interface ReviewItemProps {
  review: Review;
  onHelpfulPress?: (reviewId: string, newHelpfulCount: number) => void;
  onReportPress?: (reviewId: string) => void;
  onEditPress?: (review: Review) => void;
  onDeletePress?: (reviewId: string) => void;
  showActions?: boolean;
  isOwnReview?: boolean;
}

export default function ReviewItem({
  review,
  onHelpfulPress,
  onReportPress,
  onEditPress,
  onDeletePress,
  showActions = true,
  isOwnReview = false
}: ReviewItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful || 0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get user info - handle different backend response formats
  const userName = review.user?.profile?.name || review.user?.name || 'Anonymous';
  const userAvatar = review.user?.profile?.avatar || review.user?.avatar;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  // Check if text should be truncated
  const shouldTruncate = review.comment.length > 200;
  const displayText = isExpanded || !shouldTruncate
    ? review.comment
    : `${review.comment.substring(0, 200)}...`;

  const handleHelpfulPress = async () => {
    if (isProcessing || isHelpful) return;

    setIsProcessing(true);
    try {
      const reviewId = review._id || review.id;
      if (!reviewId) {
        throw new Error('Review ID not found');
      }

      const response = await reviewService.markReviewHelpful(reviewId);

      if (response.success && response.data) {
        setIsHelpful(true);
        const newCount = response.data.helpful;
        setHelpfulCount(newCount);
        onHelpfulPress?.(reviewId, newCount);
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      Alert.alert('Error', 'Failed to mark review as helpful');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReportPress = () => {
    Alert.alert(
      'Report Review',
      'Why are you reporting this review?',
      [
        { text: 'Spam', onPress: () => reportReview('spam') },
        { text: 'Inappropriate', onPress: () => reportReview('inappropriate') },
        { text: 'Fake', onPress: () => reportReview('fake') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const reportReview = async (reason: string) => {
    try {
      const reviewId = review._id || review.id;
      if (!reviewId) return;

      await reviewService.reportReview(reviewId, reason);
      Alert.alert('Success', 'Review reported successfully');
      onReportPress?.(reviewId);
    } catch (error) {
      console.error('Error reporting review:', error);
      Alert.alert('Error', 'Failed to report review');
    }
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const reviewId = review._id || review.id;
            if (reviewId) {
              onDeletePress?.(reviewId);
            }
          }
        }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* User Info */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <ThemedText style={styles.avatarText}>
                  {userName.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.userName}>{userName}</ThemedText>
              {review.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <ThemedText style={styles.verifiedText}>Verified</ThemedText>
                </View>
              )}
            </View>

            <View style={styles.ratingRow}>
              <RatingStars rating={review.rating} size={14} />
              <ThemedText style={styles.date}>{formatDate(review.createdAt)}</ThemedText>
            </View>
          </View>
        </View>

        {/* Action Menu for own reviews */}
        {isOwnReview && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onEditPress?.(review)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={20} color="#8B5CF6" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleDeletePress}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Review Title */}
      {review.title && (
        <ThemedText style={styles.title}>{review.title}</ThemedText>
      )}

      {/* Review Comment */}
      <ThemedText style={styles.comment}>{displayText}</ThemedText>

      {/* Read More/Less Button */}
      {shouldTruncate && (
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.readMore}>
            {isExpanded ? 'Read Less' : 'Read More'}
          </ThemedText>
        </TouchableOpacity>
      )}

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesContainer}
          contentContainerStyle={styles.imagesContent}
        >
          {review.images.map((imageUrl, index) => (
            <TouchableOpacity key={index} activeOpacity={0.8}>
              <Image source={{ uri: imageUrl }} style={styles.reviewImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Actions */}
      {showActions && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, isHelpful && styles.actionButtonActive]}
            onPress={handleHelpfulPress}
            disabled={isProcessing || isHelpful}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isHelpful ? 'thumbs-up' : 'thumbs-up-outline'}
              size={16}
              color={isHelpful ? '#8B5CF6' : '#6B7280'}
            />
            <ThemedText style={[styles.actionText, isHelpful && styles.actionTextActive]}>
              Helpful ({helpfulCount})
            </ThemedText>
          </TouchableOpacity>

          {!isOwnReview && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleReportPress}
              activeOpacity={0.7}
            >
              <Ionicons name="flag-outline" size={16} color="#6B7280" />
              <ThemedText style={styles.actionText}>Report</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 8,
  },
  readMore: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
    marginBottom: 12,
  },
  imagesContainer: {
    marginBottom: 12,
  },
  imagesContent: {
    gap: 8,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  actionButtonActive: {
    backgroundColor: '#EEF2FF',
  },
  actionText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#8B5CF6',
  },
});
