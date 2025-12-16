/**
 * MallOfferCard Component
 *
 * Card component for displaying exclusive mall offers
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MallOffer, OfferBadge } from '../../../types/mall.types';

interface MallOfferCardProps {
  offer: MallOffer;
  onPress: (offer: MallOffer) => void;
  width?: number;
}

const BADGE_COLORS: Record<OfferBadge, { bg: string; text: string }> = {
  'limited-time': { bg: '#EF4444', text: '#FFFFFF' },
  'mall-exclusive': { bg: '#00C06A', text: '#FFFFFF' },
  'flash-sale': { bg: '#F59E0B', text: '#FFFFFF' },
  'best-deal': { bg: '#8B5CF6', text: '#FFFFFF' },
};

const MallOfferCard: React.FC<MallOfferCardProps> = ({
  offer,
  onPress,
  width = 280,
}) => {
  // Calculate days remaining
  const validUntil = new Date(offer.validUntil);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Value display
  const valueDisplay = offer.valueType === 'percentage'
    ? `${offer.value}% off`
    : `₹${offer.value} off`;

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={() => onPress(offer)}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        {/* Offer Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: offer.image }}
            style={styles.offerImage}
            resizeMode="cover"
          />

          {/* Badge */}
          {offer.badge && (
            <View style={[
              styles.badge,
              { backgroundColor: BADGE_COLORS[offer.badge]?.bg || '#6B7280' }
            ]}>
              <Text style={styles.badgeText}>
                {offer.badge === 'mall-exclusive' ? 'Mall Exclusive' :
                 offer.badge === 'limited-time' ? 'Limited Time' :
                 offer.badge === 'flash-sale' ? 'Flash Sale' : 'Best Deal'}
              </Text>
            </View>
          )}
        </View>

        {/* Offer Details */}
        <View style={styles.detailsContainer}>
          {/* Brand Info */}
          <View style={styles.brandRow}>
            <Text style={styles.brandName} numberOfLines={1}>
              {offer.brand?.name || 'Brand'}
            </Text>
            {offer.isMallExclusive && (
              <View style={styles.exclusiveTag}>
                <Text style={styles.exclusiveTagText}>Mall Exclusive</Text>
              </View>
            )}
          </View>

          {/* Offer Title */}
          <Text style={styles.offerTitle} numberOfLines={2}>
            {offer.title}
          </Text>

          {/* Value and Extra Coins */}
          <View style={styles.valueRow}>
            <Text style={styles.valueText}>{valueDisplay}</Text>
            {offer.extraCoins && offer.extraCoins > 0 && (
              <View style={styles.coinsContainer}>
                <Text style={styles.coinsText}>+{offer.extraCoins} Coins</Text>
              </View>
            )}
          </View>

          {/* Validity and CTA */}
          <View style={styles.footerRow}>
            <Text style={styles.validityText}>
              Valid till: {formatDate(validUntil)}
            </Text>
            <TouchableOpacity style={styles.shopButton}>
              <Text style={styles.shopButtonText}>Shop Now</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  imageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  offerImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailsContainer: {
    padding: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  brandName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },
  exclusiveTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  exclusiveTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#00C06A',
  },
  offerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 20,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00C06A',
  },
  coinsContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  coinsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  validityText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C06A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  shopButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default memo(MallOfferCard);
