import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import discountsApi from '@/services/discountsApi';

interface Section3Props {
  productPrice?: number;
  storeId?: string;
}

export default function Section3({ productPrice = 1000, storeId }: Section3Props) {
  const [discount, setDiscount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    fetchDiscounts();
  }, [productPrice]);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await discountsApi.getBillPaymentDiscounts(productPrice);

      if (response.success && response.data && response.data.length > 0) {
        // Get the first/best discount
        setDiscount(response.data[0]);
      } else {
        // No discounts available, show default
        setDiscount(null);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      setError('Unable to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discount) return;

    try {
      setIsApplying(true);

      // Here you would typically save this to cart or order context
      // For now, just show success message
      Alert.alert(
        'Discount Applied!',
        `${discount.name} has been added to your order. You'll save ${discount.type === 'percentage' ? discount.value + '%' : '₹' + discount.value}!`,
        [{ text: 'OK' }]
      );
      setShowDetails(false);
    } catch (error: any) {
      console.error('Apply discount error:', error);
      Alert.alert('Error', 'Unable to apply discount. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const displayText = discount?.metadata?.displayText || discount?.name || 'Get Instant Discount';
  const discountText = discount
    ? `${discount.type === 'percentage' ? discount.value + '%' : '₹' + discount.value} Off${discount.applicableOn === 'bill_payment' ? ' on bill payment' : ''}`
    : '10% Off on bill payment';

  return (
    <View style={styles.container}>
      {/* Compact Card */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => discount && setShowDetails(!showDetails)}
      >
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>{displayText}</ThemedText>
          {loading ? (
            <ActivityIndicator size="small" color="#666" />
          ) : (
            <ThemedText style={styles.subtitle}>{discountText}</ThemedText>
          )}
          {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
        </View>

        <View style={styles.badge}>
          <ThemedText style={styles.badgeIcon}>⚡</ThemedText>
        </View>
      </TouchableOpacity>

      {/* Detailed Discount Card - Shown when expanded */}
      {showDetails && discount && (
        <View style={styles.detailsCard}>
          {/* Save Badge */}
          <View style={styles.saveBadge}>
            <ThemedText style={styles.saveBadgeText}>
              Save {discount.type === 'percentage' ? discount.value + '%' : '₹' + discount.value}
            </ThemedText>
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="flash" size={24} color="#F59E0B" />
          </View>

          {/* Title */}
          <ThemedText style={styles.detailsTitle}>{discount.name}</ThemedText>

          {/* Minimum Bill */}
          <View style={styles.minimumBillRow}>
            <ThemedText style={styles.minimumBillLabel}>Minimum bill:</ThemedText>
            <ThemedText style={styles.minimumBillValue}>₹{discount.minOrderValue || 0}</ThemedText>
          </View>

          {/* Info Row */}
          <View style={styles.infoRow}>
            {discount.restrictions?.isOfflineOnly && (
              <>
                <Ionicons name="storefront-outline" size={14} color="#8B5CF6" />
                <ThemedText style={styles.infoText}>Offline Only</ThemedText>
                <View style={styles.dividerVertical} />
              </>
            )}
            <ThemedText style={styles.moreDetailsText}>More details</ThemedText>
            <Ionicons name="information-circle-outline" size={16} color="#8B5CF6" style={styles.infoIcon} />
          </View>

          {/* Restrictions */}
          <View style={styles.restrictionsContainer}>
            {discount.restrictions?.notValidAboveStoreDiscount && (
              <View style={styles.restrictionRow}>
                <View style={styles.bulletPoint} />
                <ThemedText style={styles.restrictionText}>Not valid above store discount</ThemedText>
              </View>
            )}
            {discount.restrictions?.singleVoucherPerBill && (
              <View style={styles.restrictionRow}>
                <View style={styles.bulletPoint} />
                <ThemedText style={styles.restrictionText}>Single voucher per bill</ThemedText>
              </View>
            )}
            {discount.usageLimitPerUser && (
              <View style={styles.restrictionRow}>
                <View style={styles.bulletPoint} />
                <ThemedText style={styles.restrictionText}>
                  Limited to {discount.usageLimitPerUser} use{discount.usageLimitPerUser > 1 ? 's' : ''} per user
                </ThemedText>
              </View>
            )}
          </View>

          {/* Add Button */}
          <TouchableOpacity
            style={styles.addButtonWrapper}
            activeOpacity={0.8}
            onPress={handleApplyDiscount}
            disabled={isApplying}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.addButton, isApplying && styles.addButtonDisabled]}
            >
              <ThemedText style={styles.addButtonText}>
                {isApplying ? 'Applying...' : 'Add'}
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.divider} />
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 14,
    paddingVertical: 17,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6c63ff',
    marginBottom: 4,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#6c63ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeIcon: {
    fontSize: 22,
    color: '#fff',
    lineHeight: 22,
  },
  divider: {
    marginTop: 14,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#eee',
    opacity: 0.9,
  },
  // Details Card Styles
  detailsCard: {
    marginTop: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  saveBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveBadgeText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6c63ff',
    marginBottom: 12,
  },
  minimumBillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  minimumBillLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  minimumBillValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  dividerVertical: {
    width: 1,
    height: 12,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  moreDetailsText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  infoIcon: {
    marginLeft: 4,
  },
  restrictionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  restrictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6B7280',
    marginRight: 8,
  },
  restrictionText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  addButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
