/**
 * BestCouponCodes Component
 *
 * Section showing verified coupon codes with copy functionality
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CashStoreCoupon } from '../../../types/cash-store.types';

interface BestCouponCodesProps {
  coupons: CashStoreCoupon[];
  isLoading?: boolean;
  onCouponCopy: (coupon: CashStoreCoupon) => void;
  onViewAllPress: () => void;
}

const CouponCard: React.FC<{
  coupon: CashStoreCoupon;
  onCopy: () => void;
}> = ({ coupon, onCopy }) => {
  const discountDisplay =
    coupon.discountType === 'PERCENTAGE'
      ? `${coupon.discountValue}% OFF`
      : `₹${coupon.discountValue} OFF`;

  return (
    <View style={styles.card}>
      {/* Verified Badge */}
      {coupon.isVerified && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={12} color="#00C06A" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      )}

      {/* Brand Logo */}
      <View style={styles.logoContainer}>
        {coupon.brand.logo ? (
          <Image source={{ uri: coupon.brand.logo }} style={styles.brandLogo} resizeMode="contain" />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoInitial}>{coupon.brand.name.charAt(0)}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.brandName}>{coupon.brand.name}</Text>
        <Text style={styles.discount}>{discountDisplay}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {coupon.title}
        </Text>

        {coupon.minOrderValue && (
          <Text style={styles.minOrder}>Min. order ₹{coupon.minOrderValue}</Text>
        )}
      </View>

      {/* Code & Copy Button */}
      <View style={styles.codeSection}>
        <View style={styles.codeContainer}>
          <Text style={styles.codeText}>{coupon.code}</Text>
        </View>
        <TouchableOpacity style={styles.copyButton} onPress={onCopy}>
          <Ionicons name="copy-outline" size={16} color="#FFFFFF" />
          <Text style={styles.copyText}>COPY</Text>
        </TouchableOpacity>
      </View>

      {/* Exclusive Badge */}
      {coupon.isExclusive && (
        <View style={styles.exclusiveBadge}>
          <Ionicons name="star" size={10} color="#F59E0B" />
          <Text style={styles.exclusiveText}>ReZ Exclusive</Text>
        </View>
      )}
    </View>
  );
};

const SkeletonCard: React.FC = () => (
  <View style={styles.card}>
    <View style={[styles.logoContainer, styles.skeleton]} />
    <View style={styles.content}>
      <View style={[styles.skeletonText, { width: 80 }]} />
      <View style={[styles.skeletonText, { width: 60 }]} />
    </View>
  </View>
);

const BestCouponCodes: React.FC<BestCouponCodesProps> = ({
  coupons,
  isLoading = false,
  onCouponCopy,
  onViewAllPress,
}) => {
  if (coupons.length === 0 && !isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>Best Coupon Codes</Text>
            <Ionicons name="shield-checkmark" size={18} color="#00C06A" />
          </View>
          <Text style={styles.subtitle}>Verified & tested codes</Text>
        </View>
        <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#00C06A" />
        </TouchableOpacity>
      </View>

      {/* Horizontal List */}
      <FlatList
        data={isLoading ? Array.from({ length: 3 }) : coupons}
        renderItem={({ item, index }) =>
          isLoading ? (
            <SkeletonCard key={`skeleton-${index}`} />
          ) : (
            <CouponCard
              coupon={item as CashStoreCoupon}
              onCopy={() => onCouponCopy(item as CashStoreCoupon)}
            />
          )
        }
        keyExtractor={(item, index) => (isLoading ? `skeleton-${index}` : (item as CashStoreCoupon).id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00C06A',
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  verifiedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#00C06A',
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  brandLogo: {
    width: 36,
    height: 36,
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  logoInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  content: {
    marginBottom: 12,
  },
  brandName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  discount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00C06A',
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 4,
  },
  minOrder: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  codeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  codeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00C06A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  exclusiveBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  exclusiveText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#F59E0B',
  },
  // Skeleton
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  skeletonText: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 6,
  },
});

export default memo(BestCouponCodes);
