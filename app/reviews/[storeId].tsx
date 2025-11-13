// Reviews Page - Standalone store reviews page
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import reviewsApi from '@/services/reviewsApi';

interface Review {
  _id: string;
  userId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  helpful: number;
  verified: boolean;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function ReviewsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const storeId = params.storeId as string;

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');

  // Fetch reviews
  const fetchReviews = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch reviews from API
      const response = await reviewsApi.getTargetReviews('store', storeId, {
        limit: 50,
        page: 1,
      });

      if (response.success && response.data) {
        setReviews(response.data.reviews || []);
        setStats(response.data.stats || null);

        // Get store name from first review or params
        if (response.data.reviews?.[0]) {
          setStoreName('Store Reviews'); // You can fetch store details separately if needed
        }
      } else {
        setError(response.error || 'Failed to load reviews');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reviews';
      setError(errorMessage);
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (storeId) {
      fetchReviews();
    }
  }, [storeId, fetchReviews]);

  // Filter and sort reviews
  const filteredAndSortedReviews = reviews
    .filter(review => filterRating === null || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'helpful':
          return b.helpful - a.helpful;
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Render rating stars
  const renderStars = (rating: number, size: number = 16) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? '#F59E0B' : '#D1D5DB'}
          />
        ))}
      </View>
    );
  };

  // Render review card
  const renderReview = (review: Review) => {
    const userName = `${review.userId.profile.firstName} ${review.userId.profile.lastName}`;
    const reviewDate = new Date(review.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return (
      <View key={review._id} style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.userInfo}>
            {review.userId.profile.avatar ? (
              <Image source={{ uri: review.userId.profile.avatar }} style={styles.userAvatar} />
            ) : (
              <View style={[styles.userAvatar, styles.userAvatarPlaceholder]}>
                <ThemedText style={styles.userAvatarText}>
                  {review.userId.profile.firstName[0]}{review.userId.profile.lastName[0]}
                </ThemedText>
              </View>
            )}
            <View style={styles.userDetails}>
              <View style={styles.userNameRow}>
                <ThemedText style={styles.userName}>{userName}</ThemedText>
                {review.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                    <ThemedText style={styles.verifiedText}>Verified</ThemedText>
                  </View>
                )}
              </View>
              <ThemedText style={styles.reviewDate}>{reviewDate}</ThemedText>
            </View>
          </View>
          {renderStars(review.rating, 18)}
        </View>

        <ThemedText style={styles.reviewComment}>{review.comment}</ThemedText>

        {review.images && review.images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.reviewImages}
          >
            {review.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
            ))}
          </ScrollView>
        )}

        <View style={styles.reviewFooter}>
          <TouchableOpacity style={styles.helpfulButton}>
            <Ionicons name="thumbs-up-outline" size={16} color="#6B7280" />
            <ThemedText style={styles.helpfulText}>Helpful ({review.helpful})</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.gradientHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.gradientHeaderTitle}>Reviews</ThemedText>
            <View style={{ width: 40 }} />
          </LinearGradient>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <ThemedText style={styles.loadingText}>Loading reviews...</ThemedText>
          </View>
        </View>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.gradientHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.gradientHeaderTitle}>Reviews</ThemedText>
            <View style={{ width: 40 }} />
          </LinearGradient>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={80} color="#EF4444" />
            <ThemedText style={styles.errorTitle}>Oops!</ThemedText>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchReviews()}>
              <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Gradient Header */}
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.gradientHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <ThemedText style={styles.gradientHeaderTitle}>Reviews</ThemedText>
          <TouchableOpacity style={styles.headerRefresh} onPress={() => fetchReviews(true)}>
            <Ionicons name="refresh" size={22} color="white" />
          </TouchableOpacity>
        </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchReviews(true)} tintColor="#7C3AED" />
        }
      >
        {/* Rating Summary */}
        {stats && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryLeft}>
              <ThemedText style={styles.averageRating}>{stats.averageRating.toFixed(1)}</ThemedText>
              {renderStars(Math.round(stats.averageRating), 20)}
              <ThemedText style={styles.totalReviews}>
                {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
              </ThemedText>
            </View>
            <View style={styles.summaryRight}>
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

                return (
                  <View key={rating} style={styles.ratingRow}>
                    <ThemedText style={styles.ratingLabel}>{rating}</ThemedText>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <View style={styles.ratingBar}>
                      <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
                    </View>
                    <ThemedText style={styles.ratingCount}>{count}</ThemedText>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Filter and Sort */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterChip, filterRating === null && styles.filterChipActive]}
              onPress={() => setFilterRating(null)}
            >
              <ThemedText style={[styles.filterText, filterRating === null && styles.filterTextActive]}>
                All
              </ThemedText>
            </TouchableOpacity>
            {[5, 4, 3, 2, 1].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[styles.filterChip, filterRating === rating && styles.filterChipActive]}
                onPress={() => setFilterRating(rating)}
              >
                <Ionicons name="star" size={14} color={filterRating === rating ? '#FFFFFF' : '#F59E0B'} />
                <ThemedText style={[styles.filterText, filterRating === rating && styles.filterTextActive]}>
                  {rating}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          {filteredAndSortedReviews.map(renderReview)}

          {filteredAndSortedReviews.length === 0 && (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="star-outline" size={64} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.emptyTitle}>No reviews yet</ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                Be the first to share your experience!
              </ThemedText>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  gradientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingBottom: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientHeaderTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 16,
  },
  headerRefresh: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryLeft: {
    alignItems: 'center',
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  averageRating: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryRight: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    width: 12,
  },
  ratingBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginLeft: 8,
    marginRight: 8,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#6B7280',
    width: 24,
    textAlign: 'right',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    marginRight: 10,
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#7C3AED',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  reviewsList: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userAvatarPlaceholder: {
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  reviewImages: {
    marginTop: 12,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 8,
  },
  reviewFooter: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helpfulText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
