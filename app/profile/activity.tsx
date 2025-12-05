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
import { useRouter, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useActivities } from '@/hooks/useActivities';
import { Activity, ActivityType } from '@/services/activityApi';

const ACTIVITY_TYPE_FILTERS: { label: string; value: ActivityType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Orders', value: ActivityType.ORDER },
  { label: 'Cashback', value: ActivityType.CASHBACK },
  { label: 'Reviews', value: ActivityType.REVIEW },
  { label: 'Videos', value: ActivityType.VIDEO },
  { label: 'Projects', value: ActivityType.PROJECT },
  { label: 'Vouchers', value: ActivityType.VOUCHER },
  { label: 'Offers', value: ActivityType.OFFER },
  { label: 'Referrals', value: ActivityType.REFERRAL },
  { label: 'Wallet', value: ActivityType.WALLET },
  { label: 'Achievements', value: ActivityType.ACHIEVEMENT },
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
        <ActivityIndicator size="small" color="#00C06A" />
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
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#00C06A" />

      {/* Header */}
      <LinearGradient colors={['#00C06A', '#00796B']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              // Check if we can go back, otherwise navigate to profile
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/profile');
              }
            }}
          >
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
              <LinearGradient
                key={index}
                colors={['rgba(255, 255, 255, 0.98)', 'rgba(255, 255, 255, 0.95)']}
                style={styles.summaryCard}
              >
                <ThemedText style={styles.summaryNumber}>{stat.count}</ThemedText>
                <ThemedText style={styles.summaryLabel}>{stat.type}</ThemedText>
                {stat.totalAmount > 0 && (
                  <View style={styles.amountBadge}>
                    <ThemedText style={styles.summaryAmount}>
                      ₹{stat.totalAmount.toFixed(0)}
                    </ThemedText>
                  </View>
                )}
              </LinearGradient>
            ))}
          </ScrollView>
        )}
      </LinearGradient>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
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
              activeOpacity={0.7}
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
      </View>

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
            tintColor="#00C06A"
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
          <ActivityIndicator size="large" color="#00C06A" />
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
    borderRadius: 16,
    padding: 16,
    minWidth: 110,
    alignItems: 'center',
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00C06A',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountBadge: {
    backgroundColor: '#10B98110',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  summaryAmount: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '700',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  filterPillActive: {
    backgroundColor: '#00C06A',
    borderColor: '#00C06A',
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  filterPillTextActive: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  activityIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.2,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  activityDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
    marginTop: 2,
  },
  activityAmount: {
    alignSelf: 'flex-start',
    backgroundColor: '#10B98110',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
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
    paddingVertical: 80,
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