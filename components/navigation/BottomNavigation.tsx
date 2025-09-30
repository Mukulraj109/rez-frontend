import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface BottomNavigationProps {
  style?: any;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ style }) => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Home',
      route: '/(tabs)',
      icon: 'house.fill',
      isActive: pathname === '/(tabs)' || pathname === '/',
    },
    {
      name: 'Play',
      route: '/(tabs)/play',
      icon: 'play.fill',
      isActive: pathname === '/(tabs)/play',
    },
    {
      name: 'Earn',
      route: '/(tabs)/earn',
      icon: 'indianrupeesign',
      isActive: pathname === '/(tabs)/earn',
    },
  ];

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={[styles.container, style]}>
      <BlurView
        intensity={60}
        tint={Platform.OS === 'ios' ? 'light' : 'default'}
        style={styles.blurView}
      >
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.7}
            >
              <IconSymbol
                size={22}
                name={tab.icon}
                color={tab.isActive ? '#8B5CF6' : '#0F0F0F'}
              />
              <View style={styles.tabLabel}>
                <View style={[
                  styles.labelContainer,
                  tab.isActive && styles.activeLabelContainer
                ]}>
                  <Text style={[
                    styles.labelText,
                    { color: tab.isActive ? '#8B5CF6' : '#0F0F0F' }
                  ]}>
                    {tab.name}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    zIndex: 1000,
  },
  blurView: {
    flex: 1,
    borderTopWidth: 0,
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    marginTop: 4,
  },
  labelContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeLabelContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default BottomNavigation;
