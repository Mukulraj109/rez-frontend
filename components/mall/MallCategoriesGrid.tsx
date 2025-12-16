/**
 * MallCategoriesGrid Component
 *
 * 2-column grid of mall categories with max cashback display
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MallCategory } from '../../types/mall.types';
import MallCategoryCard from './cards/MallCategoryCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface MallCategoriesGridProps {
  categories: MallCategory[];
  isLoading?: boolean;
  onCategoryPress: (category: MallCategory) => void;
  onViewAllPress?: () => void;
}

const MallCategoriesGrid: React.FC<MallCategoriesGridProps> = ({
  categories,
  isLoading = false,
  onCategoryPress,
  onViewAllPress,
}) => {
  // Loading skeleton
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="apps" size={20} color="#00C06A" />
            <Text style={styles.title}>Shop by Category</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00C06A" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </View>
    );
  }

  // Empty state
  if (!categories || categories.length === 0) {
    return null;
  }

  // Create rows of 2 categories each
  const rows: MallCategory[][] = [];
  for (let i = 0; i < categories.length; i += 2) {
    rows.push(categories.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="apps" size={20} color="#00C06A" />
          <Text style={styles.title}>Shop by Category</Text>
        </View>
        {onViewAllPress && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={onViewAllPress}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#00C06A" />
          </TouchableOpacity>
        )}
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Explore {categories.length}+ categories with great cashback
      </Text>

      {/* Categories Grid */}
      <View style={styles.gridContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((category) => (
              <MallCategoryCard
                key={category.id || category._id}
                category={category}
                onPress={onCategoryPress}
                width={CARD_WIDTH}
              />
            ))}
            {/* Add placeholder if odd number of items in last row */}
            {row.length === 1 && <View style={{ width: CARD_WIDTH }} />}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00C06A',
  },
  gridContainer: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default memo(MallCategoriesGrid);
