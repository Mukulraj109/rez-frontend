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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import {
  PaymentMethod,
  PaymentMethodType,
  CardType,
  CardBrand,
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
  const [selectedType, setSelectedType] = useState<PaymentMethodType>('CARD');

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardNickname, setCardNickname] = useState('');

  // UPI Form State
  const [upiVpa, setUpiVpa] = useState('');
  const [upiNickname, setUpiNickname] = useState('');

  const resetForm = () => {
    setCardNumber('');
    setCardholderName('');
    setExpiryMonth('');
    setExpiryYear('');
    setCvv('');
    setCardNickname('');
    setUpiVpa('');
    setUpiNickname('');
  };

  const handleOpenAddModal = (type: PaymentMethodType = 'CARD') => {
    resetForm();
    setSelectedType(type);
    setEditingMethod(null);
    setModalMode('add');
  };

  const handleOpenEditModal = (method: PaymentMethod) => {
    resetForm();
    setEditingMethod(method);
    setSelectedType(method.type);

    if (method.type === 'CARD' && method.card) {
      setCardNickname(method.card.nickname || '');
      setCardholderName(method.card.cardholderName || '');
    } else if (method.type === 'UPI' && method.upi) {
      setUpiVpa(method.upi.vpa || '');
      setUpiNickname(method.upi.nickname || '');
    }

    setModalMode('edit');
  };

  const handleSavePaymentMethod = async () => {
    try {
      if (modalMode === 'edit' && editingMethod) {
        // Edit mode - only update nickname
        if (selectedType === 'CARD') {
          await updatePaymentMethod(editingMethod.id, {
            card: { nickname: cardNickname },
          });
          Alert.alert('Success', 'Payment method updated successfully');
        } else if (selectedType === 'UPI') {
          await updatePaymentMethod(editingMethod.id, {
            upi: { nickname: upiNickname },
          });
          Alert.alert('Success', 'Payment method updated successfully');
        }
      } else {
        // Add mode
        if (selectedType === 'CARD') {
          if (!cardNumber || !cardholderName || !expiryMonth || !expiryYear) {
            Alert.alert('Error', 'Please fill in all card details');
            return;
          }

          const data: PaymentMethodCreate = {
            type: 'CARD',
            card: {
              type: 'CREDIT' as CardType,
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
        } else if (selectedType === 'UPI') {
          if (!upiVpa) {
            Alert.alert('Error', 'Please enter UPI ID');
            return;
          }

          const data: PaymentMethodCreate = {
            type: 'UPI',
            upi: {
              vpa: upiVpa,
              nickname: upiNickname,
              isVerified: false,
            },
          };

          await addPaymentMethod(data);
          Alert.alert('Success', 'UPI added successfully');
        }
      }

      setModalMode(null);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save payment method');
    }
  };

  const handleDeletePaymentMethod = (method: PaymentMethod) => {
    const methodName = method.type === 'CARD'
      ? `Card ending ${method.card?.lastFourDigits}`
      : method.type === 'UPI'
      ? method.upi?.vpa
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
    if (num.startsWith('4')) return 'VISA';
    if (num.startsWith('5')) return 'MASTERCARD';
    if (num.startsWith('3')) return 'AMEX';
    if (num.startsWith('6')) return 'RUPAY';
    return 'OTHER';
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const getCardBrandIcon = (brand?: CardBrand): string => {
    switch (brand) {
      case 'VISA': return 'card';
      case 'MASTERCARD': return 'card';
      case 'AMEX': return 'card';
      case 'RUPAY': return 'card';
      default: return 'card-outline';
    }
  };

  const getCardBrandColor = (brand?: CardBrand): string => {
    switch (brand) {
      case 'VISA': return '#1A365D';
      case 'MASTERCARD': return '#EB001B';
      case 'AMEX': return '#006FCF';
      case 'RUPAY': return '#097969';
      default: return '#6B7280';
    }
  };

  const renderPaymentCard = (method: PaymentMethod) => {
    if (method.type === 'CARD' && method.card) {
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

    if (method.type === 'UPI' && method.upi) {
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

    return null;
  };

  return (
    <View style={styles.container}>
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

          <TouchableOpacity style={styles.addButton} onPress={() => handleOpenAddModal('CARD')}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick Add Buttons */}
      <View style={styles.quickAddContainer}>
        <TouchableOpacity
          style={styles.quickAddButton}
          onPress={() => handleOpenAddModal('CARD')}
        >
          <Ionicons name="card" size={20} color="#8B5CF6" />
          <ThemedText style={styles.quickAddText}>Add Card</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAddButton}
          onPress={() => handleOpenAddModal('UPI')}
        >
          <Ionicons name="flash" size={20} color="#F59E0B" />
          <ThemedText style={styles.quickAddText}>Add UPI</ThemedText>
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
                      selectedType === 'CARD' && styles.typeOptionActive,
                    ]}
                    onPress={() => setSelectedType('CARD')}
                  >
                    <Ionicons
                      name="card"
                      size={20}
                      color={selectedType === 'CARD' ? 'white' : '#6B7280'}
                    />
                    <ThemedText
                      style={[
                        styles.typeOptionText,
                        selectedType === 'CARD' && styles.typeOptionTextActive,
                      ]}
                    >
                      Card
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      selectedType === 'UPI' && styles.typeOptionActive,
                    ]}
                    onPress={() => setSelectedType('UPI')}
                  >
                    <Ionicons
                      name="flash"
                      size={20}
                      color={selectedType === 'UPI' ? 'white' : '#6B7280'}
                    />
                    <ThemedText
                      style={[
                        styles.typeOptionText,
                        selectedType === 'UPI' && styles.typeOptionTextActive,
                      ]}
                    >
                      UPI
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {selectedType === 'CARD' && (
                <>
                  {modalMode === 'add' && (
                    <>
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

              {selectedType === 'UPI' && (
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

              <TouchableOpacity style={styles.saveButton} onPress={handleSavePaymentMethod}>
                <ThemedText style={styles.saveButtonText}>
                  {modalMode === 'edit' ? 'Update' : 'Save Payment Method'}
                </ThemedText>
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
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});