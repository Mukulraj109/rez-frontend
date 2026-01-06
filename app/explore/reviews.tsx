import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import exploreApi, { VerifiedReview } from '@/services/exploreApi';

const { width } = Dimensions.get('window');

type SortType = 'recent' | 'highest' | 'lowest';

const AllReviewsPage = () => {
  const router = useRouter();
  const [reviews, setReviews] = useState<VerifiedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [total, setTotal] = useState(0);

  const LIMIT = 10;

  const fetchReviews = useCallback(async (pageNum: number, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await exploreApi.getVerifiedReviews({
        limit: LIMIT,
        page: pageNum
      });

      if (response.success && response.data) {
        let newReviews = response.data.reviews || [];

        // Client-side sorting
        if (sortBy === 'highest') {
          newReviews = [...newReviews].sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'lowest') {
          newReviews = [...newReviews].sort((a, b) => a.rating - b.rating);
        }

        if (pageNum === 1) {
          setReviews(newReviews);
        } else {
          setReviews(prev => [...prev, ...newReviews]);
        }
        setTotal(response.data.total || newReviews.length);
        setHasMore(response.data.hasMore || false);
      }
    } catch (err: any) {
      console.error('[ALL REVIEWS] Error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [sortBy]);

  useEffect(() => {
    setPage(1);
    fetchReviews(1);
  }, [sortBy, fetchReviews]);

  const onRefresh = useCallback(() => {
    setPage(1);
    fetchReviews(1, true);
  }, [fetchReviews]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReviews(nextPage);
    }
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

  const navigateToStore = (storeId?: string) => {
    if (storeId) {
      router.push(`/MainStorePage?id=${storeId}` as any);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#0B2240" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>All Reviews</Text>
            <Text style={styles.headerSubtitle}>
              {total > 0 ? `${total} verified reviews` : 'Verified reviews'}
            </Text>
          </View>
        </View>

        {/* Sort Tabs */}
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[styles.sortTab, sortBy === 'recent' && styles.sortTabActive]}
            onPress={() => setSortBy('recent')}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={sortBy === 'recent' ? '#00C06A' : '#6B7280'}
            />
            <Text style={[styles.sortText, sortBy === 'recent' && styles.sortTextActive]}>
              Recent
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortTab, sortBy === 'highest' && styles.sortTabActive]}
            onPress={() => setSortBy('highest')}
          >
            <Ionicons
              name="arrow-up"
              size={16}
              color={sortBy === 'highest' ? '#00C06A' : '#6B7280'}
            />
            <Text style={[styles.sortText, sortBy === 'highest' && styles.sortTextActive]}>
              Highest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortTab, sortBy === 'lowest' && styles.sortTabActive]}
            onPress={() => setSortBy('lowest')}
          >
            <Ionicons
              name="arrow-down"
              size={16}
              color={sortBy === 'lowest' ? '#00C06A' : '#6B7280'}
            />
            <Text style={[styles.sortText, sortBy === 'lowest' && styles.sortTextActive]}>
              Lowest
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reviews List */}
        <ScrollView
          style={styles.reviewsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.reviewsContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00C06A']} />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const paddingToBottom = 50;
            if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
              loadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {/* Loading State */}
          {loading && !refreshing && (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#00C06A" />
              <Text style={styles.loadingText}>Loading reviews...</Text>
            </View>
          )}

          {/* Error State */}
          {error && !loading && (
            <View style={styles.centerContainer}>
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty State */}
          {!loading && !error && reviews.length === 0 && (
            <View style={styles.centerContainer}>
              <Ionicons name="chatbubble-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No Reviews Yet</Text>
              <Text style={styles.emptySubtext}>Be the first to leave a review!</Text>
            </View>
          )}

          {/* Reviews */}
          {!loading && !error && reviews.map((review) => (
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
              <TouchableOpacity
                style={styles.storeRow}
                onPress={() => navigateToStore(review.storeId)}
                disabled={!review.storeId}
              >
                {review.storeLogo && (
                  <Image source={{ uri: review.storeLogo }} style={styles.storeLogo} />
                )}
                <Text style={styles.storeName}>{review.store}</Text>
                {review.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#00C06A" />
                    <Text style={styles.verifiedText}>Verified Purchase</Text>
                  </View>
                )}
                {review.storeId && (
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>

              {/* User & Time */}
              <View style={styles.userRow}>
                {review.avatar && (
                  <Image source={{ uri: review.avatar }} style={styles.userAvatar} />
                )}
                <Text style={styles.userName}>{review.user}</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.timeText}>{review.time}</Text>
              </View>
            </View>
          ))}

          {/* Load More Indicator */}
          {loadingMore && (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color="#00C06A" />
            </View>
          )}

          {/* End of List */}
          {!loading && !hasMore && reviews.length > 0 && (
            <View style={styles.endOfListContainer}>
              <Text style={styles.endOfListText}>You've seen all reviews</Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2240',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  sortTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  sortTabActive: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#00C06A',
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  sortTextActive: {
    color: '#00C06A',
    fontWeight: '600',
  },
  reviewsList: {
    flex: 1,
  },
  reviewsContainer: {
    padding: 16,
    minHeight: 300,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 12,
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
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
    marginBottom: 10,
    gap: 8,
  },
  storeLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
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
    marginLeft: 8,
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
  userAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
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
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endOfListContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endOfListText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});

export default AllReviewsPage;
