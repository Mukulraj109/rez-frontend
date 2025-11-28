// StoreActionButtons.tsx - Modernized with Design System & Haptics
import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { triggerImpact, triggerNotification } from "@/utils/haptics";
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { StoreActionButtonsProps } from '@/types/store-actions';
import {
  createButtonConfigs,
  getButtonLayout
} from '@/utils/store-action-logic';
import {
  createInitialButtonState,
  ButtonStateManager,
  createButtonHandler
} from '@/utils/button-state-manager';
import {
  Colors,
  Spacing,
  Shadows,
  BorderRadius,
  Typography,
  IconSize,
  Timing,
} from '@/constants/DesignSystem';

export default function StoreActionButtons({
  storeType,
  onBuyPress,
  onLockPress,
  onBookingPress,
  isBuyLoading = false,
  isLockLoading = false,
  isBookingLoading = false,
  isBuyDisabled = false,
  isLockDisabled = false,
  isBookingDisabled = false,
  isLocked = false,
  showBookingButton,
  customBuyText,
  customLockText,
  customBookingText,
  containerStyle,
  buttonStyle,
  textStyle,
  dynamicData,
}: StoreActionButtonsProps) {

  const { width } = Dimensions.get('window');
  const backgroundColor = useThemeColor({}, 'background');

  // Animation refs for each button type
  const buyScaleAnim = useRef(new Animated.Value(1)).current;
  const lockScaleAnim = useRef(new Animated.Value(1)).current;
  const bookingScaleAnim = useRef(new Animated.Value(1)).current;

  // Animation helper
  const animateScale = (animValue: Animated.Value, toValue: number) => {
    Animated.spring(animValue, {
      toValue,
      useNativeDriver: true,
      ...Timing.springBouncy,
    }).start();
  };

  // Dynamic button text based on product data
  const dynamicBuyText = customBuyText ||
    (dynamicData?.price ? `Buy for ₹${dynamicData.price}` : 'Buy Now');

  const dynamicLockText = isLocked
    ? 'Already Locked'
    : (customLockText || (dynamicData?.availabilityStatus === 'in_stock' ? 'Reserve Item' : 'Lock Price'));

  const dynamicBookingText = customBookingText ||
    (storeType === 'SERVICE' ? 'Book Service' : 'Schedule Pickup');
  
  // Component state management
  const [buttonState, setButtonState] = useState(createInitialButtonState());
  const stateManager = useMemo(() => 
    new ButtonStateManager(buttonState, setButtonState), 
    [buttonState]
  );

  // Generate button configurations based on props
  const buttonConfigs = useMemo(() =>
    createButtonConfigs({
      storeType,
      onBuyPress,
      onLockPress,
      onBookingPress,
      isBuyLoading,
      isLockLoading,
      isBookingLoading,
      isBuyDisabled,
      isLockDisabled: isLockDisabled || isLocked, // Disable if already locked
      isBookingDisabled,
      showBookingButton,
      customBuyText: dynamicBuyText,
      customLockText: dynamicLockText,
      customBookingText: dynamicBookingText,
    }),
    [
      storeType, onBuyPress, onLockPress, onBookingPress,
      isBuyLoading, isLockLoading, isBookingLoading,
      isBuyDisabled, isLockDisabled, isBookingDisabled, isLocked,
      showBookingButton, dynamicBuyText, dynamicLockText, dynamicBookingText
    ]
  );

  // Get layout configuration
  const layout = useMemo(() => 
    getButtonLayout(buttonConfigs.length, width), 
    [buttonConfigs.length, width]
  );

  // Enhanced button press handler with haptic feedback
  const handleButtonPress = useCallback((buttonId: 'buy' | 'lock' | 'booking') => {
    const config = buttonConfigs.find(c => c.id === buttonId);
    if (!config) return;

    // Haptic feedback
    triggerImpact('Medium');

    // Create enhanced handler with state management
    const enhancedHandler = createButtonHandler(
      buttonId,
      async () => {
        try {
          await config.onPress();
          // Show success feedback with haptic
          triggerNotification('Success');
          Alert.alert(
            'Success',
            `${config.title} action completed successfully!`,
            [{ text: 'OK' }]
          );
        } catch (error) {
          // Error feedback with haptic
          triggerNotification('Error');
          // Error will be handled by createButtonHandler
          throw error;
        }
      },
      stateManager
    );
    enhancedHandler();
  }, [buttonConfigs, stateManager]);

  // Get animation ref based on button ID
  const getAnimRef = (buttonId: string) => {
    switch (buttonId) {
      case 'buy': return buyScaleAnim;
      case 'lock': return lockScaleAnim;
      case 'booking': return bookingScaleAnim;
      default: return buyScaleAnim;
    }
  };

  // Render individual button with animation
  const renderButton = useCallback((config: typeof buttonConfigs[0]) => {
    const isCurrentlyLoading = buttonState.loadingStates[config.id];
    const hasError = buttonState.errorStates[config.id] !== null;
    const isAnyLoading = stateManager.hasAnyLoading();
    const shouldDisable = !config.isEnabled || isAnyLoading;
    const scaleAnim = getAnimRef(config.id);

    return (
      <Animated.View
        key={config.id}
        style={{
          transform: [{ scale: scaleAnim }],
          width: layout.buttonWidth,
        }}
      >
        <TouchableOpacity
          style={[
            styles.buttonContainer,
            shouldDisable && styles.buttonDisabled,
            buttonStyle,
          ]}
          onPress={() => handleButtonPress(config.id)}
          onPressIn={() => animateScale(scaleAnim, 0.96)}
          onPressOut={() => animateScale(scaleAnim, 1)}
          disabled={shouldDisable}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${config.title} button`}
          accessibilityState={{
            disabled: shouldDisable,
            busy: isCurrentlyLoading
          }}
          accessibilityHint={`${config.title} this item`}
        >
        <LinearGradient
          colors={shouldDisable ? ['#9CA3AF', '#6B7280'] as const : config.backgroundColor as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <View style={styles.buttonContent}>
            {/* Loading spinner or icon */}
            {isCurrentlyLoading ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
            ) : (
              <Ionicons
                name={(config.id === 'lock' && !config.isEnabled) ? 'lock-closed' : config.iconName as any}
                size={IconSize.md}
                color={Colors.text.white}
                style={styles.buttonIcon}
              />
            )}

            {/* Button text */}
            <ThemedText
              style={[
                styles.buttonText,
                { color: config.textColor },
                textStyle,
              ]}
              numberOfLines={1}
              ellipsizeMode="clip"
            >
              {isCurrentlyLoading ? 'Loading...' : config.title}
            </ThemedText>
          </View>
        </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [buttonState, stateManager, layout.buttonWidth, handleButtonPress, buttonStyle, textStyle, buyScaleAnim, lockScaleAnim, bookingScaleAnim, animateScale]);

  // Don't render if no buttons are visible
  if (buttonConfigs.length === 0) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor,
        paddingHorizontal: layout.containerPadding,
        gap: layout.buttonGap,
        flexDirection: layout.flexDirection,
      },
      containerStyle,
    ]}>
      {buttonConfigs.map(renderButton)}
    </View>
);
}

const styles = StyleSheet.create({
  // Modern Container
  container: {
    paddingVertical: Spacing.lg,
    paddingTop: Spacing['2xl'] - 8,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modern Button with Shadows
  buttonContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
    height: 56,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: 0,
    paddingHorizontal: Spacing.base,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonIcon: {
    marginRight: 2,
  },

  // Modern Typography
  buttonText: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
    lineHeight: 20,
    flexShrink: 0,
  },
});