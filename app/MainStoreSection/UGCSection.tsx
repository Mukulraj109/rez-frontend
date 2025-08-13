import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

interface UGCImage {
  id: string;
  uri: string;
  viewCount: string;
}

interface UGCSectionProps {
  title?: string;
  images?: UGCImage[];
  onViewAllPress?: () => void;
  onImagePress?: (imageId: string) => void;
}

const defaultImages: UGCImage[] = [
  {
    id: '1',
    uri: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&crop=center',
    viewCount: '2.5L'
  },
  {
    id: '2',
    uri: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=300&h=300&fit=crop&crop=center',
    viewCount: '2.5L'
  },
  {
    id: '3',
    uri: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&h=300&fit=crop&crop=center',
    viewCount: '1.8L'
  },
  {
    id: '4',
    uri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop&crop=center',
    viewCount: '3.2L'
  }
];

export default function UGCSection({
  title = "UGC",
  images = defaultImages,
  onViewAllPress,
  onImagePress
}: UGCSectionProps) {
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  const imageSize = isTablet ? (width - 80) / 3.2 : (width - 60) / 2.2; // Responsive grid sizing

  const renderImage = ({ item }: { item: UGCImage }) => (
    <TouchableOpacity
      style={[styles.imageContainer, { width: imageSize, height: imageSize }]}
      onPress={() => onImagePress?.(item.id)}
      activeOpacity={0.8}
      accessibilityLabel={`User generated content image with ${item.viewCount} views`}
      accessibilityRole="button"
    >
      <Image
        source={{ uri: item.uri }}
        style={styles.ugcImage}
        resizeMode="cover"
        defaultSource={require('@/assets/images/icon.png')}
      />
      
      {/* View Count Overlay */}
      <View style={styles.viewCountOverlay}>
        <View style={styles.viewCountBadge}>
          <Ionicons name="eye" size={12} color="#FFFFFF" style={styles.eyeIcon} />
          <ThemedText style={styles.viewCountText}>
            {item.viewCount}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <ThemedText style={styles.sectionTitle}>
          {title}
        </ThemedText>
        
        <TouchableOpacity
          onPress={onViewAllPress}
          activeOpacity={0.7}
          accessibilityLabel="View all user generated content"
          accessibilityRole="button"
        >
          <ThemedText style={styles.viewAllText}>
            View all
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Images Grid */}
      <FlatList
        data={images}
        renderItem={renderImage}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.imagesList}
        snapToInterval={imageSize + 12}
        decelerationRate="fast"
        ItemSeparatorComponent={() => <View style={styles.imageSeparator} />}
        removeClippedSubviews={true}
        maxToRenderPerBatch={4}
        windowSize={6}
        initialNumToRender={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  imagesList: {
    paddingHorizontal: 20,
  },
  imageSeparator: {
    width: 10,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  ugcImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
  viewCountOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
  },
  viewCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  eyeIcon: {
    marginRight: 3,
  },
  viewCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});