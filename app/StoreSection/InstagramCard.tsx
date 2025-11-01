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
    >
      <LinearGradient
        colors={disabled ? ['#D1D5DB', '#9CA3AF'] : ['#EC4899', '#8B5CF6']}
        style={[styles.gradientBackground, { padding: responsivePadding }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  containerDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.05,
    elevation: 2,
  },
  gradientBackground: {
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});