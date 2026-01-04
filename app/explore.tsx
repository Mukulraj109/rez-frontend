import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';

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

// Import API services
import reelApi from '../services/reelApi';
import exploreApi from '../services/exploreApi';

// Import location context
import { useLocation } from '../contexts/LocationContext';

const { width } = Dimensions.get('window');

// AutoPlay Video Component for Trending Reels
const AutoPlayVideoReel: React.FC<{ uri: string; poster?: string; style?: any }> = ({ uri, poster, style }) => {
  const videoRef = useRef<Video>(null);
  const webVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // For web, create native video element
      const container = document.querySelector(`[data-video-uri="${uri}"]`);
      if (container && !container.querySelector('video')) {
        const video = document.createElement('video');
        video.src = uri;
        video.poster = poster || '';
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('webkit-playsinline', 'true');
        video.style.cssText = 'width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;';
        container.appendChild(video);
        video.play().catch(() => {});
        webVideoRef.current = video;
      }
    }
    return () => {
      if (webVideoRef.current) {
        webVideoRef.current.pause();
        webVideoRef.current.remove();
      }
    };
  }, [uri, poster]);

  if (Platform.OS === 'web') {
    return (
      <View
        style={[{ width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#1a1a1a' }, style]}
        // @ts-ignore
        dataSet={{ videoUri: uri }}
      />
    );
  }

  // For mobile, use expo-av
  return (
    <Video
      ref={videoRef}
      source={{ uri }}
      posterSource={poster ? { uri: poster } : undefined}
      style={[{ width: '100%', height: '100%' }, style]}
      resizeMode={ResizeMode.COVER}
      shouldPlay={true}
      isLooping={true}
      isMuted={true}
      useNativeControls={false}
    />
  );
};

// No fallback data - only real data from backend

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

// Map Ionicon names to emojis for category display
const iconToEmojiMap: { [key: string]: string } = {
  // Food & Dining
  'restaurant-outline': '🍔',
  'restaurant': '🍔',
  'fast-food-outline': '🍔',
  'fast-food': '🍔',
  'cafe-outline': '☕',
  'cafe': '☕',
  'pizza-outline': '🍕',
  'pizza': '🍕',
  // Fashion & Shopping
  'shirt-outline': '👔',
  'shirt': '👔',
  'bag-outline': '👜',
  'bag': '👜',
  'bag-handle-outline': '👜',
  'bag-handle': '👜',
  // Electronics
  'phone-portrait-outline': '📱',
  'phone-portrait': '📱',
  'laptop-outline': '💻',
  'laptop': '💻',
  'calculator-outline': '📱',
  'calculator': '📱',
  'tv-outline': '📺',
  'tv': '📺',
  // Beauty & Personal Care
  'color-palette-outline': '💄',
  'color-palette': '💄',
  'sparkles-outline': '💄',
  'sparkles': '💄',
  'flower-outline': '💐',
  'flower': '💐',
  // Grocery
  'cart-outline': '🛒',
  'cart': '🛒',
  'basket-outline': '🧺',
  'basket': '🧺',
  // Fitness & Sports
  'barbell-outline': '🏋️',
  'barbell': '🏋️',
  'fitness-outline': '🏋️',
  'fitness': '🏋️',
  'bicycle-outline': '🚴',
  'bicycle': '🚴',
  'trophy-outline': '🏆',
  'trophy': '🏆',
  // Home & Services
  'home-outline': '🏠',
  'home': '🏠',
  'construct-outline': '🔧',
  'construct': '🔧',
  'hammer-outline': '🔨',
  'hammer': '🔨',
  'build-outline': '🛠️',
  'build': '🛠️',
  // Weather & Seasonal
  'snow-outline': '❄️',
  'snow': '❄️',
  'sunny-outline': '☀️',
  'sunny': '☀️',
  // Payments & Bills
  'receipt-outline': '🧾',
  'receipt': '🧾',
  'card-outline': '💳',
  'card': '💳',
  'cash-outline': '💵',
  'cash': '💵',
  // Education & Coaching
  'book-outline': '📚',
  'book': '📚',
  'school-outline': '🎓',
  'school': '🎓',
  // Medical & Health
  'medical-outline': '🏥',
  'medical': '🏥',
  'medkit-outline': '💊',
  'medkit': '💊',
  'heart-outline': '❤️',
  'heart': '❤️',
  // Entertainment
  'film-outline': '🎬',
  'film': '🎬',
  'musical-notes-outline': '🎵',
  'musical-notes': '🎵',
  'game-controller-outline': '🎮',
  'game-controller': '🎮',
  // Travel & Transport
  'airplane-outline': '✈️',
  'airplane': '✈️',
  'car-outline': '🚗',
  'car': '🚗',
  'bus-outline': '🚌',
  'bus': '🚌',
  'train-outline': '🚆',
  'train': '🚆',
  // Pets
  'paw-outline': '🐾',
  'paw': '🐾',
  // Default fallbacks by category name keywords
};

// Get emoji from icon name or category name
const getEmojiForCategory = (icon?: string, name?: string): string => {
  // First try to get emoji from icon name
  if (icon && iconToEmojiMap[icon]) {
    return iconToEmojiMap[icon];
  }

  // Fallback: try to match by category name
  const lowerName = (name || '').toLowerCase();
  if (lowerName.includes('food') || lowerName.includes('dining') || lowerName.includes('restaurant')) return '🍔';
  if (lowerName.includes('fashion') || lowerName.includes('cloth')) return '👜';
  if (lowerName.includes('electronic') || lowerName.includes('mobile') || lowerName.includes('phone')) return '📱';
  if (lowerName.includes('beauty') || lowerName.includes('salon') || lowerName.includes('spa')) return '💄';
  if (lowerName.includes('grocery') || lowerName.includes('supermarket')) return '🛒';
  if (lowerName.includes('fitness') || lowerName.includes('gym') || lowerName.includes('sport')) return '🏋️';
  if (lowerName.includes('home') || lowerName.includes('delivery')) return '🏠';
  if (lowerName.includes('service') || lowerName.includes('repair')) return '🔧';
  if (lowerName.includes('ac') || lowerName.includes('cooling')) return '❄️';
  if (lowerName.includes('bill') || lowerName.includes('payment')) return '🧾';
  if (lowerName.includes('coach') || lowerName.includes('education') || lowerName.includes('tutor')) return '📚';
  if (lowerName.includes('health') || lowerName.includes('medical') || lowerName.includes('pharmacy')) return '💊';
  if (lowerName.includes('travel') || lowerName.includes('hotel')) return '✈️';
  if (lowerName.includes('pet')) return '🐾';
  if (lowerName.includes('entertainment') || lowerName.includes('movie')) return '🎬';

  // Default emoji
  return '🏷️';
};


const ExplorePage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedChip, setSelectedChip] = useState('trending');
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  // API data state - no fallback, only real data
  const [ugcReels, setUgcReels] = useState<any[]>([]);
  const [hotDeals, setHotDeals] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [trendingStores, setTrendingStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from APIs
  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        setIsLoading(true);

        // Fetch all data in parallel
        const [reelsRes, hotDealsRes, categoriesRes, storesRes] = await Promise.all([
          reelApi.getTrendingReels({ limit: 6 }),
          exploreApi.getHotDeals({ limit: 4 }),
          exploreApi.getCategories(),
          exploreApi.getTrendingStores({ limit: 5 }),
        ]);

        // Update reels - reelApi already transforms the data
        if (reelsRes.success && reelsRes.data && reelsRes.data.length > 0) {
          console.log('[EXPLORE] Reels data from API:', reelsRes.data);
          const transformedReels = reelsRes.data.map((reel: any, index: number) => {
            // reelApi already transforms creator data correctly
            const creatorName = reel.creator?.name || 'Creator';
            const creatorAvatar = reel.creator?.avatar || `https://i.pravatar.cc/100?img=${(index % 70) + 1}`;

            // Get stats from transformed data
            const likesCount = reel.stats?.likes || 0;
            const commentsCount = reel.stats?.comments || 0;
            const viewsCount = reel.stats?.views || 0;

            // Calculate saved amount based on views
            const savedAmount = Math.floor(viewsCount * 0.05) + 50;

            return {
              id: reel.id,
              user: {
                name: creatorName,
                avatar: creatorAvatar,
              },
              image: reel.thumbnailUrl || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
              videoUrl: reel.videoUrl || '',
              product: reel.title || reel.description?.substring(0, 30) || 'Video',
              saved: savedAmount,
              likes: likesCount,
              comments: commentsCount,
            };
          });
          console.log('[EXPLORE] Final reels:', transformedReels);
          setUgcReels(transformedReels);
        }

        // Update hot deals
        const dealsData = hotDealsRes.data?.products || hotDealsRes.data || [];
        if (hotDealsRes.success && dealsData && dealsData.length > 0) {
          const transformedDeals = dealsData.slice(0, 4).map((deal: any) => ({
            id: deal.id || deal._id,
            name: deal.name || deal.title,
            store: deal.store?.name || deal.storeName || null,
            image: deal.image || deal.images?.[0]?.url || null,
            offer: deal.offer || (deal.cashback ? `${deal.cashback}% Cashback` : (deal.cashbackPercentage ? `${deal.cashbackPercentage}% Cashback` : null)),
            distance: deal.distance ? `${deal.distance} km` : null,
            price: deal.price || deal.pricing?.selling || deal.pricing?.salePrice || null,
          }));
          setHotDeals(transformedDeals);
        }

        // Update categories
        if (categoriesRes.success && categoriesRes.data && categoriesRes.data.length > 0) {
          const transformedCategories = categoriesRes.data.slice(0, 6).map((cat: any) => ({
            id: cat.slug || cat.id,
            name: cat.name,
            emoji: getEmojiForCategory(cat.icon, cat.name),
            cashback: cat.maxCashback ? `Up to ${cat.maxCashback}%` : null,
            stores: cat.storeCount || null,
          }));
          setCategories(transformedCategories);
        }

        // Update trending stores
        const storesData = storesRes.data?.stores || storesRes.data || [];
        if (storesRes.success && storesData && storesData.length > 0) {
          const transformedStores = storesData.slice(0, 5).map((store: any) => ({
            id: store.id || store._id,
            name: store.name,
            offer: store.cashback ? `${store.cashback}` : (store.offers?.cashback ? `${store.offers.cashback}% Cashback` : null),
            distance: store.distance ? `${store.distance}` : null,
            activity: store.activity || store.visitCount ? `${store.visitCount} people visited` : null,
            badge: store.badge || (store.isTrending ? 'Trending' : (store.isFeatured ? 'Featured' : null)),
            badgeColor: store.badgeColor || (store.isTrending ? '#EF4444' : (store.isFeatured ? '#F97316' : null)),
          }));
          setTrendingStores(transformedStores);
        }
      } catch (error) {
        console.error('[EXPLORE] Error fetching data:', error);
        // Keep fallback data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchExploreData();
  }, []);

  // Rotate placeholder
  useEffect(() => {
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
            <TouchableOpacity onPress={() => navigateTo('/explore/reels')}>
              <Text style={styles.viewAllText}>View All Reels</Text>
            </TouchableOpacity>
          </View>

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00C06A" />
              <Text style={styles.loadingText}>Loading trending content...</Text>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && ugcReels.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="videocam-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No trending videos available</Text>
            </View>
          )}

          {/* UGC Reels Grid with Video Autoplay */}
          {ugcReels.length > 0 && (
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
                {/* Video or Image Background */}
                {reel.videoUrl ? (
                  <AutoPlayVideoReel
                    uri={reel.videoUrl}
                    poster={reel.image}
                    style={styles.reelImage}
                  />
                ) : (
                  <Image source={{ uri: reel.image }} style={styles.reelImage} />
                )}

                {/* User Badge */}
                <View style={styles.reelUserBadge}>
                  <Image source={{ uri: reel.user.avatar }} style={styles.reelAvatar} />
                  <Text style={styles.reelUserName}>{reel.user.name}</Text>
                </View>

                {/* Play Button Overlay - only show if no video */}
                {!reel.videoUrl && (
                  <View style={styles.playButtonOverlay}>
                    <View style={styles.playButton}>
                      <Ionicons name="play" size={24} color="#FFFFFF" />
                    </View>
                  </View>
                )}

                {/* Bottom Gradient */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.85)']}
                  style={styles.reelGradient}
                >
                  <Text style={styles.reelProduct} numberOfLines={2}>{reel.product}</Text>

                  {/* Saved Badge */}
                  <View style={styles.savedBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
                    <Text style={styles.savedText}>Saved ₹{reel.saved}</Text>
                  </View>

                  {/* Stats Row */}
                  <View style={styles.reelStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="heart-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.statText}>{reel.likes}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="chatbubble-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.statText}>{reel.comments}</Text>
                    </View>
                    <TouchableOpacity style={styles.bookmarkButton}>
                      <Ionicons name="bookmark-outline" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
          )}
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
            {hotDeals.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.hotCard}
                onPress={() => navigateTo(`/MainStorePage?id=${item.id}`)}
              >
                {item.image && <Image source={{ uri: item.image }} style={styles.hotImage} />}
                {item.offer && (
                  <View style={styles.offerBadge}>
                    <Text style={styles.offerText}>{item.offer}</Text>
                  </View>
                )}
                <View style={styles.hotContent}>
                  <Text style={styles.hotName} numberOfLines={1}>{item.name}</Text>
                  {item.store && <Text style={styles.hotStore}>{item.store}</Text>}
                  <View style={styles.hotFooter}>
                    {item.price && <Text style={styles.hotPrice}>₹{item.price}</Text>}
                    {item.distance && (
                      <View style={styles.distanceBadge}>
                        <Ionicons name="location" size={10} color="#6B7280" />
                        <Text style={styles.distanceText}>{item.distance}</Text>
                      </View>
                    )}
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
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() => navigateTo(`/explore/category/${cat.id}`)}
              >
                <Text style={styles.categoryCardEmoji}>{cat.emoji}</Text>
                <Text style={styles.categoryCardName}>{cat.name}</Text>
                {cat.cashback && <Text style={styles.categoryCardCashback}>{cat.cashback}</Text>}
                {cat.stores && <Text style={styles.categoryCardStores}>{cat.stores} stores</Text>}
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
            {trendingStores.map((store) => (
              <TouchableOpacity
                key={store.id}
                style={styles.storeCard}
                onPress={() => navigateTo(`/MainStorePage?id=${store.id}`)}
              >
                <View style={styles.storeHeader}>
                  <View style={styles.storeLogo}>
                    <Text style={styles.storeLogoText}>{store.name?.charAt(0) || 'S'}</Text>
                  </View>
                  {store.badge && store.badgeColor && (
                    <View style={[styles.storeBadge, { backgroundColor: store.badgeColor }]}>
                      <Text style={styles.storeBadgeText}>{store.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.storeName}>{store.name}</Text>
                {store.offer && <Text style={styles.storeOffer}>{store.offer}</Text>}
                <View style={styles.storeFooter}>
                  {store.distance && (
                    <View style={styles.storeDistance}>
                      <Ionicons name="location" size={12} color="#6B7280" />
                      <Text style={styles.storeDistanceText}>{store.distance}</Text>
                    </View>
                  )}
                  {store.activity && (
                    <View style={styles.storeActivity}>
                      <View style={styles.activityDot} />
                      <Text style={styles.activityText}>{store.activity}</Text>
                    </View>
                  )}
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
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
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
    padding: 14,
    paddingTop: 50,
  },
  reelProduct: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
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
    marginTop: 12,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bookmarkButton: {
    marginLeft: 'auto',
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default ExplorePage;
