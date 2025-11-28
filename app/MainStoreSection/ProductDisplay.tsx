import React, { useCallback, useRef, useState, memo } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  ListRenderItemInfo,
  ViewToken,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { triggerImpact, triggerNotification } from "@/utils/haptics";
import { GlassCard } from "@/components/ui";
import {
  Colors,
  Spacing,
  Shadows,
  BorderRadius,
  IconSize,
  Timing,
} from "@/constants/DesignSystem";

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

const DEFAULT_IMAGES: ProductImage[] = [
  { id: "1", uri: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=1100&fit=crop" },
  { id: "2", uri: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=900&h=1100&fit=crop" },
  { id: "3", uri: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900&h=1100&fit=crop" },
];

export default memo(function ProductDisplay({
  images = DEFAULT_IMAGES,
  onSharePress,
  onFavoritePress,
  isFavorited = false,
}: ProductDisplayProps) {
  const { width } = Dimensions.get("window");
  const isTablet = width >= 768;
  const imageCardWidth = Math.round(width * (isTablet ? 0.7 : 0.92));
  // Increased height ratio to fill more screen space
  const imageHeight = Math.round(imageCardWidth * (isTablet ? 0.95 : 1.25));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const flatRef = useRef<FlatList<any> | null>(null);

  // Animation refs for micro-interactions
  const shareScaleAnim = useRef(new Animated.Value(1)).current;
  const favoriteScaleAnim = useRef(new Animated.Value(1)).current;
  const imageScaleAnim = useRef(new Animated.Value(1)).current;

  // viewability config + callback to track current index reliably
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems && viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      setCurrentIndex(idx);
    }
  }).current;

  const handleImageError = useCallback((imageId: string) => {
    console.warn(`[ProductDisplay] Image load error for ID: ${imageId}`);
    setImageErrors(prev => new Set(prev).add(imageId));
  }, []);

  // Animation helper
  const animateScale = useCallback((animValue: Animated.Value, toValue: number) => {
    Animated.spring(animValue, {
      toValue,
      useNativeDriver: true,
      ...Timing.springBouncy,
    }).start();
  }, []);

  // Handlers with haptic feedback
  const handleSharePress = useCallback(() => {
    triggerImpact('Medium');
    if (onSharePress) onSharePress();
  }, [onSharePress]);

  const handleFavoritePress = useCallback(() => {
    triggerImpact('Medium');
    if (onFavoritePress) onFavoritePress();
  }, [onFavoritePress]);

  const renderImage = useCallback(
    ({ item }: ListRenderItemInfo<ProductImage>) => {
      const hasError = imageErrors.has(item.id);
      const fallbackUri = DEFAULT_IMAGES[0]?.uri || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900";

      return (
        <View style={[styles.imageWrapper, { width }]}>
          <View style={[styles.imageCard, { width: imageCardWidth, height: imageHeight }]}>
            <Image
              source={{ uri: hasError ? fallbackUri : item.uri }}
              style={[styles.image, { width: imageCardWidth, height: imageHeight }]}
              resizeMode="contain"
              onError={() => handleImageError(item.id)}
              defaultSource={require('@/assets/images/icon.png')}
            />
            {hasError && (
              <View style={styles.errorOverlay}>
                <Ionicons name="image-outline" size={48} color={Colors.gray[400]} />
              </View>
            )}
          </View>
        </View>
      );
    },
    [imageCardWidth, imageHeight, width, imageErrors, handleImageError]
  );

  return (
    <View
      style={styles.container}
      accessibilityLabel="Product image gallery"
    >
      <FlatList
        ref={flatRef}
        data={images}
        keyExtractor={(i) => i.id}
        renderItem={renderImage}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate={Platform.OS === "ios" ? "fast" : 0.98}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        accessibilityLabel={`Product image carousel. Showing image ${currentIndex + 1} of ${images.length}`}
        accessibilityRole="list"
      />

      {/* Glassmorphic Floating Action Buttons */}
      <View style={[styles.actionCol, { top: Spacing.lg }]}>
        {/* Share Button with Animation */}
        <Animated.View style={{ transform: [{ scale: shareScaleAnim }] }}>
          <GlassCard
            variant="light"
            intensity={80}
            borderRadius={BorderRadius.full}
            shadow={true}
            style={styles.actionBtn}
          >
            <TouchableOpacity
              onPress={handleSharePress}
              onPressIn={() => animateScale(shareScaleAnim, 0.90)}
              onPressOut={() => animateScale(shareScaleAnim, 1)}
              style={styles.actionBtnTouchable}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Share product"
            >
              <Ionicons name="share-social-outline" size={IconSize.sm} color={Colors.gray[700]} />
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>

        {/* Favorite Button with Animation */}
        <Animated.View style={{ transform: [{ scale: favoriteScaleAnim }] }}>
          <GlassCard
            variant="light"
            intensity={80}
            borderRadius={BorderRadius.full}
            shadow={true}
            style={styles.actionBtn}
          >
            <TouchableOpacity
              onPress={handleFavoritePress}
              onPressIn={() => animateScale(favoriteScaleAnim, 0.90)}
              onPressOut={() => animateScale(favoriteScaleAnim, 1)}
              style={styles.actionBtnTouchable}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Ionicons
                name={isFavorited ? "heart" : "heart-outline"}
                size={IconSize.sm}
                color={isFavorited ? Colors.error : Colors.gray[700]}
              />
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>
      </View>

      {/* Modern Pagination Dots */}
      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, i) => {
            const isActive = i === currentIndex;
            return (
              <View
                key={i}
                style={[
                  styles.dotBase,
                  isActive ? styles.dotActive : styles.dotInactive,
                  isActive ? styles.dotActiveWide : undefined,
                ]}
                accessibilityLabel={`Image ${i + 1} of ${images.length}`}
                accessibilityState={{ selected: isActive }}
              />
            );
          })}
        </View>
      )}
    </View>
);
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
  imageWrapper: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC", // Modern light gray background
  },
  imageCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: Colors.background.primary,
    ...Shadows.medium,
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.gray[50], // Light background for contain mode
  },
  errorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },

  // Glassmorphic Action Buttons
  actionCol: {
    position: "absolute",
    right: Spacing.base + 2,
    zIndex: 20,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  actionBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  actionBtnTouchable: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  // Modern Pagination Dots
  pagination: {
    position: "absolute",
    bottom: Spacing.md,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dotBase: {
    height: 8,
    borderRadius: BorderRadius.sm,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: Colors.primary[700],
  },
  dotActiveWide: {
    width: 28,
  },
  dotInactive: {
    backgroundColor: Colors.gray[200],
    width: 8,
  },
});
