import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { triggerImpact, triggerNotification } from "@/utils/haptics";
import { ThemedText } from '@/components/ThemedText';
import wishlistApi from '@/services/wishlistApi';
import { platformAlert } from '@/utils/platformAlert';
import {
  Colors,
  Spacing,
  Shadows,
  BorderRadius,
  Typography,
  IconSize,
  Timing,
} from '@/constants/DesignSystem';

interface Section5Props {
  dynamicData?: {
    id?: string;
    _id?: string;
    title?: string;
    name?: string;
    price?: number;
    pricing?: {
      selling?: number;
    };
  } | null;
  cardType?: string;
}

export default function Section5({ dynamicData, cardType }: Section5Props) {
  const [isSaving, setIsSaving] = useState(false);

  // Animation ref for button interaction
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  // Animation helper
  const animateScale = (animValue: Animated.Value, toValue: number) => {
    Animated.spring(animValue, {
      toValue,
      useNativeDriver: true,
      ...Timing.springBouncy,
    }).start();
  };

  const handleSaveDeal = async () => {
    // Haptic feedback on button press
    triggerImpact('Medium');

    try {
      setIsSaving(true);

      const productId = dynamicData?.id || dynamicData?._id;
      if (!productId) {
        platformAlert('Error', 'Product information not available');
        return;
      }

      // Check if item already exists in wishlist
      const checkResponse = await wishlistApi.checkWishlistStatus('product', productId);

      if (checkResponse.success && checkResponse.data?.inWishlist) {
        // Item already in wishlist
        platformAlert('Already Saved', 'This deal is already in your wishlist');
        return;
      }

      // Add to wishlist/saved deals
      const response = await wishlistApi.addToWishlist({
        itemType: 'product',
        itemId: productId,
        notes: `Saved at ₹${dynamicData?.price || dynamicData?.pricing?.selling || 0}`,
        priority: 'medium'
      });

      if (response.success) {
        // Success haptic feedback
        triggerNotification('Success');
        platformAlert(
          'Deal Saved!',
          `${dynamicData?.title || dynamicData?.name || 'This deal'} has been saved to your wishlist`
        );
      } else {
        // Error haptic feedback
        triggerNotification('Error');
        platformAlert('Error', response.message || 'Failed to save deal');
      }
    } catch (error) {
      // Error haptic feedback
      triggerNotification('Error');
      platformAlert('Error', 'Unable to save deal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View
      style={styles.container}
      accessibilityRole="region"
      accessibilityLabel="Save deal action"
    >
      <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.button, isSaving && styles.buttonDisabled]}
          onPress={handleSaveDeal}
          onPressIn={() => animateScale(buttonScaleAnim, 0.96)}
          onPressOut={() => animateScale(buttonScaleAnim, 1)}
          disabled={isSaving}
          accessibilityRole="button"
          accessibilityLabel={isSaving ? 'Saving deal to wishlist' : `Save ${dynamicData?.title || dynamicData?.name || 'this deal'} for later`}
          accessibilityHint="Double tap to save this deal to your wishlist"
          accessibilityState={{ disabled: isSaving, busy: isSaving }}
        >
          <View style={styles.iconContainer} accessibilityElementsHidden>
            <Ionicons
              name={isSaving ? 'hourglass-outline' : 'bookmark-outline'}
              size={IconSize.lg}
              color={Colors.primary[600]}
            />
          </View>
          <View style={styles.textContainer}>
            <ThemedText style={styles.title}>
              {isSaving ? 'Saving...' : 'Save Deal for Later'}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Keep this offer saved in your list
            </ThemedText>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Modern Container
  container: {
    paddingHorizontal: Spacing['2xl'] - 4,
    paddingVertical: Spacing.base,
    backgroundColor: Colors.background.primary,
  },

  // Modern Button with Purple Tint
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.purpleLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.subtle,
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Modern Icon Container
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },

  textContainer: {
    flex: 1,
  },

  // Modern Typography
  title: {
    ...Typography.h4,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs - 1,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.gray[600],
  },
});
