// Image Optimization Utilities
// Performance utilities for lazy loading and optimizing game assets

import { Image, Platform } from 'react-native';

/**
 * Image cache for preloaded images
 */
const imageCache = new Map<string, boolean>();

/**
 * Preload image
 * Loads image into memory for faster rendering
 */
export const preloadImage = async (source: string | number): Promise<boolean> => {
  const cacheKey = typeof source === 'string' ? source : source.toString();

  // Check if already cached
  if (imageCache.has(cacheKey)) {
    return true;
  }

  try {
    if (typeof source === 'string') {
      // Network image
      await Image.prefetch(source);
    } else {
      // Local asset - use Image.resolveAssetSource
      const resolved = Image.resolveAssetSource(source);
      if (resolved?.uri) {
        await Image.prefetch(resolved.uri);
      }
    }

    imageCache.set(cacheKey, true);
    console.log(`🖼️ [IMAGE_OPT] Preloaded image: ${cacheKey}`);
    return true;
  } catch (error) {
    console.error(`❌ [IMAGE_OPT] Failed to preload image: ${cacheKey}`, error);
    return false;
  }
};

/**
 * Preload multiple images
 */
export const preloadImages = async (sources: (string | number)[]): Promise<boolean[]> => {
  console.log(`🖼️ [IMAGE_OPT] Preloading ${sources.length} images...`);
  const results = await Promise.all(sources.map(preloadImage));
  const successCount = results.filter(r => r).length;
  console.log(`✅ [IMAGE_OPT] Preloaded ${successCount}/${sources.length} images`);
  return results;
};

/**
 * Clear image cache
 */
export const clearImageCache = (): void => {
  imageCache.clear();
  console.log('🧹 [IMAGE_OPT] Image cache cleared');
};

/**
 * Check if image is cached
 */
export const isImageCached = (source: string | number): boolean => {
  const cacheKey = typeof source === 'string' ? source : source.toString();
  return imageCache.has(cacheKey);
};

/**
 * Get optimized image URI
 * Adds optimization parameters for web images
 */
export const getOptimizedImageUri = (
  uri: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): string => {
  if (Platform.OS === 'web') {
    // For web, we can add query parameters for image optimization
    const url = new URL(uri);
    if (options.width) url.searchParams.set('w', options.width.toString());
    if (options.height) url.searchParams.set('h', options.height.toString());
    if (options.quality) url.searchParams.set('q', options.quality.toString());
    if (options.format) url.searchParams.set('fm', options.format);
    return url.toString();
  }

  // For native, return original URI
  // Image optimization would need to be done server-side
  return uri;
};

/**
 * Get image dimensions without loading full image
 */
export const getImageDimensions = (
  source: string | number
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    if (typeof source === 'number') {
      // Local asset
      const resolved = Image.resolveAssetSource(source);
      if (resolved) {
        resolve({ width: resolved.width, height: resolved.height });
      } else {
        reject(new Error('Failed to resolve asset source'));
      }
    } else {
      // Network image
      Image.getSize(
        source,
        (width, height) => resolve({ width, height }),
        error => reject(error)
      );
    }
  });
};

/**
 * Calculate aspect ratio
 */
export const calculateAspectRatio = (width: number, height: number): number => {
  return width / height;
};

/**
 * Calculate scaled dimensions maintaining aspect ratio
 */
export const calculateScaledDimensions = (
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  targetHeight?: number
): { width: number; height: number } => {
  const aspectRatio = calculateAspectRatio(originalWidth, originalHeight);

  if (targetWidth && targetHeight) {
    // Both dimensions provided - use target dimensions
    return { width: targetWidth, height: targetHeight };
  } else if (targetWidth) {
    // Only width provided - calculate height
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio),
    };
  } else if (targetHeight) {
    // Only height provided - calculate width
    return {
      width: Math.round(targetHeight * aspectRatio),
      height: targetHeight,
    };
  } else {
    // No target dimensions - return original
    return { width: originalWidth, height: originalHeight };
  }
};

/**
 * Image placeholder generator
 * Creates a data URI for a colored placeholder
 */
export const generatePlaceholder = (
  width: number,
  height: number,
  color: string = '#E5E7EB'
): string => {
  if (Platform.OS === 'web') {
    // For web, use SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="${color}"/>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  // For native, return a simple data URI
  return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
};

/**
 * Lazy image loader
 * Returns a promise that resolves when image is loaded
 */
export const lazyLoadImage = (source: string | number): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof source === 'number') {
      // Local asset - resolve immediately
      resolve();
    } else {
      // Network image - prefetch
      Image.prefetch(source)
        .then(() => resolve())
        .catch(reject);
    }
  });
};

/**
 * Game asset preloader
 * Preloads all game-related assets
 */
export const preloadGameAssets = async (): Promise<void> => {
  console.log('🎮 [IMAGE_OPT] Preloading game assets...');

  // Define game assets to preload
  const gameAssets = [
    // Add your game asset paths here
    // require('@/assets/images/games/spin-wheel.png'),
    // require('@/assets/images/games/scratch-card.png'),
    // require('@/assets/images/games/quiz.png'),
  ];

  if (gameAssets.length > 0) {
    await preloadImages(gameAssets);
  }

  console.log('✅ [IMAGE_OPT] Game assets preloaded');
};

/**
 * Badge and icon preloader
 * Preloads badge and icon assets
 */
export const preloadBadgeAssets = async (): Promise<void> => {
  console.log('🏆 [IMAGE_OPT] Preloading badge assets...');

  const badgeAssets = [
    // Add your badge asset paths here
    // require('@/assets/images/badges/bronze.png'),
    // require('@/assets/images/badges/silver.png'),
    // require('@/assets/images/badges/gold.png'),
  ];

  if (badgeAssets.length > 0) {
    await preloadImages(badgeAssets);
  }

  console.log('✅ [IMAGE_OPT] Badge assets preloaded');
};

/**
 * Get image cache stats
 */
export const getImageCacheStats = (): {
  cachedImages: string[];
  cacheSize: number;
} => {
  return {
    cachedImages: Array.from(imageCache.keys()),
    cacheSize: imageCache.size,
  };
};

/**
 * Optimize image for gamification
 * Returns optimized image props
 */
export const getOptimizedImageProps = (
  source: string | number,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
) => {
  const imageProps: any = {
    source: typeof source === 'string'
      ? { uri: getOptimizedImageUri(source, options) }
      : source,
    resizeMode: 'contain' as const,
  };

  // Add dimensions if provided
  if (options.width) {
    imageProps.style = { ...imageProps.style, width: options.width };
  }
  if (options.height) {
    imageProps.style = { ...imageProps.style, height: options.height };
  }

  // Enable fast image on Android
  if (Platform.OS === 'android') {
    imageProps.fadeDuration = 0;
  }

  return imageProps;
};
