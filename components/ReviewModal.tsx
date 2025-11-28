import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import StarRating from '@/components/StarRating';
import RatingBreakdown from '@/components/RatingBreakdown';
import ReviewActionButton from '@/components/ReviewActionButton';
import ReviewTabs from '@/components/ReviewTabs';
import ReviewCard from '@/components/ReviewCard';
import UGCGrid from '@/components/UGCGrid';
import { ReviewModalProps, TabType } from '@/types/reviews';

export default function ReviewModal({
  visible,
  onClose,
  storeName,
  storeId,
  averageRating,
  totalReviews,
  ratingBreakdown,
  reviews,
  onWriteReview,
  onLikeReview,
  onReportReview,
  onHelpfulReview,
  ugcContent = [],
  ugcLoading = false,
}: ReviewModalProps) {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [activeTab, setActiveTab] = useState<TabType>('reviews');

  // Log props when modal becomes visible
  useEffect(() => {
    if (visible) {
      console.log('🎯 [ReviewModal] Modal Opened with Props:');
      console.log('  📌 Store Name:', storeName);
      console.log('  📌 Store ID:', storeId);
      console.log('  ⭐ Average Rating:', averageRating);
      console.log('  📊 Total Reviews:', totalReviews);
      console.log('  📈 Rating Breakdown:', JSON.stringify(ratingBreakdown, null, 2));
      console.log('  📝 Reviews Count:', reviews?.length || 0);
      console.log('  📝 Reviews Data:', JSON.stringify(reviews, null, 2));
      console.log('  🖼️ UGC Content Count:', ugcContent?.length || 0);
      console.log('  🖼️ UGC Loading:', ugcLoading);
      
      // Log each review in detail
      if (reviews && reviews.length > 0) {
        reviews.forEach((review, index) => {
          console.log(`  📄 Review ${index + 1}:`, {
            id: review.id,
            userId: review.userId,
            userName: review.userName,
            userAvatar: review.userAvatar,
            moderationStatus: review.moderationStatus,
            rating: review.rating,
            reviewText: review.reviewText,
            date: review.date,
            images: review.images?.length || 0,
          });
        });
      }
    }
  }, [visible, storeName, storeId, averageRating, totalReviews, ratingBreakdown, reviews, ugcContent, ugcLoading]);

  const slideAnim = useRef(new Animated.Value(screenData.height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        setScreenData(window);
        if (!visible) slideAnim.setValue(window.height);
      }, 100);
    });

    return () => {
      subscription?.remove();
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, [slideAnim, visible]);

  const styles = useMemo(() => createStyles(screenData), [screenData]);

  // Animate in/out
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenData.height,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim, screenData.height]);

  const handleTabChange = useCallback((tab: TabType) => setActiveTab(tab), []);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
      accessibilityLabel="Reviews and ratings dialog"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.blurContainer, { opacity: fadeAnim }]}>
            <BlurView intensity={50} style={styles.blur} />
          </Animated.View>

          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              <ScrollView
                style={styles.modal}
                contentContainerStyle={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.handleBar} />

                {/* Close (cut) button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  accessibilityLabel="Close reviews and ratings"
                  accessibilityRole="button"
                  accessibilityHint="Double tap to close this dialog"
                >
                  <Ionicons name="close" size={20} color="#555" />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                  <ThemedText style={styles.headerTitle}>Reviews & Ratings</ThemedText>
                  <ThemedText style={styles.storeName}>{storeName}</ThemedText>
                </View>

                {/* Rating Summary */}
                <View style={styles.ratingSummary}>
                  <View style={styles.averageRatingContainer}>
                    <ThemedText style={styles.averageRatingNumber}>
                      {averageRating.toFixed(1)}
                    </ThemedText>
                    <ThemedText style={styles.outOfFive}> / 5</ThemedText>
                  </View>
                  <StarRating rating={averageRating} size="large" showHalf={true} />
                  <ThemedText style={styles.totalReviewsText}>
                    Based on {totalReviews.toLocaleString()} reviews
                  </ThemedText>
                </View>

                {/* Breakdown */}
                <View style={styles.breakdownSection}>
                  <RatingBreakdown
                    ratingBreakdown={ratingBreakdown}
                    totalReviews={totalReviews}
                  />
                </View>

                {/* Action */}
                <View style={styles.actionSection}>
                  <ReviewActionButton 
                    onPress={onWriteReview} 
                    disabled={!onWriteReview}
                    hasReviewed={!onWriteReview}
                  />
                </View>

                {/* Tabs */}
                <ReviewTabs
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  reviewCount={totalReviews}
                  ugcCount={ugcContent.length}
                />

                {/* Content */}
                {activeTab === 'reviews' ? (
                  <View style={styles.reviewListContainer}>
                    {reviews.length === 0 ? (
                      <View style={styles.emptyState}>
                        <ThemedText style={styles.emptyStateText}>
                          No reviews yet. Be the first to review this store!
                        </ThemedText>
                      </View>
                    ) : (
                      reviews.map((review) => (
                        <ReviewCard
                          key={review.id}
                          review={review}
                          onLike={onLikeReview ? () => onLikeReview(review.id) : undefined}
                          onReport={onReportReview ? () => onReportReview(review.id) : undefined}
                          onHelpful={onHelpfulReview ? () => onHelpfulReview(review.id) : undefined}
                        />
                      ))
                    )}
                  </View>
                ) : (
                  ugcLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#7C3AED" />
                      <ThemedText style={styles.loadingText}>Loading UGC content...</ThemedText>
                    </View>
                  ) : ugcContent.length === 0 ? (
                    <View style={styles.emptyState}>
                      <ThemedText style={styles.emptyStateText}>
                        No user-generated content yet.
                      </ThemedText>
                    </View>
                  ) : (
                    <UGCGrid
                      ugcContent={ugcContent}
                      onContentPress={() => {}}
                      onLikeContent={() => {}}
                    />
                  )
                )}
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
);
}

const createStyles = (screenData: { width: number; height: number }) => {
  const isTabletOrDesktop = screenData.width > 768;
  const modalWidth = isTabletOrDesktop ? Math.min(screenData.width * 0.9, 900) : '100%';
  const modalHeight = isTabletOrDesktop ? Math.min(screenData.height * 0.85, 800) : '85%';

  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: isTabletOrDesktop ? 'center' : 'flex-end',
      alignItems: 'center',
    },
    blurContainer: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
    },
    blur: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContainer: {
      backgroundColor: '#fff',
      width: modalWidth,
      maxHeight: modalHeight,
      borderRadius: 24,
      overflow: 'hidden',
    },
    modal: {
      flex: 1,
    },
    modalContent: {
      padding: 20,
    },
    handleBar: {
      width: 40,
      height: 4,
      backgroundColor: '#ccc',
      borderRadius: 2,
      alignSelf: 'center',
      marginVertical: 10,
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: '#f2f2f2',
      borderRadius: 20,
      padding: 6,
      zIndex: 1,
    },
    header: {
      alignItems: 'center',
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    storeName: {
      fontSize: 16,
      color: '#7C3AED',
    },
    ratingSummary: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: 'rgba(124, 58, 237, 0.05)',
      borderRadius: 16,
      marginBottom: 20,
    },
    averageRatingContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    averageRatingNumber: {
      fontSize: 42,
      fontWeight: 'bold',
    },
    outOfFive: {
      fontSize: 20,
      color: '#666',
    },
    totalReviewsText: {
      fontSize: 14,
      color: '#666',
    },
    breakdownSection: {
      marginBottom: 20,
    },
    actionSection: {
      marginBottom: 20,
    },
    reviewListContainer: {
      gap: 12,
    },
    emptyState: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateText: {
      fontSize: 16,
      color: '#6B7280',
      textAlign: 'center',
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: '#6B7280',
    },
  });
};
