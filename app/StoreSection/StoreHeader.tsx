import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Animated, ActivityIndicator, Share, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { triggerImpact, triggerNotification } from "@/utils/haptics";
import { ThemedText } from '@/components/ThemedText';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import wishlistApi from '@/services/wishlistApi';
import walletApi from '@/services/walletApi';
import {
  Colors,
  Spacing,
  BorderRadius,
  IconSize,
  Timing,
} from '@/constants/DesignSystem';

interface StoreHeaderProps {
  dynamicData?: {
    id?: string;
    _id?: string;
    title?: string;
    name?: string;
    description?: string;
    image?: string;
    merchant?: string;
    category?: string;
    rating?: number;
    section?: string;
    [key: string]: any;
  } | null;
  cardType?: string;
}

export default function StoreHeader({ dynamicData, cardType }: StoreHeaderProps) {
  const router = useRouter();
  const { refreshWishlist } = useWishlist();
  const { state: authState } = useAuth();

  // Coin balance state - fetch directly from wallet like homepage does
  const [coinCount, setCoinCount] = useState(0);
  const [isLoadingCoins, setIsLoadingCoins] = useState(true);

  // Wishlist state
  const [isSaved, setIsSaved] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // Animation refs
  const backScaleAnim = useRef(new Animated.Value(1)).current;
  const shareScaleAnim = useRef(new Animated.Value(1)).current;
  const cartScaleAnim = useRef(new Animated.Value(1)).current;
  const heartScaleAnim = useRef(new Animated.Value(1)).current;

  // Get product ID
  const productId = dynamicData?.id || dynamicData?._id;

  // Fetch coin balance directly from wallet API (same as homepage)
  const fetchCoinBalance = useCallback(async () => {
    try {
      const walletResponse = await walletApi.getBalance();
      if (walletResponse.success && walletResponse.data) {
        const wasilCoin = walletResponse.data.coins.find((c: any) => c.type === 'wasil');
        const actualWalletCoins = wasilCoin?.amount || 0;
        setCoinCount(actualWalletCoins);
      }
    } catch (error) {
      console.error('Error fetching coin balance:', error);
    } finally {
      setIsLoadingCoins(false);
    }
  }, []);

  // Fetch coins on mount
  useEffect(() => {
    fetchCoinBalance();
  }, [fetchCoinBalance]);

  // Check wishlist status function
  const checkWishlistStatus = useCallback(async () => {
    if (!authState.isAuthenticated || !productId) return;

    try {
      const response = await wishlistApi.checkWishlistStatus('product', productId);
      if (response.success && response.data?.inWishlist) {
        setIsSaved(true);
        return;
      }
      setIsSaved(false);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      setIsSaved(false);
    }
  }, [productId, authState.isAuthenticated]);

  useEffect(() => {
    checkWishlistStatus();
  }, [checkWishlistStatus]);

  useFocusEffect(
    useCallback(() => {
      checkWishlistStatus();
    }, [checkWishlistStatus])
  );

  // Handlers
  const handleBackPress = () => {
    triggerImpact('Medium');
    router.back();
  };

  const handleSharePress = async () => {
    triggerImpact('Light');
    try {
      const productName = dynamicData?.title || dynamicData?.name || 'Check this out!';
      await Share.share({
        message: `Check out ${productName} on our app!`,
        title: productName,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCartPress = () => {
    triggerImpact('Light');
    router.push('/CartPage');
  };

  const handleCoinPress = () => {
    triggerImpact('Light');
    router.push('/CoinPage');
  };

  const handleFavoritePress = useCallback(async () => {
    triggerImpact('Medium');

    if (!authState.isAuthenticated) {
      router.push('/sign-in');
      return;
    }

    if (!productId) {
      console.warn('No product ID available for wishlist');
      return;
    }

    setIsWishlistLoading(true);

    try {
      if (isSaved) {
        const response = await wishlistApi.removeFromWishlist('product', productId);
        if (response.success) {
          setIsSaved(false);
          triggerNotification('Success');
          await refreshWishlist();
        }
      } else {
        const response = await wishlistApi.addToWishlist({
          itemId: productId,
          itemType: 'product',
        });
        if (response.success) {
          setIsSaved(true);
          triggerNotification('Success');
          await refreshWishlist();
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  }, [authState.isAuthenticated, productId, isSaved, refreshWishlist, router]);

  // Animation helper
  const animateScale = (animValue: Animated.Value, toValue: number) => {
    Animated.spring(animValue, {
      toValue,
      useNativeDriver: true,
      ...Timing.springBouncy,
    }).start();
  };

  // Validate image URL
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url || url.trim() === '') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const storeImageUrl = isValidImageUrl(dynamicData?.image) ? dynamicData.image : null;

  return (
    <View style={styles.container}>
      {/* Header Bar - Above the image */}
      <View style={styles.headerBar}>
        {/* Left - Back button */}
        <Animated.View style={{ transform: [{ scale: backScaleAnim }] }}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleBackPress}
            onPressIn={() => animateScale(backScaleAnim, 0.9)}
            onPressOut={() => animateScale(backScaleAnim, 1)}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>
        </Animated.View>

        {/* Center - Coin Badge */}
        <TouchableOpacity
          style={styles.coinBadge}
          onPress={handleCoinPress}
          activeOpacity={0.8}
          accessibilityLabel={`${coinCount} coins`}
          accessibilityRole="button"
        >
          <View style={styles.coinIcon}>
            <Ionicons name="star" size={14} color="#FFFFFF" />
          </View>
          <ThemedText style={styles.coinText}>
            {isLoadingCoins ? '...' : coinCount.toLocaleString()}
          </ThemedText>
        </TouchableOpacity>

        {/* Right - Action buttons */}
        <View style={styles.rightActions}>
          {/* Share Button */}
          <Animated.View style={{ transform: [{ scale: shareScaleAnim }] }}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleSharePress}
              onPressIn={() => animateScale(shareScaleAnim, 0.9)}
              onPressOut={() => animateScale(shareScaleAnim, 1)}
              accessibilityLabel="Share"
              accessibilityRole="button"
            >
              <Ionicons name="share-outline" size={20} color="#1F2937" />
            </TouchableOpacity>
          </Animated.View>

          {/* Cart Button */}
          <Animated.View style={{ transform: [{ scale: cartScaleAnim }] }}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleCartPress}
              onPressIn={() => animateScale(cartScaleAnim, 0.9)}
              onPressOut={() => animateScale(cartScaleAnim, 1)}
              accessibilityLabel="Cart"
              accessibilityRole="button"
            >
              <Ionicons name="bag-outline" size={20} color="#1F2937" />
            </TouchableOpacity>
          </Animated.View>

          {/* Heart/Wishlist Button */}
          <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
            <TouchableOpacity
              style={[
                styles.iconBtn,
                isSaved && styles.heartBtnActive
              ]}
              onPress={handleFavoritePress}
              onPressIn={() => animateScale(heartScaleAnim, 0.9)}
              onPressOut={() => animateScale(heartScaleAnim, 1)}
              disabled={isWishlistLoading}
              accessibilityLabel={isSaved ? "Remove from wishlist" : "Add to wishlist"}
              accessibilityRole="button"
            >
              {isWishlistLoading ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons
                  name={isSaved ? "heart" : "heart-outline"}
                  size={20}
                  color={isSaved ? "#EF4444" : "#1F2937"}
                />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* Product Image - Below the header */}
      <View style={styles.imageContainer}>
        {storeImageUrl ? (
          <Image
            source={{ uri: storeImageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <LinearGradient
              colors={['rgba(0, 192, 106, 0.1)', 'rgba(0, 192, 106, 0.05)']}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="image-outline" size={56} color="#00C06A" />
            <ThemedText style={styles.placeholderText}>No Image</ThemedText>
          </View>
        )}

        {/* Bottom gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)']}
          style={styles.bottomGradient}
        />

        {/* Store Badge - Bottom left */}
        <View style={styles.storeBadge}>
          <Ionicons name="storefront" size={18} color="#00C06A" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },

  // Header bar - separate from image
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 44,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },

  // Icon button style
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heartBtnActive: {
    backgroundColor: '#FEE2E2',
  },

  // Coin badge
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C06A',
    borderRadius: 20,
    paddingRight: 14,
    paddingLeft: 4,
    paddingVertical: 4,
    gap: 6,
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  coinIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  coinText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Right actions
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Image container
  imageContainer: {
    position: 'relative',
    height: 340,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    fontSize: 14,
    color: '#00C06A',
    marginTop: 8,
    fontWeight: '500',
  },

  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },

  // Store badge
  storeBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
