import React, { useState, useEffect } from 'react';
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
import exploreApi, { HotProduct } from '../../../services/exploreApi';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Fallback data - defined outside component
const FALLBACK_PRODUCTS: HotProduct[] = [
  {
    id: '1',
    name: 'Nike Air Max 90',
    store: 'Nike Store',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    offer: '20% Cashback',
    distance: '1.2 km',
    price: 6999,
    originalPrice: 8999,
    rating: 4.5,
    reviews: 120,
  },
  {
    id: '2',
    name: 'Chicken Biryani',
    store: 'Paradise Biryani',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    offer: 'Flat \u20B9100 Off',
    distance: '800 m',
    price: 350,
    originalPrice: 450,
    rating: 4.8,
    reviews: 250,
  },
  {
    id: '3',
    name: 'Hair Spa',
    store: 'Wellness Studio',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    offer: '25% Cashback',
    distance: '2.1 km',
    price: 1499,
    originalPrice: 1999,
    rating: 4.6,
    reviews: 89,
  },
  {
    id: '4',
    name: 'Coffee & Snacks',
    store: 'Cafe Noir',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    offer: 'Buy 1 Get 1',
    distance: '500 m',
    price: 299,
    originalPrice: 598,
    rating: 4.4,
    reviews: 156,
  },
];

const HotRightNow = () => {
  const router = useRouter();
  const [hotDeals, setHotDeals] = useState<HotProduct[]>(FALLBACK_PRODUCTS);

  useEffect(() => {
    const fetchHotDeals = async () => {
      try {
        console.log('[HOT RIGHT NOW] Fetching hot deals...');
        const response = await exploreApi.getHotDeals({ limit: 6 });
        console.log('[HOT RIGHT NOW] Response:', response);

        const products = response.data?.products || response.data || [];
        console.log('[HOT RIGHT NOW] Products found:', products.length);

        if (response.success && Array.isArray(products) && products.length > 0) {
          console.log('[HOT RIGHT NOW] Using API products');
          setHotDeals(products);
        } else {
          console.log('[HOT RIGHT NOW] No API products, keeping fallback');
        }
      } catch (error) {
        console.error('[HOT RIGHT NOW] Error:', error);
      }
    };
    fetchHotDeals();
  }, []);

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  const getOfferBadgeColor = (offer: string) => {
    if (offer?.toLowerCase().includes('cashback')) return '#00C06A';
    if (offer?.toLowerCase().includes('off')) return '#0B2240';
    if (offer?.toLowerCase().includes('buy')) return '#0B2240';
    return '#00C06A';
  };

  console.log('[HOT RIGHT NOW] Rendering with', hotDeals.length, 'products');

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>What's Hot Near You</Text>
        <TouchableOpacity onPress={() => navigateTo('/explore/hot-deals')}>
          <Text style={styles.viewAllText}>View all →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gridContainer}>
        {hotDeals.slice(0, 4).map((product, index) => (
          <TouchableOpacity
            key={product.id || index}
            style={styles.productCard}
            onPress={() => navigateTo(`/product/${product.id}`)}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: product.image }} style={styles.productImage} />
              <View style={[styles.offerBadge, { backgroundColor: getOfferBadgeColor(product.offer) }]}>
                <Text style={styles.offerBadgeText}>{product.offer}</Text>
              </View>
            </View>

            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
              <Text style={styles.storeName} numberOfLines={1}>{product.store}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{'\u20B9'}{(product.price || 0).toLocaleString('en-IN')}</Text>
                <View style={styles.distanceContainer}>
                  <Ionicons name="location" size={12} color="#6B7280" />
                  <Text style={styles.distanceText}>{product.distance || '1 km'}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
  },
  viewAllText: {
    fontSize: 14,
    color: '#00C06A',
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: CARD_WIDTH,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.8,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  offerBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  offerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
    marginBottom: 2,
  },
  storeName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2240',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default HotRightNow;
