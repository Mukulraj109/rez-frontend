import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Category data mapping
const categoryData: { [key: string]: any } = {
  food: {
    name: 'Food & Dining',
    emoji: '🍔',
    color: '#F97316',
    stores: 234,
    avgCashback: '12%',
  },
  fashion: {
    name: 'Fashion',
    emoji: '🛍️',
    color: '#EC4899',
    stores: 156,
    avgCashback: '15%',
  },
  electronics: {
    name: 'Electronics',
    emoji: '📱',
    color: '#3B82F6',
    stores: 89,
    avgCashback: '8%',
  },
  beauty: {
    name: 'Beauty & Wellness',
    emoji: '💄',
    color: '#A855F7',
    stores: 178,
    avgCashback: '18%',
  },
  grocery: {
    name: 'Grocery',
    emoji: '🛒',
    color: '#10B981',
    stores: 312,
    avgCashback: '5%',
  },
  fitness: {
    name: 'Fitness',
    emoji: '🏋️',
    color: '#EF4444',
    stores: 67,
    avgCashback: '20%',
  },
};

// Mock stores data
const storesData = [
  {
    id: 1,
    name: 'Paradise Biryani',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    rating: 4.5,
    reviews: 567,
    distance: '0.8 km',
    cashback: '20%',
    offer: 'Flat 20% Cashback',
    isOpen: true,
    deliveryTime: '30 min',
  },
  {
    id: 2,
    name: 'Starbucks',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    rating: 4.3,
    reviews: 345,
    distance: '0.5 km',
    cashback: '10%',
    offer: 'Buy 1 Get 1 Free',
    isOpen: true,
    deliveryTime: '20 min',
  },
  {
    id: 3,
    name: 'Cafe Noir',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    rating: 4.6,
    reviews: 234,
    distance: '1.2 km',
    cashback: '15%',
    offer: '15% Cashback',
    isOpen: true,
    deliveryTime: '25 min',
  },
  {
    id: 4,
    name: 'Fresh Mart',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    rating: 4.2,
    reviews: 189,
    distance: '0.3 km',
    cashback: '5%',
    offer: '5% on All Items',
    isOpen: true,
    deliveryTime: '40 min',
  },
  {
    id: 5,
    name: 'Pizza Palace',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    rating: 4.4,
    reviews: 456,
    distance: '1.5 km',
    cashback: '12%',
    offer: 'Flat ₹100 Off',
    isOpen: true,
    deliveryTime: '35 min',
  },
];

const filterChips = [
  { id: 'all', label: 'All' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'highCashback', label: 'High Cashback' },
  { id: 'topRated', label: 'Top Rated' },
  { id: 'delivery', label: '60 Min Delivery' },
];

const CategoryDetailPage = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const category = categoryData[id as string] || categoryData.food;

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
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
        <View style={styles.headerCenter}>
          <Text style={styles.categoryEmoji}>{category.emoji}</Text>
          <Text style={styles.headerTitle}>{category.name}</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={22} color="#0B2240" />
        </TouchableOpacity>
      </View>

      {/* Category Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{category.stores}</Text>
          <Text style={styles.statLabel}>Stores</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#00C06A' }]}>
            Up to {category.avgCashback}
          </Text>
          <Text style={styles.statLabel}>Cashback</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Offers Live</Text>
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {filterChips.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              selectedFilter === filter.id && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterLabel,
                selectedFilter === filter.id && styles.filterLabelActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stores List */}
      <ScrollView
        style={styles.storesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.storesContainer}
      >
        {storesData.map((store) => (
          <TouchableOpacity
            key={store.id}
            style={styles.storeCard}
            onPress={() => navigateTo(`/MainStorePage?id=${store.id}`)}
          >
            <Image source={{ uri: store.image }} style={styles.storeImage} />

            <View style={styles.storeContent}>
              <View style={styles.storeHeader}>
                <Text style={styles.storeName}>{store.name}</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>{store.rating}</Text>
                </View>
              </View>

              <View style={styles.offerRow}>
                <View style={styles.offerBadge}>
                  <Text style={styles.offerText}>{store.offer}</Text>
                </View>
              </View>

              <View style={styles.storeFooter}>
                <View style={styles.infoItem}>
                  <Ionicons name="location" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>{store.distance}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="time" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>{store.deliveryTime}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="chatbubble" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>{store.reviews}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.visitButton}>
              <Text style={styles.visitText}>Visit</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Map Button */}
      <TouchableOpacity
        style={styles.mapButton}
        onPress={() => navigateTo('/explore/map')}
      >
        <LinearGradient
          colors={['#00C06A', '#10B981']}
          style={styles.mapButtonGradient}
        >
          <Ionicons name="map" size={20} color="#FFFFFF" />
          <Text style={styles.mapButtonText}>Map View</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  filterScroll: {
    maxHeight: 50,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#00C06A',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterLabelActive: {
    color: '#FFFFFF',
  },
  storesList: {
    flex: 1,
  },
  storesContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storeImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  storeContent: {
    flex: 1,
    marginLeft: 12,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0B2240',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
  },
  offerRow: {
    marginTop: 6,
  },
  offerBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  offerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00C06A',
  },
  storeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  visitButton: {
    backgroundColor: '#0B2240',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  visitText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mapButton: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  mapButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CategoryDetailPage;
