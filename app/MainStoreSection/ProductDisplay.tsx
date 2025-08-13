import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductImage {
  id: string;
  uri: string;
}

interface ProductDisplayProps {
  images?: ProductImage[];
  onSharePress?: () => void;
  onFavoritePress?: () => void;
  isFavorited?: boolean;
}

const defaultImages: ProductImage[] = [
  {
    id: '1',
    uri: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop&crop=center'
  },
  {
    id: '2', 
    uri: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=400&h=500&fit=crop&crop=center'
  },
  {
    id: '3',
    uri: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=500&fit=crop&crop=center'
  }
];

export default function ProductDisplay({ 
  images = defaultImages,
  onSharePress,
  onFavoritePress,
  isFavorited = false 
}: ProductDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  const imageHeight = isTablet ? width * 0.8 : width * 1.25; // Responsive aspect ratio

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentIndex(roundIndex);
  };

  const renderImage = ({ item }: { item: ProductImage }) => (
    <View style={[styles.imageContainer, { width }]}>
      <Image
        source={{ uri: item.uri }}
        style={[styles.productImage, { height: imageHeight }]}
        resizeMode="cover"
        defaultSource={require('@/assets/images/icon.png')}
        loadingIndicatorSource={require('@/assets/images/icon.png')}
        onLoadStart={() => console.log('Image loading started:', item.id)}
        onLoadEnd={() => console.log('Image loading completed:', item.id)}
        onError={(error) => console.log('Image loading error:', item.id, error)}
      />
    </View>
  );

  const renderDot = (index: number) => (
    <View
      key={index}
      style={[
        styles.dot,
        index === currentIndex ? styles.activeDot : styles.inactiveDot
      ]}
    />
  );

  return (
    <View style={styles.container}>
      {/* Product Image Carousel */}
      <View style={styles.imageCarousel}>
        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={renderImage}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={width}
          snapToAlignment="start"
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          windowSize={5}
          initialNumToRender={2}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />

        {/* Action Buttons Overlay */}
        <View style={styles.actionButtonsContainer}>
          {/* Share Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onSharePress}
            activeOpacity={0.8}
            accessibilityLabel="Share this product"
            accessibilityRole="button"
            accessibilityHint="Share product details with others"
          >
            <Ionicons name="share-outline" size={18} color="#6B7280" />
          </TouchableOpacity>

          {/* Favorite Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.favoriteButton]}
            onPress={onFavoritePress}
            activeOpacity={0.8}
            accessibilityLabel={isFavorited ? "Remove from favorites" : "Add to favorites"}
            accessibilityRole="button"
            accessibilityHint={isFavorited ? "Remove this product from your favorites list" : "Add this product to your favorites list"}
          >
            <Ionicons 
              name={isFavorited ? "heart" : "heart-outline"} 
              size={18} 
              color={isFavorited ? "#EF4444" : "#6B7280"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Page Indicators (Dots) */}
      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, index) => renderDot(index))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  imageCarousel: {
    position: 'relative',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  productImage: {
    width: '100%',
    backgroundColor: '#F8FAFC',
  },
  actionButtonsContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 10,
    zIndex: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  favoriteButton: {
    // Additional styling for favorite button if needed
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  dot: {
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    height: 8,
    backgroundColor: '#8B5CF6',
  },
  inactiveDot: {
    width: 8,
    height: 8,
    backgroundColor: '#D1D5DB',
  },
});