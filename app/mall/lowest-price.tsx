// Lowest Price Store Page
// Price comparison winner stores

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

interface PriceCompareItem {
  id: string;
  name: string;
  image: string;
  category: string;
  lowestPrice: string;
  otherPrices: { store: string; price: string }[];
  savings: string;
  lowestStore: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'grocery', label: 'Grocery' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'home', label: 'Home' },
];

const MOCK_PRODUCTS: PriceCompareItem[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    image: '📱',
    category: 'electronics',
    lowestPrice: '₹1,29,900',
    otherPrices: [
      { store: 'Flipkart', price: '₹1,34,900' },
      { store: 'Amazon', price: '₹1,31,900' },
    ],
    savings: '₹5,000',
    lowestStore: 'Croma',
  },
  {
    id: '2',
    name: 'Samsung 55" 4K TV',
    image: '📺',
    category: 'electronics',
    lowestPrice: '₹42,990',
    otherPrices: [
      { store: 'Amazon', price: '₹45,990' },
      { store: 'Flipkart', price: '₹44,990' },
    ],
    savings: '₹3,000',
    lowestStore: 'Reliance Digital',
  },
  {
    id: '3',
    name: 'Levi\'s 501 Jeans',
    image: '👖',
    category: 'fashion',
    lowestPrice: '₹2,499',
    otherPrices: [
      { store: 'Amazon', price: '₹2,999' },
      { store: 'Myntra', price: '₹2,799' },
    ],
    savings: '₹500',
    lowestStore: 'AJIO',
  },
  {
    id: '4',
    name: 'Atta 10kg Pack',
    image: '🌾',
    category: 'grocery',
    lowestPrice: '₹399',
    otherPrices: [
      { store: 'Amazon', price: '₹449' },
      { store: 'Flipkart', price: '₹429' },
    ],
    savings: '₹50',
    lowestStore: 'BigBasket',
  },
  {
    id: '5',
    name: 'Dyson V15 Vacuum',
    image: '🧹',
    category: 'home',
    lowestPrice: '₹52,900',
    otherPrices: [
      { store: 'Amazon', price: '₹56,900' },
      { store: 'Croma', price: '₹54,900' },
    ],
    savings: '₹4,000',
    lowestStore: 'Flipkart',
  },
];

export default function LowestPricePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = selectedCategory === 'all'
    ? MOCK_PRODUCTS
    : MOCK_PRODUCTS.filter(p => p.category === selectedCategory);

  const totalSavings = MOCK_PRODUCTS.reduce((sum, p) => {
    return sum + parseInt(p.savings.replace(/[₹,]/g, ''));
  }, 0);

  const renderProduct = ({ item }: { item: PriceCompareItem }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}` as any)}
    >
      <View style={styles.guaranteeBadge}>
        <Ionicons name="shield-checkmark" size={12} color="#FFF" />
        <ThemedText style={styles.guaranteeText}>Lowest Price</ThemedText>
      </View>

      <View style={styles.productHeader}>
        <View style={styles.productImage}>
          <ThemedText style={styles.productEmoji}>{item.image}</ThemedText>
        </View>
        <View style={styles.productInfo}>
          <ThemedText style={styles.productName}>{item.name}</ThemedText>
          <ThemedText style={styles.lowestStore}>at {item.lowestStore}</ThemedText>
        </View>
      </View>

      <View style={styles.priceComparison}>
        <View style={styles.lowestPriceContainer}>
          <ThemedText style={styles.lowestPriceLabel}>Lowest Price</ThemedText>
          <ThemedText style={styles.lowestPrice}>{item.lowestPrice}</ThemedText>
        </View>

        <View style={styles.otherPricesContainer}>
          {item.otherPrices.map((price, index) => (
            <View key={index} style={styles.otherPriceRow}>
              <ThemedText style={styles.otherStore}>{price.store}</ThemedText>
              <ThemedText style={styles.otherPrice}>{price.price}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.savingsContainer}>
        <View style={styles.savingsBadge}>
          <Ionicons name="trending-down" size={14} color={Colors.success} />
          <ThemedText style={styles.savingsText}>Save {item.savings}</ThemedText>
        </View>
        <TouchableOpacity style={styles.shopButton}>
          <ThemedText style={styles.shopButtonText}>Shop Now</ThemedText>
          <Ionicons name="arrow-forward" size={14} color="#FFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.success} />

      <LinearGradient
        colors={[Colors.success, '#059669']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Lowest Prices</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Ionicons name="pricetag" size={32} color="#FFF" />
          </View>
          <ThemedText style={styles.heroTitle}>Price Match Guarantee</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            We compare prices across stores to find you the best deals
          </ThemedText>
        </View>

        <View style={styles.savingsCard}>
          <ThemedText style={styles.savingsCardLabel}>Total Savings Available</ThemedText>
          <ThemedText style={styles.savingsCardValue}>₹{totalSavings.toLocaleString()}</ThemedText>
        </View>
      </LinearGradient>

      <View style={styles.categoryTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.categoryTabActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <ThemedText style={[
                styles.categoryTabText,
                selectedCategory === category.id && styles.categoryTabTextActive,
              ]}>
                {category.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    ...Typography.h3,
    color: '#FFF',
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: {
    ...Typography.h2,
    color: '#FFF',
  },
  heroSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  savingsCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    alignItems: 'center',
  },
  savingsCardLabel: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
  },
  savingsCardValue: {
    ...Typography.h1,
    color: '#FFF',
  },
  categoryTabs: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  categoryTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    marginRight: Spacing.sm,
    ...Shadows.subtle,
  },
  categoryTabActive: {
    backgroundColor: Colors.success,
  },
  categoryTabText: {
    ...Typography.label,
    color: Colors.text.secondary,
  },
  categoryTabTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  productCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    position: 'relative',
    ...Shadows.subtle,
  },
  guaranteeBadge: {
    position: 'absolute',
    top: 0,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success,
    borderBottomLeftRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  guaranteeText: {
    ...Typography.caption,
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingTop: Spacing.sm,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  productEmoji: {
    fontSize: 30,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  lowestStore: {
    ...Typography.bodySmall,
    color: Colors.success,
  },
  priceComparison: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  lowestPriceContainer: {
    flex: 1,
    backgroundColor: Colors.success + '15',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginRight: Spacing.md,
  },
  lowestPriceLabel: {
    ...Typography.caption,
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  lowestPrice: {
    ...Typography.h3,
    color: Colors.success,
  },
  otherPricesContainer: {
    flex: 1,
  },
  otherPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  otherStore: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
  },
  otherPrice: {
    ...Typography.body,
    color: Colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  savingsText: {
    ...Typography.label,
    color: Colors.success,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  shopButtonText: {
    ...Typography.label,
    color: '#FFF',
  },
});
