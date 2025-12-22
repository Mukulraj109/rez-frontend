// Double Cashback Days Page
// Special promotional days with 2x cashback

import React, { useState, useEffect } from 'react';
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

interface DoubleCashbackStore {
  id: string;
  name: string;
  image: string;
  normalCashback: string;
  doubleCashback: string;
  category: string;
}

const MOCK_STORES: DoubleCashbackStore[] = [
  { id: '1', name: 'Amazon', image: '📦', normalCashback: '3%', doubleCashback: '6%', category: 'Shopping' },
  { id: '2', name: 'Flipkart', image: '🛒', normalCashback: '4%', doubleCashback: '8%', category: 'Shopping' },
  { id: '3', name: 'Swiggy', image: '🍔', normalCashback: '5%', doubleCashback: '10%', category: 'Food' },
  { id: '4', name: 'Zomato', image: '🍕', normalCashback: '5%', doubleCashback: '10%', category: 'Food' },
  { id: '5', name: 'BookMyShow', image: '🎬', normalCashback: '7%', doubleCashback: '14%', category: 'Entertainment' },
  { id: '6', name: 'Myntra', image: '👗', normalCashback: '6%', doubleCashback: '12%', category: 'Fashion' },
  { id: '7', name: 'Nykaa', image: '💄', normalCashback: '8%', doubleCashback: '16%', category: 'Beauty' },
  { id: '8', name: 'Uber', image: '🚗', normalCashback: '4%', doubleCashback: '8%', category: 'Travel' },
];

export default function DoubleCashbackPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  const renderStore = ({ item }: { item: DoubleCashbackStore }) => (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => router.push(`/store/${item.id}` as any)}
    >
      <View style={styles.doubleBadge}>
        <ThemedText style={styles.doubleBadgeText}>2X</ThemedText>
      </View>
      <View style={styles.storeImage}>
        <ThemedText style={styles.storeEmoji}>{item.image}</ThemedText>
      </View>
      <ThemedText style={styles.storeName}>{item.name}</ThemedText>
      <ThemedText style={styles.storeCategory}>{item.category}</ThemedText>
      <View style={styles.cashbackContainer}>
        <ThemedText style={styles.normalCashback}>{item.normalCashback}</ThemedText>
        <Ionicons name="arrow-forward" size={14} color={Colors.success} />
        <ThemedText style={styles.doubleCashback}>{item.doubleCashback}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.gold} />

      <LinearGradient
        colors={[Colors.gold, '#FF8C00']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Double Cashback Day</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.heroSection}>
          <View style={styles.multiplierBadge}>
            <ThemedText style={styles.multiplierText}>2X</ThemedText>
          </View>
          <ThemedText style={styles.heroTitle}>CASHBACK</ThemedText>
          <ThemedText style={styles.heroSubtitle}>on all partner stores</ThemedText>
        </View>

        <View style={styles.timerContainer}>
          <ThemedText style={styles.timerLabel}>Ends in</ThemedText>
          <View style={styles.timerBoxes}>
            <View style={styles.timerBox}>
              <ThemedText style={styles.timerValue}>{formatTime(timeLeft.hours)}</ThemedText>
              <ThemedText style={styles.timerUnit}>hrs</ThemedText>
            </View>
            <ThemedText style={styles.timerSeparator}>:</ThemedText>
            <View style={styles.timerBox}>
              <ThemedText style={styles.timerValue}>{formatTime(timeLeft.minutes)}</ThemedText>
              <ThemedText style={styles.timerUnit}>min</ThemedText>
            </View>
            <ThemedText style={styles.timerSeparator}>:</ThemedText>
            <View style={styles.timerBox}>
              <ThemedText style={styles.timerValue}>{formatTime(timeLeft.seconds)}</ThemedText>
              <ThemedText style={styles.timerUnit}>sec</ThemedText>
            </View>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={MOCK_STORES}
        renderItem={renderStore}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={20} color={Colors.info} />
              <ThemedText style={styles.infoText}>
                Shop at any participating store to get 2X cashback. No coupon needed!
              </ThemedText>
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
    paddingBottom: Spacing.xl,
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
    marginBottom: Spacing.lg,
  },
  multiplierBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  multiplierText: {
    ...Typography.h1,
    color: Colors.gold,
    fontWeight: '900',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 4,
  },
  heroSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.9)',
  },
  timerContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  timerLabel: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.sm,
  },
  timerBoxes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerBox: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minWidth: 60,
  },
  timerValue: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  timerUnit: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  timerSeparator: {
    ...Typography.h2,
    color: '#FFF',
    marginHorizontal: Spacing.sm,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  row: {
    justifyContent: 'space-between',
  },
  infoCard: {
    backgroundColor: Colors.info + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  storeCard: {
    width: '48%',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    alignItems: 'center',
    position: 'relative',
    ...Shadows.subtle,
  },
  doubleBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  doubleBadgeText: {
    ...Typography.caption,
    color: '#FFF',
    fontWeight: '700',
  },
  storeImage: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  storeEmoji: {
    fontSize: 32,
  },
  storeName: {
    ...Typography.label,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  storeCategory: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
  },
  cashbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  normalCashback: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  doubleCashback: {
    ...Typography.label,
    color: Colors.success,
    fontWeight: '700',
  },
});
