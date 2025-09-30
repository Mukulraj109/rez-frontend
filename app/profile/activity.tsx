// Activity Feed Screen
// Displays user activity timeline with pagination and filtering

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useActivities } from '@/hooks/useActivities';
import { Activity, ActivityType } from '@/services/activityApi';

const ACTIVITY_TYPE_FILTERS: { label: string; value: ActivityType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Orders', value: 'ORDER' },
  { label: 'Cashback', value: 'CASHBACK' },
  { label: 'Reviews', value: 'REVIEW' },
  { label: 'Videos', value: 'VIDEO' },
  { label: 'Projects', value: 'PROJECT' },
  { label: 'Vouchers', value: 'VOUCHER' },
  { label: 'Offers', value: 'OFFER' },
  { label: 'Referrals', value: 'REFERRAL' },
  { label: 'Wallet', value: 'WALLET' },
  { label: 'Achievements', value: 'ACHIEVEMENT' },
];

export default function ActivityFeedPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<ActivityType | 'all'>('all');

  const {
    activities,
    pagination,
    summary,
    isLoading,
    refresh,
    loadMore,
    setFilterType,
    hasMore,
  } = useActivities({
    autoFetch: true,
    initialPage: 1,
    initialLimit: 20,
  });

  const handleFilterChange = (filter: ActivityType | 'all') => {
    setSelectedFilter(filter);
    if (filter === 'all') {
      setFilterType(undefined);
    } else {
      setFilterType(filter);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <TouchableOpacity style={styles.activityCard} activeOpacity={0.7}>
      <View style={[styles.activityIcon, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>

      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <ThemedText style={styles.activityTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.activityTime}>
            {formatDate(item.createdAt)}
          </ThemedText>
        </View>

        {item.description && (
          <ThemedText style={styles.activityDescription} numberOfLines={2}>
            {item.description}
          </ThemedText>
        )}

        {item.amount !== undefined && item.amount !== null && (
          <View style={styles.activityAmount}>
            <ThemedText style={[styles.amountText, { color: item.color }]}>
              {item.amount > 0 ? '+' : ''}₹{item.amount.toFixed(2)}
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#8B5CF6" />
        <ThemedText style={styles.footerText}>Loading more...</ThemedText>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
      <ThemedText style={styles.emptyText}>No activities yet</ThemedText>
      <ThemedText style={styles.emptySubtext}>
        Your activity timeline will appear here
      </ThemedText>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <ThemedText style={styles.headerTitle}>Activity Feed</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {pagination?.total || 0} total activities
            </ThemedText>
          </View>

          <View style={styles.placeholder} />
        </View>

        {/* Summary Stats */}
        {summary && summary.summary.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.summaryScroll}
            contentContainerStyle={styles.summaryContent}
          >
            {summary.summary.map((stat, index) => (
              <View key={index} style={styles.summaryCard}>
                <ThemedText style={styles.summaryNumber}>{stat.count}</ThemedText>
                <ThemedText style={styles.summaryLabel}>{stat.type}</ThemedText>
                {stat.totalAmount > 0 && (
                  <ThemedText style={styles.summaryAmount}>
                    ₹{stat.totalAmount.toFixed(0)}
                  </ThemedText>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </LinearGradient>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {ACTIVITY_TYPE_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterPill,
              selectedFilter === filter.value && styles.filterPillActive,
            ]}
            onPress={() => handleFilterChange(filter.value)}
          >
            <ThemedText
              style={[
                styles.filterPillText,
                selectedFilter === filter.value && styles.filterPillTextActive,
              ]}
            >
              {filter.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Activity List */}
      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && activities.length > 0}
            onRefresh={refresh}
            tintColor="#8B5CF6"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />

      {isLoading && activities.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <ThemedText style={styles.loadingText}>Loading activities...</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  placeholder: {
    width: 40,
  },
  summaryScroll: {
    marginTop: 8,
  },
  summaryContent: {
    gap: 12,
    paddingRight: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 4,
  },
  filterScroll: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterPillActive: {
    backgroundColor: '#8B5CF6',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterPillTextActive: {
    color: 'white',
  },
  listContent: {
    padding: 20,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  activityDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  activityAmount: {
    alignSelf: 'flex-start',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 250, 251, 0.9)',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});