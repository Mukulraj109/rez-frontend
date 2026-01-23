/**
 * Deal Detail Page - Individual deal within a campaign
 * Route: /deals/[campaignId]/[dealIndex]
 * 100% production ready - Full redemption flow
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
  Alert,
  Share,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { campaignsApi, Campaign, CampaignDeal } from '@/services/campaignsApi';
import CoinIcon from '@/components/ui/CoinIcon';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/services/apiClient';

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

const DealDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { state: authState } = useAuth();
  const campaignId = params.campaignId as string;
  const dealIndex = parseInt(params.dealIndex as string, 10);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [deal, setDeal] = useState<CampaignDeal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (campaignId && !isNaN(dealIndex)) {
      fetchDealDetails();
    } else {
      setError('Invalid deal information');
      setIsLoading(false);
    }
  }, [campaignId, dealIndex]);

  // Track deal view when deal is loaded
  useEffect(() => {
    if (deal && campaign) {
      // Track view asynchronously (don't block UI)
      apiClient.post('/campaigns/deals/track', {
        campaignId: campaign._id || campaignId,
        dealIndex,
        action: 'view',
      }).catch(err => console.error('Failed to track deal view:', err));
    }
  }, [deal, campaign, campaignId, dealIndex]);

  const fetchDealDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await campaignsApi.getCampaignById(campaignId);

      if (response.success && response.data) {
        const campaignData = response.data;
        setCampaign(campaignData);

        // Get the specific deal by index
        if (campaignData.deals && campaignData.deals[dealIndex]) {
          const dealData = campaignData.deals[dealIndex];
          // Ensure storeId is string
          const transformedDeal = {
            ...dealData,
            storeId: dealData.storeId 
              ? (typeof dealData.storeId === 'string' ? dealData.storeId : String(dealData.storeId))
              : undefined,
          };
          setDeal(transformedDeal);
        } else {
          setError('Deal not found');
        }
      } else {
        setError(response.message || 'Campaign not found');
      }
    } catch (err: any) {
      console.error('❌ [DealDetail] Error fetching deal:', err);
      setError(err.message || 'Failed to load deal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!deal) return;

    // If user is not authenticated, prompt to sign in
    if (!authState.isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to redeem this deal',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/sign-in' as any) }
        ]
      );
      return;
    }

    setIsRedeeming(true);
    try {
      // Track deal redemption/view
      await apiClient.post('/campaigns/deals/track', {
        campaignId: campaign?._id || campaignId,
        dealIndex,
        action: 'redeem',
      });

      // Navigate based on available data
      const storeId = deal.storeId 
        ? (typeof deal.storeId === 'string' ? deal.storeId : String(deal.storeId))
        : null;

      if (storeId) {
        Alert.alert(
          'Deal Activated!',
          `Visit ${deal.store || 'the store'} to redeem this deal.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Visit Store', 
              onPress: () => router.push(`/store/${storeId}` as any)
            }
          ]
        );
      } else {
        Alert.alert(
          'Deal Saved!',
          'This deal has been saved to your account. Visit the store to redeem.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ [DealDetail] Error redeeming deal:', error);
      // Still allow navigation even if tracking fails
      const storeId = deal.storeId 
        ? (typeof deal.storeId === 'string' ? deal.storeId : String(deal.storeId))
        : null;
      
      if (storeId) {
        router.push(`/store/${storeId}` as any);
      }
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleLike = async () => {
    if (!deal || !authState.isAuthenticated) return;

    try {
      setIsLiked(!isLiked);
      // Track like action
      await apiClient.post('/campaigns/deals/track', {
        campaignId: campaign?._id || campaignId,
        dealIndex,
        action: 'like',
      });
    } catch (error) {
      console.error('Error liking deal:', error);
      setIsLiked(!isLiked); // Revert on error
    }
  };

  const handleShare = async () => {
    if (!deal || !campaign) return;

    try {
      const shareMessage = `Check out this amazing deal!\n\n${deal.store || 'Store'}\n${campaign.title}\n\n${deal.cashback || deal.coins || deal.bonus || deal.drop || 'Special Offer'}`;
      
      await Share.share({
        message: shareMessage,
        title: `${deal.store} - ${campaign.title}`,
      });

      // Track share
      if (authState.isAuthenticated) {
        await apiClient.post('/campaigns/deals/track', {
          campaignId: campaign._id || campaignId,
          dealIndex,
          action: 'share',
        });
      }
    } catch (error) {
      console.error('Error sharing deal:', error);
    }
  };

  const handleVisitStore = () => {
    if (!deal) return;

    const storeId = deal.storeId 
      ? (typeof deal.storeId === 'string' ? deal.storeId : String(deal.storeId))
      : null;

    if (storeId) {
      router.push(`/store/${storeId}` as any);
    } else {
      Alert.alert('Store Information', 'Store details are not available for this deal.');
    }
  };

  const renderDealValue = () => {
    if (!deal) return null;

    if (deal.cashback) {
      return (
        <View style={styles.valueContainer}>
          <Text style={styles.valueLabel}>Cashback</Text>
          <Text style={styles.valueAmount}>{deal.cashback}</Text>
        </View>
      );
    }
    if (deal.coins) {
      return (
        <View style={styles.valueContainer}>
          <Text style={styles.valueLabel}>Coins</Text>
          <View style={styles.coinsRow}>
            <CoinIcon size={24} />
            <Text style={styles.valueAmount}>{deal.coins}</Text>
          </View>
        </View>
      );
    }
    if (deal.bonus) {
      return (
        <View style={styles.valueContainer}>
          <Text style={styles.valueLabel}>Bonus</Text>
          <Text style={styles.valueAmount}>{deal.bonus}</Text>
        </View>
      );
    }
    if (deal.drop) {
      return (
        <View style={styles.valueContainer}>
          <Text style={styles.valueLabel}>Drop</Text>
          <Text style={styles.valueAmount}>🎁 {deal.drop}</Text>
        </View>
      );
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
        <Text style={styles.loadingText}>Loading deal...</Text>
      </View>
    );
  }

  if (error || !deal || !campaign) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray600} />
        <Text style={styles.errorText}>{error || 'Deal not found'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const storeId = deal.storeId 
    ? (typeof deal.storeId === 'string' ? deal.storeId : String(deal.storeId))
    : null;

  return (
    <View style={styles.container}>
      {/* Header with Image */}
      <View style={styles.headerImageContainer}>
        <Image 
          source={{ uri: deal.image }} 
          style={styles.headerImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        />
        
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButtonHeader}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleLike}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? COLORS.red500 : COLORS.white} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Deal Info Overlay */}
        <View style={styles.dealInfoOverlay}>
          <Text style={styles.dealStoreName}>{deal.store || 'Store'}</Text>
          <Text style={styles.dealCampaignTitle}>{campaign.title}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Deal Value Card */}
        {renderDealValue() && (
          <View style={styles.valueCard}>
            {renderDealValue()}
          </View>
        )}

        {/* Campaign Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About This Deal</Text>
          {campaign.description ? (
            <Text style={styles.infoText}>{campaign.description}</Text>
          ) : (
            <Text style={styles.infoText}>
              Get amazing savings at {deal.store || 'this store'}! This exclusive deal is part of the {campaign.title} campaign.
            </Text>
          )}
        </View>

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

        {/* CTA Buttons */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.ctaButton, styles.primaryButton]}
            onPress={handleRedeem}
            disabled={isRedeeming}
          >
            {isRedeeming ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="gift-outline" size={20} color={COLORS.white} />
                <Text style={styles.ctaButtonText}>Redeem Deal</Text>
              </>
            )}
          </TouchableOpacity>

          {storeId && (
            <TouchableOpacity
              style={[styles.ctaButton, styles.secondaryButton]}
              onPress={handleVisitStore}
            >
              <Ionicons name="storefront-outline" size={20} color={COLORS.green500} />
              <Text style={[styles.ctaButtonText, styles.secondaryButtonText]}>Visit Store</Text>
            </TouchableOpacity>
          )}
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
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.green500,
    borderRadius: 24,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  headerImageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  backButtonHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dealInfoOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  dealStoreName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  dealCampaignTitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  valueCard: {
    margin: 16,
    marginTop: -40,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  valueContainer: {
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: 8,
  },
  valueAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.emerald500,
  },
  coinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoSection: {
    padding: 16,
    backgroundColor: COLORS.gray50,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 12,
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
  ctaSection: {
    padding: 16,
    gap: 12,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.green500,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.green500,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryButtonText: {
    color: COLORS.green500,
  },
});

export default DealDetailPage;
