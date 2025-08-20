import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

interface VisitStoreButtonProps {
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function VisitStoreButton({
  title = "Visit store",
  onPress,
  disabled = false,
  loading = false
}: VisitStoreButtonProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 360;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled || loading) return;

    // Add press animation (disabled on iOS to prevent conflicts)
    if (Platform.OS === 'ios') {
      // Quick scale without animation
      scaleAnim.setValue(0.96);
      setTimeout(() => scaleAnim.setValue(1), 50);
    } else {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.96,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    onPress?.();
  };

  const getGradientColors = (): [string, string, ...string[]] => {
    if (disabled) return ['#D1D5DB', '#9CA3AF'];
    if (loading) return ['#A78BFA', '#8B5CF6'];
    return ['#8B5CF6', '#7C3AED', '#6366f1'];
  };

  return (
    <View style={[
      styles.container,
      Platform.OS === 'ios' && styles.iosContainer
    ]}>
      <Animated.View style={[
        styles.buttonWrapper,
        { transform: [{ scale: scaleAnim }] }
      ]}>
        <TouchableOpacity
          onPress={handlePress}
          disabled={disabled || loading}
          activeOpacity={0.9}
          style={styles.button}
          accessibilityLabel={loading ? "Loading" : title}
          accessibilityRole="button"
          accessibilityHint={loading ? "Please wait while loading" : "Visit the physical store location"}
          accessibilityState={{ disabled: disabled || loading, busy: loading }}
        >
          <LinearGradient
            colors={getGradientColors()}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.buttonContent}>
              {/* Store Icon */}
              {!loading && (
                <Ionicons 
                  name="storefront" 
                  size={isSmallScreen ? 20 : 22} 
                  color="#FFFFFF" 
                  style={styles.storeIcon}
                />
              )}
              
              {/* Loading Spinner */}
              {loading && (
                <Animated.View style={styles.loadingSpinner}>
                  <Ionicons 
                    name="refresh" 
                    size={isSmallScreen ? 20 : 22} 
                    color="#FFFFFF"
                  />
                </Animated.View>
              )}

              {/* Button Text */}
              <ThemedText style={[
                styles.buttonText,
                { fontSize: isSmallScreen ? 16 : 18 }
              ]}>
                {loading ? "Loading..." : title}
              </ThemedText>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  iosContainer: {
    paddingBottom: 34, // Extra padding for iOS home indicator
  },
  buttonWrapper: {
    width: '100%',
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeIcon: {
    marginRight: 12,
  },
  loadingSpinner: {
    marginRight: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});