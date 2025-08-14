import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ReviewTabsProps, TabType } from '@/types/reviews';

const ReviewTabs: React.FC<ReviewTabsProps> = ({
  activeTab,
  onTabChange,
  reviewCount,
  ugcCount = 0,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = screenWidth / 2.3; // more dynamic than fixed 64px padding
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const targetX = activeTab === 'reviews' ? 0 : tabWidth;
    Animated.spring(translateX, {
      toValue: targetX,
      tension: 150,
      friction: 15,
      useNativeDriver: true,
    }).start();
  }, [activeTab, tabWidth, translateX]);

  const handleTabPress = (tab: TabType) => {
    onTabChange(tab);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {/* Active tab indicator */}
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              width: tabWidth,
              transform: [{ translateX }],
            },
          ]}
        />

        {/* Reviews Tab */}
        <TouchableOpacity
          style={[styles.tab, { width: tabWidth }]}
          onPress={() => handleTabPress('reviews')}
          activeOpacity={0.8}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'reviews'
                ? styles.activeTabText
                : styles.inactiveTabText,
            ]}
          >
            Reviews ({reviewCount})
          </ThemedText>
        </TouchableOpacity>

        {/* UGC Content Tab */}
        <TouchableOpacity
          style={[styles.tab, { width: tabWidth }]}
          onPress={() => handleTabPress('ugc')}
          activeOpacity={0.8}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'ugc'
                ? styles.activeTabText
                : styles.inactiveTabText,
            ]}
          >
            UGC Content {ugcCount > 0 && `(${ugcCount})`}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 6,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  activeIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  tab: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    zIndex: 1,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  inactiveTabText: {
    color: '#64748B',
  },
});

export default ReviewTabs;
