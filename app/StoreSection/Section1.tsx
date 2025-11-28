import React, { useRef } from 'react';
import { View, Image, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { triggerImpact, triggerNotification } from "@/utils/haptics";
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import {
  Colors,
  Spacing,
  Shadows,
  BorderRadius,
  Typography,
  Timing,
} from '@/constants/DesignSystem';

interface Section1Props {
  dynamicData?: {
    title?: string;
    image?: string;
    category?: string;
    merchant?: string;
    [key: string]: any;
  } | null;
  cardType?: string;
}

export default function Section1({ dynamicData, cardType }: Section1Props) {
  const backgroundColor = useThemeColor({}, 'background');

  // Animation refs for image interactions
  const scaleAnims = useRef<Animated.Value[]>([]).current;

  // Initialize animation values for each image
  const getScaleAnim = (index: number) => {
    if (!scaleAnims[index]) {
      scaleAnims[index] = new Animated.Value(1);
    }
    return scaleAnims[index];
  };

  // Animation helper
  const animateScale = (animValue: Animated.Value, toValue: number) => {
    Animated.spring(animValue, {
      toValue,
      useNativeDriver: true,
      ...Timing.springBouncy,
    }).start();
  };

  // Handle image tap with haptic feedback
  const handleImagePress = (index: number) => {
    triggerImpact('Light');
    // Add full-screen image view logic here if needed
  };

  // Generate dynamic images based on store data
  const storeImages = dynamicData ? [
    {
      uri: dynamicData.image || dynamicData.logo || dynamicData.banner || 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=300&h=200&fit=crop',
      title: `${dynamicData.title || dynamicData.name || 'Store'} Gallery`
    },
    {
      uri: dynamicData.banner || dynamicData.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop',
      title: `${dynamicData.title || dynamicData.name || 'Store'} Interior`
    },
    {
      uri: dynamicData.logo || dynamicData.image || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop',
      title: `${dynamicData.category || 'Products'} Collection`
    },
  ] : [
    { uri: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=300&h=200&fit=crop', title: 'Store Gallery' },
    { uri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop', title: 'Store Interior' },
    { uri: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop', title: 'Products Collection' },
  ];

  return (
    <View
      style={[styles.container, { backgroundColor }]}
      accessibilityRole="region"
      accessibilityLabel={`${dynamicData ? dynamicData.title || 'Product' : 'Product'} gallery section`}
    >
      <ThemedText
        style={styles.title}
        accessibilityRole="header"
      >
        {dynamicData ? `${dynamicData.title || dynamicData.name || 'Store'} Gallery` : 'Store Gallery'}
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        accessibilityLabel={`Horizontal scrolling gallery with ${storeImages.length} images`}
        accessibilityRole="list"
      >
        {storeImages.map((item, index) => {
          const scaleAnim = getScaleAnim(index);
          return (
            <Animated.View
              key={index}
              style={{ transform: [{ scale: scaleAnim }] }}
            >
              <TouchableOpacity
                style={styles.imageContainer}
                activeOpacity={0.8}
                onPress={() => handleImagePress(index)}
                onPressIn={() => animateScale(scaleAnim, 0.96)}
                onPressOut={() => animateScale(scaleAnim, 1)}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}. Image ${index + 1} of ${storeImages.length}`}
                accessibilityHint="Double tap to view full screen"
              >
                <Image
                  source={{ uri: item.uri }}
                  style={styles.image}
                  accessibilityIgnoresInvertColors
                />
                <View style={styles.imageOverlay}>
                  <ThemedText style={styles.imageTitle}>{item.title}</ThemedText>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
);
}

const styles = StyleSheet.create({
  // Modern Container
  container: {
    paddingVertical: Spacing['2xl'] - 8,
  },

  // Modern Typography
  title: {
    ...Typography.h3,
    fontWeight: '700',
    marginBottom: Spacing.lg,
    marginLeft: Spacing['2xl'] - 4,
    letterSpacing: -0.3,
    color: Colors.text.primary,
  },

  // Modern Scroll Container
  scrollContainer: {
    marginHorizontal: 0,
  },
  scrollContent: {
    paddingHorizontal: Spacing['2xl'] - 4,
    gap: Spacing.lg,
  },

  // Modern Image Container with Strong Shadow
  imageContainer: {
    position: 'relative',
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.strong,
  },
  image: {
    width: 240,
    height: 150,
  },

  // Modern Image Overlay
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
  },
  imageTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text.white,
  },
});
