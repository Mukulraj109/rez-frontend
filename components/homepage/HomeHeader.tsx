/**
 * HomeHeader Component
 *
 * Extracted from app/(tabs)/index.tsx (lines 348-557)
 * Displays the homepage header with location, user stats, and search
 *
 * @component
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { GreetingDisplay, LocationDisplay } from '@/components/location';
import TierBadge from '@/components/subscription/TierBadge';
import NotificationBell from '@/components/common/NotificationBell';

/**
 * HomeHeader Props Interface
 */
export interface HomeHeaderProps {
  /** User's loyalty points */
  userPoints: number;
  /** Current subscription tier */
  subscriptionTier?: 'free' | 'bronze' | 'silver' | 'gold' | 'platinum';
  /** Number of items in cart */
  cartItemCount: number;
  /** Whether detailed location is expanded */
  showDetailedLocation: boolean;
  /** Callback to toggle detailed location display */
  onToggleLocation: () => void;
  /** Animated height value for location expansion */
  animatedHeight: Animated.Value;
  /** Animated opacity value for location expansion */
  animatedOpacity: Animated.Value;
  /** Callback when search is pressed */
  onSearchPress: () => void;
  /** Callback when profile avatar is pressed */
  onProfilePress: () => void;
  /** User initials for avatar display */
  userInitials?: string;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Header styles (optional) */
  headerStyles?: any;
  /** Text styles (optional) */
  textStyles?: any;
}

/**
 * HomeHeader Component
 *
 * Renders the purple gradient header with:
 * - Location display with expand/collapse
 * - Subscription tier badge
 * - Loyalty points counter
 * - Notification bell
 * - Cart icon with badge
 * - Profile avatar
 * - Greeting message
 * - Search bar
 */
export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userPoints,
  subscriptionTier = 'free',
  cartItemCount,
  showDetailedLocation,
  onToggleLocation,
  animatedHeight,
  animatedOpacity,
  onSearchPress,
  onProfilePress,
  userInitials = 'U',
  isAuthenticated,
  headerStyles,
  textStyles,
}) => {
  const router = useRouter();

  return (
    <LinearGradient colors={['#8B5CF6', '#A855F7']} style={headerStyles.header}>
      {/* Header Top Section */}
      <View style={headerStyles.headerTop}>
        {/* Location Display with Expand/Collapse */}
        <Pressable
          style={headerStyles.locationContainer}
          onPress={onToggleLocation}
          accessibilityLabel="Current location"
          accessibilityHint={
            showDetailedLocation
              ? 'Double tap to collapse location details'
              : 'Double tap to expand location details'
          }
          accessibilityState={{ expanded: showDetailedLocation }}
        >
          <LocationDisplay
            compact={true}
            showCoordinates={false}
            showLastUpdated={false}
            showRefreshButton={false}
            style={headerStyles.locationDisplay}
            textStyle={textStyles.locationText}
          />
          <Ionicons
            name={showDetailedLocation ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="white"
            style={headerStyles.locationArrow}
          />
        </Pressable>

        {/* Right Side Icons */}
        <View style={headerStyles.headerRight}>
          {/* Subscription Tier Badge */}
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === 'ios') {
                setTimeout(() => router.push('/subscription/plans'), 50);
              } else {
                router.push('/subscription/plans');
              }
            }}
            activeOpacity={0.7}
            style={{ marginRight: 12 }}
            accessibilityLabel={`Subscription tier: ${subscriptionTier}`}
            accessibilityRole="button"
            accessibilityHint="Double tap to view subscription plans and upgrade options"
          >
            <TierBadge tier={subscriptionTier} size="small" />
          </TouchableOpacity>

          {/* Loyalty Points */}
          <TouchableOpacity
            style={headerStyles.coinsContainer}
            onPress={() => {
              if (Platform.OS === 'ios') {
                setTimeout(() => router.push('/CoinPage'), 50);
              } else {
                router.push('/CoinPage');
              }
            }}
            activeOpacity={Platform.OS === 'ios' ? 0.6 : 0.7}
            delayPressIn={Platform.OS === 'ios' ? 50 : 0}
            accessibilityLabel={`Loyalty points: ${userPoints}`}
            accessibilityRole="button"
            accessibilityHint="Double tap to view your loyalty points and rewards"
          >
            <Ionicons name="star" size={16} color="#FFD700" />
            <ThemedText style={textStyles.coinsText}>{userPoints}</ThemedText>
          </TouchableOpacity>

          {/* Notification Bell */}
          <NotificationBell iconSize={24} iconColor="white" />

          {/* Cart Icon */}
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === 'ios') {
                setTimeout(() => router.push('/CartPage'), 50);
              } else {
                router.push('/CartPage');
              }
            }}
            activeOpacity={Platform.OS === 'ios' ? 0.6 : 0.7}
            delayPressIn={Platform.OS === 'ios' ? 50 : 0}
            accessibilityLabel={`Shopping cart: ${cartItemCount} items`}
            accessibilityRole="button"
            accessibilityHint="Double tap to view your shopping cart"
          >
            <Ionicons name="cart-outline" size={24} color="white" />
          </TouchableOpacity>

          {/* Profile Avatar */}
          <TouchableOpacity
            style={headerStyles.profileAvatar}
            onPress={onProfilePress}
            activeOpacity={0.7}
            accessibilityLabel="User profile menu"
            accessibilityRole="button"
            accessibilityHint="Double tap to open profile menu and account settings"
          >
            <ThemedText style={textStyles.profileText}>
              {userInitials}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Detailed Location Section - Animated */}
      <Animated.View
        style={[
          headerStyles.detailedLocationContainer,
          {
            height: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 120],
            }),
            opacity: animatedOpacity,
            overflow: 'hidden',
          },
        ]}
      >
        <View style={headerStyles.detailedLocationContent}>
          {/* Full Address Section */}
          <View style={headerStyles.addressSection}>
            <View style={headerStyles.addressHeader}>
              <Ionicons name="location" size={16} color="#8B5CF6" />
              <Text style={headerStyles.addressHeaderText}>Current Location</Text>
            </View>
            <LocationDisplay
              compact={false}
              showCoordinates={false}
              showLastUpdated={false}
              showRefreshButton={false}
              style={headerStyles.detailedLocationDisplay}
              textStyle={headerStyles.detailedLocationText}
            />
          </View>

          {/* Coordinates Section */}
          <View style={headerStyles.coordinatesSection}>
            <View style={headerStyles.coordinatesHeader}>
              <Ionicons name="navigate" size={14} color="#666" />
              <Text style={headerStyles.coordinatesHeaderText}>Coordinates</Text>
            </View>
            <LocationDisplay
              compact={true}
              showCoordinates={true}
              showLastUpdated={false}
              showRefreshButton={false}
              style={headerStyles.coordinatesDisplay}
              textStyle={headerStyles.coordinatesText}
            />
          </View>

          {/* Refresh Button */}
          <View style={headerStyles.refreshSection}>
            <LocationDisplay
              compact={true}
              showCoordinates={false}
              showLastUpdated={true}
              showRefreshButton={true}
              style={headerStyles.refreshDisplay}
              textStyle={headerStyles.refreshText}
            />
          </View>
        </View>
      </Animated.View>

      {/* Dynamic Greeting */}
      <View style={headerStyles.greetingContainer}>
        <GreetingDisplay
          showEmoji={true}
          showTime={false}
          showLocation={true}
          animationType="fade"
          maxLength={40}
          style={headerStyles.greetingCard}
          textStyle={textStyles.greeting}
        />
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        style={headerStyles.searchContainer}
        onPress={onSearchPress}
        activeOpacity={0.85}
        accessibilityLabel="Search bar"
        accessibilityRole="search"
        accessibilityHint="Double tap to search for stores, products, and services"
      >
        <Ionicons name="search" size={20} color="#666" style={headerStyles.searchIcon} />
        <Text style={textStyles.searchPlaceholder}>Search for the service</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default HomeHeader;
