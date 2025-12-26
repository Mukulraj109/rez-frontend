// Flash Sale Detail Page
// Dynamic route for individual flash sale (Lightning Deal) details

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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import { BlurView } from 'expo-blur';
import { ThemedText } from '@/components/ThemedText';
import realOffersApi from '@/services/realOffersApi';
import { useAuth } from '@/contexts/AuthContext';
import logger from '@/utils/logger';

const { width: screenWidth } = Dimensions.get('window');

interface FlashSale {
  _id: string;
  title: string;
  description: string;
  image: string;
  banner?: string;
  discountPercentage: number;
  originalPrice?: number;
  flashSalePrice?: number;
  startTime: string;
  endTime: string;
  maxQuantity: number;
  soldQuantity: number;
  limitPerUser: number;
  stores?: Array<{
    _id: string;
    name: string;
    logo?: string;
    location?: any;
  }>;
  promoCode?: string;
  termsAndConditions?: string[];
  minimumPurchase?: number;
  maximumDiscount?: number;
  status: 'scheduled' | 'active' | 'ending_soon' | 'ended' | 'sold_out';
  viewCount: number;
  clickCount: number;
  purchaseCount: number;
}

export default function FlashSaleDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { state: authState } = useAuth();
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];

  // Pulse animation for urgency
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    loadFlashSaleDetails(id as string);
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!flashSale) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const endTime = new Date(flashSale.endTime).getTime();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [flashSale]);

  const loadFlashSaleDetails = async (flashSaleId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await realOffersApi.getFlashSaleById(flashSaleId);

      if (response.success && response.data) {
        setFlashSale(response.data);
        setImageError(false);
      } else {
        setError(response.message || 'Failed to load flash sale details');
      }
    } catch (error) {
      logger.error('Error loading flash sale details:', error);
      setError('Failed to load flash sale details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!flashSale?.promoCode) return;

    await Clipboard.setStringAsync(flashSale.promoCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleGetOffer = async () => {
    if (!authState.isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to get this offer',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/sign-in') }
        ]
      );
      return;
    }

    if (!flashSale) return;

    try {
      setIsProcessingPayment(true);

      // Get current URL for success/cancel redirects
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081';

      // Initiate Stripe checkout
      const response = await realOffersApi.initiateFlashSalePurchase(
        flashSale._id,
        1,
        {
          successUrl: `${baseUrl}/flash-sale-success?purchaseId={purchaseId}`,
          cancelUrl: `${baseUrl}/flash-sales/${flashSale._id}?cancelled=true`,
        }
      );

      if (response.success && response.data?.stripeCheckoutUrl) {
        // Redirect to Stripe Checkout
        if (typeof window !== 'undefined' && window.location) {
          // Web: Direct redirect
          window.location.href = response.data.stripeCheckoutUrl;
        } else {
          // Native: Use WebBrowser for in-app browser experience
          const result = await WebBrowser.openBrowserAsync(response.data.stripeCheckoutUrl, {
            dismissButtonStyle: 'cancel',
            showTitle: true,
            enableBarCollapsing: true,
          });

          // If user dismissed or completed, check if we should navigate to success
          if (result.type === 'cancel' || result.type === 'dismiss') {
            // User cancelled - they might have completed payment or cancelled
            // Optionally redirect to check purchases or show message
            logger.info('WebBrowser closed with result:', result.type);
          }
        }
      } else {
        throw new Error(response.message || 'Failed to initiate payment');
      }
    } catch (error: any) {
      logger.error('Error initiating flash sale purchase:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to initiate payment. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleShare = async () => {
    if (!flashSale) return;

    try {
      await Share.share({
        message: `🔥 Flash Deal Alert!\n\n${flashSale.title}\n\n${flashSale.discountPercentage}% OFF - Only ${flashSale.maxQuantity - flashSale.soldQuantity} left!\n\nUse code: ${flashSale.promoCode || 'No code needed'}`,
        title: flashSale.title,
      });
    } catch (error) {
      logger.error('Error sharing flash sale:', error);
    }
  };

  const handleStorePress = () => {
    if (flashSale?.stores?.[0]?._id) {
      router.push(`/MainStorePage?storeId=${flashSale.stores[0]._id}` as any);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return ['#EF4444', '#DC2626'];
    if (percentage >= 50) return ['#F59E0B', '#D97706'];
    return ['#10B981', '#059669'];
  };

  const getUrgencyText = (percentage: number) => {
    if (percentage >= 80) return { text: 'Almost Gone!', emoji: '🔥' };
    if (percentage >= 50) return { text: 'Selling Fast!', emoji: '⚡' };
    return { text: 'In Stock', emoji: '✓' };
  };

  const stockPercentage = flashSale
    ? (flashSale.soldQuantity / flashSale.maxQuantity) * 100
    : 0;
  const remainingStock = flashSale
    ? flashSale.maxQuantity - flashSale.soldQuantity
    : 0;
  const isEnded = flashSale?.status === 'ended' || flashSale?.status === 'sold_out' ||
    (timeRemaining.hours === 0 && timeRemaining.minutes === 0 && timeRemaining.seconds === 0);
  const urgency = getUrgencyText(stockPercentage);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.loadingGradient}>
            <ActivityIndicator size="large" color="white" />
            <ThemedText style={styles.loadingText}>Loading deal...</ThemedText>
          </LinearGradient>
        </View>
      </>
    );
  }

  if (error || !flashSale) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <SafeAreaView style={styles.errorSafeArea}>
            <TouchableOpacity onPress={() => router.back()} style={styles.errorBackButton}>
              <Ionicons name="chevron-back" size={28} color="#333" />
            </TouchableOpacity>
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={80} color="#EF4444" />
              <ThemedText style={styles.errorTitle}>Oops!</ThemedText>
              <ThemedText style={styles.errorText}>{error || 'Flash sale not found'}</ThemedText>
              <TouchableOpacity style={styles.retryButton} onPress={() => loadFlashSaleDetails(id as string)}>
                <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Hero Image Section */}
          <View style={styles.heroSection}>
            {imageError || !flashSale.image ? (
              <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.imagePlaceholder}>
                <Ionicons name="flash" size={80} color="white" />
              </LinearGradient>
            ) : (
              <Image
                source={{ uri: flashSale.image }}
                style={styles.heroImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            )}

            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
              style={styles.heroGradient}
            />

            {/* Header Buttons */}
            <SafeAreaView style={styles.headerOverlay} edges={['top']}>
              <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                <BlurView intensity={80} tint="light" style={styles.blurButton}>
                  <Ionicons name="chevron-back" size={24} color="#333" />
                </BlurView>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
                <BlurView intensity={80} tint="light" style={styles.blurButton}>
                  <Ionicons name="share-social-outline" size={22} color="#333" />
                </BlurView>
              </TouchableOpacity>
            </SafeAreaView>

            {/* Flash Deal Badge */}
            <View style={styles.flashBadgeContainer}>
              <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.flashBadge}>
                <Ionicons name="flash" size={14} color="white" />
                <ThemedText style={styles.flashBadgeText}>FLASH DEAL</ThemedText>
              </LinearGradient>
            </View>

            {/* Timer on Image */}
            <View style={styles.timerOnImage}>
              <View style={styles.timerBox}>
                <ThemedText style={styles.timerNumber}>{String(timeRemaining.hours).padStart(2, '0')}</ThemedText>
                <ThemedText style={styles.timerLabel}>HRS</ThemedText>
              </View>
              <ThemedText style={styles.timerSeparator}>:</ThemedText>
              <View style={styles.timerBox}>
                <ThemedText style={styles.timerNumber}>{String(timeRemaining.minutes).padStart(2, '0')}</ThemedText>
                <ThemedText style={styles.timerLabel}>MIN</ThemedText>
              </View>
              <ThemedText style={styles.timerSeparator}>:</ThemedText>
              <View style={styles.timerBox}>
                <ThemedText style={styles.timerNumber}>{String(timeRemaining.seconds).padStart(2, '0')}</ThemedText>
                <ThemedText style={styles.timerLabel}>SEC</ThemedText>
              </View>
            </View>
          </View>

          {/* Content Card */}
          <View style={styles.contentCard}>
            {/* Store Badge */}
            {flashSale.stores && flashSale.stores.length > 0 && (
              <TouchableOpacity style={styles.storeBadge} onPress={handleStorePress}>
                {flashSale.stores[0].logo ? (
                  <Image source={{ uri: flashSale.stores[0].logo }} style={styles.storeLogoSmall} />
                ) : (
                  <View style={[styles.storeLogoSmall, styles.storeLogoPlaceholder]}>
                    <Ionicons name="storefront" size={16} color="#8B5CF6" />
                  </View>
                )}
                <ThemedText style={styles.storeBadgeText}>{flashSale.stores[0].name}</ThemedText>
                <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
              </TouchableOpacity>
            )}

            {/* Title */}
            <ThemedText style={styles.title}>{flashSale.title}</ThemedText>

            {/* Description */}
            {flashSale.description && (
              <ThemedText style={styles.description}>{flashSale.description}</ThemedText>
            )}

            {/* Price Section */}
            <View style={styles.priceCard}>
              <View style={styles.priceLeft}>
                <ThemedText style={styles.priceLabel}>Deal Price</ThemedText>
                <View style={styles.priceRow}>
                  <ThemedText style={styles.discountedPrice}>
                    ₹{flashSale.flashSalePrice || Math.round((flashSale.originalPrice || 0) * (1 - flashSale.discountPercentage / 100))}
                  </ThemedText>
                  {flashSale.originalPrice && (
                    <ThemedText style={styles.originalPrice}>₹{flashSale.originalPrice}</ThemedText>
                  )}
                </View>
              </View>
              <View style={styles.discountCircle}>
                <ThemedText style={styles.discountNumber}>{flashSale.discountPercentage}%</ThemedText>
                <ThemedText style={styles.discountOff}>OFF</ThemedText>
              </View>
            </View>

            {/* Stock Progress */}
            <View style={styles.stockCard}>
              <View style={styles.stockHeader}>
                <View style={styles.stockLeft}>
                  <ThemedText style={styles.stockEmoji}>{urgency.emoji}</ThemedText>
                  <ThemedText style={[styles.stockTitle, stockPercentage >= 80 && styles.stockTitleUrgent]}>
                    {urgency.text}
                  </ThemedText>
                </View>
                <ThemedText style={styles.stockCount}>
                  <ThemedText style={styles.stockCountBold}>{remainingStock}</ThemedText> left
                </ThemedText>
              </View>
              <View style={styles.progressBarContainer}>
                <LinearGradient
                  colors={getProgressColor(stockPercentage) as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBar, { width: `${stockPercentage}%` }]}
                />
              </View>
              <View style={styles.stockFooter}>
                <ThemedText style={styles.stockFooterText}>{flashSale.soldQuantity} claimed</ThemedText>
                <ThemedText style={styles.stockFooterText}>{flashSale.maxQuantity} total</ThemedText>
              </View>
            </View>

            {/* Promo Code */}
            {flashSale.promoCode && (
              <Animated.View style={[styles.promoCodeCard, { transform: [{ scale: pulseAnim }] }]}>
                <LinearGradient
                  colors={['#FEF9C3', '#FEF08A']}
                  style={styles.promoCodeGradient}
                >
                  <View style={styles.promoCodeLeft}>
                    <View style={styles.promoCodeIcon}>
                      <Ionicons name="ticket" size={24} color="#CA8A04" />
                    </View>
                    <View>
                      <ThemedText style={styles.promoCodeLabel}>Use Code</ThemedText>
                      <ThemedText style={styles.promoCode}>{flashSale.promoCode}</ThemedText>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.copyButton, copiedCode && styles.copyButtonSuccess]}
                    onPress={handleCopyCode}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={copiedCode ? "checkmark" : "copy-outline"}
                      size={18}
                      color={copiedCode ? "white" : "#CA8A04"}
                    />
                    <ThemedText style={[styles.copyButtonText, copiedCode && styles.copyButtonTextSuccess]}>
                      {copiedCode ? 'Copied!' : 'Copy'}
                    </ThemedText>
                  </TouchableOpacity>
                </LinearGradient>
              </Animated.View>
            )}

            {/* How to Use */}
            <View style={styles.howToUseCard}>
              <ThemedText style={styles.sectionTitle}>How to Use</ThemedText>
              <View style={styles.stepsContainer}>
                {[
                  { step: 1, icon: 'copy-outline', text: 'Copy the promo code above' },
                  { step: 2, icon: 'storefront-outline', text: 'Visit the store or order online' },
                  { step: 3, icon: 'cart-outline', text: 'Add items to your cart' },
                  { step: 4, icon: 'pricetag-outline', text: 'Apply code at checkout' },
                ].map((item, index) => (
                  <View key={item.step} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <ThemedText style={styles.stepNumberText}>{item.step}</ThemedText>
                    </View>
                    <Ionicons name={item.icon as any} size={20} color="#666" style={styles.stepIcon} />
                    <ThemedText style={styles.stepText}>{item.text}</ThemedText>
                  </View>
                ))}
              </View>
            </View>

            {/* Terms & Conditions */}
            {((flashSale.termsAndConditions && flashSale.termsAndConditions.length > 0) || flashSale.minimumPurchase || flashSale.limitPerUser) && (
              <View style={styles.termsCard}>
                <View style={styles.termsHeader}>
                  <Ionicons name="document-text-outline" size={20} color="#666" />
                  <ThemedText style={styles.sectionTitle}>Terms & Conditions</ThemedText>
                </View>
                <View style={styles.termsList}>
                  {flashSale.termsAndConditions?.map((term, index) => (
                    <View key={index} style={styles.termItem}>
                      <View style={styles.termBullet} />
                      <ThemedText style={styles.termText}>{term}</ThemedText>
                    </View>
                  ))}
                  {flashSale.minimumPurchase && flashSale.minimumPurchase > 0 && (
                    <View style={styles.termItem}>
                      <View style={styles.termBullet} />
                      <ThemedText style={styles.termText}>
                        Minimum purchase: ₹{flashSale.minimumPurchase}
                      </ThemedText>
                    </View>
                  )}
                  {flashSale.limitPerUser && (
                    <View style={styles.termItem}>
                      <View style={styles.termBullet} />
                      <ThemedText style={styles.termText}>
                        Limit {flashSale.limitPerUser} per customer
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Stats */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="eye" size={20} color="#8B5CF6" />
                </View>
                <ThemedText style={styles.statNumber}>{flashSale.viewCount}</ThemedText>
                <ThemedText style={styles.statLabel}>Views</ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="cart" size={20} color="#10B981" />
                </View>
                <ThemedText style={styles.statNumber}>{flashSale.purchaseCount}</ThemedText>
                <ThemedText style={styles.statLabel}>Claims</ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="people" size={20} color="#F59E0B" />
                </View>
                <ThemedText style={styles.statNumber}>{flashSale.limitPerUser}</ThemedText>
                <ThemedText style={styles.statLabel}>Per User</ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomBar}>
          <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea}>
            <View style={styles.bottomContent}>
              <View style={styles.bottomLeft}>
                <ThemedText style={styles.bottomPriceLabel}>Deal Price</ThemedText>
                <ThemedText style={styles.bottomPrice}>
                  ₹{flashSale.flashSalePrice || Math.round((flashSale.originalPrice || 0) * (1 - flashSale.discountPercentage / 100))}
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[styles.getOfferButton, (isEnded || isProcessingPayment) && styles.getOfferButtonDisabled]}
                onPress={handleGetOffer}
                disabled={isEnded || isProcessingPayment}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isEnded ? ['#9CA3AF', '#6B7280'] : isProcessingPayment ? ['#8B5CF6', '#7C3AED'] : ['#EF4444', '#DC2626']}
                  style={styles.getOfferButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isProcessingPayment ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name={isEnded ? "time-outline" : "flash"} size={22} color="white" />
                  )}
                  <ThemedText style={styles.getOfferButtonText}>
                    {isEnded ? 'Deal Ended' : isProcessingPayment ? 'Processing...' : 'Get This Deal'}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.modalSuccessIcon}>
                <Ionicons name="checkmark" size={48} color="white" />
              </LinearGradient>

              <ThemedText style={styles.modalTitle}>Deal Claimed! 🎉</ThemedText>
              <ThemedText style={styles.modalMessage}>
                You're getting {flashSale.discountPercentage}% off!
              </ThemedText>

              {flashSale.promoCode && (
                <View style={styles.modalCodeContainer}>
                  <ThemedText style={styles.modalCodeLabel}>Your Promo Code</ThemedText>
                  <TouchableOpacity
                    style={styles.modalCodeBox}
                    onPress={handleCopyCode}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={styles.modalCode}>{flashSale.promoCode}</ThemedText>
                    <View style={styles.modalCopyIcon}>
                      <Ionicons name={copiedCode ? "checkmark" : "copy"} size={18} color="#8B5CF6" />
                    </View>
                  </TouchableOpacity>
                  {copiedCode && (
                    <ThemedText style={styles.modalCopiedText}>Copied to clipboard!</ThemedText>
                  )}
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonSecondary}
                  onPress={() => setShowSuccessModal(false)}
                >
                  <ThemedText style={styles.modalButtonTextSecondary}>Close</ThemedText>
                </TouchableOpacity>
                {flashSale.stores && flashSale.stores.length > 0 && (
                  <TouchableOpacity
                    style={styles.modalButtonPrimary}
                    onPress={() => {
                      setShowSuccessModal(false);
                      handleStorePress();
                    }}
                  >
                    <LinearGradient
                      colors={['#EF4444', '#DC2626']}
                      style={styles.modalButtonPrimaryGradient}
                    >
                      <Ionicons name="storefront-outline" size={18} color="white" />
                      <ThemedText style={styles.modalButtonTextPrimary}>Visit Store</ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  errorSafeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  errorBackButton: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Hero Section
  heroSection: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  flashBadgeContainer: {
    position: 'absolute',
    top: 100,
    left: 16,
  },
  flashBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  flashBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timerOnImage: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  timerBox: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 70,
  },
  timerNumber: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  timerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  timerSeparator: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },

  // Content Card
  contentCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 20,
    paddingTop: 24,
    gap: 20,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  storeLogoSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  storeLogoPlaceholder: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeBadgeText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 32,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },

  // Price Card
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 16,
  },
  priceLeft: {
    gap: 4,
  },
  priceLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  discountedPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#EF4444',
  },
  originalPrice: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  discountCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
  },
  discountOff: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '600',
  },

  // Stock Card
  stockCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockEmoji: {
    fontSize: 18,
  },
  stockTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  stockTitleUrgent: {
    color: '#EF4444',
  },
  stockCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  stockCountBold: {
    fontWeight: '700',
    color: '#374151',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  stockFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stockFooterText: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // Promo Code Card
  promoCodeCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  promoCodeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 2,
    borderColor: '#FCD34D',
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  promoCodeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  promoCodeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoCodeLabel: {
    fontSize: 12,
    color: '#92400E',
  },
  promoCode: {
    fontSize: 20,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  copyButtonSuccess: {
    backgroundColor: '#10B981',
  },
  copyButtonText: {
    color: '#CA8A04',
    fontWeight: '600',
    fontSize: 14,
  },
  copyButtonTextSuccess: {
    color: 'white',
  },

  // How to Use
  howToUseCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  stepsContainer: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  stepIcon: {
    width: 24,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
  },

  // Terms Card
  termsCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  termsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  termsList: {
    gap: 8,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  termBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
    marginTop: 7,
  },
  termText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Stats Card
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },

  bottomSpacing: {
    height: 180,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 75,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  bottomSafeArea: {
    paddingBottom: 16,
  },
  bottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  bottomLeft: {
    gap: 2,
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bottomPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  getOfferButton: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  getOfferButtonDisabled: {},
  getOfferButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  getOfferButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  modalSuccessIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalCodeContainer: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  modalCodeLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 10,
  },
  modalCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FCD34D',
    borderStyle: 'dashed',
    gap: 12,
  },
  modalCode: {
    fontSize: 22,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 2,
  },
  modalCopyIcon: {
    backgroundColor: 'white',
    padding: 6,
    borderRadius: 6,
  },
  modalCopiedText: {
    marginTop: 8,
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  modalButtonPrimary: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonPrimaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  modalButtonTextSecondary: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
