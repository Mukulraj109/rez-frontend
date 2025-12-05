import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#00C06A',
        tabBarInactiveTintColor: '#374151',
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 70,
          borderTopWidth: 2,
          borderTopColor: '#E5E7EB',
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 20,
        },
        tabBarBackground: () => null,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '800',
          marginTop: -4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={22}
              name="house.fill"
              color={color}
              accessibilityLabel="Home icon"
            />
          ),
          tabBarAccessibilityLabel: 'Home tab, navigate to home screen',
        }}
      />
      <Tabs.Screen
        name="play"
        options={{
          title: 'Play',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={22}
              name="play.fill"
              color={color}
              accessibilityLabel="Play icon"
            />
          ),
          tabBarAccessibilityLabel: 'Play tab, watch videos and discover content',
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
