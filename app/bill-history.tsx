// Bill History Page
// View all uploaded bills with their verification status and cashback details

import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { billUploadService } from '@/services/billUploadService';

interface Bill {
  _id: string;
  billImage: {
    url: string;
    thumbnailUrl?: string;
  };
  merchant: {
    _id: string;
    name: string;
    logo?: string;
  };
  amount: number;
  billDate: string;
  billNumber?: string;
  verificationStatus: 'pending' | 'processing' | 'approved' | 'rejected';
  rejectionReason?: string;
  resubmissionCount?: number;
  cashbackAmount?: number;
  cashbackStatus?: 'pending' | 'credited' | 'failed';
  createdAt: string;
  extractedData?: {
    merchantName?: string;
    amount?: number;
    date?: string;
  };
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function BillHistoryPage() {
  const router = useRouter();
  const navigation = useNavigation();

  // Hide the default navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Safe navigation function for web compatibility
  const handleGoBack = () => {
    try {
      if (navigation && navigation.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
      } else if (router && router.push) {
        // Navigate to home if can't go back
        router.push('/');
      } else {
        // Final fallback - replace current route with home
        router.replace('/');
      }
    } catch (error) {
      // If all else fails, navigate to home

      if (router) {
        router.replace('/');
      }
    }
  };

  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Load bills on mount
  useEffect(() => {
    loadBills();
  }, []);

  // Apply filter when bills or filter changes
  useEffect(() => {
    applyFilter();
  }, [bills, activeFilter]);

  // Load bills from API
  const loadBills = async () => {
    try {
      setIsLoading(true);
      const response = await billUploadService.getBillHistory();

      if (response.success && response.data) {
        setBills(response.data);
      } else {
        console.error('Failed to load bills:', response.error);
      }
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Refresh bills
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadBills();
  }, []);

  // Apply filter
  const applyFilter = () => {
    if (activeFilter === 'all') {
      setFilteredBills(bills);
    } else {
      setFilteredBills(bills.filter(bill => bill.verificationStatus === activeFilter));
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      case 'processing':
        return '#F59E0B';
      case 'pending':
      default:
        return '#6B7280';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'processing':
        return 'hourglass';
      case 'pending':
      default:
        return 'time';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Handle bill detail view
  const viewBillDetail = (bill: Bill) => {
    setSelectedBill(bill);
    setShowDetailModal(true);
  };

  // Resubmit rejected bill
  const resubmitBill = async (billId: string) => {
    Alert.alert(
      'Resubmit Bill',
      'Would you like to upload a new photo for this bill?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Upload New Photo',
          onPress: () => {
            setShowDetailModal(false);
            router?.push ? router.push('/bill-upload') : console.warn('Router not available');
          },
        },
      ]
    );
  };

  // Calculate total cashback
  const totalCashback = bills
    .filter(bill => bill.verificationStatus === 'approved' && bill.cashbackAmount)
    .reduce((sum, bill) => sum + (bill.cashbackAmount || 0), 0);

  // Calculate pending bills
  const pendingBills = bills.filter(bill =>
    bill.verificationStatus === 'pending' || bill.verificationStatus === 'processing'
  ).length;

  // Render filter buttons
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === filter && styles.filterButtonTextActive,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render bill card
  const renderBillCard = (bill: Bill) => (
    <TouchableOpacity
      key={bill._id}
      style={styles.billCard}
      onPress={() => viewBillDetail(bill)}
    >
      <Image
        source={{ uri: bill.billImage.thumbnailUrl || bill.billImage.url }}
        style={styles.billThumbnail}
      />

      <View style={styles.billInfo}>
        <View style={styles.billHeader}>
          <Text style={styles.merchantName}>{bill.merchant.name}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(bill.verificationStatus) + '20' },
            ]}
          >
            <Ionicons
              name={getStatusIcon(bill.verificationStatus)}
              size={14}
              color={getStatusColor(bill.verificationStatus)}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(bill.verificationStatus) },
              ]}
            >
              {bill.verificationStatus.charAt(0).toUpperCase() + bill.verificationStatus.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.billDetails}>
          <View style={styles.billDetailRow}>
            <Text style={styles.billDetailLabel}>Amount:</Text>
            <Text style={styles.billDetailValue}>{formatCurrency(bill.amount)}</Text>
          </View>
          <View style={styles.billDetailRow}>
            <Text style={styles.billDetailLabel}>Date:</Text>
            <Text style={styles.billDetailValue}>{formatDate(bill.billDate)}</Text>
          </View>
          {bill.billNumber && (
            <View style={styles.billDetailRow}>
              <Text style={styles.billDetailLabel}>Bill #:</Text>
              <Text style={styles.billDetailValue}>{bill.billNumber}</Text>
            </View>
          )}
        </View>

        {bill.verificationStatus === 'approved' && bill.cashbackAmount && (
          <View style={styles.cashbackContainer}>
            <Ionicons name="gift" size={16} color="#10B981" />
            <Text style={styles.cashbackText}>
              Cashback: {formatCurrency(bill.cashbackAmount)}
            </Text>
            {bill.cashbackStatus === 'credited' && (
              <View style={styles.creditedBadge}>
                <Text style={styles.creditedText}>Credited</Text>
              </View>
            )}
          </View>
        )}

        {bill.verificationStatus === 'rejected' && bill.rejectionReason && (
          <View style={styles.rejectionContainer}>
            <Text style={styles.rejectionReason}>{bill.rejectionReason}</Text>
            {bill.resubmissionCount !== undefined && bill.resubmissionCount > 0 && (
              <Text style={styles.resubmissionCounter}>
                Resubmitted: {bill.resubmissionCount}/3 times
                {bill.resubmissionCount < 3 && ` • ${3 - bill.resubmissionCount} attempt${3 - bill.resubmissionCount === 1 ? '' : 's'} remaining`}
              </Text>
            )}
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  // Render detail modal
  const renderDetailModal = () => {
    if (!selectedBill) return null;

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bill Details</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Bill Image */}
              <Image
                source={{ uri: selectedBill.billImage.url }}
                style={styles.fullBillImage}
                resizeMode="contain"
              />

              {/* Status */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Status</Text>
                <View
                  style={[
                    styles.statusBadgeLarge,
                    { backgroundColor: getStatusColor(selectedBill.verificationStatus) + '20' },
                  ]}
                >
                  <Ionicons
                    name={getStatusIcon(selectedBill.verificationStatus)}
                    size={24}
                    color={getStatusColor(selectedBill.verificationStatus)}
                  />
                  <Text
                    style={[
                      styles.statusTextLarge,
                      { color: getStatusColor(selectedBill.verificationStatus) },
                    ]}
                  >
                    {selectedBill.verificationStatus.charAt(0).toUpperCase() +
                     selectedBill.verificationStatus.slice(1)}
                  </Text>
                </View>
              </View>

              {/* Bill Information */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Bill Information</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Merchant:</Text>
                  <Text style={styles.detailValue}>{selectedBill.merchant.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount:</Text>
                  <Text style={styles.detailValue}>{formatCurrency(selectedBill.amount)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bill Date:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedBill.billDate)}</Text>
                </View>
                {selectedBill.billNumber && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Bill Number:</Text>
                    <Text style={styles.detailValue}>{selectedBill.billNumber}</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Uploaded:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedBill.createdAt)}</Text>
                </View>
              </View>

              {/* Cashback Information */}
              {selectedBill.verificationStatus === 'approved' && selectedBill.cashbackAmount && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Cashback</Text>
                  <View style={styles.cashbackDetailContainer}>
                    <Ionicons name="gift" size={32} color="#10B981" />
                    <Text style={styles.cashbackDetailAmount}>
                      {formatCurrency(selectedBill.cashbackAmount)}
                    </Text>
                    <Text style={styles.cashbackDetailStatus}>
                      {selectedBill.cashbackStatus === 'credited' ? 'Credited to Wallet' : 'Processing'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Rejection Reason */}
              {selectedBill.verificationStatus === 'rejected' && selectedBill.rejectionReason && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Rejection Reason</Text>
                  <View style={styles.rejectionDetailContainer}>
                    <Ionicons name="alert-circle" size={24} color="#EF4444" />
                    <Text style={styles.rejectionDetailText}>
                      {selectedBill.rejectionReason}
                    </Text>
                  </View>
                  {selectedBill.resubmissionCount !== undefined && selectedBill.resubmissionCount > 0 && (
                    <View style={styles.resubmissionDetailContainer}>
                      <Text style={styles.resubmissionDetailText}>
                        Resubmitted: {selectedBill.resubmissionCount}/3 times
                      </Text>
                      {selectedBill.resubmissionCount < 3 ? (
                        <Text style={styles.resubmissionDetailSubtext}>
                          You have {3 - selectedBill.resubmissionCount} attempt{3 - selectedBill.resubmissionCount === 1 ? '' : 's'} remaining
                        </Text>
                      ) : (
                        <Text style={styles.resubmissionLimitText}>
                          Maximum resubmission limit reached
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* Extracted Data (if available) */}
              {selectedBill.extractedData && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Extracted Data (OCR)</Text>
                  {selectedBill.extractedData.merchantName && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Detected Merchant:</Text>
                      <Text style={styles.detailValue}>{selectedBill.extractedData.merchantName}</Text>
                    </View>
                  )}
                  {selectedBill.extractedData.amount && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Detected Amount:</Text>
                      <Text style={styles.detailValue}>
                        {formatCurrency(selectedBill.extractedData.amount)}
                      </Text>
                    </View>
                  )}
                  {selectedBill.extractedData.date && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Detected Date:</Text>
                      <Text style={styles.detailValue}>{selectedBill.extractedData.date}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Actions */}
              {selectedBill.verificationStatus === 'rejected' && (
                <TouchableOpacity
                  style={styles.resubmitButton}
                  onPress={() => resubmitBill(selectedBill._id)}
                >
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                  <Text style={styles.resubmitButtonText}>Resubmit Bill</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={80} color="#CCC" />
      <Text style={styles.emptyStateTitle}>No Bills Yet</Text>
      <Text style={styles.emptyStateText}>
        Upload your bills to start earning cashback on offline purchases
      </Text>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => router?.push ? router.push('/bill-upload') : console.warn('Router not available')}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.uploadButtonText}>Upload Bill</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill History</Text>
        <TouchableOpacity onPress={() => router?.push ? router.push('/bill-upload') : console.warn('Router not available')}>
          <Ionicons name="add-circle" size={24} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {!isLoading && bills.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{bills.length}</Text>
            <Text style={styles.statLabel}>Total Bills</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{pendingBills}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {formatCurrency(totalCashback)}
            </Text>
            <Text style={styles.statLabel}>Cashback Earned</Text>
          </View>
        </View>
      )}

      {/* Filters */}
      {!isLoading && bills.length > 0 && renderFilters()}

      {/* Bill List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading bills...</Text>
        </View>
      ) : filteredBills.length === 0 ? (
        bills.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.emptyFilterState}>
            <Text style={styles.emptyFilterText}>No {activeFilter} bills found</Text>
          </View>
        )
      ) : (
        <ScrollView
          style={styles.billList}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#FF6B35"
            />
          }
        >
          {filteredBills.map(renderBillCard)}
        </ScrollView>
      )}

      {/* Detail Modal */}
      {renderDetailModal()}
    </View>
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  filtersContainer: {
    padding: 16,
    paddingTop: 0,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  billList: {
    flex: 1,
  },
  billCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  billThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  billInfo: {
    flex: 1,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  billDetails: {
    gap: 4,
  },
  billDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billDetailLabel: {
    fontSize: 12,
    color: '#999',
  },
  billDetailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  cashbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    gap: 6,
  },
  cashbackText: {
    flex: 1,
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  creditedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  creditedText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  rejectionContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  rejectionReason: {
    fontSize: 12,
    color: '#EF4444',
  },
  resubmissionCounter: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 4,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyFilterState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyFilterText: {
    fontSize: 16,
    color: '#999',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
  modalBody: {
    flex: 1,
  },
  fullBillImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#F8F9FA',
  },
  detailSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  statusTextLarge: {
    fontSize: 18,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  cashbackDetailContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
  },
  cashbackDetailAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10B981',
    marginVertical: 8,
  },
  cashbackDetailStatus: {
    fontSize: 14,
    color: '#10B981',
  },
  rejectionDetailContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    gap: 12,
  },
  rejectionDetailText: {
    flex: 1,
    fontSize: 14,
    color: '#EF4444',
    lineHeight: 20,
  },
  resubmissionDetailContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF9F2',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  resubmissionDetailText: {
    fontSize: 13,
    color: '#D97706',
    fontWeight: '600',
    marginBottom: 4,
  },
  resubmissionDetailSubtext: {
    fontSize: 12,
    color: '#92400E',
  },
  resubmissionLimitText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  resubmitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  resubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
