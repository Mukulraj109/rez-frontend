/**
 * CrossStoreProductsSection - Usage Examples
 *
 * This file demonstrates how to use the CrossStoreProductsSection component
 * in different scenarios throughout your app.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import CrossStoreProductsSection from './CrossStoreProductsSection';
import { useRouter } from 'expo-router';

// Example 1: Basic Usage (Default)
// Shows 10 personalized recommendations from other stores
export const BasicExample = () => {
  return (
    <ScrollView>
      <CrossStoreProductsSection />
    </ScrollView>
  );
};

// Example 2: On Store Page (Exclude Current Store)
// Shows recommendations excluding products from the current store
export const StorePageExample = () => {
  const currentStoreId = 'store-123'; // Get from route params or context

  return (
    <ScrollView>
      {/* Store content above... */}

      <CrossStoreProductsSection
        currentStoreId={currentStoreId}
        limit={10}
      />

      {/* More store content below... */}
    </ScrollView>
  );
};

// Example 3: With Custom Product Handler
// Handle product clicks with custom logic
export const CustomHandlerExample = () => {
  const router = useRouter();

  const handleProductPress = (productId: string, product: any) => {
    console.log('Product clicked:', product.name);

    // Custom analytics tracking
    // trackProductClick(productId, product);

    // Navigate to product page with custom params
    router.push({
      pathname: `/product/${productId}`,
      params: {
        from: 'cross-store-recommendations',
        storeId: product.storeId,
      },
    });
  };

  return (
    <ScrollView>
      <CrossStoreProductsSection
        onProductPress={handleProductPress}
        limit={10}
      />
    </ScrollView>
  );
};

// Example 4: Limited Recommendations
// Show fewer recommendations (e.g., 5 products)
export const LimitedExample = () => {
  return (
    <ScrollView>
      <CrossStoreProductsSection limit={5} />
    </ScrollView>
  );
};

// Example 5: In Product Detail Page
// Show cross-store alternatives
export const ProductDetailExample = () => {
  const currentStoreId = 'store-456';
  const router = useRouter();

  const handleProductPress = (productId: string, product: any) => {
    // Navigate to similar product from different store
    router.push(`/product/${productId}`);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Product details above... */}

      {/* Similar products from current store... */}

      {/* Cross-store alternatives */}
      <CrossStoreProductsSection
        currentStoreId={currentStoreId}
        onProductPress={handleProductPress}
        limit={8}
      />
    </ScrollView>
  );
};

// Example 6: Full Integration in Store Page
export const FullStorePageExample = () => {
  const storeId = 'store-789'; // From route params
  const router = useRouter();

  const handleProductPress = (productId: string, product: any) => {
    router.push(`/product/${productId}`);
  };

  return (
    <ScrollView style={styles.fullPageContainer}>
      {/* Store Header */}
      <View style={styles.storeHeader}>
        {/* Store info, logo, etc. */}
      </View>

      {/* Store Products */}
      <View style={styles.storeProducts}>
        {/* Product grid from current store */}
      </View>

      {/* Cross-Store Recommendations */}
      <CrossStoreProductsSection
        currentStoreId={storeId}
        onProductPress={handleProductPress}
        limit={10}
      />

      {/* Other store sections */}
    </ScrollView>
  );
};

// Example 7: With Error Handling & Analytics
export const AdvancedExample = () => {
  const router = useRouter();

  const handleProductPress = (productId: string, product: any) => {
    try {
      // Track analytics
      // analytics.track('cross_store_product_clicked', {
      //   productId,
      //   productName: product.name,
      //   storeId: product.storeId,
      //   storeName: product.storeName,
      //   price: product.price.current,
      // });

      // Navigate
      router.push(`/product/${productId}`);
    } catch (error) {
      console.error('Error handling product press:', error);
    }
  };

  return (
    <ScrollView>
      <CrossStoreProductsSection
        onProductPress={handleProductPress}
        limit={10}
      />
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  fullPageContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  storeHeader: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  storeProducts: {
    padding: 16,
  },
});

/**
 * INTEGRATION NOTES:
 *
 * 1. Basic Setup:
 *    - Import: import CrossStoreProductsSection from '@/components/store/CrossStoreProductsSection';
 *    - Use: <CrossStoreProductsSection />
 *
 * 2. Props:
 *    - currentStoreId (optional): Exclude products from this store
 *    - onProductPress (optional): Custom product click handler
 *    - limit (optional): Number of products to fetch (default: 10)
 *
 * 3. Features:
 *    - ✅ Personalized recommendations from other stores
 *    - ✅ "From [Store Name]" badge on each product
 *    - ✅ Loading state with spinner
 *    - ✅ Error state with retry button
 *    - ✅ Empty state
 *    - ✅ "View All" button → navigates to search page
 *    - ✅ Horizontal scrollable list
 *    - ✅ Responsive design (mobile, tablet, web)
 *    - ✅ Accessibility support
 *    - ✅ Add to cart functionality (via ProductCard)
 *    - ✅ Wishlist toggle (via ProductCard)
 *
 * 4. Requirements:
 *    - usePersonalizedRecommendations hook must be working
 *    - recommendationApi service must be configured
 *    - ProductCard component must be available
 *    - CartContext and WishlistContext must be available
 *
 * 5. API Requirements:
 *    - GET /api/recommendations/personalized?limit=10
 *    - Response should include: { success: true, data: { recommendations: [...] } }
 *    - Each recommendation should have: id, name, brand, image, price, storeName, storeId
 *
 * 6. Customization:
 *    - Modify cardWidth for different screen sizes
 *    - Change colors in styles
 *    - Adjust spacing, shadows, etc.
 *    - Customize loading/error/empty states
 */
