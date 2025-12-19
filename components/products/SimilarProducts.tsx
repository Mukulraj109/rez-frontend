// SimilarProducts Component
// Displays similar product recommendations in a horizontal carousel

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ProductRecommendation } from '@/services/recommendationApi';

interface SimilarProductsProps {
  similarProducts: ProductRecommendation[];
  loading?: boolean;
  onViewAll?: () => void;
  onProductPress?: (productId: string) => void;
}

export default function SimilarProducts({
  similarProducts,
  loading = false,
  onViewAll,
  onProductPress
}: SimilarProductsProps) {
  const router = useRouter();

  const handleProductPress = (productId: string) => {
    if (onProductPress) {
      onProductPress(productId);
    } else {
      // Navigate to product detail page
      // router.push(`/product/${productId}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Similar Products</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00C06A" />
        </View>
      </View>
    );
  }

  if (!similarProducts || similarProducts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Similar Products</Text>
        {onViewAll && similarProducts.length > 6 && (
          <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#00C06A" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {similarProducts.map((recommendation, index) => (
          <ProductCard
            key={recommendation.product.id || index}
            recommendation={recommendation}
            onPress={() => handleProductPress(recommendation.product.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

interface ProductCardProps {
  recommendation: ProductRecommendation;
  onPress: () => void;
}

function ProductCard({ recommendation, onPress }: ProductCardProps) {
  // Handle both nested (recommendation.product) and flat (recommendation) structures
  const product = recommendation.product || recommendation;
  const { reasons, similarity } = recommendation;

  // Flexible price extraction
  const getPrice = () => {
    if (product.price?.current) return product.price.current;
    if (product.price?.selling) return product.price.selling;
    if (typeof product.price === 'number') return product.price;
    if (product.pricing?.selling) return product.pricing.selling;
    return 0;
  };

  const getOriginalPrice = () => {
    if (product.price?.original) return product.price.original;
    if (product.price?.compare) return product.price.compare;
    if (product.pricing?.compare) return product.pricing.compare;
    if (product.originalPrice) return product.originalPrice;
    return null;
  };

  const price = getPrice();
  const originalPrice = getOriginalPrice();
  const discount = product.price?.discount || product.pricing?.discount || product.discount;

  // Flexible image extraction
  const getImage = () => {
    if (product.image) return product.image;
    if (product.images && product.images.length > 0) {
      const firstImg = product.images[0];
      return typeof firstImg === 'string' ? firstImg : firstImg?.url;
    }
    return null;
  };

  const imageUrl = getImage();

  // Flexible name extraction
  const productName = product.name || product.title || 'Product';

  // Flexible brand extraction
  const brand = product.brand || product.store?.name;

  // Flexible rating extraction
  const getRating = () => {
    if (product.rating?.value) return product.rating;
    if (product.rating && typeof product.rating === 'number') {
      return { value: product.rating, count: product.reviewCount || 0 };
    }
    if (product.ratings?.average) {
      return { value: product.ratings.average, count: product.ratings.count || 0 };
    }
    return null;
  };

  const rating = getRating();

  // Calculate cashback and ReZ coins from backend data
  const getCashbackPercentage = () => {
    return product.cashback?.percentage || product.cashbackPercentage || 5;
  };

  const cashbackPercent = getCashbackPercentage();
  const cashbackAmount = Math.floor(price * cashbackPercent / 100);
  const rezCoins = Math.floor(price * 0.1); // 10% of price as ReZ coins

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#D1D5DB" />
          </View>
        )}
        {discount && discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
        {similarity && similarity > 0.8 && (
          <View style={styles.matchBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.matchText}>Great Match</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.productName} numberOfLines={2}>
          {productName}
        </Text>

        {brand && (
          <Text style={styles.brand} numberOfLines={1}>
            {brand}
          </Text>
        )}

        {reasons && reasons.length > 0 && (
          <View style={styles.reasonContainer}>
            <Ionicons name="information-circle-outline" size={12} color="#00C06A" />
            <Text style={styles.reason} numberOfLines={1}>
              {reasons[0]}
            </Text>
          </View>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{price}</Text>
          {originalPrice && originalPrice > price && (
            <Text style={styles.originalPrice}>₹{originalPrice}</Text>
          )}
        </View>

        {rating && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#FBBF24" />
            <Text style={styles.rating}>
              {typeof rating.value === 'string'
                ? parseFloat(rating.value).toFixed(1)
                : (rating.value || 0).toFixed(1)}
            </Text>
            <Text style={styles.ratingCount}>({rating.count || 0})</Text>
          </View>
        )}

        {/* Rewards Row - Cashback & ReZ Coins */}
        <View style={styles.rewardsRow}>
          <View style={styles.rewardItem}>
            <Ionicons name="wallet-outline" size={12} color="#00C06A" />
            <Text style={styles.rewardText}>{rezCoins} coins</Text>
          </View>
          <View style={styles.rewardItem}>
            <Ionicons name="card-outline" size={12} color="#F59E0B" />
            <Text style={styles.cashbackText}>₹{cashbackAmount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937'
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00C06A'
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12
  },
  card: {
    width: 160,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    backgroundColor: '#fff'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff'
  },
  matchBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4
  },
  matchText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981'
  },
  info: {
    padding: 12,
    gap: 4
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2
  },
  brand: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6
  },
  reason: {
    fontSize: 11,
    color: '#00C06A',
    fontStyle: 'italic',
    flex: 1
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00C06A'
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through'
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937'
  },
  ratingCount: {
    fontSize: 11,
    color: '#9CA3AF'
  },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00C06A'
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B'
  }
});
