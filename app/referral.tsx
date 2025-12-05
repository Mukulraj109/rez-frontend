// Referral Program Page
// Invite friends and earn rewards

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '@/contexts/AuthContext';
import {
  getReferralStats,
  getReferralHistory,
  getReferralCode,
  trackShare,
  type ReferralStats,
  type ReferralHistoryItem,
} from '@/services/referralApi';
import { anonymizeEmail } from '@/utils/privacy';
import ShareModal from '@/components/referral/ShareModal';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { REFERRAL_TIERS } from '@/types/referral.types';

// Helper to get next tier info based on current referrals
const getNextTierInfo = (currentReferrals: number) => {
  const tiers = Object.entries(REFERRAL_TIERS).sort(
    (a, b) => a[1].referralsRequired - b[1].referralsRequired
  );

  for (const [tierKey, tierData] of tiers) {
    if (currentReferrals < tierData.referralsRequired) {
      return {
        target: tierData.referralsRequired,
        nextTier: tierData.name,
        tierKey,
      };
    }
  }

  // User is at max tier
  const lastTier = tiers[tiers.length - 1];
  return {
    target: lastTier[1].referralsRequired,
    nextTier: lastTier[1].name,
    tierKey: lastTier[0],
  };
};

const ReferralPageContent = () => {
  const router = useRouter();
  const { state } = useAuth();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
  const [codeInfo, setCodeInfo] = useState<{
    referralCode: string;
    referralLink: string;
    shareMessage: string;
  } | null>(null);

  // Refs for cleanup and timeout
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // ✅ FIX #1: Authentication verification
  useEffect(() => {
    // Check if user is authenticated before loading data
    if (!state.isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'Please sign in to view your referral information',
        [{ text: 'Sign In', onPress: () => router.replace('/sign-in') }]
      );
      return;
    }

    // ✅ Analytics: Track referral page view
    console.log('[ANALYTICS] Referral page viewed');

    fetchReferralData();

    // ✅ FIX #4: Loading timeout - prevent infinite loading (max 15 seconds)
    loadingTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && loading) {
        setLoading(false);
        setRefreshing(false);
        setLoadingError('Request timed out. Please check your connection and try again.');
      }
    }, 15000);

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [state.isAuthenticated]);

  // ✅ FIX #2: Individual try-catch for each API (fix race condition)
  const fetchReferralData = async () => {
    // Clear any previous errors
    setLoadingError(null);

    // Check auth again before API calls
    if (!state.isAuthenticated) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    let hasError = false;

    // Fetch stats (independent)
    try {
      const statsData = await getReferralStats();
      if (isMountedRef.current) {
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      hasError = true;
      // Don't fail entire page, just show empty stats
      if (isMountedRef.current) {
        setStats(null);
      }
    }

    // Fetch history (independent)
    try {
      const historyData = await getReferralHistory();
      if (isMountedRef.current) {
        setHistory(historyData || []);
      }
    } catch (error) {
      console.error('Error fetching referral history:', error);
      hasError = true;
      // Don't fail entire page, just show empty history
      if (isMountedRef.current) {
        setHistory([]);
      }
    }

    // Fetch code (independent)
    try {
      const codeData = await getReferralCode();
      if (isMountedRef.current) {
        setCodeInfo(codeData);
      }
    } catch (error) {
      console.error('Error fetching referral code:', error);
      hasError = true;
      // Show error for code since it's critical
      if (isMountedRef.current) {
        Alert.alert('Error', 'Failed to load referral code. Please try again.');
      }
    }

    // Only show error if ALL API calls failed
    if (hasError && isMountedRef.current) {
      // Don't show alert if at least one API succeeded
      const hasData = stats !== null || history.length > 0 || codeInfo !== null;
      if (!hasData) {
        Alert.alert('Error', 'Failed to load referral data. Please check your connection.');
      }
    }

    // Clear loading timeout if data loaded successfully
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    if (isMountedRef.current) {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    if (!state.isAuthenticated) {
      Alert.alert('Error', 'Please sign in to refresh data');
      return;
    }
    setRefreshing(true);
    fetchReferralData();
  }, [state.isAuthenticated]);

  const referralCode = codeInfo?.referralCode || 'LOADING...';
  const referralLink = codeInfo?.referralLink || `https://rezapp.com/invite/${referralCode}`;

  // ✅ FIX #3: Fix memory leak from setTimeout (add cleanup)
  const handleCopyCode = useCallback(async () => {
    try {
      if (!referralCode || referralCode === 'LOADING...') {
        Alert.alert('Error', 'Referral code not loaded yet');
        return;
      }

      await Clipboard.setStringAsync(referralCode);

      if (isMountedRef.current) {
        setCopied(true);
      }

      // Clear existing timeout
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      // Set new timeout with cleanup
      copyTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setCopied(false);
        }
      }, 2000);

      // ✅ Analytics: Track copy action
      console.log('[ANALYTICS] Referral code copied', { method: 'clipboard' });

      Alert.alert('Copied!', 'Referral code copied to clipboard');
    } catch (error) {
      console.error('Error copying code:', error);
      Alert.alert('Error', 'Failed to copy referral code');
    }
  }, [referralCode]);

  // ✅ UPDATED: Open ShareModal instead of native share
  const handleShareReferral = useCallback(() => {
    if (!referralCode || referralCode === 'LOADING...') {
      Alert.alert('Error', 'Referral code not loaded yet');
      return;
    }

    // ✅ Analytics: Track share modal open
    console.log('[ANALYTICS] Share modal opened', { referralCode });

    setShareModalVisible(true);
  }, [referralCode]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { backgroundColor: '#10B981' };
      case 'active':
        return { backgroundColor: '#F59E0B' };
      case 'pending':
        return { backgroundColor: '#6B7280' };
      case 'expired':
        return { backgroundColor: '#EF4444' };
      default:
        return { backgroundColor: '#00C06A' };
    }
  };

  // Performance optimization: Memoize calculated values
  const totalReferrals = useMemo(() => stats?.totalReferrals || 0, [stats?.totalReferrals]);
  const totalEarned = useMemo(() => stats?.totalEarned || 0, [stats?.totalEarned]);

  // ✅ FIX #4: Loading state with timeout and error handling
  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="light-content" backgroundColor="#00C06A" />
        <LinearGradient colors={['#00C06A', '#00796B']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Refer & Earn</ThemedText>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          {loadingError ? (
            <>
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
              <Text style={styles.errorText}>{loadingError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setLoading(true);
                  setLoadingError(null);
                  fetchReferralData();
                }}
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color="#00C06A" />
              <Text style={styles.loadingText}>Loading referral data...</Text>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#00C06A" />

      {/* Header */}
      <LinearGradient colors={['#00C06A', '#00796B']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityHint="Returns to previous screen"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Refer & Earn</ThemedText>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00C06A']} />
        }
      >
        {/* Referral Code Card */}
        <View style={styles.codeCard}>
          <View style={styles.codeHeader}>
            <Ionicons name="gift" size={32} color="#00C06A" />
            <ThemedText style={styles.codeTitle}>Your Referral Code</ThemedText>
          </View>

          <View style={styles.codeBox}>
            <ThemedText style={styles.code}>{referralCode}</ThemedText>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyCode}
              accessibilityLabel={copied ? "Code copied" : "Copy referral code"}
              accessibilityRole="button"
              accessibilityState={{ selected: copied }}
              accessibilityHint="Copies your referral code to clipboard"
            >
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={20}
                color="white"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareReferral}
            accessibilityLabel="Share referral code with friends"
            accessibilityRole="button"
            accessibilityHint="Opens share options to invite friends and earn rewards"
          >
            <Ionicons name="share-social" size={20} color="white" />
            <Text style={styles.shareButtonText}>Share with Friends</Text>
          </TouchableOpacity>
        </View>

        {/* How it Works */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>How it Works</ThemedText>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Share your code</ThemedText>
              <Text style={styles.stepDescription}>
                Send your referral code to friends via WhatsApp, SMS, or social media
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Friend signs up</ThemedText>
              <Text style={styles.stepDescription}>
                Your friend creates an account using your referral code
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Both get rewards</ThemedText>
              <Text style={styles.stepDescription}>
                You earn ₹50 and your friend gets ₹30 off their first order
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <ThemedText style={styles.statsTitle}>Your Referral Stats</ThemedText>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {totalReferrals}
              </ThemedText>
              <Text style={styles.statLabel}>Total Referrals</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                ₹{totalEarned}
              </ThemedText>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
          </View>

          {/* Additional Stats Row */}
          {(stats?.pendingEarnings || 0) > 0 && (
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {stats?.pendingReferrals || 0}
                </ThemedText>
                <Text style={styles.statLabel}>Pending</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  ₹{stats?.pendingEarnings || 0}
                </ThemedText>
                <Text style={styles.statLabel}>Pending Earnings</Text>
              </View>
            </View>
          )}
        </View>

        {/* View Dashboard Button */}
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() => router.push('/referral/dashboard' as any)}
          accessibilityLabel="View full dashboard"
          accessibilityHint="Opens the full referral dashboard with tier progression and leaderboard"
        >
          <LinearGradient
            colors={['#00C06A', '#00796B']}
            style={styles.dashboardButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="trophy" size={24} color="white" />
            <Text style={styles.dashboardButtonText}>View Full Dashboard</Text>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Referral History */}
        {history.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Referral History</ThemedText>
            <FlatList
              data={history.slice(0, 5)}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <View>
                      <ThemedText style={styles.historyName}>{item.referredUser?.name || 'User'}</ThemedText>
                      <Text style={styles.historyPhone}>
                        {/* ✅ FIX #5: Anonymize PII (GDPR compliance) */}
                        {item.referredUser?.email ? anonymizeEmail(item.referredUser.email) : 'No email'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                  </View>
                  <View style={styles.historyReward}>
                    <Ionicons name="cash-outline" size={16} color="#00C06A" />
                    <Text style={styles.rewardText}>
                      {item.rewardStatus === 'credited'
                        ? `Earned ₹${item.rewardAmount}`
                        : `${item.rewardStatus === 'pending' ? 'Pending' : 'Cancelled'} ₹${item.rewardAmount}`}
                    </Text>
                  </View>
                  <Text style={styles.historyDate}>
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
              )}
            />
          </View>
        )}

        {/* Terms */}
        <View style={styles.termsCard}>
          <ThemedText style={styles.termsTitle}>Terms & Conditions</ThemedText>
          <Text style={styles.termsText}>
            • Referral bonus is credited after friend's first successful order{'\n'}
            • Minimum order value ₹500 required{'\n'}
            • Rewards expire after 90 days{'\n'}
            • Cannot be combined with other offers{'\n'}
            • REZ reserves the right to modify terms
          </Text>
        </View>
      </ScrollView>

      {/* ✅ ShareModal - Advanced sharing with QR code */}
      <ShareModal
        visible={shareModalVisible}
        referralCode={referralCode}
        referralLink={referralLink}
        onClose={() => setShareModalVisible(false)}
        currentTierProgress={
          stats
            ? (() => {
                const nextTierInfo = getNextTierInfo(stats.totalReferrals || 0);
                return {
                  current: stats.totalReferrals || 0,
                  target: nextTierInfo.target,
                  nextTier: nextTierInfo.nextTier,
                };
              })()
            : undefined
        }
      />
    </View>
  );
};

// Wrap the page in an ErrorBoundary
const ReferralPage = () => {
  const router = useRouter();

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log error to error tracking service (e.g., Sentry)
        console.error('Referral Page Error:', error, errorInfo);
      }}
      onReset={() => {
        // Optionally navigate back or refresh
        router.back();
      }}
    >
      <ReferralPageContent />
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  codeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  codeHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  codeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#00C06A',
    borderStyle: 'dashed',
  },
  code: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00C06A',
    letterSpacing: 2,
  },
  copyButton: {
    backgroundColor: '#00C06A',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00C06A',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 192, 106, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00C06A',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00C06A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  termsCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00C06A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  historyPhone: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  historyReward: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 14,
    color: '#00C06A',
    fontWeight: '600',
    marginLeft: 4,
  },
  bonusText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  dashboardButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  dashboardButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  dashboardButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
});

export default ReferralPage;
