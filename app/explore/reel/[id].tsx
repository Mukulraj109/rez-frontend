import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
  ScrollView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Mock reel data
const reelData = {
  id: 1,
  user: {
    name: 'Priya Sharma',
    avatar: 'https://i.pravatar.cc/100?img=1',
    followers: 1234,
    isFollowing: false,
  },
  store: {
    name: 'Starbucks',
    logo: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100',
    cashback: '10%',
  },
  image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
  product: 'Cappuccino & Croissant Combo',
  description:
    'Amazing coffee and croissant combo! Got 10% cashback instantly. The croissant was fresh and the coffee was perfect. Highly recommend visiting during morning hours for the best experience.',
  saved: 120,
  likes: 234,
  comments: 45,
  shares: 12,
  createdAt: '2 hours ago',
  tags: ['#coffee', '#breakfast', '#cashback', '#starbucks'],
};

const commentsData = [
  {
    id: 1,
    user: 'Rahul K.',
    avatar: 'https://i.pravatar.cc/100?img=2',
    comment: 'Looks delicious! Going there tomorrow.',
    time: '1h ago',
    likes: 5,
  },
  {
    id: 2,
    user: 'Sneha M.',
    avatar: 'https://i.pravatar.cc/100?img=3',
    comment: 'The cashback is amazing! Thanks for sharing.',
    time: '45m ago',
    likes: 3,
  },
  {
    id: 3,
    user: 'Arjun P.',
    avatar: 'https://i.pravatar.cc/100?img=4',
    comment: 'Which outlet is this?',
    time: '30m ago',
    likes: 1,
  },
];

const ReelDetailPage = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [comment, setComment] = useState('');

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Full Screen Image/Video */}
      <View style={styles.mediaContainer}>
        <Image source={{ uri: reelData.image }} style={styles.mediaImage} />

        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Right Actions */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsLiked(!isLiked)}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={28}
              color={isLiked ? '#EF4444' : '#FFFFFF'}
            />
            <Text style={styles.actionText}>{reelData.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={26} color="#FFFFFF" />
            <Text style={styles.actionText}>{reelData.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social-outline" size={26} color="#FFFFFF" />
            <Text style={styles.actionText}>{reelData.shares}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsSaved(!isSaved)}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={26}
              color={isSaved ? '#F59E0B' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>

        {/* Bottom Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.bottomGradient}
        >
          {/* User Info */}
          <View style={styles.userInfo}>
            <Image
              source={{ uri: reelData.user.avatar }}
              style={styles.avatar}
            />
            <View style={styles.userText}>
              <Text style={styles.userName}>{reelData.user.name}</Text>
              <Text style={styles.timestamp}>{reelData.createdAt}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing && styles.followingButton,
              ]}
              onPress={() => setIsFollowing(!isFollowing)}
            >
              <Text
                style={[
                  styles.followText,
                  isFollowing && styles.followingText,
                ]}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Product & Store */}
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{reelData.product}</Text>
            <TouchableOpacity
              style={styles.storeButton}
              onPress={() => navigateTo('/MainStorePage')}
            >
              <Ionicons name="storefront" size={14} color="#FFFFFF" />
              <Text style={styles.storeName}>{reelData.store.name}</Text>
              <View style={styles.cashbackBadge}>
                <Text style={styles.cashbackText}>
                  {reelData.store.cashback} Cashback
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {reelData.description}
          </Text>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {reelData.tags.map((tag, index) => (
              <Text key={index} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>

          {/* Savings Badge */}
          <View style={styles.savingsContainer}>
            <LinearGradient
              colors={['#00C06A', '#10B981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.savingsBadge}
            >
              <Ionicons name="pricetag" size={16} color="#FFFFFF" />
              <Text style={styles.savingsText}>Saved ₹{reelData.saved}</Text>
            </LinearGradient>
            <TouchableOpacity
              style={styles.visitStoreButton}
              onPress={() => navigateTo('/MainStorePage')}
            >
              <Text style={styles.visitStoreText}>Visit Store</Text>
              <Ionicons name="arrow-forward" size={16} color="#00C06A" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Comments Section */}
      <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>Comments ({reelData.comments})</Text>

        <ScrollView
          style={styles.commentsList}
          showsVerticalScrollIndicator={false}
        >
          {commentsData.map((item) => (
            <View key={item.id} style={styles.commentItem}>
              <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUser}>{item.user}</Text>
                  <Text style={styles.commentTime}>{item.time}</Text>
                </View>
                <Text style={styles.commentText}>{item.comment}</Text>
                <View style={styles.commentActions}>
                  <TouchableOpacity style={styles.commentAction}>
                    <Ionicons name="heart-outline" size={14} color="#6B7280" />
                    <Text style={styles.commentActionText}>{item.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.commentAction}>
                    <Text style={styles.commentActionText}>Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Comment Input */}
        <View style={styles.commentInputContainer}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100?img=10' }}
            style={styles.myAvatar}
          />
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor="#9CA3AF"
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#00C06A" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mediaContainer: {
    height: height * 0.6,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  topHeader: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActions: {
    position: 'absolute',
    right: 12,
    bottom: 180,
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 2,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 60,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userText: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  followButton: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  followText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  followingText: {
    color: '#FFFFFF',
  },
  productInfo: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  storeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeName: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  cashbackBadge: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  cashbackText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    fontSize: 12,
    color: '#60A5FA',
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  visitStoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  visitStoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00C06A',
  },
  commentsSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2240',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentContent: {
    flex: 1,
    marginLeft: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentUser: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B2240',
  },
  commentTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  commentText: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 6,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    fontSize: 11,
    color: '#6B7280',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 10,
  },
  myAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 13,
    color: '#0B2240',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReelDetailPage;
