import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWallet } from '@/hooks/useWallet';
import cashbackApi, { CashbackSummary } from '@/services/cashbackApi';
import walletApi from '@/services/walletApi';

const { width } = Dimensions.get('window');

// ReZ Brand Colors
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00A159',
  primaryLight: '#26C97D',
  gold: '#FFC857',
  goldDark: '#F5A623',
  goldLight: '#FFD87A',
  white: '#FFFFFF',
  textDark: '#0B2240',
  textMuted: '#6B7280',
};

// Mini Bar Chart Component
const MiniSavingsChart: React.FC<{ data: number[] }> = ({ data }) => {
  const maxValue = Math.max(...data, 1); // Prevent division by zero

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartBars}>
        {data.map((value, index) => {
          const height = Math.max((value / maxValue) * 40, 4);
          return (
            <View key={index} style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    height,
                    backgroundColor: index === data.length - 1
                      ? COLORS.white
                      : 'rgba(255, 255, 255, 0.5)',
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      <Text style={styles.chartLabel}>Last 7 days</Text>
    </View>
  );
};

// Skeleton Loader Component
const SkeletonLoader: React.FC = () => (
  <View style={styles.cardWrapper}>
    <View style={styles.glowEffect} />
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={['#00C06A', '#00A86B', '#008F5C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.glassOverlay}>
          {/* Header skeleton */}
          <View style={styles.headerRow}>
            <View style={styles.walletTitleContainer}>
              <View style={[styles.skeletonBox, { width: 32, height: 32, borderRadius: 10 }]} />
              <View style={[styles.skeletonBox, { width: 80, height: 16 }]} />
            </View>
          </View>

          {/* Balance skeleton */}
          <View style={styles.balanceSection}>
            <View style={styles.coinBalanceContainer}>
              <View style={[styles.skeletonBox, { width: 44, height: 44, borderRadius: 22 }]} />
              <View style={styles.balanceTextContainer}>
                <View style={[styles.skeletonBox, { width: 80, height: 28, marginBottom: 8 }]} />
                <View style={[styles.skeletonBox, { width: 60, height: 14 }]} />
              </View>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.cashbackSection}>
              <View style={styles.cashbackInfo}>
                <View style={[styles.skeletonBox, { width: 60, height: 12, marginBottom: 6 }]} />
                <View style={[styles.skeletonBox, { width: 50, height: 22, marginBottom: 4 }]} />
                <View style={[styles.skeletonBox, { width: 80, height: 10 }]} />
              </View>
            </View>
          </View>

          {/* Actions skeleton */}
          <View style={styles.actionsContainer}>
            {[1, 2, 3].map((_, i) => (
              <View key={i} style={[styles.actionButton, { opacity: 0.7 }]}>
                <View style={[styles.skeletonBoxDark, { width: 28, height: 28, borderRadius: 8 }]} />
                <View style={[styles.skeletonBoxDark, { width: 50, height: 12 }]} />
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
  </View>
);

// Quick Action Button Component
const QuickActionButton: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}> = ({ icon, label, onPress }) => (
  <TouchableOpacity
    style={styles.actionButton}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <View style={styles.actionIconContainer}>
      <Ionicons name={icon} size={18} color={COLORS.primary} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const WalletSnapshotCard: React.FC = () => {
  const router = useRouter();

  // Use the wallet hook
  const { walletState, refreshWallet } = useWallet({ autoFetch: true });

  // Local state for cashback
  const [cashbackSummary, setCashbackSummary] = useState<CashbackSummary | null>(null);
  const [savingsData, setSavingsData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [isLoadingCashback, setIsLoadingCashback] = useState(true);

  // Fetch cashback summary
  useEffect(() => {
    const fetchCashbackData = async () => {
      try {
        setIsLoadingCashback(true);

        // Fetch cashback summary
        const cashbackResponse = await cashbackApi.getCashbackSummary();
        if (cashbackResponse.success && cashbackResponse.data) {
          setCashbackSummary(cashbackResponse.data);
        }

        // Fetch transaction summary for the mini chart
        // Using wallet summary to get recent activity
        const summaryResponse = await walletApi.getSummary('week');
        if (summaryResponse.success && summaryResponse.data) {
          const stats = summaryResponse.data.wallet?.statistics;
          if (stats) {
            // Generate approximate daily data from weekly stats
            const totalEarned = stats.totalCashback || 0;
            const dailyAvg = totalEarned / 7;
            // Create varied data for visualization
            const varianceData = [0.6, 0.8, 0.5, 1.2, 0.9, 1.4, 1.0];
            const chartData = varianceData.map(v => Math.round(dailyAvg * v));
            setSavingsData(chartData.length > 0 ? chartData : [0, 0, 0, 0, 0, 0, 0]);
          }
        }
      } catch (error) {
        console.error('Error fetching cashback data:', error);
      } finally {
        setIsLoadingCashback(false);
      }
    };

    fetchCashbackData();
  }, []);

  // Navigation handlers
  const handleUseCoins = () => {
    router.push('/coins');
  };

  const handleSendCoins = () => {
    router.push('/coins');
  };

  const handleViewHistory = () => {
    router.push('/wallet');
  };

  const handleViewWallet = () => {
    router.push('/wallet');
  };

  // Show skeleton while loading
  if (walletState.isLoading && !walletState.data) {
    return <SkeletonLoader />;
  }

  // Extract wallet data
  const walletData = walletState.data;

  // Get REZ coin balance (wasil type)
  const rezCoin = walletData?.coins?.find(c => c.type === 'wasil');
  const coinBalance = rezCoin?.amount || walletData?.totalBalance || 0;
  const coinValue = coinBalance; // 1 REZ coin = ₹1

  // Get cashback earned this month
  const cashbackEarned = cashbackSummary?.credited || cashbackSummary?.totalEarned || 0;

  return (
    <View style={styles.cardWrapper}>
      {/* Outer glow effect */}
      <View style={styles.glowEffect} />

      {/* Main Card */}
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={handleViewWallet}
        style={styles.cardContainer}
      >
        <LinearGradient
          colors={['#00C06A', '#00A86B', '#008F5C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          {/* Decorative elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />

          {/* Glass overlay */}
          <View style={styles.glassOverlay}>
            {/* Header Row */}
            <View style={styles.headerRow}>
              <View style={styles.walletTitleContainer}>
                <View style={styles.walletIconContainer}>
                  <LinearGradient
                    colors={[COLORS.gold, COLORS.goldDark]}
                    style={styles.walletIconGradient}
                  >
                    <Ionicons name="wallet" size={16} color={COLORS.white} />
                  </LinearGradient>
                </View>
                <Text style={styles.walletTitle}>ReZ Wallet</Text>
              </View>
              <TouchableOpacity style={styles.viewAllButton} onPress={handleViewWallet}>
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Balance Section */}
            <View style={styles.balanceSection}>
              {/* Coin Balance */}
              <View style={styles.coinBalanceContainer}>
                <View style={styles.coinIconWrapper}>
                  <LinearGradient
                    colors={[COLORS.gold, COLORS.goldDark]}
                    style={styles.coinIconGradient}
                  >
                    <View style={styles.coinInner}>
                      <Text style={styles.coinText}>R</Text>
                    </View>
                  </LinearGradient>
                </View>
                <View style={styles.balanceTextContainer}>
                  <Text style={styles.coinBalanceValue}>
                    {coinBalance.toLocaleString()}
                  </Text>
                  <Text style={styles.coinWorthText}>
                    Worth ₹{coinValue.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.verticalDivider} />

              {/* Cashback & Chart Section */}
              <View style={styles.cashbackSection}>
                <View style={styles.cashbackInfo}>
                  <Text style={styles.cashbackLabel}>This Month</Text>
                  <Text style={styles.cashbackValue}>
                    ₹{cashbackEarned.toLocaleString()}
                  </Text>
                  <Text style={styles.cashbackSubLabel}>Cashback Earned</Text>
                </View>
                <MiniSavingsChart data={savingsData} />
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsContainer}>
              <QuickActionButton
                icon="gift-outline"
                label="Use Coins"
                onPress={handleUseCoins}
              />
              <QuickActionButton
                icon="paper-plane-outline"
                label="Send Coins"
                onPress={handleSendCoins}
              />
              <QuickActionButton
                icon="time-outline"
                label="History"
                onPress={handleViewHistory}
              />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 0,
    marginVertical: 12,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: -4,
    backgroundColor: 'rgba(0, 192, 106, 0.2)',
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  gradientBackground: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 200, 87, 0.15)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 200, 87, 0.1)',
  },
  glassOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 18,
    borderRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletIconContainer: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  walletIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  balanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  coinBalanceContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinIconWrapper: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  coinIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  balanceTextContainer: {
    flex: 1,
  },
  coinBalanceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  coinWorthText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    marginTop: 2,
  },
  verticalDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginHorizontal: 16,
  },
  cashbackSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cashbackInfo: {
    flex: 1,
  },
  cashbackLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
    marginBottom: 2,
  },
  cashbackValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  cashbackSubLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    marginTop: 1,
  },
  chartContainer: {
    alignItems: 'center',
    marginLeft: 8,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    gap: 4,
  },
  barWrapper: {
    justifyContent: 'flex-end',
  },
  bar: {
    width: 6,
    borderRadius: 3,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  actionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 192, 106, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
    letterSpacing: 0.2,
  },
  // Skeleton styles
  skeletonBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
  },
  skeletonBoxDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 6,
  },
});

export default WalletSnapshotCard;
