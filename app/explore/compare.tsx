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
import exploreApi, { FeaturedComparison } from '@/services/exploreApi';

const { width } = Dimensions.get('window');

interface ComparisonItem {
  id: string;
  name: string;
  category: string;
  stores: {
    id: string;
    name: string;
    logo?: string;
    cashbackRate: number;
    rating?: number;
    price?: number;
  }[];
  bestDeal?: string;
}

const ComparePage = () => {
  const router = useRouter();
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComparisons = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch featured comparison
      const response = await exploreApi.getFeaturedComparison();

      if (response.success && response.data?.comparison) {
        const comp = response.data.comparison;
        // Create a list with the featured comparison
        const comparisonList: ComparisonItem[] = [{
          id: comp.id,
          name: comp.name,
          category: 'Featured',
          stores: comp.stores.map(s => ({
            id: s.id,
            name: s.name,
            logo: s.logo,
            cashbackRate: s.cashbackRate || 0,
            rating: s.ratings,
          })),
          bestDeal: comp.stores.length > 0 ? comp.stores[0].name : undefined,
        }];
        setComparisons(comparisonList);
      } else {
        setComparisons([]);
      }
    } catch (err: any) {
      console.error('[COMPARE PAGE] Error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchComparisons();
  }, [fetchComparisons]);

  const onRefresh = useCallback(() => {
    fetchComparisons(true);
  }, [fetchComparisons]);

  const navigateToStore = (storeId: string) => {
    router.push(`/MainStorePage?id=${storeId}` as any);
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
            <Text style={styles.headerTitle}>Compare & Decide</Text>
            <Text style={styles.headerSubtitle}>Find the best deals across stores</Text>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.infoText}>
            Compare prices and cashback rates to get the best value
          </Text>
        </View>

        {/* Comparisons List */}
        <ScrollView
          style={styles.comparisonsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.comparisonsContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00C06A']} />
          }
        >
          {/* Loading State */}
          {loading && !refreshing && (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#00C06A" />
              <Text style={styles.loadingText}>Loading comparisons...</Text>
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
          {!loading && !error && comparisons.length === 0 && (
            <View style={styles.centerContainer}>
              <Ionicons name="git-compare-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No Comparisons Available</Text>
              <Text style={styles.emptySubtext}>
                Start shopping to see price comparisons across stores
              </Text>
            </View>
          )}

          {/* Comparison Cards */}
          {!loading && !error && comparisons.map((comparison) => (
            <View key={comparison.id} style={styles.comparisonCard}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.comparisonName}>{comparison.name}</Text>
                  <Text style={styles.comparisonCategory}>{comparison.category}</Text>
                </View>
                {comparison.bestDeal && (
                  <View style={styles.bestDealBadge}>
                    <Ionicons name="trophy" size={12} color="#F59E0B" />
                    <Text style={styles.bestDealText}>Best: {comparison.bestDeal}</Text>
                  </View>
                )}
              </View>

              {/* Stores Table */}
              <View style={styles.storesTable}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 2 }]}>Store</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Cashback</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Rating</Text>
                </View>

                {/* Store Rows */}
                {comparison.stores.map((store, index) => (
                  <TouchableOpacity
                    key={store.id}
                    style={[
                      styles.storeRow,
                      index === 0 && styles.storeRowBest,
                    ]}
                    onPress={() => navigateToStore(store.id)}
                  >
                    <View style={[styles.storeCell, { flex: 2 }]}>
                      {store.logo ? (
                        <Image source={{ uri: store.logo }} style={styles.storeLogo} />
                      ) : (
                        <View style={[styles.storeLogo, styles.storeLogoPlaceholder]}>
                          <Ionicons name="storefront" size={16} color="#9CA3AF" />
                        </View>
                      )}
                      <Text style={styles.storeName}>{store.name}</Text>
                      {index === 0 && (
                        <View style={styles.topBadge}>
                          <Ionicons name="checkmark-circle" size={14} color="#00C06A" />
                        </View>
                      )}
                    </View>
                    <View style={[styles.storeCell, { flex: 1, justifyContent: 'center' }]}>
                      <View style={[
                        styles.cashbackBadge,
                        index === 0 && styles.cashbackBadgeBest,
                      ]}>
                        <Text style={[
                          styles.cashbackText,
                          index === 0 && styles.cashbackTextBest,
                        ]}>
                          {store.cashbackRate > 0 ? `${store.cashbackRate}%` : 'N/A'}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.storeCell, { flex: 1, justifyContent: 'flex-end' }]}>
                      {store.rating ? (
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={14} color="#F59E0B" />
                          <Text style={styles.ratingText}>{store.rating.toFixed(1)}</Text>
                        </View>
                      ) : (
                        <Text style={styles.naText}>N/A</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.viewStoreButton}
                onPress={() => comparison.stores[0] && navigateToStore(comparison.stores[0].id)}
              >
                <Text style={styles.viewStoreText}>View Best Deal</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}

          {/* How It Works Section */}
          <View style={styles.howItWorksCard}>
            <Text style={styles.howItWorksTitle}>How Compare Works</Text>
            <View style={styles.howItWorksItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>We find the same product</Text>
                <Text style={styles.stepDesc}>Across multiple stores near you</Text>
              </View>
            </View>
            <View style={styles.howItWorksItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Compare cashback rates</Text>
                <Text style={styles.stepDesc}>See which store gives you more back</Text>
              </View>
            </View>
            <View style={styles.howItWorksItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Make the smart choice</Text>
                <Text style={styles.stepDesc}>Shop where you save the most</Text>
              </View>
            </View>
          </View>

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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#3B82F6',
    flex: 1,
  },
  comparisonsList: {
    flex: 1,
  },
  comparisonsContainer: {
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
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  comparisonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  comparisonName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
  },
  comparisonCategory: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  bestDealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  bestDealText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
  },
  storesTable: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  storeRowBest: {
    backgroundColor: '#F0FDF4',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  storeCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  storeLogoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
    marginLeft: 10,
    flex: 1,
  },
  topBadge: {
    marginLeft: 4,
  },
  cashbackBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashbackBadgeBest: {
    backgroundColor: '#00C06A',
  },
  cashbackText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  cashbackTextBest: {
    color: '#FFFFFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  naText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  viewStoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00C06A',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  viewStoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  howItWorksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2240',
    marginBottom: 16,
  },
  howItWorksItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00C06A',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
  },
  stepDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default ComparePage;
