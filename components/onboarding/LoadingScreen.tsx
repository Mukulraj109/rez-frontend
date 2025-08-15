import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import PurpleGradientBg from './PurpleGradientBg';

interface LoadingScreenProps {
  duration?: number;
  onComplete?: () => void;
}

export default function LoadingScreen({ duration = 5000, onComplete }: LoadingScreenProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start rotation animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    spinAnimation.start();

    // Complete after specified duration
    const timer = setTimeout(() => {
      spinAnimation.stop();
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(timer);
      spinAnimation.stop();
    };
  }, [duration, onComplete, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <PurpleGradientBg style={styles.container}>
      <View style={styles.loadingContainer}>
        <Animated.View
          style={[
            styles.spinner,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <View style={styles.spinnerInner} />
        </Animated.View>
      </View>
    </PurpleGradientBg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#FFFFFF',
  },
  spinnerInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'transparent',
  },
});