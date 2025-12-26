import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { storesApi } from '@/services/storesApi';

interface TrendingStore {
  id: string;
  name: string;
  image: string;
  category: string;
  trending: string; // e.g., "324 people"
  cashback: string; // e.g., "15%"
}

interface TrendingNearYouProps {
  onViewAllPress?: () => void;
  onStorePress?: (storeId: string) => void;
}

// Transform backend store data to frontend TrendingStore format
const transformStoreData = (backendStore: any): TrendingStore => {
  // Get store ID
  const id = backendStore._id || backendStore.id || '';

  // Get store name
  const name = backendStore.name || 'Unknown Store';

  // Get image - try banner first, then logo
  let image = '';
  if (backendStore.banner) {
    image = Array.isArray(backendStore.banner)
      ? backendStore.banner[0] || ''
      : backendStore.banner;
  } else if (backendStore.logo) {
    image = backendStore.logo;
  } else if (backendStore.image) {
    image = Array.isArray(backendStore.image)
      ? backendStore.image[0] || ''
      : backendStore.image;
  }

  // Get category - handle string or object
  let category = 'General';
  if (typeof backendStore.category === 'string') {
    category = backendStore.category;
  } else if (backendStore.category?.name) {
    category = backendStore.category.name;
  }

  // Get trending count - use recentOrders from backend
  const recentOrders = backendStore.recentOrders || 0;
  const trending = `${recentOrders} people`;

  // Get cashback percentage
  const cashbackPercent = backendStore.offers?.cashback ||
    backendStore.rewardRules?.baseCashbackPercent ||
    10; // Default 10%
  const cashback = `${cashbackPercent}%`;

  return {
    id,
    name,
    image,
    category,
    trending,
    cashback,
  };
};

// Skeleton card component for loading state
const SkeletonCard: React.FC = () => {
  const [shimmerAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.storeCard}>
      <Animated.View style={[styles.skeletonImage, { opacity }]} />
      <View style={styles.storeInfo}>
        <Animated.View style={[styles.skeletonName, { opacity }]} />
        <Animated.View style={[styles.skeletonCategory, { opacity }]} />
        <View style={styles.storeFooter}>
          <Animated.View style={[styles.skeletonCashback, { opacity }]} />
          <Animated.View style={[styles.skeletonCoins, { opacity }]} />
        </View>
      </View>
    </View>
  );
};

const TrendingNearYou: React.FC<TrendingNearYouProps> = ({
  onViewAllPress,
  onStorePress,
}) => {
  const router = useRouter();
  const [stores, setStores] = useState<TrendingStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trending stores from API
  const fetchTrendingStores = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await storesApi.getTrendingStores({
        limit: 4,
        days: 7,
      });

      if (response.success && response.data?.stores) {
        const transformedStores = response.data.stores
          .filter((store: any) => store && store._id) // Filter out undefined/null stores
          .map(transformStoreData);
        setStores(transformedStores);
      } else {
        setError(response.error || 'Failed to load trending stores');
      }
    } catch (err: any) {
      console.error('Error fetching trending stores:', err);
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingStores();
  }, [fetchTrendingStores]);

  const handleStorePress = (storeId: string) => {
    if (onStorePress) {
      onStorePress(storeId);
    } else {
      router.push(`/store/${storeId}`);
    }
  };

  const handleViewAll = () => {
    if (onViewAllPress) {
      onViewAllPress();
    } else {
      router.push('/explore/trending');
    }
  };

  const handleRetry = () => {
    fetchTrendingStores();
  };

  // Render loading skeleton
  const renderLoading = () => (
    <View style={styles.grid}>
      {[1, 2, 3, 4].map((key) => (
        <SkeletonCard key={key} />
      ))}
    </View>
  );

  // Render error state
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={48} color="#F97316" />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        onPress={handleRetry}
        activeOpacity={0.7}
        style={styles.retryButton}
      >
        <Ionicons name="refresh" size={16} color="#FFFFFF" />
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="storefront-outline" size={48} color="#9CA3AF" />
      <Text style={styles.emptyText}>No trending stores found</Text>
    </View>
  );

  // Render stores grid
  const renderStores = () => (
    <View style={styles.grid}>
      {stores.map((store) => (
        <TouchableOpacity
          key={store.id}
          onPress={() => handleStorePress(store.id)}
          activeOpacity={0.9}
          style={styles.storeCard}
        >
          {/* Image Container */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: store.image || 'https://via.placeholder.com/150x150?text=Store' }}
              style={styles.storeImage}
              resizeMode="cover"
            />
            {/* Trending Badge */}
            <View style={styles.trendingBadge}>
              <Ionicons name="flame" size={10} color="#FFFFFF" />
              <Text style={styles.trendingText}>{store.trending}</Text>
            </View>
          </View>

          {/* Store Info */}
          <View style={styles.storeInfo}>
            <Text style={styles.storeName} numberOfLines={1}>
              {store.name}
            </Text>
            <Text style={styles.storeCategory} numberOfLines={1}>
              {store.category}
            </Text>
            <View style={styles.storeFooter}>
              <Text style={styles.cashbackText}>
                {store.cashback} cashback
              </Text>
              <View style={styles.coinsContainer}>
                <Ionicons name="star" size={12} color="#FBBF24" />
                <Text style={styles.coinsText}>Coins</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="flame" size={20} color="#F97316" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Trending Near You</Text>
            <Text style={styles.subtitle}>Popular in your area</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleViewAll}
          activeOpacity={0.7}
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={14} color="#00C06A" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading && renderLoading()}
      {!loading && error && renderError()}
      {!loading && !error && stores.length === 0 && renderEmpty()}
      {!loading && !error && stores.length > 0 && renderStores()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  headerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.15)',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00C06A',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  storeCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  imageContainer: {
    width: '100%',
    height: 96,
    position: 'relative',
  },
  storeImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  trendingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(249, 115, 22, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  storeInfo: {
    padding: 12,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2240',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  storeCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  storeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FBBF24',
  },
  // Skeleton styles
  skeletonImage: {
    width: '100%',
    height: 96,
    backgroundColor: '#E5E7EB',
  },
  skeletonName: {
    width: '80%',
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonCategory: {
    width: '50%',
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonCashback: {
    width: 60,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skeletonCoins: {
    width: 40,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  // Error styles
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Empty styles
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default TrendingNearYou;
