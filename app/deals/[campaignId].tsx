/**
 * Campaign Detail Page - Specific deal/campaign page
 * Route: /deals/[campaignId]
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
import { campaignsApi, Campaign, CampaignDeal } from '@/services/campaignsApi';
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

const CampaignDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const campaignId = params.campaignId as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (campaignId) {
      console.log('📢 [CampaignDetail] Fetching campaign with ID:', campaignId);
      fetchCampaign();
    } else {
      console.warn('⚠️ [CampaignDetail] No campaignId provided');
      setError('Campaign ID is required');
      setIsLoading(false);
    }
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📡 [CampaignDetail] Calling API for campaign:', campaignId);
      const response = await campaignsApi.getCampaignById(campaignId);

      if (response.success && response.data) {
        console.log('✅ [CampaignDetail] Campaign loaded:', response.data.title);
        // Ensure storeId is converted to string in all deals
        const transformedCampaign = {
          ...response.data,
          deals: response.data.deals.map((deal: CampaignDeal) => ({
            ...deal,
            storeId: deal.storeId 
              ? (typeof deal.storeId === 'string' ? deal.storeId : String(deal.storeId))
              : undefined,
          })),
        };
        setCampaign(transformedCampaign);
      } else {
        console.error('❌ [CampaignDetail] Campaign not found:', response.message);
        setError(response.message || 'Campaign not found');
      }
    } catch (err: any) {
      console.error('❌ [CampaignDetail] Error fetching campaign:', err);
      setError(err.message || 'Failed to load campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDealPress = (deal: CampaignDeal) => {
    // Convert storeId to string if it's an ObjectId or other format
    const storeId = deal.storeId 
      ? (typeof deal.storeId === 'string' ? deal.storeId : String(deal.storeId))
      : null;

    if (storeId) {
      console.log('📍 [CampaignDetail] Navigating to store:', storeId);
      router.push(`/store/${storeId}` as any);
    } else {
      console.log('📍 [CampaignDetail] No storeId, navigating to deal-store');
      router.push('/deal-store' as any);
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.green500} />
        <Text style={styles.loadingText}>Loading campaign...</Text>
      </View>
    );
  }

  if (error || !campaign) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray600} />
        <Text style={styles.errorText}>{error || 'Campaign not found'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={campaign.gradientColors || ['#22C55E', '#14B8A6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{campaign.title}</Text>
            <Text style={styles.headerSubtitle}>{campaign.subtitle}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Campaign Badge */}
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, { backgroundColor: campaign.badgeBg || COLORS.white }]}>
            <Text style={[styles.badgeText, { color: campaign.badgeColor || COLORS.navy }]}>
              {campaign.badge}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Campaign Info */}
        {campaign.description && (
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>About This Deal</Text>
            <Text style={styles.infoText}>{campaign.description}</Text>
          </View>
        )}

        {/* Validity */}
        <View style={styles.validitySection}>
          <View style={styles.validityItem}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.green500} />
            <View style={styles.validityText}>
              <Text style={styles.validityLabel}>Starts</Text>
              <Text style={styles.validityValue}>{formatDate(campaign.startTime)}</Text>
            </View>
          </View>
          <View style={styles.validityItem}>
            <Ionicons name="time-outline" size={20} color={COLORS.red500} />
            <View style={styles.validityText}>
              <Text style={styles.validityLabel}>Ends</Text>
              <Text style={styles.validityValue}>{formatDate(campaign.endTime)}</Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        {campaign.terms && campaign.terms.length > 0 && (
          <View style={styles.termsSection}>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            {campaign.terms.map((term, idx) => (
              <View key={idx} style={styles.termItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.green500} />
                <Text style={styles.termText}>{term}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Deals Grid */}
        <View style={styles.dealsSection}>
          <Text style={styles.sectionTitle}>Available Deals</Text>
          <View style={styles.dealsGrid}>
            {campaign.deals.map((deal, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.dealCard}
                onPress={() => handleDealPress(deal, idx)}
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
            ))}
          </View>
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
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 24,
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
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  badgeContainer: {
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoSection: {
    padding: 16,
    backgroundColor: COLORS.gray50,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  validitySection: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  validityItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  validityText: {
    flex: 1,
  },
  validityLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 2,
  },
  validityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
  },
  termsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 12,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  termText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  dealsSection: {
    padding: 16,
  },
  dealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dealCard: {
    width: '48%',
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
    height: 120,
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
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 6,
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
});

export default CampaignDetailPage;
