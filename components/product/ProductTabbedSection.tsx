/**
 * ProductTabbedSection Component
 *
 * Tabbed content section with:
 * - Description tab
 * - Specs tab
 * - Reviews tab
 * - Lock Info tab
 *
 * Based on reference design from ProductPage redesign
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { triggerImpact } from '@/utils/haptics';

type TabId = 'description' | 'specs' | 'reviews' | 'lockinfo';

interface TabConfig {
  id: TabId;
  label: string;
}

interface Specification {
  key: string;
  value: string;
}

interface LockDetails {
  isLocked: boolean;
  lockedAt?: string;
  expiresAt?: string;
  lockFee?: number;
}

interface ProductTabbedSectionProps {
  /** Product description */
  description?: string;
  /** Product features (bullet points) */
  features?: string[];
  /** Product specifications */
  specifications?: Specification[];
  /** Lock details */
  lockDetails?: LockDetails;
  /** Callback when reviews tab is selected */
  onReviewsPress?: () => void;
  /** Currency symbol */
  currency?: string;
  /** Custom style */
  style?: any;
}

// Tab configuration
const TABS: TabConfig[] = [
  { id: 'description', label: 'Description' },
  { id: 'specs', label: 'Specs' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'lockinfo', label: 'Lock Info' },
];

export const ProductTabbedSection: React.FC<ProductTabbedSectionProps> = ({
  description = 'No description available',
  features = [],
  specifications = [],
  lockDetails,
  onReviewsPress,
  currency = '₹',
  style,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('description');

  const handleTabPress = (tabId: TabId) => {
    triggerImpact('Light');
    setActiveTab(tabId);

    if (tabId === 'reviews' && onReviewsPress) {
      onReviewsPress();
    }
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.descriptionText}>{description}</Text>

            {features.length > 0 && (
              <View style={styles.featuresList}>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );

      case 'specs':
        return (
          <View style={styles.tabContent}>
            {specifications.length > 0 ? (
              <View style={styles.specsTable}>
                {specifications.map((spec, index) => (
                  <View
                    key={index}
                    style={[
                      styles.specRow,
                      index % 2 === 0 && styles.specRowAlt,
                    ]}
                  >
                    <Text style={styles.specKey}>{spec.key}</Text>
                    <Text style={styles.specValue}>{spec.value}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No specifications available</Text>
            )}
          </View>
        );

      case 'reviews':
        return (
          <View style={styles.tabContent}>
            <TouchableOpacity
              style={styles.viewReviewsButton}
              onPress={onReviewsPress}
              activeOpacity={0.7}
            >
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text style={styles.viewReviewsText}>View All Reviews</Text>
              <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
        );

      case 'lockinfo':
        return (
          <View style={styles.tabContent}>
            {lockDetails?.isLocked ? (
              <View style={styles.lockInfoCard}>
                <View style={styles.lockInfoHeader}>
                  <Ionicons name="lock-closed" size={24} color="#7C3AED" />
                  <Text style={styles.lockInfoTitle}>Product is Locked</Text>
                </View>

                <View style={styles.lockInfoDetails}>
                  {lockDetails.lockFee && (
                    <View style={styles.lockInfoRow}>
                      <Text style={styles.lockInfoLabel}>Lock Fee Paid</Text>
                      <Text style={styles.lockInfoValue}>
                        {currency}{lockDetails.lockFee}
                      </Text>
                    </View>
                  )}

                  {lockDetails.expiresAt && (
                    <View style={styles.lockInfoRow}>
                      <Text style={styles.lockInfoLabel}>Expires At</Text>
                      <Text style={styles.lockInfoValue}>
                        {new Date(lockDetails.expiresAt).toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.priceProtectedBadge}>
                  <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                  <Text style={styles.priceProtectedText}>Price Protected</Text>
                </View>
              </View>
            ) : (
              <View style={styles.noLockCard}>
                <Ionicons name="lock-open-outline" size={32} color="#9CA3AF" />
                <Text style={styles.noLockTitle}>No Active Lock</Text>
                <Text style={styles.noLockText}>
                  Lock this product to protect the price and reserve it for yourself
                </Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Tab Headers */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.tabActive,
            ]}
            onPress={() => handleTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      {renderTabContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },

  // Tabs
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },

  tab: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  tabActive: {
    borderBottomColor: '#7C3AED',
  },

  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },

  tabLabelActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },

  // Tab Content
  tabContent: {
    padding: 16,
  },

  // Description Tab
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },

  featuresList: {
    gap: 12,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },

  // Specs Tab
  specsTable: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  specRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  specRowAlt: {
    backgroundColor: '#F9FAFB',
  },

  specKey: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },

  specValue: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
    textAlign: 'right',
  },

  // Reviews Tab
  viewReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },

  viewReviewsText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },

  // Lock Info Tab
  lockInfoCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },

  lockInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },

  lockInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C3AED',
  },

  lockInfoDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    gap: 12,
    marginBottom: 14,
  },

  lockInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  lockInfoLabel: {
    fontSize: 13,
    color: '#6B7280',
  },

  lockInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },

  priceProtectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 8,
  },

  priceProtectedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },

  // No Lock State
  noLockCard: {
    alignItems: 'center',
    padding: 24,
  },

  noLockTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 6,
  },

  noLockText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Empty State
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    padding: 20,
  },
});

export default ProductTabbedSection;
