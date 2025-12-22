// Women Exclusive Zone Page
// Women-focused offers and safety features

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

interface WomenOffer {
  id: string;
  title: string;
  store: string;
  discount: string;
  category: string;
  image: string;
  womenOwned?: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'beauty', label: 'Beauty', icon: 'sparkles' },
  { id: 'fashion', label: 'Fashion', icon: 'shirt' },
  { id: 'wellness', label: 'Wellness', icon: 'heart' },
  { id: 'fitness', label: 'Fitness', icon: 'fitness' },
];

const MOCK_OFFERS: WomenOffer[] = [
  { id: '1', title: '40% Off on Makeup', store: 'Nykaa', discount: '40%', category: 'beauty', image: '💄', womenOwned: true },
  { id: '2', title: 'Ethnic Wear Sale', store: 'Fabindia', discount: '30%', category: 'fashion', image: '👗', womenOwned: true },
  { id: '3', title: 'Spa Day Package', store: 'O2 Spa', discount: '25%', category: 'wellness', image: '💆', womenOwned: false },
  { id: '4', title: 'Women\'s Fitness', store: 'Cult.fit', discount: '35%', category: 'fitness', image: '🧘', womenOwned: false },
  { id: '5', title: 'Skincare Essentials', store: 'Forest Essentials', discount: '20%', category: 'beauty', image: '🧴', womenOwned: true },
  { id: '6', title: 'Designer Bags', store: 'Caprese', discount: '45%', category: 'fashion', image: '👜', womenOwned: true },
  { id: '7', title: 'Jewelry Collection', store: 'Tanishq', discount: '15%', category: 'fashion', image: '💍', womenOwned: false },
  { id: '8', title: 'Health Checkup', store: 'Practo', discount: '30%', category: 'wellness', image: '🩺', womenOwned: false },
];

export default function WomenZonePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showWomenOwned, setShowWomenOwned] = useState(false);

  const filteredOffers = MOCK_OFFERS.filter(offer => {
    const categoryMatch = selectedCategory === 'all' || offer.category === selectedCategory;
    const womenOwnedMatch = !showWomenOwned || offer.womenOwned;
    return categoryMatch && womenOwnedMatch;
  });

  const renderCategory = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.categoryChipActive,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons
        name={item.icon as any}
        size={16}
        color={selectedCategory === item.id ? '#FFF' : Colors.text.secondary}
      />
      <ThemedText style={[
        styles.categoryChipText,
        selectedCategory === item.id && styles.categoryChipTextActive,
      ]}>
        {item.label}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderOffer = ({ item }: { item: WomenOffer }) => (
    <TouchableOpacity
      style={styles.offerCard}
      onPress={() => router.push(`/offers/${item.id}` as any)}
    >
      {item.womenOwned && (
        <View style={styles.womenOwnedBadge}>
          <ThemedText style={styles.womenOwnedText}>Women-Owned</ThemedText>
        </View>
      )}
      <View style={styles.offerImage}>
        <ThemedText style={styles.offerEmoji}>{item.image}</ThemedText>
      </View>
      <View style={styles.offerInfo}>
        <ThemedText style={styles.offerTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.offerStore}>{item.store}</ThemedText>
        <View style={styles.discountBadge}>
          <ThemedText style={styles.discountText}>{item.discount} OFF</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DB2777" />

      <LinearGradient
        colors={['#DB2777', '#EC4899']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Women's Zone</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <ThemedText style={styles.heroEmoji}>👩</ThemedText>
          </View>
          <ThemedText style={styles.heroTitle}>Exclusive for You</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Curated deals, women-owned businesses, and more
          </ThemedText>
        </View>
      </LinearGradient>

      <View style={styles.filtersSection}>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategory}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        />

        <TouchableOpacity
          style={[styles.womenOwnedFilter, showWomenOwned && styles.womenOwnedFilterActive]}
          onPress={() => setShowWomenOwned(!showWomenOwned)}
        >
          <Ionicons
            name={showWomenOwned ? 'checkbox' : 'square-outline'}
            size={20}
            color={showWomenOwned ? '#DB2777' : Colors.text.tertiary}
          />
          <ThemedText style={[
            styles.womenOwnedFilterText,
            showWomenOwned && styles.womenOwnedFilterTextActive,
          ]}>
            Women-Owned Only
          </ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOffers}
        renderItem={renderOffer}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.safetyCard}>
            <View style={styles.safetyHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#DB2777" />
              <ThemedText style={styles.safetyTitle}>Safety First</ThemedText>
            </View>
            <ThemedText style={styles.safetyText}>
              All stores in Women's Zone are verified for safety standards
            </ThemedText>
            <TouchableOpacity style={styles.safetyButton}>
              <ThemedText style={styles.safetyButtonText}>Learn More</ThemedText>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyEmoji}>🔍</ThemedText>
            <ThemedText style={styles.emptyTitle}>No offers found</ThemedText>
            <ThemedText style={styles.emptyText}>
              Try adjusting your filters
            </ThemedText>
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
  heroIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heroEmoji: {
    fontSize: 36,
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
  filtersSection: {
    paddingVertical: Spacing.md,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    ...Shadows.subtle,
  },
  categoryChipActive: {
    backgroundColor: '#DB2777',
  },
  categoryChipText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  categoryChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  womenOwnedFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  womenOwnedFilterActive: {},
  womenOwnedFilterText: {
    ...Typography.body,
    color: Colors.text.tertiary,
  },
  womenOwnedFilterTextActive: {
    color: '#DB2777',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  row: {
    justifyContent: 'space-between',
  },
  safetyCard: {
    backgroundColor: '#DB2777' + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  safetyTitle: {
    ...Typography.label,
    color: '#DB2777',
  },
  safetyText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  safetyButton: {
    alignSelf: 'flex-start',
  },
  safetyButtonText: {
    ...Typography.label,
    color: '#DB2777',
  },
  offerCard: {
    width: '48%',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    position: 'relative',
    ...Shadows.subtle,
  },
  womenOwnedBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: '#DB2777',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    zIndex: 1,
  },
  womenOwnedText: {
    ...Typography.caption,
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  offerImage: {
    width: '100%',
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  offerEmoji: {
    fontSize: 36,
  },
  offerInfo: {
    flex: 1,
  },
  offerTitle: {
    ...Typography.label,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  offerStore: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginBottom: Spacing.sm,
  },
  discountBadge: {
    alignSelf: 'flex-start',
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
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.tertiary,
  },
});
