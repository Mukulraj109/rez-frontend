/**
 * Secure Payment Header
 * 
 * Header component showing security badge and trust indicators
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/DesignTokens';

interface SecurePaymentHeaderProps {
  storeName?: string;
  onBack?: () => void;
}

export const SecurePaymentHeader: React.FC<SecurePaymentHeaderProps> = ({
  storeName,
  onBack,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <View style={styles.titleRow}>
          <Ionicons name="lock-closed" size={18} color={COLORS.primary[500]} />
          <Text style={styles.title}>Secure Payment</Text>
        </View>
        {storeName && (
          <Text style={styles.storeName}>{storeName}</Text>
        )}
        <View style={styles.trustBadge}>
          <Ionicons name="shield-checkmark" size={12} color={COLORS.success[600]} />
          <Text style={styles.trustText}>Powered by ReZ Wallet • Encrypted & Safe</Text>
        </View>
      </View>
      
      <View style={styles.placeholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
  },
  storeName: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    backgroundColor: COLORS.success[50],
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  trustText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.success[700],
  },
  placeholder: {
    width: 40,
  },
});

export default SecurePaymentHeader;
