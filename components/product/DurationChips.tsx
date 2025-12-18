/**
 * DurationChips Component
 *
 * Selectable duration chips for lock feature
 * Options: 2 Hours | 4 Hours | 8 Hours
 * Shows fee percentage for each duration
 *
 * Based on reference design from ProductPage redesign
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { triggerImpact } from '@/utils/haptics';

// Lock duration options
export type LockDuration = 2 | 4 | 8;

// Lock fee percentages by duration
export const LOCK_FEE_PERCENTAGES: Record<LockDuration, number> = {
  2: 5,   // 2 hours = 5%
  4: 10,  // 4 hours = 10%
  8: 15,  // 8 hours = 15%
};

interface DurationChipsProps {
  /** Currently selected duration */
  selectedDuration: LockDuration;
  /** Callback when duration is selected */
  onSelectDuration: (duration: LockDuration) => void;
  /** Product price to calculate lock fee */
  productPrice: number;
  /** Currency symbol */
  currency?: string;
  /** Custom style */
  style?: any;
}

// Duration options configuration
const DURATION_OPTIONS: Array<{ duration: LockDuration; label: string }> = [
  { duration: 2, label: '2 Hours' },
  { duration: 4, label: '4 Hours' },
  { duration: 8, label: '8 Hours' },
];

/**
 * Calculate lock fee for a given duration
 */
export const calculateLockFee = (price: number, duration: LockDuration): number => {
  const percentage = LOCK_FEE_PERCENTAGES[duration];
  return Math.ceil((price * percentage) / 100);
};

export const DurationChips: React.FC<DurationChipsProps> = ({
  selectedDuration,
  onSelectDuration,
  productPrice,
  currency = '₹',
  style,
}) => {
  const handleSelect = (duration: LockDuration) => {
    triggerImpact('Light');
    onSelectDuration(duration);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>Choose Lock Duration</Text>

      <View style={styles.chipsContainer}>
        {DURATION_OPTIONS.map(({ duration, label }) => {
          const isSelected = selectedDuration === duration;
          const feePercentage = LOCK_FEE_PERCENTAGES[duration];
          const lockFee = calculateLockFee(productPrice, duration);

          return (
            <TouchableOpacity
              key={duration}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
              ]}
              onPress={() => handleSelect(duration)}
              activeOpacity={0.7}
            >
              {/* Clock Icon */}
              <Ionicons
                name="time-outline"
                size={16}
                color={isSelected ? '#FFFFFF' : '#6B7280'}
              />

              {/* Duration Label */}
              <Text
                style={[
                  styles.chipLabel,
                  isSelected && styles.chipLabelSelected,
                ]}
              >
                {label}
              </Text>

              {/* Fee Badge (shown when selected) */}
              {isSelected && (
                <View style={styles.feeBadge}>
                  <Text style={styles.feeText}>{feePercentage}%</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Duration Fee Info */}
      <View style={styles.feeInfo}>
        <Text style={styles.feeInfoText}>
          Lock Price ({LOCK_FEE_PERCENTAGES[selectedDuration]}%)
        </Text>
        <Text style={styles.feeAmount}>
          {currency}{calculateLockFee(productPrice, selectedDuration).toLocaleString('en-IN')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  chipsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  chipSelected: {
    backgroundColor: '#00C06A',
    borderColor: '#00C06A',
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  chipLabelSelected: {
    color: '#FFFFFF',
  },

  feeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  feeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  feeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  feeInfoText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },

  feeAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00C06A',
    letterSpacing: -0.3,
  },
});

export default DurationChips;
