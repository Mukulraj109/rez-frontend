import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  Share,
  Linking,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import gamificationApi, {
  CheckInReward,
  StreakData,
  AffiliateStats,
  PromotionalPoster,
  ShareSubmission,
  StreakBonus,
} from '@/services/gamificationApi';

const { width } = Dimensions.get('window');

// Default data (used as fallback)
const defaultCheckInRewardsData: CheckInReward[] = [
  { day: 1, coins: 10, claimed: false },
  { day: 2, coins: 15, claimed: false },
  { day: 3, coins: 20, claimed: false },
  { day: 4, coins: 25, claimed: false, today: true },
  { day: 5, coins: 30, claimed: false },
  { day: 6, coins: 40, claimed: false },
  { day: 7, coins: 100, claimed: false, bonus: true },
];

// Default promotional posters (fallback)
const defaultPosters: PromotionalPoster[] = [
  {
    id: '1',
    title: 'Mega Diwali Sale',
    subtitle: 'Up to 70% off + Extra Cashback',
    image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=500',
    colors: ['#F97316', '#EF4444'],
    shareBonus: 50,
  },
  {
    id: '2',
    title: 'Weekend Bonanza',
    subtitle: '3X Coins on All Purchases',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500',
    colors: ['#A855F7', '#EC4899'],
    shareBonus: 30,
  },
  {
    id: '3',
    title: 'New User Special',
    subtitle: 'Get Rs.500 Welcome Bonus',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=500',
    colors: ['#3B82F6', '#06B6D4'],
    shareBonus: 100,
  },
  {
    id: '4',
    title: 'Flash Sale Today',
    subtitle: 'Limited Time Mega Deals',
    image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=500',
    colors: ['#22C55E', '#14B8A6'],
    shareBonus: 40,
  },
];

// Default streak bonuses (fallback)
const defaultStreakBonuses: StreakBonus[] = [
  { days: 7, reward: 100, achieved: false },
  { days: 30, reward: 500, achieved: false },
  { days: 100, reward: 2000, achieved: false },
];

export default function DailyCheckInPage() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const postersYPosition = useRef(0);

  // API state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);

  const [checkInRewards, setCheckInRewards] = useState<CheckInReward[]>(defaultCheckInRewardsData);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState<PromotionalPoster | null>(null);

  // Data fetched from API
  const [promotionalPosters, setPromotionalPosters] = useState<PromotionalPoster[]>(defaultPosters);
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats>({
    totalShares: 0,
    appDownloads: 0,
    purchases: 0,
    commissionEarned: 0,
  });
  const [streakBonuses, setStreakBonuses] = useState<StreakBonus[]>(defaultStreakBonuses);

  // Fetch all check-in page data from APIs
  const fetchCheckInData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch all data in parallel for performance
      const [
        streakResponse,
        calendarResponse,
        affiliateResponse,
        postersResponse,
        submissionsResponse,
        bonusesResponse,
      ] = await Promise.all([
        gamificationApi.getStreakStatus(),
        gamificationApi.getWeeklyCalendar(),
        gamificationApi.getAffiliateStats(),
        gamificationApi.getPromotionalPosters(),
        gamificationApi.getShareSubmissions(),
        gamificationApi.getStreakBonuses(),
      ]);

      // Update streak data
      if (streakResponse.success && streakResponse.data) {
        const { currentStreak: streak, longestStreak, hasCheckedInToday: checkedIn, totalEarned: earned } = streakResponse.data;
        setCurrentStreak(streak);
        setBestStreak(longestStreak);
        setHasCheckedInToday(checkedIn);
        setTotalEarned(earned);
      }

      // Update calendar
      if (calendarResponse.success && calendarResponse.data) {
        setCheckInRewards(calendarResponse.data);
      }

      // Update affiliate stats
      if (affiliateResponse.success && affiliateResponse.data) {
        setAffiliateStats(affiliateResponse.data);
      }

      // Update promotional posters
      if (postersResponse.success && postersResponse.data) {
        setPromotionalPosters(postersResponse.data);
      }

      // Update submissions
      if (submissionsResponse.success && submissionsResponse.data) {
        setSubmissions(submissionsResponse.data);
      }

      // Update streak bonuses
      if (bonusesResponse.success && bonusesResponse.data) {
        setStreakBonuses(bonusesResponse.data);
      }
    } catch (error) {
      console.error('[DAILY CHECKIN] Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCheckInData();
  }, [fetchCheckInData]);

  const onRefresh = useCallback(() => {
    fetchCheckInData(true);
  }, [fetchCheckInData]);

  // Submission workflow states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitUrl, setSubmitUrl] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [submissions, setSubmissions] = useState<ShareSubmission[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [checkInStarted, setCheckInStarted] = useState(false);
  const [pendingCheckInReward, setPendingCheckInReward] = useState<CheckInReward | null>(null);

  const handleCheckIn = async () => {
    if (hasCheckedInToday || checkInLoading) return;

    const todayReward = checkInRewards.find(r => r.today);
    if (todayReward && !todayReward.claimed) {
      setCheckInStarted(true);
      setPendingCheckInReward(todayReward);
      // Scroll to promotional posters section
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: postersYPosition.current, animated: true });
      }, 100);
    }
  };

  const completeCheckIn = async () => {
    if (pendingCheckInReward) {
      try {
        setCheckInLoading(true);

        // Call API to perform check-in
        const response = await gamificationApi.performCheckIn();

        if (response.success && response.data) {
          setShowReward(true);
          setCurrentStreak(response.data.streak);
          setTotalEarned(prev => prev + response.data.totalEarned);
          setHasCheckedInToday(true);

          // Update the checkInRewards to mark as claimed
          setCheckInRewards(prev => prev.map(r =>
            r.day === pendingCheckInReward.day ? { ...r, claimed: true, today: false } : r
          ));

          setTimeout(() => {
            setShowReward(false);
          }, 3000);
        } else {
          Alert.alert('Check-in Failed', response.error || 'Please try again later');
        }
      } catch (error: any) {
        console.error('[DAILY CHECKIN] Check-in error:', error);
        Alert.alert('Error', error.message || 'Something went wrong');
      } finally {
        setCheckInLoading(false);
        setCheckInStarted(false);
        setPendingCheckInReward(null);
      }
    }
  };

  const handleSharePoster = async (poster: typeof promotionalPosters[0], platform: string) => {
    const affiliateCode = `REZ${Date.now().toString(36)}`;
    const shareUrl = `https://rez.app?ref=${affiliateCode}`;
    const shareText = `${poster.title} - ${poster.subtitle}! Download ReZ app and get amazing deals. Use my code: ${affiliateCode}`;

    try {
      if (platform === 'instagram') {
        // Copy to clipboard for Instagram
        Alert.alert('Link Copied!', 'Paste it in your Instagram story or post.');
      }

      // Use native share
      await Share.share({
        message: shareText + ' ' + shareUrl,
        title: poster.title,
      });

      // Increment share count
      setAffiliateStats(prev => ({
        ...prev,
        totalShares: prev.totalShares + 1,
      }));

      // Open submit modal after sharing
      setSelectedPlatform(platform);
      setShowSubmitModal(true);
      setSelectedPoster(null);
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleSubmitPost = async () => {
    if (!submitUrl.trim()) {
      Alert.alert('Error', 'Please enter the URL of your shared post');
      return;
    }

    // Validate URL format
    try {
      new URL(submitUrl);
    } catch {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    setSubmitting(true);

    try {
      // Call API to submit the post
      const response = await gamificationApi.submitSharePost({
        posterId: selectedPoster?.id || '',
        posterTitle: selectedPoster?.title || 'Promotional Poster',
        postUrl: submitUrl,
        platform: selectedPlatform,
        shareBonus: selectedPoster?.shareBonus || 0,
      });

      if (response.success && response.data) {
        // Add the new submission to the list
        setSubmissions(prev => [response.data!, ...prev]);

        // Update affiliate stats locally
        setAffiliateStats(prev => ({
          ...prev,
          totalShares: prev.totalShares + 1,
        }));

        setShowSubmitModal(false);
        setSubmitUrl('');
        setSelectedPlatform('');

        // Complete the check-in if it was started
        if (checkInStarted) {
          await completeCheckIn();
        }

        Alert.alert(
          'Success!',
          'Your post has been submitted for review! Check-in completed! You will receive share bonus coins once approved.'
        );
      } else {
        Alert.alert('Submission Failed', response.error || 'Please try again later');
      }
    } catch (error: any) {
      console.error('[DAILY CHECKIN] Submit error:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const todayReward = checkInRewards.find(r => r.today);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="calendar" size={20} color="#3B82F6" />
          <Text style={styles.headerTitle}>Daily Check-In & Earn</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
        }
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: 'rgba(249, 115, 22, 0.1)', borderColor: 'rgba(249, 115, 22, 0.2)' }]}>
            <Ionicons name="flame" size={20} color="#F97316" />
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <Ionicons name="cash" size={20} color="#10B981" />
            <Text style={styles.statValue}>Rs.{totalEarned}</Text>
            <Text style={styles.statLabel}>Total earned</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.2)' }]}>
            <Ionicons name="trending-up" size={20} color="#8B5CF6" />
            <Text style={styles.statValue}>{bestStreak}</Text>
            <Text style={styles.statLabel}>Best streak</Text>
          </View>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading check-in data...</Text>
          </View>
        )}

        {/* Info Banner */}
        {!loading && <View style={styles.infoBannerContainer}>
          {checkInStarted ? (
            <LinearGradient
              colors={['#F59E0B', '#F97316']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.infoBanner}
            >
              <View style={styles.infoBannerHeader}>
                <Ionicons name="gift" size={20} color="#FFFFFF" />
                <Text style={styles.infoBannerTitle}>Complete Your Check-In!</Text>
              </View>
              <Text style={styles.infoBannerText}>
                Share a promotional poster below and submit your post link to complete today's check-in and earn Rs.{pendingCheckInReward?.coins} coins!
              </Text>
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.infoBanner}
            >
              <View style={styles.infoBannerHeader}>
                <Ionicons name="gift" size={20} color="#FFFFFF" />
                <Text style={styles.infoBannerTitle}>How Daily Check-In Works!</Text>
              </View>
              <Text style={styles.infoBannerText}>
                1. Click "Check In Now" → 2. Share a promotional poster → 3. Submit your post link → 4. Earn coins + share bonus!
              </Text>
            </LinearGradient>
          )}
        </View>}

        {/* Check-In Calendar */}
        {!loading && (<>
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={16} color="#1F2937" />
            <Text style={styles.sectionTitle}>Daily Check-In Calendar</Text>
          </View>
          <View style={styles.calendarGrid}>
            {checkInRewards.filter(r => !r.bonus).map((reward) => (
              <View
                key={reward.day}
                style={[
                  styles.calendarDay,
                  reward.claimed && styles.calendarDayClaimed,
                  reward.today && !reward.claimed && styles.calendarDayToday,
                ]}
              >
                <Text style={styles.calendarDayLabel}>Day {reward.day}</Text>
                <View style={styles.calendarCoinContainer}>
                  <Ionicons
                    name="cash"
                    size={12}
                    color={reward.claimed ? '#10B981' : reward.today ? '#3B82F6' : '#F59E0B'}
                  />
                  <Text style={[
                    styles.calendarCoinText,
                    reward.claimed && { color: '#10B981' },
                    reward.today && !reward.claimed && { color: '#3B82F6' },
                  ]}>
                    Rs.{reward.coins}
                  </Text>
                </View>
                {reward.claimed && (
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                )}
              </View>
            ))}
          </View>
          {/* Bonus Day 7 */}
          {checkInRewards.filter(r => r.bonus).map((reward) => (
            <View
              key={reward.day}
              style={[
                styles.bonusDay,
                reward.claimed && styles.bonusDayClaimed,
              ]}
            >
              <Text style={styles.calendarDayLabel}>Day {reward.day}</Text>
              <View style={styles.calendarCoinContainer}>
                <Ionicons name="cash" size={14} color="#F59E0B" />
                <Text style={styles.bonusCoinText}>Rs.{reward.coins}</Text>
              </View>
              <Text style={styles.bonusLabel}>BONUS!</Text>
            </View>
          ))}
        </View>

        {/* Check-In Button */}
        <View style={styles.checkInButtonContainer}>
          <TouchableOpacity
            onPress={handleCheckIn}
            disabled={todayReward?.claimed || checkInStarted}
            style={[
              styles.checkInButton,
              todayReward?.claimed && styles.checkInButtonChecked,
              checkInStarted && styles.checkInButtonPending,
            ]}
          >
            <LinearGradient
              colors={
                todayReward?.claimed
                  ? ['#10B981', '#059669']
                  : checkInStarted
                    ? ['#F59E0B', '#D97706']
                    : ['#22C55E', '#16A34A']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.checkInButtonGradient}
            >
              {todayReward?.claimed ? (
                <View style={styles.checkInButtonContent}>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.checkInButtonText}>Checked In Today</Text>
                </View>
              ) : checkInStarted ? (
                <View style={styles.checkInButtonContent}>
                  <Ionicons name="time" size={20} color="#FFFFFF" />
                  <Text style={styles.checkInButtonText}>Share & Submit Post to Complete</Text>
                </View>
              ) : (
                <View style={styles.checkInButtonContent}>
                  <Ionicons name="calendar" size={20} color="#FFFFFF" />
                  <Text style={styles.checkInButtonText}>Check In Now (+Rs.{todayReward?.coins})</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Affiliate Stats Dashboard */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={16} color="#1F2937" />
            <Text style={styles.sectionTitle}>Your Affiliate Performance</Text>
          </View>
          <View style={styles.affiliateGrid}>
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.1)', 'rgba(6, 182, 212, 0.1)']}
              style={styles.affiliateCard}
            >
              <Ionicons name="share-social" size={20} color="#3B82F6" />
              <Text style={styles.affiliateValue}>{affiliateStats.totalShares}</Text>
              <Text style={styles.affiliateLabel}>Total Shares</Text>
            </LinearGradient>
            <LinearGradient
              colors={['rgba(34, 197, 94, 0.1)', 'rgba(16, 185, 129, 0.1)']}
              style={styles.affiliateCard}
            >
              <Ionicons name="people" size={20} color="#22C55E" />
              <Text style={styles.affiliateValue}>{affiliateStats.appDownloads}</Text>
              <Text style={styles.affiliateLabel}>App Downloads</Text>
            </LinearGradient>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
              style={styles.affiliateCard}
            >
              <Ionicons name="cart" size={20} color="#8B5CF6" />
              <Text style={styles.affiliateValue}>{affiliateStats.purchases}</Text>
              <Text style={styles.affiliateLabel}>Purchases Made</Text>
            </LinearGradient>
            <LinearGradient
              colors={['rgba(245, 158, 11, 0.1)', 'rgba(249, 115, 22, 0.1)']}
              style={styles.affiliateCard}
            >
              <Ionicons name="cash" size={20} color="#F59E0B" />
              <Text style={styles.affiliateValue}>Rs.{affiliateStats.commissionEarned}</Text>
              <Text style={styles.affiliateLabel}>Commission Earned</Text>
            </LinearGradient>
          </View>
          <View style={styles.affiliateTip}>
            <Text style={styles.affiliateTipText}>
              <Text style={styles.affiliateTipBold}>How it works: </Text>
              Share posters → Friends download ReZ → Earn Rs.100/download + 5% commission on their first 3 purchases!
            </Text>
          </View>
        </View>

        {/* Promotional Posters */}
        <View
          style={styles.sectionContainer}
          onLayout={(event) => {
            postersYPosition.current = event.nativeEvent.layout.y;
          }}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="share-social" size={16} color="#1F2937" />
            <Text style={styles.sectionTitle}>Share Promotional Posters</Text>
            {checkInStarted && (
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredBadgeText}>Required</Text>
              </View>
            )}
          </View>
          <View style={[
            styles.postersGrid,
            checkInStarted && styles.postersGridHighlight,
          ]}>
            {promotionalPosters.map((poster) => (
              <TouchableOpacity
                key={poster.id}
                style={styles.posterCard}
                onPress={() => setSelectedPoster(poster)}
              >
                <LinearGradient
                  colors={poster.colors}
                  style={styles.posterGradient}
                >
                  <Image
                    source={{ uri: poster.image }}
                    style={styles.posterImage}
                    blurRadius={2}
                  />
                  <View style={styles.posterContent}>
                    <Text style={styles.posterTitle}>{poster.title}</Text>
                    <Text style={styles.posterSubtitle}>{poster.subtitle}</Text>
                    <View style={styles.posterFooter}>
                      <View style={styles.posterBonus}>
                        <Text style={styles.posterBonusText}>+Rs.{poster.shareBonus} bonus</Text>
                      </View>
                      <Ionicons name="share-social" size={16} color="#FFFFFF" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submission History */}
        {submissions.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="link" size={16} color="#1F2937" />
              <Text style={styles.sectionTitle}>Your Submissions</Text>
            </View>
            {submissions.map((submission) => (
              <View key={submission.id} style={styles.submissionCard}>
                <View style={styles.submissionHeader}>
                  <View style={styles.submissionInfo}>
                    <Text style={styles.submissionTitle}>{submission.posterTitle}</Text>
                    <Text style={styles.submissionDate}>Submitted: {submission.submittedAt}</Text>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(submission.postUrl)}
                      style={styles.submissionLink}
                    >
                      <Ionicons name="link" size={12} color="#3B82F6" />
                      <Text style={styles.submissionLinkText}>View Post</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.submissionStatus}>
                    {submission.status === 'pending' && (
                      <View style={styles.statusBadgePending}>
                        <Ionicons name="time" size={12} color="#D97706" />
                        <Text style={styles.statusTextPending}>Pending</Text>
                      </View>
                    )}
                    {submission.status === 'approved' && (
                      <View style={styles.statusBadgeApproved}>
                        <Ionicons name="checkmark-circle" size={12} color="#059669" />
                        <Text style={styles.statusTextApproved}>Approved</Text>
                      </View>
                    )}
                    {submission.status === 'rejected' && (
                      <View style={styles.statusBadgeRejected}>
                        <Ionicons name="close-circle" size={12} color="#DC2626" />
                        <Text style={styles.statusTextRejected}>Rejected</Text>
                      </View>
                    )}
                    <Text style={styles.submissionBonus}>+Rs.{submission.shareBonus}</Text>
                  </View>
                </View>
                {submission.status === 'approved' && submission.approvedAt && (
                  <View style={styles.submissionFooter}>
                    <Ionicons name="trophy" size={12} color="#059669" />
                    <Text style={styles.submissionFooterText}>
                      Approved on {submission.approvedAt} - Rs.{submission.shareBonus} credited!
                    </Text>
                  </View>
                )}
                {submission.status === 'pending' && (
                  <View style={styles.submissionFooterPending}>
                    <Text style={styles.submissionFooterPendingText}>
                      Under review - You'll earn Rs.{submission.shareBonus} once approved!
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Streak Bonuses */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Streak Bonuses</Text>
          <View style={styles.streakList}>
            {streakBonuses.map((bonus, index) => {
              // Dynamic colors based on index
              const colors = [
                { bg: 'rgba(59, 130, 246, 0.2)', icon: '#3B82F6' },
                { bg: 'rgba(139, 92, 246, 0.2)', icon: '#8B5CF6' },
                { bg: 'rgba(236, 72, 153, 0.2)', icon: '#EC4899' },
              ];
              const colorSet = colors[index % colors.length];

              return (
                <View
                  key={bonus.days}
                  style={[
                    styles.streakCard,
                    bonus.achieved && styles.streakCardAchieved,
                  ]}
                >
                  <View style={[styles.streakIcon, { backgroundColor: colorSet.bg }]}>
                    <Ionicons
                      name={bonus.achieved ? "checkmark-circle" : "flame"}
                      size={20}
                      color={bonus.achieved ? "#10B981" : colorSet.icon}
                    />
                  </View>
                  <View style={styles.streakInfo}>
                    <Text style={styles.streakTitle}>{bonus.days}-Day Streak</Text>
                    <Text style={styles.streakDescription}>
                      {bonus.achieved ? 'Completed!' : `Complete ${bonus.days} days`}
                    </Text>
                  </View>
                  <Text style={[
                    styles.streakReward,
                    bonus.achieved && { color: '#10B981' },
                  ]}>
                    {bonus.achieved ? '✓ ' : ''}Rs.{bonus.reward}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Pro Tips</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Check in at the same time daily to build a habit</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Share posters daily to maximize your affiliate earnings</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Track your affiliate performance to see which posters work best</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Missing even one day resets your streak to zero</Text>
            </View>
          </View>
        </View>
        </>)}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Reward Animation Modal */}
      <Modal
        visible={showReward}
        transparent
        animationType="fade"
      >
        <View style={styles.rewardOverlay}>
          <LinearGradient
            colors={['#10B981', '#14B8A6']}
            style={styles.rewardCard}
          >
            <Ionicons name="cash" size={64} color="#FFFFFF" />
            <Text style={styles.rewardAmount}>+Rs.{pendingCheckInReward?.coins || todayReward?.coins}</Text>
            <Text style={styles.rewardText}>Check-in completed successfully!</Text>
            <Text style={styles.rewardSubtext}>Keep the streak going! Your post is under review for share bonus approval.</Text>
          </LinearGradient>
        </View>
      </Modal>

      {/* Share Poster Modal */}
      <Modal
        visible={!!selectedPoster}
        transparent
        animationType="slide"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedPoster(null)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {selectedPoster && (
              <>
                {/* Poster Preview */}
                <LinearGradient
                  colors={selectedPoster.colors}
                  style={styles.modalPosterPreview}
                >
                  <Image
                    source={{ uri: selectedPoster.image }}
                    style={styles.modalPosterImage}
                    blurRadius={2}
                  />
                  <View style={styles.modalPosterContent}>
                    <Text style={styles.modalPosterTitle}>{selectedPoster.title}</Text>
                    <Text style={styles.modalPosterSubtitle}>{selectedPoster.subtitle}</Text>
                  </View>
                </LinearGradient>

                {/* Share Options */}
                <View style={styles.shareOptions}>
                  <Text style={styles.shareOptionsTitle}>Share on Social Media</Text>
                  <View style={styles.shareButtonsGrid}>
                    <TouchableOpacity
                      style={[styles.shareButton, { backgroundColor: '#25D366' }]}
                      onPress={() => handleSharePoster(selectedPoster, 'whatsapp')}
                    >
                      <Text style={styles.shareButtonText}>WhatsApp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.shareButton, { backgroundColor: '#1877F2' }]}
                      onPress={() => handleSharePoster(selectedPoster, 'facebook')}
                    >
                      <Text style={styles.shareButtonText}>Facebook</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.shareButton, { backgroundColor: '#1DA1F2' }]}
                      onPress={() => handleSharePoster(selectedPoster, 'twitter')}
                    >
                      <Text style={styles.shareButtonText}>Twitter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.shareButtonInstagram}
                      onPress={() => handleSharePoster(selectedPoster, 'instagram')}
                    >
                      <Text style={styles.shareButtonText}>Instagram</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.shareBonusInfo}>
                    <Text style={styles.shareBonusText}>
                      +Rs.{selectedPoster.shareBonus} bonus when you submit your post link for approval!
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedPoster(null)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Submit Post URL Modal */}
      <Modal
        visible={showSubmitModal}
        transparent
        animationType="slide"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSubmitModal(false)}
        >
          <View style={styles.submitModalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.submitModalHeader}>
              <View style={styles.submitModalIcon}>
                <Ionicons name="link" size={24} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.submitModalTitle}>Submit Your Post</Text>
                <Text style={styles.submitModalSubtitle}>Paste the link to your shared post</Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>Post URL</Text>
            <TextInput
              style={styles.urlInput}
              value={submitUrl}
              onChangeText={setSubmitUrl}
              placeholder={`https://${selectedPlatform}.com/your-post-link`}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.submitTip}>
              <Text style={styles.submitTipText}>
                <Text style={{ fontWeight: '700' }}>How to get your post link:</Text>{'\n'}
                • WhatsApp/Facebook/Twitter: Click share button and copy link{'\n'}
                • Instagram: Go to your post → ··· → Share → Copy Link
              </Text>
            </View>

            <View style={styles.submitInfo}>
              <Text style={styles.submitInfoText}>
                Your post will be reviewed within 24 hours. You'll earn Rs.{selectedPoster?.shareBonus || 0} once approved!
              </Text>
            </View>

            <View style={styles.submitButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowSubmitModal(false);
                  setSubmitUrl('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmitPost}
                disabled={submitting}
              >
                <LinearGradient
                  colors={submitting ? ['#9CA3AF', '#9CA3AF'] : ['#3B82F6', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitButtonGradient}
                >
                  {submitting ? (
                    <View style={styles.submitButtonLoading}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Submitting...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>Submit for Review</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  infoBannerContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  infoBanner: {
    padding: 16,
    borderRadius: 16,
  },
  infoBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoBannerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  calendarDay: {
    width: (width - 32 - 48) / 6,
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  calendarDayClaimed: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  calendarDayToday: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  calendarDayLabel: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2,
  },
  calendarCoinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 2,
  },
  calendarCoinText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1F2937',
  },
  bonusDay: {
    marginTop: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  bonusDayClaimed: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  bonusCoinText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  bonusLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
  },
  checkInButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  checkInButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  checkInButtonChecked: {
    opacity: 0.8,
  },
  checkInButtonPending: {
    opacity: 0.9,
  },
  checkInButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkInButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  affiliateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  affiliateCard: {
    width: (width - 32 - 12) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  affiliateValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  affiliateLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  affiliateTip: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  affiliateTipText: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 18,
  },
  affiliateTipBold: {
    fontWeight: '700',
  },
  requiredBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  requiredBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  postersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  postersGridHighlight: {
    padding: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  posterCard: {
    width: (width - 32 - 12) / 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  posterGradient: {
    height: 128,
    position: 'relative',
  },
  posterImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  posterContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  posterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  posterSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  posterFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  posterBonus: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  posterBonusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submissionCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submissionInfo: {
    flex: 1,
  },
  submissionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  submissionDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  submissionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  submissionLinkText: {
    fontSize: 12,
    color: '#3B82F6',
  },
  submissionStatus: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  statusTextPending: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  statusBadgeApproved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusTextApproved: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  statusBadgeRejected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  statusTextRejected: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  submissionBonus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  submissionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submissionFooterText: {
    fontSize: 11,
    color: '#059669',
  },
  submissionFooterPending: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submissionFooterPendingText: {
    fontSize: 11,
    color: '#D97706',
  },
  streakList: {
    gap: 8,
    marginTop: 8,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  streakCardAchieved: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  streakIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  streakDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  streakReward: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
  },
  tipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipsList: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginTop: 6,
  },
  tipText: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
    lineHeight: 20,
  },
  rewardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  rewardCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    maxWidth: 320,
  },
  rewardAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  rewardSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalPosterPreview: {
    height: 192,
    position: 'relative',
    justifyContent: 'center',
    padding: 24,
  },
  modalPosterImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  modalPosterContent: {
    zIndex: 1,
  },
  modalPosterTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalPosterSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  shareOptions: {
    padding: 24,
  },
  shareOptionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  shareButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  shareButton: {
    width: (width - 48 - 12) / 2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonInstagram: {
    width: (width - 48 - 12) / 2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#833AB4',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shareBonusInfo: {
    padding: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    marginBottom: 16,
  },
  shareBonusText: {
    fontSize: 12,
    color: '#059669',
    textAlign: 'center',
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  submitModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  submitModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  submitModalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  submitModalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  urlInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 16,
  },
  submitTip: {
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    marginBottom: 16,
  },
  submitTipText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
  submitInfo: {
    padding: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    marginBottom: 20,
  },
  submitInfoText: {
    fontSize: 12,
    color: '#B45309',
    textAlign: 'center',
  },
  submitButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
