import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { useRelatedProducts, RelatedProduct } from '@/hooks/useRelatedProducts';

/**
 * RelatedProductsSection Component
 *
 * Displays related/similar products in a horizontal scrollable section
 * Integrates with backend API to fetch recommendations
 */
interface RelatedProductsSectionProps {
  productId: string;
  title?: string;
  type?: 'similar' | 'frequently-bought' | 'bundles';
  limit?: number;
  onProductPress?: (productId: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 160;

export const RelatedProductsSection: React.FC<RelatedProductsSectionProps> = ({
  productId,
  title = 'Similar Products',
  type = 'similar',
  limit = 6,
  onProductPress,
}) => {
  const router = useRouter();

  // Fetch related products
  const { products, isLoading, error, hasProducts, refresh } = useRelatedProducts({
    productId,
    type,
    limit,
    autoLoad: true,
  });

  /**
   * Handle product card press
   */
  const handleProductPress = (product: RelatedProduct) => {
    console.log('🔗 [RelatedProducts] Product pressed:', product.id);

    if (onProductPress) {
      onProductPress(product.id);
    } else {
      // Navigate to product detail page
      router.push(`/product/${product.id}` as any);
    }
  };

  // Don't render if no products and not loading
  if (!isLoading && !hasProducts && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {hasProducts && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => {
              // TODO: Navigate to category/search page with filter
              console.log('View all pressed');
            }}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.viewAllText}>View All</ThemedText>
            <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#8B5CF6" />
          <ThemedText style={styles.loadingText}>Loading recommendations...</ThemedText>
        </View>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={refresh} activeOpacity={0.8}>
            <Ionicons name="reload" size={16} color="#8B5CF6" />
            <ThemedText style={styles.retryText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Products List */}
      {hasProducts && !isLoading && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + 12}
        >
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() => handleProductPress(product)}
              isFirst={index === 0}
              isLast={index === products.length - 1}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

/**
 * ProductCard Component
 * Individual product card in the horizontal scroll
 */
interface ProductCardProps {
  product: RelatedProduct;
  onPress: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, isFirst, isLast }) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isFirst && styles.cardFirst,
        isLast && styles.cardLast,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />

        {/* Discount Badge */}
        {product.discount && product.discount > 0 && (
          <View style={styles.discountBadge}>
            <ThemedText style={styles.discountText}>{product.discount}% OFF</ThemedText>
          </View>
        )}

        {/* Cashback Badge */}
        {product.cashback && (
          <View style={styles.cashbackBadge}>
            <Ionicons name="gift-outline" size={10} color="#FFF" />
            <ThemedText style={styles.cashbackText}>Cashback</ThemedText>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        {/* Brand */}
        {product.brand && (
          <ThemedText style={styles.brand} numberOfLines={1}>
            {product.brand}
          </ThemedText>
        )}

        {/* Name */}
        <ThemedText style={styles.name} numberOfLines={2}>
          {product.name}
        </ThemedText>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <ThemedText style={styles.rating}>{product.rating.toFixed(1)}</ThemedText>
          <ThemedText style={styles.reviewCount}>({product.reviewCount})</ThemedText>
        </View>

        {/* Price */}
        <View style={styles.priceRow}>
          <ThemedText style={styles.price}>₹{product.price.toLocaleString()}</ThemedText>
          {product.originalPrice && (
            <ThemedText style={styles.originalPrice}>
              ₹{product.originalPrice.toLocaleString()}
            </ThemedText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },

  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Error
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },

  // Scroll Content
  scrollContent: {
    paddingLeft: 16,
  },

  // Product Card
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardFirst: {
    // First card already has left padding from scrollContent
  },
  cardLast: {
    marginRight: 16,
  },

  // Image
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  cashbackBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  cashbackText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFF',
  },

  // Info
  infoContainer: {
    padding: 12,
  },
  brand: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 16,
    marginBottom: 6,
    height: 32,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 3,
  },
  rating: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  reviewCount: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
});

export default RelatedProductsSection;
