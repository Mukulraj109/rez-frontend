/**
 * Events & Experiences Section - Connected to /api/events
 * Magazine-style grid layout with Movies, Concerts, Workshops, Parks, Gaming
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import eventsApiService from '@/services/eventsApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 8;

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray600: '#6B7280',
  green500: '#22C55E',
};

// Event category configurations
interface EventCategoryConfig {
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  gradientColors: string[];
  discount?: string;
  badge?: string;
}

const FALLBACK_CATEGORIES: EventCategoryConfig[] = [
  {
    slug: 'movies',
    title: 'Movies',
    subtitle: 'Latest blockbusters',
    icon: '🎬',
    gradientColors: ['#9333EA', '#EC4899', '#7C3AED'],
    discount: 'Up to 20% off',
  },
  {
    slug: 'concerts',
    title: 'Concerts',
    subtitle: 'Live music',
    icon: '🎤',
    gradientColors: ['#F97316', '#DC2626'],
    badge: '2x coins',
  },
  {
    slug: 'parks',
    title: 'Parks',
    subtitle: 'Theme parks & fun',
    icon: '🎢',
    gradientColors: ['rgba(34, 197, 94, 0.3)', 'rgba(16, 185, 129, 0.2)'],
  },
  {
    slug: 'workshops',
    title: 'Workshops',
    subtitle: 'Learn & grow',
    icon: '📚',
    gradientColors: ['rgba(59, 130, 246, 0.2)', 'rgba(99, 102, 241, 0.1)'],
  },
  {
    slug: 'gaming',
    title: 'Gaming',
    subtitle: 'Gaming events',
    icon: '🎮',
    gradientColors: ['rgba(168, 85, 247, 0.3)', 'rgba(236, 72, 153, 0.2)'],
  },
];

const EventsExperiencesSection: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<EventCategoryConfig[]>(FALLBACK_CATEGORIES);
  const [featuredEvent, setFeaturedEvent] = useState<{ title: string; discount?: string } | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);

        // Fetch featured events to show dynamic content
        const featuredEvents = await eventsApiService.getFeaturedEvents(5);

        if (featuredEvents && featuredEvents.length > 0) {
          // Get a featured movie event if available
          const movieEvent = featuredEvents.find(e => e.category?.toLowerCase() === 'movies');
          if (movieEvent) {
            setFeaturedEvent({
              title: movieEvent.title,
              discount: movieEvent.price?.isFree ? 'Free Entry' : 'Up to 20% off',
            });
          }
        }
      } catch (error) {
        console.error('❌ [EventsExperiencesSection] Error fetching events:', error);
        // Keep using fallback data
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, []);

  const handleViewAll = () => {
    router.push('/events' as any);
  };

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color={COLORS.green500} />
      </View>
    );
  }

  const moviesCategory = categories[0];
  const concertsCategory = categories[1];
  const parksCategory = categories[2];
  const workshopsCategory = categories[3];
  const gamingCategory = categories[4];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🎉 Events & Experiences</Text>
          <Text style={styles.headerSubtitle}>Book tickets, save money, earn rewards</Text>
        </View>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {/* Magazine Grid */}
      <View style={styles.grid}>
        {/* Row 1 */}
        <View style={styles.row1}>
          {/* Movies - Large Card (2 rows height) */}
          <TouchableOpacity
            style={styles.moviesCard}
            onPress={() => handlePress(`/events/${moviesCategory.slug}`)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={moviesCategory.gradientColors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.moviesGradient}
            >
              <View style={styles.moviesTop}>
                <Text style={styles.moviesIcon}>{moviesCategory.icon}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{featuredEvent?.discount || moviesCategory.discount}</Text>
                </View>
              </View>
              <View style={styles.moviesBottom}>
                <Text style={styles.moviesTitle}>{moviesCategory.title}</Text>
                <Text style={styles.moviesSubtitle}>{featuredEvent?.title || moviesCategory.subtitle}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            {/* Concerts */}
            <TouchableOpacity
              style={styles.concertsCard}
              onPress={() => handlePress(`/events/${concertsCategory.slug}`)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={concertsCategory.gradientColors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.concertsGradient}
              >
                <Text style={styles.concertsIcon}>{concertsCategory.icon}</Text>
                <View>
                  <Text style={styles.concertsTitle}>{concertsCategory.title}</Text>
                  <Text style={styles.concertsSubtitle}>{concertsCategory.subtitle}</Text>
                  {concertsCategory.badge && (
                    <Text style={styles.concertsCoins}>{concertsCategory.badge}</Text>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Parks */}
            <TouchableOpacity
              style={styles.smallCard}
              onPress={() => handlePress(`/events/${parksCategory.slug}`)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={parksCategory.gradientColors as any}
                style={styles.smallCardGradient}
              >
                <Text style={styles.smallCardIcon}>{parksCategory.icon}</Text>
                <Text style={styles.smallCardTitle}>{parksCategory.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.row2}>
          {/* Workshops - Wide Card */}
          <TouchableOpacity
            style={styles.workshopsCard}
            onPress={() => handlePress(`/events/${workshopsCategory.slug}`)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={workshopsCategory.gradientColors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.workshopsGradient}
            >
              <View style={styles.workshopsIconBox}>
                <Text style={styles.workshopsIcon}>{workshopsCategory.icon}</Text>
              </View>
              <View style={styles.workshopsContent}>
                <Text style={styles.workshopsTitle}>{workshopsCategory.title}</Text>
                <Text style={styles.workshopsSubtitle}>{workshopsCategory.subtitle}</Text>
              </View>
              <Text style={styles.workshopsArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Gaming */}
          <TouchableOpacity
            style={styles.smallCard}
            onPress={() => handlePress(`/events/${gamingCategory.slug}`)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={gamingCategory.gradientColors as any}
              style={styles.smallCardGradient}
            >
              <Text style={styles.smallCardIcon}>{gamingCategory.icon}</Text>
              <Text style={styles.smallCardTitle}>{gamingCategory.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  loadingContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green500,
  },
  grid: {
    gap: CARD_GAP,
  },
  row1: {
    flexDirection: 'row',
    height: 200,
    gap: CARD_GAP,
  },
  row2: {
    flexDirection: 'row',
    height: 60,
    gap: CARD_GAP,
  },

  // Movies Card
  moviesCard: {
    flex: 1.2,
    borderRadius: 24,
    overflow: 'hidden',
  },
  moviesGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  moviesTop: {
    gap: 12,
  },
  moviesIcon: {
    fontSize: 40,
  },
  discountBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  moviesBottom: {},
  moviesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  moviesSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },

  // Right Column
  rightColumn: {
    flex: 1,
    gap: CARD_GAP,
  },

  // Concerts Card
  concertsCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  concertsGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  concertsIcon: {
    fontSize: 28,
  },
  concertsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  concertsSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  concertsCoins: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Small Cards (Parks, Gaming)
  smallCard: {
    flex: 0.5,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  smallCardGradient: {
    flex: 1,
    padding: 10,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  smallCardIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  smallCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.navy,
  },

  // Workshops Card
  workshopsCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  workshopsGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },
  workshopsIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workshopsIcon: {
    fontSize: 20,
  },
  workshopsContent: {
    flex: 1,
  },
  workshopsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
  },
  workshopsSubtitle: {
    fontSize: 11,
    color: COLORS.gray600,
  },
  workshopsArrow: {
    fontSize: 18,
    color: '#3B82F6',
  },
});

export default EventsExperiencesSection;
