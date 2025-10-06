import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useNetworkStatus from '@/hooks/useNetworkStatus';

const { width } = Dimensions.get('window');

interface OfflineBannerProps {
  position?: 'top' | 'bottom';
  showWhenOffline?: boolean;
  showWhenOnline?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export function OfflineBanner({
  position = 'top',
  showWhenOffline = true,
  showWhenOnline = true,
  autoHide = true,
  autoHideDelay = 3000,
}: OfflineBannerProps) {
  const { isOnline, wasOffline, resetWasOffline, connectionQuality } = useNetworkStatus();
  const [slideAnim] = useState(new Animated.Value(position === 'top' ? -100 : 100));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner when going offline
    if (!isOnline && showWhenOffline) {
      showBanner();
    }
    // Show banner when coming back online
    else if (isOnline && wasOffline && showWhenOnline) {
      showBanner();

      // Auto-hide after delay
      if (autoHide) {
        setTimeout(() => {
          hideBanner();
          resetWasOffline();
        }, autoHideDelay);
      }
    }
    // Hide banner when online and not just reconnected
    else if (isOnline && !wasOffline) {
      hideBanner();
    }
  }, [isOnline, wasOffline]);

  const showBanner = () => {
    setIsVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const hideBanner = () => {
    Animated.timing(slideAnim, {
      toValue: position === 'top' ? -100 : 100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
  };

  if (!isVisible) {
    return null;
  }

  const getBannerColor = () => {
    if (!isOnline) {
      return '#FF3B30'; // Red for offline
    }
    if (connectionQuality === 'poor') {
      return '#FF9500'; // Orange for poor connection
    }
    return '#34C759'; // Green for online
  };

  const getBannerIcon = () => {
    if (!isOnline) {
      return 'cloud-offline';
    }
    if (connectionQuality === 'poor') {
      return 'wifi';
    }
    return 'checkmark-circle';
  };

  const getBannerMessage = () => {
    if (!isOnline) {
      return 'No internet connection';
    }
    if (connectionQuality === 'poor') {
      return 'Poor connection';
    }
    return 'Back online';
  };

  const getBannerSubMessage = () => {
    if (!isOnline) {
      return 'You can still browse, changes will sync later';
    }
    if (connectionQuality === 'poor') {
      return 'Some features may be slow';
    }
    return 'All features are available';
  };

  const backgroundColor = getBannerColor();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          transform: [{ translateY: slideAnim }],
          [position]: 0,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={getBannerIcon()} size={24} color="#FFFFFF" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.mainText}>{getBannerMessage()}</Text>
          <Text style={styles.subText}>{getBannerSubMessage()}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    width,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48, // Account for status bar
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  mainText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  subText: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.9,
  },
});

export default OfflineBanner;
