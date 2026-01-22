// Modern Payment Page
// Production-ready payment interface for rez-app

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Image,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import paymentService, { PaymentMethod, PaymentResponse } from '@/services/paymentService';
import PaymentValidator from '@/services/paymentValidation';
import financialServicesApi, { FinancialService } from '@/services/financialServicesApi';
import { useRegion } from '@/contexts/RegionContext';

const { width, height } = Dimensions.get('window');

interface PaymentPageProps {}

export default function PaymentPage() {
  const router = useRouter();
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();
  const params = useLocalSearchParams();
  const amount = Number(params.amount) || 5000;
  const currency = (params.currency as string) || 'INR';
  
  // Financial service specific params
  const paymentType = params.type as string;
  const isFinancialService = paymentType === 'financial-service';
  const serviceId = params.serviceId as string;
  const serviceType = params.serviceType as string;

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'methods' | 'details' | 'processing'>('methods');
  
  // Financial service state
  const [financialService, setFinancialService] = useState<FinancialService | null>(null);
  const [isLoadingService, setIsLoadingService] = useState(false);
  
  // Form states
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('');
  const [walletType, setWalletType] = useState('paytm');
  const [bankCode, setBankCode] = useState('');

  // Animation values - start with visible values to prevent invisible content
  const fadeAnim = new Animated.Value(1);
  const slideAnim = new Animated.Value(0);
  const progressAnim = new Animated.Value(0);

  useEffect(() => {
    loadPaymentMethods();
    animateEntrance();
    
    // Load financial service details if applicable
    if (isFinancialService && serviceId) {
      loadFinancialService();
    }
  }, [isFinancialService, serviceId]);
  
  const loadFinancialService = async () => {
    if (!serviceId) return;
    
    setIsLoadingService(true);
    try {
      const response = await financialServicesApi.getById(serviceId);
      if (response.success && response.data) {
        setFinancialService(response.data);
      }
    } catch (error) {
      console.error('Error loading financial service:', error);
    } finally {
      setIsLoadingService(false);
    }
  };

  useEffect(() => {
    if (currentStep === 'processing') {
      animateProgress();
    }
  }, [currentStep]);

  const animateEntrance = () => {
    // Start with slightly transparent and moved up, then animate to full visibility
    fadeAnim.setValue(0.3);
    slideAnim.setValue(20);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateProgress = () => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  };

  const loadPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const response = await paymentService.getPaymentMethods();
      if (response.success && response.data) {
        setPaymentMethods(response.data);
      } else {
      }
    } catch (error) {
      console.error('❌ [Payment] Failed to load payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = useCallback(() => {
    if (currentStep === 'details') {
      setCurrentStep('methods');
      setSelectedMethod(null);
    } else {
      router.back();
    }
  }, [currentStep, router]);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setCurrentStep('details');
  };

  const handleUPIPayment = async () => {
    const validation = PaymentValidator.validateUPIId(upiId);
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    setCurrentStep('processing');
    setIsProcessing(true);
    
    try {
      const response = await paymentService.processUPIPayment(amount, upiId);
      if (response.success && response.data) {
        setTimeout(() => {
          const successMessage = isFinancialService
            ? `Your ${serviceType === 'bills' ? 'bill payment' : 
                     serviceType === 'recharge' ? 'recharge' :
                     serviceType === 'ott' ? 'subscription' :
                     serviceType === 'gold' ? 'gold purchase' :
                     serviceType === 'insurance' ? 'insurance' : 'payment'} of ${currencySymbol}${amount.toLocaleString()} has been processed successfully.`
            : `Your payment of ${currency} ${amount.toLocaleString()} has been processed successfully.`;
          
          Alert.alert(
            'Payment Successful! 🎉',
            successMessage,
            [
              {
                text: 'OK',
                onPress: () => {
                  if (isFinancialService) {
                    // Navigate to order confirmation or service success page
                    router.replace('/financial' as any);
                  } else {
                    router.replace('/WalletScreen');
                  }
                },
              },
            ]
          );
        }, 2000);
      } else {
        throw new Error(response.error || 'UPI payment failed');
      }
    } catch (error) {
      setCurrentStep('details');
      Alert.alert('Payment Failed', error instanceof Error ? error.message : 'UPI payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardPayment = async () => {
    const validation = PaymentValidator.validateCardDetails({
      number: cardNumber,
      expiry: cardExpiry,
      cvv: cardCVV,
      name: cardName,
    });
    
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    setCurrentStep('processing');
    setIsProcessing(true);
    
    try {
      const response = await paymentService.processCardPayment(amount, {
        number: cardNumber,
        expiry: cardExpiry,
        cvv: cardCVV,
        name: cardName,
      });
      
      if (response.success && response.data) {
        setTimeout(() => {
          const successMessage = isFinancialService
            ? `Your ${serviceType === 'bills' ? 'bill payment' : 
                     serviceType === 'recharge' ? 'recharge' :
                     serviceType === 'ott' ? 'subscription' :
                     serviceType === 'gold' ? 'gold purchase' :
                     serviceType === 'insurance' ? 'insurance' : 'payment'} of ${currencySymbol}${amount.toLocaleString()} has been processed successfully.`
            : `Your payment of ${currency} ${amount.toLocaleString()} has been processed successfully.`;
          
          Alert.alert(
            'Payment Successful! 🎉',
            successMessage,
            [
              {
                text: 'OK',
                onPress: () => {
                  if (isFinancialService) {
                    // Navigate to order confirmation or service success page
                    router.replace('/financial' as any);
                  } else {
                    router.replace('/WalletScreen');
                  }
                },
              },
            ]
          );
        }, 2000);
      } else {
        throw new Error(response.error || 'Card payment failed');
      }
    } catch (error) {
      setCurrentStep('details');
      Alert.alert('Payment Failed', error instanceof Error ? error.message : 'Card payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWalletPayment = async () => {
    setCurrentStep('processing');
    setIsProcessing(true);
    
    try {
      const response = await paymentService.processWalletPayment(amount, walletType);
      if (response.success && response.data) {
        setTimeout(() => {
          const successMessage = isFinancialService
            ? `Your ${serviceType === 'bills' ? 'bill payment' : 
                     serviceType === 'recharge' ? 'recharge' :
                     serviceType === 'ott' ? 'subscription' :
                     serviceType === 'gold' ? 'gold purchase' :
                     serviceType === 'insurance' ? 'insurance' : 'payment'} of ${currencySymbol}${amount.toLocaleString()} has been processed successfully.`
            : `Your payment of ${currency} ${amount.toLocaleString()} has been processed successfully.`;
          
          Alert.alert(
            'Payment Successful! 🎉',
            successMessage,
            [
              {
                text: 'OK',
                onPress: () => {
                  if (isFinancialService) {
                    // Navigate to order confirmation or service success page
                    router.replace('/financial' as any);
                  } else {
                    router.replace('/WalletScreen');
                  }
                },
              },
            ]
          );
        }, 2000);
      } else {
        throw new Error(response.error || 'Wallet payment failed');
      }
    } catch (error) {
      setCurrentStep('details');
      Alert.alert('Payment Failed', error instanceof Error ? error.message : 'Wallet payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return 'card-outline';
      case 'upi':
        return 'phone-portrait-outline';
      case 'wallet':
        return 'wallet-outline';
      case 'netbanking':
        return 'business-outline';
      default:
        return 'card-outline';
    }
  };

  const getMethodColor = (type: string) => {
    switch (type) {
      case 'card':
        return '#3B82F6';
      case 'upi':
        return '#00C06A';
      case 'wallet':
        return '#EC4899';
      case 'netbanking':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const renderPaymentMethods = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      accessibilityRole="none"
    >
      <ThemedText
        style={styles.stepTitle}
        accessibilityRole="header"
      >
        Choose Payment Method
      </ThemedText>
      <ThemedText
        style={styles.stepSubtitle}
        accessibilityRole="text"
      >
        Select your preferred payment method to continue
      </ThemedText>

      <View style={styles.methodsGrid}>
        {paymentMethods.map((method, index) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              { borderColor: getMethodColor(method.type) },
            ]}
            onPress={() => {
              handleMethodSelect(method);
            }}
            disabled={!method.isAvailable}
            activeOpacity={0.7}
            accessibilityLabel={`${method.name}${method.description ? `, ${method.description}` : ''}. ${method.processingFee && method.processingFee > 0 ? `Fee: ${method.processingFee} percent` : 'No fee'}. Processing time: ${method.processingTime}`}
            accessibilityRole="button"
            accessibilityHint="Double tap to select this payment method"
            accessibilityState={{ disabled: !method.isAvailable }}
          >
            <View style={[styles.methodIconContainer, { backgroundColor: getMethodColor(method.type) }]}>
              <Ionicons name={getMethodIcon(method.type)} size={24} color="#FFFFFF" />
            </View>
            
            <View style={styles.methodInfo}>
              <ThemedText style={styles.methodName}>{method.name}</ThemedText>
              {method.description && (
                <ThemedText style={styles.methodGateway}>{method.description}</ThemedText>
              )}
              <View style={styles.methodDetails}>
                <ThemedText style={styles.methodFee}>
                  {method.processingFee && method.processingFee > 0 
                    ? `Fee: ${method.processingFee}%` 
                    : 'No fee'
                  }
                </ThemedText>
                <ThemedText style={styles.methodTime}>{method.processingTime}</ThemedText>
              </View>
            </View>

            <View style={styles.methodArrow}>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderPaymentDetails = () => {
    if (!selectedMethod) return null;

    return (
      <Animated.View
        style={[
          styles.stepContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        accessibilityRole="none"
      >
        <View style={styles.methodHeader}>
          <View style={[styles.methodIconContainer, { backgroundColor: getMethodColor(selectedMethod.type) }]}>
            <Ionicons name={getMethodIcon(selectedMethod.type)} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.methodHeaderInfo}>
            <ThemedText style={styles.methodHeaderName}>{selectedMethod.name}</ThemedText>
            {selectedMethod.description && (
              <ThemedText style={styles.methodHeaderGateway}>{selectedMethod.description}</ThemedText>
            )}
          </View>
        </View>

        {selectedMethod.type === 'upi' && (
          <View style={styles.formContainer}>
            <ThemedText
              style={styles.formLabel}
              accessibilityRole="text"
            >
              Enter UPI ID
            </ThemedText>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="user@paytm"
                value={upiId}
                onChangeText={setUpiId}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
                accessibilityLabel="UPI ID input"
                accessibilityHint="Enter your UPI ID, for example user at paytm"
                accessibilityRole="none"
              />
            </View>
            <TouchableOpacity
              style={[styles.payButton, !upiId && styles.disabledButton]}
              onPress={handleUPIPayment}
              disabled={!upiId || isProcessing}
              accessibilityLabel={isProcessing ? 'Processing payment' : `Pay ${currency} ${amount.toLocaleString()} with UPI`}
              accessibilityRole="button"
              accessibilityHint="Double tap to complete payment with UPI"
              accessibilityState={{ disabled: !upiId || isProcessing, busy: isProcessing }}
            >
              <LinearGradient
                colors={['#00796B', '#00C06A'] as const}
                style={styles.payButtonGradient}
              >
                <ThemedText style={styles.payButtonText}>
                  Pay {currency} {amount.toLocaleString()}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {selectedMethod.type === 'card' && (
          <View style={styles.formContainer}>
            <ThemedText
              style={styles.formLabel}
              accessibilityRole="text"
            >
              Card Number
            </ThemedText>
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="1234 5678 9012 3456"
                value={PaymentValidator.formatCardNumber(cardNumber)}
                onChangeText={(text) => setCardNumber(text.replace(/\D/g, ''))}
                keyboardType="numeric"
                maxLength={19}
                placeholderTextColor="#9CA3AF"
                accessibilityLabel="Card number input"
                accessibilityHint="Enter your 16-digit card number"
                accessibilityRole="none"
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfContainer}>
                <ThemedText
                  style={styles.formLabel}
                  accessibilityRole="text"
                >
                  Expiry
                </ThemedText>
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChangeText={(text) => {
                      const formatted = PaymentValidator.formatExpiryDate(text);
                      setCardExpiry(formatted);
                    }}
                    keyboardType="numeric"
                    maxLength={5}
                    placeholderTextColor="#9CA3AF"
                    accessibilityLabel="Card expiry date input"
                    accessibilityHint="Enter card expiry as month and year, M M slash Y Y"
                    accessibilityRole="none"
                  />
                </View>
              </View>

              <View style={styles.halfContainer}>
                <ThemedText
                  style={styles.formLabel}
                  accessibilityRole="text"
                >
                  CVV
                </ThemedText>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="123"
                    value={cardCVV}
                    onChangeText={(text) => setCardCVV(text.replace(/\D/g, ''))}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                    placeholderTextColor="#9CA3AF"
                    accessibilityLabel="Card CVV security code input"
                    accessibilityHint="Enter 3 or 4 digit CVV code on back of card"
                    accessibilityRole="none"
                  />
                </View>
              </View>
            </View>

            <ThemedText
              style={styles.formLabel}
              accessibilityRole="text"
            >
              Cardholder Name
            </ThemedText>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="John Doe"
                value={cardName}
                onChangeText={setCardName}
                autoCapitalize="words"
                placeholderTextColor="#9CA3AF"
                accessibilityLabel="Cardholder name input"
                accessibilityHint="Enter name as it appears on card"
                accessibilityRole="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.payButton, (!cardNumber || !cardExpiry || !cardCVV || !cardName) && styles.disabledButton]}
              onPress={handleCardPayment}
              disabled={!cardNumber || !cardExpiry || !cardCVV || !cardName || isProcessing}
              accessibilityLabel={isProcessing ? 'Processing payment' : `Pay ${currency} ${amount.toLocaleString()} with card`}
              accessibilityRole="button"
              accessibilityHint="Double tap to complete payment with card"
              accessibilityState={{ disabled: !cardNumber || !cardExpiry || !cardCVV || !cardName || isProcessing, busy: isProcessing }}
            >
              <LinearGradient
                colors={['#00796B', '#00C06A'] as const}
                style={styles.payButtonGradient}
              >
                <ThemedText style={styles.payButtonText}>
                  Pay {currency} {amount.toLocaleString()}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {selectedMethod.type === 'wallet' && (
          <View style={styles.formContainer}>
            <ThemedText
              style={styles.formLabel}
              accessibilityRole="text"
            >
              Select Wallet
            </ThemedText>
            <View style={styles.walletGrid}>
              {['paytm', 'phonepe', 'gpay', 'amazonpay'].map((wallet) => (
                <TouchableOpacity
                  key={wallet}
                  style={[
                    styles.walletOption,
                    walletType === wallet && styles.selectedWalletOption,
                  ]}
                  onPress={() => setWalletType(wallet)}
                  accessibilityLabel={`${wallet.toUpperCase()}${walletType === wallet ? ', selected' : ''}`}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: walletType === wallet }}
                  accessibilityHint={`Double tap to select ${wallet.toUpperCase()} wallet`}
                >
                  <View style={[styles.walletIcon, { backgroundColor: getMethodColor('wallet') }]}>
                    <Ionicons name="wallet-outline" size={20} color="#FFFFFF" />
                  </View>
                  <ThemedText style={styles.walletText}>{wallet.toUpperCase()}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.payButton}
              onPress={handleWalletPayment}
              disabled={isProcessing}
              accessibilityLabel={isProcessing ? 'Processing payment' : `Pay with ${walletType.toUpperCase()}`}
              accessibilityRole="button"
              accessibilityHint={`Double tap to complete payment with ${walletType.toUpperCase()} wallet`}
              accessibilityState={{ disabled: isProcessing, busy: isProcessing }}
            >
              <LinearGradient
                colors={['#00796B', '#00C06A'] as const}
                style={styles.payButtonGradient}
              >
                <ThemedText style={styles.payButtonText}>
                  Pay with {walletType.toUpperCase()}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  const renderProcessing = () => (
    <View
      style={styles.processingContainer}
      accessibilityRole="none"
      accessibilityLiveRegion="polite"
      accessibilityLabel="Processing payment, please wait"
    >
      <View
        style={styles.processingIcon}
        accessibilityLabel="Payment processing indicator"
        accessibilityRole="image"
      >
        <Ionicons name="checkmark-circle" size={80} color="#10B981" />
      </View>

      <ThemedText
        style={styles.processingTitle}
        accessibilityRole="header"
      >
        Processing Payment
      </ThemedText>
      <ThemedText
        style={styles.processingSubtitle}
        accessibilityRole="text"
      >
        Please wait while we process your payment...
      </ThemedText>

      <View
        style={styles.progressContainer}
        accessibilityLabel="Payment processing in progress"
        accessibilityRole="progressbar"
      >
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <ThemedText style={styles.progressText}>Processing...</ThemedText>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#00796B" />
        <LinearGradient colors={['#00796B', '#00C06A'] as const} style={styles.headerBg}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              accessibilityLabel="Back to previous screen"
              accessibilityRole="button"
              accessibilityHint="Double tap to go back"
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <ThemedText
              style={styles.headerTitle}
              accessibilityRole="header"
            >
              Payment
            </ThemedText>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <View
          style={styles.loadingContainer}
          accessibilityRole="none"
          accessibilityLiveRegion="polite"
          accessibilityLabel="Loading payment methods"
        >
          <ActivityIndicator
            size="large"
            color="#00796B"
            accessibilityLabel="Loading indicator"
          />
          <ThemedText style={styles.loadingText}>Loading payment methods...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00796B" />
      <LinearGradient colors={['#00796B', '#00C06A'] as const} style={styles.headerBg}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            accessibilityLabel={currentStep === 'details' ? 'Back to payment methods' : 'Back to previous screen'}
            accessibilityRole="button"
            accessibilityHint="Double tap to go back"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText
            style={styles.headerTitle}
            accessibilityRole="header"
          >
            Payment
          </ThemedText>
          <View style={styles.placeholder} />
        </View>
        
        <View
          style={styles.amountSection}
          accessibilityLabel={`Amount to pay: ${currency} ${amount.toLocaleString()}`}
          accessibilityRole="text"
        >
          {isFinancialService && financialService && (
            <View style={styles.serviceInfo}>
              <ThemedText style={styles.serviceName}>{financialService.name}</ThemedText>
              <ThemedText style={styles.serviceType}>
                {serviceType === 'bills' ? 'Bill Payment' :
                 serviceType === 'recharge' ? 'Mobile Recharge' :
                 serviceType === 'ott' ? 'OTT Subscription' :
                 serviceType === 'gold' ? 'Digital Gold' :
                 serviceType === 'insurance' ? 'Insurance' :
                 'Financial Service'}
              </ThemedText>
            </View>
          )}
          <ThemedText style={styles.amountLabel}>Amount to Pay</ThemedText>
          <ThemedText style={styles.amountValue}>
            {currencySymbol}{amount.toLocaleString()}
          </ThemedText>
          {isFinancialService && financialService?.cashback && (
            <ThemedText style={styles.cashbackInfo}>
              Get {financialService.cashback.percentage}% cashback
            </ThemedText>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        alwaysBounceVertical={false}
        accessibilityRole="none"
      >
        {currentStep === 'methods' && renderPaymentMethods()}
        {currentStep === 'details' && renderPaymentDetails()}
        {currentStep === 'processing' && renderProcessing()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBg: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 34,
  },
  amountSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  amountLabel: {
    color: '#E0E7FF',
    fontSize: 14,
    marginBottom: 5,
  },
  amountValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  stepContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#00796B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  methodsGrid: {
    gap: 16,
    marginTop: 8,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 4,
  },
  methodIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  methodGateway: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  methodDetails: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  methodFee: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  methodTime: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  methodArrow: {
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginLeft: 8,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  methodHeaderInfo: {
    marginLeft: 16,
  },
  methodHeaderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  methodHeaderGateway: {
    fontSize: 14,
    color: '#6B7280',
  },
  formContainer: {
    gap: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfContainer: {
    flex: 1,
  },
  walletGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  walletOption: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedWalletOption: {
    borderColor: '#00796B',
    backgroundColor: '#F3F0FF',
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  walletText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  payButton: {
    marginTop: 8,
  },
  payButtonGradient: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  processingIcon: {
    marginBottom: 20,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  processingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00796B',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  serviceInfo: {
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  serviceName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceType: {
    color: '#E0E7FF',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cashbackInfo: {
    color: '#E0E7FF',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
});
