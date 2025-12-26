import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const proofItems = [
  { id: 1, icon: 'people', text: '2,340 people earning near you', color: '#3B82F6' },
  { id: 2, icon: 'trending-up', text: '₹45,000 saved today in BTM Layout', color: '#00C06A' },
  { id: 3, icon: 'flame', text: '156 offers expiring in 2 hours', color: '#F97316' },
  { id: 4, icon: 'star', text: '4.8★ average store rating', color: '#F59E0B' },
  { id: 5, icon: 'wallet', text: '₹1.2 Cr cashback given this month', color: '#A855F7' },
];

const SocialProofStrip = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % proofItems.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.spring(scrollX, {
      toValue: currentIndex,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [currentIndex]);

  return (
    <View style={styles.container}>
      <View style={styles.strip}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>

        <View style={styles.contentContainer}>
          {proofItems.map((item, index) => {
            const inputRange = [index - 1, index, index + 1];
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0, 1, 0],
              extrapolate: 'clamp',
            });
            const translateY = scrollX.interpolate({
              inputRange,
              outputRange: [20, 0, -20],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={item.id}
                style={[
                  styles.proofItem,
                  {
                    opacity,
                    transform: [{ translateY }],
                    position: index === currentIndex ? 'relative' : 'absolute',
                  },
                ]}
              >
                <View style={[styles.iconBadge, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={14} color={item.color} />
                </View>
                <Text style={styles.proofText}>{item.text}</Text>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.dotsContainer}>
          {proofItems.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  strip: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#EF4444',
  },
  contentContainer: {
    flex: 1,
    height: 24,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  proofItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proofText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: '#00C06A',
    width: 12,
  },
});

export default SocialProofStrip;
