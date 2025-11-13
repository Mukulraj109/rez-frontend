import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert, Share, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { useEarnPageData } from '@/hooks/useEarnPageData';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useProfileMenu } from '@/contexts/ProfileContext';
import ProfileMenuModal from '@/components/profile/ProfileMenuModal';
import { profileMenuSections } from '@/data/profileData';
import earningsNotificationService from '@/services/earningsNotificationService';

// New Earn Page Components
import NotificationSection from '@/components/earnPage/NotificationSection';
import ProjectDashboard from '@/components/earnPage/ProjectDashboard';
import EarningsCard from '@/components/earnPage/EarningsCard';
import RecentProjectsSection from '@/components/earnPage/RecentProjectsSection';
import CategoryGrid from '@/components/earnPage/CategoryGrid';
import ReferralSection from '@/components/earnPage/ReferralSection';
import EarningOpportunities from '@/components/earnPage/EarningOpportunities';

import { Notification, Project, Category } from '@/types/earnPage.types';
import logger from '@/utils/logger';

export default function EarnScreen() {
  const router = useRouter();
  const { state, actions } = useEarnPageData();
  const { state: authState } = useAuth();
  const { user, isModalVisible, showModal, hideModal } = useProfile();
  const { handleMenuItemPress } = useProfileMenu();
  const [refreshing, setRefreshing] = React.useState(false);
  const [userPoints, setUserPoints] = React.useState(0);
  const [isLoadingCoins, setIsLoadingCoins] = React.useState(false);

  // Load wallet balance (coins) on mount
  React.useEffect(() => {
    if (authState.user) {
      loadWalletBalance();
    }
  }, [authState.user]);

  // Set up earnings notifications
  useEffect(() => {
    // Request notification permissions on mount
    earningsNotificationService.requestPermissions();

    // Set up notification listeners
    earningsNotificationService.setupListeners(
      (notification) => {
        // Handle notification received while app is in foreground
        logger.debug('📬 [EARN] Notification received:', notification);
      },
      (response) => {
        // Handle notification tap
        const data = response.notification.request.content.data;
        logger.debug('👆 [EARN] Notification tapped:', data);
        
        // Navigate based on notification type
        if (data?.type === 'project_approved' || data?.type === 'project_rejected') {
          router.push('/projects' as any);
        } else if (data?.type === 'withdrawal') {
          router.push('/earnings-history' as any);
        }
      }
    );

    return () => {
      earningsNotificationService.removeListeners();
    };
  }, [router]);

  const loadWalletBalance = async () => {
    try {
      setIsLoadingCoins(true);
      const walletApi = require('@/services/walletApi').default;
      const response = await walletApi.getBalance();
      
      if (response.success && response.data) {
        // Get wasil coin balance (same as homepage)
        const wasilCoin = response.data.coins.find((c: any) => c.type === 'wasil');
        const actualWalletCoins = wasilCoin?.amount || 0;
        setUserPoints(actualWalletCoins);
      }
    } catch (error) {
      logger.error('❌ [EARN PAGE] Failed to load wallet balance:', error);
      setUserPoints(0);
    } finally {
      setIsLoadingCoins(false);
    }
  };

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await actions.refreshData();
      // Also refresh wallet balance
      if (authState.user) {
        await loadWalletBalance();
      }
    } catch (error) {
      logger.error('Failed to refresh earn data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [actions, authState.user]);

  // Notification handlers
  const handleNotificationPress = React.useCallback(async (notification: Notification) => {
    await actions.markNotificationAsRead(notification.id);
    Alert.alert(notification.title, notification.description);
  }, [actions]);

  // Project handlers
  const handleStartProject = React.useCallback(async (project: Project) => {
    // Navigate to project detail page and auto-open the dynamic form
    router.push({
      pathname: '/project-detail',
      params: {
        projectId: project.id,
        autoOpenForm: 'true', // Auto-open the form
      },
    } as any);
  }, [router]);

  const handleProjectPress = React.useCallback((project: Project) => {
    // Navigate directly to project detail page
    router.push({
      pathname: '/project-detail',
      params: {
        projectId: project.id,
      },
    } as any);
  }, [router]);

  const handleStatusPress = React.useCallback((status: string) => {
    // Map status to filter parameters
    let filterParams: any = {
      status: 'active', // Default to active projects
    };

    switch (status) {
      case 'complete-now':
        // Show active projects user hasn't started
        filterParams.status = 'active';
        filterParams.userSubmissionStatus = 'none'; // No submission yet
        break;
      case 'in-review':
        // Show projects with submissions in pending or under_review
        filterParams.userSubmissionStatus = 'pending'; // pending or under_review
        break;
      case 'completed':
        // Show projects with approved submissions
        filterParams.userSubmissionStatus = 'approved';
        break;
      default:
        filterParams.status = 'active';
    }

    // Navigate to projects page with status filter
    router.push({
      pathname: '/projects',
      params: {
        filterStatus: status,
        ...filterParams
      }
    } as any);
  }, [router]);

  const handleSeeWallet = React.useCallback(() => {
    router.push('/earnings-history' as any);
  }, [router]);

  const handleCategoryPress = React.useCallback((category: Category) => {
    Alert.alert(
      category.name,
      `${category.description}\n\n${category.projectCount} projects available\nAverage payment: ₹${category.averagePayment}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Projects', onPress: () => actions.filterProjectsByCategory(category.id) },
      ]
    );
  }, [actions]);

  const handleShareReferral = React.useCallback(async () => {
    try {
      const referralLink = await actions.shareReferralLink();
      await Share.share({
        message: `Join me on this amazing earning platform! Use my referral link: ${referralLink}`,
        url: referralLink,
      });
    } catch (error) {
      logger.error('Failed to share referral link:', error);
    }
  }, [actions]);

  const handleLearnMoreReferral = React.useCallback(() => {
    Alert.alert(
      'Referral Program',
      'Earn ₹50 for each friend you refer who completes their first project. Start sharing your link now!',
      [{ text: 'Got it!' }]
    );
  }, []);

  const handleSeeAllProjects = React.useCallback(() => {
    router.push('/projects' as any);
  }, [router]);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#8B5CF6"
          colors={['#8B5CF6']}
        />
      }
    >
      {/* Header */}
      <LinearGradient 
        colors={['#8B5CF6', '#A855F7', '#9333EA']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.headerTitle}>Earn</ThemedText>
          </View>

          <View style={styles.headerRight}>
            {/* Coin Balance */}
            <TouchableOpacity
              style={styles.coinsContainer}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  setTimeout(() => router.push('/CoinPage' as any), 50);
                } else {
                  router.push('/CoinPage' as any);
                }
              }}
              activeOpacity={Platform.OS === 'ios' ? 0.6 : 0.7}
              delayPressIn={Platform.OS === 'ios' ? 50 : 0}
              accessibilityLabel={`Loyalty points: ${isLoadingCoins ? 'Loading' : userPoints}`}
              accessibilityRole="button"
              accessibilityHint="Double tap to view your loyalty points and rewards details"
            >
              <Ionicons name="star" size={18} color="#FFD700" />
              <ThemedText style={styles.coinsText}>
                {isLoadingCoins ? '...' : userPoints}
              </ThemedText>
            </TouchableOpacity>

            {/* Cart Icon */}
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === 'ios') {
                  setTimeout(() => router.push('/CartPage' as any), 50);
                } else {
                  router.push('/CartPage' as any);
                }
              }}
              activeOpacity={Platform.OS === 'ios' ? 0.6 : 0.7}
              delayPressIn={Platform.OS === 'ios' ? 50 : 0}
              style={styles.cartButton}
              accessibilityLabel="Shopping cart"
              accessibilityRole="button"
              accessibilityHint="Double tap to view your shopping cart"
            >
              <Ionicons name="cart-outline" size={24} color="white" />
            </TouchableOpacity>

            {/* Profile Avatar */}
            <TouchableOpacity
              style={styles.profileAvatar}
              onPress={() => {
                // Only open modal if user is authenticated
                if (authState.isAuthenticated && authState.user) {
                  if (Platform.OS === 'ios') {
                    setTimeout(() => showModal(), 50);
                  } else {
                    showModal();
                  }
                }
              }}
              activeOpacity={0.7}
              accessibilityLabel="User profile menu"
              accessibilityRole="button"
              accessibilityHint="Double tap to open profile menu and account settings"
            >
              <ThemedText style={styles.profileText}>
                {user?.initials ||
                 (authState.user?.profile?.firstName 
                   ? authState.user.profile.firstName.charAt(0).toUpperCase()
                   : (authState.user?.profile?.lastName
                      ? authState.user.profile.lastName.charAt(0).toUpperCase()
                      : (authState.isAuthenticated ? 'U' : '?'))
                 )}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Profile Menu Modal */}
      {authState.user && (
        <ProfileMenuModal 
          visible={isModalVisible} 
          onClose={hideModal} 
          user={(user || authState.user) as any} 
          menuSections={profileMenuSections} 
          onMenuItemPress={handleMenuItemPress} 
        />
      )}

      {/* Main Content */}
      <View style={styles.content}>
        <NotificationSection
          notifications={state.notifications}
          onNotificationPress={handleNotificationPress}
        />

        <EarningOpportunities />

        <ProjectDashboard
          projectStatus={state.projectStatus}
          onStatusPress={handleStatusPress}
          loading={state.loading}
        />

        <EarningsCard
          earnings={state.earnings}
          onSeeWallet={handleSeeWallet}
        />

        <RecentProjectsSection
          projects={state.recentProjects}
          onProjectPress={handleProjectPress}
          onStartProject={handleStartProject}
          onSeeAll={handleSeeAllProjects}
          loading={state.loading}
        />

        <CategoryGrid
          categories={state.categories}
          onCategoryPress={handleCategoryPress}
          columns={3}
          scrollable={true}
          maxHeight={400}
        />

        <ReferralSection
          referralData={state.referralData}
          onShare={handleShareReferral}
          onLearnMore={handleLearnMoreReferral}
        />
      </View>
    </ScrollView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  coinsText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  cartButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  profileText: {
    color: '#1F2937',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 20, // Modern spacing between sections
  },
});
