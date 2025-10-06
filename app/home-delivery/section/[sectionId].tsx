import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ProductGrid } from '@/components/home-delivery/ProductGrid';
import { FilterChips } from '@/components/home-delivery/FilterChips';
import { HomeDeliveryProduct, HomeDeliveryFilters } from '@/types/home-delivery.types';
import productsApi from '@/services/productsApi';

// Section metadata
const SECTION_CONFIG = {
  'featured': {
    title: 'Featured Products',
    subtitle: 'Handpicked for you',
    filterKey: 'isFeatured',
  },
  'new-arrivals': {
    title: 'New Arrivals',
    subtitle: 'Latest additions',
    filterKey: 'isNew',
  },
};

export default function SectionDetailPage() {
  const router = useRouter();
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();

  const [products, setProducts] = useState<HomeDeliveryProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<HomeDeliveryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HomeDeliveryFilters>({
    shipping: [],
    ratings: [],
    deliveryTime: [],
    priceRange: { min: 0, max: Infinity },
    brands: [],
    availability: [],
  });
  const [sortBy, setSortBy] = useState<'popularity' | 'price_low' | 'price_high' | 'rating' | 'newest'>('popularity');

  const sectionConfig = sectionId ? SECTION_CONFIG[sectionId as keyof typeof SECTION_CONFIG] : null;

  useEffect(() => {
    loadSectionProducts();
  }, [sectionId]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, filters, sortBy]);

  const loadSectionProducts = async () => {
    if (!sectionId || !sectionConfig) {
      setError('Invalid section');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all products
      const response = await productsApi.getProducts({ page: 1, limit: 100 });

      if (response.success && response.data) {
        const rawProducts = Array.isArray(response.data) ? response.data : (response.data.products || []);

        // Map backend products to HomeDeliveryProduct format
        const mappedProducts = rawProducts.map((product: any) => {
          const stock = product.inventory?.stock || 0;
          let availabilityStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'out_of_stock';
          if (product.availabilityStatus) {
            availabilityStatus = product.availabilityStatus.replace(/-/g, '_') as 'in_stock' | 'low_stock' | 'out_of_stock';
          } else if (stock > 10) {
            availabilityStatus = 'in_stock';
          } else if (stock > 0) {
            availabilityStatus = 'low_stock';
          }

          // Determine delivery time
          const categoryName = product.category?.name?.toLowerCase() || '';
          let deliveryTime = product.store?.deliveryInfo?.estimatedTime;
          if (!deliveryTime) {
            if (categoryName.includes('fashion') || categoryName.includes('book')) {
              deliveryTime = '1-2 days';
            } else if (categoryName.includes('electronics') && stock > 50) {
              deliveryTime = 'Under 30min';
            } else if (stock > 20) {
              deliveryTime = '2-3 days';
            } else {
              deliveryTime = '3-5 days';
            }
          }

          return {
            id: product._id || product.id,
            name: product.name || product.title,
            brand: product.brand,
            image: (Array.isArray(product.images) && product.images[0]) || product.image || '',
            price: {
              current: product.price?.current || 0,
              original: product.price?.original,
              currency: product.price?.currency || '₹',
              discount: product.price?.discount || 0,
            },
            cashback: {
              percentage: product.cashback?.percentage || 5,
              maxAmount: product.cashback?.maxAmount,
            },
            category: product.category?.name || 'Uncategorized',
            categoryId: product.category?._id || 'all',
            shipping: {
              type: (product.price?.current || 0) > 500 ? 'free' : 'paid',
              cost: (product.price?.current || 0) > 500 ? 0 : 40,
              estimatedDays: deliveryTime,
              freeShippingEligible: (product.price?.current || 0) > 500,
            },
            rating: product.rating ? {
              value: product.rating.value || 0,
              count: product.rating.count || 0,
            } : undefined,
            deliveryTime,
            isNew: product.isNew || product.isNewArrival || false,
            isFeatured: product.isFeatured || product.isRecommended || false,
            isUnderDollarShipping: false,
            availabilityStatus,
            tags: product.tags || [],
            description: product.description || '',
            store: {
              id: product.store?._id || '',
              name: product.store?.name || '',
              logo: product.store?.logo,
            },
          } as HomeDeliveryProduct;
        });

        // Filter products based on section
        let sectionProducts = mappedProducts;
        if (sectionConfig.filterKey === 'isFeatured') {
          sectionProducts = mappedProducts.filter(p => p.isFeatured);
          console.log('🎯 [SECTION] Featured products:', {
            total: mappedProducts.length,
            featured: sectionProducts.length,
            sample: sectionProducts[0]
          });
        } else if (sectionConfig.filterKey === 'isNew') {
          sectionProducts = mappedProducts.filter(p => p.isNew);
          console.log('🎯 [SECTION] New products:', {
            total: mappedProducts.length,
            new: sectionProducts.length,
            sample: sectionProducts[0]
          });
        }

        console.log('✅ [SECTION] Loaded section products:', sectionProducts.length);
        setProducts(sectionProducts);
        setFilteredProducts(sectionProducts);
      }

      setLoading(false);
    } catch (err) {
      console.error('❌ [SECTION] Failed to load section products:', err);
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...products];

    // Apply filters
    if (filters.shipping.length > 0) {
      result = result.filter(p => filters.shipping.includes(p.shipping.type));
    }
    if (filters.ratings.length > 0) {
      result = result.filter(p => p.rating && filters.ratings.some(r => p.rating!.value >= r));
    }
    if (filters.deliveryTime.length > 0) {
      result = result.filter(p => filters.deliveryTime.includes(p.deliveryTime));
    }
    if (filters.priceRange.min > 0 || filters.priceRange.max < Infinity) {
      result = result.filter(p =>
        p.price.current >= filters.priceRange.min &&
        p.price.current <= filters.priceRange.max
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price.current - b.price.current;
        case 'price_high':
          return b.price.current - a.price.current;
        case 'rating':
          return (b.rating?.value || 0) - (a.rating?.value || 0);
        case 'newest':
          return b.isNew ? 1 : -1;
        default:
          return 0;
      }
    });

    setFilteredProducts(result);
  };

  const handleFilterChange = (newFilters: HomeDeliveryFilters) => {
    setFilters(newFilters);
  };

  const handleProductPress = (product: HomeDeliveryProduct) => {
    router.push(`/product/${product.id}` as any);
  };

  const handleBack = () => {
    router.back();
  };

  if (!sectionConfig) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Section not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Active filters for FilterChips
  const activeFilters = [
    ...filters.shipping.map(s => `shipping_${s}`),
    ...filters.ratings.map(r => `rating_${r}`),
    ...filters.deliveryTime.map(d => `delivery_${d}`),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>
            {sectionConfig.title}
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {sectionConfig.subtitle}
          </ThemedText>
        </View>

        <View style={styles.headerRight}>
          <ThemedText style={styles.countBadge}>
            {filteredProducts.length}
          </ThemedText>
        </View>
      </View>

      {/* Filter Chips */}
      <FilterChips
        filters={filters}
        onFilterChange={handleFilterChange}
        activeFilters={activeFilters}
      />

      {/* Products Grid */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProductGrid
          products={filteredProducts}
          loading={loading}
          onProductPress={handleProductPress}
          onLoadMore={() => {}}
          hasMore={false}
          numColumns={2}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#8B5CF6',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  headerRight: {
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: '#FFFFFF',
    color: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
});
