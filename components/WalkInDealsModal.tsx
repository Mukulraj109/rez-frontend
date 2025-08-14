import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Deal, DealModalProps } from '@/types/deals';
import { getDealsByStore, getTopDeals } from '@/utils/mock-deals-data';
import DealDetailsModal from '@/components/DealDetailsModal';
import DealList from '@/components/DealList';

export default function WalkInDealsModal({ visible, onClose, deals = [], storeId }: DealModalProps) {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDealForDetails, setSelectedDealForDetails] = useState<Deal | null>(null);
  const [isLoadingDeals, setIsLoadingDeals] = useState(false);
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

  const activeDeals = deals.length > 0 ? deals : (storeId ? getDealsByStore(storeId) : getTopDeals(5));
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
    setIsLoadingDeals(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoadingDeals(false);
  }, []);

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.blurContainer, { opacity: fadeAnim }]}>
            <BlurView intensity={50} style={styles.blur} />
          </Animated.View>

          <TouchableWithoutFeedback onPress={handleModalPress}>
            <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.modal}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={20} color="#555" />
                </TouchableOpacity>

                <View style={styles.header}>
                  <ThemedText style={styles.headerTitle}>Walk-in Deals</ThemedText>
                  <ThemedText style={styles.headerSubtitle}>Available offers for this store</ThemedText>
                </View>

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
      borderRadius: isTabletOrLarge ? 0 : 20, // No radius for full-width large screens
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
      marginBottom: isSmallScreen ? 20 : 28,
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
    listContainer: { flex: 1, marginTop: 0, paddingTop: 8 },
  });
};
