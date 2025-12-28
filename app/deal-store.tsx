/**
 * Deal Store Page - All deals in one place
 * Converted from V2: DealStore.jsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  emerald500: '#10B981',
  amber500: '#F59E0B',
  blue500: '#3B82F6',
  purple500: '#8B5CF6',
  pink500: '#EC4899',
  red500: '#EF4444',
  cyan500: '#06B6D4',
};

interface Deal {
  id: number;
  store: string;
  image: string;
  cashback?: string;
  coins?: string;
  bonus?: string;
  drop?: string;
  endsIn?: string;
  category: string;
}

interface DealCategory {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  gradientColors: string[];
  deals: Deal[];
}

const dealCategories: DealCategory[] = [
  {
    id: 'super-cashback',
    title: 'Super Cashback Weekend',
    subtitle: 'Up to 50% cashback',
    badge: '50%',
    gradientColors: ['rgba(16, 185, 129, 0.2)', 'rgba(20, 184, 166, 0.1)'],
    deals: [
      { id: 1, store: 'Electronics Hub', cashback: '40%', category: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300' },
      { id: 2, store: 'Fashion Central', cashback: '50%', category: 'Fashion', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300' },
      { id: 3, store: 'Home Decor', cashback: '35%', category: 'Home', image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=300' },
      { id: 4, store: 'Sports Zone', cashback: '45%', category: 'Sports', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300' },
    ],
  },
  {
    id: 'triple-coin-day',
    title: 'Triple Coin Day',
    subtitle: '3X coins on all spends',
    badge: '3X',
    gradientColors: ['rgba(245, 158, 11, 0.2)', 'rgba(249, 115, 22, 0.1)'],
    deals: [
      { id: 5, store: 'Grocery Mart', coins: '3000', category: 'Grocery', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300' },
      { id: 6, store: 'Beauty Palace', coins: '2500', category: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300' },
      { id: 7, store: 'Fitness Zone', coins: '1800', category: 'Fitness', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300' },
      { id: 8, store: 'Tech World', coins: '2200', category: 'Electronics', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300' },
    ],
  },
  {
    id: 'mega-bank-offers',
    title: 'Mega Bank Offers',
    subtitle: 'HDFC, ICICI, SBI, Axis',
    badge: 'BANKS',
    gradientColors: ['rgba(59, 130, 246, 0.2)', 'rgba(99, 102, 241, 0.1)'],
    deals: [
      { id: 9, store: 'HDFC Exclusive', cashback: '₹5000 off', category: 'Bank', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300' },
      { id: 10, store: 'ICICI Bonanza', cashback: '₹3000 off', category: 'Bank', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300' },
      { id: 11, store: 'SBI Specials', cashback: '20% cashback', category: 'Bank', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300' },
      { id: 12, store: 'Axis Rewards', cashback: '₹2500 off', category: 'Bank', image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300' },
    ],
  },
  {
    id: 'upload-bill-bonanza',
    title: 'Upload Bill Bonanza',
    subtitle: 'Extra ₹100 on every bill',
    badge: '+₹100',
    gradientColors: ['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.1)'],
    deals: [
      { id: 13, store: 'Any Restaurant', bonus: '+₹100 coins', category: 'Food', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300' },
      { id: 14, store: 'Any Salon', bonus: '+₹150 coins', category: 'Beauty', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300' },
      { id: 15, store: 'Any Store', bonus: '+₹100 coins', category: 'Shopping', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300' },
      { id: 16, store: 'Any Pharmacy', bonus: '+₹75 coins', category: 'Health', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300' },
    ],
  },
  {
    id: 'flash-coin-drops',
    title: 'Flash Coin Drops',
    subtitle: 'Limited time only',
    badge: 'LIVE',
    gradientColors: ['rgba(239, 68, 68, 0.2)', 'rgba(249, 115, 22, 0.1)'],
    deals: [
      { id: 17, store: 'Nike Store', drop: '500 coins', endsIn: '2h', category: 'Fashion', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300' },
      { id: 18, store: 'Starbucks', drop: '300 coins', endsIn: '4h', category: 'Food', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300' },
      { id: 19, store: 'Zara', drop: '400 coins', endsIn: '6h', category: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300' },
      { id: 20, store: 'Apple Store', drop: '1000 coins', endsIn: '1h', category: 'Electronics', image: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=300' },
    ],
  },
  {
    id: 'new-user-bonanza',
    title: 'New User Bonanza',
    subtitle: 'First purchase rewards',
    badge: 'NEW',
    gradientColors: ['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.1)'],
    deals: [
      { id: 21, store: 'First Order', bonus: '₹500 off', category: 'New User', image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300' },
      { id: 22, store: 'First Visit', bonus: '1000 coins', category: 'New User', image: 'https://images.unsplash.com/photo-1555529902-5261145633bf?w=300' },
      { id: 23, store: 'Sign Up Bonus', bonus: '₹300 cashback', category: 'New User', image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=300' },
      { id: 24, store: 'Welcome Gift', bonus: '₹200 voucher', category: 'New User', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300' },
    ],
  },
];

const DealStorePage: React.FC = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Cashback', 'Coins', 'Bank Offers', 'Flash Deals'];

  const handleDealPress = (dealId: number) => {
    router.push(`/offers/${dealId}` as any);
  };

  const renderDealValue = (deal: Deal) => {
    if (deal.cashback) {
      return <Text style={styles.dealCashback}>{deal.cashback}</Text>;
    }
    if (deal.coins) {
      return <Text style={styles.dealCoins}>🪙 {deal.coins}</Text>;
    }
    if (deal.bonus) {
      return <Text style={styles.dealBonus}>{deal.bonus}</Text>;
    }
    if (deal.drop) {
      return <Text style={styles.dealDrop}>🎁 {deal.drop}</Text>;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#22C55E', '#14B8A6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Deal Store</Text>
            <Text style={styles.headerSubtitle}>All deals in one place</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroEmoji}>🔥</Text>
          <Text style={styles.heroTitle}>Don't Miss Out!</Text>
          <Text style={styles.heroSubtitle}>New deals added every hour • Limited quantities</Text>
        </View>
      </LinearGradient>

      {/* Category Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.filterChip,
                selectedCategory === category && styles.filterChipActive
              ]}
            >
              <Text style={[
                styles.filterChipText,
                selectedCategory === category && styles.filterChipTextActive
              ]}>
                {category === 'all' ? 'All Deals' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Deal Categories */}
        {dealCategories.map((category) => (
          <View key={category.id} style={styles.categorySection}>
            {/* Category Header */}
            <LinearGradient
              colors={category.gradientColors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.categoryHeader}
            >
              <View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{category.badge}</Text>
              </View>
            </LinearGradient>

            {/* Deals Grid */}
            <View style={styles.dealsGrid}>
              {category.deals.map((deal) => (
                <TouchableOpacity
                  key={deal.id}
                  style={styles.dealCard}
                  onPress={() => handleDealPress(deal.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dealImageContainer}>
                    <Image source={{ uri: deal.image }} style={styles.dealImage} />
                    {deal.endsIn && (
                      <View style={styles.timerBadge}>
                        <Text style={styles.timerText}>{deal.endsIn} left</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.dealInfo}>
                    <Text style={styles.dealStore} numberOfLines={1}>{deal.store}</Text>
                    {renderDealValue(deal)}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Bottom CTA */}
        <View style={styles.bottomCTA}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaTitle}>💰 Maximize Your Savings</Text>
            <Text style={styles.ctaSubtitle}>Stack cashback + coins + bank offers for maximum savings!</Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Learn How</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  searchButton: {
    padding: 8,
  },
  heroBanner: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  heroEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  filtersContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.emerald500,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  categoryBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
  },
  dealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 8,
  },
  dealCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginBottom: 4,
  },
  dealImageContainer: {
    position: 'relative',
  },
  dealImage: {
    width: '100%',
    height: 100,
  },
  timerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.red500,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  dealInfo: {
    padding: 12,
  },
  dealStore: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  dealCashback: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.emerald500,
  },
  dealCoins: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.amber500,
  },
  dealBonus: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.purple500,
  },
  dealDrop: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.red500,
  },
  bottomCTA: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  ctaGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.purple500,
  },
});

export default DealStorePage;
