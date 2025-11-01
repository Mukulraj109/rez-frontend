// Product Detail Page
// Dynamic route for individual product details

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  Dimensions,
  Alert,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProductReviews } from '@/hooks/useProductReviews';
import ProductReviewsSection from '@/components/reviews/ProductReviewsSection';
import productsApi from '@/services/productsApi';

const { width: screenWidth } = Dimensions.get('window');

interface ProductDetails {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  description: string;
  specifications: { [key: string]: string };
  availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LIMITED';
  rating: number;
  reviewCount: number;
  category: string;
  brand: string;
  tags: string[];
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Use the reviews hook for complete review management
  const {
    reviews,
    summary: reviewSummary,
    isLoading: reviewsLoading,
    isRefreshing: reviewsRefreshing,
    hasMore: hasMoreReviews,
    sortBy,
    filterRating,
    refreshReviews,
    loadMoreReviews,
    setSortBy,
    setFilterRating,
    submitReview,
    updateReview,
    deleteReview,
    markHelpful,
  } = useProductReviews({
    productId: id as string,
    autoLoad: true,
  });

  useEffect(() => {
    loadProductDetails(id as string);
  }, [id]);

  const loadProductDetails = async (productId: string) => {
    try {

      // Fetch product details from backend
      const productResponse = await productsApi.getProductById(productId);

      if (!productResponse.success || !productResponse.data) {
        console.error('❌ [PRODUCT PAGE] Failed to load product:', productResponse.message);
        setIsLoading(false);
        return;
      }

      const productData = productResponse.data;

      // Transform backend product data to component format
      const transformedProduct: ProductDetails = {
        id: productData.id || (productData as any)._id,
        name: productData.name,
        price: productData.pricing?.salePrice || productData.pricing?.basePrice || 0,
        originalPrice: productData.pricing?.basePrice !== productData.pricing?.salePrice
          ? productData.pricing?.basePrice
          : undefined,
        discount: productData.pricing?.salePrice && productData.pricing?.basePrice
          ? Math.round(((productData.pricing.basePrice - productData.pricing.salePrice) / productData.pricing.basePrice) * 100)
          : undefined,
        images: productData.images?.map(img => img.url) || [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
        ],
        description: productData.description || 'No description available',
        specifications: productData.variants?.[0]?.attributes || {},
        availability: productData.variants?.[0]?.inventory?.quantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
        rating: reviewSummary?.averageRating || productData.ratings?.average || 0,
        reviewCount: reviewSummary?.totalReviews || productData.ratings?.count || 0,
        category: productData.category?.name || 'General',
        brand: productData.store?.name || 'Unknown',
        tags: productData.tags || [],
      };

      setProduct(transformedProduct);
    } catch (error) {
      console.error('❌ [PRODUCT PAGE] Error loading product:', error);
      setError('Failed to load product details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleAddToCart = () => {
    Alert.alert(
      'Added to Cart',
      `${product?.name} (${quantity} item${quantity > 1 ? 's' : ''}) added to your cart!`,
      [
        { text: 'Continue Shopping' },
        { text: 'View Cart', onPress: () => router.push('/CartPage' as any) },
      ]
    );
  };

  const handleBuyNow = () => {
    // Navigate directly to checkout with this product
    router.push(`/checkout?productId=${product?.id}&quantity=${quantity}` as any);
  };

  const handleWishlist = async () => {
    if (!product) return;
    
    try {
      const isInList = isInWishlist(product.id);
      
      if (isInList) {
        await removeFromWishlist(product.id);
        Alert.alert('Removed from Wishlist', `${product.name} removed from your wishlist!`);
      } else {
        await addToWishlist({
          productId: product.id,
          productName: product.name,
          productImage: product.images[0],
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.discount,
          rating: product.rating,
          reviewCount: product.reviewCount,
          brand: product.brand,
          category: product.category,
          availability: product.availability,
        });
        Alert.alert('Added to Wishlist', `${product.name} added to your wishlist!`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update wishlist. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading product...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#666" />
          <ThemedText style={styles.errorTitle}>Product Not Found</ThemedText>
          <ThemedText style={styles.errorText}>
            The product you're looking for could not be found.
          </ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <ThemedText style={styles.headerTitle}>Product Details</ThemedText>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={handleWishlist}>
            <Ionicons 
              name={product && isInWishlist(product.id) ? "heart" : "heart-outline"} 
              size={24} 
              color={product && isInWishlist(product.id) ? "#EF4444" : "#333"} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/CartPage' as any)}>
            <Ionicons name="cart-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={styles.imageSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.floor(event.nativeEvent.contentOffset.x / screenWidth);
              setSelectedImageIndex(index);
            }}
          >
            {product.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          
          {/* Image indicators */}
          <View style={styles.imageIndicators}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === selectedImageIndex && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <View style={styles.brandRow}>
            <ThemedText style={styles.brand}>{product.brand}</ThemedText>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <ThemedText style={styles.rating}>{product.rating}</ThemedText>
              <ThemedText style={styles.reviewCount}>({product.reviewCount})</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.productName}>{product.name}</ThemedText>

          <View style={styles.priceRow}>
            <ThemedText style={styles.price}>₹{product.price.toLocaleString()}</ThemedText>
            {product.originalPrice && (
              <>
                <ThemedText style={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</ThemedText>
                <View style={styles.discountBadge}>
                  <ThemedText style={styles.discountText}>{product.discount}% OFF</ThemedText>
                </View>
              </>
            )}
          </View>

          <View style={styles.availabilityRow}>
            <Ionicons
              name={product.availability === 'IN_STOCK' ? 'checkmark-circle' : 'close-circle'}
              size={18}
              color={product.availability === 'IN_STOCK' ? '#22C55E' : '#EF4444'}
            />
            <ThemedText style={[
              styles.availabilityText,
              { color: product.availability === 'IN_STOCK' ? '#22C55E' : '#EF4444' }
            ]}>
              {product.availability === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}
            </ThemedText>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'details' && styles.activeTab]}
            onPress={() => setActiveTab('details')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
              Details
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              Reviews ({reviews.length})
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'details' ? (
          <>
            {/* Description */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Description</ThemedText>
              <ThemedText style={styles.description}>{product.description}</ThemedText>
            </View>

            {/* Specifications */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Specifications</ThemedText>
              {Object.entries(product.specifications).map(([key, value]) => (
                <View key={key} style={styles.specRow}>
                  <ThemedText style={styles.specKey}>{key}</ThemedText>
                  <ThemedText style={styles.specValue}>{value}</ThemedText>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.reviewsSection}>
            <ProductReviewsSection
              productId={product.id}
              productName={product.name}
              reviews={reviews}
              summary={reviewSummary}
              isLoading={reviewsLoading}
              isRefreshing={reviewsRefreshing}
              hasMore={hasMoreReviews}
              sortBy={sortBy}
              filterRating={filterRating}
              currentUserId="current-user"
              onRefresh={refreshReviews}
              onLoadMore={loadMoreReviews}
              onSortChange={setSortBy as any}
              onFilterChange={setFilterRating as any}
              onSubmitReview={submitReview}
              onUpdateReview={updateReview}
              onDeleteReview={deleteReview}
              onMarkHelpful={markHelpful}
            />
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Ionicons name="remove" size={20} color="#333" />
          </TouchableOpacity>
          <ThemedText style={styles.quantityText}>{quantity}</ThemedText>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Ionicons name="add" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={20} color="#8B5CF6" />
            <ThemedText style={styles.addToCartText}>Add to Cart</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buyNowButton}
            onPress={handleBuyNow}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.buyNowText}>Buy Now</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  imageSection: {
    backgroundColor: 'white',
  },
  productImage: {
    width: screenWidth,
    height: 300,
    backgroundColor: '#F3F4F6',
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#8B5CF6',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brand: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    lineHeight: 26,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 16,
    color: '#666',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  specKey: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  specValue: {
    fontSize: 14,
    color: '#666',
  },
  
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  
  // Reviews Section
  reviewsSection: {
    backgroundColor: 'white',
    minHeight: 400,
  },
  reviewSystem: {
    backgroundColor: 'transparent',
  },
  
  bottomSpace: {
    height: 100,
  },
  actionBar: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    flex: 1,
    marginLeft: 16,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
  },
  addToCartText: {
    color: '#8B5CF6',
    fontWeight: '600',
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});