/**
 * DealsThatSaveMoney Component
 * 
 * A section with tabs (Offers, Cashback, Exclusive) that displays different
 * deal categories based on the selected tab. Modern design with glassy effects.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import realOffersApi, { Offer } from '@/services/realOffersApi';

// ReZ Brand Colors
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00A159',
  white: '#FFFFFF',
  black: '#000000',
  textDark: '#0B2240',
  textMuted: '#6B7280',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
  tabActive: '#00C06A',
  tabInactive: '#E5E7EB',
  tabBg: '#F3F4F6',
  background: '#E6F9F0', // ReZ brand light green background
  backgroundLight: '#ECFDF5',
};

// Category card data structure
interface CategoryCard {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  badge?: string;
  count: number;
}

// Exclusive reward categories
const EXCLUSIVE_CATEGORIES = [
  {
    id: 'students',
    title: 'Students',
    subtitle: 'Campus Zone',
    icon: 'school-outline',
    gradientColors: ['#3B82F6', '#2563EB', '#1D4ED8'] as const,
  },
  {
    id: 'employees',
    title: 'Employees',
    subtitle: 'Corporate Zone',
    icon: 'briefcase-outline',
    gradientColors: ['#8B5CF6', '#7C3AED', '#6D28D9'] as const,
  },
  {
    id: 'women',
    title: 'Women Exclusive',
    subtitle: 'Special Rewards',
    icon: 'heart-outline',
    gradientColors: ['#EC4899', '#DB2777', '#BE185D'] as const,
  },
  {
    id: 'birthday',
    title: 'Birthday Specials',
    subtitle: 'Celebrate & Save',
    icon: 'gift-outline',
    gradientColors: ['#F97316', '#EA580C', '#DC2626'] as const,
  },
  {
    id: 'loyalty',
    title: 'Loyalty Progress',
    subtitle: 'Tier Rewards',
    icon: 'star-outline',
    gradientColors: ['#FBBF24', '#F59E0B', '#D97706'] as const,
  },
  {
    id: 'army',
    title: 'Armed Forces',
    subtitle: 'Heroes Deals',
    icon: 'shield-outline',
    gradientColors: ['#475569', '#334155', '#1E293B'] as const,
  },
  {
    id: 'medical',
    title: 'Doctor / Nurse',
    subtitle: 'Healthcare',
    icon: 'medkit-outline',
    gradientColors: ['#14B8A6', '#0D9488', '#0F766E'] as const,
  },
  {
    id: 'disabled',
    title: 'Specially Abled',
    subtitle: 'Inclusive',
    icon: 'accessibility-outline',
    gradientColors: ['#22C55E', '#16A34A', '#15803D'] as const,
  },
];

// Dummy cashback categories
const CASHBACK_CATEGORIES: CategoryCard[] = [
  {
    id: 'nearby',
    title: 'Nearby Offers',
    subtitle: '24 offers',
    icon: 'location-outline',
    iconColor: '#60A5FA',
    bgColor: '#1E3A8A',
    count: 24,
  },
  {
    id: 'today',
    title: "Today's Deals",
    subtitle: '18 offers',
    icon: 'time-outline',
    iconColor: '#F97316',
    bgColor: '#7C2D12',
    count: 18,
  },
  {
    id: 'bogo',
    title: 'BOGO',
    subtitle: '12 offers',
    icon: 'pricetag-outline',
    iconColor: '#22C55E',
    bgColor: '#14532D',
    badge: '2x',
    count: 12,
  },
  {
    id: 'flash',
    title: 'Flash Sale',
    subtitle: '8 offers',
    icon: 'flash-outline',
    iconColor: '#EF4444',
    bgColor: '#7F1D1D',
    count: 8,
  },
  {
    id: 'cashback',
    title: 'Super Cashback',
    subtitle: '15 offers',
    icon: 'cash-outline',
    iconColor: '#F59E0B',
    bgColor: '#78350F',
    count: 15,
  },
  {
    id: 'freebie',
    title: 'Freebies',
    subtitle: '6 offers',
    icon: 'gift-outline',
    iconColor: '#A855F7',
    bgColor: '#581C87',
    count: 6,
  },
];

type TabType = 'offers' | 'cashback' | 'exclusive';

interface DealsThatSaveMoneyProps {
  style?: any;
}

const DealsThatSaveMoney: React.FC<DealsThatSaveMoneyProps> = ({ style }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('offers');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [offerCategories, setOfferCategories] = useState<CategoryCard[]>([]);

  // Fetch offers from backend
  const fetchOffers = useCallback(async () => {
    if (activeTab !== 'offers') return;

    setLoading(true);
    try {
      const response = await realOffersApi.getOffers({
        page: 1,
        limit: 50,
      });

      if (response.success && response.data) {
        setOffers(response.data);

        // Group offers by category and create category cards
        const categoryMap = new Map<string, { count: number; type: string }>();

        response.data.forEach((offer: Offer) => {
          const category = offer.category || 'general';
          const existing = categoryMap.get(category) || { count: 0, type: offer.type || 'discount' };
          categoryMap.set(category, {
            count: existing.count + 1,
            type: existing.type,
          });
        });

        // Create category cards from grouped offers
        const categories: CategoryCard[] = [];

        // Nearby Offers (offers with location)
        const nearbyCount = response.data.filter((o: Offer) => o.distance && o.distance < 5).length;
        if (nearbyCount > 0) {
          categories.push({
            id: 'nearby',
            title: 'Nearby Offers',
            subtitle: `${nearbyCount} offers`,
            icon: 'location-outline',
            iconColor: '#60A5FA',
            bgColor: '#1E3A8A',
            count: nearbyCount,
          });
        }

        // Today's Deals (offers expiring today or flash sales)
        const todayCount = response.data.filter((o: Offer) => {
          if (o.metadata?.flashSale?.isActive) return true;
          const endDate = new Date(o.validity.endDate);
          const today = new Date();
          return endDate.toDateString() === today.toDateString();
        }).length;
        if (todayCount > 0) {
          categories.push({
            id: 'today',
            title: "Today's Deals",
            subtitle: `${todayCount} offers`,
            icon: 'time-outline',
            iconColor: '#F97316',
            bgColor: '#7C2D12',
            count: todayCount,
          });
        }

        // BOGO deals
        const bogoCount = response.data.filter((o: Offer) => o.type === 'combo' || o.title?.toLowerCase().includes('bogo')).length;
        if (bogoCount > 0) {
          categories.push({
            id: 'bogo',
            title: 'BOGO',
            subtitle: `${bogoCount} offers`,
            icon: 'pricetag-outline',
            iconColor: '#22C55E',
            bgColor: '#14532D',
            badge: '2x',
            count: bogoCount,
          });
        }

        // Flash Sale
        const flashCount = response.data.filter((o: Offer) => o.metadata?.flashSale?.isActive).length;
        if (flashCount > 0) {
          categories.push({
            id: 'flash',
            title: 'Flash Sale',
            subtitle: `${flashCount} offers`,
            icon: 'flash-outline',
            iconColor: '#EF4444',
            bgColor: '#7F1D1D',
            count: flashCount,
          });
        }

        // Cashback offers
        const cashbackCount = response.data.filter((o: Offer) => o.type === 'cashback' || o.cashbackPercentage > 0).length;
        if (cashbackCount > 0) {
          categories.push({
            id: 'cashback',
            title: 'Super Cashback',
            subtitle: `${cashbackCount} offers`,
            icon: 'cash-outline',
            iconColor: '#F59E0B',
            bgColor: '#78350F',
            count: cashbackCount,
          });
        }

        // Freebies
        const freebieCount = response.data.filter((o: Offer) => 
          o.title?.toLowerCase().includes('free') || o.discountedPrice === 0
        ).length;
        if (freebieCount > 0) {
          categories.push({
            id: 'freebie',
            title: 'Freebies',
            subtitle: `${freebieCount} offers`,
            icon: 'gift-outline',
            iconColor: '#A855F7',
            bgColor: '#581C87',
            count: freebieCount,
          });
        }

        // If no categories found, add default ones
        if (categories.length === 0) {
          categories.push(
            {
              id: 'all',
              title: 'All Offers',
              subtitle: `${response.data.length} offers`,
              icon: 'grid-outline',
              iconColor: '#8B5CF6',
              bgColor: '#4C1D95',
              count: response.data.length,
            }
          );
        }

        setOfferCategories(categories);
      }
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      // On error, show default categories
      setOfferCategories([
        {
          id: 'all',
          title: 'All Offers',
          subtitle: '0 offers',
          icon: 'grid-outline',
          iconColor: '#8B5CF6',
          bgColor: '#4C1D95',
          count: 0,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'offers') {
      fetchOffers();
    }
  }, [activeTab, fetchOffers]);

  const handleViewAll = () => {
    if (activeTab === 'offers') {
      router.push('/offers' as any);
    } else if (activeTab === 'cashback') {
      router.push('/offers?tab=cashback' as any);
    } else {
      router.push('/offers' as any);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    if (activeTab === 'offers') {
      router.push(`/offers?category=${categoryId}` as any);
    } else if (activeTab === 'cashback') {
      router.push(`/offers?tab=cashback&category=${categoryId}` as any);
    } else if (activeTab === 'exclusive') {
      // Map exclusive category IDs to routes
      const routeMap: Record<string, string> = {
        students: '/offers/zones/student',
        employees: '/offers/zones/employee',
        women: '/offers/zones/women',
        birthday: '/offers/birthday',
        loyalty: '/offers/zones/loyalty',
        army: '/offers/zones/heroes',
        medical: '/offers/zones/heroes',
        disabled: '/offers/zones/heroes',
      };
      const route = routeMap[categoryId] || '/offers';
      router.push(route as any);
    }
  };

  // Generate gradient colors from bgColor
  const getGradientColors = (bgColor: string, iconColor: string): [string, string, string] => {
    // Create gradient variations based on the base color
    const colorMap: Record<string, [string, string, string]> = {
      '#1E3A8A': ['#3B82F6', '#2563EB', '#1E3A8A'], // Blue - Nearby
      '#7C2D12': ['#F97316', '#EA580C', '#DC2626'], // Orange - Today's
      '#14532D': ['#22C55E', '#16A34A', '#14532D'], // Green - BOGO
      '#7F1D1D': ['#EF4444', '#DC2626', '#991B1B'], // Red - Flash
      '#78350F': ['#F59E0B', '#D97706', '#92400E'], // Amber - Cashback
      '#581C87': ['#A855F7', '#9333EA', '#7E22CE'], // Purple - Freebies
      '#4C1D95': ['#8B5CF6', '#7C3AED', '#6D28D9'], // Purple - All
    };
    return colorMap[bgColor] || [bgColor, bgColor, bgColor];
  };

  const renderCategoryCard = (category: CategoryCard) => {
    const gradientColors = getGradientColors(category.bgColor, category.iconColor);
    
    return (
      <TouchableOpacity
        key={category.id}
        style={styles.categoryCard}
        onPress={() => handleCategoryPress(category.id)}
        activeOpacity={0.9}
      >
        {category.badge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{category.badge}</Text>
          </View>
        )}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryCardGradient}
        >
          <BlurView intensity={20} style={styles.categoryCardBlur} tint="light">
            <View style={styles.categoryCardContent}>
              <View style={styles.categoryIconContainer}>
                <Ionicons name={category.icon} size={18} color={COLORS.white} />
              </View>
              <View style={styles.categoryTextContainer}>
                <Text style={styles.categoryTitle} numberOfLines={1}>{category.title}</Text>
                <Text style={styles.categorySubtitle} numberOfLines={1}>{category.subtitle}</Text>
              </View>
              <View style={styles.categoryArrowContainer}>
                <Ionicons name="chevron-forward" size={14} color={COLORS.white} />
              </View>
            </View>
          </BlurView>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderExclusiveCard = (category: typeof EXCLUSIVE_CATEGORIES[0]) => (
    <TouchableOpacity
      key={category.id}
      style={styles.exclusiveCard}
      onPress={() => handleCategoryPress(category.id)}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={category.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.exclusiveCardGradient}
      >
        <BlurView intensity={20} style={styles.exclusiveCardBlur} tint="light">
          <View style={styles.exclusiveCardContent}>
            <View style={styles.exclusiveIconContainer}>
              <Ionicons name={category.icon} size={18} color={COLORS.white} />
            </View>
            <View style={styles.exclusiveTextContainer}>
              <Text style={styles.exclusiveTitle} numberOfLines={1}>{category.title}</Text>
              <Text style={styles.exclusiveSubtitle} numberOfLines={1}>{category.subtitle}</Text>
            </View>
            <View style={styles.exclusiveArrowContainer}>
              <Ionicons name="chevron-forward" size={14} color={COLORS.white} />
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (activeTab === 'exclusive') {
      // Split categories into rows of 2 for horizontal scroll
      const rows = [];
      for (let i = 0; i < EXCLUSIVE_CATEGORIES.length; i += 2) {
        rows.push(EXCLUSIVE_CATEGORIES.slice(i, i + 2));
      }
      
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.exclusiveScrollContainer}
          style={styles.exclusiveScrollView}
        >
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.exclusiveRow}>
              {row.map(renderExclusiveCard)}
            </View>
          ))}
        </ScrollView>
      );
    }

    if (activeTab === 'offers' && loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading offers...</Text>
        </View>
      );
    }

    const categories = activeTab === 'offers' ? offerCategories : CASHBACK_CATEGORIES;

    if (categories.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No {activeTab} available</Text>
        </View>
      );
    }

    // Split categories into rows of 2 for horizontal scroll (same as exclusive)
    const rows = [];
    for (let i = 0; i < categories.length; i += 2) {
      rows.push(categories.slice(i, i + 2));
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.exclusiveScrollContainer}
        style={styles.exclusiveScrollView}
      >
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.exclusiveRow}>
            {row.map(renderCategoryCard)}
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Glassy background overlay */}
      <BlurView intensity={20} style={styles.blurOverlay} tint="light">
        <LinearGradient
          colors={[COLORS.background, COLORS.backgroundLight, COLORS.white]}
          style={styles.gradientOverlay}
        />
      </BlurView>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['#EC4899', '#DB2777']}
            style={styles.headerIconGradient}
          >
            <Ionicons name="flash" size={20} color={COLORS.white} />
          </LinearGradient>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>Deals that save you money</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>Discover amazing offers & cashback</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'offers' && styles.tabActive]}
          onPress={() => setActiveTab('offers')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'offers' && styles.tabTextActive]}>
            Offers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'cashback' && styles.tabActive]}
          onPress={() => setActiveTab('cashback')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'cashback' && styles.tabTextActive]}>
            Cashback
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'exclusive' && styles.tabActive]}
          onPress={() => setActiveTab('exclusive')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'exclusive' && styles.tabTextActive]}>
            Exclusive
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentWrapper}>
        {renderContent()}
      </View>

      {/* View All Button - Moved to bottom */}
      {activeTab !== 'exclusive' && (
        <TouchableOpacity
          style={styles.viewAllButtonBottom}
          onPress={handleViewAll}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.viewAllGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.viewAllTextBottom}>View All {activeTab === 'offers' ? 'Offers' : 'Cashback'}</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginVertical: 12,
    marginHorizontal: 0,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 16px rgba(0, 192, 106, 0.15)',
      },
    }),
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
    flexShrink: 1,
  },
  headerIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#EC4899',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  headerTextContainer: {
    flex: 1,
    flexShrink: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginTop: 1,
  },
  contentWrapper: {
    minHeight: 180,
  },
  viewAllButtonBottom: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  viewAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  viewAllTextBottom: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    zIndex: 1,
    backgroundColor: COLORS.tabBg,
    padding: 4,
    borderRadius: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  categoriesScrollView: {
    marginHorizontal: -4,
  },
  categoriesContainer: {
    paddingRight: 16,
    paddingLeft: 4,
    gap: 14,
  },
  categoryCard: {
    width: 220,
    minHeight: 100,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  categoryCardGradient: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryCardBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
    minHeight: 100,
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    flexShrink: 0,
  },
  categoryTextContainer: {
    flex: 1,
    flexShrink: 1,
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  categorySubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  categoryArrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    flexShrink: 0,
  },
  badgeContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: COLORS.white,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  // Exclusive tab styles
  exclusiveScrollView: {
    marginHorizontal: -4,
  },
  exclusiveScrollContainer: {
    paddingRight: 16,
    paddingLeft: 4,
    gap: 12,
  },
  exclusiveRow: {
    flexDirection: 'column',
    gap: 12,
    marginRight: 12,
  },
  exclusiveCard: {
    width: 220,
    minHeight: 100,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  exclusiveCardGradient: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  exclusiveCardBlur: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  exclusiveCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
    minHeight: 100,
  },
  exclusiveIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    flexShrink: 0,
  },
  exclusiveTextContainer: {
    flex: 1,
    flexShrink: 1,
    justifyContent: 'center',
  },
  exclusiveTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  exclusiveSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  exclusiveArrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    flexShrink: 0,
  },
});

export default DealsThatSaveMoney;
