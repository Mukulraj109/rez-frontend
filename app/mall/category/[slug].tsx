/**
 * Category Brands Page
 *
 * Displays brands within a specific category
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { mallApi } from '../../../services/mallApi';
import { MallBrand, MallCategory } from '../../../types/mall.types';
import BrandFullWidthCard from '../../../components/mall/pages/BrandFullWidthCard';
import MallEmptyState from '../../../components/mall/pages/MallEmptyState';
import MallLoadingSkeleton from '../../../components/mall/pages/MallLoadingSkeleton';

export default function CategoryBrandsPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [category, setCategory] = useState<MallCategory | null>(null);
  const [brands, setBrands] = useState<MallBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const LIMIT = 20;

  const fetchCategoryBrands = useCallback(async (
    pageNum: number = 1,
    append: boolean = false
  ) => {
    if (!slug) return;

    try {
      setError(null);
      const result = await mallApi.getBrandsByCategory(slug, pageNum, LIMIT);

      setCategory(result.category);
      setTotal(result.total);

      if (append) {
        setBrands(prev => [...prev, ...result.brands]);
      } else {
        setBrands(result.brands);
      }
    } catch (err: any) {
      console.error('Error fetching category brands:', err);
      setError(err.message || 'Failed to load category');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [slug]);

  useEffect(() => {
    setIsLoading(true);
    setPage(1);
    fetchCategoryBrands(1, false);
  }, [slug]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPage(1);
    fetchCategoryBrands(1, false);
  }, [fetchCategoryBrands]);

  const handleLoadMore = useCallback(() => {
    const totalPages = Math.ceil(total / LIMIT);
    if (isLoadingMore || page >= totalPages) {
      return;
    }
    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCategoryBrands(nextPage, true);
  }, [page, total, isLoadingMore, fetchCategoryBrands]);

  const handleBrandPress = useCallback((brand: MallBrand) => {
    router.push(`/mall/brand/${brand.id || brand._id}` as any);
  }, [router]);

  const renderItem = useCallback(({ item }: { item: MallBrand }) => (
    <BrandFullWidthCard brand={item} onPress={handleBrandPress} />
  ), [handleBrandPress]);

  const keyExtractor = useCallback((item: MallBrand) =>
    item.id || item._id, []);

  const ListHeader = useCallback(() => (
    <View>
      {category && (
        <LinearGradient
          colors={[category.color || '#00C06A', `${category.color || '#00C06A'}CC`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerIcon}>{category.icon}</Text>
          <Text style={styles.headerTitle}>{category.name}</Text>
          {category.description && (
            <Text style={styles.headerDescription}>{category.description}</Text>
          )}
          <View style={styles.headerStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{brands.length}</Text>
              <Text style={styles.statLabel}>Brands</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>Up to {category.maxCashback}%</Text>
              <Text style={styles.statLabel}>Cashback</Text>
            </View>
          </View>
        </LinearGradient>
      )}
      <View style={styles.listHeader}>
        <Text style={styles.resultCount}>
          {brands.length} of {total} brands
        </Text>
      </View>
    </View>
  ), [category, brands.length, total]);

  const ListFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color="#00C06A" />
        </View>
      );
    }
    return null;
  }, [isLoadingMore]);

  const ListEmpty = useCallback(() => {
    if (isLoading) return null;

    return (
      <MallEmptyState
        title="No brands in this category"
        message="Check back later for new additions"
        icon="storefront-outline"
        actionLabel="Browse All Brands"
        onAction={() => router.push('/mall/brands' as any)}
      />
    );
  }, [isLoading, router]);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: 'Category' }} />
        <View style={styles.container}>
          <MallLoadingSkeleton count={6} type="list" />
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: 'Category' }} />
        <View style={styles.container}>
          <MallEmptyState
            title="Something went wrong"
            message={error}
            icon="alert-circle-outline"
            actionLabel="Try Again"
            onAction={handleRefresh}
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: category?.name || 'Category',
          headerTransparent: true,
          headerTintColor: '#FFFFFF',
        }}
      />

      <View style={styles.container}>
        <FlatList
          data={brands}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={ListEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#FFFFFF"
              colors={['#00C06A']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 100,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 20,
  },
  stat: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  listContent: {
    paddingBottom: 24,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
