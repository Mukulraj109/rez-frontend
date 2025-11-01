// Payment Confirmation Page
// Success/failure screen after subscription payment

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { TIER_COLORS, TIER_GRADIENTS, TIER_NAMES } from '@/types/subscription.types';

export default function PaymentConfirmationPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { state } = useSubscription();

  const tier = (params.tier as 'premium' | 'vip') || 'premium';
  const amount = params.amount ? Number(params.amount) : 0;
  const status = (params.status as string) || 'success';
  const billingCycle = (params.billingCycle as 'monthly' | 'yearly') || 'monthly';
  const transactionId = (params.transactionId as string) || `TXN${Date.now()}`;

  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate success icon
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getNextBillingDate = () => {
    const date = new Date();
    if (billingCycle === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getBenefits = () => {
    if (tier === 'vip') {
      return [
        { icon: 'cash', text: '3x Cashback on all orders' },
        { icon: 'bicycle', text: 'Free delivery on all orders' },
        { icon: 'headset', text: 'Dedicated concierge service' },
        { icon: 'calendar', text: 'Premium events access' },
        { icon: 'person', text: 'Personal shopper assistance' },
        { icon: 'flash', text: 'Early flash sale access (1 hour)' },
      ];
    } else {
      return [
        { icon: 'cash', text: '2x Cashback on all orders' },
        { icon: 'bicycle', text: 'Free delivery (orders above ₹500)' },
        { icon: 'headset', text: 'Priority customer support' },
        { icon: 'pricetag', text: 'Exclusive deals & early access' },
        { icon: 'heart', text: 'Unlimited wishlists' },
        { icon: 'gift', text: 'Birthday & anniversary offers' },
      ];
    }
  };

  if (status === 'failed') {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#EF4444" />

        <LinearGradient colors={['#EF4444', '#DC2626'] as any} style={styles.header}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Payment Failed</ThemedText>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.failureContainer}>
            <Ionicons name="close-circle" size={120} color="#EF4444" />
            <ThemedText style={styles.failureTitle}>Payment Failed</ThemedText>
            <ThemedText style={styles.failureMessage}>
              We couldn't process your payment. Please try again or use a different payment method.
            </ThemedText>

            <View style={styles.errorDetails}>
              <ThemedText style={styles.errorTitle}>What happened?</ThemedText>
              <ThemedText style={styles.errorText}>
                Your payment for the {TIER_NAMES[tier]} plan was not successful. Your account has not been charged.
              </ThemedText>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => router.push('/subscription/plans')}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.supportButton}
                onPress={() => router.push('/support')}
              >
                <ThemedText style={styles.supportButtonText}>Contact Support</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.homeButton}
                onPress={() => router.push('/')}
              >
                <ThemedText style={styles.homeButtonText}>Back to Home</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  const tierColor = TIER_COLORS[tier];
  const tierGradient = TIER_GRADIENTS[tier];

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={tierColor} />

      <LinearGradient colors={tierGradient as any} style={styles.header}>
        <View style={styles.headerContainer}>
          <View style={styles.backButton} />
          <ThemedText style={styles.headerTitle}>Payment Successful</ThemedText>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Success Animation */}
        <View style={styles.successContainer}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={80} color="#FFFFFF" />
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <ThemedText style={styles.successTitle}>Welcome to {TIER_NAMES[tier]}!</ThemedText>
            <ThemedText style={styles.successMessage}>
              Your subscription has been activated successfully
            </ThemedText>
          </Animated.View>
        </View>

        {/* Subscription Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.tierBadge}>
            <LinearGradient colors={tierGradient as any} style={styles.tierBadgeGradient}>
              <Ionicons name={tier === 'vip' ? 'diamond' : 'star'} size={24} color="#FFFFFF" />
              <ThemedText style={styles.tierBadgeText}>{TIER_NAMES[tier]} Member</ThemedText>
            </LinearGradient>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Amount Paid</ThemedText>
            <ThemedText style={styles.detailValue}>₹{amount}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Billing Cycle</ThemedText>
            <ThemedText style={styles.detailValue}>
              {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Next Billing Date</ThemedText>
            <ThemedText style={styles.detailValue}>{getNextBillingDate()}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Transaction ID</ThemedText>
            <ThemedText style={[styles.detailValue, styles.transactionId]}>
              {transactionId}
            </ThemedText>
          </View>

          <TouchableOpacity style={styles.receiptButton} onPress={() => {
            Alert.alert('Receipt Download', 'Receipt will be sent to your email shortly.');
          }}>
            <Ionicons name="download-outline" size={20} color="#8B5CF6" />
            <ThemedText style={styles.receiptButtonText}>Download Receipt</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Benefits Unlocked */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Benefits Unlocked</ThemedText>
          <View style={styles.benefitsContainer}>
            {getBenefits().map((benefit, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.benefitRow,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateX: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-50, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.benefitIcon}>
                  <Ionicons name={benefit.icon as any} size={20} color="#8B5CF6" />
                </View>
                <ThemedText style={styles.benefitText}>{benefit.text}</ThemedText>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/subscription/manage')}
          >
            <ThemedText style={styles.primaryButtonText}>View My Subscription</ThemedText>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/')}
          >
            <ThemedText style={styles.secondaryButtonText}>Start Shopping</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  detailsCard: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tierBadge: {
    marginBottom: 20,
    marginHorizontal: -20,
    marginTop: -20,
  },
  tierBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  tierBadgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  transactionId: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#6B7280',
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  receiptButtonText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  benefitsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF610',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  // Failure styles
  failureContainer: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  failureTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 24,
    marginBottom: 8,
  },
  failureMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorDetails: {
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    width: '100%',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  supportButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  supportButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
});
