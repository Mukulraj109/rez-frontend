import React, { useCallback, useRef, useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

export default function ProductDisplay({
  images = DEFAULT_IMAGES,
  onSharePress,
  onFavoritePress,
  isFavorited = false,
}: ProductDisplayProps) {
  const { width } = Dimensions.get("window");
  const isTablet = width >= 768;
  const imageCardWidth = Math.round(width * (isTablet ? 0.7 : 0.92));
  const imageHeight = Math.round(imageCardWidth * (isTablet ? 0.95 : 1.25));

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList<any> | null>(null);

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

  const renderImage = useCallback(
    ({ item }: ListRenderItemInfo<ProductImage>) => (
      <View style={[styles.imageWrapper, { width }]}>
        <View style={[styles.imageCard, { width: imageCardWidth, height: imageHeight }]}>
          <Image
            source={{ uri: item.uri }}
            style={[styles.image, { width: imageCardWidth, height: imageHeight }]}
            resizeMode="cover"
          />
        </View>
      </View>
    ),
    [imageCardWidth, imageHeight, width]
  );

  return (
    <View style={styles.container}>
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
      />

      {/* Floating action buttons (right column) */}
      <View style={[styles.actionCol, { top: 20 }]}>
        <TouchableOpacity
          onPress={onSharePress}
          style={styles.actionBtn}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Share product"
        >
          <Ionicons name="share-social-outline" size={18} color="#374151" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onFavoritePress}
          style={[styles.actionBtn, styles.favoriteBtn]}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Ionicons name={isFavorited ? "heart" : "heart-outline"} size={18} color={isFavorited ? "#EF4444" : "#374151"} />
        </TouchableOpacity>
      </View>

      {/* Pagination dots (centered below carousel) */}
      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dotBase,
                i === currentIndex ? styles.dotActive : styles.dotInactive,
                i === currentIndex ? styles.dotActiveWide : undefined,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
  imageWrapper: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F3FB",
  },
  imageCard: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#fff",
    // elevated card shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  image: {
    width: "100%",
    height: "100%",
  },

  actionCol: {
    position: "absolute",
    right: 18,
    zIndex: 20,
    justifyContent: "flex-start",
    alignItems: "center",
    // keep buttons stacked
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    // subtle border + shadow
    borderWidth: 0.5,
    borderColor: "rgba(15,23,42,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  favoriteBtn: {
    // slightly stronger elevation for favorite
  },

  pagination: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dotBase: {
    height: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: "#7C3AED",
  },
  dotActiveWide: {
    width: 28,
  },
  dotInactive: {
    backgroundColor: "#E5E7EB",
    width: 8,
  },
});
