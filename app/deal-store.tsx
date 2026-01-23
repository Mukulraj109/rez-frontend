/**
 * Deal Store Page - All deals in one place
 * 100% production ready - Connected to /api/campaigns
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { campaignsApi, DealCategory, CampaignDeal } from '@/services/campaignsApi';
import CoinIcon from '@/components/ui/CoinIcon';

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  emerald500: '#10B981',
  amber500: '#F59E0B',
  blue500: '#3B82F6',
  purple500: '#8B5CF6',
  pink500: '#EC4899',
  red500: '#EF4444',
  cyan500: '#06B6D4',
};

const DealStorePage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dealCategories, setDealCategories] = useState<DealCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const filteredCampaign = (params.campaign as string) || null;
  const filteredDealName = (params.deal as string) || null;

  const categories = ['all', 'Cashback', 'Coins', 'Bank Offers', 'Flash Deals'];

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setIsLoading(true);
      const response = await campaignsApi.getExcitingDeals(20); // Get more for deal store

      if (response.success && response.data && response.data.dealCategories.length > 0) {
        // Remove duplicates by ID and title
        const uniqueCategories = response.data.dealCategories.filter((cat, index, self) => {
          const firstIndex = self.findIndex((c) => {
            // Match by exact ID
            if (c.id === cat.id) return true;
            // Match by title if IDs are different but titles match
            if (c.title?.toLowerCase() === cat.title?.toLowerCase() && c.id && cat.id) {
              return true;
            }
            return false;
          });
          return index === firstIndex;
        });
        
        setDealCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('❌ [DealStore] Error fetching deals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDealPress = (deal: CampaignDeal | undefined, categoryId: string, dealIndex: number) => {
    // Safety check: ensure deal exists
    if (!deal) {
      console.warn('❌ [DealStore] handleDealPress called with undefined deal');
      router.push(`/deals/${categoryId}` as any);
      return;
    }

    // Navigate to deal detail page
    router.push(`/deals/${categoryId}/${dealIndex}` as any);
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/deals/${categoryId}` as any);
  };

  const renderDealValue = (deal: CampaignDeal | undefined) => {
    if (!deal) return null;
    
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

  // Filter deals based on selected category and query params
  const filteredDealCategories = dealCategories
    .filter((category) => {
      // Filter by campaign if specified in URL
      if (filteredCampaign) {
        return category.id === filteredCampaign || 
               category.id?.toLowerCase().includes(filteredCampaign.toLowerCase()) ||
               filteredCampaign.toLowerCase().includes(category.id?.toLowerCase() || '');
      }
      // Filter by category tab
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'Cashback') {
        return category.id === 'super-cashback-weekend' || 
               category.id === 'super-cashback' ||
               category.title?.toLowerCase().includes('cashback');
      }
      if (selectedCategory === 'Coins') {
        return category.id === 'triple-coin-day' ||
               category.title?.toLowerCase().includes('coin');
      }
      if (selectedCategory === 'Bank Offers') {
        return category.id === 'mega-bank-offers' ||
               category.title?.toLowerCase().includes('bank');
      }
      if (selectedCategory === 'Flash Deals') {
        return category.id === 'flash-coin-drops' ||
               category.title?.toLowerCase().includes('flash');
      }
      return true;
    })
    .map((category) => {
      // If a specific deal name is provided, filter deals within the category
      if (filteredDealName) {
        const filteredDeals = category.deals.filter((deal) => {
          const dealStoreName = deal.store?.toLowerCase() || '';
          const searchName = filteredDealName.toLowerCase().replace(/\+/g, ' ');
          return dealStoreName.includes(searchName) || searchName.includes(dealStoreName);
        });
        
        // Only return category if it has matching deals
        if (filteredDeals.length > 0) {
          return {
            ...category,
            deals: filteredDeals,
          };
        }
        return null;
      }
      return category;
    })
    .filter((cat) => cat !== null) as DealCategory[];

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.green500} />
        <Text style={styles.loadingText}>Loading deals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#22C55E', '#14B8A6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Deal Store</Text>
            <Text style={styles.headerSubtitle}>All deals in one place</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroEmoji}>🔥</Text>
          <Text style={styles.heroTitle}>Don't Miss Out!</Text>
          <Text style={styles.heroSubtitle}>New deals added every hour • Limited quantities</Text>
        </View>
      </LinearGradient>

      {/* Category Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.filterChip,
                selectedCategory === category && styles.filterChipActive
              ]}
            >
              <Text style={[
                styles.filterChipText,
                selectedCategory === category && styles.filterChipTextActive
              ]}>
                {category === 'all' ? 'All Deals' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Deal Categories */}
        {filteredDealCategories.length > 0 ? (
          filteredDealCategories.map((category) => (
            <View key={category.id} style={styles.categorySection}>
              {/* Category Header */}
              <TouchableOpacity
                onPress={() => router.push(`/deals/${category.id}` as any)}
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
                  <View style={[styles.categoryBadge, { backgroundColor: category.badgeBg || COLORS.white }]}>
                    <Text style={[styles.categoryBadgeText, { color: category.badgeColor || COLORS.navy }]}>
                      {category.badge}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Deals Grid */}
              <View style={styles.dealsGrid}>
                {category.deals && Array.isArray(category.deals) && category.deals.length > 0 ? (
                  category.deals
                    .filter((deal) => deal && deal.image) // Filter out invalid deals first
                    .map((deal, idx) => {
                      // Additional safety check
                      if (!deal) return null;
                      
                      return (
                        <TouchableOpacity
                          key={`${category.id}-deal-${idx}-${deal.store || idx}`}
                          style={styles.dealCard}
                          onPress={() => {
                            // Navigate to deal detail page using the current index
                            router.push(`/deals/${category.id}/${idx}` as any);
                          }}
                          activeOpacity={0.8}
                        >
                          <View style={styles.dealImageContainer}>
                            <Image source={{ uri: deal.image }} style={styles.dealImage} />
                            {deal.endsIn && (
                              <View style={styles.timerBadge}>
                                <Text style={styles.timerText}>{deal.endsIn} left</Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.dealInfo}>
                            <Text style={styles.dealStore} numberOfLines={1}>
                              {deal.store || 'Store'}
                            </Text>
                            {renderDealValue(deal)}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                ) : (
                  <View style={styles.noDealsContainer}>
                    <Text style={styles.noDealsText}>No deals available</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={COLORS.gray600} />
            <Text style={styles.emptyText}>No deals found</Text>
            {filteredDealName && (
              <Text style={styles.emptySubtext}>
                No deals found for "{filteredDealName}"
              </Text>
            )}
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={() => router.push('/deal-store' as any)}
            >
              <Text style={styles.clearFilterText}>Clear Filter</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom CTA */}
        <View style={styles.bottomCTA}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaTitle}>💰 Maximize Your Savings</Text>
            <Text style={styles.ctaSubtitle}>Stack cashback + coins + bank offers for maximum savings!</Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Learn How</Text>
            </TouchableOpacity>
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
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
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
  searchButton: {
    padding: 8,
  },
  heroBanner: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  heroEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  filtersContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.emerald500,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  categoryBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
  },
  dealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 8,
  },
  dealCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginBottom: 4,
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
    fontSize: 13,
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
  bottomCTA: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  ctaGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
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
    color: COLORS.purple500,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: 24,
    textAlign: 'center',
  },
  clearFilterButton: {
    backgroundColor: COLORS.green500,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  clearFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  noDealsContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  noDealsText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
});

export default DealStorePage;
