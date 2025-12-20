// Edit Address Modal Component
// Modal form for editing an existing delivery address

import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ACCOUNT_COLORS } from '@/types/account.types';
import { Address, AddressType, AddressUpdate } from '@/services/addressApi';

interface EditAddressModalProps {
  visible: boolean;
  address: Address | null;
  onClose: () => void;
  onUpdate: (id: string, data: AddressUpdate) => Promise<boolean>;
}

export default function EditAddressModal({ visible, address, onClose, onUpdate }: EditAddressModalProps) {
  const [type, setType] = useState<AddressType>(AddressType.HOME);
  const [title, setTitle] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('USA');
  const [instructions, setInstructions] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when address changes
  useEffect(() => {
    if (address) {
      setType(address.type as AddressType);
      setTitle(address.title);
      setAddressLine1(address.addressLine1);
      setAddressLine2(address.addressLine2 || '');
      setCity(address.city);
      setState(address.state);
      setPostalCode(address.postalCode);
      setCountry(address.country || 'USA');
      setInstructions(address.instructions || '');
      setIsDefault(address.isDefault);
    }
  }, [address]);

  const resetForm = () => {
    setType(AddressType.HOME);
    setTitle('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('USA');
    setInstructions('');
    setIsDefault(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter an address title');
      return false;
    }
    if (!addressLine1.trim()) {
      Alert.alert('Validation Error', 'Please enter street address');
      return false;
    }
    if (!city.trim()) {
      Alert.alert('Validation Error', 'Please enter city');
      return false;
    }
    if (!state.trim()) {
      Alert.alert('Validation Error', 'Please enter state');
      return false;
    }
    if (!postalCode.trim()) {
      Alert.alert('Validation Error', 'Please enter postal code');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!address) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const updateData: AddressUpdate = {
        type,
        title: title.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim() || 'USA',
        instructions: instructions.trim() || undefined,
        isDefault,
      };

      const success = await onUpdate(address.id, updateData);
      if (success) {
        handleClose();
        Alert.alert('Success', 'Address updated successfully');
      }
    } catch (error) {
      console.error('Error updating address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addressTypes = [
    { value: AddressType.HOME, label: 'Home', icon: 'home' },
    { value: AddressType.OFFICE, label: 'Office', icon: 'business' },
    { value: AddressType.OTHER, label: 'Other', icon: 'location' },
  ];

  if (!address) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Edit Address</ThemedText>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={ACCOUNT_COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Address Type Selection */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Address Type *</ThemedText>
                <View style={styles.typeSelector}>
                  {addressTypes.map((typeOption) => (
                    <TouchableOpacity
                      key={typeOption.value}
                      style={[
                        styles.typeButton,
                        type === typeOption.value && styles.typeButtonActive,
                      ]}
                      onPress={() => setType(typeOption.value)}
                    >
                      <Ionicons
                        name={typeOption.icon as any}
                        size={20}
                        color={
                          type === typeOption.value
                            ? 'white'
                            : ACCOUNT_COLORS.primary
                        }
                      />
                      <ThemedText
                        style={[
                          styles.typeButtonText,
                          type === typeOption.value && styles.typeButtonTextActive,
                        ]}
                      >
                        {typeOption.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Title */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Address Title *</ThemedText>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g., Home, Office"
                  placeholderTextColor={ACCOUNT_COLORS.textSecondary}
                />
              </View>

              {/* Address Line 1 */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Street Address *</ThemedText>
                <TextInput
                  style={styles.input}
                  value={addressLine1}
                  onChangeText={setAddressLine1}
                  placeholder="Street address"
                  placeholderTextColor={ACCOUNT_COLORS.textSecondary}
                />
              </View>

              {/* Address Line 2 */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Apt, Suite, etc.</ThemedText>
                <TextInput
                  style={styles.input}
                  value={addressLine2}
                  onChangeText={setAddressLine2}
                  placeholder="Apartment, suite, unit (optional)"
                  placeholderTextColor={ACCOUNT_COLORS.textSecondary}
                />
              </View>

              {/* City and State */}
              <View style={styles.row}>
                <View style={[styles.formGroup, styles.rowItem]}>
                  <ThemedText style={styles.label}>City *</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={city}
                    onChangeText={setCity}
                    placeholder="City"
                    placeholderTextColor={ACCOUNT_COLORS.textSecondary}
                  />
                </View>

                <View style={[styles.formGroup, styles.rowItemSmall]}>
                  <ThemedText style={styles.label}>State *</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={state}
                    onChangeText={setState}
                    placeholder="State"
                    placeholderTextColor={ACCOUNT_COLORS.textSecondary}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Postal Code and Country */}
              <View style={styles.row}>
                <View style={[styles.formGroup, styles.rowItemSmall]}>
                  <ThemedText style={styles.label}>Zip Code *</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={postalCode}
                    onChangeText={setPostalCode}
                    placeholder="12345"
                    placeholderTextColor={ACCOUNT_COLORS.textSecondary}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>

                <View style={[styles.formGroup, styles.rowItem]}>
                  <ThemedText style={styles.label}>Country</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={country}
                    onChangeText={setCountry}
                    placeholder="Country"
                    placeholderTextColor={ACCOUNT_COLORS.textSecondary}
                  />
                </View>
              </View>

              {/* Delivery Instructions */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Delivery Instructions</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={instructions}
                  onChangeText={setInstructions}
                  placeholder="Special delivery instructions (optional)"
                  placeholderTextColor={ACCOUNT_COLORS.textSecondary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Set as Default */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setIsDefault(!isDefault)}
              >
                <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
                  {isDefault && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <ThemedText style={styles.checkboxLabel}>
                  Set as default address
                </ThemedText>
              </TouchableOpacity>

              <View style={styles.spacer} />
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <ThemedText style={styles.submitButtonText}>
                  {isSubmitting ? 'Updating...' : 'Update Address'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
);
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: ACCOUNT_COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ACCOUNT_COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: ACCOUNT_COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: ACCOUNT_COLORS.text,
    backgroundColor: ACCOUNT_COLORS.surface,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: ACCOUNT_COLORS.primary,
    backgroundColor: 'white',
  },
  typeButtonActive: {
    backgroundColor: ACCOUNT_COLORS.primary,
    borderColor: ACCOUNT_COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCOUNT_COLORS.primary,
    marginLeft: 6,
  },
  typeButtonTextActive: {
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  rowItemSmall: {
    flex: 0.6,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: ACCOUNT_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: ACCOUNT_COLORS.primary,
    borderColor: ACCOUNT_COLORS.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: ACCOUNT_COLORS.text,
  },
  spacer: {
    height: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: ACCOUNT_COLORS.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: ACCOUNT_COLORS.surface,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: ACCOUNT_COLORS.primary,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
