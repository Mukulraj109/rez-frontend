/**
 * Exciting Deals Section - Connected to /api/campaigns/exciting-deals
 * All deal categories in one section with horizontal scroll cards
 * Includes: Super Cashback Weekend, Triple Coin Day, Mega Bank Offers,
 * Upload Bill Bonanza, Flash Coin Drops, New User Bonanza
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { campaignsApi, DealCategory, CampaignDeal } from '@/services/campaignsApi';
import CoinIcon from '@/components/ui/CoinIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  emerald500: '#10B981',
  amber500: '#F59E0B',
  purple500: '#8B5CF6',
  pink500: '#EC4899',
  red500: '#EF4444',
  blue500: '#3B82F6',
  cyan500: '#06B6D4',
};

// Fallback dummy data
const FALLBACK_DEAL_CATEGORIES: DealCategory[] = [
  {
    id: 'super-cashback',
    title: 'Super Cashback Weekend',
    subtitle: 'Up to 50% cashback',
    badge: '50%',
    gradientColors: ['rgba(16, 185, 129, 0.2)', 'rgba(20, 184, 166, 0.1)'],
    badgeBg: COLORS.white,
    badgeColor: COLORS.navy,
    deals: [
      { store: 'Electronics Hub', cashback: '40%', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300' },
      { store: 'Fashion Central', cashback: '50%', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300' },
      { store: 'Home Decor', cashback: '35%', image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=300' },
    ],
  },
  {
    id: 'triple-coin-day',
    title: 'Triple Coin Day',
    subtitle: '3X coins on all spends',
    badge: '3X',
    gradientColors: ['rgba(245, 158, 11, 0.2)', 'rgba(249, 115, 22, 0.1)'],
    badgeBg: COLORS.white,
    badgeColor: COLORS.navy,
    deals: [
      { store: 'Grocery Mart', coins: '3000', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300' },
      { store: 'Beauty Palace', coins: '2500', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300' },
      { store: 'Fitness Zone', coins: '1800', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300' },
    ],
  },
  {
    id: 'mega-bank-offers',
    title: 'Mega Bank Offers',
    subtitle: 'HDFC, ICICI, SBI, Axis',
    badge: 'BANKS',
    gradientColors: ['rgba(59, 130, 246, 0.2)', 'rgba(99, 102, 241, 0.1)'],
    badgeBg: COLORS.navy,
    badgeColor: COLORS.white,
    deals: [
      { store: 'HDFC Exclusive', cashback: '₹5000 off', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300' },
      { store: 'ICICI Bonanza', cashback: '₹3000 off', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300' },
      { store: 'SBI Specials', cashback: '20% cashback', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300' },
    ],
  },
  {
    id: 'upload-bill-bonanza',
    title: 'Upload Bill Bonanza',
    subtitle: 'Extra ₹100 on every bill',
    badge: '+₹100',
    gradientColors: ['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.1)'],
    badgeBg: COLORS.white,
    badgeColor: COLORS.purple500,
    deals: [
      { store: 'Any Restaurant', bonus: '+₹100 coins', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300' },
      { store: 'Any Salon', bonus: '+₹150 coins', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300' },
      { store: 'Any Store', bonus: '+₹100 coins', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300' },
    ],
  },
  {
    id: 'flash-coin-drops',
    title: 'Flash Coin Drops',
    subtitle: 'Limited time only',
    badge: 'LIVE',
    gradientColors: ['rgba(239, 68, 68, 0.2)', 'rgba(249, 115, 22, 0.1)'],
    badgeBg: COLORS.white,
    badgeColor: COLORS.pink500,
    deals: [
      { store: 'Nike Store', drop: '500 coins', endsIn: '2h', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300' },
      { store: 'Starbucks', drop: '300 coins', endsIn: '4h', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300' },
      { store: 'Zara', drop: '400 coins', endsIn: '6h', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300' },
    ],
  },
  {
    id: 'new-user-bonanza',
    title: 'New User Bonanza',
    subtitle: 'First purchase rewards',
    badge: 'NEW',
    gradientColors: ['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.1)'],
    badgeBg: COLORS.cyan500,
    badgeColor: COLORS.white,
    deals: [
      { store: 'First Order', bonus: '₹500 off', image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300' },
      { store: 'First Visit', bonus: '1000 coins', image: 'https://images.unsplash.com/photo-1555529902-5261145633bf?w=300' },
      { store: 'Sign Up Bonus', bonus: '₹300 cashback', image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=300' },
    ],
  },
];

const ExcitingDealsSection: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dealCategories, setDealCategories] = useState<DealCategory[]>(FALLBACK_DEAL_CATEGORIES);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setIsLoading(true);
        const response = await campaignsApi.getExcitingDeals(6);

        if (response.success && response.data && response.data.dealCategories.length > 0) {
          // Use API data as source of truth
          const apiCategories = response.data.dealCategories;
          
          // Remove duplicates by ID first (in case API returns duplicates)
          const uniqueApiCategories = apiCategories.filter((cat, index, self) =>
            index === self.findIndex((c) => c.id === cat.id)
          );
          
          // Merge with fallback styling only for missing properties
          const mergedCategories = uniqueApiCategories.map((cat) => {
            // Find matching fallback by ID or title (handle variations like 'super-cashback' vs 'super-cashback-weekend')
            const fallbackMatch = FALLBACK_DEAL_CATEGORIES.find(
              (fb) => {
                const catIdLower = cat.id?.toLowerCase() || '';
                const fbIdLower = fb.id?.toLowerCase() || '';
                const catTitleLower = cat.title?.toLowerCase() || '';
                const fbTitleLower = fb.title?.toLowerCase() || '';
                
                return fb.id === cat.id || 
                       catIdLower.includes(fbIdLower) ||
                       fbIdLower.includes(catIdLower) ||
                       catTitleLower === fbTitleLower;
              }
            );
            
            // Use API data as base, fill in missing styling from fallback
            // Also ensure storeId is converted to string in all deals
            return {
              ...cat, // API data takes priority
              gradientColors: cat.gradientColors || fallbackMatch?.gradientColors || ['rgba(16, 185, 129, 0.2)', 'rgba(20, 184, 166, 0.1)'],
              badgeBg: cat.badgeBg || fallbackMatch?.badgeBg || COLORS.white,
              badgeColor: cat.badgeColor || fallbackMatch?.badgeColor || COLORS.navy,
              deals: cat.deals?.map((deal: CampaignDeal) => ({
                ...deal,
                storeId: deal.storeId 
                  ? (typeof deal.storeId === 'string' ? deal.storeId : String(deal.storeId))
                  : undefined,
              })) || [],
            };
          });
          
          // Final duplicate removal by ID and title to catch any remaining duplicates
          const finalCategories = mergedCategories.filter((cat, index, self) => {
            const firstIndex = self.findIndex((c) => {
              // Match by exact ID
              if (c.id === cat.id) return true;
              // Match by title if IDs are different but titles match (same campaign, different ID format)
              if (c.title?.toLowerCase() === cat.title?.toLowerCase() && c.id && cat.id) {
                return true;
              }
              return false;
            });
            // Only keep the first occurrence
            return index === firstIndex;
          });
          
          console.log('✅ [ExcitingDealsSection] Loaded', finalCategories.length, 'unique campaigns');
          console.log('📋 Campaign IDs:', finalCategories.map(c => `${c.id} - ${c.title}`));
          setDealCategories(finalCategories);
        }
      } catch (error) {
        console.error('❌ [ExcitingDealsSection] Error fetching deals:', error);
        // Keep using fallback data
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const handleViewAll = () => {
    router.push('/deal-store' as any);
  };

  const handleDealPress = (deal: CampaignDeal, categoryId: string, dealIndex: number) => {
    // Navigate to deal detail page
    console.log('📍 [ExcitingDeals] Navigating to deal detail:', categoryId, dealIndex);
    router.push(`/deals/${categoryId}/${dealIndex}` as any);
  };

  const handleCategoryPress = (categoryId: string) => {
    // Navigate to deals page filtered by category
    router.push(`/deal-store?campaign=${categoryId}` as any);
  };

  const renderDealValue = (deal: CampaignDeal) => {
    if (deal.cashback) {
      return <Text style={styles.dealCashback}>{deal.cashback}</Text>;
    }
    if (deal.coins) {
      return (
        <View style={styles.dealCoinsRow}>
          <CoinIcon size={16} />
          <Text style={styles.dealCoins}>{deal.coins}</Text>
        </View>
      );
    }
    if (deal.bonus) {
      return <Text style={styles.dealBonus}>{deal.bonus}</Text>;
    }
    if (deal.drop) {
      return <Text style={styles.dealDrop}>🎁 {deal.drop}</Text>;
    }
    return null;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.green500} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>💥 Exciting Deals</Text>
          <Text style={styles.headerSubtitle}>Limited time only</Text>
        </View>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {/* Deal Categories */}
      <View style={styles.categoriesContainer}>
        {dealCategories.filter((cat, index, self) => {
          // Remove duplicates by ID and title - keep only first occurrence
          const firstIndex = self.findIndex((c) => 
            c.id === cat.id || 
            (c.title.toLowerCase() === cat.title.toLowerCase() && c.id)
          );
          return index === firstIndex;
        }).map((category) => (
          <View key={category.id} style={styles.categoryWrapper}>
            {/* Category Header */}
            <TouchableOpacity
              onPress={() => handleCategoryPress(category.id)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={category.gradientColors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.categoryHeader}
              >
                <View>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: category.badgeBg || COLORS.white }]}>
                  <Text style={[styles.badgeText, { color: category.badgeColor || COLORS.navy }]}>
                    {category.badge}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Deals Horizontal Scroll */}
            <View style={styles.dealsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dealsScroll}
              >
                {category.deals.map((deal, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.dealCard}
                    onPress={() => handleDealPress(deal, category.id, idx)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.dealImageContainer}>
                      <Image
                        source={{ uri: deal.image }}
                        style={styles.dealImage}
                        resizeMode="cover"
                      />
                      {deal.endsIn && (
                        <View style={styles.timerBadge}>
                          <Text style={styles.timerText}>{deal.endsIn} left</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.dealInfo}>
                      <Text style={styles.dealStore} numberOfLines={1}>{deal.store}</Text>
                      {renderDealValue(deal)}
                    </View>
                  </TouchableOpacity>
                ))}

                {/* View All Card */}
                <TouchableOpacity
                  style={styles.viewAllCard}
                  onPress={handleViewAll}
                  activeOpacity={0.8}
                >
                  <Text style={styles.viewAllIcon}>→</Text>
                  <Text style={styles.viewAllCardText}>View All</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        ))}
      </View>

      {/* CTA Banner */}
      <TouchableOpacity
        style={styles.ctaBanner}
        onPress={handleViewAll}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#22C55E', '#14B8A6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.ctaGradient}
        >
          <Text style={styles.ctaTitle}>🔥 Don't Miss Out!</Text>
          <Text style={styles.ctaSubtitle}>New deals added every hour • Limited quantities</Text>
          <View style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Browse All Deals</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green500,
  },

  // Categories
  categoriesContainer: {
    gap: 20,
  },
  categoryWrapper: {
    marginBottom: 4,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Deals Container
  dealsContainer: {
    backgroundColor: COLORS.gray50,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingVertical: 12,
  },
  dealsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dealCard: {
    width: 160,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  dealImageContainer: {
    position: 'relative',
  },
  dealImage: {
    width: '100%',
    height: 100,
  },
  timerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.red500,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  dealInfo: {
    padding: 12,
  },
  dealStore: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  dealCashback: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.emerald500,
  },
  dealCoinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dealCoins: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.amber500,
  },
  dealBonus: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.purple500,
  },
  dealDrop: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.red500,
  },

  // View All Card
  viewAllCard: {
    width: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewAllIcon: {
    fontSize: 20,
    color: COLORS.gray600,
  },
  viewAllCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray600,
  },

  // CTA Banner
  ctaBanner: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaGradient: {
    padding: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
  },
});

export default ExcitingDealsSection;
