// Reels Page
// Full-screen video reels like TikTok/Instagram

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/DesignSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Reel {
  id: string;
  creator: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  description: string;
  music: string;
  likes: number;
  comments: number;
  shares: number;
  products: { id: string; name: string; price: string }[];
  videoPlaceholder: string;
}

const MOCK_REELS: Reel[] = [
  {
    id: '1',
    creator: { name: 'FashionGuru', avatar: '👩', verified: true },
    description: 'This outfit is giving everything! 🔥 #OOTD #Fashion',
    music: '♪ Trending Sound - Artist',
    likes: 12500,
    comments: 342,
    shares: 89,
    products: [{ id: 'p1', name: 'Designer Dress', price: '₹2,999' }],
    videoPlaceholder: '👗',
  },
  {
    id: '2',
    creator: { name: 'TechReviewer', avatar: '👨', verified: true },
    description: 'iPhone 15 Pro unboxing! Is it worth it? 📱',
    music: '♪ Original Sound',
    likes: 45000,
    comments: 1203,
    shares: 567,
    products: [{ id: 'p2', name: 'iPhone 15 Pro', price: '₹1,29,900' }],
    videoPlaceholder: '📱',
  },
  {
    id: '3',
    creator: { name: 'FoodieExplorer', avatar: '👩‍🍳', verified: false },
    description: 'Best pizza in town! 🍕 Use code REZ20 for 20% off',
    music: '♪ Delicious Vibes',
    likes: 8900,
    comments: 156,
    shares: 234,
    products: [{ id: 'p3', name: 'Dominos Combo', price: '₹599' }],
    videoPlaceholder: '🍕',
  },
  {
    id: '4',
    creator: { name: 'HomeDecorPro', avatar: '🏠', verified: true },
    description: 'Transform your living room with these! ✨',
    music: '♪ Cozy Aesthetics',
    likes: 23400,
    comments: 567,
    shares: 890,
    products: [{ id: 'p4', name: 'LED Lights Set', price: '₹799' }],
    videoPlaceholder: '💡',
  },
];

export default function ReelsPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const flatListRef = useRef<FlatList>(null);

  const handleLike = (reelId: string) => {
    setLikedReels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reelId)) {
        newSet.delete(reelId);
      } else {
        newSet.add(reelId);
      }
      return newSet;
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const renderReel = ({ item, index }: { item: Reel; index: number }) => {
    const isLiked = likedReels.has(item.id);

    return (
      <View style={styles.reelContainer}>
        {/* Video Placeholder */}
        <View style={styles.videoContainer}>
          <View style={styles.videoPlaceholder}>
            <ThemedText style={styles.videoEmoji}>{item.videoPlaceholder}</ThemedText>
            <ThemedText style={styles.videoText}>Reel {index + 1}</ThemedText>
          </View>
        </View>

        {/* Right Side Actions */}
        <View style={styles.actionsContainer}>
          {/* Creator Avatar */}
          <TouchableOpacity style={styles.avatarButton}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>{item.creator.avatar}</ThemedText>
            </View>
            <View style={styles.followButton}>
              <Ionicons name="add" size={12} color="#FFF" />
            </View>
          </TouchableOpacity>

          {/* Like */}
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={32}
              color={isLiked ? Colors.error : '#FFF'}
            />
            <ThemedText style={styles.actionText}>
              {formatNumber(item.likes + (isLiked ? 1 : 0))}
            </ThemedText>
          </TouchableOpacity>

          {/* Comments */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/social/comments/${item.id}` as any)}
          >
            <Ionicons name="chatbubble-outline" size={28} color="#FFF" />
            <ThemedText style={styles.actionText}>{formatNumber(item.comments)}</ThemedText>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={28} color="#FFF" />
            <ThemedText style={styles.actionText}>{formatNumber(item.shares)}</ThemedText>
          </TouchableOpacity>

          {/* Shop */}
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="bag-outline" size={28} color="#FFF" />
            <ThemedText style={styles.actionText}>Shop</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomContainer}>
          {/* Creator Info */}
          <View style={styles.creatorInfo}>
            <ThemedText style={styles.creatorName}>
              @{item.creator.name}
              {item.creator.verified && (
                <Ionicons name="checkmark-circle" size={14} color={Colors.info} />
              )}
            </ThemedText>
          </View>

          {/* Description */}
          <ThemedText style={styles.description} numberOfLines={2}>
            {item.description}
          </ThemedText>

          {/* Music */}
          <View style={styles.musicContainer}>
            <Ionicons name="musical-notes" size={14} color="#FFF" />
            <ThemedText style={styles.musicText} numberOfLines={1}>
              {item.music}
            </ThemedText>
          </View>

          {/* Products */}
          {item.products.length > 0 && (
            <TouchableOpacity style={styles.productTag}>
              <Ionicons name="bag" size={14} color="#FFF" />
              <ThemedText style={styles.productName}>{item.products[0].name}</ThemedText>
              <ThemedText style={styles.productPrice}>{item.products[0].price}</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header Overlay */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Reels</ThemedText>
        <TouchableOpacity style={styles.cameraButton}>
          <Ionicons name="camera-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Reels List */}
      <FlatList
        ref={flatListRef}
        data={MOCK_REELS}
        renderItem={renderReel}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / SCREEN_HEIGHT);
          setCurrentIndex(index);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    zIndex: 10,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h3,
    color: '#FFF',
  },
  cameraButton: {
    padding: Spacing.sm,
  },
  reelContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoEmoji: {
    fontSize: 100,
    marginBottom: Spacing.lg,
  },
  videoText: {
    ...Typography.h3,
    color: 'rgba(255,255,255,0.5)',
  },
  actionsContainer: {
    position: 'absolute',
    right: Spacing.base,
    bottom: 180,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  avatarButton: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[700],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarText: {
    fontSize: 24,
  },
  followButton: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    ...Typography.caption,
    color: '#FFF',
    marginTop: Spacing.xs,
  },
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 80,
    bottom: Platform.OS === 'ios' ? 100 : 80,
    paddingHorizontal: Spacing.lg,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  creatorName: {
    ...Typography.label,
    color: '#FFF',
  },
  description: {
    ...Typography.body,
    color: '#FFF',
    marginBottom: Spacing.sm,
  },
  musicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  musicText: {
    ...Typography.caption,
    color: '#FFF',
  },
  productTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  productName: {
    ...Typography.bodySmall,
    color: '#FFF',
  },
  productPrice: {
    ...Typography.label,
    color: '#FFF',
  },
});
