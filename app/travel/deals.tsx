/**
 * Hot Deals Page - All featured travel deals
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import travelApi, { TravelService } from '@/services/travelApi';

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  cyan500: '#06B6D4',
  amber500: '#F59E0B',
};

const HotDealsPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deals, setDeals] = useState<TravelService[]>([]);

  const fetchDeals = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await travelApi.getFeatured(20);
      if (response.success && response.data) {
        setDeals(response.data);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchDeals();
  }, [fetchDeals]);

  const handleDealPress = (service: TravelService) => {
    const serviceId = service._id || service.id;
    if (!serviceId) return;

    const category = service.serviceCategory?.slug || 'packages';
    
    // Route to appropriate detail page based on category
    if (category === 'flights') {
      router.push(`/flight/${serviceId}` as any);
    } else if (category === 'hotels') {
      router.push(`/hotel/${serviceId}` as any);
    } else if (category === 'trains') {
      router.push(`/train/${serviceId}` as any);
    } else if (category === 'bus') {
      router.push(`/bus/${serviceId}` as any);
    } else if (category === 'cab') {
      router.push(`/cab/${serviceId}` as any);
    } else if (category === 'packages') {
      router.push(`/package/${serviceId}` as any);
    } else {
      router.push(`/product/${serviceId}` as any);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.cyan500} />
        <Text style={styles.loadingText}>Loading hot deals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#06B6D4', '#0891B2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Hot Deals</Text>
            <Text style={styles.headerSubtitle}>Best travel offers</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.cyan500]} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {deals.length > 0 ? (
          <View style={styles.dealsGrid}>
            {deals.map((deal) => {
              const dealId = deal._id || deal.id;
              const imageUrl = deal.images?.[0] || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400';
              const price = deal.pricing?.selling || 0;
              const cashback = deal.cashback?.percentage || deal.serviceCategory?.cashbackPercentage || 0;
              const rating = deal.ratings?.average || 0;

              return (
                <TouchableOpacity
                  key={dealId}
                  style={styles.dealCard}
                  onPress={() => handleDealPress(deal)}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: imageUrl }} style={styles.dealImage} />
                  {cashback > 0 && (
                    <View style={styles.cashbackBadge}>
                      <Text style={styles.cashbackText}>{cashback}%</Text>
                    </View>
                  )}
                  <View style={styles.dealInfo}>
                    <Text style={styles.dealName} numberOfLines={2}>{deal.name}</Text>
                    <View style={styles.dealMeta}>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color={COLORS.amber500} />
                        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                      </View>
                      <Text style={styles.dealCategory}>{deal.serviceCategory?.name || 'Travel'}</Text>
                    </View>
                    <Text style={styles.dealPrice}>
                      {price > 0 ? `From ₹${price.toLocaleString('en-IN')}` : 'Price on request'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="flame-outline" size={64} color={COLORS.gray600} />
            <Text style={styles.emptyTitle}>No Hot Deals Available</Text>
            <Text style={styles.emptySubtitle}>Check back later for exciting offers!</Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  scrollContent: {
    padding: 16,
  },
  dealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dealCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginBottom: 12,
  },
  dealImage: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.gray100,
  },
  cashbackBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.green500,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  dealInfo: {
    padding: 12,
  },
  dealName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 8,
    minHeight: 40,
  },
  dealMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
  },
  dealCategory: {
    fontSize: 11,
    color: COLORS.gray600,
    textTransform: 'uppercase',
  },
  dealPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.green500,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
  },
});

export default HotDealsPage;
