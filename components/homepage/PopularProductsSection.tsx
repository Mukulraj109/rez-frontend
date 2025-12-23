import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { productApi, HomepageProduct } from '@/services/productApi';
import { Ionicons } from '@expo/vector-icons';

interface PopularProductsSectionProps {
  title?: string;
  limit?: number;
}

function PopularProductsSection({
  title = 'Popular Near You',
  limit = 3,
}: PopularProductsSectionProps) {
  const router = useRouter();
  const [products, setProducts] = useState<HomepageProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productApi.getPopularProducts({ limit });

      if (response.success && response.data) {
        // Limit to 3 products maximum
        const maxProducts = Math.min(limit, 3);
        setProducts(response.data.slice(0, maxProducts));
      } else {
        setError('Failed to load popular products');
      }
    } catch (err) {
      console.error('Error fetching popular products:', err);
      setError('Failed to load popular products');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchPopularProducts();
  }, [fetchPopularProducts]);

  const handleProductPress = (product: HomepageProduct) => {
    router.push(`/ProductPage?cardId=${product._id || product.id}&cardType=product`);
  };

  // Calculate cashback amount
  const calculateCashback = (product: HomepageProduct) => {
    const cashbackPercentage = product.cashbackPercentage || 5;
    const price = product.price || 0;
    const amount = Math.round((price * cashbackPercentage) / 100);
    return { percentage: cashbackPercentage, amount };
  };

  // Calculate rez coins (5% of price, minimum 1)
  const calculateRezCoins = (product: HomepageProduct) => {
    const price = product.price || 0;
    return price > 0 ? Math.max(1, Math.round((price * 5) / 100)) : 0;
  };

  // Format delivery fee
  const formatDeliveryFee = (fee: number | undefined) => {
    if (fee === undefined || fee === null) return 'Free delivery';
    if (fee === 0) return 'Free delivery';
    return `₹${fee.toFixed(2)} delivery fee`;
  };

  const renderProduct = useCallback(({ item }: { item: HomepageProduct }) => {
    const cashback = calculateCashback(item);
    const rezCoins = calculateRezCoins(item);
    const deliveryFee = item.store?.deliveryFee || 0;
    const category = item.category || item.store?.name || '';

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.8}
      >
        <ThemedView style={styles.cardContent}>
          {/* Product Image - Left Side (Smaller) */}
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: item.image || 'https://via.placeholder.com/70x70?text=No+Image'
              }}
              style={styles.productImage}
              resizeMode="cover"
            />
          </View>

          {/* Product Details - Middle */}
          <View style={styles.detailsContainer}>
            {/* Product Name */}
            <ThemedText style={styles.productName} numberOfLines={1}>
              {item.name}
            </ThemedText>

            {/* Category and Delivery Fee - One Line */}
            <View style={styles.metaRow}>
              {category && (
                <>
                  <ThemedText style={styles.categoryText} numberOfLines={1}>
                    {category}
                  </ThemedText>
                  <ThemedText style={styles.metaSeparator}> • </ThemedText>
                </>
              )}
              <ThemedText style={styles.deliveryFee} numberOfLines={1}>
                {formatDeliveryFee(deliveryFee)}
              </ThemedText>
            </View>

            {/* Rez Coins Info - Below */}
            <View style={styles.rewardRow}>
              <View style={styles.coinsBadge}>
                <Ionicons name="star-outline" size={10} color="#F59E0B" />
                <ThemedText style={styles.coinsText}>
                  Earn {rezCoins} Rez Coins
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Cashback Percentage - Right Side */}
          <View style={styles.cashbackContainer}>
            <ThemedText style={styles.cashbackPercentage}>
              {cashback.percentage}%
            </ThemedText>
          </View>
        </ThemedView>
      </TouchableOpacity>
    );
  }, []);

  const keyExtractor = useCallback((item: HomepageProduct) => item._id || item.id, []);

  // Don't render if no products and not loading
  if (!loading && products.length === 0 && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="heart-outline" size={20} color="#EF4444" style={styles.heartIcon} />
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00C06A" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPopularProducts}>
            <ThemedText style={styles.retryText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={keyExtractor}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  heartIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  productCard: {
    marginBottom: 8,
  },
  cardContent: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  imageContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 10,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2240',
    marginBottom: 3,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  categoryText: {
    fontSize: 11,
    color: '#6B7280',
  },
  metaSeparator: {
    fontSize: 11,
    color: '#9CA3AF',
    marginHorizontal: 2,
  },
  deliveryFee: {
    fontSize: 11,
    color: '#6B7280',
  },
  rewardRow: {
    marginTop: 1,
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  coinsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 3,
  },
  cashbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    paddingLeft: 6,
    minWidth: 40,
  },
  cashbackPercentage: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00C06A',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default memo(PopularProductsSection);
