import React, { useCallback, memo } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import { SearchResult } from '@/types/search.types';
import ProductResultCard from './ProductResultCard';
import StoreResultCard from './StoreResultCard';

interface VirtualizedResultsListProps {
  results: SearchResult[];
  onResultPress: (result: SearchResult) => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  isLoadingMore?: boolean;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement;
}

const VirtualizedResultsList: React.FC<VirtualizedResultsListProps> = ({
  results,
  onResultPress,
  onEndReached,
  onEndReachedThreshold = 0.5,
  isLoadingMore = false,
  ListEmptyComponent,
  ListHeaderComponent,
}) => {
  const renderItem = useCallback(({ item }: { item: SearchResult }) => {
    if (item.category === 'Store') {
      return (
        <StoreResultCard
          store={item}
          onPress={() => onResultPress(item)}
        />  
      );
    }
    
    return (
      <ProductResultCard
        product={item}
        onPress={() => onResultPress(item)}
      />
    );
  }, [onResultPress]);

  const keyExtractor = useCallback((item: SearchResult) => item.id, []);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#FF6B2C" />
        <Text style={styles.footerText}>Loading more results...</Text>
      </View>
    );
  }, [isLoadingMore]);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 140, // Approximate height of result card
      offset: 140 * index,
      index,
    }),
    []
  );
  return (
    <FlatList
      data={results}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    />
    );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default memo(VirtualizedResultsList);

