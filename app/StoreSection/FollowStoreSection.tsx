// FollowStoreSection.tsx
// Modern "Follow Store" section for Store Pages
// Beautiful UI with gradients, animations, and modern design

import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ActivityIndicator, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { triggerImpact, triggerNotification } from "@/utils/haptics";
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import wishlistApi from '@/services/wishlistApi';
import { showAlert } from '@/components/common/CrossPlatformAlert';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import {
  Colors,
  Spacing,
  Shadows,
  BorderRadius,
  Typography,
  IconSize,
  Timing,
  Gradients,
} from '@/constants/DesignSystem';

interface FollowStoreSectionProps {
  storeData?: {
    id?: string;
    _id?: string;
    name?: string;
    title?: string;
    image?: string;
    logo?: string;
    category?: string;
    cashback?: number;
    discount?: number;
  } | null;
  /** Optional: Pass current follow state from parent for sync */
  isFollowingProp?: boolean;
  /** Optional: Callback when follow state changes */
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowStoreSection({ storeData, isFollowingProp, onFollowChange }: FollowStoreSectionProps) {
  const router = useRouter();
  const { state: authState } = useAuth();
  const isAuthenticated = authState?.isAuthenticated && !!authState?.user;

  const [isFollowing, setIsFollowing] = useState(isFollowingProp ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(isFollowingProp === undefined);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Sync with parent prop when it changes
  useEffect(() => {
    if (isFollowingProp !== undefined) {
      setIsFollowing(isFollowingProp);
      setIsCheckingStatus(false);
    }
  }, [isFollowingProp]);

  // Animation refs
  const heartScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const storeId = storeData?.id || storeData?._id;
  const storeName = storeData?.name || storeData?.title || 'this store';

  // Start pulse animation for the heart when following
  useEffect(() => {
    if (isFollowing) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isFollowing]);

  // Shimmer animation
  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  // Check if user already follows this store
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!storeId || !isAuthenticated) {
        setIsCheckingStatus(false);
        return;
      }

      try {
        const response = await wishlistApi.checkWishlistStatus('store', storeId);
        if (response.success && response.data?.inWishlist) {
          setIsFollowing(true);
        }
      } catch (error) {
        console.log('Error checking follow status:', error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkFollowStatus();
  }, [storeId, isAuthenticated]);

  // Heart animation
  const animateHeart = () => {
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.4,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 3,
        tension: 100,
      }),
    ]).start();
  };

  // Button press animation
  const animateButton = (toValue: number) => {
    Animated.spring(buttonScale, {
      toValue,
      useNativeDriver: true,
      friction: 7,
      tension: 100,
    }).start();
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      showAlert(
        'Sign In Required',
        'Please sign in to follow stores and get updates on their offers.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/sign-in') },
        ],
        'info'
      );
      return;
    }

    if (!storeId) {
      showAlert('Error', 'Store information not available', undefined, 'error');
      return;
    }

    triggerImpact('Medium');
    setIsLoading(true);

    try {
      if (isFollowing) {
        // Unfollow store
        const response = await wishlistApi.removeFromWishlist('store', storeId);
        if (response.success) {
          setIsFollowing(false);
          onFollowChange?.(false); // Notify parent
          triggerNotification('Success');
          animateHeart();
        } else {
          triggerNotification('Error');
          showAlert('Error', response.message || 'Failed to unfollow store', undefined, 'error');
        }
      } else {
        // Follow store
        const response = await wishlistApi.addToWishlist({
          itemType: 'store',
          itemId: storeId,
          notes: `Following ${storeName}`,
          priority: 'medium',
        });

        if (response.success) {
          setIsFollowing(true);
          onFollowChange?.(true); // Notify parent
          triggerNotification('Success');
          animateHeart();
          showAlert(
            'Store Followed!',
            `You're now following ${storeName}. You'll see their latest offers in your feed.`,
            undefined,
            'success'
          );
        } else {
          triggerNotification('Error');
          showAlert('Error', response.message || 'Failed to follow store', undefined, 'error');
        }
      }
    } catch (error) {
      triggerNotification('Error');
      showAlert('Error', 'Something went wrong. Please try again.', undefined, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = () => {
    if (!isFollowing) {
      showAlert('Follow First', 'Please follow the store first to enable notifications.', undefined, 'warning');
      return;
    }

    triggerImpact('Light');
    setNotificationsEnabled(!notificationsEnabled);
  };

  if (isCheckingStatus) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary[600]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Follow Card */}
      <Animated.View style={[styles.cardWrapper, { transform: [{ scale: buttonScale }] }]}>
        <LinearGradient
          colors={isFollowing
            ? ['#FF6B6B', '#EE5A5A', '#DC4747']
            : ['#667eea', '#764ba2', '#8B5CF6']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          {/* Decorative Elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.cardContent}
            onPress={handleFollowToggle}
            onPressIn={() => animateButton(0.96)}
            onPressOut={() => animateButton(1)}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel={isFollowing ? `Unfollow ${storeName}` : `Follow ${storeName}`}
            accessibilityState={{ selected: isFollowing }}
          >
            {/* Left: Animated Heart Icon */}
            <View style={styles.iconWrapper}>
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [
                      { scale: Animated.multiply(heartScale, isFollowing ? pulseAnim : new Animated.Value(1)) }
                    ]
                  }
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons
                    name={isFollowing ? 'heart' : 'heart-outline'}
                    size={32}
                    color="#FFF"
                  />
                )}
              </Animated.View>
              {isFollowing && (
                <View style={styles.heartGlow} />
              )}
            </View>

            {/* Center: Text Content */}
            <View style={styles.textContainer}>
              <ThemedText style={styles.title}>
                {isFollowing ? 'Following' : 'Follow Store'}
              </ThemedText>
              <ThemedText style={styles.subtitle} numberOfLines={1}>
                {isFollowing
                  ? `You're following ${storeName}`
                  : 'Get exclusive offers & updates'}
              </ThemedText>
            </View>

            {/* Right: Action Badge */}
            <View style={styles.actionContainer}>
              <View style={[
                styles.actionBadge,
                isFollowing && styles.actionBadgeActive
              ]}>
                <Ionicons
                  name={isFollowing ? 'checkmark' : 'add'}
                  size={20}
                  color="#FFF"
                />
              </View>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      {/* Notification Toggle Card */}
      {isFollowing && (
        <View style={styles.notificationCard}>
          <TouchableOpacity
            style={styles.notificationRow}
            onPress={handleNotificationToggle}
            activeOpacity={0.7}
            accessibilityRole="switch"
            accessibilityLabel="Deal notifications"
            accessibilityState={{ checked: notificationsEnabled }}
          >
            <View style={styles.notificationLeft}>
              <LinearGradient
                colors={notificationsEnabled
                  ? ['#10B981', '#059669']
                  : ['#E5E7EB', '#D1D5DB']
                }
                style={styles.notificationIconBg}
              >
                <Ionicons
                  name={notificationsEnabled ? 'notifications' : 'notifications-outline'}
                  size={20}
                  color={notificationsEnabled ? '#FFF' : '#6B7280'}
                />
              </LinearGradient>
              <View style={styles.notificationTextContainer}>
                <ThemedText style={styles.notificationTitle}>Deal Notifications</ThemedText>
                <ThemedText style={styles.notificationSubtitle}>
                  Get notified about new offers
                </ThemedText>
              </View>
            </View>

            {/* Custom Toggle Switch */}
            <View style={[styles.toggle, notificationsEnabled && styles.toggleActive]}>
              <Animated.View style={[
                styles.toggleKnob,
                notificationsEnabled && styles.toggleKnobActive
              ]} />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Benefits Section */}
      {!isFollowing && (
        <View style={styles.benefitsSection}>
          <ThemedText style={styles.benefitsTitle}>Why Follow?</ThemedText>
          <View style={styles.benefitsGrid}>
            <View style={styles.benefitCard}>
              <LinearGradient
                colors={['#FEF3C7', '#FDE68A']}
                style={styles.benefitIconBg}
              >
                <Ionicons name="flash" size={18} color="#D97706" />
              </LinearGradient>
              <ThemedText style={styles.benefitText}>Early Access</ThemedText>
            </View>

            <View style={styles.benefitCard}>
              <LinearGradient
                colors={['#DBEAFE', '#BFDBFE']}
                style={styles.benefitIconBg}
              >
                <Ionicons name="pricetag" size={18} color="#2563EB" />
              </LinearGradient>
              <ThemedText style={styles.benefitText}>Exclusive Deals</ThemedText>
            </View>

            <View style={styles.benefitCard}>
              <LinearGradient
                colors={['#FCE7F3', '#FBCFE8']}
                style={styles.benefitIconBg}
              >
                <Ionicons name="gift" size={18} color="#DB2777" />
              </LinearGradient>
              <ThemedText style={styles.benefitText}>Special Rewards</ThemedText>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },

  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Main Card
  cardWrapper: {
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.35)',
      },
    }),
  },

  gradientCard: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },

  decorativeCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  decorativeCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingVertical: 20,
  },

  iconWrapper: {
    position: 'relative',
    marginRight: Spacing.md,
  },

  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  heartGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: -1,
  },

  textContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
    letterSpacing: 0.3,
  },

  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },

  actionContainer: {
    alignItems: 'center',
  },

  actionBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },

  actionBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },

  // Notification Card
  notificationCard: {
    marginTop: Spacing.md,
    backgroundColor: '#FFF',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      },
    }),
  },

  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },

  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  notificationIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },

  notificationTextContainer: {
    flex: 1,
  },

  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },

  notificationSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Toggle Switch
  toggle: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
    padding: 3,
    justifyContent: 'center',
  },

  toggleActive: {
    backgroundColor: '#10B981',
  },

  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  toggleKnobActive: {
    alignSelf: 'flex-end',
  },

  // Benefits Section
  benefitsSection: {
    marginTop: Spacing.lg,
  },

  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  benefitsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },

  benefitCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: Spacing.md,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
    }),
  },

  benefitIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  benefitText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});
