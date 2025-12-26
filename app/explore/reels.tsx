import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  StatusBar,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const REEL_WIDTH = (width - 48) / 2;
const REEL_HEIGHT = REEL_WIDTH * 1.5;

// Mock reels data
const reelsData = [
  {
    id: 1,
    user: { name: 'Priya S.', avatar: 'https://i.pravatar.cc/100?img=1' },
    store: 'Starbucks',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    product: 'Cappuccino & Croissant',
    saved: 120,
    likes: 234,
    comments: 45,
    views: 1200,
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
    views: 3400,
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
    views: 2100,
  },
  {
    id: 4,
    user: { name: 'Arjun P.', avatar: 'https://i.pravatar.cc/100?img=4' },
    store: 'Wellness Spa',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    product: 'Hair Spa Treatment',
    saved: 400,
    likes: 189,
    comments: 34,
    views: 890,
  },
  {
    id: 5,
    user: { name: 'Neha R.', avatar: 'https://i.pravatar.cc/100?img=5' },
    store: 'Cafe Noir',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    product: 'Cold Brew Coffee',
    saved: 80,
    likes: 156,
    comments: 23,
    views: 670,
  },
  {
    id: 6,
    user: { name: 'Vikram S.', avatar: 'https://i.pravatar.cc/100?img=6' },
    store: 'Gym Plus',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    product: 'Monthly Membership',
    saved: 600,
    likes: 278,
    comments: 45,
    views: 1500,
  },
];

const tabs = [
  { id: 'trending', label: 'Trending', icon: 'flame' },
  { id: 'following', label: 'Following', icon: 'people' },
  { id: 'nearby', label: 'Nearby', icon: 'location' },
];

const ExploreReelsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('trending');

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  const renderReel = ({ item }: { item: typeof reelsData[0] }) => (
    <TouchableOpacity
      style={styles.reelCard}
      onPress={() => navigateTo(`/explore/reel/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.reelImage} />

      {/* User Badge */}
      <View style={styles.userBadge}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        <Text style={styles.userName}>{item.user.name}</Text>
      </View>

      {/* Play Button */}
      <View style={styles.playOverlay}>
        <View style={styles.playButton}>
          <Ionicons name="play" size={20} color="#FFFFFF" />
        </View>
      </View>

      {/* Views Count */}
      <View style={styles.viewsContainer}>
        <Ionicons name="eye" size={12} color="#FFFFFF" />
        <Text style={styles.viewsText}>{(item.views / 1000).toFixed(1)}K</Text>
      </View>

      {/* Bottom Gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      >
        <Text style={styles.productName} numberOfLines={1}>
          {item.product}
        </Text>
        <View style={styles.storeRow}>
          <Ionicons name="storefront" size={10} color="#FFFFFF" />
          <Text style={styles.storeName}>{item.store}</Text>
        </View>

        <View style={styles.savedBadge}>
          <Ionicons name="pricetag" size={10} color="#FFFFFF" />
          <Text style={styles.savedText}>Saved ₹{item.saved}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="heart" size={14} color="#FFFFFF" />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="chatbubble" size={14} color="#FFFFFF" />
            <Text style={styles.statText}>{item.comments}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0B2240" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reels & Reviews</Text>
        <TouchableOpacity style={styles.createButton}>
          <Ionicons name="add" size={24} color="#00C06A" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.id ? '#00C06A' : '#6B7280'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Create Reel CTA */}
      <TouchableOpacity style={styles.createCTA}>
        <LinearGradient
          colors={['#F0FDF4', '#ECFDF5']}
          style={styles.createCTAGradient}
        >
          <View style={styles.createCTAIcon}>
            <Ionicons name="videocam" size={24} color="#00C06A" />
          </View>
          <View style={styles.createCTAContent}>
            <Text style={styles.createCTATitle}>Share Your Experience</Text>
            <Text style={styles.createCTASubtitle}>
              Earn 50-200 coins per reel
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#00C06A" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Reels Grid */}
      <FlatList
        data={reelsData}
        renderItem={renderReel}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#00C06A',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#00C06A',
    fontWeight: '600',
  },
  createCTA: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  createCTAIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createCTAContent: {
    flex: 1,
    marginLeft: 12,
  },
  createCTATitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
  },
  createCTASubtitle: {
    fontSize: 12,
    color: '#00C06A',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reelCard: {
    width: REEL_WIDTH,
    height: REEL_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  reelImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  userBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 6,
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  userName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  viewsText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    paddingTop: 30,
  },
  productName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  storeName: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C06A',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 4,
  },
  savedText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: '#FFFFFF',
  },
});

export default ExploreReelsPage;
