/**
 * BrowseCategoryGrid Component
 * 4-column grid layout for category icons with names and cashback badges
 * Based on reference design from Rez_v-2-main
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { CategoryGridItem, BrowseCategoryGridProps } from '@/types/categoryTypes';

// Rez Brand Colors
const COLORS = {
  primaryGreen: '#00C06A',
  primaryGold: '#F59E0B',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  background: '#FFFFFF',
  border: '#F3F4F6',
};

interface CategoryIconProps {
  category: CategoryGridItem;
  onPress: (category: CategoryGridItem) => void;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ category, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => onPress(category)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${category.color}20` }]}>
        <Text style={styles.iconEmoji}>{category.icon}</Text>
        {category.cashback && category.cashback > 0 && (
          <View style={styles.cashbackBadge}>
            <Text style={styles.cashbackText}>{category.cashback}%</Text>
          </View>
        )}
      </View>
      <Text style={styles.categoryName} numberOfLines={2}>
        {category.name}
      </Text>
      {category.itemCount !== undefined && (
        <Text style={styles.itemCount}>{category.itemCount}+ items</Text>
      )}
    </TouchableOpacity>
  );
};

const BrowseCategoryGrid: React.FC<BrowseCategoryGridProps> = ({
  categories,
  title = 'Browse Categories',
  onCategoryPress,
}) => {
  const router = useRouter();

  const handleCategoryPress = (category: CategoryGridItem) => {
    if (onCategoryPress) {
      onCategoryPress(category);
    } else {
      // Default navigation
      router.push(`/category/${category.id}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.titleAccent} />
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      </View>

      {/* 4-column Grid */}
      <View style={styles.grid}>
        {categories.map((category) => (
          <CategoryIcon
            key={category.id}
            category={category}
            onPress={handleCategoryPress}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleAccent: {
    width: 4,
    height: 20,
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  categoryItem: {
    width: '25%', // 4 columns
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconEmoji: {
    fontSize: 28,
  },
  cashbackBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 28,
    alignItems: 'center',
  },
  cashbackText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 14,
  },
  itemCount: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default BrowseCategoryGrid;
