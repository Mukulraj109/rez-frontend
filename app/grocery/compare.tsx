/**
 * Grocery Compare Page
 * Compare prices across different stores
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Platform,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GroceryHubSkeleton } from '@/components/grocery';
import { productsApi } from '@/services/productsApi';
import { storesApi } from '@/services/storesApi';

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#6B7280',
  green500: '#22C55E',
  green600: '#16A34A',
  amber500: '#F59E0B',
  blue500: '#3B82F6',
  purple500: '#8B5CF6',
};

interface CompareItem {
  id: string;
  name: string;
  image: string;
  stores: Array<{
    storeId: string;
    storeName: string;
    storeLogo: string;
    price: number;
    originalPrice?: number;
    cashback: number;
    deliveryTime: string;
    inStock: boolean;
  }>;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
}

const GroceryComparePage: React.FC = () => {
  const router = useRouter();

  // State
  const [compareItems, setCompareItems] = useState<CompareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Categories for quick filter
  const categories = [
    { key: 'all', label: 'All' },
    { key: 'fruits', label: 'Fruits' },
    { key: 'veggies', label: 'Veggies' },
    { key: 'dairy', label: 'Dairy' },
    { key: 'staples', label: 'Staples' },
  ];

  // Fetch comparison data
  const fetchCompareData = useCallback(async () => {
    try {
      setLoading(true);

      // In production, this would call a dedicated comparison API
      // For now, we'll simulate by fetching products and stores
      const [productsRes, storesRes] = await Promise.all([
        productsApi.getProducts({ limit: 10, category: selectedCategory !== 'all' ? selectedCategory : undefined }),
        storesApi.getStores({ limit: 5, category: 'grocery' }),
      ]);

      if (productsRes.success && productsRes.data?.products) {
        const stores = storesRes.data?.stores || getFallbackStores();

        // Create comparison items
        const items: CompareItem[] = productsRes.data.products.slice(0, 8).map((product: any) => {
          const productId = product.id || product._id;
          // Handle both API formats: pricing.original/selling and pricing.basePrice/salePrice
          const basePrice = product.pricing?.original || product.pricing?.basePrice || product.pricing?.selling || product.pricing?.salePrice || 100;

          // Simulate prices across stores (in production, this would come from API)
          const storeComparisons = stores.map((store: any, index: number) => {
            const priceVariation = 0.85 + Math.random() * 0.3; // 85% to 115% of base price
            const price = Math.round(basePrice * priceVariation);
            return {
              storeId: store.id || store._id,
              storeName: store.name,
              storeLogo: store.logo || store.banner || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=50',
              price,
              originalPrice: price > basePrice ? Math.round(price * 1.1) : undefined,
              cashback: (store.offers?.cashback || store.maxCashback) || Math.floor(Math.random() * 15) + 5,
              deliveryTime: store.operationalInfo?.deliveryTime
                ? store.operationalInfo?.deliveryTime || "15-30 min"
                : `${15 + index * 10}-${30 + index * 10} min`,
              inStock: Math.random() > 0.1,
            };
          });

          const prices = storeComparisons.map(s => s.price);

          // Handle images as both string array and object array
          const firstImage = product.images?.[0];
          const productImage = typeof firstImage === 'string' ? firstImage : firstImage?.url;

          return {
            id: productId,
            name: product.name,
            image: productImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200',
            stores: storeComparisons.sort((a, b) => a.price - b.price),
            lowestPrice: Math.min(...prices),
            highestPrice: Math.max(...prices),
            averagePrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
          };
        });

        setCompareItems(items);
      } else {
        setCompareItems(getFallbackCompareItems());
      }
    } catch (err) {
      console.error('Error fetching compare data:', err);
      setCompareItems(getFallbackCompareItems());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchCompareData();
  }, [fetchCompareData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCompareData();
  }, [fetchCompareData]);

  // Filter items by search
  const filteredItems = compareItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render comparison card
  const renderCompareCard = (item: CompareItem) => {
    const savings = item.highestPrice - item.lowestPrice;
    const savingsPercent = Math.round((savings / item.highestPrice) * 100);

    return (
      <View key={item.id} style={styles.compareCard}>
        {/* Product Header */}
        <View style={styles.productHeader}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <View style={styles.priceRange}>
              <Text style={styles.lowestPrice}>₹{item.lowestPrice}</Text>
              <Text style={styles.priceRangeText}> - ₹{item.highestPrice}</Text>
            </View>
            {savings > 0 && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>Save up to ₹{savings} ({savingsPercent}%)</Text>
              </View>
            )}
          </View>
        </View>

        {/* Store Comparisons */}
        <View style={styles.storesList}>
          {item.stores.map((store, index) => (
            <TouchableOpacity
              key={store.storeId}
              style={[
                styles.storeRow,
                index === 0 && styles.bestDealRow,
              ]}
              onPress={() => router.push(`/store/${store.storeId}` as any)}
            >
              {index === 0 && (
                <View style={styles.bestDealBadge}>
                  <Text style={styles.bestDealText}>Best Price</Text>
                </View>
              )}
              <Image source={{ uri: store.storeLogo }} style={styles.storeLogo} />
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{store.storeName}</Text>
                <Text style={styles.deliveryTime}>{store.deliveryTime}</Text>
              </View>
              <View style={styles.priceSection}>
                <Text style={[styles.storePrice, index === 0 && styles.bestPrice]}>
                  ₹{store.price}
                </Text>
                {store.originalPrice && (
                  <Text style={styles.originalPrice}>₹{store.originalPrice}</Text>
                )}
                <Text style={styles.cashbackText}>{store.cashback}% cashback</Text>
              </View>
              {!store.inStock && (
                <View style={styles.outOfStock}>
                  <Text style={styles.outOfStockText}>Out</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return <GroceryHubSkeleton />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Compare Prices</Text>
            <Text style={styles.headerSubtitle}>Find the best deals across stores</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products to compare..."
            placeholderTextColor={COLORS.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      {/* Category Filters */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryChip,
                selectedCategory === cat.key && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat.key && styles.categoryChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Compare Items */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={64} color={COLORS.gray400} />
            <Text style={styles.emptyTitle}>No products to compare</Text>
            <Text style={styles.emptyText}>Try searching for a product</Text>
          </View>
        ) : (
          <View style={styles.content}>
            {filteredItems.map(renderCompareCard)}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

// Fallback data
function getFallbackStores() {
  return [
    { id: 's1', name: 'BigBasket', logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=50', maxCashback: 15 },
    { id: 's2', name: 'Blinkit', logo: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=50', maxCashback: 20 },
    { id: 's3', name: 'Zepto', logo: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=50', maxCashback: 25 },
    { id: 's4', name: 'DMart', logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=50', maxCashback: 10 },
  ];
}

function getFallbackCompareItems(): CompareItem[] {
  const products = [
    { name: 'Amul Butter 500g', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200' },
    { name: 'Tata Salt 1kg', image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=200' },
    { name: 'Fortune Oil 1L', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200' },
    { name: 'Aashirvaad Atta 5kg', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200' },
  ];

  const stores = getFallbackStores();

  return products.map((product, idx) => {
    const basePrice = 100 + idx * 50;
    const storeComparisons = stores.map((store, storeIdx) => ({
      storeId: store.id,
      storeName: store.name,
      storeLogo: store.logo,
      price: basePrice + (storeIdx - 1) * 10 + Math.floor(Math.random() * 20),
      cashback: store.offers?.cashback || store.maxCashback || 0,
      deliveryTime: `${15 + storeIdx * 10}-${30 + storeIdx * 10} min`,
      inStock: true,
    })).sort((a, b) => a.price - b.price);

    const prices = storeComparisons.map(s => s.price);

    return {
      id: `compare-${idx}`,
      name: product.name,
      image: product.image,
      stores: storeComparisons,
      lowestPrice: Math.min(...prices),
      highestPrice: Math.max(...prices),
      averagePrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    };
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.navy,
  },
  categoriesContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.purple500,
  },
  categoryChipText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  categoryChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  compareCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  productHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 4,
  },
  priceRange: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  lowestPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.green500,
  },
  priceRangeText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  savingsBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.green600,
  },
  storesList: {
    padding: 8,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.gray50,
    position: 'relative',
  },
  bestDealRow: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderWidth: 1,
    borderColor: COLORS.green500,
  },
  bestDealBadge: {
    position: 'absolute',
    top: -8,
    left: 12,
    backgroundColor: COLORS.green500,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestDealText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  storeLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  storeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
  },
  deliveryTime: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 2,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  storePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
  },
  bestPrice: {
    color: COLORS.green500,
  },
  originalPrice: {
    fontSize: 12,
    color: COLORS.gray400,
    textDecorationLine: 'line-through',
  },
  cashbackText: {
    fontSize: 11,
    color: COLORS.green600,
    marginTop: 2,
  },
  outOfStock: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: COLORS.gray400,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  outOfStockText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray600,
    marginTop: 4,
  },
});

export default GroceryComparePage;
