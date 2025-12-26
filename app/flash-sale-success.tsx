// Flash Sale Success Page
// Shows voucher code after successful Stripe payment

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { ThemedText } from '@/components/ThemedText';
import realOffersApi from '@/services/realOffersApi';
import logger from '@/utils/logger';

const { width: screenWidth } = Dimensions.get('window');

export default function FlashSaleSuccessPage() {
  const router = useRouter();
  const { purchaseId, session_id } = useLocalSearchParams<{
    purchaseId?: string;
    session_id?: string;
  }>();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string | undefined>();
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // Animation
  const scaleAnim = useState(new Animated.Value(0))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (purchaseId && session_id) {
      verifyPayment();
    } else {
      setError('Missing payment information');
      setIsLoading(false);
    }
  }, [purchaseId, session_id]);

  const verifyPayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await realOffersApi.verifyFlashSalePayment({
        purchaseId: purchaseId!,
        stripeSessionId: session_id!,
      });

      if (response.success && response.data) {
        setVoucherCode(response.data.voucherCode);
        setPromoCode(response.data.promoCode);
        setExpiresAt(response.data.expiresAt);
        setAmount(response.data.amount);

        // Animate success
        Animated.sequence([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        setError(response.message || 'Payment verification failed');
      }
    } catch (err: any) {
      logger.error('Error verifying payment:', err);
      setError(err.message || 'Failed to verify payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={['#8B5CF6', '#6366F1']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="white" />
          <ThemedText style={styles.loadingText}>Verifying payment...</ThemedText>
        </LinearGradient>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle" size={80} color="#EF4444" />
          </View>
          <ThemedText style={styles.errorTitle}>Payment Verification Failed</ThemedText>
          <ThemedText style={styles.errorMessage}>{error}</ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.replace('/offers')}
          >
            <ThemedText style={styles.retryButtonText}>Back to Offers</ThemedText>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#10B981', '#059669']}
        style={styles.successGradient}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Success Icon */}
          <Animated.View
            style={[
              styles.successIconContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={60} color="#10B981" />
            </View>
          </Animated.View>

          {/* Success Message */}
          <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
            <ThemedText style={styles.successTitle}>Payment Successful!</ThemedText>
            <ThemedText style={styles.successSubtitle}>
              Your deal has been claimed
            </ThemedText>

            {/* Amount Paid */}
            <View style={styles.amountCard}>
              <ThemedText style={styles.amountLabel}>Amount Paid</ThemedText>
              <ThemedText style={styles.amountValue}>₹{amount}</ThemedText>
            </View>

            {/* Voucher Code Card */}
            <View style={styles.voucherCard}>
              <View style={styles.voucherHeader}>
                <Ionicons name="ticket" size={24} color="#8B5CF6" />
                <ThemedText style={styles.voucherLabel}>Your Voucher Code</ThemedText>
              </View>
              <TouchableOpacity
                style={styles.voucherCodeBox}
                onPress={() => handleCopyCode(voucherCode)}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.voucherCode}>{voucherCode}</ThemedText>
                <View style={styles.copyIcon}>
                  <Ionicons
                    name={copiedCode ? "checkmark" : "copy"}
                    size={20}
                    color="#8B5CF6"
                  />
                </View>
              </TouchableOpacity>
              {copiedCode && (
                <ThemedText style={styles.copiedText}>Copied to clipboard!</ThemedText>
              )}

              {/* Promo Code (if exists) */}
              {promoCode && (
                <View style={styles.promoCodeSection}>
                  <ThemedText style={styles.promoLabel}>Promo Code</ThemedText>
                  <TouchableOpacity
                    style={styles.promoCodeBox}
                    onPress={() => handleCopyCode(promoCode)}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={styles.promoCode}>{promoCode}</ThemedText>
                    <Ionicons name="copy-outline" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Expiry Date */}
              <View style={styles.expirySection}>
                <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                <ThemedText style={styles.expiryText}>
                  Valid until {formatDate(expiresAt)}
                </ThemedText>
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsCard}>
              <ThemedText style={styles.instructionsTitle}>How to use</ThemedText>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <ThemedText style={styles.instructionNumberText}>1</ThemedText>
                </View>
                <ThemedText style={styles.instructionText}>
                  Visit the store and show this voucher code
                </ThemedText>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <ThemedText style={styles.instructionNumberText}>2</ThemedText>
                </View>
                <ThemedText style={styles.instructionText}>
                  The store will verify and apply your discount
                </ThemedText>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <ThemedText style={styles.instructionNumberText}>3</ThemedText>
                </View>
                <ThemedText style={styles.instructionText}>
                  Enjoy your deal before it expires!
                </ThemedText>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.replace('/offers')}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.primaryButtonGradient}
                >
                  <ThemedText style={styles.primaryButtonText}>
                    Browse More Deals
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push('/my-vouchers' as any)}
              >
                <ThemedText style={styles.secondaryButtonText}>
                  View My Vouchers
                </ThemedText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  errorIcon: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  successGradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: 24,
  },
  successIconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  contentContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
  },
  amountCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  voucherCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  voucherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  voucherLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  voucherCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
  },
  voucherCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#92400E',
    letterSpacing: 2,
  },
  copyIcon: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
  },
  copiedText: {
    fontSize: 12,
    color: '#10B981',
    textAlign: 'center',
    marginTop: 8,
  },
  promoCodeSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  promoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  promoCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  promoCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  expirySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  expiryText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  instructionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  primaryButton: {
    marginBottom: 12,
  },
  primaryButtonGradient: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
