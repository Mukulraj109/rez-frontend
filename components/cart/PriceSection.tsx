import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { PriceSectionProps } from '@/types/cart';

export default function PriceSection({
  totalPrice,
  onBuyNow,
  itemCount = 0,
  loading = false
}: PriceSectionProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 360;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleBuyNowPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onBuyNow();
  };

  const formattedPrice = new Intl.NumberFormat('en-IN').format(totalPrice);

  return (
    <View style={[
      styles.container,
      Platform.OS === 'ios' && styles.iosContainer,
    ]}>
      <View style={styles.content}>
        {/* Price Information */}
        <View style={styles.priceContainer}>
          <ThemedText style={[
            styles.priceLabel,
            { fontSize: isSmallScreen ? 14 : 15 }
          ]}>
            Price
          </ThemedText>
          <ThemedText style={[
            styles.totalPrice,
            { fontSize: isSmallScreen ? 20 : 22 }
          ]}>
            ₹{formattedPrice}
          </ThemedText>
          {itemCount > 0 && (
            <ThemedText style={[
              styles.itemCount,
              { fontSize: isSmallScreen ? 12 : 13 }
            ]}>
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </ThemedText>
          )}
        </View>

        {/* Buy Now Button */}
        <Animated.View style={[
          styles.buttonContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}>
          <TouchableOpacity
            onPress={handleBuyNowPress}
            disabled={loading || totalPrice === 0}
            activeOpacity={0.9}
            style={styles.buyNowButton}
          >
            <LinearGradient
              colors={loading || totalPrice === 0 ? ['#D1D5DB', '#9CA3AF'] : ['#8B5CF6', '#6D28D9']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.buttonContent}>
                <Ionicons
                  name="bag"
                  size={isSmallScreen ? 18 : 20}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <ThemedText style={[
                  styles.buttonText,
                  { fontSize: isSmallScreen ? 15 : 16 }
                ]}>
                  {loading ? 'Processing...' : 'Buy Now'}
                </ThemedText>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  iosContainer: {
    paddingBottom: 34,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 80,
  },
  priceContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  priceLabel: {
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  totalPrice: {
    color: '#1F2937',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  itemCount: {
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 2,
  },
  buttonContainer: {
    flex: 1,
    maxWidth: 160,
  },
  buyNowButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  gradientButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
