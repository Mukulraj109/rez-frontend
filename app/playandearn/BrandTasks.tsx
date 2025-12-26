import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const BrandTasks = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = false; // Force white theme
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const brandMissions = [
    {
      id: 1,
      brand: 'Starbucks',
      logo: '☕',
      bgColor: ['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.2)'],
      borderColor: 'rgba(34, 197, 94, 0.3)',
      tasks: [
        {
          id: 'sb-1',
          type: 'review',
          title: 'Review Your Latest Order',
          reward: 50,
          brandedReward: 30,
          difficulty: 'Easy',
          timeEstimate: '2 mins',
          description: 'Share your experience with coffee quality, service & ambiance',
          requirements: ['Must have ordered in last 7 days', 'Minimum 50 words', 'Include photo (optional)'],
          status: 'available',
          completed: 0,
          total: 1
        },
        {
          id: 'sb-2',
          type: 'quiz',
          title: 'Coffee Connoisseur Quiz',
          reward: 30,
          brandedReward: 20,
          difficulty: 'Medium',
          timeEstimate: '5 mins',
          description: 'Test your knowledge about coffee varieties & brewing methods',
          requirements: ['10 questions', '70% to pass', 'Unlimited attempts'],
          status: 'available',
          completed: 0,
          total: 1
        },
        {
          id: 'sb-3',
          type: 'content',
          title: 'Create a Coffee Reel',
          reward: 150,
          brandedReward: 100,
          difficulty: 'Hard',
          timeEstimate: '15 mins',
          featured: true,
          description: 'Create a 15-30 sec reel showcasing your Starbucks experience',
          requirements: ['15-30 seconds', 'Show products clearly', 'Use #StarbucksReZ', 'High quality video'],
          status: 'available',
          completed: 0,
          total: 1
        }
      ]
    },
    {
      id: 2,
      brand: 'Nike',
      logo: '👟',
      bgColor: ['rgba(249, 115, 22, 0.2)', 'rgba(239, 68, 68, 0.2)'],
      borderColor: 'rgba(249, 115, 22, 0.3)',
      tasks: [
        {
          id: 'nk-1',
          type: 'mystery-shop',
          title: 'Mystery Shopper Mission',
          reward: 200,
          brandedReward: 150,
          difficulty: 'Medium',
          timeEstimate: '30 mins',
          featured: true,
          description: 'Visit Nike store, evaluate service & share detailed feedback',
          requirements: ['Visit designated store', 'Note staff behavior', 'Check stock availability', 'Photo proof required'],
          status: 'available',
          completed: 0,
          total: 1,
          premium: true
        },
        {
          id: 'nk-2',
          type: 'review',
          title: 'Rate Your Nike Shoes',
          reward: 60,
          brandedReward: 40,
          difficulty: 'Easy',
          timeEstimate: '3 mins',
          description: 'Share your experience with comfort, durability & style',
          requirements: ['Must own Nike product', 'Rate 5 attributes', 'Add photo'],
          status: 'available',
          completed: 0,
          total: 1
        },
        {
          id: 'nk-3',
          type: 'sample',
          title: 'Try New Running Shoe',
          reward: 100,
          brandedReward: 300,
          difficulty: 'Easy',
          timeEstimate: '1 week',
          description: 'Get sample product, use for 1 week, then review',
          requirements: ['Application required', 'Limited slots (50)', 'Detailed review after trial', 'Return not needed'],
          status: 'apply',
          completed: 0,
          total: 1,
          slots: { available: 12, total: 50 }
        }
      ]
    },
    {
      id: 3,
      brand: 'Zara',
      logo: '👗',
      bgColor: ['rgba(168, 85, 247, 0.2)', 'rgba(236, 72, 153, 0.2)'],
      borderColor: 'rgba(168, 85, 247, 0.3)',
      tasks: [
        {
          id: 'zr-1',
          type: 'feedback',
          title: 'Style Preference Survey',
          reward: 40,
          brandedReward: 25,
          difficulty: 'Easy',
          timeEstimate: '5 mins',
          description: 'Help us understand your fashion preferences',
          requirements: ['10 questions', 'Include size preferences', 'Color choices'],
          status: 'available',
          completed: 0,
          total: 1
        },
        {
          id: 'zr-2',
          type: 'content',
          title: 'Fashion Lookbook Post',
          reward: 120,
          brandedReward: 80,
          difficulty: 'Medium',
          timeEstimate: '20 mins',
          description: 'Create outfit combination using Zara pieces',
          requirements: ['Minimum 3 Zara items', 'Clear photos', 'Style description', 'Post on social'],
          status: 'available',
          completed: 0,
          total: 1
        }
      ]
    },
    {
      id: 4,
      brand: 'McDonald\'s',
      logo: '🍔',
      bgColor: ['rgba(234, 179, 8, 0.2)', 'rgba(239, 68, 68, 0.2)'],
      borderColor: 'rgba(234, 179, 8, 0.3)',
      tasks: [
        {
          id: 'mc-1',
          type: 'review',
          title: 'Rate Your Meal',
          reward: 30,
          brandedReward: 20,
          difficulty: 'Easy',
          timeEstimate: '2 mins',
          description: 'Quick feedback on food quality & service',
          requirements: ['Recent purchase', 'Rate taste, service, cleanliness'],
          status: 'completed',
          completed: 1,
          total: 1,
          earnedCoins: 50
        },
        {
          id: 'mc-2',
          type: 'quiz',
          title: 'Menu Master Challenge',
          reward: 25,
          brandedReward: 15,
          difficulty: 'Easy',
          timeEstimate: '3 mins',
          description: 'Test your knowledge of McDonald\'s menu',
          requirements: ['8 questions', '60% to pass'],
          status: 'available',
          completed: 0,
          total: 1
        }
      ]
    }
  ];

  const tabs = [
    { id: 'all', label: 'All Brands', count: brandMissions.reduce((acc, b) => acc + b.tasks.filter(t => t.status !== 'completed').length, 0) },
    { id: 'featured', label: 'Featured', count: brandMissions.reduce((acc, b) => acc + b.tasks.filter(t => t.featured && t.status !== 'completed').length, 0) },
    { id: 'high-reward', label: 'High Reward', count: brandMissions.reduce((acc, b) => acc + b.tasks.filter(t => t.reward >= 100 && t.status !== 'completed').length, 0) },
    { id: 'easy', label: 'Quick Win', count: brandMissions.reduce((acc, b) => acc + b.tasks.filter(t => t.difficulty === 'Easy' && t.status !== 'completed').length, 0) },
    { id: 'completed', label: 'Done', count: brandMissions.reduce((acc, b) => acc + b.tasks.filter(t => t.status === 'completed').length, 0) }
  ];

  const filteredBrands = brandMissions
    .map(brand => ({
      ...brand,
      tasks: brand.tasks.filter(task => {
        let tabMatch = true;
        if (activeTab === 'featured') tabMatch = task.featured && task.status !== 'completed';
        else if (activeTab === 'high-reward') tabMatch = task.reward >= 100 && task.status !== 'completed';
        else if (activeTab === 'easy') tabMatch = task.difficulty === 'Easy' && task.status !== 'completed';
        else if (activeTab === 'completed') tabMatch = task.status === 'completed';
        else if (activeTab === 'all') tabMatch = task.status !== 'completed';

        const searchMatch = searchQuery === '' ||
          brand.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.title.toLowerCase().includes(searchQuery.toLowerCase());

        return tabMatch && searchMatch;
      })
    }))
    .filter(brand => brand.tasks.length > 0);

  const myStats = {
    totalEarned: 2340,
    tasksCompleted: 45,
    brandsPartnered: 12,
    currentStreak: 5
  };

  const taskTypeIcons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
    'review': 'chatbubble',
    'quiz': 'trophy',
    'content': 'videocam',
    'mystery-shop': 'search',
    'feedback': 'star',
    'sample': 'gift'
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
              <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#111827' }]}>Brand Tasks</Text>
              <Text style={[styles.headerSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Complete missions, earn rewards</Text>
            </View>
            <View style={styles.coinBadge}>
              <Ionicons name="cash" size={16} color="#10B981" />
              <Text style={styles.coinText}>{myStats.totalEarned}</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchWrapper}>
              <Ionicons name="search" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.searchIcon} />
              <TextInput
                placeholder="Search brands or tasks..."
                placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInput, { color: isDark ? '#FFF' : '#111827', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }]}
              />
            </View>
          </View>
        </View>

        {/* Hero Stats */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={isDark ? ['rgba(59, 130, 246, 0.1)', 'rgba(168, 85, 247, 0.1)', 'rgba(236, 72, 153, 0.1)'] : ['rgba(59, 130, 246, 0.1)', 'rgba(168, 85, 247, 0.1)', 'rgba(236, 72, 153, 0.1)']}
            style={[styles.heroCard, { borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)' }]}
          >
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <LinearGradient colors={['#3B82F6', '#A855F7']} style={styles.statIconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                </LinearGradient>
                <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>{myStats.tasksCompleted}</Text>
                <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <LinearGradient colors={['#A855F7', '#EC4899']} style={styles.statIconContainer}>
                  <Ionicons name="bag" size={24} color="#FFF" />
                </LinearGradient>
                <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>{myStats.brandsPartnered}</Text>
                <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Brands</Text>
              </View>
              <View style={styles.statItem}>
                <LinearGradient colors={['#10B981', '#14B8A6']} style={styles.statIconContainer}>
                  <Ionicons name="cash" size={24} color="#FFF" />
                </LinearGradient>
                <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>{myStats.totalEarned}</Text>
                <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Total Earned</Text>
              </View>
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
              <Text style={[styles.tabText, { color: activeTab === tab.id ? '#FFF' : (isDark ? '#9CA3AF' : '#6B7280') }]}>
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Brands & Tasks List */}
        <View style={styles.content}>
          {filteredBrands.map((brand) => (
            <View key={brand.id} style={styles.brandSection}>
              {/* Brand Header */}
              <LinearGradient
                colors={brand.bgColor}
                style={[styles.brandHeader, { borderColor: brand.borderColor }]}
              >
                <View style={styles.brandHeaderContent}>
                  <View style={[styles.brandLogoContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.9)' : '#FFF' }]}>
                    <Text style={styles.brandLogo}>{brand.logo}</Text>
                  </View>
                  <View style={styles.brandInfo}>
                    <Text style={[styles.brandName, { color: isDark ? '#FFF' : '#111827' }]}>{brand.brand}</Text>
                    <Text style={[styles.brandTasksCount, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      {brand.tasks.length} {brand.tasks.length === 1 ? 'task' : 'tasks'} available
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Tasks */}
              {brand.tasks.map((task) => {
                const difficultyStyle = getDifficultyStyle(task.difficulty);
                return (
                  <View key={task.id} style={[styles.taskCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                    <View style={styles.taskHeader}>
                      <View style={[styles.taskIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                        <Ionicons name={taskTypeIcons[task.type]} size={24} color="#3B82F6" />
                      </View>
                      <View style={styles.taskInfo}>
                        <View style={styles.taskBadges}>
                          <View style={[styles.badge, { backgroundColor: difficultyStyle.bg, borderColor: difficultyStyle.border }]}>
                            <Text style={[styles.badgeText, { color: difficultyStyle.color }]}>{task.difficulty}</Text>
                          </View>
                          <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
                            <Ionicons name="time" size={12} color={isDark ? '#9CA3AF' : '#6B7280'} />
                            <Text style={[styles.badgeText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{task.timeEstimate}</Text>
                          </View>
                          {task.featured && (
                            <View style={[styles.badge, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                              <Ionicons name="sparkles" size={12} color="#F59E0B" />
                              <Text style={[styles.badgeText, { color: '#F59E0B' }]}>Featured</Text>
                            </View>
                          )}
                          {task.premium && (
                            <View style={[styles.badge, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
                              <Ionicons name="ribbon" size={12} color="#A855F7" />
                              <Text style={[styles.badgeText, { color: '#A855F7' }]}>Premium</Text>
                            </View>
                          )}
                          {task.status === 'completed' && (
                            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                          )}
                        </View>
                        <Text style={[styles.taskTitle, { color: isDark ? '#FFF' : '#111827' }]}>{task.title}</Text>
                        <Text style={[styles.taskDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{task.description}</Text>
                      </View>
                    </View>

                    {/* Requirements */}
                    <View style={[styles.requirementsContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }]}>
                      <Text style={[styles.requirementsTitle, { color: isDark ? '#FFF' : '#111827' }]}>Requirements:</Text>
                      {task.requirements.map((req, idx) => (
                        <View key={idx} style={styles.requirementItem}>
                          <View style={[styles.requirementDot, { backgroundColor: '#3B82F6' }]} />
                          <Text style={[styles.requirementText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{req}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Slots Info */}
                    {task.slots && (
                      <View style={[styles.slotsContainer, { backgroundColor: isDark ? 'rgba(249, 115, 22, 0.1)' : '#FFF7ED', borderColor: isDark ? 'rgba(249, 115, 22, 0.3)' : '#FED7AA' }]}>
                        <View style={styles.slotsHeader}>
                          <Text style={[styles.slotsLabel, { color: isDark ? '#FED7AA' : '#9A3412' }]}>Limited Slots</Text>
                          <Text style={[styles.slotsValue, { color: isDark ? '#FB923C' : '#EA580C' }]}>
                            {task.slots.available}/{task.slots.total} left
                          </Text>
                        </View>
                        <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                          <LinearGradient
                            colors={['#F97316', '#EF4444']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressFill, { width: `${(task.slots.available / task.slots.total) * 100}%` }]}
                          />
                        </View>
                      </View>
                    )}

                    {/* Rewards */}
                    <View style={styles.taskFooter}>
                      <View style={styles.rewardsContainer}>
                        <View style={styles.rewardItem}>
                          <Ionicons name="cash" size={20} color="#10B981" />
                          <View>
                            <Text style={styles.rewardValue}>+{task.reward}</Text>
                            <Text style={styles.rewardLabel}>ReZ Coins</Text>
                          </View>
                        </View>
                        {task.brandedReward > 0 && (
                          <View style={styles.rewardItem}>
                            <Ionicons name="bag" size={20} color="#A855F7" />
                            <View>
                              <Text style={[styles.rewardValue, { color: '#A855F7' }]}>+{task.brandedReward}</Text>
                              <Text style={styles.rewardLabel}>{brand.brand} Coins</Text>
                            </View>
                          </View>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.actionButton}
                        disabled={task.status === 'completed'}
                      >
                        {task.status === 'completed' ? (
                          <View style={[styles.actionButtonDisabled, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                            <Text style={[styles.actionButtonText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>✓ Done</Text>
                          </View>
                        ) : task.status === 'apply' ? (
                          <LinearGradient colors={['#F97316', '#EF4444']} style={styles.actionButtonGradient}>
                            <Text style={styles.actionButtonText}>Apply Now</Text>
                          </LinearGradient>
                        ) : (
                          <LinearGradient colors={['#3B82F6', '#A855F7']} style={styles.actionButtonGradient}>
                            <Text style={styles.actionButtonText}>Start Task</Text>
                          </LinearGradient>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Empty State */}
        {filteredBrands.length === 0 && (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
              <Ionicons name="search" size={40} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? '#FFF' : '#111827' }]}>No Tasks Found</Text>
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Try adjusting your filters or search query
            </Text>
          </View>
        )}

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <LinearGradient
            colors={isDark ? ['rgba(59, 130, 246, 0.1)', 'rgba(168, 85, 247, 0.1)'] : ['#EFF6FF', '#F3E8FF']}
            style={[styles.ctaCard, { borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE' }]}
          >
            <Text style={[styles.ctaTitle, { color: isDark ? '#FFF' : '#111827' }]}>Earn from Your Favorite Brands</Text>
            <Text style={[styles.ctaText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Complete tasks, earn ReZ + Branded Coins
            </Text>
            <View style={styles.ctaFeatures}>
              <View style={styles.ctaFeature}>
                <Ionicons name="chatbubble" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.ctaFeatureText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Reviews</Text>
              </View>
              <View style={styles.ctaFeature}>
                <Ionicons name="trophy" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.ctaFeatureText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Quizzes</Text>
              </View>
              <View style={styles.ctaFeature}>
                <Ionicons name="videocam" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.ctaFeatureText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Content</Text>
              </View>
            </View>
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
    marginBottom: 12,
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
  searchContainer: {
    paddingHorizontal: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 250, 251, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.1)',
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 16,
    fontSize: 14,
  },
  heroSection: {
    padding: 16,
  },
  heroCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
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
    gap: 24,
  },
  brandSection: {
    gap: 12,
  },
  brandHeader: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  brandHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandLogoContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    fontSize: 28,
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  brandTasksCount: {
    fontSize: 12,
  },
  taskCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  taskIconContainer: {
    width: 48,
    height: 48,
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
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskDescription: {
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
  slotsContainer: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  slotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  slotsLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  slotsValue: {
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
    gap: 6,
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  rewardLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  actionButtonDisabled: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  ctaSection: {
    padding: 16,
  },
  ctaCard: {
    padding: 24,
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
  ctaFeatures: {
    flexDirection: 'row',
    gap: 16,
  },
  ctaFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctaFeatureText: {
    fontSize: 12,
  },
});

export default BrandTasks;

