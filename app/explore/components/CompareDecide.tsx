import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const compareProduct = {
  name: 'Nike Air Max 90',
  image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
  optionsCount: 3,
  options: [
    {
      id: 1,
      platform: 'Store Nearby',
      price: 6999,
      delivery: 'Pickup',
      cashback: '10% back',
      isBest: false,
    },
    {
      id: 2,
      platform: 'ReZ Mall',
      price: 7199,
      delivery: '60 min',
      cashback: '15% back',
      isBest: true,
    },
    {
      id: 3,
      platform: 'Brand Website',
      price: 7499,
      delivery: '3 days',
      cashback: 'No cashback',
      isBest: false,
    },
  ],
};

const CompareDecide = () => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Compare & Decide</Text>
          <Text style={styles.sectionSubtitle}>Same product, best deal</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.compareMoreText}>Compare More</Text>
        </TouchableOpacity>
      </View>

      {/* Compare Card */}
      <View style={styles.compareCard}>
        {/* Product Info */}
        <View style={styles.productRow}>
          <Image source={{ uri: compareProduct.image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{compareProduct.name}</Text>
            <Text style={styles.optionsCount}>{compareProduct.optionsCount} options available</Text>
          </View>
        </View>

        {/* Options Table */}
        <View style={styles.optionsTable}>
          {compareProduct.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionRow,
                option.isBest && styles.optionRowBest,
              ]}
              onPress={() => navigateTo('/MainStorePage?id=1')}
            >
              {/* Platform Icon & Name */}
              <View style={styles.platformCell}>
                <View style={[
                  styles.platformIcon,
                  option.isBest && styles.platformIconBest,
                ]}>
                  {option.platform === 'Store Nearby' && (
                    <Ionicons name="storefront" size={16} color={option.isBest ? '#FFFFFF' : '#6B7280'} />
                  )}
                  {option.platform === 'ReZ Mall' && (
                    <Ionicons name="cart" size={16} color={option.isBest ? '#FFFFFF' : '#6B7280'} />
                  )}
                  {option.platform === 'Brand Website' && (
                    <Ionicons name="globe" size={16} color={option.isBest ? '#FFFFFF' : '#6B7280'} />
                  )}
                </View>
                <View>
                  <Text style={[
                    styles.platformName,
                    option.isBest && styles.platformNameBest,
                  ]}>
                    {option.platform}
                  </Text>
                  <Text style={styles.deliveryText}>{option.delivery}</Text>
                </View>
              </View>

              {/* Price */}
              <Text style={[
                styles.priceText,
                option.isBest && styles.priceTextBest,
              ]}>
                ₹{option.price.toLocaleString()}
              </Text>

              {/* Cashback */}
              <View style={[
                styles.cashbackCell,
                option.isBest && styles.cashbackCellBest,
                option.cashback === 'No cashback' && styles.cashbackCellNone,
              ]}>
                <Text style={[
                  styles.cashbackText,
                  option.isBest && styles.cashbackTextBest,
                  option.cashback === 'No cashback' && styles.cashbackTextNone,
                ]}>
                  {option.cashback}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* View All Options Button */}
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All Options</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2240',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  compareMoreText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  compareCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    marginLeft: 14,
    flex: 1,
  },
  productName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0B2240',
  },
  optionsCount: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  optionsTable: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  optionRowBest: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#00C06A',
  },
  platformCell: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  platformIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformIconBest: {
    backgroundColor: '#00C06A',
  },
  platformName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  platformNameBest: {
    color: '#0B2240',
  },
  deliveryText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    minWidth: 70,
    textAlign: 'center',
  },
  priceTextBest: {
    color: '#0B2240',
  },
  cashbackCell: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 75,
    alignItems: 'center',
  },
  cashbackCellBest: {
    backgroundColor: '#00C06A',
  },
  cashbackCellNone: {
    backgroundColor: '#F3F4F6',
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  cashbackTextBest: {
    color: '#FFFFFF',
  },
  cashbackTextNone: {
    color: '#9CA3AF',
  },
  viewAllButton: {
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
});

export default CompareDecide;
