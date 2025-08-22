// Profile System Types and Interfaces
// TypeScript definitions for the profile menu modal and related components

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  initials: string;
  phone?: string;
  joinDate: string;
  isVerified: boolean;
  wallet?: WalletData;
  preferences: UserPreferences;
}

export interface WalletData {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  pendingAmount: number;
}

export interface UserPreferences {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  display: DisplaySettings;
}

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  sms: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  reminders: boolean;
}

export interface PrivacySettings {
  profileVisible: boolean;
  showActivity: boolean;
  allowMessaging: boolean;
  dataSharing: boolean;
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  timezone: string;
}

// Profile Menu Modal Types
export interface ProfileMenuItem {
  id: string;
  title: string;
  icon: string; // Ionicons name
  route?: string;
  action?: () => void;
  badge?: string | number;
  isEnabled: boolean;
  showArrow: boolean;
  dividerAfter?: boolean;
}

export interface ProfileMenuSection {
  id: string;
  title?: string;
  items: ProfileMenuItem[];
}

export interface ProfileMenuModalProps {
  visible: boolean;
  onClose: () => void;
  user: User;
  menuSections: ProfileMenuSection[];
  onMenuItemPress: (item: ProfileMenuItem) => void;
}

// Profile Context Types
export interface ProfileContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Modal state
  isModalVisible: boolean;
  showModal: () => void;
  hideModal: () => void;
  
  // User actions
  updateUser: (userData: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  logout: () => Promise<void>;
  
  // Navigation
  navigateToScreen: (route: string, params?: any) => void;
}

// Profile Page Types
export interface ProfileIconGridItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  backgroundColor: string;
  route: string;
  count?: number;
}

export interface ProfileMenuListItem {
  id: string;
  title: string;
  icon: string;
  route: string;
  description?: string;
  badge?: string | number;
  isNew?: boolean;
  showArrow: boolean;
}

export interface ProfilePageProps {
  user: User;
  iconGridItems: ProfileIconGridItem[];
  menuItems: ProfileMenuListItem[];
  onItemPress: (item: ProfileIconGridItem | ProfileMenuListItem) => void;
}

// API Response Types
export interface ProfileApiResponse {
  success: boolean;
  data?: User;
  error?: string;
  message?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

// Component Props Types
export interface ProfileHeaderProps {
  user: User;
  onProfilePress: () => void;
  showNotifications?: boolean;
  showSettings?: boolean;
}

export interface MenuItemCardProps {
  item: ProfileMenuItem;
  onPress: (item: ProfileMenuItem) => void;
  style?: any;
}

// Constants
export const PROFILE_COLORS = {
  primary: '#8B5CF6', // Purple
  primaryLight: '#A78BFA',
  secondary: '#EC4899', // Pink
  background: '#FFFFFF',
  surface: '#F8FAFC',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const PROFILE_GRADIENTS = {
  primary: ['#8B5CF6', '#7C3AED'],
  secondary: ['#EC4899', '#DB2777'],
  card: ['transparent', 'rgba(0, 0, 0, 0.1)'],
} as const;

export const PROFILE_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const PROFILE_RADIUS = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  round: 50,
} as const;

// Animation Constants
export const MODAL_ANIMATIONS = {
  duration: 300,
  easing: 'ease-out',
  slideDistance: 100,
} as const;

// Error Types
export interface ProfileError {
  code: string;
  message: string;
  field?: string;
}

export type ProfileErrorType = 
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export interface ProfileValidationError extends ProfileError {
  field: string;
  type: ProfileErrorType;
}