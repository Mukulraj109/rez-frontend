// StoreActionButtons.tsx - Component with Buy, Lock, Booking buttons
import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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

  // Enhanced button press handler
  const handleButtonPress = useCallback((buttonId: 'buy' | 'lock' | 'booking') => {
    const config = buttonConfigs.find(c => c.id === buttonId);
    if (!config) return;

    // Create enhanced handler with state management
    const enhancedHandler = createButtonHandler(
      buttonId,
      async () => {
        try {
          await config.onPress();
          // Show success feedback
          Alert.alert(
            'Success',
            `${config.title} action completed successfully!`,
            [{ text: 'OK' }]
          );
        } catch (error) {
          // Error will be handled by createButtonHandler
          throw error;
        }
      },
      stateManager
    );
    enhancedHandler();
  }, [buttonConfigs, stateManager]);

  // Render individual button
  const renderButton = useCallback((config: typeof buttonConfigs[0]) => {
    const isCurrentlyLoading = buttonState.loadingStates[config.id];
    const hasError = buttonState.errorStates[config.id] !== null;
    const isAnyLoading = stateManager.hasAnyLoading();
    const shouldDisable = !config.isEnabled || isAnyLoading;

    return (
      <TouchableOpacity
        key={config.id}
        style={[
          styles.buttonContainer,
          { width: layout.buttonWidth },
          shouldDisable && styles.buttonDisabled,
          buttonStyle,
        ]}
        onPress={() => handleButtonPress(config.id)}
        disabled={shouldDisable}
        activeOpacity={0.8}
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
                size={20}
                color="#FFFFFF"
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
    );
  }, [buttonState, stateManager, layout.buttonWidth, handleButtonPress, buttonStyle, textStyle]);

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
  container: {
    paddingVertical: 20,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    height: 56,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: 0,
    paddingHorizontal: 16,
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
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
    lineHeight: 20,
    flexShrink: 0,
  },
});