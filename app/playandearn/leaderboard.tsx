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

const Leaderboard = () => {
  const router = useRouter();

  const topUsers = [
    { rank: 1, name: 'Priya Sharma', coins: 15420, avatar: '👑', trend: '+245' },
    { rank: 2, name: 'Rahul Kumar', coins: 14850, avatar: '🥈', trend: '+180' },
    { rank: 3, name: 'Ananya Patel', coins: 13990, avatar: '🥉', trend: '+220' },
    { rank: 4, name: 'Vikram Singh', coins: 12750, avatar: '🎯', trend: '+150' },
    { rank: 5, name: 'Sneha Reddy', coins: 11280, avatar: '⭐', trend: '+195' },
    { rank: 6, name: 'Amit Verma', coins: 10940, avatar: '🔥', trend: '+140' },
    { rank: 7, name: 'Kavya Iyer', coins: 10520, avatar: '💎', trend: '+175' },
    { rank: 8, name: 'Rohan Gupta', coins: 9870, avatar: '🚀', trend: '+130' },
    { rank: 9, name: 'Meera Desai', coins: 9450, avatar: '✨', trend: '+160' },
    { rank: 10, name: 'Arjun Nair', coins: 8990, avatar: '⚡', trend: '+145' },
  ];

  const myRank = { rank: 147, name: 'You', coins: 2480, trend: '+85' };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <Ionicons name="trophy" size={24} color="#F59E0B" />;
    if (rank === 2) return <Ionicons name="medal" size={24} color="#9CA3AF" />;
    if (rank === 3) return <Ionicons name="medal" size={24} color="#F97316" />;
    return <Text style={styles.rankNumber}>#{rank}</Text>;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>🏆 Weekly Leaderboard</Text>
          <Text style={styles.headerSubtitle}>Top earners this week</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Prize Banner */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#A855F720', '#EC489920']}
            style={styles.prizeBanner}
          >
            <Ionicons name="trophy" size={48} color="#F59E0B" />
            <Text style={styles.prizeTitle}>Weekly Prizes</Text>
            <View style={styles.prizeGrid}>
              <View style={styles.prizeItem}>
                <Text style={styles.prizeLabel}>1st Place</Text>
                <Text style={[styles.prizeValue, { color: '#F59E0B' }]}>₹5,000</Text>
              </View>
              <View style={styles.prizeItem}>
                <Text style={styles.prizeLabel}>2-10th</Text>
                <Text style={[styles.prizeValue, { color: '#A855F7' }]}>₹1,000</Text>
              </View>
              <View style={styles.prizeItem}>
                <Text style={styles.prizeLabel}>11-100th</Text>
                <Text style={[styles.prizeValue, { color: '#3B82F6' }]}>500 coins</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Top 3 Podium */}
        <View style={styles.podiumContainer}>
          {/* 2nd Place */}
          <View style={styles.podiumItem}>
            <View style={[styles.podiumAvatar, styles.podiumSecond]}>
              <Text style={styles.podiumAvatarText}>{topUsers[1].avatar}</Text>
            </View>
            <Text style={styles.podiumName}>{topUsers[1].name.split(' ')[0]}</Text>
            <Text style={styles.podiumCoins}>{topUsers[1].coins.toLocaleString()}</Text>
            <View style={[styles.podiumBar, { height: 80, backgroundColor: 'rgba(156,163,175,0.2)' }]}>
              <Text style={styles.podiumMedal}>🥈</Text>
            </View>
          </View>

          {/* 1st Place */}
          <View style={styles.podiumItem}>
            <Ionicons name="trophy" size={24} color="#F59E0B" style={{ marginBottom: 4 }} />
            <View style={[styles.podiumAvatar, styles.podiumFirst]}>
              <Text style={styles.podiumAvatarTextLarge}>{topUsers[0].avatar}</Text>
            </View>
            <Text style={styles.podiumName}>{topUsers[0].name.split(' ')[0]}</Text>
            <Text style={[styles.podiumCoins, { color: '#F59E0B', fontWeight: 'bold' }]}>
              {topUsers[0].coins.toLocaleString()}
            </Text>
            <LinearGradient
              colors={['rgba(245,158,11,0.3)', 'rgba(245,158,11,0.1)']}
              style={[styles.podiumBar, { height: 112 }]}
            >
              <Text style={styles.podiumTrophy}>🏆</Text>
            </LinearGradient>
          </View>

          {/* 3rd Place */}
          <View style={styles.podiumItem}>
            <View style={[styles.podiumAvatar, styles.podiumThird]}>
              <Text style={styles.podiumAvatarText}>{topUsers[2].avatar}</Text>
            </View>
            <Text style={styles.podiumName}>{topUsers[2].name.split(' ')[0]}</Text>
            <Text style={styles.podiumCoins}>{topUsers[2].coins.toLocaleString()}</Text>
            <View style={[styles.podiumBar, { height: 64, backgroundColor: 'rgba(249,115,22,0.2)' }]}>
              <Text style={styles.podiumMedal}>🥉</Text>
            </View>
          </View>
        </View>

        {/* Full Rankings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Rankings</Text>
          {topUsers.map((user) => (
            <View key={user.rank} style={styles.rankCard}>
              <View style={styles.rankPosition}>
                {getRankDisplay(user.rank)}
              </View>
              <Text style={styles.rankAvatar}>{user.avatar}</Text>
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>{user.name}</Text>
                <Text style={styles.rankCoinsText}>{user.coins.toLocaleString()} coins</Text>
              </View>
              <View style={styles.trendContainer}>
                <Ionicons name="trending-up" size={16} color="#22C55E" />
                <Text style={styles.trendText}>{user.trend}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Your Rank */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#00C06A', '#14B8A6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.myRankCard}
          >
            <View style={styles.rankPosition}>
              <Text style={styles.myRankNumber}>#{myRank.rank}</Text>
            </View>
            <Text style={styles.rankAvatar}>👤</Text>
            <View style={styles.rankInfo}>
              <Text style={styles.myRankName}>{myRank.name}</Text>
              <Text style={styles.myRankCoins}>{myRank.coins.toLocaleString()} coins</Text>
            </View>
            <View style={styles.trendContainer}>
              <Ionicons name="trending-up" size={16} color="#FFF" />
              <Text style={styles.myTrendText}>{myRank.trend}</Text>
            </View>
          </LinearGradient>
          <Text style={styles.motivationText}>
            Earn {(11280 - myRank.coins).toLocaleString()} more to reach Top 100!
          </Text>
        </View>

        {/* Motivational CTAs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Climb the Leaderboard!</Text>
          <Text style={styles.sectionSubtitle}>Complete these actions to earn more coins</Text>

          <TouchableOpacity onPress={() => router.push('/playandearn' as any)}>
            <LinearGradient
              colors={['#F59E0B20', '#EAB30820']}
              style={styles.ctaCard}
            >
              <View style={[styles.ctaIcon, { backgroundColor: '#F59E0B30' }]}>
                <Ionicons name="locate" size={20} color="#F59E0B" />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>Daily Challenges</Text>
                <Text style={styles.ctaDesc}>Complete tasks & earn up to 500 coins/day</Text>
              </View>
              <View style={[styles.ctaBadge, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.ctaBadgeText}>+500</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/refer' as any)}>
            <LinearGradient
              colors={['#A855F720', '#EC489920']}
              style={styles.ctaCard}
            >
              <View style={[styles.ctaIcon, { backgroundColor: '#A855F730' }]}>
                <Ionicons name="gift" size={20} color="#A855F7" />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>Refer & Earn Big</Text>
                <Text style={styles.ctaDesc}>Get 1000 coins for each friend you invite</Text>
              </View>
              <View style={[styles.ctaBadge, { backgroundColor: '#A855F7' }]}>
                <Text style={styles.ctaBadgeText}>+1000</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/mall' as any)}>
            <LinearGradient
              colors={['#3B82F620', '#06B6D420']}
              style={styles.ctaCard}
            >
              <View style={[styles.ctaIcon, { backgroundColor: '#3B82F630' }]}>
                <Ionicons name="rocket" size={20} color="#3B82F6" />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>Shop & Earn</Text>
                <Text style={styles.ctaDesc}>Earn coins on every purchase you make</Text>
              </View>
              <View style={[styles.ctaBadge, { backgroundColor: '#3B82F6' }]}>
                <Text style={styles.ctaBadgeText}>Up to 10%</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Motivational Message */}
          <LinearGradient
            colors={['#00C06A15', '#14B8A615']}
            style={styles.motivationalCard}
          >
            <Ionicons name="trophy" size={48} color="#F59E0B" />
            <Text style={styles.motivationalTitle}>You're on Your Way! 🚀</Text>
            <Text style={styles.motivationalText}>
              Complete daily tasks, refer friends, and shop smart to climb the ranks!
            </Text>
            <LinearGradient
              colors={['#00C06A', '#14B8A6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.keepGoingButton}
            >
              <Text style={styles.keepGoingText}>Keep Going!</Text>
              <Ionicons name="trending-up" size={16} color="#FFF" />
            </LinearGradient>
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  prizeBanner: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  prizeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 12,
    marginBottom: 16,
  },
  prizeGrid: {
    flexDirection: 'row',
    gap: 32,
  },
  prizeItem: {
    alignItems: 'center',
  },
  prizeLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  prizeValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
  },
  podiumAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  podiumFirst: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F59E0B30',
    borderWidth: 4,
    borderColor: 'rgba(245,158,11,0.5)',
  },
  podiumSecond: {
    backgroundColor: 'rgba(156,163,175,0.3)',
  },
  podiumThird: {
    backgroundColor: 'rgba(249,115,22,0.3)',
  },
  podiumAvatarText: {
    fontSize: 28,
  },
  podiumAvatarTextLarge: {
    fontSize: 36,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  podiumCoins: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumMedal: {
    fontSize: 24,
  },
  podiumTrophy: {
    fontSize: 28,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
    gap: 16,
  },
  rankPosition: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  rankAvatar: {
    fontSize: 28,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  rankCoinsText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  myRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  myRankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  myRankName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  myRankCoins: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  myTrendText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  motivationText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ctaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 2,
  },
  ctaDesc: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  ctaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  ctaBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  motivationalCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,192,106,0.2)',
  },
  motivationalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 12,
    marginBottom: 8,
  },
  motivationalText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  keepGoingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  keepGoingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default Leaderboard;
