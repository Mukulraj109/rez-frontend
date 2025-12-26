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

const { width } = Dimensions.get('window');

// Mock hot items data
const hotItems = [
  {
    id: 1,
    name: 'Nike Air Max 90',
    store: 'Nike Store',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    offer: '20% Cashback',
    distance: '1.2 km',
    price: 6999,
    originalPrice: 8999,
    rating: 4.8,
    reviews: 234,
    buyers: 45,
  },
  {
    id: 2,
    name: 'Chicken Biryani',
    store: 'Paradise Biryani',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    offer: 'Flat ₹100 Off',
    distance: '800 m',
    price: 350,
    originalPrice: 450,
    rating: 4.5,
    reviews: 567,
    buyers: 123,
  },
  {
    id: 3,
    name: 'Hair Spa Treatment',
    store: 'Wellness Studio',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    offer: '25% Cashback',
    distance: '2.1 km',
    price: 1499,
    originalPrice: 1999,
    rating: 4.7,
    reviews: 189,
    buyers: 67,
  },
  {
    id: 4,
    name: 'Cold Brew Coffee',
    store: 'Cafe Noir',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    offer: 'Buy 1 Get 1',
    distance: '500 m',
    price: 299,
    originalPrice: 399,
    rating: 4.3,
    reviews: 345,
    buyers: 89,
  },
  {
    id: 5,
    name: 'Gym Membership',
    store: 'Gym Plus',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    offer: '30% Off',
    distance: '1.5 km',
    price: 2999,
    originalPrice: 4299,
    rating: 4.6,
    reviews: 278,
    buyers: 156,
  },
  {
    id: 6,
    name: 'iPhone 15 Pro',
    store: 'Apple Store',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    offer: '15% Cashback',
    distance: '3.2 km',
    price: 129900,
    originalPrice: 134900,
    rating: 4.9,
    reviews: 456,
    buyers: 34,
  },
];

const sortOptions = [
  { id: 'trending', label: 'Trending' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'cashback', label: 'Highest Cashback' },
  { id: 'price', label: 'Price: Low to High' },
];

const ExploreHotPage = () => {
  const router = useRouter();
  const [selectedSort, setSelectedSort] = useState('trending');

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
          <Text style={styles.headerTitle}>What's Hot</Text>
          <Text style={styles.headerSubtitle}>{hotItems.length} items trending</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={22} color="#0B2240" />
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortScroll}
        contentContainerStyle={styles.sortContainer}
      >
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.sortChip,
              selectedSort === option.id && styles.sortChipActive,
            ]}
            onPress={() => setSelectedSort(option.id)}
          >
            <Text
              style={[
                styles.sortLabel,
                selectedSort === option.id && styles.sortLabelActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Hot Items Grid */}
      <ScrollView
        style={styles.itemsScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.itemsContainer}
      >
        <View style={styles.grid}>
          {hotItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => navigateTo(`/MainStorePage?id=${item.id}`)}
            >
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />

                {/* Offer Badge */}
                <View style={styles.offerBadge}>
                  <Text style={styles.offerText}>{item.offer}</Text>
                </View>

                {/* Hot Badge */}
                <View style={styles.hotBadge}>
                  <Ionicons name="flame" size={12} color="#FFFFFF" />
                  <Text style={styles.hotText}>{item.buyers} bought</Text>
                </View>

                {/* Wishlist */}
                <TouchableOpacity style={styles.wishlistButton}>
                  <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.itemContent}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.storeRow}>
                  <Ionicons name="storefront" size={12} color="#6B7280" />
                  <Text style={styles.storeName}>{item.store}</Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
                  <Text style={styles.originalPrice}>
                    ₹{item.originalPrice.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.bottomRow}>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                    <Text style={styles.reviewsText}>({item.reviews})</Text>
                  </View>
                  <View style={styles.distanceBadge}>
                    <Ionicons name="location" size={12} color="#6B7280" />
                    <Text style={styles.distanceText}>{item.distance}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortScroll: {
    maxHeight: 50,
  },
  sortContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  sortChipActive: {
    backgroundColor: '#0B2240',
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  sortLabelActive: {
    color: '#FFFFFF',
  },
  itemsScroll: {
    flex: 1,
  },
  itemsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  imageContainer: {
    height: 140,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  offerBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#00C06A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  offerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hotBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  hotText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  wishlistButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    padding: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  storeName: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2240',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
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
  reviewsText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    fontSize: 11,
    color: '#6B7280',
  },
});

export default ExploreHotPage;
