// Offer Detail Page
// Dynamic route for individual offer details with redemption

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  Share,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { ThemedText } from '@/components/ThemedText';
import realOffersApi, { Offer } from '@/services/realOffersApi';
import { useAuth } from '@/contexts/AuthContext';
import logger from '@/utils/logger';

const { width: screenWidth } = Dimensions.get('window');

export default function OfferDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { state: authState } = useAuth();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [isAlreadyRedeemed, setIsAlreadyRedeemed] = useState(false);
  const [existingVoucherCode, setExistingVoucherCode] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadOfferDetails(id as string);
  }, [id, authState.isAuthenticated]);

  const loadOfferDetails = async (offerId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Track offer view
      await realOffersApi.trackOfferView(offerId);

      const response = await realOffersApi.getOfferById(offerId);

      if (response.success && response.data) {
        setOffer(response.data);
        setIsLiked(response.data.engagement?.isLikedByUser || false);
        
        // Reset image error state when loading new offer
        setImageError(false);
        
        // Check if already redeemed
        if (authState.isAuthenticated) {
          checkRedemptionStatus(offerId);
        }
      } else {
        setError(response.message || 'Failed to load offer details');
      }
    } catch (error) {
      logger.error('Error loading offer details:', error);
      setError('Failed to load offer details');
    } finally {
      setIsLoading(false);
    }
  };

  const checkRedemptionStatus = async (offerId: string) => {
    try {
      logger.log('🔍 [REDEMPTION CHECK] Checking status for offer:', offerId);
      const response = await realOffersApi.getUserRedemptions({ page: 1, limit: 50 });
      logger.log('📥 [REDEMPTION CHECK] API Response:', response);
      
      if (response.success && response.data) {
        // Handle both direct array and paginated response
        const redemptionsArray = response.data.data || response.data || [];
        logger.log('📋 [REDEMPTION CHECK] Redemptions found:', redemptionsArray.length);
        logger.log('📋 [REDEMPTION CHECK] All redemptions:', redemptionsArray.map((r: any) => ({
          offerId: r.offer?._id || r.offer?.id || r.offer,
          status: r.status,
          code: r.redemptionCode
        })));
        
        // Check for active or pending redemptions
        const redemption = redemptionsArray.find((r: any) => {
          const rOfferId = r.offer?._id || r.offer?.id || r.offer;
          const currentOfferId = offerId;
          
          // Normalize both IDs to strings for comparison
          const rOfferIdStr = String(rOfferId).replace(/['"]/g, '');
          const currentOfferIdStr = String(currentOfferId).replace(/['"]/g, '');
          
          const offerMatch = rOfferIdStr === currentOfferIdStr;
          const statusMatch = r.status === 'active' || r.status === 'pending';
          
          logger.log('🔎 [REDEMPTION CHECK] Comparing:', {
            rOfferId: rOfferIdStr,
            currentOfferId: currentOfferIdStr,
            match: offerMatch,
            status: r.status,
            statusMatch,
            finalMatch: offerMatch && statusMatch
          });
          
          return offerMatch && statusMatch;
        });
        
        if (redemption) {
          setIsAlreadyRedeemed(true);
          const code = (redemption as any).redemptionCode || 'Check My Vouchers';
          setExistingVoucherCode(code);
          logger.log('✅ [REDEMPTION CHECK] User already redeemed this offer!', {
            code,
            redemptionId: redemption._id,
            status: redemption.status
          });
        } else {
          // Make sure to reset if no active redemption found
          setIsAlreadyRedeemed(false);
          setExistingVoucherCode('');
          logger.log('ℹ️ [REDEMPTION CHECK] No active redemption found for offer:', offerId);
        }
      } else {
        logger.log('⚠️ [REDEMPTION CHECK] API response unsuccessful:', response);
        setIsAlreadyRedeemed(false);
      }
    } catch (error) {
      logger.error('❌ [REDEMPTION CHECK] Error checking redemption status:', error);
      setIsAlreadyRedeemed(false);
    }
  };

  const handleRedeem = async () => {
    logger.log('🎟️ [REDEEM] Button clicked');
    
    if (!authState.isAuthenticated) {
      logger.log('⚠️ [REDEEM] User not authenticated');
      Alert.alert(
        'Authentication Required',
        'Please sign in to redeem this offer',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/sign-in') }
        ]
      );
      return;
    }

    if (!offer) {
      logger.log('❌ [REDEEM] No offer data');
      return;
    }

    logger.log('✅ [REDEEM] Showing confirmation dialog');
    setShowRedeemModal(true);
  };

  const confirmRedeem = async () => {
    try {
      setShowRedeemModal(false);
      setIsRedeeming(true);
      logger.log('📡 [REDEEM] Calling API for offer:', offer?._id);

      const response = await realOffersApi.redeemOffer(offer!._id);
      logger.log('📥 [REDEEM] API Response:', response);

      if (response.success && response.data) {
        const code = response.data.voucher?.voucherCode || 'Check My Vouchers';
        logger.log('✅ [REDEEM] Success! Voucher code:', code);
        
        setVoucherCode(code);
        
        // Mark as redeemed and store the code
        setIsAlreadyRedeemed(true);
        setExistingVoucherCode(code);
        
        // Re-check redemption status to ensure it's saved
        if (offer?._id) {
          await checkRedemptionStatus(offer._id);
        }
        
        setShowSuccessModal(true);
      } else {
        const errorMessage = response.message || response.error || 'Failed to redeem offer';
        logger.log('❌ [REDEEM] API returned error:', errorMessage);
        Alert.alert('Unable to Redeem', errorMessage);
      }
    } catch (error: any) {
      logger.error('❌ [REDEEM] Error:', error);
      Alert.alert('Error', error.message || 'Failed to redeem offer');
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleLike = async () => {
    if (!offer) return;

    try {
      const response = await realOffersApi.toggleOfferLike(offer._id);
      
      if (response.success && response.data) {
        setIsLiked(response.data.isLiked);
        setOffer(prev => prev ? {
          ...prev,
          engagement: {
            ...prev.engagement,
            likesCount: response.data!.likesCount,
            isLikedByUser: response.data!.isLiked
          }
        } : null);
      }
    } catch (error) {
      logger.error('Error toggling like:', error);
    }
  };

  const handleShare = async () => {
    if (!offer) return;

    try {
      await realOffersApi.shareOffer(offer._id);
      
      await Share.share({
        message: `Check out this amazing offer!\n\n${offer.title}\n\nGet ${offer.cashbackPercentage}% cashback!`,
        title: offer.title,
      });
    } catch (error) {
      logger.error('Error sharing offer:', error);
    }
  };

  const handleStorePress = () => {
    if (offer?.store?.id) {
      router.push(`/MainStorePage?storeId=${offer.store.id}` as any);
    }
  };

  const formatDate = (date: string | Date) => {
    try {
      const dateObj = new Date(date);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - dateObj.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'today';
      } else if (diffDays === 1) {
        return 'yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? 's' : ''} ago`;
      } else {
        const years = Math.floor(diffDays / 365);
        return `${years} year${years > 1 ? 's' : ''} ago`;
      }
    } catch {
      return new Date(date).toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="#333" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <ThemedText style={styles.loadingText}>Loading offer...</ThemedText>
        </View>
      </View>
    );
  }

  if (error || !offer) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="#333" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <ThemedText style={styles.errorText}>{error || 'Offer not found'}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadOfferDetails(id as string)}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isExpired = new Date(offer.validity.endDate) < new Date();
  const daysRemaining = Math.ceil((new Date(offer.validity.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Minimal Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleLike} style={styles.headerButton}>
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={26} 
                color={isLiked ? "#EF4444" : "#333"} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Ionicons name="share-social-outline" size={26} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        bounces={true}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical={false}
      >
        {/* Offer Image */}
        <View style={styles.imageContainer}>
          {imageError || !offer.image ? (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={64} color="#ccc" />
              <ThemedText style={styles.placeholderText}>Offer Image</ThemedText>
            </View>
          ) : (
            <Image
              source={{ uri: offer.image }}
              style={styles.offerImage}
              resizeMode="cover"
              onError={() => {
                logger.log('❌ [IMAGE] Failed to load image:', offer.image);
                setImageError(true);
              }}
              onLoad={() => {
                logger.log('✅ [IMAGE] Image loaded successfully:', offer.image);
                setImageError(false);
              }}
            />
          )}
          {offer.metadata?.flashSale?.isActive && (
            <View style={styles.flashSaleBadge}>
              <Ionicons name="flash" size={16} color="white" />
              <ThemedText style={styles.flashSaleText}>FLASH SALE</ThemedText>
            </View>
          )}
          {offer.metadata?.featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={16} color="white" />
              <ThemedText style={styles.featuredText}>FEATURED</ThemedText>
            </View>
          )}
        </View>

        {/* Offer Info */}
        <View style={styles.infoSection}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <ThemedText style={styles.categoryText}>{offer.category.toUpperCase()}</ThemedText>
          </View>

          {/* Title */}
          <ThemedText style={styles.title}>{offer.title}</ThemedText>
          
          {/* Subtitle */}
          {offer.subtitle && (
            <ThemedText style={styles.subtitle}>{offer.subtitle}</ThemedText>
          )}

          {/* Cashback Banner */}
          <LinearGradient
            colors={['#8B5CF6', '#A855F7']}
            style={styles.cashbackBanner}
          >
            <Ionicons name="gift-outline" size={32} color="white" />
            <View style={styles.cashbackInfo}>
              <ThemedText style={styles.cashbackLabel}>GET CASHBACK</ThemedText>
              <ThemedText style={styles.cashbackPercentage}>{offer.cashbackPercentage}%</ThemedText>
            </View>
          </LinearGradient>

          {/* Store Info */}
          <TouchableOpacity style={styles.storeCard} onPress={handleStorePress}>
            <View style={styles.storeLogoContainer}>
              {offer.store?.logo ? (
                <Image source={{ uri: offer.store.logo }} style={styles.storeLogo} />
              ) : (
                <View style={[styles.storeLogo, styles.storeLogoPlaceholder]}>
                  <Ionicons name="storefront-outline" size={24} color="#8B5CF6" />
                </View>
              )}
            </View>
            <View style={styles.storeInfo}>
              <ThemedText style={styles.storeName}>{offer.store.name}</ThemedText>
              {offer.store.rating && (
                <View style={styles.storeRating}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <ThemedText style={styles.ratingText}>{offer.store.rating.toFixed(1)}</ThemedText>
                </View>
              )}
            </View>
            {offer.store.verified && (
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            )}
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          {/* Distance */}
          {offer.distance !== undefined && (
            <View style={styles.distanceCard}>
              <Ionicons name="location" size={20} color="#8B5CF6" />
              <ThemedText style={styles.distanceText}>
                {offer.distance.toFixed(1)} km away from you
              </ThemedText>
            </View>
          )}

          {/* Validity */}
          <View style={styles.validitySection}>
            <View style={styles.validityHeader}>
              <Ionicons name="time-outline" size={20} color={isExpired ? "#EF4444" : "#10B981"} />
              <ThemedText style={styles.validityTitle}>Validity</ThemedText>
            </View>
            <View style={styles.validityInfo}>
              <ThemedText style={styles.validityDate}>
                Valid until: {new Date(offer.validity.endDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </ThemedText>
              {!isExpired && daysRemaining > 0 && (
                <View style={[styles.daysRemainingBadge, daysRemaining <= 7 && styles.daysRemainingUrgent]}>
                  <ThemedText style={styles.daysRemainingText}>
                    {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                  </ThemedText>
                </View>
              )}
              {isExpired && (
                <View style={styles.expiredBadge}>
                  <ThemedText style={styles.expiredText}>EXPIRED</ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          {offer.description && (
            <View style={styles.descriptionSection}>
              <ThemedText style={styles.sectionTitle}>Description</ThemedText>
              <ThemedText style={styles.description}>{offer.description}</ThemedText>
            </View>
          )}

          {/* Terms & Conditions */}
          {offer.restrictions && (
            <View style={styles.restrictionsSection}>
              <ThemedText style={styles.sectionTitle}>Terms & Conditions</ThemedText>
              {offer.restrictions.minOrderValue && (
                <View style={styles.restrictionItem}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#8B5CF6" />
                  <ThemedText style={styles.restrictionText}>
                    Minimum order value: ₹{offer.restrictions.minOrderValue}
                  </ThemedText>
                </View>
              )}
              {offer.restrictions.maxDiscountAmount && (
                <View style={styles.restrictionItem}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#8B5CF6" />
                  <ThemedText style={styles.restrictionText}>
                    Maximum discount: ₹{offer.restrictions.maxDiscountAmount}
                  </ThemedText>
                </View>
              )}
              {(offer.restrictions as any).usageLimitPerUser && (
                <View style={styles.restrictionItem}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#8B5CF6" />
                  <ThemedText style={styles.restrictionText}>
                    Can be used {(offer.restrictions as any).usageLimitPerUser} time{(offer.restrictions as any).usageLimitPerUser > 1 ? 's' : ''} per user
                  </ThemedText>
                </View>
              )}
              {offer.restrictions.userTypeRestriction && offer.restrictions.userTypeRestriction !== 'all' && (
                <View style={styles.restrictionItem}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#8B5CF6" />
                  <ThemedText style={styles.restrictionText}>
                    Only for {offer.restrictions.userTypeRestriction} users
                  </ThemedText>
                </View>
              )}
            </View>
          )}

          {/* Engagement Stats */}
          <View style={styles.engagementSection}>
            <View style={styles.engagementItem}>
              <Ionicons name="heart" size={20} color="#EF4444" />
              <ThemedText style={styles.engagementText}>{offer.engagement.likesCount} likes</ThemedText>
            </View>
            <View style={styles.engagementItem}>
              <Ionicons name="share-social" size={20} color="#8B5CF6" />
              <ThemedText style={styles.engagementText}>{offer.engagement.sharesCount} shares</ThemedText>
            </View>
            <View style={styles.engagementItem}>
              <Ionicons name="eye" size={20} color="#666" />
              <ThemedText style={styles.engagementText}>{offer.engagement.viewsCount} views</ThemedText>
            </View>
          </View>
        </View>
        
        {/* Extra spacing at bottom */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Action Button */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        {isAlreadyRedeemed ? (
          <View style={styles.redeemedContainer}>
            <View style={styles.redeemedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <ThemedText style={styles.redeemedText}>Already Redeemed</ThemedText>
            </View>
            <ThemedText style={styles.voucherCodeSmall}>Code: {existingVoucherCode}</ThemedText>
            <TouchableOpacity 
              style={styles.viewVouchersButton}
              onPress={() => router.push('/my-vouchers')}
            >
              <ThemedText style={styles.viewVouchersButtonText}>View My Vouchers</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.redeemButton, (isExpired || isRedeeming) && styles.redeemButtonDisabled]}
            onPress={handleRedeem}
            disabled={isExpired || isRedeeming}
          >
            {isRedeeming ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="ticket-outline" size={24} color="white" />
                <ThemedText style={styles.redeemButtonText}>
                  {isExpired ? 'Offer Expired' : 'Redeem Offer'}
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* Redeem Confirmation Modal */}
      <Modal
        visible={showRedeemModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRedeemModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="ticket" size={48} color="#8B5CF6" />
            <ThemedText style={styles.modalTitle}>Redeem Offer</ThemedText>
            <ThemedText style={styles.modalMessage}>
              Do you want to redeem this offer?{'\n\n'}
              <ThemedText style={styles.modalOfferTitle}>{offer?.title}</ThemedText>{'\n\n'}
              Cashback: {offer?.cashbackPercentage}%
            </ThemedText>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowRedeemModal(false)}
              >
                <ThemedText style={styles.modalButtonTextCancel}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmRedeem}
              >
                <ThemedText style={styles.modalButtonTextConfirm}>Redeem</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
            </View>
            <ThemedText style={styles.modalTitle}>Success!</ThemedText>
            <ThemedText style={styles.modalMessage}>
              Offer redeemed successfully!
            </ThemedText>
            <View style={styles.voucherCodeContainer}>
              <ThemedText style={styles.voucherCodeLabel}>Voucher Code:</ThemedText>
              <TouchableOpacity 
                style={styles.voucherCodeBox}
                onPress={async () => {
                  await Clipboard.setStringAsync(voucherCode);
                  Alert.alert('✅ Copied!', 'Voucher code copied to clipboard');
                }}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.voucherCode}>{voucherCode}</ThemedText>
                <Ionicons name="copy-outline" size={20} color="#8B5CF6" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.voucherHint}>
              👆 Tap code to copy • Use during checkout
            </ThemedText>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowSuccessModal(false)}
              >
                <ThemedText style={styles.modalButtonTextCancel}>Close</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={() => {
                  setShowSuccessModal(false);
                  router.push('/my-vouchers');
                }}
              >
                <ThemedText style={styles.modalButtonTextConfirm}>View Vouchers</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'flex-start',
  },
  safeArea: {
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 20, // Small padding for scroll content
    flexGrow: 1,
  },
  bottomSpacing: {
    height: 200, // Space to ensure content is visible above bottom bar (accounts for absolute positioned bottomBar + tab nav)
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  offerImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: '#999',
    fontSize: 14,
  },
  flashSaleBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  flashSaleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  featuredText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '700',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 20,
    gap: 16,
  },
  categoryBadge: {
    backgroundColor: '#F3E8FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: -8,
  },
  cashbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  cashbackInfo: {
    flex: 1,
  },
  cashbackLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
  },
  cashbackPercentage: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700',
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    gap: 12,
  },
  storeLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  storeLogo: {
    width: 48,
    height: 48,
  },
  storeLogoPlaceholder: {
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: {
    flex: 1,
    gap: 4,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  storeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  distanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    gap: 8,
  },
  distanceText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  validitySection: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    gap: 12,
  },
  validityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  validityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  validityInfo: {
    gap: 8,
  },
  validityDate: {
    fontSize: 14,
    color: '#666',
  },
  daysRemainingBadge: {
    backgroundColor: '#10B981',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  daysRemainingUrgent: {
    backgroundColor: '#F59E0B',
  },
  daysRemainingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  expiredBadge: {
    backgroundColor: '#EF4444',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  expiredText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  restrictionsSection: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    gap: 12,
  },
  restrictionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  restrictionText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  engagementSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  engagementText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    paddingBottom: 90, // Extra padding to account for bottom navigation tab bar (60px tab + 30px safe area)
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  redeemButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  redeemButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  redeemButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  redeemedContainer: {
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  redeemedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  redeemedText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  voucherCodeSmall: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  viewVouchersButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  viewVouchersButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalOfferTitle: {
    fontWeight: '600',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonConfirm: {
    backgroundColor: '#8B5CF6',
  },
  modalButtonTextCancel: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  successIcon: {
    marginBottom: 8,
  },
  voucherCodeContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 16,
  },
  voucherCodeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  voucherCodeBox: {
    backgroundColor: '#F3E8FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voucherCode: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CF6',
    textAlign: 'center',
    letterSpacing: 2,
  },
  voucherHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
});

