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
  SafeAreaView,
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
  { id: 'all', label: 'All', color: '#10B981' },
  { id: 'electronics', label: 'Electronics', color: '#10B981' },
  { id: 'grocery', label: 'Grocery', color: '#10B981' },
  { id: 'fashion', label: 'Fashion', color: '#10B981' },
  { id: 'home', label: 'Home', color: '#10B981' },
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
      activeOpacity={0.8}
    >
      <View style={styles.guaranteeBadge}>
        <Ionicons name="shield-checkmark" size={12} color="#FFF" />
        <ThemedText style={styles.guaranteeText}>Lowest Price</ThemedText>
      </View>

      <View style={styles.productHeader}>
        <View style={styles.productImageContainer}>
          <View style={styles.productImage}>
            <ThemedText style={styles.productEmoji}>{item.image}</ThemedText>
          </View>
        </View>
        <View style={styles.productInfo}>
          <ThemedText style={styles.productName} numberOfLines={2}>{item.name}</ThemedText>
          <View style={styles.storeBadge}>
            <Ionicons name="storefront" size={10} color={Colors.success} />
            <ThemedText style={styles.lowestStore}>{item.lowestStore}</ThemedText>
          </View>
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
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.savingsBadgeGradient}
          >
            <Ionicons name="trending-down" size={14} color="#FFF" />
            <ThemedText style={styles.savingsText}>Save {item.savings}</ThemedText>
          </LinearGradient>
        </View>
        <TouchableOpacity style={styles.shopButton} activeOpacity={0.8}>
          <LinearGradient
            colors={['#00C06A', '#00A85A']}
            style={styles.shopButtonGradient}
          >
            <ThemedText style={styles.shopButtonText}>Shop Now</ThemedText>
            <Ionicons name="arrow-forward" size={14} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#10B981" />
      
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Modern Gradient Header */}
        <LinearGradient
          colors={['#10B981', '#059669', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <View style={styles.backButtonInner}>
                <Ionicons name="chevron-back" size={22} color="#10B981" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <ThemedText style={styles.headerTitle}>Lowest Prices</ThemedText>
            </View>
            
            <View style={styles.placeholder} />
          </View>

          <View style={styles.heroSection}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="pricetag" size={32} color="#FFF" />
            </View>
            <ThemedText style={styles.heroTitle}>Price Match Guarantee</ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              We compare prices across stores to find you the best deals
            </ThemedText>
          </View>

          <View style={styles.savingsCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.savingsCardGradient}
            >
              <ThemedText style={styles.savingsCardLabel}>Total Savings Available</ThemedText>
              <ThemedText style={styles.savingsCardValue}>₹{totalSavings.toLocaleString()}</ThemedText>
            </LinearGradient>
          </View>
        </LinearGradient>

        {/* Enhanced Category Tabs */}
        <View style={styles.categoryTabsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabs}
          >
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryTab,
                    isActive && styles.categoryTabActive,
                    isActive && { backgroundColor: category.color },
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                  activeOpacity={0.8}
                >
                  <ThemedText style={[
                    styles.categoryTabText,
                    isActive && styles.categoryTabTextActive,
                  ]}>
                    {category.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Product List */}
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={Colors.text.tertiary} />
              <ThemedText style={styles.emptyText}>No products found</ThemedText>
              <ThemedText style={styles.emptySubtext}>Try selecting a different category</ThemedText>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Shadows.medium,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.subtle,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 16,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Shadows.subtle,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    fontWeight: '500',
  },
  savingsCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.subtle,
  },
  savingsCardGradient: {
    padding: 16,
    alignItems: 'center',
  },
  savingsCardLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    fontWeight: '500',
  },
  savingsCardValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -1,
  },
  categoryTabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryTabs: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    minHeight: 40,
    ...Shadows.subtle,
  },
  categoryTabActive: {
    backgroundColor: '#10B981',
    ...Shadows.medium,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  categoryTabTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    ...Shadows.subtle,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  guaranteeBadge: {
    position: 'absolute',
    top: 0,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    zIndex: 1,
    ...Shadows.subtle,
  },
  guaranteeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingTop: 8,
  },
  productImageContainer: {
    marginRight: 12,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  productEmoji: {
    fontSize: 32,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 6,
    lineHeight: 22,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lowestStore: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  priceComparison: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  lowestPriceContainer: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#10B98120',
  },
  lowestPriceLabel: {
    fontSize: 11,
    color: '#10B981',
    marginBottom: 4,
    fontWeight: '600',
  },
  lowestPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: -0.5,
  },
  otherPricesContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  otherPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  otherStore: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  otherPrice: {
    fontSize: 13,
    color: Colors.text.secondary,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  savingsBadge: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  savingsBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  savingsText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '700',
  },
  shopButton: {
    borderRadius: 10,
    overflow: 'hidden',
    ...Shadows.subtle,
  },
  shopButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  shopButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.tertiary,
  },
});
