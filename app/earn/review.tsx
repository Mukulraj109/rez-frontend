// Review to Earn Page
// Earn coins for writing reviews

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

interface PendingReview {
  id: string;
  type: 'product' | 'store' | 'service';
  name: string;
  image: string;
  orderId: string;
  purchaseDate: string;
  coins: number;
  bonusCoins?: number;
}

const PENDING_REVIEWS: PendingReview[] = [
  { id: '1', type: 'product', name: 'Nike Air Max 270', image: '👟', orderId: 'ORD-001', purchaseDate: '2024-12-15', coins: 20, bonusCoins: 10 },
  { id: '2', type: 'store', name: 'Starbucks - Indiranagar', image: '☕', orderId: 'ORD-002', purchaseDate: '2024-12-18', coins: 15 },
  { id: '3', type: 'service', name: 'Spa Treatment', image: '💆', orderId: 'ORD-003', purchaseDate: '2024-12-17', coins: 25 },
  { id: '4', type: 'product', name: 'Sony WH-1000XM5', image: '🎧', orderId: 'ORD-004', purchaseDate: '2024-12-10', coins: 20 },
];

export default function ReviewToEarnPage() {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<PendingReview | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map(a => a.uri);
      setPhotos(prev => [...prev, ...newPhotos].slice(0, 5));
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    if (!selectedItem || rating === 0 || !review) return;

    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitting(false);
    setSelectedItem(null);
    setRating(0);
    setReview('');
    setPhotos([]);
    // Show success toast
  };

  const calculateCoins = () => {
    if (!selectedItem) return 0;
    let total = selectedItem.coins;
    if (photos.length > 0) total += (selectedItem.bonusCoins || 5);
    if (review.length > 100) total += 5;
    return total;
  };

  const renderPendingReview = ({ item }: { item: PendingReview }) => (
    <TouchableOpacity
      style={styles.reviewCard}
      onPress={() => setSelectedItem(item)}
    >
      <View style={styles.reviewImage}>
        <ThemedText style={styles.reviewEmoji}>{item.image}</ThemedText>
      </View>
      <View style={styles.reviewInfo}>
        <View style={styles.typeBadge}>
          <ThemedText style={styles.typeText}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </ThemedText>
        </View>
        <ThemedText style={styles.reviewName}>{item.name}</ThemedText>
        <ThemedText style={styles.reviewDate}>Purchased {item.purchaseDate}</ThemedText>
      </View>
      <View style={styles.coinsBadge}>
        <Ionicons name="diamond" size={16} color={Colors.gold} />
        <ThemedText style={styles.coinsValue}>{item.coins}</ThemedText>
        {item.bonusCoins && (
          <ThemedText style={styles.bonusText}>+{item.bonusCoins}</ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );

  if (selectedItem) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />
        <LinearGradient
          colors={[Colors.primary[600], Colors.secondary[700]]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedItem(null)}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Write Review</ThemedText>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} contentContainerStyle={styles.writeContent}>
          {/* Item Info */}
          <View style={styles.itemCard}>
            <View style={styles.itemImage}>
              <ThemedText style={styles.itemEmoji}>{selectedItem.image}</ThemedText>
            </View>
            <View style={styles.itemInfo}>
              <ThemedText style={styles.itemName}>{selectedItem.name}</ThemedText>
              <ThemedText style={styles.itemOrder}>Order: {selectedItem.orderId}</ThemedText>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Your Rating *</ThemedText>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={40}
                    color={star <= rating ? Colors.gold : Colors.gray[300]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Review Text */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Your Review *</ThemedText>
            <TextInput
              style={styles.reviewInput}
              value={review}
              onChangeText={setReview}
              placeholder="Share your experience..."
              placeholderTextColor={Colors.text.tertiary}
              multiline
              maxLength={500}
            />
            <View style={styles.reviewMeta}>
              <ThemedText style={styles.charCount}>{review.length}/500</ThemedText>
              {review.length > 100 && (
                <View style={styles.bonusBadge}>
                  <ThemedText style={styles.bonusBadgeText}>+5 RC for detailed review!</ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Photos */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Add Photos (Optional)</ThemedText>
              {photos.length === 0 && (
                <View style={styles.photoBonusBadge}>
                  <ThemedText style={styles.photoBonusText}>+{selectedItem.bonusCoins || 5} RC</ThemedText>
                </View>
              )}
            </View>
            <View style={styles.photosGrid}>
              {photos.map((uri, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image source={{ uri }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.removePhoto}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <Ionicons name="close-circle" size={24} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < 5 && (
                <TouchableOpacity style={styles.addPhoto} onPress={handlePickPhoto}>
                  <Ionicons name="camera-outline" size={28} color={Colors.text.tertiary} />
                  <ThemedText style={styles.addPhotoText}>Add</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Coin Preview */}
          <View style={styles.coinPreview}>
            <ThemedText style={styles.coinPreviewLabel}>You'll earn</ThemedText>
            <View style={styles.coinPreviewValue}>
              <Ionicons name="diamond" size={24} color={Colors.gold} />
              <ThemedText style={styles.coinPreviewAmount}>{calculateCoins()} RC</ThemedText>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (rating === 0 || !review) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitReview}
            disabled={rating === 0 || !review || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Submit Review</ThemedText>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />
      <LinearGradient
        colors={[Colors.primary[600], Colors.secondary[700]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Review & Earn</ThemedText>
          <View style={styles.placeholder} />
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{PENDING_REVIEWS.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Pending</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {PENDING_REVIEWS.reduce((sum, r) => sum + r.coins + (r.bonusCoins || 0), 0)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>RC Available</ThemedText>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={PENDING_REVIEWS}
        renderItem={renderPendingReview}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.tipsCard}>
            <Ionicons name="bulb-outline" size={24} color={Colors.gold} />
            <View style={styles.tipsContent}>
              <ThemedText style={styles.tipsTitle}>Earn More Coins</ThemedText>
              <ThemedText style={styles.tipsText}>
                Write detailed reviews (100+ characters) and add photos to earn bonus coins!
              </ThemedText>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={64} color={Colors.gray[300]} />
            <ThemedText style={styles.emptyTitle}>No Pending Reviews</ThemedText>
            <ThemedText style={styles.emptyText}>
              Make purchases to unlock review opportunities
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    ...Typography.h3,
    color: '#FFF',
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    color: '#FFF',
  },
  statLabel: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: Spacing.sm,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.gold + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gold + '30',
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    ...Typography.label,
    color: Colors.gold,
    marginBottom: Spacing.xs,
  },
  tipsText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadows.subtle,
  },
  reviewImage: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewEmoji: {
    fontSize: 28,
  },
  reviewInfo: {
    flex: 1,
  },
  typeBadge: {
    backgroundColor: Colors.primary[100],
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  typeText: {
    ...Typography.caption,
    color: Colors.primary[600],
    fontWeight: '600',
  },
  reviewName: {
    ...Typography.label,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  reviewDate: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  coinsValue: {
    ...Typography.h3,
    color: Colors.gold,
  },
  bonusText: {
    ...Typography.caption,
    color: Colors.success,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  writeContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.subtle,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 32,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  itemOrder: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  reviewInput: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Typography.body,
    color: Colors.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
    ...Shadows.subtle,
  },
  reviewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  charCount: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  bonusBadge: {
    backgroundColor: Colors.success + '20',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  bonusBadgeText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '600',
  },
  photoBonusBadge: {
    backgroundColor: Colors.gold + '20',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  photoBonusText: {
    ...Typography.caption,
    color: Colors.gold,
    fontWeight: '600',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  photoItem: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removePhoto: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.full,
  },
  addPhoto: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.gray[300],
    gap: Spacing.xs,
  },
  addPhotoText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  coinPreview: {
    backgroundColor: Colors.gold + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.gold + '30',
  },
  coinPreviewLabel: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  coinPreviewValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  coinPreviewAmount: {
    ...Typography.h2,
    color: Colors.gold,
  },
  submitButton: {
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  submitButtonText: {
    ...Typography.button,
    color: '#FFF',
  },
});
