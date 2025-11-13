import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CoinBalance } from '@/types/wallet';
import { useWallet } from '@/hooks/useWallet';

const CoinDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { walletState, refreshWallet } = useWallet({});
  
  const [coin, setCoin] = useState<CoinBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.coinId && walletState.data) {
      const foundCoin = walletState.data.coins.find(c => c.id === params.coinId);
      if (foundCoin) {
        setCoin(foundCoin);
      } else {
        Alert.alert('Error', 'Coin not found', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
      setIsLoading(false);
    }
  }, [params.coinId, walletState.data]);

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshWallet(true);
    } catch (error) {
      Alert.alert('Refresh Failed', 'Unable to refresh coin data');
    }
  }, [refreshWallet]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
        <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.header}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Coin Details</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading coin details...</Text>
        </View>
      </View>
    );
  }

  if (!coin) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
        <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.header}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Coin Details</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Coin not found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBackPress}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.header}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Double tap to return to previous screen"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{coin.name}</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            accessibilityLabel="Refresh coin data"
            accessibilityRole="button"
            accessibilityHint="Double tap to reload coin information"
          >
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Coin Header Card */}
        <View
          style={styles.coinHeaderCard}
          accessibilityLabel={`${coin.name}. Balance: ${coin.formattedAmount}. Status: ${coin.isActive ? 'Active' : 'Inactive'}`}
          accessibilityRole="summary"
        >
          <View style={styles.coinIconContainer}>
            <View style={[styles.coinIcon, { backgroundColor: coin.backgroundColor }]}>
              <Ionicons
                name={coin.type === 'wasil' ? 'diamond' : 'gift'}
                size={32}
                color="#FFFFFF"
              />
            </View>
          </View>

          <Text style={styles.coinName}>{coin.name}</Text>
          <Text style={styles.coinBalance}>{coin.formattedAmount}</Text>

          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: coin.isActive ? '#E8FDEB' : '#FEE2E2' }]}>
              <Ionicons
                name={coin.isActive ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={coin.isActive ? '#16A34A' : '#DC2626'}
              />
              <Text style={[styles.statusText, { color: coin.isActive ? '#16A34A' : '#DC2626' }]}>
                {coin.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>

        {/* Coin Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Coin Information</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{coin.type}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Balance</Text>
            <Text style={styles.detailValue}>{coin.formattedAmount}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={styles.detailValue}>{coin.isActive ? 'Active' : 'Inactive'}</Text>
          </View>
          
          {coin.earnedDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Earned Date</Text>
              <Text style={styles.detailValue}>
                {new Date(coin.earnedDate).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          )}
          
          {coin.lastUsed && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Used</Text>
              <Text style={styles.detailValue}>
                {new Date(coin.lastUsed).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          )}
          
          {coin.expiryDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expiry Date</Text>
              <Text style={styles.detailValue}>
                {new Date(coin.expiryDate).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        {coin.description && (
          <View style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{coin.description}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            accessibilityLabel="Transfer coins"
            accessibilityRole="button"
            accessibilityHint="Double tap to transfer coins to another user"
          >
            <Ionicons name="swap-horizontal" size={20} color="#7C3AED" />
            <Text style={styles.actionButtonText}>Transfer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            accessibilityLabel="Gift coins"
            accessibilityRole="button"
            accessibilityHint="Double tap to gift coins to someone"
          >
            <Ionicons name="gift" size={20} color="#7C3AED" />
            <Text style={styles.actionButtonText}>Gift</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            accessibilityLabel="View coin history"
            accessibilityRole="button"
            accessibilityHint="Double tap to view transaction history"
          >
            <Ionicons name="time" size={20} color="#7C3AED" />
            <Text style={styles.actionButtonText}>History</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 5,
  },
  headerRight: {
    width: 34,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 10,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  coinHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  coinIconContainer: {
    marginBottom: 16,
  },
  coinIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  coinName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  coinBalance: {
    fontSize: 32,
    fontWeight: '800',
    color: '#7C3AED',
    marginBottom: 16,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  descriptionText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '600',
    marginLeft: 12,
  },
});

export default CoinDetailScreen;
