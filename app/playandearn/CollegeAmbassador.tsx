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

const CollegeAmbassador = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = false; // Force white theme
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<any[]>([]);
  const [myPrograms, setMyPrograms] = useState<any[]>([]);

  // Fetch college programs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsRes, myProgramsRes] = await Promise.all([
          programApi.getCollegePrograms(),
          programApi.getMyPrograms()
        ]);

        if (programsRes.data) {
          setPrograms(programsRes.data);
        }
        if (myProgramsRes.data) {
          setMyPrograms(myProgramsRes.data.filter(p => p.type === 'college_ambassador'));
        }
      } catch (error) {
        console.error('Error fetching college programs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const ambassadorTasks = [
    {
      id: 1,
      title: 'Refer 10 New Students',
      type: 'referral',
      icon: 'people',
      reward: 500,
      brandedReward: 300,
      progress: 7,
      total: 10,
      difficulty: 'Medium',
      deadline: '7 days left',
      description: 'Get your friends to join ReZ and make their first transaction',
      status: 'active'
    },
    {
      id: 2,
      title: 'Host Campus Store Visit',
      type: 'event',
      icon: 'calendar',
      reward: 800,
      brandedReward: 500,
      progress: 0,
      total: 1,
      difficulty: 'Hard',
      deadline: '15 days left',
      description: 'Organize a group visit to partner stores with min 20 students',
      requirements: ['Minimum 20 students', 'Partner store approval', 'Photo proof'],
      status: 'available'
    },
    {
      id: 3,
      title: 'Share on Campus Groups',
      type: 'social',
      icon: 'share-social',
      reward: 100,
      brandedReward: 50,
      progress: 3,
      total: 5,
      difficulty: 'Easy',
      deadline: 'Daily',
      description: 'Share ReZ offers in your college WhatsApp/Telegram groups',
      status: 'active'
    },
    {
      id: 4,
      title: 'Campus Fest Participation',
      type: 'fest',
      icon: 'happy',
      reward: 1000,
      brandedReward: 800,
      progress: 0,
      total: 1,
      difficulty: 'Hard',
      deadline: '30 days',
      description: 'Set up ReZ stall at your college fest',
      requirements: ['College fest approval', 'Minimum 50 signups', 'Event photos', 'ReZ team support provided'],
      featured: true,
      status: 'available'
    },
    {
      id: 5,
      title: 'Student Discount Hunt',
      type: 'discovery',
      icon: 'locate',
      reward: 200,
      brandedReward: 150,
      progress: 5,
      total: 10,
      difficulty: 'Medium',
      deadline: '10 days left',
      description: 'Find and submit new student-friendly stores near campus',
      status: 'active'
    },
    {
      id: 6,
      title: 'Monthly Ambassador Meet',
      type: 'attendance',
      icon: 'school',
      reward: 300,
      brandedReward: 200,
      progress: 0,
      total: 1,
      difficulty: 'Easy',
      deadline: '5 days left',
      description: 'Attend monthly ambassador meet (online/offline)',
      status: 'available'
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Tech Fest 2025 - IIT Delhi',
      date: 'Jan 15-17, 2025',
      location: 'IIT Delhi Campus',
      participants: 45,
      maxParticipants: 50,
      reward: 2000,
      status: 'open',
      type: 'College Fest'
    },
    {
      id: 2,
      title: 'Fashion Week - NIFT',
      date: 'Jan 20-22, 2025',
      location: 'NIFT Bangalore',
      participants: 32,
      maxParticipants: 40,
      reward: 1500,
      status: 'open',
      type: 'Fashion Event'
    },
    {
      id: 3,
      title: 'Food Fest - DU North Campus',
      date: 'Jan 25, 2025',
      location: 'Delhi University',
      participants: 50,
      maxParticipants: 50,
      reward: 1200,
      status: 'full',
      type: 'Food Event'
    }
  ];

  const ambassadorPerks = [
    {
      icon: 'cash',
      title: 'Exclusive Rewards',
      description: 'Earn up to 10,000 coins/month',
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.2)'
    },
    {
      icon: 'gift',
      title: 'Free Products',
      description: 'Get free samples & merch',
      color: '#A855F7',
      bg: 'rgba(168, 85, 247, 0.2)'
    },
    {
      icon: 'ribbon',
      title: 'Certificate',
      description: 'Ambassador certificate for resume',
      color: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.2)'
    },
    {
      icon: 'star',
      title: 'Priority Access',
      description: 'Early access to new features',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.2)'
    }
  ];

  const leaderboard = [
    { rank: 1, name: 'Rohan Sharma', college: 'IIT Delhi', referrals: 234, coins: 45600 },
    { rank: 2, name: 'Priya Patel', college: 'BITS Pilani', referrals: 198, coins: 38900 },
    { rank: 3, name: 'Amit Kumar', college: 'DU North', referrals: 176, coins: 32400 },
    { rank: 4, name: 'You', college: 'Your College', referrals: 87, coins: 12340, highlight: true }
  ];

  const tabs = [
    { id: 'tasks', label: 'My Tasks', count: ambassadorTasks.filter(t => t.status === 'active' || t.status === 'available').length },
    { id: 'events', label: 'Events', count: upcomingEvents.filter(e => e.status === 'open').length },
    { id: 'leaderboard', label: 'Leaderboard', icon: 'trophy' },
    { id: 'perks', label: 'Perks', icon: 'gift' }
  ];

  const myStats = {
    totalReferrals: 87,
    totalEarned: 12340,
    currentRank: 4,
    eventsAttended: 5,
    thisMonthEarned: 2450,
    level: 'Silver Ambassador'
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
              <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#111827' }]}>College Ambassador</Text>
              <Text style={[styles.headerSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{myStats.level}</Text>
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
            style={styles.heroCard}
          >
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF' }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="people" size={16} color="#3B82F6" />
                  <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Referrals</Text>
                </View>
                <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>{myStats.totalReferrals}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF' }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="trophy" size={16} color="#F59E0B" />
                  <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Rank</Text>
                </View>
                <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>#{myStats.currentRank}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF' }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="calendar" size={16} color="#A855F7" />
                  <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Events</Text>
                </View>
                <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>{myStats.eventsAttended}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF' }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="cash" size={16} color="#10B981" />
                  <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>This Month</Text>
                </View>
                <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>+{myStats.thisMonthEarned}</Text>
              </View>
            </View>
            <View style={[styles.progressCard, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)' }]}>
              <Text style={[styles.progressLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Progress to Gold Ambassador</Text>
              <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                <LinearGradient
                  colors={['#3B82F6', '#A855F7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: '65%' }]}
                />
              </View>
              <Text style={styles.progressText}>150 more referrals to go!</Text>
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
                activeTab === tab.id ? styles.tabActive : styles.tabInactive,
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

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <View style={styles.content}>
            {ambassadorTasks.map((task) => {
              const difficultyStyle = getDifficultyStyle(task.difficulty);
              return (
                <View key={task.id} style={[styles.taskCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                  <View style={styles.taskHeader}>
                    <View style={[styles.taskIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                      <Ionicons name={task.icon as any} size={28} color="#3B82F6" />
                    </View>
                    <View style={styles.taskInfo}>
                      <View style={styles.taskBadges}>
                        <View style={[styles.badge, { backgroundColor: difficultyStyle.bg, borderColor: difficultyStyle.border }]}>
                          <Text style={[styles.badgeText, { color: difficultyStyle.color }]}>{task.difficulty}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
                          <Ionicons name="time" size={12} color={isDark ? '#9CA3AF' : '#6B7280'} />
                          <Text style={[styles.badgeText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{task.deadline}</Text>
                        </View>
                        {task.featured && (
                          <View style={[styles.badge, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                            <Ionicons name="sparkles" size={12} color="#F59E0B" />
                            <Text style={[styles.badgeText, { color: '#F59E0B' }]}>Featured</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.taskTitle, { color: isDark ? '#FFF' : '#111827' }]}>{task.title}</Text>
                      <Text style={[styles.taskDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{task.description}</Text>
                    </View>
                  </View>

                  <View style={[styles.progressContainer, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF', borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE' }]}>
                    <View style={styles.progressHeader}>
                      <Text style={[styles.progressLabel, { color: isDark ? '#93C5FD' : '#1E40AF' }]}>Progress</Text>
                      <Text style={[styles.progressValue, { color: isDark ? '#60A5FA' : '#2563EB' }]}>
                        {task.progress}/{task.total}
                      </Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                      <LinearGradient
                        colors={['#3B82F6', '#A855F7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressFill, { width: `${(task.progress / task.total) * 100}%` }]}
                      />
                    </View>
                  </View>

                  {task.requirements && (
                    <View style={[styles.requirementsContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }]}>
                      <Text style={[styles.requirementsTitle, { color: isDark ? '#FFF' : '#111827' }]}>Requirements:</Text>
                      {task.requirements.map((req, idx) => (
                        <View key={idx} style={styles.requirementItem}>
                          <View style={[styles.requirementDot, { backgroundColor: '#3B82F6' }]} />
                          <Text style={[styles.requirementText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{req}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.taskFooter}>
                    <View style={styles.rewardsContainer}>
                      <View style={styles.rewardItem}>
                        <Ionicons name="cash" size={20} color="#10B981" />
                        <Text style={styles.rewardText}>+{task.reward}</Text>
                      </View>
                      {task.brandedReward > 0 && (
                        <View style={styles.rewardItem}>
                          <Ionicons name="bag" size={20} color="#A855F7" />
                          <Text style={[styles.rewardText, { color: '#A855F7' }]}>+{task.brandedReward}</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity style={styles.startButton}>
                      <LinearGradient
                        colors={['#3B82F6', '#A855F7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.startButtonGradient}
                      >
                        <Text style={styles.startButtonText}>
                          {task.status === 'active' ? 'Continue' : 'Start Task'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <View style={styles.content}>
            {upcomingEvents.map((event) => (
              <View key={event.id} style={[styles.eventCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                <View style={styles.eventHeader}>
                  <View style={[styles.eventIconContainer, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
                    <Text style={styles.eventEmoji}>🎉</Text>
                  </View>
                  <View style={styles.eventInfo}>
                    <View style={styles.eventBadges}>
                      <View style={[styles.badge, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
                        <Text style={[styles.badgeText, { color: '#A855F7' }]}>{event.type}</Text>
                      </View>
                      {event.status === 'full' && (
                        <View style={[styles.badge, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                          <Text style={[styles.badgeText, { color: '#EF4444' }]}>Full</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.eventTitle, { color: isDark ? '#FFF' : '#111827' }]}>{event.title}</Text>
                    <View style={styles.eventDetails}>
                      <View style={styles.eventDetailItem}>
                        <Ionicons name="calendar" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        <Text style={[styles.eventDetailText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{event.date}</Text>
                      </View>
                      <View style={styles.eventDetailItem}>
                        <Ionicons name="location" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        <Text style={[styles.eventDetailText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{event.location}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={[styles.progressContainer, { backgroundColor: isDark ? 'rgba(168, 85, 247, 0.1)' : '#F3E8FF', borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : '#C084FC' }]}>
                  <View style={styles.progressHeader}>
                    <Text style={[styles.progressLabel, { color: isDark ? '#C084FC' : '#7C3AED' }]}>Participants</Text>
                    <Text style={[styles.progressValue, { color: isDark ? '#A78BFA' : '#8B5CF6' }]}>
                      {event.participants}/{event.maxParticipants}
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                    <LinearGradient
                      colors={['#A855F7', '#EC4899']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${(event.participants / event.maxParticipants) * 100}%` }]}
                    />
                  </View>
                </View>

                <View style={styles.eventFooter}>
                  <View style={styles.rewardItem}>
                    <Ionicons name="cash" size={20} color="#10B981" />
                    <Text style={styles.rewardText}>+{event.reward}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.registerButton, event.status === 'full' && styles.registerButtonDisabled]}
                    disabled={event.status === 'full'}
                  >
                    {event.status !== 'full' ? (
                      <LinearGradient
                        colors={['#A855F7', '#EC4899']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.registerButtonGradient}
                      >
                        <Text style={styles.registerButtonText}>Register</Text>
                      </LinearGradient>
                    ) : (
                      <Text style={[styles.registerButtonText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Waitlist</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <View style={styles.content}>
            {leaderboard.map((ambassador) => (
              <View
                key={ambassador.rank}
                style={[
                  styles.leaderboardCard,
                  ambassador.highlight && { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5', borderColor: '#10B981', borderWidth: 2 },
                  !ambassador.highlight && { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }
                ]}
              >
                <Text style={[styles.rankText, { color: isDark ? '#9CA3AF' : '#9CA3AF' }]}>#{ambassador.rank}</Text>
                <View style={styles.leaderboardInfo}>
                  <Text style={[styles.leaderboardName, { color: isDark ? '#FFF' : '#111827' }]}>{ambassador.name}</Text>
                  <Text style={[styles.leaderboardCollege, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{ambassador.college}</Text>
                  <Text style={[styles.leaderboardReferrals, { color: '#3B82F6' }]}>{ambassador.referrals} referrals</Text>
                </View>
                <View style={styles.leaderboardCoins}>
                  <Ionicons name="cash" size={16} color="#10B981" />
                  <Text style={styles.leaderboardCoinsText}>{ambassador.coins.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Perks Tab */}
        {activeTab === 'perks' && (
          <View style={styles.content}>
            <View style={styles.perksGrid}>
              {ambassadorPerks.map((perk, idx) => (
                <View key={idx} style={[styles.perkCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                  <View style={[styles.perkIconContainer, { backgroundColor: perk.bg }]}>
                    <Ionicons name={perk.icon as any} size={28} color={perk.color} />
                  </View>
                  <Text style={[styles.perkTitle, { color: isDark ? '#FFF' : '#111827' }]}>{perk.title}</Text>
                  <Text style={[styles.perkDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{perk.description}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.exclusiveCard, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)', borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.3)' }]}>
              <View style={styles.exclusiveHeader}>
                <Ionicons name="flash" size={20} color="#F59E0B" />
                <Text style={[styles.exclusiveTitle, { color: isDark ? '#FFF' : '#111827' }]}>Exclusive Benefits</Text>
              </View>
              {[
                'Direct mentorship from ReZ team',
                'Networking with other ambassadors',
                'Resume-worthy certificate',
                'Internship opportunities',
                'Free ReZ merchandise'
              ].map((benefit, idx) => (
                <View key={idx} style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={[styles.benefitText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{benefit}</Text>
                </View>
              ))}
            </View>
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
    borderColor: 'rgba(59, 130, 246, 0.3)',
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
  progressCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  progressLabel: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3B82F6',
    textAlign: 'center',
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
  tabActive: {},
  tabInactive: {},
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  taskCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  taskIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  taskBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
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
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskDescription: {
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
  progressValue: {
    fontSize: 12,
    fontWeight: 'bold',
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
  taskFooter: {
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
    fontSize: 16,
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
  eventCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  eventIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventEmoji: {
    fontSize: 24,
  },
  eventInfo: {
    flex: 1,
  },
  eventBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventDetails: {
    gap: 4,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDetailText: {
    fontSize: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  registerButtonDisabled: {
    backgroundColor: 'rgba(229, 231, 235, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  registerButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
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
  leaderboardName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  leaderboardCollege: {
    fontSize: 12,
    marginBottom: 2,
  },
  leaderboardReferrals: {
    fontSize: 12,
  },
  leaderboardCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leaderboardCoinsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  perksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  perkCard: {
    width: (width - 56) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  perkIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  perkTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  perkDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  exclusiveCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  exclusiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  exclusiveTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 12,
    flex: 1,
  },
});

export default CollegeAmbassador;

