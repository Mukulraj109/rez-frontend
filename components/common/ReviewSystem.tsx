// Review and Rating System Component
// Comprehensive review system for products and stores with star ratings

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  RefreshControl,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import FileUploader from './FileUploader';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  createdAt: string;
  updatedAt?: string;
  helpfulCount: number;
  isHelpful: boolean;
  isVerifiedPurchase: boolean;
  canEdit: boolean;
  canDelete: boolean;
  response?: {
    id: string;
    content: string;
    author: string;
    createdAt: string;
  };
}

export interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ReviewSystemProps {
  entityId: string;
  entityType: 'product' | 'store';
  reviews: Review[];
  reviewSummary: ReviewSummary;
  onAddReview: (review: Omit<Review, 'id' | 'createdAt' | 'helpfulCount' | 'isHelpful' | 'canEdit' | 'canDelete'>) => Promise<void>;
  onEditReview: (reviewId: string, review: Partial<Review>) => Promise<void>;
  onDeleteReview: (reviewId: string) => Promise<void>;
  onMarkHelpful: (reviewId: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
  currentUserId?: string;
  canAddReview?: boolean;
  isLoading?: boolean;
  style?: any;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
type FilterOption = 'all' | '5' | '4' | '3' | '2' | '1' | 'verified';

export default function ReviewSystem({
  entityId,
  entityType,
  reviews,
  reviewSummary,
  onAddReview,
  onEditReview,
  onDeleteReview,
  onMarkHelpful,
  onRefresh,
  currentUserId,
  canAddReview = true,
  isLoading = false,
  style,
}: ReviewSystemProps) {
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  
  // New review form state
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    content: '',
    images: [] as string[],
  });

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Error refreshing reviews:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmitReview = async () => {
    if (newReview.rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating for your review.');
      return;
    }
    
    if (!newReview.content.trim()) {
      Alert.alert('Review Required', 'Please write a review.');
      return;
    }

    try {
      await onAddReview({
        userId: currentUserId || 'current-user',
        userName: 'You',
        rating: newReview.rating,
        title: newReview.title.trim() || `${newReview.rating} star review`,
        content: newReview.content.trim(),
        images: newReview.images,
        isVerifiedPurchase: true, // Mock - in real app, check purchase history
      });

      // Reset form
      setNewReview({ rating: 0, title: '', content: '', images: [] });
      setIsWritingReview(false);
      Alert.alert('Success', 'Your review has been posted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to post review. Please try again.');
    }
  };

  const handleImageUpload = (urls: { url: string }[]) => {
    setNewReview(prev => ({
      ...prev,
      images: [...prev.images, ...urls.map(u => u.url)],
    }));
  };

  const removeImage = (index: number) => {
    setNewReview(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const getSortedAndFilteredReviews = () => {
    let filteredReviews = reviews;

    // Apply filter
    if (filterBy !== 'all') {
      if (filterBy === 'verified') {
        filteredReviews = reviews.filter(r => r.isVerifiedPurchase);
      } else {
        const rating = parseInt(filterBy);
        filteredReviews = reviews.filter(r => r.rating === rating);
      }
    }

    // Apply sort
    return filteredReviews.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpfulCount - a.helpfulCount;
        default:
          return 0;
      }
    });
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderStars = (rating: number, size: number = 16, interactive: boolean = false, onPress?: (rating: number) => void) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => interactive && onPress?.(star)}
          disabled={!interactive}
          style={interactive ? styles.interactiveStar : undefined}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? '#FFD700' : '#D1D5DB'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderRatingBreakdown = () => (
    <View style={styles.ratingBreakdown}>
      <View style={styles.overallRating}>
        <ThemedText style={styles.ratingNumber}>
          {reviewSummary.averageRating.toFixed(1)}
        </ThemedText>
        {renderStars(Math.round(reviewSummary.averageRating), 24)}
        <ThemedText style={styles.totalReviews}>
          {reviewSummary.totalReviews} review{reviewSummary.totalReviews !== 1 ? 's' : ''}
        </ThemedText>
      </View>

      <View style={styles.ratingBars}>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = reviewSummary.ratingBreakdown[rating as keyof typeof reviewSummary.ratingBreakdown];
          const percentage = reviewSummary.totalReviews > 0 ? (count / reviewSummary.totalReviews) * 100 : 0;
          
          return (
            <TouchableOpacity
              key={rating}
              style={styles.ratingBar}
              onPress={() => setFilterBy(rating.toString() as FilterOption)}
            >
              <ThemedText style={styles.ratingLabel}>{rating}</ThemedText>
              <Ionicons name="star" size={12} color="#FFD700" />
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${percentage}%` }]} />
              </View>
              <ThemedText style={styles.ratingCount}>{count}</ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderReview = ({ item: review }: { item: Review }) => (
    <View style={styles.reviewContainer}>
      {/* Review Header */}
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          {review.userAvatar ? (
            <Image source={{ uri: review.userAvatar }} style={styles.userAvatar} />
          ) : (
            <View style={styles.userAvatarPlaceholder}>
              <ThemedText style={styles.userAvatarText}>
                {review.userName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}
          
          <View style={styles.userDetails}>
            <View style={styles.userNameRow}>
              <ThemedText style={styles.userName}>{review.userName}</ThemedText>
              {review.isVerifiedPurchase && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                  <ThemedText style={styles.verifiedText}>Verified</ThemedText>
                </View>
              )}
            </View>
            
            <View style={styles.reviewMeta}>
              {renderStars(review.rating, 14)}
              <ThemedText style={styles.reviewDate}>{formatTimeAgo(review.createdAt)}</ThemedText>
            </View>
          </View>
        </View>

        {/* Review Actions */}
        <View style={styles.reviewActions}>
          {review.canEdit && (
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="create-outline" size={16} color="#666" />
            </TouchableOpacity>
          )}
          {review.canDelete && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                Alert.alert(
                  'Delete Review',
                  'Are you sure you want to delete this review?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => onDeleteReview(review.id) },
                  ]
                );
              }}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Review Content */}
      <View style={styles.reviewContent}>
        {review.title && (
          <ThemedText style={styles.reviewTitle}>{review.title}</ThemedText>
        )}
        <ThemedText style={styles.reviewText}>{review.content}</ThemedText>

        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <View style={styles.reviewImages}>
            {review.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
            ))}
          </View>
        )}

        {/* Store/Business Response */}
        {review.response && (
          <View style={styles.businessResponse}>
            <View style={styles.responseHeader}>
              <Ionicons name="business" size={16} color="#8B5CF6" />
              <ThemedText style={styles.responseAuthor}>{review.response.author}</ThemedText>
              <ThemedText style={styles.responseDate}>
                {formatTimeAgo(review.response.createdAt)}
              </ThemedText>
            </View>
            <ThemedText style={styles.responseText}>{review.response.content}</ThemedText>
          </View>
        )}

        {/* Helpful Button */}
        <TouchableOpacity
          style={styles.helpfulButton}
          onPress={() => onMarkHelpful(review.id)}
        >
          <Ionicons 
            name={review.isHelpful ? 'thumbs-up' : 'thumbs-up-outline'} 
            size={16} 
            color={review.isHelpful ? '#8B5CF6' : '#666'} 
          />
          <ThemedText style={[
            styles.helpfulText,
            review.isHelpful && styles.helpfulTextActive
          ]}>
            Helpful ({review.helpfulCount})
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNewReviewForm = () => (
    <View style={styles.newReviewForm}>
      <View style={styles.formHeader}>
        <ThemedText style={styles.formTitle}>Write a Review</ThemedText>
        <TouchableOpacity onPress={() => setIsWritingReview(false)}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Rating Selection */}
      <View style={styles.ratingSection}>
        <ThemedText style={styles.sectionLabel}>Your Rating *</ThemedText>
        {renderStars(newReview.rating, 32, true, (rating) => 
          setNewReview(prev => ({ ...prev, rating }))
        )}
        <ThemedText style={styles.ratingDescription}>
          {newReview.rating === 0 && 'Tap to rate'}
          {newReview.rating === 1 && 'Poor'}
          {newReview.rating === 2 && 'Fair'}
          {newReview.rating === 3 && 'Good'}
          {newReview.rating === 4 && 'Very Good'}
          {newReview.rating === 5 && 'Excellent'}
        </ThemedText>
      </View>

      {/* Review Title */}
      <View style={styles.inputSection}>
        <ThemedText style={styles.sectionLabel}>Review Title (Optional)</ThemedText>
        <TextInput
          style={styles.titleInput}
          value={newReview.title}
          onChangeText={(text) => setNewReview(prev => ({ ...prev, title: text }))}
          placeholder="Summarize your experience"
          maxLength={100}
        />
      </View>

      {/* Review Content */}
      <View style={styles.inputSection}>
        <ThemedText style={styles.sectionLabel}>Your Review *</ThemedText>
        <TextInput
          style={styles.contentInput}
          value={newReview.content}
          onChangeText={(text) => setNewReview(prev => ({ ...prev, content: text }))}
          placeholder={`Tell others about your experience with this ${entityType}`}
          multiline
          numberOfLines={4}
          maxLength={1000}
        />
        <ThemedText style={styles.characterCount}>
          {newReview.content.length}/1000
        </ThemedText>
      </View>

      {/* Photo Upload */}
      <View style={styles.inputSection}>
        <ThemedText style={styles.sectionLabel}>Add Photos (Optional)</ThemedText>
        <FileUploader
          uploadType="review"
          maxFiles={5}
          maxSizeMB={5}
          allowedTypes={['image']}
          onUploadComplete={handleImageUpload}
          placeholder="Add photos to your review"
          style={styles.photoUploader}
        />
        
        {newReview.images.length > 0 && (
          <View style={styles.uploadedImages}>
            {newReview.images.map((image, index) => (
              <View key={index} style={styles.uploadedImageContainer}>
                <Image source={{ uri: image }} style={styles.uploadedImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (newReview.rating === 0 || !newReview.content.trim()) && styles.submitButtonDisabled
        ]}
        onPress={handleSubmitReview}
        disabled={newReview.rating === 0 || !newReview.content.trim()}
      >
        <ThemedText style={styles.submitButtonText}>Post Review</ThemedText>
      </TouchableOpacity>
    </View>
  );

  const sortOptions = [
    { key: 'newest' as SortOption, label: 'Newest First' },
    { key: 'oldest' as SortOption, label: 'Oldest First' },
    { key: 'highest' as SortOption, label: 'Highest Rated' },
    { key: 'lowest' as SortOption, label: 'Lowest Rated' },
    { key: 'helpful' as SortOption, label: 'Most Helpful' },
  ];

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSortModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sortModal}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Sort Reviews</ThemedText>
            <TouchableOpacity onPress={() => setShowSortModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortOption,
                sortBy === option.key && styles.sortOptionSelected
              ]}
              onPress={() => {
                setSortBy(option.key);
                setShowSortModal(false);
              }}
            >
              <ThemedText style={[
                styles.sortOptionText,
                sortBy === option.key && styles.sortOptionTextSelected
              ]}>
                {option.label}
              </ThemedText>
              {sortBy === option.key && (
                <Ionicons name="checkmark" size={20} color="#8B5CF6" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Rating Summary */}
      <View style={styles.summarySection}>
        {renderRatingBreakdown()}
      </View>

      {/* Controls */}
      <View style={styles.controlsSection}>
        {canAddReview && (
          <TouchableOpacity
            style={styles.writeReviewButton}
            onPress={() => setIsWritingReview(true)}
          >
            <Ionicons name="create" size={20} color="#8B5CF6" />
            <ThemedText style={styles.writeReviewText}>Write a Review</ThemedText>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <Ionicons name="funnel" size={16} color="#666" />
          <ThemedText style={styles.sortButtonText}>Sort</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      <FlatList
        data={getSortedAndFilteredReviews()}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#8B5CF6"
            />
          ) : undefined
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={64} color="#D1D5DB" />
              <ThemedText style={styles.emptyTitle}>No Reviews Yet</ThemedText>
              <ThemedText style={styles.emptyText}>
                Be the first to share your experience!
              </ThemedText>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Loading */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      )}

      {/* New Review Modal */}
      <Modal
        visible={isWritingReview}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {renderNewReviewForm()}
      </Modal>

      {/* Sort Modal */}
      {renderSortModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Rating Summary
  summarySection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  ratingBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overallRating: {
    alignItems: 'center',
    marginRight: 32,
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  interactiveStar: {
    padding: 4,
  },
  totalReviews: {
    fontSize: 12,
    color: '#666',
  },
  ratingBars: {
    flex: 1,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666',
    width: 12,
    marginRight: 4,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
    width: 20,
    textAlign: 'right',
  },
  
  // Controls
  controlsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F7FF',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  writeReviewText: {
    color: '#8B5CF6',
    fontWeight: '600',
    marginLeft: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sortButtonText: {
    color: '#666',
    marginLeft: 6,
  },
  
  // Reviews List
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Review Items
  reviewContainer: {
    backgroundColor: 'white',
    marginBottom: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 10,
    color: '#22C55E',
    fontWeight: '600',
    marginLeft: 2,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  reviewActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  
  // Review Content
  reviewContent: {
    marginLeft: 52, // Align with user details
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  businessResponse: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  responseAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 6,
    marginRight: 8,
  },
  responseDate: {
    fontSize: 11,
    color: '#666',
  },
  responseText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
  },
  helpfulText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  helpfulTextActive: {
    color: '#8B5CF6',
  },
  
  // New Review Form
  newReviewForm: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  
  // Form Sections
  ratingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  ratingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  inputSection: {
    marginBottom: 24,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  photoUploader: {
    marginTop: 8,
  },
  uploadedImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  uploadedImageContainer: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  uploadedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Sort Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sortModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sortOptionSelected: {
    backgroundColor: '#F8F7FF',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
  },
  sortOptionTextSelected: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
});