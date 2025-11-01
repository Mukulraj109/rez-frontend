// FrequentlyBoughtTogether Component
// Displays products frequently bought together with the current product

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BundleItem } from '@/services/recommendationApi';

interface FrequentlyBoughtTogetherProps {
  bundles: BundleItem[];
  loading?: boolean;
  onAddToCart?: (products: any[]) => void;
  onProductPress?: (productId: string) => void;
}

export default function FrequentlyBoughtTogether({
  bundles,
  loading = false,
  onAddToCart,
  onProductPress
}: FrequentlyBoughtTogetherProps) {
  const [selectedBundle, setSelectedBundle] = useState(0);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Frequently Bought Together</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </View>
    );
  }

  if (!bundles || bundles.length === 0) {
    return null;
  }

  const currentBundle = bundles[selectedBundle];
  const originalPrice = currentBundle.products.reduce(
    (sum, p) => sum + (p.price?.original || p.price?.current || 0),
    0
  );
  const savingsPercentage = originalPrice > 0
    ? Math.round((currentBundle.savings / originalPrice) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Frequently Bought Together</Text>
          {currentBundle.frequency > 0 && (
            <Text style={styles.subtitle}>
              {currentBundle.frequency} people bought these together
            </Text>
          )}
        </View>
      </View>

      <View style={styles.bundleContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsRow}
        >
          {currentBundle.products.map((product, index) => (
            <React.Fragment key={product.id || index}>
              <BundleProductCard
                product={product}
                onPress={() => onProductPress?.(product.id)}
              />
              {index < currentBundle.products.length - 1 && (
                <View style={styles.plusIcon}>
                  <Ionicons name="add" size={20} color="#8B5CF6" />
                </View>
              )}
            </React.Fragment>
          ))}
        </ScrollView>

        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total Price:</Text>
            <View style={styles.priceGroup}>
              {originalPrice > currentBundle.combinedPrice && (
                <Text style={styles.originalPrice}>₹{originalPrice}</Text>
              )}
              <Text style={styles.price}>₹{currentBundle.combinedPrice}</Text>
            </View>
          </View>

          {currentBundle.savings > 0 && (
            <View style={styles.savingsRow}>
              <View style={styles.savingsBadge}>
                <Ionicons name="pricetag" size={14} color="#10B981" />
                <Text style={styles.savingsText}>
                  Save ₹{currentBundle.savings} ({savingsPercentage}%)
                </Text>
              </View>
            </View>
          )}

          {onAddToCart && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => onAddToCart(currentBundle.products)}
              activeOpacity={0.8}
            >
              <Ionicons name="cart" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add All to Cart</Text>
            </TouchableOpacity>
          )}
        </View>

        {bundles.length > 1 && (
          <View style={styles.paginationContainer}>
            {bundles.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.paginationDot,
                  index === selectedBundle && styles.paginationDotActive
                ]}
                onPress={() => setSelectedBundle(index)}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

interface BundleProductCardProps {
  product: any;
  onPress?: () => void;
}

function BundleProductCard({ product, onPress }: BundleProductCardProps) {
  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: product.image || 'https://via.placeholder.com/100' }}
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productPrice}>
          ₹{product.price?.current || product.price?.original || 0}
        </Text>
        {product.rating && (
          <View style={styles.productRating}>
            <Ionicons name="star" size={10} color="#FBBF24" />
            <Text style={styles.ratingText}>{product.rating.value.toFixed(1)}</Text>
          </View>
        )}
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
    paddingHorizontal: 16,
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic'
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bundleContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  productsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    gap: 12
  },
  productCard: {
    width: 120,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  productImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#fff'
  },
  productImage: {
    width: '100%',
    height: '100%'
  },
  productInfo: {
    padding: 8,
    gap: 4
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937'
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6'
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1F2937'
  },
  plusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  priceSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    gap: 12
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151'
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8B5CF6'
  },
  originalPrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through'
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1FAE5'
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981'
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB'
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: '#8B5CF6'
  }
});
