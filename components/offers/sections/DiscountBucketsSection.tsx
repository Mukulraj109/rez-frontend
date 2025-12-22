/**
 * DiscountBucketsSection Component
 *
 * Quick filter buttons for discount percentages
 * ReZ brand styling
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOffersTheme } from '@/contexts/OffersThemeContext';
import { DiscountBucket } from '@/types/offers.types';
import { Spacing, BorderRadius, Typography, Colors, Shadows } from '@/constants/DesignSystem';

interface DiscountBucketsSectionProps {
  buckets: DiscountBucket[];
  selectedBucket?: string;
  onBucketPress: (bucket: DiscountBucket) => void;
}

export const DiscountBucketsSection: React.FC<DiscountBucketsSectionProps> = ({
  buckets,
  selectedBucket,
  onBucketPress,
}) => {
  const { theme, isDark } = useOffersTheme();

  if (buckets.length === 0) return null;

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: Spacing.base,
      marginBottom: Spacing.lg,
    },
    grid: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    bucket: {
      flex: 1,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xs,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
      backgroundColor: isDark ? theme.colors.background.card : '#FFFFFF',
      ...(isDark ? {} : Shadows.subtle),
    },
    bucketSelected: {
      borderColor: Colors.primary[600],
      backgroundColor: isDark ? 'rgba(0, 192, 106, 0.1)' : '#E6F9F0',
    },
    iconContainer: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.sm,
    },
    label: {
      fontSize: 11,
      fontWeight: '700',
      marginBottom: 2,
      textAlign: 'center',
    },
    count: {
      fontSize: 10,
      fontWeight: '500',
      color: theme.colors.text.tertiary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {buckets.map((bucket) => {
          const isSelected = selectedBucket === bucket.filterValue;
          const iconBgColor = isDark
            ? `${bucket.iconColor}25`
            : bucket.backgroundColor;

          return (
            <TouchableOpacity
              key={bucket.id}
              style={[
                styles.bucket,
                isSelected && styles.bucketSelected,
              ]}
              onPress={() => onBucketPress(bucket)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: iconBgColor },
                ]}
              >
                <Ionicons
                  name={bucket.icon as any}
                  size={20}
                  color={bucket.iconColor}
                />
              </View>
              <Text
                style={[
                  styles.label,
                  { color: isSelected ? Colors.primary[600] : theme.colors.text.primary },
                ]}
                numberOfLines={1}
              >
                {bucket.label}
              </Text>
              <Text style={styles.count}>
                {bucket.count} deals
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default DiscountBucketsSection;
