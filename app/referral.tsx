// Referral Program Page
// Invite friends and earn rewards

import React, { useState, useEffect } from 'react';
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

const ReferralPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
  const [codeInfo, setCodeInfo] = useState<{
    referralCode: string;
    referralLink: string;
    shareMessage: string;
  } | null>(null);

  // Fetch referral data
  const fetchReferralData = async () => {
    try {
      const [statsData, historyData, codeData] = await Promise.all([
        getReferralStats(),
        getReferralHistory(),
        getReferralCode(),
      ]);

      setStats(statsData);
      setHistory(historyData);
      setCodeInfo(codeData);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      Alert.alert('Error', 'Failed to load referral data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReferralData();
  };

  const referralCode = codeInfo?.referralCode || user?.referral?.referralCode || 'LOADING...';
  const referralLink = codeInfo?.referralLink || `https://rezapp.com/invite/${referralCode}`;

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const handleShareReferral = async () => {
    try {
      const shareMessage = codeInfo?.shareMessage ||
        `Join me on REZ App and get ₹30 off on your first order! Use my referral code: ${referralCode}\n\nDownload now: ${referralLink}`;

      await Share.share({
        message: shareMessage,
        title: 'Join REZ App',
      });

      // Track share event
      await trackShare('native_share');
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

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
        return { backgroundColor: '#8B5CF6' };
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
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
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading referral data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
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

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />
        }
      >
        {/* Referral Code Card */}
        <View style={styles.codeCard}>
          <View style={styles.codeHeader}>
            <Ionicons name="gift" size={32} color="#8B5CF6" />
            <ThemedText style={styles.codeTitle}>Your Referral Code</ThemedText>
          </View>

          <View style={styles.codeBox}>
            <ThemedText style={styles.code}>{referralCode}</ThemedText>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyCode}
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
                You earn ₹{stats?.referralBonus || 50} and your friend gets ₹30 off their first order
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
                {stats?.totalReferrals || 0}
              </ThemedText>
              <Text style={styles.statLabel}>Total Referrals</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                ₹{stats?.totalEarnings || 0}
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

        {/* Referral History */}
        {history.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Referral History</ThemedText>
            {history.slice(0, 5).map((item) => (
              <View key={item._id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View>
                    <ThemedText style={styles.historyName}>{item.referee.name}</ThemedText>
                    <Text style={styles.historyPhone}>{item.referee.phone}</Text>
                  </View>
                  <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
                <View style={styles.historyReward}>
                  <Ionicons name="cash-outline" size={16} color="#8B5CF6" />
                  <Text style={styles.rewardText}>
                    {item.referrerRewarded
                      ? `Earned ₹${item.rewards.referrerAmount}`
                      : `Pending ₹${item.rewards.referrerAmount}`}
                  </Text>
                  {item.milestoneRewarded && (
                    <Text style={styles.bonusText}> + ₹{item.rewards.milestoneBonus} bonus</Text>
                  )}
                </View>
                <Text style={styles.historyDate}>
                  {new Date(item.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            ))}
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
    </View>
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
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
  },
  code: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B5CF6',
    letterSpacing: 2,
  },
  copyButton: {
    backgroundColor: '#8B5CF6',
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
    backgroundColor: '#8B5CF6',
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
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
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
    color: '#8B5CF6',
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
    color: '#8B5CF6',
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
});

export default ReferralPage;
