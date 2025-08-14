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
import { mockUGCContent } from '@/utils/mock-reviews-data';

export default function ReviewModal({
  visible,
  onClose,
  storeName,
  storeId,
  averageRating,
  totalReviews,
  ratingBreakdown,
  reviews,
  onWriteReview
}: ReviewModalProps) {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [activeTab, setActiveTab] = useState<TabType>('reviews');

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
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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
                  <ReviewActionButton onPress={onWriteReview} />
                </View>

                {/* Tabs */}
                <ReviewTabs
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  reviewCount={totalReviews}
                  ugcCount={mockUGCContent.length}
                />

                {/* Content */}
                {activeTab === 'reviews' ? (
                  <View style={styles.reviewListContainer}>
                    {reviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        onLike={() => {}}
                        onReport={() => {}}
                        onHelpful={() => {}}
                      />
                    ))}
                  </View>
                ) : (
                  <UGCGrid
                    ugcContent={mockUGCContent}
                    onContentPress={() => {}}
                    onLikeContent={() => {}}
                  />
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
  });
};
