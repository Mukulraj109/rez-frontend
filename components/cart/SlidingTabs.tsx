import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { SlidingTabsProps, TabData } from '@/types/cart';

const defaultTabs: TabData[] = [
  { key: 'products', title: 'Products', icon: 'cube-outline' },
  { key: 'service', title: 'Service', icon: 'construct-outline' }
];

export default function SlidingTabs({ 
  activeTab, 
  onTabChange, 
  tabs = defaultTabs 
}: SlidingTabsProps) {
  const { width } = Dimensions.get('window');
  const tabWidth = width / tabs.length;
  const underlinePosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.key === activeTab);
    animateUnderline(activeIndex);
  }, [activeTab, tabs]);

  const animateUnderline = (tabIndex: number) => {
    Animated.timing(underlinePosition, {
      toValue: tabIndex * tabWidth,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const handleTabPress = (tabKey: string) => {
    if (tabKey !== activeTab) {
      onTabChange(tabKey as 'products' | 'service');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, { width: tabWidth }]}
              onPress={() => handleTabPress(tab.key)}
              activeOpacity={0.8}
              accessibilityLabel={`${tab.title} tab`}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <View style={styles.tabContent}>
                <Ionicons 
                  name={tab.icon as any} 
                  size={18} 
                  color={isActive ? '#8B5CF6' : '#9CA3AF'} 
                  style={styles.tabIcon}
                />
                <ThemedText style={[
                  styles.tabText,
                  isActive ? styles.activeTabText : styles.inactiveTabText
                ]}>
                  {tab.title}
                </ThemedText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Animated Underline */}
      <Animated.View
        style={[
          styles.underline,
          {
            width: tabWidth * 0.6, // 60% of tab width for better visual
            transform: [
              {
                translateX: underlinePosition.interpolate({
                  inputRange: [0, tabWidth],
                  outputRange: [tabWidth * 0.2, tabWidth * 1.2], // Center the underline
                  extrapolate: 'clamp',
                })
              }
            ]
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    position: 'relative',
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 50,
  },
  tab: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  activeTabText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  inactiveTabText: {
    color: '#9CA3AF',
    fontWeight: '500',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 1.5,
  },
});