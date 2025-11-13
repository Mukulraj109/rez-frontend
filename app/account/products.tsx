import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import userProductService, { UserProduct } from '../../services/userProductApi';

export default function ProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'warranty_expired'>('all');

  useEffect(() => {
    loadProducts();
  }, [selectedFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = selectedFilter !== 'all' ? { status: selectedFilter as any } : undefined;
      const response = await userProductService.getUserProducts(filters);

      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        console.warn('Failed to load products:', response.error);
        setError('Failed to load products. Please try again.');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products. Please check your connection and try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderFilterButton = (
    filter: 'all' | 'active' | 'warranty_expired',
    label: string
  ) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(filter)}
      accessibilityLabel={`${label} products${selectedFilter === filter ? ', selected' : ''}`}
      accessibilityRole="tab"
      accessibilityState={{ selected: selectedFilter === filter }}
      accessibilityHint="Double tap to filter products by this category"
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderProductCard = ({ item }: { item: UserProduct }) => {
    // Safely access nested properties
    const productName = item.product?.name || 'Unknown Product';
    const productImages = item.product?.images || [];
    const productImage = productImages.length > 0 ? productImages[0] : 'https://via.placeholder.com/100';

    const warrantyInfo = item.warranty?.hasWarranty && item.warrantyStatus
      ? `Warranty: ${item.warrantyStatus === 'active' ? `${item.warrantyDaysRemaining || 0} days left` : item.warrantyStatus.replace('_', ' ')}`
      : '';
    const amcInfo = item.amc?.hasAMC ? `AMC: ${item.amcDaysRemaining || 0} days remaining` : '';
    const statusInfo = `Status: ${item.status?.replace('_', ' ') || 'unknown'}`;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/account/product-detail?id=${item._id}`)}
        accessibilityLabel={`${productName}. Purchased ${formatDate(item.purchaseDate)}. ${warrantyInfo ? warrantyInfo + '. ' : ''}${amcInfo ? amcInfo + '. ' : ''}${statusInfo}`}
        accessibilityRole="button"
        accessibilityHint="Double tap to view full product details, warranty, and service options"
      >
        {/* Product Image */}
        <Image
          source={{ uri: productImage }}
          style={styles.productImage}
          accessibilityLabel={`${productName} image`}
        />

        <View style={styles.productInfo}>
          {/* Product Name */}
          <Text style={styles.productName} numberOfLines={2}>
            {productName}
          </Text>

          {/* Purchase Date */}
          <Text style={styles.productDate}>
            Purchased: {formatDate(item.purchaseDate)}
          </Text>

          {/* Warranty Info */}
          {item.warranty?.hasWarranty && (
            <View style={styles.warrantyInfo}>
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={getWarrantyStatusColor(item.warrantyStatus)}
              />
              <Text
                style={[
                  styles.warrantyText,
                  { color: getWarrantyStatusColor(item.warrantyStatus) },
                ]}
              >
                {item.warrantyStatus === 'active' &&
                  `Warranty: ${item.warrantyDaysRemaining || 0} days left`}
                {item.warrantyStatus === 'expiring_soon' &&
                  `Expiring soon: ${item.warrantyDaysRemaining || 0} days`}
                {item.warrantyStatus === 'expired' && 'Warranty expired'}
                {item.warrantyStatus === 'no_warranty' && 'No warranty'}
              </Text>
            </View>
          )}

          {/* AMC Info */}
          {item.amc?.hasAMC && (
            <View style={styles.amcInfo}>
              <Ionicons
                name="construct"
                size={16}
                color={item.isAMCExpiringSoon ? '#F59E0B' : '#10B981'}
              />
              <Text
                style={[
                  styles.amcText,
                  { color: item.isAMCExpiringSoon ? '#F59E0B' : '#10B981' },
                ]}
              >
                {item.isAMCExpiringSoon
                  ? `AMC expiring: ${item.amcDaysRemaining || 0} days`
                  : `AMC active: ${item.amcDaysRemaining || 0} days`}
              </Text>
            </View>
          )}

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {item.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
            </Text>
          </View>
        </View>

        {/* Arrow Icon */}
        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View
      style={styles.emptyState}
      accessibilityLabel={`No products found. ${selectedFilter === 'all' ? 'You haven\'t purchased any products yet' : `No ${selectedFilter.replace('_', ' ')} products found`}`}
      accessibilityRole="text"
    >
      <Ionicons name="cube-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyStateTitle}>No Products Found</Text>
      <Text style={styles.emptyStateText}>
        {selectedFilter === 'all'
          ? 'You haven\'t purchased any products yet. Start shopping to see your products here!'
          : `No ${selectedFilter.replace('_', ' ')} products found.`}
      </Text>
      {selectedFilter === 'all' && (
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push('/MainStorePage')}
          accessibilityLabel="Start Shopping"
          accessibilityRole="button"
          accessibilityHint="Double tap to browse store and purchase products"
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderErrorState = () => (
    <View
      style={styles.errorState}
      accessibilityLabel={`Error loading products. ${error}`}
      accessibilityRole="alert"
    >
      <Ionicons name="alert-circle" size={64} color="#EF4444" />
      <Text style={styles.errorStateTitle}>Error Loading Products</Text>
      <Text style={styles.errorStateText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={loadProducts}
        accessibilityLabel="Try again"
        accessibilityRole="button"
        accessibilityHint="Double tap to reload products"
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading your products...</Text>
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
          My Products
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('active', 'Active')}
          {renderFilterButton('warranty_expired', 'Warranty Expired')}
        </ScrollView>
      </View>

      {/* Products List */}
      {error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
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
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  warrantyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  warrantyText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  amcInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  amcText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
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
  shopButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorStateText: {
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
