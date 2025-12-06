// Quick Access FAB (Floating Action Button)
// Premium glassmorphic FAB with ReZ brand colors
// Follows ReZ Design System: Primary Green (#00C06A) + Sun Gold (#FFC857) for rewards

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface QuickAction {
  icon: string;
  label: string;
  route: string;
  gradient: string[];
}

// ReZ Brand Colors
const REZ_COLORS = {
  primary: '#00C06A',
  primaryDark: '#00A16B',
  deepTeal: '#00796B',
  sunGold: '#FFC857',
  goldDark: '#FF9F1C',
  midnightNavy: '#0B2240',
};

const actions: QuickAction[] = [
  { 
    icon: 'document-text-outline', 
    label: 'Upload Bill', 
    route: '/bill-upload', 
    gradient: [REZ_COLORS.primary, REZ_COLORS.primaryDark] 
  },
  { 
    icon: 'gift-outline', 
    label: 'Refer', 
    route: '/referral', 
    gradient: [REZ_COLORS.sunGold, REZ_COLORS.goldDark] 
  },
  { 
    icon: 'diamond-outline', 
    label: 'Premium', 
    route: '/subscription/plans', 
    gradient: [REZ_COLORS.sunGold, REZ_COLORS.goldDark] 
  },
  { 
    icon: 'game-controller-outline', 
    label: 'Games', 
    route: '/games', 
    gradient: [REZ_COLORS.primary, REZ_COLORS.deepTeal] 
  },
];

export default function QuickAccessFAB() {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
    setExpanded(!expanded);
  };

  const handleActionPress = (route: string) => {
    setExpanded(false);
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    router.push(route as any);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {expanded && (
        <View style={styles.actionsContainer}>
          {actions.map((action, index) => {
            const translateY = animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -(70 * (actions.length - index))],
            });

            const opacity = animation.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.5, 1],
            });

            const scale = animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.actionWrapper,
                  {
                    transform: [{ translateY }, { scale }],
                    opacity,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleActionPress(action.route)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={action.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionGradient}
                  >
                    <Ionicons 
                      name={action.icon as any} 
                      size={20} 
                      color="#FFFFFF" 
                    />
                    <ThemedText style={styles.actionLabel}>{action.label}</ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      )}

      <TouchableOpacity
        style={styles.fabContainer}
        onPress={toggleExpand}
        activeOpacity={0.9}
        activeBackgroundColor="transparent"
      >
        <LinearGradient
          colors={expanded 
            ? [REZ_COLORS.deepTeal, REZ_COLORS.primaryDark] 
            : [REZ_COLORS.primary, REZ_COLORS.primaryDark, REZ_COLORS.sunGold]
          }
          style={styles.fab}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg'],
                  }),
                },
                {
                  scale: animation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.1, 1],
                  }),
                },
              ],
            }}
          >
            <Ionicons 
              name={expanded ? 'close' : 'flash'} 
              size={28} 
              color="#FFFFFF" 
            />
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 90,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 1000,
    backgroundColor: 'transparent', // Ensure no white background
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'transparent', // Ensure no white background
  },
  actionWrapper: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent', // Ensure no white background
  },
  actionButton: {
    borderRadius: 20,
    marginBottom: 10,
    overflow: 'hidden',
    backgroundColor: 'transparent', // Ensure no white background
    // Premium shadow for glassmorphic effect
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 8px 24px rgba(0, 192, 106, 0.3)',
      },
    }),
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 10,
    fontFamily: 'Inter-SemiBold',
  },
  fabContainer: {
    backgroundColor: 'transparent', // Ensure no white background
    borderRadius: 32, // Match FAB border radius
    overflow: 'hidden', // Ensure gradient doesn't show white edges
    // Premium glassmorphic shadow with green glow
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0px 8px 32px rgba(0, 192, 106, 0.4), 0px 0px 20px rgba(255, 200, 87, 0.2)',
      },
    }),
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Ensure no white background
    overflow: 'hidden', // Ensure gradient fills completely
  },
});
