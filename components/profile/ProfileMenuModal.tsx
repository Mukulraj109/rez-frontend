// ProfileMenuModal Component
// Premium glassmorphism design with green/gold accents

import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileMenuModalProps, ProfileMenuItem } from '@/types/profile.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_WIDTH = SCREEN_WIDTH * 0.88;

// Premium Design Colors
const COLORS = {
  // Primary Green
  primary: '#00C06A',
  primaryDark: '#00796B',
  primaryLight: 'rgba(0, 192, 106, 0.1)',
  primaryGlow: 'rgba(0, 192, 106, 0.3)',

  // Gold (rewards)
  gold: '#FFC857',
  goldLight: 'rgba(255, 200, 87, 0.15)',
  goldGlow: 'rgba(255, 200, 87, 0.3)',

  // Dark Navy
  navy: '#0B2240',

  // Text
  textPrimary: '#0B2240',
  textSecondary: '#1F2D3D',
  textMuted: '#9AA7B2',

  // Surface
  surface: '#F7FAFC',
  white: '#FFFFFF',

  // Glass
  glassWhite: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.4)',

  // Status
  success: '#10B981',
  error: '#EF4444',
};

export default function ProfileMenuModal({
  visible,
  onClose,
  user,
  menuSections,
  onMenuItemPress,
}: ProfileMenuModalProps) {
  const slideAnim = useRef(new Animated.Value(MODAL_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { actions } = useAuth();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: MODAL_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const performLogout = async () => {
    try {
      onClose();
      await actions.logout();
      try {
        router.replace('/sign-in');
      } catch (routerError) {
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        } else {
          router.push('/sign-in');
        }
      }
    } catch (error) {
      Alert.alert('Logout Error', 'There was an issue logging you out.', [
        {
          text: 'OK',
          onPress: () => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          },
        },
      ]);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      performLogout();
      return;
    }
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: performLogout },
    ]);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}
    >
      {/* Glass overlay effect */}
      <View style={styles.headerGlassOverlay} />

      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <View style={styles.closeButtonInner}>
          <Ionicons name="close" size={20} color={COLORS.white} />
        </View>
      </TouchableOpacity>

      {/* User Section */}
      <View style={styles.userSection}>
        {/* Avatar with gradient ring */}
        <View style={styles.avatarWrapper}>
          <LinearGradient
            colors={[COLORS.gold, '#FF9F1C']}
            style={styles.avatarRing}
          >
            <View style={styles.avatarInner}>
              <ThemedText style={styles.avatarText}>
                {user?.initials || 'U'}
              </ThemedText>
            </View>
          </LinearGradient>
          {/* Online indicator */}
          <View style={styles.onlineIndicator} />
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <ThemedText style={styles.userName}>
            {user?.name || 'User Name'}
          </ThemedText>
          <ThemedText style={styles.userEmail}>
            {user?.email || 'user@example.com'}
          </ThemedText>

          {/* Verified Badge */}
          {user?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color={COLORS.success} />
              <ThemedText style={styles.verifiedText}>Verified</ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.statIconWrapper}>
            <Ionicons name="wallet" size={16} color={COLORS.gold} />
          </View>
          <ThemedText style={styles.statValue}>
            ₹{user?.wallet?.balance?.toLocaleString('en-IN') || '0'}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Wallet</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={styles.statIconWrapper}>
            <Ionicons name="trending-up" size={16} color={COLORS.gold} />
          </View>
          <ThemedText style={styles.statValue}>
            ₹{user?.wallet?.totalEarned?.toLocaleString('en-IN') || '0'}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Earned</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={styles.statIconWrapper}>
            <Ionicons name="time" size={16} color={COLORS.gold} />
          </View>
          <ThemedText style={styles.statValue}>
            ₹{user?.wallet?.pendingAmount?.toLocaleString('en-IN') || '0'}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Pending</ThemedText>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
        <ThemedText style={styles.logoutText}>Sign Out</ThemedText>
      </TouchableOpacity>
    </LinearGradient>
  );

  const renderMenuItem = (item: ProfileMenuItem, index: number) => {
    const isGold = item.id === 'wallet' || item.id === 'subscription';
    const isNew = item.badge === 'NEW';

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.menuItem,
          isGold && styles.menuItemGold,
        ]}
        onPress={() => item.isEnabled && onMenuItemPress(item)}
        activeOpacity={0.7}
        disabled={!item.isEnabled}
      >
        {/* Icon */}
        <View style={[
          styles.menuIconContainer,
          isGold && styles.menuIconGold,
        ]}>
          <Ionicons
            name={item.icon as any}
            size={20}
            color={isGold ? COLORS.gold : COLORS.primary}
          />
        </View>

        {/* Title */}
        <View style={styles.menuTextContainer}>
          <ThemedText style={styles.menuTitle}>{item.title}</ThemedText>
          {item.description && (
            <ThemedText style={styles.menuDescription}>{item.description}</ThemedText>
          )}
        </View>

        {/* Badge & Arrow */}
        <View style={styles.menuRight}>
          {item.badge && (
            <View style={[
              styles.badge,
              isNew ? styles.badgeNew : styles.badgeNumeric,
            ]}>
              <ThemedText style={[
                styles.badgeText,
                isNew && styles.badgeTextNew,
              ]}>
                {item.badge}
              </ThemedText>
            </View>
          )}
          {item.showArrow && (
            <Ionicons
              name="chevron-forward"
              size={18}
              color={COLORS.textMuted}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderMenuSection = (section: any, sectionIndex: number) => (
    <View key={`section_${sectionIndex}`} style={styles.menuSection}>
      {sectionIndex === 1 && (
        <View style={styles.sectionHeader}>
          <LinearGradient
            colors={[COLORS.gold, '#FF9F1C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeaderAccent}
          />
          <ThemedText style={styles.sectionTitle}>Premium Features</ThemedText>
        </View>
      )}
      {section.items.map((item: ProfileMenuItem, index: number) =>
        renderMenuItem(item, index)
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />

      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateX: slideAnim }],
                height: SCREEN_HEIGHT,
                paddingBottom: insets.bottom,
              },
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {/* Glass Background for Web */}
            {Platform.OS === 'web' && (
              <View style={styles.webGlassBackground} />
            )}

            {renderHeader()}

            <ScrollView
              style={styles.menuContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.menuContent}
              bounces={false}
            >
              {/* Quick Actions Title */}
              <View style={styles.quickActionsHeader}>
                <ThemedText style={styles.quickActionsTitle}>Quick Actions</ThemedText>
                <View style={styles.quickActionsTitleLine} />
              </View>

              {menuSections?.map(renderMenuSection)}

              <View style={styles.footerSpace} />
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 34, 64, 0.6)',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  modalContainer: {
    width: MODAL_WIDTH,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRightWidth: 0,
  },
  webGlassBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    // @ts-ignore - web only
    backdropFilter: 'blur(60px) saturate(180%)',
    WebkitBackdropFilter: 'blur(60px) saturate(180%)',
  },

  // Header
  headerContainer: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  headerGlassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  closeButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  // User Section
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 33,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 4,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 200, 87, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 8,
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: 8,
  },

  // Menu Container
  menuContainer: {
    flex: 1,
    backgroundColor: 'rgba(247, 250, 252, 0.8)',
  },
  menuContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Quick Actions Header
  quickActionsHeader: {
    marginBottom: 16,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  quickActionsTitleLine: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionHeaderAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Menu Section
  menuSection: {
    marginBottom: 8,
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  menuItemGold: {
    backgroundColor: 'rgba(255, 200, 87, 0.12)',
    borderColor: 'rgba(255, 200, 87, 0.3)',
    shadowColor: COLORS.gold,
    shadowOpacity: 0.15,
  },
  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuIconGold: {
    backgroundColor: COLORS.goldLight,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: 0.1,
  },
  menuDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Badge
  badge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  badgeNew: {
    backgroundColor: COLORS.primary,
  },
  badgeNumeric: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryGlow,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  badgeTextNew: {
    color: COLORS.white,
    fontSize: 9,
    letterSpacing: 0.5,
  },

  footerSpace: {
    height: 40,
  },
});
