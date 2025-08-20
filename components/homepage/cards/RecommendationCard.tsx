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
import { RecommendationCardProps } from '@/types/homepage.types';

export default function RecommendationCard({ 
  recommendation, 
  onPress, 
  onAddToCart,
  width = 240,
  showReason = true
}: RecommendationCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getDiscountPercentage = () => {
    if (recommendation.price.discount) {
      return recommendation.price.discount;
    }
    if (recommendation.price.original && recommendation.price.original > recommendation.price.current) {
      return Math.round(((recommendation.price.original - recommendation.price.current) / recommendation.price.original) * 100);
    }
    return 0;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={() => onPress(recommendation)}
      activeOpacity={0.95}
    >
      <ThemedView style={styles.card}>
        {/* Recommendation Badge */}
        <View style={styles.recommendationBadge}>
          <Ionicons name="sparkles" size={12} color="#FFFFFF" />
          <ThemedText style={styles.recommendationBadgeText}>
            For You
          </ThemedText>
        </View>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: recommendation.image }} 
            style={styles.image}
            resizeMode="cover"
            fadeDuration={0}
          />
          {getDiscountPercentage() > 0 && (
            <View style={styles.discountBadge}>
              <ThemedText style={styles.discountText}>
                {getDiscountPercentage()}% OFF
              </ThemedText>
            </View>
          )}
        </View>

        {/* Product Details */}
        <View style={styles.content}>
          <ThemedText style={styles.brand} numberOfLines={1}>
            {recommendation.brand}
          </ThemedText>
          
          <ThemedText style={styles.name} numberOfLines={2}>
            {recommendation.name}
          </ThemedText>

          {/* Recommendation Reason */}
          {showReason && (
            <View style={styles.reasonContainer}>
              <Ionicons name="bulb-outline" size={12} color="#8B5CF6" />
              <ThemedText style={styles.reasonText} numberOfLines={1}>
                {recommendation.recommendationReason}
              </ThemedText>
            </View>
          )}

          {/* Price Information */}
          <View style={styles.priceContainer}>
            <ThemedText style={styles.currentPrice}>
              {formatPrice(recommendation.price.current)}
            </ThemedText>
            {recommendation.price.original && recommendation.price.original > recommendation.price.current && (
              <ThemedText style={styles.originalPrice}>
                {formatPrice(recommendation.price.original)}
              </ThemedText>
            )}
          </View>

          {/* Rating */}
          {recommendation.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <ThemedText style={styles.ratingText}>
                {recommendation.rating.value}
              </ThemedText>
              <ThemedText style={styles.ratingCount}>
                ({recommendation.rating.count})
              </ThemedText>
            </View>
          )}

          {/* Cashback */}
          {recommendation.cashback && (
            <View style={styles.cashbackContainer}>
              <ThemedText style={styles.cashbackText}>
                Upto {recommendation.cashback.percentage}% cash back
              </ThemedText>
            </View>
          )}

          {/* Recommendation Score Indicator */}
          <View style={styles.scoreContainer}>
            <View style={styles.scoreBar}>
              <View 
                style={[
                  styles.scoreProgress, 
                  { width: `${recommendation.recommendationScore * 100}%` }
                ]} 
              />
            </View>
            <ThemedText style={styles.scoreText}>
              {Math.round(recommendation.recommendationScore * 100)}% match
            </ThemedText>
          </View>

          {/* Add to Cart Button */}
          {onAddToCart && recommendation.availabilityStatus === 'in_stock' && (
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={(e) => {
                e.stopPropagation();
                onAddToCart(recommendation);
              }}
              activeOpacity={0.95}
            >
              <Ionicons name="add-circle" size={18} color="#FFFFFF" />
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
    position: 'relative',
  },
  recommendationBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#8B5CF6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    zIndex: 10,
  },
  recommendationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  imageContainer: {
    position: 'relative',
    height: 120,
    marginTop: 24, // Account for recommendation badge
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
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
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    backgroundColor: '#F8F9FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  reasonText: {
    fontSize: 11,
    color: '#6B7280',
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
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
  scoreContainer: {
    marginBottom: 10,
  },
  scoreBar: {
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 2,
  },
  scoreProgress: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  scoreText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addToCartText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});