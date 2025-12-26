/**
 * Product/Store Comparison Page
 * Allows users to compare products or stores side by side
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primaryGreen: '#00C06A',
  primaryGold: '#F59E0B',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  background: '#F5F5F5',
  border: '#E5E7EB',
};

// Sample comparison items
const SAMPLE_ITEMS = [
  {
    id: '1',
    name: 'Nike Air Max 270',
    image: 'https://via.placeholder.com/150',
    price: 12999,
    cashback: 15,
    rating: 4.5,
    features: ['Breathable mesh', 'Air cushioning', 'Lightweight'],
  },
  {
    id: '2',
    name: 'Adidas Ultraboost',
    image: 'https://via.placeholder.com/150',
    price: 14999,
    cashback: 12,
    rating: 4.7,
    features: ['Boost technology', 'Primeknit upper', 'Continental rubber'],
  },
];

export default function ComparePage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [compareItems, setCompareItems] = useState(SAMPLE_ITEMS);

  const handleAddItem = () => {
    router.push('/search?mode=compare');
  };

  const handleRemoveItem = (id: string) => {
    setCompareItems(compareItems.filter((item) => item.id !== id));
  };

  const handleBuy = (item: any) => {
    router.push(`/ProductPage?productId=${item.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compare Products</Text>
        <TouchableOpacity onPress={handleAddItem}>
          <Ionicons name="add-circle-outline" size={28} color={COLORS.primaryGreen} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {compareItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="git-compare-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No items to compare</Text>
            <Text style={styles.emptySubtitle}>
              Add products to compare their features, prices, and cashback
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Comparison Grid */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.comparisonTable}>
                {/* Product Images & Names */}
                <View style={styles.tableRow}>
                  <View style={styles.labelCell} />
                  {compareItems.map((item) => (
                    <View key={item.id} style={styles.productCell}>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveItem(item.id)}
                      >
                        <Ionicons name="close-circle" size={24} color="#EF4444" />
                      </TouchableOpacity>
                      <Image source={{ uri: item.image }} style={styles.productImage} />
                      <Text style={styles.productName} numberOfLines={2}>
                        {item.name}
                      </Text>
                    </View>
                  ))}
                  {compareItems.length < 3 && (
                    <TouchableOpacity style={styles.addProductCell} onPress={handleAddItem}>
                      <Ionicons name="add-circle-outline" size={40} color={COLORS.textSecondary} />
                      <Text style={styles.addProductText}>Add Product</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Price Row */}
                <View style={styles.tableRow}>
                  <View style={styles.labelCell}>
                    <Text style={styles.labelText}>Price</Text>
                  </View>
                  {compareItems.map((item) => (
                    <View key={item.id} style={styles.valueCell}>
                      <Text style={styles.priceText}>₹{item.price.toLocaleString()}</Text>
                    </View>
                  ))}
                  {compareItems.length < 3 && <View style={styles.valueCell} />}
                </View>

                {/* Cashback Row */}
                <View style={styles.tableRow}>
                  <View style={styles.labelCell}>
                    <Text style={styles.labelText}>Cashback</Text>
                  </View>
                  {compareItems.map((item) => (
                    <View key={item.id} style={styles.valueCell}>
                      <Text style={styles.cashbackText}>{item.cashback}%</Text>
                      <Text style={styles.cashbackAmount}>
                        Save ₹{Math.round(item.price * item.cashback / 100)}
                      </Text>
                    </View>
                  ))}
                  {compareItems.length < 3 && <View style={styles.valueCell} />}
                </View>

                {/* Rating Row */}
                <View style={styles.tableRow}>
                  <View style={styles.labelCell}>
                    <Text style={styles.labelText}>Rating</Text>
                  </View>
                  {compareItems.map((item) => (
                    <View key={item.id} style={styles.valueCell}>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color={COLORS.primaryGold} />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
                    </View>
                  ))}
                  {compareItems.length < 3 && <View style={styles.valueCell} />}
                </View>

                {/* Features Row */}
                <View style={styles.tableRow}>
                  <View style={styles.labelCell}>
                    <Text style={styles.labelText}>Features</Text>
                  </View>
                  {compareItems.map((item) => (
                    <View key={item.id} style={styles.valueCell}>
                      {item.features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                          <Ionicons name="checkmark" size={14} color={COLORS.primaryGreen} />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                  {compareItems.length < 3 && <View style={styles.valueCell} />}
                </View>

                {/* Buy Button Row */}
                <View style={styles.tableRow}>
                  <View style={styles.labelCell} />
                  {compareItems.map((item) => (
                    <View key={item.id} style={styles.valueCell}>
                      <TouchableOpacity
                        style={styles.buyButton}
                        onPress={() => handleBuy(item)}
                      >
                        <Text style={styles.buyButtonText}>Buy Now</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {compareItems.length < 3 && <View style={styles.valueCell} />}
                </View>
              </View>
            </ScrollView>

            {/* Best Value Indicator */}
            {compareItems.length >= 2 && (
              <View style={styles.bestValue}>
                <Ionicons name="trophy" size={20} color={COLORS.primaryGold} />
                <Text style={styles.bestValueText}>
                  Best Value: {compareItems.reduce((best, item) =>
                    item.cashback > best.cashback ? item : best
                  ).name}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 15,
  },
  comparisonTable: {
    padding: 16,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  labelCell: {
    width: 100,
    padding: 12,
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  productCell: {
    width: 150,
    padding: 12,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 1,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  addProductCell: {
    width: 150,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginLeft: 8,
  },
  addProductText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  valueCell: {
    width: 150,
    padding: 12,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cashbackText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  cashbackAmount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  buyButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buyButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  bestValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    padding: 12,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  bestValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
