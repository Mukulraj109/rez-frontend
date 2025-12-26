import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const stores = [
  {
    id: 1,
    name: 'Biryani Blues',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200',
    tags: ['Halal'],
    tagColors: ['#3B82F6'],
    rating: 4.5,
    distance: '1.2 km',
    deliveryTime: '25-35 min',
    cashback: '15%',
    hasQuickDelivery: true,
    isFavorite: true,
  },
  {
    id: 2,
    name: 'Green Bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200',
    tags: ['Vegan'],
    tagColors: ['#10B981'],
    rating: 4.7,
    distance: '0.8 km',
    deliveryTime: '20-30 min',
    cashback: '20%',
    hasQuickDelivery: true,
    isFavorite: true,
  },
  {
    id: 3,
    name: 'Fashion Hub',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
    tags: [],
    tagColors: [],
    rating: 4.3,
    distance: '2.5 km',
    deliveryTime: 'Same Day',
    cashback: '12%',
    hasQuickDelivery: false,
    isFavorite: false,
  },
  {
    id: 4,
    name: 'Tech Galaxy',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200',
    tags: [],
    tagColors: [],
    rating: 4.6,
    distance: '3.1 km',
    deliveryTime: '1-2 days',
    cashback: '8%',
    hasQuickDelivery: false,
    isFavorite: false,
  },
];

const StoresNearYou = () => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

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
