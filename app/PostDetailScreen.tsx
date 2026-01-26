// PostDetailScreen.tsx - Modern Instagram-style Post Detail View
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
import { DiscoverPost, DiscoverProduct } from '@/types/discover.types';
import { realVideosApi } from '@/services/realVideosApi';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ReZ Brand Colors
const REZ_COLORS = {
  primaryGreen: '#00C06A',
  darkGreen: '#00796B',
  lightGreen: '#10B981',
  primaryGold: '#FFC857',
  navy: '#0B2240',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  black: '#000000',
  white: '#FFFFFF',
};

export default function PostDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();

  // State
  const [post, setPost] = useState<DiscoverPost | null>(null);
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
        const parsedItem = JSON.parse(params.item) as DiscoverPost;
        setPost(parsedItem);

        // Set initial engagement state
        const likes = typeof parsedItem.engagement?.likes === 'number'
          ? parsedItem.engagement.likes
          : (Array.isArray(parsedItem.engagement?.likes) ? parsedItem.engagement.likes.length : 0);
        setLikesCount(likes);
        setIsLiked(parsedItem.engagement?.liked || false);
        setIsBookmarked(parsedItem.engagement?.bookmarked || false);

        setLoading(false);
      } catch (err) {
        console.error('Failed to parse post param:', err);
        setError('Failed to load post');
        setLoading(false);
      }
    } else {
      setError('No post data provided');
      setLoading(false);
    }
  }, [params.item]);

  // Handle like toggle
  const handleLike = useCallback(async () => {
    if (!post) return;

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

    try {
      await realVideosApi.toggleVideoLike(post._id);
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState);
      setLikesCount(prev => newLikedState ? Math.max(0, prev - 1) : prev + 1);
    }
  }, [post, isLiked]);

  // Handle bookmark toggle
  const handleBookmark = useCallback(async () => {
    if (!post) return;

    const newBookmarkedState = !isBookmarked;
    setIsBookmarked(newBookmarkedState);

    try {
      await realVideosApi.toggleBookmark(post._id);
    } catch (error) {
      setIsBookmarked(!newBookmarkedState);
    }
  }, [post, isBookmarked]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!post) return;

    try {
      await Share.share({
        message: `Check out this post on ReZ! ${post.caption || ''}`,
        title: 'Share Post',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [post]);

  // Navigate to product
  const handleProductPress = useCallback((product: DiscoverProduct) => {
    router.push(`/ProductPage?cardId=${product._id}&cardType=product&source=post`);
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
    if (!post?.creator) return { name: '', avatar: null };

    const name = post.creator.name || post.creator.username || '';
    const avatar = post.creator.avatar || post.creator.profile?.avatar;
    const defaultAvatar = name
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B5CF6&color=fff&size=100`
      : null;

    return { name, avatar: avatar || defaultAvatar };
  };

  const creatorInfo = getCreatorInfo();

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={REZ_COLORS.primaryGreen} />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" />
        <Ionicons name="alert-circle-outline" size={64} color={REZ_COLORS.gray} />
        <Text style={styles.errorText}>{error || 'Post not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Helper to check if URL is likely a video
  const isVideoUrl = (url: string): boolean => {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('.mp4') ||
           lowerUrl.includes('.webm') ||
           lowerUrl.includes('.mov') ||
           lowerUrl.includes('.avi') ||
           lowerUrl.includes('/video/') ||
           lowerUrl.includes('video.') ||
           lowerUrl.includes('stream');
  };

  // Get best available image URL - prioritize thumbnail over mediaUrl (which might be video)
  const getImageUrl = () => {
    // Debug log
    console.log('[PostDetailScreen] Getting image URL from:', {
      thumbnail: post.thumbnail,
      mediaUrl: post.mediaUrl,
      productsCount: post.products?.length || 0,
    });

    // Check thumbnail first (usually an image)
    if (post.thumbnail && post.thumbnail.trim() && !isVideoUrl(post.thumbnail)) {
      console.log('[PostDetailScreen] Using thumbnail:', post.thumbnail);
      return post.thumbnail;
    }
    // Check mediaUrl if it looks like an image
    if (post.mediaUrl && post.mediaUrl.trim() && !isVideoUrl(post.mediaUrl)) {
      console.log('[PostDetailScreen] Using mediaUrl:', post.mediaUrl);
      return post.mediaUrl;
    }
    // Even if it's a video URL, try thumbnail anyway (many video services use image URLs for thumbnails)
    if (post.thumbnail && post.thumbnail.trim()) {
      console.log('[PostDetailScreen] Using thumbnail (fallback):', post.thumbnail);
      return post.thumbnail;
    }
    // Check for product images as fallback
    if (post.products && post.products.length > 0) {
      const productImage = post.products[0].image || post.products[0].images?.[0];
      if (productImage) {
        console.log('[PostDetailScreen] Using product image:', productImage);
        return productImage;
      }
    }
    console.log('[PostDetailScreen] No image URL found');
    return null;
  };

  const imageUrl = getImageUrl();
  const hasProducts = post.products && post.products.length > 0;

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

        <Text style={styles.headerTitle}>Post</Text>

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
            {post.contentType === 'merchant' && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={REZ_COLORS.primaryGreen} />
                <Text style={styles.verifiedText}>Brand</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.followButton} activeOpacity={0.7}>
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        </View>

        {/* Post Image */}
        <View style={styles.imageContainer}>
          {/* Loading placeholder - show while loading */}
          {!imageLoaded && !imageError && imageUrl && (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator size="large" color={REZ_COLORS.primaryGreen} />
              <Text style={styles.loadingImageText}>Loading image...</Text>
            </View>
          )}

          {/* Main image */}
          {imageUrl && !imageError && (
            <Image
              source={{ uri: imageUrl }}
              style={[styles.postImage, !imageLoaded && styles.hiddenImage]}
              resizeMode="cover"
              onLoad={() => {
                console.log('[PostDetailScreen] Image loaded successfully');
                setImageLoaded(true);
              }}
              onError={(e) => {
                console.log('[PostDetailScreen] Image load error:', e.nativeEvent?.error);
                setImageLoaded(true);
                setImageError(true);
              }}
            />
          )}

          {/* Fallback for no image or error */}
          {(!imageUrl || imageError) && (
            <View style={styles.noImageFallback}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.3)', 'rgba(124, 58, 237, 0.2)', 'rgba(245, 158, 11, 0.3)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="image-outline" size={64} color="rgba(139, 92, 246, 0.5)" />
              <Text style={styles.noImageText}>
                {imageError ? 'Failed to load image' : 'No image available'}
              </Text>
            </View>
          )}

          {/* Product Tags Overlay */}
          {hasProducts && (
            <TouchableOpacity
              style={styles.productTagOverlay}
              onPress={() => handleProductPress(post.products[0])}
              activeOpacity={0.8}
            >
              <View style={styles.productTag}>
                <Ionicons name="bag-handle" size={16} color="#FFFFFF" />
                <Text style={styles.productTagText}>
                  {post.products.length} {post.products.length === 1 ? 'Product' : 'Products'}
                </Text>
              </View>
            </TouchableOpacity>
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
        {post.caption && (
          <View style={styles.captionSection}>
            <Text style={styles.captionText}>
              <Text style={styles.captionUsername}>{creatorInfo.name} </Text>
              {post.caption}
            </Text>
          </View>
        )}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <View style={styles.hashtagsSection}>
            <Text style={styles.hashtagsText}>
              {post.hashtags.map((tag, index) => (
                <Text key={index} style={styles.hashtag}>
                  {tag.startsWith('#') ? tag : `#${tag}`}{' '}
                </Text>
              ))}
            </Text>
          </View>
        )}

        {/* View Count */}
        <Text style={styles.viewsText}>
          {formatCount(post.engagement?.views || 0)} views
        </Text>

        {/* Debug info - remove in production */}
        {__DEV__ && (
          <Text style={[styles.viewsText, { fontSize: 10, marginTop: 4 }]} numberOfLines={2}>
            Image: {imageUrl ? imageUrl.substring(0, 60) + '...' : 'none'}
          </Text>
        )}

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
              {post.products.map((product, index) => (
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
    backgroundColor: REZ_COLORS.primaryGreen,
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
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 12,
    color: REZ_COLORS.primaryGreen,
    marginLeft: 4,
    fontWeight: '500',
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: REZ_COLORS.primaryGreen,
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
  loadingImageText: {
    marginTop: 8,
    fontSize: 12,
    color: REZ_COLORS.gray,
  },
  postImage: {
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
  productTagOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  productTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  productTagText: {
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
  hashtagsSection: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  hashtagsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  hashtag: {
    color: '#3B82F6',
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
