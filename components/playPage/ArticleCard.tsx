import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Article } from '@/types/article.types';

const { width: screenWidth } = Dimensions.get('window');

interface ArticleCardProps {
  article: Article;
  onPress: (article: Article) => void;
  style?: any;
}

export default function ArticleCard({ article, onPress, style }: ArticleCardProps) {
  const [imageError, setImageError] = React.useState(false);

  // Grid card width: ensure equal width for both columns
  const cardWidth = (screenWidth - 44) / 2; // 44 = 16 (left) + 16 (right) + 12 (gap)
  const cardHeight = cardWidth * 1.4; // More compact aspect ratio

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: cardWidth,
          height: cardHeight
        },
        style
      ]}
      onPress={() => onPress(article)}
      activeOpacity={0.9}
      accessibilityLabel={`Article: ${article.title}. ${article.viewCount} views`}
      accessibilityRole="button"
      accessibilityHint="Double tap to read article"
    >
      <View style={styles.imageContainer}>
        {/* Cover Image */}
        {article.coverImage && !imageError ? (
          <Image
            source={{ uri: article.coverImage }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.placeholderContainer]}>
            <Ionicons name="document-text" size={40} color="#8B5CF6" />
            <ThemedText style={styles.placeholderText}>Article</ThemedText>
          </View>
        )}

        {/* Gradient overlay for text readability */}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
          style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end' }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {/* View count badge (top-left) */}
        <View style={styles.viewCountContainer}>
          <View style={styles.viewCountPill}>
            <Ionicons name="eye" size={10} color="#FFFFFF" />
            <ThemedText style={styles.viewCountText}>
              {article.viewCount}
            </ThemedText>
          </View>
        </View>

        {/* Content overlay (bottom) */}
        <View style={styles.contentOverlay}>
          {/* Title */}
          <ThemedText
            style={styles.title}
            numberOfLines={2}
          >
            {article.title}
          </ThemedText>

          {/* Read more button */}
          <View style={styles.readMoreContainer}>
            <ThemedText style={styles.readMoreText}>Read more</ThemedText>
            <Ionicons name="arrow-forward" size={12} color="#8B5CF6" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.08)',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    gap: 10,
  },
  placeholderText: {
    color: '#8B5CF6',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewCountContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  viewCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    gap: 8,
    minHeight: 70, // Fixed height to prevent misalignment
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 16,
    height: 32, // Fixed height for 2 lines (16 * 2)
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 4,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  readMoreText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '700',
  },
});
