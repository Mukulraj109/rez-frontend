import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const topBrands = [
  { id: 1, name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.in', category: 'Shopping', cashback: 'Up to 12%', coupons: 145, trending: true, autoTracked: true },
  { id: 2, name: 'Flipkart', logo: 'https://logo.clearbit.com/flipkart.com', category: 'Shopping', cashback: 'Up to 15%', coupons: 98, trending: true, autoTracked: true },
  { id: 3, name: 'Myntra', logo: 'https://logo.clearbit.com/myntra.com', category: 'Fashion', cashback: 'Up to 20%', coupons: 67, autoTracked: true },
  { id: 4, name: 'Swiggy', logo: 'https://logo.clearbit.com/swiggy.com', category: 'Food', cashback: 'Up to 10%', coupons: 52, autoTracked: true },
  { id: 5, name: 'Zomato', logo: 'https://logo.clearbit.com/zomato.com', category: 'Food', cashback: 'Up to 8%', coupons: 48, autoTracked: true },
  { id: 6, name: 'Nykaa', logo: 'https://logo.clearbit.com/nykaa.com', category: 'Beauty', cashback: 'Up to 18%', coupons: 73, autoTracked: true },
  { id: 7, name: 'Ajio', logo: 'https://logo.clearbit.com/ajio.com', category: 'Fashion', cashback: 'Up to 30%', coupons: 56, trending: true, autoTracked: true },
  { id: 8, name: 'MakeMyTrip', logo: 'https://logo.clearbit.com/makemytrip.com', category: 'Travel', cashback: 'Up to 25%', coupons: 89, trending: true, autoTracked: true },
];

const categories = [
  { id: 'All', icon: 'grid', label: 'All' },
  { id: 'Shopping', icon: 'bag', label: 'Shopping' },
  { id: 'Fashion', icon: 'shirt', label: 'Fashion' },
  { id: 'Food', icon: 'restaurant', label: 'Food' },
  { id: 'Beauty', icon: 'sparkles', label: 'Beauty' },
  { id: 'Travel', icon: 'airplane', label: 'Travel' },
];

const trendingCashback = [
  { id: 1, brand: 'Ajio', cashback: '30%', deal: 'Fashion Sale', badge: 'Highest' },
  { id: 2, brand: 'MakeMyTrip', cashback: '25%', deal: 'Travel Deals', badge: 'Flash' },
  { id: 3, brand: 'FirstCry', cashback: '25%', deal: 'Baby Products', badge: 'Trending' },
];

const giftCards = [
  { id: 1, name: 'Amazon', value: '₹500', discount: '5% off', saveAmount: 25, coins: 50 },
  { id: 2, name: 'Flipkart', value: '₹1000', discount: '8% off', saveAmount: 80, coins: 100 },
  { id: 3, name: 'Myntra', value: '₹750', discount: '6% off', saveAmount: 45, coins: 75 },
  { id: 4, name: 'Swiggy', value: '₹300', discount: '4% off', saveAmount: 12, coins: 30 },
];

const topCoupons = [
  { id: 1, brand: 'Amazon', code: 'SAVE500', offer: 'Flat ₹500 off on orders above ₹2000', usedBy: '2.5K', expires: '2 days' },
  { id: 2, brand: 'Myntra', code: 'FASHION40', offer: '40% off on fashion + Extra ReZ Coins', usedBy: '1.8K', expires: '5 days' },
  { id: 3, brand: 'MakeMyTrip', code: 'FLY2025', offer: 'Up to ₹3000 off on flights', usedBy: '3.2K', expires: '7 days' },
];

export default function CashStorePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredBrands = selectedCategory === 'All'
    ? topBrands
    : topBrands.filter(b => b.category === selectedCategory);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIcon}>
            <Ionicons name="cash" size={16} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>ReZ Cash Store</Text>
            <Text style={styles.headerSubtitle}>Shop online. Earn ReZ Coins.</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.trackButton}>
          <Ionicons name="time" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search brands, coupons, deals..."
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Hero Banner */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.heroBanner}
          >
            <View style={styles.heroBadges}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>1000+ BRANDS</Text>
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>AUTO TRACKED</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>Earn up to 30% ReZ Coins</Text>
            <Text style={styles.heroSubtitle}>Same prices • Same checkout • Extra money back</Text>
            <View style={styles.heroButtons}>
              <TouchableOpacity
                style={styles.heroButtonPrimary}
                onPress={() => router.push('/how-cash-store-works')}
              >
                <Ionicons name="information-circle" size={16} color="#10B981" />
                <Text style={styles.heroButtonPrimaryText}>How it works</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroButtonSecondary}>
                <Text style={styles.heroButtonSecondaryText}>Browse All</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* How It Works */}
        <View style={styles.sectionContainer}>
          <View style={styles.howItWorksCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flash" size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>How It Works</Text>
            </View>
            <View style={styles.stepsContainer}>
              {[
                { num: '1', title: 'Open brand from ReZ', desc: 'Browse 1000+ online brands' },
                { num: '2', title: 'Shop normally', desc: 'Same prices. We track automatically.' },
                { num: '3', title: 'Cashback tracked', desc: 'Order confirmed → Coins added.' },
              ].map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{step.num}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.infoNote}>
              <Ionicons name="information-circle" size={16} color="#D97706" />
              <Text style={styles.infoNoteText}>
                Cashback = ReZ Coins (not cash). Use across ReZ ecosystem.
              </Text>
            </View>
          </View>
        </View>

        {/* Trending Cashback */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={20} color="#F97316" />
            <Text style={styles.sectionTitle}>Trending Cashback</Text>
          </View>
          <View style={styles.trendingGrid}>
            {trendingCashback.map((item) => (
              <TouchableOpacity key={item.id} style={styles.trendingCard}>
                <View style={styles.trendingBadge}>
                  <Text style={styles.trendingBadgeText}>{item.badge}</Text>
                </View>
                <Text style={styles.trendingBrand}>{item.brand}</Text>
                <Text style={styles.trendingCashback}>{item.cashback}</Text>
                <Text style={styles.trendingLabel}>ReZ Coins</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Pills */}
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryPill,
                  selectedCategory === cat.id && styles.categoryPillActive,
                ]}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={selectedCategory === cat.id ? '#FFFFFF' : '#6B7280'}
                />
                <Text style={[
                  styles.categoryPillText,
                  selectedCategory === cat.id && styles.categoryPillTextActive,
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Top Brands Grid */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Online Brands</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>1000+ Brands</Text>
              <Ionicons name="chevron-forward" size={16} color="#10B981" />
            </TouchableOpacity>
          </View>
          <View style={styles.brandsGrid}>
            {filteredBrands.slice(0, 8).map((brand) => (
              <TouchableOpacity key={brand.id} style={styles.brandCard}>
                <View style={styles.brandBadges}>
                  {brand.trending && (
                    <View style={styles.hotBadge}>
                      <Text style={styles.hotBadgeText}>Hot</Text>
                    </View>
                  )}
                  {brand.autoTracked && (
                    <View style={styles.autoBadge}>
                      <Text style={styles.autoBadgeText}>Auto</Text>
                    </View>
                  )}
                </View>
                <View style={styles.brandLogoContainer}>
                  <Image
                    source={{ uri: brand.logo }}
                    style={styles.brandLogo}
                    defaultSource={{ uri: 'https://via.placeholder.com/60' }}
                  />
                </View>
                <Text style={styles.brandName}>{brand.name}</Text>
                <Text style={styles.brandCashback}>{brand.cashback}</Text>
                <Text style={styles.brandCashbackLabel}>ReZ Coins</Text>
                <View style={styles.brandCoupons}>
                  <Ionicons name="pricetag" size={12} color="#6B7280" />
                  <Text style={styles.brandCouponsText}>{brand.coupons} coupons</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gift Cards */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="gift" size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Buy Coupon & Save</Text>
          </View>
          <View style={styles.giftCardsGrid}>
            {giftCards.map((card) => (
              <TouchableOpacity key={card.id} style={styles.giftCard}>
                <View style={styles.giftCardIcon}>
                  <Ionicons name="gift" size={24} color="#8B5CF6" />
                </View>
                <Text style={styles.giftCardName}>{card.name}</Text>
                <Text style={styles.giftCardValue}>{card.value}</Text>
                <View style={styles.giftCardInfo}>
                  <Text style={styles.giftCardDiscount}>{card.discount}</Text>
                  <Text style={styles.giftCardSave}>Save ₹{card.saveAmount}</Text>
                </View>
                <View style={styles.giftCardCoins}>
                  <Ionicons name="cash" size={12} color="#F59E0B" />
                  <Text style={styles.giftCardCoinsText}>Earn {card.coins} coins</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Top Coupons */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag" size={20} color="#EC4899" />
            <Text style={styles.sectionTitle}>Best Coupon Codes</Text>
          </View>
          {topCoupons.map((coupon) => (
            <View key={coupon.id} style={styles.couponCard}>
              <View style={styles.couponHeader}>
                <View>
                  <View style={styles.couponBrandRow}>
                    <Text style={styles.couponBrand}>{coupon.brand}</Text>
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                    <View style={styles.stackableBadge}>
                      <Text style={styles.stackableText}>+ Cashback</Text>
                    </View>
                  </View>
                  <Text style={styles.couponOffer}>{coupon.offer}</Text>
                  <View style={styles.couponMeta}>
                    <Text style={styles.couponMetaText}>Used by {coupon.usedBy}</Text>
                    <Text style={styles.couponMetaDot}>•</Text>
                    <Text style={styles.couponMetaText}>Expires in {coupon.expires}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.couponCodeRow}>
                <View style={styles.couponCodeBox}>
                  <Text style={styles.couponCode}>{coupon.code}</Text>
                </View>
                <TouchableOpacity style={styles.copyButton}>
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Travel Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="airplane" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Travel & Bookings</Text>
          </View>
          <View style={styles.travelGrid}>
            {[
              { icon: '✈️', title: 'Flights', cashback: 'Up to 25%', color: ['#3B82F6', '#06B6D4'] },
              { icon: '🏨', title: 'Hotels', cashback: 'Up to 20%', color: ['#8B5CF6', '#EC4899'] },
              { icon: '🚗', title: 'Cabs', cashback: 'Up to 15%', color: ['#10B981', '#059669'] },
              { icon: '🎭', title: 'Activities', cashback: 'Up to 18%', color: ['#F97316', '#EF4444'] },
            ].map((item, index) => (
              <TouchableOpacity key={index} style={styles.travelCard}>
                <Text style={styles.travelIcon}>{item.icon}</Text>
                <Text style={styles.travelTitle}>{item.title}</Text>
                <Text style={styles.travelCashback}>{item.cashback}</Text>
                <Text style={styles.travelLabel}>ReZ Coins back</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.sectionContainer}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
            style={styles.statsCard}
          >
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>1000+</Text>
                <Text style={styles.statLabel}>Online Brands</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>₹50L+</Text>
                <Text style={styles.statLabel}>Coins Earned</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>10K+</Text>
                <Text style={styles.statLabel}>Happy Users</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Track CTA */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity>
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.trackCTA}
            >
              <View>
                <View style={styles.trackCTAHeader}>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.trackCTATitle}>Track Your Cashback</Text>
                </View>
                <Text style={styles.trackCTASubtitle}>See pending, confirmed & credited coins.</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  trackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  bannerContainer: {
    padding: 16,
  },
  heroBanner: {
    padding: 20,
    borderRadius: 20,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  heroButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  heroButtonPrimaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  heroButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  heroButtonSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  howItWorksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stepsContainer: {
    gap: 16,
    marginTop: 12,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#B45309',
    lineHeight: 18,
  },
  trendingGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  trendingCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: 'rgba(249, 115, 22, 0.3)',
    alignItems: 'center',
  },
  trendingBadge: {
    backgroundColor: '#F97316',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 8,
  },
  trendingBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trendingBrand: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  trendingCashback: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
  },
  trendingLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  categoryContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  brandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  brandCard: {
    width: (width - 32 - 12) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  brandBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  hotBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hotBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#EF4444',
  },
  autoBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  autoBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10B981',
  },
  brandLogoContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  brandLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  brandName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  brandCashback: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  brandCashbackLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 8,
  },
  brandCoupons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandCouponsText: {
    fontSize: 11,
    color: '#6B7280',
  },
  giftCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  giftCard: {
    width: (width - 32 - 12) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  giftCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  giftCardName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  giftCardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  giftCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  giftCardDiscount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  giftCardSave: {
    fontSize: 11,
    color: '#6B7280',
  },
  giftCardCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  giftCardCoinsText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#F59E0B',
  },
  couponCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  couponHeader: {
    marginBottom: 12,
  },
  couponBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  couponBrand: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#10B981',
  },
  stackableBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stackableText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  couponOffer: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 6,
    lineHeight: 18,
  },
  couponMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  couponMetaText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  couponMetaDot: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  couponCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  couponCodeBox: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
  },
  couponCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'monospace',
  },
  copyButton: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  copyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  travelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  travelCard: {
    width: (width - 32 - 12) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  travelIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  travelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  travelCashback: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  travelLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  trackCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
  },
  trackCTAHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  trackCTATitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trackCTASubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
