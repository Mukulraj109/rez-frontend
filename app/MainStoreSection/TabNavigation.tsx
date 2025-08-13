import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

export type TabKey = 'about' | 'deals' | 'reviews';

interface TabData {
  key: TabKey;
  title: string;
  icon: string;
}

interface TabNavigationProps {
  activeTab: TabKey;
  onTabChange: (tabKey: TabKey) => void;
}

const tabs: TabData[] = [
  { key: 'about', title: 'ABOUT', icon: 'information-circle-outline' },
  { key: 'deals', title: 'Walk-In Deals', icon: 'walk-outline' },
  { key: 'reviews', title: 'Reviews', icon: 'star-outline' }
];

export default function TabNavigation({ 
  activeTab, 
  onTabChange 
}: TabNavigationProps) {
  const { width } = Dimensions.get('window');
  const tabWidth = width / tabs.length;
  const underlinePosition = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(tabWidth * 0.3)).current;

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.key === activeTab);
    animateUnderline(activeIndex);
  }, [activeTab]);

  const animateUnderline = (tabIndex: number) => {
    const targetPosition = tabIndex * tabWidth;
    const targetWidth = tabWidth * 0.3; // 30% of tab width for underline

    Animated.parallel([
      Animated.timing(underlinePosition, {
        toValue: targetPosition,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(underlineWidth, {
        toValue: targetWidth,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // width animation needs layout
      })
    ]).start();
  };

  const handleTabPress = (tabKey: TabKey) => {
    if (tabKey !== activeTab) {
      onTabChange(tabKey);
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
              activeOpacity={0.7}
              accessibilityLabel={`${tab.title} tab`}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <View style={styles.tabContent}>
                <Ionicons 
                  name={tab.icon as any} 
                  size={18} 
                  color={isActive ? '#333333' : '#999999'} 
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
      <View style={styles.underlineContainer}>
        <Animated.View
          style={[
            styles.underline,
            {
              width: underlineWidth,
              transform: [
                {
                  translateX: underlinePosition.interpolate({
                    inputRange: [0, tabWidth],
                    outputRange: [tabWidth * 0.35, tabWidth * 1.35], // Center the underline
                    extrapolate: 'clamp',
                  })
                }
              ]
            }
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabIcon: {
    marginBottom: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
    lineHeight: 16,
  },
  activeTabText: {
    color: '#333333',
    fontWeight: '700',
  },
  inactiveTabText: {
    color: '#999999',
    fontWeight: '500',
  },
  underlineContainer: {
    position: 'relative',
    height: 3,
    backgroundColor: 'transparent',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: '#333333',
    borderRadius: 1.5,
  },
});