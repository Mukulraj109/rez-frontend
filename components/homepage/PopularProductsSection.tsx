import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { productApi, HomepageProduct } from '@/services/productApi';
import HomepageProductCard from './cards/HomepageProductCard';

interface PopularProductsSectionProps {
  title?: string;
  limit?: number;
}

function PopularProductsSection({
  title = 'Popular',
  limit = 10,
}: PopularProductsSectionProps) {
  const router = useRouter();
  const [products, setProducts] = useState<HomepageProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productApi.getPopularProducts({ limit });

      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setError('Failed to load popular products');
      }
    } catch (err) {
      console.error('Error fetching popular products:', err);
      setError('Failed to load popular products');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchPopularProducts();
  }, [fetchPopularProducts]);

  const handleViewAll = () => {
    // Navigate to a products list page with popular filter
    router.push('/search?sortBy=popular');
  };

  const renderProduct = useCallback(({ item }: { item: HomepageProduct }) => (
    <HomepageProductCard product={item} showDistance={false} />
  ), []);

  const keyExtractor = useCallback((item: HomepageProduct) => item._id || item.id, []);

  // Don't render if no products and not loading
  if (!loading && products.length === 0 && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAll}>
          <ThemedText style={styles.viewAllText}>View all</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00C06A" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPopularProducts}>
            <ThemedText style={styles.retryText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          initialNumToRender={4}
          maxToRenderPerBatch={6}
          windowSize={5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
  },
  viewAllButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default memo(PopularProductsSection);
