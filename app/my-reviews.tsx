// My Reviews Page
// Shows all reviews written by the user

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import reviewService from '@/services/reviewApi';
import { UserReview } from '@/types/review.types';

export default function MyReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setPage(1);
      } else {
        setLoading(true);
      }

      const response = await reviewService.getUserReviews(isRefresh ? 1 : page, 20);

      if (response.success && response.data) {
        if (isRefresh) {
          setReviews(response.data.reviews || []);
        } else {
          setReviews(prev => [...prev, ...(response.data?.reviews || [])]);
        }

        setHasMore(response.data.pagination?.hasNextPage || false);
        setError(null);
      } else {
        throw new Error(response.message || 'Failed to load reviews');
      }
    } catch (err: any) {
      console.error('❌ [MY REVIEWS] Error loading reviews:', err);
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadReviews(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      loadReviews();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color="#F59E0B"
          />
        ))}
      </View>
    );
  };

  const renderReviewCard = (review: UserReview) => {
    // Handle store data - might be populated object or just ID
    const storeName = typeof review.store === 'object' && review.store?.name
      ? review.store.name
      : 'Store';
    const storeLogo = typeof review.store === 'object' && review.store?.logo
      ? review.store.logo
      : null;

    return (
      <View key={review._id} style={styles.reviewCard}>
        {/* Store Info Header */}
        <View style={styles.reviewHeader}>
          <View style={styles.storeInfo}>
            {storeLogo ? (
              <Image source={{ uri: storeLogo }} style={styles.storeLogo} />
            ) : (
              <View style={[styles.storeLogo, styles.storeLogoPlaceholder]}>
                <Ionicons name="storefront" size={20} color="#00C06A" />
              </View>
            )}
            <View style={styles.storeDetails}>
              <Text style={styles.storeName}>{storeName}</Text>
              <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
            </View>
          </View>
          {renderStars(review.rating)}
        </View>

        {/* Review Content */}
        {review.comment && (
          <Text style={styles.reviewComment}>{review.comment}</Text>
        )}

        {/* Review Photos (if any) */}
        {review.images && review.images.length > 0 && (
          <ScrollView horizontal style={styles.imagesContainer} showsHorizontalScrollIndicator={false}>
            {review.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.reviewImage}
              />
            ))}
          </ScrollView>
        )}

        {/* Review Stats */}
        <View style={styles.reviewStats}>
          <View style={styles.stat}>
            <Ionicons name="thumbs-up-outline" size={16} color="#6B7280" />
            <Text style={styles.statText}>{review.helpful || 0} helpful</Text>
          </View>
          {review.merchantReply && (
            <View style={styles.stat}>
              <Ionicons name="chatbox-outline" size={16} color="#00C06A" />
              <Text style={styles.statText}>Store replied</Text>
            </View>
          )}
        </View>

        {/* Merchant Reply */}
        {review.merchantReply && (
          <View style={styles.merchantReply}>
            <View style={styles.replyHeader}>
              <Ionicons name="business" size={16} color="#00C06A" />
              <Text style={styles.replyLabel}>Store Response</Text>
            </View>
            <Text style={styles.replyText}>{review.merchantReply}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              const storeId = typeof review.store === 'object' ? review.store._id : review.store;
              router.push(`/stores/${storeId}` as any);
            }}
            accessibilityLabel="View store"
            accessibilityRole="button"
            accessibilityHint={`Opens ${storeName} store page`}
          >
            <Ionicons name="storefront-outline" size={16} color="#00C06A" />
            <Text style={styles.actionButtonText}>View Store</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            accessibilityLabel="Edit review"
            accessibilityRole="button"
            accessibilityHint="Opens editor to modify your review"
          >
            <Ionicons name="create-outline" size={16} color="#6B7280" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#00C06A" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Returns to previous screen"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Reviews</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#00C06A"
              colors={['#00C06A']}
            />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
            if (isCloseToBottom) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {loading && reviews.length === 0 ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#00C06A" />
              <Text style={styles.loadingText}>Loading your reviews...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
              <Text style={styles.errorTitle}>Failed to Load Reviews</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => loadReviews(true)}
                accessibilityLabel="Try again"
                accessibilityRole="button"
                accessibilityHint="Retries loading your reviews"
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : reviews.length === 0 ? (
            <View style={styles.centerContainer}>
              <Ionicons name="chatbox-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Reviews Yet</Text>
              <Text style={styles.emptyText}>
                You haven't written any reviews yet.{'\n'}
                Order from a store and share your experience!
              </Text>
              <TouchableOpacity
                style={styles.shopButton}
                onPress={() => router.push('/(tabs)/' as any)}
                accessibilityLabel="Browse stores"
                accessibilityRole="button"
                accessibilityHint="Opens store browsing page"
              >
                <Text style={styles.shopButtonText}>Browse Stores</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.reviewsList}>
              <Text style={styles.reviewsCount}>
                {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
              </Text>
              {reviews.map(renderReviewCard)}

              {hasMore && (
                <View style={styles.loadMoreContainer}>
                  <ActivityIndicator size="small" color="#00C06A" />
                  <Text style={styles.loadMoreText}>Loading more...</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#00C06A',
    paddingTop: Platform.select({
      ios: 50,
      android: StatusBar.currentHeight || 16,
      web: 16,
      default: 16,
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  reviewsList: {
    padding: 16,
  },
  reviewsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storeLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  storeLogoPlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  imagesContainer: {
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  reviewStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  merchantReply: {
    backgroundColor: '#F9FAFB',
    borderLeftWidth: 3,
    borderLeftColor: '#00C06A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  replyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00C06A',
  },
  replyText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
