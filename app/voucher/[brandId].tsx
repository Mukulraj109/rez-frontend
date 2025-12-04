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
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Brand } from '@/types/voucher.types';
import realVouchersApi from '@/services/realVouchersApi';
import PurchaseModal from '@/components/voucher/PurchaseModal';

const { width, height } = Dimensions.get('window');

// ReZ Premium Color System from TASK.md
const COLORS = {
  // Primary
  primary: '#00C06A',
  primaryDark: '#00796B',
  primaryLight: 'rgba(0, 192, 106, 0.1)',
  primaryGlow: 'rgba(0, 192, 106, 0.3)',

  // Gold (rewards)
  gold: '#FFC857',
  goldDark: '#FF9F1C',
  goldLight: 'rgba(255, 200, 87, 0.15)',
  goldGlow: 'rgba(255, 200, 87, 0.3)',

  // Navy (text)
  navy: '#0B2240',
  slate: '#1F2D3D',
  muted: '#9AA7B2',

  // Surface
  surface: '#F7FAFC',
  white: '#FFFFFF',

  // Glass
  glassWhite: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.4)',
  glassHighlight: 'rgba(255, 255, 255, 0.6)',

  // Status
  error: '#EF4444',
  star: '#F59E0B',
  info: '#3B82F6',
};

export default function BrandDetailPage() {
  const router = useRouter();
  const { brandId } = useLocalSearchParams();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [denominations, setDenominations] = useState<number[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;

    if (brand) {
      const animation = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]);

      // Pulse animation for CTA
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );

      if (isMounted) {
        animation.start();
        pulse.start();
      }

      return () => {
        isMounted = false;
        animation.stop();
        pulse.stop();
      };
    }
  }, [brand]);

  useEffect(() => {
    loadBrandDetails();
  }, [brandId]);

  const loadBrandDetails = async () => {
    try {
      setLoading(true);
      const brandRes = await realVouchersApi.getVoucherBrandById(brandId as string);

      if (!brandRes.success || !brandRes.data) {
        return;
      }

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

      setDenominations(brandRes.data.denominations || [100, 500, 1000, 2000]);
      setBrand(brandData);
    } catch (error) {
      console.error('Error loading brand details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!brand) return;

    try {
      const shareMessage = `Check out ${brand.name} - Get up to ${brand.cashbackRate}% cashback! Download ReZ app to save smarter.`;

      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ title: brand.name, text: shareMessage });
        } else {
          await Clipboard.setStringAsync(shareMessage);
          alert('Link copied to clipboard!');
        }
      } else {
        await RNShare.share({ message: shareMessage, title: brand.name });
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handlePurchaseSuccess = () => {
    console.log('Purchase successful!');
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark, '#00695C']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Decorative elements */}
      <View style={styles.headerOrb1} />
      <View style={styles.headerOrb2} />
      <View style={styles.headerGlassOverlay} />

      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.glassButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>

        <ThemedText style={styles.headerTitle} numberOfLines={1}>
          {brand?.name || 'Brand'}
        </ThemedText>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.glassButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons name="share-outline" size={20} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.glassButton, isFavorite && styles.favoriteActive]}
            onPress={handleFavorite}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? "#FF6B6B" : COLORS.white}
            />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderBrandHero = () => (
    <Animated.View
      style={[
        styles.heroSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }
      ]}
    >
      {/* Logo with glow effect */}
      <View style={styles.logoWrapper}>
        <View style={styles.logoGlow} />
        <LinearGradient
          colors={[brand?.backgroundColor || '#F3F4F6', (brand?.backgroundColor || '#F3F4F6') + 'CC']}
          style={styles.brandLogo}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.logoShine} />
          <ThemedText style={[styles.brandLogoText, { color: brand?.logoColor || COLORS.navy }]}>
            {brand?.logo}
          </ThemedText>
        </LinearGradient>
      </View>

      <ThemedText style={styles.brandName}>{brand?.name}</ThemedText>

      {brand?.featured && (
        <View style={styles.featuredBadge}>
          <LinearGradient
            colors={[COLORS.gold, COLORS.goldDark]}
            style={styles.featuredGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="star" size={12} color={COLORS.navy} />
            <ThemedText style={styles.featuredText}>Featured Brand</ThemedText>
          </LinearGradient>
        </View>
      )}
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
      {/* Rating Card */}
      <View style={[
        styles.statCard,
        Platform.OS === 'web' && { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }
      ]}>
        <View style={styles.cardShine} />
        <View style={styles.statRow}>
          <View style={[styles.statIconContainer, { backgroundColor: COLORS.goldLight }]}>
            <Ionicons name="star" size={20} color={COLORS.gold} />
          </View>
          <View style={styles.statContent}>
            <ThemedText style={styles.statValue}>
              {brand?.rating ? `${brand.rating.toFixed(1)}%` : '95%'} Positive rating
            </ThemedText>
            <ThemedText style={styles.statSubtext}>
              by {brand?.reviewCount || '8.8k+ users'}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Rewards Card */}
      <View style={[
        styles.statCard,
        Platform.OS === 'web' && { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }
      ]}>
        <View style={styles.cardShine} />
        <View style={styles.statRow}>
          <View style={[styles.statIconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
            <Ionicons name="trophy" size={20} color="#8B5CF6" />
          </View>
          <View style={styles.statContent}>
            <ThemedText style={styles.statValue}>
              55 lakh+ Rewards
            </ThemedText>
            <ThemedText style={styles.statSubtext}>
              given in last month
            </ThemedText>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderNoticeCard = () => (
    <Animated.View
      style={[
        styles.noticeSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={[
        styles.noticeCard,
        Platform.OS === 'web' && { boxShadow: '0 4px 20px rgba(0, 192, 106, 0.1)' }
      ]}>
        <LinearGradient
          colors={[COLORS.primaryLight, 'rgba(0, 192, 106, 0.05)']}
          style={styles.noticeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.noticeHeader}>
            <View style={styles.noticeIconContainer}>
              <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            </View>
            <ThemedText style={styles.noticeTitle}>Important Notice</ThemedText>
          </View>
          <ThemedText style={styles.noticeText}>
            Add products to your cart/Wishlist or save for later only after going via REZ
          </ThemedText>
        </LinearGradient>
      </View>
    </Animated.View>
  );

  const renderActionButton = () => (
    <Animated.View
      style={[
        styles.actionSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: pulseAnim }],
        }
      ]}
    >
      <TouchableOpacity
        style={styles.rewardButton}
        activeOpacity={0.9}
        onPress={() => setShowPurchaseModal(true)}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.rewardButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {/* Button shine effect */}
          <View style={styles.buttonShine} />

          <View style={styles.rewardButtonContent}>
            <View style={styles.rewardIconContainer}>
              <Ionicons name="gift" size={22} color={COLORS.white} />
            </View>
            <ThemedText style={styles.rewardButtonText}>
              Earn up to {brand?.cashbackRate || 12}% Reward
            </ThemedText>
            <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderTimeline = () => (
    <Animated.View
      style={[
        styles.timelineSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <ThemedText style={styles.timelineSectionTitle}>How it works</ThemedText>

      <View style={styles.timelineContainer}>
        {/* Step 1 */}
        <View style={styles.timelineStep}>
          <View style={styles.timelineStepNumber}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.stepNumberGradient}
            >
              <ThemedText style={styles.stepNumber}>1</ThemedText>
            </LinearGradient>
          </View>
          <View style={styles.timelineStepContent}>
            <ThemedText style={styles.timelineStepTitle}>Purchase Voucher</ThemedText>
            <ThemedText style={styles.timelineStepSubtitle}>Select amount & pay</ThemedText>
          </View>
        </View>

        <View style={styles.timelineConnector}>
          <View style={styles.connectorDash} />
          <View style={styles.connectorDash} />
          <View style={styles.connectorDash} />
        </View>

        {/* Step 2 */}
        <View style={styles.timelineStep}>
          <View style={styles.timelineStepNumber}>
            <LinearGradient
              colors={[COLORS.gold, COLORS.goldDark]}
              style={styles.stepNumberGradient}
            >
              <ThemedText style={styles.stepNumber}>2</ThemedText>
            </LinearGradient>
          </View>
          <View style={styles.timelineStepContent}>
            <ThemedText style={styles.timelineStepTitle}>Get Reward</ThemedText>
            <ThemedText style={styles.timelineStepSubtitle}>Within 30 minutes</ThemedText>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderBottomActions = () => (
    <Animated.View
      style={[
        styles.bottomActions,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <TouchableOpacity style={styles.bottomActionButton} activeOpacity={0.85}>
        <View style={styles.bottomActionInner}>
          <View style={styles.bottomActionIcon}>
            <Ionicons name="pricetag" size={18} color={COLORS.primary} />
          </View>
          <ThemedText style={styles.bottomActionText}>Reward Rates</ThemedText>
          <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.bottomActionButton} activeOpacity={0.85}>
        <View style={styles.bottomActionInner}>
          <View style={styles.bottomActionIcon}>
            <Ionicons name="document-text" size={18} color={COLORS.primary} />
          </View>
          <ThemedText style={styles.bottomActionText}>Offer Terms</ThemedText>
          <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.loadingHeader}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.glassButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={COLORS.white} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Loading...</ThemedText>
            <View style={{ width: 94 }} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContent}>
          <View style={styles.loaderWrapper}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
          <ThemedText style={styles.loadingText}>Fetching brand details...</ThemedText>
        </View>
      </View>
    );
  }

  if (!brand) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        {renderHeader()}
        <View style={styles.errorContent}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={56} color={COLORS.muted} />
          </View>
          <ThemedText style={styles.errorTitle}>Brand not found</ThemedText>
          <ThemedText style={styles.errorText}>
            This brand may have been removed or is temporarily unavailable.
          </ThemedText>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.9}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.backButton}
            >
              <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Premium Background */}
      <LinearGradient
        colors={['#E8F5E9', '#E0F2F1', '#F5F5F5', '#E8F5E9']}
        style={styles.backgroundGradient}
      >
        <View style={styles.bgOrb1} />
        <View style={styles.bgOrb2} />
      </LinearGradient>

      {renderHeader()}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderBrandHero()}
        {renderStats()}
        {renderNoticeCard()}
        {renderActionButton()}
        {renderTimeline()}
        {renderBottomActions()}

        <View style={styles.bottomSpace} />
      </ScrollView>

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
    backgroundColor: COLORS.surface,
  },

  // Background
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgOrb1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primaryGlow,
    top: height * 0.25,
    right: -80,
    opacity: 0.3,
  },
  bgOrb2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.goldGlow,
    bottom: 150,
    left: -50,
    opacity: 0.25,
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerOrb1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    top: -40,
    right: -20,
  },
  headerOrb2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    bottom: -20,
    left: 40,
  },
  headerGlassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  glassButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  favoriteActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginHorizontal: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  logoGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 34,
    backgroundColor: 'rgba(0, 192, 106, 0.15)',
  },
  brandLogo: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  logoShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  brandLogoText: {
    fontSize: 48,
    marginTop: 8,
  },
  brandName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.navy,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  featuredBadge: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.navy,
    letterSpacing: 0.3,
  },

  // Stats
  statsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: COLORS.glassWhite,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ skewY: '-2deg' }],
    marginTop: -15,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  statSubtext: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.muted,
  },

  // Notice
  noticeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  noticeCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.2)',
  },
  noticeGradient: {
    padding: 18,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  noticeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 192, 106, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
    letterSpacing: -0.2,
  },
  noticeText: {
    fontSize: 14,
    color: COLORS.primary,
    lineHeight: 20,
    fontWeight: '500',
  },

  // Action Button
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  rewardButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  rewardButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  buttonShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  rewardButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  rewardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -0.2,
    flex: 1,
  },

  // Timeline
  timelineSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  timelineSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.glassWhite,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  timelineStepNumber: {
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  stepNumberGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
  },
  timelineStepContent: {
    alignItems: 'center',
  },
  timelineStepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 2,
  },
  timelineStepSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '500',
  },
  timelineConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  connectorDash: {
    width: 10,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    opacity: 0.4,
  },

  // Bottom Actions
  bottomActions: {
    paddingHorizontal: 20,
    gap: 12,
  },
  bottomActionButton: {
    backgroundColor: COLORS.glassWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
  },
  bottomActionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  bottomActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomActionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.navy,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  loadingHeader: {
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.glassWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.muted,
    fontWeight: '500',
  },

  // Error
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: COLORS.glassWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Bottom Space
  bottomSpace: {
    height: 60,
  },
});
