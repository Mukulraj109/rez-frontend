import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHomepage, useHomepageNavigation } from '@/hooks/useHomepage';
import { LinearGradient } from 'expo-linear-gradient';
import { useProfile, useProfileMenu } from '@/contexts/ProfileContext';
import ProfileMenuModal from '@/components/profile/ProfileMenuModal';
import { profileMenuSections } from '@/data/profileData';
import { useRouter } from 'expo-router';
import deal from '@/assets/images/deal.png';
import { Image } from 'react-native';

// Store category images
const storeImages = {
  fastDelivery: require('@/assets/images/stores/fast-delivery.png'),
  budgetFriendly: require('@/assets/images/stores/one-rupee-store.png'),
  ninetyNineStore: require('@/assets/images/stores/cash-store.png'),
  premium: require('@/assets/images/stores/luxury-store.png'),
  alliance: require('@/assets/images/stores/alliance-store.png'),
  organic: require('@/assets/images/stores/organic.png'),
  lowestPrice: require('@/assets/images/stores/lowest-price.png'),
  cashStore: require('@/assets/images/stores/cash-store.png'),
  rezMall: require('@/assets/images/tabs/rez-mall.png'),
};
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { LocationDisplay } from '@/components/location';
import { storeSearchService, StoreCategory } from '@/services/storeSearchService';
import walletApi from '@/services/walletApi';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');
const CARD_GAP = 14;
const H_PADDING = 18;
const CARD_WIDTH = (width - H_PADDING * 2 - CARD_GAP) / 2;

type Store = {
  id: string;
  title: string;
  accent?: string;
  icon?: string;
  image?: any; // Store category image
  gradient?: readonly string[];
  badge?: string;
  description?: string;
  count?: number;
};

// Fallback categories in case API fails
const FALLBACK_STORES: Store[] = [
  {
    id: 'fastDelivery',
    title: '30 min delivery',
    accent: '#00C06A',
    icon: 'flash',
    image: storeImages.fastDelivery,
    gradient: ['#00C06A', '#00796B'] as const,
    badge: '30 min',
    description: 'Lightning fast delivery'
  },
  {
    id: 'budgetFriendly',
    title: '1 rupees store',
    accent: '#00A05A',
    icon: 'cash',
    image: storeImages.budgetFriendly,
    gradient: ['#00A05A', '#00C06A'] as const,
    badge: '₹1',
    description: 'Everything at ₹1'
  },
  {
    id: 'ninetyNineStore',
    title: '99 Rupees store',
    accent: '#00796B',
    icon: 'wallet',
    image: storeImages.ninetyNineStore,
    gradient: ['#00796B', '#00C06A'] as const,
    badge: '₹99',
    description: 'Budget friendly shopping'
  },
  {
    id: 'premium',
    title: 'Luxury store',
    accent: '#FFC857',
    icon: 'diamond',
    image: storeImages.premium,
    gradient: ['#FFC857', '#FFD97D'] as const,
    badge: 'Premium',
    description: 'Luxury & premium brands'
  },
  {
    id: 'alliance',
    title: 'Alliance Store',
    accent: '#00C06A',
    icon: 'people',
    image: storeImages.alliance,
    gradient: ['#00C06A', '#00A05A'] as const,
    badge: 'Partner',
    description: 'Partner stores network'
  },
  {
    id: 'organic',
    title: 'Organic Store',
    accent: '#34D399',
    icon: 'leaf',
    image: storeImages.organic,
    gradient: ['#34D399', '#10B981'] as const,
    badge: 'Organic',
    description: 'Natural & organic products'
  },
  {
    id: 'lowestPrice',
    title: 'Lowest Price',
    accent: '#22D3EE',
    icon: 'trending-down',
    image: storeImages.lowestPrice,
    gradient: ['#22D3EE', '#06B6D4'] as const,
    badge: 'Best Price',
    description: 'Guaranteed lowest prices'
  },
  {
    id: 'mall',
    title: 'Rez Mall',
    accent: '#60A5FA',
    icon: 'storefront',
    image: storeImages.rezMall,
    gradient: ['#60A5FA', '#3B82F6'] as const,
    badge: 'Mall',
    description: 'Complete shopping experience'
  },
  {
    id: 'cashStore',
    title: 'Cash Store',
    accent: '#00C06A',
    icon: 'card',
    image: storeImages.cashStore,
    gradient: ['#00C06A', '#00796B'] as const,
    badge: 'Cash',
    description: 'Cashback & rewards'
  },
];

// Helper function to map backend categories to UI properties
const mapCategoryToStore = (category: StoreCategory): Store => {
  // Get the display info from the service
  const displayInfo = storeSearchService.getCategoryDisplayInfo(category.id);

  // Map icon string to Ionicons name
  const iconMap: { [key: string]: string } = {
    '🚀': 'flash',
    '💰': 'cash',
    '💳': 'wallet',
    '👑': 'diamond',
    '🤝': 'people',
    '🌱': 'leaf',
    '💸': 'trending-down',
    '🏬': 'storefront',
    '💵': 'card',
  };

  // Map category ID to image
  const imageMap: { [key: string]: any } = {
    'fastDelivery': storeImages.fastDelivery,
    'budgetFriendly': storeImages.budgetFriendly,
    'ninetyNineStore': storeImages.ninetyNineStore,
    'premium': storeImages.premium,
    'alliance': storeImages.alliance,
    'organic': storeImages.organic,
    'lowestPrice': storeImages.lowestPrice,
    'cashStore': storeImages.cashStore,
    'mall': storeImages.rezMall,
  };

  // Get gradient colors based on the category color
  const baseColor = displayInfo.color;
  const gradient: readonly string[] = [baseColor, baseColor] as const;

  // Extract badge from category name
  const badgeMap: { [key: string]: string } = {
    'fastDelivery': '30 min',
    'budgetFriendly': '₹1',
    'ninetyNineStore': '₹99',
    'premium': 'Premium',
    'alliance': 'Partner',
    'organic': 'Organic',
    'lowestPrice': 'Best Price',
    'mall': 'Mall',
    'cashStore': 'Cash',
  };

  return {
    id: category.id,
    title: displayInfo.name,
    accent: displayInfo.color,
    icon: iconMap[displayInfo.icon] || 'storefront',
    image: imageMap[category.id],
    gradient,
    badge: badgeMap[category.id] || '',
    description: category.description,
    count: category.count,
  };
};


function ModernCardIllustration({
  icon,
  image,
  gradient = ['#00C06A', '#00796B'] as const,
  badge
}: {
  icon?: string;
  image?: any;
  gradient?: readonly string[];
  badge?: string;
}) {
  return (
    <View style={styles.illustrationContainer}>
      {/* Gradient Background */}
      <LinearGradient
        colors={gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        {/* Badge */}
        {badge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}

        {/* Show Image if available, otherwise show Icon */}
        {image ? (
          <Image
            source={image}
            style={styles.categoryImage}
            resizeMode="contain"
          />
        ) : icon ? (
          <View style={styles.iconContainer}>
            <Ionicons name={icon as any} size={32} color="white" />
          </View>
        ) : null}

        {/* Decorative Elements - only show if no image */}
        {!image && <View style={styles.decorativeCircle1} />}
        {!image && <View style={styles.decorativeCircle2} />}
      </LinearGradient>
    </View>
  );
}


function StoreCard({ item }: { item: Store }) {
  const router = useRouter();

  const handleStorePress = async () => {
    const category = item.id; // Use the category ID directly from the backend

    // Note: Skip analytics tracking for category pages since they don't relate to a specific store
    // Category-level analytics should be tracked separately through a dedicated endpoint
    // or when user interacts with actual stores within the category

    router.push({
      pathname: '/StoreListPage' as any,
      params: {
        category,
        title: item.title,
      },
    });
  };
  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={handleStorePress}
      accessibilityLabel={`${item.title} store category`}
      accessibilityRole="button"
      accessibilityHint={`Double tap to browse ${item.title} stores. ${item.description || ''}`}
    >
      <View style={styles.cardIllustration}>
        <ModernCardIllustration
          icon={item.icon}
          image={item.image}
          gradient={item.gradient}
          badge={item.badge}
        />
      </View>
      
      <View style={styles.cardContent}>
        <Text numberOfLines={1} allowFontScaling={false} style={styles.cardTitle}>
          {item.title}
        </Text>
        {item.description && (
          <Text numberOfLines={2} allowFontScaling={false} style={styles.cardDescription}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function App() {
  const router = useRouter();
  const { user, isModalVisible, showModal, hideModal } = useProfile();
  const { handleMenuItemPress } = useProfileMenu();
  const { state: authState } = useAuth();
  const [showLocationDropdown, setShowLocationDropdown] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categories, setCategories] = useState<Store[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);

  // Load wallet balance - matching Homepage approach
  useEffect(() => {
    const loadWalletBalance = async () => {
      if (!authState.isAuthenticated) {
        setIsLoadingPoints(false);
        return;
      }

      try {
        setIsLoadingPoints(true);
        const walletResponse = await walletApi.getBalance();

        // ✅ FIX: Add comprehensive null/undefined checks for wallet data
        if (walletResponse?.success && walletResponse?.data && Array.isArray(walletResponse.data.coins)) {
          const rezCoin = walletResponse.data.coins.find((c: any) => c?.type === 'rez');
          const actualWalletCoins = typeof rezCoin?.amount === 'number' && !isNaN(rezCoin.amount)
            ? rezCoin.amount
            : 0;
          setUserPoints(actualWalletCoins);
        } else {
          setUserPoints(0);
        }
      } catch (error) {
        console.error('❌ [STORE] Error loading wallet balance:', error);
        setUserPoints(0);
      } finally {
        setIsLoadingPoints(false);
      }
    };

    loadWalletBalance();
  }, [authState.isAuthenticated]);

  // Fetch categories from backend on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        setCategoriesError(null);
        const response = await storeSearchService.getStoreCategories();

        if (response.success && response.data.categories) {
          // Map backend categories to UI store format
          const mappedCategories = response.data.categories.map(mapCategoryToStore);
          setCategories(mappedCategories);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        setCategoriesError('Failed to load categories');
        // Use fallback categories if API fails
        setCategories(FALLBACK_STORES);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleLocationDropdownToggle = () => {
    setShowLocationDropdown(!showLocationDropdown);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/StoreListPage' as any,
        params: {
          search: searchQuery.trim(),
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      {/* Header with gradient - Fixed at top */}
      <LinearGradient
        colors={['#00C06A', '#00796B'] as const}
        style={styles.header}
      >
        {/* Top section */}
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.locationContainer}
            onPress={handleLocationDropdownToggle}
            activeOpacity={0.7}
            accessibilityLabel="Current location"
            accessibilityRole="button"
            accessibilityHint={showLocationDropdown ? "Double tap to collapse location details" : "Double tap to expand location details"}
            accessibilityState={{ expanded: showLocationDropdown }}
          >
            <LocationDisplay
              compact={!showLocationDropdown}
              showCoordinates={false}
              showLastUpdated={false}
              showRefreshButton={false}
              style={styles.locationDisplay}
              textStyle={styles.locationText}
            />
            <Ionicons
              name={showLocationDropdown ? "chevron-up" : "chevron-down"}
              size={16}
              color="white"
            />
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.coinsContainer}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  setTimeout(() => router.push('/CoinPage'), 50);
                } else {
                  router.push('/CoinPage');
                }
              }}
              activeOpacity={Platform.OS === 'ios' ? 0.6 : 0.7}
              delayPressIn={Platform.OS === 'ios' ? 50 : 0}
              accessibilityLabel={`Loyalty points: ${isLoadingPoints ? 'Loading' : (typeof userPoints === 'number' ? userPoints.toLocaleString() : '0')}`}
              accessibilityRole="button"
              accessibilityHint="Double tap to view your loyalty points and rewards"
            >
              <Ionicons name="star" size={16} color="#FFD700" />
              <ThemedText allowFontScaling={false} style={styles.coinsText}>
                {/* ✅ FIX: Add type check for userPoints before formatting */}
                {isLoadingPoints ? '...' : (typeof userPoints === 'number' ? userPoints.toLocaleString() : '0')}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === 'ios') {
                  setTimeout(() => router.push('/CartPage'), 50);
                } else {
                  router.push('/CartPage');
                }
              }}
              activeOpacity={Platform.OS === 'ios' ? 0.6 : 0.7}
              delayPressIn={Platform.OS === 'ios' ? 50 : 0}
              accessibilityLabel="Shopping cart"
              accessibilityRole="button"
              accessibilityHint="Double tap to view your shopping cart"
            >
              <Ionicons name="cart-outline" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
                        style={styles.profileAvatar}
                        onPress={() => {
                          if (Platform.OS === 'ios') {
                            setTimeout(() => showModal(), 50);
                          } else {
                            showModal();
                          }
                        }}
                        activeOpacity={Platform.OS === 'ios' ? 0.6 : 0.7}
                        delayPressIn={Platform.OS === 'ios' ? 50 : 0}
                        accessibilityLabel="User profile menu"
                        accessibilityRole="button"
                        accessibilityHint="Double tap to open profile menu and account settings"
                      >
                        <ThemedText style={styles.profileText}>
                          {user?.initials || 'R'}
                        </ThemedText>
                      </TouchableOpacity>
          </View>
        </View>

        {/* Search Row */}
        <View style={styles.searchRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Double tap to go back to the previous screen"
          >
            <Ionicons name="chevron-back" size={18} color="#00C06A" />
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#8B8B97" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for the service"
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              allowFontScaling={false}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
            />
            <Ionicons name="mic-outline" size={18} color="#8B8B97" />
          </View>

        </View>

      </LinearGradient>

      {/* Scrollable Grid */}
      <FlatList
        data={categories}
        keyExtractor={(it) => it.id}
        numColumns={2}
        columnWrapperStyle={{ gap: CARD_GAP }}
        renderItem={({ item }) => <StoreCard item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        ListHeaderComponent={
          <>
            {isLoadingCategories ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00C06A" />
                <Text style={styles.loadingText}>Loading categories...</Text>
              </View>
            ) : categoriesError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {categoriesError}</Text>
                <Text style={styles.errorSubtext}>Showing default categories</Text>
              </View>
            ) : null}
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    paddingTop: 50,
    paddingHorizontal: 18, // slightly reduced to avoid compounding width
    paddingBottom: 20,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },

  locationDisplay: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    padding: 0,
    margin: 0,
    flex: 1,
  },

  locationText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 12.5,
    lineHeight: 16,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
  },

  coinsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Search row fixes
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchContainer: {
    flex: 1,
    minWidth: 0,              // critical to allow shrinking
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 26,
    paddingHorizontal: 12,    // smaller padding to prevent overflow
    height: 40,
  },

  searchIcon: { marginRight: 8 },

  searchInput: {
    flex: 1,
    minWidth: 0,              // critical inside row
    color: '#111827',
    fontSize: 14,
    paddingVertical: 0,
  },

  // Grid & cards
  flatListContent: {
    paddingHorizontal: H_PADDING,
    paddingTop: 16,
    paddingBottom: 100, // Add bottom padding to prevent content being hidden by navigation bar
    gap: CARD_GAP,
  },

  gridWrap: {
    paddingHorizontal: H_PADDING,
    paddingTop: 16,
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },

  cardIllustration: {
    alignItems: 'center',
    marginBottom: 12,
  },

  cardContent: {
    alignItems: 'center',
  },

  cardTitle: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },

  cardDescription: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },

  // Modern Illustration Styles
  illustrationContainer: {
    width: CARD_WIDTH - 32,
    height: 90,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },

  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  badgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backdropFilter: 'blur(10px)',
  },

  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  categoryImage: {
    width: 70,
    height: 70,
  },

  decorativeCircle1: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  decorativeCircle2: {
    position: 'absolute',
    bottom: -5,
    left: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Brand promo pieces (kept for reuse if you add the banner back)
  brandIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00C06A',
  },

  // Loading and error states
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#78350F',
    fontWeight: '400',
  },


});
