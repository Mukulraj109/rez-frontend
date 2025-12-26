import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Mock data for stores/products to review
const reviewableItems = [
  {
    id: '1',
    type: 'store',
    name: 'Starbucks',
    image: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400',
    category: 'Cafe',
    visitDate: '2 days ago',
    coins: 50,
    hasReceipt: true,
  },
  {
    id: '2',
    type: 'store',
    name: 'Nike Store',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    category: 'Fashion',
    visitDate: '5 days ago',
    coins: 75,
    hasReceipt: true,
  },
  {
    id: '3',
    type: 'product',
    name: 'Wireless Earbuds',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
    category: 'Electronics',
    purchaseDate: '1 week ago',
    coins: 100,
    brand: 'Sony',
  },
  {
    id: '4',
    type: 'store',
    name: 'Pizza Hut',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    category: 'Restaurant',
    visitDate: '3 days ago',
    coins: 40,
    hasReceipt: false,
  },
  {
    id: '5',
    type: 'product',
    name: 'Face Serum',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    category: 'Beauty',
    purchaseDate: '4 days ago',
    coins: 60,
    brand: 'Minimalist',
  },
];

const reviewTips = [
  { icon: 'star', tip: 'Rate honestly from 1-5 stars' },
  { icon: 'camera', tip: 'Add photos to earn extra coins' },
  { icon: 'create', tip: 'Write at least 50 characters' },
  { icon: 'checkmark-circle', tip: 'Helpful reviews earn bonuses' },
];

export default function ReviewEarnPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'store' | 'product'>('all');

  const filteredItems = reviewableItems.filter(item =>
    filter === 'all' ? true : item.type === filter
  );

  const handleWriteReview = (item: typeof reviewableItems[0]) => {
    router.push({
      pathname: '/ReviewPage',
      params: {
        productId: item.id,
        productTitle: item.name,
        productImage: item.image,
        cashbackAmount: item.coins.toString(),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write & Earn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#FEF3C7', '#FDE68A']}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="star" size={32} color="#F59E0B" />
            </View>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Earn 25-100 Coins</Text>
              <Text style={styles.heroSubtitle}>Per quality review</Text>
            </View>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{reviewableItems.length}</Text>
              <Text style={styles.heroStatLabel}>Pending</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>₹450</Text>
              <Text style={styles.heroStatLabel}>Potential</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Review Tips</Text>
          <View style={styles.tipsGrid}>
            {reviewTips.map((tip, idx) => (
              <View key={idx} style={styles.tipItem}>
                <Ionicons name={tip.icon as any} size={16} color="#F59E0B" />
                <Text style={styles.tipText}>{tip.tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {(['all', 'store', 'product'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, filter === tab && styles.filterTabActive]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.filterTabText, filter === tab && styles.filterTabTextActive]}>
                {tab === 'all' ? 'All' : tab === 'store' ? 'Stores' : 'Products'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reviewable Items */}
        <View style={styles.itemsList}>
          <Text style={styles.sectionTitle}>Ready to Review ({filteredItems.length})</Text>

          {filteredItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => handleWriteReview(item)}
            >
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.coinBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.coinText}>+{item.coins}</Text>
                  </View>
                </View>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <View style={styles.itemFooter}>
                  <View style={styles.itemMeta}>
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.itemMetaText}>
                      {item.type === 'store' ? item.visitDate : item.purchaseDate}
                    </Text>
                  </View>
                  {item.type === 'store' && item.hasReceipt && (
                    <View style={styles.receiptBadge}>
                      <Ionicons name="receipt-outline" size={12} color="#10B981" />
                      <Text style={styles.receiptText}>Receipt</Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomSection}>
          <LinearGradient
            colors={['#E0F2FE', '#DBEAFE']}
            style={styles.bottomCard}
          >
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <View style={styles.bottomCardText}>
              <Text style={styles.bottomCardTitle}>More Ways to Earn</Text>
              <Text style={styles.bottomCardSubtitle}>
                Visit partner stores & make purchases to unlock more review opportunities
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  heroCard: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#B45309',
  },
  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    padding: 12,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#92400E',
  },
  heroStatLabel: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: '#D97706',
    opacity: 0.3,
  },
  tipsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tipText: {
    fontSize: 12,
    color: '#92400E',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#F59E0B',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  itemsList: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coinText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  itemCategory: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemMetaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  receiptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  receiptText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  bottomSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  bottomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  bottomCardText: {
    flex: 1,
  },
  bottomCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  bottomCardSubtitle: {
    fontSize: 12,
    color: '#3B82F6',
    lineHeight: 18,
  },
});
