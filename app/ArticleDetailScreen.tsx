// ArticleDetailScreen.tsx - Modern Article Reader with Markdown Support
import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { useCart } from '@/contexts/CartContext';
import { useRegion } from '@/contexts/RegionContext';
import { DiscoverArticle, DiscoverProduct } from '@/types/discover.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  blue: '#3B82F6',
};

// Simple Markdown-like content renderer
const renderContent = (content: string) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let inList = false;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <View key={`list-${elements.length}`} style={markdownStyles.list}>
          {listItems.map((item, idx) => (
            <View key={idx} style={markdownStyles.listItem}>
              <Text style={markdownStyles.bullet}>•</Text>
              <Text style={markdownStyles.listText}>{parseBoldText(item)}</Text>
            </View>
          ))}
        </View>
      );
      listItems = [];
    }
    inList = false;
  };

  // Parse bold text within a string
  const parseBoldText = (text: string): React.ReactNode => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    if (parts.length === 1) return text;

    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <Text key={idx} style={markdownStyles.bold}>{part}</Text>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) {
      flushList();
      elements.push(<View key={`space-${index}`} style={markdownStyles.spacer} />);
      return;
    }

    // H1 - Main heading
    if (trimmedLine.startsWith('# ')) {
      flushList();
      const text = trimmedLine.substring(2);
      elements.push(
        <Text key={index} style={markdownStyles.h1}>{text}</Text>
      );
      return;
    }

    // H2 - Section heading
    if (trimmedLine.startsWith('## ')) {
      flushList();
      const text = trimmedLine.substring(3);
      elements.push(
        <Text key={index} style={markdownStyles.h2}>{text}</Text>
      );
      return;
    }

    // H3 - Subsection heading
    if (trimmedLine.startsWith('### ')) {
      flushList();
      const text = trimmedLine.substring(4);
      elements.push(
        <Text key={index} style={markdownStyles.h3}>{text}</Text>
      );
      return;
    }

    // List item
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      inList = true;
      listItems.push(trimmedLine.substring(2));
      return;
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmedLine)) {
      inList = true;
      listItems.push(trimmedLine.replace(/^\d+\.\s/, ''));
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <Text key={index} style={markdownStyles.paragraph}>
        {parseBoldText(trimmedLine)}
      </Text>
    );
  });

  // Flush any remaining list
  flushList();

  return elements;
};

const markdownStyles = StyleSheet.create({
  h1: {
    fontSize: 24,
    fontWeight: '700',
    color: REZ_COLORS.navy,
    marginTop: 24,
    marginBottom: 12,
    lineHeight: 32,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    color: REZ_COLORS.navy,
    marginTop: 20,
    marginBottom: 10,
    lineHeight: 28,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600',
    color: REZ_COLORS.black,
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 24,
  },
  paragraph: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    marginBottom: 12,
  },
  bold: {
    fontWeight: '700',
    color: REZ_COLORS.black,
  },
  list: {
    marginVertical: 8,
    paddingLeft: 4,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 16,
  },
  bullet: {
    fontSize: 16,
    color: REZ_COLORS.primaryGreen,
    marginRight: 10,
    fontWeight: '700',
  },
  listText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  spacer: {
    height: 8,
  },
});

export default function ArticleDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();

  // State
  const [article, setArticle] = useState<DiscoverArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Engagement state
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Contexts
  const { addItem } = useCart();

  // Parse params
  useEffect(() => {
    if (params.item && typeof params.item === 'string') {
      try {
        const parsedItem = JSON.parse(params.item) as DiscoverArticle;
        setArticle(parsedItem);
        setLikesCount(parsedItem.engagement?.likes || 0);
        setLoading(false);
      } catch (err) {
        console.error('Failed to parse article param:', err);
        setError('Failed to load article');
        setLoading(false);
      }
    } else {
      setError('No article data provided');
      setLoading(false);
    }
  }, [params.item]);

  // Handle like toggle
  const handleLike = useCallback(() => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
  }, [isLiked]);

  // Handle bookmark toggle
  const handleBookmark = useCallback(() => {
    setIsBookmarked(prev => !prev);
  }, []);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!article) return;
    try {
      await Share.share({
        message: `Check out this article on ReZ: ${article.title}`,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [article]);

  // Navigate to product
  const handleProductPress = useCallback((product: DiscoverProduct) => {
    router.push(`/ProductPage?cardId=${product._id}&cardType=product&source=article`);
  }, [router]);

  // Add to cart
  const handleAddToCart = useCallback(async (product: DiscoverProduct) => {
    try {
      await addItem({ productId: product._id, quantity: 1 });
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

  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get author display info
  const getAuthorInfo = useMemo(() => {
    if (!article?.author) return { name: '', avatar: null };
    const name = article.author.name || article.author.username || '';
    const avatar = article.author.avatar || article.author.profile?.avatar;
    const defaultAvatar = name
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&size=100`
      : null;
    return { name, avatar: avatar || defaultAvatar };
  }, [article]);

  // Get image URL - skip if it looks like a video
  const imageUrl = useMemo(() => {
    if (!article?.featuredImage) return null;
    const url = article.featuredImage;
    // Skip video URLs
    if (url.includes('.mp4') || url.includes('.webm') || url.includes('video')) {
      return null;
    }
    return url;
  }, [article]);

  const hasProducts = article?.products && article.products.length > 0;

  // Rendered content
  const renderedContent = useMemo(() => {
    if (!article) return null;
    // Combine excerpt and content
    const fullContent = [article.excerpt, article.content].filter(Boolean).join('\n\n');
    return renderContent(fullContent);
  }, [article]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={REZ_COLORS.blue} />
        <Text style={styles.loadingText}>Loading article...</Text>
      </View>
    );
  }

  if (error || !article) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" />
        <Ionicons name="alert-circle-outline" size={64} color={REZ_COLORS.gray} />
        <Text style={styles.errorText}>{error || 'Article not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Floating Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={REZ_COLORS.black} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleBookmark}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
              color={isBookmarked ? REZ_COLORS.primaryGold : REZ_COLORS.black}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={22} color={REZ_COLORS.black} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Featured Image */}
        {imageUrl && (
          <View style={styles.imageContainer}>
            {!imageLoaded && !imageError && (
              <View style={styles.imagePlaceholder}>
                <ActivityIndicator size="large" color={REZ_COLORS.blue} />
              </View>
            )}
            {!imageError && (
              <Image
                source={{ uri: imageUrl }}
                style={[styles.featuredImage, !imageLoaded && styles.hiddenImage]}
                resizeMode="cover"
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageLoaded(true);
                  setImageError(true);
                }}
              />
            )}
            {/* Gradient overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)']}
              style={styles.imageGradient}
            />
          </View>
        )}

        {/* Article Content */}
        <View style={styles.contentContainer}>
          {/* Category Badge */}
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{article.category}</Text>
            </View>
            {article.readTime && (
              <View style={styles.readTimeBadge}>
                <Ionicons name="time-outline" size={14} color={REZ_COLORS.gray} />
                <Text style={styles.readTimeText}>{article.readTime} min read</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{article.title}</Text>

          {/* Author & Date Row */}
          <View style={styles.authorRow}>
            {getAuthorInfo.avatar && (
              <Image source={{ uri: getAuthorInfo.avatar }} style={styles.authorAvatar} />
            )}
            <View style={styles.authorInfo}>
              {getAuthorInfo.name ? (
                <Text style={styles.authorName}>{getAuthorInfo.name}</Text>
              ) : null}
              <Text style={styles.dateText}>
                {formatDate(article.publishedAt || article.createdAt)}
              </Text>
            </View>
          </View>

          {/* Engagement Stats */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statItem} onPress={handleLike} activeOpacity={0.7}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={20}
                color={isLiked ? "#EF4444" : REZ_COLORS.gray}
              />
              <Text style={styles.statText}>{formatCount(likesCount)}</Text>
            </TouchableOpacity>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={20} color={REZ_COLORS.gray} />
              <Text style={styles.statText}>{formatCount(article.engagement?.views || 0)}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="bookmark-outline" size={20} color={REZ_COLORS.gray} />
              <Text style={styles.statText}>{formatCount(article.engagement?.bookmarks || 0)}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Article Body - Rendered Markdown */}
          <View style={styles.articleBody}>
            {renderedContent}
          </View>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.tagsSectionTitle}>Related Topics</Text>
              <View style={styles.tagsContainer}>
                {article.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Products Section */}
          {hasProducts && (
            <View style={styles.productsSection}>
              <View style={styles.productsSectionHeader}>
                <Ionicons name="bag-handle" size={22} color={REZ_COLORS.primaryGreen} />
                <Text style={styles.productsSectionTitle}>Shop Featured Products</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsScrollContainer}
              >
                {article.products.map((product, index) => (
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
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: insets.bottom + 40 }} />
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
    backgroundColor: REZ_COLORS.blue,
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
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 220,
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
  featuredImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  hiddenImage: {
    opacity: 0,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  contentContainer: {
    padding: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  categoryBadge: {
    backgroundColor: REZ_COLORS.blue,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryBadgeText: {
    color: REZ_COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  readTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTimeText: {
    fontSize: 13,
    color: REZ_COLORS.gray,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: REZ_COLORS.navy,
    lineHeight: 34,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: REZ_COLORS.black,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    color: REZ_COLORS.gray,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: REZ_COLORS.gray,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
  articleBody: {
    marginBottom: 24,
  },
  tagsSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  tagsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: REZ_COLORS.gray,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    color: REZ_COLORS.blue,
    fontWeight: '500',
  },
  productsSection: {
    marginTop: 8,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  productsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  productsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: REZ_COLORS.black,
  },
  productsScrollContainer: {
    gap: 12,
  },
  productCard: {
    width: 160,
    backgroundColor: REZ_COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  productImage: {
    width: '100%',
    height: 140,
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
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '600',
    color: REZ_COLORS.primaryGreen,
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 60,
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
