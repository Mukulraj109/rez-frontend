/**
 * CashbackActivitySection Component
 *
 * Section showing user's recent cashback activity/transactions
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CashbackActivity, formatCurrency } from '../../../types/cash-store.types';

interface CashbackActivitySectionProps {
  activities: CashbackActivity[];
  isLoading?: boolean;
  onActivityPress: (activity: CashbackActivity) => void;
  onViewAllPress: () => void;
}

const getStatusColor = (status: CashbackActivity['status']): string => {
  switch (status) {
    case 'pending':
      return '#F59E0B';
    case 'confirmed':
      return '#3B82F6';
    case 'available':
      return '#00C06A';
    case 'expired':
    case 'cancelled':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

const getStatusIcon = (status: CashbackActivity['status']): string => {
  switch (status) {
    case 'pending':
      return 'time-outline';
    case 'confirmed':
      return 'checkmark-circle-outline';
    case 'available':
      return 'wallet-outline';
    case 'expired':
      return 'alert-circle-outline';
    case 'cancelled':
      return 'close-circle-outline';
    default:
      return 'help-circle-outline';
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

const ActivityItem: React.FC<{
  activity: CashbackActivity;
  onPress: () => void;
}> = ({ activity, onPress }) => {
  const statusColor = getStatusColor(activity.status);
  const statusIcon = getStatusIcon(activity.status);

  return (
    <TouchableOpacity style={styles.activityItem} onPress={onPress} activeOpacity={0.7}>
      {/* Brand Logo */}
      <View style={styles.logoContainer}>
        {activity.brand.logo ? (
          <Image
            source={{ uri: activity.brand.logo }}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoInitial}>{activity.brand.name.charAt(0)}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.activityContent}>
        <Text style={styles.brandName}>{activity.brand.name}</Text>
        <Text style={styles.purchaseAmount}>
          Purchase: {formatCurrency(activity.purchaseAmount)}
        </Text>
        <Text style={styles.dateText}>{formatDate(activity.date)}</Text>
      </View>

      {/* Cashback Amount & Status */}
      <View style={styles.activityRight}>
        <Text style={[styles.cashbackAmount, { color: statusColor }]}>
          +{formatCurrency(activity.cashbackAmount)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
          <Ionicons name={statusIcon as any} size={12} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SkeletonItem: React.FC = () => (
  <View style={styles.activityItem}>
    <View style={[styles.logoContainer, styles.skeleton]} />
    <View style={styles.activityContent}>
      <View style={[styles.skeletonText, { width: 100 }]} />
      <View style={[styles.skeletonText, { width: 80 }]} />
    </View>
    <View style={styles.activityRight}>
      <View style={[styles.skeletonText, { width: 60 }]} />
    </View>
  </View>
);

const CashbackActivitySection: React.FC<CashbackActivitySectionProps> = ({
  activities,
  isLoading = false,
  onActivityPress,
  onViewAllPress,
}) => {
  if (activities.length === 0 && !isLoading) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="receipt-outline" size={18} color="#00C06A" />
            <Text style={styles.title}>Your Cashback Activity</Text>
          </View>
        </View>

        {/* Empty State */}
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No activity yet</Text>
          <Text style={styles.emptySubtitle}>
            Start shopping to earn cashback rewards
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="receipt-outline" size={18} color="#00C06A" />
          <Text style={styles.title}>Your Cashback Activity</Text>
        </View>
        <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#00C06A" />
        </TouchableOpacity>
      </View>

      {/* Activity List */}
      <View style={styles.activityList}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => <SkeletonItem key={`skeleton-${index}`} />)
          : activities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onPress={() => onActivityPress(activity)}
              />
            ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00C06A',
  },
  activityList: {
    paddingHorizontal: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  brandLogo: {
    width: 34,
    height: 34,
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  logoInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  activityContent: {
    flex: 1,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  purchaseAmount: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  cashbackAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Skeleton
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  skeletonText: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 6,
  },
});

export default memo(CashbackActivitySection);
