/**
 * Offers Page - "Near U" (White Theme)
 *
 * Redesigned offers page with ReZ brand styling
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { OffersThemeProvider } from '@/contexts/OffersThemeContext';
import { OffersPageContent } from '@/components/offers';
import { useAuth } from '@/contexts/AuthContext';
import { ReZCoin } from '@/components/homepage/ReZCoin';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '@/constants/DesignSystem';
import walletApi from '@/services/walletApi';

const { width } = Dimensions.get('window');

export default function OffersScreen() {
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

  // Reference to OffersPageContent for refresh
  const contentRef = useRef<any>(null);

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: 'Check out amazing offers on ReZ! Get up to 50% off + extra cashback on your favorite stores. Download now!',
        url: 'https://rez.app/offers',
        title: 'ReZ Offers',
      });

      if (result.action === Share.sharedAction) {
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleRefresh = useCallback(async () => {
    // Refresh wallet balance
    try {
      const walletResponse = await walletApi.getBalance();
      if (walletResponse.success && walletResponse.data) {
        const rezCoin = walletResponse.data.coins.find((c: any) => c.type === 'rez');
        setUserCoins(rezCoin?.amount || 0);
      }
    } catch (error) {
      console.error('Error refreshing wallet balance:', error);
    }
  }, []);

  return (
    <OffersThemeProvider mode="light">
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* Gradient Header */}
        <LinearGradient
          colors={['#86EFAC', '#A7F3D0', '#D1FAE5', '#ECFDF5', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView edges={['top']} style={styles.safeHeader}>
            <View style={styles.header}>
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
              </TouchableOpacity>

              {/* Center - Title & Coins on same line */}
              <View style={styles.headerCenter}>
                <View style={styles.locationIcon}>
                  <Ionicons name="location" size={14} color="#FFFFFF" />
                </View>
                <ThemedText style={styles.headerTitle}>Near U Offers</ThemedText>

                {/* ReZ Coin with real balance */}
                <ReZCoin
                  balance={userCoins}
                  size="small"
                  onPress={() => router.push('/CoinPage')}
                  style={styles.coinPill}
                />
              </View>

              {/* Right Actions */}
              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleShare}
                  activeOpacity={0.7}
                >
                  <Ionicons name="share-outline" size={20} color={Colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconButton, isFavorited && styles.iconButtonActive]}
                  onPress={handleFavorite}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isFavorited ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isFavorited ? '#EF4444' : Colors.text.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Hero Banner */}
            <View style={styles.heroBanner}>
              <LinearGradient
                colors={['#00C06A', '#00A859', '#008F4A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroBannerGradient}
              >
                <View style={styles.heroBannerContent}>
                  <View style={styles.heroBannerText}>
                    <ThemedText style={styles.heroTitle}>MEGA OFFERS</ThemedText>
                    <ThemedText style={styles.heroSubtitle}>
                      Up to 50% off + Extra Cashback
                    </ThemedText>
                  </View>
                  <View style={styles.heroIconContainer}>
                    <Ionicons name="gift" size={40} color="rgba(255,255,255,0.3)" />
                  </View>
                </View>
                <View style={styles.heroShine} />
              </LinearGradient>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Page Content */}
        <OffersPageContent onRefresh={handleRefresh} />
      </View>
    </OffersThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  headerGradient: {
    paddingBottom: 0,
  },
  safeHeader: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...Shadows.subtle,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  locationIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  coinPill: {
    backgroundColor: Colors.primary[600],
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
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...Shadows.subtle,
  },
  iconButtonActive: {
    backgroundColor: '#FEE2E2',
  },
  // Hero Banner
  heroBanner: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  heroBannerGradient: {
    padding: Spacing.base,
    position: 'relative',
    overflow: 'hidden',
  },
  heroBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroBannerText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  heroIconContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroShine: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
