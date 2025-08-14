import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Deal } from '@/types/deals';
import { calculateDealDiscount } from '@/utils/deal-validation';

interface DealDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  deal: Deal | null;
}

export default function DealDetailsModal({ visible, onClose, deal }: DealDetailsModalProps) {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const slideAnim = useRef(new Animated.Value(screenData.height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
      slideAnim.setValue(window.height);
    });

    return () => subscription?.remove();
  }, [slideAnim]);

  const styles = createStyles(screenData);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenData.height,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleBackdropPress = () => {
    onClose();
  };

  const handleModalPress = (event: any) => {
    event.stopPropagation();
  };

  if (!deal) return null;

  // Calculate savings examples
  const exampleBills = [deal.minimumBill, deal.minimumBill * 1.5, deal.minimumBill * 2];
  const savingsExamples = exampleBills.map(amount => ({
    billAmount: amount,
    ...calculateDealDiscount(deal, amount)
  }));

  // Format expiry date
  const formatExpiryDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get time until expiry
  const getTimeUntilExpiry = () => {
    const now = new Date().getTime();
    const expiry = deal.validUntil.getTime();
    const difference = expiry - now;

    if (difference <= 0) return 'Expired';

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} days, ${hours} hours remaining`;
    } else if (hours > 0) {
      return `${hours} hours remaining`;
    } else {
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutes} minutes remaining`;
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.blurContainer, { opacity: fadeAnim }]}>
            <BlurView intensity={50} style={styles.blur} />
          </Animated.View>

          <TouchableWithoutFeedback onPress={handleModalPress}>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.modal}>
                {/* Close button */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={20} color="#555" />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.badgeContainer}>
                    <View style={[styles.badge, deal.badge ? { backgroundColor: deal.badge.backgroundColor } : {}]}>
                      <ThemedText style={[styles.badgeText, deal.badge ? { color: deal.badge.textColor } : {}]}>
                        {deal.badge?.text || `Save ${deal.discountValue}%`}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.title}>{deal.title}</ThemedText>
                  {deal.description && (
                    <ThemedText style={styles.description}>{deal.description}</ThemedText>
                  )}
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                  {/* Key Details */}
                  <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Deal Details</ThemedText>
                    
                    <View style={styles.detailRow}>
                      <Ionicons name="wallet-outline" size={20} color="#8B5CF6" />
                      <View style={styles.detailContent}>
                        <ThemedText style={styles.detailLabel}>Minimum Bill</ThemedText>
                        <ThemedText style={styles.detailValue}>₹{deal.minimumBill.toLocaleString()}</ThemedText>
                      </View>
                    </View>

                    {deal.maxDiscount && (
                      <View style={styles.detailRow}>
                        <Ionicons name="trending-up-outline" size={20} color="#8B5CF6" />
                        <View style={styles.detailContent}>
                          <ThemedText style={styles.detailLabel}>Maximum Discount</ThemedText>
                          <ThemedText style={styles.detailValue}>₹{deal.maxDiscount.toLocaleString()}</ThemedText>
                        </View>
                      </View>
                    )}

                    <View style={styles.detailRow}>
                      <Ionicons name={deal.isOfflineOnly ? "storefront-outline" : "globe-outline"} size={20} color="#8B5CF6" />
                      <View style={styles.detailContent}>
                        <ThemedText style={styles.detailLabel}>Available</ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {deal.isOfflineOnly ? 'In-store only' : 'Online & In-store'}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={20} color="#8B5CF6" />
                      <View style={styles.detailContent}>
                        <ThemedText style={styles.detailLabel}>Valid Until</ThemedText>
                        <ThemedText style={styles.detailValue}>{formatExpiryDate(deal.validUntil)}</ThemedText>
                        <ThemedText style={styles.timeRemaining}>{getTimeUntilExpiry()}</ThemedText>
                      </View>
                    </View>

                    {deal.usageLimit && (
                      <View style={styles.detailRow}>
                        <Ionicons name="repeat-outline" size={20} color="#8B5CF6" />
                        <View style={styles.detailContent}>
                          <ThemedText style={styles.detailLabel}>Usage Limit</ThemedText>
                          <ThemedText style={styles.detailValue}>
                            {deal.usageLimit - (deal.usageCount || 0)} uses remaining
                          </ThemedText>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Savings Examples */}
                  <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Savings Calculator</ThemedText>
                    {savingsExamples.map((example, index) => (
                      <View key={index} style={styles.savingsExample}>
                        <View style={styles.savingsRow}>
                          <ThemedText style={styles.savingsLabel}>Bill Amount:</ThemedText>
                          <ThemedText style={styles.savingsValue}>₹{example.billAmount.toLocaleString()}</ThemedText>
                        </View>
                        <View style={styles.savingsRow}>
                          <ThemedText style={styles.savingsLabel}>You Save:</ThemedText>
                          <ThemedText style={styles.savingsDiscount}>₹{example.discountAmount.toLocaleString()}</ThemedText>
                        </View>
                        <View style={[styles.savingsRow, styles.savingsFinal]}>
                          <ThemedText style={styles.savingsLabel}>Pay Only:</ThemedText>
                          <ThemedText style={styles.savingsFinalAmount}>₹{example.finalAmount.toLocaleString()}</ThemedText>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Applicable Products */}
                  {deal.applicableProducts && deal.applicableProducts.length > 0 && (
                    <View style={styles.section}>
                      <ThemedText style={styles.sectionTitle}>Applicable Categories</ThemedText>
                      <View style={styles.categoriesContainer}>
                        {deal.applicableProducts.map((category, index) => (
                          <View key={index} style={styles.categoryTag}>
                            <ThemedText style={styles.categoryTagText}>{category}</ThemedText>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Terms and Conditions */}
                  <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Terms & Conditions</ThemedText>
                    {deal.terms.map((term, index) => (
                      <View key={index} style={styles.termRow}>
                        <View style={styles.termBullet} />
                        <ThemedText style={styles.termText}>{term}</ThemedText>
                      </View>
                    ))}
                  </View>

                  {/* How to Use */}
                  <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>How to Use</ThemedText>
                    <View style={styles.stepRow}>
                      <View style={styles.stepNumber}>
                        <ThemedText style={styles.stepNumberText}>1</ThemedText>
                      </View>
                      <ThemedText style={styles.stepText}>Add this deal to your selected offers</ThemedText>
                    </View>
                    <View style={styles.stepRow}>
                      <View style={styles.stepNumber}>
                        <ThemedText style={styles.stepNumberText}>2</ThemedText>
                      </View>
                      <ThemedText style={styles.stepText}>Shop for items worth ₹{deal.minimumBill.toLocaleString()} or more</ThemedText>
                    </View>
                    <View style={styles.stepRow}>
                      <View style={styles.stepNumber}>
                        <ThemedText style={styles.stepNumberText}>3</ThemedText>
                      </View>
                      <ThemedText style={styles.stepText}>Apply the deal at checkout to get your discount</ThemedText>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const createStyles = (screenData: { width: number; height: number }) => {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    blurContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    blur: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    modal: {
      backgroundColor: '#fff',
      borderRadius: 20,
      width: '100%',
      maxHeight: '95%',
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 6,
    },
    closeButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: '#f2f2f2',
      borderRadius: 20,
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    header: {
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 24,
    },
    badgeContainer: {
      marginBottom: 12,
    },
    badge: {
      backgroundColor: '#E5E7EB',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    badgeText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#374151',
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: '#111827',
      textAlign: 'center',
      marginBottom: 8,
    },
    description: {
      fontSize: 16,
      color: '#6B7280',
      textAlign: 'center',
      lineHeight: 22,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      marginBottom: 28,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 16,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    detailContent: {
      marginLeft: 12,
      flex: 1,
    },
    detailLabel: {
      fontSize: 14,
      color: '#6B7280',
      marginBottom: 2,
    },
    detailValue: {
      fontSize: 16,
      fontWeight: '600',
      color: '#111827',
    },
    timeRemaining: {
      fontSize: 12,
      color: '#8B5CF6',
      marginTop: 2,
    },
    savingsExample: {
      backgroundColor: '#F8FAFC',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    savingsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    savingsFinal: {
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      paddingTop: 8,
      marginTop: 4,
    },
    savingsLabel: {
      fontSize: 14,
      color: '#6B7280',
    },
    savingsValue: {
      fontSize: 14,
      fontWeight: '500',
      color: '#374151',
    },
    savingsDiscount: {
      fontSize: 14,
      fontWeight: '700',
      color: '#10B981',
    },
    savingsFinalAmount: {
      fontSize: 16,
      fontWeight: '700',
      color: '#111827',
    },
    categoriesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryTag: {
      backgroundColor: '#F3F4F6',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    categoryTagText: {
      fontSize: 12,
      fontWeight: '500',
      color: '#374151',
    },
    termRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    termBullet: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#8B5CF6',
      marginTop: 8,
      marginRight: 12,
    },
    termText: {
      fontSize: 14,
      color: '#4B5563',
      flex: 1,
      lineHeight: 20,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    stepNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#8B5CF6',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    stepNumberText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#fff',
    },
    stepText: {
      fontSize: 14,
      color: '#4B5563',
      flex: 1,
      lineHeight: 20,
    },
  });
};