/**
 * MallCollectionCard Component
 *
 * Card component for displaying curated collection with background image
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MallCollection } from '../../../types/mall.types';

interface MallCollectionCardProps {
  collection: MallCollection;
  onPress: (collection: MallCollection) => void;
  width?: number;
  height?: number;
}

// Helper to check if string is a valid image URL
const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image');
};

const MallCollectionCard: React.FC<MallCollectionCardProps> = ({
  collection,
  onPress,
  width = 160,
  height = 180,
}) => {
  const hasValidImage = isValidImageUrl(collection.image);

  // If no valid image, render with gradient only
  if (!hasValidImage) {
    return (
      <TouchableOpacity
        style={[styles.container, { width, height }]}
        onPress={() => onPress(collection)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#8B5CF6', '#6366F1']}
          style={styles.fallbackGradient}
        >
          <View style={styles.content}>
            <Text style={styles.collectionName} numberOfLines={2}>
              {collection.name}
            </Text>
            {collection.brandCount > 0 && (
              <Text style={styles.brandCount}>
                {collection.brandCount} brands
              </Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { width, height }]}
      onPress={() => onPress(collection)}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: collection.image }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Text style={styles.collectionName} numberOfLines={2}>
              {collection.name}
            </Text>
            {collection.brandCount > 0 && (
              <Text style={styles.brandCount}>
                {collection.brandCount} brands
              </Text>
            )}
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  imageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  image: {
    borderRadius: 16,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
    borderRadius: 16,
  },
  fallbackGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
    borderRadius: 16,
  },
  content: {
    gap: 4,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  brandCount: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default memo(MallCollectionCard);
