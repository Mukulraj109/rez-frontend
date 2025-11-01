import React from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';

import { PayBillTransactionListProps } from '@/types/paybill.types';
import { PayBillTransactionCard } from './PayBillTransactionCard';
import { PayBillEmptyState } from './PayBillEmptyState';

export function PayBillTransactionList({
  transactions,
  loading,
  refreshing,
  hasMore,
  onTransactionPress,
  onRefresh,
  onLoadMore,
  onEndReached,
}: PayBillTransactionListProps) {
  const renderTransaction = ({ item }: { item: any }) => (
    <PayBillTransactionCard
      transaction={item}
      onPress={onTransactionPress}
    />
  );

  const renderFooter = () => {
    if (!loading || transactions.length === 0) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#10B981" />
      </View>
    );
  };

  const renderEmpty = () => (
    <PayBillEmptyState
      filter="all"
      onClearFilters={() => {}}
    />
  );

  const handleEndReached = () => {
    if (hasMore && !loading) {
      onLoadMore();
    }
    onEndReached?.();
  };

  return (
    <FlatList
      data={transactions}
      renderItem={renderTransaction}
      keyExtractor={(item) => item._id}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#10B981"
          colors={['#10B981']}
        />
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.1}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    paddingBottom: 24,
  },
  separator: {
    height: 8,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});