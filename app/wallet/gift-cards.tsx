// Gift Cards Page
// Buy and manage gift cards

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

interface GiftCard {
  id: string;
  brand: string;
  logo: string;
  cashback: number;
  minAmount: number;
  maxAmount: number;
  category: string;
}

interface MyGiftCard {
  id: string;
  brand: string;
  amount: number;
  code: string;
  expiryDate: string;
  isUsed: boolean;
}

const CATEGORIES = ['All', 'Shopping', 'Food', 'Travel', 'Entertainment'];

const GIFT_CARDS: GiftCard[] = [
  { id: '1', brand: 'Amazon', logo: '🛒', cashback: 5, minAmount: 100, maxAmount: 10000, category: 'Shopping' },
  { id: '2', brand: 'Flipkart', logo: '📦', cashback: 4, minAmount: 100, maxAmount: 10000, category: 'Shopping' },
  { id: '3', brand: 'Myntra', logo: '👗', cashback: 8, minAmount: 500, maxAmount: 5000, category: 'Shopping' },
  { id: '4', brand: 'Swiggy', logo: '🍔', cashback: 10, minAmount: 100, maxAmount: 5000, category: 'Food' },
  { id: '5', brand: 'Zomato', logo: '🍕', cashback: 8, minAmount: 100, maxAmount: 5000, category: 'Food' },
  { id: '6', brand: 'MakeMyTrip', logo: '✈️', cashback: 6, minAmount: 1000, maxAmount: 25000, category: 'Travel' },
  { id: '7', brand: 'BookMyShow', logo: '🎬', cashback: 5, minAmount: 200, maxAmount: 5000, category: 'Entertainment' },
  { id: '8', brand: 'Spotify', logo: '🎵', cashback: 7, minAmount: 119, maxAmount: 1199, category: 'Entertainment' },
];

const MY_GIFT_CARDS: MyGiftCard[] = [
  { id: '1', brand: 'Amazon', amount: 500, code: 'AMZN-XXXX-YYYY', expiryDate: '2025-06-15', isUsed: false },
  { id: '2', brand: 'Swiggy', amount: 200, code: 'SWIG-AAAA-BBBB', expiryDate: '2025-03-20', isUsed: true },
];

export default function GiftCardsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'buy' | 'my'>('buy');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredCards = GIFT_CARDS.filter(card => {
    const matchesSearch = card.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBuyGiftCard = async () => {
    if (!selectedCard || !amount) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSelectedCard(null);
      setAmount('');
      setActiveTab('my');
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderGiftCard = ({ item }: { item: GiftCard }) => (
    <TouchableOpacity
      style={styles.giftCard}
      onPress={() => setSelectedCard(item)}
    >
      <View style={styles.giftCardLogo}>
        <ThemedText style={styles.giftCardEmoji}>{item.logo}</ThemedText>
      </View>
      <View style={styles.giftCardInfo}>
        <ThemedText style={styles.giftCardBrand}>{item.brand}</ThemedText>
        <ThemedText style={styles.giftCardCashback}>
          Get {item.cashback}% cashback
        </ThemedText>
        <ThemedText style={styles.giftCardRange}>
          ₹{item.minAmount} - ₹{item.maxAmount}
        </ThemedText>
      </View>
      <TouchableOpacity style={styles.buyButton}>
        <ThemedText style={styles.buyButtonText}>Buy</ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderMyGiftCard = ({ item }: { item: MyGiftCard }) => (
    <View style={[styles.myGiftCard, item.isUsed && styles.myGiftCardUsed]}>
      <View style={styles.myGiftCardHeader}>
        <ThemedText style={styles.myGiftCardBrand}>{item.brand}</ThemedText>
        {item.isUsed && (
          <View style={styles.usedBadge}>
            <ThemedText style={styles.usedBadgeText}>Used</ThemedText>
          </View>
        )}
      </View>
      <ThemedText style={styles.myGiftCardAmount}>₹{item.amount}</ThemedText>
      <View style={styles.myGiftCardCode}>
        <ThemedText style={styles.codeText}>{item.code}</ThemedText>
        {!item.isUsed && (
          <TouchableOpacity style={styles.copyButton}>
            <Ionicons name="copy-outline" size={16} color={Colors.primary[600]} />
          </TouchableOpacity>
        )}
      </View>
      <ThemedText style={styles.myGiftCardExpiry}>
        Expires: {new Date(item.expiryDate).toLocaleDateString()}
      </ThemedText>
    </View>
  );

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
          <ThemedText style={styles.headerTitle}>Gift Cards</ThemedText>
          <View style={styles.placeholder} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'buy' && styles.tabActive]}
            onPress={() => setActiveTab('buy')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'buy' && styles.tabTextActive]}>
              Buy Gift Cards
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'my' && styles.tabActive]}
            onPress={() => setActiveTab('my')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>
              My Gift Cards
            </ThemedText>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {activeTab === 'buy' ? (
        <View style={styles.content}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search brands"
              placeholderTextColor={Colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <ThemedText style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}>
                  {category}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Popular Brands */}
          <ThemedText style={styles.sectionTitle}>Popular Brands</ThemedText>
          <FlatList
            data={filteredCards}
            renderItem={renderGiftCard}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      ) : (
        <View style={styles.content}>
          {MY_GIFT_CARDS.length > 0 ? (
            <FlatList
              data={MY_GIFT_CARDS}
              renderItem={renderMyGiftCard}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="gift-outline" size={64} color={Colors.gray[300]} />
              <ThemedText style={styles.emptyTitle}>No Gift Cards Yet</ThemedText>
              <ThemedText style={styles.emptyText}>
                Buy gift cards to see them here
              </ThemedText>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setActiveTab('buy')}
              >
                <ThemedText style={styles.emptyButtonText}>Browse Gift Cards</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Purchase Modal */}
      {selectedCard && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setSelectedCard(null)}
            >
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>

            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalEmoji}>{selectedCard.logo}</ThemedText>
              <ThemedText style={styles.modalBrand}>{selectedCard.brand}</ThemedText>
              <View style={styles.cashbackBadge}>
                <ThemedText style={styles.cashbackText}>
                  {selectedCard.cashback}% Cashback
                </ThemedText>
              </View>
            </View>

            <View style={styles.modalBody}>
              <ThemedText style={styles.modalLabel}>Enter Amount</ThemedText>
              <View style={styles.amountInput}>
                <ThemedText style={styles.currencySymbol}>₹</ThemedText>
                <TextInput
                  style={styles.amountInputField}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>
              <ThemedText style={styles.amountHint}>
                Min ₹{selectedCard.minAmount} - Max ₹{selectedCard.maxAmount}
              </ThemedText>

              {amount && parseInt(amount) > 0 && (
                <View style={styles.cashbackPreview}>
                  <ThemedText style={styles.cashbackPreviewText}>
                    You'll earn {Math.floor(parseInt(amount) * selectedCard.cashback / 100)} RC cashback
                  </ThemedText>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.purchaseButton,
                (!amount || parseInt(amount) < selectedCard.minAmount) && styles.purchaseButtonDisabled,
              ]}
              onPress={handleBuyGiftCard}
              disabled={!amount || parseInt(amount) < selectedCard.minAmount || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <ThemedText style={styles.purchaseButtonText}>Buy Now</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    paddingBottom: Spacing.sm,
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
  tabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  tabActive: {
    backgroundColor: '#FFF',
  },
  tabText: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.8)',
  },
  tabTextActive: {
    color: Colors.primary[600],
  },
  content: {
    flex: 1,
    padding: Spacing.base,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.subtle,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
  },
  categoriesScroll: {
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.base,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  categoryChip: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    ...Shadows.subtle,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary[600],
  },
  categoryText: {
    ...Typography.label,
    color: Colors.text.secondary,
  },
  categoryTextActive: {
    color: '#FFF',
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  listContent: {
    paddingBottom: Spacing['3xl'],
  },
  giftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadows.subtle,
  },
  giftCardLogo: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftCardEmoji: {
    fontSize: 28,
  },
  giftCardInfo: {
    flex: 1,
  },
  giftCardBrand: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  giftCardCashback: {
    ...Typography.bodySmall,
    color: Colors.success,
  },
  giftCardRange: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  buyButton: {
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  buyButtonText: {
    ...Typography.labelSmall,
    color: '#FFF',
  },
  myGiftCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  myGiftCardUsed: {
    opacity: 0.6,
  },
  myGiftCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  myGiftCardBrand: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  usedBadge: {
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  usedBadgeText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  myGiftCardAmount: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  myGiftCardCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  codeText: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  copyButton: {
    padding: Spacing.xs,
  },
  myGiftCardExpiry: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  emptyButtonText: {
    ...Typography.button,
    color: '#FFF',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing['3xl'] : Spacing.lg,
  },
  modalClose: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    padding: Spacing.sm,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  modalBrand: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  cashbackBadge: {
    backgroundColor: Colors.success + '20',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  cashbackText: {
    ...Typography.labelSmall,
    color: Colors.success,
  },
  modalBody: {
    marginBottom: Spacing.lg,
  },
  modalLabel: {
    ...Typography.label,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  currencySymbol: {
    ...Typography.h2,
    color: Colors.text.tertiary,
    marginRight: Spacing.sm,
  },
  amountInputField: {
    flex: 1,
    ...Typography.h2,
    color: Colors.text.primary,
  },
  amountHint: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  cashbackPreview: {
    backgroundColor: Colors.success + '15',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  cashbackPreviewText: {
    ...Typography.label,
    color: Colors.success,
  },
  purchaseButton: {
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  purchaseButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  purchaseButtonText: {
    ...Typography.button,
    color: '#FFF',
  },
});
