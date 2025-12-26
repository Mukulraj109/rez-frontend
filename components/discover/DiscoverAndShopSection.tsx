// DiscoverAndShopSection.tsx - Main container for Discover & Shop feature
// Updated to match "Real people. Real savings." design
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DiscoverTabType, CategoryCard, DiscoverReel, DiscoverPost, DiscoverArticle, DiscoverImage } from '@/types/discover.types';
import { useDiscoverContent } from '@/hooks/useDiscoverContent';
import { realVideosApi } from '@/services/realVideosApi';
import DiscoverAndShopHeader from './DiscoverAndShopHeader';
import DiscoverAndShopTabBar from './DiscoverAndShopTabBar';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

interface DiscoverAndShopSectionProps {
  /** Whether to show the header with category cards */
  showHeader?: boolean;
  /** Whether to show category cards in header */
  showCategories?: boolean;
  /** Initial tab to show */
  initialTab?: DiscoverTabType;
  /** Custom category cards */
  categories?: CategoryCard[];
  /** Maximum height for the section (useful for homepage embedding) */
  maxHeight?: number;
  /** Callback when category card is pressed */
  onCategoryPress?: (category: CategoryCard) => void;
}

export default function DiscoverAndShopSection({
  showHeader = true,
  showCategories = true,
  initialTab = 'reels',
  categories,
  maxHeight,
  onCategoryPress,
}: DiscoverAndShopSectionProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DiscoverTabType>(initialTab);
  const [refreshing, setRefreshing] = useState(false);
  // Track liked and bookmarked states for optimistic UI updates
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [bookmarkedReels, setBookmarkedReels] = useState<Set<string>>(new Set());
  const [processingReels, setProcessingReels] = useState<Set<string>>(new Set());

  // Content hook
  const { state, actions } = useDiscoverContent();

  // Fetch initial content for active tab
  useEffect(() => {
    actions.fetchTabContent(activeTab, true);
  }, [activeTab]);

  // Initialize liked/bookmarked states from reel data
  useEffect(() => {
    const newLiked = new Set<string>();
    const newBookmarked = new Set<string>();
    
    state.reels.forEach(reel => {
      if (reel.engagement?.liked) {
        newLiked.add(reel._id);
      }
      if (reel.engagement?.bookmarked) {
        newBookmarked.add(reel._id);
      }
    });
    
    setLikedReels(newLiked);
    setBookmarkedReels(newBookmarked);
  }, [state.reels]);

  // Handle tab change
  const handleTabChange = useCallback((tab: DiscoverTabType) => {
    setActiveTab(tab);
    // Check if we already have data for this tab
    const tabData = state[tab];
    if (!tabData || tabData.length === 0) {
      actions.fetchTabContent(tab, true);
    }
  }, [state, actions]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await actions.fetchTabContent(activeTab, true);
    setRefreshing(false);
  }, [activeTab, actions]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!state.loadingByTab[activeTab] && state.pagination[activeTab].hasMore) {
      actions.loadMoreContent(activeTab);
    }
  }, [activeTab, state, actions]);

  // Handle category press - Navigate to category browse page
  const handleCategoryPress = useCallback((category: CategoryCard) => {
    if (onCategoryPress) {
      onCategoryPress(category);
    } else {
      // Navigate to category page using slug route
      const categorySlug = category.categoryId || category.id;
      router.push(`/category/${categorySlug}` as any);
    }
  }, [router, onCategoryPress]);

  // Format views number
  const formatViews = (views: number | string): string => {
    if (typeof views === 'string') return views;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  // Check if URL is placeholder/dummy
  const isValidImageUrl = (url?: string): boolean => {
    if (!url) return false;
    const placeholderPatterns = ['placeholder', 'dummy', 'via.placeholder', 'example.com', 'lorem', 'ipsum'];
    return !placeholderPatterns.some(pattern => url.toLowerCase().includes(pattern));
  };

  // Get savings text from reel data
  const getSavingsText = (reel: DiscoverReel): string => {
    // Try to extract savings from products
    if (reel.products && reel.products.length > 0) {
      const product = reel.products[0];
      // Calculate savings from price difference
      if (product.price && product.salePrice) {
        const savings = product.price - product.salePrice;
        if (savings > 0) {
          return `Saved ₹${Math.floor(savings).toLocaleString()}!`;
        }
      }
      // Check for cashback
      if (product.cashbackPercent && product.salePrice) {
        const cashback = Math.floor((product.salePrice * product.cashbackPercent) / 100);
        if (cashback > 0) {
          return `Saved ₹${cashback.toLocaleString()}!`;
        }
      }
      // Check if there's a discount percentage
      if (product.price && product.salePrice) {
        const discountPercent = Math.floor(((product.price - product.salePrice) / product.price) * 100);
        if (discountPercent >= 20) {
          return `Best deal!`;
        }
      }
    }
    // Fallback based on engagement - higher views = better deal
    if (reel.engagement?.views) {
      const views = typeof reel.engagement.views === 'number' ? reel.engagement.views : 0;
      if (views > 50000) {
        return 'Best deal!';
      } else if (views > 20000) {
        return 'Great savings!';
      }
    }
    return 'Great deal!';
  };

  // Format count for likes/views
  const formatCount = (num: number | string | undefined): string => {
    if (!num) return '0';
    const count = typeof num === 'string' ? parseInt(num) : num;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Handle like toggle
  const handleLike = useCallback(async (reelId: string, e: any) => {
    e.stopPropagation();
    
    if (processingReels.has(reelId)) return;
    
    const isLiked = likedReels.has(reelId);
    
    // Optimistic update
    setLikedReels(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(reelId);
      } else {
        newSet.add(reelId);
      }
      return newSet;
    });
    setProcessingReels(prev => new Set(prev).add(reelId));

    try {
      const response = await realVideosApi.toggleVideoLike(reelId);
      if (!response.success) {
        // Revert on error
        setLikedReels(prev => {
          const newSet = new Set(prev);
          if (isLiked) {
            newSet.add(reelId);
          } else {
            newSet.delete(reelId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setLikedReels(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(reelId);
        } else {
          newSet.delete(reelId);
        }
        return newSet;
      });
    } finally {
      setProcessingReels(prev => {
        const newSet = new Set(prev);
        newSet.delete(reelId);
        return newSet;
      });
    }
  }, [likedReels, processingReels]);

  // Handle bookmark toggle
  const handleBookmark = useCallback(async (reelId: string, e: any) => {
    e.stopPropagation();
    
    if (processingReels.has(reelId)) return;
    
    const isBookmarked = bookmarkedReels.has(reelId);
    
    // Optimistic update
    setBookmarkedReels(prev => {
      const newSet = new Set(prev);
      if (isBookmarked) {
        newSet.delete(reelId);
      } else {
        newSet.add(reelId);
      }
      return newSet;
    });
    setProcessingReels(prev => new Set(prev).add(reelId));

    try {
      const response = await realVideosApi.toggleBookmark(reelId);
      if (!response.success) {
        // Revert on error
        setBookmarkedReels(prev => {
          const newSet = new Set(prev);
          if (isBookmarked) {
            newSet.add(reelId);
          } else {
            newSet.delete(reelId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert on error
      setBookmarkedReels(prev => {
        const newSet = new Set(prev);
        if (isBookmarked) {
          newSet.add(reelId);
        } else {
          newSet.delete(reelId);
        }
        return newSet;
      });
    } finally {
      setProcessingReels(prev => {
        const newSet = new Set(prev);
        newSet.delete(reelId);
        return newSet;
      });
    }
  }, [bookmarkedReels, processingReels]);

  // Handle shopping bag - navigate to product or add to cart
  const handleShoppingBag = useCallback((reel: DiscoverReel, e: any) => {
    e.stopPropagation();
    
    if (reel.products && reel.products.length > 0) {
      const product = reel.products[0];
      router.push(`/ProductPage?cardId=${product._id}&cardType=product&source=discover`);
    } else if (reel.store) {
      // Navigate to store page if no products
      router.push(`/store/${reel.store._id}` as any);
    }
  }, [router]);

  // Render horizontal scrollable cards for reels
  const renderReelsCards = useCallback(() => {
    const reels = state.reels.slice(0, 6); // Limit to 6 items
    const loading = state.loadingByTab['reels'];

    if (loading && reels.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading reels...</Text>
        </View>
      );
    }

    if (reels.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No reels available</Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
        style={styles.cardsScrollView}
      >
        {reels.map((reel) => {
          const savingsText = getSavingsText(reel);
          const views = formatViews(reel.engagement?.views || reel.metrics?.views || 0);
          const storeName = reel.store?.name || 'Store';
          const userName = reel.creator?.name || reel.creator?.username || 'User';
          const userAvatar = reel.creator?.avatar || '👤';
          const thumbnailUrl = reel.thumbnail || reel.products?.[0]?.image;
          const hasValidThumbnail = thumbnailUrl && isValidImageUrl(thumbnailUrl);

        return (
            <TouchableOpacity
              key={reel._id}
              style={styles.reelCard}
              onPress={() => {
                router.push({
                  pathname: '/UGCDetailScreen',
                  params: { item: JSON.stringify(reel) },
                });
              }}
              activeOpacity={0.9}
            >
              {/* Card Background with Thumbnail Image */}
              <View style={styles.cardBackground}>
                {/* Background Gradient - Always show as fallback */}
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.25)', 'rgba(5, 150, 105, 0.2)', 'rgba(245, 158, 11, 0.25)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                
                {/* Thumbnail Image - Only show if valid */}
                {hasValidThumbnail && thumbnailUrl && (
                  <View style={styles.thumbnailContainer}>
                    <Image
                      source={{ uri: thumbnailUrl }}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                      onError={() => {
                        // Image failed to load, will show gradient background
                      }}
                    />
                  </View>
                )}
                
                {/* Content Overlay - Light theme */}
                <LinearGradient
                  colors={hasValidThumbnail 
                    ? ['rgba(16, 185, 129, 0.12)', 'rgba(5, 150, 105, 0.1)', 'rgba(245, 158, 11, 0.12)']
                    : ['rgba(16, 185, 129, 0.08)', 'rgba(5, 150, 105, 0.06)', 'rgba(245, 158, 11, 0.08)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  {/* Border matching pattern */}
                  <View style={styles.cardBorder} />
                  
                  {/* Additional gradient overlay - Light theme */}
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.08)', 'transparent', 'rgba(245, 158, 11, 0.08)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  />

                {/* User Info Top Left */}
                <View style={styles.userInfo}>
                  {userAvatar && isValidImageUrl(userAvatar) ? (
                    <Image source={{ uri: userAvatar }} style={styles.userAvatarImage} />
                  ) : (
                    <Text style={styles.userAvatar}>{userAvatar}</Text>
                  )}
                  <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
                </View>

                {/* Action Icons Right Side */}
                <View style={styles.actionIcons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => handleLike(reel._id, e)}
                    activeOpacity={0.7}
                    disabled={processingReels.has(reel._id)}
                  >
                    <Ionicons 
                      name={likedReels.has(reel._id) ? "heart" : "heart-outline"} 
                      size={18} 
                      color={likedReels.has(reel._id) ? "#EF4444" : "#374151"} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => handleBookmark(reel._id, e)}
                    activeOpacity={0.7}
                    disabled={processingReels.has(reel._id)}
                  >
                    <Ionicons 
                      name={bookmarkedReels.has(reel._id) ? "bookmark" : "bookmark-outline"} 
                      size={18} 
                      color={bookmarkedReels.has(reel._id) ? REZ_COLORS.primaryGold : "#374151"} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => handleShoppingBag(reel, e)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="bag-outline" size={18} color="#374151" />
                  </TouchableOpacity>
                </View>

                {/* Play Button Center - Matching Rez_v-2-main pattern */}
                <View style={styles.playButtonContainer}>
                  {/* Glow ring */}
                  <View style={styles.playButtonGlowRing} />
                  {/* Play button */}
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={26} color="#FFFFFF" />
                  </View>
                </View>

                {/* Bottom Info */}
                <View style={styles.bottomInfo}>
                  <Text style={styles.savingsText}>{savingsText}</Text>
                  <View style={styles.storeInfo}>
                    <Text style={styles.storePrefix}>@</Text>
                    <Text style={styles.storeName} numberOfLines={1}>{storeName}</Text>
                    <Text style={styles.separator}> • </Text>
                    <Text style={styles.viewsText}>{views} views</Text>
                  </View>
                </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }, [state.reels, state.loadingByTab, router, likedReels, bookmarkedReels, processingReels, handleLike, handleBookmark, handleShoppingBag]);

  // Render horizontal scrollable cards for posts
  const renderPostsCards = useCallback(() => {
    const posts = state.posts.slice(0, 8);
    const loading = state.loadingByTab['posts'];

    if (loading && posts.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      );
    }

    if (posts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts available</Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
        style={styles.cardsScrollView}
      >
        {posts.map((post) => {
          const thumbnailUrl = post.thumbnail || post.mediaUrl;
          const isValidThumbnail = isValidImageUrl(thumbnailUrl);
          const likes = typeof post.engagement?.likes === 'number' 
            ? post.engagement.likes 
            : (Array.isArray(post.engagement?.likes) ? post.engagement.likes.length : 0);
          const views = post.engagement?.views || 0;
          const userName = post.creator?.name || post.creator?.username || 'User';
          const userAvatar = post.creator?.avatar;
          const productCount = post.products?.length || 0;

        return (
            <TouchableOpacity
              key={post._id}
              style={styles.reelCard}
              onPress={() => {
                if (post.type === 'video') {
                  router.push({
                    pathname: '/UGCDetailScreen',
                    params: { item: JSON.stringify(post) },
                  });
                } else if (post.products && post.products.length > 0) {
                  router.push(`/ProductPage?cardId=${post.products[0]._id}&cardType=product&source=discover`);
                }
              }}
              activeOpacity={0.9}
            >
              <View style={styles.cardBackground}>
                {/* Background Gradient - Always show as fallback */}
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.25)', 'rgba(5, 150, 105, 0.2)', 'rgba(245, 158, 11, 0.25)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                
                {/* Thumbnail Image - Only show if valid */}
                {isValidThumbnail && thumbnailUrl && (
                  <View style={styles.thumbnailContainer}>
                    <Image
                      source={{ uri: thumbnailUrl }}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                      onError={() => {
                        // Image failed to load, will show gradient background
                      }}
                    />
                  </View>
                )}
                
                <LinearGradient
                  colors={isValidThumbnail 
                    ? ['rgba(16, 185, 129, 0.12)', 'rgba(5, 150, 105, 0.1)', 'rgba(245, 158, 11, 0.12)']
                    : ['rgba(16, 185, 129, 0.08)', 'rgba(5, 150, 105, 0.06)', 'rgba(245, 158, 11, 0.08)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardBorder} />
                  <View style={styles.patternOverlay}>
                    <View style={[styles.glowCircle, { top: -40, right: -40, backgroundColor: REZ_COLORS.primaryGreen }]} />
                    <View style={[styles.glowCircle, { bottom: -30, left: -30, backgroundColor: REZ_COLORS.primaryGold }]} />
                  </View>
                  
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.08)', 'transparent', 'rgba(245, 158, 11, 0.08)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  />

                  <View style={styles.userInfo}>
                    {userAvatar && isValidImageUrl(userAvatar) ? (
                      <Image source={{ uri: userAvatar }} style={styles.userAvatarImage} />
                    ) : (
                      <Text style={styles.userAvatar}>👤</Text>
                    )}
                    <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
                  </View>

                  {post.type === 'video' && (
                    <View style={styles.playButtonContainer}>
                      <View style={styles.playButtonGlowRing} />
                      <View style={styles.playButton}>
                        <Ionicons name="play" size={26} color="#FFFFFF" />
                      </View>
                    </View>
                  )}

                  {post.isBrandPost && (
                    <View style={styles.brandBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
                      <Text style={styles.brandBadgeText}>Brand</Text>
                    </View>
                  )}

                  <View style={styles.bottomInfo}>
                    <Text style={styles.savingsText}>
                      {productCount > 0 ? `Shop ${productCount} items` : 'View post'}
                    </Text>
                    <View style={styles.storeInfo}>
                      <Ionicons name="heart" size={12} color="#EF4444" />
                      <Text style={styles.viewsText}>{formatCount(likes)}</Text>
                      <Text style={styles.separator}> • </Text>
                      <Text style={styles.viewsText}>{formatCount(views)} views</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }, [state.posts, state.loadingByTab, router]);

  // Render horizontal scrollable cards for articles
  const renderArticlesCards = useCallback(() => {
    const articles = state.articles.slice(0, 8);
    const loading = state.loadingByTab['articles'];

    if (loading && articles.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading articles...</Text>
        </View>
      );
    }

    if (articles.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No articles available</Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
        style={styles.cardsScrollView}
      >
        {articles.map((article) => {
          const isValidImage = isValidImageUrl(article.featuredImage);
          const views = article.engagement?.views || 0;
          const authorName = article.author?.name || article.author?.username || 'Author';
          const authorAvatar = article.author?.avatar;
          const productCount = article.products?.length || 0;

        return (
            <TouchableOpacity
              key={article._id}
              style={styles.reelCard}
              onPress={() => {
                if (article.products && article.products.length > 0) {
                  router.push(`/ProductPage?cardId=${article.products[0]._id}&cardType=product&source=discover`);
                }
              }}
              activeOpacity={0.9}
            >
              <View style={styles.cardBackground}>
                {/* Background Gradient - Always show as fallback */}
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.25)', 'rgba(5, 150, 105, 0.2)', 'rgba(245, 158, 11, 0.25)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                
                {/* Thumbnail Image - Only show if valid */}
                {isValidImage && article.featuredImage && (
                  <View style={styles.thumbnailContainer}>
                    <Image
                      source={{ uri: article.featuredImage }}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                      onError={() => {
                        // Image failed to load, will show gradient background
                      }}
                    />
                  </View>
                )}
                
                <LinearGradient
                  colors={isValidImage 
                    ? ['rgba(16, 185, 129, 0.12)', 'rgba(5, 150, 105, 0.1)', 'rgba(245, 158, 11, 0.12)']
                    : ['rgba(16, 185, 129, 0.08)', 'rgba(5, 150, 105, 0.06)', 'rgba(245, 158, 11, 0.08)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardBorder} />
                  <View style={styles.patternOverlay}>
                    <View style={[styles.glowCircle, { top: -40, right: -40, backgroundColor: REZ_COLORS.primaryGreen }]} />
                    <View style={[styles.glowCircle, { bottom: -30, left: -30, backgroundColor: REZ_COLORS.primaryGold }]} />
                  </View>
                  
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.08)', 'transparent', 'rgba(245, 158, 11, 0.08)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  />

                  <View style={styles.categoryBadgeTop}>
                    <Text style={styles.categoryBadgeText}>{article.category}</Text>
                  </View>

                  <View style={styles.bottomInfo}>
                    <Text style={styles.savingsText} numberOfLines={2}>{article.title}</Text>
                    <View style={styles.storeInfo}>
                      {authorAvatar && isValidImageUrl(authorAvatar) ? (
                        <Image source={{ uri: authorAvatar }} style={styles.authorAvatarSmall} />
                      ) : null}
                      <Text style={styles.storeName} numberOfLines={1}>{authorName}</Text>
                      {productCount > 0 && (
                        <>
                          <Text style={styles.separator}> • </Text>
                          <Ionicons name="bag-handle" size={10} color={REZ_COLORS.primaryGreen} />
                          <Text style={styles.viewsText}>{productCount}</Text>
                        </>
                      )}
                      <Text style={styles.separator}> • </Text>
                      <Text style={styles.viewsText}>{formatCount(views)} views</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }, [state.articles, state.loadingByTab, router]);

  // Render horizontal scrollable cards for images
  const renderImagesCards = useCallback(() => {
    const images = state.images.slice(0, 8);
    const loading = state.loadingByTab['images'];

    if (loading && images.length === 0) {
        return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading images...</Text>
        </View>
      );
    }

    if (images.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No images available</Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
        style={styles.cardsScrollView}
      >
        {images.map((image) => {
          const isValidImage = isValidImageUrl(image.imageUrl);
          const likes = typeof image.engagement?.likes === 'number' 
            ? image.engagement.likes 
            : (Array.isArray(image.engagement?.likes) ? image.engagement.likes.length : 0);
          const userName = image.creator?.name || image.creator?.username || 'User';
          const userAvatar = image.creator?.avatar;
          const productCount = image.products?.length || 0;

          return (
            <TouchableOpacity
              key={image._id}
              style={styles.reelCard}
              onPress={() => {
                if (image.products && image.products.length > 0) {
                  router.push(`/ProductPage?cardId=${image.products[0]._id}&cardType=product&source=discover`);
                }
              }}
              activeOpacity={0.9}
            >
              <View style={styles.cardBackground}>
                {/* Background Gradient - Always show as fallback */}
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.25)', 'rgba(5, 150, 105, 0.2)', 'rgba(245, 158, 11, 0.25)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                
                {/* Thumbnail Image - Only show if valid */}
                {isValidImage && image.imageUrl && (
                  <View style={styles.thumbnailContainer}>
                    <Image
                      source={{ uri: image.imageUrl }}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                      onError={() => {
                        // Image failed to load, will show gradient background
                      }}
                    />
                  </View>
                )}
                
                <LinearGradient
                  colors={isValidImage 
                    ? ['rgba(16, 185, 129, 0.12)', 'rgba(5, 150, 105, 0.1)', 'rgba(245, 158, 11, 0.12)']
                    : ['rgba(16, 185, 129, 0.08)', 'rgba(5, 150, 105, 0.06)', 'rgba(245, 158, 11, 0.08)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardBorder} />
                  <View style={styles.patternOverlay}>
                    <View style={[styles.glowCircle, { top: -40, right: -40, backgroundColor: REZ_COLORS.primaryGreen }]} />
                    <View style={[styles.glowCircle, { bottom: -30, left: -30, backgroundColor: REZ_COLORS.primaryGold }]} />
                  </View>
                  
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.08)', 'transparent', 'rgba(245, 158, 11, 0.08)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  />

                  {productCount > 0 && (
                    <View style={styles.shopBadgeTop}>
                      <Ionicons name="bag-handle" size={12} color="#FFFFFF" />
                      <Text style={styles.shopBadgeText}>Shop {productCount}</Text>
                    </View>
                  )}

                  <View style={styles.userInfo}>
                    {userAvatar && isValidImageUrl(userAvatar) ? (
                      <Image source={{ uri: userAvatar }} style={styles.userAvatarImage} />
                    ) : (
                      <Text style={styles.userAvatar}>👤</Text>
                    )}
                    <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
                  </View>

                  <View style={styles.bottomInfo}>
                    <Text style={styles.savingsText}>
                      {productCount > 0 ? `Shop ${productCount} products` : 'View image'}
                    </Text>
                    <View style={styles.storeInfo}>
                      <Ionicons name="heart" size={12} color="#EF4444" />
                      <Text style={styles.viewsText}>{formatCount(likes)}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }, [state.images, state.loadingByTab, router]);

  // Render active tab content - All tabs now use horizontal scroll
  const renderTabContent = useMemo(() => {
    const loading = state.loadingByTab[activeTab];

    return (
      <View style={styles.reelsContainer}>
        {activeTab === 'reels' && renderReelsCards()}
        {activeTab === 'posts' && renderPostsCards()}
        {activeTab === 'articles' && renderArticlesCards()}
        {activeTab === 'images' && renderImagesCards()}
      </View>
    );
  }, [activeTab, renderReelsCards, renderPostsCards, renderArticlesCards, renderImagesCards]);

  const containerStyle = useMemo(() => [
    styles.container,
    maxHeight ? { maxHeight, height: maxHeight } : undefined,
  ], [maxHeight]);

  return (
    <View style={containerStyle}>
      {/* Header with category cards */}
      {showHeader && (
        <DiscoverAndShopHeader
          categories={categories}
          onCategoryPress={handleCategoryPress}
          showCategories={showCategories}
        />
      )}

      {/* "Real people. Real savings." Header - Above tabs - Show for all tabs */}
      <View style={styles.savingsHeader}>
        <View style={styles.savingsHeaderLeft}>
          <Text style={styles.savingsTitle}>🔥 Real people. Real savings.</Text>
          <Text style={styles.savingsSubtitle}>Watch how others save with ReZ</Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => {
            // Navigate based on active tab
            if (activeTab === 'reels') {
              router.push('/social/reels' as any);
            } else if (activeTab === 'posts') {
              router.push('/social/posts' as any);
            } else if (activeTab === 'articles') {
              router.push('/social/articles' as any);
            } else if (activeTab === 'images') {
              router.push('/social/images' as any);
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View all</Text>
          <Ionicons name="chevron-forward" size={16} color={REZ_COLORS.primaryGreen} />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <DiscoverAndShopTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {renderTabContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginBottom: 80,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 0,
  },
  savingsHeaderLeft: {
    flex: 1,
    paddingRight: 20,
  },
  savingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  savingsSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '400',
    lineHeight: 18,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: REZ_COLORS.primaryGreen,
  },
  reelsContainer: {
    backgroundColor: '#F9FAFB',
    paddingTop: 12,
    paddingBottom: 28,
    marginBottom: 0,
  },
  cardsScrollView: {
    flexGrow: 0,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 4,
  },
  reelCard: {
    width: 180,
    height: 250,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 18,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: REZ_COLORS.primaryGreen,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardBackground: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  cardGradient: {
    flex: 1,
    position: 'relative',
    padding: 18,
    zIndex: 1,
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    pointerEvents: 'none',
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.12,
  },
  glowCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.35,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    zIndex: 10,
  },
  userAvatar: {
    fontSize: 22,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    letterSpacing: -0.2,
  },
  actionIcons: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -42 }],
    gap: 16,
    zIndex: 10,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(229, 231, 235, 0.95)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  playButtonContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    zIndex: 10,
  },
  playButtonGlowRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    ...Platform.select({
      ios: {
        shadowColor: REZ_COLORS.primaryGreen,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: REZ_COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 3,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: REZ_COLORS.primaryGreen,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(229, 231, 235, 0.7)',
  },
  savingsText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  storePrefix: {
    fontSize: 11,
    color: REZ_COLORS.primaryGreen,
    fontWeight: '700',
  },
  storeName: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
    flex: 1,
  },
  separator: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  viewsText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: REZ_COLORS.gray,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: REZ_COLORS.gray,
  },
  userAvatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  brandBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 192, 106, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 10,
  },
  brandBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  categoryBadgeTop: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 10,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  shopBadgeTop: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 192, 106, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 10,
  },
  shopBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  authorAvatarSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
  },
});
