import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

interface SocialActionsProps {
  videoId: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => Promise<void>;
  onComment: () => void;
  onShare: () => void;
  onBookmark: () => Promise<void>;
}

export default function SocialActions({
  videoId,
  likes,
  comments,
  shares,
  isLiked,
  isBookmarked,
  onLike,
  onComment,
  onShare,
  onBookmark,
}: SocialActionsProps) {
  const [liking, setLiking] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [likeScale] = useState(new Animated.Value(1));
  const [bookmarkScale] = useState(new Animated.Value(1));

  const handleLike = async () => {
    if (liking) return;

    setLiking(true);

    // Animate heart
    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(likeScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await onLike();
    } catch (error) {
      console.error('Like error:', error);
    } finally {
      setLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (bookmarking) return;

    setBookmarking(true);

    // Animate bookmark
    Animated.sequence([
      Animated.timing(bookmarkScale, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(bookmarkScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await onBookmark();
    } catch (error) {
      console.error('Bookmark error:', error);
    } finally {
      setBookmarking(false);
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  return (
    <View style={styles.container}>
      {/* Like Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleLike}
        disabled={liking}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={32}
            color={isLiked ? '#EF4444' : '#FFFFFF'}
          />
        </Animated.View>
        <ThemedText style={styles.actionText}>{formatCount(likes)}</ThemedText>
      </TouchableOpacity>

      {/* Comment Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onComment}
        activeOpacity={0.7}
      >
        <Ionicons name="chatbubble-outline" size={30} color="#FFFFFF" />
        <ThemedText style={styles.actionText}>{formatCount(comments)}</ThemedText>
      </TouchableOpacity>

      {/* Bookmark Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleBookmark}
        disabled={bookmarking}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={30}
            color={isBookmarked ? '#F59E0B' : '#FFFFFF'}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Share Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onShare}
        activeOpacity={0.7}
      >
        <Ionicons name="share-social-outline" size={30} color="#FFFFFF" />
        <ThemedText style={styles.actionText}>{formatCount(shares)}</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 12,
    bottom: 240, // Above product section
    alignItems: 'center',
    gap: 24,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
