import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface InstagramCardProps {
  productData?: {
    id?: string;
    _id?: string;
    title?: string;
    name?: string;
    price?: number;
    pricing?: { selling?: number };
    image?: string;
    images?: Array<{ url: string }>;
    store?: {
      _id?: string;
      id?: string;
      name?: string;
    };
    [key: string]: any;
  };
  disabled?: boolean;
  onError?: (error: Error) => void;
}

export default function InstagramCard({ productData, disabled = false, onError }: InstagramCardProps) {
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const responsiveMargin = width < 360 ? 16 : 20;
  const responsivePadding = width < 360 ? 16 : 20;
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigateToEarnSocial = async () => {
    if (disabled || isNavigating) {
      return;
    }

    setIsNavigating(true);

    try {
      // Prepare product context for the earn page
      const params: any = {};

      if (productData) {
        const productId = productData.id || productData._id;
        const productName = productData.title || productData.name;
        const productPrice = productData.price || productData.pricing?.selling;
        const productImage = productData.image || productData.images?.[0]?.url;
        const storeId = productData.store?._id || productData.store?.id;
        const storeName = productData.store?.name;

        if (productId) params.productId = productId;
        if (productName) params.productName = productName;
        if (productPrice) params.productPrice = productPrice.toString();
        if (productImage) params.productImage = productImage;
        if (storeId) params.storeId = storeId;
        if (storeName) params.storeName = storeName;

      }

      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));

      router.push({
        pathname: '/earn-from-social-media',
        params
      } as any);

    } catch (error) {
      console.error('❌ InstagramCard: Navigation failed:', error);

      // Call error callback if provided
      if (onError) {
        onError(error as Error);
      }

      // Show user-friendly error
      Alert.alert(
        'Navigation Error',
        'Unable to open the earn page. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { marginHorizontal: responsiveMargin },
        (disabled || isNavigating) && styles.containerDisabled
      ]}
      activeOpacity={0.8}
      onPress={handleNavigateToEarnSocial}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      disabled={disabled || isNavigating}
      accessibilityRole="button"
      accessibilityLabel={isNavigating ? 'Loading Instagram earn page' : 'Earn from Instagram'}
      accessibilityHint="Double tap to learn how to earn money from Instagram posts"
      accessibilityState={{ disabled: disabled || isNavigating, busy: isNavigating }}
    >
      <LinearGradient
        colors={disabled ? ['#D1D5DB', '#9CA3AF'] : ['#EC4899', '#8B5CF6', '#7C3AED']}
        style={[styles.gradientBackground, { padding: responsivePadding }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.5, 1]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {isNavigating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="logo-instagram" size={24} color="#FFFFFF" />
            )}
          </View>
          <Text style={styles.title}>
            {isNavigating ? 'Loading...' : 'Earn from Instagram'}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
);
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    // Additional 3D effect layers
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  containerDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
    elevation: 3,
  },
  gradientBackground: {
    borderRadius: 20,
    // Inner shadow effect
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    // 3D icon container
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});