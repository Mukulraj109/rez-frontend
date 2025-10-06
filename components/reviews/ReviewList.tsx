import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ReviewItem from './ReviewItem';
import RatingStars from './RatingStars';
import { Review, ReviewFilters, ReviewStats } from '@/types/review.types';
import reviewService from '@/services/reviewApi';

interface ReviewListProps {
  storeId: string;
  onWriteReviewPress?: () => void;
  showWriteButton?: boolean;
  currentUserId?: string;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
type FilterRating = 'all' | 1 | 2 | 3 | 4 | 5;

export default function ReviewList({
  storeId,
  onWriteReviewPress,
  showWriteButton = true,
  currentUserId
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterRating, setFilterRating] = useState<FilterRating>('all');

  const loadReviews = useCallback(async (
    page: number = 1,
    isRefresh: boolean = false
  ) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const filters: ReviewFilters = {
        page,
        limit: 10,
        sortBy,
      };

      if (filterRating !== 'all') {
        filters.rating = filterRating;
      }

      const response = await reviewService.getStoreReviews(storeId, filters);

      if (response.success && response.data) {
        const newReviews = response.data.reviews;

        if (page === 1) {
          setReviews(newReviews);
        } else {
          setReviews(prev => [...prev, ...newReviews]);
        }

        setRatingStats(response.data.ratingStats);
        setCurrentPage(page);
        setHasNextPage(response.data.pagination.hasNextPage);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [storeId, sortBy, filterRating]);

  useEffect(() => {
    loadReviews(1);
  }, [loadReviews]);

  const handleRefresh = () => {
    loadReviews(1, true);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasNextPage) {
      loadReviews(currentPage + 1);
    }
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleFilterChange = (rating: FilterRating) => {
    setFilterRating(rating);
    setCurrentPage(1);
  };

  const renderHeader = () => (
    <View>
      {/* Rating Summary */}
      {ratingStats && (
        <ThemedView style={styles.summaryContainer}>
          <View style={styles.summaryHeader}>
            <View style={styles.averageRating}>
              <ThemedText style={styles.ratingNumber}>
                {ratingStats.average.toFixed(1)}
              </ThemedText>
              <RatingStars rating={ratingStats.average} size={20} />
              <ThemedText style={styles.totalReviews}>
                Based on {ratingStats.count} reviews
              </ThemedText>
            </View>

            {showWriteButton && onWriteReviewPress && (
              <TouchableOpacity
                style={styles.writeButton}
                onPress={onWriteReviewPress}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                <ThemedText style={styles.writeButtonText}>Write Review</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Rating Distribution */}
          <View style={styles.distributionContainer}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingStats.distribution[star as keyof typeof ratingStats.distribution] || 0;
              const percentage = ratingStats.count > 0 ? (count / ratingStats.count) * 100 : 0;

              return (
                <TouchableOpacity
                  key={star}
                  style={styles.distributionRow}
                  onPress={() => handleFilterChange(star as FilterRating)}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.starLabel}>{star}</ThemedText>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${percentage}%` }]} />
                  </View>
                  <ThemedText style={styles.countLabel}>{count}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </ThemedView>
      )}

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {/* Sort Options */}
        <View style={styles.filterSection}>
          <ThemedText style={styles.filterLabel}>Sort by:</ThemedText>
          <View style={styles.filterButtons}>
            {(['newest', 'helpful', 'highest', 'lowest'] as SortOption[]).map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.filterButton, sortBy === option && styles.filterButtonActive]}
                onPress={() => handleSortChange(option)}
                activeOpacity={0.7}
              >
                <ThemedText
                  style={[styles.filterButtonText, sortBy === option && styles.filterButtonTextActive]}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rating Filter */}
        <View style={styles.filterSection}>
          <ThemedText style={styles.filterLabel}>Filter:</ThemedText>
          <View style={styles.filterButtons}>
            {(['all', 5, 4, 3, 2, 1] as FilterRating[]).map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[
                  styles.filterButton,
                  filterRating === rating && styles.filterButtonActive
                ]}
                onPress={() => handleFilterChange(rating)}
                activeOpacity={0.7}
              >
                <ThemedText
                  style={[
                    styles.filterButtonText,
                    filterRating === rating && styles.filterButtonTextActive
                  ]}
                >
                  {rating === 'all' ? 'All' : `${rating} `}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="star-outline" size={64} color="#D1D5DB" />
      <ThemedText style={styles.emptyTitle}>No Reviews Yet</ThemedText>
      <ThemedText style={styles.emptyText}>
        Be the first to review this store
      </ThemedText>
      {showWriteButton && onWriteReviewPress && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={onWriteReviewPress}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.emptyButtonText}>Write a Review</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#8B5CF6" />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <ThemedText style={styles.loadingText}>Loading reviews...</ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={reviews}
      keyExtractor={(item) => item._id || item.id || Math.random().toString()}
      renderItem={({ item }) => (
        <ReviewItem
          review={item}
          isOwnReview={currentUserId ? item.user._id === currentUserId || item.user.id === currentUserId : false}
        />
      )}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={renderFooter}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={['#8B5CF6']}
          tintColor="#8B5CF6"
        />
      }
      contentContainerStyle={[
        styles.listContent,
        reviews.length === 0 && styles.listContentEmpty
      ]}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  averageRating: {
    flex: 1,
  },
  ratingNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  totalReviews: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#8B5CF6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  writeButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  distributionContainer: {
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    width: 12,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  countLabel: {
    fontSize: 12,
    color: '#6B7280',
    width: 32,
    textAlign: 'right',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
