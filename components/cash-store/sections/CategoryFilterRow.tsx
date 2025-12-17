/**
 * CategoryFilterRow Component
 *
 * CashKaro-style horizontal scrollable category filter with circular icons.
 * Used to filter the TopOnlineBrands section in Cash Store.
 */

import React, { memo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  CashStoreCategoryFilterKey,
  CashStoreCategoryFilter,
} from '../../../types/cash-store.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_SIZE = 72;

// Category filter configuration
const CATEGORY_FILTERS: CashStoreCategoryFilter[] = [
  {
    id: 'all',
    key: 'all',
    label: 'All',
    icon: 'grid-outline',
    backgroundColor: '#E8F5E9',
    iconColor: '#00C06A',
    isSpecialFilter: true,
  },
  {
    id: 'most-popular',
    key: 'most-popular',
    label: 'Popular',
    icon: 'star',
    backgroundColor: '#FEF3C7',
    iconColor: '#F59E0B',
    isSpecialFilter: true,
  },
  {
    id: 'high-cashback',
    key: 'high-cashback',
    label: 'High Cashback',
    icon: 'flame',
    backgroundColor: '#FEE2E2',
    iconColor: '#EF4444',
    isSpecialFilter: true,
  },
  {
    id: 'fashion',
    key: 'fashion',
    label: 'Fashion',
    icon: 'shirt-outline',
    backgroundColor: '#FCE7F3',
    iconColor: '#EC4899',
    isSpecialFilter: false,
  },
  {
    id: 'electronics',
    key: 'electronics',
    label: 'Electronics',
    icon: 'laptop-outline',
    backgroundColor: '#DBEAFE',
    iconColor: '#3B82F6',
    isSpecialFilter: false,
  },
  {
    id: 'food',
    key: 'food',
    label: 'Food',
    icon: 'fast-food-outline',
    backgroundColor: '#FFEDD5',
    iconColor: '#F97316',
    isSpecialFilter: false,
  },
  {
    id: 'travel',
    key: 'travel',
    label: 'Travel',
    icon: 'airplane-outline',
    backgroundColor: '#E0E7FF',
    iconColor: '#6366F1',
    isSpecialFilter: false,
  },
  {
    id: 'beauty',
    key: 'beauty',
    label: 'Beauty',
    icon: 'sparkles-outline',
    backgroundColor: '#F3E8FF',
    iconColor: '#A855F7',
    isSpecialFilter: false,
  },
  {
    id: 'shopping',
    key: 'shopping',
    label: 'Shopping',
    icon: 'cart-outline',
    backgroundColor: '#CCFBF1',
    iconColor: '#14B8A6',
    isSpecialFilter: false,
  },
  {
    id: 'entertainment',
    key: 'entertainment',
    label: 'Entertainment',
    icon: 'game-controller-outline',
    backgroundColor: '#FEF9C3',
    iconColor: '#EAB308',
    isSpecialFilter: false,
  },
];

interface CategoryFilterRowProps {
  selectedCategory: CashStoreCategoryFilterKey;
  onCategorySelect: (category: CashStoreCategoryFilterKey) => void;
  isLoading?: boolean;
}

interface CategoryItemProps {
  filter: CashStoreCategoryFilter;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}

const CategoryItem: React.FC<CategoryItemProps> = memo(
  ({ filter, isSelected, onPress, index }) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      // Staggered entry animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          delay: index * 40,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          delay: index * 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, [index]);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        friction: 8,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={[
          styles.itemContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          accessibilityRole="button"
          accessibilityLabel={`Filter by ${filter.label}`}
          accessibilityState={{ selected: isSelected }}
          accessibilityHint={
            isSelected
              ? 'Currently selected category'
              : `Double tap to filter by ${filter.label}`
          }
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: filter.backgroundColor },
              isSelected && styles.iconCircleSelected,
            ]}
          >
            <Ionicons
              name={filter.icon as any}
              size={24}
              color={isSelected ? '#00C06A' : filter.iconColor}
            />
          </View>
          <Text
            style={[styles.label, isSelected && styles.labelSelected]}
            numberOfLines={1}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

const SkeletonItem: React.FC<{ index: number }> = memo(({ index }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [index]);

  return (
    <View style={styles.itemContainer}>
      <Animated.View
        style={[
          styles.iconCircle,
          styles.skeletonCircle,
          {
            opacity: shimmerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 0.8],
            }),
          },
        ]}
      />
      <View style={styles.skeletonLabel} />
    </View>
  );
});

const CategoryFilterRow: React.FC<CategoryFilterRowProps> = ({
  selectedCategory,
  onCategorySelect,
  isLoading = false,
}) => {
  const headerFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerFadeAnim }]}>
        <Text style={styles.title}>Top categories</Text>
      </Animated.View>

      {/* Category ScrollView */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <SkeletonItem key={`skeleton-${index}`} index={index} />
            ))
          : CATEGORY_FILTERS.map((filter, index) => (
              <CategoryItem
                key={filter.id}
                filter={filter}
                isSelected={selectedCategory === filter.key}
                onPress={() => onCategorySelect(filter.key)}
                index={index}
              />
            ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    borderRadius: 24,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 4,
  },
  itemContainer: {
    width: ITEM_SIZE,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconCircleSelected: {
    borderColor: '#00C06A',
    borderWidth: 2.5,
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    width: '100%',
  },
  labelSelected: {
    color: '#00C06A',
    fontWeight: '700',
  },
  // Skeleton styles
  skeletonCircle: {
    backgroundColor: '#E5E7EB',
  },
  skeletonLabel: {
    width: 48,
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
});

export default memo(CategoryFilterRow);
