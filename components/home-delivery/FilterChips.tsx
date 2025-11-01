import React from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { FilterChipsProps } from '@/types/home-delivery.types';

interface FilterChip {
  id: string;
  label: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
}

export function FilterChips({
  filters,
  onFilterChange,
  activeFilters,
}: FilterChipsProps) {
  
  const handleFreeShippingToggle = () => {
    const newFilters = { ...filters };
    if (newFilters.shipping.includes('free')) {
      newFilters.shipping = newFilters.shipping.filter(s => s !== 'free');
    } else {
      newFilters.shipping = [...newFilters.shipping, 'free'];
    }
    onFilterChange(newFilters);
  };

  const handleRatingsToggle = () => {
    const newFilters = { ...filters };
    if (newFilters.ratings.includes(4)) {
      newFilters.ratings = newFilters.ratings.filter(r => r !== 4);
    } else {
      newFilters.ratings = [...newFilters.ratings, 4];
    }
    onFilterChange(newFilters);
  };

  const handleDeliveryTimeToggle = () => {
    const newFilters = { ...filters };
    if (newFilters.deliveryTime.includes('Under 30min')) {
      newFilters.deliveryTime = newFilters.deliveryTime.filter(d => d !== 'Under 30min');
    } else {
      newFilters.deliveryTime = [...newFilters.deliveryTime, 'Under 30min'];
    }
    onFilterChange(newFilters);
  };

  const filterChips: FilterChip[] = [
    {
      id: 'free_shipping',
      label: 'Free Shipping',
      icon: 'car-outline',
      isActive: filters.shipping.includes('free'),
      onPress: handleFreeShippingToggle,
    },
    {
      id: 'ratings',
      label: 'Ratings',
      icon: 'star-outline',
      isActive: filters.ratings.includes(4),
      onPress: handleRatingsToggle,
    },
    {
      id: 'under_30min',
      label: 'Under 30min',
      icon: 'time-outline',
      isActive: filters.deliveryTime.includes('Under 30min'),
      onPress: handleDeliveryTimeToggle,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {filterChips.map((chip) => (
          <TouchableOpacity
            key={chip.id}
            style={[
              styles.filterChip,
              chip.isActive && styles.filterChipActive,
            ]}
            onPress={chip.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.chipContent}>
              <Ionicons
                name={chip.icon as any}
                size={16}
                color={chip.isActive ? '#8B5CF6' : '#6B7280'}
                style={styles.chipIcon}
              />
              <ThemedText style={[
                styles.chipText,
                chip.isActive && styles.chipTextActive,
              ]}>
                {chip.label}
              </ThemedText>
              
              {chip.isActive && (
                <View style={styles.activeIndicator}>
                  <Ionicons
                    name="checkmark"
                    size={12}
                    color="#FFFFFF"
                  />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
        
        {/* Clear All Filters Button */}
        {activeFilters.length > 0 && (
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={() => onFilterChange({
              shipping: [],
              ratings: [],
              deliveryTime: [],
              priceRange: { min: 0, max: Infinity },
              brands: [],
              availability: [],
            })}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close-circle-outline"
              size={16}
              color="#EF4444"
              style={styles.chipIcon}
            />
            <ThemedText style={styles.clearAllText}>
              Clear All
            </ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  filterChipActive: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B5CF6',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(139, 92, 246, 0.1)',
      },
    }),
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipIcon: {
    marginRight: 2,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  chipTextActive: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  activeIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EF4444',
  },
});