// Sponsored Cashback Offers Page
// Brand-sponsored cashback offers

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

interface SponsoredOffer {
  id: string;
  brand: string;
  title: string;
  description: string;
  cashback: string;
  minPurchase: string;
  validTill: string;
  image: string;
  sponsored: boolean;
}

const MOCK_SPONSORED: SponsoredOffer[] = [
  {
    id: '1',
    brand: 'Coca-Cola',
    title: '15% Extra Cashback',
    description: 'On any Coca-Cola product purchase',
    cashback: '15%',
    minPurchase: '₹99',
    validTill: 'Dec 31',
    image: '🥤',
    sponsored: true,
  },
  {
    id: '2',
    brand: 'Samsung',
    title: '₹2000 Cashback',
    description: 'On Galaxy series smartphones',
    cashback: '₹2000',
    minPurchase: '₹20,000',
    validTill: 'Dec 25',
    image: '📱',
    sponsored: true,
  },
  {
    id: '3',
    brand: 'Nike',
    title: '20% Cashback',
    description: 'On all Nike footwear',
    cashback: '20%',
    minPurchase: '₹2500',
    validTill: 'Jan 5',
    image: '👟',
    sponsored: true,
  },
  {
    id: '4',
    brand: 'Starbucks',
    title: 'Double Stars + Cashback',
    description: 'Earn 2X stars + 10% cashback',
    cashback: '10%',
    minPurchase: '₹299',
    validTill: 'Dec 28',
    image: '☕',
    sponsored: true,
  },
  {
    id: '5',
    brand: 'Lenovo',
    title: '₹5000 Cashback',
    description: 'On Lenovo laptops & tablets',
    cashback: '₹5000',
    minPurchase: '₹35,000',
    validTill: 'Jan 15',
    image: '💻',
    sponsored: true,
  },
];

export default function SponsoredCashbackPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'highest' | 'expiring'>('all');

  const getFilteredOffers = () => {
    switch (filter) {
      case 'highest':
        return [...MOCK_SPONSORED].sort((a, b) => {
          const aVal = parseInt(a.cashback.replace(/[₹%,]/g, ''));
          const bVal = parseInt(b.cashback.replace(/[₹%,]/g, ''));
          return bVal - aVal;
        });
      case 'expiring':
        return MOCK_SPONSORED; // Would sort by date in real implementation
      default:
        return MOCK_SPONSORED;
    }
  };

  const renderOffer = ({ item }: { item: SponsoredOffer }) => (
    <TouchableOpacity
      style={styles.offerCard}
      onPress={() => router.push(`/offers/${item.id}` as any)}
    >
      <View style={styles.sponsoredBadge}>
        <Ionicons name="megaphone" size={12} color={Colors.gold} />
        <ThemedText style={styles.sponsoredText}>Sponsored</ThemedText>
      </View>

      <View style={styles.offerHeader}>
        <View style={styles.brandImage}>
          <ThemedText style={styles.brandEmoji}>{item.image}</ThemedText>
        </View>
        <View style={styles.brandInfo}>
          <ThemedText style={styles.brandName}>{item.brand}</ThemedText>
          <ThemedText style={styles.offerTitle}>{item.title}</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.offerDescription}>{item.description}</ThemedText>

      <View style={styles.offerDetails}>
        <View style={styles.cashbackBadge}>
          <Ionicons name="wallet" size={14} color="#FFF" />
          <ThemedText style={styles.cashbackText}>{item.cashback} Cashback</ThemedText>
        </View>
        <View style={styles.minPurchase}>
          <ThemedText style={styles.minPurchaseLabel}>Min:</ThemedText>
          <ThemedText style={styles.minPurchaseValue}>{item.minPurchase}</ThemedText>
        </View>
      </View>

      <View style={styles.offerFooter}>
        <View style={styles.validTill}>
          <Ionicons name="calendar-outline" size={14} color={Colors.text.tertiary} />
          <ThemedText style={styles.validTillText}>Valid till {item.validTill}</ThemedText>
        </View>
        <TouchableOpacity style={styles.claimButton}>
          <ThemedText style={styles.claimButtonText}>Claim</ThemedText>
          <Ionicons name="arrow-forward" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />

      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Brand Offers</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.heroSection}>
          <Ionicons name="megaphone" size={40} color="#FFF" />
          <ThemedText style={styles.heroTitle}>Sponsored Cashback</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Exclusive offers from top brands with enhanced cashback
          </ThemedText>
        </View>
      </LinearGradient>

      <View style={styles.filtersContainer}>
        {[
          { key: 'all', label: 'All Offers' },
          { key: 'highest', label: 'Highest Cashback' },
          { key: 'expiring', label: 'Expiring Soon' },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterButton, filter === f.key && styles.filterButtonActive]}
            onPress={() => setFilter(f.key as any)}
          >
            <ThemedText style={[
              styles.filterButtonText,
              filter === f.key && styles.filterButtonTextActive,
            ]}>
              {f.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={getFilteredOffers()}
        renderItem={renderOffer}
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
    paddingHorizontal: Spacing.lg,
  },
  heroTitle: {
    ...Typography.h2,
    color: '#FFF',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    alignItems: 'center',
    ...Shadows.subtle,
  },
  filterButtonActive: {
    backgroundColor: '#6366F1',
  },
  filterButtonText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  filterButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  offerCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  sponsoredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: Colors.gold + '20',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginBottom: Spacing.md,
  },
  sponsoredText: {
    ...Typography.caption,
    color: Colors.gold,
    fontWeight: '600',
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  brandImage: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  brandEmoji: {
    fontSize: 28,
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  offerTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  offerDescription: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  offerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  cashbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  cashbackText: {
    ...Typography.label,
    color: '#FFF',
  },
  minPurchase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  minPurchaseLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  minPurchaseValue: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  offerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  validTill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  validTillText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#6366F1',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  claimButtonText: {
    ...Typography.label,
    color: '#FFF',
  },
});
