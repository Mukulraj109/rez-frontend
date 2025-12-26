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

const hotDeals = [
  {
    id: 1,
    name: 'Paradise Biryani',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200',
    emoji: '🍛',
    distance: '0.8 km',
    cashback: '20%',
    peopleEarned: 12,
    badge: 'Hot Deal',
    badgeColor: '#F97316',
  },
  {
    id: 2,
    name: 'Nike Store',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
    emoji: '👟',
    distance: '1.2 km',
    cashback: '15%',
    peopleEarned: 8,
    badge: 'Trending',
    badgeColor: '#EF4444',
  },
  {
    id: 3,
    name: 'Starbucks',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200',
    emoji: '☕',
    distance: '0.5 km',
    cashback: '10%',
    peopleEarned: 23,
    badge: 'Popular',
    badgeColor: '#3B82F6',
  },
  {
    id: 4,
    name: 'Wellness Spa',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200',
    emoji: '💆',
    distance: '2.1 km',
    cashback: '25%',
    peopleEarned: 5,
    badge: 'High Cashback',
    badgeColor: '#10B981',
  },
];

const HotRightNow = () => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Ionicons name="flame" size={22} color="#F97316" />
          <View>
            <Text style={styles.sectionTitle}>Hot Right Now</Text>
            <Text style={styles.sectionSubtitle}>Live activity • Real-time deals</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigateTo('/explore/map')}>
          <Text style={styles.mapViewText}>Map View</Text>
        </TouchableOpacity>
      </View>

      {/* Hot Deals Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
      >
        {hotDeals.map((deal) => (
          <View key={deal.id} style={styles.dealCard}>
            {/* Store Info Row */}
            <View style={styles.storeRow}>
              <View style={styles.storeImageContainer}>
                <Image source={{ uri: deal.image }} style={styles.storeImage} />
              </View>
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{deal.name}</Text>
                <View style={styles.distanceRow}>
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text style={styles.distanceText}>{deal.distance}</Text>
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: deal.badgeColor }]}>
                <Text style={styles.badgeText}>{deal.badge}</Text>
              </View>
            </View>

            {/* Cashback Row */}
            <View style={styles.cashbackRow}>
              <Ionicons name="flash" size={18} color="#00C06A" />
              <Text style={styles.cashbackText}>{deal.cashback} Cashback</Text>
            </View>

            {/* Activity Row */}
            <View style={styles.activityRow}>
              <View style={styles.liveDot} />
              <Ionicons name="people-outline" size={14} color="#6B7280" />
              <Text style={styles.activityText}>{deal.peopleEarned} people earned here today</Text>
            </View>

            {/* Pay Now Button */}
            <TouchableOpacity
              style={styles.payNowButton}
              onPress={() => navigateTo(`/MainStorePage?id=${deal.id}`)}
            >
              <Text style={styles.payNowText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2240',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  mapViewText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dealCard: {
    width: width * 0.7,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  storeImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  storeImage: {
    width: '100%',
    height: '100%',
  },
  storeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B2240',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  distanceText: {
    fontSize: 13,
    color: '#6B7280',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cashbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cashbackText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2240',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C06A',
  },
  activityText: {
    fontSize: 12,
    color: '#6B7280',
  },
  payNowButton: {
    backgroundColor: '#00C06A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  payNowText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default HotRightNow;
