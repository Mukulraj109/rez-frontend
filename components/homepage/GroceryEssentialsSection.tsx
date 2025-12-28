/**
 * Grocery & Essentials Section - Converted from V2
 * Quick Delivery with category grid
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
const CARD_GAP = 10;

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray600: '#6B7280',
  green500: '#22C55E',
  green600: '#16A34A',
};

const GroceryEssentialsSection: React.FC = () => {
  const router = useRouter();

  const handleViewAll = () => {
    router.push('/grocery' as any);
  };

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🛒 Grocery & Essentials</Text>
          <Text style={styles.headerSubtitle}>Daily needs, delivered fast</Text>
        </View>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {/* Main Grid */}
      <View style={styles.grid}>
        {/* Quick Delivery - Large Card */}
        <TouchableOpacity
          style={styles.quickDeliveryCard}
          onPress={() => handlePress('/grocery/quick')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#22C55E', '#16A34A', '#15803D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quickDeliveryGradient}
          >
            <View style={styles.timeBadge}>
              <Text style={styles.timeBolt}>⚡</Text>
              <Text style={styles.timeText}>10-30 MIN</Text>
            </View>
            <Text style={styles.quickTitle}>QUICK</Text>
            <Text style={styles.quickTitle}>DELIVERY</Text>
            <Text style={styles.quickSubtitle}>Groceries at your doorstep</Text>
            <View style={styles.cashbackBadge}>
              <Text style={styles.cashbackText}>5% Cashback</Text>
            </View>
            <Text style={styles.groceryEmoji}>🥬</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Right Column - Category Grid */}
        <View style={styles.rightColumn}>
          <View style={styles.categoryRow}>
            {/* Fruits */}
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => handlePress('/grocery/fruits')}
              activeOpacity={0.9}
            >
              <View style={styles.categoryContent}>
                <Text style={styles.categoryIcon}>🍎</Text>
                <Text style={styles.categoryTitle}>Fruits</Text>
              </View>
            </TouchableOpacity>

            {/* Veggies */}
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => handlePress('/grocery/veggies')}
              activeOpacity={0.9}
            >
              <View style={styles.categoryContent}>
                <Text style={styles.categoryIcon}>🥕</Text>
                <Text style={styles.categoryTitle}>Veggies</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.categoryRow}>
            {/* Dairy */}
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => handlePress('/grocery/dairy')}
              activeOpacity={0.9}
            >
              <View style={styles.categoryContent}>
                <Text style={styles.categoryIcon}>🥛</Text>
                <Text style={styles.categoryTitle}>Dairy</Text>
              </View>
            </TouchableOpacity>

            {/* Snacks */}
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => handlePress('/grocery/snacks')}
              activeOpacity={0.9}
            >
              <View style={styles.categoryContent}>
                <Text style={styles.categoryIcon}>🍪</Text>
                <Text style={styles.categoryTitle}>Snacks</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Row - Quick Actions */}
      <View style={styles.bottomRow}>
        {/* Hot Deals */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/grocery/deals')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <Text style={styles.bottomIcon}>🔥</Text>
          </View>
          <Text style={styles.bottomTitle}>Hot Deals</Text>
          <Text style={styles.bottomSubtitle}>Save more</Text>
        </TouchableOpacity>

        {/* Compare */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/grocery/compare')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
            <Text style={styles.bottomIcon}>⚖️</Text>
          </View>
          <Text style={styles.bottomTitle}>Compare</Text>
          <Text style={styles.bottomSubtitle}>Best price</Text>
        </TouchableOpacity>

        {/* Stores */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/grocery/stores')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Text style={styles.bottomIcon}>🏪</Text>
          </View>
          <Text style={styles.bottomTitle}>Stores</Text>
          <Text style={styles.bottomSubtitle}>Big Bazaar+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green500,
  },

  // Main Grid
  grid: {
    flexDirection: 'row',
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },

  // Quick Delivery Card
  quickDeliveryCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  quickDeliveryGradient: {
    padding: 16,
    minHeight: 200,
    position: 'relative',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  timeBolt: {
    fontSize: 12,
    marginRight: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  quickTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 24,
  },
  quickSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    marginBottom: 12,
  },
  cashbackBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  groceryEmoji: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    fontSize: 36,
    opacity: 0.8,
  },

  // Right Column
  rightColumn: {
    flex: 1,
    gap: CARD_GAP,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
    flex: 1,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.navy,
  },

  // Bottom Row
  bottomRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  bottomCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    alignItems: 'center',
  },
  bottomIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bottomIcon: {
    fontSize: 20,
  },
  bottomTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
  },
  bottomSubtitle: {
    fontSize: 11,
    color: COLORS.green500,
    marginTop: 2,
  },
});

export default GroceryEssentialsSection;
