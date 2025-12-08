/**
 * EventsQuickFilters Component
 * Horizontal quick filter chips with sort button
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { EventFilters } from '@/services/eventsApi';
import { EventSortOption } from '@/hooks/useEventsPage';

interface QuickFilter {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
}

interface EventsQuickFiltersProps {
  filters: EventFilters;
  sortBy: EventSortOption;
  onOpenFilters: () => void;
  onOpenSort: () => void;
  onQuickFilterToggle: (filterId: string) => void;
  activeFiltersCount: number;
}

const EventsQuickFilters: React.FC<EventsQuickFiltersProps> = ({
  filters,
  sortBy,
  onOpenFilters,
  onOpenSort,
  onQuickFilterToggle,
  activeFiltersCount,
}) => {
  // Build quick filters based on current state
  const quickFilters: QuickFilter[] = [
    {
      id: 'free',
      label: 'Free',
      icon: 'pricetag-outline',
      isActive: filters.priceMax === 0,
    },
    {
      id: 'online',
      label: 'Online',
      icon: 'globe-outline',
      isActive: filters.isOnline === true,
    },
    {
      id: 'venue',
      label: 'Venue',
      icon: 'location-outline',
      isActive: filters.isOnline === false,
    },
    {
      id: 'today',
      label: 'Today',
      icon: 'today-outline',
      isActive: filters.date === new Date().toISOString().split('T')[0],
    },
  ];

  // Get sort label
  const getSortLabel = (sort: EventSortOption): string => {
    switch (sort) {
      case 'date_asc':
        return 'Upcoming';
      case 'date_desc':
        return 'Latest';
      case 'price_asc':
        return 'Price ↑';
      case 'price_desc':
        return 'Price ↓';
      case 'popularity':
        return 'Popular';
      default:
        return 'Sort';
    }
  };

  const handleQuickFilterPress = useCallback((filterId: string) => {
    onQuickFilterToggle(filterId);
  }, [onQuickFilterToggle]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* All Filters Button */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFiltersCount > 0 && styles.filterButtonActive,
          ]}
          onPress={onOpenFilters}
          activeOpacity={0.7}
          accessibilityLabel={`All filters, ${activeFiltersCount} active`}
        >
          <Ionicons
            name="options-outline"
            size={16}
            color={activeFiltersCount > 0 ? '#FFFFFF' : '#00C06A'}
          />
          <ThemedText
            style={[
              styles.filterButtonText,
              activeFiltersCount > 0 && styles.filterButtonTextActive,
            ]}
          >
            Filters
          </ThemedText>
          {activeFiltersCount > 0 && (
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>
                {activeFiltersCount}
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>

        {/* Quick Filter Chips */}
        {quickFilters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.chipButton,
              filter.isActive && styles.chipButtonActive,
            ]}
            onPress={() => handleQuickFilterPress(filter.id)}
            activeOpacity={0.7}
            accessibilityLabel={filter.label}
            accessibilityState={{ selected: filter.isActive }}
          >
            <Ionicons
              name={filter.icon}
              size={14}
              color={filter.isActive ? '#FFFFFF' : '#6B7280'}
            />
            <ThemedText
              style={[
                styles.chipText,
                filter.isActive && styles.chipTextActive,
              ]}
            >
              {filter.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Button */}
      <TouchableOpacity
        style={styles.sortButton}
        onPress={onOpenSort}
        activeOpacity={0.7}
        accessibilityLabel={`Sort by ${getSortLabel(sortBy)}`}
      >
        <Ionicons name="swap-vertical" size={16} color="#00C06A" />
        <ThemedText style={styles.sortButtonText}>
          {getSortLabel(sortBy)}
        </ThemedText>
        <Ionicons name="chevron-down" size={14} color="#00C06A" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#00C06A',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#00C06A',
    borderColor: '#00C06A',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00C06A',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  badge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00C06A',
  },
  chipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  chipButtonActive: {
    backgroundColor: '#00C06A',
    borderColor: '#00C06A',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 192, 106, 0.3)',
    gap: 4,
    marginLeft: 8,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00C06A',
  },
});

export default memo(EventsQuickFilters);
