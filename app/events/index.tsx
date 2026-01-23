/**
 * Events Page - Main events hub
 * Connected to /api/events
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
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import eventsApiService from '@/services/eventsApi';
import { EventItem } from '@/types/homepage.types';
import { EVENT_COLORS } from '@/constants/EventColors';
import { useRegion } from '@/contexts/RegionContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = EVENT_COLORS;

const EVENT_CATEGORIES = [
  { id: 'movies', title: 'Movies', icon: '🎬', color: '#EF4444', route: '/events/movies' },
  { id: 'concerts', title: 'Concerts', icon: '🎵', color: '#8B5CF6', route: '/events/concerts' },
  { id: 'parks', title: 'Parks', icon: '🎢', color: '#22C55E', route: '/events/parks' },
  { id: 'workshops', title: 'Workshops', icon: '🎨', color: '#F59E0B', route: '/events/workshops' },
  { id: 'gaming', title: 'Gaming', icon: '🎮', color: '#3B82F6', route: '/events/gaming' },
  { id: 'sports', title: 'Sports', icon: '⚽', color: '#10B981', route: '/events/sports' },
];

interface DisplayEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  location?: string;
  price: string;
  image: string;
  cashback?: string;
  rating?: number;
  reviewCount?: number;
}

const EventsPage: React.FC = () => {
  const router = useRouter();
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featuredEvents, setFeaturedEvents] = useState<DisplayEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<DisplayEvent[]>([]);

  const transformEventToDisplay = (event: EventItem): DisplayEvent => {
    // Get cashback from backend (merchant-configured)
    const cashbackValue = (event as any).cashback;
    const cashbackText = cashbackValue && cashbackValue > 0 ? `${cashbackValue}%` : undefined;

    // For online events, use regional currency; for venue events, use event's currency
    const isOnline = (event as any).isOnline || (event.location as any)?.isOnline;
    const displayCurrency = isOnline ? currencySymbol : (event.price?.currency || currencySymbol);

    return {
      id: event.id,
      title: event.title,
      type: event.category || 'Event',
      date: event.date ? new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'TBD',
      location: typeof event.location === 'string' ? event.location : (event.location as any)?.name || 'Venue',
      price: event.price?.isFree ? 'Free' : `${displayCurrency}${event.price?.amount || 0}`,
      image: event.image || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
      cashback: cashbackText,
      rating: (event as any).rating,
      reviewCount: (event as any).reviewCount,
    };
  };

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);

      // Fetch featured events
      const featured = await eventsApiService.getFeaturedEvents(6);
      if (featured && featured.length > 0) {
        setFeaturedEvents(featured.slice(0, 3).map(transformEventToDisplay));
      } else {
        setFeaturedEvents([]);
      }

      // Fetch upcoming events
      const upcoming = await eventsApiService.getEvents({ upcoming: true, todayAndFuture: true }, 6, 0);
      if (upcoming && upcoming.events && upcoming.events.length > 0) {
        setUpcomingEvents(upcoming.events.slice(0, 6).map(transformEventToDisplay));
      } else {
        setUpcomingEvents([]);
      }
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events. Please try again.');
      setFeaturedEvents([]);
      setUpcomingEvents([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  const handleCategoryPress = (route: string) => {
    router.push(route as any);
  };

  const handleEventPress = (eventId: string) => {
    router.push(`/EventPage?id=${eventId}` as any);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  // Error state
  if (error && featuredEvents.length === 0 && upcomingEvents.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={COLORS.primaryGradient as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.background} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Events & Experiences</Text>
              <Text style={styles.headerSubtitle}>Book tickets, earn coins</Text>
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
              fetchEvents();
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
      {/* Header with Green Gradient */}
      <LinearGradient
        colors={['#00C06A', '#00A05A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>🎉 Events & Experiences</Text>
            <Text style={styles.headerSubtitle}>Book tickets, earn coins</Text>
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={() => router.push('/search' as any)}>
            <Ionicons name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.green500]} />
        }
      >
        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <View style={styles.categoriesGrid}>
            {EVENT_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(cat.route)}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                  <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                </View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Events</Text>
            <TouchableOpacity onPress={() => router.push('/EventsListPage' as any)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {featuredEvents.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.featuredCard}
                  onPress={() => handleEventPress(event.id)}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: event.image }} style={styles.featuredImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.featuredOverlay}
                  >
                    {event.cashback && (
                      <View style={styles.cashbackBadge}>
                        <Text style={styles.cashbackText}>{event.cashback} Cashback</Text>
                      </View>
                    )}
                    <Text style={styles.featuredTitle}>{event.title}</Text>
                    <Text style={styles.featuredMeta}>{event.type} • {event.date}</Text>
                    <View style={styles.featuredFooter}>
                      {event.location && (
                        <View style={styles.locationContainer}>
                          <Ionicons name="location" size={14} color={COLORS.background} />
                          <Text style={styles.locationText}>{event.location}</Text>
                        </View>
                      )}
                      <Text style={styles.priceText}>{event.price}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptySection}>
              <Ionicons name="calendar-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No featured events at the moment</Text>
            </View>
          )}
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={() => router.push('/EventsListPage' as any)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => handleEventPress(event.id)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: event.image }} style={styles.eventImage} />
                <View style={styles.eventInfo}>
                  <View style={styles.eventTypeBadge}>
                    <Text style={styles.eventTypeText}>{event.type}</Text>
                  </View>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{event.date}</Text>
                </View>
                <View style={styles.eventPriceContainer}>
                  <Text style={styles.eventPrice}>{event.price}</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptySection}>
              <Ionicons name="ticket-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No upcoming events scheduled</Text>
            </View>
          )}
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoGradient}
          >
            <Text style={styles.promoEmoji}>🎉</Text>
            <Text style={styles.promoTitle}>Earn Coins on Every Booking</Text>
            <Text style={styles.promoSubtitle}>Up to 500 coins per ticket • Extra cashback on weekends</Text>
          </LinearGradient>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: COLORS.white,
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
  categoriesSection: {
    padding: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 56) / 3,
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.gray50,
    borderRadius: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
  },
  section: {
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green500,
  },
  featuredCard: {
    width: SCREEN_WIDTH * 0.75,
    height: 220,
    marginLeft: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  cashbackBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.green500,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  featuredMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.white,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  eventInfo: {
    flex: 1,
    marginLeft: 12,
  },
  eventTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  eventPriceContainer: {
    alignItems: 'flex-end',
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.green500,
    marginBottom: 4,
  },
  promoBanner: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  promoGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  promoEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
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
  // Empty state styles
  emptySection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default EventsPage;
