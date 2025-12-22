import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { useOffersPage } from '@/hooks/useOffersPage';
import { shareOffersPage } from '@/utils/shareUtils';
import { Offer } from '@/services/realOffersApi';
import { useAuth } from '@/contexts/AuthContext';
import realOffersApi from '@/services/realOffersApi';
import { Colors, Gradients } from '@/constants/DesignSystem';

const { width } = Dimensions.get('window');

type TabType = 'offers' | 'cashback' | 'exclusives';
type FilterType = 'all' | 'free-delivery' | '50-discount' | '40-discount' | '25-discount' | '20-discount';

export default function OffersScreen() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const {
    state,
    actions,
    handlers
  } = useOffersPage();

  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('offers');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  // Get user points
  const userPoints = React.useMemo(() => {
    if (state.pageData?.userEngagement?.userPoints !== undefined) {
      return state.pageData.userEngagement.userPoints;
    }
    const walletBalance = authState.user?.wallet?.balance || 0;
    return walletBalance;
  }, [state.pageData?.userEngagement?.userPoints, authState.user?.wallet?.balance]);

  // Load offers based on active tab and filter
  useEffect(() => {
    loadFilteredOffers();
  }, [activeTab, activeFilter]);

  const loadFilteredOffers = async () => {
    try {
      setLoadingOffers(true);
      const params: any = {
        page: 1,
        limit: 50,
      };

      // Filter by tab type
      if (activeTab === 'cashback') {
        params.type = 'cashback';
      } else if (activeTab === 'exclusives') {
        params.featured = true;
        params.metadata = { isSpecial: true };
      }

      // Filter by filter type
      if (activeFilter === 'free-delivery') {
        params.tags = 'free-delivery';
      } else if (activeFilter === '50-discount') {
        params.minCashback = 50;
      } else if (activeFilter === '40-discount') {
        params.minCashback = 40;
        params.maxCashback = 49;
      } else if (activeFilter === '25-discount') {
        params.minCashback = 25;
        params.maxCashback = 39;
      } else if (activeFilter === '20-discount') {
        params.minCashback = 20;
        params.maxCashback = 24;
      }

      const response = await realOffersApi.getOffers(params);
      if (response.success && response.data) {
        // Handle both paginated and array responses
        if (Array.isArray(response.data)) {
          setFilteredOffers(response.data);
        } else if (response.data && 'items' in response.data) {
          setFilteredOffers(response.data.items || []);
        } else {
          setFilteredOffers([]);
        }
      } else {
        setFilteredOffers([]);
      }
    } catch (error) {
      console.error('Error loading filtered offers:', error);
      setFilteredOffers([]);
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleBack = () => {
    handlers.handleBack();
  };

  const handleShare = async () => {
    await handlers.handleShare();
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    handlers.handleFavorite();
  };

  // Filter pills based on active tab
  const filterPills: { key: FilterType; label: string }[] = useMemo(() => {
    if (activeTab === 'offers') {
      return [
        { key: 'all', label: 'All' },
        { key: 'free-delivery', label: 'Free Delivery' },
        { key: '50-discount', label: '50% Discount' },
        { key: '40-discount', label: 'Up To 40%' },
        { key: '25-discount', label: '25% Off' },
        { key: '20-discount', label: '20% Off' },
      ];
    } else if (activeTab === 'cashback') {
      return [
        { key: 'all', label: 'All' },
        { key: 'free-delivery', label: 'Free Delivery' },
      ];
    }
    // Exclusives tab
    return [
      { key: 'all', label: 'All' },
      { key: 'free-delivery', label: 'Free Delivery' },
    ];
  }, [activeTab]);

  // Offer Card Component matching design
  const OfferCard = ({ offer }: { offer: Offer }) => {
    const [logoError, setLogoError] = React.useState(false);
    const isExclusive = offer.metadata?.isSpecial || (offer as any).isFollowerExclusive;

    // Get delivery info from offer metadata or store operationalInfo
    const deliveryFee = (offer as any).store?.operationalInfo?.deliveryFee !== undefined
      ? (offer as any).store.operationalInfo.deliveryFee
      : (offer.metadata?.tags?.includes('free-delivery') ? 0 : (offer.restrictions?.minOrderValue && offer.restrictions.minOrderValue < 1 ? offer.restrictions.minOrderValue : 0.600));

    // Format delivery time - extract single value from range if needed
    const deliveryTimeTag = offer.metadata?.tags?.find(tag => tag.includes('min') && tag.match(/\d+-min/));
    const rawDeliveryTime = deliveryTimeTag
      ? deliveryTimeTag.replace('-min', ' min')
      : (offer as any).store?.operationalInfo?.deliveryTime || '30-45 min';

    const deliveryTime = rawDeliveryTime.includes('-')
      ? rawDeliveryTime.split('-')[0].trim() + ' min'
      : rawDeliveryTime.includes('min')
        ? rawDeliveryTime.trim()
        : `${rawDeliveryTime} min`;

    // Free delivery detection - check multiple sources
    const isFreeDelivery =
      deliveryFee === 0 ||
      offer.restrictions?.minOrderValue === 0 ||
      (offer as any).store?.operationalInfo?.freeDeliveryAbove !== undefined ||
      offer.metadata?.tags?.includes('free-delivery') ||
      offer.title.toLowerCase().includes('free delivery') ||
      offer.subtitle?.toLowerCase().includes('free delivery') ||
      offer.description?.toLowerCase().includes('free delivery');

    const rating = offer.store?.rating || 4.5;

    return (
      <TouchableOpacity
        style={styles.offerCard}
        onPress={() => handlers.handleOfferPress(offer)}
        activeOpacity={0.7}
      >
        {/* Store Logo - White square container */}
        <View style={styles.logoContainer}>
          {isExclusive && (
            <View style={styles.unlimitedBadge}>
              <ThemedText style={styles.unlimitedText}>UNLIMITED</ThemedText>
            </View>
          )}
          {offer.store?.logo && !logoError ? (
            <Image
              source={{ uri: offer.store.logo }}
              style={styles.storeLogo}
              resizeMode="contain"
              onError={() => setLogoError(true)}
              onLoad={() => setLogoError(false)}
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <ThemedText style={styles.logoPlaceholderText}>
                {offer.store?.name?.substring(0, 2).toUpperCase() || 'ST'}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Offer Info */}
        <View style={styles.offerInfo}>
          <ThemedText style={styles.storeName} numberOfLines={1}>
            {offer.store?.name || offer.title}
          </ThemedText>

          <ThemedText style={styles.offerDescription} numberOfLines={3}>
            {offer.subtitle || offer.description || offer.title}
          </ThemedText>

          {/* Delivery Info Row */}
          <View style={styles.deliveryInfoRow}>
            {isFreeDelivery ? (
              <View style={styles.freeBadge}>
                <ThemedText style={styles.freeBadgeText}>FREE</ThemedText>
              </View>
            ) : (
              <View style={styles.deliveryFeeContainer}>
                <Ionicons name="car-outline" size={11} color={Colors.gray[400]} />
                <ThemedText style={styles.deliveryFee}>
                  KD {deliveryFee > 0 ? deliveryFee.toFixed(3) : '0.600'}
                </ThemedText>
              </View>
            )}

            <View style={styles.deliveryTimeContainer}>
              <Ionicons name="time-outline" size={11} color={Colors.gray[400]} />
              <ThemedText style={styles.deliveryTime}>{deliveryTime}</ThemedText>
            </View>

            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={11} color={Colors.warning[500] || '#F59E0B'} />
              <ThemedText style={styles.rating}>{rating.toFixed(2)}</ThemedText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Empty State Component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIllustration}>
        <Ionicons name="receipt-outline" size={80} color="#ccc" />
      </View>
      <ThemedText style={styles.emptyTitle}>No Offers Found</ThemedText>
      <ThemedText style={styles.emptyMessage}>
        It looks like there are no offers available at the moment. Explore other sections for exciting deals or check back later for updates!
      </ThemedText>
    </View>
  );

  // Quick Offer Categories Component
  const QuickOfferCategories = () => (
    <View style={styles.quickOfferCategories}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickOfferScroll}>
        <TouchableOpacity style={[styles.quickOfferChip, { backgroundColor: '#8B5CF6' }]} onPress={() => router.push('/offers/ai-recommended')}>
          <Ionicons name="sparkles" size={16} color="#FFF" />
          <ThemedText style={styles.quickOfferText}>AI Picks</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickOfferChip, { backgroundColor: '#EC4899' }]} onPress={() => router.push('/offers/friends-redeemed')}>
          <Ionicons name="people" size={16} color="#FFF" />
          <ThemedText style={styles.quickOfferText}>Friends</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickOfferChip, { backgroundColor: '#F59E0B' }]} onPress={() => router.push('/offers/double-cashback')}>
          <Ionicons name="flash" size={16} color="#FFF" />
          <ThemedText style={styles.quickOfferText}>2x Cashback</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickOfferChip, { backgroundColor: '#10B981' }]} onPress={() => router.push('/offers/sponsored')}>
          <Ionicons name="megaphone" size={16} color="#FFF" />
          <ThemedText style={styles.quickOfferText}>Sponsored</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickOfferChip, { backgroundColor: '#EF4444' }]} onPress={() => router.push('/offers/birthday')}>
          <Ionicons name="gift" size={16} color="#FFF" />
          <ThemedText style={styles.quickOfferText}>Birthday</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Exclusive Zones Component
  const ExclusiveZones = () => (
    <View style={styles.exclusiveZones}>
      <ThemedText style={styles.zonesTitle}>Exclusive Zones</ThemedText>
      <View style={styles.zonesGrid}>
        <TouchableOpacity style={styles.zoneCard} onPress={() => router.push('/offers/zones/student')}>
          <View style={[styles.zoneIcon, { backgroundColor: '#6366F1' }]}>
            <Ionicons name="school" size={20} color="#FFF" />
          </View>
          <ThemedText style={styles.zoneText}>Student</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoneCard} onPress={() => router.push('/offers/zones/employee')}>
          <View style={[styles.zoneIcon, { backgroundColor: '#0EA5E9' }]}>
            <Ionicons name="briefcase" size={20} color="#FFF" />
          </View>
          <ThemedText style={styles.zoneText}>Employee</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoneCard} onPress={() => router.push('/offers/zones/women')}>
          <View style={[styles.zoneIcon, { backgroundColor: '#EC4899' }]}>
            <Ionicons name="female" size={20} color="#FFF" />
          </View>
          <ThemedText style={styles.zoneText}>Women</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoneCard} onPress={() => router.push('/offers/zones/heroes')}>
          <View style={[styles.zoneIcon, { backgroundColor: '#14B8A6' }]}>
            <Ionicons name="shield" size={20} color="#FFF" />
          </View>
          <ThemedText style={styles.zoneText}>Heroes</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  // List Header Component
  const ListHeaderComponent = () => (
    <View>
      <QuickOfferCategories />
      <ExclusiveZones />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <LinearGradient
        colors={Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <TouchableOpacity
              style={styles.pointsContainer}
              onPress={() => router.push('/CoinPage')}
            >
              <Ionicons name="star" size={18} color="#FFD700" />
              <ThemedText style={styles.pointsText}>{userPoints}</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={handleShare}
              style={styles.headerButton}
              accessibilityLabel="Share offers page"
            >
              <Ionicons name="share-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleFavorite}
              style={styles.headerButton}
              accessibilityLabel={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Ionicons
                name={isFavorited ? "heart" : "heart-outline"}
                size={22}
                color={isFavorited ? "#EF4444" : "white"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mega Offers Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.megaOffersBanner}>
            <ThemedText style={styles.megaOffersText}>MEGA</ThemedText>
            <View style={styles.offersTextContainer}>
              <ThemedText style={styles.offersText}>OFFERS</ThemedText>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Scalloped Edge */}
      <View style={styles.scalloped}>
        <View style={styles.scallopedInner} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'offers' && styles.tabActive]}
          onPress={() => setActiveTab('offers')}
        >
          <Ionicons
            name="pricetag-outline"
            size={22}
            color={activeTab === 'offers' ? Colors.primary[600] : Colors.gray[400]}
          />
          <ThemedText style={[styles.tabText, activeTab === 'offers' && styles.tabTextActive]}>
            Offers
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'cashback' && styles.tabActive]}
          onPress={() => setActiveTab('cashback')}
        >
          <Ionicons
            name="cash-outline"
            size={22}
            color={activeTab === 'cashback' ? Colors.primary[600] : Colors.gray[400]}
          />
          <ThemedText style={[styles.tabText, activeTab === 'cashback' && styles.tabTextActive]}>
            Cashback
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'exclusives' && styles.tabActive]}
          onPress={() => setActiveTab('exclusives')}
        >
          <View style={styles.exclusiveBadgeIcon}>
            <View style={styles.exclusiveTabBadge}>
              <ThemedText style={styles.exclusiveTabBadgeText}>UNLIMITED</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.tabText, activeTab === 'exclusives' && styles.tabTextActive]}>
            Exclusives
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Section Header and Filters Container */}
      <View style={styles.sectionAndFiltersWrapper}>
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>
            {activeTab === 'cashback' ? 'Cashback Offers' : activeTab === 'exclusives' ? 'Exclusive Offers' : 'Offers'}
          </ThemedText>
        </View>

        {/* Filter Pills - Always visible */}
        {filterPills.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
            bounces={false}
            alwaysBounceHorizontal={false}
          >
            {filterPills.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterPill,
                  activeFilter === filter.key && styles.filterPillActive
                ]}
                onPress={() => setActiveFilter(filter.key)}
              >
                <ThemedText style={[
                  styles.filterPillText,
                  activeFilter === filter.key && styles.filterPillTextActive
                ]}>
                  {filter.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Offers List */}
      {loadingOffers ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00C06A" />
          <ThemedText style={styles.loadingText}>Loading offers...</ThemedText>
        </View>
      ) : filteredOffers.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredOffers}
          renderItem={({ item }) => <OfferCard offer={item} />}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.offersList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeaderComponent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerGradient: {
    paddingTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  pointsText: {
    fontSize: 17,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 0,
    justifyContent: 'flex-end',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  bannerContainer: {
    alignItems: 'center',
  },
  megaOffersBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  megaOffersText: {
    fontSize: 36,
    fontWeight: '900',
    color: 'white',
    backgroundColor: Colors.primary[600],
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    transform: [{ rotate: '-4deg' }],
    letterSpacing: 1,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 4px 8px rgba(0, 192, 106, 0.3)',
      },
    }),
  },
  offersTextContainer: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    transform: [{ rotate: '4deg' }],
    ...Platform.select({
      ios: {
        shadowColor: Colors.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 4px 8px rgba(255, 200, 87, 0.3)',
      },
    }),
  },
  offersText: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.text.primary,
    letterSpacing: 1,
  },
  scalloped: {
    height: 16,
    backgroundColor: '#00C06A',
    position: 'relative',
  },
  scallopedInner: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 16,
    backgroundColor: Colors.background.secondary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E5E7EB',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    zIndex: 1,
    position: 'relative',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary[600],
  },
  tabText: {
    fontSize: 15,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.primary[600],
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  exclusiveBadgeIcon: {
    width: 24,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  exclusiveTabBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
  },
  exclusiveTabBadgeText: {
    color: 'white',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  exclusiveBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#000',
    paddingHorizontal: 4,
    paddingVertical: 2,
    zIndex: 2,
    borderRadius: 0,
    borderBottomRightRadius: 4,
  },
  unlimitedText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionAndFiltersWrapper: {
    backgroundColor: Colors.background.secondary,
    zIndex: 2,
    position: 'relative',
    paddingTop: 0,
    paddingBottom: 0,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text.primary,
    letterSpacing: -0.3,
    marginBottom: 0,
  },
  filtersContainer: {
    maxHeight: 44,
    marginBottom: 2,
    marginTop: 0,
  },
  filtersContent: {
    paddingLeft: 16,
    paddingRight: 32,
    paddingVertical: 6,
    gap: 6,
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    marginRight: 6,
    minHeight: 26,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  filterPillActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 192, 106, 0.25)',
      },
    }),
  },
  filterPillText: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  filterPillTextActive: {
    color: Colors.text.white,
    fontWeight: '700',
  },
  offersList: {
    paddingTop: 12,
    paddingBottom: 100,
    gap: 0,
    backgroundColor: Colors.background.secondary,
  },
  offerCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 192, 106, 0.1)',
      },
    }),
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: Colors.background.primary,
    marginRight: 12,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border.medium,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary[600],
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 4px rgba(0, 192, 106, 0.08)',
      },
    }),
  },
  unlimitedBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#000',
    paddingHorizontal: 3,
    paddingVertical: 1,
    zIndex: 1,
    borderRadius: 0,
  },
  storeLogo: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background.primary,
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  logoPlaceholderText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: 1,
  },
  offerInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: 0,
    minWidth: 0,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 6,
    lineHeight: 22,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  offerDescription: {
    fontSize: 13,
    color: Colors.primary[600],
    marginBottom: 10,
    lineHeight: 18,
    fontWeight: '600',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  deliveryInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  freeBadge: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary[600],
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0, 192, 106, 0.2)',
      },
    }),
  },
  freeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  deliveryFeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.background.tertiary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deliveryFee: {
    fontSize: 11,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  deliveryTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background.tertiary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deliveryTime: {
    fontSize: 11,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warning[50] || '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rating: {
    fontSize: 11,
    color: Colors.warning[700] || '#92400E',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
    backgroundColor: '#FAFBFC',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
    backgroundColor: '#FAFBFC',
  },
  emptyIllustration: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Quick Offer Categories Styles
  quickOfferCategories: {
    paddingVertical: 12,
    backgroundColor: Colors.background.secondary,
  },
  quickOfferScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  quickOfferChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    marginRight: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  quickOfferText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  // Exclusive Zones Styles
  exclusiveZones: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.background.secondary,
  },
  zonesTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  zonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  zoneCard: {
    width: (width - 56) / 4,
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  zoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  zoneText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
});
