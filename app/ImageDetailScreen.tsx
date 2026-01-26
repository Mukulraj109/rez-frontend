// ImageDetailScreen.tsx - Modern Image Detail View with Product Tags
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
  Text,
  ScrollView,
  StatusBar,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useRegion } from '@/contexts/RegionContext';
import { DiscoverImage, DiscoverProduct } from '@/types/discover.types';
import { realVideosApi } from '@/services/realVideosApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ReZ Brand Colors
const REZ_COLORS = {
  primaryGreen: '#00C06A',
  darkGreen: '#00796B',
  lightGreen: '#10B981',
  primaryGold: '#FFC857',
  orange: '#F59E0B',
  navy: '#0B2240',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  black: '#000000',
  white: '#FFFFFF',
};

export default function ImageDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();

  // State
  const [image, setImage] = useState<DiscoverImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Engagement state
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Contexts
  const { state: authState } = useAuth();
  const { addItem } = useCart();

  // Parse params
  useEffect(() => {
    if (params.item && typeof params.item === 'string') {
      try {
        const parsedItem = JSON.parse(params.item) as DiscoverImage;
        setImage(parsedItem);

        // Set initial engagement state
        const likes = typeof parsedItem.engagement?.likes === 'number'
          ? parsedItem.engagement.likes
          : (Array.isArray(parsedItem.engagement?.likes) ? parsedItem.engagement.likes.length : 0);
        setLikesCount(likes);
        setIsLiked(parsedItem.engagement?.liked || false);
        setIsBookmarked(parsedItem.engagement?.bookmarked || false);

        setLoading(false);
      } catch (err) {
        console.error('Failed to parse image param:', err);
        setError('Failed to load image');
        setLoading(false);
      }
    } else {
      setError('No image data provided');
      setLoading(false);
    }
  }, [params.item]);

  // Handle like toggle
  const handleLike = useCallback(async () => {
    if (!image) return;

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

    try {
      await realVideosApi.toggleVideoLike(image._id);
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState);
      setLikesCount(prev => newLikedState ? Math.max(0, prev - 1) : prev + 1);
    }
  }, [image, isLiked]);

  // Handle bookmark toggle
  const handleBookmark = useCallback(async () => {
    if (!image) return;

    const newBookmarkedState = !isBookmarked;
    setIsBookmarked(newBookmarkedState);

    try {
      await realVideosApi.toggleBookmark(image._id);
    } catch (error) {
      setIsBookmarked(!newBookmarkedState);
    }
  }, [image, isBookmarked]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!image) return;

    try {
      await Share.share({
        message: `Check out this on ReZ! ${image.caption || ''}`,
        title: 'Share Image',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [image]);

  // Navigate to product
  const handleProductPress = useCallback((product: DiscoverProduct) => {
    router.push(`/ProductPage?cardId=${product._id}&cardType=product&source=image`);
  }, [router]);

  // Add to cart
  const handleAddToCart = useCallback(async (product: DiscoverProduct) => {
    try {
      await addItem({
        productId: product._id,
        quantity: 1,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }, [addItem]);

  // Format count
  const formatCount = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Get creator display info
  const getCreatorInfo = () => {
    if (!image?.creator) return { name: '', avatar: null };

    const name = image.creator.name || image.creator.username || '';
    const avatar = image.creator.avatar || image.creator.profile?.avatar;
    const defaultAvatar = name
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F59E0B&color=fff&size=100`
      : null;

    return { name, avatar: avatar || defaultAvatar };
  };

  // Get image URL
  const getImageUrl = () => {
    if (image?.imageUrl && image.imageUrl.trim()) {
      return image.imageUrl;
    }
    // Check for product images as fallback
    if (image?.products && image.products.length > 0) {
      const productImage = image.products[0].image || image.products[0].images?.[0];
      if (productImage) return productImage;
    }
    return null;
  };

  const creatorInfo = getCreatorInfo();
  const imageUrl = getImageUrl();
  const hasProducts = image?.products && image.products.length > 0;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={REZ_COLORS.orange} />
        <Text style={styles.loadingText}>Loading image...</Text>
      </View>
    );
  }

  if (error || !image) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" />
        <Ionicons name="alert-circle-outline" size={64} color={REZ_COLORS.gray} />
        <Text style={styles.errorText}>{error || 'Image not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={REZ_COLORS.black} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Photo</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={24} color={REZ_COLORS.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Creator Info */}
        <View style={styles.creatorSection}>
          {creatorInfo.avatar && (
            <Image source={{ uri: creatorInfo.avatar }} style={styles.creatorAvatar} />
          )}
          <View style={styles.creatorInfo}>
            <Text style={styles.creatorName}>{creatorInfo.name || 'User'}</Text>
          </View>
          <TouchableOpacity style={styles.followButton} activeOpacity={0.7}>
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        </View>

        {/* Main Image */}
        <View style={styles.imageContainer}>
          {/* Loading placeholder */}
          {!imageLoaded && !imageError && imageUrl && (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator size="large" color={REZ_COLORS.orange} />
            </View>
          )}

          {/* Main image */}
          {imageUrl && !imageError && (
            <Image
              source={{ uri: imageUrl }}
              style={[styles.mainImage, !imageLoaded && styles.hiddenImage]}
              resizeMode="cover"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageLoaded(true);
                setImageError(true);
              }}
            />
          )}

          {/* Fallback */}
          {(!imageUrl || imageError) && (
            <View style={styles.noImageFallback}>
              <LinearGradient
                colors={['rgba(245, 158, 11, 0.3)', 'rgba(234, 88, 12, 0.2)', 'rgba(16, 185, 129, 0.3)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="image-outline" size={64} color="rgba(245, 158, 11, 0.5)" />
              <Text style={styles.noImageText}>No image available</Text>
            </View>
          )}

          {/* Product count badge */}
          {hasProducts && (
            <View style={styles.productCountBadge}>
              <Ionicons name="bag-handle" size={16} color="#FFFFFF" />
              <Text style={styles.productCountText}>
                {image.products.length} {image.products.length === 1 ? 'Product' : 'Products'}
              </Text>
            </View>
          )}
        </View>

        {/* Engagement Actions */}
        <View style={styles.engagementSection}>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={28}
                color={isLiked ? "#EF4444" : REZ_COLORS.black}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <Ionicons name="chatbubble-outline" size={26} color={REZ_COLORS.black} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Ionicons name="paper-plane-outline" size={26} color={REZ_COLORS.black} />
            </TouchableOpacity>

            <View style={styles.actionSpacer} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleBookmark}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={26}
                color={isBookmarked ? REZ_COLORS.primaryGold : REZ_COLORS.black}
              />
            </TouchableOpacity>
          </View>

          {/* Likes Count */}
          <Text style={styles.likesCount}>{formatCount(likesCount)} likes</Text>
        </View>

        {/* Caption */}
        {image.caption && (
          <View style={styles.captionSection}>
            <Text style={styles.captionText}>
              <Text style={styles.captionUsername}>{creatorInfo.name} </Text>
              {image.caption}
            </Text>
          </View>
        )}

        {/* View Count */}
        <Text style={styles.viewsText}>
          {formatCount(image.engagement?.views || 0)} views
        </Text>

        {/* Products Section */}
        {hasProducts && (
          <View style={styles.productsSection}>
            <View style={styles.productsSectionHeader}>
              <Ionicons name="bag-handle" size={20} color={REZ_COLORS.primaryGreen} />
              <Text style={styles.productsSectionTitle}>Shop Products</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsScrollContainer}
            >
              {image.products.map((product, index) => (
                <TouchableOpacity
                  key={product._id || index}
                  style={styles.productCard}
                  onPress={() => handleProductPress(product)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: product.image || product.images?.[0] }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name || product.title}
                    </Text>
                    <View style={styles.productPriceRow}>
                      <Text style={styles.productPrice}>
                        {currencySymbol}{product.salePrice || product.price}
                      </Text>
                      {product.salePrice && product.price > product.salePrice && (
                        <Text style={styles.productOriginalPrice}>
                          {currencySymbol}{product.price}
                        </Text>
                      )}
                    </View>
                    {product.cashbackPercent && product.cashbackPercent > 0 && (
                      <View style={styles.cashbackBadge}>
                        <Text style={styles.cashbackText}>
                          {product.cashbackPercent}% Cashback
                        </Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => handleAddToCart(product)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: REZ_COLORS.white,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: REZ_COLORS.gray,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: REZ_COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: REZ_COLORS.orange,
    borderRadius: 24,
  },
  backButtonText: {
    color: REZ_COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: REZ_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: REZ_COLORS.black,
  },
  scrollView: {
    flex: 1,
  },
  creatorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  creatorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '600',
    color: REZ_COLORS.black,
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: REZ_COLORS.orange,
    borderRadius: 8,
  },
  followButtonText: {
    color: REZ_COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    aspectRatio: 1,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    zIndex: 10,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  hiddenImage: {
    opacity: 0,
  },
  noImageFallback: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  noImageText: {
    marginTop: 12,
    fontSize: 14,
    color: REZ_COLORS.gray,
  },
  productCountBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  productCountText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  engagementSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
    marginRight: 16,
  },
  actionSpacer: {
    flex: 1,
  },
  likesCount: {
    fontSize: 14,
    fontWeight: '600',
    color: REZ_COLORS.black,
    marginTop: 8,
  },
  captionSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  captionText: {
    fontSize: 14,
    color: REZ_COLORS.black,
    lineHeight: 20,
  },
  captionUsername: {
    fontWeight: '600',
  },
  viewsText: {
    fontSize: 12,
    color: REZ_COLORS.gray,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  productsSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  productsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  productsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: REZ_COLORS.black,
  },
  productsScrollContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  productCard: {
    width: 160,
    backgroundColor: REZ_COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  productImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 13,
    fontWeight: '500',
    color: REZ_COLORS.black,
    marginBottom: 6,
    lineHeight: 18,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: REZ_COLORS.primaryGreen,
  },
  productOriginalPrice: {
    fontSize: 12,
    color: REZ_COLORS.gray,
    textDecorationLine: 'line-through',
  },
  cashbackBadge: {
    marginTop: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '600',
    color: REZ_COLORS.primaryGreen,
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 68,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: REZ_COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
