import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { GoingOutProductCard } from './GoingOutProductCard';
import { ProductGridProps } from '@/types/going-out.types';

const { width: screenWidth } = Dimensions.get('window');
const PADDING = 16;
const GAP = 12;

export function ProductGrid({
  products,
  loading,
  onProductPress,
  onLoadMore,
  hasMore = false,
  numColumns = 2,
}: ProductGridProps) {
  const cardWidth = (screenWidth - (PADDING * 2) - (GAP * (numColumns - 1))) / numColumns;

  const renderProduct = ({ item, index }: { item: any; index: number }) => (
    <View
      style={[
        styles.productContainer,
        {
          width: cardWidth,
          marginRight: (index + 1) % numColumns === 0 ? 0 : GAP,
        },
      ]}
    >
      <GoingOutProductCard
        product={item}
        onPress={onProductPress}
        width={cardWidth}
      />
    </View>
  );

  const renderLoadingFooter = () => {
    if (!loading || !hasMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#8B5CF6" />
        <ThemedText style={styles.loadingText}>Loading more products...</ThemedText>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyTitle}>No products found</ThemedText>
      <ThemedText style={styles.emptyDescription}>
        Try adjusting your search or category filters
      </ThemedText>
    </View>
  );

  const handleEndReached = () => {
    if (hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  };

  const getItemLayout = (_: any, index: number) => ({
    length: 280, // Approximate card height
    offset: 280 * Math.floor(index / numColumns),
    index,
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderLoadingFooter}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={6}
        initialNumToRender={6}
        windowSize={10}
        scrollEventThrottle={16}
        bounces={true}
        bouncesZoom={false}
      />

      {/* Initial Loading State */}
      {loading && products.length === 0 && (
        <View style={styles.initialLoadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <ThemedText style={styles.initialLoadingText}>
            Loading products...
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  productContainer: {
    marginBottom: GAP,
  },
  loadingFooter: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  initialLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  initialLoadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
});