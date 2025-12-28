/**
 * Fashion Category Page
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLORS = { white: '#FFFFFF', navy: '#0B2240', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray600: '#6B7280', green500: '#22C55E', pink500: '#EC4899', amber500: '#F59E0B' };

const subcategories = [
  { id: 'men', title: 'Men', icon: '👔', count: '10k+ items' },
  { id: 'women', title: 'Women', icon: '👗', count: '15k+ items' },
  { id: 'kids', title: 'Kids', icon: '🧒', count: '5k+ items' },
  { id: 'footwear', title: 'Footwear', icon: '👟', count: '3k+ items' },
  { id: 'accessories', title: 'Accessories', icon: '👜', count: '8k+ items' },
  { id: 'watches', title: 'Watches', icon: '⌚', count: '2k+ items' },
];

const featuredProducts = [
  { id: 1, name: 'Classic Polo T-Shirt', brand: 'Nike', price: '₹1,299', originalPrice: '₹1,999', cashback: '20%', rating: 4.5, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' },
  { id: 2, name: 'Floral Maxi Dress', brand: 'Zara', price: '₹2,499', originalPrice: '₹3,499', cashback: '25%', rating: 4.7, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400' },
  { id: 3, name: 'Running Shoes Pro', brand: 'Adidas', price: '₹4,999', originalPrice: '₹6,999', cashback: '30%', rating: 4.8, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
  { id: 4, name: 'Slim Fit Jeans', brand: 'Levis', price: '₹1,899', originalPrice: '₹2,499', cashback: '15%', rating: 4.6, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400' },
];

const topBrands = [
  { id: 1, name: 'Nike', logo: '✓', discount: 'Up to 40% off' },
  { id: 2, name: 'Adidas', logo: '∆', discount: 'Up to 50% off' },
  { id: 3, name: 'Zara', logo: 'Z', discount: 'Up to 30% off' },
  { id: 4, name: 'H&M', logo: 'H', discount: 'Up to 60% off' },
  { id: 5, name: 'Levis', logo: 'L', discount: 'Up to 35% off' },
];

const trendingStyles = [
  { id: 1, name: 'Casual', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400' },
  { id: 2, name: 'Formal', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
  { id: 3, name: 'Ethnic', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400' },
  { id: 4, name: 'Sports', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400' },
];

const FashionPage: React.FC = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#EC4899', '#DB2777']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Fashion</Text>
            <Text style={styles.headerSubtitle}>Trending styles & collections</Text>
          </View>
          <TouchableOpacity style={styles.cartButton}>
            <Ionicons name="cart-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>40k+</Text><Text style={styles.statLabel}>Products</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statValue}>60%</Text><Text style={styles.statLabel}>Max Off</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statValue}>200+</Text><Text style={styles.statLabel}>Brands</Text></View>
        </View>
      </LinearGradient>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'Trending', 'New Arrivals', 'Sale', 'Premium'].map((filter) => (
            <TouchableOpacity key={filter} onPress={() => setSelectedFilter(filter)} style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, selectedFilter === filter && styles.filterChipTextActive]}>{filter === 'all' ? 'All' : filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <View style={styles.categoriesGrid}>
            {subcategories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryCard} onPress={() => router.push(`/categories` as any)} activeOpacity={0.8}>
                <View style={styles.categoryIcon}><Text style={styles.categoryEmoji}>{cat.icon}</Text></View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
                <Text style={styles.categoryCount}>{cat.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Styles</Text>
            <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trendingStyles.map((style) => (
              <TouchableOpacity key={style.id} style={styles.styleCard} activeOpacity={0.8}>
                <Image source={{ uri: style.image }} style={styles.styleImage} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.styleGradient}>
                  <Text style={styles.styleName}>{style.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Brands</Text>
            <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {topBrands.map((brand) => (
              <TouchableOpacity key={brand.id} style={styles.brandCard} activeOpacity={0.8}>
                <View style={styles.brandLogoContainer}><Text style={styles.brandLogo}>{brand.logo}</Text></View>
                <Text style={styles.brandName}>{brand.name}</Text>
                <Text style={styles.brandDiscount}>{brand.discount}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Best Sellers</Text>
            <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
          </View>
          <View style={styles.productsGrid}>
            {featuredProducts.map((product) => (
              <TouchableOpacity key={product.id} style={styles.productCard} onPress={() => router.push(`/product` as any)} activeOpacity={0.8}>
                <Image source={{ uri: product.image }} style={styles.productImage} />
                <View style={styles.cashbackBadge}><Text style={styles.cashbackText}>{product.cashback}</Text></View>
                <View style={styles.productInfo}>
                  <Text style={styles.productBrand}>{product.brand}</Text>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color={COLORS.amber500} />
                    <Text style={styles.ratingText}>{product.rating}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>{product.price}</Text>
                    <Text style={styles.originalPrice}>{product.originalPrice}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.promoBanner}>
          <LinearGradient colors={['#8B5CF6', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.promoGradient}>
            <Text style={styles.promoEmoji}>👗</Text>
            <Text style={styles.promoTitle}>End of Season Sale</Text>
            <Text style={styles.promoSubtitle}>Up to 70% off on top brands</Text>
            <TouchableOpacity style={styles.promoButton}><Text style={styles.promoButtonText}>Shop Now</Text></TouchableOpacity>
          </LinearGradient>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  backButton: { padding: 8 },
  headerTitleContainer: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  cartButton: { padding: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  statItem: { alignItems: 'center', paddingHorizontal: 20 },
  statValue: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  filtersContainer: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.gray100, marginRight: 8 },
  filterChipActive: { backgroundColor: COLORS.pink500 },
  filterChipText: { fontSize: 14, color: COLORS.gray600 },
  filterChipTextActive: { color: COLORS.white, fontWeight: '600' },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy, marginBottom: 12 },
  viewAllText: { fontSize: 14, fontWeight: '600', color: COLORS.pink500 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: (SCREEN_WIDTH - 56) / 3, alignItems: 'center', padding: 12, backgroundColor: COLORS.gray50, borderRadius: 16 },
  categoryIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EC489920', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryEmoji: { fontSize: 24 },
  categoryTitle: { fontSize: 12, fontWeight: '600', color: COLORS.navy, marginBottom: 2, textAlign: 'center' },
  categoryCount: { fontSize: 10, color: COLORS.gray600 },
  styleCard: { width: 140, height: 180, marginRight: 12, borderRadius: 16, overflow: 'hidden' },
  styleImage: { width: '100%', height: '100%' },
  styleGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  styleName: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  brandCard: { width: 100, alignItems: 'center', padding: 12, backgroundColor: COLORS.gray50, borderRadius: 16, marginRight: 12 },
  brandLogoContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: COLORS.gray200 },
  brandLogo: { fontSize: 20, fontWeight: '700', color: COLORS.navy },
  brandName: { fontSize: 12, fontWeight: '600', color: COLORS.navy, marginBottom: 2 },
  brandDiscount: { fontSize: 10, color: COLORS.green500, fontWeight: '600' },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  productCard: { width: (SCREEN_WIDTH - 44) / 2, backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.gray200 },
  productImage: { width: '100%', height: 160 },
  cashbackBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: COLORS.green500, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cashbackText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  productInfo: { padding: 12 },
  productBrand: { fontSize: 11, color: COLORS.gray600, marginBottom: 2 },
  productName: { fontSize: 14, fontWeight: '600', color: COLORS.navy, marginBottom: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  ratingText: { fontSize: 12, color: COLORS.navy, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  productPrice: { fontSize: 15, fontWeight: '700', color: COLORS.green500 },
  originalPrice: { fontSize: 12, color: COLORS.gray600, textDecorationLine: 'line-through' },
  promoBanner: { marginHorizontal: 16 },
  promoGradient: { padding: 24, borderRadius: 16, alignItems: 'center' },
  promoEmoji: { fontSize: 40, marginBottom: 12 },
  promoTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  promoSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 16 },
  promoButton: { backgroundColor: COLORS.white, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  promoButtonText: { fontSize: 14, fontWeight: '700', color: '#8B5CF6' },
});

export default FashionPage;
