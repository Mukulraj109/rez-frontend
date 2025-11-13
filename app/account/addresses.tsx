// Saved Addresses Page
// Page for managing user's saved addresses

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import addressApi, { Address as ApiAddress, AddressCreate, AddressUpdate } from '@/services/addressApi';
import AddAddressModal from '@/components/account/AddAddressModal';
import EditAddressModal from '@/components/account/EditAddressModal';

// Map API address type to frontend type
type AddressType = 'home' | 'work' | 'other';

interface Address {
  id: string;
  type: AddressType;
  title: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SavedAddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch addresses from backend API
      const response = await addressApi.getUserAddresses();

      if (response.success && response.data) {
        // Transform API addresses to frontend format
        const transformedAddresses: Address[] = response.data.map((addr: ApiAddress) => ({
          id: addr.id,
          type: addr.type.toLowerCase() as AddressType,
          title: addr.title,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country,
          isDefault: addr.isDefault,
          instructions: addr.instructions,
          createdAt: addr.createdAt,
          updatedAt: addr.updatedAt,
        }));

        setAddresses(transformedAddresses);
      } else {
        throw new Error(response.error || 'Failed to fetch addresses');
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchAddresses();
  }, [fetchAddresses]);

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleAddAddress = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const handleEditAddress = useCallback((address: Address) => {
    setSelectedAddress(address);
    setShowEditModal(true);
  }, []);

  const handleAddAddressSubmit = useCallback(async (addressData: AddressCreate): Promise<boolean> => {
    try {
      const response = await addressApi.createAddress(addressData);

      if (response.success && response.data) {
        // Transform and add to list
        const newAddress: Address = {
          id: response.data.id,
          type: response.data.type.toLowerCase() as AddressType,
          title: response.data.title,
          addressLine1: response.data.addressLine1,
          addressLine2: response.data.addressLine2,
          city: response.data.city,
          state: response.data.state,
          postalCode: response.data.postalCode,
          country: response.data.country,
          isDefault: response.data.isDefault,
          instructions: response.data.instructions,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
        };

        setAddresses(prev => [...prev, newAddress]);
        return true;
      }
      Alert.alert('Error', response.error || 'Failed to add address');
      return false;
    } catch (err) {
      console.error('Error adding address:', err);
      Alert.alert('Error', 'Failed to add address');
      return false;
    }
  }, []);

  const handleUpdateAddressSubmit = useCallback(async (id: string, updateData: AddressUpdate): Promise<boolean> => {
    try {
      const response = await addressApi.updateAddress(id, updateData);

      if (response.success && response.data) {
        // Update in list
        setAddresses(prev =>
          prev.map(addr =>
            addr.id === id
              ? {
                  ...addr,
                  type: response.data!.type.toLowerCase() as AddressType,
                  title: response.data!.title,
                  addressLine1: response.data!.addressLine1,
                  addressLine2: response.data!.addressLine2,
                  city: response.data!.city,
                  state: response.data!.state,
                  postalCode: response.data!.postalCode,
                  country: response.data!.country,
                  isDefault: response.data!.isDefault,
                  instructions: response.data!.instructions,
                  updatedAt: response.data!.updatedAt,
                }
              : addr
          )
        );
        return true;
      }
      Alert.alert('Error', response.error || 'Failed to update address');
      return false;
    } catch (err) {
      console.error('Error updating address:', err);
      Alert.alert('Error', 'Failed to update address');
      return false;
    }
  }, []);

  const handleDeleteAddress = useCallback(async (address: Address) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete ${address.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await addressApi.deleteAddress(address.id);

              if (response.success) {
                setAddresses(prev => prev.filter(addr => addr.id !== address.id));
                Alert.alert('Success', 'Address deleted successfully');
              } else {
                Alert.alert('Error', response.error || 'Failed to delete address');
              }
            } catch (err) {
              console.error('Error deleting address:', err);
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
    );
  }, []);

  const handleSetDefault = useCallback(async (address: Address) => {
    try {
      const response = await addressApi.setDefaultAddress(address.id);

      if (response.success) {
        setAddresses(prev =>
          prev.map(addr => ({
            ...addr,
            isDefault: addr.id === address.id,
          }))
        );
        Alert.alert('Success', `${address.title} is now your default address`);
      } else {
        Alert.alert('Error', response.error || 'Failed to set default address');
      }
    } catch (err) {
      console.error('Error setting default address:', err);
      Alert.alert('Error', 'Failed to set default address');
    }
  }, []);

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return 'home-outline';
      case 'work':
        return 'business-outline';
      default:
        return 'location-outline';
    }
  };

  const getAddressTypeColor = (type: string) => {
    switch (type) {
      case 'home':
        return '#10B981';
      case 'work':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const renderAddress = ({ item: address }: { item: Address }) => {
    const fullAddress = `${address.addressLine1}, ${address.addressLine2 ? address.addressLine2 + ', ' : ''}${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
    const addressLabel = `${address.title}. ${fullAddress}${address.isDefault ? '. Default address' : ''}${address.instructions ? '. Instructions: ' + address.instructions : ''}`;

    return (
    <View
      style={styles.addressCard}
      accessibilityRole="summary"
      accessibilityLabel={addressLabel}
    >
        <View style={styles.addressHeader}>
            <View style={styles.addressTitleContainer}>
          <View style={[styles.typeIcon, { backgroundColor: getAddressTypeColor(address.type) }]}>
            <Ionicons name={getAddressTypeIcon(address.type)} size={16} color="#FFFFFF" />
          </View>
          <View style={styles.addressTitleInfo}>
            <ThemedText style={styles.addressTitle}>{address.title}</ThemedText>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <ThemedText style={styles.defaultText}>Default</ThemedText>
            </View>
          )}
        </View>
        </View>
        <View style={styles.addressActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditAddress(address)}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${address.title}`}
            accessibilityHint="Double tap to edit this address"
          >
            <Ionicons name="pencil-outline" size={18} color="#7C3AED" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteAddress(address)}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${address.title}`}
            accessibilityHint="Double tap to remove this address. This action requires confirmation"
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.addressDetails}>
        <ThemedText style={styles.addressLine}>{address.addressLine1}</ThemedText>
        {address.addressLine2 && (
          <ThemedText style={styles.addressLine}>{address.addressLine2}</ThemedText>
        )}
        <ThemedText style={styles.addressLine}>
          {address.city}, {address.state} {address.postalCode}
        </ThemedText>
        <ThemedText style={styles.addressLine}>{address.country}</ThemedText>
        
        {address.instructions && (
          <View style={styles.instructionsContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
            <ThemedText style={styles.instructions}>{address.instructions}</ThemedText>
          </View>
        )}
      </View>

      {!address.isDefault && (
        <TouchableOpacity
          style={styles.setDefaultButton}
          onPress={() => handleSetDefault(address)}
          accessibilityRole="button"
          accessibilityLabel={`Set ${address.title} as default address`}
          accessibilityHint="Double tap to make this your default delivery address"
        >
          <ThemedText style={styles.setDefaultText}>Set as Default</ThemedText>
        </TouchableOpacity>
      )}
    </View>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
        <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.headerBg}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Saved Addresses</ThemedText>
            <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <ThemedText style={styles.loadingText}>Loading addresses...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
        <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.headerBg}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Saved Addresses</ThemedText>
            <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <ThemedText style={styles.errorTitle}>Error</ThemedText>
          <ThemedText style={styles.errorDetails}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.headerBg}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Double tap to return to previous screen"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText
            style={styles.headerTitle}
            accessibilityRole="header"
          >
            Saved Addresses
          </ThemedText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddAddress}
            accessibilityRole="button"
            accessibilityLabel="Add new address"
            accessibilityHint="Double tap to add a new delivery address"
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={80} color="#E5E7EB" />
            <ThemedText style={styles.emptyTitle}>No Addresses Saved</ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Add your addresses to make checkout faster
            </ThemedText>
            <TouchableOpacity
              style={styles.addAddressButton}
              onPress={handleAddAddress}
              accessibilityRole="button"
              accessibilityLabel="Add your first address"
              accessibilityHint="Double tap to add a new delivery address"
            >
              <ThemedText style={styles.addAddressButtonText}>Add Address</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={addresses}
            renderItem={renderAddress}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#7C3AED" />
            }
            contentContainerStyle={styles.addressesContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Add Address Modal */}
      <AddAddressModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddAddressSubmit}
      />

      {/* Edit Address Modal */}
      <EditAddressModal
        visible={showEditModal}
        address={selectedAddress ? {
          ...selectedAddress,
          type: selectedAddress.type.toUpperCase() as any,
        } : null}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAddress(null);
        }}
        onUpdate={handleUpdateAddressSubmit}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerBg: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  addressesContainer: {
    paddingBottom: 20,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addressTitleInfo: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  defaultBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  addressDetails: {
    marginBottom: 12,
  },
  addressLine: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 2,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  instructions: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  setDefaultButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  setDefaultText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  addAddressButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addAddressButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});