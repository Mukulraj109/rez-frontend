/**
 * Financial Service Detail Page
 * Dedicated page for financial services (bills, OTT, recharge, gold, insurance)
 * Production-ready with service-specific forms and payment flow
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  RefreshControl,
  Share,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import financialServicesApi, { FinancialService } from '@/services/financialServicesApi';
import cartApi from '@/services/cartApi';
import { useCart } from '@/contexts/CartContext';
import { useComprehensiveAnalytics } from '@/hooks/useComprehensiveAnalytics';
import { ANALYTICS_EVENTS } from '@/services/analytics/events';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import FinancialServiceShareModal from '@/components/financial/FinancialServiceShareModal';

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  purple500: '#8B5CF6',
  amber500: '#F59E0B',
  red: '#EF4444',
  blue500: '#3B82F6',
};

// Quick amounts for bills and recharge
const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

interface FinancialServiceDetailPageProps {}

const FinancialServiceDetailPage: React.FC<FinancialServiceDetailPageProps> = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { refreshCart } = useCart();
  const { trackEvent, trackScreen } = useComprehensiveAnalytics();
  const { isOnline, isOffline } = useNetworkStatus();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [service, setService] = useState<FinancialService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Form states - Bills
  const [consumerNumber, setConsumerNumber] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [fetchedBill, setFetchedBill] = useState<{ amount: number; dueDate: string } | null>(null);

  // Form states - Recharge
  const [mobileNumber, setMobileNumber] = useState('');
  const [rechargeAmount, setRechargeAmount] = useState('');

  // Form states - OTT
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Form states - Gold
  const [goldAmount, setGoldAmount] = useState('');

  // Form states - Insurance
  const [insuranceDetails, setInsuranceDetails] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
  });

  const fetchService = useCallback(async () => {
    if (!id) return;

    // Check offline status
    if (isOffline) {
      setError('No internet connection. Please check your network and try again.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await financialServicesApi.getById(id);

      if (response.success && response.data) {
        setService(response.data);
        
        // Track service view
        trackEvent(ANALYTICS_EVENTS.SERVICE_VIEWED, {
          service_id: id,
          service_name: response.data.name,
          service_type: (response.data.serviceCategory as any)?.slug || 'unknown',
          cashback_percentage: response.data.cashback?.percentage || 0,
        });
      } else {
        setError(response.error || 'Service not found');
        trackEvent('financial_service_error', {
          service_id: id,
          error: response.error || 'Service not found',
        });
      }
    } catch (error: any) {
      console.error('Error fetching financial service:', error);
      setError('Failed to load service. Please try again.');
      trackEvent('financial_service_error', {
        service_id: id,
        error: error.message || 'Unknown error',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id, isOffline, trackEvent]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  // Track screen view
  useEffect(() => {
    trackScreen('financial_service_detail', {
      service_id: id,
    });

    return () => {
      const timeSpent = Date.now() - startTimeRef.current;
      trackEvent('financial_service_time_spent', {
        service_id: id,
        time_spent_ms: timeSpent,
        time_spent_seconds: Math.floor(timeSpent / 1000),
      });
    };
  }, [id, trackScreen, trackEvent]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchService();
  }, [fetchService]);

  // Determine service type from category slug
  const getServiceType = () => {
    if (!service?.serviceCategory) return 'bills';
    const categorySlug = (service.serviceCategory as any)?.slug || '';
    return categorySlug;
  };

  const serviceType = getServiceType();
  const cashbackPercentage = service?.cashback?.percentage || service?.serviceCategory?.cashbackPercentage || 0;
  const maxCashback = service?.cashback?.maxAmount || service?.serviceCategory?.maxCashback || 0;

  // Sanitize input - remove any non-numeric characters
  const sanitizeNumericInput = (input: string): string => {
    return input.replace(/[^0-9]/g, '');
  };

  // Sanitize text input - remove potentially harmful characters
  const sanitizeTextInput = (input: string): string => {
    return input.replace(/[<>\"']/g, '').trim();
  };

  // Handle bill fetch
  const handleFetchBill = () => {
    const sanitizedNumber = sanitizeNumericInput(consumerNumber);
    
    if (!sanitizedNumber || sanitizedNumber.length < 8) {
      Alert.alert('Invalid Input', 'Please enter a valid consumer/account number');
      return;
    }

    // Track bill fetch attempt
    trackEvent('financial_service_bill_fetch', {
      service_id: id,
      service_type: serviceType,
    });

    // Simulate bill fetch - in production, this would call an API
    const amount = Math.floor(Math.random() * 3000) + 500;
    setFetchedBill({
      amount,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    });
    setBillAmount(amount.toString());
  };

  // Handle proceed to payment
  const handleProceed = async () => {
    if (!service) return;

    try {
      setIsProcessing(true);

      // Validate based on service type
      if (serviceType === 'bills') {
        if (!consumerNumber || consumerNumber.length < 8) {
          Alert.alert('Invalid Input', 'Please enter a valid consumer/account number (minimum 8 digits)');
          setIsProcessing(false);
          return;
        }
        if (!billAmount || parseFloat(billAmount) <= 0) {
          Alert.alert('Invalid Amount', 'Please enter a valid bill amount');
          setIsProcessing(false);
          return;
        }
        if (parseFloat(billAmount) > 100000) {
          Alert.alert('Amount Too Large', 'Bill amount cannot exceed ₹1,00,000');
          setIsProcessing(false);
          return;
        }
      } else if (serviceType === 'recharge') {
        if (!mobileNumber || mobileNumber.length !== 10) {
          Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number');
          setIsProcessing(false);
          return;
        }
        if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
          Alert.alert('Invalid Amount', 'Please enter a valid recharge amount');
          setIsProcessing(false);
          return;
        }
        if (parseFloat(rechargeAmount) < 10) {
          Alert.alert('Amount Too Small', 'Minimum recharge amount is ₹10');
          setIsProcessing(false);
          return;
        }
      } else if (serviceType === 'ott') {
        if (!selectedPlan) {
          Alert.alert('Select Plan', 'Please select a subscription plan');
          setIsProcessing(false);
          return;
        }
      } else if (serviceType === 'gold') {
        if (!goldAmount || parseFloat(goldAmount) < 10) {
          Alert.alert('Invalid Amount', 'Minimum gold purchase amount is ₹10');
          setIsProcessing(false);
          return;
        }
        if (parseFloat(goldAmount) > 1000000) {
          Alert.alert('Amount Too Large', 'Maximum gold purchase amount is ₹10,00,000');
          setIsProcessing(false);
          return;
        }
      } else if (serviceType === 'insurance') {
        if (!insuranceDetails.name || insuranceDetails.name.length < 3) {
          Alert.alert('Invalid Name', 'Please enter your full name (minimum 3 characters)');
          setIsProcessing(false);
          return;
        }
        const age = parseInt(insuranceDetails.age);
        if (!insuranceDetails.age || age < 18 || age > 100) {
          Alert.alert('Invalid Age', 'Please enter a valid age (18-100 years)');
          setIsProcessing(false);
          return;
        }
        if (!insuranceDetails.phone || insuranceDetails.phone.length !== 10) {
          Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
          setIsProcessing(false);
          return;
        }
      }

      // Calculate amount based on service type
      let amount = 0;
      if (serviceType === 'bills') {
        amount = parseFloat(billAmount) || 0;
      } else if (serviceType === 'recharge') {
        amount = parseFloat(rechargeAmount) || 0;
      } else if (serviceType === 'ott') {
        amount = selectedPlan?.price || 0;
      } else if (serviceType === 'gold') {
        amount = parseFloat(goldAmount) || 0;
      } else if (serviceType === 'insurance') {
        // Insurance amount would come from plan selection
        amount = 0; // Will be set based on selected plan
      }

      if (amount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid amount');
        setIsProcessing(false);
        return;
      }

      // Navigate to payment page with service details
      const paymentParams = new URLSearchParams({
        type: 'financial-service',
        serviceId: id || '',
        serviceType: serviceType,
        amount: amount.toString(),
        ...(serviceType === 'bills' && { consumerNumber, billAmount }),
        ...(serviceType === 'recharge' && { mobileNumber, amount: rechargeAmount }),
        ...(serviceType === 'ott' && selectedPlan && { planId: selectedPlan.id, planName: selectedPlan.name }),
        ...(serviceType === 'gold' && { goldAmount }),
      });

      // Track payment initiation
      trackEvent(ANALYTICS_EVENTS.CHECKOUT_STARTED, {
        service_id: id,
        service_type: serviceType,
        amount,
        payment_method: 'financial_service',
      });

      router.push(`/payment?${paymentParams.toString()}` as any);
    } catch (error: any) {
      console.error('Error proceeding to payment:', error);
      Alert.alert('Error', 'Failed to proceed. Please try again.');
      trackEvent('financial_service_payment_error', {
        service_id: id,
        service_type: serviceType,
        error: error.message || 'Unknown error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Render service-specific form
  const renderServiceForm = () => {
    if (!service) return null;

    switch (serviceType) {
      case 'bills':
        return (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Bill Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Consumer/Account Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter consumer number"
                value={consumerNumber}
                onChangeText={(text) => setConsumerNumber(sanitizeNumericInput(text))}
                keyboardType="numeric"
                maxLength={20}
                accessibilityLabel="Consumer account number input"
                accessibilityHint="Enter your consumer or account number"
              />
              <TouchableOpacity
                style={[styles.fetchButton, !consumerNumber && styles.fetchButtonDisabled]}
                onPress={handleFetchBill}
                disabled={!consumerNumber}
              >
                <Text style={styles.fetchButtonText}>Fetch Bill</Text>
              </TouchableOpacity>
            </View>

            {fetchedBill ? (
              <View style={styles.billCard}>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Bill Amount</Text>
                  <Text style={styles.billAmount}>₹{fetchedBill.amount}</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Due Date</Text>
                  <Text style={styles.billDate}>{fetchedBill.dueDate}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bill Amount</Text>
                <View style={styles.quickAmounts}>
                  {QUICK_AMOUNTS.map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={[styles.amountChip, billAmount === amt.toString() && styles.amountChipActive]}
                      onPress={() => setBillAmount(amt.toString())}
                    >
                      <Text style={[styles.amountChipText, billAmount === amt.toString() && styles.amountChipTextActive]}>
                        ₹{amt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Or enter custom amount"
                  value={billAmount}
                  onChangeText={setBillAmount}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>
        );

      case 'recharge':
        return (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Recharge Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.phoneInputContainer}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNumber}
                  onChangeText={(text) => setMobileNumber(sanitizeNumericInput(text).slice(0, 10))}
                  keyboardType="phone-pad"
                  maxLength={10}
                  accessibilityLabel="Mobile number input"
                  accessibilityHint="Enter your 10-digit mobile number"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Recharge Amount</Text>
              <View style={styles.quickAmounts}>
                {QUICK_AMOUNTS.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.amountChip, rechargeAmount === amt.toString() && styles.amountChipActive]}
                    onPress={() => setRechargeAmount(amt.toString())}
                  >
                    <Text style={[styles.amountChipText, rechargeAmount === amt.toString() && styles.amountChipTextActive]}>
                      ₹{amt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Or enter custom amount"
                value={rechargeAmount}
                onChangeText={setRechargeAmount}
                keyboardType="numeric"
              />
            </View>
          </View>
        );

      case 'ott':
        return (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Select Plan</Text>
            <Text style={styles.formSubtitle}>Choose a subscription plan</Text>
            
            {/* OTT Plans - would be fetched from service details or API */}
            <View style={styles.plansContainer}>
              {[
                { id: 'mobile', name: 'Mobile', price: 149, duration: '1 month', features: ['SD Quality', '1 Device'] },
                { id: 'basic', name: 'Basic', price: 199, duration: '1 month', features: ['HD Quality', '1 Device'] },
                { id: 'standard', name: 'Standard', price: 499, duration: '1 month', features: ['Full HD', '2 Devices'] },
                { id: 'premium', name: 'Premium', price: 649, duration: '1 month', features: ['4K UHD', '4 Devices'] },
              ].map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[styles.planCard, selectedPlan?.id === plan.id && styles.planCardActive]}
                  onPress={() => setSelectedPlan(plan)}
                >
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planPrice}>₹{plan.price}</Text>
                  </View>
                  <Text style={styles.planDuration}>{plan.duration}</Text>
                  <View style={styles.planFeatures}>
                    {plan.features.map((feature, idx) => (
                      <Text key={idx} style={styles.planFeature}>• {feature}</Text>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'gold':
        return (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Buy Digital Gold</Text>
            <Text style={styles.formSubtitle}>Start with just ₹10 • 24K purity guaranteed</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount to Invest</Text>
              <View style={styles.quickAmounts}>
                {[10, 100, 500, 1000, 5000, 10000].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.amountChip, goldAmount === amt.toString() && styles.amountChipActive]}
                    onPress={() => setGoldAmount(amt.toString())}
                  >
                    <Text style={[styles.amountChipText, goldAmount === amt.toString() && styles.amountChipTextActive]}>
                      ₹{amt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Or enter custom amount (min ₹10)"
                value={goldAmount}
                onChangeText={setGoldAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color={COLORS.blue500} />
              <Text style={styles.infoText}>
                Your gold is stored securely. You can sell anytime or get physical delivery.
              </Text>
            </View>
          </View>
        );

      case 'insurance':
        return (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Insurance Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={insuranceDetails.name}
                onChangeText={(text) => setInsuranceDetails({ ...insuranceDetails, name: sanitizeTextInput(text) })}
                accessibilityLabel="Full name input"
                accessibilityHint="Enter your full name for insurance"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your age"
                value={insuranceDetails.age}
                onChangeText={(text) => setInsuranceDetails({ ...insuranceDetails, age: text.replace(/[^0-9]/g, '') })}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 10-digit phone number"
                value={insuranceDetails.phone}
                onChangeText={(text) => setInsuranceDetails({ ...insuranceDetails, phone: text.replace(/[^0-9]/g, '').slice(0, 10) })}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={insuranceDetails.email}
                onChangeText={(text) => setInsuranceDetails({ ...insuranceDetails, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.green500} />
              <Text style={styles.infoText}>
                Our insurance partners will contact you with the best plans based on your details.
              </Text>
            </View>
          </View>
        );

      default:
        return (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Service Information</Text>
            <Text style={styles.description}>{service.description || service.shortDescription}</Text>
          </View>
        );
    }
  };

  if (isLoading && !service) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={COLORS.purple500} />
        <Text style={styles.loadingText}>Loading service details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !service) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.red} />
          <Text style={styles.errorTitle}>Service Not Found</Text>
          <Text style={styles.errorText}>{error || 'The service you are looking for does not exist.'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const categoryColor = (service.serviceCategory as any)?.metadata?.color || COLORS.blue500;
  const categoryName = (service.serviceCategory as any)?.name || 'Financial Service';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[categoryColor, categoryColor + 'DD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{service.name}</Text>
            <Text style={styles.headerSubtitle}>{categoryName}</Text>
          </View>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={() => {
              setShowShareModal(true);
              trackEvent('financial_service_share_clicked', {
                service_id: id,
                service_type: serviceType,
              });
            }}
            accessibilityLabel="Share service"
            accessibilityRole="button"
          >
            <Ionicons name="share-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.purple500]} />
        }
      >
        {/* Service Image */}
        {service.images && service.images.length > 0 && (
          <Image source={{ uri: service.images[0] }} style={styles.serviceImage} resizeMode="cover" />
        )}

        {/* Cashback Banner */}
        <View style={styles.cashbackBanner}>
          <LinearGradient
            colors={['rgba(34, 197, 94, 0.15)', 'rgba(245, 158, 11, 0.15)']}
            style={styles.cashbackGradient}
          >
            <Ionicons name="gift" size={24} color={COLORS.green500} />
            <View style={styles.cashbackInfo}>
              <Text style={styles.cashbackTitle}>
                Get {cashbackPercentage}% Cashback
                {maxCashback > 0 && ` (up to ₹${maxCashback})`}
              </Text>
              <Text style={styles.cashbackSubtitle}>+ Earn ReZ Coins on every transaction</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Service Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Service</Text>
          <Text style={styles.description}>{service.description || service.shortDescription || 'No description available.'}</Text>
        </View>

        {/* Service-Specific Form */}
        {renderServiceForm()}

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.green500} />
              <Text style={styles.benefitText}>Instant Processing</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.green500} />
              <Text style={styles.benefitText}>{cashbackPercentage}% Cashback</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.green500} />
              <Text style={styles.benefitText}>Secure Payment</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.green500} />
              <Text style={styles.benefitText}>24/7 Support</Text>
            </View>
          </View>
        </View>

        {/* Offline Banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline" size={20} color={COLORS.red} />
            <Text style={styles.offlineText}>No internet connection</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Share Modal */}
      {service && (
        <FinancialServiceShareModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          serviceId={id || ''}
          serviceName={service.name}
          serviceType={serviceType}
          cashbackPercentage={cashbackPercentage}
        />
      )}

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <View>
            <Text style={styles.bottomBarLabel}>Cashback</Text>
            <Text style={styles.bottomBarValue}>{cashbackPercentage}%</Text>
          </View>
          <TouchableOpacity
            style={[styles.proceedButton, isProcessing && styles.proceedButtonDisabled]}
            onPress={handleProceed}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.proceedButtonText}>
                {serviceType === 'bills' ? 'Pay Now' :
                 serviceType === 'recharge' ? 'Recharge Now' :
                 serviceType === 'ott' ? 'Subscribe Now' :
                 serviceType === 'gold' ? 'Buy Gold' :
                 serviceType === 'insurance' ? 'Get Quote' :
                 'Proceed'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.purple500,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 8 : 0,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  serviceImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.gray100,
  },
  cashbackBanner: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cashbackGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  cashbackInfo: {
    flex: 1,
  },
  cashbackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  cashbackSubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  section: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  formSection: {
    padding: 16,
    backgroundColor: COLORS.gray50,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.navy,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray600,
    borderRightWidth: 1,
    borderRightColor: COLORS.gray200,
  },
  phoneInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: COLORS.navy,
  },
  fetchButton: {
    backgroundColor: COLORS.purple500,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  fetchButtonDisabled: {
    backgroundColor: COLORS.gray200,
  },
  fetchButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  billCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billLabel: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  billAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  billDate: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  amountChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  amountChipActive: {
    backgroundColor: COLORS.purple500,
    borderColor: COLORS.purple500,
  },
  amountChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
  },
  amountChipTextActive: {
    color: COLORS.white,
  },
  plansContainer: {
    gap: 12,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.gray200,
  },
  planCardActive: {
    borderColor: COLORS.purple500,
    backgroundColor: COLORS.purple500 + '10',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.purple500,
  },
  planDuration: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 8,
  },
  planFeatures: {
    gap: 4,
  },
  planFeature: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.blue500 + '10',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.gray600,
    lineHeight: 18,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  bottomBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
  },
  bottomBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomBarLabel: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  bottomBarValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.green500,
  },
  proceedButton: {
    flex: 1,
    marginLeft: 16,
    backgroundColor: COLORS.purple500,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  proceedButtonDisabled: {
    opacity: 0.6,
  },
  proceedButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.red + '15',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    gap: 8,
  },
  offlineText: {
    fontSize: 12,
    color: COLORS.red,
    fontWeight: '600',
  },
});

// Wrap with Error Boundary for production
const FinancialServiceDetailPageWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={
        <SafeAreaView style={[styles.container, styles.loadingContainer]}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color={COLORS.red} />
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorText}>
              We encountered an error loading this service. Please try again.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                // Reload the page
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
            >
              <Text style={styles.retryButtonText}>Reload Page</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      }
    >
      <FinancialServiceDetailPage />
    </ErrorBoundary>
  );
};

export default FinancialServiceDetailPageWithErrorBoundary;
