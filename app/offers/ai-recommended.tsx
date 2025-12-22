// AI Recommended Offers Page
// Personalized AI-curated offers

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

interface AIRecommendedOffer {
  id: string;
  title: string;
  store: string;
  discount: string;
  matchScore: number;
  reason: string;
  category: string;
  expiresIn: string;
  image: string;
}

const MOCK_OFFERS: AIRecommendedOffer[] = [
  { id: '1', title: '30% Off on Coffee', store: 'Starbucks', discount: '30%', matchScore: 95, reason: 'You visit coffee shops 3x/week', category: 'Food', expiresIn: '2 days', image: '☕' },
  { id: '2', title: 'Buy 1 Get 1 Free', store: 'Dominos', discount: 'BOGO', matchScore: 90, reason: 'You ordered pizza last weekend', category: 'Food', expiresIn: '3 days', image: '🍕' },
  { id: '3', title: '₹500 Off Electronics', store: 'Croma', discount: '₹500', matchScore: 88, reason: 'Based on your browsing history', category: 'Electronics', expiresIn: '5 days', image: '📱' },
  { id: '4', title: '20% Off Books', store: 'Amazon', discount: '20%', matchScore: 85, reason: 'You love reading', category: 'Books', expiresIn: '1 week', image: '📚' },
  { id: '5', title: 'Free Delivery', store: 'Swiggy', discount: 'Free', matchScore: 82, reason: 'Frequent food delivery user', category: 'Food', expiresIn: '4 days', image: '🛵' },
];

export default function AIRecommendedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offers, setOffers] = useState<AIRecommendedOffer[]>([]);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOffers(MOCK_OFFERS);
    setLoading(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return Colors.success;
    if (score >= 80) return Colors.primary[600];
    return Colors.gold;
  };

  const renderOffer = ({ item }: { item: AIRecommendedOffer }) => (
    <TouchableOpacity
      style={styles.offerCard}
      onPress={() => router.push(`/offers/${item.id}` as any)}
    >
      <View style={styles.offerHeader}>
        <View style={styles.offerImage}>
          <ThemedText style={styles.offerEmoji}>{item.image}</ThemedText>
        </View>
        <View style={[styles.matchBadge, { backgroundColor: getMatchColor(item.matchScore) + '20' }]}>
          <Ionicons name="sparkles" size={12} color={getMatchColor(item.matchScore)} />
          <ThemedText style={[styles.matchScore, { color: getMatchColor(item.matchScore) }]}>
            {item.matchScore}% Match
          </ThemedText>
        </View>
      </View>

      <ThemedText style={styles.offerTitle}>{item.title}</ThemedText>
      <ThemedText style={styles.offerStore}>{item.store}</ThemedText>

      <View style={styles.reasonContainer}>
        <Ionicons name="bulb-outline" size={14} color={Colors.info} />
        <ThemedText style={styles.reasonText}>{item.reason}</ThemedText>
      </View>

      <View style={styles.offerFooter}>
        <View style={styles.discountBadge}>
          <ThemedText style={styles.discountText}>{item.discount} OFF</ThemedText>
        </View>
        <View style={styles.expiryContainer}>
          <Ionicons name="time-outline" size={14} color={Colors.text.tertiary} />
          <ThemedText style={styles.expiryText}>{item.expiresIn}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />
        <LinearGradient colors={[Colors.primary[600], Colors.secondary[700]]} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>For You</ThemedText>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
          <ThemedText style={styles.loadingText}>Finding perfect offers for you...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.primary[600], Colors.secondary[700]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>For You</ThemedText>
          <View style={styles.placeholder} />
        </View>

        {/* AI Badge */}
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={20} color={Colors.gold} />
          <ThemedText style={styles.aiBadgeText}>
            Personalized offers based on your preferences
          </ThemedText>
        </View>
      </LinearGradient>

      <FlatList
        data={offers}
        renderItem={renderOffer}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{offers.length}</ThemedText>
              <ThemedText style={styles.statLabel}>Offers</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>87%</ThemedText>
              <ThemedText style={styles.statLabel}>Avg Match</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>₹2.5K</ThemedText>
              <ThemedText style={styles.statLabel}>Potential Savings</ThemedText>
            </View>
          </View>
        }
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
    marginBottom: Spacing.md,
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
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  aiBadgeText: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.9)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.text.tertiary,
    marginTop: Spacing.md,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  row: {
    justifyContent: 'space-between',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h3,
    color: Colors.primary[600],
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border.light,
  },
  offerCard: {
    width: '48%',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  offerImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerEmoji: {
    fontSize: 24,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    gap: 2,
  },
  matchScore: {
    ...Typography.caption,
    fontWeight: '700',
  },
  offerTitle: {
    ...Typography.label,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  offerStore: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    marginBottom: Spacing.sm,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.info + '10',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  reasonText: {
    ...Typography.caption,
    color: Colors.info,
    flex: 1,
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountBadge: {
    backgroundColor: Colors.success + '20',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  discountText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '700',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  expiryText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
});
