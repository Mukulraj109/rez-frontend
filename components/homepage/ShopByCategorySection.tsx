/**
 * Shop by Category Section - Converted from V2
 * Icon card grid with Electronics, Fashion, Food & Dining
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray300: '#D1D5DB',
  gray600: '#6B7280',
  green500: '#22C55E',
  emerald500: '#10B981',
};

const ShopByCategorySection: React.FC = () => {
  const router = useRouter();

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  const handleViewAll = () => {
    router.push('/categories' as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🛍️ Shop by Category</Text>
          <Text style={styles.headerSubtitle}>Cashback on every purchase</Text>
        </View>
      </View>

      {/* Cards Grid */}
      <View style={styles.grid}>
        {/* Electronics - Featured Large */}
        <TouchableOpacity
          style={styles.electronicsCard}
          onPress={() => handlePress('/electronics')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#3B82F6', '#06B6D4', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.electronicsGradient}
          >
            <View style={styles.electronicsIconBox}>
              <Text style={styles.electronicsIcon}>📱</Text>
            </View>
            <View style={styles.electronicsContent}>
              <Text style={styles.electronicsTitle}>Electronics</Text>
              <Text style={styles.electronicsSubtitle}>Phones, laptops, gadgets</Text>
              <View style={styles.electronicsBadges}>
                <View style={styles.cashbackBadge}>
                  <Text style={styles.cashbackText}>10-15% cashback</Text>
                </View>
                <Text style={styles.coinsText}>+ 2x coins</Text>
              </View>
            </View>
            <Text style={styles.electronicsArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Fashion & Food Row */}
        <View style={styles.row}>
          {/* Fashion */}
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => handlePress('/fashion')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#EC4899', '#9333EA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.categoryGradient}
            >
              <View style={styles.categoryIconBox}>
                <Text style={styles.categoryIcon}>👗</Text>
              </View>
              <Text style={styles.categoryTitle}>Fashion</Text>
              <Text style={styles.categorySubtitle}>Clothing & accessories</Text>
              <View style={styles.categoryFooter}>
                <Text style={styles.categoryPercent}>15-25%</Text>
                <View style={styles.trendingBadge}>
                  <Text style={styles.trendingText}>Trending</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Food & Dining */}
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => handlePress('/food')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#F97316', '#DC2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.categoryGradient}
            >
              <View style={styles.categoryIconBox}>
                <Text style={styles.categoryIcon}>🍽️</Text>
              </View>
              <Text style={styles.categoryTitle}>Food & Dining</Text>
              <Text style={styles.categorySubtitle}>Restaurants & cafes</Text>
              <View style={styles.categoryFooter}>
                <Text style={styles.categoryPercent}>10-20%</Text>
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Popular</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* View All Categories */}
      <TouchableOpacity
        style={styles.viewAllButton}
        onPress={handleViewAll}
        activeOpacity={0.8}
      >
        <Text style={styles.viewAllButtonText}>View All 15+ Categories</Text>
        <Text style={styles.viewAllArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 2,
  },
  grid: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },

  // Electronics Card
  electronicsCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  electronicsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  electronicsIconBox: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  electronicsIcon: {
    fontSize: 36,
  },
  electronicsContent: {
    flex: 1,
  },
  electronicsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  electronicsSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  electronicsBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cashbackBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  coinsText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  electronicsArrow: {
    fontSize: 24,
    color: COLORS.white,
  },

  // Row
  row: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },

  // Category Cards (Fashion, Food)
  categoryCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryGradient: {
    padding: 16,
  },
  categoryIconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 26,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  categoryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  trendingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  trendingText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  popularBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  popularText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },

  // View All Button
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.gray300,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  viewAllArrow: {
    fontSize: 16,
    color: COLORS.gray600,
  },
});

export default ShopByCategorySection;
