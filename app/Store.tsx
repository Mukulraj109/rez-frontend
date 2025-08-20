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
import Svg, { Rect, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CARD_GAP = 14;
const H_PADDING = 18;
const CARD_WIDTH = (width - H_PADDING * 2 - CARD_GAP) / 2;

type Store = {
  id: string;
  title: string;
  accent?: string;
};

const STORES: Store[] = [
  { id: 's1', title: '30 min delivery', accent: '#7B61FF' },
  { id: 's2', title: '1 rupees store', accent: '#6E56CF' },
  { id: 's3', title: '99 Rupees store', accent: '#6A5ACD' },
  { id: 's4', title: 'Luxury store', accent: '#A78BFA' },
  { id: 's6', title: 'Alliance Store', accent: '#9F7AEA' },
  { id: 's8', title: 'Organic Store', accent: '#34D399' },
  { id: 's9', title: 'Lowest Price', accent: '#22D3EE' },
  { id: 's11', title: 'Rez Mall', accent: '#60A5FA' },
  { id: 's12', title: 'Cash Store', accent: '#8B5CF6' },
];


function Illustration({ color = '#8B5CF6' }: { color?: string }) {
  return (
    <Svg width={CARD_WIDTH - 32} height={80} viewBox="0 0 160 80">
      {/* Background rectangle */}
      <Rect x="0" y="20" width="160" height="60" rx="16" fill={color} opacity={0.1} />

      {/* Big rounded rectangle */}
      <Rect x="8" y="28" width="72" height="44" rx="12" fill={color} opacity={0.25} />

      {/* Medium rectangle */}
      <Rect x="82" y="16" width="52" height="50" rx="10" fill={color} opacity={0.35} />

      {/* Circle with gradient effect */}
      <Circle cx="140" cy="40" r="20" fill={color} opacity={0.5} />

      {/* Decorative small circles */}
      <Circle cx="20" cy="35" r="4" fill={color} opacity={0.7} />
      <Circle cx="60" cy="55" r="6" fill={color} opacity={0.5} />
      <Circle cx="120" cy="30" r="3" fill={color} opacity={0.6} />
    </Svg>
  );
}


function StoreCard({ item }: { item: Store }) {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.card}>
      <View style={styles.cardIllustration}>
        <Illustration color={item.accent} />
      </View>
      <Text numberOfLines={1} allowFontScaling={false} style={styles.cardTitle}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
}

export default function App() {
  const router = useRouter();
    const { user, isModalVisible, showModal, hideModal } = useProfile();
    const { handleMenuItemPress } = useProfileMenu();

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
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color="white" />
              <ThemedText allowFontScaling={false} style={styles.locationText}>
                BTM,Bangalore
              </ThemedText>
              <Ionicons name="chevron-down" size={16} color="white" />
            </View>

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
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
  },

  locationText: { color: '#fff', fontWeight: '600', fontSize: 12.5 },

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
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  cardIllustration: {
    alignItems: 'center',
    marginBottom: 8,
  },

  cardTitle: {
    color: '#332D41',
    fontSize: 13,
    fontWeight: '600',
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
