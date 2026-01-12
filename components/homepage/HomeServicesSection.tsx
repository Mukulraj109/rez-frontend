/**
 * Home Services Section - Converted from V2
 * Repair Services, Deep Clean, Painting, Carpentry, etc.
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
import homeServicesApi, { HomeServiceCategory } from '@/services/homeServicesApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 10;

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray600: '#6B7280',
  green500: '#22C55E',
  orange500: '#F97316',
  blue500: '#3B82F6',
};

const HomeServicesSection: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<HomeServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories from backend
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await homeServicesApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('[HomeServicesSection] Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleViewAll = () => {
    router.push('/home-services' as any);
  };

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  // Get category data for main cards
  const repairCategory = categories.find(c => c.id === 'repair');
  const cleaningCategory = categories.find(c => c.id === 'cleaning');
  const paintingCategory = categories.find(c => c.id === 'painting');
  const carpentryCategory = categories.find(c => c.id === 'carpentry');

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
          <Text style={styles.headerTitle}>🏠 Home Services</Text>
          <Text style={styles.headerSubtitle}>Professional help at home</Text>
        </View>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {/* Main Cards Row */}
      <View style={styles.mainRow}>
        {/* Repair Services Card */}
        <TouchableOpacity
          style={styles.repairCard}
          onPress={() => handlePress('/home-services/repair')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#F97316', '#EA580C', '#DC2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.repairGradient}
          >
            <View style={styles.repairTop}>
              <View style={styles.repairIconBox}>
                <Text style={styles.repairIcon}>{repairCategory?.icon || '🔧'}</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ VERIFIED</Text>
              </View>
            </View>
            <Text style={styles.repairTitle}>{repairCategory?.title || 'Repair Services'}</Text>
            <Text style={styles.repairSubtitle}>AC • Plumbing • Electrical</Text>
            <View style={styles.repairBadges}>
              <View style={styles.sameDayBadge}>
                <Text style={styles.badgeText}>Same Day</Text>
              </View>
              <View style={styles.discountBadge}>
                <Text style={styles.badgeText}>
                  {repairCategory?.cashback ? `${repairCategory.cashback}% OFF` : '10% OFF'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Deep Clean Card */}
        <TouchableOpacity
          style={styles.cleanCard}
          onPress={() => handlePress('/home-services/cleaning')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#3B82F6', '#2563EB', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cleanGradient}
          >
            <View style={styles.cleanIconBox}>
              <Text style={styles.cleanIcon}>{cleaningCategory?.icon || '🧹'}</Text>
            </View>
            <Text style={styles.cleanTitle}>Deep</Text>
            <Text style={styles.cleanTitle}>Clean</Text>
            <Text style={styles.cleanSubtitle}>Pest control too</Text>
            <View style={styles.bookNowBadge}>
              <Text style={styles.bookNowText}>Book Now</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Bottom Row - Quick Actions */}
      <View style={styles.bottomRow}>
        {/* Painting */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/home-services/painting')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}>
            <Text style={styles.bottomIcon}>{paintingCategory?.icon || '🎨'}</Text>
          </View>
          <Text style={styles.bottomTitle}>{paintingCategory?.title || 'Painting'}</Text>
        </TouchableOpacity>

        {/* Carpentry */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/home-services/carpentry')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
            <Text style={styles.bottomIcon}>{carpentryCategory?.icon || '🪚'}</Text>
          </View>
          <Text style={styles.bottomTitle}>{carpentryCategory?.title || 'Carpentry'}</Text>
        </TouchableOpacity>

        {/* Today */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/home-services/today')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
            <Text style={styles.bottomIcon}>⚡</Text>
          </View>
          <Text style={styles.bottomTitle}>Today</Text>
        </TouchableOpacity>

        {/* Verified */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/home-services/verified')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
            <Text style={styles.bottomIcon}>✅</Text>
          </View>
          <Text style={styles.bottomTitle}>Verified</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
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

  // Repair Card
  repairCard: {
    flex: 1.3,
    borderRadius: 20,
    overflow: 'hidden',
  },
  repairGradient: {
    padding: 16,
    minHeight: 180,
  },
  repairTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  repairIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repairIcon: {
    fontSize: 28,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  repairTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  repairSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  repairBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  sameDayBadge: {
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

  // Clean Card
  cleanCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cleanGradient: {
    padding: 14,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  cleanIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanIcon: {
    fontSize: 24,
  },
  cleanTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 20,
  },
  cleanSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  bookNowBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bookNowText: {
    fontSize: 12,
    fontWeight: '600',
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

export default HomeServicesSection;
