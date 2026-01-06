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
import exploreApi, { HotProduct } from '../../../services/exploreApi';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const HotRightNow = () => {
  const router = useRouter();
  const [hotDeals, setHotDeals] = useState<HotProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHotDeals = async () => {
      try {
        console.log('[HOT RIGHT NOW] Fetching hot deals from API...');
        const response = await exploreApi.getHotDeals({ limit: 6 });
        console.log('[HOT RIGHT NOW] API Response:', response);

        const products = response.data?.products || response.data || [];
        console.log('[HOT RIGHT NOW] Products extracted:', products.length);

        if (response.success && Array.isArray(products) && products.length > 0) {
          console.log('[HOT RIGHT NOW] Setting', products.length, 'products');
          setHotDeals(products);
        } else {
          console.log('[HOT RIGHT NOW] No products received from API');
        }
      } catch (error) {
        console.error('[HOT RIGHT NOW] API Error:', error);
      } finally {
        setIsLoading(false);
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

  // Don't render if no data
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>What's Hot Near You</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00C06A" />
        </View>
      </View>
    );
  }

  // Don't render section if no products
  if (hotDeals.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>What's Hot Near You</Text>
        <TouchableOpacity onPress={() => navigateTo('/explore/hot')}>
          <Text style={styles.viewAllText}>View all →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gridContainer}>
        {hotDeals.slice(0, 4).map((product, index) => (
          <TouchableOpacity
            key={product.id || index}
            style={styles.productCard}
            onPress={() => navigateTo(`/ProductPage?cardId=${product.id}&cardType=product`)}
          >
            <View style={styles.imageContainer}>
              {product.image && <Image source={{ uri: product.image }} style={styles.productImage} />}
              {product.offer && (
                <View style={[styles.offerBadge, { backgroundColor: getOfferBadgeColor(product.offer) }]}>
                  <Text style={styles.offerBadgeText}>{product.offer}</Text>
                </View>
              )}
            </View>

            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
              {product.store && <Text style={styles.storeName} numberOfLines={1}>{product.store}</Text>}
              <View style={styles.priceRow}>
                {product.price > 0 && <Text style={styles.price}>{'\u20B9'}{product.price.toLocaleString('en-IN')}</Text>}
                {product.distance && (
                  <View style={styles.distanceContainer}>
                    <Ionicons name="location" size={12} color="#6B7280" />
                    <Text style={styles.distanceText}>{product.distance}</Text>
                  </View>
                )}
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
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
