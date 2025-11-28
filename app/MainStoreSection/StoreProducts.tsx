import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import productsApi, { Product } from '@/services/productsApi';
import { RetryButton } from '@/components/common/RetryButton';

interface StoreProductsProps {
  storeId: string;
  storeName?: string;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

export default function StoreProducts({ storeId, storeName }: StoreProductsProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [storeId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📦 [StoreProducts] Fetching products for storeId:', storeId);

      // Don't send pagination params - backend validation doesn't allow them
      const response = await productsApi.getProductsByStore(storeId, {});

      console.log('📦 [StoreProducts] Full Response:', JSON.stringify(response, null, 2));
      console.log('📦 [StoreProducts] Success:', response.success);
      console.log('📦 [StoreProducts] Data:', response.data);

      // Backend returns: { data: [{ store: {...}, products: [...] }] }
      // Add proper validation to prevent crashes if API structure changes
      if (
        response.success &&
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const storeData = response.data[0];

        // Validate storeData exists and has products array
        if (
          storeData &&
          typeof storeData === 'object' &&
          'products' in storeData &&
          Array.isArray(storeData.products)
        ) {
          const products = storeData.products;
          console.log('📦 [StoreProducts] Found', products.length, 'products');
          setProducts(products);
        } else {
          console.log('📦 [StoreProducts] Invalid data structure - missing products array');
          setError('Invalid product data structure');
        }
      } else {
        console.log('📦 [StoreProducts] No products in response');
        setError('No products found');
      }
    } catch (err: any) {
      console.error('❌ [StoreProducts] Error:', err);
      console.error('❌ [StoreProducts] Error message:', err.message);
      console.error('❌ [StoreProducts] Error response:', err.response);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product: any) => {
    const productId = product._id || product.id;
    router.push({
      pathname: '/ProductPage',
      params: {
        cardId: productId,
        cardType: 'product'
      }
    } as any);
  };

  const handleViewAll = () => {
    // Navigate to full products list for this store
    router.push({
      pathname: '/StoreListPage',
      params: {
        storeId,
        title: `${storeName || 'Store'} Products`
      }
    } as any);
  };

  const renderProduct = ({ item }: { item: any }) => {
    // Handle both array of strings and array of image objects
    const imageUrl = Array.isArray(item.images) && item.images.length > 0
      ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url)
      : null;

    const price = item.pricing?.selling || item.pricing?.salePrice || item.pricing?.basePrice || 0;
    const comparePrice = item.pricing?.original || item.pricing?.mrp;
    const discount = comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.8}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={40} color="#CBD5E1" />
            </View>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Rating */}
          {item.ratings?.average > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#FBBF24" />
              <Text style={styles.ratingText}>
                {item.ratings.average.toFixed(1)} ({item.ratings.count})
              </Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{price}</Text>
            {comparePrice && (
              <Text style={styles.comparePrice}>₹{comparePrice}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Store Products</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </View>
    );
  }

  if (error || products.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Store Products</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={48} color="#CBD5E1" />
          <Text style={styles.emptyText}>
            {error || 'No products available'}
          </Text>
          {error && (
            <RetryButton
              onRetry={fetchProducts}
              label="Retry"
              variant="secondary"
              size="small"
              style={{ marginTop: 16 }}
            />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Store Products</Text>
        {products.length > 4 && (
          <TouchableOpacity onPress={handleViewAll} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Products Grid */}
      <FlatList
        data={products.slice(0, 10)}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id || item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 18,
    minHeight: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7C3AED',
  },
  comparePrice: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});
