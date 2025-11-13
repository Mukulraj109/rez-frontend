import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/ThemedText';

interface CombinedSection78Props {
  title?: string;
  savePercentage?: string;
  minimumBill?: string;
  onAddPress?: () => void;
  disabled?: boolean;
  testID?: string;
  dynamicData?: {
    id?: string;
    _id?: string;
    store?: {
      id?: string;
      _id?: string;
      name?: string;
    };
  } | null;
  cardType?: string;
}

const PURPLE = '#6c63ff';
const CARD_BG = '#f6f3ff';     // soft lavender like the screenshot
const BORDER = '#ece6ff';
const DIVIDER = '#e6e0fa';
const PRIMARY = '#333333';
const SECONDARY = '#666666';

export default function CombinedSection78({
  title = 'Get Instant Discount',
  savePercentage = 'Save 20%',
  minimumBill = 'Minimum bill: ₹5000',
  onAddPress,
  disabled = false,
  testID,
  dynamicData,
  cardType,
}: CombinedSection78Props) {
  const [isAddingVoucher, setIsAddingVoucher] = useState(false);

  const handleAddVoucher = async () => {
    // If custom handler provided, use it
    if (onAddPress) {
      onAddPress();
      return;
    }

    try {
      setIsAddingVoucher(true);

      const storeId = dynamicData?.store?.id || dynamicData?.store?._id;
      const storeName = dynamicData?.store?.name;

      if (!storeId) {
        Alert.alert('Error', 'Store information not available');
        return;
      }

      // TODO: Implement actual voucher API call
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        'Voucher Added!',
        `Discount voucher for ${storeName || 'this store'} has been added to your account`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Add voucher error:', error);
      Alert.alert('Error', 'Unable to add voucher. Please try again.');
    } finally {
      setIsAddingVoucher(false);
    }
  };

  return (
    <View
      style={styles.wrap}
      testID={testID}
      accessibilityRole="region"
      accessibilityLabel="Instant discount voucher"
    >
      <View
        style={styles.card}
        accessibilityLabel={`${title}. ${savePercentage}. ${minimumBill}`}
      >
        {/* header */}
        <View style={styles.headerRow}>
          <ThemedText
            style={styles.title}
            accessibilityRole="header"
          >
            {title}
          </ThemedText>
          <View style={styles.badge} accessibilityElementsHidden>
            <ThemedText style={styles.badgeText}>{savePercentage}</ThemedText>
          </View>
        </View>

        {/* min bill */}
        <ThemedText style={styles.minBill}>{minimumBill}</ThemedText>

        {/* dashed divider */}
        <View style={styles.dashed} />

        {/* detail rows */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="bag-carry-on-off" size={24} color="purple" />
            </View>
            <ThemedText style={styles.detailText}>
              Offline Only <ThemedText style={styles.linkText}>| More details</ThemedText>
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="percent" size={20} color="purple" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.detailText}>
                Not valid above store discount
              </ThemedText>
              <ThemedText style={styles.subText}>Single voucher per bill</ThemedText>
            </View>
          </View>
        </View>

        {/* add button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleAddVoucher}
          disabled={disabled || isAddingVoucher}
          style={[styles.addBtn, (disabled || isAddingVoucher) && styles.addBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel={`Add ${title} voucher to account`}
          accessibilityHint="Double tap to add this discount voucher"
          accessibilityState={{ disabled: disabled || isAddingVoucher, busy: isAddingVoucher }}
        >
          <ThemedText style={styles.addText}>
            {isAddingVoucher ? 'Adding...' : 'Add'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
);
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    // very soft elevation like the screenshot
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: PURPLE,
  },
  badge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    // subtle floating feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2f2f2f',
  },

  minBill: {
    fontSize: 13,
    color: SECONDARY,
    marginTop: 2,
    marginBottom: 10,
  },

  dashed: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: DIVIDER,
    marginBottom: 12,
  },

  details: {
    gap: 10,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#efe8ff',
    borderWidth: 1,
    borderColor: '#e3dcff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: PRIMARY,
    lineHeight: 18,
  },
  linkText: {
    color: PURPLE,
    fontWeight: '600',
  },
  subText: {
    fontSize: 12,
    color: SECONDARY,
    marginTop: 2,
    lineHeight: 16,
  },

  addBtn: {
    marginTop: 4,
    backgroundColor: PURPLE,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    // slight glow like the mock
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  addBtnDisabled: {
    backgroundColor: '#b8aefc',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  addText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
