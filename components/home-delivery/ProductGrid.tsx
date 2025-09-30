import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { HomeDeliveryProductCard } from './HomeDeliveryProductCard';
import { ProductGridProps, HomeDeliveryProduct } from '@/types/home-delivery.types';

const { width } = Dimensions.get('window');

export function ProductGrid({
  products,
  loading,
  onProductPress,
  onLoadMore,
  hasMore,
  numColumns = 2,
}: ProductGridProps) {
  const cardWidth = (width - 60) / numColumns; // Account for padding and gaps

  const renderProductCard = ({ item }: { item: HomeDeliveryProduct }) => (
    <View style={[styles.cardContainer, { width: cardWidth }]}>
      <HomeDeliveryProductCard
        product={item}
        onPress={() => onProductPress(item)}
        showCashback={true}
        showDeliveryTime={true}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyTitle}>No products found</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Try adjusting your search or filters
      </ThemedText>
    </View>
  );

  const renderLoadingFooter = () => {
    if (!hasMore || !loading) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#8B5CF6" />
        <ThemedText style={styles.loadingText}>Loading more products...</ThemedText>
      </View>
    );
  };

  const renderHeader = () => {
    if (products.length === 0) return null;
    
    return (
      <View style={styles.headerContainer}>
        <ThemedText style={styles.resultCount}>
          {products.length} product{products.length !== 1 ? 's' : ''} found
        </ThemedText>
      </View>
    );
  };

  const handleEndReached = () => {
    if (hasMore && !loading) {
      onLoadMore();
    }
  };

  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <ThemedText style={styles.loadingText}>Loading products...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          products.length === 0 && styles.emptyContentContainer,
        ]}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderLoadingFooter}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardContainer: {
    marginVertical: 6,
  },
  row: {
    justifyContent: 'space-between',
    gap: 12,
  },
  separator: {
    height: 8,
  },
  headerContainer: {
    paddingVertical: 12,
    paddingBottom: 16,
  },
  resultCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});