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
import categoriesApi, { Category } from '@/services/categoriesApi';
import CategorySectionCard from './cards/CategorySectionCard';

interface BestDiscountSectionProps {
  title?: string;
  limit?: number;
}

function BestDiscountSection({
  title = 'Best Discount',
  limit = 10,
}: BestDiscountSectionProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoriesApi.getBestDiscountCategories(limit);

      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      console.error('Error fetching best discount categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleViewAll = useCallback(() => {
    router.push('/categories?filter=best-discount' as any);
  }, [router]);

  const handleCategoryPress = useCallback((category: Category) => {
    router.push(`/category/${category.slug}` as any);
  }, [router]);

  const renderCategory = useCallback(({ item, index }: { item: Category; index: number }) => (
    <View style={[styles.cardWrapper, index === categories.length - 1 && styles.lastCard]}>
      <CategorySectionCard
        category={item}
        onPress={handleCategoryPress}
        width={160}
      />
    </View>
  ), [handleCategoryPress, categories.length]);

  const keyExtractor = useCallback((item: Category) => item._id, []);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: 160 + 12, // card width + margin
    offset: (160 + 12) * index,
    index,
  }), []);

  // Don't render if no categories and not loading
  if (!loading && categories.length === 0 && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={handleViewAll}
          accessibilityLabel="View all best discount categories"
          accessibilityRole="button"
        >
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
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchCategories}
            accessibilityLabel="Retry loading categories"
            accessibilityRole="button"
          >
            <ThemedText style={styles.retryText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          getItemLayout={getItemLayout}
          initialNumToRender={4}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews={Platform.OS !== 'web'}
        />
      )}
    </View>
  );
}

export default memo(BestDiscountSection);

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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
    letterSpacing: -0.3,
  },
  viewAllButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  cardWrapper: {
    marginRight: 12,
  },
  lastCard: {
    marginRight: 0,
  },
  loadingContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
