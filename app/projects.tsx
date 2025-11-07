import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { EARN_COLORS } from '@/constants/EarnPageColors';

interface Project {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  type: string;
  reward: {
    amount: number;
    currency: string;
    type: string;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  status: string;
  isFeatured?: boolean;
  isSponsored?: boolean;
  tags?: string[];
  analytics?: {
    totalViews: number;
    totalSubmissions: number;
    approvedSubmissions: number;
  };
  createdBy?: {
    profile?: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
  };
  sponsor?: {
    name?: string;
    logo?: string;
  };
  createdAt: string;
}

interface ProjectsResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AllProjectsPage() {
  const router = useRouter();
  const navigation = useNavigation();
  const { state: authState } = useAuth();
  const params = useLocalSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);

  // Hide the default navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(params.filterStatus as string || null);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const searchScaleAnim = useRef(new Animated.Value(1)).current;
  const cardAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  const categories = [
    { label: 'All', value: null, icon: 'grid', gradient: ['#8B5CF6', '#A855F7'] },
    { label: 'Review', value: 'review', icon: 'star', gradient: ['#F59E0B', '#F97316'] },
    { label: 'Social Share', value: 'social_share', icon: 'share-social', gradient: ['#3B82F6', '#6366F1'] },
    { label: 'UGC Content', value: 'ugc_content', icon: 'videocam', gradient: ['#EC4899', '#F472B6'] },
    { label: 'Store Visit', value: 'store_visit', icon: 'storefront', gradient: ['#10B981', '#059669'] },
    { label: 'Survey', value: 'survey', icon: 'clipboard', gradient: ['#8B5CF6', '#7C3AED'] },
    { label: 'Photo', value: 'photo', icon: 'camera', gradient: ['#F59E0B', '#EA580C'] },
    { label: 'Video', value: 'video', icon: 'film', gradient: ['#EF4444', '#DC2626'] },
  ];

  const difficulties = [
    { label: 'All', value: null },
    { label: 'Easy', value: 'easy', color: '#10B981' },
    { label: 'Medium', value: 'medium', color: '#F59E0B' },
    { label: 'Hard', value: 'hard', color: '#EF4444' },
  ];

  const loadProjects = useCallback(async (pageNum = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      }

      let response: any;
      let endpoint = '/projects';
      const params: any = {
        page: pageNum,
        limit: 20,
        sortBy,
      };

      // Handle status filtering based on user submissions
      if (filterStatus === 'in-review' || filterStatus === 'completed') {
        // Use my-submissions endpoint for user's submissions
        endpoint = '/projects/my-submissions';
        if (filterStatus === 'in-review') {
          params.status = 'pending'; // Will match pending and under_review
        } else if (filterStatus === 'completed') {
          params.status = 'approved';
        }
      } else if (filterStatus === 'complete-now') {
        // Show active projects user hasn't started
        params.status = 'active';
        params.excludeUserSubmissions = true; // Custom param to exclude projects with user submissions
      } else {
        // Default: show all active projects
        params.status = 'active';
      }

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (selectedDifficulty) {
        params.difficulty = selectedDifficulty;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      console.log('📋 [PROJECTS] Loading projects with params:', params, 'endpoint:', endpoint);

      if (endpoint === '/projects/my-submissions') {
        // Handle my-submissions response format
        const submissionsResponse = await apiClient.get<{
          submissions: any[];
          pagination: any;
        }>('/projects/my-submissions', params);
        
        if (submissionsResponse.success && submissionsResponse.data) {
          // Transform submissions to projects format
          const transformedProjects = submissionsResponse.data.submissions.map((sub: any) => ({
            _id: sub.project._id,
            title: sub.project.title,
            description: sub.project.description,
            shortDescription: sub.project.shortDescription,
            category: sub.project.category,
            type: sub.project.type || 'text',
            reward: sub.project.reward || { amount: 0, currency: '₹', type: 'fixed' },
            difficulty: sub.project.difficulty || 'easy',
            estimatedTime: sub.project.estimatedTime || 0,
            status: sub.project.status || 'active',
            tags: sub.project.tags || [],
            analytics: sub.project.analytics || {},
            createdAt: sub.project.createdAt || sub.submittedAt,
            submissionStatus: sub.status,
            submissionId: sub._id,
          }));

          response = {
            success: true,
            data: {
              projects: transformedProjects,
              pagination: submissionsResponse.data.pagination
            }
          };
        } else {
          throw new Error('Failed to load submissions');
        }
      } else {
        // Regular projects endpoint
        response = await apiClient.get<ProjectsResponse>('/projects', params);
      }

      if (response.success && response.data) {
        const newProjects = response.data.projects || [];
        
        if (reset) {
          setProjects(newProjects);
          // Animate cards in
          newProjects.forEach((project, index) => {
            if (!cardAnims[project._id]) {
              cardAnims[project._id] = new Animated.Value(0);
            }
            Animated.timing(cardAnims[project._id], {
              toValue: 1,
              duration: 400,
              delay: index * 50,
              useNativeDriver: true,
            }).start();
          });
        } else {
          setProjects(prev => [...prev, ...newProjects]);
        }

        setHasMore(response.data.pagination?.hasNext || false);
        setPage(pageNum);

        // Animate in
        if (reset) {
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
          ]).start();
        }
      } else {
        throw new Error('Failed to load projects');
      }
    } catch (err) {
      console.error('❌ [PROJECTS] Error loading projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, selectedDifficulty, searchQuery, sortBy, filterStatus, authState.user, fadeAnim, slideAnim, cardAnims]);

  useEffect(() => {
    loadProjects(1, true);
  }, [selectedCategory, selectedDifficulty, sortBy, filterStatus]);

  useEffect(() => {
    if (searchFocused) {
      Animated.spring(searchScaleAnim, {
        toValue: 1.02,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    } else {
      Animated.spring(searchScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }
  }, [searchFocused, searchScaleAnim]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadProjects(1, true);
  }, [loadProjects]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadProjects(page + 1, false);
    }
  }, [loading, hasMore, page, loadProjects]);

  const handleSearch = useCallback(() => {
    loadProjects(1, true);
  }, [loadProjects]);

  const handleProjectPress = useCallback((project: Project) => {
    router.push({
      pathname: '/project-detail',
      params: { projectId: project._id },
    } as any);
  }, [router]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'hard':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'review':
        return 'star';
      case 'social_share':
        return 'share-social';
      case 'ugc_content':
        return 'videocam';
      case 'store_visit':
        return 'storefront';
      case 'survey':
        return 'clipboard';
      case 'photo':
        return 'camera';
      case 'video':
        return 'film';
      default:
        return 'briefcase';
    }
  };

  const getCategoryGradient = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.gradient || ['#8B5CF6', '#A855F7'];
  };

  // Project Card Component
  const ProjectCard = React.memo(({ project, cardAnim, onPress, getCategoryGradient, getDifficultyColor, getCategoryIcon }: {
    project: Project;
    cardAnim: Animated.Value;
    onPress: () => void;
    getCategoryGradient: (category: string) => string[];
    getDifficultyColor: (difficulty: string) => string;
    getCategoryIcon: (category: string) => string;
  }) => {
    const pressAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(pressAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(pressAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    };

    const categoryGradient = getCategoryGradient(project.category);
    const difficultyColor = getDifficultyColor(project.difficulty);

    return (
      <Animated.View
        style={{
          opacity: cardAnim,
          transform: [
            {
              translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
            { scale: pressAnim },
          ],
        }}
      >
        <TouchableOpacity
          style={styles.projectCard}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <LinearGradient
            colors={['#FFFFFF', '#FAFBFC']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Decorative Background Elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            {/* Featured Badge */}
            {project.isFeatured && (
              <View style={styles.featuredBadgeContainer}>
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.featuredBadge}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="star" size={12} color="#FFFFFF" />
                  <ThemedText style={styles.featuredText}>Featured</ThemedText>
                </LinearGradient>
              </View>
            )}

            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <LinearGradient
                  colors={categoryGradient}
                  style={styles.categoryIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons
                    name={getCategoryIcon(project.category) as any}
                    size={22}
                    color="#FFFFFF"
                  />
                </LinearGradient>
                <View style={styles.cardTitleContainer}>
                  <ThemedText style={styles.cardTitle} numberOfLines={1}>
                    {project.title}
                  </ThemedText>
                </View>
              </View>
              <LinearGradient
                colors={[`${difficultyColor}20`, `${difficultyColor}10`]}
                style={styles.difficultyBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ThemedText
                  style={[styles.difficultyText, { color: difficultyColor }]}
                >
                  {project.difficulty}
                </ThemedText>
              </LinearGradient>
            </View>

            {/* Card Description */}
            <ThemedText style={styles.cardDescription} numberOfLines={2}>
              {project.shortDescription || project.description}
            </ThemedText>

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.rewardContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="cash" size={18} color="#FFFFFF" />
                <ThemedText style={styles.rewardAmount}>
                  ₹{project.reward?.amount || 0}
                </ThemedText>
              </LinearGradient>
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <ThemedText style={styles.timeText}>
                  {project.estimatedTime || 0} min
                </ThemedText>
              </View>
              {project.analytics && (
                <View style={styles.statsContainer}>
                  <Ionicons name="eye-outline" size={16} color="#6B7280" />
                  <ThemedText style={styles.statsText}>
                    {project.analytics.totalViews || 0}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {project.tags.slice(0, 3).map((tag, tagIndex) => (
                  <LinearGradient
                    key={tagIndex}
                    colors={['#EEF2FF', '#E0E7FF']}
                    style={styles.tag}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <ThemedText style={styles.tagText}>{tag}</ThemedText>
                  </LinearGradient>
                ))}
              </View>
            )}

            {/* Arrow Indicator */}
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Modern Header with Gradient */}
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <ThemedText style={styles.headerTitle}>All Projects</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {projects.length > 0 ? `${projects.length} projects available` : 'Discover opportunities'}
            </ThemedText>
          </View>
          <View style={styles.headerRight} />
        </LinearGradient>

        {/* Modern Search Bar with Glassmorphism */}
        <View style={styles.searchContainer}>
          <Animated.View
            style={[
              styles.searchBarWrapper,
              {
                transform: [{ scale: searchScaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F9FAFB']}
              style={styles.searchBar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.searchIconContainer}>
                <Ionicons name="search" size={22} color="#7C3AED" />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search projects..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    handleSearch();
                  }}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={22} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Modern Filter Chips */}
        <View style={styles.filtersSection}>
          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollView}
            contentContainerStyle={styles.filterContent}
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <TouchableOpacity
                  key={cat.value || 'all'}
                  onPress={() => setSelectedCategory(cat.value)}
                  activeOpacity={0.8}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={cat.gradient}
                      style={styles.filterChipActive}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name={cat.icon as any} size={16} color="#FFFFFF" />
                      <ThemedText style={styles.filterChipTextActive}>
                        {cat.label}
                      </ThemedText>
                    </LinearGradient>
                  ) : (
                    <View style={styles.filterChip}>
                      <Ionicons name={cat.icon as any} size={16} color="#6B7280" />
                      <ThemedText style={styles.filterChipText}>
                        {cat.label}
                      </ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Difficulty & Sort Row */}
          <View style={styles.filterRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.difficultyScrollView}
              contentContainerStyle={styles.difficultyContent}
            >
              {difficulties.map((diff) => {
                const isActive = selectedDifficulty === diff.value;
                return (
                  <TouchableOpacity
                    key={diff.value || 'all'}
                    onPress={() => setSelectedDifficulty(diff.value)}
                    activeOpacity={0.8}
                  >
                    {isActive && diff.value ? (
                      <LinearGradient
                        colors={[`${diff.color}20`, `${diff.color}10`]}
                        style={styles.difficultyChipActive}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <ThemedText
                          style={[styles.difficultyChipTextActive, { color: diff.color }]}
                        >
                          {diff.label}
                        </ThemedText>
                      </LinearGradient>
                    ) : (
                      <View style={styles.difficultyChip}>
                        <ThemedText style={styles.difficultyChipText}>
                          {diff.label}
                        </ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Sort Button */}
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => {
                const options = ['newest', 'popular', 'trending'];
                const currentIndex = options.indexOf(sortBy);
                const nextIndex = (currentIndex + 1) % options.length;
                setSortBy(options[nextIndex] as any);
              }}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#F3F4F6', '#E5E7EB']}
                style={styles.sortButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="swap-vertical" size={18} color="#7C3AED" />
                <ThemedText style={styles.sortText}>
                  {sortBy === 'newest' ? 'Newest' : sortBy === 'popular' ? 'Popular' : 'Trending'}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Projects List */}
        {loading && projects.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <ThemedText style={styles.loadingText}>Loading projects...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <LinearGradient
              colors={['#FEE2E2', '#FECACA']}
              style={styles.errorIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
            </LinearGradient>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadProjects(1, true)}
            >
              <LinearGradient
                colors={['#7C3AED', '#6D28D9']}
                style={styles.retryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : projects.length === 0 ? (
          <View style={styles.centerContainer}>
            <LinearGradient
              colors={['#EEF2FF', '#E0E7FF']}
              style={styles.emptyIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="briefcase-outline" size={64} color="#7C3AED" />
            </LinearGradient>
            <ThemedText style={styles.emptyText}>No projects found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Try adjusting your filters or search query
            </ThemedText>
          </View>
        ) : (
          <ScrollView
            style={styles.projectsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#7C3AED" />
            }
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const paddingToBottom = 20;
              if (
                layoutMeasurement.height + contentOffset.y >=
                contentSize.height - paddingToBottom
              ) {
                handleLoadMore();
              }
            }}
            scrollEventThrottle={400}
            contentContainerStyle={styles.projectsListContent}
          >
            {projects.map((project) => {
              if (!cardAnims[project._id]) {
                cardAnims[project._id] = new Animated.Value(1);
              }
              return (
                <ProjectCard
                  key={project._id}
                  project={project}
                  cardAnim={cardAnims[project._id]}
                  onPress={() => handleProjectPress(project)}
                  getCategoryGradient={getCategoryGradient}
                  getDifficultyColor={getDifficultyColor}
                  getCategoryIcon={getCategoryIcon}
                />
              );
            })}

            {hasMore && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#7C3AED" />
                <ThemedText style={styles.loadMoreText}>Loading more projects...</ThemedText>
              </View>
            )}
          </ScrollView>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: Platform.OS === 'ios' ? 24 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.2,
  },
  headerRight: {
    width: 44,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBarWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderRadius: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  searchIconContainer: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  filtersSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 16,
  },
  filterScrollView: {
    marginBottom: 12,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  filterChipActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.2,
  },
  filterChipTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  difficultyScrollView: {
    flex: 1,
  },
  difficultyContent: {
    gap: 8,
  },
  difficultyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  difficultyChipActive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
  },
  difficultyChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  difficultyChipTextActive: {
    fontSize: 13,
    fontWeight: '700',
  },
  sortButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sortButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
    letterSpacing: 0.2,
  },
  projectsList: {
    flex: 1,
  },
  projectsListContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  projectCard: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    top: -40,
    right: -40,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
    bottom: -20,
    left: -20,
  },
  featuredBadgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  featuredText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    zIndex: 5,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  difficultyBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
  cardDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
    zIndex: 5,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    zIndex: 5,
    gap: 12,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  rewardAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  statsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 8,
    zIndex: 5,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
    letterSpacing: 0.2,
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  errorIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 28,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  emptySubtext: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
});
