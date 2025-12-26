import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const UGCCreator = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = false; // Force white theme
  const [activeTab, setActiveTab] = useState('all');

  const contentTypes = [
    {
      id: 'reels',
      title: 'Create Reels',
      icon: 'videocam',
      iconBg: 'rgba(239, 68, 68, 0.2)',
      iconColor: '#EF4444',
      baseReward: 100,
      bonusReward: 500,
      description: '15-30 sec shopping/experience videos',
      requirements: ['High quality video', 'Show products/stores clearly', 'Add #ReZSaves', 'Engaging content'],
      performance: {
        avgViews: 2500,
        avgLikes: 350,
        avgCoins: 180
      },
      status: 'active'
    },
    {
      id: 'photos',
      title: 'Upload Photos',
      icon: 'camera',
      iconBg: 'rgba(59, 130, 246, 0.2)',
      iconColor: '#3B82F6',
      baseReward: 30,
      bonusReward: 150,
      description: 'Store fronts, products, ambiance shots',
      requirements: ['Clear lighting', 'Good composition', 'HD quality', 'No blur'],
      performance: {
        avgViews: 800,
        avgLikes: 120,
        avgCoins: 45
      },
      status: 'active'
    },
    {
      id: 'reviews',
      title: 'Write Reviews',
      icon: 'chatbubble',
      iconBg: 'rgba(168, 85, 247, 0.2)',
      iconColor: '#A855F7',
      baseReward: 50,
      bonusReward: 200,
      description: 'Detailed product/store experiences',
      requirements: ['Minimum 100 words', 'Include pros & cons', 'Helpful & honest', 'Add photos (optional)'],
      performance: {
        avgViews: 450,
        avgLikes: 85,
        avgCoins: 75
      },
      status: 'active'
    },
    {
      id: 'stories',
      title: 'Share Stories',
      icon: 'image',
      iconBg: 'rgba(249, 115, 22, 0.2)',
      iconColor: '#F97316',
      baseReward: 20,
      bonusReward: 100,
      description: 'Quick shopping moments & finds',
      requirements: ['24-hour content', 'Engaging visuals', 'Add location/store tags'],
      performance: {
        avgViews: 1200,
        avgLikes: 180,
        avgCoins: 35
      },
      status: 'active'
    }
  ];

  const myContent = [
    {
      id: 1,
      type: 'reel',
      title: 'Nike Store Shopping Haul',
      thumbnail: '👟',
      views: 3200,
      likes: 456,
      shares: 89,
      comments: 34,
      earned: 220,
      status: 'published',
      publishedDate: '2 days ago',
      performance: 'trending',
      badge: ''
    },
    {
      id: 2,
      type: 'photo',
      title: 'Starbucks New Drink',
      thumbnail: '☕',
      views: 890,
      likes: 123,
      shares: 12,
      comments: 8,
      earned: 50,
      status: 'published',
      publishedDate: '5 days ago',
      performance: 'good',
      badge: ''
    },
    {
      id: 3,
      type: 'review',
      title: 'Zara Summer Collection Review',
      thumbnail: '👗',
      views: 520,
      likes: 94,
      shares: 18,
      comments: 15,
      earned: 85,
      status: 'published',
      publishedDate: '1 week ago',
      performance: 'good',
      badge: ''
    },
    {
      id: 4,
      type: 'reel',
      title: 'Weekend Food Fest Highlights',
      thumbnail: '🍔',
      views: 5600,
      likes: 789,
      shares: 156,
      comments: 67,
      earned: 450,
      status: 'featured',
      publishedDate: '3 days ago',
      performance: 'viral',
      badge: 'Featured'
    }
  ];

  const leaderboard = [
    { rank: 1, name: 'Priya Sharma', avatar: '👩', content: 234, coins: 45600, badge: '🏆' },
    { rank: 2, name: 'Rahul Kumar', avatar: '👨', content: 198, coins: 38900, badge: '🥈' },
    { rank: 3, name: 'Anjali Patel', avatar: '👩', content: 176, coins: 32400, badge: '🥉' },
    { rank: 4, name: 'You', avatar: '😊', content: 87, coins: 12340, badge: '', highlight: true }
  ];

  const tabs = [
    { id: 'all', label: 'Create', count: contentTypes.length },
    { id: 'my-content', label: 'My Content', count: myContent.length },
    { id: 'leaderboard', label: 'Leaderboard', icon: 'trophy' }
  ];

  const myStats = {
    totalContent: 87,
    totalViews: 145600,
    totalLikes: 23400,
    totalEarned: 12340,
    thisMonthEarned: 2450,
    currentRank: 4,
    topPerformer: true
  };

  const getPerformanceStyle = (performance: string) => {
    switch (performance) {
      case 'viral':
        return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' };
      case 'trending':
        return { color: '#F97316', bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.3)' };
      case 'good':
        return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)' };
      default:
        return { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)' };
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
              <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#111827' }]}>UGC Creator Hub</Text>
              <Text style={[styles.headerSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Create content, earn rewards</Text>
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
            colors={isDark ? ['rgba(168, 85, 247, 0.1)', 'rgba(236, 72, 153, 0.1)', 'rgba(239, 68, 68, 0.1)'] : ['rgba(168, 85, 247, 0.1)', 'rgba(236, 72, 153, 0.1)', 'rgba(239, 68, 68, 0.1)']}
            style={[styles.heroCard, { borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.3)' }]}
          >
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF' }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="videocam" size={16} color="#A855F7" />
                  <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Content</Text>
                </View>
                <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>{myStats.totalContent}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF' }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="eye" size={16} color="#3B82F6" />
                  <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Total Views</Text>
                </View>
                <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>{(myStats.totalViews / 1000).toFixed(1)}K</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF' }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="heart" size={16} color="#EF4444" />
                  <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Total Likes</Text>
                </View>
                <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>{((myStats.totalLikes / 1000).toFixed(1))}K</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF' }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="trophy" size={16} color="#F59E0B" />
                  <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Rank</Text>
                </View>
                <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>#{myStats.currentRank}</Text>
              </View>
            </View>
            <View style={[styles.monthlyEarnings, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.2)', borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.3)' }]}>
              <Text style={[styles.monthlyLabel, { color: isDark ? '#FFF' : '#111827' }]}>This Month Earnings</Text>
              <Text style={styles.monthlyValue}>+{myStats.thisMonthEarned}</Text>
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
                { backgroundColor: activeTab === tab.id ? '#A855F7' : isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }
              ]}
            >
              {tab.icon && <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.id ? '#FFF' : (isDark ? '#9CA3AF' : '#6B7280')} />}
              <Text style={[styles.tabText, { color: activeTab === tab.id ? '#FFF' : (isDark ? '#9CA3AF' : '#6B7280') }]}>
                {tab.label} {tab.count !== undefined && `(${tab.count})`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Create Content Tab */}
        {activeTab === 'all' && (
          <View style={styles.content}>
            {contentTypes.map((content) => (
              <View key={content.id} style={[styles.contentCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                <View style={styles.contentHeader}>
                  <View style={[styles.contentIconContainer, { backgroundColor: content.iconBg }]}>
                    <Ionicons name={content.icon as any} size={28} color={content.iconColor} />
                  </View>
                  <View style={styles.contentInfo}>
                    <Text style={[styles.contentTitle, { color: isDark ? '#FFF' : '#111827' }]}>{content.title}</Text>
                    <Text style={[styles.contentDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{content.description}</Text>
                  </View>
                </View>

                <View style={[styles.requirementsContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }]}>
                  <Text style={[styles.requirementsTitle, { color: isDark ? '#FFF' : '#111827' }]}>Requirements:</Text>
                  {content.requirements.map((req, idx) => (
                    <View key={idx} style={styles.requirementItem}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Text style={[styles.requirementText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{req}</Text>
                    </View>
                  ))}
                </View>

                <View style={[styles.performanceContainer, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF', borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE' }]}>
                  <View style={styles.performanceHeader}>
                    <Ionicons name="trending-up" size={14} color="#3B82F6" />
                    <Text style={[styles.performanceTitle, { color: isDark ? '#93C5FD' : '#1E40AF' }]}>Average Performance</Text>
                  </View>
                  <View style={styles.performanceStats}>
                    <View style={styles.performanceStat}>
                      <Text style={[styles.performanceValue, { color: '#3B82F6' }]}>{content.performance.avgViews.toLocaleString()}</Text>
                      <Text style={[styles.performanceLabel, { color: '#3B82F6' }]}>Views</Text>
                    </View>
                    <View style={styles.performanceStat}>
                      <Text style={[styles.performanceValue, { color: '#3B82F6' }]}>{content.performance.avgLikes}</Text>
                      <Text style={[styles.performanceLabel, { color: '#3B82F6' }]}>Likes</Text>
                    </View>
                    <View style={styles.performanceStat}>
                      <Text style={[styles.performanceValue, { color: '#3B82F6' }]}>{content.performance.avgCoins}</Text>
                      <Text style={[styles.performanceLabel, { color: '#3B82F6' }]}>Coins</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.contentFooter}>
                  <View style={styles.rewardsContainer}>
                    <View style={styles.rewardItem}>
                      <Ionicons name="cash" size={20} color="#10B981" />
                      <Text style={styles.rewardText}>+{content.baseReward}</Text>
                    </View>
                    <View style={[styles.bonusBadge, { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
                      <Ionicons name="sparkles" size={16} color="#F59E0B" />
                      <Text style={[styles.bonusText, { color: '#F59E0B' }]}>Up to +{content.bonusReward}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.createButton}>
                    <LinearGradient colors={['#A855F7', '#EC4899']} style={styles.createButtonGradient}>
                      <Ionicons name="cloud-upload" size={16} color="#FFF" />
                      <Text style={styles.createButtonText}>Create</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={[styles.tipsCard, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFF7ED', borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FED7AA' }]}>
              <View style={styles.tipsHeader}>
                <Ionicons name="sparkles" size={20} color="#F59E0B" />
                <Text style={[styles.tipsTitle, { color: isDark ? '#FFF' : '#111827' }]}>Tips to Maximize Earnings</Text>
              </View>
              {[
                'Post during peak hours (6-9 PM) for maximum visibility',
                'Use trending hashtags and add location tags',
                'Engage with other creators for better reach',
                'High-quality content gets featured and earns 3x rewards'
              ].map((tip, idx) => (
                <View key={idx} style={styles.tipItem}>
                  <View style={[styles.tipDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={[styles.tipText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* My Content Tab */}
        {activeTab === 'my-content' && (
          <View style={styles.content}>
            {myContent.map((item) => {
              const perfStyle = getPerformanceStyle(item.performance);
              return (
                <View key={item.id} style={[styles.contentCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                  <View style={styles.contentHeader}>
                    <LinearGradient colors={['rgba(168, 85, 247, 0.2)', 'rgba(236, 72, 153, 0.2)']} style={styles.thumbnailContainer}>
                      <Text style={styles.thumbnail}>{item.thumbnail}</Text>
                    </LinearGradient>
                    <View style={styles.contentInfo}>
                      <View style={styles.contentBadges}>
                        {item.badge && (
                          <View style={[styles.badge, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                            <Ionicons name="ribbon" size={12} color="#F59E0B" />
                            <Text style={[styles.badgeText, { color: '#F59E0B' }]}>{item.badge}</Text>
                          </View>
                        )}
                        {item.performance && (
                          <View style={[styles.badge, { backgroundColor: perfStyle.bg, borderColor: perfStyle.border }]}>
                            <Text style={[styles.badgeText, { color: perfStyle.color }]}>
                              {item.performance.charAt(0).toUpperCase() + item.performance.slice(1)}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.contentTitle, { color: isDark ? '#FFF' : '#111827' }]}>{item.title}</Text>
                      <Text style={[styles.contentDate, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{item.publishedDate}</Text>
                    </View>
                  </View>

                  <View style={styles.statsGrid}>
                    <View style={[styles.statMiniCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }]}>
                      <Ionicons name="eye" size={16} color="#3B82F6" />
                      <Text style={[styles.statMiniValue, { color: isDark ? '#FFF' : '#111827' }]}>{item.views.toLocaleString()}</Text>
                      <Text style={[styles.statMiniLabel, { color: isDark ? '#6B7280' : '#6B7280' }]}>Views</Text>
                    </View>
                    <View style={[styles.statMiniCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }]}>
                      <Ionicons name="heart" size={16} color="#EF4444" />
                      <Text style={[styles.statMiniValue, { color: isDark ? '#FFF' : '#111827' }]}>{item.likes}</Text>
                      <Text style={[styles.statMiniLabel, { color: isDark ? '#6B7280' : '#6B7280' }]}>Likes</Text>
                    </View>
                    <View style={[styles.statMiniCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }]}>
                      <Ionicons name="share-social" size={16} color="#10B981" />
                      <Text style={[styles.statMiniValue, { color: isDark ? '#FFF' : '#111827' }]}>{item.shares}</Text>
                      <Text style={[styles.statMiniLabel, { color: isDark ? '#6B7280' : '#6B7280' }]}>Shares</Text>
                    </View>
                    <View style={[styles.statMiniCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5' }]}>
                      <Ionicons name="cash" size={16} color="#10B981" />
                      <Text style={[styles.statMiniValue, { color: '#10B981' }]}>+{item.earned}</Text>
                      <Text style={[styles.statMiniLabel, { color: '#10B981' }]}>Earned</Text>
                    </View>
                  </View>

                  <View style={styles.contentActions}>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
                      <Text style={[styles.actionButtonText, { color: isDark ? '#FFF' : '#111827' }]}>View Analytics</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.boostButton}>
                      <LinearGradient colors={['#A855F7', '#EC4899']} style={styles.boostButtonGradient}>
                        <Text style={styles.boostButtonText}>Boost Post</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <View style={styles.content}>
            <View style={[styles.podiumCard, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFF7ED', borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FED7AA' }]}>
              <View style={styles.podiumHeader}>
                <Ionicons name="trophy" size={20} color="#F59E0B" />
                <Text style={[styles.podiumTitle, { color: isDark ? '#FFF' : '#111827' }]}>Top Creators This Month</Text>
              </View>
              <View style={styles.podium}>
                {leaderboard.slice(0, 3).map((creator) => (
                  <View key={creator.rank} style={styles.podiumItem}>
                    <Text style={styles.podiumBadge}>{creator.badge}</Text>
                    <LinearGradient colors={['#A855F7', '#EC4899']} style={styles.podiumAvatar}>
                      <Text style={styles.podiumAvatarText}>{creator.avatar}</Text>
                    </LinearGradient>
                    <Text style={[styles.podiumName, { color: isDark ? '#FFF' : '#111827' }]}>{creator.name}</Text>
                    <Text style={[styles.podiumContent, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{creator.content} posts</Text>
                    <Text style={styles.podiumCoins}>{creator.coins.toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.leaderboardList}>
              {leaderboard.map((creator) => (
                <View
                  key={creator.rank}
                  style={[
                    styles.leaderboardCard,
                    creator.highlight && { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5', borderColor: '#10B981', borderWidth: 2 },
                    !creator.highlight && { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }
                  ]}
                >
                  <Text style={[styles.leaderboardRank, { color: isDark ? '#9CA3AF' : '#9CA3AF' }]}>#{creator.rank}</Text>
                  <LinearGradient colors={['#A855F7', '#EC4899']} style={styles.leaderboardAvatar}>
                    <Text style={styles.leaderboardAvatarText}>{creator.avatar}</Text>
                  </LinearGradient>
                  <View style={styles.leaderboardInfo}>
                    <View style={styles.leaderboardNameRow}>
                      <Text style={[styles.leaderboardName, { color: isDark ? '#FFF' : '#111827' }]}>{creator.name}</Text>
                      {creator.badge && <Text style={styles.leaderboardBadge}>{creator.badge}</Text>}
                    </View>
                    <Text style={[styles.leaderboardContent, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{creator.content} posts</Text>
                  </View>
                  <View style={styles.leaderboardCoins}>
                    <Ionicons name="cash" size={16} color="#10B981" />
                    <Text style={styles.leaderboardCoinsText}>{creator.coins.toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={[styles.ctaCard, { backgroundColor: isDark ? 'rgba(168, 85, 247, 0.1)' : '#F3E8FF', borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : '#C084FC' }]}>
              <Text style={[styles.ctaTitle, { color: isDark ? '#FFF' : '#111827' }]}>Climb the Ranks!</Text>
              <Text style={[styles.ctaText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Top 3 creators win exclusive rewards every month
              </Text>
              <TouchableOpacity style={styles.ctaButton}>
                <LinearGradient colors={['#A855F7', '#EC4899']} style={styles.ctaButtonGradient}>
                  <Text style={styles.ctaButtonText}>Create More Content</Text>
                </LinearGradient>
              </TouchableOpacity>
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
  monthlyEarnings: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthlyLabel: {
    fontSize: 14,
  },
  monthlyValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
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
  contentCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  contentHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  contentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentInfo: {
    flex: 1,
  },
  contentBadges: {
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
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contentDescription: {
    fontSize: 12,
  },
  contentDate: {
    fontSize: 12,
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
  requirementText: {
    fontSize: 12,
    flex: 1,
  },
  performanceContainer: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  performanceTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceStat: {
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  performanceLabel: {
    fontSize: 10,
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardsContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
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
  bonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  bonusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tipsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  tipText: {
    fontSize: 12,
    flex: 1,
  },
  thumbnailContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    fontSize: 28,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statMiniCard: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statMiniValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },
  statMiniLabel: {
    fontSize: 10,
  },
  contentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  boostButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  boostButtonGradient: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  boostButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  podiumCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  podiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'center',
  },
  podiumTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  podiumItem: {
    alignItems: 'center',
  },
  podiumBadge: {
    fontSize: 32,
    marginBottom: 8,
  },
  podiumAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  podiumAvatarText: {
    fontSize: 24,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  podiumContent: {
    fontSize: 10,
    marginBottom: 4,
  },
  podiumCoins: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
  },
  leaderboardList: {
    gap: 8,
    marginBottom: 16,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  leaderboardRank: {
    fontSize: 18,
    fontWeight: '600',
    width: 32,
    textAlign: 'center',
  },
  leaderboardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardAvatarText: {
    fontSize: 20,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  leaderboardBadge: {
    fontSize: 16,
  },
  leaderboardContent: {
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
  ctaCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
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
});

export default UGCCreator;

