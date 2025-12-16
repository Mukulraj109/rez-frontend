/**
 * FilterChips Component
 *
 * Filter pills for mall pages (Featured, New, Top-Rated, Luxury)
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type FilterType = 'all' | 'featured' | 'new' | 'top-rated' | 'luxury';

interface FilterOption {
  key: FilterType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'All', icon: 'grid-outline' },
  { key: 'featured', label: 'Featured', icon: 'star-outline' },
  { key: 'new', label: 'New', icon: 'sparkles-outline' },
  { key: 'top-rated', label: 'Top Rated', icon: 'trending-up-outline' },
  { key: 'luxury', label: 'Luxury', icon: 'diamond-outline' },
];

interface FilterChipsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTER_OPTIONS.map((option) => {
        const isActive = activeFilter === option.key;
        return (
          <TouchableOpacity
            key={option.key}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onFilterChange(option.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={option.icon}
              size={16}
              color={isActive ? '#FFFFFF' : '#6B7280'}
            />
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#00C06A',
    borderColor: '#00C06A',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});

export default memo(FilterChips);
