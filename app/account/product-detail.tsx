import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import userProductService, { UserProduct } from '../../services/userProductApi';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<UserProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProductDetails();
    }
  }, [id]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userProductService.getProductDetails(id as string);

      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        setError('Failed to load product details');
      }
    } catch (error) {
      console.error('Error loading product details:', error);
      setError('Failed to load product details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'warranty_expired':
        return '#F59E0B';
      case 'returned':
        return '#EF4444';
      case 'replaced':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const getWarrantyStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'expiring_soon':
        return '#F59E0B';
      case 'expired':
        return '#EF4444';
      case 'no_warranty':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const handleRegisterProduct = () => {
    Alert.prompt(
      'Register Product',
      'Enter your product serial number:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: async (serialNumber: any) => {
            if (!serialNumber || !product) return;
            
            try {
              const response = await userProductService.registerProduct(product._id, {
                serialNumber,
              });
              
              if (response.success) {
                Alert.alert('Success', 'Product registered successfully!');
                loadProductDetails(); // Reload to show updated data
              } else {
                Alert.alert('Error', response.error || 'Failed to register product');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to register product. Please try again.');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleScheduleInstallation = () => {
    Alert.alert(
      'Schedule Installation',
      'This feature will allow you to schedule product installation. Coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleRenewAMC = () => {
    Alert.alert(
      'Renew AMC',
      'This feature will allow you to renew your AMC. Coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleCreateServiceRequest = () => {
    router.push(`/account/service-request?productId=${product?._id}` as any);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View
        style={styles.errorContainer}
        accessibilityLabel={`Error loading product. ${error || 'Product not found'}`}
        accessibilityRole="alert"
      >
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Error Loading Product</Text>
        <Text style={styles.errorText}>{error || 'Product not found'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadProductDetails}
          accessibilityLabel="Try again"
          accessibilityRole="button"
          accessibilityHint="Double tap to reload product details"
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityHint="Navigate to previous screen"
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text
          style={styles.headerTitle}
          accessibilityRole="header"
        >
          Product Details
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: product.product?.images?.[0] || 'https://via.placeholder.com/300'
            }}
            style={styles.productImage}
            accessibilityLabel={`${product.product?.name || 'Product'} image`}
          />
        </View>

        {/* Product Info */}
        <View
          style={styles.section}
          accessibilityLabel={`Product information. ${product.product?.name || 'Unknown Product'}. ${product.product?.description || 'No description available'}`}
        >
          <Text style={styles.productName}>
            {product.product?.name || 'Unknown Product'}
          </Text>
          <Text style={styles.productDescription}>
            {product.product?.description || 'No description available'}
          </Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Purchase Date:</Text>
            <Text style={styles.infoValue}>{formatDate(product.purchaseDate)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quantity:</Text>
            <Text style={styles.infoValue}>{product.quantity}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Price:</Text>
            <Text style={styles.infoValue}>₹{product.totalPrice}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(product.status) }]}>
              <Text style={styles.statusText}>
                {product.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
              </Text>
            </View>
          </View>
        </View>

        {/* Warranty Information */}
        <View
          style={styles.section}
          accessibilityLabel={`Warranty information. ${product.warranty?.hasWarranty ? `Status: ${product.warrantyStatus?.replace('_', ' ') || 'Unknown'}. ${product.warrantyDaysRemaining !== undefined ? `${product.warrantyDaysRemaining} days remaining` : ''}` : 'No warranty information available'}`}
        >
          <Text style={styles.sectionTitle}>Warranty Information</Text>
          
          {product.warranty?.hasWarranty ? (
            <View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Warranty Status:</Text>
                <Text style={[styles.infoValue, { color: getWarrantyStatusColor(product.warrantyStatus) }]}>
                  {product.warrantyStatus?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                </Text>
              </View>
              
              {product.warrantyDaysRemaining !== undefined && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Days Remaining:</Text>
                  <Text style={styles.infoValue}>{product.warrantyDaysRemaining} days</Text>
                </View>
              )}
              
              {product.warranty?.endDate && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Warranty Expires:</Text>
                  <Text style={styles.infoValue}>{formatDate(product.warranty.endDate)}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.noInfoText}>No warranty information available</Text>
          )}
        </View>

        {/* AMC Information */}
        <View
          style={styles.section}
          accessibilityLabel={`AMC information. ${product.amc?.hasAMC ? `Status: ${product.isAMCExpiringSoon ? 'Expiring soon' : 'Active'}. ${product.amcDaysRemaining !== undefined ? `${product.amcDaysRemaining} days remaining` : ''}` : 'No AMC information available'}`}
        >
          <Text style={styles.sectionTitle}>AMC Information</Text>
          
          {product.amc?.hasAMC ? (
            <View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>AMC Status:</Text>
                <Text style={[styles.infoValue, { 
                  color: product.isAMCExpiringSoon ? '#F59E0B' : '#10B981' 
                }]}>
                  {product.isAMCExpiringSoon ? 'EXPIRING SOON' : 'ACTIVE'}
                </Text>
              </View>
              
              {product.amcDaysRemaining !== undefined && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Days Remaining:</Text>
                  <Text style={styles.infoValue}>{product.amcDaysRemaining} days</Text>
                </View>
              )}
              
              {product.amc?.endDate && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>AMC Expires:</Text>
                  <Text style={styles.infoValue}>{formatDate(product.amc.endDate)}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.noInfoText}>No AMC information available</Text>
          )}
        </View>

        {/* Registration Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registration Information</Text>
          
          {product.registration?.isRegistered ? (
            <View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Registration Status:</Text>
                <Text style={[styles.infoValue, { color: '#10B981' }]}>REGISTERED</Text>
              </View>
              
              {product.registration?.serialNumber && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Serial Number:</Text>
                  <Text style={styles.infoValue}>{product.registration.serialNumber}</Text>
                </View>
              )}
              
              {product.registration?.registrationNumber && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Registration Number:</Text>
                  <Text style={styles.infoValue}>{product.registration.registrationNumber}</Text>
                </View>
              )}
            </View>
          ) : (
            <View>
              <Text style={styles.noInfoText}>Product not registered</Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleRegisterProduct}
                accessibilityLabel="Register product"
                accessibilityRole="button"
                accessibilityHint="Double tap to register this product with serial number for warranty activation"
              >
                <Text style={styles.actionButtonText}>Register Product</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCreateServiceRequest}
            accessibilityLabel={`Request service for ${product.product?.name || 'this product'}`}
            accessibilityRole="button"
            accessibilityHint="Double tap to create a service request for repairs or maintenance"
          >
            <Ionicons name="construct" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Request Service</Text>
          </TouchableOpacity>

          {product.installation?.required && !product.installation?.completed && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleScheduleInstallation}
              accessibilityLabel="Schedule installation"
              accessibilityRole="button"
              accessibilityHint="Double tap to schedule product installation with a technician"
            >
              <Ionicons name="calendar" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Schedule Installation</Text>
            </TouchableOpacity>
          )}

          {product.amc?.renewalDue && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRenewAMC}
              accessibilityLabel="Renew AMC"
              accessibilityRole="button"
              accessibilityHint="Double tap to renew annual maintenance contract for this product"
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Renew AMC</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  noInfoText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  actionsSection: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
