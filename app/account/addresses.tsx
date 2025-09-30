// Address Management Screen
// Full CRUD operations for delivery addresses

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
import { useAddresses } from '@/hooks/useAddresses';
import { Address, AddressType, AddressCreate } from '@/services/addressApi';

export default function AddressesPage() {
  const router = useRouter();
  const {
    addresses,
    isLoading,
    refetch,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    defaultAddress,
  } = useAddresses(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Partial<AddressCreate>>({
    type: 'HOME',
    country: 'India',
  });

  const handleOpenAddModal = () => {
    setFormData({
      type: 'HOME',
      country: 'India',
    });
    setEditingAddress(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (address: Address) => {
    setFormData({
      type: address.type,
      title: address.title,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      instructions: address.instructions,
      isDefault: address.isDefault,
    });
    setEditingAddress(address);
    setShowAddModal(true);
  };

  const handleSaveAddress = async () => {
    if (!formData.title || !formData.addressLine1 || !formData.city || !formData.state || !formData.postalCode) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingAddress) {
        const success = await updateAddress(editingAddress.id, formData);
        if (success) {
          Alert.alert('Success', 'Address updated successfully');
          setShowAddModal(false);
        }
      } else {
        const success = await addAddress(formData as AddressCreate);
        if (success) {
          Alert.alert('Success', 'Address added successfully');
          setShowAddModal(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save address');
    }
  };

  const handleDeleteAddress = (address: Address) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${address.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteAddress(address.id);
            if (success) {
              Alert.alert('Success', 'Address deleted successfully');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (address: Address) => {
    if (address.isDefault) return;
    const success = await setDefaultAddress(address.id);
    if (success) {
      Alert.alert('Success', 'Default address updated');
    }
  };

  const getAddressTypeIcon = (type: AddressType): string => {
    switch (type) {
      case 'HOME': return 'home';
      case 'OFFICE': return 'briefcase';
      case 'OTHER': return 'location';
      default: return 'location';
    }
  };

  const getAddressTypeColor = (type: AddressType): string => {
    switch (type) {
      case 'HOME': return '#10B981';
      case 'OFFICE': return '#3B82F6';
      case 'OTHER': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const renderAddressCard = (address: Address) => {
    const typeColor = getAddressTypeColor(address.type);

    return (
      <View key={address.id} style={styles.addressCard}>
        {/* Header */}
        <View style={styles.addressHeader}>
          <View style={styles.addressTitleRow}>
            <View style={[styles.typeIcon, { backgroundColor: `${typeColor}20` }]}>
              <Ionicons
                name={getAddressTypeIcon(address.type) as any}
                size={20}
                color={typeColor}
              />
            </View>
            <View style={styles.addressTitleContainer}>
              <ThemedText style={styles.addressTitle}>{address.title}</ThemedText>
              <View style={[styles.typeBadge, { backgroundColor: `${typeColor}20` }]}>
                <ThemedText style={[styles.typeText, { color: typeColor }]}>
                  {address.type}
                </ThemedText>
              </View>
            </View>
          </View>

          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <ThemedText style={styles.defaultText}>Default</ThemedText>
            </View>
          )}
        </View>

        {/* Address Details */}
        <View style={styles.addressDetails}>
          <ThemedText style={styles.addressText}>{address.addressLine1}</ThemedText>
          {address.addressLine2 && (
            <ThemedText style={styles.addressText}>{address.addressLine2}</ThemedText>
          )}
          <ThemedText style={styles.addressText}>
            {address.city}, {address.state} {address.postalCode}
          </ThemedText>
          <ThemedText style={styles.addressText}>{address.country}</ThemedText>
          {address.instructions && (
            <View style={styles.instructionsContainer}>
              <Ionicons name="information-circle-outline" size={14} color="#6B7280" />
              <ThemedText style={styles.instructionsText}>{address.instructions}</ThemedText>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.addressActions}>
          {!address.isDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSetDefault(address)}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
              <ThemedText style={styles.actionText}>Set Default</ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleOpenEditModal(address)}
          >
            <Ionicons name="create-outline" size={18} color="#3B82F6" />
            <ThemedText style={styles.actionText}>Edit</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteAddress(address)}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <ThemedText style={styles.actionText}>Delete</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
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
            <ThemedText style={styles.headerTitle}>Delivery Addresses</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} saved
            </ThemedText>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Address List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {isLoading && addresses.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>Loading addresses...</ThemedText>
          </View>
        ) : addresses.length > 0 ? (
          addresses.map(renderAddressCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>No addresses saved</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Add your first delivery address to get started
            </ThemedText>
            <TouchableOpacity style={styles.emptyButton} onPress={handleOpenAddModal}>
              <ThemedText style={styles.emptyButtonText}>Add Address</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Address Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </ThemedText>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              {/* Address Type */}
              <ThemedText style={styles.label}>Address Type *</ThemedText>
              <View style={styles.typeSelector}>
                {(['HOME', 'OFFICE', 'OTHER'] as AddressType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      formData.type === type && styles.typeOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, type })}
                  >
                    <ThemedText
                      style={[
                        styles.typeOptionText,
                        formData.type === type && styles.typeOptionTextActive,
                      ]}
                    >
                      {type}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Title */}
              <ThemedText style={styles.label}>Label *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="e.g., Home, Office"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />

              {/* Address Line 1 */}
              <ThemedText style={styles.label}>Address Line 1 *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="House/Flat/Block No."
                value={formData.addressLine1}
                onChangeText={(text) => setFormData({ ...formData, addressLine1: text })}
              />

              {/* Address Line 2 */}
              <ThemedText style={styles.label}>Address Line 2</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Apartment, suite, etc. (optional)"
                value={formData.addressLine2}
                onChangeText={(text) => setFormData({ ...formData, addressLine2: text })}
              />

              {/* City & State */}
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <ThemedText style={styles.label}>City *</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="City"
                    value={formData.city}
                    onChangeText={(text) => setFormData({ ...formData, city: text })}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <ThemedText style={styles.label}>State *</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="State"
                    value={formData.state}
                    onChangeText={(text) => setFormData({ ...formData, state: text })}
                  />
                </View>
              </View>

              {/* Postal Code */}
              <ThemedText style={styles.label}>Postal Code *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Postal Code"
                value={formData.postalCode}
                onChangeText={(text) => setFormData({ ...formData, postalCode: text })}
                keyboardType="numeric"
              />

              {/* Delivery Instructions */}
              <ThemedText style={styles.label}>Delivery Instructions</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., Ring the doorbell, Leave at door"
                value={formData.instructions}
                onChangeText={(text) => setFormData({ ...formData, instructions: text })}
                multiline
                numberOfLines={3}
              />

              {/* Save Button */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
                <ThemedText style={styles.saveButtonText}>
                  {editingAddress ? 'Update Address' : 'Save Address'}
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  addressCard: {
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
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressTitleContainer: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
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
  addressDetails: {
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  instructionsText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
    lineHeight: 18,
  },
  addressActions: {
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
  emptyButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  typeOptionActive: {
    backgroundColor: '#8B5CF6',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeOptionTextActive: {
    color: 'white',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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