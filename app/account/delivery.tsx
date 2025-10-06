// Delivery Settings Screen
// Manage delivery addresses, preferences, and options

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  SafeAreaView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ACCOUNT_COLORS } from '@/types/account.types';
import { Address, AddressType, AddressCreate, AddressUpdate } from '@/services/addressApi';
import { useAddresses } from '@/hooks/useAddresses';
import AddAddressModal from '@/components/account/AddAddressModal';
import EditAddressModal from '@/components/account/EditAddressModal';
import EditInstructionsModal from '@/components/account/EditInstructionsModal';

export default function DeliverySettingsScreen() {
  const router = useRouter();
  const {
    addresses,
    isLoading,
    error,
    addAddress,
    updateAddress,
    deleteAddress: deleteAddressApi,
    setDefaultAddress: setDefaultAddressApi,
    refetch,
    clearError
  } = useAddresses();

  const [contactlessDelivery, setContactlessDelivery] = useState(false);
  const [deliveryNotifications, setDeliveryNotifications] = useState(true);
  const [deliveryInstructions, setDeliveryInstructions] = useState('Ring doorbell twice, leave at door if no answer');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleBackPress = () => {
    router.back();
  };

  const handleAddAddress = () => {
    setShowAddModal(true);
  };

  const handleAddSubmit = async (addressData: AddressCreate): Promise<boolean> => {
    const result = await addAddress(addressData);
    return result !== null;
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowEditModal(true);
  };

  const handleUpdateSubmit = async (id: string, data: AddressUpdate): Promise<boolean> => {
    const result = await updateAddress(id, data);
    return result !== null;
  };

  const handleSetDefault = async (addressId: string) => {
    const result = await setDefaultAddressApi(addressId);
    if (result) {
      Alert.alert('Success', 'Default address updated successfully');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteAddressApi(addressId);
            if (success) {
              Alert.alert('Success', 'Address deleted successfully');
            }
          }
        }
      ]
    );
  };

  const toggleContactlessDelivery = () => {
    setContactlessDelivery(prev => !prev);
    // TODO: Save to backend user preferences
  };

  const toggleDeliveryNotifications = () => {
    setDeliveryNotifications(prev => !prev);
    // TODO: Save to backend user preferences
  };

  const handleSaveInstructions = (instructions: string) => {
    setDeliveryInstructions(instructions);
    Alert.alert('Success', 'Delivery instructions updated');
    // TODO: Save to backend user preferences
  };

  const renderAddressCard = (address: Address) => (
    <View key={address.id} style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressTypeContainer}>
          <View style={[styles.addressTypeIcon, { backgroundColor: getAddressTypeColor(address.type) }]}>
            <Ionicons 
              name={getAddressTypeIcon(address.type)} 
              size={16} 
              color="white" 
            />
          </View>
          <View style={styles.addressTitleContainer}>
            <ThemedText style={styles.addressTitle}>{address.title}</ThemedText>
            {address.isDefault && (
              <View style={styles.defaultBadge}>
                <ThemedText style={styles.defaultBadgeText}>Default</ThemedText>
              </View>
            )}
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => handleEditAddress(address)}
        >
          <Ionicons name="ellipsis-vertical" size={16} color={ACCOUNT_COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.addressContent}>
        <ThemedText style={styles.addressLine}>
          {address.addressLine1}
        </ThemedText>
        {address.addressLine2 && (
          <ThemedText style={styles.addressLine}>
            {address.addressLine2}
          </ThemedText>
        )}
        <ThemedText style={styles.addressLine}>
          {address.city}, {address.state} {address.postalCode}
        </ThemedText>
        
        {address.instructions && (
          <View style={styles.instructionsContainer}>
            <Ionicons name="information-circle" size={14} color={ACCOUNT_COLORS.textSecondary} />
            <ThemedText style={styles.instructions}>
              {address.instructions}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.addressActions}>
        {!address.isDefault && (
          <TouchableOpacity
            style={styles.addressActionButton}
            onPress={() => handleSetDefault(address.id)}
          >
            <ThemedText style={styles.addressActionButtonText}>Set as Default</ThemedText>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.addressActionButton, styles.dangerButton]}
          onPress={() => handleDeleteAddress(address.id)}
        >
          <ThemedText style={[styles.addressActionButtonText, styles.dangerButtonText]}>Delete</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'HOME': return 'home';
      case 'OFFICE': return 'business';
      default: return 'location';
    }
  };

  const getAddressTypeColor = (type: string) => {
    switch (type) {
      case 'HOME': return ACCOUNT_COLORS.success;
      case 'OFFICE': return ACCOUNT_COLORS.info;
      default: return ACCOUNT_COLORS.primary;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={ACCOUNT_COLORS.primary}
        translucent={true}
      />
      
      {/* Modern Header */}
      <LinearGradient
        colors={[ACCOUNT_COLORS.primary, ACCOUNT_COLORS.primaryLight, '#A78BFA']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <View style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={22} color="white" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerTitleSection}>
            <ThemedText style={styles.headerTitle}>Delivery Settings</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Manage addresses and preferences
            </ThemedText>
          </View>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={ACCOUNT_COLORS.error} />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity onPress={clearError} style={styles.dismissButton}>
              <Ionicons name="close" size={18} color={ACCOUNT_COLORS.error} />
            </TouchableOpacity>
          </View>
        )}

        {/* Loading State */}
        {isLoading && addresses.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ACCOUNT_COLORS.primary} />
            <ThemedText style={styles.loadingText}>Loading addresses...</ThemedText>
          </View>
        ) : (
          <>
            {/* Saved Addresses */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Saved Addresses</ThemedText>
                <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
                  <Ionicons name="add" size={20} color={ACCOUNT_COLORS.primary} />
                  <ThemedText style={styles.addButtonText}>Add New</ThemedText>
                </TouchableOpacity>
              </View>

              {addresses.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="location-outline" size={64} color={ACCOUNT_COLORS.textSecondary} />
                  <ThemedText style={styles.emptyTitle}>No Addresses Yet</ThemedText>
                  <ThemedText style={styles.emptyDescription}>
                    Add your first delivery address to get started
                  </ThemedText>
                  <TouchableOpacity style={styles.emptyButton} onPress={handleAddAddress}>
                    <ThemedText style={styles.emptyButtonText}>Add Address</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.addressList}>
                  {addresses.map(renderAddressCard)}
                </View>
              )}
            </View>
          </>
        )}

        {!isLoading && (
          <>
            {/* Delivery Preferences */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Delivery Preferences</ThemedText>

              <View style={styles.settingsCard}>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <Ionicons name="shield-checkmark" size={20} color={ACCOUNT_COLORS.primary} />
                    <View style={styles.settingText}>
                      <ThemedText style={styles.settingTitle}>Contactless Delivery</ThemedText>
                      <ThemedText style={styles.settingDescription}>
                        Leave packages at the door without contact
                      </ThemedText>
                    </View>
                  </View>
                  <Switch
                    value={contactlessDelivery}
                    onValueChange={toggleContactlessDelivery}
                    trackColor={{ false: ACCOUNT_COLORS.border, true: ACCOUNT_COLORS.primary + '40' }}
                    thumbColor={contactlessDelivery ? ACCOUNT_COLORS.primary : '#f4f3f4'}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <Ionicons name="notifications" size={20} color={ACCOUNT_COLORS.primary} />
                    <View style={styles.settingText}>
                      <ThemedText style={styles.settingTitle}>Delivery Notifications</ThemedText>
                      <ThemedText style={styles.settingDescription}>
                        Get notified about delivery updates
                      </ThemedText>
                    </View>
                  </View>
                  <Switch
                    value={deliveryNotifications}
                    onValueChange={toggleDeliveryNotifications}
                    trackColor={{ false: ACCOUNT_COLORS.border, true: ACCOUNT_COLORS.primary + '40' }}
                    thumbColor={deliveryNotifications ? ACCOUNT_COLORS.primary : '#f4f3f4'}
                  />
                </View>
              </View>
            </View>

            {/* Delivery Instructions */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Default Instructions</ThemedText>

              <View style={styles.instructionsCard}>
                <Ionicons name="document-text" size={20} color={ACCOUNT_COLORS.primary} />
                <View style={styles.instructionsContent}>
                  <ThemedText style={styles.instructionsTitle}>Delivery Instructions</ThemedText>
                  <ThemedText style={styles.instructionsText}>
                    {deliveryInstructions || 'No special instructions'}
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.editInstructionsButton}
                    onPress={() => setShowInstructionsModal(true)}
                  >
                    <ThemedText style={styles.editInstructionsText}>Edit Instructions</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Footer Space */}
        <View style={styles.footer} />
      </ScrollView>

      {/* Add Address Modal */}
      <AddAddressModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSubmit}
      />

      {/* Edit Address Modal */}
      <EditAddressModal
        visible={showEditModal}
        address={editingAddress}
        onClose={() => {
          setShowEditModal(false);
          setEditingAddress(null);
        }}
        onUpdate={handleUpdateSubmit}
      />

      {/* Edit Instructions Modal */}
      <EditInstructionsModal
        visible={showInstructionsModal}
        currentInstructions={deliveryInstructions}
        onClose={() => setShowInstructionsModal(false)}
        onSave={handleSaveInstructions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACCOUNT_COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 35,
    paddingBottom: 20,
    paddingHorizontal: 16,
    shadowColor: ACCOUNT_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitleSection: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    textAlign: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ACCOUNT_COLORS.text,
    letterSpacing: 0.2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: ACCOUNT_COLORS.primary + '15',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCOUNT_COLORS.primary,
    marginLeft: 4,
  },
  
  // Address Cards
  addressList: {
    gap: 12,
  },
  addressCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    shadowColor: ACCOUNT_COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: '#F1F5F9',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    color: ACCOUNT_COLORS.text,
    marginBottom: 2,
  },
  defaultBadge: {
    backgroundColor: ACCOUNT_COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  moreButton: {
    padding: 4,
  },
  addressContent: {
    marginBottom: 12,
  },
  addressLine: {
    fontSize: 14,
    color: ACCOUNT_COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 2,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: ACCOUNT_COLORS.border,
  },
  instructions: {
    fontSize: 12,
    color: ACCOUNT_COLORS.textSecondary,
    fontStyle: 'italic',
    marginLeft: 4,
    flex: 1,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
  },
  addressActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: ACCOUNT_COLORS.surface,
  },
  addressActionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: ACCOUNT_COLORS.primary,
  },
  dangerButton: {
    backgroundColor: ACCOUNT_COLORS.error + '15',
  },
  dangerButtonText: {
    color: ACCOUNT_COLORS.error,
  },
  
  // Settings
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: ACCOUNT_COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: '#F1F5F9',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: ACCOUNT_COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: ACCOUNT_COLORS.textSecondary,
    lineHeight: 18,
  },
  
  // Instructions
  instructionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    shadowColor: ACCOUNT_COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: '#F1F5F9',
  },
  instructionsContent: {
    marginLeft: 12,
    flex: 1,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: ACCOUNT_COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  editInstructionsButton: {
    alignSelf: 'flex-start',
  },
  editInstructionsText: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCOUNT_COLORS.primary,
  },
  
  footer: {
    height: 40,
  },

  // Error, Loading, and Empty States
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCOUNT_COLORS.error + '15',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: ACCOUNT_COLORS.error,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: ACCOUNT_COLORS.error,
    marginLeft: 8,
    fontWeight: '500',
  },
  dismissButton: {
    padding: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: ACCOUNT_COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: ACCOUNT_COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: '#F1F5F9',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ACCOUNT_COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: ACCOUNT_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: ACCOUNT_COLORS.primary,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});