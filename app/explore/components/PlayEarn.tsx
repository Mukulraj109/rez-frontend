import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const playEarnActivities = [
  {
    id: 'checkin',
    title: 'Daily Check-in',
    description: 'Check in daily to earn rewards',
    icon: 'checkmark-circle',
    reward: '10 coins',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#2563EB'],
    path: '/playandearn',
    streak: 5,
  },
  {
    id: 'spin',
    title: 'Spin & Win',
    description: 'Spin the wheel for surprises',
    icon: 'gift',
    reward: 'Up to ₹500',
    color: '#A855F7',
    gradient: ['#A855F7', '#7C3AED'],
    path: '/playandearn',
    spinsLeft: 2,
  },
  {
    id: 'quiz',
    title: 'Daily Quiz',
    description: 'Answer questions, win coins',
    icon: 'help-circle',
    reward: '25 coins',
    color: '#F97316',
    gradient: ['#F97316', '#EA580C'],
    path: '/playandearn',
    available: true,
  },
  {
    id: 'review',
    title: 'Review & Earn',
    description: 'Share your experience',
    icon: 'star',
    reward: '50 coins',
    color: '#10B981',
    gradient: ['#10B981', '#059669'],
    path: '/playandearn',
    pending: 3,
  },
];

const PlayEarn = () => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.sectionTitle}>Play & Earn</Text>
            <Text style={styles.gameEmoji}>🎮</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Fun ways to earn more rewards</Text>
        </View>
        <TouchableOpacity onPress={() => navigateTo('/playandearn')}>
          <Text style={styles.viewAllText}>View all →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.activitiesContainer}
      >
        {playEarnActivities.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            style={styles.activityCard}
            onPress={() => navigateTo(activity.path)}
          >
            <LinearGradient
              colors={activity.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Ionicons name={activity.icon as any} size={28} color="#FFFFFF" />
              </View>

              {/* Content */}
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDescription}>{activity.description}</Text>

              {/* Reward Badge */}
              <View style={styles.rewardBadge}>
                <Ionicons name="gift-outline" size={12} color="#FFFFFF" />
                <Text style={styles.rewardText}>{activity.reward}</Text>
              </View>

              {/* Status Indicators */}
              {activity.streak && (
                <View style={styles.statusBadge}>
                  <Ionicons name="flame" size={12} color="#F97316" />
                  <Text style={styles.statusText}>{activity.streak} day streak!</Text>
                </View>
              )}
              {activity.spinsLeft && (
                <View style={styles.statusBadge}>
                  <Ionicons name="refresh" size={12} color="#FFFFFF" />
                  <Text style={styles.statusText}>{activity.spinsLeft} spins left</Text>
                </View>
              )}
              {activity.available && (
                <View style={[styles.statusBadge, styles.availableBadge]}>
                  <Ionicons name="checkmark-circle" size={12} color="#00C06A" />
                  <Text style={[styles.statusText, styles.availableText]}>Available now!</Text>
                </View>
              )}
              {activity.pending && (
                <View style={styles.statusBadge}>
                  <Ionicons name="time" size={12} color="#FFFFFF" />
                  <Text style={styles.statusText}>{activity.pending} pending</Text>
                </View>
              )}

              {/* Play Button */}
              <View style={styles.playButton}>
                <Text style={styles.playButtonText}>Play Now</Text>
                <Ionicons name="arrow-forward" size={14} color={activity.color} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Daily Coins Summary */}
      <View style={styles.coinsSummary}>
        <View style={styles.coinsLeft}>
          <Text style={styles.coinsIcon}>🪙</Text>
          <View>
            <Text style={styles.coinsEarned}>135 coins earned today</Text>
            <Text style={styles.coinsTarget}>50 more to reach daily goal</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '73%' }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
  },
  gameEmoji: {
    fontSize: 18,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 13,
    color: '#00C06A',
    fontWeight: '600',
  },
  activitiesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  activityCard: {
    width: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
  },
  cardGradient: {
    padding: 14,
    minHeight: 200,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
  },
  availableBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  availableText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 'auto',
    gap: 6,
  },
  playButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B2240',
  },
  coinsSummary: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
  },
  coinsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  coinsIcon: {
    fontSize: 24,
  },
  coinsEarned: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  coinsTarget: {
    fontSize: 11,
    color: '#B45309',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(146, 64, 14, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D97706',
    borderRadius: 3,
  },
});

export default PlayEarn;
