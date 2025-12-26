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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Mock nearby stores data
const nearbyStores = [
  {
    id: 1,
    name: 'Paradise Biryani',
    category: 'Food & Dining',
    distance: '0.8 km',
    cashback: '20%',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200',
    isOpen: true,
    offer: 'Flat 20% Cashback',
  },
  {
    id: 2,
    name: 'Nike Store',
    category: 'Fashion',
    distance: '1.2 km',
    cashback: '15%',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
    isOpen: true,
    offer: '15% + Bonus Coins',
  },
  {
    id: 3,
    name: 'Starbucks',
    category: 'Cafe',
    distance: '0.5 km',
    cashback: '10%',
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200',
    isOpen: true,
    offer: 'Buy 1 Get 1 Free',
  },
  {
    id: 4,
    name: 'Wellness Spa',
    category: 'Beauty & Wellness',
    distance: '2.1 km',
    cashback: '25%',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200',
    isOpen: true,
    offer: '25% Cashback',
  },
  {
    id: 5,
    name: 'Fresh Mart',
    category: 'Grocery',
    distance: '0.3 km',
    cashback: '5%',
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200',
    isOpen: true,
    offer: '5% on All Items',
  },
];

const categories = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'food', label: 'Food', icon: 'restaurant' },
  { id: 'fashion', label: 'Fashion', icon: 'shirt' },
  { id: 'beauty', label: 'Beauty', icon: 'sparkles' },
  { id: 'grocery', label: 'Grocery', icon: 'cart' },
];

const ExploreMapPage = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStore, setSelectedStore] = useState<number | null>(null);

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
        <Text style={styles.headerTitle}>Stores Near You</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#0B2240" />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              selectedCategory === cat.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={selectedCategory === cat.id ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === cat.id && styles.categoryLabelActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <LinearGradient
          colors={['#E0F2FE', '#DBEAFE', '#E0E7FF']}
          style={styles.mapPlaceholder}
        >
          <View style={styles.mapContent}>
            <Ionicons name="map" size={48} color="#3B82F6" />
            <Text style={styles.mapText}>Interactive Map</Text>
            <Text style={styles.mapSubtext}>
              {nearbyStores.length} stores within 3 km
            </Text>

            {/* Store Markers */}
            <View style={styles.markerContainer}>
              {nearbyStores.slice(0, 3).map((store, index) => (
                <TouchableOpacity
                  key={store.id}
                  style={[
                    styles.marker,
                    { left: 50 + index * 80, top: 30 + index * 40 },
                  ]}
                  onPress={() => setSelectedStore(store.id)}
                >
                  <View style={styles.markerPin}>
                    <Ionicons name="location" size={24} color="#00C06A" />
                  </View>
                  <Text style={styles.markerLabel}>{store.cashback}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Current Location */}
            <View style={styles.currentLocation}>
              <View style={styles.currentLocationDot} />
              <Text style={styles.currentLocationText}>You are here</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Store List */}
      <View style={styles.storeListHeader}>
        <Text style={styles.storeListTitle}>Nearby Stores</Text>
        <Text style={styles.storeCount}>{nearbyStores.length} stores</Text>
      </View>

      <ScrollView
        style={styles.storeList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.storeListContent}
      >
        {nearbyStores.map((store) => (
          <TouchableOpacity
            key={store.id}
            style={[
              styles.storeCard,
              selectedStore === store.id && styles.storeCardSelected,
            ]}
            onPress={() => navigateTo(`/MainStorePage?id=${store.id}`)}
          >
            <Image source={{ uri: store.image }} style={styles.storeImage} />
            <View style={styles.storeInfo}>
              <View style={styles.storeHeader}>
                <Text style={styles.storeName}>{store.name}</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>{store.rating}</Text>
                </View>
              </View>
              <Text style={styles.storeCategory}>{store.category}</Text>
              <View style={styles.storeFooter}>
                <View style={styles.distanceBadge}>
                  <Ionicons name="location" size={12} color="#6B7280" />
                  <Text style={styles.distanceText}>{store.distance}</Text>
                </View>
                <View style={styles.cashbackBadge}>
                  <Text style={styles.cashbackText}>{store.offer}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.navigateButton}>
              <Ionicons name="navigate" size={20} color="#00C06A" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action */}
      <TouchableOpacity style={styles.listViewButton}>
        <Ionicons name="list" size={20} color="#FFFFFF" />
        <Text style={styles.listViewText}>List View</Text>
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
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#00C06A',
  },
  categoryLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  mapContainer: {
    height: height * 0.3,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContent: {
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  mapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
    marginTop: 8,
  },
  mapSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  markerContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerPin: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#00C06A',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  currentLocation: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  currentLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  currentLocationText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '500',
    marginTop: 4,
  },
  storeListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  storeListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2240',
  },
  storeCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  storeList: {
    flex: 1,
  },
  storeListContent: {
    paddingHorizontal: 16,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storeCardSelected: {
    borderColor: '#00C06A',
    backgroundColor: '#F0FDF4',
  },
  storeImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  storeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  storeCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  storeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 11,
    color: '#6B7280',
  },
  cashbackBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00C06A',
  },
  navigateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listViewButton: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B2240',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  listViewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ExploreMapPage;
