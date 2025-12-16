/**
 * Category Stores Page
 *
 * Displays stores within a specific category for ReZ Mall
 * Modern, premium design with smooth animations
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { mallApi } from '../../../services/mallApi';
import MallEmptyState from '../../../components/mall/pages/MallEmptyState';
import MallLoadingSkeleton from '../../../components/mall/pages/MallLoadingSkeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Modern Store Card Component
interface StoreCardProps {
  store: any;
  onPress: (store: any) => void;
  index: number;
}

const StoreCard: React.FC<StoreCardProps> = ({ store, onPress, index }) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const storeImage = store.logo || (store.banner && store.banner[0]);

  // Calculate coin reward
  const coinReward = store.deliveryCategories?.mall?.coinRewardPercentage || 5;

  return (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => onPress(store)}
      activeOpacity={0.7}
    >
      {/* Card Background Gradient */}
      <LinearGradient
        colors={['#FFFFFF', '#FAFAFA']}
        style={styles.cardGradient}
      >
        {/* Top Row: Image + Info */}
        <View style={styles.cardTopRow}>
          {/* Store Image */}
          <View style={styles.imageWrapper}>
            {!imageError && storeImage ? (
              <Image
                source={{ uri: storeImage }}
                style={styles.storeImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <LinearGradient
                colors={['#00C06A', '#00A05A']}
                style={styles.imageFallback}
              >
                <Text style={styles.fallbackText}>{getInitials(store.name)}</Text>
              </LinearGradient>
            )}
            {/* Coin Badge */}
            <View style={styles.coinBadge}>
              <Text style={styles.coinBadgeText}>{coinReward}%</Text>
            </View>
          </View>

          {/* Store Info */}
          <View style={styles.storeInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.storeName} numberOfLines={1}>
                {store.name}
              </Text>
              {store.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color="#00C06A" />
              )}
            </View>

            {/* Rating Row */}
            <View style={styles.ratingContainer}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#FFFFFF" />
                <Text style={styles.ratingValue}>
                  {store.ratings?.average?.toFixed(1) || '4.5'}
                </Text>
              </View>
              <Text style={styles.ratingCount}>
                ({store.ratings?.count || 0} reviews)
              </Text>
            </View>

            {/* Location */}
            {store.location?.city && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                <Text style={styles.locationText}>{store.location.city}</Text>
              </View>
            )}

            {/* Reward Text */}
            <View style={styles.rewardContainer}>
              <Ionicons name="gift-outline" size={14} color="#00C06A" />
              <Text style={styles.rewardText}>Earn {coinReward}% ReZ Coins</Text>
            </View>
          </View>

          {/* Arrow */}
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={22} color="#D1D5DB" />
          </View>
        </View>

        {/* Bottom Row: Badges */}
        <View style={styles.badgesContainer}>
          {store.isFeatured && (
            <View style={[styles.badge, styles.featuredBadge]}>
              <Ionicons name="star" size={10} color="#FFFFFF" />
              <Text style={styles.badgeText}>Featured</Text>
            </View>
          )}
          {store.offers?.isPartner && (
            <View style={[styles.badge, styles.partnerBadge]}>
              <Ionicons name="ribbon" size={10} color="#FFFFFF" />
              <Text style={styles.badgeText}>Partner</Text>
            </View>
          )}
          {store.deliveryCategories?.mall?.isPremium && (
            <View style={[styles.badge, styles.premiumBadge]}>
              <Ionicons name="diamond" size={10} color="#FFFFFF" />
              <Text style={styles.badgeText}>Premium</Text>
            </View>
          )}
          {store.category?.name && (
            <View style={[styles.badge, styles.categoryBadge]}>
              <Text style={styles.categoryBadgeText}>{store.category.name}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function CategoryStoresPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [category, setCategory] = useState<any>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const LIMIT = 20;

  const fetchCategoryStores = useCallback(async (
    pageNum: number = 1,
    append: boolean = false
  ) => {
    if (!slug) return;

    try {
      setError(null);
      const result = await mallApi.getMallStoresByCategorySlug(slug, pageNum, LIMIT);

      setCategory(result.category);
      setTotal(result.total);
      setTotalPages(result.pages);

      if (append) {
        setStores(prev => [...prev, ...result.stores]);
      } else {
        setStores(result.stores);
      }
    } catch (err: any) {
      console.error('Error fetching category stores:', err);
      setError(err.message || 'Failed to load category');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [slug]);

  useEffect(() => {
    setIsLoading(true);
    setPage(1);
    fetchCategoryStores(1, false);
  }, [slug]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPage(1);
    fetchCategoryStores(1, false);
  }, [fetchCategoryStores]);

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || page >= totalPages) {
      return;
    }
    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCategoryStores(nextPage, true);
  }, [page, totalPages, isLoadingMore, fetchCategoryStores]);

  const handleStorePress = useCallback((store: any) => {
    // Navigate to main store page
    router.push(`/MainStorePage?storeId=${store._id}` as any);
  }, [router]);

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => (
    <StoreCard store={item} onPress={handleStorePress} index={index} />
  ), [handleStorePress]);

  const keyExtractor = useCallback((item: any) =>
    item._id || item.id, []);

  const ListHeader = useCallback(() => (
    <View>
      {/* Hero Section */}
      <LinearGradient
        colors={[category?.color || '#00C06A', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroSection, { paddingTop: insets.top + 60 }]}
      >
        {/* Decorative Elements */}
        <View style={styles.heroDecoration}>
          <View style={[styles.decorCircle, styles.decorCircle1]} />
          <View style={[styles.decorCircle, styles.decorCircle2]} />
          <View style={[styles.decorCircle, styles.decorCircle3]} />
        </View>

        {/* Category Icon */}
        <View style={styles.categoryIconContainer}>
          {category?.icon ? (
            <Text style={styles.categoryIconEmoji}>{category.icon}</Text>
          ) : (
            <Ionicons name="grid-outline" size={40} color="#FFFFFF" />
          )}
        </View>

        {/* Category Name */}
        <Text style={styles.categoryTitle}>{category?.name || 'Category'}</Text>

        {/* Description */}
        {category?.description && (
          <Text style={styles.categoryDescription}>{category.description}</Text>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{total}</Text>
            <Text style={styles.statLabel}>Stores</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <View style={styles.coinIconContainer}>
              <Ionicons name="gift" size={18} color="#FFD700" />
            </View>
            <Text style={styles.statLabel}>Earn Coins</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>All Stores</Text>
        <Text style={styles.resultsCount}>{stores.length} of {total}</Text>
      </View>
    </View>
  ), [category, stores.length, total, insets.top]);

  const ListFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color="#00C06A" />
          <Text style={styles.loadingMoreText}>Loading more stores...</Text>
        </View>
      );
    }
    return <View style={{ height: insets.bottom + 100 }} />;
  }, [isLoadingMore, insets.bottom]);

  const ListEmpty = useCallback(() => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <MallEmptyState
          title="No stores yet"
          message="We're adding more stores to this category soon!"
          icon="storefront-outline"
          actionLabel="Browse Mall"
          onAction={() => router.push('/mall' as any)}
        />
      </View>
    );
  }, [isLoading, router]);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <MallLoadingSkeleton count={6} type="list" />
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
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
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* Custom Back Button */}
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <View style={styles.backButtonInner}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <FlatList
          data={stores}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={ListEmpty}
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
    backgroundColor: '#F3F4F6',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 100,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  // Hero Section
  heroSection: {
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroDecoration: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorCircle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  decorCircle2: {
    width: 150,
    height: 150,
    bottom: -30,
    left: -30,
  },
  decorCircle3: {
    width: 80,
    height: 80,
    top: 60,
    left: 40,
  },
  categoryIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryIconEmoji: {
    fontSize: 40,
  },
  categoryTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  categoryDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  coinIconContainer: {
    marginBottom: 2,
  },
  // Results Header
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  // Store Card
  storeCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
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
  cardGradient: {
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
  },
  storeImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  imageFallback: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  coinBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: '#00C06A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  coinBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  storeInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  storeName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ratingCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#6B7280',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00C06A',
  },
  arrowContainer: {
    paddingLeft: 8,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featuredBadge: {
    backgroundColor: '#F59E0B',
  },
  partnerBadge: {
    backgroundColor: '#8B5CF6',
  },
  premiumBadge: {
    backgroundColor: '#EC4899',
  },
  categoryBadge: {
    backgroundColor: '#E5E7EB',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  // Loading & Empty States
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
});
