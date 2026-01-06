import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import exploreApi, { VerifiedReview } from '@/services/exploreApi';

const { width } = Dimensions.get('window');

const VerifiedReviews = () => {
  const router = useRouter();
  const [reviews, setReviews] = useState<VerifiedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVerifiedReviews();
  }, []);

  const fetchVerifiedReviews = async () => {
    try {
      const response = await exploreApi.getVerifiedReviews({ limit: 3 });
      if (response.success && response.data) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('[VerifiedReviews] Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={16} color="#F59E0B" />
        );
      } else if (i === fullStars && hasHalf) {
        stars.push(
          <Ionicons key={i} name="star-half" size={16} color="#F59E0B" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={16} color="#D1D5DB" />
        );
      }
    }
    return stars;
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Top Reviews Near You</Text>
            <Text style={styles.sectionSubtitle}>Trusted feedback from verified purchases</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00C06A" />
        </View>
      </View>
    );
  }

  // Empty state
  if (reviews.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Top Reviews Near You</Text>
            <Text style={styles.sectionSubtitle}>Trusted feedback from verified purchases</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-outline" size={32} color="#9CA3AF" />
          <Text style={styles.emptyText}>No reviews available yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Top Reviews Near You</Text>
          <Text style={styles.sectionSubtitle}>Trusted feedback from verified purchases</Text>
        </View>
        <TouchableOpacity onPress={() => navigateTo('/explore/reviews')}>
          <Text style={styles.allReviewsText}>All Reviews</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      <View style={styles.reviewsList}>
        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            {/* Rating Row */}
            <View style={styles.ratingRow}>
              <View style={styles.starsContainer}>
                {renderStars(review.rating)}
                <Text style={styles.ratingNumber}>{review.rating}</Text>
              </View>
              {review.cashback > 0 && (
                <View style={styles.cashbackBadge}>
                  <View style={styles.cashbackIcon}>
                    <Ionicons name="wallet-outline" size={12} color="#FFFFFF" />
                  </View>
                  <Text style={styles.cashbackText}>₹{review.cashback}</Text>
                </View>
              )}
            </View>

            {/* Review Text */}
            <Text style={styles.reviewText}>"{review.review}"</Text>

            {/* Store & Verified Row */}
            <View style={styles.storeRow}>
              <Text style={styles.storeName}>{review.store}</Text>
              {review.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#00C06A" />
                  <Text style={styles.verifiedText}>Verified Purchase</Text>
                </View>
              )}
            </View>

            {/* User & Time */}
            <View style={styles.userRow}>
              <Text style={styles.userName}>{review.user}</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.timeText}>{review.time}</Text>
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
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
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
  allReviewsText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  reviewsList: {
    paddingHorizontal: 16,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B2240',
    marginLeft: 8,
  },
  cashbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C06A',
    paddingLeft: 6,
    paddingRight: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  cashbackIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cashbackText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00C06A',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#00C06A',
    fontWeight: '500',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 13,
    color: '#6B7280',
  },
  dotSeparator: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  timeText: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default VerifiedReviews;
