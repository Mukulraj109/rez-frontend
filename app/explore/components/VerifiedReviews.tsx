import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const verifiedReviews = [
  {
    id: 1,
    user: 'Priya S.',
    rating: 5,
    review: '"Best biryani in town! The portion size is generous and ReZ cashback made it even better."',
    store: 'Paradise Biryani',
    cashback: 52,
    verified: true,
    time: '2 days ago',
  },
  {
    id: 2,
    user: 'Rahul K.',
    rating: 4.5,
    review: '"Great quality sneakers and authentic products. Fast delivery and good cashback."',
    store: 'Nike Store',
    cashback: 1260,
    verified: true,
    time: '1 week ago',
  },
  {
    id: 3,
    user: 'Ananya M.',
    rating: 5,
    review: '"Amazing spa experience! Professional service and the ReZ rewards were a nice bonus."',
    store: 'Wellness Spa',
    cashback: 400,
    verified: true,
    time: '3 days ago',
  },
];

const VerifiedReviews = () => {
  const router = useRouter();

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

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Top Reviews Near You</Text>
          <Text style={styles.sectionSubtitle}>Trusted feedback from verified purchases</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.allReviewsText}>All Reviews</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      <View style={styles.reviewsList}>
        {verifiedReviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            {/* Rating Row */}
            <View style={styles.ratingRow}>
              <View style={styles.starsContainer}>
                {renderStars(review.rating)}
                <Text style={styles.ratingNumber}>{review.rating}</Text>
              </View>
              <View style={styles.cashbackBadge}>
                <View style={styles.cashbackIcon}>
                  <Ionicons name="wallet-outline" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.cashbackText}>₹{review.cashback}</Text>
              </View>
            </View>

            {/* Review Text */}
            <Text style={styles.reviewText}>{review.review}</Text>

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
