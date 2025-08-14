import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import StarRating from '@/components/StarRating';
import { Ionicons } from '@expo/vector-icons';
import { ReviewCardProps } from '@/types/reviews';

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onLike,
  onReport,
  onHelpful,
  showStoreResponse = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const handleLike = () => {
    if (onLike) onLike(review.id);
  };

  const handleHelpful = () => {
    if (onHelpful) onHelpful(review.id);
  };

  const handleReport = () => {
    if (onReport) onReport(review.id);
  };

  return (
    <View style={styles.container}>
      {/* User Info Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: review.userAvatar }}
            style={styles.avatar}
            onError={() => setImageError(true)}
          />
          {imageError && (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Ionicons name="person" size={20} color="#9CA3AF" />
            </View>
          )}
          
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.userName}>{review.userName}</ThemedText>
              {review.isVerified && (
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              )}
            </View>
            <ThemedText style={styles.reviewDate}>{formatDate(review.date)}</ThemedText>
          </View>
        </View>
        
        {/* Rating */}
        <View style={styles.ratingContainer}>
          <StarRating rating={review.rating} size="small" />
        </View>
      </View>

      {/* Review Text */}
      <View style={styles.reviewContent}>
        <ThemedText style={styles.reviewText}>{review.reviewText}</ThemedText>
      </View>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesContainer}
          contentContainerStyle={styles.imagesContent}
        >
          {review.images.map((img) => (
            <Image
              key={img.id}
              source={{ uri: img.uri }}
              style={styles.reviewImage}
            />
          ))}
        </ScrollView>
      )}

      {/* Store Response */}
      {showStoreResponse && review.storeResponse && (
        <View style={styles.storeResponse}>
          <View style={styles.storeResponseHeader}>
            <Ionicons name="storefront" size={16} color="#7C3AED" />
            <ThemedText style={styles.storeResponseTitle}>
              Response from {review.storeResponse.responderName}
            </ThemedText>
            <ThemedText style={styles.storeResponseDate}>
              {formatDate(review.storeResponse.date)}
            </ThemedText>
          </View>
          <ThemedText style={styles.storeResponseText}>
            {review.storeResponse.responseText}
          </ThemedText>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons
            name={review.isLiked ? "thumbs-up" : "thumbs-up-outline"}
            size={16}
            color={review.isLiked ? "#7C3AED" : "#6B7280"}
          />
          <ThemedText style={[
            styles.actionText,
            review.isLiked && styles.actionTextActive
          ]}>
            {review.likes}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleHelpful}>
          <Ionicons
            name={review.isHelpful ? "heart" : "heart-outline"}
            size={16}
            color={review.isHelpful ? "#EF4444" : "#6B7280"}
          />
          <ThemedText style={[
            styles.actionText,
            review.isHelpful && { color: "#EF4444" }
          ]}>
            Helpful ({review.helpfulCount || 0})
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleReport}>
          <Ionicons name="flag-outline" size={16} color="#6B7280" />
          <ThemedText style={styles.actionText}>Report</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarFallback: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  reviewContent: {
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  imagesContainer: {
    marginBottom: 12,
  },
  imagesContent: {
    gap: 8,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  storeResponse: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#7C3AED',
  },
  storeResponseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  storeResponseTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C3AED',
    flex: 1,
  },
  storeResponseDate: {
    fontSize: 11,
    color: '#6B7280',
  },
  storeResponseText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#374151',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
});

export default ReviewCard;