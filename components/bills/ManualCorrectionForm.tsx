// Manual Correction Form
// Allows users to fix OCR errors

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  OCRExtractedData,
  ManualCorrectionData,
  MerchantMatch,
} from '@/types/billVerification.types';

interface ManualCorrectionFormProps {
  visible: boolean;
  onClose: () => void;
  ocrData: OCRExtractedData;
  merchantMatches?: MerchantMatch[];
  onSubmit: (corrections: ManualCorrectionData) => void;
}

export default function ManualCorrectionForm({
  visible,
  onClose,
  ocrData,
  merchantMatches = [],
  onSubmit,
}: ManualCorrectionFormProps) {
  const [corrections, setCorrections] = useState<ManualCorrectionData>({
    merchantName: ocrData.merchantName || '',
    amount: ocrData.amount || 0,
    billDate: ocrData.date || new Date().toISOString().split('T')[0],
    billNumber: ocrData.billNumber || '',
    notes: '',
  });

  const [showMerchantPicker, setShowMerchantPicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!corrections.merchantName || corrections.merchantName.trim().length < 2) {
      newErrors.merchantName = 'Merchant name is required';
    }

    if (!corrections.amount || corrections.amount < 50) {
      newErrors.amount = 'Amount must be at least ₹50';
    }

    if (corrections.amount && corrections.amount > 100000) {
      newErrors.amount = 'Amount cannot exceed ₹1,00,000';
    }

    if (!corrections.billDate) {
      newErrors.billDate = 'Bill date is required';
    } else {
      const billDate = new Date(corrections.billDate);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - billDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff > 30) {
        newErrors.billDate = 'Bill is too old (more than 30 days)';
      }

      if (billDate > now) {
        newErrors.billDate = 'Bill date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(corrections);
      onClose();
    }
  };

  const selectMerchant = (merchant: MerchantMatch) => {
    setCorrections({
      ...corrections,
      merchantId: merchant.merchantId,
      merchantName: merchant.merchantName,
    });
    setShowMerchantPicker(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Correct Bill Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color="#2196F3" />
            <Text style={styles.infoText}>
              Our OCR detected some information. Please review and correct any errors.
            </Text>
          </View>

          {/* Merchant Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Merchant Name <Text style={styles.required}>*</Text>
            </Text>
            {merchantMatches.length > 0 ? (
              <TouchableOpacity
                style={styles.merchantSelector}
                onPress={() => setShowMerchantPicker(true)}
              >
                <Text
                  style={corrections.merchantName ? styles.selectedText : styles.placeholderText}
                >
                  {corrections.merchantName || 'Select merchant'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#999" />
              </TouchableOpacity>
            ) : (
              <TextInput
                style={[styles.input, errors.merchantName && styles.inputError]}
                value={corrections.merchantName}
                onChangeText={(text) => {
                  setCorrections({ ...corrections, merchantName: text });
                  setErrors({ ...errors, merchantName: '' });
                }}
                placeholder="Enter merchant name"
              />
            )}
            {errors.merchantName && <Text style={styles.errorText}>{errors.merchantName}</Text>}
            {ocrData.merchantName && (
              <Text style={styles.hintText}>Detected: {ocrData.merchantName}</Text>
            )}
          </View>

          {/* Amount */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Bill Amount (₹) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.amount && styles.inputError]}
              value={corrections.amount?.toString()}
              onChangeText={(text) => {
                setCorrections({ ...corrections, amount: parseFloat(text) || 0 });
                setErrors({ ...errors, amount: '' });
              }}
              placeholder="Enter amount"
              keyboardType="decimal-pad"
            />
            {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
            {ocrData.amount && <Text style={styles.hintText}>Detected: ₹{ocrData.amount}</Text>}
          </View>

          {/* Bill Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Bill Date <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.billDate && styles.inputError]}
              value={corrections.billDate}
              onChangeText={(text) => {
                setCorrections({ ...corrections, billDate: text });
                setErrors({ ...errors, billDate: '' });
              }}
              placeholder="YYYY-MM-DD"
            />
            {errors.billDate && <Text style={styles.errorText}>{errors.billDate}</Text>}
            {ocrData.date && <Text style={styles.hintText}>Detected: {ocrData.date}</Text>}
          </View>

          {/* Bill Number (Optional) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Bill Number (Optional)</Text>
            <TextInput
              style={styles.input}
              value={corrections.billNumber}
              onChangeText={(text) => setCorrections({ ...corrections, billNumber: text })}
              placeholder="Enter bill number"
            />
            {ocrData.billNumber && (
              <Text style={styles.hintText}>Detected: {ocrData.billNumber}</Text>
            )}
          </View>

          {/* Notes */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Additional Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={corrections.notes}
              onChangeText={(text) => setCorrections({ ...corrections, notes: text })}
              placeholder="Add any additional notes or corrections..."
              multiline
              numberOfLines={3}
            />
          </View>

          {/* OCR Confidence Warning */}
          {ocrData.confidence < 70 && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning" size={20} color="#FF9800" />
              <Text style={styles.warningText}>
                OCR confidence is low ({ocrData.confidence}%). Please verify all details carefully.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Apply Corrections</Text>
          </TouchableOpacity>
        </View>

        {/* Merchant Picker Modal */}
        <Modal
          visible={showMerchantPicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowMerchantPicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Merchant</Text>
                <TouchableOpacity onPress={() => setShowMerchantPicker(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.merchantList}>
                {merchantMatches.map((merchant, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.merchantItem}
                    onPress={() => selectMerchant(merchant)}
                  >
                    <View style={styles.merchantItemContent}>
                      <Text style={styles.merchantItemName}>{merchant.merchantName}</Text>
                      <View style={styles.merchantItemMeta}>
                        <Text style={styles.merchantItemMatch}>{merchant.matchScore}% match</Text>
                        <View style={styles.cashbackBadge}>
                          <Ionicons name="gift" size={12} color="#4CAF50" />
                          <Text style={styles.cashbackText}>{merchant.cashbackPercentage}%</Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#2196F3',
    lineHeight: 18,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#F44336',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  merchantSelector: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#FF9800',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  merchantList: {
    flex: 1,
  },
  merchantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  merchantItemContent: {
    flex: 1,
  },
  merchantItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  merchantItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  merchantItemMatch: {
    fontSize: 12,
    color: '#666',
  },
  cashbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  cashbackText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
});
