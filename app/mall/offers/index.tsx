/**
 * All Offers Page
 *
 * Displays all mall offers with countdown timers
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { mallApi } from '../../../services/mallApi';
import { MallOffer, getDaysRemaining, formatValueDisplay } from '../../../types/mall.types';
import MallEmptyState from '../../../components/mall/pages/MallEmptyState';
import MallLoadingSkeleton from '../../../components/mall/pages/MallLoadingSkeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OFFER_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  'limited-time': { bg: '#EF4444', text: '#FFFFFF' },
  'mall-exclusive': { bg: '#00C06A', text: '#FFFFFF' },
  'flash-sale': { bg: '#F59E0B', text: '#FFFFFF' },
  'best-deal': { bg: '#8B5CF6', text: '#FFFFFF' },
};

interface OfferCardProps {
  offer: MallOffer;
  onPress: (offer: MallOffer) => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, onPress }) => {
  const daysRemaining = getDaysRemaining(offer.validUntil);
  const valueDisplay = formatValueDisplay(offer.value, offer.valueType);
  const badgeStyle = offer.badge ? OFFER_BADGE_COLORS[offer.badge] : null;

  return (
    <TouchableOpacity
      style={styles.offerCard}
      onPress={() => onPress(offer)}
      activeOpacity={0.9}
    >
      <View style={styles.offerImageContainer}>
        <Image
          source={{ uri: offer.image }}
          style={styles.offerImage}
          resizeMode="cover"
        />
        {offer.badge && badgeStyle && (
          <View style={[styles.offerBadge, { backgroundColor: badgeStyle.bg }]}>
            <Text style={[styles.offerBadgeText, { color: badgeStyle.text }]}>
              {offer.badge.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.valueTag}>
          <Text style={styles.valueTagText}>{valueDisplay}</Text>
        </View>
      </View>

      <View style={styles.offerContent}>
        <View style={styles.brandRow}>
          {offer.brand?.logo && (
            <Image
              source={{ uri: offer.brand.logo }}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          )}
          <Text style={styles.brandName}>{offer.brand?.name}</Text>
        </View>

        <Text style={styles.offerTitle} numberOfLines={2}>
          {offer.title}
        </Text>

        {offer.subtitle && (
          <Text style={styles.offerSubtitle} numberOfLines={1}>
            {offer.subtitle}
          </Text>
        )}

        <View style={styles.offerFooter}>
          <View style={styles.validityRow}>
            <Ionicons
              name={daysRemaining <= 3 ? 'time-outline' : 'calendar-outline'}
              size={14}
              color={daysRemaining <= 3 ? '#EF4444' : '#6B7280'}
            />
            <Text
              style={[
                styles.validityText,
                daysRemaining <= 3 && styles.validityTextUrgent,
              ]}
            >
              {daysRemaining === 0
                ? 'Ends today!'
                : daysRemaining === 1
                ? '1 day left'
                : `${daysRemaining} days left`}
            </Text>
          </View>

          {offer.minPurchase && (
            <Text style={styles.minPurchase}>Min. ₹{offer.minPurchase}</Text>
          )}
        </View>

        {offer.isMallExclusive && (
          <View style={styles.exclusiveTag}>
            <Ionicons name="star" size={12} color="#00C06A" />
            <Text style={styles.exclusiveText}>Mall Exclusive</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function AllOffersPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [offers, setOffers] = useState<MallOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const LIMIT = 20;

  const fetchOffers = useCallback(async (
    pageNum: number = 1,
    append: boolean = false
  ) => {
    try {
      setError(null);
      const result = await mallApi.getOffers(pageNum, LIMIT);

      setTotal(result.total);

      if (append) {
        setOffers(prev => [...prev, ...result.offers]);
      } else {
        setOffers(result.offers);
      }
    } catch (err: any) {
      console.error('Error fetching offers:', err);
      setError(err.message || 'Failed to load offers');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers(1, false);
  }, [fetchOffers]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPage(1);
    fetchOffers(1, false);
  }, [fetchOffers]);

  const handleLoadMore = useCallback(() => {
    const totalPages = Math.ceil(total / LIMIT);
    if (isLoadingMore || page >= totalPages) {
      return;
    }
    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOffers(nextPage, true);
  }, [page, total, isLoadingMore, fetchOffers]);

  const handleOfferPress = useCallback((offer: MallOffer) => {
    if (offer.brand) {
      router.push(`/mall/brand/${offer.brand.id || offer.brand._id}` as any);
    }
  }, [router]);

  const renderItem = useCallback(({ item }: { item: MallOffer }) => (
    <OfferCard offer={item} onPress={handleOfferPress} />
  ), [handleOfferPress]);

  const keyExtractor = useCallback((item: MallOffer) =>
    item.id || item._id, []);

  const ListHeader = useCallback(() => (
    <View style={styles.listHeader}>
      <LinearGradient
        colors={['#F59E0B', '#D97706']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Ionicons name="gift-outline" size={32} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Exclusive Offers</Text>
        <Text style={styles.headerSubtitle}>
          Limited-time deals with extra cashback
        </Text>
      </LinearGradient>
      <View style={styles.countRow}>
        <Text style={styles.resultCount}>
          {offers.length} of {total} offers
        </Text>
      </View>
    </View>
  ), [offers.length, total]);

  const ListFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color="#00C06A" />
        </View>
      );
    }
    return null;
  }, [isLoadingMore]);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: 'Exclusive Offers' }} />
        <View style={styles.container}>
          <MallLoadingSkeleton count={4} type="list" />
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: 'Exclusive Offers' }} />
        <View style={styles.container}>
          <MallEmptyState
            title="Something went wrong"
            message={error}
            icon="alert-circle-outline"
            actionLabel="Try Again"
            onAction={handleRefresh}
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Exclusive Offers' }} />

      <View style={styles.container}>
        <FlatList
          data={offers}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={
            <MallEmptyState
              title="No offers available"
              message="Check back later for exclusive deals"
              icon="gift-outline"
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#00C06A"
              colors={['#00C06A']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    paddingBottom: 24,
  },
  listHeader: {
    marginBottom: 8,
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  countRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  offerCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  offerImageContainer: {
    height: 140,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  offerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  offerBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  offerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  valueTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#00C06A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  valueTagText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  offerContent: {
    padding: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#F9FAFB',
  },
  brandName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  offerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 22,
  },
  offerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  offerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  validityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  validityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  validityTextUrgent: {
    color: '#EF4444',
  },
  minPurchase: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  exclusiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
    backgroundColor: '#ECFDF5',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  exclusiveText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
