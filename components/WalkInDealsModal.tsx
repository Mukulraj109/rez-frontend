import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
  Text,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Deal, DealModalProps } from '@/types/deals';
import DealDetailsModal from '@/components/DealDetailsModal';
import DealList from '@/components/DealList';
import realOffersApi from '@/services/realOffersApi';
import DealsListSkeleton from '@/components/skeletons/DealsListSkeleton';

export default function WalkInDealsModal({ visible, onClose, deals = [], storeId }: DealModalProps) {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDealForDetails, setSelectedDealForDetails] = useState<Deal | null>(null);

  // API state management
  const [isLoadingDeals, setIsLoadingDeals] = useState(false);
  const [apiDeals, setApiDeals] = useState<any[]>([]);
  const [dealCount, setDealCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'walk_in' | 'online' | 'combo' | 'cashback' | 'flash_sale'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'discount' | 'expiry' | 'newest'>('priority');

  const slideAnim = useRef(new Animated.Value(screenData.height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        setScreenData(window);
        if (!visible) {
          slideAnim.setValue(window.height);
        }
      }, 100);
    });

    return () => {
      subscription?.remove();
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, [slideAnim, visible]);

  // Fetch deals from API when modal opens or storeId changes
  useEffect(() => {
    if (visible && storeId) {
      fetchStoreDeals();
    }
  }, [visible, storeId, filterType, sortBy]);

  const fetchStoreDeals = useCallback(async () => {
    if (!storeId) return;

    try {
      setIsLoadingDeals(true);
      setError(null);

      const response = await realOffersApi.getStoreOffers(storeId, {
        type: filterType,
        active: true,
        sortBy: sortBy,
        limit: 20
      });

      if (response.success && response.data) {
        const fetchedDeals = response.data.deals || [];
        // Transform API deals to match Deal interface
        const transformedDeals = fetchedDeals.map((deal: any) => {
          // Determine discount type and value
          let discountType: 'percentage' | 'fixed' = 'percentage';
          let discountValue = 0;
          
          if (deal.type === 'cashback') {
            discountType = 'percentage';
            discountValue = deal.cashbackPercentage || 0;
          } else if (deal.type === 'discount' || deal.type === 'walk_in') {
            // For discount/walk_in, check if we have originalPrice and discountedPrice
            if (deal.originalPrice && deal.discountedPrice) {
              const discountAmount = deal.originalPrice - deal.discountedPrice;
              discountValue = Math.round((discountAmount / deal.originalPrice) * 100);
              discountType = 'percentage';
            } else if (deal.cashbackPercentage) {
              discountValue = deal.cashbackPercentage;
              discountType = 'percentage';
            } else {
              discountValue = 0;
            }
          } else {
            discountValue = deal.cashbackPercentage || 0;
          }

          // Generate badge text based on deal type and values
          let badgeText = '';
          if (deal.originalPrice && deal.discountedPrice) {
            const discountAmount = deal.originalPrice - deal.discountedPrice;
            const discountPercent = Math.round((discountAmount / deal.originalPrice) * 100);
            badgeText = `${discountPercent}% OFF`;
          } else if (deal.cashbackPercentage > 0) {
            badgeText = `${deal.cashbackPercentage}% Cashback`;
          } else if (discountValue > 0) {
            badgeText = `${discountValue}% OFF`;
          } else {
            badgeText = 'Special Deal';
          }

          // Map category to DealCategory
          const categoryMap: Record<string, string> = {
            'mega': 'instant-discount',
            'student': 'first-time',
            'new_arrival': 'instant-discount',
            'trending': 'instant-discount',
            'food': 'instant-discount',
            'fashion': 'instant-discount',
            'electronics': 'instant-discount',
            'general': 'instant-discount',
          };
          const mappedCategory = categoryMap[deal.category] || 'instant-discount';

          // Build terms array from restrictions and other fields
          const terms: string[] = [];
          if (deal.restrictions?.minOrderValue) {
            terms.push(`Minimum order: ₹${deal.restrictions.minOrderValue}`);
          }
          if (deal.restrictions?.maxDiscountAmount) {
            terms.push(`Max discount: ₹${deal.restrictions.maxDiscountAmount}`);
          }
          if (deal.restrictions?.usageLimitPerUser) {
            terms.push(`Limit: ${deal.restrictions.usageLimitPerUser} per user`);
          }
          if (deal.restrictions?.usageLimit) {
            terms.push(`Total limit: ${deal.restrictions.usageLimit} uses`);
          }
          if (deal.restrictions?.applicableOn && Array.isArray(deal.restrictions.applicableOn) && deal.restrictions.applicableOn.length > 0) {
            terms.push(`Applicable on: ${deal.restrictions.applicableOn.join(', ')}`);
          }
          if (deal.description) {
            // Add description as additional context if no other terms
            if (terms.length === 0) {
              terms.push(deal.description);
            }
          }

          // Determine badge color based on deal type
          let badgeBgColor = '#E5E7EB';
          let badgeTextColor = '#374151';
          if (deal.metadata?.featured || deal.type === 'mega') {
            badgeBgColor = '#FEF3C7';
            badgeTextColor = '#92400E';
          } else if (deal.type === 'cashback') {
            badgeBgColor = '#D1FAE5';
            badgeTextColor = '#065F46';
          } else if (deal.type === 'walk_in') {
            badgeBgColor = '#DBEAFE';
            badgeTextColor = '#1E40AF';
          }

          return {
            id: deal._id || deal.id,
            title: deal.title,
            discountType,
            discountValue,
            minimumBill: deal.restrictions?.minOrderValue || deal.minPurchase || 0,
            maxDiscount: deal.restrictions?.maxDiscountAmount || deal.maxDiscount,
            isOfflineOnly: deal.type === 'walk_in',
            terms: terms.length > 0 ? terms : (deal.restrictions?.applicableOn || []),
            isActive: deal.validity?.isActive !== false && new Date(deal.validity?.endDate || deal.validUntil || Date.now()) > new Date(),
            validUntil: new Date(deal.validity?.endDate || deal.validUntil || Date.now()),
            category: mappedCategory as any,
            description: deal.description || deal.subtitle || '',
            priority: deal.metadata?.priority || deal.priority || 1,
            usageLimit: deal.restrictions?.usageLimit || deal.usageLimit,
            usageCount: deal.usageCount || 0,
            applicableProducts: deal.restrictions?.applicableOn || deal.applicableProducts || [],
            badge: deal.badge || {
              text: badgeText,
              backgroundColor: badgeBgColor,
              textColor: badgeTextColor
            },
            // Additional fields for display
            image: deal.image,
            subtitle: deal.subtitle,
            originalPrice: deal.originalPrice,
            discountedPrice: deal.discountedPrice,
            featured: deal.metadata?.featured || false,
          };
        });

        setApiDeals(transformedDeals);
        setDealCount(response.data.totalCount || transformedDeals.length);
      } else {
        setError(response.message || 'Failed to load deals');
      }
    } catch (err) {
      console.error('❌ [WALK-IN DEALS] Error fetching store deals:', err);
      setError('Unable to load deals. Please try again.');
    } finally {
      setIsLoadingDeals(false);
    }
  }, [storeId, filterType, sortBy]);

  // Use API deals if available, otherwise fallback to passed deals
  const activeDeals = apiDeals.length > 0 ? apiDeals : deals;
  const styles = useMemo(() => createStyles(screenData), [screenData]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 100, friction: 8, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: screenData.height, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleBackdropPress = () => onClose();
  const handleModalPress = (event: any) => event.stopPropagation();

  const handleAddDeal = (dealId: string) =>
    setSelectedDeals(prev => (prev.includes(dealId) ? prev : [...prev, dealId]));
  const handleRemoveDeal = (dealId: string) =>
    setSelectedDeals(prev => prev.filter(id => id !== dealId));

  const handleMoreDetails = (dealId: string) => {
    const deal = activeDeals.find(d => d.id === dealId);
    if (deal) {
      setSelectedDealForDetails(deal);
      setShowDetailsModal(true);
    }
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedDealForDetails(null);
  };

  const handleRefreshDeals = useCallback(async () => {
    await fetchStoreDeals();
  }, [fetchStoreDeals]);

  const handleFilterChange = useCallback((type: typeof filterType) => {
    setFilterType(type);
  }, []);

  const handleSortChange = useCallback((sort: typeof sortBy) => {
    setSortBy(sort);
  }, []);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
      accessibilityLabel="Walk-in deals dialog"
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.blurContainer, { opacity: fadeAnim }]}>
            <BlurView intensity={50} style={styles.blur} />
          </Animated.View>

          <TouchableWithoutFeedback onPress={handleModalPress}>
            <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.modal}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  accessibilityLabel="Close walk-in deals"
                  accessibilityRole="button"
                  accessibilityHint="Double tap to close this dialog"
                >
                  <Ionicons name="close" size={20} color="#555" />
                </TouchableOpacity>

                <ScrollView 
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={true}
                  bounces={true}
                >
                  <View style={styles.header}>
                    <View style={styles.headerContent}>
                      <Ionicons name="pricetag" size={24} color="#7C3AED" style={styles.headerIcon} />
                      <View style={styles.headerTextContainer}>
                        <ThemedText style={styles.headerTitle}>Walk-in Deals</ThemedText>
                        <ThemedText style={styles.headerSubtitle}>
                          {dealCount > 0 ? `${dealCount} deals available` : 'Available offers for this store'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>

                  {/* Filter Tabs */}
                  <View style={styles.filterContainer}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.filterScrollContent}
                    >
                    <TouchableOpacity
                      style={[styles.filterTab, filterType === 'all' && styles.filterTabActive]}
                      onPress={() => handleFilterChange('all')}
                    >
                      <Text style={[styles.filterTabText, filterType === 'all' && styles.filterTabTextActive]}>
                        All
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.filterTab, filterType === 'walk_in' && styles.filterTabActive]}
                      onPress={() => handleFilterChange('walk_in')}
                    >
                      <Text style={[styles.filterTabText, filterType === 'walk_in' && styles.filterTabTextActive]}>
                        Walk-in
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.filterTab, filterType === 'online' && styles.filterTabActive]}
                      onPress={() => handleFilterChange('online')}
                    >
                      <Text style={[styles.filterTabText, filterType === 'online' && styles.filterTabTextActive]}>
                        Online
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.filterTab, filterType === 'cashback' && styles.filterTabActive]}
                      onPress={() => handleFilterChange('cashback')}
                    >
                      <Text style={[styles.filterTabText, filterType === 'cashback' && styles.filterTabTextActive]}>
                        Cashback
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.filterTab, filterType === 'combo' && styles.filterTabActive]}
                      onPress={() => handleFilterChange('combo')}
                    >
                      <Text style={[styles.filterTabText, filterType === 'combo' && styles.filterTabTextActive]}>
                        Combos
                      </Text>
                    </TouchableOpacity>
                    </ScrollView>
                  </View>

                  {/* Error State */}
                  {error && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={20} color="#EF4444" />
                      <Text style={styles.errorText}>{error}</Text>
                      <TouchableOpacity style={styles.retryButton} onPress={handleRefreshDeals}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Empty State */}
                  {!isLoadingDeals && !error && activeDeals.length === 0 && (
                    <View style={styles.emptyContainer}>
                      <View style={styles.emptyIconContainer}>
                        <Ionicons name="gift-outline" size={72} color="#7C3AED" />
                      </View>
                      <Text style={styles.emptyTitle}>No deals available right now</Text>
                      <Text style={styles.emptySubtitle}>Check back later for exciting offers!</Text>
                    </View>
                  )}

                  {/* Deals List */}
                  {!error && activeDeals.length > 0 && (
                    <View style={styles.listContainer}>
                      <DealList
                        deals={activeDeals}
                        selectedDeals={selectedDeals}
                        onAddDeal={handleAddDeal}
                        onRemoveDeal={handleRemoveDeal}
                        onMoreDetails={handleMoreDetails}
                        isLoading={isLoadingDeals}
                        onRefresh={handleRefreshDeals}
                        showFilters={true}
                      />
                    </View>
                  )}

                  {/* Loading Skeleton */}
                  {isLoadingDeals && activeDeals.length === 0 && (
                    <View style={styles.listContainer}>
                      <DealsListSkeleton count={4} />
                    </View>
                  )}
                </ScrollView>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      <DealDetailsModal
        visible={showDetailsModal}
        onClose={handleCloseDetailsModal}
        deal={selectedDealForDetails}
      />
    </Modal>
  );
}

const createStyles = (screenData: { width: number; height: number }) => {
  const isSmallScreen = screenData.width < 375;
  const isTabletOrLarge = screenData.width >= 768;
  const isLandscape = screenData.width > screenData.height;

  const modalPadding = isSmallScreen ? 12 : isTabletOrLarge ? 24 : 20;
  const horizontalPadding = isSmallScreen ? 8 : isTabletOrLarge ? 0 : 16;
  const maxModalHeight = isLandscape ? '95%' : isTabletOrLarge ? '85%' : '90%';

  return StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    blurContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    blur: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: horizontalPadding,
      paddingBottom: isSmallScreen ? 8 : 0,
      width: '100%',
    },
    modal: {
      backgroundColor: '#fff',
      borderTopLeftRadius: isTabletOrLarge ? 0 : 24,
      borderTopRightRadius: isTabletOrLarge ? 0 : 24,
      width: '100%',
      maxHeight: maxModalHeight,
      minHeight: isSmallScreen ? 300 : 400,
      padding: 0, // Remove padding from modal, add to scrollView
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
      overflow: 'hidden', // Ensure content doesn't overflow
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: modalPadding,
      paddingBottom: isSmallScreen ? modalPadding + 40 : modalPadding + 50, // Extra padding at bottom for savings preview
    },
    closeButton: {
      position: 'absolute',
      top: modalPadding + 4,
      right: modalPadding + 4,
      backgroundColor: '#F3F4F6',
      borderRadius: 20,
      width: isSmallScreen ? 36 : 40,
      height: isSmallScreen ? 36 : 40,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      marginTop: isSmallScreen ? 8 : 12,
      marginBottom: isSmallScreen ? 20 : 24,
      paddingHorizontal: isSmallScreen ? 8 : 12,
      zIndex: 1,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingRight: isSmallScreen ? 40 : 48, // Space for close button
    },
    headerIcon: {
      marginRight: 12,
    },
    headerTextContainer: {
      flex: 1,
      alignItems: 'flex-start',
    },
    headerTitle: {
      fontSize: isSmallScreen ? 22 : isTabletOrLarge ? 28 : 24,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: isSmallScreen ? 13 : isTabletOrLarge ? 15 : 14,
      color: '#6B7280',
      lineHeight: isSmallScreen ? 18 : 20,
    },
    filterContainer: {
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    filterScrollContent: {
      paddingHorizontal: isSmallScreen ? 8 : 12,
      gap: 10,
      alignItems: 'center',
    },
    filterTab: {
      paddingHorizontal: isSmallScreen ? 14 : 18,
      paddingVertical: 10,
      borderRadius: 24,
      backgroundColor: '#F9FAFB',
      borderWidth: 1.5,
      borderColor: '#E5E7EB',
      minHeight: 40,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    filterTabActive: {
      backgroundColor: '#7C3AED',
      borderColor: '#7C3AED',
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    filterTabText: {
      fontSize: isSmallScreen ? 12 : 13,
      fontWeight: '600',
      color: '#6B7280',
      letterSpacing: 0.2,
    },
    filterTabTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    listContainer: { flex: 1, marginTop: 0, paddingTop: 8 },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FEF2F2',
      padding: 16,
      borderRadius: 12,
      marginHorizontal: 12,
      marginVertical: 12,
      gap: 12,
    },
    errorText: {
      flex: 1,
      fontSize: 14,
      color: '#EF4444',
      fontWeight: '500',
    },
    retryButton: {
      backgroundColor: '#7C3AED',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '600',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 80,
      paddingHorizontal: 32,
    },
    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 8,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    emptySubtitle: {
      fontSize: 15,
      color: '#6B7280',
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 14,
      color: '#6B7280',
      fontWeight: '500',
    },
  });
};
