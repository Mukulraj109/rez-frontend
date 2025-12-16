/**
 * All Categories Page
 *
 * Displays grid of all mall categories
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { mallApi } from '../../../services/mallApi';
import { MallCategory } from '../../../types/mall.types';
import MallEmptyState from '../../../components/mall/pages/MallEmptyState';
import MallLoadingSkeleton from '../../../components/mall/pages/MallLoadingSkeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface CategoryCardProps {
  category: MallCategory;
  onPress: (category: MallCategory) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => onPress(category)}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={[category.color || '#00C06A', `${category.color || '#00C06A'}DD`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.categoryGradient}
      >
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <Text style={styles.categoryName}>{category.name}</Text>
        <View style={styles.categoryStats}>
          <Text style={styles.brandCount}>{category.brandCount} brands</Text>
          <Text style={styles.maxCashback}>Up to {category.maxCashback}%</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function AllCategoriesPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [categories, setCategories] = useState<MallCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setError(null);
      const data = await mallApi.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryPress = useCallback((category: MallCategory) => {
    router.push(`/mall/category/${category.slug}` as any);
  }, [router]);

  const renderItem = useCallback(({ item }: { item: MallCategory }) => (
    <CategoryCard category={item} onPress={handleCategoryPress} />
  ), [handleCategoryPress]);

  const keyExtractor = useCallback((item: MallCategory) =>
    item.id || item._id, []);

  const ListHeader = useCallback(() => (
    <View style={styles.listHeader}>
      <Text style={styles.headerTitle}>Shop by Category</Text>
      <Text style={styles.headerSubtitle}>
        {categories.length} categories with cashback rewards
      </Text>
    </View>
  ), [categories.length]);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: 'All Categories' }} />
        <View style={styles.container}>
          <MallLoadingSkeleton count={6} type="grid" />
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: 'All Categories' }} />
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
      <Stack.Screen options={{ headerTitle: 'All Categories' }} />

      <View style={styles.container}>
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <MallEmptyState
              title="No categories available"
              message="Check back later for categories"
              icon="grid-outline"
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#00C06A"
              colors={['#00C06A']}
            />
          }
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
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
  },
  listHeader: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryCard: {
    width: CARD_WIDTH,
    height: 160,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  categoryGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoryStats: {
    alignItems: 'center',
  },
  brandCount: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  maxCashback: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
});
