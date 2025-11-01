/**
 * Push Notifications Hook
 * Initializes and manages push notifications
 */

import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useRouter } from 'expo-router';
import pushNotificationService from '@/services/pushNotificationService';
import { handleNotificationDeepLink } from '@/utils/notificationDeepLinkHandler';
import { useAuth } from '@/contexts/AuthContext';

export function usePushNotifications() {
  const router = useRouter();
  const { state } = useAuth();
  const { user, isAuthenticated } = state;
  const appState = useRef(AppState.currentState);
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user || initialized.current) {
      return;
    }

    // Initialize push notifications
    initializePushNotifications();

    // Setup app state listener
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        // You can refresh notification badge here if needed
      }
      appState.current = nextAppState;
    });

    initialized.current = true;

    return () => {
      subscription.remove();
      pushNotificationService.cleanup();
    };
  }, [isAuthenticated, user]);

  const initializePushNotifications = async () => {
    try {
      // Set navigation handler for deep linking
      pushNotificationService.setNavigationHandler((data) => {
        handleNotificationDeepLink(data);
      });

      // Initialize with user ID
      const token = await pushNotificationService.initialize(user?.id);

      if (!token) {
        console.warn('Failed to initialize push notifications');
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };

  // Update token when user changes
  useEffect(() => {
    if (isAuthenticated && user && initialized.current) {
      pushNotificationService.updateToken(user.id);
    }
  }, [user, isAuthenticated]);

  // Cleanup on logout
  useEffect(() => {
    if (!isAuthenticated && initialized.current) {
      pushNotificationService.unregisterToken();
      initialized.current = false;
    }
  }, [isAuthenticated]);

  return {
    initialized: initialized.current,
  };
}

export default usePushNotifications;
