// ProfileContext - State management for profile system
// Manages user data, modal visibility, and profile-related actions

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { router } from 'expo-router';
import { 
  ProfileContextType, 
  User, 
  ProfileMenuItem,
  UserPreferences
} from '@/types/profile.types';
import { useAuth } from '@/contexts/AuthContext';
import authService, { User as BackendUser, ProfileUpdate } from '@/services/authApi';

interface ProfileProviderProps {
  children: ReactNode;
}

// Helper function to map backend user data to profile user format
const mapBackendUserToProfileUser = (backendUser: BackendUser): User => {
  // Get initials from email first character or name if available
  const getInitials = (): string => {
    if (backendUser.profile?.firstName && backendUser.profile?.lastName) {
      return (backendUser.profile.firstName.charAt(0) + backendUser.profile.lastName.charAt(0)).toUpperCase();
    }
    if (backendUser.email) {
      return backendUser.email.charAt(0).toUpperCase();
    }
    return 'G'; // Guest
  };

  // Get display name - use "Guest" until user updates profile
  const getDisplayName = (): string => {
    if (backendUser.profile?.firstName && backendUser.profile?.lastName) {
      return `${backendUser.profile.firstName} ${backendUser.profile.lastName}`;
    }
    return 'Guest';
  };

  return {
    id: backendUser.id,
    name: getDisplayName(),
    email: backendUser.email || '',
    avatar: backendUser.profile?.avatar,
    bio: backendUser.profile?.bio,
    initials: getInitials(),
    phone: backendUser.phoneNumber,
    joinDate: backendUser.createdAt,
    isVerified: backendUser.isVerified,
    // Map wallet data from backend
    wallet: {
      balance: typeof backendUser.wallet?.balance === 'object'
        ? (backendUser.wallet.balance as any).available || (backendUser.wallet.balance as any).total || 0
        : backendUser.wallet?.balance || 0,
      totalEarned: backendUser.wallet?.totalEarned || 0,
      totalSpent: backendUser.wallet?.totalSpent || 0,
      pendingAmount: typeof backendUser.wallet?.pendingAmount === 'object'
        ? (backendUser.wallet.pendingAmount as any).pending || 0
        : backendUser.wallet?.pendingAmount || 0,
    },
    preferences: {
      notifications: {
        push: backendUser.preferences?.pushNotifications ?? true,
        email: backendUser.preferences?.emailNotifications ?? true,
        sms: backendUser.preferences?.smsNotifications ?? false,
        orderUpdates: true,
        promotions: false,
        reminders: true,
      },
      privacy: {
        profileVisible: true,
        showActivity: false,
        allowMessaging: true,
        dataSharing: false,
      },
      display: {
        theme: backendUser.preferences?.theme === 'dark' ? 'dark' : backendUser.preferences?.theme === 'light' ? 'light' : 'auto',
        language: backendUser.preferences?.language || 'en',
        currency: 'USD',
        timezone: 'America/New_York',
      },
    },
  };
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider = ({ children }: ProfileProviderProps) => {
  // Get auth context
  const { state: authState, actions: authActions } = useAuth();
  
  // State
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Convert backend user to profile user format
  const user = useMemo(() => {
    if (authState.user) {
      return mapBackendUserToProfileUser(authState.user);
    }
    return null;
  }, [authState.user]);

  // User data functions - delegate to AuthContext
  const updateUser = async (userData: Partial<User>) => {
    if (!authState.user) return;

    try {
      setError(null);

      // Map profile user data to ProfileUpdate format for API call
      const profileUpdateData: ProfileUpdate = {
        profile: {
          firstName: userData.name?.split(' ')[0] || undefined,
          lastName: userData.name?.split(' ').slice(1).join(' ') || undefined,
          avatar: userData.avatar,
          bio: userData.bio,
        },
        preferences: {
          theme: userData.preferences?.display?.theme === 'auto' ? undefined : userData.preferences?.display?.theme as 'light' | 'dark',
          language: userData.preferences?.display?.language,
          emailNotifications: userData.preferences?.notifications?.email,
          pushNotifications: userData.preferences?.notifications?.push,
          smsNotifications: userData.preferences?.notifications?.sms,
        },
      };

      // Call the correct authService method directly instead of going through AuthContext
      const response = await authService.updateProfile(profileUpdateData);
      
      // Update user state manually since we're bypassing AuthContext
      if (response.data) {
        await authActions.checkAuthStatus(); // Refresh the auth state
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user profile');
      console.error('Error updating user profile:', err);
      throw err;
    }
  };

  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      await updateUser({
        preferences: {
          ...user.preferences,
          ...preferences,
        },
      });
    } catch (err) {
      console.error('Error updating user preferences:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);

      // Clear modal visibility
      setIsModalVisible(false);

      // Use AuthContext logout which handles tokens, API calls, etc.
      await authActions.logout();
      
      // Navigate to sign-in after logout
      router.replace('/sign-in');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
      console.error('Error during logout:', err);
      throw err;
    }
  };

  // Modal functions - memoized for performance
  const showModal = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  // Navigation function - memoized for performance
  const navigateToScreen = useCallback((route: string, params?: any) => {
    try {
      if (params) {
        router.push({
          pathname: route as any,
          params,
        });
      } else {
        router.push(route as any);
      }
    } catch (err) {
      console.error('Navigation error:', err);
      // Fallback navigation
      router.push('/');
    }
  }, []);

  // Menu item handler - memoized for performance
  const handleMenuItemPress = useCallback((item: ProfileMenuItem) => {
    console.log('Menu item pressed:', item.title);

    // Close the modal first
    hideModal();

    // Handle different menu actions
    switch (item.id) {
      case 'wallet':
        navigateToScreen('/WalletScreen'); // Use existing WalletScreen
        break;
      case 'order_trx':
        navigateToScreen('/transactions'); // Navigate to dedicated transactions page
        break;
      case 'account':
        navigateToScreen('/account/');
        break;
      case 'profile':
        navigateToScreen('/profile/');
        break;
      default:
        if (item.route) {
          navigateToScreen(item.route);
        } else if (item.action) {
          item.action();
        }
        break;
    }
  }, [navigateToScreen, hideModal]);

  // Context value - memoized to prevent unnecessary re-renders
  const contextValue: ProfileContextType = useMemo(() => ({
    user,
    isLoading: authState.isLoading,
    error,
    
    // Modal state
    isModalVisible,
    showModal,
    hideModal,
    
    // User actions
    updateUser,
    updatePreferences,
    logout,
    
    // Navigation
    navigateToScreen,
  }), [user, authState.isLoading, error, isModalVisible, showModal, hideModal, updateUser, updatePreferences, logout, navigateToScreen]);

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};

// Custom hook to use profile context
export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  
  return context;
};

// Custom hook specifically for the profile modal
export const useProfileModal = () => {
  const { isModalVisible, showModal, hideModal } = useProfile();
  
  return {
    isModalVisible,
    showModal,
    hideModal,
  };
};

// Custom hook for menu item handling
export const useProfileMenu = () => {
  const context = useProfile();
  
  const handleMenuItemPress = (item: ProfileMenuItem) => {
    console.log('Menu item pressed:', item.title);

    // Close the modal first
    context.hideModal();

    // Handle different menu actions
    switch (item.id) {
      case 'wallet':
        context.navigateToScreen('/WalletScreen'); // Use existing WalletScreen
        break;
      case 'order_trx':
        context.navigateToScreen('/transactions'); // Navigate to dedicated transactions page
        break;
      case 'account':
        context.navigateToScreen('/account/');
        break;
      case 'profile':
        context.navigateToScreen('/profile/');
        break;
      default:
        if (item.route) {
          context.navigateToScreen(item.route);
        } else if (item.action) {
          item.action();
        }
        break;
    }
  };

  return {
    handleMenuItemPress,
  };
};

export default ProfileContext;