import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/contexts/AuthContext';
import { COIN_TYPES } from '@/types/wallet';
import { LinearGradient } from 'expo-linear-gradient';

export default function BrandedCoinsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { walletState } = useWallet({ userId: user?._id || user?.id, autoFetch: true });
  const walletData = walletState.data;

  const screenWidth = Dimensions.get('window').width;
  const styles = useMemo(() => createStyles(screenWidth), [screenWidth]);

  const brandedCoins = walletData?.brandedCoins || [];
  const totalBranded = walletData?.brandedCoinsTotal || 0;

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={['#6366F1', '#4F46E5'] as const}
        style={styles.headerBg}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Branded Coins</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Branded Coins</Text>
          <Text style={styles.totalAmount}>RC {totalBranded}</Text>
          <Text style={styles.totalSubtext}>
            From {brandedCoins.length} {brandedCoins.length === 1 ? 'store' : 'stores'}
          </Text>
        </View>
      </LinearGradient>

      {/* Store Coins List */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {brandedCoins.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Branded Coins Yet</Text>
            <Text style={styles.emptySubtext}>
              When stores reward you with branded coins, they will appear here
            </Text>
          </View>
        ) : (
          brandedCoins.map((bc) => (
            <View key={bc.merchantId} style={styles.storeCard}>
              <View style={styles.storeRow}>
                <View style={[styles.storeIcon, { backgroundColor: (bc.merchantColor || COIN_TYPES.branded.color) + '15' }]}>
                  {bc.merchantLogo ? (
                    <Image
                      source={{ uri: bc.merchantLogo }}
                      style={styles.storeLogo}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons
                      name="storefront"
                      size={24}
                      color={bc.merchantColor || COIN_TYPES.branded.color}
                    />
                  )}
                </View>

                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{bc.merchantName}</Text>
                  <Text style={styles.storeDesc}>Use only at {bc.merchantName}</Text>
                </View>

                <View style={styles.storeAmountWrap}>
                  <Text style={[styles.storeAmount, { color: bc.merchantColor || COIN_TYPES.branded.color }]}>
                    RC {bc.amount}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#6366F1" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>How Branded Coins Work</Text>
              <Text style={styles.infoText}>
                Branded coins are awarded by stores as rewards. Each store's coins can only be used at that specific store. They are used automatically during checkout.
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (screenWidth: number) => {
  const isSmallScreen = screenWidth < 375;
  const isTablet = screenWidth > 768;

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: '#F9FAFB',
    },
    headerBg: {
      paddingTop: Platform.OS === 'ios' ? 50 : 40,
      paddingBottom: 28,
      paddingHorizontal: isSmallScreen ? 16 : 22,
      borderBottomLeftRadius: 22,
      borderBottomRightRadius: 22,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
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
      fontSize: 18,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    totalSection: {
      alignItems: 'center',
    },
    totalLabel: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '500',
      marginBottom: 6,
    },
    totalAmount: {
      fontSize: 36,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    totalSubtext: {
      fontSize: 13,
      color: 'rgba(255, 255, 255, 0.7)',
      marginTop: 4,
    },
    scrollContent: {
      flex: 1,
      paddingHorizontal: isSmallScreen ? 16 : 22,
      paddingTop: 20,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#111827',
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      color: '#6B7280',
      marginTop: 8,
      textAlign: 'center',
      paddingHorizontal: 40,
    },
    storeCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: isTablet ? 20 : 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    storeRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    storeIcon: {
      width: isTablet ? 52 : 46,
      height: isTablet ? 52 : 46,
      borderRadius: isTablet ? 16 : 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    storeLogo: {
      width: 28,
      height: 28,
      borderRadius: 6,
    },
    storeInfo: {
      flex: 1,
    },
    storeName: {
      fontSize: isTablet ? 17 : 16,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 3,
    },
    storeDesc: {
      fontSize: 13,
      color: '#6B7280',
      fontWeight: '500',
    },
    storeAmountWrap: {
      alignItems: 'flex-end',
    },
    storeAmount: {
      fontSize: isTablet ? 20 : 18,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    infoSection: {
      marginTop: 12,
    },
    infoCard: {
      flexDirection: 'row',
      backgroundColor: '#EEF2FF',
      borderRadius: 14,
      padding: 16,
      gap: 12,
    },
    infoContent: {
      flex: 1,
    },
    infoTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: '#4F46E5',
      marginBottom: 4,
    },
    infoText: {
      fontSize: 13,
      color: '#6B7280',
      lineHeight: 18,
    },
  });
};
