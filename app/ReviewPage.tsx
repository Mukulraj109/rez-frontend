import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useReviewState } from '@/hooks/useReviewState';
import { CashbackEarning } from '@/types/review.types';
import { useCashbackModal } from '@/hooks/useCashbackModal';
import CashbackModal from '@/components/CashbackModal';

// Dummy data for recent cashback
const recentCashbackData: CashbackEarning[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Swathi',
    userAvatar:
      'https://images.unsplash.com/photo-1494790108755-2616b2126625?w=100&h=100&fit=crop&crop=face',
    amount: 219.9,
    productId: 'product-1',
    reviewId: 'review-1',
    createdAt: new Date('2025-08-15T10:30:00Z'),
    status: 'credited',
  },
  {
    id: '2',
    userId: '2',
    userName: 'Priya',
    userAvatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    amount: 219.9,
    productId: 'product-1',
    reviewId: 'review-2',
    createdAt: new Date('2025-08-15T09:15:00Z'),
    status: 'credited',
  },
  {
    id: '3',
    userId: '3',
    userName: 'Priya',
    userAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    amount: 219.9,
    productId: 'product-1',
    reviewId: 'review-3',
    createdAt: new Date('2025-08-15T08:45:00Z'),
    status: 'credited',
  },
];

export default function ReviewPage() {
  const router = useRouter();
  const {
    reviewText,
    setReviewText,
    rating,
    setRating,
    isSubmitting,
    submitReview,
  } = useReviewState();
  
  const {
    isVisible: isModalVisible,
    cashbackAmount,
    showModal,
    hideModal,
  } = useCashbackModal();

  const handleBackPress = () => {
    router.back();
  };

  const handleSubmitReview = async () => {
    await submitReview(
      'product-1', // Mock product ID
      (cashbackAmount) => {
        // Show celebration modal instead of alert
        showModal(cashbackAmount);
      },
      (errorMsg) => {
        Alert.alert('Error', errorMsg);
      }
    );
  };

  const handleModalClose = () => {
    hideModal();
    router.replace('/'); // Navigate to homepage after closing modal
  };

  const renderStarRating = () => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={28}
              color={star <= rating ? '#FFD700' : '#E5E7EB'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderRecentCashback = () => {
    return (
      <View style={styles.recentCashbackSection}>
        <ThemedText style={styles.recentCashbackTitle}>
          Recent cashback
        </ThemedText>
        {recentCashbackData.map((item) => (
          <View key={item.id} style={styles.cashbackItem}>
            <Image source={{ uri: item.userAvatar }} style={styles.userAvatar} />
            <View>
              <Text style={styles.userName}>{item.userName} earned</Text>
              <Text style={styles.amountText}>₹{item.amount.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#111" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Write a Review</ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        {/* Product Image */}
        <View style={styles.productImageContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
            }}
            style={styles.productImage}
          />
        </View>

        {/* Cashback Section */}
        <View style={styles.cashbackSection}>
          <ThemedText style={styles.cashbackText}>
            💰 Earn <Text style={{ fontWeight: '700' }}>10% cashback</Text> by
            leaving a review for this product!
          </ThemedText>

          {/* Review Card */}
          <View style={styles.reviewCard}>
            <ThemedText style={styles.reviewCardTitle}>
              Share your thoughts
            </ThemedText>

            {/* Star Rating */}
            {renderStarRating()}

            {/* Review Input */}
            <View style={styles.reviewInputContainer}>
              <Ionicons
                name="create-outline"
                size={20}
                color="#6D28D9"
                style={styles.writeIcon}
              />
            <TextInput
  style={{
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
    outlineStyle: 'none', // Web only
  } as any}
  placeholder="Write your experience here..."
  placeholderTextColor="#9CA3AF"
  multiline
  numberOfLines={3}
  value={reviewText}
  onChangeText={setReviewText}
  textAlignVertical="top"
  underlineColorAndroid="transparent"
/>

            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!reviewText.trim() || isSubmitting) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitReview}
              disabled={!reviewText.trim() || isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting
                  ? 'Submitting...'
                  : 'Submit & get 10% cashback'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Cashback */}
        {renderRecentCashback()}
      </ScrollView>

      {/* Cashback Celebration Modal */}
      <CashbackModal
        visible={isModalVisible}
        onClose={handleModalClose}
        cashbackAmount={cashbackAmount}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FAFAFA',
  },
  backButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerSpacer: {
    width: 40,
  },
  productImageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  productImage: {
    width: 180,
    height: 220,
    borderRadius: 20,
    resizeMode: 'cover',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  cashbackSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  cashbackText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 24,
    lineHeight: 22,
  },
  reviewCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  reviewCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 6,
  },
  starButton: {
    padding: 6,
  },
  reviewInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  writeIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  reviewInput: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}), // Web: removes focus outline
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recentCashbackSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  recentCashbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  cashbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
  },
  userName: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  amountText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
