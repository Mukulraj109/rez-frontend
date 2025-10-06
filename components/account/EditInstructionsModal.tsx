// Edit Delivery Instructions Modal Component
// Modal for editing default delivery instructions

import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ACCOUNT_COLORS } from '@/types/account.types';

interface EditInstructionsModalProps {
  visible: boolean;
  currentInstructions: string;
  onClose: () => void;
  onSave: (instructions: string) => void;
}

export default function EditInstructionsModal({
  visible,
  currentInstructions,
  onClose,
  onSave,
}: EditInstructionsModalProps) {
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (visible) {
      setInstructions(currentInstructions);
    }
  }, [visible, currentInstructions]);

  const handleSave = () => {
    onSave(instructions);
    onClose();
  };

  const handleClose = () => {
    setInstructions(currentInstructions);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Delivery Instructions</ThemedText>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={ACCOUNT_COLORS.text} />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <View style={styles.modalBody}>
                <ThemedText style={styles.label}>
                  Default instructions for all deliveries
                </ThemedText>
                <TextInput
                  style={styles.textArea}
                  value={instructions}
                  onChangeText={setInstructions}
                  placeholder="Enter delivery instructions (e.g., Ring doorbell twice, leave at door if no answer)"
                  placeholderTextColor={ACCOUNT_COLORS.textSecondary}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  maxLength={200}
                />
                <ThemedText style={styles.charCount}>
                  {instructions.length}/200 characters
                </ThemedText>
              </View>

              {/* Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
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
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: ACCOUNT_COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: ACCOUNT_COLORS.text,
    backgroundColor: ACCOUNT_COLORS.surface,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: ACCOUNT_COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'right',
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
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: ACCOUNT_COLORS.surface,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: ACCOUNT_COLORS.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
