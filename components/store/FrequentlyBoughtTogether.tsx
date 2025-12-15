import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ProductItem } from '@/types/homepage.types';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/useToast';
import ProductVariantModal, { VariantSelection } from '@/components/cart/ProductVariantModal';
import productsService from '@/services/productsApi';

export interface BundleProduct extends ProductItem {
  bundleDiscount?: number; // Additional discount when bundled
  purchaseCorrelation?: number; // How often bought together (0-1)
}

interface FrequentlyBoughtTogetherProps {
  currentProduct: ProductItem;
  storeId?: string; // Optional: If provided, fetch products from this store instead
  onBundleAdded?: () => void;
}

export default function FrequentlyBoughtTogether({
  currentProduct,
  storeId,
  onBundleAdded,
}: FrequentlyBoughtTogetherProps) {
  const [bundleProducts, setBundleProducts] = useState<BundleProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<ProductItem | null>(null);
  const [pendingVariant, setPendingVariant] = useState<VariantSelection | null>(null);

  const { actions: cartActions } = useCart();
  const { showSuccess, showError } = useToast();

  // Load frequently bought together products
  useEffect(() => {
    // Only load if we have a valid storeId or productId
    if (storeId || currentProduct.id) {
      loadBundleProducts();
    }
  }, [currentProduct.id, storeId]);

  // Auto-select current product by default
  useEffect(() => {
    if (currentProduct) {
      setSelectedProducts(new Set([currentProduct.id]));
    }
  }, [currentProduct.id]);

  const loadBundleProducts = async () => {
    try {
      setLoading(true);
      let response;

      // If storeId is provided, fetch products from that store
      if (storeId && storeId.length > 0) {
        try {
          // Get products by store
          const storeResponse = await productsService.getProductsByStore(storeId, {});

          if (storeResponse.success && storeResponse.data) {
            // Handle the store products response format
            const dataArray = Array.isArray(storeResponse.data) ? storeResponse.data : [storeResponse.data];
            if (dataArray.length > 0) {
              const storeData = dataArray[0];
              if (storeData && storeData.products && Array.isArray(storeData.products)) {
                const storeProducts = storeData.products
                  .filter((p: any) => p._id !== currentProduct.id && p.id !== currentProduct.id)
                  .slice(0, 4);
                response = { success: true, data: storeProducts };
              }
            }
          }

          if (!response) {
            response = { success: false, data: [] };
          }
        } catch (err) {
          console.error('[FrequentlyBoughtTogether] Error fetching products:', err);
          response = { success: false, data: [] };
        }
      } else {
        // Use the frequently bought together API for product pages
        response = await productsService.getFrequentlyBoughtTogether(currentProduct.id, 4);
      }

      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Map API response to BundleProduct format and filter invalid products
        const products: BundleProduct[] = response.data
          .filter((product: any) => {
            // Only filter out products with ₹0 or missing price - be lenient on images
            const price = product.pricing?.basePrice || product.pricing?.selling || product.price?.current || product.price || 0;
            const hasValidPrice = price && price > 0;
            return hasValidPrice;
          })
          .map((product: any) => ({
            id: product.id || product._id,
            type: 'product',
            name: product.name,
            brand: product.brand || 'Unknown Brand',
            image: product.image || product.images?.[0]?.url || product.images?.[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
            description: product.description,
            title: product.name,
            price: {
              current: product.pricing?.selling || product.pricing?.basePrice || product.price?.current || product.price || 0,
              original: product.pricing?.mrp || product.pricing?.original || product.price?.original,
              currency: 'INR',
              discount: product.pricing?.discount || product.price?.discount || 0,
            },
            category: product.category?.name || product.category || 'General',
            rating: product.ratings ? {
              value: product.ratings.average,
              count: product.ratings.count,
            } : undefined,
            availabilityStatus: (product.isActive !== false && product.inventory?.isAvailable !== false) ? 'in_stock' : 'out_of_stock',
            tags: product.tags || [],
            bundleDiscount: 10, // Fixed bundle discount instead of random
            purchaseCorrelation: 0.8, // Fixed correlation instead of random
          }));

        setBundleProducts(products);
      } else {
        // No mock data - just show empty if API returns nothing
        setBundleProducts([]);
      }
    } catch (error) {
      console.error('Error loading bundle products:', error);
      // No mock data on error - just show empty
      setBundleProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const generateMockBundleProducts = (): BundleProduct[] => {
    const mockProducts: BundleProduct[] = [
      {
        id: 'bundle-1',
        type: 'product',
        name: 'Premium Product Care Kit',
        brand: 'CareMax',
        image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
        description: 'Complete care kit for your products',
        title: 'Premium Product Care Kit',
        price: {
          current: 499,
          original: 699,
          currency: 'INR',
          discount: 29,
        },
        category: 'Accessories',
        rating: { value: 4.5, count: 234 },
        availabilityStatus: 'in_stock',
        tags: ['care', 'accessories'],
        bundleDiscount: 10,
        purchaseCorrelation: 0.85,
      },
      {
        id: 'bundle-2',
        type: 'product',
        name: 'Extended Warranty Plan',
        brand: 'SecurePlus',
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
        description: '2-year extended warranty coverage',
        title: 'Extended Warranty Plan',
        price: {
          current: 999,
          original: 1499,
          currency: 'INR',
          discount: 33,
        },
        category: 'Protection',
        rating: { value: 4.7, count: 567 },
        availabilityStatus: 'in_stock',
        tags: ['warranty', 'protection'],
        bundleDiscount: 15,
        purchaseCorrelation: 0.78,
      },
      {
        id: 'bundle-3',
        type: 'product',
        name: 'Replacement Parts Set',
        brand: 'SpareMax',
        image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400',
        description: 'Essential replacement parts kit',
        title: 'Replacement Parts Set',
        price: {
          current: 799,
          original: 1199,
          currency: 'INR',
          discount: 33,
        },
        category: 'Parts',
        rating: { value: 4.3, count: 189 },
        availabilityStatus: 'in_stock',
        tags: ['parts', 'replacement'],
        bundleDiscount: 12,
        purchaseCorrelation: 0.72,
      },
    ];

    return mockProducts;
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        // Don't allow deselecting the current product
        if (productId === currentProduct.id) return prev;
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const calculateBundlePrice = () => {
    let total = 0;
    let originalTotal = 0;

    // Add current product
    if (selectedProducts.has(currentProduct.id)) {
      total += currentProduct.price.current;
      originalTotal += currentProduct.price.original || currentProduct.price.current;
    }

    // Add bundle products
    bundleProducts.forEach((product) => {
      if (selectedProducts.has(product.id)) {
        const discountedPrice = product.price.current * (1 - (product.bundleDiscount || 0) / 100);
        total += discountedPrice;
        originalTotal += product.price.original || product.price.current;
      }
    });

    const savings = originalTotal - total;
    const savingsPercent = originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;

    return { total, originalTotal, savings, savingsPercent };
  };

  const handleAddAllToCart = async () => {
    if (selectedProducts.size === 0) {
      showError('Please select at least one product');
      return;
    }

    setAddingToCart(true);

    try {
      const productsToAdd: ProductItem[] = [];

      // Add current product if selected
      if (selectedProducts.has(currentProduct.id)) {
        productsToAdd.push(currentProduct);
      }

      // Add bundle products if selected
      bundleProducts.forEach((product) => {
        if (selectedProducts.has(product.id)) {
          productsToAdd.push(product);
        }
      });

      // Check if any product needs variant selection
      const needsVariant = productsToAdd.find(
        (p) => p.tags?.includes('has-variants') || p.tags?.includes('variant-required')
      );

      if (needsVariant) {
        // Show variant modal for first product that needs it
        setPendingProduct(needsVariant);
        setVariantModalVisible(true);
        return;
      }

      // Add all products to cart
      let successCount = 0;
      let failCount = 0;

      for (const product of productsToAdd) {
        try {
          await cartActions.addItem({
            id: product.id,
            name: product.name,
            image: product.image,
            originalPrice: product.price.original || product.price.current,
            discountedPrice: product.price.current,
            discount: product.price.discount,
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to add ${product.name}:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        showSuccess(
          `${successCount} ${successCount === 1 ? 'item' : 'items'} added to cart!`,
          3000
        );
        onBundleAdded?.();
      }

      if (failCount > 0) {
        showError(`Failed to add ${failCount} ${failCount === 1 ? 'item' : 'items'}`, 3000);
      }
    } catch (error) {
      console.error('Error adding bundle to cart:', error);
      showError('Failed to add items to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleVariantConfirm = async (variant: VariantSelection) => {
    if (!pendingProduct) return;

    setPendingVariant(variant);
    setVariantModalVisible(false);

    try {
      // Add product with variant to cart
      await cartActions.addItem({
        id: pendingProduct.id,
        name: pendingProduct.name,
        image: pendingProduct.image,
        originalPrice: variant.price || pendingProduct.price.current,
        discountedPrice: variant.price || pendingProduct.price.current,
        discount: pendingProduct.price.discount,
        variant: variant,
      });

      // Continue adding remaining products
      const productsToAdd = bundleProducts.filter(
        (p) => selectedProducts.has(p.id) && p.id !== pendingProduct.id
      );

      if (selectedProducts.has(currentProduct.id) && currentProduct.id !== pendingProduct.id) {
        productsToAdd.unshift(currentProduct);
      }

      let successCount = 1; // Already added variant product
      for (const product of productsToAdd) {
        try {
          await cartActions.addItem({
            id: product.id,
            name: product.name,
            image: product.image,
            originalPrice: product.price.original || product.price.current,
            discountedPrice: product.price.current,
            discount: product.price.discount,
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to add ${product.name}:`, error);
        }
      }

      showSuccess(`${successCount} ${successCount === 1 ? 'item' : 'items'} added to cart!`, 3000);
      onBundleAdded?.();
    } catch (error) {
      console.error('Error adding variant product:', error);
      showError('Failed to add item to cart');
    } finally {
      setPendingProduct(null);
      setPendingVariant(null);
      setAddingToCart(false);
    }
  };

  const handleVariantCancel = () => {
    setVariantModalVisible(false);
    setPendingProduct(null);
    setAddingToCart(false);
  };

  // Use different title for store pages vs product pages
  const sectionTitle = storeId ? 'Popular Products' : 'Frequently Bought Together';
  const subtitle = storeId
    ? 'Top picks from this store'
    : 'Customers who bought this item also purchased';

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{sectionTitle}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00C06A" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </View>
    );
  }

  if (bundleProducts.length === 0) {
    return null; // Don't show section if no bundle products
  }

  const { total, originalTotal, savings, savingsPercent } = calculateBundlePrice();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name={storeId ? "cube" : "gift"} size={24} color="#00C06A" />
          <Text style={styles.title}>{sectionTitle}</Text>
        </View>
        {savings > 0 && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>Save {savingsPercent}%</Text>
          </View>
        )}
      </View>

      <Text style={styles.subtitle}>
        {subtitle}
      </Text>

      {/* Products List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsContainer}
      >
        {/* Current Product */}
        <BundleProductCard
          product={currentProduct}
          isSelected={selectedProducts.has(currentProduct.id)}
          onToggle={toggleProductSelection}
          isCurrentProduct={true}
        />

        {/* Plus Icon */}
        <View style={styles.plusIconContainer}>
          <Ionicons name="add" size={24} color="#9CA3AF" />
        </View>

        {/* Bundle Products */}
        {bundleProducts.map((product, index) => (
          <React.Fragment key={product.id}>
            <BundleProductCard
              product={product}
              isSelected={selectedProducts.has(product.id)}
              onToggle={toggleProductSelection}
              bundleDiscount={product.bundleDiscount}
            />
            {index < bundleProducts.length - 1 && (
              <View style={styles.plusIconContainer}>
                <Ionicons name="add" size={24} color="#9CA3AF" />
              </View>
            )}
          </React.Fragment>
        ))}
      </ScrollView>

      {/* Price Summary */}
      <View style={styles.priceContainer}>
        <View style={styles.priceRow}>
          <Text style={styles.selectedCountText}>
            {selectedProducts.size} {selectedProducts.size === 1 ? 'item' : 'items'} selected
          </Text>
          <View style={styles.priceColumn}>
            {originalTotal > total && (
              <Text style={styles.originalPrice}>₹{originalTotal.toFixed(0)}</Text>
            )}
            <Text style={styles.totalPrice}>₹{total.toFixed(0)}</Text>
          </View>
        </View>

        {savings > 0 && (
          <View style={styles.savingsRow}>
            <Ionicons name="pricetag" size={16} color="#10B981" />
            <Text style={styles.savingsAmount}>
              You save ₹{savings.toFixed(0)} ({savingsPercent}% off)
            </Text>
          </View>
        )}
      </View>

      {/* Add All to Cart Button */}
      <TouchableOpacity
        style={[styles.addButton, selectedProducts.size === 0 && styles.addButtonDisabled]}
        onPress={handleAddAllToCart}
        disabled={selectedProducts.size === 0 || addingToCart}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={selectedProducts.size === 0 ? ['#D1D5DB', '#9CA3AF'] : ['#00C06A', '#00996B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.addButtonGradient}
        >
          {addingToCart ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.addButtonText}>Adding to Cart...</Text>
            </>
          ) : (
            <>
              <Ionicons name="cart" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add All to Cart</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Variant Modal */}
      {pendingProduct && (
        <ProductVariantModal
          visible={variantModalVisible}
          product={pendingProduct}
          onConfirm={handleVariantConfirm}
          onCancel={handleVariantCancel}
          loading={addingToCart}
        />
      )}
    </View>
  );
}

// Bundle Product Card Component
interface BundleProductCardProps {
  product: ProductItem | BundleProduct;
  isSelected: boolean;
  onToggle: (id: string) => void;
  isCurrentProduct?: boolean;
  bundleDiscount?: number;
}

function BundleProductCard({
  product,
  isSelected,
  onToggle,
  isCurrentProduct = false,
  bundleDiscount,
}: BundleProductCardProps) {
  const finalPrice = bundleDiscount
    ? product.price.current * (1 - bundleDiscount / 100)
    : product.price.current;

  return (
    <TouchableOpacity
      style={[styles.productCard, isSelected && styles.productCardSelected]}
      onPress={() => !isCurrentProduct && onToggle(product.id)}
      activeOpacity={isCurrentProduct ? 1 : 0.7}
      disabled={isCurrentProduct}
    >
      {/* Selection Checkbox */}
      <View style={styles.checkboxContainer}>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
      </View>

      {/* Product Image */}
      <View style={styles.productImageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
        {isCurrentProduct && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>This Item</Text>
          </View>
        )}
        {bundleDiscount && bundleDiscount > 0 && (
          <View style={styles.bundleDiscountBadge}>
            <Text style={styles.bundleDiscountText}>-{bundleDiscount}%</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productBrand} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating */}
        {product.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>
              {typeof product.rating.value === 'number'
                ? product.rating.value.toFixed(1)
                : product.rating.value} ({product.rating.count})
            </Text>
          </View>
        )}

        {/* Price */}
        <View style={styles.priceInfo}>
          <Text style={styles.productPrice}>₹{finalPrice.toFixed(0)}</Text>
          {bundleDiscount && bundleDiscount > 0 && (
            <Text style={styles.productOriginalPrice}>₹{product.price.current.toFixed(0)}</Text>
          )}
        </View>

        {/* Stock Status */}
        {product.availabilityStatus !== 'in_stock' && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>
              {product.availabilityStatus === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopWidth: 8,
    borderTopColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  savingsBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  productsContainer: {
    paddingVertical: 8,
    gap: 12,
  },
  plusIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  productCard: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productCardSelected: {
    borderColor: '#00C06A',
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
    shadowColor: '#00C06A',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  checkboxContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#00C06A',
    borderColor: '#00C06A',
  },
  productImageContainer: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  currentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#00C06A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  bundleDiscountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bundleDiscountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  productInfo: {
    gap: 4,
  },
  productBrand: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 18,
    minHeight: 36,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00C06A',
  },
  productOriginalPrice: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  stockBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#DC2626',
  },
  priceContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  savingsAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  addButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.6,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
