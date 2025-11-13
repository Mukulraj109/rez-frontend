// Cancellation Feedback Flow
// Multi-step wizard for subscription cancellation with retention attempts

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSubscription } from '@/contexts/SubscriptionContext';
import subscriptionAPI from '@/services/subscriptionApi';
import ProgressSteps, { Step } from '@/components/subscription/ProgressSteps';
import RetentionOfferCard from '@/components/subscription/RetentionOfferCard';
import { TIER_NAMES } from '@/types/subscription.types';

type CancellationReason =
  | 'too_expensive'
  | 'not_using_enough'
  | 'missing_features'
  | 'found_alternative'
  | 'technical_issues'
  | 'other';

type CancellationType = 'immediate' | 'end_of_cycle';

const CANCELLATION_REASONS: { value: CancellationReason; label: string; icon: string }[] = [
  { value: 'too_expensive', label: 'Too expensive', icon: 'cash-outline' },
  { value: 'not_using_enough', label: 'Not using enough', icon: 'time-outline' },
  { value: 'missing_features', label: 'Missing features I need', icon: 'construct-outline' },
  { value: 'found_alternative', label: 'Found a better alternative', icon: 'swap-horizontal-outline' },
  { value: 'technical_issues', label: 'Technical issues', icon: 'bug-outline' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export default function CancelFeedbackPage() {
  const router = useRouter();
  const { state, actions, computed } = useSubscription();
  const currentTier = state.currentSubscription?.tier || 'free';

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedReason, setSelectedReason] = useState<CancellationReason | null>(null);
  const [otherReasonText, setOtherReasonText] = useState('');
  const [featureRequest, setFeatureRequest] = useState('');
  const [finalFeedback, setFinalFeedback] = useState('');
  const [cancellationType, setCancellationType] = useState<CancellationType>('end_of_cycle');
  const [isCancelling, setIsCancelling] = useState(false);
  const [showRetentionOffer, setShowRetentionOffer] = useState(false);

  const steps: Step[] = [
    { id: 'reason', title: 'Tell us why', icon: 'chatbubble-outline' },
    { id: 'retention', title: 'Special offer', icon: 'gift-outline' },
    { id: 'pause', title: 'Pause option', icon: 'pause-outline' },
    { id: 'confirm', title: 'Confirm', icon: 'checkmark-outline' },
  ];

  // Get retention offer based on reason
  const getRetentionOffer = () => {
    switch (selectedReason) {
      case 'too_expensive':
        return {
          type: 'discount' as const,
          title: 'Special Discount for You',
          description: 'We understand budgets are tight. How about a 20% discount for the next 3 months?',
          ctaText: 'Accept 20% Discount',
          icon: 'pricetag',
          value: '20% OFF',
        };
      case 'not_using_enough':
        return {
          type: 'usage_tips' as const,
          title: 'You Might Be Missing Out',
          description: `Did you know ${TIER_NAMES[currentTier]} members save an average of ₹${currentTier === 'vip' ? '2,500' : '1,200'} per month? Let us show you how!`,
          ctaText: 'Show Me Tips',
          icon: 'bulb',
          value: '',
        };
      case 'missing_features':
        return {
          type: 'benefits_reminder' as const,
          title: 'Tell Us What You Need',
          description: 'Your feedback helps us improve. What features would make you stay?',
          ctaText: 'Share Feedback',
          icon: 'chatbubbles',
          value: '',
        };
      default:
        return null;
    }
  };

  // Handle step 1: Reason selection
  const handleReasonSelect = (reason: CancellationReason) => {
    setSelectedReason(reason);
  };

  const handleContinueFromReason = () => {
    if (!selectedReason) {
      Alert.alert('Selection Required', 'Please select a reason before continuing');
      return;
    }
    if (selectedReason === 'other' && !otherReasonText.trim()) {
      Alert.alert('Details Required', 'Please provide more details about your reason');
      return;
    }

    // Check if we should show retention offer
    if (['too_expensive', 'not_using_enough', 'missing_features'].includes(selectedReason)) {
      setShowRetentionOffer(true);
      setCurrentStep(1);
    } else {
      // Skip retention offer for other reasons
      setCurrentStep(2);
    }
  };

  // Handle retention offer
  const handleAcceptOffer = () => {
    if (selectedReason === 'too_expensive') {
      // Apply discount
      Alert.alert(
        'Discount Applied!',
        'Your 20% discount has been applied for the next 3 months. Thank you for staying with us!',
        [
          {
            text: 'OK',
            onPress: () => router.push('/subscription/manage'),
          },
        ]
      );
    } else if (selectedReason === 'not_using_enough') {
      // Show usage tips
      router.push('/subscription/benefits');
    } else if (selectedReason === 'missing_features') {
      // Go to feature request
      setCurrentStep(2);
    }
  };

  const handleDeclineOffer = () => {
    setCurrentStep(2);
  };

  // Handle pause option
  const handlePauseSubscription = async () => {
    try {
      Alert.alert(
        'Subscription Paused',
        'Your subscription has been paused for 1 month. You can resume anytime!',
        [
          {
            text: 'OK',
            onPress: () => router.push('/subscription/manage'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pause subscription');
    }
  };

  const handleSkipPause = () => {
    setCurrentStep(3);
  };

  // Handle final cancellation
  const handleFinalCancel = async () => {
    try {
      setIsCancelling(true);

      const cancelRequest = {
        reason: selectedReason === 'other' ? otherReasonText : selectedReason,
        feedback: finalFeedback,
        cancelImmediately: cancellationType === 'immediate',
      };

      await subscriptionAPI.cancelSubscription(cancelRequest);
      await actions.loadSubscription(true);

      const accessMessage = cancellationType === 'immediate'
        ? 'You will lose access to premium features immediately.'
        : `You will keep access to premium features until ${new Date(state.currentSubscription?.endDate || '').toLocaleDateString()}`;

      Alert.alert(
        'Subscription Cancelled',
        `Your subscription has been cancelled. ${accessMessage}`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/subscription/manage'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleKeepSubscription = () => {
    router.push('/subscription/manage');
  };

  // Render Step 1: Reason Selection
  const renderReasonSelection = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Ionicons name="sad-outline" size={64} color="#EF4444" />
        <ThemedText style={styles.stepTitle}>We're sorry to see you go</ThemedText>
        <ThemedText style={styles.stepSubtitle}>
          Help us improve by sharing why you're cancelling
        </ThemedText>
      </View>

      <View style={styles.reasonsContainer}>
        {CANCELLATION_REASONS.map((reason) => (
          <TouchableOpacity
            key={reason.value}
            style={[
              styles.reasonOption,
              selectedReason === reason.value && styles.reasonOptionSelected,
            ]}
            onPress={() => handleReasonSelect(reason.value)}
            accessibilityLabel={`Reason: ${reason.label}. ${selectedReason === reason.value ? 'Selected' : ''}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedReason === reason.value }}
            accessibilityHint="Double tap to select this cancellation reason"
          >
            <View style={styles.radioButton}>
              {selectedReason === reason.value && <View style={styles.radioButtonInner} />}
            </View>
            <Ionicons
              name={reason.icon as any}
              size={24}
              color={selectedReason === reason.value ? '#EF4444' : '#6B7280'}
            />
            <ThemedText style={styles.reasonLabel}>{reason.label}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {selectedReason === 'other' && (
        <View style={styles.otherReasonContainer}>
          <TextInput
            style={styles.textArea}
            value={otherReasonText}
            onChangeText={setOtherReasonText}
            placeholder="Please tell us more..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            accessibilityLabel="Other cancellation reason"
            accessibilityHint="Enter details about why you want to cancel"
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinueFromReason}
        accessibilityLabel="Continue to next step"
        accessibilityRole="button"
        accessibilityHint="Double tap to proceed with cancellation"
      >
        <ThemedText style={styles.continueButtonText}>Continue</ThemedText>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  // Render Step 2: Retention Offer
  const renderRetentionOffer = () => {
    const offer = getRetentionOffer();
    if (!offer) return null;

    if (selectedReason === 'missing_features') {
      return (
        <View style={styles.stepContent}>
          <View style={styles.stepHeader}>
            <Ionicons name="bulb-outline" size={64} color="#F59E0B" />
            <ThemedText style={styles.stepTitle}>Tell Us What You Need</ThemedText>
            <ThemedText style={styles.stepSubtitle}>
              Your feedback helps us build better features
            </ThemedText>
          </View>

          <TextInput
            style={styles.textArea}
            value={featureRequest}
            onChangeText={setFeatureRequest}
            placeholder="What features would make you stay?"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                if (featureRequest.trim()) {
                  Alert.alert('Thank You!', 'Your feedback has been submitted to our team.');
                }
                setCurrentStep(2);
              }}
            >
              <ThemedText style={styles.primaryButtonText}>Submit Feedback</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleDeclineOffer}>
              <ThemedText style={styles.secondaryButtonText}>Cancel Anyway</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.stepContent}>
        <RetentionOfferCard
          offer={offer}
          onAccept={handleAcceptOffer}
          onDecline={handleDeclineOffer}
        />
      </View>
    );
  };

  // Render Step 3: Pause Option
  const renderPauseOption = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Ionicons name="pause-circle-outline" size={64} color="#8B5CF6" />
        <ThemedText style={styles.stepTitle}>Would you like to pause instead?</ThemedText>
        <ThemedText style={styles.stepSubtitle}>
          Take a break without losing your benefits
        </ThemedText>
      </View>

      <View style={styles.pauseBenefitsCard}>
        <View style={styles.pauseBenefitRow}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <ThemedText style={styles.pauseBenefitText}>
            Keep your benefits for 1 month
          </ThemedText>
        </View>
        <View style={styles.pauseBenefitRow}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <ThemedText style={styles.pauseBenefitText}>Resume anytime you want</ThemedText>
        </View>
        <View style={styles.pauseBenefitRow}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <ThemedText style={styles.pauseBenefitText}>No charge during pause</ThemedText>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handlePauseSubscription}
          accessibilityLabel="Pause my subscription"
          accessibilityRole="button"
          accessibilityHint="Double tap to pause subscription for 1 month instead of cancelling"
        >
          <ThemedText style={styles.primaryButtonText}>Pause My Subscription</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSkipPause}
          accessibilityLabel="No, cancel permanently"
          accessibilityRole="button"
          accessibilityHint="Double tap to skip pause option and proceed with cancellation"
        >
          <ThemedText style={styles.secondaryButtonText}>No, Cancel Permanently</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Step 4: Final Confirmation
  const renderFinalConfirmation = () => {
    const endDate = new Date(state.currentSubscription?.endDate || '');
    const formattedEndDate = endDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const benefits = [
      `${currentTier === 'vip' ? '3x' : '2x'} cashback on all orders`,
      'Free delivery',
      'Priority customer support',
      'Exclusive deals & early access',
      currentTier === 'vip' ? 'Personal shopper assistance' : 'Unlimited wishlists',
    ];

    return (
      <View style={styles.stepContent}>
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={32} color="#EF4444" />
          <ThemedText style={styles.warningTitle}>Your subscription will be cancelled</ThemedText>
          <ThemedText style={styles.warningText}>
            You'll lose access on {cancellationType === 'immediate' ? 'now' : formattedEndDate}
          </ThemedText>
        </View>

        <View style={styles.benefitsLossCard}>
          <ThemedText style={styles.benefitsLossTitle}>Benefits You'll Lose:</ThemedText>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitLossRow}>
              <Ionicons name="close-circle" size={20} color="#EF4444" />
              <ThemedText style={styles.benefitLossText}>{benefit}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.feedbackSection}>
          <ThemedText style={styles.feedbackLabel}>Any final thoughts?</ThemedText>
          <TextInput
            style={styles.textArea}
            value={finalFeedback}
            onChangeText={setFinalFeedback}
            placeholder="Share your feedback (optional)"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            accessibilityLabel="Final feedback"
            accessibilityHint="Optionally share any final thoughts about your cancellation"
          />
        </View>

        <View style={styles.cancellationTypeContainer}>
          <TouchableOpacity
            style={[
              styles.typeOption,
              cancellationType === 'end_of_cycle' && styles.typeOptionSelected,
            ]}
            onPress={() => setCancellationType('end_of_cycle')}
            accessibilityLabel={`Cancel at end of billing cycle. Keep access until ${formattedEndDate}. ${cancellationType === 'end_of_cycle' ? 'Selected' : ''}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: cancellationType === 'end_of_cycle' }}
            accessibilityHint="Double tap to cancel at the end of your billing cycle"
          >
            <View style={styles.checkbox}>
              {cancellationType === 'end_of_cycle' && (
                <Ionicons name="checkmark" size={16} color="#8B5CF6" />
              )}
            </View>
            <View style={styles.typeContent}>
              <ThemedText style={styles.typeTitle}>Cancel at end of billing cycle</ThemedText>
              <ThemedText style={styles.typeSubtitle}>
                Keep access until {formattedEndDate}
              </ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeOption,
              cancellationType === 'immediate' && styles.typeOptionSelected,
            ]}
            onPress={() => setCancellationType('immediate')}
            accessibilityLabel={`Cancel immediately. Lose access now. ${cancellationType === 'immediate' ? 'Selected' : ''}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: cancellationType === 'immediate' }}
            accessibilityHint="Double tap to cancel immediately and lose access right away"
          >
            <View style={styles.checkbox}>
              {cancellationType === 'immediate' && (
                <Ionicons name="checkmark" size={16} color="#EF4444" />
              )}
            </View>
            <View style={styles.typeContent}>
              <ThemedText style={styles.typeTitle}>Cancel immediately</ThemedText>
              <ThemedText style={styles.typeSubtitle}>Lose access now</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.finalActions}>
          <TouchableOpacity
            style={styles.keepButton}
            onPress={handleKeepSubscription}
            disabled={isCancelling}
            accessibilityLabel="Keep my subscription"
            accessibilityRole="button"
            accessibilityState={{ disabled: isCancelling }}
            accessibilityHint="Double tap to keep your subscription and go back"
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.keepButtonGradient}
            >
              <ThemedText style={styles.keepButtonText}>Keep My Subscription</ThemedText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleFinalCancel}
            disabled={isCancelling}
            accessibilityLabel={isCancelling ? 'Cancelling subscription' : 'Cancel my subscription'}
            accessibilityRole="button"
            accessibilityState={{ disabled: isCancelling, busy: isCancelling }}
            accessibilityHint="Double tap to confirm subscription cancellation"
          >
            {isCancelling ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <ThemedText style={styles.cancelButtonText}>Cancel My Subscription</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render current step content
  const renderStepContent = () => {
    if (currentStep === 0) return renderReasonSelection();
    if (currentStep === 1 && showRetentionOffer) return renderRetentionOffer();
    if (currentStep === 2) return renderPauseOption();
    if (currentStep === 3) return renderFinalConfirmation();
    return null;
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#EF4444" />

      {/* Header */}
      <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.header}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Cancel and go back"
            accessibilityRole="button"
            accessibilityHint="Double tap to cancel and return to previous screen"
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Cancel Subscription</ThemedText>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Progress Steps */}
        <ProgressSteps steps={steps} currentStep={currentStep} />

        {/* Step Content */}
        {renderStepContent()}
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
  stepContent: {
    padding: 20,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginTop: 16,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  reasonsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  reasonOptionSelected: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  reasonLabel: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  otherReasonContainer: {
    marginBottom: 24,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 100,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonGroup: {
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
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
    fontSize: 14,
    fontWeight: '600',
  },
  pauseBenefitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    gap: 16,
    marginBottom: 24,
  },
  pauseBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pauseBenefitText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  warningBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#FEE2E2',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#DC2626',
    marginTop: 4,
    textAlign: 'center',
  },
  benefitsLossCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  benefitsLossTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  benefitLossRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitLossText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  feedbackSection: {
    marginBottom: 24,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  cancellationTypeContainer: {
    gap: 12,
    marginBottom: 24,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  typeOptionSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF605',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeContent: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  typeSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  finalActions: {
    gap: 12,
  },
  keepButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  keepButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  keepButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FEE2E2',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
