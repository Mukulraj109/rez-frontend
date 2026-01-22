import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import partnerApi from '@/services/partnerApi';
import { useRegion } from '@/contexts/RegionContext';

interface EarningsBreakdownProps {
  onViewDetails?: () => void;
  compact?: boolean;
}

interface EarningsData {
  total: number;
  breakdown: {
    partnerCashback: number;
    milestoneRewards: number;
    referralBonus: number;
    taskRewards: number;
  };
  thisMonth: number;
  pending: number;
}

const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00796B',
  gold: '#FFC857',
  navy: '#0B2240',
  surface: '#F7FAFC',
  white: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
};

export default function EarningsBreakdown({
  onViewDetails,
  compact = false
}: EarningsBreakdownProps) {
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [loading, setLoading] = useState(true);
  const animatedHeight = useState(new Animated.Value(compact ? 0 : 1))[0];

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await partnerApi.getEarnings();

      if (response.success && response.data) {
        // Map backend data to our structure
        setEarnings({
          total: response.data.totalEarnings || 0,
          breakdown: {
            partnerCashback: response.data.paidEarnings || 0,
            milestoneRewards: 0, // Will be enhanced when backend supports
            referralBonus: 0,
            taskRewards: 0,
          },
          thisMonth: response.data.thisMonth || 0,
          pending: response.data.pendingEarnings || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
      // Set default values on error
      setEarnings({
        total: 0,
        breakdown: {
          partnerCashback: 0,
          milestoneRewards: 0,
          referralBonus: 0,
          taskRewards: 0,
        },
        thisMonth: 0,
        pending: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.timing(animatedHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const breakdownItems = [
    {
      icon: 'cash-outline',
      label: 'Partner Cashback',
      value: earnings?.breakdown.partnerCashback || 0,
      color: COLORS.primary,
    },
    {
      icon: 'trophy-outline',
      label: 'Milestone Rewards',
      value: earnings?.breakdown.milestoneRewards || 0,
      color: COLORS.gold,
    },
    {
      icon: 'people-outline',
      label: 'Referral Bonus',
      value: earnings?.breakdown.referralBonus || 0,
      color: COLORS.success,
    },
    {
      icon: 'checkmark-circle-outline',
      label: 'Task Rewards',
      value: earnings?.breakdown.taskRewards || 0,
      color: COLORS.warning,
    },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.skeletonHeader} />
        <View style={styles.skeletonBody} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={compact ? toggleExpanded : undefined}
        activeOpacity={compact ? 0.7 : 1}
      >
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.iconContainer}
          >
            <Ionicons name="wallet" size={20} color="white" />
          </LinearGradient>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Partner Earnings</Text>
            <Text style={styles.headerSubtitle}>
              Use to shop in ReZ • No withdrawal
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.totalAmount}>{currencySymbol}{(earnings?.total || 0).toLocaleString('en-IN')}</Text>
          {compact && (
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={COLORS.textSecondary}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {(isExpanded || !compact) && (
        <View style={styles.content}>
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{currencySymbol}{(earnings?.thisMonth || 0).toLocaleString('en-IN')}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <View style={[styles.statCard, styles.statCardPending]}>
              <Text style={[styles.statValue, { color: COLORS.warning }]}>
                {currencySymbol}{(earnings?.pending || 0).toLocaleString('en-IN')}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          {/* Breakdown */}
          <View style={styles.breakdownSection}>
            <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
            {breakdownItems.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownLeft}>
                  <View style={[styles.breakdownIcon, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon as any} size={16} color={item.color} />
                  </View>
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                </View>
                <Text style={styles.breakdownValue}>
                  {currencySymbol}{item.value.toLocaleString('en-IN')}
                </Text>
              </View>
            ))}
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Partner earnings are store credit. Use them at checkout to pay for your orders!
            </Text>
          </View>

          {/* Action Button */}
          {onViewDetails && (
            <TouchableOpacity style={styles.actionButton} onPress={onViewDetails}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonText}>Shop Now</Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  content: {
    padding: 16,
    paddingTop: 12,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statCardPending: {
    backgroundColor: '#FEF3C7',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  breakdownSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
    lineHeight: 18,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  skeletonHeader: {
    height: 72,
    backgroundColor: '#F3F4F6',
  },
  skeletonBody: {
    height: 200,
    backgroundColor: '#F9FAFB',
    margin: 16,
    borderRadius: 12,
  },
});
