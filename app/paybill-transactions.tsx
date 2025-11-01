import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { usePayBillPage } from '@/hooks/usePayBillPage';
import {
  PayBillHeader,
  PayBillFilterTabs,
  PayBillTransactionList,
  PayBillEmptyState,
} from '@/components/paybill';
import { PAYBILL_FILTERS } from '@/types/paybill.types';

export default function PayBillTransactionsPage() {
  const router = useRouter();
  const { state, actions, handlers } = usePayBillPage();

  const handleBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push('/wallet/index' as any); // Fallback to wallet page
      }
    } catch (error) {

      router.push('/wallet/index' as any);
    }
  };

  // Calculate transaction counts for filter tabs
  const transactionCounts = {
    all: state.transactions.length,
    credit: state.transactions.filter(t => t.type === 'credit').length,
    debit: state.transactions.filter(t => t.type === 'debit').length,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <PayBillHeader
        currentBalance={state.currentBalance}
        onBack={handleBack}
        loading={state.loading}
      />

      {/* Filter Tabs */}
      <PayBillFilterTabs
        activeFilter={state.filters.type}
        onFilterChange={handlers.handleFilterChange}
        transactionCounts={transactionCounts}
      />

      {/* Transaction List */}
      <PayBillTransactionList
        transactions={state.filteredTransactions}
        loading={state.loading}
        refreshing={state.refreshing}
        hasMore={state.pagination.hasNext}
        onTransactionPress={handlers.handleTransactionPress}
        onRefresh={handlers.handleRefresh}
        onLoadMore={handlers.handleLoadMore}
      />
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});