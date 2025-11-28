/**
 * MainStorePage Integration Example
 *
 * This file demonstrates how to integrate all 6 new components
 * into the MainStorePage component.
 *
 * Copy sections from this file into your actual MainStorePage.tsx
 */

import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

// Import the 6 new components
import {
  SpecificationsTable,
  DeliveryEstimator,
  VariantSelector,
  TrustBadges,
  StockIndicator,
  RecentlyViewed,
} from '@/components/product';

// Import your existing components
import MainStoreHeader from './MainStoreSection/MainStoreHeader';
import ProductDisplay from './MainStoreSection/ProductDisplay';
import TabNavigation from './MainStoreSection/TabNavigation';
import ProductDetails from './MainStoreSection/ProductDetails';
import UGCSection from './MainStoreSection/UGCSection';
import CashbackOffer from './MainStoreSection/CashbackOffer';

export default function MainStorePageExample() {
  const params = useLocalSearchParams();
  const { cardId, cardType } = params;

  // State for variants
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<any[]>([]);

  // Mock product data (replace with your actual data)
  const productData = {
    id: cardId as string,
    name: 'Nike Air Max 2024',
    brand: 'Nike',
    price: 8999,
    originalPrice: 12999,
    discount: 31,
    stock: 15,
    rating: 4.5,
    reviews: 1234,

    // Variants for VariantSelector
    variants: [
      { id: '7', label: '7 UK', available: true },
      { id: '8', label: '8 UK', available: true },
      { id: '9', label: '9 UK', available: false },
      { id: '10', label: '10 UK', available: true },
      { id: '11', label: '11 UK', available: true },
    ],

    // Specifications for SpecificationsTable
    specifications: {
      'Brand': 'Nike',
      'Model Name': 'Air Max 2024',
      'Color': 'Black/White/Red',
      'Material': 'Mesh and Synthetic Leather',
      'Sole Material': 'Rubber',
      'Closure': 'Lace-Up',
      'Weight': '300g (per single shoe)',
      'Heel Height': '3 cm',
      'Ideal For': 'Men',
      'Occasion': 'Sports, Casual',
      'Care Instructions': 'Wipe with clean, dry cloth to remove dust',
      'Country of Origin': 'India',
      'Manufacturer': 'Nike India Pvt Ltd',
      'Warranty': '3 months manufacturer warranty',
    },

    description: 'Experience ultimate comfort and style with the Nike Air Max 2024...',
    images: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  };

  // Load recently viewed products
  useEffect(() => {
    // In real app: load from AsyncStorage or API
    const mockRecentlyViewed = [
      {
        id: 'prod_101',
        name: 'Adidas Ultraboost 22 Running Shoes',
        price: 7999,
        originalPrice: 9999,
        discount: 20,
        image: 'https://example.com/adidas.jpg',
      },
      {
        id: 'prod_102',
        name: 'Puma RS-X Sneakers',
        price: 5499,
        originalPrice: 7999,
        discount: 31,
        image: 'https://example.com/puma.jpg',
      },
      {
        id: 'prod_103',
        name: 'Reebok Classic Leather Shoes',
        price: 4999,
        image: 'https://example.com/reebok.jpg',
      },
      {
        id: 'prod_104',
        name: 'New Balance 574 Sport',
        price: 6499,
        originalPrice: 8499,
        discount: 23,
      },
    ];

    setRecentlyViewedProducts(mockRecentlyViewed);
  }, []);

  // Optional: Custom delivery check handler
  const handleCheckDelivery = async (pincode: string) => {
    // In real app: call your delivery API
    // const response = await fetch(`/api/delivery/check`, {
    //   method: 'POST',
    //   body: JSON.stringify({ pincode, productId: productData.id }),
    // });
    // return response.json();

    // Mock implementation
    return {
      estimatedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
      charge: pincode.startsWith('1') ? 0 : 50,
      isFree: pincode.startsWith('1'),
      message: 'Usually delivered in 2-3 business days',
    };
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* ==================== EXISTING SECTIONS ==================== */}

        {/* Header with back button, share, wishlist */}
        <MainStoreHeader productName={productData.name} />

        {/* Product images carousel */}
        <ProductDisplay images={productData.images} />

        {/* Price, rating, brand info */}
        <View style={styles.priceSection}>
          {/* Your existing price/rating component */}
        </View>

        {/* ==================== NEW SECTION 1: STOCK INDICATOR ==================== */}
        {/* Shows stock availability with color coding */}
        <StockIndicator
          stock={productData.stock}
          lowStockThreshold={10}
        />

        {/* ==================== NEW SECTION 2: TRUST BADGES ==================== */}
        {/* Build user confidence early in the page */}
        <TrustBadges />
        {/*
          Or use custom badges:
          <TrustBadges
            badges={[
              { icon: '🔒', text: 'Secure Payments' },
              { icon: '🚚', text: 'Free Delivery' },
              { icon: '↩️', text: '7 Day Returns' },
              { icon: '✓', text: 'Verified Seller' },
              { icon: '🎁', text: 'Gift Wrap Available' },
            ]}
          />
        */}

        {/* ==================== NEW SECTION 3: VARIANT SELECTOR ==================== */}
        {/* Critical for products with sizes/colors/variants */}
        {productData.variants && productData.variants.length > 0 && (
          <VariantSelector
            title="Select Size"
            variants={productData.variants}
            selectedId={selectedVariant}
            onSelect={(variantId) => {
              setSelectedVariant(variantId);
              console.log('Selected variant:', variantId);
              // Update cart/price based on variant
            }}
          />
        )}

        {/* For color variants, add another VariantSelector */}
        {/*
        <VariantSelector
          title="Select Color"
          variants={[
            { id: 'black', label: 'Black', available: true },
            { id: 'white', label: 'White', available: true },
            { id: 'red', label: 'Red', available: false },
          ]}
          onSelect={(colorId) => console.log('Color:', colorId)}
        />
        */}

        {/* ==================== NEW SECTION 4: DELIVERY ESTIMATOR ==================== */}
        {/* Important purchase decision factor */}
        <DeliveryEstimator
          productId={productData.id}
          onCheckDelivery={handleCheckDelivery}
        />

        {/* Existing cashback offer */}
        <CashbackOffer />

        {/* Tab navigation for description/details/reviews */}
        <TabNavigation />

        {/* Product description */}
        <ProductDetails description={productData.description} />

        {/* UGC Section */}
        <UGCSection />

        {/* Reviews section */}
        {/* Your existing reviews component */}

        {/* ==================== NEW SECTION 5: SPECIFICATIONS TABLE ==================== */}
        {/* For detail-oriented shoppers */}
        <SpecificationsTable
          specifications={productData.specifications}
          defaultExpanded={false}
        />

        {/* Additional product info, FAQs, etc. */}

        {/* ==================== NEW SECTION 6: RECENTLY VIEWED ==================== */}
        {/* Cross-sell opportunity at the bottom */}
        <RecentlyViewed
          products={recentlyViewedProducts}
          onProductPress={(product) => {
            console.log('Viewing recently viewed product:', product);
            // Optional: custom navigation logic
          }}
        />

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky bottom bar with Add to Cart */}
      <View style={styles.bottomBar}>
        {/* Your existing Add to Cart button */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  priceSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bottomSpacer: {
    height: 100, // Space for sticky bottom bar
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});

/**
 * INTEGRATION NOTES:
 *
 * 1. IMPORTS:
 *    Add the import statement at the top of MainStorePage.tsx:
 *    import { SpecificationsTable, DeliveryEstimator, ... } from '@/components/product';
 *
 * 2. STATE:
 *    Add state for selectedVariant if using VariantSelector
 *    Add state for recentlyViewedProducts
 *
 * 3. DATA:
 *    Ensure your product data includes:
 *    - stock (number)
 *    - variants (array)
 *    - specifications (object)
 *
 * 4. ORDER:
 *    Recommended component order (top to bottom):
 *    - StockIndicator (creates urgency)
 *    - TrustBadges (builds confidence)
 *    - VariantSelector (critical for purchase)
 *    - DeliveryEstimator (answers key questions)
 *    - [existing content]
 *    - SpecificationsTable (for detail seekers)
 *    - RecentlyViewed (cross-sell at bottom)
 *
 * 5. STYLING:
 *    All components are self-contained with consistent styling.
 *    No additional styling needed unless customizing.
 *
 * 6. OPTIONAL CUSTOMIZATION:
 *    - TrustBadges: Pass custom badges array
 *    - DeliveryEstimator: Provide onCheckDelivery for real API
 *    - RecentlyViewed: Provide onProductPress for custom navigation
 *    - StockIndicator: Adjust lowStockThreshold
 *    - SpecificationsTable: Set defaultExpanded={true}
 *
 * 7. TESTING:
 *    Test each component individually before full integration:
 *    - Different stock levels (0, 5, 50)
 *    - Available/unavailable variants
 *    - Valid/invalid PIN codes
 *    - Short/long specification lists
 *    - Products with/without images
 */
