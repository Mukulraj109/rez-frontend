import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CoinInfoCard } from '../components/CoinInfoCard';
import  RechargeWalletCard from "../components/RechargeWalletCard";
import ProfileCompletionCard from "@/components/ProfileCompletionCard";
import ScratchCardOffer from "@/components/ScratchCardOffer";
import scratchImage from "@/assets/images/scratch-offer.png"; 
import ProfileOptionsList from "../components/ProfileOptionsList";
import ReferAndEarnCard from "@/components/ReferAndEarnCard";
import TransactionHistory from "@/components/wallet/TransactionHistory";
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { WalletBalanceCard } from '../components/WalletBalanceCard';
import { CoinBalance, WalletScreenProps } from '@/types/wallet';
import { Transaction } from '@/types/wallet.types';
import { mockWalletData } from '@/utils/mock-wallet-data';
import { useWallet } from '@/hooks/useWallet';
import { mockProfileData, mockReferData, mockRechargeOptions } from '@/utils/mock-profile-data';


const WalletScreen: React.FC<WalletScreenProps> = ({
  userId = 'user-12345',
  onNavigateBack,
  onCoinPress,
}) => {
  const router = useRouter();
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  const { walletState, refreshWallet, retryLastOperation, clearError } = useWallet({
    userId,
    autoFetch: true,
    refreshInterval: 5 * 60 * 1000,
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshWallet(true);
    } catch (error) {
      Alert.alert('Refresh Failed', error instanceof Error ? error.message : 'Unable to refresh wallet data');
    }
  }, [refreshWallet]);

  const handleBackPress = useCallback(() => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      router.back();
    }
  }, [onNavigateBack, router]);

  const handleCoinPress = useCallback((coin: CoinBalance) => {
    if (onCoinPress) {
      onCoinPress(coin);
    } else {
      Alert.alert(coin.name, `Balance: ${coin.formattedAmount}`);
    }
  }, [onCoinPress]);

  const handleRetry = useCallback(() => {
    retryLastOperation();
  }, [retryLastOperation]);

  const handleTransactionPress = useCallback((transaction: Transaction) => {
    Alert.alert(
      transaction.title,
      `Amount: ${transaction.amount} ${transaction.currency}\nStatus: ${transaction.status}\nDate: ${new Date(transaction.date).toLocaleDateString()}`,
      [
        { text: 'OK' },
        { text: 'View Details', onPress: () => console.log('Navigate to transaction details:', transaction.id) }
      ]
    );
  }, []);

  const styles = useMemo(() => createStyles(screenData), [screenData]);

  const walletData = walletState.data || mockWalletData;

  if (walletState.isLoading && !walletState.data) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
        <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.headerBg}>
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
        <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.headerBg}>
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
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.headerBg}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <View style={styles.amountCard}>
        <Text style={styles.currency}>{walletData.formattedTotalBalance}</Text>
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

        {/* Transaction History Section */}
        <TransactionHistory 
          onTransactionPress={handleTransactionPress}
          refreshing={walletState.isRefreshing}
          onRefresh={handleRefresh}
          maxHeight={400}
        />

         <RechargeWalletCard
  cashbackText="Upto 10% cashback on wallet recharge"
  amountOptions={mockRechargeOptions}
  onAmountSelect={(amount: number | "other") => {
    if (amount === "other") {
      console.log("User selected custom amount");
    } else {
      console.log("Selected amount:", amount);
    }
  }}
  onSubmit={(amount: number) => console.log("Recharge with amount:", amount)}
  isLoading={false}
  currency="₹"
/>

        {/* Only Image Coin Info Cards */}
        <CoinInfoCard 
          image={require('../assets/images/wallet1.png')} 
          onPress={() => console.log("Coin info 1 pressed")}
        />
        <CoinInfoCard 
          image={require('../assets/images/wallet2.png')} 
          onPress={() => console.log("Coin info 2 pressed")}
        />
        <CoinInfoCard 
          image={require('../assets/images/wallet3.png')} 
          onPress={() => console.log("Coin info 3 pressed")}
        />

         <ProfileCompletionCard
        name={mockProfileData.name}
        completionPercentage={mockProfileData.completionPercentage}
        onCompleteProfile={() => {
          console.log("Navigate to Complete Profile Page");
        }}
        onViewDetails={() => {
          console.log("Navigate to View Profile Details");
        }}
        isLoading={false}
      />
      <ScratchCardOffer 
        imageSource={scratchImage} 
        onPress={() => console.log("Scratch card tapped")} 
        isActive={true}
      />
       <ProfileOptionsList 
         onOptionPress={(option) => console.log("Option pressed:", option.title)}
         isLoading={false}
       />
        <ReferAndEarnCard 
         data={mockReferData}
         onInvite={(link) => console.log("Invite with link:", link)}
         isLoading={false}
       />
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
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
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 16 },
    retryButton: {
      backgroundColor: '#7C3AED',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 16,
      marginTop: 12,
    },
    retryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
     container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  });
};

export default WalletScreen;
