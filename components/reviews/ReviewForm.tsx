import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import RatingStars from './RatingStars';
import { CreateReviewData, Review } from '@/types/review.types';
import reviewService from '@/services/reviewApi';

interface ReviewFormProps {
  storeId: string;
  existingReview?: Review;
  onSubmit?: (review: Review) => void;
  onCancel?: () => void;
  isEdit?: boolean;
}

export default function ReviewForm({
  storeId,
  existingReview,
  onSubmit,
  onCancel,
  isEdit = false
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [images, setImages] = useState<string[]>(existingReview?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!comment.trim()) {
      newErrors.comment = 'Review comment is required';
    } else if (comment.trim().length < 10) {
      newErrors.comment = 'Review must be at least 10 characters';
    } else if (comment.trim().length > 1000) {
      newErrors.comment = 'Review must not exceed 1000 characters';
    }

    if (title.length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData: CreateReviewData = {
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        images: images.length > 0 ? images : undefined,
      };

      let response;

      if (isEdit && existingReview) {
        // Update existing review
        const reviewId = existingReview._id || existingReview.id;
        if (!reviewId) {
          throw new Error('Review ID not found');
        }
        response = await reviewService.updateReview(reviewId, reviewData);
      } else {
        // Create new review
        response = await reviewService.createReview(storeId, reviewData);
      }

      if (response.success && response.data?.review) {
        Alert.alert(
          'Success',
          isEdit ? 'Review updated successfully!' : 'Review submitted successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                onSubmit?.(response.data!.review);
              }
            }
          ]
        );
      } else {
        throw new Error(response.error || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to submit review. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageAdd = () => {
    // TODO: Implement image picker
    Alert.alert(
      'Add Images',
      'Image upload functionality will be implemented soon',
      [{ text: 'OK' }]
    );
  };

  const handleImageRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>
            {isEdit ? 'Edit Your Review' : 'Write a Review'}
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Share your experience with this store
          </ThemedText>
        </View>

        {/* Rating Selector */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>
            Rating <ThemedText style={styles.required}>*</ThemedText>
          </ThemedText>
          <View style={styles.ratingSelector}>
            <RatingStars
              rating={rating}
              interactive={true}
              onRatingChange={setRating}
              size={32}
            />
            <ThemedText style={styles.ratingText}>
              {rating === 0 ? 'Tap to rate' : `${rating} out of 5 stars`}
            </ThemedText>
          </View>
          {errors.rating && (
            <ThemedText style={styles.errorText}>{errors.rating}</ThemedText>
          )}
        </View>

        {/* Title Input (Optional) */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>
            Review Title (Optional)
          </ThemedText>
          <TextInput
            style={styles.titleInput}
            placeholder="Summarize your experience"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <ThemedText style={styles.charCount}>
            {title.length}/100
          </ThemedText>
          {errors.title && (
            <ThemedText style={styles.errorText}>{errors.title}</ThemedText>
          )}
        </View>

        {/* Comment Input */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>
            Your Review <ThemedText style={styles.required}>*</ThemedText>
          </ThemedText>
          <TextInput
            style={styles.commentInput}
            placeholder="Tell us about your experience (minimum 10 characters)"
            placeholderTextColor="#9CA3AF"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={1000}
          />
          <ThemedText style={styles.charCount}>
            {comment.length}/1000
          </ThemedText>
          {errors.comment && (
            <ThemedText style={styles.errorText}>{errors.comment}</ThemedText>
          )}
        </View>

        {/* Images */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>
            Add Photos (Optional)
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesContainer}
          >
            {/* Existing Images */}
            {images.map((imageUrl, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: imageUrl }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleImageRemove(index)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Image Button */}
            {images.length < 5 && (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handleImageAdd}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={32} color="#8B5CF6" />
                <ThemedText style={styles.addImageText}>Add Photo</ThemedText>
              </TouchableOpacity>
            )}
          </ScrollView>
          <ThemedText style={styles.helperText}>
            You can add up to 5 photos
          </ThemedText>
        </View>

        {/* Guidelines */}
        <View style={styles.guidelinesContainer}>
          <ThemedText style={styles.guidelinesTitle}>Review Guidelines:</ThemedText>
          <ThemedText style={styles.guidelineText}>
            " Be honest and provide constructive feedback
          </ThemedText>
          <ThemedText style={styles.guidelineText}>
            " Focus on your experience with products and service
          </ThemedText>
          <ThemedText style={styles.guidelineText}>
            " Avoid offensive language or personal attacks
          </ThemedText>
          <ThemedText style={styles.guidelineText}>
            " Do not include personal information
          </ThemedText>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.submitButtonText}>
              {isEdit ? 'Update Review' : 'Submit Review'}
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  ratingSelector: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  titleInput: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  commentInput: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 150,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  imagesContainer: {
    gap: 12,
    paddingVertical: 8,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addImageText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  guidelinesContainer: {
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  guidelinesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 4,
  },
  guidelineText: {
    fontSize: 12,
    color: '#6366F1',
    lineHeight: 18,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
