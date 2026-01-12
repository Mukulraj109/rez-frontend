import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import exploreApi from '../../../services/exploreApi';

const { width } = Dimensions.get('window');

const StoresNearYou = () => {
  const router = useRouter();
  const [stores, setStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNearbyStores = async () => {
      try {
        // Use trending stores as a fallback since getNearbyStores requires location
        const response = await exploreApi.getTrendingStores({ limit: 8 });
        if (response.success && response.data?.stores && response.data.stores.length > 0) {
          const transformed = response.data.stores.map((item: any) => ({
            id: item.id || item._id,
            name: item.name || 'Store',
            image: item.image || null,
            tags: [],
            tagColors: [],
            rating: item.rating || null,
            distance: item.distance || null,
            deliveryTime: null,
            cashback: item.cashback || null,
            hasQuickDelivery: false,
            isFavorite: false,
          }));
          setStores(transformed);
        }
      } catch (error) {
        console.error('[STORES NEAR YOU] Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNearbyStores();
  }, []);

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Stores Near You</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00C06A" />
        </View>
      </View>
    );
  }

  // Empty state - don't render section if no data
  if (stores.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Stores Near You</Text>
        <Text style={styles.storeCount}>{stores.length} stores</Text>
      </View>

      {/* Store List */}
      <View style={styles.storeList}>
        {stores.map((store) => (
          <TouchableOpacity
            key={store.id}
            style={styles.storeCard}
            onPress={() => navigateTo(`/MainStorePage?id=${store.id}`)}
          >
            {/* Store Image */}
            <Image source={{ uri: store.image }} style={styles.storeImage} />

            {/* Store Info */}
            <View style={styles.storeInfo}>
              <View style={styles.storeNameRow}>
                <Text style={styles.storeName}>{store.name}</Text>
              </View>

              {/* Tags Row */}
              <View style={styles.tagsRow}>
                {store.tags.map((tag, index) => (
                  <View
                    key={tag}
                    style={[styles.tag, { backgroundColor: store.tagColors[index] + '20' }]}
                  >
                    <Text style={[styles.tagText, { color: store.tagColors[index] }]}>{tag}</Text>
                  </View>
                ))}
                {store.hasQuickDelivery && (
                  <View style={styles.quickDeliveryTag}>
                    <Ionicons name="flash" size={10} color="#F97316" />
                    <Text style={styles.quickDeliveryText}>60min</Text>
                  </View>
                )}
              </View>

              {/* Details Row */}
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.detailText}>{store.rating}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text style={styles.detailText}>{store.distance}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text style={styles.detailText}>{store.deliveryTime}</Text>
                </View>
              </View>

              {/* Cashback */}
              <Text style={styles.cashbackText}>{store.cashback} cashback</Text>
            </View>

            {/* Favorite Button */}
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons
                name={store.isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={store.isFavorite ? '#EF4444' : '#9CA3AF'}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* View All Button */}
      <TouchableOpacity
        style={styles.viewAllButton}
        onPress={() => navigateTo('/explore/stores')}
      >
        <Text style={styles.viewAllText}>View All Stores</Text>
        <Ionicons name="arrow-forward" size={16} color="#00C06A" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2240',
  },
  storeCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  storeList: {
    paddingHorizontal: 16,
  },
  storeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storeImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  storeInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B2240',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  quickDeliveryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  quickDeliveryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F97316',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
  },
  cashbackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00C06A',
  },
  favoriteButton: {
    padding: 8,
    justifyContent: 'flex-start',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 4,
    gap: 6,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00C06A',
  },
});

export default StoresNearYou;
