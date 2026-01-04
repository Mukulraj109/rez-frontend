import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import gamificationApi, { ReviewableItem } from '@/services/gamificationApi';

const { width } = Dimensions.get('window');

const reviewTips = [
  { icon: 'star', tip: 'Rate honestly from 1-5 stars' },
  { icon: 'camera', tip: 'Add photos to earn extra coins' },
  { icon: 'create', tip: 'Write at least 50 characters' },
  { icon: 'checkmark-circle', tip: 'Helpful reviews earn bonuses' },
];

export default function ReviewEarnPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'store' | 'product'>('all');

  // API state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewableItems, setReviewableItems] = useState<ReviewableItem[]>([]);
  const [potentialEarnings, setPotentialEarnings] = useState(0);

  // Fetch reviewable items from API
  const fetchReviewableItems = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await gamificationApi.getReviewableItems();

      if (response.success && response.data) {
        setReviewableItems(response.data.items);
        setPotentialEarnings(response.data.potentialEarnings);
      } else {
        setError(response.error || 'Failed to load reviewable items');
      }
    } catch (err: any) {
      console.error('[REVIEW EARN] Error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchReviewableItems();
  }, [fetchReviewableItems]);

  const onRefresh = useCallback(() => {
    fetchReviewableItems(true);
  }, [fetchReviewableItems]);

  const filteredItems = reviewableItems.filter(item =>
    filter === 'all' ? true : item.type === filter
  );

  const handleWriteReview = (item: ReviewableItem) => {
    router.push({
      pathname: '/ReviewPage',
      params: {
        productId: item.id,
        productTitle: item.name,
        productImage: item.image,
        cashbackAmount: item.coins.toString(),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write & Earn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F59E0B']} />
        }
      >
        {/* Loading State */}
        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={styles.loadingText}>Loading reviews...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchReviewableItems()}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Hero Section */}
        {!loading && !error && (
          <LinearGradient
            colors={['#FEF3C7', '#FDE68A']}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroIconContainer}>
                <Ionicons name="star" size={32} color="#F59E0B" />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Earn 25-100 Coins</Text>
                <Text style={styles.heroSubtitle}>Per quality review</Text>
              </View>
            </View>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{reviewableItems.length}</Text>
                <Text style={styles.heroStatLabel}>Pending</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>₹{potentialEarnings}</Text>
                <Text style={styles.heroStatLabel}>Potential</Text>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Tips Section */}
        {!loading && !error && (
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Review Tips</Text>
          <View style={styles.tipsGrid}>
            {reviewTips.map((tip, idx) => (
              <View key={idx} style={styles.tipItem}>
                <Ionicons name={tip.icon as any} size={16} color="#F59E0B" />
                <Text style={styles.tipText}>{tip.tip}</Text>
              </View>
            ))}
          </View>
        </View>
        )}

        {/* Filter Tabs */}
        {!loading && !error && (
        <View style={styles.filterTabs}>
          {(['all', 'store', 'product'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, filter === tab && styles.filterTabActive]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.filterTabText, filter === tab && styles.filterTabTextActive]}>
                {tab === 'all' ? 'All' : tab === 'store' ? 'Stores' : 'Products'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        )}

        {/* Empty State */}
        {!loading && !error && filteredItems.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No items to review</Text>
            <Text style={styles.emptySubtext}>Make purchases to unlock review opportunities</Text>
          </View>
        )}

        {/* Reviewable Items */}
        {!loading && !error && filteredItems.length > 0 && (
        <View style={styles.itemsList}>
          <Text style={styles.sectionTitle}>Ready to Review ({filteredItems.length})</Text>

          {filteredItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => handleWriteReview(item)}
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                  <Ionicons name={item.type === 'store' ? 'storefront' : 'cube'} size={24} color="#9CA3AF" />
                </View>
              )}
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.coinBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.coinText}>+{item.coins}</Text>
                  </View>
                </View>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <View style={styles.itemFooter}>
                  <View style={styles.itemMeta}>
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.itemMetaText}>
                      {item.type === 'store' ? item.visitDate : item.purchaseDate}
                    </Text>
                  </View>
                  {item.type === 'store' && item.hasReceipt && (
                    <View style={styles.receiptBadge}>
                      <Ionicons name="receipt-outline" size={12} color="#10B981" />
                      <Text style={styles.receiptText}>Receipt</Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
        )}

        {/* Bottom CTA */}
        {!loading && !error && (
        <View style={styles.bottomSection}>
          <LinearGradient
            colors={['#E0F2FE', '#DBEAFE']}
            style={styles.bottomCard}
          >
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <View style={styles.bottomCardText}>
              <Text style={styles.bottomCardTitle}>More Ways to Earn</Text>
              <Text style={styles.bottomCardSubtitle}>
                Visit partner stores & make purchases to unlock more review opportunities
              </Text>
            </View>
          </LinearGradient>
        </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#F59E0B',
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  heroCard: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#B45309',
  },
  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    padding: 12,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#92400E',
  },
  heroStatLabel: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: '#D97706',
    opacity: 0.3,
  },
  tipsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tipText: {
    fontSize: 12,
    color: '#92400E',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#F59E0B',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  itemsList: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 12,
  },
  itemImagePlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coinText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  itemCategory: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemMetaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  receiptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  receiptText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  bottomSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  bottomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  bottomCardText: {
    flex: 1,
  },
  bottomCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  bottomCardSubtitle: {
    fontSize: 12,
    color: '#3B82F6',
    lineHeight: 18,
  },
});
