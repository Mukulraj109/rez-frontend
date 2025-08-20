// Profile Page
// User profile page with icon grid and menu list

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useProfile } from '@/contexts/ProfileContext';
import { 
  PROFILE_COLORS, 
  PROFILE_SPACING, 
  PROFILE_RADIUS,
  ProfileIconGridItem,
  ProfileMenuListItem 
} from '@/types/profile.types';
import { 
  profileIconGridItems, 
  profileMenuListItems,
  profileStats
} from '@/data/profileData';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useProfile();

  const handleBackPress = () => {
    router.back();
  };

  const handleIconGridItemPress = (item: ProfileIconGridItem) => {
    console.log('Icon grid item pressed:', item.title);
    
    // Handle icon grid navigation
    switch (item.id) {
      case 'product':
        console.log('Navigate to products - Screen to be created');
        break;
      case 'service':
        console.log('Navigate to services - Screen to be created');
        break;
      case 'voucher':
        console.log('Navigate to vouchers - Screen to be created');
        break;
      case 'earns':
        router.push('/(tabs)/earn');
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
        // Connect to wallet transaction history
        router.push('/WalletScreen');
        break;
      case 'incomplete_transaction':
        // Navigate to incomplete transactions (could be a filtered view of wallet)
        router.push('/WalletScreen');
        break;
      case 'home_delivery':
        // Connect to delivery settings
        router.push('/account/delivery');
        break;
      case 'wasilcoin':
        // Connect to wallet/wasilcoin management
        router.push('/WalletScreen');
        break;
      case 'group_buy':
        console.log('Navigate to Group Buy - Screen to be created');
        break;
      case 'order_tracking':
        console.log('Navigate to Order Tracking - Screen to be created');
        break;
      case 'review':
        console.log('Navigate to Reviews - Screen to be created');
        break;
      case 'social_media':
        console.log('Navigate to Social Media - Screen to be created');
        break;
      default:
        if (item.route) {
          router.push(item.route as any);
        }
        break;
    }
  };

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

  const renderMenuListItem = (item: ProfileMenuListItem) => (
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
        {item.badge && (
          <View style={[
            styles.menuBadge,
            item.isNew ? styles.newBadge : styles.numericBadge
          ]}>
            <ThemedText style={[
              styles.menuBadgeText,
              item.isNew && styles.newBadgeText
            ]}>
              {item.isNew ? 'New' : item.badge}
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
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="create-outline" size={22} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Info Section */}
        <View style={styles.userSection}>
          <View style={styles.userCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>
                  {user?.initials || 'U'}
                </ThemedText>
              </View>
            </View>
            
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
        </View>

        {/* Icon Grid Section */}
        <View style={styles.section}>
          <View style={styles.iconGrid}>
            {profileIconGridItems.map(renderIconGridItem)}
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
            <ThemedText style={styles.statsTitle}>Your Activity</ThemedText>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>{profileStats.totalOrders}</ThemedText>
                <ThemedText style={styles.statLabel}>Orders</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>₹{profileStats.totalSpent}</ThemedText>
                <ThemedText style={styles.statLabel}>Spent</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>{profileStats.loyaltyPoints}</ThemedText>
                <ThemedText style={styles.statLabel}>Points</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>{profileStats.reviewsGiven}</ThemedText>
                <ThemedText style={styles.statLabel}>Reviews</ThemedText>
              </View>
            </View>
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
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
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
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PROFILE_COLORS.text,
    marginBottom: PROFILE_SPACING.md,
    textAlign: 'center',
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
  
  footer: {
    height: 40,
  },
});