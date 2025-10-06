// Profile Page
// User profile page with icon grid and menu list

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  SafeAreaView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  PROFILE_COLORS,
  PROFILE_SPACING,
  PROFILE_RADIUS,
  ProfileIconGridItem,
  ProfileMenuListItem
} from '@/types/profile.types';
import {
  profileIconGridItems,
  profileMenuListItems
} from '@/data/profileData';
import { LocationDisplay, TimeDisplay } from '@/components/location';
import { useUserStatistics } from '@/hooks/useUserStatistics';
import * as ImagePicker from 'expo-image-picker';
import { uploadProfileImage } from '@/services/imageUploadService';
import { ShareService } from '@/services/shareService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useProfile();
  const { state: authState, actions: authActions } = useAuth();
  const { statistics, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useUserStatistics(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleBackPress = () => {
    // Check if we can go back, otherwise navigate to home
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)');
    }
  };

  const handleIconGridItemPress = (item: ProfileIconGridItem) => {
    console.log('Icon grid item pressed:', item.title);

    // Handle icon grid navigation
    switch (item.id) {
      case 'product':
        // Navigate to My Products page
        router.push('/my-products' as any);
        break;
      case 'service':
        // Navigate to My Services page
        router.push('/my-services' as any);
        break;
      case 'voucher':
        // Navigate to My Vouchers page
        router.push('/my-vouchers' as any);
        break;
      case 'earns':
        // Navigate to My Earnings page
        router.push('/my-earnings' as any);
        break;
      default:
        router.push(item.route as any);
        break;
    }
  };

  const handleMenuItemPress = (item: ProfileMenuListItem) => {
    console.log('Menu item pressed:', item.title);
    
    // Enhanced navigation logic for profile menu items
    switch (item.id) {
      case 'order_transaction_history':
        // Navigate to order tracking page to show all orders
        router.push('/tracking');
        break;
      case 'incomplete_transaction':
        // Navigate to incomplete transactions page
        router.push('/transactions/incomplete');
        break;
      case 'home_delivery':
        // Navigate to home delivery products page
        router.push('/home-delivery');
        break;
      case 'wasilcoin':
        // Connect to wallet/wasilcoin management
        router.push('/WalletScreen');
        break;
      case 'group_buy':
        // Navigate to group buy page
        router.push('/group-buy');
        break;
      case 'order_tracking':
        // Navigate to tracking screen (same as order_transaction_history)
        router.push('/tracking');
        break;
      case 'review':
        // Navigate to my reviews page (user's review history)
        router.push('/my-reviews');
        break;
      case 'social_media':
        // Navigate to Social Media earnings page
        router.push('/social-media');
        break;
      default:
        if (item.route) {
          router.push(item.route as any);
        }
        break;
    }
  };

  const handleLocationHistoryPress = () => {
    router.push('/location/history' as any);
  };

  const handleLocationSettingsPress = () => {
    router.push('/location/settings' as any);
  };

  // Pull-to-refresh handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Clear statistics cache first
      console.log('🔄 [PROFILE] Clearing statistics cache and fetching fresh data');
      await AsyncStorage.removeItem('user_statistics_cache');

      // Refresh both user profile and statistics (force bypass cache)
      await Promise.all([
        authActions.checkAuthStatus(),
        refetchStats(true), // Force refresh to bypass cache
      ]);
      console.log('✅ [PROFILE] Statistics refreshed successfully');
    } catch (error) {
      console.error('❌ [PROFILE] Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  }, [authActions, refetchStats]);

  // Handle profile image upload
  const handleImageUpload = async () => {
    console.log('🖼️ [PROFILE] Profile image upload triggered');
    console.log('🖼️ [PROFILE] Platform:', Platform.OS);

    try {
      // Get auth token from auth context state
      const token = authState.token;
      console.log('🔑 [PROFILE] Token from auth state:', token ? 'Token found' : 'No token');
      console.log('🔑 [PROFILE] Auth state:', { isAuthenticated: authState.isAuthenticated, user: authState.user?.id });

      if (!token) {
        if (Platform.OS === 'web') {
          alert('Authentication required. Please log in again.');
        } else {
          Alert.alert('Error', 'Authentication required. Please log in again.');
        }
        return;
      }

      // Request permission (not needed on web)
      if (Platform.OS !== 'web') {
        console.log('📱 [PROFILE] Requesting media library permission...');
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
          console.log('❌ [PROFILE] Permission denied');
          Alert.alert(
            'Permission Required',
            'Please allow access to your photo library to upload a profile picture.',
            [{ text: 'OK' }]
          );
          return;
        }
        console.log('✅ [PROFILE] Permission granted');
      }

      // Pick image
      console.log('🖼️ [PROFILE] Launching image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('🖼️ [PROFILE] Image picker result:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets[0]) {
        console.log('✅ [PROFILE] Image selected:', result.assets[0].uri);
        setUploadingImage(true);

        console.log('📤 [PROFILE] Uploading image with token...');
        // Pass the token directly to the upload function
        const uploadResult = await uploadProfileImage(result.assets[0].uri, token);
        console.log('📤 [PROFILE] Upload result:', uploadResult);

        if (uploadResult.success) {
          console.log('✅ [PROFILE] Upload successful, refreshing user data...');
          // Refresh user data to show new avatar
          await authActions.checkAuthStatus();

          if (Platform.OS === 'web') {
            alert('Profile picture updated successfully!');
          } else {
            Alert.alert('Success', 'Profile picture updated successfully!');
          }
        } else {
          console.error('❌ [PROFILE] Upload failed:', uploadResult.error);
          if (Platform.OS === 'web') {
            alert(`Upload Failed: ${uploadResult.error || 'Failed to upload image'}`);
          } else {
            Alert.alert('Upload Failed', uploadResult.error || 'Failed to upload image');
          }
        }
      } else {
        console.log('❌ [PROFILE] Image selection cancelled or no image selected');
      }
    } catch (error) {
      console.error('❌ [PROFILE] Error uploading image:', error);
      if (Platform.OS === 'web') {
        alert(`Error: ${error instanceof Error ? error.message : 'An error occurred while uploading the image'}`);
      } else {
        Alert.alert('Error', 'An error occurred while uploading the image');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle share profile
  const handleShareProfile = async () => {
    if (!user) return;

    Alert.alert(
      'Share Profile',
      'Choose how you want to share your profile',
      [
        {
          text: 'Share Link',
          onPress: async () => {
            const result = await ShareService.shareProfile({
              userId: user.id || 'user',
              userName: user.name || 'User',
              userBio: user.bio,
            });

            if (result.success) {
              // Success handled by native share dialog
            } else if (result.error && result.action !== 'dismissed') {
              Alert.alert('Error', result.error);
            }
          },
        },
        {
          text: 'Copy Link',
          onPress: async () => {
            const result = await ShareService.copyProfileLink(user.id || 'user');

            if (result.success) {
              Alert.alert('Success', 'Profile link copied to clipboard!');
            } else {
              Alert.alert('Error', result.error || 'Failed to copy link');
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Calculate profile completion percentage
  const profileCompletion = React.useMemo(() => {
    if (!user) return 0;

    const fields = [
      user.name && user.name !== 'Guest', // Real name entered
      user.email && user.email.length > 0, // Email provided
      user.phone && user.phone.length > 0, // Phone number
      user.avatar && user.avatar.length > 0, // Profile picture
      user.bio && user.bio.length > 0, // Bio added
    ];

    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  }, [user]);

  // Get completion message
  const getCompletionMessage = (percentage: number): string => {
    if (percentage === 100) return 'Your profile is complete! 🎉';
    if (percentage >= 80) return 'Almost there! Complete your profile';
    if (percentage >= 60) return 'Good progress! Add more details';
    if (percentage >= 40) return 'Keep going! Fill in more info';
    return 'Complete your profile to unlock features';
  };

  // Get missing fields
  const getMissingFields = (): string[] => {
    if (!user) return [];
    const missing: string[] = [];

    if (!user.name || user.name === 'Guest') missing.push('Name');
    if (!user.email) missing.push('Email');
    if (!user.avatar) missing.push('Profile Picture');
    if (!user.bio) missing.push('Bio');

    return missing;
  };

  // Map statistics to icon grid items with real data
  const iconGridData = React.useMemo(() => {
    if (!statistics) return profileIconGridItems;

    return [
      {
        ...profileIconGridItems[0],
        count: statistics.orders?.total || 0, // Real order count
      },
      {
        ...profileIconGridItems[1],
        count: statistics.projects?.totalParticipated || 0, // Real projects participated
      },
      {
        ...profileIconGridItems[2],
        count: statistics.vouchers?.active || 0, // Real active voucher count
      },
      {
        ...profileIconGridItems[3],
        count: Math.round(statistics.wallet?.totalEarned || 0), // Real total earnings
      },
    ];
  }, [statistics]);

  const renderIconGridItem = (item: ProfileIconGridItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.iconGridItem}
      onPress={() => handleIconGridItemPress(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.backgroundColor }]}>
        <Ionicons
          name={item.icon as any}
          size={24}
          color={item.color}
        />
      </View>
      <ThemedText style={styles.iconLabel}>{item.title}</ThemedText>
      {item.count && (
        <ThemedText style={styles.iconCount}>{item.count}</ThemedText>
      )}
    </TouchableOpacity>
  );

  // Get dynamic badge count for menu items
  const getMenuItemBadge = (itemId: string): string | undefined => {
    if (!statistics) return undefined;

    switch (itemId) {
      case 'incomplete_transaction':
        // Count of pending orders
        const pendingCount = statistics.orders?.total - (statistics.orders?.completed || 0) - (statistics.orders?.cancelled || 0);
        return pendingCount > 0 ? pendingCount.toString() : undefined;

      case 'wasilcoin':
        // RezCoin balance
        const balance = Math.round(statistics.wallet?.balance || 0);
        return balance > 0 ? balance.toString() : undefined;

      default:
        return undefined;
    }
  };

  const renderMenuListItem = (item: ProfileMenuListItem) => {
    // Get dynamic badge value
    const dynamicBadge = getMenuItemBadge(item.id);
    const badgeValue = dynamicBadge || item.badge;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.menuItem}
        onPress={() => handleMenuItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <View style={styles.menuIconContainer}>
            <Ionicons
              name={item.icon as any}
              size={22}
              color={PROFILE_COLORS.primary}
            />
          </View>

          <View style={styles.menuTextContainer}>
            <ThemedText style={styles.menuTitle}>{item.title}</ThemedText>
            {item.description && (
              <ThemedText style={styles.menuDescription}>
                {item.description}
              </ThemedText>
            )}
          </View>
        </View>

        <View style={styles.menuItemRight}>
          {badgeValue && (
            <View style={[
              styles.menuBadge,
              item.isNew ? styles.newBadge : styles.numericBadge
            ]}>
              <ThemedText style={[
                styles.menuBadgeText,
                item.isNew && styles.newBadgeText
              ]}>
                {item.isNew ? 'New' : badgeValue}
              </ThemedText>
            </View>
          )}

          {item.showArrow && (
            <Ionicons
              name="chevron-forward"
              size={18}
              color={PROFILE_COLORS.textSecondary}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={PROFILE_COLORS.primary}
        translucent={true}
      />
      
      {/* Modern Profile Header */}
      <LinearGradient
        colors={[PROFILE_COLORS.primary, PROFILE_COLORS.primaryLight, '#A78BFA']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <View style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={22} color="white" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerTitleSection}>
            <ThemedText style={styles.headerTitle}>My Profile</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Personal information and preferences
            </ThemedText>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/profile/qr-code' as any)}
            >
              <Ionicons name="qr-code-outline" size={22} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/profile/edit')}
            >
              <Ionicons name="create-outline" size={22} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShareProfile}
            >
              <Ionicons name="share-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PROFILE_COLORS.primary}
            colors={[PROFILE_COLORS.primary]}
          />
        }
      >
        {/* User Info Section */}
        <View style={styles.userSection}>
          <View style={styles.userCard}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleImageUpload}
              disabled={uploadingImage}
              activeOpacity={0.7}
            >
              <View style={styles.avatar}>
                {user?.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <ThemedText style={styles.avatarText}>
                    {user?.initials || 'U'}
                  </ThemedText>
                )}
                {uploadingImage && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator color="white" size="small" />
                  </View>
                )}
              </View>
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </TouchableOpacity>

            <View style={styles.userInfo}>
              <ThemedText style={styles.userName}>
                {user?.name || 'User Name'}
              </ThemedText>
              <ThemedText style={styles.userEmail}>
                {user?.email || 'user@example.com'}
              </ThemedText>

              {user?.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={PROFILE_COLORS.success} />
                  <ThemedText style={styles.verifiedText}>Verified</ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Profile Completion Indicator */}
          {profileCompletion < 100 && (
            <TouchableOpacity
              style={styles.completionCard}
              onPress={() => router.push('/profile/edit')}
              activeOpacity={0.7}
            >
              <View style={styles.completionHeader}>
                <View style={styles.completionInfo}>
                  <ThemedText style={styles.completionTitle}>
                    Profile Completion
                  </ThemedText>
                  <ThemedText style={styles.completionMessage}>
                    {getCompletionMessage(profileCompletion)}
                  </ThemedText>
                </View>
                <View style={styles.completionPercentage}>
                  <ThemedText style={styles.percentageText}>
                    {profileCompletion}%
                  </ThemedText>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${profileCompletion}%`,
                      backgroundColor:
                        profileCompletion >= 80
                          ? '#10B981'
                          : profileCompletion >= 50
                          ? '#F59E0B'
                          : '#EF4444',
                    },
                  ]}
                />
              </View>

              {/* Missing Fields */}
              {getMissingFields().length > 0 && (
                <View style={styles.missingFields}>
                  <ThemedText style={styles.missingFieldsLabel}>
                    Add: {getMissingFields().join(', ')}
                  </ThemedText>
                  <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Referral Program Card */}
          <TouchableOpacity
            style={styles.referralCard}
            onPress={() => router.push('/referral' as any)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.referralGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.referralContent}>
                <View style={styles.referralIcon}>
                  <Ionicons name="gift" size={28} color="white" />
                </View>
                <View style={styles.referralText}>
                  <ThemedText style={styles.referralTitle}>
                    Refer & Earn ₹100
                  </ThemedText>
                  <ThemedText style={styles.referralSubtitle}>
                    Invite friends and get rewards
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Loyalty Points Card */}
          <TouchableOpacity
            style={styles.loyaltyCard}
            onPress={() => router.push('/loyalty' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.loyaltyContent}>
              <View style={styles.loyaltyLeft}>
                <View style={styles.loyaltyIcon}>
                  <Ionicons name="diamond" size={24} color="#F59E0B" />
                </View>
                <View style={styles.loyaltyText}>
                  <ThemedText style={styles.loyaltyPoints}>
                    {Math.round(statistics?.wallet?.balance || 0)} Points
                  </ThemedText>
                  <ThemedText style={styles.loyaltyLabel}>Loyalty Rewards</ThemedText>
                </View>
              </View>
              <View style={styles.loyaltyRight}>
                <View style={styles.tierBadge}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <ThemedText style={styles.tierText}>Gold</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Location & Time Section */}
        <View style={styles.section}>
          <View style={styles.locationTimeContainer}>
            <LocationDisplay
              showCoordinates={true}
              showLastUpdated={true}
              showRefreshButton={true}
              style={styles.locationCard}
              onPress={handleLocationSettingsPress}
            />
            <TimeDisplay
              showDate={true}
              showTimezone={true}
              showTimeOfDay={true}
              style={styles.timeCard}
            />
          </View>
        </View>

        {/* Icon Grid Section */}
        <View style={styles.section}>
          <View style={styles.iconGrid}>
            {iconGridData.map(renderIconGridItem)}
          </View>
        </View>

        {/* Menu List Section */}
        <View style={styles.section}>
          <View style={styles.menuList}>
            {profileMenuListItems.map(renderMenuListItem)}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <ThemedText style={styles.statsTitle}>Your Activity</ThemedText>
              <TouchableOpacity
                onPress={() => router.push('/profile/activity' as any)}
                style={styles.viewAllButton}
              >
                <ThemedText style={styles.viewAllText}>View All</ThemedText>
                <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
            {statsLoading ? (
              <ThemedText style={styles.loadingText}>Loading stats...</ThemedText>
            ) : statistics ? (
              <View style={styles.statsGrid}>
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => router.push('/transactions' as any)}
                >
                  <ThemedText style={styles.statNumber}>{statistics.orders?.total || 0}</ThemedText>
                  <ThemedText style={styles.statLabel}>Orders</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => router.push('/WalletScreen' as any)}
                >
                  <ThemedText style={styles.statNumber}>₹{statistics.wallet?.totalSpent || 0}</ThemedText>
                  <ThemedText style={styles.statLabel}>Spent</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => router.push('/profile/achievements' as any)}
                >
                  <ThemedText style={styles.statNumber}>{statistics.achievements?.unlocked || 0}/{statistics.achievements?.total || 0}</ThemedText>
                  <ThemedText style={styles.statLabel}>Badges</ThemedText>
                </TouchableOpacity>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statNumber}>{statistics.reviews?.total || 0}</ThemedText>
                  <ThemedText style={styles.statLabel}>Reviews</ThemedText>
                </View>
              </View>
            ) : (
              <ThemedText style={styles.errorText}>
                {statsError || 'Unable to load stats'}
              </ThemedText>
            )}
          </View>
        </View>

        {/* Footer Space */}
        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 50 : 45,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitleSection: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    marginLeft: 15,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  
  // Location & Time Section
  locationTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  locationCard: {
    flex: 1,
  },
  timeCard: {
    flex: 1,
  },
  
  // User Section
  userSection: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: PROFILE_RADIUS.large,
    padding: PROFILE_SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: PROFILE_COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginRight: PROFILE_SPACING.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PROFILE_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PROFILE_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: PROFILE_COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: PROFILE_COLORS.textSecondary,
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PROFILE_COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: PROFILE_COLORS.success,
    marginLeft: 4,
  },

  // Profile Completion Card
  completionCard: {
    backgroundColor: 'white',
    borderRadius: PROFILE_RADIUS.large,
    padding: PROFILE_SPACING.lg,
    marginTop: 16,
    shadowColor: PROFILE_COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },

  // Referral Card
  referralCard: {
    marginTop: 16,
    borderRadius: PROFILE_RADIUS.large,
    overflow: 'hidden',
    shadowColor: PROFILE_COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  referralGradient: {
    padding: PROFILE_SPACING.lg,
  },
  referralContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referralIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  referralText: {
    flex: 1,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  referralSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // Loyalty Card
  loyaltyCard: {
    marginTop: 12,
    backgroundColor: 'white',
    borderRadius: PROFILE_RADIUS.large,
    padding: PROFILE_SPACING.md,
    shadowColor: PROFILE_COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  loyaltyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loyaltyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  loyaltyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  loyaltyText: {
    flex: 1,
  },
  loyaltyPoints: {
    fontSize: 18,
    fontWeight: '700',
    color: PROFILE_COLORS.text,
    marginBottom: 2,
  },
  loyaltyLabel: {
    fontSize: 13,
    color: PROFILE_COLORS.textSecondary,
  },
  loyaltyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  completionInfo: {
    flex: 1,
    marginRight: 12,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PROFILE_COLORS.text,
    marginBottom: 4,
  },
  completionMessage: {
    fontSize: 13,
    color: PROFILE_COLORS.textSecondary,
    lineHeight: 18,
  },
  completionPercentage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  missingFields: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  missingFieldsLabel: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
    flex: 1,
  },

  // Icon Grid
  iconGrid: {
    backgroundColor: 'white',
    borderRadius: PROFILE_RADIUS.large,
    padding: PROFILE_SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: PROFILE_COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconGridItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: PROFILE_COLORS.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  iconCount: {
    fontSize: 11,
    fontWeight: '500',
    color: PROFILE_COLORS.textSecondary,
  },
  
  // Menu List
  menuList: {
    backgroundColor: 'white',
    borderRadius: PROFILE_RADIUS.large,
    overflow: 'hidden',
    shadowColor: PROFILE_COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: PROFILE_SPACING.md,
    paddingHorizontal: PROFILE_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: PROFILE_COLORS.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${PROFILE_COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: PROFILE_SPACING.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PROFILE_COLORS.text,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 12,
    color: PROFILE_COLORS.textSecondary,
    lineHeight: 16,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  numericBadge: {
    backgroundColor: PROFILE_COLORS.primary,
  },
  newBadge: {
    backgroundColor: PROFILE_COLORS.success,
  },
  menuBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  newBadgeText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Stats Section
  statsCard: {
    backgroundColor: 'white',
    borderRadius: PROFILE_RADIUS.large,
    padding: PROFILE_SPACING.lg,
    shadowColor: PROFILE_COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: PROFILE_SPACING.md,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PROFILE_COLORS.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: PROFILE_COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: PROFILE_COLORS.textSecondary,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 14,
    color: PROFILE_COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    paddingVertical: 20,
  },

  footer: {
    height: 40,
  },
});