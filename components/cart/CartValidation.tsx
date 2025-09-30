// components/cart/CartValidation.tsx
// Modal component for displaying cart validation issues

import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CartValidationModalProps,
  ValidationIssue,
  VALIDATION_ISSUE_ICONS,
  VALIDATION_ISSUE_COLORS,
} from '@/types/validation.types';

const { width } = Dimensions.get('window');

export default function CartValidation({
  visible,
  validationResult,
  loading,
  onClose,
  onContinueToCheckout,
  onRemoveInvalidItems,
  onRefresh,
}: CartValidationModalProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const hasErrors = validationResult?.issues.some(issue => issue.severity === 'error') ?? false;
  const hasWarnings = validationResult?.issues.some(issue => issue.severity === 'warning') ?? false;
  const canCheckout = validationResult?.canCheckout ?? false;

  const errorIssues = validationResult?.issues.filter(issue => issue.severity === 'error') || [];
  const warningIssues = validationResult?.issues.filter(issue => issue.severity === 'warning') || [];
  const infoIssues = validationResult?.issues.filter(issue => issue.severity === 'info') || [];

  const handleRemoveInvalidItems = async () => {
    Alert.alert(
      'Remove Invalid Items',
      `This will remove ${validationResult?.invalidItems.length || 0} item(s) from your cart. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsRemoving(true);
            try {
              await onRemoveInvalidItems();
              onClose();
            } catch (error) {
              console.error('Error removing invalid items:', error);
            } finally {
              setIsRemoving(false);
            }
          },
        },
      ]
    );
  };

  const renderIssueCard = (issue: ValidationIssue, index: number) => {
    const iconName = VALIDATION_ISSUE_ICONS[issue.type] as keyof typeof Ionicons.glyphMap;
    const colors = VALIDATION_ISSUE_COLORS[issue.type];

    const iconColor = issue.severity === 'error'
      ? colors.error
      : issue.severity === 'warning'
      ? colors.warning
      : colors.info;

    return (
      <View key={`${issue.itemId}-${index}`} style={[styles.issueCard, { borderLeftColor: iconColor }]}>
        <View style={styles.issueHeader}>
          <View style={styles.issueIconContainer}>
            <View style={[styles.issueIcon, { backgroundColor: colors.bg }]}>
              <Ionicons name={iconName} size={20} color={iconColor} />
            </View>
            {issue.image && (
              <Image source={{ uri: issue.image }} style={styles.issueImage} resizeMode="cover" />
            )}
          </View>

          <View style={styles.issueInfo}>
            <ThemedText style={styles.issueProductName} numberOfLines={2}>
              {issue.productName}
            </ThemedText>
            <ThemedText style={[styles.issueMessage, { color: iconColor }]}>
              {issue.message}
            </ThemedText>

            {issue.type === 'low_stock' && issue.availableQuantity !== undefined && (
              <ThemedText style={styles.issueDetail}>
                Only {issue.availableQuantity} left
                {issue.requestedQuantity && ` (you wanted ${issue.requestedQuantity})`}
              </ThemedText>
            )}

            {issue.type === 'price_change' && issue.currentPrice && issue.previousPrice && (
              <View style={styles.priceChangeContainer}>
                <ThemedText style={styles.priceOld}>
                  ₹{issue.previousPrice}
                </ThemedText>
                <Ionicons name="arrow-forward" size={14} color="#6B7280" />
                <ThemedText style={styles.priceNew}>
                  ₹{issue.currentPrice}
                </ThemedText>
                <ThemedText style={[
                  styles.priceChangeBadge,
                  issue.currentPrice > issue.previousPrice ? styles.priceIncrease : styles.priceDecrease
                ]}>
                  {issue.currentPrice > issue.previousPrice ? '+' : ''}
                  ₹{Math.abs(issue.currentPrice - issue.previousPrice)}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <LinearGradient
            colors={hasErrors ? ['#DC2626', '#B91C1C'] : ['#8B5CF6', '#7C3AED']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIconContainer}>
                  <Ionicons
                    name={hasErrors ? 'alert-circle' : 'checkmark-circle'}
                    size={28}
                    color="white"
                  />
                </View>
                <View>
                  <ThemedText style={styles.headerTitle}>
                    {hasErrors ? 'Cart Validation' : 'Cart Status'}
                  </ThemedText>
                  <ThemedText style={styles.headerSubtitle}>
                    {loading
                      ? 'Checking availability...'
                      : validationResult
                      ? `${validationResult.issues.length} issue(s) found`
                      : 'Validating cart...'}
                  </ThemedText>
                </View>
              </View>

              <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <ThemedText style={styles.loadingText}>Validating cart items...</ThemedText>
              </View>
            ) : validationResult ? (
              <>
                {/* Error Issues */}
                {errorIssues.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="close-circle" size={20} color="#DC2626" />
                      <ThemedText style={[styles.sectionTitle, { color: '#DC2626' }]}>
                        Items Unavailable ({errorIssues.length})
                      </ThemedText>
                    </View>
                    {errorIssues.map((issue, index) => renderIssueCard(issue, index))}
                  </View>
                )}

                {/* Warning Issues */}
                {warningIssues.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="alert-circle" size={20} color="#D97706" />
                      <ThemedText style={[styles.sectionTitle, { color: '#D97706' }]}>
                        Low Stock Warnings ({warningIssues.length})
                      </ThemedText>
                    </View>
                    {warningIssues.map((issue, index) => renderIssueCard(issue, index))}
                  </View>
                )}

                {/* Info Issues */}
                {infoIssues.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="information-circle" size={20} color="#2563EB" />
                      <ThemedText style={[styles.sectionTitle, { color: '#2563EB' }]}>
                        Price Changes ({infoIssues.length})
                      </ThemedText>
                    </View>
                    {infoIssues.map((issue, index) => renderIssueCard(issue, index))}
                  </View>
                )}

                {/* Valid Items Summary */}
                {validationResult.validItems.length > 0 && (
                  <View style={[styles.section, styles.validSection]}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                      <ThemedText style={[styles.sectionTitle, { color: '#22C55E' }]}>
                        Available Items ({validationResult.validItems.length})
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.validText}>
                      {validationResult.validItems.length} item(s) ready for checkout
                    </ThemedText>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={64} color="#9CA3AF" />
                <ThemedText style={styles.emptyText}>No validation data available</ThemedText>
              </View>
            )}

            <View style={styles.bottomSpace} />
          </ScrollView>

          {/* Footer Actions */}
          {!loading && validationResult && (
            <View style={styles.footer}>
              {hasErrors && (
                <TouchableOpacity
                  style={[styles.button, styles.buttonDanger]}
                  onPress={handleRemoveInvalidItems}
                  activeOpacity={0.8}
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="trash" size={18} color="white" />
                      <ThemedText style={styles.buttonText}>
                        Remove Invalid Items ({validationResult.invalidItems.length})
                      </ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={onRefresh}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={18} color="#8B5CF6" />
                <ThemedText style={[styles.buttonText, { color: '#8B5CF6' }]}>
                  Refresh
                </ThemedText>
              </TouchableOpacity>

              {canCheckout && validationResult.validItems.length > 0 && (
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={onContinueToCheckout}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.buttonText}>
                    Continue to Checkout
                  </ThemedText>
                  <Ionicons name="arrow-forward" size={18} color="white" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  issueCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  issueIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  issueIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  issueImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  issueInfo: {
    flex: 1,
    marginLeft: 12,
  },
  issueProductName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  issueMessage: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  issueDetail: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  priceOld: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  priceNew: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  priceChangeBadge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceIncrease: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
  priceDecrease: {
    backgroundColor: '#D1FAE5',
    color: '#059669',
  },
  validSection: {
    backgroundColor: '#F0FDF4',
  },
  validText: {
    fontSize: 14,
    color: '#16A34A',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#6B7280',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#6B7280',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: '#8B5CF6',
  },
  buttonSecondary: {
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
  },
  buttonDanger: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  bottomSpace: {
    height: 20,
  },
});