import React, { useState } from 'react';
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { width, height } = Dimensions.get('window');
  
  const statusBarHeight = Platform.OS === 'ios' 
    ? (height >= 812 ? 44 : 20) 
    : StatusBar.currentHeight ?? 24;

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
            >
              <Ionicons name="star" size={16} color="#FFD700" />
              <ThemedText style={[styles.coinText, { color: category.headerConfig.textColor }]}>
                382
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
          <TouchableOpacity style={styles.profileAvatar}>
            <ThemedText style={styles.profileText}>R</ThemedText>
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
                  color={showFilterBadge ? "#8B5CF6" : "#6B7280"} 
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  coinText: {
    fontSize: 14,
    fontWeight: '600',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInputContainerFocused: {
    shadowOpacity: 0.2,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
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
    padding: 8,
    marginLeft: 4,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#EEF2FF',
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
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