/**
 * RelatedProducts Integration Example
 *
 * This file demonstrates how to integrate the RelatedProducts component
 * into your MainStorePage or ProductDetailPage.
 *
 * Copy the relevant sections into your existing page components.
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { RelatedProducts } from '@/components/store';
import { ProductItem } from '@/types/homepage.types';
import { useRouter } from 'expo-router';
import { useRegion } from '@/contexts/RegionContext';

/**
 * Example 1: Basic Integration in MainStorePage
 */
export function MainStorePageExample() {
  const [selectedProductId, setSelectedProductId] = useState('product-123');
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Your existing store content */}
        <View style={styles.storeHeader}>
          <Text style={styles.storeName}>Store Name</Text>
        </View>

        {/* Product Display Section */}
        <View style={styles.productSection}>
          <Text style={styles.sectionTitle}>Featured Product</Text>
          {/* Your product display component */}
        </View>

        {/* RELATED PRODUCTS SECTION - ADD THIS */}
        <RelatedProducts
          productId={selectedProductId}
          title="You May Also Like"
          limit={10}
          showViewAll={true}
          onProductPress={(product) => {
            // Navigate to product detail page
            router.push(`/product/${product.id}`);
          }}
        />

        {/* Your other sections */}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Example 2: Product Detail Page Integration
 */
export function ProductDetailPageExample() {
  const [currentProduct, setCurrentProduct] = useState<ProductItem | null>(null);
  const router = useRouter();
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();

  const handleRelatedProductPress = (product: ProductItem) => {
    // Update current product and scroll to top
    setCurrentProduct(product);

    // Or navigate to new product page
    router.push(`/product/${product.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Product Images */}
        <View style={styles.productImages}>
          <Text style={styles.placeholder}>Product Images Here</Text>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>Product Name</Text>
          <Text style={styles.productPrice}>{currencySymbol}999</Text>
          <Text style={styles.productDescription}>Description...</Text>
        </View>

        {/* Product Details */}
        <View style={styles.productDetails}>
          <Text style={styles.sectionTitle}>Details</Text>
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Reviews</Text>
        </View>

        {/* RELATED PRODUCTS - ADD THIS */}
        {currentProduct && (
          <RelatedProducts
            productId={currentProduct.id}
            currentProduct={currentProduct}
            title="Similar Products"
            limit={10}
            onProductPress={handleRelatedProductPress}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Example 3: Conditional Rendering Based on Context
 */
export function ConditionalRenderingExample() {
  const [productId, setProductId] = useState<string | null>('product-123');
  const [showRelated, setShowRelated] = useState(true);

  return (
    <ScrollView style={styles.container}>
      {/* Your content */}

      {/* Only show related products if conditions are met */}
      {showRelated && productId && (
        <RelatedProducts
          productId={productId}
          title="You May Also Like"
          limit={8}
        />
      )}
    </ScrollView>
  );
}

/**
 * Example 4: Multiple Related Product Sections
 */
export function MultipleRelatedSectionsExample() {
  const productId = 'product-123';

  return (
    <ScrollView style={styles.container}>
      {/* Product Details */}
      <View style={styles.productSection}>
        <Text style={styles.productName}>Main Product</Text>
      </View>

      {/* Related Products by Category */}
      <RelatedProducts
        productId={productId}
        title="Similar in Category"
        limit={8}
        showViewAll={true}
      />

      {/* Related Products by Brand */}
      <View style={styles.sectionDivider} />

      <RelatedProducts
        productId={productId}
        title="More from this Brand"
        limit={6}
        showViewAll={false}
      />

      {/* Related Products Frequently Bought Together */}
      <View style={styles.sectionDivider} />

      <RelatedProducts
        productId={productId}
        title="Customers Also Bought"
        limit={5}
        showViewAll={false}
      />
    </ScrollView>
  );
}

/**
 * Example 5: With Analytics Tracking
 */
export function AnalyticsIntegrationExample() {
  const productId = 'product-123';
  const router = useRouter();

  const trackProductView = (product: ProductItem) => {
    // Your analytics tracking
    // analytics.track('related_product_viewed', { productId: product.id });
  };

  const handleProductPress = (product: ProductItem) => {
    // Track the click
    trackProductView(product);

    // Navigate
    router.push(`/product/${product.id}`);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Your content */}

      <RelatedProducts
        productId={productId}
        onProductPress={handleProductPress}
      />
    </ScrollView>
  );
}

/**
 * Example 6: Custom Styling Container
 */
export function CustomStyledExample() {
  return (
    <ScrollView style={styles.container}>
      {/* Your content */}

      {/* Wrap in custom container for additional styling */}
      <View style={styles.relatedProductsContainer}>
        <RelatedProducts
          productId="product-123"
          title="You May Also Like"
        />
      </View>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  storeHeader: {
    padding: 16,
    backgroundColor: '#7C3AED',
  },
  storeName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  productSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  productImages: {
    height: 300,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 12,
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  productDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  reviewsSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionDivider: {
    height: 12,
    backgroundColor: '#F9FAFB',
  },
  relatedProductsContainer: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
  },
});

/**
 * Usage in your actual pages:
 *
 * 1. Import the component:
 *    import { RelatedProducts } from '@/components/store';
 *
 * 2. Add it to your JSX (choose the example that fits your needs):
 *    <RelatedProducts productId={yourProductId} />
 *
 * 3. Customize with props as needed:
 *    - title: Change section header
 *    - limit: Control number of products
 *    - showViewAll: Show/hide view all button
 *    - onProductPress: Custom navigation handler
 *
 * 4. Handle navigation:
 *    const handlePress = (product) => {
 *      router.push(`/product/${product.id}`);
 *    };
 */

export default {
  MainStorePageExample,
  ProductDetailPageExample,
  ConditionalRenderingExample,
  MultipleRelatedSectionsExample,
  AnalyticsIntegrationExample,
  CustomStyledExample,
};
