/**
 * MallCategoryCard Component
 *
 * Card component for displaying mall category with icon and cashback info
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MallCategory } from '../../../types/mall.types';

interface MallCategoryCardProps {
  category: MallCategory;
  onPress: (category: MallCategory) => void;
}

// Map category icons to Ionicons
const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  shirt: 'shirt-outline',
  sparkles: 'sparkles-outline',
  'phone-portrait': 'phone-portrait-outline',
  home: 'home-outline',
  heart: 'heart-outline',
  fitness: 'fitness-outline',
  diamond: 'diamond-outline',
  default: 'grid-outline',
};

const MallCategoryCard: React.FC<MallCategoryCardProps> = ({
  category,
  onPress,
}) => {
  const iconName = ICON_MAP[category.icon] || ICON_MAP.default;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(category)}
      activeOpacity={0.85}
    >
      <View style={[
        styles.card,
        { backgroundColor: category.backgroundColor || `${category.color}15` }
      ]}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${category.color}25` }]}>
          <Ionicons
            name={iconName}
            size={24}
            color={category.color}
          />
        </View>

        {/* Category Name */}
        <Text style={styles.categoryName} numberOfLines={1}>
          {category.name}
        </Text>

        {/* Cashback Info */}
        <Text style={[styles.cashbackText, { color: category.color }]}>
          Up to {category.maxCashback}% cashback
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
    minHeight: 120,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default memo(MallCategoryCard);
