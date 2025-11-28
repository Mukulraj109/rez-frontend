/**
 * FastImage Component - Simplified Optimized Image
 *
 * A lightweight alternative to OptimizedImage with no external dependencies
 * Features: Lazy loading, fade-in, error handling, loading state
 */

import React, { useState, useCallback, memo } from 'react';
import { Image, View, StyleSheet, ActivityIndicator, Animated, ImageProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FastImageProps extends Omit<ImageProps, 'source'> {
  source: string | { uri: string };
  width?: number;
  height?: number;
  fadeDuration?: number;
  showLoader?: boolean;
}

const FastImage = memo(({
  source,
  width,
  height,
  fadeDuration = 300,
  showLoader = true,
  style,
  ...props
}: FastImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [opacity] = useState(new Animated.Value(0));

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    // Fade in animation
    Animated.timing(opacity, {
      toValue: 1,
      duration: fadeDuration,
      useNativeDriver: true,
    }).start();
  }, [fadeDuration, opacity]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // Get source URI
  const imageSource = typeof source === 'string' ? { uri: source } : source;

  // Container style
  const containerStyle = [
    styles.container,
    width && height && { width, height },
    style,
  ];

  // Error fallback
  if (hasError) {
    return (
      <View style={[containerStyle, styles.errorContainer]}>
        <Ionicons name="image-outline" size={Math.min(width || 32, height || 32) / 2} color="#9CA3AF" />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {/* Loading indicator */}
      {isLoading && showLoader && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#7C3AED" />
        </View>
      )}

      {/* Image */}
      <Animated.Image
        source={imageSource}
        style={[
          StyleSheet.absoluteFill,
          style,
          { opacity },
        ]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        {...props}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  const prevUri = typeof prevProps.source === 'object' ? prevProps.source.uri : prevProps.source;
  const nextUri = typeof nextProps.source === 'object' ? nextProps.source.uri : nextProps.source;

  return (
    prevUri === nextUri &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height
  );
});

FastImage.displayName = 'FastImage';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});

export default FastImage;
