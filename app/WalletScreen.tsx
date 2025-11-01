import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CoinInfoCard } from '../components/CoinInfoCard';
import  RechargeWalletCard from "../components/RechargeWalletCard";
import ProfileCompletionCard from "@/components/ProfileCompletionCard";
import ScratchCardOffer from "@/components/ScratchCardOffer";
import scratchImage from "@/assets/images/scratch-offer.png";
import ProfileOptionsList from "../components/ProfileOptionsList";
import ReferAndEarnCard from "@/components/ReferAndEarnCard";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Dimensions,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { WalletBalanceCard } from '../components/WalletBalanceCard';
import { CoinBalance, WalletScreenProps } from '@/types/wallet';
import { useWallet } from '@/hooks/useWallet';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import { useProfile } from '@/hooks/useProfile';
import { useReferral } from '@/hooks/useReferral';
import { useWalletAnalytics } from '@/hooks/useWalletAnalytics';
import walletApi from '@/services/walletApi';
import { paybillApi } from '@/services/paybillApi';
import WalletErrorBoundary from '@/components/WalletErrorBoundary';

const WalletScreen: React.FC<WalletScreenProps> = ({
  userId = 'user-12345',
  onNavigateBack,
  onCoinPress,
}) => {
  const router = useRouter();
  const { goBack } = useSafeNavigation();
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  const { walletState, refreshWallet, retryLastOperation, clearError } = useWallet({
    userId,
    autoFetch: true,
    refreshInterval: 5 * 60 * 1000,
  });

  const { profile, completionStatus, isLoading: profileLoading, error: profileError } = useProfile({
    autoFetch: true,
    refreshInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  const { referralData, isLoading: referralLoading, error: referralError } = useReferral({
    autoFetch: true,
    refreshInterval: 15 * 60 * 1000, // Refresh every 15 minutes
  });

  const {
    trackWalletViewed,
    trackTopupInitiated,
    trackTopupCompleted,
    trackTopupFailed,
    trackTransactionViewed,
    trackError
  } = useWalletAnalytics();

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

  // Track wallet view
  useEffect(() => {
    trackWalletViewed();
  }, [trackWalletViewed]);

  // Fetch PayBill balance on mount
  useEffect(() => {
    const fetchPayBillBalance = async () => {

      setPaybillLoading(true);
      try {
        const response = await paybillApi.getBalance();
        if (response.success && response.data) {
          setPaybillBalance(response.data.paybillBalance || 0);
          // Calculate savings (20% of balance was bonus)
          const savings = Math.round((response.data.paybillBalance || 0) * 0.2);
          setTotalSavings(savings);

        }
      } catch (error) {
        console.error('🎟️ [Wallet] Failed to fetch PayBill balance:', error);
      } finally {
        setPaybillLoading(false);
      }
    };

    fetchPayBillBalance();
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshWallet(true);

      // Also refresh PayBill balance
      const response = await paybillApi.getBalance();
      if (response.success && response.data) {
        setPaybillBalance(response.data.paybillBalance || 0);
        const savings = Math.round((response.data.paybillBalance || 0) * 0.2);
        setTotalSavings(savings);
      }
    } catch (error) {
      Alert.alert('Refresh Failed', error instanceof Error ? error.message : 'Unable to refresh wallet data');
    }
  }, [refreshWallet]);

  const handleBackPress = useCallback(() => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      goBack('/' as any); // Fallback to home
    }
  }, [onNavigateBack, goBack]);

  const handleCoinPress = useCallback((coin: CoinBalance) => {
    if (onCoinPress) {
      onCoinPress(coin);
    } else {
      // Navigate to coin detail page
      router.push({
        pathname: '/coin-detail',
        params: { coinId: coin.id }
      });
    }
  }, [onCoinPress, router]);

  const handleRetry = useCallback(() => {
    retryLastOperation();
  }, [retryLastOperation]);

  // Topup state management
  const [topupLoading, setTopupLoading] = useState(false);
  const [selectedTopupAmount, setSelectedTopupAmount] = useState<number | null>(null);
  const [showTopupConfirm, setShowTopupConfirm] = useState(false);

  // PayBill state management
  const [paybillBalance, setPaybillBalance] = useState<number>(0);
  const [paybillLoading, setPaybillLoading] = useState(false);
  const [totalSavings, setTotalSavings] = useState<number>(0);

  const handleAmountSelect = useCallback((amount: number | "other") => {
    if (amount !== "other") {
      setSelectedTopupAmount(amount);
    }
  }, []);

  const handleTopupSubmit = useCallback((amount: number) => {

    trackTopupInitiated(amount);
    
    // Force navigation to new payment page
    router.replace({
      pathname: '/payment',
      params: {
        amount: amount.toString(),
        currency: 'RC',
        timestamp: Date.now().toString() // Force refresh
      }
    });
  }, [trackTopupInitiated, router]);

  const handleTopupConfirm = useCallback(async () => {
    if (!selectedTopupAmount) return;

    setShowTopupConfirm(false);
    setTopupLoading(true);

    try {
      const response = await walletApi.topup({
        amount: selectedTopupAmount,
        paymentMethod: 'TEST', // In production, this would be from payment gateway
        paymentId: `TOPUP_${Date.now()}` // Mock payment ID for testing
      });

      if (response.success && response.data) {

        // Track successful topup
        trackTopupCompleted(selectedTopupAmount);

        // Show success message
        Alert.alert(
          'Topup Successful! 🎉',
          `${selectedTopupAmount} RC has been added to your wallet.\n\nNew Balance: ${response.data.wallet.balance.total} RC`,
          [{ text: 'OK' }]
        );
        // Refresh wallet data
        await refreshWallet(true);
        setSelectedTopupAmount(null);
      } else {
        console.error('💰 [Wallet] Topup failed:', response.error);
        trackTopupFailed(selectedTopupAmount, response.error || 'Unknown error');
        Alert.alert(
          'Topup Failed',
          response.error || 'Unable to process topup. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('💰 [Wallet] Topup error:', error);
      trackTopupFailed(selectedTopupAmount, error instanceof Error ? error.message : 'Unknown error');
      trackError(error instanceof Error ? error : new Error('Topup error'), 'topup');
      Alert.alert(
        'Topup Error',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        [{ text: 'OK' }]
      );
    } finally {
      setTopupLoading(false);
    }
  }, [selectedTopupAmount, refreshWallet, trackTopupCompleted, trackTopupFailed, trackError]);

  const handleTopupCancel = useCallback(() => {
    setShowTopupConfirm(false);
    setSelectedTopupAmount(null);
  }, []);

  const styles = useMemo(() => createStyles(screenData), [screenData]);

  if (walletState.isLoading && !walletState.data) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
        <LinearGradient colors={['#7C3AED', '#8B5CF6'] as const} style={styles.headerBg}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Wallet</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading wallet...</Text>
        </View>
      </View>
    );
  }

  if (walletState.error && !walletState.data) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
        <LinearGradient colors={['#7C3AED', '#8B5CF6'] as const} style={styles.headerBg}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Wallet</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Unable to load wallet</Text>
          <Text style={styles.errorDetails}>{walletState.error.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!walletState.data) {
    return null;
  }

  const walletData = walletState.data;

  // Calculate total wallet balance including PayBill
  const totalWalletBalance = (walletData.totalBalance || 0) + paybillBalance;
  const formattedTotalBalance = walletData.currency === 'RC'
    ? `RC ${totalWalletBalance}`
    : `${walletData.currency} ${totalWalletBalance}`;

  return (
    <WalletErrorBoundary>
      <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      <LinearGradient colors={['#7C3AED', '#8B5CF6'] as const} style={styles.headerBg}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <View style={styles.amountCard}>
        <Text style={styles.currency}>{formattedTotalBalance}</Text>
        <Text style={styles.subtitle}>Total Wallet Balance</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={walletState.isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#7C3AED"
            colors={['#7C3AED']}
            progressBackgroundColor="#FFFFFF"
          />
        }
      >
        {walletData.coins.map((coin) => (
          <WalletBalanceCard key={coin.id} coin={coin} onPress={handleCoinPress} showChevron />
        ))}

        {/* View Transactions Button */}
        <View style={styles.transactionButtonContainer}>
          <TouchableOpacity
            style={styles.viewTransactionsButton}
            onPress={() => {
              trackTransactionViewed();
              router.push('/transactions');
            }}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED'] as const}
              style={styles.transactionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.transactionButtonContent}>
                <View style={styles.transactionIconContainer}>
                  <Ionicons name="receipt-outline" size={24} color="white" />
                </View>
                <View style={styles.transactionTextContainer}>
                  <Text style={styles.transactionButtonTitle}>View Transactions</Text>
                  <Text style={styles.transactionButtonSubtitle}>
                    Check your complete transaction history
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.8)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* PayBill Balance Card */}
        <View style={styles.paybillCardContainer}>
          <TouchableOpacity
            style={styles.paybillCard}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#10B981', '#059669'] as const}
              style={styles.paybillCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.paybillCardHeader}>
                <View style={styles.paybillIconContainer}>
                  <Ionicons name="wallet" size={28} color="white" />
                </View>
                <View style={styles.paybillHeaderText}>
                  <Text style={styles.paybillTitle}>PayBill Balance</Text>
                  <Text style={styles.paybillSubtitle}>Prepaid wallet with 20% bonus</Text>
                </View>
              </View>

              <View style={styles.paybillBalanceContainer}>
                {paybillLoading ? (
                  <Text style={styles.paybillBalanceText}>Loading...</Text>
                ) : (
                  <>
                    <Text style={styles.paybillBalanceText}>₹{paybillBalance}</Text>
                    {totalSavings > 0 && (
                      <View style={styles.savingsBadge}>
                        <Ionicons name="gift" size={14} color="#10B981" />
                        <Text style={styles.savingsBadgeText}>
                          Saved ₹{totalSavings} with bonus
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>

              <View style={styles.paybillActions}>
                <TouchableOpacity
                  style={styles.paybillActionButton}
                  onPress={() => {

                    router.push('/paybill-transactions');
                  }}
                >
                  <Text style={styles.paybillActionText}>View Transactions</Text>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.9)" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

         <RechargeWalletCard
  cashbackText="Upto 10% cashback on wallet recharge"
  amountOptions={[120, 500, 1000, 5000, 10000]}
  onAmountSelect={handleAmountSelect}
  onSubmit={handleTopupSubmit}
  isLoading={topupLoading}
  currency="RC"
/>

        {/* Only Image Coin Info Cards */}
        <CoinInfoCard 
          image={require('../assets/images/wallet1.png')} 
          onPress={() => {}}
        />
        <CoinInfoCard 
          image={require('../assets/images/wallet2.png')} 
          onPress={() => {}}
        />
        <CoinInfoCard 
          image={require('../assets/images/wallet3.png')} 
          onPress={() => {}}
        />

         <ProfileCompletionCard
        name={profile?.name || 'User'}
        completionPercentage={completionStatus?.completionPercentage || 0}
        onCompleteProfile={() => {
          router.push('/profile/edit');
        }}
        onViewDetails={() => {
          router.push('/profile');
        }}
        isLoading={profileLoading}
      />
      <ScratchCardOffer 
        imageSource={scratchImage} 
        onPress={() => router.push('/scratch-card')} 
        isActive={true}
      />
       <ProfileOptionsList 
         options={[
           {
             id: "2",
             icon: "receipt-outline",
             title: "Order History",
             subtitle: "View order details",
           },
           {
             id: "3",
             icon: "heart-outline",
             title: "Wishlist",
             subtitle: "All your Favorites",
           },
           {
             id: "4",
             icon: "location-outline",
             title: "Saved address",
             subtitle: "Edit, add, delete your address",
           },
           {
             id: "5",
             icon: "resize-outline",
             title: "Ring Sizer",
             subtitle: "Check your ring size",
           },
         ]}
         onOptionPress={(option) => {

           // Handle navigation based on option
           switch (option.id) {
             case "2": // Order History
               router.push('/order-history');
               break;
             case "3": // Wishlist
               router.push('/wishlist');
               break;
             case "4": // Saved Address
               router.push('/account/addresses');
               break;
             case "5": // Ring Sizer
               router.push('/ring-sizer');
               break;
             default:

           }
         }}
         isLoading={false}
       />
        <ReferAndEarnCard 
         data={{
           title: referralData?.title || "Refer and Earn",
           subtitle: referralData?.subtitle || "Invite your friends and get free jewellery",
           inviteButtonText: referralData?.inviteButtonText || "Invite",
           inviteLink: referralData?.inviteLink || "",
         }}
         onInvite={(link) => {
           // In a real app, this would open the share dialog

         }}
         isLoading={referralLoading}
       />
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Topup Confirmation Modal */}
      <Modal
        visible={showTopupConfirm}
        transparent
        animationType="fade"
        onRequestClose={handleTopupCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="diamond" size={48} color="#8B5CF6" />
              <Text style={styles.modalTitle}>Confirm Topup</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                You are about to add
              </Text>
              <Text style={styles.modalAmount}>
                {selectedTopupAmount} RC
              </Text>
              <Text style={styles.modalText}>
                to your wallet
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleTopupCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleTopupConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalNote}>
              Note: This is a test topup. In production, you'll be directed to a payment gateway.
            </Text>
          </View>
        </View>
      </Modal>

      </View>
    </WalletErrorBoundary>
  );
};

const createStyles = (screenData: { width: number; height: number }) => {
  const isSmallScreen = screenData.width < 375;
  const isTablet = screenData.width > 768;
  const horizontalPadding = isSmallScreen ? 16 : isTablet ? 32 : 22;

  return StyleSheet.create({
    root: { flex: 1, backgroundColor: '#FFFFFF' },
    headerBg: {
      paddingTop: Platform.OS === 'ios' ? 50 : 40,
      paddingBottom: 24,
      paddingHorizontal: horizontalPadding,
      borderBottomLeftRadius: 22,
      borderBottomRightRadius: 22,
      overflow: 'hidden',
      shadowColor: '#7C3AED',
      shadowOpacity: 0.15,
      elevation: 8,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      color: '#FFFFFF',
      fontSize: isTablet ? 28 : isSmallScreen ? 20 : 24,
      fontWeight: '800',
      textAlign: 'center',
    },
    headerRight: { width: 40 },
    amountCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      alignSelf: 'center',
      marginVertical: 16,
      alignItems: 'center',
      paddingVertical: isTablet ? 28 : isSmallScreen ? 20 : 24,
      width: isTablet ? '65%' : '80%',
      shadowColor: '#7C3AED',
      shadowOpacity: 0.12,
      elevation: 12,
    },
    currency: {
      color: '#7C3AED',
      fontSize: isTablet ? 36 : isSmallScreen ? 28 : 32,
      fontWeight: '800',
    },
    subtitle: { color: '#6B7280', fontWeight: '600', marginTop: 6 },
    scroll: { flex: 1, paddingHorizontal: horizontalPadding },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: 16, color: '#6B7280' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
    errorTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 16 },
    errorDetails: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' },
    retryButton: {
      backgroundColor: '#7C3AED',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 16,
      marginTop: 12,
    },
    retryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    
    // Transaction Button Styles
    transactionButtonContainer: {
      marginHorizontal: 16,
      marginVertical: 12,
    },
    viewTransactionsButton: {
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
    transactionButtonGradient: {
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    transactionButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    transactionIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    transactionTextContainer: {
      flex: 1,
    },
    transactionButtonTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: 'white',
      marginBottom: 4,
      letterSpacing: 0.3,
    },
    transactionButtonSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.85)',
      fontWeight: '500',
      lineHeight: 18,
    },
    
    container: {
      flex: 1,
      backgroundColor: "#f8f8f8",
    },

    // PayBill Card Styles
    paybillCardContainer: {
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 16,
    },
    paybillCard: {
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    paybillCardGradient: {
      padding: 20,
    },
    paybillCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    paybillIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    paybillHeaderText: {
      flex: 1,
    },
    paybillTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: 'white',
      marginBottom: 4,
      letterSpacing: 0.3,
    },
    paybillSubtitle: {
      fontSize: 13,
      color: 'rgba(255, 255, 255, 0.85)',
      fontWeight: '500',
    },
    paybillBalanceContainer: {
      alignItems: 'center',
      paddingVertical: 16,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      marginBottom: 16,
    },
    paybillBalanceText: {
      fontSize: 42,
      fontWeight: '800',
      color: 'white',
      marginBottom: 8,
    },
    savingsBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 6,
    },
    savingsBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#10B981',
    },
    paybillActions: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    paybillActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    paybillActionText: {
      fontSize: 15,
      fontWeight: '600',
      color: 'white',
    },

    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: '#1F2937',
      marginTop: 12,
    },
    modalBody: {
      alignItems: 'center',
      marginBottom: 24,
      paddingVertical: 12,
    },
    modalText: {
      fontSize: 16,
      color: '#6B7280',
      marginVertical: 4,
    },
    modalAmount: {
      fontSize: 36,
      fontWeight: '700',
      color: '#8B5CF6',
      marginVertical: 8,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: '#F3F4F6',
    },
    confirmButton: {
      backgroundColor: '#8B5CF6',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#6B7280',
    },
    confirmButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    modalNote: {
      fontSize: 12,
      color: '#9CA3AF',
      textAlign: 'center',
      lineHeight: 16,
    },
  });
};

export default WalletScreen;
