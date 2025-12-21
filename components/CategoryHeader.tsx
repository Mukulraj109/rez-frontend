/**
 * CategoryHeader Component - Modern Redesign
 * Features: Glassmorphism, 3D effects, category-specific imagery, smooth animations
 * Inspired by 2024 UI trends: layered design, frosted glass, dynamic gradients
 */

import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { useProfile, useProfileMenu } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/authApi';
import ProfileMenuModal from '@/components/profile/ProfileMenuModal';
import { profileMenuSections } from '@/data/profileData';
import { CategoryBanner } from '@/config/categoryConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Category-specific configurations with unique visuals
const CATEGORY_VISUALS: Record<string, {
  icon: keyof typeof Ionicons.glyphMap;
  headerIcon: keyof typeof Ionicons.glyphMap;
  gradientColors: [string, string, string];
  accentColor: string;
  glowColor: string;
  tagline: string;
}> = {
  'Food & Dining': {
    icon: 'restaurant',
    headerIcon: 'restaurant-outline',
    gradientColors: ['#FF6B35', '#F7931E', '#FFB347'],
    accentColor: '#FF6B35',
    glowColor: 'rgba(255, 107, 53, 0.4)',
    tagline: 'Delicious Deals Await',
  },
  'Grocery & Essentials': {
    icon: 'cart',
    headerIcon: 'cart-outline',
    gradientColors: ['#00C853', '#00E676', '#69F0AE'],
    accentColor: '#00C853',
    glowColor: 'rgba(0, 200, 83, 0.4)',
    tagline: 'Fresh & Essential',
  },
  'Beauty & Wellness': {
    icon: 'sparkles',
    headerIcon: 'sparkles-outline',
    gradientColors: ['#E91E63', '#F48FB1', '#FCE4EC'],
    accentColor: '#E91E63',
    glowColor: 'rgba(233, 30, 99, 0.4)',
    tagline: 'Glow & Shine',
  },
  'Healthcare': {
    icon: 'heart',
    headerIcon: 'medkit-outline',
    gradientColors: ['#2196F3', '#64B5F6', '#BBDEFB'],
    accentColor: '#2196F3',
    glowColor: 'rgba(33, 150, 243, 0.4)',
    tagline: 'Your Health First',
  },
  'Fashion': {
    icon: 'shirt',
    headerIcon: 'shirt-outline',
    gradientColors: ['#9C27B0', '#BA68C8', '#E1BEE7'],
    accentColor: '#9C27B0',
    glowColor: 'rgba(156, 39, 176, 0.4)',
    tagline: 'Style Your Way',
  },
  'Fitness & Sports': {
    icon: 'fitness',
    headerIcon: 'fitness-outline',
    gradientColors: ['#FF5722', '#FF8A65', '#FFCCBC'],
    accentColor: '#FF5722',
    glowColor: 'rgba(255, 87, 34, 0.4)',
    tagline: 'Stay Strong',
  },
  'Education & Learning': {
    icon: 'school',
    headerIcon: 'school-outline',
    gradientColors: ['#3F51B5', '#7986CB', '#C5CAE9'],
    accentColor: '#3F51B5',
    glowColor: 'rgba(63, 81, 181, 0.4)',
    tagline: 'Learn & Grow',
  },
  'Home Services': {
    icon: 'home',
    headerIcon: 'home-outline',
    gradientColors: ['#795548', '#A1887F', '#D7CCC8'],
    accentColor: '#795548',
    glowColor: 'rgba(121, 85, 72, 0.4)',
    tagline: 'Home Made Better',
  },
  'Travel & Experiences': {
    icon: 'airplane',
    headerIcon: 'airplane-outline',
    gradientColors: ['#00BCD4', '#4DD0E1', '#B2EBF2'],
    accentColor: '#00BCD4',
    glowColor: 'rgba(0, 188, 212, 0.4)',
    tagline: 'Explore More',
  },
  'Entertainment': {
    icon: 'game-controller',
    headerIcon: 'game-controller-outline',
    gradientColors: ['#673AB7', '#9575CD', '#D1C4E9'],
    accentColor: '#673AB7',
    glowColor: 'rgba(103, 58, 183, 0.4)',
    tagline: 'Fun Never Stops',
  },
  'Financial & Lifestyle': {
    icon: 'wallet',
    headerIcon: 'wallet-outline',
    gradientColors: ['#4CAF50', '#81C784', '#C8E6C9'],
    accentColor: '#4CAF50',
    glowColor: 'rgba(76, 175, 80, 0.4)',
    tagline: 'Smart Savings',
  },
};

interface CategoryHeaderProps {
  categoryName: string;
  primaryColor: string;
  banner: CategoryBanner;
  gradientColors?: [string, string, string];
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  categoryName,
  primaryColor,
  banner,
  gradientColors: customGradientColors,
}) => {
  const router = useRouter();
  const { user, isModalVisible, showModal, hideModal } = useProfile();
  const { handleMenuItemPress } = useProfileMenu();
  const { state: authState } = useAuth();
  const [userPoints, setUserPoints] = React.useState(0);

  // Get category-specific visuals
  const categoryVisuals = CATEGORY_VISUALS[categoryName] || {
    icon: 'grid',
    headerIcon: 'grid-outline',
    gradientColors: ['#00C06A', '#00896B', '#0B2240'],
    accentColor: '#00C06A',
    glowColor: 'rgba(0, 192, 106, 0.4)',
    tagline: 'Great Deals',
  };

  const gradientColors = customGradientColors || categoryVisuals.gradientColors;

  // Animations
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(30);
  const scaleAnim = useSharedValue(0.9);
  const glowAnim = useSharedValue(0);
  const floatAnim = useSharedValue(0);
  const rotateAnim = useSharedValue(0);
  const shimmerAnim = useSharedValue(0);

  useEffect(() => {
    // Main content fade in
    fadeAnim.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    slideAnim.value = withSpring(0, { damping: 20, stiffness: 90 });
    scaleAnim.value = withSpring(1, { damping: 15, stiffness: 100 });

    // Glow pulse animation
    glowAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Float animation for decorative elements
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Subtle rotation for 3D effect
    rotateAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Shimmer effect
    shimmerAnim.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  // Load user points
  React.useEffect(() => {
    if (authState.user) {
      loadUserStatistics();
    }
  }, [authState.user]);

  const loadUserStatistics = async () => {
    try {
      const response = await authService.getUserStatistics();
      if (response.success && response.data) {
        const stats = response.data;
        const shopPoints = Math.floor((stats.orders?.totalSpent || 0) / 10);
        const referralPoints = (stats.user?.totalReferrals || 0) * 200;
        const videoPoints = (stats.videos?.totalCreated || 0) * 100;
        const totalLoyaltyPoints = shopPoints + referralPoints + videoPoints;

        try {
          const walletApi = (await import('@/services/walletApi')).default;
          const walletResponse = await walletApi.getBalance();
          if (walletResponse.success && walletResponse.data) {
            const rezCoin = walletResponse.data.coins.find((c: any) => c.type === 'rez');
            setUserPoints(rezCoin?.amount || totalLoyaltyPoints);
          } else {
            setUserPoints(totalLoyaltyPoints);
          }
        } catch {
          setUserPoints(totalLoyaltyPoints);
        }
      }
    } catch {
      setUserPoints(authState.user?.wallet?.balance || 0);
    }
  };

  // Animated styles
  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [
      { translateY: slideAnim.value },
      { scale: scaleAnim.value },
    ],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowAnim.value, [0.5, 1], [0.3, 0.6]),
    transform: [{ scale: interpolate(glowAnim.value, [0.5, 1], [0.95, 1.05]) }],
  }));

  const animatedFloatStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatAnim.value, [0, 1], [0, -8]) },
      { rotate: `${interpolate(rotateAnim.value, [-1, 1], [-2, 2])}deg` },
    ],
  }));

  const animatedShimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmerAnim.value, [0, 1], [-200, SCREEN_WIDTH + 200]) }],
  }));

  return (
    <View style={styles.wrapper}>
      {/* Main Gradient Background */}
      <LinearGradient
        colors={[gradientColors[0], gradientColors[1], '#0B2240']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        {/* Animated Glow Effect */}
        <Animated.View style={[styles.glowOrb, { backgroundColor: categoryVisuals.glowColor }, animatedGlowStyle]} />
        <Animated.View style={[styles.glowOrbSecondary, { backgroundColor: categoryVisuals.accentColor }, animatedGlowStyle]} />

        {/* Decorative floating shapes */}
        <Animated.View style={[styles.floatingShape1, animatedFloatStyle]}>
          <View style={[styles.shape, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
        </Animated.View>
        <Animated.View style={[styles.floatingShape2, animatedFloatStyle]}>
          <View style={[styles.shapeCircle, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
        </Animated.View>

        <Animated.View style={[styles.contentWrapper, animatedContentStyle]}>
          {/* Top Navigation Row */}
          <View style={styles.topRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.glassButton}
              accessibilityLabel="Go back"
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
                style={styles.glassButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="chevron-back" size={22} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Center: Category Title with Icon */}
            <View style={styles.titleContainer}>
              <View style={styles.titleIconWrapper}>
                <Ionicons name={categoryVisuals.headerIcon} size={20} color="#FFD700" />
              </View>
              <Text style={styles.categoryTitle}>{categoryName}</Text>
            </View>

            {/* Right Icons */}
            <View style={styles.rightIcons}>
              <TouchableOpacity
                style={styles.coinButton}
                onPress={() => router.push('/CoinPage')}
              >
                <LinearGradient
                  colors={['rgba(255,215,0,0.3)', 'rgba(255,165,0,0.2)']}
                  style={styles.coinGradient}
                >
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.coinText}>{userPoints}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.glassButton}
                onPress={() => router.push('/CartPage')}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
                  style={styles.glassButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="bag-handle-outline" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => authState.isAuthenticated && showModal()}
              >
                <LinearGradient
                  colors={['#FFD700', '#FFA500', categoryVisuals.accentColor]}
                  style={styles.profileGradient}
                >
                  <Text style={styles.profileInitial}>
                    {authState.user?.profile?.firstName?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Banner Section - Glassmorphism Card */}
          <Animated.View style={[styles.heroBanner, animatedFloatStyle]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
              style={styles.glassCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Shimmer effect */}
              <Animated.View style={[styles.shimmer, animatedShimmerStyle]}>
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
                  style={styles.shimmerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>

              <View style={styles.bannerContent}>
                {/* Left side - Text content */}
                <View style={styles.bannerTextSection}>
                  <View style={styles.taglineContainer}>
                    <Ionicons name={categoryVisuals.icon} size={14} color="#FFD700" />
                    <Text style={styles.taglineText}>{categoryVisuals.tagline}</Text>
                  </View>

                  <Text style={styles.bannerTitle}>{banner.title}</Text>
                  <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>

                  {/* CTA Button */}
                  <TouchableOpacity style={styles.ctaButton}>
                    <LinearGradient
                      colors={['#FFD700', '#FFA500']}
                      style={styles.ctaGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.ctaText}>{banner.tag}</Text>
                      <Ionicons name="arrow-forward" size={14} color="#0B2240" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Right side - Discount Badge */}
                <View style={styles.discountSection}>
                  <View style={styles.discountBadge}>
                    <LinearGradient
                      colors={['#FFD700', '#FF8C00']}
                      style={styles.discountGradient}
                    >
                      <Text style={styles.uptoText}>UPTO</Text>
                      <Text style={styles.discountValue}>{banner.discount}</Text>
                      <Text style={styles.offText}>OFF</Text>
                    </LinearGradient>
                    {/* 3D shadow effect */}
                    <View style={styles.badgeShadow} />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </LinearGradient>

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
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  container: {
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    minHeight: 320,
  },
  glowOrb: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.4,
  },
  glowOrbSecondary: {
    position: 'absolute',
    bottom: 50,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.2,
  },
  floatingShape1: {
    position: 'absolute',
    top: 80,
    right: 30,
  },
  floatingShape2: {
    position: 'absolute',
    bottom: 100,
    left: 20,
  },
  shape: {
    width: 60,
    height: 60,
    borderRadius: 16,
    transform: [{ rotate: '45deg' }],
  },
  shapeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contentWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  glassButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
  },
  glassButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  titleIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
      },
      android: {
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
      },
      web: {
        textShadow: '0 1px 4px rgba(0,0,0,0.3)',
      },
    }),
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  coinGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    gap: 4,
  },
  coinText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
  },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      android: {
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      web: {
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      },
    }),
  },
  heroBanner: {
    marginTop: 8,
  },
  glassCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  shimmerGradient: {
    width: 100,
    height: '100%',
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTextSection: {
    flex: 1,
    paddingRight: 16,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  taglineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    lineHeight: 34,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
      android: {
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
      web: {
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      },
    }),
  },
  bannerSubtitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    lineHeight: 34,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
      android: {
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
      web: {
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      },
    }),
  },
  ctaButton: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B2240',
    letterSpacing: 0.5,
  },
  discountSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'relative',
  },
  discountGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  badgeShadow: {
    position: 'absolute',
    bottom: -6,
    left: 6,
    right: 6,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 45,
    transform: [{ scaleY: 0.3 }],
  },
  uptoText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0B2240',
    letterSpacing: 1,
  },
  discountValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0B2240',
    lineHeight: 32,
  },
  offText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0B2240',
    letterSpacing: 1,
  },
});

export default CategoryHeader;
