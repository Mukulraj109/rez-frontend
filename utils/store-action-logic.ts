// Conditional rendering logic for StoreActionButtons

import { StoreType, ActionButtonConfig, StoreActionButtonsProps } from '@/types/store-actions';

/**
 * Determines which buttons should be visible based on store type
 */
export function getVisibleButtons(storeType: StoreType, showBookingButton?: boolean): {
  showBuy: boolean;
  showLock: boolean;
  showBooking: boolean;
} {
  const baseButtons = {
    showBuy: true,
    showLock: true,
    showBooking: false,
  };

  switch (storeType) {
    case 'PRODUCT':
      return {
        showBuy: true,
        showLock: true,
        showBooking: showBookingButton || false, // Override available but defaults to false
      };
    
    case 'SERVICE':
      return {
        showBuy: false, // Hide Buy button for services
        showLock: true,
        showBooking: true, // Show Booking instead of Buy
      };
    
    default:
      return baseButtons;
  }
}

/**
 * Creates button configuration array based on props and store type
 */
export function createButtonConfigs(props: StoreActionButtonsProps): ActionButtonConfig[] {
  const visibility = getVisibleButtons(props.storeType, props.showBookingButton);
  
  const configs: ActionButtonConfig[] = [];

  // Buy Button
  if (visibility.showBuy) {
    configs.push({
      id: 'buy',
      title: props.customBuyText || 'Buy',
      iconName: 'card-outline',
      onPress: props.onBuyPress || (() => console.log('Buy pressed')),
      isVisible: true,
      isEnabled: !props.isBuyDisabled && props.buyButtonState !== 'disabled',
      isLoading: props.isBuyLoading || props.buyButtonState === 'loading',
      backgroundColor: ['#10B981', '#059669'] as const, // Green gradient for buy
      textColor: '#FFFFFF',
    });
  }

  // Lock Button
  if (visibility.showLock) {
    configs.push({
      id: 'lock',
      title: props.customLockText || 'Lock',
      iconName: 'lock-closed-outline',
      onPress: props.onLockPress || (() => console.log('Lock pressed')),
      isVisible: true,
      isEnabled: !props.isLockDisabled && props.lockButtonState !== 'disabled',
      isLoading: props.isLockLoading || props.lockButtonState === 'loading',
      backgroundColor: ['#F59E0B', '#D97706'] as const, // Amber gradient for lock
      textColor: '#FFFFFF',
    });
  }

  // Booking Button (conditional)
  if (visibility.showBooking) {
    configs.push({
      id: 'booking',
      title: props.customBookingText || 'Booking',
      iconName: 'calendar-outline',
      onPress: props.onBookingPress || (() => console.log('Booking pressed')),
      isVisible: true,
      isEnabled: !props.isBookingDisabled && props.bookingButtonState !== 'disabled',
      isLoading: props.isBookingLoading || props.bookingButtonState === 'loading',
      backgroundColor: ['#8B5CF6', '#7C3AED'] as const, // Purple gradient for booking (matches theme)
      textColor: '#FFFFFF',
    });
  }

  return configs;
}

/**
 * Determines button layout based on number of visible buttons and screen width
 */
export function getButtonLayout(buttonCount: number, screenWidth?: number): {
  flexDirection: 'row' | 'column';
  buttonWidth: string;
  containerPadding: number;
  buttonGap: number;
} {
  const isSmallScreen = screenWidth ? screenWidth < 360 : false;
  const isVerySmallScreen = screenWidth ? screenWidth < 320 : false;
  
  switch (buttonCount) {
    case 1:
      return {
        flexDirection: 'row',
        buttonWidth: '100%',
        containerPadding: 16,
        buttonGap: 0,
      };
    
    case 2:
      if (isVerySmallScreen) {
        return {
          flexDirection: 'column',
          buttonWidth: '100%',
          containerPadding: 12,
          buttonGap: 8,
        };
      }
      return {
        flexDirection: 'row',
        buttonWidth: isSmallScreen ? '49%' : '48%',
        containerPadding: isSmallScreen ? 12 : 16,
        buttonGap: isSmallScreen ? 8 : 12,
      };
    
    case 3:
      if (isVerySmallScreen) {
        return {
          flexDirection: 'column',
          buttonWidth: '100%',
          containerPadding: 12,
          buttonGap: 8,
        };
      }
      if (isSmallScreen) {
        return {
          flexDirection: 'column',
          buttonWidth: '100%',
          containerPadding: 12,
          buttonGap: 6,
        };
      }
      return {
        flexDirection: 'row',
        buttonWidth: '32%',
        containerPadding: 12,
        buttonGap: 8,
      };
    
    default:
      return {
        flexDirection: 'row',
        buttonWidth: '32%',
        containerPadding: 16,
        buttonGap: 12,
      };
  }
}

/**
 * Validates button configuration
 */
export function validateButtonConfig(config: ActionButtonConfig): boolean {
  return !!(
    config.id &&
    config.title &&
    config.iconName &&
    typeof config.onPress === 'function' &&
    config.backgroundColor?.length > 0
  );
}

/**
 * Gets appropriate disabled styling based on button state
 */
export function getDisabledStyling(isEnabled: boolean, isLoading: boolean) {
  if (!isEnabled && !isLoading) {
    return {
      opacity: 0.5,
      backgroundColor: ['#9CA3AF', '#6B7280'] as const, // Gray gradient for disabled
    };
  }
  
  if (isLoading) {
    return {
      opacity: 0.8,
    };
  }
  
  return {};
}