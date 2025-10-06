// Payment Methods Management Screen
// Full CRUD operations for saved payment methods

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import {
  PaymentMethod,
  PaymentMethodType,
  CardType,
  CardBrand,
  BankAccountType,
  PaymentMethodCreate,
} from '@/services/paymentMethodApi';

type ModalMode = 'add' | 'edit' | null;

export default function PaymentMethodsManagementPage() {
  const router = useRouter();
  const {
    paymentMethods,
    isLoading,
    refetch,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    defaultPaymentMethod,
  } = usePaymentMethods(true);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [selectedType, setSelectedType] = useState<PaymentMethodType>(PaymentMethodType.CARD);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState<CardType>(CardType.CREDIT);
  const [cardNickname, setCardNickname] = useState('');

  // UPI Form State
  const [upiVpa, setUpiVpa] = useState('');
  const [upiNickname, setUpiNickname] = useState('');

  // Bank Account Form State
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfscCode, setBankIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountType, setBankAccountType] = useState<BankAccountType>(BankAccountType.SAVINGS);
  const [bankAccountHolderName, setBankAccountHolderName] = useState('');
  const [bankNickname, setBankNickname] = useState('');

  // Validation Functions
  const validateLuhn = (cardNumber: string): boolean => {
    const digits = cardNumber.replace(/\s/g, '');
    if (!/^\d+$/.test(digits)) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  const validateExpiryDate = (month: string, year: string): { valid: boolean; error?: string } => {
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return { valid: false, error: 'Invalid month (1-12)' };
    }

    if (isNaN(yearNum) || year.length !== 4) {
      return { valid: false, error: 'Invalid year (YYYY format)' };
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return { valid: false, error: 'Card has expired' };
    }

    return { valid: true };
  };

  const validateUpiVpa = (vpa: string): { valid: boolean; error?: string } => {
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (!upiRegex.test(vpa)) {
      return { valid: false, error: 'Invalid UPI format (e.g., user@provider)' };
    }
    return { valid: true };
  };

  const validateIFSC = (ifsc: string): { valid: boolean; error?: string } => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifsc.toUpperCase())) {
      return { valid: false, error: 'Invalid IFSC code format' };
    }
    return { valid: true };
  };

  const resetForm = () => {
    // Card fields
    setCardNumber('');
    setCardholderName('');
    setExpiryMonth('');
    setExpiryYear('');
    setCvv('');
    setCardType(CardType.CREDIT);
    setCardNickname('');

    // UPI fields
    setUpiVpa('');
    setUpiNickname('');

    // Bank account fields
    setBankAccountNumber('');
    setBankIfscCode('');
    setBankName('');
    setBankAccountType(BankAccountType.SAVINGS);
    setBankAccountHolderName('');
    setBankNickname('');

    // Error state
    setFormError(null);
    setActionLoading(false);
  };

  const handleOpenAddModal = (type: PaymentMethodType = PaymentMethodType.CARD) => {
    resetForm();
    setSelectedType(type);
    setEditingMethod(null);
    setModalMode('add');
  };

  const handleOpenEditModal = (method: PaymentMethod) => {
    resetForm();
    setEditingMethod(method);
    setSelectedType(method.type);

    if (method.type === PaymentMethodType.CARD && method.card) {
      setCardNickname(method.card.nickname || '');
      setCardholderName(method.card.cardholderName || '');
    } else if (method.type === PaymentMethodType.UPI && method.upi) {
      setUpiVpa(method.upi.vpa || '');
      setUpiNickname(method.upi.nickname || '');
    } else if (method.type === PaymentMethodType.BANK_ACCOUNT && method.bankAccount) {
      setBankNickname(method.bankAccount.nickname || '');
    }

    setModalMode('edit');
  };

  const handleSavePaymentMethod = async () => {
    setActionLoading(true);
    setFormError(null);

    try {
      if (modalMode === 'edit' && editingMethod) {
        // Edit mode - only update nickname
        if (selectedType === PaymentMethodType.CARD) {
          await updatePaymentMethod(editingMethod.id, {
            card: { nickname: cardNickname },
          });
          Alert.alert('Success', 'Payment method updated successfully');
        } else if (selectedType === PaymentMethodType.UPI) {
          await updatePaymentMethod(editingMethod.id, {
            upi: { nickname: upiNickname },
          });
          Alert.alert('Success', 'Payment method updated successfully');
        } else if (selectedType === PaymentMethodType.BANK_ACCOUNT) {
          await updatePaymentMethod(editingMethod.id, {
            bankAccount: { nickname: bankNickname },
          });
          Alert.alert('Success', 'Payment method updated successfully');
        }
      } else {
        // Add mode - validate and add new payment method
        if (selectedType === PaymentMethodType.CARD) {
          // Validate all required fields
          if (!cardNumber || !cardholderName || !expiryMonth || !expiryYear || !cvv) {
            setFormError('Please fill in all required card details');
            return;
          }

          // Validate card number with Luhn algorithm
          if (!validateLuhn(cardNumber)) {
            setFormError('Invalid card number. Please check and try again.');
            return;
          }

          // Validate expiry date
          const expiryValidation = validateExpiryDate(expiryMonth, expiryYear);
          if (!expiryValidation.valid) {
            setFormError(expiryValidation.error || 'Invalid expiry date');
            return;
          }

          // Validate CVV
          if (!/^\d{3,4}$/.test(cvv)) {
            setFormError('CVV must be 3 or 4 digits');
            return;
          }

          const data: PaymentMethodCreate = {
            type: PaymentMethodType.CARD,
            card: {
              type: cardType,
              brand: detectCardBrand(cardNumber),
              cardNumber: cardNumber.replace(/\s/g, ''),
              expiryMonth: parseInt(expiryMonth),
              expiryYear: parseInt(expiryYear),
              cardholderName,
              nickname: cardNickname,
            },
          };

          await addPaymentMethod(data);
          Alert.alert('Success', 'Card added successfully');
        } else if (selectedType === PaymentMethodType.UPI) {
          if (!upiVpa) {
            setFormError('Please enter UPI ID');
            return;
          }

          // Validate UPI VPA format
          const upiValidation = validateUpiVpa(upiVpa);
          if (!upiValidation.valid) {
            setFormError(upiValidation.error || 'Invalid UPI ID');
            return;
          }

          const data: PaymentMethodCreate = {
            type: PaymentMethodType.UPI,
            upi: {
              vpa: upiVpa,
              nickname: upiNickname,
              isVerified: false,
            },
          };

          await addPaymentMethod(data);
          Alert.alert('Success', 'UPI added successfully');
        } else if (selectedType === PaymentMethodType.BANK_ACCOUNT) {
          // Validate all required fields
          if (!bankName || !bankAccountHolderName || !bankAccountNumber || !bankIfscCode) {
            setFormError('Please fill in all required bank account details');
            return;
          }

          // Validate IFSC code
          const ifscValidation = validateIFSC(bankIfscCode);
          if (!ifscValidation.valid) {
            setFormError(ifscValidation.error || 'Invalid IFSC code');
            return;
          }

          const data: PaymentMethodCreate = {
            type: PaymentMethodType.BANK_ACCOUNT,
            bankAccount: {
              accountNumber: bankAccountNumber,
              ifscCode: bankIfscCode.toUpperCase(),
              bankName,
              accountType: bankAccountType,
              nickname: bankNickname,
              isVerified: false,
            },
          };

          await addPaymentMethod(data);
          Alert.alert('Success', 'Bank account added successfully');
        }
      }

      setModalMode(null);
      resetForm();
    } catch (error) {
      setFormError('Failed to save payment method. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePaymentMethod = (method: PaymentMethod) => {
    const methodName = method.type === PaymentMethodType.CARD
      ? `Card ending ${method.card?.lastFourDigits}`
      : method.type === PaymentMethodType.UPI
      ? method.upi?.vpa
      : method.type === PaymentMethodType.BANK_ACCOUNT
      ? `Bank account ${method.bankAccount?.bankName}`
      : 'Payment method';

    Alert.alert(
      'Delete Payment Method',
      `Are you sure you want to delete ${methodName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deletePaymentMethod(method.id);
            if (success) {
              Alert.alert('Success', 'Payment method deleted');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (method: PaymentMethod) => {
    if (method.isDefault) return;
    const success = await setDefaultPaymentMethod(method.id);
    if (success) {
      Alert.alert('Success', 'Default payment method updated');
    }
  };

  const detectCardBrand = (cardNumber: string): CardBrand => {
    const num = cardNumber.replace(/\s/g, '');
    if (num.startsWith('4')) return CardBrand.VISA;
    if (num.startsWith('5')) return CardBrand.MASTERCARD;
    if (num.startsWith('3')) return CardBrand.AMEX;
    if (num.startsWith('6')) return CardBrand.RUPAY;
    return CardBrand.OTHER;
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const getCardBrandIcon = (brand?: CardBrand): string => {
    switch (brand) {
      case CardBrand.VISA: return 'card';
      case CardBrand.MASTERCARD: return 'card';
      case CardBrand.AMEX: return 'card';
      case CardBrand.RUPAY: return 'card';
      default: return 'card-outline';
    }
  };

  const getCardBrandColor = (brand?: CardBrand): string => {
    switch (brand) {
      case CardBrand.VISA: return '#1A365D';
      case CardBrand.MASTERCARD: return '#EB001B';
      case CardBrand.AMEX: return '#006FCF';
      case CardBrand.RUPAY: return '#097969';
      default: return '#6B7280';
    }
  };

  const renderPaymentCard = (method: PaymentMethod) => {
    if (method.type === PaymentMethodType.CARD && method.card) {
      const brandColor = getCardBrandColor(method.card.brand);

      return (
        <View key={method.id} style={styles.paymentCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconRow}>
              <View style={[styles.cardIcon, { backgroundColor: `${brandColor}20` }]}>
                <Ionicons
                  name={getCardBrandIcon(method.card.brand) as any}
                  size={24}
                  color={brandColor}
                />
              </View>
              <View style={styles.cardInfo}>
                <ThemedText style={styles.cardBrand}>{method.card.brand}</ThemedText>
                <ThemedText style={styles.cardNumber}>
                  •••• {method.card.lastFourDigits}
                </ThemedText>
              </View>
            </View>

            {method.isDefault && (
              <View style={styles.defaultBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <ThemedText style={styles.defaultText}>Default</ThemedText>
              </View>
            )}
          </View>

          <View style={styles.cardDetails}>
            <ThemedText style={styles.cardholderName}>{method.card.cardholderName}</ThemedText>
            <ThemedText style={styles.cardExpiry}>
              Expires: {method.card.expiryMonth}/{method.card.expiryYear}
            </ThemedText>
            {method.card.nickname && (
              <ThemedText style={styles.cardNickname}>{method.card.nickname}</ThemedText>
            )}
          </View>

          <View style={styles.cardActions}>
            {!method.isDefault && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleSetDefault(method)}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
                <ThemedText style={styles.actionText}>Set Default</ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleOpenEditModal(method)}
            >
              <Ionicons name="create-outline" size={18} color="#3B82F6" />
              <ThemedText style={styles.actionText}>Edit</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeletePaymentMethod(method)}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <ThemedText style={styles.actionText}>Delete</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (method.type === PaymentMethodType.UPI && method.upi) {
      return (
        <View key={method.id} style={styles.paymentCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconRow}>
              <View style={[styles.cardIcon, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="flash" size={24} color="#F59E0B" />
              </View>
              <View style={styles.cardInfo}>
                <ThemedText style={styles.cardBrand}>UPI</ThemedText>
                <ThemedText style={styles.cardNumber}>{method.upi.vpa}</ThemedText>
              </View>
            </View>

            {method.isDefault && (
              <View style={styles.defaultBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <ThemedText style={styles.defaultText}>Default</ThemedText>
              </View>
            )}
          </View>

          {method.upi.nickname && (
            <View style={styles.cardDetails}>
              <ThemedText style={styles.cardNickname}>{method.upi.nickname}</ThemedText>
            </View>
          )}

          <View style={styles.cardActions}>
            {!method.isDefault && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleSetDefault(method)}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
                <ThemedText style={styles.actionText}>Set Default</ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleOpenEditModal(method)}
            >
              <Ionicons name="create-outline" size={18} color="#3B82F6" />
              <ThemedText style={styles.actionText}>Edit</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeletePaymentMethod(method)}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <ThemedText style={styles.actionText}>Delete</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (method.type === PaymentMethodType.BANK_ACCOUNT && method.bankAccount) {
      // Extract last 4 digits from account number (it should be masked from backend)
      const accountNumberDisplay = method.bankAccount.accountNumber.slice(-4);

      return (
        <View key={method.id} style={styles.paymentCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconRow}>
              <View style={[styles.cardIcon, { backgroundColor: '#3B82F620' }]}>
                <Ionicons name="business" size={24} color="#3B82F6" />
              </View>
              <View style={styles.cardInfo}>
                <ThemedText style={styles.cardBrand}>{method.bankAccount.bankName}</ThemedText>
                <ThemedText style={styles.cardNumber}>
                  •••• {accountNumberDisplay}
                </ThemedText>
              </View>
            </View>

            {method.isDefault && (
              <View style={styles.defaultBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <ThemedText style={styles.defaultText}>Default</ThemedText>
              </View>
            )}
          </View>

          <View style={styles.cardDetails}>
            <ThemedText style={styles.cardExpiry}>
              {method.bankAccount.accountType} • IFSC: {method.bankAccount.ifscCode}
            </ThemedText>
            {method.bankAccount.nickname && (
              <ThemedText style={styles.cardNickname}>{method.bankAccount.nickname}</ThemedText>
            )}
          </View>

          <View style={styles.cardActions}>
            {!method.isDefault && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleSetDefault(method)}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
                <ThemedText style={styles.actionText}>Set Default</ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleOpenEditModal(method)}
            >
              <Ionicons name="create-outline" size={18} color="#3B82F6" />
              <ThemedText style={styles.actionText}>Edit</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeletePaymentMethod(method)}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <ThemedText style={styles.actionText}>Delete</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <ThemedText style={styles.headerTitle}>Payment Methods</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {paymentMethods.length} {paymentMethods.length === 1 ? 'method' : 'methods'} saved
            </ThemedText>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={() => handleOpenAddModal(PaymentMethodType.CARD)}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick Add Buttons */}
      <View style={styles.quickAddContainer}>
        <TouchableOpacity
          style={styles.quickAddButton}
          onPress={() => handleOpenAddModal(PaymentMethodType.CARD)}
        >
          <Ionicons name="card" size={20} color="#8B5CF6" />
          <ThemedText style={styles.quickAddText}>Card</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAddButton}
          onPress={() => handleOpenAddModal(PaymentMethodType.UPI)}
        >
          <Ionicons name="flash" size={20} color="#F59E0B" />
          <ThemedText style={styles.quickAddText}>UPI</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAddButton}
          onPress={() => handleOpenAddModal(PaymentMethodType.BANK_ACCOUNT)}
        >
          <Ionicons name="business" size={20} color="#3B82F6" />
          <ThemedText style={styles.quickAddText}>Bank</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Payment Methods List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {isLoading && paymentMethods.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>Loading payment methods...</ThemedText>
          </View>
        ) : paymentMethods.length > 0 ? (
          paymentMethods.map(renderPaymentCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>No payment methods saved</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Add a payment method to make checkout faster
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalMode !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setModalMode(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {modalMode === 'edit' ? 'Edit Payment Method' : 'Add Payment Method'}
              </ThemedText>
              <TouchableOpacity onPress={() => setModalMode(null)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              {modalMode === 'add' && (
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      selectedType === PaymentMethodType.CARD && styles.typeOptionActive,
                    ]}
                    onPress={() => setSelectedType(PaymentMethodType.CARD)}
                  >
                    <Ionicons
                      name="card"
                      size={20}
                      color={selectedType === PaymentMethodType.CARD ? 'white' : '#6B7280'}
                    />
                    <ThemedText
                      style={[
                        styles.typeOptionText,
                        selectedType === PaymentMethodType.CARD && styles.typeOptionTextActive,
                      ]}
                    >
                      Card
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      selectedType === PaymentMethodType.UPI && styles.typeOptionActive,
                    ]}
                    onPress={() => setSelectedType(PaymentMethodType.UPI)}
                  >
                    <Ionicons
                      name="flash"
                      size={20}
                      color={selectedType === PaymentMethodType.UPI ? 'white' : '#6B7280'}
                    />
                    <ThemedText
                      style={[
                        styles.typeOptionText,
                        selectedType === PaymentMethodType.UPI && styles.typeOptionTextActive,
                      ]}
                    >
                      UPI
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      selectedType === PaymentMethodType.BANK_ACCOUNT && styles.typeOptionActive,
                    ]}
                    onPress={() => setSelectedType(PaymentMethodType.BANK_ACCOUNT)}
                  >
                    <Ionicons
                      name="business"
                      size={20}
                      color={selectedType === PaymentMethodType.BANK_ACCOUNT ? 'white' : '#6B7280'}
                    />
                    <ThemedText
                      style={[
                        styles.typeOptionText,
                        selectedType === PaymentMethodType.BANK_ACCOUNT && styles.typeOptionTextActive,
                      ]}
                    >
                      Bank
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {/* Error Banner */}
              {formError && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={20} color="#DC2626" />
                  <ThemedText style={styles.errorText}>{formError}</ThemedText>
                </View>
              )}

              {selectedType === PaymentMethodType.CARD && (
                <>
                  {modalMode === 'add' && (
                    <>
                      <ThemedText style={styles.label}>Card Type *</ThemedText>
                      <View style={styles.cardTypeSelector}>
                        <TouchableOpacity
                          style={[
                            styles.cardTypeOption,
                            cardType === CardType.CREDIT && styles.cardTypeOptionActive,
                          ]}
                          onPress={() => setCardType(CardType.CREDIT)}
                        >
                          <ThemedText
                            style={[
                              styles.cardTypeOptionText,
                              cardType === CardType.CREDIT && styles.cardTypeOptionTextActive,
                            ]}
                          >
                            Credit Card
                          </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.cardTypeOption,
                            cardType === CardType.DEBIT && styles.cardTypeOptionActive,
                          ]}
                          onPress={() => setCardType(CardType.DEBIT)}
                        >
                          <ThemedText
                            style={[
                              styles.cardTypeOptionText,
                              cardType === CardType.DEBIT && styles.cardTypeOptionTextActive,
                            ]}
                          >
                            Debit Card
                          </ThemedText>
                        </TouchableOpacity>
                      </View>

                      <ThemedText style={styles.label}>Card Number *</ThemedText>
                      <TextInput
                        style={styles.input}
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                        keyboardType="numeric"
                        maxLength={19}
                      />

                      <ThemedText style={styles.label}>Cardholder Name *</ThemedText>
                      <TextInput
                        style={styles.input}
                        placeholder="Name on card"
                        value={cardholderName}
                        onChangeText={setCardholderName}
                        autoCapitalize="words"
                      />

                      <View style={styles.row}>
                        <View style={styles.halfWidth}>
                          <ThemedText style={styles.label}>Expiry Month *</ThemedText>
                          <TextInput
                            style={styles.input}
                            placeholder="MM"
                            value={expiryMonth}
                            onChangeText={setExpiryMonth}
                            keyboardType="numeric"
                            maxLength={2}
                          />
                        </View>
                        <View style={styles.halfWidth}>
                          <ThemedText style={styles.label}>Expiry Year *</ThemedText>
                          <TextInput
                            style={styles.input}
                            placeholder="YYYY"
                            value={expiryYear}
                            onChangeText={setExpiryYear}
                            keyboardType="numeric"
                            maxLength={4}
                          />
                        </View>
                      </View>

                      <ThemedText style={styles.label}>CVV *</ThemedText>
                      <TextInput
                        style={styles.input}
                        placeholder="123"
                        value={cvv}
                        onChangeText={setCvv}
                        keyboardType="numeric"
                        maxLength={4}
                        secureTextEntry={true}
                      />
                    </>
                  )}

                  <ThemedText style={styles.label}>Card Nickname (Optional)</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Work Card, Personal Card"
                    value={cardNickname}
                    onChangeText={setCardNickname}
                  />
                </>
              )}

              {selectedType === PaymentMethodType.UPI && (
                <>
                  {modalMode === 'add' && (
                    <>
                      <ThemedText style={styles.label}>UPI ID *</ThemedText>
                      <TextInput
                        style={styles.input}
                        placeholder="yourname@upi"
                        value={upiVpa}
                        onChangeText={setUpiVpa}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </>
                  )}

                  <ThemedText style={styles.label}>UPI Nickname (Optional)</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Primary UPI"
                    value={upiNickname}
                    onChangeText={setUpiNickname}
                  />
                </>
              )}

              {selectedType === PaymentMethodType.BANK_ACCOUNT && (
                <>
                  {modalMode === 'add' && (
                    <>
                      <ThemedText style={styles.label}>Bank Name *</ThemedText>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g., State Bank of India"
                        value={bankName}
                        onChangeText={setBankName}
                        autoCapitalize="words"
                      />

                      <ThemedText style={styles.label}>Account Holder Name *</ThemedText>
                      <TextInput
                        style={styles.input}
                        placeholder="Name as per bank account"
                        value={bankAccountHolderName}
                        onChangeText={setBankAccountHolderName}
                        autoCapitalize="words"
                      />

                      <ThemedText style={styles.label}>Account Number *</ThemedText>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter account number"
                        value={bankAccountNumber}
                        onChangeText={setBankAccountNumber}
                        keyboardType="numeric"
                      />

                      <ThemedText style={styles.label}>IFSC Code *</ThemedText>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g., SBIN0001234"
                        value={bankIfscCode}
                        onChangeText={(text) => setBankIfscCode(text.toUpperCase())}
                        autoCapitalize="characters"
                        maxLength={11}
                      />

                      <ThemedText style={styles.label}>Account Type *</ThemedText>
                      <View style={styles.accountTypeToggle}>
                        <TouchableOpacity
                          style={[
                            styles.accountTypeOption,
                            bankAccountType === BankAccountType.SAVINGS && styles.accountTypeOptionActive,
                          ]}
                          onPress={() => setBankAccountType(BankAccountType.SAVINGS)}
                        >
                          <ThemedText
                            style={[
                              styles.accountTypeOptionText,
                              bankAccountType === BankAccountType.SAVINGS && styles.accountTypeOptionTextActive,
                            ]}
                          >
                            Savings
                          </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.accountTypeOption,
                            bankAccountType === BankAccountType.CURRENT && styles.accountTypeOptionActive,
                          ]}
                          onPress={() => setBankAccountType(BankAccountType.CURRENT)}
                        >
                          <ThemedText
                            style={[
                              styles.accountTypeOptionText,
                              bankAccountType === BankAccountType.CURRENT && styles.accountTypeOptionTextActive,
                            ]}
                          >
                            Current
                          </ThemedText>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  <ThemedText style={styles.label}>Account Nickname (Optional)</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Primary Account"
                    value={bankNickname}
                    onChangeText={setBankNickname}
                  />
                </>
              )}

              <TouchableOpacity
                style={[styles.saveButton, actionLoading && styles.saveButtonDisabled]}
                onPress={handleSavePaymentMethod}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <ThemedText style={styles.saveButtonText}>
                    {modalMode === 'edit' ? 'Update' : 'Save Payment Method'}
                  </ThemedText>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAddContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  quickAddButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  quickAddText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardBrand: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  defaultText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  cardDetails: {
    marginBottom: 12,
  },
  cardholderName: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 13,
    color: '#6B7280',
  },
  cardNickname: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalForm: {
    padding: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  typeOptionActive: {
    backgroundColor: '#8B5CF6',
  },
  typeOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeOptionTextActive: {
    color: 'white',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#C4B5FD',
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // Error Banner Styles
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
  },

  // Card Type Selector Styles
  cardTypeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cardTypeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTypeOptionActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  cardTypeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  cardTypeOptionTextActive: {
    color: 'white',
  },

  // Account Type Toggle Styles
  accountTypeToggle: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  accountTypeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  accountTypeOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  accountTypeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  accountTypeOptionTextActive: {
    color: 'white',
  },
});