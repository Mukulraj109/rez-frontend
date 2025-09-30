import React from 'react';
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
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { LocationDisplay } from '@/components/location';

const { width } = Dimensions.get('window');
const CARD_GAP = 14;
const H_PADDING = 18;
const CARD_WIDTH = (width - H_PADDING * 2 - CARD_GAP) / 2;

type Store = {
  id: string;
  title: string;
  accent?: string;
  icon?: string;
  gradient?: string[];
  badge?: string;
  description?: string;
};

const STORES: Store[] = [
  { 
    id: 's1', 
    title: '30 min delivery', 
    accent: '#7B61FF',
    icon: 'flash',
    gradient: ['#7B61FF', '#A855F7'],
    badge: '30 min',
    description: 'Lightning fast delivery'
  },
  { 
    id: 's2', 
    title: '1 rupees store', 
    accent: '#6E56CF',
    icon: 'cash',
    gradient: ['#6E56CF', '#8B5CF6'],
    badge: '₹1',
    description: 'Everything at ₹1'
  },
  { 
    id: 's3', 
    title: '99 Rupees store', 
    accent: '#6A5ACD',
    icon: 'wallet',
    gradient: ['#6A5ACD', '#7C3AED'],
    badge: '₹99',
    description: 'Budget friendly shopping'
  },
  { 
    id: 's4', 
    title: 'Luxury store', 
    accent: '#A78BFA',
    icon: 'diamond',
    gradient: ['#A78BFA', '#C084FC'],
    badge: 'Premium',
    description: 'Luxury & premium brands'
  },
  { 
    id: 's6', 
    title: 'Alliance Store', 
    accent: '#9F7AEA',
    icon: 'people',
    gradient: ['#9F7AEA', '#A855F7'],
    badge: 'Partner',
    description: 'Partner stores network'
  },
  { 
    id: 's8', 
    title: 'Organic Store', 
    accent: '#34D399',
    icon: 'leaf',
    gradient: ['#34D399', '#10B981'],
    badge: 'Organic',
    description: 'Natural & organic products'
  },
  { 
    id: 's9', 
    title: 'Lowest Price', 
    accent: '#22D3EE',
    icon: 'trending-down',
    gradient: ['#22D3EE', '#06B6D4'],
    badge: 'Best Price',
    description: 'Guaranteed lowest prices'
  },
  { 
    id: 's11', 
    title: 'Rez Mall', 
    accent: '#60A5FA',
    icon: 'storefront',
    gradient: ['#60A5FA', '#3B82F6'],
    badge: 'Mall',
    description: 'Complete shopping experience'
  },
  { 
    id: 's12', 
    title: 'Cash Store', 
    accent: '#8B5CF6',
    icon: 'card',
    gradient: ['#8B5CF6', '#7C3AED'],
    badge: 'Cash',
    description: 'Cashback & rewards'
  },
];


function ModernCardIllustration({ 
  icon, 
  gradient = ['#8B5CF6', '#A855F7'],
  badge 
}: { 
  icon?: string;
  gradient?: string[];
  badge?: string;
}) {
  return (
    <View style={styles.illustrationContainer}>
      {/* Gradient Background */}
      <LinearGradient
        colors={gradient}
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
        
        {/* Icon */}
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon as any} size={32} color="white" />
          </View>
        )}
        
        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </LinearGradient>
    </View>
  );
}


function StoreCard({ item }: { item: Store }) {
  const router = useRouter();
  
  // Map store IDs to delivery category names
  const getCategoryFromId = (id: string): string => {
    const categoryMap: { [key: string]: string } = {
      's1': 'fastDelivery',      // 30 min delivery
      's2': 'budgetFriendly',    // 1 rupees store (matches database)
      's3': 'ninetyNineStore',   // 99 Rupees store
      's4': 'premium',           // Luxury store
      's6': 'alliance',          // Alliance Store
      's8': 'organic',           // Organic Store
      's9': 'lowestPrice',       // Lowest Price
      's11': 'mall',             // Rez Mall
      's12': 'cashStore',        // Cash Store
    };
    return categoryMap[id] || 'fastDelivery';
  };

  const handleStorePress = () => {
    const category = getCategoryFromId(item.id);
    router.push({
      pathname: '/StoreSearch' as any,
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
    >
      <View style={styles.cardIllustration}>
        <ModernCardIllustration 
          icon={item.icon}
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
  const [showLocationDropdown, setShowLocationDropdown] = React.useState(false);

  const handleLocationDropdownToggle = () => {
    setShowLocationDropdown(!showLocationDropdown);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Header with gradient */}
        <LinearGradient
          colors={['#8B5CF6', '#A855F7']}
          style={styles.header}
        >
          {/* Top section */}
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.locationContainer}
              onPress={handleLocationDropdownToggle}
              activeOpacity={0.7}
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
              >
                <Ionicons name="star" size={16} color="#FFD700" />
                <ThemedText allowFontScaling={false} style={styles.coinsText}>382</ThemedText>
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
                        >
                          <ThemedText style={styles.profileText}>
                            {user?.initials || 'R'}
                          </ThemedText>
                        </TouchableOpacity>
            </View>
          </View>

          {/* Search Row */}
          <View style={styles.searchRow}>
            <TouchableOpacity style={styles.backBtn} 
             onPress={() => router.back()}
            activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={18} color="#7C3AED" />
            </TouchableOpacity>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#8B8B97" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for the service"
                placeholderTextColor="#9CA3AF"
                returnKeyType="search"
                allowFontScaling={false}
              />
              <Ionicons name="mic-outline" size={18} color="#8B8B97" />
            </View>
            
          </View>
          
        </LinearGradient>
        
        {/* Grid */}
        <View style={styles.gridWrap}>
          <FlatList
            data={STORES}
            keyExtractor={(it) => it.id}
            numColumns={2}
            columnWrapperStyle={{ gap: CARD_GAP }}
            renderItem={({ item }) => <StoreCard item={item} />}
            scrollEnabled={false}
            contentContainerStyle={{ gap: CARD_GAP }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

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
    backgroundColor: '#7C3AED',
  },


});
