/**
 * ProductQuickView Integration Example
 *
 * This file demonstrates how to integrate the ProductQuickView modal
 * with your existing product cards and pages.
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import StoreProductCard from '@/components/store/StoreProductCard';
import { ProductQuickView } from '@/components/product';
import { ProductItem } from '@/types/homepage.types';
import { VariantSelection } from '@/components/cart/ProductVariantModal';

interface ProductQuickViewExampleProps {
  products: ProductItem[];
}

export default function ProductQuickViewExample({ products }: ProductQuickViewExampleProps) {
  const router = useRouter();
  const [quickViewVisible, setQuickViewVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Handle regular tap - navigate to full product page
  const handleProductPress = (product: ProductItem) => {
    router.push(`/product/${product.id}`);
  };

  // Handle long press - show quick view
  const handleProductLongPress = (product: ProductItem) => {
    setSelectedProductId(product.id);
    setQuickViewVisible(true);
  };

  // Handle "View Full Details" from quick view
  const handleViewFullDetails = () => {
    if (selectedProductId) {
      router.push(`/product/${selectedProductId}`);
    }
  };

  // Handle add to cart from quick view
  const handleAddToCart = (product: ProductItem, variant?: VariantSelection) => {
    // CartContext handles the actual cart addition via the ProductQuickView component
  };

  return (
    <View style={styles.container}>
      {products.map((product) => (
        <StoreProductCard
          key={product.id}
          product={product}
          onPress={() => handleProductPress(product)}
          onLongPress={() => handleProductLongPress(product)}
        />
      ))}

      {/* ProductQuickView Modal */}
      <ProductQuickView
        visible={quickViewVisible}
        productId={selectedProductId}
        onClose={() => setQuickViewVisible(false)}
        onViewFullDetails={handleViewFullDetails}
        onAddToCart={handleAddToCart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

/**
 * INTEGRATION NOTES:
 *
 * 1. Import the component:
 *    import { ProductQuickView } from '@/components/product';
 *
 * 2. Add state for modal visibility and selected product:
 *    const [quickViewVisible, setQuickViewVisible] = useState(false);
 *    const [selectedProductId, setSelectedProductId] = useState<string>('');
 *
 * 3. Add long-press handler to your product cards:
 *    <StoreProductCard
 *      product={product}
 *      onLongPress={() => {
 *        setSelectedProductId(product.id);
 *        setQuickViewVisible(true);
 *      }}
 *    />
 *
 * 4. Add the ProductQuickView modal:
 *    <ProductQuickView
 *      visible={quickViewVisible}
 *      productId={selectedProductId}
 *      onClose={() => setQuickViewVisible(false)}
 *      onViewFullDetails={() => router.push(`/product/${selectedProductId}`)}
 *    />
 *
 * FEATURES:
 * - Swipeable image carousel
 * - Variant selection (size/color)
 * - Quantity selector
 * - Add to cart button
 * - Wishlist toggle
 * - Share functionality
 * - Stock badge
 * - Truncated description with "Read More"
 * - "View Full Details" link
 * - Smooth slide-in animation
 * - Backdrop blur effect
 * - Loading and error states
 * - Retry on error
 */
