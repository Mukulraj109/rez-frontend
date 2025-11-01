import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  ActivityIndicator,
  Animated,
  Share as RNShare,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Brand } from '@/types/voucher.types';
import realVouchersApi from '@/services/realVouchersApi';
import PurchaseModal from '@/components/voucher/PurchaseModal';

const { width } = Dimensions.get('window');

export default function BrandDetailPage() {
  const router = useRouter();
  const { brandId } = useLocalSearchParams();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [denominations, setDenominations] = useState<number[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    let isMounted = true;

    if (brand) {
      const animation = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]);

      if (isMounted) {
        animation.start();
      }

      return () => {
        isMounted = false;
        animation.stop(); // Stop animation on unmount
      };
    }
  }, [brand]);

  useEffect(() => {
    loadBrandDetails();
  }, [brandId]);

  const loadBrandDetails = async () => {
    try {
      setLoading(true);
      
      // PRODUCTION: Use real API
      const brandRes = await realVouchersApi.getVoucherBrandById(brandId as string);
      
      if (!brandRes.success || !brandRes.data) {
        console.error('❌ [BRAND DETAIL] Failed to load brand:', brandRes);
        return;
      }

      // Transform backend data to match frontend types
      const brandData: Brand = {
        id: brandRes.data._id,
        name: brandRes.data.name,
        logo: brandRes.data.logo,
        backgroundColor: brandRes.data.backgroundColor || '#F3F4F6',
        logoColor: brandRes.data.logoColor,
        cashbackRate: brandRes.data.cashbackRate || 0,
        rating: brandRes.data.rating || 0,
        reviewCount: brandRes.data.ratingCount ? `${(brandRes.data.ratingCount / 1000).toFixed(1)}k+ users` : '0 users',
        description: brandRes.data.description || '',
        categories: [brandRes.data.category || ''],
        featured: brandRes.data.isFeatured || false,
        newlyAdded: brandRes.data.isNewlyAdded || false,
        offers: [],
      };

      // Set denominations for purchase
      setDenominations(brandRes.data.denominations || [100, 500, 1000, 2000]);

      setBrand(brandData);
    } catch (error) {
      console.error('❌ [BRAND DETAIL] Error loading brand details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!brand) return;

    try {
      const shareMessage = `Check out ${brand.name} - Get up to ${brand.cashbackRate}% cashback! Download REZ app to purchase vouchers.`;

      if (Platform.OS === 'web') {
        // Web sharing
        if (navigator.share) {
          await navigator.share({
            title: brand.name,
            text: shareMessage,
          });
        } else {
          // Fallback: Copy to clipboard for browsers without share API
          await Clipboard.setStringAsync(shareMessage);
          alert('Link copied to clipboard! Share it with your friends.');
        }
      } else {
        // Mobile sharing
        await RNShare.share({
          message: shareMessage,
          title: brand.name,
        });
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleFavorite = () => {
    // TODO: Implement wishlist functionality
    console.log('Add to wishlist');
  };

  const handlePurchaseSuccess = () => {
    // Refresh brand data or navigate to My Vouchers
    console.log('Purchase successful!');
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#8B5CF6', '#A855F7', '#EC4899']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        
        <ThemedText style={styles.headerTitle} numberOfLines={1}>
          {brand?.name || 'Brand'}
        </ThemedText>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={22} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={handleFavorite}
            activeOpacity={0.7}
          >
            <Ionicons name="heart-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderBrandIllustration = () => (
    <Animated.View 
      style={[
        styles.illustrationContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.brandLogoContainer}>
        <LinearGradient
          colors={[
            brand?.backgroundColor || '#F3F4F6',
            (brand?.backgroundColor || '#F3F4F6') + 'DD',
          ]}
          style={[styles.brandLogo, { backgroundColor: brand?.backgroundColor || '#F3F4F6' }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ThemedText style={[styles.brandLogoText, { color: brand?.logoColor || '#000' }]}>
            {brand?.logo}
          </ThemedText>
        </LinearGradient>
        <ThemedText style={styles.brandName}>{brand?.name}</ThemedText>
        {brand?.featured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <ThemedText style={styles.featuredText}>Featured</ThemedText>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderStats = () => (
    <Animated.View 
      style={[
        styles.statsContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.statCard}>
        <View style={styles.statRow}>
          <View style={styles.statIconContainer}>
            <Ionicons name="star" size={20} color="#F59E0B" />
          </View>
          <View style={styles.statContent}>
            <ThemedText style={styles.statValue}>
              {brand?.rating ? `${brand.rating.toFixed(1)}%` : '95%'} Positive rating
            </ThemedText>
            <ThemedText style={styles.statSubtext}>
              by {brand?.reviewCount || '7.8k+ users'}
            </ThemedText>
          </View>
        </View>
      </View>
      
      <View style={styles.statCard}>
        <View style={styles.statRow}>
          <View style={styles.statIconContainer}>
            <Ionicons name="trophy" size={20} color="#9333EA" />
          </View>
          <View style={styles.statContent}>
            <ThemedText style={styles.statValue}>
              {brand?.rewardCount || '55 lakh+ Rewards'}
            </ThemedText>
            <ThemedText style={styles.statSubtext}>
              given in last month
            </ThemedText>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderOfferDetails = () => (
    <Animated.View 
      style={[
        styles.offerSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      {brand?.bigSavingDays && (
        <View style={styles.offerCard}>
          <View style={styles.offerHeader}>
            <Ionicons name="flame" size={20} color="#F97316" />
            <ThemedText style={styles.offerTitle}>{brand.bigSavingDays.title}</ThemedText>
          </View>
          <ThemedText style={styles.offerDescription}>{brand.bigSavingDays.description}</ThemedText>
          {brand.extraOffers?.map((offer, index) => (
            <View key={index} style={styles.extraOfferRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <ThemedText style={styles.extraOffer}>{offer}</ThemedText>
            </View>
          ))}
        </View>
      )}
      
      {brand?.wasilRewards && (
        <LinearGradient
          colors={['#FEF3C7', '#FDE68A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.wasilRewardsCard}
        >
          <View style={styles.wasilRewardsContent}>
            <Ionicons name="gift" size={24} color="#F59E0B" />
            <ThemedText style={styles.wasilRewardsText}>
              + Up to {brand.wasilRewards.percentage}% REZ Rewards
            </ThemedText>
          </View>
        </LinearGradient>
      )}
      
      <View style={styles.instructionCard}>
        <View style={styles.instructionHeader}>
          <Ionicons name="information-circle" size={18} color="#9333EA" />
          <ThemedText style={styles.instructionTitle}>Important Notice</ThemedText>
        </View>
        <ThemedText style={styles.instructionText}>
          Add products to your cart/Wishlist or save for later only after going via REZ
        </ThemedText>
      </View>
    </Animated.View>
  );

  const renderActionButton = () => (
    <Animated.View 
      style={[
        styles.actionSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <TouchableOpacity
        style={styles.rewardButton}
        activeOpacity={0.9}
        onPress={() => setShowPurchaseModal(true)}
      >
        <LinearGradient
          colors={['#8B5CF6', '#A855F7', '#EC4899']}
          style={styles.rewardButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.rewardButtonContent}>
            <Ionicons name="cash" size={24} color="white" />
            <ThemedText style={styles.rewardButtonText}>
              Earn up to {brand?.cashbackRate || 7}% Reward
            </ThemedText>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderBottomTabs = () => (
    <Animated.View 
      style={[
        styles.bottomSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      {/* Timeline */}
      <View style={styles.timelineContainer}>
        <View style={styles.timelineItem}>
          <View style={styles.timelineIconWrapper}>
            <LinearGradient
              colors={['#8B5CF6', '#A855F7']}
              style={styles.timelineIcon}
            >
              <Ionicons name="cart" size={16} color="white" />
            </LinearGradient>
          </View>
          <View style={styles.timelineContent}>
            <ThemedText style={styles.timelineTitle}>Purchase</ThemedText>
            <ThemedText style={styles.timelineSubtitle}>Today</ThemedText>
          </View>
        </View>
        
        <View style={styles.timelineLine}>
          <View style={styles.timelineDashedLineContainer}>
            <View style={styles.dash} />
            <View style={styles.dash} />
            <View style={styles.dash} />
            <View style={styles.dash} />
            <View style={styles.dash} />
          </View>
        </View>
        
        <View style={styles.timelineItem}>
          <View style={styles.timelineIconWrapper}>
            <LinearGradient
              colors={['#8B5CF6', '#A855F7']}
              style={styles.timelineIcon}
            >
              <Ionicons name="gift" size={16} color="white" />
            </LinearGradient>
          </View>
          <View style={styles.timelineContent}>
            <ThemedText style={styles.timelineTitle}>Reward Track</ThemedText>
            <ThemedText style={styles.timelineSubtitle}>in 30 min</ThemedText>
            <ThemedText style={styles.timelineSubtitle}>Today</ThemedText>
          </View>
        </View>
      </View>
      
      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.bottomButton}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#8B5CF6', '#A855F7']}
            style={styles.bottomButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="pricetag" size={18} color="white" />
            <ThemedText style={styles.bottomButtonText}>Rewards Rates</ThemedText>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomButton}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#8B5CF6', '#A855F7']}
            style={styles.bottomButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="document-text" size={18} color="white" />
            <ThemedText style={styles.bottomButtonText}>Offer Terms</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        {renderHeader()}
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#9333EA" />
          <ThemedText style={styles.loadingText}>Loading brand details...</ThemedText>
        </View>
      </View>
    );
  }

  if (!brand) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        {renderHeader()}
        <View style={styles.errorContent}>
          <ThemedText style={styles.errorText}>Brand not found</ThemedText>
          <TouchableOpacity 
            style={styles.backToVouchersButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backToVouchersText}>Back to Vouchers</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      {renderHeader()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderBrandIllustration()}
        {renderStats()}
        {renderOfferDetails()}
        {renderActionButton()}
        {renderBottomTabs()}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Purchase Modal */}
      <PurchaseModal
        visible={showPurchaseModal}
        brand={brand ? {
          id: brand.id,
          name: brand.name,
          logo: brand.logo,
          backgroundColor: brand.backgroundColor,
          logoColor: brand.logoColor,
          cashbackRate: brand.cashbackRate,
          description: brand.description,
        } : null}
        denominations={denominations}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={handlePurchaseSuccess}
      />
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  
  // Header Styles
  header: {
    paddingTop: Platform.OS === 'android' ? 45 : 55,
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.3,
    paddingHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerActionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  
  // Content
  content: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  
  // Illustration
  illustrationContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  illustrationBackground: {
    width: width * 0.8,
    height: 160,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  illustration: {
    fontSize: 48,
  },
  brandLogoContainer: {
    alignItems: 'center',
    gap: 12,
  },
  brandLogo: {
    width: 88,
    height: 88,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  brandLogoText: {
    fontSize: 40,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginTop: 4,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Stats
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.06)',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statItem: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  
  // Offers
  offerSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
    gap: 16,
  },
  offerCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.06)',
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  offerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  offerDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 12,
  },
  extraOfferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  extraOffer: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
    lineHeight: 22,
  },
  wasilRewardsCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  wasilRewardsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  wasilRewardsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: -0.3,
  },
  instructionCard: {
    backgroundColor: '#F3F0FF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9333EA',
    letterSpacing: -0.2,
  },
  instructionText: {
    fontSize: 14,
    color: '#7C3AED',
    lineHeight: 20,
    fontWeight: '500',
  },
  
  // Action Button
  actionSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 12,
  },
  rewardButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  rewardButtonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.3,
  },
  
  // Bottom Section
  bottomSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 32,
    paddingTop: 8,
  },
  timelineItem: {
    alignItems: 'center',
    flex: 1,
  },
  timelineIconWrapper: {
    marginBottom: 12,
  },
  timelineIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  purpleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9333EA',
  },
  timelineContent: {
    alignItems: 'center',
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  timelineSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  timelineLine: {
    width: 80,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDashedLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '100%',
    justifyContent: 'center',
  },
  dash: {
    width: 8,
    height: 2,
    backgroundColor: '#9333EA',
    borderRadius: 1,
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  bottomButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  bottomButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    letterSpacing: -0.2,
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#8B5CF6',
    marginTop: 16,
  },
  
  // Error State
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  backToVouchersButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  backToVouchersText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  
  // Bottom Space
  bottomSpace: {
    height: 40,
  },
});