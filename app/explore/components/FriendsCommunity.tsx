import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import exploreApi, { CommunityActivity } from '@/services/exploreApi';

const { width } = Dimensions.get('window');

interface FriendShopping {
  id: string;
  name: string;
  avatar: string;
  store: string;
  isLive: boolean;
}

const FriendsCommunity = () => {
  const router = useRouter();
  const [activities, setActivities] = useState<CommunityActivity[]>([]);
  const [friendsShopping, setFriendsShopping] = useState<FriendShopping[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      const response = await exploreApi.getCommunityActivity({ limit: 6 });
      if (response.success && response.data) {
        setActivities(response.data.activities);

        // Extract friends from activities who have avatars
        const friends: FriendShopping[] = response.data.activities
          .filter((a: CommunityActivity) => a.user && a.user.avatar)
          .slice(0, 4)
          .map((a: CommunityActivity, index: number) => ({
            id: a.id,
            name: a.user?.name || 'User',
            avatar: a.user?.avatar || `https://i.pravatar.cc/100?img=${index + 1}`,
            store: a.store || 'Store',
            isLive: true,
          }));

        setFriendsShopping(friends);
      }
    } catch (error) {
      console.error('[FriendsCommunity] Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  const renderActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
      case 'friend_saved':
        return <Ionicons name="wallet" size={16} color="#00C06A" />;
      case 'trending':
        return <Ionicons name="flame" size={16} color="#F97316" />;
      case 'review':
      case 'friend_review':
        return <Ionicons name="star" size={16} color="#F59E0B" />;
      case 'popular':
        return <Ionicons name="heart" size={16} color="#EF4444" />;
      default:
        return <Ionicons name="ellipse" size={16} color="#6B7280" />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Friends Shopping Now</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00C06A" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Friends Shopping Now */}
      <View style={styles.friendsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Friends Shopping Now</Text>
          <TouchableOpacity onPress={() => navigateTo('/explore/friends')}>
            <Text style={styles.viewAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {friendsShopping.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.friendsContainer}
          >
            {friendsShopping.map((friend) => (
              <TouchableOpacity key={friend.id} style={styles.friendBubble}>
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
                  {friend.isLive && <View style={styles.liveDot} />}
                </View>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendStore}>{friend.store}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.inviteBubble}>
              <View style={styles.inviteIcon}>
                <Ionicons name="person-add" size={20} color="#00C06A" />
              </View>
              <Text style={styles.inviteText}>Invite</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.emptyFriendsContainer}>
            <Text style={styles.emptyFriendsText}>Invite friends to see their activity</Text>
            <TouchableOpacity style={styles.inviteButtonSmall}>
              <Ionicons name="person-add" size={16} color="#00C06A" />
              <Text style={styles.inviteButtonText}>Invite Friends</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Community Activity */}
      <View style={styles.activitySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Community Activity</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveIndicator} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>

        {activities.length > 0 ? (
          <View style={styles.activityList}>
            {activities.slice(0, 4).map((activity) => (
              <TouchableOpacity key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIconContainer}>
                  {activity.user && activity.user.avatar ? (
                    <Image source={{ uri: activity.user.avatar }} style={styles.activityAvatar} />
                  ) : (
                    <View style={styles.activityIconBadge}>
                      {renderActivityIcon(activity.type)}
                    </View>
                  )}
                </View>

                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    {activity.user && (
                      <Text style={styles.activityUserName}>{activity.user.name} </Text>
                    )}
                    {activity.message}
                    {activity.store && (
                      <Text style={styles.activityStore}> {activity.store}</Text>
                    )}
                    {activity.amount && activity.amount > 0 && (
                      <Text style={styles.activityAmount}> - ₹{activity.amount}</Text>
                    )}
                  </Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>

                <TouchableOpacity style={styles.activityAction}>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyActivityContainer}>
            <Ionicons name="people-outline" size={32} color="#9CA3AF" />
            <Text style={styles.emptyText}>No recent activity</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyFriendsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 12,
  },
  emptyFriendsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  inviteButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
  },
  inviteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00C06A',
  },
  emptyActivityContainer: {
    paddingHorizontal: 16,
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  friendsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
  },
  viewAllText: {
    fontSize: 13,
    color: '#00C06A',
    fontWeight: '600',
  },
  friendsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  friendBubble: {
    alignItems: 'center',
    width: 70,
  },
  avatarContainer: {
    position: 'relative',
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
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00C06A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  friendName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B2240',
    marginTop: 6,
  },
  friendStore: {
    fontSize: 10,
    color: '#6B7280',
  },
  inviteBubble: {
    alignItems: 'center',
    width: 70,
  },
  inviteIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00C06A',
    borderStyle: 'dashed',
  },
  inviteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00C06A',
    marginTop: 6,
  },
  activitySection: {},
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
  },
  activityList: {
    paddingHorizontal: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIconContainer: {
    marginRight: 12,
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  activityIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  activityUserName: {
    fontWeight: '600',
    color: '#0B2240',
  },
  activityStore: {
    fontWeight: '600',
    color: '#00C06A',
  },
  activityAmount: {
    fontWeight: '600',
    color: '#F97316',
  },
  activityTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  activityAction: {
    padding: 4,
  },
});

export default FriendsCommunity;
