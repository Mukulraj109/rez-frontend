import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  Clipboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { PartnerPageState, ClaimableOffer, RewardTask, OrderMilestone, JackpotMilestone } from '@/types/partner.types';
import { partnerLevels } from '@/data/partnerData';
import partnerApi from '@/services/partnerApi';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import toast from '@/utils/toast';

// Import all partner components
import JackpotTimeline from '@/components/partner/JackpotTimeline';
import MilestoneTracker from '@/components/partner/MilestoneTracker';
import RewardTasks from '@/components/partner/RewardTasks';
import BenefitsTable from '@/components/partner/BenefitsTable';
import FAQAccordion from '@/components/partner/FAQAccordion';
import OffersGrid from '@/components/partner/OffersGrid';

export default function PartnerProfilePage() {
  const { goBack } = useSafeNavigation();
  const [partnerState, setPartnerState] = useState<PartnerPageState>({
    profile: null,
    milestones: [],
    tasks: [],
    jackpotProgress: [],
    claimableOffers: [],
    faqs: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Fetch real data from backend API
    loadPartnerData();
  }, []);

  const loadPartnerData = async () => {
    try {
      setPartnerState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch both dashboard and benefits data
      const [dashboardResponse, benefitsResponse] = await Promise.all([
        partnerApi.getDashboard(),
        partnerApi.getBenefits()
      ]);

      if (dashboardResponse.success && dashboardResponse.data) {
        // Get levels with benefits from backend
        const levelsWithBenefits = benefitsResponse.success && benefitsResponse.data 
          ? benefitsResponse.data.allLevels 
          : [];
        
        setPartnerState({
          profile: dashboardResponse.data.profile,
          milestones: dashboardResponse.data.milestones,
          tasks: dashboardResponse.data.tasks,
          jackpotProgress: dashboardResponse.data.jackpotProgress,
          claimableOffers: dashboardResponse.data.claimableOffers,
          faqs: dashboardResponse.data.faqs,
          levels: levelsWithBenefits, // Add levels with actual benefit data
          loading: false,
          error: null,
        });
      } else {
        throw new Error(dashboardResponse.error || 'Failed to load partner data');
      }
    } catch (error) {
      console.error('Error loading partner data:', error);
      setPartnerState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load partner data',
      }));
    }
  };

  const handleGoBack = () => {
    goBack('/profile' as any);
  };

  const handleClaimReward = async (milestoneId: string) => {
    try {
      const response = await partnerApi.claimMilestoneReward(milestoneId);

      if (response.success) {
        Alert.alert('Reward Claimed!', response.data?.message || 'Your reward has been successfully claimed.', [
          { text: 'OK', onPress: () => loadPartnerData() }
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to claim reward');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      Alert.alert('Error', 'Failed to claim reward. Please try again.');
    }
  };

  const handleCompleteTask = (taskId: string) => {
    Alert.alert('Task Started!', 'Keep completing this task to earn your reward.', [
      { text: 'OK', onPress: () => console.log('Task started:', taskId) }
    ]);
  };

  const handleClaimTaskReward = async (taskId: string) => {
    try {
      const response = await partnerApi.claimTaskReward(taskId);

      if (response.success) {
        Alert.alert('Task Reward Claimed!', response.data?.message || 'Congratulations! Your task reward has been claimed.', [
          { text: 'OK', onPress: () => loadPartnerData() }
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to claim task reward');
      }
    } catch (error) {
      console.error('Error claiming task reward:', error);
      Alert.alert('Error', 'Failed to claim task reward. Please try again.');
    }
  };

  const handleClaimOffer = async (offerId: string) => {
    try {
      const response = await partnerApi.claimOffer(offerId);

      if (response.success && response.data) {
        const voucherCode = response.data.voucher.code;
        const expiryDate = new Date(response.data.voucher.expiryDate).toLocaleDateString();
        
        // Reload data to show updated claimed status
        await loadPartnerData();
        
        if (Platform.OS === 'web') {
          // Copy voucher code to clipboard
          navigator.clipboard.writeText(voucherCode).then(() => {
            toast.success(
              `Voucher Code: ${voucherCode} (Copied!)\n\nUse this code during checkout. Expires: ${expiryDate}`,
              { duration: 8000 }
            );
          }).catch(() => {
            toast.success(
              `Voucher Code: ${voucherCode}\n\nUse this code during checkout. Expires: ${expiryDate}`,
              { duration: 8000 }
            );
          });
        } else {
          Alert.alert(
            '🎉 Offer Claimed!',
            `Your exclusive offer has been activated.\n\nVoucher Code: ${voucherCode}\nExpires: ${expiryDate}\n\nUse this code during checkout to get your discount!`,
            [
              { text: 'Copy Code', onPress: () => Clipboard.setString(voucherCode) },
              { text: 'OK', style: 'default' }
            ]
          );
        }
      } else {
        const errorMsg = response.error || 'Failed to claim offer';
        if (Platform.OS === 'web') {
          toast.error(errorMsg);
        } else {
          Alert.alert('Error', errorMsg);
        }
      }
    } catch (error) {
      const errorMsg = 'Failed to claim offer. Please try again.';
      if (Platform.OS === 'web') {
        toast.error(errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
    }
  };

  const handleViewOfferTerms = (offer: ClaimableOffer) => {
    Alert.alert('Terms & Conditions', offer.termsAndConditions.join('\n\n'), [
      { text: 'Close', style: 'default' }
    ]);
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Redirecting to customer support chat...', [
      { text: 'OK', onPress: () => console.log('Opening support chat') }
    ]);
  };

  const handleJackpotMilestonePress = async (milestone: JackpotMilestone) => {
    // If already claimed, just show info
    if (milestone.claimedAt) {
      Alert.alert(
        'Already Claimed',
        `You claimed this jackpot reward on ${new Date(milestone.claimedAt).toLocaleDateString()}`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // If not achieved yet, show progress
    if (!milestone.achieved) {
      const remaining = milestone.spendAmount - (partnerState.profile?.totalSpent || 0);
      Alert.alert(
        milestone.title,
        `${milestone.description}\n\nSpend ₹${remaining.toLocaleString()} more to unlock this jackpot!`,
        [{ text: 'Close', style: 'default' }]
      );
      return;
    }

    // If achieved but not claimed, allow claiming
    Alert.alert(
      'Claim Jackpot Reward?',
      `${milestone.title}\n\nReward: ${milestone.reward.title}\nValue: ₹${milestone.reward.value}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Claim Now', 
          onPress: async () => {
            try {
              const response = await partnerApi.claimJackpotReward(milestone.spendAmount);
              
              if (response.success) {
                Alert.alert(
                  '🎉 Jackpot Claimed!', 
                  `Congratulations! ₹${milestone.reward.value} has been added to your wallet!`,
                  [{ text: 'Awesome!', onPress: () => loadPartnerData() }]
                );
              } else {
                Alert.alert('Error', response.error || 'Failed to claim jackpot reward');
              }
            } catch (error) {
              console.error('Error claiming jackpot reward:', error);
              Alert.alert('Error', 'Failed to claim jackpot reward. Please try again.');
            }
          },
          style: 'default'
        }
      ]
    );
  };

  const handleUpgradeLevel = (targetLevel: any) => {
    Alert.alert(
      'Upgrade to ' + targetLevel.name,
      `Requirements: ${targetLevel.requirements.orders} orders in ${targetLevel.requirements.timeframe} days`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  // --- SAFETY: compute values with optional chaining + fallbacks to avoid "possibly undefined" TS errors ---
  const profile = partnerState.profile;
  // orders required for current level (fallback 0)
  const ordersRequired = profile?.level?.requirements?.orders ?? 0;
  // orders completed in current level (fallback 0)
  const ordersThisLevel = profile?.ordersThisLevel ?? 0;
  // days remaining (fallback 44 as in original UI)
  const daysRemaining = profile?.daysRemaining ?? 44;
  // level name fallback
  const levelName = profile?.level?.name ?? 'Partner';
  // level number fallback for BenefitsTable prop
  const currentLevelNumber = profile?.level?.level ?? 1;

  if (partnerState.loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        <LinearGradient
          colors={['#8B5CF6', '#A78BFA']}
          style={styles.loadingContainer}
        >
          <Text style={styles.loadingText}>Loading Partner Profile...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (partnerState.error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{partnerState.error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setPartnerState(prev => ({ ...prev, loading: true }))}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      {/* Modern Header with Blur Effect */}
      <LinearGradient colors={['#8B5CF6', '#A78BFA', '#C084FC']} style={styles.modernHeader}>
        <View style={styles.headerOverlay}>
          <TouchableOpacity onPress={handleGoBack} style={styles.modernBackButton}>
            <View style={styles.backButtonContainer}>
              <Ionicons name="arrow-back" size={20} color="white" />
            </View>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.modernHeaderTitle}>Partner Profile</Text>
            <Text style={styles.headerSubtitle}>Rewards & Benefits Dashboard</Text>
          </View>
          <TouchableOpacity 
            style={styles.headerMenuButton}
            onPress={() => {
              Alert.alert(
                'Partner Menu',
                'Choose an option',
                [
                  { text: 'View Statistics', onPress: () => router.push('/profile/partner/stats' as any) },
                  { text: 'Program Rules', onPress: () => router.push('/profile/partner/rules' as any) },
                  { text: 'Refer Friends', onPress: () => router.push('/referral' as any) },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Floating decorative elements */}
        <View style={styles.floatingElement1} />
        <View style={styles.floatingElement2} />
        <View style={styles.floatingElement3} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Partner Card with Glass Effect */}
        <View style={styles.modernPartnerCard}>
          <LinearGradient
            colors={['#8B5CF6', '#A78BFA', '#C084FC']}
            style={styles.modernPartnerCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Glass overlay effect */}
            <View style={styles.glassOverlay}>
            <View style={styles.partnerInfo}>
              <View style={styles.avatarContainer}>
                {profile?.avatar ? (
                  <Image
                    source={{ 
                      uri: profile.avatar,
                      cache: 'reload' // Force reload to show updated image
                    }}
                    style={styles.avatar}
                    key={profile.avatar} // Force re-render when avatar changes
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarInitials}>
                      {profile?.name?.substring(0, 2).toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>
                    {levelName}
                  </Text>
                </View>
              </View>
              <View style={styles.partnerDetails}>
                <Text style={styles.partnerName}>
                  {profile?.name ?? 'Rajaul'}
                </Text>
                <Text style={styles.partnerValidity}>
                  Valid till {profile?.validUntil ?? '15 Feb 25'}
                </Text>
                <Text style={styles.partnerProgress}>
                  {/* use safe computed values */}
                  Just {Math.max(0, ordersRequired - ordersThisLevel)} purchases within {daysRemaining} days before you become a third wave influencer
                </Text>
                <Text style={styles.lastReset}>
                  Last reset in {profile?.daysRemaining ?? 17} nov 24
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.modernBenefitsButton}
              onPress={() => {
                const benefits = profile?.level?.benefits || profile?.currentBenefits || [];
                const benefitsList = Array.isArray(benefits) ? benefits.join('\n• ') : 'No benefits available';
                Alert.alert(
                  'Your Current Benefits',
                  `As a ${levelName}, you enjoy:\n\n• ${benefitsList}`,
                  [{ text: 'Great!', style: 'default' }]
                );
              }}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.benefitsButtonGradient}
              >
                <Ionicons name="gift" size={16} color="white" />
                <Text style={styles.modernBenefitsText}>Current Benefits</Text>
                <Ionicons name="chevron-forward" size={16} color="white" />
              </LinearGradient>
            </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Enhanced Level Criteria Section */}
        <View style={styles.modernSection}>
          <View style={styles.modernSectionHeader}>
            <View style={styles.sectionIconContainer}>
              <LinearGradient colors={['#8B5CF6', '#A78BFA']} style={styles.sectionIconGradient}>
                <Ionicons name="trophy" size={16} color="white" />
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.modernSectionTitle}>Level Criteria</Text>
              <Text style={styles.sectionDescription}>Track your progress and unlock rewards</Text>
            </View>
          </View>
          <View style={styles.modernLevelOptions}>
            <TouchableOpacity 
              style={styles.modernUpgradeButton}
              onPress={() => {
                const nextLevel = profile?.level?.level ? profile.level.level + 1 : 2;
                const levelNames = ['Partner', 'Influencer', 'Ambassador'];
                const nextLevelName = levelNames[nextLevel - 1] || 'Next Level';
                Alert.alert(
                  `Upgrade to ${nextLevelName}`,
                  `Complete ${profile?.level?.requirements?.orders || 0} more orders within ${profile?.daysRemaining || 0} days to upgrade to ${nextLevelName} level and unlock exclusive benefits!`,
                  [{ text: 'Got It!', style: 'default' }]
                );
              }}
            >
              <LinearGradient colors={['#8B5CF6', '#A78BFA']} style={styles.upgradeButtonGradient}>
                <Ionicons name="trending-up" size={16} color="white" />
                <Text style={styles.modernUpgradeButtonText}>Upgrade Level</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modernMaintainButton}
              onPress={() => {
                Alert.alert(
                  'Maintain Your Level',
                  `To maintain your current level, complete ${profile?.level?.requirements?.orders || 0} orders every ${profile?.level?.requirements?.timeframe || 44} days. Keep shopping to retain your benefits!`,
                  [{ text: 'Understood', style: 'default' }]
                );
              }}
            >
              <View style={styles.maintainButtonContainer}>
                <Ionicons name="shield-checkmark" size={16} color="#8B5CF6" />
                <Text style={styles.modernMaintainButtonText}>Maintain Level</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Level Cards */}
          <View style={styles.levelCards}>
            {profile && [
              { level: 1, name: 'Partner', orders: 15, days: 44, current: true },
              { level: 2, name: 'Influencer', orders: 45, days: 44, locked: true },
              { level: 3, name: 'Ambassador', orders: 0, days: 0, future: true }
            ].map((level) => (
              <View key={level.level} style={[
                styles.modernLevelCard,
                level.current && styles.currentModernLevelCard,
                level.locked && styles.lockedModernLevelCard
              ]}>
                {level.current && <View style={styles.currentLevelBadge} />}
                <Text style={[
                  styles.levelCardTitle,
                  level.current && styles.currentLevelCardTitle
                ]}>
                  Level {level.level}
                </Text>
                <Text style={[
                  styles.levelCardName,
                  level.current && styles.currentLevelCardName
                ]}>
                  {level.name}
                </Text>
                {!level.future && (
                  <View style={styles.levelRequirement}>
                    <Text style={[
                      styles.levelRequirementNumber,
                      level.current && styles.currentLevelRequirementNumber
                    ]}>
                      {level.orders}
                    </Text>
                    <Text style={[
                      styles.levelRequirementText,
                      level.current && styles.currentLevelRequirementText
                    ]}>
                      {level.days} days
                    </Text>
                  </View>
                )}
                {level.future && (
                  <Text style={styles.futureLevel}>
                    You will{'\n'}become an{'\n'}Ambassador
                  </Text>
                )}
                {level.locked && (
                  <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Modern Note Section with Enhanced Design */}
        <View style={styles.modernNoteSection}>
          <LinearGradient colors={['#F0F9FF', '#E0F2FE']} style={styles.noteSectionGradient}>
            <View style={styles.modernNoteHeader}>
              <View style={styles.noteIconContainer}>
                <Ionicons name="information-circle" size={18} color="#0EA5E9" />
              </View>
              <View>
                <Text style={styles.modernNoteTitle}>Important Information</Text>
                <Text style={styles.noteSubtitle}>Level maintenance requirements</Text>
              </View>
            </View>
            <View style={styles.noteContent}>
              <View style={styles.notePoint}>
                <View style={styles.bulletPoint} />
                <Text style={styles.modernNoteText}>
                  Level progress resets when upgrading - maintain your achievements through consistent activity.
                </Text>
              </View>
              <View style={styles.notePoint}>
                <View style={styles.bulletPoint} />
                <Text style={styles.modernNoteText}>
                  Failure to meet requirements within the timeframe will automatically revert you to the previous level.
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Jackpot Timeline */}
        <JackpotTimeline 
          milestones={partnerState.jackpotProgress}
          currentSpent={profile?.totalSpent || 0}
          onMilestonePress={handleJackpotMilestonePress}
        />

        {/* Milestone Tracker */}
        <MilestoneTracker 
          milestones={partnerState.milestones}
          currentOrders={profile?.totalOrders ?? 0}
          onClaimReward={handleClaimReward}
        />

        {/* Reward Tasks */}
        <RewardTasks 
          tasks={partnerState.tasks}
          onCompleteTask={handleCompleteTask}
          onClaimReward={handleClaimTaskReward}
        />

        {/* Benefits Comparison Table */}
        <BenefitsTable 
          levels={partnerState.levels || partnerLevels}
          currentLevel={currentLevelNumber}
          onUpgradePress={handleUpgradeLevel}
        />

        {/* Claimable Offers */}
        <OffersGrid 
          offers={partnerState.claimableOffers}
          onClaimOffer={handleClaimOffer}
          onViewTerms={handleViewOfferTerms}
        />

        {/* FAQ Section */}
        <FAQAccordion 
          faqs={partnerState.faqs}
          onContactPress={handleContactSupport}
        />

        {/* Spacer for bottom padding */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modernHeader: {
    paddingTop: Platform.OS === 'ios' ? 20 : 30,
    paddingBottom: 24,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  modernBackButton: {
    zIndex: 3,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  modernHeaderTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  headerMenuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  floatingElement1: {
    position: 'absolute',
    top: 20,
    right: 60,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  floatingElement2: {
    position: 'absolute',
    top: 80,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 1,
  },
  floatingElement3: {
    position: 'absolute',
    bottom: -10,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  modernPartnerCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    marginTop: 0, // Remove overlap to fix header issue
    marginHorizontal: 4,
    elevation: 8,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(139, 92, 246, 0.25)',
      },
      default: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
    }),
  },
  modernPartnerCardGradient: {
    padding: 29,
    position: 'relative',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 39,
  },
  partnerInfo: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
    marginLeft:-1,
    paddingTop:-10
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  levelBadgeText: {
    color: '#8B5CF6',
    fontSize: 10,
    fontWeight: '600',
  },
  partnerDetails: {
    flex: 1,
  },
  partnerName: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  partnerValidity: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 10,
    paddingBottom:20
  },
  partnerProgress: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 16,
    marginBottom: 4,
  },
  lastReset: {
    color: 'white',
    fontSize: 11,
    opacity: 0.7,
  },
  modernBenefitsButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  benefitsButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  modernBenefitsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  modernSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
    }),
  },
  modernSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIconContainer: {
    marginRight: 12,
  },
  sectionIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  modernLevelOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  modernUpgradeButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  modernUpgradeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modernMaintainButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  maintainButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    backgroundColor: '#F8FAFC',
  },
  modernMaintainButtonText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  levelCards: {
    flexDirection: 'row',
    gap: 12,
  },
  modernLevelCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  currentModernLevelCard: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    elevation: 4,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(139, 92, 246, 0.3)',
      },
      default: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  currentLevelBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: 'white',
  },
  lockedModernLevelCard: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  levelCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  currentLevelCardTitle: {
    color: 'white',
  },
  levelCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  currentLevelCardName: {
    color: 'white',
  },
  levelRequirement: {
    alignItems: 'center',
  },
  levelRequirementNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  currentLevelRequirementNumber: {
    color: 'white',
  },
  levelRequirementText: {
    fontSize: 12,
    color: '#6B7280',
  },
  currentLevelRequirementText: {
    color: 'white',
  },
  futureLevel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 14,
  },
  modernNoteSection: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  noteSectionGradient: {
    padding: 20,
  },
  modernNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  noteIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modernNoteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  noteSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  noteContent: {
    gap: 12,
  },
  notePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0EA5E9',
    marginTop: 6,
    marginRight: 12,
  },
  modernNoteText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    flex: 1,
  },
  bottomSpacer: {
    height: 40,
  },
});
