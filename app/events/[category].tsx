/**
 * Events Category Page - Dynamic route for event categories
 * Connected to /api/events/category/:category
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import eventsApiService from '@/services/eventsApi';
import { EventItem } from '@/types/homepage.types';
import { EVENT_COLORS } from '@/constants/EventColors';
import { useRegion } from '@/contexts/RegionContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = EVENT_COLORS;

// Category configurations
const CATEGORY_CONFIG: Record<string, { title: string; icon: string; gradientColors: readonly [string, string] }> = {
  movies: { title: 'Movies', icon: '🎬', gradientColors: EVENT_COLORS.categoryGradients.movies },
  concerts: { title: 'Concerts', icon: '🎵', gradientColors: EVENT_COLORS.categoryGradients.concerts },
  parks: { title: 'Theme Parks', icon: '🎢', gradientColors: EVENT_COLORS.categoryGradients.parks },
  workshops: { title: 'Workshops', icon: '🎨', gradientColors: EVENT_COLORS.categoryGradients.workshops },
  gaming: { title: 'Gaming', icon: '🎮', gradientColors: EVENT_COLORS.categoryGradients.gaming },
  sports: { title: 'Sports Events', icon: '⚽', gradientColors: EVENT_COLORS.categoryGradients.sports },
  entertainment: { title: 'Entertainment', icon: '🎭', gradientColors: EVENT_COLORS.categoryGradients.entertainment },
  arts: { title: 'Arts & Culture', icon: '🎨', gradientColors: EVENT_COLORS.categoryGradients.arts },
  music: { title: 'Music', icon: '🎵', gradientColors: EVENT_COLORS.categoryGradients.music },
};

type DateFilter = 'all' | 'today' | 'thisWeek' | 'thisMonth';

interface DisplayEvent {
  id: string;
  title: string;
  venue: string;
  time: string;
  price: string;
  rating: number;
  reviewCount: number;
  image: string;
  cashback?: string;
  date: string;
}

// Helper function to get date range based on filter
const getDateRange = (filter: DateFilter): { startDate?: string; endDate?: string } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case 'today':
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return {
        startDate: today.toISOString(),
        endDate: tomorrow.toISOString(),
      };
    case 'thisWeek':
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
      return {
        startDate: today.toISOString(),
        endDate: endOfWeek.toISOString(),
      };
    case 'thisMonth':
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        startDate: today.toISOString(),
        endDate: endOfMonth.toISOString(),
      };
    default:
      return {};
  }
};

const EventsCategoryPage: React.FC = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();
  const [selectedFilter, setSelectedFilter] = useState<DateFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<DisplayEvent[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);

  const categoryKey = category?.toLowerCase() || 'movies';
  const config = CATEGORY_CONFIG[categoryKey] || CATEGORY_CONFIG.movies;
  const filters: { id: DateFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'thisWeek', label: 'This Week' },
    { id: 'thisMonth', label: 'This Month' },
  ];

  const transformEventToDisplay = (event: EventItem): DisplayEvent => {
    // Get cashback from backend (merchant-configured)
    const cashbackValue = (event as any).cashback;
    const cashbackText = cashbackValue && cashbackValue > 0 ? `${cashbackValue}%` : undefined;

    // Get location name
    const locationName = typeof event.location === 'string'
      ? event.location
      : (event.location as any)?.name || 'Venue';

    // For online events, use regional currency; for venue events, use event's currency
    const isOnline = (event as any).isOnline || (event.location as any)?.isOnline;
    const displayCurrency = isOnline ? currencySymbol : (event.price?.currency || currencySymbol);

    return {
      id: event.id,
      title: event.title,
      venue: locationName,
      time: event.time || 'TBD',
      date: event.date ? new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'TBD',
      price: event.price?.isFree ? 'Free' : `${displayCurrency}${event.price?.amount || 0}`,
      rating: (event as any).rating || 0,
      reviewCount: (event as any).reviewCount || 0,
      image: event.image || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
      cashback: cashbackText,
    };
  };

  const fetchEvents = useCallback(async (filter: DateFilter = 'all') => {
    try {
      setError(null);
      const dateRange = getDateRange(filter);

      // Build filters object
      const apiFilters: any = {};
      if (dateRange.startDate) {
        apiFilters.startDate = dateRange.startDate;
      }
      if (dateRange.endDate) {
        apiFilters.endDate = dateRange.endDate;
      }

      const result = await eventsApiService.getEventsByCategory(categoryKey, 20, 0);

      if (result && result.events && result.events.length > 0) {
        let filteredEvents = result.events;

        // Apply date filter client-side if needed
        if (filter !== 'all') {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

          filteredEvents = result.events.filter((event: EventItem) => {
            if (!event.date) return false;
            const eventDate = new Date(event.date);

            switch (filter) {
              case 'today':
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                return eventDate >= today && eventDate < tomorrow;
              case 'thisWeek':
                const endOfWeek = new Date(today);
                endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
                return eventDate >= today && eventDate <= endOfWeek;
              case 'thisMonth':
                const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                return eventDate >= today && eventDate <= endOfMonth;
              default:
                return true;
            }
          });
        }

        setEvents(filteredEvents.map(transformEventToDisplay));
        setTotalEvents(filteredEvents.length);
      } else {
        setEvents([]);
        setTotalEvents(0);
      }
    } catch (err: any) {
      console.error('Error fetching category events:', err);
      setError(err.message || 'Failed to load events. Please try again.');
      setEvents([]);
      setTotalEvents(0);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [categoryKey]);

  useEffect(() => {
    setIsLoading(true);
    fetchEvents(selectedFilter);
  }, [categoryKey]); // Only refetch when category changes

  const handleFilterChange = useCallback((filter: DateFilter) => {
    setSelectedFilter(filter);
    setIsLoading(true);
    fetchEvents(filter);
  }, [fetchEvents]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchEvents(selectedFilter);
  }, [fetchEvents, selectedFilter]);

  const handleEventPress = (eventId: string) => {
    router.push(`/EventPage?id=${eventId}` as any);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading {config.title}...</Text>
      </View>
    );
  }

  // Error state
  if (error && events.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={config.gradientColors as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.background} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>{config.icon} {config.title}</Text>
              <Text style={styles.headerSubtitle}>Events</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
          </View>
          <Text style={styles.errorTitle}>Unable to Load Events</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setIsLoading(true);
              fetchEvents(selectedFilter);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={20} color={COLORS.background} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LinearGradient
        colors={config.gradientColors as unknown as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.background} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{config.icon} {config.title}</Text>
            <Text style={styles.headerSubtitle}>{totalEvents} events available</Text>
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={() => router.push('/search' as any)}>
            <Ionicons name="search" size={24} color={COLORS.background} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => handleFilterChange(filter.id)}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive
              ]}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter === filter.id && styles.filterChipTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Events List */}
        <View style={styles.eventsList}>
          {events.length > 0 ? (
            events.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => handleEventPress(event.id)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: event.image }} style={styles.eventImage} />
                {event.cashback && (
                  <View style={styles.cashbackBadge}>
                    <Text style={styles.cashbackText}>{event.cashback} Cashback</Text>
                  </View>
                )}
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.metaText}>{event.venue}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.metaText}>{event.date} • {event.time}</Text>
                    </View>
                  </View>
                  <View style={styles.eventFooter}>
                    {event.rating > 0 ? (
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color={COLORS.star} />
                        <Text style={styles.ratingText}>{event.rating.toFixed(1)}</Text>
                        {event.reviewCount > 0 && (
                          <Text style={styles.reviewCount}>({event.reviewCount})</Text>
                        )}
                      </View>
                    ) : (
                      <View style={styles.ratingContainer}>
                        <Text style={styles.noRatingText}>No reviews yet</Text>
                      </View>
                    )}
                    <Text style={styles.priceText}>{event.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>{config.icon}</Text>
              <Text style={styles.emptyTitle}>No events found</Text>
              <Text style={styles.emptySubtitle}>
                {selectedFilter !== 'all'
                  ? `No ${config.title.toLowerCase()} scheduled for ${filters.find(f => f.id === selectedFilter)?.label.toLowerCase()}`
                  : `Check back later for upcoming ${config.title.toLowerCase()}`}
              </Text>
              {selectedFilter !== 'all' && (
                <TouchableOpacity
                  style={styles.clearFilterButton}
                  onPress={() => handleFilterChange('all')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.clearFilterText}>Show all events</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.background,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  searchButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  filtersContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.text,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  filterChipTextActive: {
    color: COLORS.background,
    fontWeight: '600',
  },
  eventsList: {
    padding: 16,
    gap: 16,
  },
  eventCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  eventImage: {
    width: '100%',
    height: 160,
  },
  cashbackBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.cashback,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.background,
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  eventMeta: {
    gap: 6,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  noRatingText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  clearFilterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  clearFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.background,
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.errorLight || '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.background,
  },
});

export default EventsCategoryPage;
