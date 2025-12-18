/**
 * BonusSharingCard Component
 *
 * Displays bonus coins for sharing the product
 * Shows: "+50 bonus coins on sharing this product"
 *
 * Based on reference design from ProductPage redesign
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { triggerImpact } from '@/utils/haptics';

interface BonusSharingCardProps {
  /** Number of bonus coins for sharing */
  bonusCoins: number;
  /** Product name for sharing */
  productName?: string;
  /** Product ID for deep link */
  productId?: string;
  /** Callback after sharing */
  onShare?: () => void;
  /** Custom style */
  style?: any;
}

export const BonusSharingCard: React.FC<BonusSharingCardProps> = ({
  bonusCoins,
  productName = 'this product',
  productId,
  onShare,
  style,
}) => {
  const handleShare = async () => {
    triggerImpact('Light');

    try {
      const shareMessage = `Check out ${productName} on ReZ! Get amazing discounts and earn coins.`;

      const result = await Share.share({
        message: shareMessage,
        title: productName,
      });

      if (result.action === Share.sharedAction) {
        onShare?.();
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (bonusCoins <= 0) return null;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handleShare}
      activeOpacity={0.7}
    >
      {/* Gift Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name="gift-outline" size={20} color="#F59E0B" />
      </View>

      {/* Content */}
      <Text style={styles.text}>
        <Text style={styles.highlight}>+{bonusCoins}</Text>
        {' bonus coins on sharing this product'}
      </Text>

      {/* Share Arrow */}
      <Ionicons name="arrow-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  text: {
    flex: 1,
    fontSize: 13,
    color: '#78350F',
    fontWeight: '500',
    lineHeight: 18,
  },

  highlight: {
    fontWeight: '700',
    color: '#D97706',
  },
});

export default BonusSharingCard;
