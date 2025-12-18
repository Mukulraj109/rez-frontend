import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SearchResultsSummary as SearchResultsSummaryType } from '@/types/search.types';

interface SearchResultsSummaryProps {
  query: string;
  summary: SearchResultsSummaryType;
}

export default function SearchResultsSummary({ query, summary }: SearchResultsSummaryProps) {
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Results for '{query}'</Text>
      </View>
      <View style={styles.statsRow}>
        <Text style={styles.statText}>
          {summary.sellerCount} {summary.sellerCount === 1 ? 'seller' : 'sellers'}
        </Text>
        <Text style={styles.statText}>
          Prices start from {formatPrice(summary.minPrice)}
        </Text>
        <Text style={styles.statText}>
          Earn up to {formatPrice(summary.maxCashback)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerRow: {
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});

