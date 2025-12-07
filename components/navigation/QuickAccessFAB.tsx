// Quick Access FAB (Floating Action Button)
// Expandable floating action button with quick access to key features

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';

interface QuickAction {
  icon: string;
  label: string;
  route: string;
  color: string;
}

const actions: QuickAction[] = [
  { icon: '📄', label: 'Upload Bill', route: '/bill-upload', color: '#4CAF50' },
  { icon: '🎁', label: 'Refer', route: '/referral', color: '#FF6B6B' },
  { icon: '👑', label: 'Premium', route: '/subscription/plans', color: '#FFD700' },
  { icon: '🎮', label: 'Games', route: '/games', color: '#9C27B0' },
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
              outputRange: [0, -(60 * (actions.length - index))],
            });

            const opacity = animation.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.5, 1],
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.actionWrapper,
                  {
                    transform: [{ translateY }],
                    opacity,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: action.color }]}
                  onPress={() => handleActionPress(action.route)}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.actionIcon}>{action.icon}</ThemedText>
                  <ThemedText style={styles.actionLabel}>{action.label}</ThemedText>
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
      >
        <LinearGradient
          colors={expanded ? ['#EF4444', '#DC2626'] : ['#8B5CF6', '#7C3AED']}
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
              ],
            }}
          >
            <ThemedText style={styles.fabIcon}>
              {expanded ? '✕' : '⚡'}
            </ThemedText>
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
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  actionWrapper: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  fabContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFF',
  },
});
