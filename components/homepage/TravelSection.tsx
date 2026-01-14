/**
 * Travel Section - Converted from V2
 * Flights, Hotels, Trains, Bus, Cab, Packages
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import travelApi, { TravelServiceCategory } from '@/services/travelApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 10;

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray600: '#6B7280',
  green500: '#22C55E',
};

const TravelSection: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<TravelServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories from backend
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await travelApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('[TravelSection] Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleViewAll = () => {
    router.push('/travel' as any);
  };

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  // Get category data for main cards
  const flightsCategory = categories.find(c => c.id === 'flights');
  const hotelsCategory = categories.find(c => c.id === 'hotels');
  const trainsCategory = categories.find(c => c.id === 'trains');
  const busCategory = categories.find(c => c.id === 'bus');
  const cabCategory = categories.find(c => c.id === 'cab');
  const packagesCategory = categories.find(c => c.id === 'packages');

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingVertical: 20, alignItems: 'center' }]}>
        <ActivityIndicator size="small" color={COLORS.green500} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>✈️ Travel</Text>
          <Text style={styles.headerSubtitle}>Book trips, save big</Text>
        </View>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {/* Main Cards Row */}
      <View style={styles.mainRow}>
        {/* Book Flights Card */}
        <TouchableOpacity
          style={styles.flightsCard}
          onPress={() => handlePress('/travel/flights')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#60A5FA', '#3B82F6', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.flightsGradient}
          >
            <View style={styles.flightsTop}>
              <View style={styles.flightsIconBox}>
                <Text style={styles.flightsIcon}>{flightsCategory?.icon || '✈️'}</Text>
              </View>
              <View style={styles.bestPriceBadge}>
                <Text style={styles.bestPriceText}>BEST PRICE</Text>
              </View>
            </View>
            <Text style={styles.flightsTitle}>Book Flights</Text>
            <Text style={styles.flightsSubtitle}>Domestic & International</Text>
            <View style={styles.flightsBadges}>
              <View style={styles.instantBadge}>
                <Text style={styles.badgeText}>Instant Booking</Text>
              </View>
              <View style={styles.discountBadge}>
                <Text style={styles.badgeText}>
                  {flightsCategory?.cashback ? `${flightsCategory.cashback}% OFF` : '5% OFF'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Hotels Card */}
        <TouchableOpacity
          style={styles.hotelsCard}
          onPress={() => handlePress('/travel/hotels')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#F97316', '#EA580C', '#DC2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hotelsGradient}
          >
            <View style={styles.hotelsIconBox}>
              <Text style={styles.hotelsIcon}>{hotelsCategory?.icon || '🏨'}</Text>
            </View>
            <Text style={styles.hotelsTitle}>Hotels</Text>
            <Text style={styles.hotelsSubtitle}>Luxury to Budget</Text>
            <View style={styles.hotelDiscountBadge}>
              <Text style={styles.hotelDiscountText}>
                {hotelsCategory?.cashback ? `${hotelsCategory.cashback}% OFF` : '50% OFF'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Bottom Row - Quick Actions */}
      <View style={styles.bottomRow}>
        {/* Trains */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/travel/trains')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Text style={styles.bottomIcon}>{trainsCategory?.icon || '🚂'}</Text>
          </View>
          <Text style={styles.bottomTitle}>{trainsCategory?.title || 'Trains'}</Text>
        </TouchableOpacity>

        {/* Bus */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/travel/bus')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <Text style={styles.bottomIcon}>{busCategory?.icon || '🚌'}</Text>
          </View>
          <Text style={styles.bottomTitle}>{busCategory?.title || 'Bus'}</Text>
        </TouchableOpacity>

        {/* Cab */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/travel/cab')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
            <Text style={styles.bottomIcon}>{cabCategory?.icon || '🚕'}</Text>
          </View>
          <Text style={styles.bottomTitle}>{cabCategory?.title || 'Cab'}</Text>
        </TouchableOpacity>

        {/* Packages */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/travel/packages')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}>
            <Text style={styles.bottomIcon}>{packagesCategory?.icon || '🎒'}</Text>
          </View>
          <Text style={styles.bottomTitle}>{packagesCategory?.title || 'Packages'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
    // Web-specific: Prevent inspector overlay
    ...(Platform.OS === 'web' && {
      // @ts-ignore - Web-only CSS
      position: 'relative',
      isolation: 'isolate',
    }),
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

  // Main Row
  mainRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },

  // Flights Card
  flightsCard: {
    flex: 1.3,
    borderRadius: 20,
    overflow: 'hidden',
  },
  flightsGradient: {
    padding: 16,
    minHeight: 180,
  },
  flightsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  flightsIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flightsIcon: {
    fontSize: 28,
  },
  bestPriceBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bestPriceText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  flightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  flightsSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  flightsBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  instantBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Hotels Card
  hotelsCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  hotelsGradient: {
    padding: 14,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  hotelsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotelsIcon: {
    fontSize: 24,
  },
  hotelsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 8,
  },
  hotelsSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  hotelDiscountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hotelDiscountText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Bottom Row
  bottomRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  bottomCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    alignItems: 'center',
  },
  bottomIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bottomIcon: {
    fontSize: 20,
  },
  bottomTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.navy,
  },
});

export default TravelSection;
