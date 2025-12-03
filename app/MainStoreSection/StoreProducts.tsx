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
// Parent sectionCard has marginHorizontal:16 + paddingHorizontal:20 = 36px each side
// Plus 12px gap between cards
// Total to subtract: (36*2) + 12 = 84px
const CARD_WIDTH = (width - 84) / 2;

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
    // Navigate to full products page for this store
    router.push({
      pathname: '/StoreProductsPage',
      params: {
        storeId,
        storeName: storeName || 'Store'
      }
    } as any);
  };

  // Format price with comma separator
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-IN');
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

    // Truncate product name for display
    const displayName = item.name?.length > 30
      ? item.name.substring(0, 30) + '...'
      : item.name;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.85}
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
              <Ionicons name="image-outline" size={32} color="#CBD5E1" />
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
          <Text style={styles.productName} numberOfLines={2} ellipsizeMode="tail">
            {displayName}
          </Text>

          {/* Price Section */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{formatPrice(price)}</Text>
            {comparePrice && comparePrice > price && (
              <Text style={styles.comparePrice}>₹{formatPrice(comparePrice)}</Text>
            )}
          </View>

          {/* Rating - if available */}
          {item.ratings?.average > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={11} color="#FBBF24" />
              <Text style={styles.ratingText}>
                {item.ratings.average.toFixed(1)}
              </Text>
            </View>
          )}
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

  // Show only 2 products on MainStorePage if there are more than 2
  const displayProducts = products.slice(0, 2);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Store Products</Text>
        {products.length >= 2 && (
          <TouchableOpacity onPress={handleViewAll} style={styles.viewAllButton} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View All ({products.length})</Text>
            <Ionicons name="chevron-forward" size={16} color="#7C3AED" />
          </TouchableOpacity>
        )}
      </View>

      {/* Products Row - Show max 2 products */}
      <View style={styles.productsRow}>
        {displayProducts.map((product) => (
          <View key={product._id || product.id}>
            {renderProduct({ item: product })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    // No horizontal padding - parent sectionCard already has paddingHorizontal
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.3,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C3AED',
  },
  productsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.85,
    backgroundColor: '#F9FAFB',
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
    backgroundColor: '#F3F4F6',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    lineHeight: 17,
    height: 34,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  ratingText: {
    fontSize: 11,
    color: '#92400E',
    marginLeft: 3,
    fontWeight: '600',
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#7C3AED',
  },
  comparePrice: {
    fontSize: 12,
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
