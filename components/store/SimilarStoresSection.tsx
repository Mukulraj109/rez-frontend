import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import StoreCard from '@/components/homepage/cards/StoreCard';
import storesApi from '@/services/storesApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isTablet = SCREEN_WIDTH >= 768;

interface SimilarStoresSectionProps {
  currentStoreId: string;
  currentStoreCategory?: string;
  onStorePress?: (storeId: string, storeData: any) => void;
  limit?: number;
}

interface Store {
  id?: string;
  _id?: string;
  name: string;
  category?: string;
  description?: string;
  image?: string;
  rating?: number;
  distance?: string;
  [key: string]: any;
}

const SimilarStoresSection: React.FC<SimilarStoresSectionProps> = ({
  currentStoreId,
  currentStoreCategory,
  onStorePress,
  limit = 8,
}) => {
  console.log('🏪 [SimilarStoresSection] Rendering with:', { currentStoreId, currentStoreCategory });
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSimilarStores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await storesApi.getFeaturedStores(limit);

      if (response?.data) {
        // Filter out current store
        let filteredStores = response.data.filter(
          (store: Store) =>
            store.id !== currentStoreId &&
            store._id !== currentStoreId
        );

        // Optional: Filter by category if provided
        if (currentStoreCategory) {
          const categoryStores = filteredStores.filter(
            (store: Store) =>
              store.category?.toLowerCase() === currentStoreCategory.toLowerCase()
          );

          // If we have category matches, prioritize them, otherwise show all
          if (categoryStores.length > 0) {
            filteredStores = categoryStores;
          }
        }

        setStores(filteredStores);
        console.log('🏪 [SimilarStoresSection] Fetched stores:', {
          total: response.data.length,
          filtered: filteredStores.length,
          stores: filteredStores.slice(0, 2)
        });
      } else {
        setStores([]);
        console.log('🏪 [SimilarStoresSection] No data in response');
      }
    } catch (err) {
      console.error('🏪 [SimilarStoresSection] Error fetching similar stores:', err);
      setError('Failed to load similar stores');
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [currentStoreId, currentStoreCategory, limit]);

  useEffect(() => {
    fetchSimilarStores();
  }, [fetchSimilarStores]);

  const handleStorePress = (store: Store) => {
    const storeId = store.id || store._id || '';

    if (onStorePress) {
      onStorePress(storeId, store);
    } else {
      router.push({
        pathname: '/MainStorePage',
        params: {
          storeId: storeId,
          storeName: store.name,
          storeData: JSON.stringify(store),
        },
      });
    }
  };

  const handleViewAll = () => {
    router.push('/StoreListPage');
  };

  const handleRetry = () => {
    fetchSimilarStores();
  };

  // Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Explore Similar Stores</ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B46C1" />
          <ThemedText style={styles.loadingText}>Loading stores...</ThemedText>
        </View>
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Explore Similar Stores</ThemedText>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Empty State
  if (stores.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Explore Similar Stores</ThemedText>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="storefront-outline" size={48} color="#9CA3AF" />
          <ThemedText style={styles.emptyText}>No similar stores found</ThemedText>
          <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAll}>
            <ThemedText style={styles.viewAllButtonText}>Browse All Stores</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Success State - Show Stores
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Explore Similar Stores</ThemedText>
        <TouchableOpacity
          style={styles.viewAllLink}
          onPress={handleViewAll}
          accessibilityLabel="View all stores"
          accessibilityRole="button"
        >
          <ThemedText style={styles.viewAllText}>View All</ThemedText>
          <Ionicons name="chevron-forward" size={16} color="#6B46C1" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={stores}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item.id || item._id || `store-${index}`}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <StoreCard
              store={item}
              onPress={() => handleStorePress(item)}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={() => <View style={styles.listFooter} />}
        initialNumToRender={isWeb ? 8 : 4}
        maxToRenderPerBatch={isWeb ? 8 : 4}
        windowSize={isWeb ? 10 : 5}
        removeClippedSubviews={Platform.OS === 'android'}
        accessibilityLabel="Similar stores list"
      />

      {/* View All Button - Bottom */}
      <TouchableOpacity
        style={styles.bottomViewAllButton}
        onPress={handleViewAll}
        accessibilityLabel="View all stores"
        accessibilityRole="button"
      >
        <ThemedText style={styles.bottomViewAllText}>View All Stores</ThemedText>
        <Ionicons name="arrow-forward" size={20} color="#6B46C1" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  viewAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B46C1',
  },
  listContent: {
    paddingVertical: 4,
  },
  cardWrapper: {
    width: isTablet ? 280 : isWeb ? 260 : 240,
  },
  separator: {
    width: 12,
  },
  listFooter: {
    width: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6B46C1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  viewAllButton: {
    marginTop: 16,
    backgroundColor: '#6B46C1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  viewAllButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomViewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bottomViewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B46C1',
  },
});

export default SimilarStoresSection;
