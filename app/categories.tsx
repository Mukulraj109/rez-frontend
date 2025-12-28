/**
 * All Categories Page - Browse all shopping categories
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLORS = { white: '#FFFFFF', navy: '#0B2240', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray600: '#6B7280', green500: '#22C55E', cyan500: '#06B6D4', amber500: '#F59E0B' };

const allCategories = [
  { section: 'Shopping', items: [
    { id: 'electronics', title: 'Electronics', icon: '📱', color: '#3B82F6', route: '/electronics' },
    { id: 'fashion', title: 'Fashion', icon: '👗', color: '#EC4899', route: '/fashion' },
    { id: 'home', title: 'Home & Kitchen', icon: '🏠', color: '#8B5CF6', route: '/categories' },
    { id: 'beauty', title: 'Beauty', icon: '💄', color: '#F472B6', route: '/beauty' },
    { id: 'sports', title: 'Sports', icon: '⚽', color: '#22C55E', route: '/categories' },
    { id: 'toys', title: 'Toys & Games', icon: '🎮', color: '#EAB308', route: '/categories' },
    { id: 'books', title: 'Books', icon: '📚', color: '#6366F1', route: '/categories' },
    { id: 'jewelry', title: 'Jewelry', icon: '💎', color: '#F59E0B', route: '/categories' },
  ]},
  { section: 'Food & Dining', items: [
    { id: 'food', title: 'Food Delivery', icon: '🍕', color: '#F97316', route: '/food' },
    { id: 'grocery', title: 'Grocery', icon: '🛒', color: '#22C55E', route: '/grocery' },
    { id: 'dineout', title: 'Dine Out', icon: '🍽️', color: '#EF4444', route: '/food' },
    { id: 'cafe', title: 'Cafes', icon: '☕', color: '#78350F', route: '/food' },
  ]},
  { section: 'Travel & Entertainment', items: [
    { id: 'flights', title: 'Flights', icon: '✈️', color: '#0EA5E9', route: '/travel/flights' },
    { id: 'hotels', title: 'Hotels', icon: '🏨', color: '#8B5CF6', route: '/travel/hotels' },
    { id: 'movies', title: 'Movies', icon: '🎬', color: '#EF4444', route: '/events/movies' },
    { id: 'events', title: 'Events', icon: '🎭', color: '#EC4899', route: '/events' },
    { id: 'concerts', title: 'Concerts', icon: '🎵', color: '#7C3AED', route: '/events/concerts' },
    { id: 'parks', title: 'Parks', icon: '🎢', color: '#22C55E', route: '/events/parks' },
  ]},
  { section: 'Services', items: [
    { id: 'repair', title: 'Repairs', icon: '🔧', color: '#3B82F6', route: '/home-services/repair' },
    { id: 'cleaning', title: 'Cleaning', icon: '🧹', color: '#22C55E', route: '/home-services/cleaning' },
    { id: 'salon', title: 'Salon', icon: '💇', color: '#EC4899', route: '/beauty/salon' },
    { id: 'fitness', title: 'Fitness', icon: '💪', color: '#F97316', route: '/fitness' },
    { id: 'healthcare', title: 'Healthcare', icon: '🏥', color: '#EF4444', route: '/healthcare' },
    { id: 'plumbing', title: 'Plumbing', icon: '🚿', color: '#06B6D4', route: '/home-services/plumbing' },
  ]},
  { section: 'Financial Services', items: [
    { id: 'bills', title: 'Bill Payment', icon: '📄', color: '#3B82F6', route: '/financial/bills' },
    { id: 'recharge', title: 'Recharge', icon: '📱', color: '#22C55E', route: '/financial/recharge' },
    { id: 'gold', title: 'Digital Gold', icon: '🪙', color: '#F59E0B', route: '/financial/gold' },
    { id: 'insurance', title: 'Insurance', icon: '🛡️', color: '#8B5CF6', route: '/financial/insurance' },
    { id: 'loans', title: 'Loans', icon: '💳', color: '#EC4899', route: '/financial/loans' },
    { id: 'ott', title: 'OTT', icon: '📺', color: '#EF4444', route: '/financial/ott' },
  ]},
];

const CategoriesPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = allCategories.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#06B6D4', '#0891B2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>All Categories</Text>
            <Text style={styles.headerSubtitle}>Browse everything in one place</Text>
          </View>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray600} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            placeholderTextColor={COLORS.gray600}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray600} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredCategories.map((section) => (
          <View key={section.section} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.categoriesGrid}>
              {section.items.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryCard}
                  onPress={() => router.push(cat.route as any)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                    <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                  </View>
                  <Text style={styles.categoryTitle}>{cat.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.promoBanner}>
          <LinearGradient colors={['#22C55E', '#16A34A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.promoGradient}>
            <Text style={styles.promoEmoji}>🎉</Text>
            <Text style={styles.promoTitle}>Earn Rewards Everywhere</Text>
            <Text style={styles.promoSubtitle}>Get cashback on all categories</Text>
            <View style={styles.rewardBadges}>
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardText}>Up to 30%</Text>
              </View>
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardText}>2X Coins</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  backButton: { padding: 8 },
  headerTitleContainer: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.navy, marginLeft: 12 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy, marginBottom: 16 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: (SCREEN_WIDTH - 56) / 3, alignItems: 'center', padding: 12, backgroundColor: COLORS.gray50, borderRadius: 16 },
  categoryIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryEmoji: { fontSize: 24 },
  categoryTitle: { fontSize: 11, fontWeight: '600', color: COLORS.navy, textAlign: 'center' },
  promoBanner: { marginHorizontal: 16 },
  promoGradient: { padding: 24, borderRadius: 16, alignItems: 'center' },
  promoEmoji: { fontSize: 40, marginBottom: 12 },
  promoTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  promoSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 16 },
  rewardBadges: { flexDirection: 'row', gap: 12 },
  rewardBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  rewardText: { fontSize: 13, fontWeight: '700', color: COLORS.white },
});

export default CategoriesPage;
