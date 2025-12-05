import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { Category } from '@/types/category.types';
import { useProfile, useProfileMenu } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import ProfileMenuModal from '@/components/profile/ProfileMenuModal';
import { profileMenuSections } from '@/data/profileData';

interface CategoryHeaderProps {
  category: Category;
  onSearch: (query: string) => void;
  onBack: () => void;
  searchQuery: string;
  onFilterPress?: () => void;
  showFilterBadge?: boolean;
}

export default function CategoryHeader({
  category,
  onSearch,
  onBack,
  searchQuery,
  onFilterPress,
  showFilterBadge = false,
}: CategoryHeaderProps) {
  const router = useRouter();
  const { user, isModalVisible, showModal, hideModal } = useProfile();
  const { handleMenuItemPress } = useProfileMenu();
  const { state: authState } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const { width, height } = Dimensions.get('window');
  
  const statusBarHeight = Platform.OS === 'ios' 
    ? (height >= 812 ? 44 : 20) 
    : StatusBar.currentHeight ?? 24;

  // Load wallet balance on mount
  useEffect(() => {
    if (authState.user) {
      loadWalletBalance();
    }
  }, [authState.user]);

  const loadWalletBalance = async () => {
    try {
      const walletApi = (await import('@/services/walletApi')).default;
      const response = await walletApi.getBalance();
      
      if (response.success && response.data) {
        // Get wasil coin balance (same as FashionHeader)
        const wasilCoin = response.data.coins.find((c: any) => c.type === 'wasil');
        const actualWalletCoins = wasilCoin?.amount || 0;
        setUserPoints(actualWalletCoins);
      }
    } catch (error) {
      console.error('❌ [Category Header] Failed to load wallet balance:', error);
      setUserPoints(0);
    }
  };

  const handleClearSearch = () => {
    onSearch('');
  };

  const handleCartPress = () => {
    router.push('/CartPage');
  };

  const handleCoinPress = () => {
    router.push('/CoinPage');
  };

  return (
    <LinearGradient
      colors={category.headerConfig.backgroundColor as any}
      style={[styles.container, { paddingTop: statusBarHeight + 8 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      {/* Top Row - Navigation and Actions */}
      <View style={styles.topRow}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBack}
          activeOpacity={0.8}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={20} color={category.headerConfig.textColor} />
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.titleContainer}>
          <ThemedText 
            style={[styles.title, { color: category.headerConfig.textColor }]}
            numberOfLines={1}
          >
            {category.headerConfig.title}
          </ThemedText>
        </View>

        {/* Right Actions */}
        <View style={styles.rightActions}>
          {/* Coin Balance */}
          {category.headerConfig.showCoinBalance && (
            <TouchableOpacity
              style={styles.coinContainer}
              onPress={handleCoinPress}
              activeOpacity={0.8}
              accessibilityLabel={`Coin balance: ${userPoints} coins`}
              accessibilityRole="button"
              accessibilityHint="Double tap to view coin details"
            >
              <Ionicons name="star" size={16} color="#FFD700" />
              <ThemedText style={[styles.coinText, { color: category.headerConfig.textColor }]}>
                {userPoints}
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* Cart Button */}
          {category.headerConfig.showCart && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleCartPress}
              activeOpacity={0.8}
              accessibilityLabel="Open cart"
              accessibilityRole="button"
            >
              <Ionicons name="bag-outline" size={20} color={category.headerConfig.textColor} />
            </TouchableOpacity>
          )}

          {/* Profile Avatar */}
          <TouchableOpacity
            style={styles.profileAvatar}
            onPress={() => {
              if (Platform.OS === 'ios') {
                setTimeout(() => showModal(), 50);
              } else {
                showModal();
              }
            }}
            activeOpacity={Platform.OS === 'ios' ? 0.6 : 0.7}
            delayPressIn={Platform.OS === 'ios' ? 50 : 0}
            accessibilityLabel="Open profile menu"
            accessibilityRole="button"
            accessibilityHint="Double tap to open profile and settings menu"
          >
            <ThemedText style={styles.profileText}>{user?.initials || 'R'}</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {category.headerConfig.showSearch && (
        <View style={styles.searchContainer}>
          <View style={[
            styles.searchInputContainer,
            isSearchFocused && styles.searchInputContainerFocused
          ]}>
            {/* Search Icon */}
            <Ionicons 
              name="search" 
              size={20} 
              color="#6B7280" 
              style={styles.searchIcon}
            />

            {/* Search Input */}
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={onSearch}
              placeholder={category.headerConfig.searchPlaceholder || 'Search...'}
              placeholderTextColor="#9CA3AF"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              maxLength={100}
              accessibilityLabel={`Search ${category.name.toLowerCase()}`}
              underlineColorAndroid="transparent"
            />

            {/* Clear Button */}
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearSearch}
                activeOpacity={0.7}
                accessibilityLabel="Clear search"
                accessibilityRole="button"
              >
                <Ionicons 
                  name="close-circle" 
                  size={18} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
            )}

            {/* Filter Button */}
            {onFilterPress && (
              <TouchableOpacity
                style={[styles.filterButton, showFilterBadge && styles.filterButtonActive]}
                onPress={onFilterPress}
                activeOpacity={0.7}
                accessibilityLabel="Open filters"
                accessibilityRole="button"
              >
                <Ionicons
                  name="filter"
                  size={18}
                  color={showFilterBadge ? "#00C06A" : "#6B7280"}
                />
                {showFilterBadge && <View style={styles.filterBadge} />}
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Category Description (if no search) */}
      {!category.headerConfig.showSearch && category.shortDescription && (
        <View style={styles.descriptionContainer}>
          <ThemedText 
            style={[styles.description, { color: category.headerConfig.textColor }]}
            numberOfLines={2}
          >
            {category.shortDescription}
          </ThemedText>
        </View>
      )}

      {/* Profile Menu Modal */}
      {user && (
        <ProfileMenuModal 
          visible={isModalVisible} 
          onClose={hideModal} 
          user={user} 
          menuSections={profileMenuSections} 
          onMenuItemPress={handleMenuItemPress} 
        />
      )}
    </LinearGradient>
);
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
    minHeight: 44,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  coinText: {
    fontSize: 14,
    fontWeight: '600',
  },
  profileAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFC857',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  profileText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  searchContainer: {
    paddingHorizontal: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    minHeight: 50,
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.15)',
  },
  searchInputContainerFocused: {
    shadowOpacity: 0.3,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(0, 192, 106, 0.4)',
    backgroundColor: '#FFFFFF',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '400',
    paddingVertical: 0,
    outlineWidth: 0, // Web only
  } as any,
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  filterButton: {
    padding: 10,
    marginLeft: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.15)',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(0, 192, 106, 0.15)',
    borderColor: 'rgba(0, 192, 106, 0.3)',
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00C06A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
  },
});