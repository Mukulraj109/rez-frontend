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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { 
  ACCOUNT_COLORS,
  DeliveryAddress,
  DeliverySettings as DeliverySettingsType,
  TimeSlot 
} from '@/types/account.types';
import { mockAccountSettings } from '@/data/accountData';

export default function DeliverySettingsScreen() {
  const router = useRouter();
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettingsType>(
    mockAccountSettings.delivery
  );

  const handleBackPress = () => {
    router.back();
  };

  const handleAddAddress = () => {
    Alert.alert(
      'Add New Address',
      'This will open the add address form',
      [{ text: 'OK' }]
    );
  };

  const handleEditAddress = (address: DeliveryAddress) => {
    Alert.alert(
      'Edit Address',
      `Edit ${address.title}`,
      [{ text: 'OK' }]
    );
  };

  const handleSetDefault = (addressId: string) => {
    setDeliverySettings(prev => ({
      ...prev,
      savedAddresses: prev.savedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      })),
      defaultAddress: prev.savedAddresses.find(addr => addr.id === addressId) || null
    }));
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setDeliverySettings(prev => ({
              ...prev,
              savedAddresses: prev.savedAddresses.filter(addr => addr.id !== addressId)
            }));
          }
        }
      ]
    );
  };

  const toggleContactlessDelivery = () => {
    setDeliverySettings(prev => ({
      ...prev,
      contactlessDelivery: !prev.contactlessDelivery
    }));
  };

  const toggleDeliveryNotifications = () => {
    setDeliverySettings(prev => ({
      ...prev,
      deliveryNotifications: !prev.deliveryNotifications
    }));
  };

  const renderAddressCard = (address: DeliveryAddress) => (
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
            style={styles.actionButton}
            onPress={() => handleSetDefault(address.id)}
          >
            <ThemedText style={styles.actionButtonText}>Set as Default</ThemedText>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={() => handleDeleteAddress(address.id)}
        >
          <ThemedText style={[styles.actionButtonText, styles.dangerButtonText]}>Delete</ThemedText>
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
        {/* Saved Addresses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Saved Addresses</ThemedText>
            <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
              <Ionicons name="add" size={20} color={ACCOUNT_COLORS.primary} />
              <ThemedText style={styles.addButtonText}>Add New</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.addressList}>
            {deliverySettings.savedAddresses.map(renderAddressCard)}
          </View>
        </View>

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
                value={deliverySettings.contactlessDelivery}
                onValueChange={toggleContactlessDelivery}
                trackColor={{ false: ACCOUNT_COLORS.border, true: ACCOUNT_COLORS.primary + '40' }}
                thumbColor={deliverySettings.contactlessDelivery ? ACCOUNT_COLORS.primary : '#f4f3f4'}
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
                value={deliverySettings.deliveryNotifications}
                onValueChange={toggleDeliveryNotifications}
                trackColor={{ false: ACCOUNT_COLORS.border, true: ACCOUNT_COLORS.primary + '40' }}
                thumbColor={deliverySettings.deliveryNotifications ? ACCOUNT_COLORS.primary : '#f4f3f4'}
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
                {deliverySettings.deliveryInstructions || 'No special instructions'}
              </ThemedText>
              <TouchableOpacity style={styles.editInstructionsButton}>
                <ThemedText style={styles.editInstructionsText}>Edit Instructions</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer Space */}
        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACCOUNT_COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 50 : 45,
    paddingBottom: 25,
    paddingHorizontal: 20,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitleSection: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ACCOUNT_COLORS.text,
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
    borderRadius: 12,
    padding: 16,
    shadowColor: ACCOUNT_COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: ACCOUNT_COLORS.surface,
  },
  actionButtonText: {
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
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: ACCOUNT_COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    shadowColor: ACCOUNT_COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
});