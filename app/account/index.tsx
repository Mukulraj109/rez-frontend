// Account Settings Page
// Main account settings screen with tabs and categories

import React, { useState, useEffect } from 'react';
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
import AccountTabs from '@/components/account/AccountTabs';
import SettingsItem from '@/components/account/SettingsItem';
import { 
  AccountTabType, 
  AccountSettingsCategory,
  ACCOUNT_COLORS 
} from '@/types/account.types';
import { 
  accountTabs, 
  getSettingsCategoryForTab,
  mockAccountSettings 
} from '@/data/accountData';

export default function AccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AccountTabType>('SETTINGS');
  const [categories, setCategories] = useState<AccountSettingsCategory[]>([]);

  // Update categories when tab changes
  useEffect(() => {
    const tabCategories = getSettingsCategoryForTab(activeTab);
    setCategories(tabCategories);
  }, [activeTab]);

  const handleBackPress = () => {
    router.back();
  };

  const handleTabChange = (tab: AccountTabType) => {
    setActiveTab(tab);
  };

  const handleCategoryPress = (category: AccountSettingsCategory) => {

    // Handle navigation to specific settings screens
    switch (category.id) {
      case 'subscription':
        router.push('/subscription/manage');
        break;
      case 'delivery':
        router.push('/account/delivery');
        break;
      case 'payment':
        router.push('/account/payment');
        break;
      case 'wasilpay':
        router.push('/account/wasilpay'); // Note: keeping route name for compatibility
        break;
      case 'voucher':
        // Navigate to My Vouchers page
        router.push('/my-vouchers');
        break;
      case 'coupon':
        // Navigate to coupons page for coupon management
        router.push('/account/coupons');
        break;
      case 'bill_upload':
        router.push('/bill-upload');
        break;
      case 'achievements':
        router.push('/profile/achievements');
        break;
      default:
        if (category.route) {
          router.push(category.route as any);
        }
        break;
    }
  };

  const getTabTitle = (tab: AccountTabType): string => {
    switch (tab) {
      case 'CUSTOMER_SUPPORT':
        return 'Customer Support';
      case 'NOTIFICATIONS':
        return 'Notification Settings';
      case 'SETTINGS':
      default:
        return 'Account Settings';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={ACCOUNT_COLORS.primary}
        translucent={true}
      />
      
      {/* Modern Header */}
      <LinearGradient
        colors={[ACCOUNT_COLORS.primary, ACCOUNT_COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Double tap to return to previous page"
          >
            <View style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={22} color="white" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerTitleSection}>
            <ThemedText style={styles.headerTitle}>
              {getTabTitle(activeTab)}
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Manage your account preferences
            </ThemedText>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/account/notifications')}
              accessibilityLabel="Notifications"
              accessibilityRole="button"
              accessibilityHint="Double tap to view notifications"
            >
              <Ionicons name="notifications-outline" size={22} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/account/settings')}
              accessibilityLabel="Settings"
              accessibilityRole="button"
              accessibilityHint="Double tap to open account settings"
            >
              <Ionicons name="settings-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <AccountTabs
          tabs={accountTabs.map(tab => ({
            ...tab,
            isActive: tab.id === activeTab
          }))}
          activeTab={activeTab}
          onTabPress={handleTabChange}
        />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.settingsContainer}>
          {categories.map((category) => (
            <SettingsItem
              key={category.id}
              category={category}
              onPress={handleCategoryPress}
            />
          ))}
        </View>

        {/* Additional Info */}
        {activeTab === 'SETTINGS' && (
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color={ACCOUNT_COLORS.info} />
              <View style={styles.infoText}>
                <ThemedText style={styles.infoTitle}>Account Information</ThemedText>
                <ThemedText style={styles.infoDescription}>
                  Manage your personal information, security settings, and preferences
                </ThemedText>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'CUSTOMER_SUPPORT' && (
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <Ionicons name="help-circle" size={20} color={ACCOUNT_COLORS.info} />
              <View style={styles.infoText}>
                <ThemedText style={styles.infoTitle}>Need Help?</ThemedText>
                <ThemedText style={styles.infoDescription}>
                  Our support team is available 24/7 to help you with any questions
                </ThemedText>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'NOTIFICATIONS' && (
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <Ionicons name="notifications" size={20} color={ACCOUNT_COLORS.info} />
              <View style={styles.infoText}>
                <ThemedText style={styles.infoTitle}>Stay Updated</ThemedText>
                <ThemedText style={styles.infoDescription}>
                  Customize your notification preferences to stay informed
                </ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Footer Space */}
        <View style={styles.footer} />
      </ScrollView>
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACCOUNT_COLORS.background,
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
  tabsContainer: {
    backgroundColor: ACCOUNT_COLORS.background,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  settingsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: ACCOUNT_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.08)',
  },
  infoContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(0, 192, 106, 0.06)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.15)',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: ACCOUNT_COLORS.textSecondary,
    lineHeight: 20,
  },
  footer: {
    height: 40,
  },
});