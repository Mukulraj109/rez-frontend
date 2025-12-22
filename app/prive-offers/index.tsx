/**
 * Prive Offers Page (Dark Theme)
 *
 * Premium/exclusive offers with dark theme
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { OffersThemeProvider } from '@/contexts/OffersThemeContext';
import { OffersPageContent } from '@/components/offers';
import { useAuth } from '@/contexts/AuthContext';
import { ReZCoin } from '@/components/homepage/ReZCoin';
import { Spacing, Typography } from '@/constants/DesignSystem';
import walletApi from '@/services/walletApi';

// Dark theme colors
const DarkColors = {
  background: '#000000',
  backgroundSecondary: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#A1A1A6',
  accent: '#00C06A',
  border: '#2C2C2E',
};

export default function PriveOffersScreen() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [userCoins, setUserCoins] = useState(authState.user?.wallet?.balance || 0);

  // Fetch real wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const walletResponse = await walletApi.getBalance();
        if (walletResponse.success && walletResponse.data) {
          const rezCoin = walletResponse.data.coins.find((c: any) => c.type === 'rez');
          setUserCoins(rezCoin?.amount || 0);
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    };

    if (authState.isAuthenticated) {
      fetchWalletBalance();
    }
  }, [authState.isAuthenticated]);

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    // TODO: Implement share functionality
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleRefresh = useCallback(async () => {
    // TODO: Implement refresh with real API
  }, []);

  return (
    <OffersThemeProvider mode="dark">
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={DarkColors.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.priveBadge}>
              <Ionicons name="diamond" size={12} color="#A78BFA" />
            </View>
            <ThemedText style={styles.headerTitle}>Prive Offers</ThemedText>
            <ReZCoin
              balance={userCoins}
              size="small"
              onPress={() => router.push('/CoinPage')}
              style={styles.coinPill}
            />
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Ionicons
                name="share-outline"
                size={22}
                color={DarkColors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleFavorite}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFavorited ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorited ? '#EF4444' : DarkColors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Page Content */}
        <OffersPageContent onRefresh={handleRefresh} />
      </SafeAreaView>
    </OffersThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: DarkColors.background,
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: DarkColors.backgroundSecondary,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  priveBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DarkColors.text,
    letterSpacing: -0.3,
  },
  coinPill: {
    backgroundColor: 'rgba(0, 192, 106, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: DarkColors.backgroundSecondary,
  },
});
