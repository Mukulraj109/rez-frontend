// TypeScript interfaces for StoreActionButtons component

export type StoreType = 'PRODUCT' | 'SERVICE';

export type ButtonState = 'enabled' | 'disabled' | 'loading';

export interface StoreActionButtonsProps {
  // Core configuration
  storeType: StoreType;
  
  // Button handlers
  onBuyPress?: () => void | Promise<void>;
  onLockPress?: () => void | Promise<void>;
  onBookingPress?: () => void | Promise<void>;
  
  // Button states
  buyButtonState?: ButtonState;
  lockButtonState?: ButtonState;
  bookingButtonState?: ButtonState;
  
  // Loading states for individual buttons
  isBuyLoading?: boolean;
  isLockLoading?: boolean;
  isBookingLoading?: boolean;
  
  // Disabled states for individual buttons
  isBuyDisabled?: boolean;
  isLockDisabled?: boolean;
  isBookingDisabled?: boolean;
  
  // Customization
  showBookingButton?: boolean; // Override for conditional rendering
  customBuyText?: string;
  customLockText?: string;
  customBookingText?: string;
  
  // Styling
  containerStyle?: any; // ViewStyle
  buttonStyle?: any; // ViewStyle
  textStyle?: any; // TextStyle
}

export interface ActionButtonConfig {
  id: 'buy' | 'lock' | 'booking';
  title: string;
  iconName: string; // Ionicons name
  onPress: () => void | Promise<void>;
  isVisible: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  backgroundColor: readonly [string, string, ...string[]];
  textColor: string;
}

// Mock data interfaces
export interface MockStoreData {
  id: string;
  name: string;
  type: StoreType;
  category: string;
  isOpen: boolean;
  location: string;
}

export interface MockProductData {
  id: string;
  title: string;
  price: string;
  isAvailable: boolean;
  canBeLocked: boolean;
  hasBookingOption: boolean;
}

// Button interaction results
export interface ButtonActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

// Component state interface
export interface StoreActionButtonsState {
  activeButton: 'buy' | 'lock' | 'booking' | null;
  loadingStates: {
    buy: boolean;
    lock: boolean;
    booking: boolean;
  };
  errorStates: {
    buy: string | null;
    lock: string | null;
    booking: string | null;
  };
}