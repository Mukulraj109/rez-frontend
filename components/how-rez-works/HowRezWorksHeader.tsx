import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import walletApi from '@/services/walletApi';

interface HowRezWorksHeaderProps {
  onBackPress?: () => void;
}

const HowRezWorksHeader: React.FC<HowRezWorksHeaderProps> = ({ onBackPress }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state: authState } = useAuth();
  const [coinBalance, setCoinBalance] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);

  // Fetch wallet balance on mount
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!authState.isAuthenticated) return;

      try {
        const walletResponse = await walletApi.getBalance();
        if (walletResponse.success && walletResponse.data) {
          // Get rez coin balance (same as homepage)
          const rezCoin = walletResponse.data.coins?.find((c: any) => c.type === 'rez');
          setCoinBalance(rezCoin?.amount || 0);

          // Get cash balance if available
          const cashAmount = walletResponse.data.cash?.available || walletResponse.data.cashBalance || 0;
          setCashBalance(cashAmount);
        }
      } catch (error) {
        console.error('Failed to fetch wallet balance:', error);
      }
    };

    fetchWalletBalance();
  }, [authState.isAuthenticated]);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleWalletPress = () => {
    router.push('/WalletScreen');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topRow}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>How ReZ Works</Text>

        {/* Coin Balance */}
        <TouchableOpacity
          style={styles.balanceContainer}
          onPress={handleWalletPress}
          activeOpacity={0.8}
        >
          <View style={styles.coinSection}>
            <View style={styles.coinIcon}>
              <Ionicons name="wallet" size={14} color="#FFC857" />
            </View>
            <Text style={styles.coinText}>
              {coinBalance.toLocaleString()}
            </Text>
          </View>
          {cashBalance > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.cashText}>
                {'\u20B9'}{cashBalance}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Save smarter, every time you spend.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginLeft: 12,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  coinSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  coinText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#D1FAE5',
    marginHorizontal: 10,
  },
  cashText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default HowRezWorksHeader;
