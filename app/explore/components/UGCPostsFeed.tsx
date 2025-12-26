import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const ugcPosts = [
  {
    id: 1,
    user: { name: 'Arjun Kumar', avatar: 'https://i.pravatar.cc/100?img=11', distance: '0.5 km away' },
    store: 'Cafe Noir',
    storeEmoji: '☕',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    caption: 'Saved ₹90 at this café using ReZ 😊 Amazing coffee and service!',
    saved: 90,
    helpful: 45,
    comments: 12,
    time: '2 hours ago',
  },
  {
    id: 2,
    user: { name: 'Neha Patel', avatar: 'https://i.pravatar.cc/100?img=5', distance: '1.2 km away' },
    store: 'Fresh Groceries',
    storeEmoji: '🛒',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    caption: 'Monthly grocery shopping with 15% cashback. ReZ makes it so easy! 🎉',
    saved: 340,
    helpful: 78,
    comments: 23,
    time: '5 hours ago',
  },
  {
    id: 3,
    user: { name: 'Raj Sharma', avatar: 'https://i.pravatar.cc/100?img=12', distance: '0.8 km away' },
    store: 'Nike Store',
    storeEmoji: '👟',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    caption: 'Got these amazing sneakers with 20% cashback! Best deal ever! 🔥',
    saved: 1400,
    helpful: 156,
    comments: 34,
    time: '1 day ago',
  },
];

const UGCPostsFeed = () => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>People Are Saving Here</Text>
          <Text style={styles.sectionSubtitle}>Real experiences from your neighborhood</Text>
        </View>
        <TouchableOpacity onPress={() => navigateTo('/explore/reels')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Posts List */}
      <View style={styles.postsList}>
        {ugcPosts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            {/* User Header */}
            <View style={styles.postHeader}>
              <Image source={{ uri: post.user.avatar }} style={styles.userAvatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{post.user.name}</Text>
                <View style={styles.userMeta}>
                  <Ionicons name="location-outline" size={12} color="#6B7280" />
                  <Text style={styles.userMetaText}>{post.user.distance}</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.userMetaText}>{post.time}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewStoreButton}
                onPress={() => navigateTo(`/MainStorePage?id=${post.id}`)}
              >
                <Text style={styles.viewStoreText}>View Store</Text>
              </TouchableOpacity>
            </View>

            {/* Post Image */}
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() => navigateTo(`/explore/reel/${post.id}`)}
            >
              <Image source={{ uri: post.image }} style={styles.postImage} />

              {/* Savings Badge */}
              <View style={styles.savingsBadge}>
                <View style={styles.savingsIcon}>
                  <Ionicons name="wallet-outline" size={14} color="#FFFFFF" />
                </View>
                <Text style={styles.savingsText}>₹{post.saved}</Text>
              </View>
            </TouchableOpacity>

            {/* Store Name */}
            <View style={styles.storeRow}>
              <Text style={styles.storeEmoji}>{post.storeEmoji}</Text>
              <Text style={styles.storeName}>{post.store}</Text>
            </View>

            {/* Caption */}
            <Text style={styles.caption}>{post.caption}</Text>

            {/* Actions Row */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="thumbs-up-outline" size={18} color="#6B7280" />
                <Text style={styles.actionText}>{post.helpful}</Text>
                <Text style={styles.actionLabel}>Helpful</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
                <Text style={styles.actionText}>{post.comments}</Text>
                <Text style={styles.actionLabel}>Comment</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={18} color="#6B7280" />
                <Text style={styles.actionLabel}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2240',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 14,
    color: '#00C06A',
    fontWeight: '600',
  },
  postsList: {
    paddingHorizontal: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0B2240',
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  userMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  metaDot: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  viewStoreButton: {
    borderWidth: 1.5,
    borderColor: '#00C06A',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  viewStoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00C06A',
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  savingsBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C06A',
    paddingLeft: 6,
    paddingRight: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  savingsIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 6,
  },
  storeEmoji: {
    fontSize: 16,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00C06A',
  },
  caption: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 21,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  actionLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default UGCPostsFeed;
