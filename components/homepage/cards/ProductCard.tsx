import React from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  View 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ProductCardProps } from '@/types/homepage.types';

export default function ProductCard({ 
  product, 
  onPress, 
  onAddToCart,
  width = 200,
  showAddToCart = true
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateSavings = () => {
    if (product.price.original && product.price.original > product.price.current) {
      return product.price.original - product.price.current;
    }
    return 0;
  };

  const getDiscountPercentage = () => {
    if (product.price.discount) {
      return product.price.discount;
    }
    if (product.price.original && product.price.original > product.price.current) {
      return Math.round(((product.price.original - product.price.current) / product.price.original) * 100);
    }
    return 0;
  };

  const renderBadges = () => {
    const badges = [];
    
    if (product.isNewArrival) {
      badges.push(
        <View key="new" style={[styles.badge, styles.newBadge]}>
          <ThemedText style={styles.newBadgeText}>New</ThemedText>
        </View>
      );
    }

    const discount = getDiscountPercentage();
    if (discount > 0) {
      badges.push(
        <View key="discount" style={[styles.badge, styles.discountBadge]}>
          <ThemedText style={styles.discountBadgeText}>{discount}% OFF</ThemedText>
        </View>
      );
    }

    return badges.length > 0 ? (
      <View style={styles.badgesContainer}>
        {badges}
      </View>
    ) : null;
  };

  const renderAvailabilityStatus = () => {
    switch (product.availabilityStatus) {
      case 'low_stock':
        return (
          <View style={styles.lowStockContainer}>
            <ThemedText style={styles.lowStockText}>Only few left!</ThemedText>
          </View>
        );
      case 'out_of_stock':
        return (
          <View style={styles.outOfStockContainer}>
            <ThemedText style={styles.outOfStockText}>Out of Stock</ThemedText>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={() => onPress(product)}
      activeOpacity={0.95}
    >
      <ThemedView style={styles.card}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.image }} 
            style={styles.image}
            resizeMode="cover"
            fadeDuration={0}
          />
          {renderBadges()}
        </View>

        {/* Product Details */}
        <View style={styles.content}>
          <ThemedText style={styles.brand} numberOfLines={1}>
            {product.brand}
          </ThemedText>
          
          <ThemedText style={styles.name} numberOfLines={2}>
            {product.name}
          </ThemedText>

          {/* Rating */}
          {product.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <ThemedText style={styles.ratingText}>
                {product.rating.value}
              </ThemedText>
              <ThemedText style={styles.ratingCount}>
                ({product.rating.count})
              </ThemedText>
            </View>
          )}

          {/* Price Information */}
          <View style={styles.priceContainer}>
            <ThemedText style={styles.currentPrice}>
              {formatPrice(product.price.current)}
            </ThemedText>
            {product.price.original && product.price.original > product.price.current && (
              <ThemedText style={styles.originalPrice}>
                {formatPrice(product.price.original)}
              </ThemedText>
            )}
          </View>

          {/* Savings */}
          {calculateSavings() > 0 && (
            <ThemedText style={styles.savings}>
              You save {formatPrice(calculateSavings())}
            </ThemedText>
          )}

          {/* Cashback */}
          {product.cashback && (
            <View style={styles.cashbackContainer}>
              <ThemedText style={styles.cashbackText}>
                {product.cashback.percentage}% cashback
              </ThemedText>
            </View>
          )}

          {/* Availability Status */}
          {renderAvailabilityStatus()}

          {/* Add to Cart Button */}
          {showAddToCart && onAddToCart && product.availabilityStatus === 'in_stock' && (
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              activeOpacity={0.95}
            >
              <Ionicons name="add-circle" size={20} color="#8B5CF6" />
              <ThemedText style={styles.addToCartText}>Add to Cart</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    // Container styles handled by parent
    flex: 0,
    flexShrink: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgesContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'column',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  newBadge: {
    backgroundColor: '#10B981',
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  discountBadge: {
    backgroundColor: '#EF4444',
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: 12,
  },
  brand: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  ratingCount: {
    fontSize: 11,
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  savings: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    marginBottom: 6,
  },
  cashbackContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  cashbackText: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '600',
  },
  lowStockContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  lowStockText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  outOfStockContainer: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  outOfStockText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F8F9FA',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addToCartText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
});