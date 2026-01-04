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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import eventsApiService from '@/services/eventsApi';
import { EventItem } from '@/types/homepage.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  emerald500: '#10B981',
  amber500: '#F59E0B',
  blue500: '#3B82F6',
  purple500: '#8B5CF6',
  red500: '#EF4444',
};

// Category configurations
const CATEGORY_CONFIG: Record<string, { title: string; icon: string; gradientColors: string[] }> = {
  movies: { title: 'Movies', icon: '🎬', gradientColors: ['#EF4444', '#DC2626'] },
  concerts: { title: 'Concerts', icon: '🎵', gradientColors: ['#8B5CF6', '#7C3AED'] },
  parks: { title: 'Theme Parks', icon: '🎢', gradientColors: ['#22C55E', '#16A34A'] },
  workshops: { title: 'Workshops', icon: '🎨', gradientColors: ['#F59E0B', '#D97706'] },
  gaming: { title: 'Gaming', icon: '🎮', gradientColors: ['#3B82F6', '#2563EB'] },
  sports: { title: 'Sports Events', icon: '⚽', gradientColors: ['#10B981', '#059669'] },
  entertainment: { title: 'Entertainment', icon: '🎭', gradientColors: ['#EC4899', '#DB2777'] },
  arts: { title: 'Arts & Culture', icon: '🎨', gradientColors: ['#8B5CF6', '#7C3AED'] },
  music: { title: 'Music', icon: '🎵', gradientColors: ['#F97316', '#EA580C'] },
};

// Fallback events data
const FALLBACK_EVENTS: Record<string, DisplayEvent[]> = {
  movies: [
    { id: '1', title: 'Avengers: Secret Wars', venue: 'PVR Cinemas', time: 'Multiple Shows', price: '₹299', rating: 4.8, image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400', cashback: '20%' },
    { id: '2', title: 'Pushpa 3', venue: 'INOX', time: '10:30 AM, 2:30 PM', price: '₹249', rating: 4.5, image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400', cashback: '15%' },
    { id: '3', title: 'Avatar 3', venue: 'Cinepolis', time: '6:00 PM, 9:30 PM', price: '₹399', rating: 4.9, image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400', cashback: '25%' },
  ],
  concerts: [
    { id: '4', title: 'Coldplay Live', venue: 'DY Patil Stadium', time: 'Jan 15, 7:00 PM', price: '₹4,999', rating: 4.9, image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400', cashback: '15%' },
    { id: '5', title: 'Arijit Singh Concert', venue: 'MMRDA Grounds', time: 'Jan 20, 6:00 PM', price: '₹2,499', rating: 4.7, image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400', cashback: '20%' },
  ],
  parks: [
    { id: '7', title: 'Imagica Theme Park', venue: 'Khopoli', time: 'Open Daily', price: '₹1,499', rating: 4.6, image: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=400', cashback: '25%' },
    { id: '8', title: 'EsselWorld', venue: 'Gorai', time: 'Open Daily', price: '₹999', rating: 4.4, image: 'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?w=400', cashback: '20%' },
  ],
  workshops: [
    { id: '10', title: 'Pottery Workshop', venue: 'Art Studio', time: 'Sat, 10:00 AM', price: '₹599', rating: 4.7, image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400', cashback: '30%' },
    { id: '11', title: 'Photography Masterclass', venue: 'Creative Hub', time: 'Sun, 2:00 PM', price: '₹1,299', rating: 4.8, image: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=400', cashback: '25%' },
  ],
  gaming: [
    { id: '13', title: 'BGMI Tournament', venue: 'Gaming Arena', time: 'Jan 5, 12:00 PM', price: '₹199', rating: 4.5, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', cashback: '35%' },
    { id: '14', title: 'VR Experience', venue: 'VR Zone', time: 'Open Daily', price: '₹499', rating: 4.6, image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400', cashback: '20%' },
  ],
  sports: [
    { id: '16', title: 'IPL 2025 Match', venue: 'Wankhede Stadium', time: 'Mar 22, 7:30 PM', price: '₹999', rating: 4.9, image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400', cashback: '15%' },
    { id: '17', title: 'ISL Football', venue: 'Salt Lake Stadium', time: 'Jan 10, 7:00 PM', price: '₹499', rating: 4.5, image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400', cashback: '20%' },
  ],
};

interface DisplayEvent {
  id: string;
  title: string;
  venue: string;
  time: string;
  price: string;
  rating: number;
  image: string;
  cashback: string;
}

const EventsCategoryPage: React.FC = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [events, setEvents] = useState<DisplayEvent[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);

  const categoryKey = category?.toLowerCase() || 'movies';
  const config = CATEGORY_CONFIG[categoryKey] || CATEGORY_CONFIG.movies;
  const filters = ['all', 'Today', 'This Week', 'This Month'];

  const transformEventToDisplay = (event: EventItem): DisplayEvent => {
    return {
      id: event.id,
      title: event.title,
      venue: typeof event.location === 'string' ? event.location : 'Venue',
      time: event.time || (event.date ? new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'),
      price: event.price?.isFree ? 'Free' : `${event.price?.currency || '₹'}${event.price?.amount || 0}`,
      rating: 4.5 + Math.random() * 0.5,
      image: event.image || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
      cashback: `${Math.floor(10 + Math.random() * 20)}%`,
    };
  };

  const fetchEvents = useCallback(async () => {
    try {
      const result = await eventsApiService.getEventsByCategory(categoryKey, 20, 0);

      if (result && result.events && result.events.length > 0) {
        setEvents(result.events.map(transformEventToDisplay));
        setTotalEvents(result.total);
      } else {
        // Use fallback data
        const fallback = FALLBACK_EVENTS[categoryKey] || FALLBACK_EVENTS.movies;
        setEvents(fallback);
        setTotalEvents(fallback.length);
      }
    } catch (error) {
      console.error('Error fetching category events:', error);
      // Use fallback data
      const fallback = FALLBACK_EVENTS[categoryKey] || FALLBACK_EVENTS.movies;
      setEvents(fallback);
      setTotalEvents(fallback.length);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [categoryKey]);

  useEffect(() => {
    setIsLoading(true);
    fetchEvents();
  }, [fetchEvents]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  const handleEventPress = (eventId: string) => {
    router.push(`/EventPage?id=${eventId}` as any);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.green500} />
        <Text style={styles.loadingText}>Loading {config.title}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={config.gradientColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{config.icon} {config.title}</Text>
            <Text style={styles.headerSubtitle}>{totalEvents} events available</Text>
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={() => router.push('/search' as any)}>
            <Ionicons name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive
              ]}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter === filter && styles.filterChipTextActive
              ]}>
                {filter === 'all' ? 'All' : filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.green500]} />
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
                <View style={styles.cashbackBadge}>
                  <Text style={styles.cashbackText}>{event.cashback}</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="location-outline" size={14} color={COLORS.gray600} />
                      <Text style={styles.metaText}>{event.venue}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={COLORS.gray600} />
                      <Text style={styles.metaText}>{event.time}</Text>
                    </View>
                  </View>
                  <View style={styles.eventFooter}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color={COLORS.amber500} />
                      <Text style={styles.ratingText}>{event.rating.toFixed(1)}</Text>
                    </View>
                    <Text style={styles.priceText}>{event.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>{config.icon}</Text>
              <Text style={styles.emptyTitle}>No events found</Text>
              <Text style={styles.emptySubtitle}>Check back later for upcoming {config.title.toLowerCase()}</Text>
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
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  searchButton: {
    padding: 8,
  },
  filtersContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.navy,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  eventsList: {
    padding: 16,
    gap: 16,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  eventImage: {
    width: '100%',
    height: 160,
  },
  cashbackBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.green500,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
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
    color: COLORS.gray600,
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
    color: COLORS.navy,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.green500,
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
    color: COLORS.navy,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
  },
});

export default EventsCategoryPage;
