import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const communityActivity = [
  {
    id: 1,
    type: 'friend_saved',
    user: { name: 'Arjun', avatar: 'https://i.pravatar.cc/100?img=11' },
    message: 'saved ₹120 at',
    store: 'Nike Store',
    time: '5 min ago',
    isFriend: true,
  },
  {
    id: 2,
    type: 'trending',
    count: 23,
    message: 'people near you redeemed this',
    store: 'Starbucks',
    offer: '20% off on coffee',
    time: '2 hours ago',
  },
  {
    id: 3,
    type: 'friend_review',
    user: { name: 'Sneha', avatar: 'https://i.pravatar.cc/100?img=5' },
    message: 'reviewed',
    store: 'Paradise Biryani',
    rating: 5,
    time: '1 hour ago',
    isFriend: true,
  },
  {
    id: 4,
    type: 'popular',
    message: 'Most saved this week',
    store: 'Paradise Biryani',
    saves: 156,
    time: 'This week',
  },
];

const friendsShopping = [
  { id: 1, name: 'Arjun', avatar: 'https://i.pravatar.cc/100?img=11', store: 'Nike', isLive: true },
  { id: 2, name: 'Sneha', avatar: 'https://i.pravatar.cc/100?img=5', store: 'Cafe', isLive: true },
  { id: 3, name: 'Rahul', avatar: 'https://i.pravatar.cc/100?img=12', store: 'Pizza', isLive: false },
  { id: 4, name: 'Priya', avatar: 'https://i.pravatar.cc/100?img=9', store: 'Salon', isLive: true },
];

const FriendsCommunity = () => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  const renderActivityIcon = (type: string) => {
    switch (type) {
      case 'friend_saved':
        return <Ionicons name="wallet" size={16} color="#00C06A" />;
      case 'trending':
        return <Ionicons name="flame" size={16} color="#F97316" />;
      case 'friend_review':
        return <Ionicons name="star" size={16} color="#F59E0B" />;
      case 'popular':
        return <Ionicons name="heart" size={16} color="#EF4444" />;
      default:
        return <Ionicons name="ellipse" size={16} color="#6B7280" />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Friends Shopping Now */}
      <View style={styles.friendsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Friends Shopping Now</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>See all</Text>
          </TouchableOpacity>
        </View>

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

        <View style={styles.activityList}>
          {communityActivity.map((activity) => (
            <TouchableOpacity key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                {activity.user ? (
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
                  {activity.count && <Text style={styles.activityHighlight}>{activity.count} </Text>}
                  {activity.message}{' '}
                  <Text style={styles.activityStore}>{activity.store}</Text>
                  {activity.rating && (
                    <Text style={styles.activityRating}> ⭐ {activity.rating}</Text>
                  )}
                  {activity.saves && (
                    <Text style={styles.activitySaves}> • {activity.saves} saves</Text>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
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
  activityHighlight: {
    fontWeight: '700',
    color: '#F97316',
  },
  activityStore: {
    fontWeight: '600',
    color: '#00C06A',
  },
  activityRating: {
    color: '#F59E0B',
  },
  activitySaves: {
    color: '#6B7280',
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
