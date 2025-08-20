import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert, Share, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { useEarnPageData } from '@/hooks/useEarnPageData';

// New Earn Page Components
import NotificationSection from '@/components/earnPage/NotificationSection';
import ProjectDashboard from '@/components/earnPage/ProjectDashboard';
import EarningsCard from '@/components/earnPage/EarningsCard';
import RecentProjectsSection from '@/components/earnPage/RecentProjectsSection';
import CategoryGrid from '@/components/earnPage/CategoryGrid';
import ReferralSection from '@/components/earnPage/ReferralSection';

import { Notification, Project, Category } from '@/types/earnPage.types';

export default function EarnScreen() {
  const router = useRouter();
  const { state, actions } = useEarnPageData();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await actions.refreshData();
    } catch (error) {
      console.error('Failed to refresh earn data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [actions]);

  // Notification handlers
  const handleNotificationPress = React.useCallback(async (notification: Notification) => {
    await actions.markNotificationAsRead(notification.id);
    Alert.alert(notification.title, notification.description);
  }, [actions]);

  // Project handlers
  const handleStartProject = React.useCallback(async (project: Project) => {
    const success = await actions.startProject(project.id);
    if (success) {
      Alert.alert('Project Started!', `You've started "${project.title}"`);
    }
  }, [actions]);

  const handleProjectPress = React.useCallback((project: Project) => {
    Alert.alert(
      project.title,
      project.description,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Project', onPress: () => handleStartProject(project) },
      ]
    );
  }, [handleStartProject]);

  const handleStatusPress = React.useCallback((status: string) => {
    console.log(`Navigate to ${status} projects`);
  }, []);

  const handleSeeWallet = React.useCallback(() => {
    router.push('/WalletScreen' as any);
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
      console.error('Failed to share referral link:', error);
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
    console.log('Navigate to all projects');
  }, []);

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
      <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.coinsContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <ThemedText style={styles.coinsText}>
                {state.walletInfo.balance + state.walletInfo.pendingBalance}
              </ThemedText>
            </View>

            <TouchableOpacity>
              <Ionicons name="cart-outline" size={22} color="white" style={{ marginLeft: 15 }} />
            </TouchableOpacity>

            <View style={styles.profileAvatar}>
              <ThemedText style={styles.profileText}>R</ThemedText>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.content}>
        <NotificationSection
          notifications={state.notifications}
          onNotificationPress={handleNotificationPress}
        />

        <ProjectDashboard
          projectStatus={state.projectStatus}
          onStatusPress={handleStatusPress}
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  coinsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileText: {
    color: '#333',
    fontWeight: '700',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 20, // Modern spacing between sections
  },
});
