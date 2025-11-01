// BundleDeals Component
// Displays special bundle deals with discounts

import React from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { BundleItem } from '@/services/recommendationApi';

interface BundleDealsProps {
  bundles: BundleItem[];
  loading?: boolean;
  onAddToCart?: (products: any[]) => void;
  onProductPress?: (productId: string) => void;
}

export default function BundleDeals({
  bundles,
  loading = false,
  onAddToCart,
  onProductPress
}: BundleDealsProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Special Bundle Deals</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Special Bundle Deals</Text>
          <Text style={styles.subtitle}>Save more when you buy together</Text>
        </View>
        <View style={styles.dealBadge}>
          <Ionicons name="flash" size={16} color="#F59E0B" />
          <Text style={styles.dealBadgeText}>Limited Time</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {bundles.map((bundle, index) => (
          <BundleDealCard
            key={index}
            bundle={bundle}
            onAddToCart={() => onAddToCart?.(bundle.products)}
            onProductPress={onProductPress}
          />
        ))}
      </ScrollView>
    </View>
  );
}

interface BundleDealCardProps {
  bundle: BundleItem;
  onAddToCart?: () => void;
  onProductPress?: (productId: string) => void;
}

function BundleDealCard({ bundle, onAddToCart, onProductPress }: BundleDealCardProps) {
  const originalPrice = bundle.products.reduce(
    (sum, p) => sum + (p.price?.original || p.price?.current || 0),
    0
  );
  
  const savingsPercentage = originalPrice > 0
    ? Math.round((bundle.savings / originalPrice) * 100)
    : 0;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#F3F0FF', '#FFFFFF']}
        style={styles.cardGradient}
      >
        <View style={styles.savingsBadge}>
          <Text style={styles.savingsBadgeText}>SAVE {savingsPercentage}%</Text>
        </View>

        <View style={styles.productsPreview}>
          {bundle.products.slice(0, 2).map((product, index) => (
            <React.Fragment key={product.id || index}>
              <TouchableOpacity
                style={styles.productThumb}
                onPress={() => onProductPress?.(product.id)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: product.image || 'https://via.placeholder.com/80' }}
                  style={styles.thumbImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              {index === 0 && bundle.products.length > 1 && (
                <View style={styles.plusBadge}>
                  <Text style={styles.plusText}>+</Text>
                </View>
              )}
            </React.Fragment>
          ))}
          {bundle.products.length > 2 && (
            <View style={styles.moreBadge}>
              <Text style={styles.moreText}>+{bundle.products.length - 2}</Text>
            </View>
          )}
        </View>

        <View style={styles.bundleInfo}>
          <Text style={styles.bundleTitle} numberOfLines={2}>
            {bundle.products.map(p => p.name).join(' + ')}
          </Text>

          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.label}>Bundle Price:</Text>
              <Text style={styles.bundlePrice}>₹{bundle.combinedPrice}</Text>
            </View>
            {originalPrice > bundle.combinedPrice && (
              <View style={styles.priceRow}>
                <Text style={styles.label}>Regular Price:</Text>
                <Text style={styles.regularPrice}>₹{originalPrice}</Text>
              </View>
            )}
            {bundle.savings > 0 && (
              <View style={styles.savingsHighlight}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.savingsAmount}>
                  You save ₹{bundle.savings}!
                </Text>
              </View>
            )}
          </View>

          {onAddToCart && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={onAddToCart}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8B5CF6', '#6D28D9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addButtonGradient}
              >
                <Ionicons name="cart" size={18} color="#fff" />
                <Text style={styles.addButtonText}>Add Bundle</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
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
    alignItems: 'flex-start',
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
    color: '#6B7280'
  },
  dealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A'
  },
  dealBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B'
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16
  },
  card: {
    width: 300,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5
  },
  cardGradient: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#E9D5FF',
    borderRadius: 16
  },
  savingsBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 1
  },
  savingsBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5
  },
  productsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8
  },
  productThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E9D5FF'
  },
  thumbImage: {
    width: '100%',
    height: '100%'
  },
  plusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  plusText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff'
  },
  moreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6D28D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -12
  },
  moreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff'
  },
  bundleInfo: {
    gap: 12
  },
  bundleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    minHeight: 40
  },
  priceContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    gap: 8
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: 13,
    color: '#6B7280'
  },
  bundlePrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#8B5CF6'
  },
  regularPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through'
  },
  savingsHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 4
  },
  savingsAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981'
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  }
});
