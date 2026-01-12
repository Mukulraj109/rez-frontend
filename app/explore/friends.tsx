import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import exploreApi, { CommunityActivity } from '@/services/exploreApi';

const { width } = Dimensions.get('window');

interface FriendItem {
  id: string;
  name: string;
  avatar: string;
  store?: string;
  isLive: boolean;
  lastActive?: string;
  totalSaved?: number;
}

const FriendsActivityPage = () => {
  const router = useRouter();
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [activities, setActivities] = useState<CommunityActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shopping' | 'activity'>('shopping');

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await exploreApi.getCommunityActivity({ limit: 20 });

      if (response.success && response.data) {
        setActivities(response.data.activities || []);

        // Extract friends from activities
        const friendsMap = new Map<string, FriendItem>();
        (response.data.activities || []).forEach((activity: CommunityActivity, index: number) => {
          if (activity.user && activity.user.name) {
            const id = activity.id || `friend-${index}`;
            if (!friendsMap.has(activity.user.name)) {
              friendsMap.set(activity.user.name, {
                id,
                name: activity.user.name,
                avatar: activity.user.avatar || `https://i.pravatar.cc/100?img=${index + 1}`,
                store: activity.store,
                isLive: activity.type === 'order' || activity.type === 'friend_saved',
                lastActive: activity.time,
                totalSaved: activity.amount || 0,
              });
            }
          }
        });
        setFriends(Array.from(friendsMap.values()));
      }
    } catch (err: any) {
      console.error('[FRIENDS PAGE] Error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const navigateToStore = (storeId?: string) => {
    if (storeId) {
      router.push(`/MainStorePage?id=${storeId}` as any);
    }
  };

  const navigateToReferral = () => {
    router.push('/referral' as any);
  };

  const renderActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
      case 'friend_saved':
        return <Ionicons name="wallet" size={18} color="#00C06A" />;
      case 'trending':
        return <Ionicons name="flame" size={18} color="#F97316" />;
      case 'review':
      case 'friend_review':
        return <Ionicons name="star" size={18} color="#F59E0B" />;
      case 'popular':
        return <Ionicons name="heart" size={18} color="#EF4444" />;
      default:
        return <Ionicons name="ellipse" size={18} color="#6B7280" />;
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#0B2240" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Friends Activity</Text>
            <Text style={styles.headerSubtitle}>See what your friends are saving</Text>
          </View>
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={navigateToReferral}
          >
            <Ionicons name="person-add" size={20} color="#00C06A" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'shopping' && styles.tabActive]}
            onPress={() => setActiveTab('shopping')}
          >
            <Ionicons
              name="people"
              size={16}
              color={activeTab === 'shopping' ? '#00C06A' : '#6B7280'}
            />
            <Text style={[styles.tabText, activeTab === 'shopping' && styles.tabTextActive]}>
              Shopping Now ({friends.filter(f => f.isLive).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'activity' && styles.tabActive]}
            onPress={() => setActiveTab('activity')}
          >
            <Ionicons
              name="pulse"
              size={16}
              color={activeTab === 'activity' ? '#00C06A' : '#6B7280'}
            />
            <Text style={[styles.tabText, activeTab === 'activity' && styles.tabTextActive]}>
              Activity ({activities.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.contentList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00C06A']} />
          }
        >
          {/* Loading State */}
          {loading && !refreshing && (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#00C06A" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}

          {/* Error State */}
          {error && !loading && (
            <View style={styles.centerContainer}>
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Shopping Now Tab */}
          {!loading && !error && activeTab === 'shopping' && (
            <>
              {friends.filter(f => f.isLive).length === 0 ? (
                <View style={styles.centerContainer}>
                  <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>No Friends Shopping</Text>
                  <Text style={styles.emptySubtext}>
                    Invite friends to see their shopping activity
                  </Text>
                  <TouchableOpacity style={styles.inviteMainButton} onPress={navigateToReferral}>
                    <Ionicons name="person-add" size={18} color="#FFFFFF" />
                    <Text style={styles.inviteMainText}>Invite Friends</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.friendsGrid}>
                  {friends.filter(f => f.isLive).map((friend) => (
                    <TouchableOpacity key={friend.id} style={styles.friendCard}>
                      <View style={styles.friendAvatarContainer}>
                        <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
                        <View style={styles.liveDot} />
                      </View>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      {friend.store && (
                        <Text style={styles.friendStore}>at {friend.store}</Text>
                      )}
                      {friend.totalSaved && friend.totalSaved > 0 && (
                        <View style={styles.savedBadge}>
                          <Text style={styles.savedText}>Saved Rs.{friend.totalSaved}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* All Friends Section */}
              {friends.length > 0 && (
                <View style={styles.allFriendsSection}>
                  <Text style={styles.sectionTitle}>All Friends ({friends.length})</Text>
                  {friends.map((friend) => (
                    <View key={friend.id} style={styles.friendListItem}>
                      <Image source={{ uri: friend.avatar }} style={styles.friendListAvatar} />
                      <View style={styles.friendListInfo}>
                        <Text style={styles.friendListName}>{friend.name}</Text>
                        <Text style={styles.friendListMeta}>
                          {friend.isLive ? 'Shopping now' : `Active ${friend.lastActive || 'recently'}`}
                        </Text>
                      </View>
                      {friend.isLive && <View style={styles.liveIndicator} />}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Activity Tab */}
          {!loading && !error && activeTab === 'activity' && (
            <>
              {activities.length === 0 ? (
                <View style={styles.centerContainer}>
                  <Ionicons name="pulse-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>No Recent Activity</Text>
                  <Text style={styles.emptySubtext}>
                    Activity from your friends will appear here
                  </Text>
                </View>
              ) : (
                <View style={styles.activityList}>
                  {activities.map((activity, index) => (
                    <TouchableOpacity
                      key={activity.id || `activity-${index}`}
                      style={styles.activityItem}
                    >
                      <View style={styles.activityIconContainer}>
                        {activity.user?.avatar ? (
                          <Image
                            source={{ uri: activity.user.avatar }}
                            style={styles.activityAvatar}
                          />
                        ) : (
                          <View style={styles.activityIconBadge}>
                            {renderActivityIcon(activity.type)}
                          </View>
                        )}
                      </View>

                      <View style={styles.activityContent}>
                        <Text style={styles.activityText}>
                          {activity.user?.name && (
                            <Text style={styles.activityUserName}>{activity.user.name} </Text>
                          )}
                          {activity.message}
                          {activity.store && (
                            <Text style={styles.activityStore}> at {activity.store}</Text>
                          )}
                        </Text>
                        <View style={styles.activityMeta}>
                          <Text style={styles.activityTime}>{activity.time}</Text>
                          {activity.amount && activity.amount > 0 && (
                            <View style={styles.activityAmountBadge}>
                              <Text style={styles.activityAmountText}>Rs.{activity.amount} saved</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Invite Banner */}
          <View style={styles.inviteBanner}>
            <View style={styles.inviteBannerContent}>
              <Text style={styles.inviteBannerTitle}>Invite Friends & Earn</Text>
              <Text style={styles.inviteBannerSubtext}>
                Get Rs.500 for each friend who joins ReZ
              </Text>
            </View>
            <TouchableOpacity style={styles.inviteBannerButton} onPress={navigateToReferral}>
              <Text style={styles.inviteBannerButtonText}>Invite</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2240',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  inviteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#00C06A',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#00C06A',
    fontWeight: '600',
  },
  contentList: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    minHeight: 300,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#00C06A',
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  inviteMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C06A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
    gap: 8,
  },
  inviteMainText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  friendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  friendCard: {
    width: (width - 44) / 3,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    margin: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  friendAvatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  friendAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#00C06A',
  },
  liveDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00C06A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  friendName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B2240',
    textAlign: 'center',
  },
  friendStore: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  savedBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  savedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#00C06A',
  },
  allFriendsSection: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2240',
    marginBottom: 16,
  },
  friendListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  friendListAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
  },
  friendListInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendListName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
  },
  friendListMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  liveIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00C06A',
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIconContainer: {
    marginRight: 12,
  },
  activityAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  activityIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  activityUserName: {
    fontWeight: '600',
    color: '#0B2240',
  },
  activityStore: {
    fontWeight: '600',
    color: '#00C06A',
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 10,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  activityAmountBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activityAmountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00C06A',
  },
  inviteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C06A',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  inviteBannerContent: {
    flex: 1,
  },
  inviteBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inviteBannerSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  inviteBannerButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  inviteBannerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00C06A',
  },
});

export default FriendsActivityPage;
