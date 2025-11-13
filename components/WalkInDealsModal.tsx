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
        const transformedDeals = fetchedDeals.map((deal: any) => ({
          id: deal.id,
          title: deal.title,
          discountType: deal.discountType === 'bogo' ? 'fixed' : deal.discountType,
          discountValue: deal.discountValue,
          minimumBill: deal.minPurchase || 0,
          maxDiscount: deal.maxDiscount,
          isOfflineOnly: deal.type === 'walk_in',
          terms: deal.terms || [],
          isActive: deal.isActive,
          validUntil: new Date(deal.validUntil),
          category: deal.category || 'instant-discount',
          description: deal.description,
          priority: deal.priority || 1,
          usageLimit: deal.usageLimit,
          usageCount: deal.usedCount || 0,
          applicableProducts: deal.applicableProducts || [],
          badge: deal.badge || {
            text: `${deal.discountValue}%`,
            backgroundColor: '#E5E7EB',
            textColor: '#374151'
          }
        }));

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

                <View style={styles.header}>
                  <ThemedText style={styles.headerTitle}>Walk-in Deals</ThemedText>
                  <ThemedText style={styles.headerSubtitle}>
                    {dealCount > 0 ? `${dealCount} deals available` : 'Available offers for this store'}
                  </ThemedText>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
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
                    <Ionicons name="gift-outline" size={64} color="#D1D5DB" />
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
      borderRadius: isTabletOrLarge ? 0 : 20,
      width: '100%',
      maxHeight: maxModalHeight,
      minHeight: isSmallScreen ? 300 : 400,
      padding: modalPadding,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 6,
    },
    closeButton: {
      position: 'absolute',
      top: modalPadding - 4,
      right: modalPadding - 4,
      backgroundColor: '#f2f2f2',
      borderRadius: 20,
      width: isSmallScreen ? 28 : 32,
      height: isSmallScreen ? 28 : 32,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    header: {
      marginTop: isSmallScreen ? 16 : 24,
      marginBottom: isSmallScreen ? 16 : 20,
      alignItems: 'center',
      paddingHorizontal: isSmallScreen ? 12 : 20,
      paddingTop: 8,
      zIndex: 1,
    },
    headerTitle: {
      fontSize: isSmallScreen ? 18 : isTabletOrLarge ? 24 : 20,
      fontWeight: '700',
      color: '#111',
      marginBottom: 6,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: isSmallScreen ? 13 : isTabletOrLarge ? 16 : 14,
      color: '#666',
      textAlign: 'center',
      lineHeight: isSmallScreen ? 18 : 20,
    },
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: isSmallScreen ? 8 : 12,
      paddingVertical: 12,
      gap: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#F1F5F9',
      marginBottom: 12,
    },
    filterTab: {
      paddingHorizontal: isSmallScreen ? 10 : 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: '#F8FAFC',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      minHeight: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterTabActive: {
      backgroundColor: '#7C3AED',
      borderColor: '#7C3AED',
    },
    filterTabText: {
      fontSize: isSmallScreen ? 12 : 13,
      fontWeight: '600',
      color: '#64748B',
    },
    filterTabTextActive: {
      color: '#FFFFFF',
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
      paddingVertical: 60,
      paddingHorizontal: 20,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#374151',
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 14,
      color: '#6B7280',
      textAlign: 'center',
      lineHeight: 20,
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
