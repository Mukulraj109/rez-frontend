/**
 * All Categories Page - Browse all shopping categories
 * Connected to /api/categories
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import categoriesApi, { Category } from '@/services/categoriesApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  cyan500: '#06B6D4',
  amber500: '#F59E0B',
};

// Section configurations with icons and colors
const SECTION_CONFIG: Record<string, { icon: string; color: string }> = {
  electronics: { icon: '📱', color: '#3B82F6' },
  fashion: { icon: '👗', color: '#EC4899' },
  home: { icon: '🏠', color: '#8B5CF6' },
  beauty: { icon: '💄', color: '#F472B6' },
  sports: { icon: '⚽', color: '#22C55E' },
  toys: { icon: '🎮', color: '#EAB308' },
  books: { icon: '📚', color: '#6366F1' },
  jewelry: { icon: '💎', color: '#F59E0B' },
  food: { icon: '🍕', color: '#F97316' },
  grocery: { icon: '🛒', color: '#22C55E' },
  dineout: { icon: '🍽️', color: '#EF4444' },
  cafe: { icon: '☕', color: '#78350F' },
  flights: { icon: '✈️', color: '#0EA5E9' },
  hotels: { icon: '🏨', color: '#8B5CF6' },
  movies: { icon: '🎬', color: '#EF4444' },
  events: { icon: '🎭', color: '#EC4899' },
  concerts: { icon: '🎵', color: '#7C3AED' },
  parks: { icon: '🎢', color: '#22C55E' },
  repair: { icon: '🔧', color: '#3B82F6' },
  cleaning: { icon: '🧹', color: '#22C55E' },
  salon: { icon: '💇', color: '#EC4899' },
  fitness: { icon: '💪', color: '#F97316' },
  healthcare: { icon: '🏥', color: '#EF4444' },
  plumbing: { icon: '🚿', color: '#06B6D4' },
  bills: { icon: '📄', color: '#3B82F6' },
  recharge: { icon: '📱', color: '#22C55E' },
  gold: { icon: '🪙', color: '#F59E0B' },
  insurance: { icon: '🛡️', color: '#8B5CF6' },
  loans: { icon: '💳', color: '#EC4899' },
  ott: { icon: '📺', color: '#EF4444' },
};

// Fallback categories
const FALLBACK_SECTIONS = [
  {
    section: 'Shopping',
    items: [
      { id: 'electronics', title: 'Electronics', icon: '📱', color: '#3B82F6', route: '/category/electronics' },
      { id: 'fashion', title: 'Fashion', icon: '👗', color: '#EC4899', route: '/category/fashion' },
      { id: 'home', title: 'Home & Kitchen', icon: '🏠', color: '#8B5CF6', route: '/category/home' },
      { id: 'beauty', title: 'Beauty', icon: '💄', color: '#F472B6', route: '/beauty' },
    ],
  },
  {
    section: 'Food & Dining',
    items: [
      { id: 'food', title: 'Food Delivery', icon: '🍕', color: '#F97316', route: '/category/food' },
      { id: 'grocery', title: 'Grocery', icon: '🛒', color: '#22C55E', route: '/category/grocery' },
    ],
  },
  {
    section: 'Travel & Entertainment',
    items: [
      { id: 'flights', title: 'Flights', icon: '✈️', color: '#0EA5E9', route: '/travel/flights' },
      { id: 'hotels', title: 'Hotels', icon: '🏨', color: '#8B5CF6', route: '/travel/hotels' },
      { id: 'movies', title: 'Movies', icon: '🎬', color: '#EF4444', route: '/events/movies' },
      { id: 'events', title: 'Events', icon: '🎭', color: '#EC4899', route: '/events' },
    ],
  },
  {
    section: 'Services',
    items: [
      { id: 'salon', title: 'Salon', icon: '💇', color: '#EC4899', route: '/beauty/salon' },
      { id: 'fitness', title: 'Fitness', icon: '💪', color: '#F97316', route: '/fitness' },
      { id: 'healthcare', title: 'Healthcare', icon: '🏥', color: '#EF4444', route: '/healthcare' },
    ],
  },
  {
    section: 'Financial Services',
    items: [
      { id: 'bills', title: 'Bill Payment', icon: '📄', color: '#3B82F6', route: '/financial/bills' },
      { id: 'recharge', title: 'Recharge', icon: '📱', color: '#22C55E', route: '/financial/recharge' },
      { id: 'gold', title: 'Digital Gold', icon: '🪙', color: '#F59E0B', route: '/financial/gold' },
      { id: 'insurance', title: 'Insurance', icon: '🛡️', color: '#8B5CF6', route: '/financial/insurance' },
    ],
  },
];

interface DisplayCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  route: string;
}

interface CategorySection {
  section: string;
  items: DisplayCategory[];
}

const CategoriesPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sections, setSections] = useState<CategorySection[]>(FALLBACK_SECTIONS);
  const [totalCategories, setTotalCategories] = useState(0);

  const transformCategory = (cat: Category): DisplayCategory => {
    const config = SECTION_CONFIG[cat.slug] || { icon: '📦', color: '#6B7280' };
    return {
      id: cat._id,
      title: cat.name,
      icon: cat.icon || config.icon,
      color: cat.metadata?.color || config.color,
      route: `/category/${cat.slug}`,
    };
  };

  const groupCategoriesByType = (categories: Category[]): CategorySection[] => {
    const typeMap: Record<string, string> = {
      going_out: 'Food & Dining',
      home_delivery: 'Shopping',
      earn: 'Earn Rewards',
      play: 'Entertainment',
      general: 'Other',
    };

    const grouped: Record<string, DisplayCategory[]> = {};

    categories.forEach((cat) => {
      const sectionName = typeMap[cat.type] || 'Shopping';
      if (!grouped[sectionName]) {
        grouped[sectionName] = [];
      }
      grouped[sectionName].push(transformCategory(cat));
    });

    // Order sections
    const sectionOrder = ['Shopping', 'Food & Dining', 'Entertainment', 'Services', 'Financial Services', 'Earn Rewards', 'Other'];

    return sectionOrder
      .filter((section) => grouped[section] && grouped[section].length > 0)
      .map((section) => ({
        section,
        items: grouped[section],
      }));
  };

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoriesApi.getCategories({ isActive: true });

      if (response.success && response.data && response.data.length > 0) {
        const groupedSections = groupCategoriesByType(response.data);
        if (groupedSections.length > 0) {
          setSections(groupedSections);
        }
        setTotalCategories(response.data.length);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Keep fallback data
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.cyan500} />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#06B6D4', '#0891B2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>All Categories</Text>
            <Text style={styles.headerSubtitle}>
              {totalCategories > 0 ? `${totalCategories} categories` : 'Browse everything in one place'}
            </Text>
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.cyan500]} />
        }
      >
        {filteredCategories.length > 0 ? (
          filteredCategories.map((section) => (
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
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No categories found</Text>
            <Text style={styles.emptySubtitle}>Try a different search term</Text>
          </View>
        )}

        <View style={styles.promoBanner}>
          <LinearGradient
            colors={['#22C55E', '#16A34A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoGradient}
          >
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
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.navy,
    marginLeft: 12,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 56) / 3,
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.gray50,
    borderRadius: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.navy,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  promoBanner: {
    marginHorizontal: 16,
  },
  promoGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  promoEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  rewardBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default CategoriesPage;
