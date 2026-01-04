import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import tournamentApi, { Tournament, TournamentLeaderboardEntry } from '../../services/tournamentApi';

const TournamentDetail = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = false; // Force white theme
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : params.id?.toString() || '1';

  const [loading, setLoading] = useState(true);
  const [tournamentData, setTournamentData] = useState<Tournament | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<TournamentLeaderboardEntry[]>([]);
  const [myRankData, setMyRankData] = useState<{ rank: number; score: number } | null>(null);

  // Fetch tournament data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentRes, leaderboardRes, myRankRes] = await Promise.all([
          tournamentApi.getTournamentById(id),
          tournamentApi.getTournamentLeaderboard(id, 5),
          tournamentApi.getMyRankInTournament(id)
        ]);

        if (tournamentRes.data) {
          setTournamentData(tournamentRes.data);
        }
        if (leaderboardRes.data) {
          setLeaderboardData(leaderboardRes.data);
        }
        if (myRankRes.data) {
          setMyRankData({
            rank: myRankRes.data.rank,
            score: myRankRes.data.score
          });
        }
      } catch (error) {
        console.error('Error fetching tournament data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const tournaments: { [key: string]: any } = {
    '1': {
      title: 'Weekend Shopping Sprint',
      description: 'Shop the most and win the grand prize!',
      prize: '₹10,000',
      prizeBreakdown: [
        { rank: '1st Place', prize: '₹10,000', icon: '🥇' },
        { rank: '2nd Place', prize: '₹5,000', icon: '🥈' },
        { rank: '3rd Place', prize: '₹2,500', icon: '🥉' },
        { rank: '4th-10th', prize: '1,000 coins each', icon: '🎁' }
      ],
      participants: 1247,
      endsIn: '2d 5h',
      status: 'Live',
      myRank: 23,
      myPoints: 4560,
      icon: '🏆',
      colors: ['#F59E0B', '#EAB308'],
      rules: [
        'Make purchases at partner stores',
        'Earn 10 points per ₹100 spent',
        'Bonus 2x points on weekends',
        'Top 10 participants win prizes'
      ]
    },
    '2': {
      title: 'Coin Master Challenge',
      description: 'Collect the most coins through various activities!',
      prize: '50,000 coins',
      prizeBreakdown: [
        { rank: '1st Place', prize: '50,000 coins', icon: '🥇' },
        { rank: '2nd Place', prize: '30,000 coins', icon: '🥈' },
        { rank: '3rd Place', prize: '15,000 coins', icon: '🥉' },
        { rank: '4th-20th', prize: '2,000 coins each', icon: '🎁' }
      ],
      participants: 892,
      endsIn: '5d',
      status: 'Live',
      myRank: 45,
      myPoints: 12340,
      icon: '🪙',
      colors: ['#10B981', '#059669'],
      rules: [
        'Complete any earning activities',
        'Coins earned = tournament points',
        'All coin types count',
        'Top 20 participants win bonus coins'
      ]
    },
    '3': {
      title: 'Referral Rally',
      description: 'Refer the most friends and climb the leaderboard!',
      prize: '₹5,000',
      prizeBreakdown: [
        { rank: '1st Place', prize: '₹5,000', icon: '🥇' },
        { rank: '2nd Place', prize: '₹3,000', icon: '🥈' },
        { rank: '3rd Place', prize: '₹1,500', icon: '🥉' },
        { rank: '4th-15th', prize: '500 coins each', icon: '🎁' }
      ],
      participants: 543,
      endsIn: '1d 12h',
      status: 'Ending Soon',
      myRank: 12,
      myPoints: 8,
      icon: '👥',
      colors: ['#EC4899', '#A855F7'],
      rules: [
        'Refer friends using your code',
        '1 point per successful referral',
        'Friend must complete first transaction',
        'Top 15 participants win prizes'
      ]
    }
  };

  const tournament = tournaments[id] || tournaments['1'];

  const leaderboard = [
    { rank: 1, name: 'Priya Sharma', points: 15678, avatar: '👩', change: '+2' },
    { rank: 2, name: 'Rahul Kumar', points: 14892, avatar: '👨', change: '-1' },
    { rank: 3, name: 'Anjali Patel', points: 13456, avatar: '👩', change: '+1' },
    { rank: 4, name: 'Amit Singh', points: 11234, avatar: '👨', change: '0' },
    { rank: 5, name: 'Sneha Verma', points: 9876, avatar: '👩', change: '+3' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#FFF' }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)' }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#111827'} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#111827' }]}>{tournament.title}</Text>
              <Text style={[styles.headerSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {tournament.participants.toLocaleString()} participants
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Hero Banner */}
          <LinearGradient
            colors={tournament.colors}
            style={styles.heroBanner}
          >
            <View style={styles.heroHeader}>
              <View style={styles.heroTitleRow}>
                <Text style={styles.heroIcon}>{tournament.icon}</Text>
                <View style={[styles.statusBadge, tournament.status === 'Ending Soon' && { backgroundColor: 'rgba(239, 68, 68, 0.3)' }]}>
                  <Text style={styles.statusText}>{tournament.status}</Text>
                </View>
              </View>
              <Text style={styles.heroTitle}>{tournament.title}</Text>
              <Text style={styles.heroDescription}>{tournament.description}</Text>
            </View>

            <View style={styles.heroStats}>
              <View style={styles.heroStatCard}>
                <View style={styles.heroStatHeader}>
                  <Ionicons name="trophy" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.heroStatLabel}>Grand Prize</Text>
                </View>
                <Text style={styles.heroStatValue}>{tournament.prize}</Text>
              </View>
              <View style={styles.heroStatCard}>
                <View style={styles.heroStatHeader}>
                  <Ionicons name="time" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.heroStatLabel}>Ends In</Text>
                </View>
                <Text style={styles.heroStatValue}>{tournament.endsIn}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* My Rank */}
          <LinearGradient
            colors={isDark ? ['rgba(59, 130, 246, 0.1)', 'rgba(168, 85, 247, 0.1)'] : ['#EFF6FF', '#F3E8FF']}
            style={[styles.myRankCard, { borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE' }]}
          >
            <View style={styles.myRankContent}>
              <View>
                <Text style={[styles.myRankLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Your Current Rank</Text>
                <Text style={[styles.myRankValue, { color: isDark ? '#FFF' : '#111827' }]}>#{tournament.myRank}</Text>
              </View>
              <View style={styles.myRankRight}>
                <Text style={[styles.myRankLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Your Points</Text>
                <Text style={[styles.myPointsValue, { color: '#3B82F6' }]}>{tournament.myPoints.toLocaleString()}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Prize Breakdown */}
          <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="gift" size={20} color="#F59E0B" />
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111827' }]}>Prize Breakdown</Text>
            </View>
            <View style={styles.prizeList}>
              {tournament.prizeBreakdown.map((prize: any, idx: number) => (
                <View key={idx} style={[styles.prizeItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }]}>
                  <View style={styles.prizeLeft}>
                    <Text style={styles.prizeIcon}>{prize.icon}</Text>
                    <Text style={[styles.prizeRank, { color: isDark ? '#FFF' : '#111827' }]}>{prize.rank}</Text>
                  </View>
                  <Text style={styles.prizeAmount}>{prize.prize}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Rules */}
          <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="locate" size={20} color="#3B82F6" />
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111827' }]}>Tournament Rules</Text>
            </View>
            <View style={styles.rulesList}>
              {tournament.rules.map((rule: string, idx: number) => (
                <View key={idx} style={styles.ruleItem}>
                  <View style={[styles.ruleNumber, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                    <Text style={styles.ruleNumberText}>{idx + 1}</Text>
                  </View>
                  <Text style={[styles.ruleText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{rule}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Leaderboard */}
          <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="ribbon" size={20} color="#F59E0B" />
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111827' }]}>Top 5 Leaderboard</Text>
            </View>
            <View style={styles.leaderboardList}>
              {leaderboard.map((player) => {
                const changeColor = player.change.startsWith('+') ? '#10B981' : player.change.startsWith('-') ? '#EF4444' : (isDark ? '#9CA3AF' : '#6B7280');
                const changeBg = player.change.startsWith('+') ? 'rgba(16, 185, 129, 0.2)' : player.change.startsWith('-') ? 'rgba(239, 68, 68, 0.2)' : (isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB');
                return (
                  <View key={player.rank} style={[styles.leaderboardItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }]}>
                    <Text style={[styles.leaderboardRank, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>#{player.rank}</Text>
                    <LinearGradient colors={['#A855F7', '#EC4899']} style={styles.avatarContainer}>
                      <Text style={styles.avatar}>{player.avatar}</Text>
                    </LinearGradient>
                    <View style={styles.leaderboardInfo}>
                      <Text style={[styles.leaderboardName, { color: isDark ? '#FFF' : '#111827' }]}>{player.name}</Text>
                      <Text style={[styles.leaderboardPoints, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        {player.points.toLocaleString()} points
                      </Text>
                    </View>
                    <View style={[styles.changeBadge, { backgroundColor: changeBg }]}>
                      <Text style={[styles.changeText, { color: changeColor }]}>{player.change}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity onPress={() => router.push('/playandearn')} style={styles.ctaButton}>
            <LinearGradient colors={['#3B82F6', '#A855F7']} style={styles.ctaGradient}>
              <Ionicons name="flash" size={20} color="#FFF" />
              <Text style={styles.ctaText}>Start Earning Points</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  heroBanner: {
    padding: 24,
    borderRadius: 16,
  },
  heroHeader: {
    marginBottom: 16,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  heroIcon: {
    fontSize: 32,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  heroStats: {
    flexDirection: 'row',
    gap: 12,
  },
  heroStatCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  heroStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  myRankCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  myRankContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myRankLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  myRankValue: {
    fontSize: 32,
    fontWeight: '600',
  },
  myRankRight: {
    alignItems: 'flex-end',
  },
  myPointsValue: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  prizeList: {
    gap: 12,
  },
  prizeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  prizeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prizeIcon: {
    fontSize: 24,
  },
  prizeRank: {
    fontSize: 14,
    fontWeight: '500',
  },
  prizeAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  rulesList: {
    gap: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  ruleNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  ruleText: {
    fontSize: 14,
    flex: 1,
  },
  leaderboardList: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    borderRadius: 12,
  },
  leaderboardRank: {
    fontSize: 18,
    fontWeight: '600',
    width: 32,
    textAlign: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    fontSize: 20,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  leaderboardPoints: {
    fontSize: 12,
  },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default TournamentDetail;

