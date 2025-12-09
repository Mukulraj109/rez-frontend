import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

interface VoucherNavButtonProps {
  variant?: 'card' | 'icon' | 'minimal';
  showText?: boolean;
  style?: any;
}

export default function VoucherNavButton({ 
  variant = 'card', 
  showText = true,
  style 
}: VoucherNavButtonProps) {
  const router = useRouter();

  const handleNavigateToVouchers = () => {

    router.push('/online-voucher');
  };

  if (variant === 'icon') {
    return (
      <TouchableOpacity
        style={[styles.iconButton, style]}
        onPress={handleNavigateToVouchers}
        activeOpacity={0.8}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="Vouchers"
        accessibilityRole="button"
        accessibilityHint="Double tap to view online vouchers"
      >
        <View style={styles.iconContainer}>
          <Ionicons name="ticket-outline" size={24} color="#8B5CF6" />
        </View>
        {showText && (
          <ThemedText style={styles.iconText}>Vouchers</ThemedText>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'minimal') {
    return (
      <TouchableOpacity
        style={[styles.minimalButton, style]}
        onPress={handleNavigateToVouchers}
        activeOpacity={0.8}
        accessibilityLabel="Online Vouchers"
        accessibilityRole="button"
        accessibilityHint="Double tap to view online vouchers"
      >
        <Ionicons name="ticket" size={22} color="#FFC857" />
        {showText && (
          <ThemedText style={styles.minimalText}>Exclusive Deals</ThemedText>
        )}
      </TouchableOpacity>
    );
  }

  // Default card variant
  return (
    <TouchableOpacity
      style={[styles.cardContainer, style]}
      onPress={handleNavigateToVouchers}
      activeOpacity={0.8}
      accessibilityLabel="Online Vouchers. Get cashback on top brands. Up to 20% off"
      accessibilityRole="button"
      accessibilityHint="Double tap to view online vouchers"
    >
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <View style={styles.voucherIcon}>
              <Ionicons name="ticket" size={24} color="white" />
            </View>
            <View style={styles.cardText}>
              <ThemedText style={styles.cardTitle}>Online Vouchers</ThemedText>
              <ThemedText style={styles.cardSubtitle}>Get cashback on top brands</ThemedText>
            </View>
          </View>
          
          <View style={styles.cardRight}>
            <View style={styles.benefitBadge}>
              <ThemedText style={styles.benefitText}>Up to 20%</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Card Variant
  cardContainer: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  cardGradient: {
    padding: 20,
    minHeight: 100,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  voucherIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  cardRight: {
    alignItems: 'center',
    gap: 8,
  },
  benefitBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  benefitText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },

  // Icon Variant
  iconButton: {
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  iconText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },

  // Minimal Variant
  minimalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.15)',
    gap: 12,
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  minimalText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0B2240',
  },
});