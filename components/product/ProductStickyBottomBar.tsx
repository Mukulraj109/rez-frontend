/**
 * ProductStickyBottomBar Component
 *
 * Sticky bottom bar for ProductPage showing:
 * - Price info (current price, original price, lock fee)
 * - Lock Now button connected to lock functionality
 *
 * Replaces the default bottom navigation on ProductPage
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LOCK_FEE_PERCENTAGES } from './DurationChips';
import { useRegion } from '@/contexts/RegionContext';

interface ProductStickyBottomBarProps {
  /** Current product price */
  price: number;
  /** Original price (for strikethrough) */
  originalPrice?: number;
  /** Currency symbol */
  currency?: string;
  /** Whether product is already locked */
  isLocked?: boolean;
  /** Callback when Lock Now button is pressed */
  onLockPress: () => void;
  /** Callback when Add to Cart button is pressed */
  onAddToCart?: () => void;
  /** Whether the component is visible */
  visible?: boolean;
}

export const ProductStickyBottomBar: React.FC<ProductStickyBottomBarProps> = ({
  price,
  originalPrice,
  currency,
  isLocked = false,
  onLockPress,
  onAddToCart,
  visible = true,
}) => {
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = currency || getCurrencySymbol();
  const insets = useSafeAreaInsets();

  // Calculate lock fee (using default 4hr = 10%)
  const lockFeePercentage = LOCK_FEE_PERCENTAGES[4]; // 10%
  const lockFee = Math.ceil((price * lockFeePercentage) / 100);

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {/* Left: Price Info */}
      <View style={styles.priceSection}>
        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>
            {currencySymbol}{price.toLocaleString('en-IN')}
          </Text>
          {originalPrice && originalPrice > price && (
            <Text style={styles.originalPrice}>
              {currencySymbol}{originalPrice.toLocaleString('en-IN')}
            </Text>
          )}
        </View>
        <Text style={styles.lockFeeText}>
          Lock for just {currencySymbol}{lockFee.toLocaleString('en-IN')}
        </Text>
      </View>

      {/* Right: Lock Now Button */}
      <TouchableOpacity
        style={styles.lockButton}
        onPress={onLockPress}
        activeOpacity={0.85}
        disabled={isLocked}
      >
        <LinearGradient
          colors={isLocked ? ['#9CA3AF', '#6B7280'] : ['#059669', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.lockButtonGradient}
        >
          <Ionicons
            name={isLocked ? 'checkmark-circle' : 'lock-closed'}
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.lockButtonText}>
            {isLocked ? 'Locked' : 'Lock Now'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 -3px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },

  // Price Section (Left)
  priceSection: {
    flex: 1,
    marginRight: 16,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },

  currentPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },

  originalPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },

  lockFeeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#00C06A',
    marginTop: 2,
  },

  // Lock Button (Right)
  lockButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  lockButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },

  lockButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default ProductStickyBottomBar;
