/**
 * MainStorePage - Product Comparison Integration Example
 *
 * This file shows how to integrate the Product Comparison feature
 * into the MainStorePage component.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProductImageGallery } from '@/components/product';
import { useComparison } from '@/contexts/ComparisonContext';
import { SPACING, COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/DesignTokens';
import Button from '@/components/ui/Button';

// Example MainStorePage with Comparison Integration
export default function MainStorePageWithComparison({ storeId }) {
  const router = useRouter();
  const { addProduct, removeProduct, isInComparison, count, canAddMore } = useComparison();

  // Sample product data (replace with real API data)
  const product = {
    id: 'prod_123',
    name: 'Premium Wireless Headphones',
    price: 4999,
    originalPrice: 6999,
    discount: 29,
    cashback: 250,
    image: 'https://example.com/headphones.jpg',
    rating: 4.7,
    reviews: 2543,
    brand: 'AudioTech',
    images: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg',
    ],
    specs: {
      'Battery Life': '30 hours',
      'Bluetooth': '5.2',
      'Noise Cancellation': 'Active ANC',
    },
    features: [
      'Active Noise Cancellation',
      'Wireless Charging',
      'Multipoint Connection',
    ],
  };

  const inComparison = isInComparison(product.id);

  const handleCompareToggle = () => {
    if (inComparison) {
      removeProduct(product.id);
    } else {
      if (canAddMore) {
        addProduct(product);
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Image Gallery with Zoom */}
        <ProductImageGallery
          images={product.images}
          showThumbnails={true}
        />

        {/* Product Info */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.brand}>{product.brand}</Text>
            </View>

            {/* Compare Button */}
            <Pressable
              style={[
                styles.compareButton,
                inComparison && styles.compareButtonActive,
              ]}
              onPress={handleCompareToggle}
              disabled={!inComparison && !canAddMore}
            >
              <Ionicons
                name={inComparison ? "checkmark-circle" : "scale-outline"}
                size={20}
                color={inComparison ? COLORS.success[500] : COLORS.primary[500]}
              />
              <Text
                style={[
                  styles.compareButtonText,
                  inComparison && styles.compareButtonTextActive,
                ]}
              >
                {inComparison ? "In Comparison" : "Compare"}
              </Text>
            </Pressable>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={COLORS.warning[500]} />
            <Text style={styles.rating}>{product.rating}</Text>
            <Text style={styles.reviews}>({product.reviews} reviews)</Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>
                ₹{product.originalPrice.toLocaleString()}
              </Text>
            )}
            {product.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{product.discount}% OFF</Text>
              </View>
            )}
          </View>

          {/* Cashback */}
          {product.cashback && (
            <View style={styles.cashbackCard}>
              <Ionicons name="cash-outline" size={20} color={COLORS.success[700]} />
              <Text style={styles.cashbackText}>
                Get ₹{product.cashback} cashback
              </Text>
            </View>
          )}

          {/* Specifications Preview */}
          <View style={styles.specsSection}>
            <Text style={styles.sectionTitle}>Key Specifications</Text>
            {Object.entries(product.specs).map(([key, value]) => (
              <View key={key} style={styles.specRow}>
                <Text style={styles.specLabel}>{key}</Text>
                <Text style={styles.specValue}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Features</Text>
            {product.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success[500]} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title="Add to Cart"
              onPress={() => console.log('Add to cart')}
              variant="primary"
              fullWidth
              icon={<Ionicons name="cart-outline" size={20} color={COLORS.text.inverse} />}
            />

            <Button
              title="Buy Now"
              onPress={() => console.log('Buy now')}
              variant="secondary"
              fullWidth
              style={{ marginTop: SPACING.sm }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Comparison Floating Action Button */}
      {count > 0 && (
        <Pressable
          style={styles.fab}
          onPress={() => router.push('/comparison')}
        >
          <Ionicons name="scale" size={24} color={COLORS.text.inverse} />
          <Text style={styles.fabText}>Compare ({count})</Text>
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>{count}</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    padding: SPACING.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  productName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  brand: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
  },

  // Compare Button
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.background.primary,
  },
  compareButtonActive: {
    backgroundColor: COLORS.success[50],
    borderColor: COLORS.success[500],
  },
  compareButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary[500],
    fontWeight: '600',
  },
  compareButtonTextActive: {
    color: COLORS.success[700],
  },

  // Rating
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  rating: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  reviews: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.tertiary,
  },

  // Price
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  price: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  originalPrice: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.tertiary,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: COLORS.error[50],
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  discountText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error[700],
    fontWeight: '700',
  },

  // Cashback
  cashbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.success[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  cashbackText: {
    ...TYPOGRAPHY.body,
    color: COLORS.success[700],
    fontWeight: '600',
  },

  // Specifications
  specsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  specLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
  },
  specValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    fontWeight: '600',
  },

  // Features
  featuresSection: {
    marginBottom: SPACING.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  featureText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
  },

  // Actions
  actions: {
    marginTop: SPACING.lg,
  },

  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.lg,
  },
  fabText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.inverse,
  },
  fabBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error[500],
    borderRadius: BORDER_RADIUS.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  fabBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.inverse,
    fontWeight: '700',
  },
});
