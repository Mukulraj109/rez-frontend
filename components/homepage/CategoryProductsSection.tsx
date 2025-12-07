import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { productApi, HomepageProduct } from '@/services/productApi';
import CategoryProductCard from './cards/CategoryProductCard';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface CategoryProductsSectionProps {
  categorySlug: string;
  categoryName: string;
  limit?: number;
}

function CategoryProductsSection({
  categorySlug,
  categoryName,
  limit = 10,
}: CategoryProductsSectionProps) {
  const router = useRouter();
  const [products, setProducts] = useState<HomepageProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productApi.getProductsByCategory({
        categorySlug,
        limit,
      });

      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [categorySlug, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleViewAll = () => {
    router.push(`/category/${categorySlug}`);
  };

  const renderProduct = useCallback(({ item }: { item: HomepageProduct }) => (
    <CategoryProductCard product={item} />
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
        <View style={styles.titleContainer}>
          <View style={styles.titleAccent} />
          <ThemedText style={styles.title}>{categoryName}</ThemedText>
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={handleViewAll}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.viewAllText}>View all</ThemedText>
          <Ionicons name="chevron-forward" size={14} color="#00796B" style={styles.viewAllIcon} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <ActivityIndicator size="small" color="#00C06A" />
          </View>
          <ThemedText style={styles.loadingText}>Fetching deals...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="cloud-offline-outline" size={32} color="#9AA7B2" />
          </View>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProducts} activeOpacity={0.85}>
            <LinearGradient
              colors={['#00C06A', '#00796B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.retryGradient}
            >
              <Ionicons name="refresh" size={14} color="#FFFFFF" />
              <ThemedText style={styles.retryText}>Try again</ThemedText>
            </LinearGradient>
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
    marginTop: 28,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleAccent: {
    width: 4,
    height: 22,
    backgroundColor: '#00C06A',
    borderRadius: 2,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
    fontFamily: 'Poppins',
    letterSpacing: -0.3,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 121, 107, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 121, 107, 0.15)',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00796B',
    fontFamily: 'Inter',
  },
  viewAllIcon: {
    marginLeft: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 250, 252, 0.5)',
    marginHorizontal: 16,
    borderRadius: 16,
  },
  loadingSpinner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#9AA7B2',
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  errorContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginHorizontal: 16,
    backgroundColor: 'rgba(247, 250, 252, 0.5)',
    borderRadius: 16,
  },
  errorIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(154, 167, 178, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  retryButton: {
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 3px 12px rgba(0, 192, 106, 0.25)',
      },
    }),
  },
  retryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
});

export default memo(CategoryProductsSection);
