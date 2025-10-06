// ReorderModal Component
// Modal to confirm and customize reorder

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useReorder } from '@/hooks/useReorder';
import { ReorderValidation } from '@/services/reorderApi';
import { router } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import { showToast } from '@/components/common/ToastManager';

interface ReorderModalProps {
  visible: boolean;
  orderId: string;
  orderNumber?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReorderModal({
  visible,
  orderId,
  orderNumber,
  onClose,
  onSuccess
}: ReorderModalProps) {
  const {
    validating,
    reordering,
    validation,
    error,
    validateReorder,
    reorderFull,
    reorderSelected,
    clearValidation
  } = useReorder();

  const { refreshCart } = useCart();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(true);

  useEffect(() => {
    if (visible && orderId) {
      // Validate when modal opens
      validateReorder(orderId);
    } else {
      // Clear when modal closes
      clearValidation();
      setSelectedItems(new Set());
      setSelectAll(true);
    }
  }, [visible, orderId]);

  useEffect(() => {
    // Initialize selected items when validation loads
    if (validation && validation.items.length > 0) {
      const availableItems = validation.items
        .filter(item => item.isAvailable)
        .map(item => item.productId);
      setSelectedItems(new Set(availableItems));
      setSelectAll(availableItems.length === validation.items.length);
    }
  }, [validation]);

  const toggleItemSelection = (productId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedItems(newSelected);
    setSelectAll(
      validation?.items.filter(i => i.isAvailable).length === newSelected.size
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const availableItems = validation?.items
        .filter(item => item.isAvailable)
        .map(item => item.productId) || [];
      setSelectedItems(new Set(availableItems));
    }
    setSelectAll(!selectAll);
  };

  const handleReorder = async () => {
    if (!validation) {
      console.log('❌ [ReorderModal] No validation data');
      return;
    }

    try {
      let success = false;

      if (selectedItems.size === 0) {
        Alert.alert('No Items Selected', 'Please select at least one item to reorder');
        return;
      }

      console.log('🔄 [ReorderModal] Starting reorder...', {
        orderId,
        selectedItemsCount: selectedItems.size,
        selectedItemIds: Array.from(selectedItems)
      });

      // Check if all available items are selected
      const availableItems = validation.items.filter(i => i.isAvailable);
      const allSelected = selectedItems.size === availableItems.length;

      console.log('🔄 [ReorderModal] Reorder type:', allSelected ? 'FULL' : 'SELECTED');

      if (allSelected) {
        // Reorder full order
        console.log('🔄 [ReorderModal] Calling reorderFull...');
        success = await reorderFull(orderId);
        console.log('🔄 [ReorderModal] reorderFull result:', success);
      } else {
        // Reorder selected items
        console.log('🔄 [ReorderModal] Calling reorderSelected...');
        success = await reorderSelected(orderId, Array.from(selectedItems));
        console.log('🔄 [ReorderModal] reorderSelected result:', success);
      }

      console.log('🔄 [ReorderModal] Final success status:', success);

      // Close modal regardless
      onClose();

      // Refresh cart to see if items were actually added
      console.log('🔄 [ReorderModal] Refreshing cart to check status...');
      await refreshCart();

      // Wait a bit for modal to close
      await new Promise(resolve => setTimeout(resolve, 300));

      if (success) {
        console.log('✅ [ReorderModal] Reorder successful, showing toast');

        // Show success toast with actions
        showToast({
          message: `${selectedItems.size} item(s) added to your cart`,
          type: 'success',
          duration: 0, // Don't auto-dismiss
          actions: [
            {
              text: 'Continue Shopping',
              onPress: () => {
                console.log('📱 User chose: Continue Shopping');
                onSuccess?.();
              },
              style: 'cancel'
            },
            {
              text: 'View Cart',
              onPress: () => {
                console.log('📱 User chose: View Cart');
                router.push('/CartPage');
              },
              style: 'default'
            }
          ]
        });
      } else {
        console.log('❌ [ReorderModal] Reorder failed, success = false');
        // Check the error state for more details
        const errorMessage = error || 'Failed to add items to cart. Please try again.';
        console.log('❌ [ReorderModal] Error message:', errorMessage);

        showToast({
          message: errorMessage,
          type: 'error',
          duration: 4000
        });
      }
    } catch (err) {
      console.error('❌ [ReorderModal] Error during reorder:', err);
      Alert.alert(
        'Reorder Failed',
        err instanceof Error ? err.message : 'Failed to reorder items'
      );
    }
  };

  const renderItem = (item: any, index: number) => {
    const isSelected = selectedItems.has(item.productId);
    const priceDiff = item.priceDifference;
    const hasPriceChange = Math.abs(priceDiff) > 0.01;
    const priceIncreased = priceDiff > 0;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.itemCard,
          !item.isAvailable && styles.itemCardDisabled
        ]}
        onPress={() => item.isAvailable && toggleItemSelection(item.productId)}
        disabled={!item.isAvailable}
        activeOpacity={0.7}
      >
        <View style={styles.checkbox}>
          {item.isAvailable && (
            <View style={[styles.checkboxInner, isSelected && styles.checkboxSelected]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          )}
        </View>

        <View style={styles.itemContent}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>₹{item.currentPrice.toFixed(2)}</Text>
              {hasPriceChange && (
                <View style={[
                  styles.priceBadge,
                  { backgroundColor: priceIncreased ? '#fef3c7' : '#d1fae5' }
                ]}>
                  <Text style={[
                    styles.priceBadgeText,
                    { color: priceIncreased ? '#92400e' : '#065f46' }
                  ]}>
                    {priceIncreased ? '+' : ''}{priceDiff.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>

            {item.hasStockIssue && (
              <Text style={styles.stockWarning}>
                Only {item.availableStock} in stock
              </Text>
            )}

            {!item.isAvailable && (
              <Text style={styles.unavailableText}>
                {item.hasVariantIssue ? 'Variant unavailable' : 'Out of stock'}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Reorder Items</Text>
              {orderNumber && (
                <Text style={styles.subtitle}>Order #{orderNumber}</Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {validating && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={styles.loadingText}>Checking availability...</Text>
            </View>
          )}

          {error && !validating && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => validateReorder(orderId)}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {validation && !validating && (
            <>
              {validation.warnings.length > 0 && (
                <View style={styles.warningsContainer}>
                  <Text style={styles.warningsTitle}>Please Note:</Text>
                  {validation.warnings.slice(0, 3).map((warning, idx) => (
                    <Text key={idx} style={styles.warningText}>
                      • {warning}
                    </Text>
                  ))}
                  {validation.warnings.length > 3 && (
                    <Text style={styles.warningText}>
                      • +{validation.warnings.length - 3} more changes
                    </Text>
                  )}
                </View>
              )}

              {validation.items.length > 0 && (
                <TouchableOpacity
                  style={styles.selectAllButton}
                  onPress={toggleSelectAll}
                >
                  <View style={[styles.checkbox, styles.selectAllCheckbox]}>
                    <View style={[styles.checkboxInner, selectAll && styles.checkboxSelected]}>
                      {selectAll && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </View>
                  <Text style={styles.selectAllText}>Select All Available Items</Text>
                </TouchableOpacity>
              )}

              <ScrollView style={styles.itemsList}>
                {validation.items.map(renderItem)}
              </ScrollView>

              <View style={styles.footer}>
                <View style={styles.totalSection}>
                  <Text style={styles.totalLabel}>Total ({selectedItems.size} items)</Text>
                  <Text style={styles.totalAmount}>
                    ₹{validation.items
                      .filter(i => selectedItems.has(i.productId))
                      .reduce((sum, i) => sum + (i.currentPrice * i.quantity), 0)
                      .toFixed(2)}
                  </Text>
                  {validation.totalDifference !== 0 && (
                    <Text style={[
                      styles.totalDiff,
                      { color: validation.totalDifference > 0 ? '#dc2626' : '#16a34a' }
                    ]}>
                      {validation.totalDifference > 0 ? '+' : ''}₹{validation.totalDifference.toFixed(2)} from original
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.reorderButton,
                    (reordering || selectedItems.size === 0) && styles.reorderButtonDisabled
                  ]}
                  onPress={handleReorder}
                  disabled={reordering || selectedItems.size === 0}
                >
                  {reordering ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.reorderButtonText}>Add to Cart</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280'
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: '600'
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280'
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center'
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  warningsContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fbbf24'
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8
  },
  warningText: {
    fontSize: 13,
    color: '#92400e',
    marginBottom: 4,
    lineHeight: 18
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  selectAllCheckbox: {
    marginRight: 12
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827'
  },
  itemsList: {
    maxHeight: 400
  },
  itemCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff'
  },
  itemCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#f9fafb'
  },
  checkbox: {
    marginRight: 12,
    justifyContent: 'center'
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1'
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row'
  },
  itemInfo: {
    flex: 1
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8
  },
  priceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: '600'
  },
  stockWarning: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 4
  },
  unavailableText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
    marginTop: 4
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff'
  },
  totalSection: {
    marginBottom: 16
  },
  totalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827'
  },
  totalDiff: {
    fontSize: 12,
    marginTop: 4
  },
  reorderButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  reorderButtonDisabled: {
    backgroundColor: '#d1d5db',
    opacity: 0.6
  },
  reorderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
