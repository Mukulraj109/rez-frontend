/**
 * Trending Near You Section - Matching V2 Design
 * Featured card layout with hero + small cards + horizontal card
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;

// Colors
const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#6B7280',
  green500: '#22C55E',
  emerald500: '#10B981',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  orange500: '#F97316',
  red500: '#EF4444',
};

// Featured Store (Large Card)
const featuredStore = {
  id: 1,
  name: 'Starbucks Coffee',
  category: 'Food & Dining',
  image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600',
  people: 324,
  cashback: '15%',
};

// Small Cards (Right Column)
const smallStores = [
  {
    id: 2,
    name: 'Zara Fashion',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400',
    people: 198,
    cashback: '20%',
  },
  {
    id: 3,
    name: 'Glowzy Salon',
    category: 'Beauty',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    people: 156,
    cashback: '25%',
  },
];

// Horizontal Card (Bottom)
const horizontalStore = {
  id: 4,
  name: 'FitClub Gym',
  category: 'Fitness',
  image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
  people: 89,
  cashback: '10%',
};

const NewOnRezSection: React.FC = () => {
  const router = useRouter();

  const handleViewAll = () => {
    router.push('/explore');
  };

  const handleStorePress = (id: number) => {
    router.push(`/store/${id}` as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.fireIcon}>🔥</Text>
            <Text style={styles.headerTitle}>Trending Near You</Text>
          </View>
          <Text style={styles.headerSubtitle}>Popular in your area</Text>
        </View>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {/* Main Grid: Featured + Small Cards */}
      <View style={styles.mainGrid}>
        {/* Featured Large Card (Left) */}
        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() => handleStorePress(featuredStore.id)}
          activeOpacity={0.9}
        >
          <ImageBackground
            source={{ uri: featuredStore.image }}
            style={styles.featuredImage}
            imageStyle={styles.featuredImageStyle}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.featuredGradient}
            >
              {/* Top Badges */}
              <View style={styles.featuredTopRow}>
                <View style={styles.peopleBadge}>
                  <Text style={styles.fireEmoji}>🔥</Text>
                  <Text style={styles.peopleText}>{featuredStore.people}</Text>
                </View>
                <View style={styles.cashbackBadge}>
                  <Text style={styles.cashbackBadgeText}>{featuredStore.cashback} cashback</Text>
                </View>
              </View>

              {/* Bottom Content */}
              <View style={styles.featuredBottom}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{featuredStore.category}</Text>
                </View>
                <Text style={styles.featuredName}>{featuredStore.name}</Text>
                <View style={styles.earnRow}>
                  <Text style={styles.earnText}>Earn rewards</Text>
                  <View style={styles.coinsBadgeSmall}>
                    <Text style={styles.coinsText}>Coins</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>

        {/* Small Cards Column (Right) */}
        <View style={styles.smallCardsColumn}>
          {smallStores.map((store) => (
            <TouchableOpacity
              key={store.id}
              style={styles.smallCard}
              onPress={() => handleStorePress(store.id)}
              activeOpacity={0.9}
            >
              {/* Image */}
              <View style={styles.smallImageContainer}>
                <Image
                  source={{ uri: store.image }}
                  style={styles.smallImage}
                  resizeMode="cover"
                />
                <View style={styles.smallPeopleBadge}>
                  <Text style={styles.fireEmoji}>🔥</Text>
                  <Text style={styles.smallPeopleText}>{store.people}</Text>
                </View>
              </View>
              {/* Content */}
              <View style={styles.smallContent}>
                <Text style={styles.smallCategory}>{store.category}</Text>
                <Text style={styles.smallName} numberOfLines={1}>{store.name}</Text>
                <View style={styles.smallRewardRow}>
                  <Text style={styles.smallCashback}>{store.cashback}</Text>
                  <Text style={styles.coinDot}>🪙</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Horizontal Card (Bottom) */}
      <TouchableOpacity
        style={styles.horizontalCard}
        onPress={() => handleStorePress(horizontalStore.id)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['rgba(249, 115, 22, 0.1)', 'rgba(236, 72, 153, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.horizontalGradient}
        >
          <Image
            source={{ uri: horizontalStore.image }}
            style={styles.horizontalImage}
            resizeMode="cover"
          />
          <View style={styles.horizontalContent}>
            <View style={styles.horizontalNameRow}>
              <Text style={styles.horizontalName}>{horizontalStore.name}</Text>
              <View style={styles.horizontalPeopleBadge}>
                <Text style={styles.fireEmoji}>🔥</Text>
                <Text style={styles.horizontalPeopleText}>{horizontalStore.people}</Text>
              </View>
            </View>
            <Text style={styles.horizontalCategory}>{horizontalStore.category}</Text>
          </View>
          <View style={styles.horizontalRight}>
            <Text style={styles.horizontalCashback}>{horizontalStore.cashback} cashback</Text>
            <Text style={styles.horizontalCoins}>🪙 Earn coins</Text>
          </View>
        </LinearGradient>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fireIcon: {
    fontSize: 18,
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
  mainGrid: {
    flexDirection: 'row',
    height: 320,
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },

  // Featured Card (Left)
  featuredCard: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  featuredImage: {
    flex: 1,
  },
  featuredImageStyle: {
    borderRadius: 24,
  },
  featuredGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12,
  },
  featuredTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  peopleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.orange500,
  },
  fireEmoji: {
    fontSize: 12,
  },
  peopleText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  cashbackBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.emerald500,
  },
  cashbackBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  featuredBottom: {
    gap: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  featuredName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  earnText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  coinsBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: COLORS.amber500,
  },
  coinsText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Small Cards (Right Column)
  smallCardsColumn: {
    flex: 1,
    gap: CARD_GAP,
  },
  smallCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  smallImageContainer: {
    height: 80,
    position: 'relative',
  },
  smallImage: {
    width: '100%',
    height: '100%',
  },
  smallPeopleBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: COLORS.orange500,
  },
  smallPeopleText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  smallContent: {
    padding: 10,
  },
  smallCategory: {
    fontSize: 11,
    color: COLORS.gray600,
    marginBottom: 2,
  },
  smallName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 6,
  },
  smallRewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallCashback: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.emerald500,
  },
  coinDot: {
    fontSize: 14,
  },

  // Horizontal Card (Bottom)
  horizontalCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  horizontalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  horizontalImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  horizontalContent: {
    flex: 1,
  },
  horizontalNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  horizontalName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
  },
  horizontalPeopleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
  },
  horizontalPeopleText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.orange500,
  },
  horizontalCategory: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  horizontalRight: {
    alignItems: 'flex-end',
  },
  horizontalCashback: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.emerald500,
    marginBottom: 2,
  },
  horizontalCoins: {
    fontSize: 11,
    color: COLORS.amber500,
  },
});

export default NewOnRezSection;
