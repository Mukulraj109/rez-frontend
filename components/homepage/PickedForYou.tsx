import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRecommendations } from '@/hooks/useHomepage';
import { RecommendationItem } from '@/types/homepage.types';
import { useHomepageNavigation } from '@/hooks/useHomepage';
import { SectionSkeleton } from '@/components/homepage/skeletons';

interface PickedForYouProps {
  onViewAllPress?: () => void;
  limit?: number;
}

const PickedForYou: React.FC<PickedForYouProps> = ({ 
  onViewAllPress,
  limit = 2 
}) => {
  const router = useRouter();
  const { section, loading, error } = useRecommendations();
  const { handleItemPress } = useHomepageNavigation();

  // Extract products from section, limit to specified number
  const products = useMemo(() => {
    if (!section?.items || section.items.length === 0) {
      return [];
    }

    // Take first 'limit' items and ensure they have recommendation fields
    // If items don't have recommendationScore, generate one from rating or use default
    const recommendationItems = section.items.slice(0, limit).map((item) => {
      // If item already has recommendation fields, use it as-is
      if ('recommendationReason' in item && 'recommendationScore' in item) {
        return item as RecommendationItem;
      }

      // Otherwise, create a RecommendationItem from ProductItem
      const productItem = item as any;
      return {
        ...productItem,
        recommendationReason: productItem.recommendationReason || 'Recommended for you',
        recommendationScore: productItem.recommendationScore || (productItem.rating?.value ? parseFloat(String(productItem.rating.value)) / 5 : 0.85),
        personalizedFor: productItem.personalizedFor || productItem.category?.toLowerCase() || 'general',
      } as RecommendationItem;
    });

    return recommendationItems;
  }, [section?.items, limit]);

  // Determine dynamic subtitle based on personalization status
  const subtitle = useMemo(() => {
    if (!products || products.length === 0) {
      return 'Based on your shopping history';
    }

    // Check if any product has personalizedFor field with a user ID
    const isPersonalized = products.some((item: any) =>
      item.personalizedFor && item.personalizedFor !== 'general' && item.personalizedFor !== null
    );

    // Check if any product mentions location in the reason
    const hasLocationData = products.some((item: any) =>
      item.recommendationReason?.toLowerCase().includes('near you')
    );

    if (isPersonalized && hasLocationData) {
      return 'Based on your location & shopping history';
    } else if (isPersonalized) {
      return 'Based on your shopping history';
    } else {
      return 'Popular items you might like';
    }
  }, [products]);

  // Convert recommendationScore (0.5-1.0) to percentage (50-100%)
  const getMatchPercentage = (score: number): number => {
    return Math.round(score * 100);
  };

  // Format price from price object
  const formatPrice = (price: RecommendationItem['price']): string => {
    if (typeof price === 'number') {
      return `₹${price.toLocaleString('en-IN')}`;
    }
    if (price?.current) {
      return `₹${price.current.toLocaleString('en-IN')}`;
    }
    return '₹0';
  };

  // Calculate savings percentage
  const getSavings = (price: RecommendationItem['price']): string | null => {
    if (typeof price === 'object' && price.original && price.current) {
      const discount = Math.round(((price.original - price.current) / price.original) * 100);
      if (discount > 0) {
        return `Save ${discount}%`;
      }
    }
    if (typeof price === 'object' && price.discount) {
      return `Save ${price.discount}%`;
    }
    return null;
  };

  const handleProductPress = (item: RecommendationItem) => {
    handleItemPress('just_for_you', item);
  };

  const handleViewAll = () => {
    if (onViewAllPress) {
      onViewAllPress();
    } else {
      router.push('/recommendations');
    }
  };

  // Show loading state - show skeleton similar to "Just For You"
  const isLoading = loading || (!section && !error);
  const hasNoItems = !section?.items || section.items.length === 0;

  if (isLoading || (hasNoItems && !error)) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="sparkles" size={20} color="#EF4444" style={styles.headerIcon} />
            <View>
              <Text style={styles.title}>Picked For You</Text>
              <Text style={styles.subtitleText}>Loading recommendations...</Text>
            </View>
          </View>
          <View style={styles.aiTag}>
            <Text style={styles.aiTagText}>AI Powered</Text>
          </View>
        </View>
        <SectionSkeleton
          cardType="recommendation"
          cardWidth={160}
          spacing={12}
          numCards={2}
          showIndicator={false}
        />
      </View>
    );
  }

  // Show empty state if no products after loading
  if (!isLoading && products.length === 0) {
    return null; // Don't show section if no products
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="ellipse-outline" size={20} color="#EF4444" style={styles.headerIcon} />
          <View>
            <Text style={styles.title}>Picked For You</Text>
            <Text style={styles.subtitleText}>{subtitle}</Text>
          </View>
        </View>
        <View style={styles.aiTag}>
          <Text style={styles.aiTagText}>AI Powered</Text>
        </View>
      </View>

      {/* Product Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsContainer}
      >
        {products.map((product) => {
          const matchPercentage = getMatchPercentage(product.recommendationScore);
          const priceText = formatPrice(product.price);
          const savings = getSavings(product.price);
          const productName = product.name || product.title || 'Product';
          const productImage = product.image || product.images?.[0];

          return (
            <TouchableOpacity
              key={product.id}
              onPress={() => handleProductPress(product)}
              activeOpacity={0.9}
              style={styles.productCard}
            >
              <LinearGradient
                colors={['#E9D5FF', '#F3E8FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                {/* Product Image Container */}
                <View style={styles.imageContainer}>
                  {productImage ? (
                    <Image
                      source={{ uri: productImage }}
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Ionicons
                        name="cube-outline"
                        size={48}
                        color="#A855F7"
                      />
                    </View>
                  )}
                  {/* Match Percentage Badge */}
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchBadgeText}>
                      {matchPercentage}%{matchPercentage >= 90 ? ' match' : ''}
                    </Text>
                  </View>
                </View>

                {/* Product Info */}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {productName}
                  </Text>
                  <Text style={styles.productReason} numberOfLines={1}>
                    {product.recommendationReason || 'Recommended for you'}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{priceText}</Text>
                    {savings && (
                      <Text style={styles.savings}>{savings}</Text>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 8,
  },
  headerIcon: {
    marginTop: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },
  aiTag: {
    backgroundColor: '#A855F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  productsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  productCard: {
    width: 160,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardGradient: {
    padding: 12,
    minHeight: 220,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  matchBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#A855F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  productInfo: {
    gap: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2240',
    textAlign: 'center',
    marginBottom: 2,
  },
  productReason: {
    fontSize: 11,
    color: '#A855F7',
    textAlign: 'center',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2240',
  },
  savings: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
});

export default PickedForYou;

