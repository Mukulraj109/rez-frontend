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
import { 
  mockUser, 
  fetchUserProfile, 
  updateUserProfile 
} from '@/data/profileData';

interface ProfileProviderProps {
  children: ReactNode;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider = ({ children }: ProfileProviderProps) => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Load user data on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  // User data functions
  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In development, use mock data
      // In production, this would fetch from your API
      const userData = await fetchUserProfile('user_123');
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
      console.error('Error loading user profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const updatedUser = await updateUserProfile(user.id, userData);
      setUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user profile');
      console.error('Error updating user profile:', err);
      throw err;
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);
      setError(null);

      // Clear user data
      setUser(null);
      setIsModalVisible(false);

      // In real app, clear stored tokens, call logout API, etc.
      // For now, just navigate to onboarding
      router.replace('/onboarding/splash');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
      console.error('Error during logout:', err);
      throw err;
    } finally {
      setIsLoading(false);
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

    // Handle different menu actions
    switch (item.id) {
      case 'wallet':
        navigateToScreen('/WalletScreen'); // Use existing WalletScreen
        break;
      case 'order_trx':
        navigateToScreen('/WalletScreen'); // Wallet contains transaction history
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
  }, [navigateToScreen]);

  // Context value - memoized to prevent unnecessary re-renders
  const contextValue: ProfileContextType = useMemo(() => ({
    user,
    isLoading,
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
  }), [user, isLoading, error, isModalVisible, showModal, hideModal, updateUser, updatePreferences, logout, navigateToScreen]);

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

    // Handle different menu actions
    switch (item.id) {
      case 'wallet':
        context.navigateToScreen('/WalletScreen'); // Use existing WalletScreen
        break;
      case 'order_trx':
        context.navigateToScreen('/WalletScreen'); // Wallet contains transaction history
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