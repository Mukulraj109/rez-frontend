// Transformation utilities for converting backend video data to frontend UGC format
import { Video } from '@/services/realVideosApi';
import { UGCVideoItem, Product, ContentType } from '@/types/playPage.types';

/**
 * Format view count for display (e.g., 2.5K, 1.2L)
 */
export function formatViewCount(views: number): string {
  if (views >= 100000) {
    return `${(views / 100000).toFixed(1)}L`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}

/**
 * Determine content type from video data
 * Uses contentType field from backend, with fallback logic
 */
function determineContentType(video: Video): ContentType {
  // Use contentType from backend if available
  if (video.contentType) {
    // Map backend contentType to frontend ContentType
    if (video.contentType === 'article_video') {
      return 'article';
    }
    return video.contentType as ContentType;
  }

  // Fallback: determine from category (legacy support)
  if (video.category === 'article') {
    return 'article';
  }

  return 'ugc';
}

/**
 * Transform backend Video to frontend UGCVideoItem
 */
export function transformVideoToUGC(video: Video, currentUserId?: string): UGCVideoItem {
  try {
    console.log(`🔄 [Transformer] Starting transformation for video:`, video._id);

    // Safely transform products
    let transformedProducts: Product[] = [];
    try {
      transformedProducts = transformProducts(video.products || []);
      console.log(`✅ [Transformer] Products transformed: ${transformedProducts.length} products`);
    } catch (productError) {
      console.error(`❌ [Transformer] Product transformation failed:`, productError);
      transformedProducts = [];
    }

    // Build the UGC video item
    const ugcItem: UGCVideoItem = {
      id: video._id,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnail,
      viewCount: formatViewCount(video.engagement?.views || 0),
      description: video.description || '',
      hashtags: video.hashtags || [],
      productCount: video.products?.length || 0,
      category: video.category,
      contentType: determineContentType(video), // Use contentType from backend
      isLiked: currentUserId ? (video.engagement?.likes || []).includes(currentUserId) : false,
      products: transformedProducts,
      author: video.creator
        ? `${video.creator.profile?.firstName || ''} ${video.creator.profile?.lastName || ''}`.trim() || 'Unknown'
        : 'Unknown',
      authorAvatar: video.creator?.profile?.avatar,
      duration: video.metadata?.duration,
      createdAt: video.createdAt, // Keep as string, don't convert to Date
      likes: video.engagement?.likes?.length || 0,
      shares: video.engagement?.shares || 0
    };

    console.log(`✅ [Transformer] Video transformation complete:`, ugcItem.id);
    return ugcItem;
  } catch (error) {
    console.error(`❌ [Transformer] CRITICAL ERROR transforming video ${video._id}:`, error);
    console.error(`❌ [Transformer] Video data:`, JSON.stringify(video, null, 2));
    throw error;
  }
}

/**
 * Transform array of backend Videos to UGCVideoItems
 */
export function transformVideosToUGC(videos: Video[], currentUserId?: string): UGCVideoItem[] {
  try {
    console.log(`🔄 [Transformer] Starting batch transformation: ${videos.length} videos`);

    const transformed = videos.map((video, index) => {
      try {
        return transformVideoToUGC(video, currentUserId);
      } catch (error) {
        console.error(`❌ [Transformer] Failed to transform video at index ${index}:`, error);
        throw error; // Re-throw to stop the batch
      }
    });

    console.log(`✅ [Transformer] Batch transformation complete: ${transformed.length} videos`);
    return transformed;
  } catch (error) {
    console.error(`❌ [Transformer] BATCH TRANSFORMATION FAILED:`, error);
    throw error;
  }
}

/**
 * Transform backend product data to frontend Product format
 */
function transformProducts(products: any[]): Product[] {
  try {
    if (!products || !Array.isArray(products)) {
      console.log(`⚠️ [Transformer] No products to transform`);
      return [];
    }

    console.log(`🔄 [Transformer] Transforming ${products.length} products`);

    const transformed = products.map((product, index) => {
      try {
        // Extract price from various possible formats:
        // 1. Backend API format: product.pricing.basePrice
        // 2. Direct format: product.basePrice
        // 3. Alternative: product.price
        let priceValue = 0;

        if (product.pricing?.basePrice !== undefined) {
          // Backend API format (nested pricing)
          priceValue = product.pricing.basePrice;
          console.log(`📦 [Transformer] Product ${index} price from pricing.basePrice: ${priceValue}`);
        } else if (product.pricing?.salePrice !== undefined) {
          priceValue = product.pricing.salePrice;
          console.log(`📦 [Transformer] Product ${index} price from pricing.salePrice: ${priceValue}`);
        } else if (product.basePrice !== undefined) {
          // Direct basePrice field
          priceValue = product.basePrice;
          console.log(`📦 [Transformer] Product ${index} price from basePrice: ${priceValue}`);
        } else if (product.salePrice !== undefined) {
          priceValue = product.salePrice;
          console.log(`📦 [Transformer] Product ${index} price from salePrice: ${priceValue}`);
        } else if (product.price?.current !== undefined) {
          // New format: price object with current/original
          priceValue = product.price.current;
          console.log(`📦 [Transformer] Product ${index} price from price.current: ${priceValue}`);
        } else if (product.price?.original !== undefined) {
          priceValue = product.price.original;
          console.log(`📦 [Transformer] Product ${index} price from price.original: ${priceValue}`);
        } else if (typeof product.price === 'number') {
          priceValue = product.price;
          console.log(`📦 [Transformer] Product ${index} price from price (number): ${priceValue}`);
        } else {
          console.warn(`⚠️ [Transformer] Product ${index} has no price field! Product data:`, JSON.stringify(product, null, 2));
        }

        const transformed = {
          id: product._id || product.id || '',
          _id: product._id || product.id || '',
          title: product.name || 'Unknown Product',
          name: product.name || 'Unknown Product',
          price: formatPrice(priceValue),
          image: product.images?.[0] || product.image || '',
          images: product.images || [],
          rating: product.rating?.average || product.rating || undefined,
          category: product.category || undefined,
          cashbackText: product.cashbackText || undefined,
          description: product.description || '',
          store: product.store || undefined,
          // Preserve original backend data for UGCDetailScreen to access
          pricing: product.pricing || product.price, // Support both formats
          inventory: product.inventory
        };
        console.log(`✅ [Transformer] Product ${index} transformed: ${transformed.title} - ${transformed.price}`);
        return transformed;
      } catch (error) {
        console.error(`❌ [Transformer] Failed to transform product at index ${index}:`, error);
        console.error(`❌ [Transformer] Product data:`, product);
        throw error;
      }
    });

    return transformed;
  } catch (error) {
    console.error(`❌ [Transformer] PRODUCT TRANSFORMATION FAILED:`, error);
    throw error;
  }
}

/**
 * Format price for display (e.g., ₹2,999)
 */
function formatPrice(price: number | undefined | null): string {
  const numPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
  return `₹${numPrice.toLocaleString('en-IN')}`;
}

/**
 * Get featured video from videos array
 */
export function getFeaturedVideo(videos: Video[], currentUserId?: string): UGCVideoItem | undefined {
  try {
    console.log(`🔄 [Transformer] Looking for featured video in ${videos.length} videos`);
    const featured = videos.find(v => v.isFeatured);

    if (featured) {
      console.log(`✅ [Transformer] Featured video found:`, featured._id);
      return transformVideoToUGC(featured, currentUserId);
    } else {
      console.log(`⚠️ [Transformer] No featured video found`);
      return undefined;
    }
  } catch (error) {
    console.error(`❌ [Transformer] Failed to get featured video:`, error);
    return undefined;
  }
}
