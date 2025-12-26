import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  TextInput,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import explore components
import UGCPostsFeed from './explore/components/UGCPostsFeed';
import VerifiedReviews from './explore/components/VerifiedReviews';
import SmartPicks from './explore/components/SmartPicks';
import FriendsCommunity from './explore/components/FriendsCommunity';
import PlayEarn from './explore/components/PlayEarn';
import CompareDecide from './explore/components/CompareDecide';
import HotRightNow from './explore/components/HotRightNow';
import LiveStatsStrip from './explore/components/LiveStatsStrip';
import ExclusiveOffers from './explore/components/ExclusiveOffers';
import EarnLikeThem from './explore/components/EarnLikeThem';
import StoresNearYou from './explore/components/StoresNearYou';

const { width } = Dimensions.get('window');

// Mock data for UGC Reels
const ugcReels = [
  {
    id: 1,
    user: { name: 'Priya S.', avatar: 'https://i.pravatar.cc/100?img=1' },
    store: 'Starbucks',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    product: 'Cappuccino & Croissant',
    saved: 120,
    likes: 234,
    comments: 45,
  },
  {
    id: 2,
    user: { name: 'Rahul K.', avatar: 'https://i.pravatar.cc/100?img=2' },
    store: 'Nike Store',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    product: 'Air Max 90',
    saved: 2000,
    likes: 456,
    comments: 89,
  },
  {
    id: 3,
    user: { name: 'Sneha M.', avatar: 'https://i.pravatar.cc/100?img=3' },
    store: 'Paradise Biryani',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    product: 'Chicken Biryani',
    saved: 150,
    likes: 312,
    comments: 67,
  },
];

// Category filter data
const categoryFilters = [
  { id: 'all', label: 'All', emoji: '🌍', active: true },
  { id: 'halal', label: 'Halal', emoji: '☪️', active: false },
  { id: 'vegan', label: 'Vegan', emoji: '🌱', active: false },
  { id: 'veg', label: 'Veg', emoji: '🥗', active: false },
  { id: 'adult', label: 'Adult', emoji: '🔞', active: false },
  { id: 'occasion', label: 'Occasion', emoji: '🎉', active: false },
];

// Quick discovery chips
const quickChips = [
  { id: 'trending', label: 'Trending Near You', icon: 'flame', color: '#F97316' },
  { id: 'delivery', label: '60 Min Delivery', icon: 'time', color: '#3B82F6' },
];

// Search placeholder suggestions
const searchSuggestions = [
  'Halal biryani under ₹500',
  'Best sneakers under ₹2,000',
  'Hair spa with cashback',
  'Coffee shops nearby',
];


const ExplorePage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedChip, setSelectedChip] = useState('trending');
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Rotate placeholder
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % searchSuggestions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const rezCoins = 1970;

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          {/* Location & Actions Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.locationButton}>
              <Ionicons name="location" size={18} color="#00C06A" />
              <View style={styles.locationText}>
                <Text style={styles.locationTitle} numberOfLines={1}>
                  BTM Layout, Bangal...
                </Text>
                <Text style={styles.locationSubtitle}>Within 3 km</Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="#6B7280" />
            </TouchableOpacity>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => navigateTo('/explore/map')}
              >
                <Ionicons name="map" size={22} color="#0B2240" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.coinsButton}
                onPress={() => navigateTo('/wallet')}
              >
                <View style={styles.coinIcon}>
                  <Text style={styles.coinEmoji}>🪙</Text>
                </View>
                <Text style={styles.coinsText}>{rezCoins.toLocaleString()}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder={searchSuggestions[currentPlaceholder]}
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options" size={22} color="#0B2240" />
            </TouchableOpacity>
          </View>

          {/* Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContainer}
          >
            {categoryFilters.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategory === category.id && styles.categoryLabelActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Best Value Tag */}
            <View style={styles.bestValueTag}>
              <Ionicons name="trending-up" size={14} color="#FFFFFF" />
              <Text style={styles.bestValueText}>Best Value</Text>
            </View>
          </ScrollView>

          {/* Quick Discovery Chips */}
          <View style={styles.quickChipsRow}>
            {quickChips.map((chip) => (
              <TouchableOpacity
                key={chip.id}
                style={[
                  styles.quickChip,
                  selectedChip === chip.id && styles.quickChipActive,
                ]}
                onPress={() => setSelectedChip(chip.id)}
              >
                <Ionicons
                  name={chip.icon as any}
                  size={16}
                  color={selectedChip === chip.id ? chip.color : '#6B7280'}
                />
                <Text
                  style={[
                    styles.quickChipText,
                    selectedChip === chip.id && { color: '#0B2240', fontWeight: '600' },
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trending Near You Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Trending Near You</Text>
                <Text style={styles.fireEmoji}>🔥</Text>
              </View>
              <Text style={styles.sectionSubtitle}>Real experiences • Real savings</Text>
            </View>
          </View>

          {/* UGC Reels Grid */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reelsContainer}
          >
            {ugcReels.map((reel) => (
              <TouchableOpacity
                key={reel.id}
                style={styles.reelCard}
                onPress={() => navigateTo(`/explore/reel/${reel.id}`)}
              >
                <Image source={{ uri: reel.image }} style={styles.reelImage} />

                {/* User Badge */}
                <View style={styles.reelUserBadge}>
                  <Image source={{ uri: reel.user.avatar }} style={styles.reelAvatar} />
                  <Text style={styles.reelUserName}>{reel.user.name}</Text>
                </View>

                {/* Play Button Overlay */}
                <View style={styles.playButtonOverlay}>
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={24} color="#FFFFFF" />
                  </View>
                </View>

                {/* Bottom Gradient */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.reelGradient}
                >
                  <Text style={styles.reelProduct}>{reel.product}</Text>
                  <View style={styles.reelStoreRow}>
                    <Ionicons name="storefront" size={12} color="#FFFFFF" />
                    <Text style={styles.reelStore}>{reel.store}</Text>
                  </View>

                  {/* Saved Badge */}
                  <View style={styles.savedBadge}>
                    <Ionicons name="pricetag" size={12} color="#FFFFFF" />
                    <Text style={styles.savedText}>Saved ₹{reel.saved}</Text>
                  </View>

                  {/* Stats Row */}
                  <View style={styles.reelStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="heart-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.statText}>{reel.likes}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="chatbubble-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.statText}>{reel.comments}</Text>
                    </View>
                    <TouchableOpacity style={styles.bookmarkButton}>
                      <Ionicons name="bookmark-outline" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* View All Reels */}
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={() => navigateTo('/explore/reels')}>
              <Text style={styles.viewAllLink}>View All Reels</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* What's Hot Near You Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What's Hot Near You</Text>
            <TouchableOpacity onPress={() => navigateTo('/explore/hot')}>
              <Text style={styles.viewAllText}>View all →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.hotGrid}>
            {[
              {
                id: 1,
                name: 'Nike Air Max 90',
                store: 'Nike Store',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
                offer: '20% Cashback',
                distance: '1.2 km',
                price: 6999,
              },
              {
                id: 2,
                name: 'Chicken Biryani',
                store: 'Paradise Biryani',
                image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300',
                offer: 'Flat ₹100 Off',
                distance: '800 m',
                price: 350,
              },
              {
                id: 3,
                name: 'Hair Spa',
                store: 'Wellness Studio',
                image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300',
                offer: '25% Cashback',
                distance: '2.1 km',
                price: 1499,
              },
              {
                id: 4,
                name: 'Coffee & Snacks',
                store: 'Cafe Noir',
                image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300',
                offer: 'Buy 1 Get 1',
                distance: '500 m',
                price: 299,
              },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.hotCard}
                onPress={() => navigateTo(`/MainStorePage?id=${item.id}`)}
              >
                <Image source={{ uri: item.image }} style={styles.hotImage} />
                <View style={styles.offerBadge}>
                  <Text style={styles.offerText}>{item.offer}</Text>
                </View>
                <View style={styles.hotContent}>
                  <Text style={styles.hotName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.hotStore}>{item.store}</Text>
                  <View style={styles.hotFooter}>
                    <Text style={styles.hotPrice}>₹{item.price}</Text>
                    <View style={styles.distanceBadge}>
                      <Ionicons name="location" size={10} color="#6B7280" />
                      <Text style={styles.distanceText}>{item.distance}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Shop by Category */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => navigateTo('/(tabs)/categories')}>
              <Text style={styles.viewAllText}>View all →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoryGrid}>
            {[
              { id: 'food', name: 'Food & Dining', emoji: '🍔', cashback: '12%', stores: 234 },
              { id: 'fashion', name: 'Fashion', emoji: '🛍️', cashback: '15%', stores: 156 },
              { id: 'electronics', name: 'Electronics', emoji: '📱', cashback: '8%', stores: 89 },
              { id: 'beauty', name: 'Beauty', emoji: '💄', cashback: '18%', stores: 178 },
              { id: 'grocery', name: 'Grocery', emoji: '🛒', cashback: '5%', stores: 312 },
              { id: 'fitness', name: 'Fitness', emoji: '🏋️', cashback: '20%', stores: 67 },
            ].map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() => navigateTo(`/explore/category/${cat.id}`)}
              >
                <Text style={styles.categoryCardEmoji}>{cat.emoji}</Text>
                <Text style={styles.categoryCardName}>{cat.name}</Text>
                <Text style={styles.categoryCardCashback}>Up to {cat.cashback}</Text>
                <Text style={styles.categoryCardStores}>{cat.stores} stores</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trending Stores */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Stores</Text>
            <TouchableOpacity onPress={() => navigateTo('/explore/stores')}>
              <Text style={styles.viewAllText}>View all →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storesContainer}
          >
            {[
              { id: 1, name: 'Paradise Biryani', offer: '20% Cashback', distance: '0.8 km', activity: '12 people earned today', badge: 'Hot Deal', badgeColor: '#F97316' },
              { id: 2, name: 'Nike Store', offer: '15% + Bonus', distance: '1.2 km', activity: '8 people shopping', badge: 'Trending', badgeColor: '#EF4444' },
              { id: 3, name: 'Wellness Spa', offer: '25% Cashback', distance: '2.1 km', activity: '5 people booked', badge: 'High Cashback', badgeColor: '#10B981' },
            ].map((store) => (
              <TouchableOpacity
                key={store.id}
                style={styles.storeCard}
                onPress={() => navigateTo(`/MainStorePage?id=${store.id}`)}
              >
                <View style={styles.storeHeader}>
                  <View style={styles.storeLogo}>
                    <Text style={styles.storeLogoText}>{store.name.charAt(0)}</Text>
                  </View>
                  <View style={[styles.storeBadge, { backgroundColor: store.badgeColor }]}>
                    <Text style={styles.storeBadgeText}>{store.badge}</Text>
                  </View>
                </View>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeOffer}>{store.offer}</Text>
                <View style={styles.storeFooter}>
                  <View style={styles.storeDistance}>
                    <Ionicons name="location" size={12} color="#6B7280" />
                    <Text style={styles.storeDistanceText}>{store.distance}</Text>
                  </View>
                  <View style={styles.storeActivity}>
                    <View style={styles.activityDot} />
                    <Text style={styles.activityText}>{store.activity}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.payNowButton}>
                  <Text style={styles.payNowText}>Pay Now</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Live Stats Strip */}
        <LiveStatsStrip />

        {/* Hot Right Now */}
        <HotRightNow />

        {/* Exclusive Offers Banner */}
        <ExclusiveOffers />

        {/* People Are Saving Here - UGC Posts Feed */}
        <UGCPostsFeed />

        {/* Verified Reviews */}
        <VerifiedReviews />

        {/* Smart Picks by ReZ */}
        <SmartPicks />

        {/* Compare & Decide */}
        <CompareDecide />

        {/* Friends & Community */}
        <FriendsCommunity />

        {/* Stores Near You */}
        <StoresNearYou />

        {/* Play & Earn */}
        <PlayEarn />

        {/* Earn Like Them - 4 Steps */}
        <EarnLikeThem />

        {/* Bottom Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Map View Button */}
      <TouchableOpacity
        style={styles.floatingMapButton}
        onPress={() => navigateTo('/explore/map')}
      >
        <LinearGradient
          colors={['#00C06A', '#10B981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.floatingMapGradient}
        >
          <Ionicons name="map" size={16} color="#FFFFFF" />
          <Text style={styles.floatingMapText}>Map View</Text>
        </LinearGradient>
      </TouchableOpacity>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: width * 0.5,
  },
  locationText: {
    marginHorizontal: 8,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
  },
  locationSubtitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  coinIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinEmoji: {
    fontSize: 14,
  },
  coinsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#0B2240',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryScroll: {
    marginTop: 12,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#00C06A',
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: '#00C06A',
    fontWeight: '600',
  },
  bestValueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  bestValueText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickChipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 10,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  quickChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0B2240',
  },
  quickChipText: {
    fontSize: 13,
    color: '#6B7280',
  },
  section: {
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
  },
  fireEmoji: {
    fontSize: 18,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 13,
    color: '#00C06A',
    fontWeight: '600',
  },
  reelsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  reelCard: {
    width: 180,
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  reelImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  reelUserBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  reelAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  reelUserName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    paddingTop: 40,
  },
  reelProduct: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reelStoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  reelStore: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C06A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
    gap: 4,
  },
  savedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reelStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  bookmarkButton: {
    marginLeft: 'auto',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  viewAllLink: {
    fontSize: 14,
    color: '#00C06A',
    fontWeight: '600',
  },
  mapViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C06A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  mapViewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  hotCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hotImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#F3F4F6',
  },
  offerBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#00C06A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  offerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hotContent: {
    padding: 10,
  },
  hotName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B2240',
  },
  hotStore: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  hotFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  hotPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2240',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    fontSize: 10,
    color: '#6B7280',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryCard: {
    width: (width - 52) / 3,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  categoryCardEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  categoryCardName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0B2240',
    textAlign: 'center',
  },
  categoryCardCashback: {
    fontSize: 10,
    color: '#00C06A',
    fontWeight: '600',
    marginTop: 4,
  },
  categoryCardStores: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 2,
  },
  storesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  storeCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  storeLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeLogoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00C06A',
  },
  storeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  storeBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
  },
  storeOffer: {
    fontSize: 12,
    color: '#00C06A',
    fontWeight: '600',
    marginTop: 4,
  },
  storeFooter: {
    marginTop: 10,
  },
  storeDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeDistanceText: {
    fontSize: 11,
    color: '#6B7280',
  },
  storeActivity: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00C06A',
  },
  activityText: {
    fontSize: 10,
    color: '#6B7280',
  },
  payNowButton: {
    backgroundColor: '#0B2240',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  payNowText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  floatingMapButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingMapGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  floatingMapText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ExplorePage;
