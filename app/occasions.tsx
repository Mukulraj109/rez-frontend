/**
 * Occasions Listing Page
 * Shows all shopping occasions for a category
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import categoryMetadataApi, { Occasion } from '@/services/categoryMetadataApi';
import { getOccasionsForCategory, getAllOccasions } from '@/data/categoryDummyData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  primaryGreen: '#00C06A',
  background: '#F5F7FA',
};

const getTagColor = (tag: string | null) => {
  switch (tag) {
    case 'Hot':
      return { bg: '#FEE2E2', text: '#EF4444' };
    case 'Trending':
      return { bg: '#DBEAFE', text: '#2563EB' };
    case 'Coming Soon':
      return { bg: '#FEF3C7', text: '#D97706' };
    case 'Premium':
      return { bg: '#F3E8FF', text: '#7C3AED' };
    case 'Special':
      return { bg: '#D1FAE5', text: '#059669' };
    case 'Student':
      return { bg: '#CFFAFE', text: '#0891B2' };
    case 'Popular':
      return { bg: '#FCE7F3', text: '#DB2777' };
    case 'Festive':
      return { bg: '#FFEDD5', text: '#EA580C' };
    default:
      return { bg: '#F3F4F6', text: '#6B7280' };
  }
};

const OccasionCard = ({
  occasion,
  onPress,
}: {
  occasion: Occasion;
  onPress: () => void;
}) => {
  const tagColors = getTagColor(occasion.tag);

  return (
    <TouchableOpacity
      style={[styles.occasionCard, { backgroundColor: `${occasion.color}15` }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Tag Badge */}
      {occasion.tag && (
        <View style={[styles.tagBadge, { backgroundColor: tagColors.bg }]}>
          <Text style={[styles.tagText, { color: tagColors.text }]}>{occasion.tag}</Text>
        </View>
      )}

      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: `${occasion.color}25` }]}>
        <Text style={styles.icon}>{occasion.icon}</Text>
      </View>

      {/* Name */}
      <Text style={styles.occasionName}>{occasion.name}</Text>

      {/* Discount */}
      <View style={[styles.discountBadge, { backgroundColor: occasion.color }]}>
        <Text style={styles.discountText}>Up to {occasion.discount}% off</Text>
      </View>

      {/* Shop Now Button */}
      <View style={styles.shopButton}>
        <Text style={styles.shopButtonText}>Shop Now</Text>
        <Ionicons name="arrow-forward" size={14} color={COLORS.primaryGreen} />
      </View>
    </TouchableOpacity>
  );
};

export default function OccasionsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categorySlug = params.category as string;

  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load occasions
  useEffect(() => {
    loadOccasions();
  }, [categorySlug]);

  const loadOccasions = async () => {
    setLoading(true);
    try {
      if (categorySlug) {
        // Try API first
        const response = await categoryMetadataApi.getOccasions(categorySlug);
        if (response.success && response.data?.occasions?.length > 0) {
          setOccasions(response.data.occasions);
        } else {
          // Fallback to dummy data
          const fallbackOccasions = getOccasionsForCategory(categorySlug);
          setOccasions(fallbackOccasions);
        }
      } else {
        // Get all occasions
        const allOccasions = getAllOccasions();
        setOccasions(allOccasions);
      }
    } catch (error) {
      console.error('Error loading occasions:', error);
      // Fallback to dummy data
      const fallbackOccasions = categorySlug
        ? getOccasionsForCategory(categorySlug)
        : getAllOccasions();
      setOccasions(fallbackOccasions);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOccasions();
  };

  const handleOccasionPress = (occasion: Occasion) => {
    router.push({
      pathname: '/shop',
      params: { occasion: occasion.id, category: categorySlug },
    } as any);
  };

  const renderOccasion = ({ item }: { item: Occasion }) => (
    <OccasionCard occasion={item} onPress={() => handleOccasionPress(item)} />
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <Text style={styles.pageTitle}>
        {categorySlug ? 'Shop for Every Occasion' : 'All Occasions'}
      </Text>
      <Text style={styles.pageSubtitle}>
        Find the perfect products for any event or celebration
      </Text>
      <Text style={styles.resultCount}>
        {occasions.length} {occasions.length === 1 ? 'occasion' : 'occasions'}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🎉</Text>
      <Text style={styles.emptyTitle}>No occasions found</Text>
      <Text style={styles.emptyText}>
        Check back later for upcoming occasions and deals
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#00C06A', '#00A05A']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {categorySlug
              ? `${categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Occasions`
              : 'Shop by Occasion'}
          </Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Occasions List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
          <Text style={styles.loadingText}>Loading occasions...</Text>
        </View>
      ) : (
        <FlatList
          data={occasions}
          renderItem={renderOccasion}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primaryGreen}
              colors={[COLORS.primaryGreen]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  headerContent: {
    padding: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray600,
  },
  listContent: {
    paddingBottom: 100,
  },
  row: {
    paddingHorizontal: 16,
    gap: 16,
  },
  occasionCard: {
    width: CARD_WIDTH,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
  },
  tagBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  icon: {
    fontSize: 36,
  },
  occasionName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
    textAlign: 'center',
    marginBottom: 10,
  },
  discountBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 12,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shopButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
  },
});
