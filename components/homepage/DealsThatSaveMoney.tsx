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
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import realOffersApi, { Offer } from '@/services/realOffersApi';
import { useAuth } from '@/contexts/AuthContext';
import { useRegion } from '@/contexts/RegionContext';

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
  background: '#F0FDF4', // Lighter green background
  backgroundLight: '#F7FEF9', // Even lighter
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

// Exclusive zone data structure (from API)
interface ExclusiveZoneCard {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors: readonly [string, string, string];
  offersCount: number;
  verificationRequired: boolean;
  eligibilityType: string;
  userEligible?: boolean; // From API - indicates if current user is eligible
}

// Cashback campaign data structure (from API)
interface CashbackCard {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors: readonly [string, string, string];
  multiplier?: number;
  type: 'double_cashback' | 'coin_drop' | 'campaign';
}

// Map backend icon names to Ionicons
const mapIconToIonicon = (icon: string): keyof typeof Ionicons.glyphMap => {
  // If icon already has -outline suffix, return as is (if valid)
  if (icon && icon.endsWith('-outline')) {
    return icon as keyof typeof Ionicons.glyphMap;
  }

  const mapping: Record<string, keyof typeof Ionicons.glyphMap> = {
    // Exclusive zones
    'school': 'school-outline',
    'briefcase': 'briefcase-outline',
    'woman': 'woman-outline',
    'gift': 'gift-outline',
    'heart': 'heart-outline',
    'star': 'star-outline',
    'shield': 'shield-outline',
    'medkit': 'medkit-outline',
    'accessibility': 'accessibility-outline',
    'book': 'book-outline',
    'business': 'business-outline',
    // Cashback campaigns
    'flash': 'flash-outline',
    'cart': 'cart-outline',
    'cafe': 'cafe-outline',
    'shirt': 'shirt-outline',
    'cash': 'cash-outline',
    'wallet': 'wallet-outline',
    'trophy': 'trophy-outline',
    // Additional icons that might come from backend
    'target': 'locate-outline',
    'location': 'location-outline',
    'time': 'time-outline',
    'pricetag': 'pricetag-outline',
    'people': 'people-outline',
    'person': 'person-outline',
    'ribbon': 'ribbon-outline',
    'medal': 'medal-outline',
    'diamond': 'diamond-outline',
    'flame': 'flame-outline',
    'chatbubble': 'chatbubble-outline',
    'create': 'create-outline',
    'sparkles': 'sparkles-outline',
    'rocket': 'rocket-outline',
    'bag': 'bag-outline',
    'storefront': 'storefront-outline',
    'receipt': 'receipt-outline',
    'card': 'card-outline',
    'phone': 'phone-portrait-outline',
  };
  return mapping[icon] || 'apps-outline';
};

// Generate gradient colors from background and icon color
const generateGradientColors = (bgColor: string, iconColor: string): readonly [string, string, string] => {
  // Use predefined gradients based on icon color
  const gradientMap: Record<string, readonly [string, string, string]> = {
    '#6366F1': ['#A5B4FC', '#818CF8', '#6366F1'], // Indigo - Student
    '#0EA5E9': ['#7DD3FC', '#38BDF8', '#0EA5E9'], // Sky - Corporate
    '#EC4899': ['#F9A8D4', '#F472B6', '#EC4899'], // Pink - Women
    '#F59E0B': ['#FCD34D', '#FBBF24', '#F59E0B'], // Amber - Birthday
    '#10B981': ['#6EE7B7', '#34D399', '#10B981'], // Emerald - Senior
    '#8B5CF6': ['#C4B5FD', '#A78BFA', '#8B5CF6'], // Violet - First time
    '#059669': ['#6EE7B7', '#34D399', '#059669'], // Green - Defence
    '#DC2626': ['#FCA5A5', '#F87171', '#DC2626'], // Red - Healthcare
    '#7C3AED': ['#C4B5FD', '#A78BFA', '#7C3AED'], // Purple - Senior
    '#2563EB': ['#93C5FD', '#60A5FA', '#2563EB'], // Blue - Teachers
    '#0891B2': ['#67E8F9', '#22D3EE', '#0891B2'], // Cyan - Government
    '#EA580C': ['#FDBA74', '#FB923C', '#EA580C'], // Orange - Disabled
  };
  return gradientMap[iconColor] || ['#E5E7EB', '#D1D5DB', '#9CA3AF'];
};

// Fallback static exclusive categories (used when API fails)
const FALLBACK_EXCLUSIVE_CATEGORIES: ExclusiveZoneCard[] = [
  {
    id: 'student',
    slug: 'student',
    title: 'Students',
    subtitle: 'Campus Zone',
    icon: 'school-outline',
    gradientColors: ['#60A5FA', '#3B82F6', '#2563EB'] as const,
    offersCount: 0,
    verificationRequired: true,
    eligibilityType: 'student',
    userEligible: false,
  },
  {
    id: 'corporate',
    slug: 'corporate',
    title: 'Corporate',
    subtitle: 'Corporate Zone',
    icon: 'briefcase-outline',
    gradientColors: ['#A78BFA', '#8B5CF6', '#7C3AED'] as const,
    offersCount: 0,
    verificationRequired: true,
    eligibilityType: 'corporate_email',
    userEligible: false,
  },
  {
    id: 'women',
    slug: 'women',
    title: 'Women Exclusive',
    subtitle: 'Special Rewards',
    icon: 'heart-outline',
    gradientColors: ['#F472B6', '#EC4899', '#DB2777'] as const,
    offersCount: 0,
    verificationRequired: false,
    eligibilityType: 'gender',
    userEligible: false,
  },
  {
    id: 'birthday',
    slug: 'birthday',
    title: 'Birthday Specials',
    subtitle: 'Celebrate & Save',
    icon: 'gift-outline',
    gradientColors: ['#FB923C', '#F97316', '#EA580C'] as const,
    offersCount: 0,
    verificationRequired: false,
    eligibilityType: 'birthday_month',
    userEligible: false,
  },
];

// Fallback cashback categories (used when API fails)
const FALLBACK_CASHBACK_CATEGORIES: CashbackCard[] = [
  {
    id: 'double-cashback',
    title: 'Double Cashback',
    subtitle: 'Earn 2X coins',
    icon: 'cash-outline',
    gradientColors: ['#FDE68A', '#FCD34D', '#FBBF24'] as const,
    multiplier: 2,
    type: 'double_cashback',
  },
  {
    id: 'coin-drops',
    title: 'Coin Drops',
    subtitle: 'Boosted rewards',
    icon: 'flash-outline',
    gradientColors: ['#FCA5A5', '#F87171', '#EF4444'] as const,
    type: 'coin_drop',
  },
];

type TabType = 'offers' | 'cashback' | 'exclusive';

interface DealsThatSaveMoneyProps {
  style?: any;
}

const DealsThatSaveMoney: React.FC<DealsThatSaveMoneyProps> = ({ style }) => {
  const router = useRouter();
  const { state: authState } = useAuth();
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();
  const user = authState?.user;
  const [activeTab, setActiveTab] = useState<TabType>('offers');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [offerCategories, setOfferCategories] = useState<CategoryCard[]>([]);

  // New state for dynamic data
  const [exclusiveZones, setExclusiveZones] = useState<ExclusiveZoneCard[]>(FALLBACK_EXCLUSIVE_CATEGORIES);
  const [cashbackData, setCashbackData] = useState<CashbackCard[]>(FALLBACK_CASHBACK_CATEGORIES);
  const [exclusiveLoading, setExclusiveLoading] = useState(false);
  const [cashbackLoading, setCashbackLoading] = useState(false);

  // Skeleton animation
  const shimmerAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Check user verification status for exclusive zones
  const checkUserVerification = useCallback((eligibilityType: string): boolean => {
    if (!user) return false;

    switch (eligibilityType) {
      case 'student':
        return user?.verifications?.student === true;
      case 'corporate_email':
        return user?.verifications?.corporate === true;
      case 'gender':
        return user?.profile?.gender === 'female';
      case 'birthday_month':
        if (!user?.profile?.dateOfBirth) return false;
        const birthMonth = new Date(user.profile.dateOfBirth).getMonth();
        const currentMonth = new Date().getMonth();
        return birthMonth === currentMonth;
      case 'age':
        if (!user?.profile?.dateOfBirth) return false;
        const age = Math.floor((Date.now() - new Date(user.profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        return age >= 60;
      case 'verification':
        return user?.isFirstOrder !== false;
      default:
        return false;
    }
  }, [user]);

  // Fetch exclusive zones from backend
  const fetchExclusiveZones = useCallback(async () => {
    setExclusiveLoading(true);
    try {
      const [zonesResponse, profilesResponse] = await Promise.all([
        realOffersApi.getExclusiveZones(),
        realOffersApi.getSpecialProfiles(),
      ]);

      const zones: ExclusiveZoneCard[] = [];

      // Map exclusive zones
      if (zonesResponse.success && zonesResponse.data) {
        zonesResponse.data.forEach((zone: any) => {
          zones.push({
            id: zone._id || zone.slug,
            slug: zone.slug,
            title: zone.name,
            subtitle: zone.shortDescription || `${zone.offersCount || 0} offers`,
            icon: mapIconToIonicon(zone.icon),
            gradientColors: generateGradientColors(zone.backgroundColor, zone.iconColor),
            offersCount: zone.offersCount || 0,
            verificationRequired: zone.verificationRequired || false,
            eligibilityType: zone.eligibilityType || 'none',
            userEligible: zone.userEligible, // From API response
          });
        });
      }

      // Map special profiles (skip duplicates by slug)
      if (profilesResponse.success && profilesResponse.data) {
        const existingSlugs = new Set(zones.map(z => z.slug));
        profilesResponse.data.forEach((profile: any) => {
          // Skip if slug already exists (avoid duplicates like 'senior')
          if (existingSlugs.has(profile.slug)) {
            return;
          }
          zones.push({
            id: profile._id || profile.slug,
            slug: profile.slug,
            title: profile.name,
            subtitle: profile.discountRange || `${profile.offersCount || 0} offers`,
            icon: mapIconToIonicon(profile.icon),
            gradientColors: generateGradientColors(profile.backgroundColor, profile.iconColor),
            offersCount: profile.offersCount || 0,
            verificationRequired: !!profile.verificationRequired,
            eligibilityType: profile.slug,
            userEligible: profile.userEligible, // From API response
          });
        });
      }

      if (zones.length > 0) {
        setExclusiveZones(zones);
      }
    } catch (error) {
      console.error('Failed to fetch exclusive zones:', error);
      // Keep fallback data
    } finally {
      setExclusiveLoading(false);
    }
  }, []);

  // Fetch cashback campaigns from backend
  const fetchCashbackData = useCallback(async () => {
    setCashbackLoading(true);
    try {
      const [doubleCBResponse, coinDropsResponse] = await Promise.all([
        realOffersApi.getDoubleCashbackCampaigns(10),
        realOffersApi.getCoinDrops({ limit: 10 }),
      ]);

      const cards: CashbackCard[] = [];

      // Map double cashback campaigns
      if (doubleCBResponse.success && doubleCBResponse.data) {
        doubleCBResponse.data.forEach((campaign: any) => {
          cards.push({
            id: campaign._id || campaign.title,
            title: campaign.title,
            subtitle: campaign.subtitle || `${campaign.multiplier}X cashback`,
            icon: mapIconToIonicon(campaign.icon || 'flash'),
            gradientColors: ['#FDE68A', '#FCD34D', '#FBBF24'] as const,
            multiplier: campaign.multiplier,
            type: 'double_cashback',
          });
        });
      }

      // Map coin drops
      if (coinDropsResponse.success && coinDropsResponse.data) {
        coinDropsResponse.data.forEach((drop: any) => {
          cards.push({
            id: drop._id || drop.storeName,
            title: drop.storeName || 'Coin Drop',
            subtitle: `${drop.multiplier}X - ${currencySymbol}${drop.boostedCashback} cashback`,
            icon: mapIconToIonicon(drop.icon || 'flash'),
            gradientColors: ['#FCA5A5', '#F87171', '#EF4444'] as const,
            multiplier: drop.multiplier,
            type: 'coin_drop',
          });
        });
      }

      if (cards.length > 0) {
        setCashbackData(cards);
      }
    } catch (error) {
      console.error('Failed to fetch cashback data:', error);
      // Keep fallback data
    } finally {
      setCashbackLoading(false);
    }
  }, []);

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
    } else if (activeTab === 'cashback') {
      fetchCashbackData();
    } else if (activeTab === 'exclusive') {
      fetchExclusiveZones();
    }
  }, [activeTab, fetchOffers, fetchCashbackData, fetchExclusiveZones]);

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
      // Use slug directly from API data
      router.push(`/offers/zones/${categoryId}` as any);
    }
  };

  // Handle exclusive zone press with verification check
  const handleExclusivePress = (zone: ExclusiveZoneCard) => {
    // Special profiles redirect to heroes page
    const heroesProfiles = ['defence', 'healthcare', 'teachers', 'government', 'differently-abled'];
    if (heroesProfiles.includes(zone.slug)) {
      router.push(`/offers/zones/heroes?profile=${zone.slug}` as any);
    } else {
      // Navigate to zone offers page - verification will be handled there
      router.push(`/offers/zones/${zone.slug}` as any);
    }
  };

  // Handle cashback card press
  const handleCashbackPress = (card: CashbackCard) => {
    if (card.type === 'double_cashback') {
      router.push('/offers?tab=cashback&filter=double' as any);
    } else if (card.type === 'coin_drop') {
      router.push('/offers?tab=cashback&filter=coindrops' as any);
    } else {
      router.push('/offers?tab=cashback' as any);
    }
  };

  // Generate gradient colors from bgColor - Lightened versions
  const getGradientColors = (bgColor: string, iconColor: string): [string, string, string] => {
    // Create lighter, pastel gradient variations based on the base color
    const colorMap: Record<string, [string, string, string]> = {
      '#1E3A8A': ['#93C5FD', '#60A5FA', '#3B82F6'], // Light Blue - Nearby
      '#7C2D12': ['#FED7AA', '#FDB573', '#FB923C'], // Light Orange - Today's
      '#14532D': ['#86EFAC', '#4ADE80', '#22C55E'], // Light Green - BOGO
      '#7F1D1D': ['#FCA5A5', '#F87171', '#EF4444'], // Light Red - Flash
      '#78350F': ['#FDE68A', '#FCD34D', '#FBBF24'], // Light Amber - Cashback
      '#581C87': ['#C4B5FD', '#A78BFA', '#8B5CF6'], // Light Purple - Freebies
      '#4C1D95': ['#DDD6FE', '#C4B5FD', '#A78BFA'], // Light Purple - All
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
                <Ionicons name={category.icon} size={18} color={COLORS.textDark} />
              </View>
              <View style={styles.categoryTextContainer}>
                <Text style={styles.categoryTitle} numberOfLines={1}>{category.title}</Text>
                <Text style={styles.categorySubtitle} numberOfLines={1}>{category.subtitle}</Text>
              </View>
              <View style={styles.categoryArrowContainer}>
                <Ionicons name="chevron-forward" size={14} color={COLORS.textDark} />
              </View>
            </View>
          </BlurView>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Skeleton loading card
  const renderSkeletonCard = (index: number) => (
    <View key={`skeleton-${index}`} style={styles.exclusiveCard}>
      <LinearGradient
        colors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.exclusiveCardGradient}
      >
        <View style={styles.exclusiveCardContent}>
          <Animated.View
            style={[
              styles.skeletonIcon,
              { opacity: shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] }) }
            ]}
          />
          <View style={styles.skeletonTextContainer}>
            <Animated.View
              style={[
                styles.skeletonTitle,
                { opacity: shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] }) }
              ]}
            />
            <Animated.View
              style={[
                styles.skeletonSubtitle,
                { opacity: shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] }) }
              ]}
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // Render exclusive zone card with verification UI
  const renderExclusiveCard = (zone: ExclusiveZoneCard) => {
    // Use userEligible from API if available, otherwise fall back to local check
    const isEligible = zone.userEligible !== undefined
      ? zone.userEligible
      : checkUserVerification(zone.eligibilityType);
    const showLock = zone.verificationRequired && !isEligible;

    return (
      <TouchableOpacity
        key={zone.id}
        style={styles.exclusiveCard}
        onPress={() => handleExclusivePress(zone)}
        activeOpacity={0.9}
      >
        {/* Lock badge for unverified zones */}
        {showLock && (
          <View style={styles.lockBadgeContainer}>
            <Ionicons name="lock-closed" size={12} color="#FFF" />
          </View>
        )}
        <LinearGradient
          colors={zone.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.exclusiveCardGradient}
        >
          <BlurView intensity={20} style={styles.exclusiveCardBlur} tint="light">
            <View style={styles.exclusiveCardContent}>
              <View style={styles.exclusiveIconContainer}>
                <Ionicons name={zone.icon} size={18} color={COLORS.textDark} />
              </View>
              <View style={styles.exclusiveTextContainer}>
                <Text style={styles.exclusiveTitle} numberOfLines={1}>{zone.title}</Text>
                <Text style={styles.exclusiveSubtitle} numberOfLines={1}>
                  {showLock ? 'Verify to unlock' : zone.subtitle}
                </Text>
              </View>
              <View style={styles.exclusiveArrowContainer}>
                <Ionicons
                  name={showLock ? 'lock-closed-outline' : 'chevron-forward'}
                  size={14}
                  color={COLORS.textDark}
                />
              </View>
            </View>
          </BlurView>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Render cashback campaign card
  const renderCashbackCard = (card: CashbackCard) => (
    <TouchableOpacity
      key={card.id}
      style={styles.exclusiveCard}
      onPress={() => handleCashbackPress(card)}
      activeOpacity={0.9}
    >
      {/* Multiplier badge */}
      {card.multiplier && (
        <View style={styles.multiplierBadgeContainer}>
          <Text style={styles.multiplierBadgeText}>{card.multiplier}X</Text>
        </View>
      )}
      <LinearGradient
        colors={card.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.exclusiveCardGradient}
      >
        <BlurView intensity={20} style={styles.exclusiveCardBlur} tint="light">
          <View style={styles.exclusiveCardContent}>
            <View style={styles.exclusiveIconContainer}>
              <Ionicons name={card.icon} size={18} color={COLORS.textDark} />
            </View>
            <View style={styles.exclusiveTextContainer}>
              <Text style={styles.exclusiveTitle} numberOfLines={1}>{card.title}</Text>
              <Text style={styles.exclusiveSubtitle} numberOfLines={1}>{card.subtitle}</Text>
            </View>
            <View style={styles.exclusiveArrowContainer}>
              <Ionicons name="chevron-forward" size={14} color={COLORS.textDark} />
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderContent = () => {
    // Render skeleton loading for any tab
    const renderSkeletonRows = () => (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.exclusiveScrollContainer}
        style={styles.exclusiveScrollView}
      >
        {[0, 1, 2, 3].map((_, rowIndex) => (
          <View key={rowIndex} style={styles.exclusiveRow}>
            {renderSkeletonCard(rowIndex * 2)}
            {renderSkeletonCard(rowIndex * 2 + 1)}
          </View>
        ))}
      </ScrollView>
    );

    // Exclusive tab
    if (activeTab === 'exclusive') {
      if (exclusiveLoading) {
        return renderSkeletonRows();
      }

      // Split zones into rows of 2 for horizontal scroll
      const rows = [];
      for (let i = 0; i < exclusiveZones.length; i += 2) {
        rows.push(exclusiveZones.slice(i, i + 2));
      }

      if (exclusiveZones.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No exclusive zones available</Text>
          </View>
        );
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

    // Cashback tab
    if (activeTab === 'cashback') {
      if (cashbackLoading) {
        return renderSkeletonRows();
      }

      // Split cashback cards into rows of 2
      const rows = [];
      for (let i = 0; i < cashbackData.length; i += 2) {
        rows.push(cashbackData.slice(i, i + 2));
      }

      if (cashbackData.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No cashback campaigns available</Text>
          </View>
        );
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
              {row.map(renderCashbackCard)}
            </View>
          ))}
        </ScrollView>
      );
    }

    // Offers tab
    if (loading) {
      return renderSkeletonRows();
    }

    if (offerCategories.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No offers available</Text>
        </View>
      );
    }

    // Split categories into rows of 2 for horizontal scroll
    const rows = [];
    for (let i = 0; i < offerCategories.length; i += 2) {
      rows.push(offerCategories.slice(i, i + 2));
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
      <BlurView intensity={10} style={styles.blurOverlay} tint="light">
        <LinearGradient
          colors={[COLORS.white, COLORS.backgroundLight, COLORS.white]}
          style={styles.gradientOverlay}
        />
      </BlurView>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="flash" size={20} color="#EC4899" />
          </View>
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
            colors={['#86EFAC', '#4ADE80', '#22C55E']}
            style={styles.viewAllGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.viewAllTextBottom}>View All {activeTab === 'offers' ? 'Offers' : 'Cashback'}</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.textDark} />
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
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
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
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
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
    color: COLORS.textDark,
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
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
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
    color: COLORS.textDark,
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  categorySubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  categoryArrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
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
  // Lock badge for verification-required zones
  lockBadgeContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  // Multiplier badge for cashback cards
  multiplierBadgeContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  multiplierBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  // Skeleton loading styles
  skeletonIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#D1D5DB',
  },
  skeletonTextContainer: {
    flex: 1,
    gap: 6,
  },
  skeletonTitle: {
    width: '70%',
    height: 14,
    borderRadius: 7,
    backgroundColor: '#D1D5DB',
  },
  skeletonSubtitle: {
    width: '50%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D1D5DB',
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
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
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
    color: COLORS.textDark,
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  exclusiveSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  exclusiveArrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    flexShrink: 0,
  },
});

export default DealsThatSaveMoney;
