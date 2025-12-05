// Store Promo Coins Page
// Shows all store-specific promo coins earned by the user

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { storePromoCoinApi, StorePromoCoinDetails } from '@/services/storePromoCoinApi';
import { showToast } from '@/components/common/ToastManager';

interface StorePromoCoinSummary {
  totalAvailable: number;
  totalEarned: number;
  totalUsed: number;
  storeCount: number;
}

export default function StorePromoCoinsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [storeCoins, setStoreCoins] = useState<StorePromoCoinDetails[]>([]);
  const [summary, setSummary] = useState<StorePromoCoinSummary>({
    totalAvailable: 0,
    totalEarned: 0,
    totalUsed: 0,
    storeCount: 0,
  });

  // Fetch store promo coins
  const fetchStoreCoins = async () => {
    try {
      setLoading(true);
      const response = await storePromoCoinApi.getUserStorePromoCoins();
      
      if (response.success && response.data) {
        setStoreCoins(response.data.storeCoins || []);
        setSummary(response.data.summary || {
          totalAvailable: 0,
          totalEarned: 0,
          totalUsed: 0,
          storeCount: 0,
        });
      }
    } catch (error: any) {
      console.error('❌ [STORE PROMO COINS PAGE] Error fetching data:', error);
      showToast({
        message: error.message || 'Failed to load store promo coins',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStoreCoins();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStoreCoins();
  };

  const getStoreLogo = (store: any): string | undefined => {
    if (typeof store === 'object' && store.logo) {
      return store.logo;
    }
    return undefined;
  };

  const getStoreName = (store: any): string => {
    if (typeof store === 'object' && store.name) {
      return store.name;
    }
    return 'Store';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#00C06A', '#00796B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Double tap to return to previous screen"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Store Promo Coins</ThemedText>
          <View style={styles.headerPlaceholder} />
        </View>
        
        <View style={styles.headerInfo}>
          <ThemedText style={styles.headerSubtitle}>
            Earn & redeem exclusive store coins
          </ThemedText>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <View
              style={[styles.summaryCard, { backgroundColor: '#10B981' }]}
              accessibilityLabel={`Available promo coins: ${summary.totalAvailable}`}
              accessibilityRole="summary"
            >
              <Ionicons name="diamond" size={24} color="#FFFFFF" />
              <ThemedText style={styles.summaryValue}>
                {summary.totalAvailable}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Available</ThemedText>
            </View>

            <View
              style={[styles.summaryCard, { backgroundColor: '#3B82F6' }]}
              accessibilityLabel={`Total coins earned: ${summary.totalEarned}`}
              accessibilityRole="summary"
            >
              <Ionicons name="trending-up" size={24} color="#FFFFFF" />
              <ThemedText style={styles.summaryValue}>
                {summary.totalEarned}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Earned</ThemedText>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View
              style={[styles.summaryCard, { backgroundColor: '#F59E0B' }]}
              accessibilityLabel={`Coins used: ${summary.totalUsed}`}
              accessibilityRole="summary"
            >
              <Ionicons name="cart" size={24} color="#FFFFFF" />
              <ThemedText style={styles.summaryValue}>
                {summary.totalUsed}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Used</ThemedText>
            </View>

            <View
              style={[styles.summaryCard, { backgroundColor: '#00C06A' }]}
              accessibilityLabel={`Active stores: ${summary.storeCount}`}
              accessibilityRole="summary"
            >
              <Ionicons name="storefront" size={24} color="#FFFFFF" />
              <ThemedText style={styles.summaryValue}>
                {summary.storeCount}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Stores</ThemedText>
            </View>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#00C06A" />
          <ThemedText style={styles.infoBannerText}>
            Promo coins are store-specific and can only be used at the store where they were earned.
          </ThemedText>
        </View>

        {/* Store Coins List */}
        <View style={styles.storeListContainer}>
          <ThemedText style={styles.sectionTitle}>Your Store Coins</ThemedText>

          {loading && storeCoins.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>Loading...</ThemedText>
            </View>
          ) : storeCoins.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="diamond-outline" size={64} color="#9CA3AF" />
              <ThemedText style={styles.emptyTitle}>No Promo Coins Yet</ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                Complete orders to earn store-specific promo coins!
              </ThemedText>
            </View>
          ) : (
            storeCoins.map((storeCoin) => (
              <View
                key={storeCoin._id}
                style={styles.storeCard}
                accessibilityLabel={`${getStoreName(storeCoin.store)}. Available: ${storeCoin.amount} coins. Earned: ${storeCoin.earned}, Used: ${storeCoin.used}${storeCoin.expiryDate ? `. Expires ${new Date(storeCoin.expiryDate).toLocaleDateString()}` : ''}`}
                accessibilityRole="summary"
              >
                <View style={styles.storeCardHeader}>
                  {getStoreLogo(storeCoin.store) ? (
                    <Image
                      source={{ uri: getStoreLogo(storeCoin.store) }}
                      style={styles.storeLogo}
                    />
                  ) : (
                    <View style={[styles.storeLogo, styles.storeLogoPlaceholder]}>
                      <Ionicons name="storefront" size={24} color="#00C06A" />
                    </View>
                  )}

                  <View style={styles.storeCardInfo}>
                    <ThemedText style={styles.storeName}>
                      {getStoreName(storeCoin.store)}
                    </ThemedText>
                    <ThemedText style={styles.storeLastEarned}>
                      {storeCoin.lastEarnedAt
                        ? `Last earned: ${new Date(storeCoin.lastEarnedAt).toLocaleDateString()}`
                        : 'No earnings yet'}
                    </ThemedText>
                  </View>

                  <View style={styles.coinBadge}>
                    <Ionicons name="diamond" size={16} color="#FFD700" />
                    <ThemedText style={styles.coinBadgeText}>
                      {storeCoin.amount}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.storeCardStats}>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statValue}>
                      {storeCoin.earned}
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>Earned</ThemedText>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statItem}>
                    <ThemedText style={styles.statValue}>
                      {storeCoin.used}
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>Used</ThemedText>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statItem}>
                    <ThemedText style={styles.statValue}>
                      {storeCoin.transactions.length}
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>Txns</ThemedText>
                  </View>
                </View>

                {storeCoin.expiryDate && (
                  <View style={styles.expiryContainer}>
                    <Ionicons name="time-outline" size={14} color="#F59E0B" />
                    <ThemedText style={styles.expiryText}>
                      Expires: {new Date(storeCoin.expiryDate).toLocaleDateString()}
                    </ThemedText>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerPlaceholder: {
    width: 40,
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  summaryContainer: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1F7E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#006B52',
    lineHeight: 18,
  },
  storeListContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  storeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  storeLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  storeLogoPlaceholder: {
    backgroundColor: '#E6F7F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  storeLastEarned: {
    fontSize: 12,
    color: '#6B7280',
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  coinBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00C06A',
  },
  storeCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 6,
  },
  expiryText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
});

