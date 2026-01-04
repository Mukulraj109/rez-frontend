import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import programApi from '../../services/programApi';

const { width } = Dimensions.get('window');

const CorporateEmployee = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = false; // Force white theme
  const [activeTab, setActiveTab] = useState('challenges');
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<any[]>([]);

  // Fetch corporate programs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const programsRes = await programApi.getCorporatePrograms();
        if (programsRes.data) {
          setPrograms(programsRes.data);
        }
      } catch (error) {
        console.error('Error fetching corporate programs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const employeeChallenges = [
    {
      id: 1,
      title: 'Team Lunch Challenge',
      type: 'team',
      icon: 'cafe',
      reward: 300,
      brandedReward: 200,
      progress: 3,
      total: 5,
      difficulty: 'Easy',
      deadline: '15 days left',
      description: 'Order team lunch 5 times this month using ReZ',
      participants: 12,
      status: 'active'
    },
    {
      id: 2,
      title: 'Wellness Wednesday',
      type: 'wellness',
      icon: 'heart',
      reward: 500,
      brandedReward: 0,
      progress: 2,
      total: 4,
      difficulty: 'Medium',
      deadline: 'Monthly',
      description: 'Book health checkup or gym session via ReZ',
      requirements: ['Healthcare or Fitness category', 'Minimum ₹500 booking', 'Valid invoice'],
      status: 'active'
    },
    {
      id: 3,
      title: 'Refer Colleagues',
      type: 'referral',
      icon: 'people',
      reward: 200,
      brandedReward: 100,
      progress: 8,
      total: 10,
      difficulty: 'Medium',
      deadline: '30 days left',
      description: 'Get 10 colleagues to join ReZ and transact',
      bonus: 'Extra 500 coins for completion',
      status: 'active'
    },
    {
      id: 4,
      title: 'Office Supplies Saver',
      type: 'shopping',
      icon: 'bag',
      reward: 400,
      brandedReward: 300,
      progress: 0,
      total: 1,
      difficulty: 'Easy',
      deadline: '20 days left',
      description: 'Purchase office supplies worth ₹2000+ via ReZ partners',
      requirements: ['Electronics/Stationery category', 'Single or multiple orders', 'Min ₹2000 value'],
      status: 'available'
    },
    {
      id: 5,
      title: 'Team Building Event',
      type: 'event',
      icon: 'trophy',
      reward: 1000,
      brandedReward: 800,
      progress: 0,
      total: 1,
      difficulty: 'Hard',
      deadline: '45 days',
      description: 'Organize team outing/event with min 20 colleagues via ReZ',
      requirements: ['Minimum 20 participants', 'Event/Travel category', 'Company approval', 'Photo proof'],
      featured: true,
      status: 'available'
    },
    {
      id: 6,
      title: 'Friday Treats',
      type: 'food',
      icon: 'cafe',
      reward: 150,
      brandedReward: 100,
      progress: 1,
      total: 4,
      difficulty: 'Easy',
      deadline: 'Weekly',
      description: 'Order snacks/beverages for team every Friday',
      status: 'active'
    }
  ];

  const companyPerks = [
    {
      company: 'Accenture',
      logo: '🏢',
      bgColor: ['rgba(59, 130, 246, 0.2)', 'rgba(168, 85, 247, 0.2)'],
      borderColor: 'rgba(59, 130, 246, 0.3)',
      perks: [
        { type: 'Bonus Coins', value: '+20% on all purchases', icon: 'cash' },
        { type: 'Exclusive Deals', value: 'Corporate-only offers', icon: 'star' },
        { type: 'Team Rewards', value: 'Group purchase bonuses', icon: 'people' }
      ],
      enrolled: true
    },
    {
      company: 'TCS',
      logo: '💼',
      bgColor: ['rgba(34, 197, 94, 0.2)', 'rgba(20, 184, 166, 0.2)'],
      borderColor: 'rgba(34, 197, 94, 0.3)',
      perks: [
        { type: 'Wellness Bonus', value: '+500 coins/month', icon: 'heart' },
        { type: 'Food Discounts', value: '25% extra on F&B', icon: 'cafe' },
        { type: 'Events', value: 'Quarterly meetups', icon: 'calendar' }
      ],
      enrolled: false
    }
  ];

  const teamLeaderboard = [
    { rank: 1, name: 'Marketing Team', members: 24, totalCoins: 45600, avgPerPerson: 1900 },
    { rank: 2, name: 'Sales Team', members: 18, totalCoins: 38900, avgPerPerson: 2161 },
    { rank: 3, name: 'Engineering Team', members: 32, totalCoins: 52400, avgPerPerson: 1638 },
    { rank: 4, name: 'Your Team (HR)', members: 12, totalCoins: 18340, avgPerPerson: 1528, highlight: true }
  ];

  const individualLeaderboard = [
    { rank: 1, name: 'Rajesh Kumar', team: 'Sales', coins: 8900 },
    { rank: 2, name: 'Sneha Patel', team: 'Marketing', coins: 7600 },
    { rank: 3, name: 'Amit Sharma', team: 'Engineering', coins: 6800 },
    { rank: 4, name: 'You', team: 'HR', coins: 3420, highlight: true }
  ];

  const tabs = [
    { id: 'challenges', label: 'Challenges', count: employeeChallenges.filter(c => c.status === 'active' || c.status === 'available').length },
    { id: 'company-perks', label: 'Company Perks', icon: 'business' },
    { id: 'team-board', label: 'Team Board', icon: 'people' },
    { id: 'individual-board', label: 'Leaderboard', icon: 'trophy' }
  ];

  const myStats = {
    totalEarned: 3420,
    challengesCompleted: 12,
    teamRank: 4,
    individualRank: 4,
    thisMonthEarned: 850,
    referrals: 8
  };

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'Medium':
        return { color: '#F97316', bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.3)' };
      case 'Hard':
        return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' };
      default:
        return { color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)', border: 'rgba(107, 114, 128, 0.3)' };
    }
  };

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
              <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#111827' }]}>Corporate Hub</Text>
              <Text style={[styles.headerSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Employee challenges & rewards</Text>
            </View>
            <View style={styles.coinBadge}>
              <Ionicons name="cash" size={16} color="#10B981" />
              <Text style={styles.coinText}>{myStats.totalEarned}</Text>
            </View>
          </View>
        </View>

        {/* Hero Stats */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={isDark ? ['rgba(59, 130, 246, 0.1)', 'rgba(168, 85, 247, 0.1)', 'rgba(236, 72, 153, 0.1)'] : ['rgba(59, 130, 246, 0.1)', 'rgba(168, 85, 247, 0.1)', 'rgba(236, 72, 153, 0.1)']}
            style={[styles.heroCard, { borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)' }]}
          >
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF' }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                  <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Completed</Text>
                </View>
                <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>{myStats.challengesCompleted}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF' }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="trophy" size={16} color="#F59E0B" />
                  <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Rank</Text>
                </View>
                <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>#{myStats.individualRank}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF' }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="people" size={16} color="#A855F7" />
                  <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Referrals</Text>
                </View>
                <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>{myStats.referrals}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF' }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="cash" size={16} color="#10B981" />
                  <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>This Month</Text>
                </View>
                <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>+{myStats.thisMonthEarned}</Text>
              </View>
            </View>
            <View style={[styles.teamRankCard, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)', borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)' }]}>
              <Text style={[styles.teamRankLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Your Team Rank</Text>
              <Text style={[styles.teamRankValue, { color: '#3B82F6' }]}>#{myStats.teamRank} - HR Team</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tab,
                { backgroundColor: activeTab === tab.id ? '#3B82F6' : isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }
              ]}
            >
              {tab.icon && <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.id ? '#FFF' : (isDark ? '#9CA3AF' : '#6B7280')} />}
              <Text style={[styles.tabText, { color: activeTab === tab.id ? '#FFF' : (isDark ? '#9CA3AF' : '#6B7280') }]}>
                {tab.label} {tab.count !== undefined && `(${tab.count})`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <View style={styles.content}>
            {employeeChallenges.map((challenge) => {
              const difficultyStyle = getDifficultyStyle(challenge.difficulty);
              return (
                <View key={challenge.id} style={[styles.challengeCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                  <View style={styles.challengeHeader}>
                    <View style={[styles.challengeIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                      <Ionicons name={challenge.icon as any} size={28} color="#3B82F6" />
                    </View>
                    <View style={styles.challengeInfo}>
                      <View style={styles.challengeBadges}>
                        <View style={[styles.badge, { backgroundColor: difficultyStyle.bg, borderColor: difficultyStyle.border }]}>
                          <Text style={[styles.badgeText, { color: difficultyStyle.color }]}>{challenge.difficulty}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
                          <Ionicons name="time" size={12} color={isDark ? '#9CA3AF' : '#6B7280'} />
                          <Text style={[styles.badgeText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{challenge.deadline}</Text>
                        </View>
                        {challenge.featured && (
                          <View style={[styles.badge, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                            <Ionicons name="sparkles" size={12} color="#F59E0B" />
                            <Text style={[styles.badgeText, { color: '#F59E0B' }]}>Featured</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.challengeTitle, { color: isDark ? '#FFF' : '#111827' }]}>{challenge.title}</Text>
                      <Text style={[styles.challengeDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{challenge.description}</Text>
                    </View>
                  </View>

                  {challenge.status === 'active' && (
                    <View style={[styles.progressContainer, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF', borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE' }]}>
                      <View style={styles.progressHeader}>
                        <Text style={[styles.progressLabel, { color: isDark ? '#93C5FD' : '#1E40AF' }]}>Progress</Text>
                        <Text style={[styles.progressValue, { color: isDark ? '#60A5FA' : '#2563EB' }]}>
                          {challenge.progress}/{challenge.total}
                        </Text>
                      </View>
                      <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                        <LinearGradient
                          colors={['#3B82F6', '#A855F7']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.progressFill, { width: `${(challenge.progress / challenge.total) * 100}%` }]}
                        />
                      </View>
                    </View>
                  )}

                  {challenge.requirements && (
                    <View style={[styles.requirementsContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }]}>
                      <Text style={[styles.requirementsTitle, { color: isDark ? '#FFF' : '#111827' }]}>Requirements:</Text>
                      {challenge.requirements.map((req, idx) => (
                        <View key={idx} style={styles.requirementItem}>
                          <View style={[styles.requirementDot, { backgroundColor: '#3B82F6' }]} />
                          <Text style={[styles.requirementText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{req}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {challenge.bonus && (
                    <View style={[styles.bonusContainer, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFF7ED', borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FED7AA' }]}>
                      <Ionicons name="gift" size={16} color="#F59E0B" />
                      <Text style={[styles.bonusText, { color: '#F59E0B' }]}>{challenge.bonus}</Text>
                    </View>
                  )}

                  {challenge.participants && (
                    <View style={styles.participantsContainer}>
                      <Ionicons name="people" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                      <Text style={[styles.participantsText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        {challenge.participants} team members participating
                      </Text>
                    </View>
                  )}

                  <View style={styles.challengeFooter}>
                    <View style={styles.rewardsContainer}>
                      <View style={styles.rewardItem}>
                        <Ionicons name="cash" size={20} color="#10B981" />
                        <Text style={styles.rewardText}>+{challenge.reward}</Text>
                      </View>
                      {challenge.brandedReward > 0 && (
                        <View style={styles.rewardItem}>
                          <Ionicons name="bag" size={20} color="#A855F7" />
                          <Text style={[styles.rewardText, { color: '#A855F7' }]}>+{challenge.brandedReward}</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity style={styles.startButton}>
                      <LinearGradient colors={['#3B82F6', '#A855F7']} style={styles.startButtonGradient}>
                        <Text style={styles.startButtonText}>
                          {challenge.status === 'active' ? 'Continue' : 'Start'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Company Perks Tab */}
        {activeTab === 'company-perks' && (
          <View style={styles.content}>
            {companyPerks.map((company, idx) => (
              <View key={idx} style={[styles.companyCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                <LinearGradient
                  colors={company.bgColor}
                  style={[styles.companyHeader, { borderColor: company.borderColor }]}
                >
                  <View style={styles.companyHeaderContent}>
                    <View style={[styles.companyLogoContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.9)' : '#FFF' }]}>
                      <Text style={styles.companyLogo}>{company.logo}</Text>
                    </View>
                    <View style={styles.companyInfo}>
                      <Text style={[styles.companyName, { color: isDark ? '#FFF' : '#111827' }]}>{company.company}</Text>
                      {company.enrolled && (
                        <View style={styles.enrolledBadge}>
                          <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                          <Text style={styles.enrolledText}>Enrolled</Text>
                        </View>
                      )}
                    </View>
                    {!company.enrolled && (
                      <TouchableOpacity style={styles.enrollButton}>
                        <Text style={styles.enrollButtonText}>Enroll</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </LinearGradient>

                <View style={styles.perksList}>
                  {company.perks.map((perk, perkIdx) => (
                    <View key={perkIdx} style={[styles.perkItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }]}>
                      <View style={[styles.perkIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                        <Ionicons name={perk.icon as any} size={20} color="#3B82F6" />
                      </View>
                      <View style={styles.perkInfo}>
                        <Text style={[styles.perkType, { color: isDark ? '#FFF' : '#111827' }]}>{perk.type}</Text>
                        <Text style={[styles.perkValue, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{perk.value}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            <View style={[styles.ctaCard, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF', borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE' }]}>
              <Ionicons name="business" size={48} color="#3B82F6" style={styles.ctaIcon} />
              <Text style={[styles.ctaTitle, { color: isDark ? '#FFF' : '#111827' }]}>Don't see your company?</Text>
              <Text style={[styles.ctaText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Request your HR to partner with ReZ for exclusive employee perks
              </Text>
              <TouchableOpacity style={styles.ctaButton}>
                <LinearGradient colors={['#3B82F6', '#A855F7']} style={styles.ctaButtonGradient}>
                  <Text style={styles.ctaButtonText}>Request Partnership</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Team Leaderboard Tab */}
        {activeTab === 'team-board' && (
          <View style={styles.content}>
            {teamLeaderboard.map((team) => (
              <View
                key={team.rank}
                style={[
                  styles.leaderboardCard,
                  team.highlight && { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5', borderColor: '#10B981', borderWidth: 2 },
                  !team.highlight && { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }
                ]}
              >
                <Text style={[styles.rankText, { color: isDark ? '#9CA3AF' : '#9CA3AF' }]}>#{team.rank}</Text>
                <View style={styles.leaderboardInfo}>
                  <Text style={[styles.teamName, { color: isDark ? '#FFF' : '#111827' }]}>{team.name}</Text>
                  <View style={styles.teamStats}>
                    <View style={styles.teamStat}>
                      <Ionicons name="people" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                      <Text style={[styles.teamStatText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{team.members} members</Text>
                    </View>
                    <View style={styles.teamStat}>
                      <Ionicons name="trending-up" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                      <Text style={[styles.teamStatText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{team.avgPerPerson} avg/person</Text>
                    </View>
                  </View>
                  <View style={styles.teamCoins}>
                    <Ionicons name="cash" size={20} color="#10B981" />
                    <Text style={styles.teamCoinsText}>{team.totalCoins.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Individual Leaderboard Tab */}
        {activeTab === 'individual-board' && (
          <View style={styles.content}>
            {individualLeaderboard.map((person) => (
              <View
                key={person.rank}
                style={[
                  styles.leaderboardCard,
                  person.highlight && { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5', borderColor: '#10B981', borderWidth: 2 },
                  !person.highlight && { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }
                ]}
              >
                <Text style={[styles.rankText, { color: isDark ? '#9CA3AF' : '#9CA3AF' }]}>#{person.rank}</Text>
                <View style={styles.leaderboardInfo}>
                  <Text style={[styles.personName, { color: isDark ? '#FFF' : '#111827' }]}>{person.name}</Text>
                  <Text style={[styles.personTeam, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{person.team}</Text>
                </View>
                <View style={styles.personCoins}>
                  <Ionicons name="cash" size={16} color="#10B981" />
                  <Text style={styles.personCoinsText}>{person.coins.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

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
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  coinText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  heroSection: {
    padding: 16,
  },
  heroCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: (width - 64) / 2,
    padding: 12,
    borderRadius: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  teamRankCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  teamRankLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  teamRankValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  tabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  challengeCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  challengeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 12,
  },
  progressContainer: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  requirementsContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  requirementText: {
    fontSize: 12,
    flex: 1,
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  bonusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  participantsText: {
    fontSize: 12,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  companyCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  companyHeader: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  companyHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  companyLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyLogo: {
    fontSize: 24,
  },
  companyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  enrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  enrolledText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10B981',
  },
  enrollButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
  },
  enrollButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  perksList: {
    gap: 12,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  perkIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkInfo: {
    flex: 1,
  },
  perkType: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  perkValue: {
    fontSize: 12,
  },
  ctaCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  ctaIcon: {
    marginBottom: 12,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  ctaButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  rankText: {
    fontSize: 20,
    fontWeight: '600',
    width: 40,
    textAlign: 'center',
  },
  leaderboardInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  teamStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  teamStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teamStatText: {
    fontSize: 12,
  },
  teamCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teamCoinsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
  personName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  personTeam: {
    fontSize: 12,
  },
  personCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  personCoinsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
});

export default CorporateEmployee;

