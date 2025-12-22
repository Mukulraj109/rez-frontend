// Friends Redeemed Offers Page
// Social proof - what friends bought

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

interface Friend {
  id: string;
  name: string;
  avatar: string;
}

interface FriendOffer {
  id: string;
  friend: Friend;
  offer: {
    title: string;
    store: string;
    discount: string;
    image: string;
  };
  savedAmount: string;
  redeemedAt: string;
}

const MOCK_FRIEND_OFFERS: FriendOffer[] = [
  {
    id: '1',
    friend: { id: 'f1', name: 'Rahul S.', avatar: '👨' },
    offer: { title: '50% Off Pizza', store: 'Dominos', discount: '50%', image: '🍕' },
    savedAmount: '₹250',
    redeemedAt: '2 hours ago',
  },
  {
    id: '2',
    friend: { id: 'f2', name: 'Priya K.', avatar: '👩' },
    offer: { title: 'BOGO Coffee', store: 'Starbucks', discount: 'BOGO', image: '☕' },
    savedAmount: '₹350',
    redeemedAt: '5 hours ago',
  },
  {
    id: '3',
    friend: { id: 'f3', name: 'Amit M.', avatar: '👨' },
    offer: { title: '₹500 Off Electronics', store: 'Croma', discount: '₹500', image: '📱' },
    savedAmount: '₹500',
    redeemedAt: 'Yesterday',
  },
  {
    id: '4',
    friend: { id: 'f4', name: 'Sneha R.', avatar: '👩' },
    offer: { title: '30% Off Fashion', store: 'Myntra', discount: '30%', image: '👗' },
    savedAmount: '₹890',
    redeemedAt: 'Yesterday',
  },
  {
    id: '5',
    friend: { id: 'f5', name: 'Vikram T.', avatar: '👨' },
    offer: { title: 'Free Delivery', store: 'Swiggy', discount: 'Free', image: '🛵' },
    savedAmount: '₹99',
    redeemedAt: '2 days ago',
  },
];

const FRIENDS = [
  { id: 'all', name: 'All Friends', avatar: '👥' },
  { id: 'f1', name: 'Rahul', avatar: '👨' },
  { id: 'f2', name: 'Priya', avatar: '👩' },
  { id: 'f3', name: 'Amit', avatar: '👨' },
  { id: 'f4', name: 'Sneha', avatar: '👩' },
  { id: 'f5', name: 'Vikram', avatar: '👨' },
];

export default function FriendsRedeemedPage() {
  const router = useRouter();
  const [selectedFriend, setSelectedFriend] = useState('all');

  const filteredOffers = selectedFriend === 'all'
    ? MOCK_FRIEND_OFFERS
    : MOCK_FRIEND_OFFERS.filter(o => o.friend.id === selectedFriend);

  const totalSaved = MOCK_FRIEND_OFFERS.reduce((sum, o) => {
    const amount = parseInt(o.savedAmount.replace(/[₹,]/g, ''));
    return sum + amount;
  }, 0);

  const renderFriendFilter = ({ item }: { item: typeof FRIENDS[0] }) => (
    <TouchableOpacity
      style={[
        styles.friendFilter,
        selectedFriend === item.id && styles.friendFilterActive,
      ]}
      onPress={() => setSelectedFriend(item.id)}
    >
      <ThemedText style={styles.friendAvatar}>{item.avatar}</ThemedText>
      <ThemedText style={[
        styles.friendFilterName,
        selectedFriend === item.id && styles.friendFilterNameActive,
      ]}>
        {item.name}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderOffer = ({ item }: { item: FriendOffer }) => (
    <TouchableOpacity
      style={styles.offerCard}
      onPress={() => router.push(`/offers/${item.id}` as any)}
    >
      <View style={styles.friendInfo}>
        <View style={styles.friendAvatarLarge}>
          <ThemedText style={styles.friendAvatarText}>{item.friend.avatar}</ThemedText>
        </View>
        <View style={styles.friendDetails}>
          <ThemedText style={styles.friendName}>{item.friend.name}</ThemedText>
          <ThemedText style={styles.redeemedTime}>{item.redeemedAt}</ThemedText>
        </View>
      </View>

      <View style={styles.offerInfo}>
        <View style={styles.offerImage}>
          <ThemedText style={styles.offerEmoji}>{item.offer.image}</ThemedText>
        </View>
        <View style={styles.offerDetails}>
          <ThemedText style={styles.offerTitle}>{item.offer.title}</ThemedText>
          <ThemedText style={styles.offerStore}>{item.offer.store}</ThemedText>
          <View style={styles.offerMeta}>
            <View style={styles.discountBadge}>
              <ThemedText style={styles.discountText}>{item.offer.discount} OFF</ThemedText>
            </View>
            <View style={styles.savedBadge}>
              <Ionicons name="wallet-outline" size={12} color={Colors.success} />
              <ThemedText style={styles.savedText}>Saved {item.savedAmount}</ThemedText>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.useButton}>
          <ThemedText style={styles.useButtonText}>Use</ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />

      <LinearGradient
        colors={[Colors.primary[600], Colors.secondary[700]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Friends' Deals</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{MOCK_FRIEND_OFFERS.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Friends Saved</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>₹{totalSaved.toLocaleString()}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Saved</ThemedText>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={filteredOffers}
        renderItem={renderOffer}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.filtersSection}>
            <FlatList
              data={FRIENDS}
              renderItem={renderFriendFilter}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContainer}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyEmoji}>👋</ThemedText>
            <ThemedText style={styles.emptyTitle}>No offers yet</ThemedText>
            <ThemedText style={styles.emptyText}>
              This friend hasn't redeemed any offers recently
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    ...Typography.h3,
    color: '#FFF',
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    color: '#FFF',
  },
  statLabel: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: Spacing.sm,
  },
  filtersSection: {
    marginBottom: Spacing.md,
  },
  filtersContainer: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  friendFilter: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.sm,
    ...Shadows.subtle,
  },
  friendFilterActive: {
    backgroundColor: Colors.primary[50],
    borderWidth: 2,
    borderColor: Colors.primary[600],
  },
  friendAvatar: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  friendFilterName: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  friendFilterNameActive: {
    color: Colors.primary[600],
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  offerCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  friendAvatarLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  friendAvatarText: {
    fontSize: 20,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  redeemedTime: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  offerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerImage: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  offerEmoji: {
    fontSize: 28,
  },
  offerDetails: {
    flex: 1,
  },
  offerTitle: {
    ...Typography.label,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  offerStore: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    marginBottom: Spacing.sm,
  },
  offerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  discountBadge: {
    backgroundColor: Colors.success + '20',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  discountText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '700',
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  savedText: {
    ...Typography.caption,
    color: Colors.success,
  },
  useButton: {
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  useButtonText: {
    ...Typography.label,
    color: '#FFF',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});
