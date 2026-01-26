import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from '@/components/onboarding/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';

export default function AppEntry() {
  const router = useRouter();
  const pathname = usePathname();

  // Safe auth context access with fallback
  let authState;
  try {
    const { state } = useAuth();
    authState = state;
  } catch (error) {
    // If AuthProvider is not ready yet, use default state
    authState = { isLoading: true, isAuthenticated: false, user: null };
  }

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // IMPORTANT: Only run redirect logic if we're actually on the root "/" path
    // On web, page refreshes on other routes should stay on those routes
    // This prevents redirect loops when refreshing on /(tabs)/ or other pages
    const isRootPath = pathname === '/' || pathname === '';

    if (!isRootPath) {
      // User is on a specific page, don't redirect - let them stay there
      setIsChecking(false);
      return;
    }

    // Wait for auth context to initialize and react to auth changes
    if (!authState.isLoading) {
      // Check app state immediately to prevent navigation race conditions
      checkAppState();
    }
  }, [authState.isLoading, authState.isAuthenticated, authState.user, pathname]); // Listen for all auth changes

  const checkAppState = async () => {
    try {

      setIsChecking(true);

      // Check authentication first
      if (authState.isAuthenticated && authState.user) {

        // User is authenticated, check onboarding status
        // Check both user.isOnboarded and the localStorage flag as fallback
        const onboardingCompletedFlag = await AsyncStorage.getItem('onboarding_completed');
        const isOnboarded = authState.user.isOnboarded || onboardingCompletedFlag === 'true';

        if (isOnboarded) {

          // User is fully onboarded, go to main app
          router.replace('/(tabs)/' as any);
        } else {

          // User is authenticated but not onboarded, continue onboarding
          // Check if we're already in an onboarding flow to prevent loops
          if (!pathname.includes('/onboarding/')) {
            router.replace('/onboarding/location-permission');
          }
        }
        setIsChecking(false);
        return;
      }

      // If we reach here, user is not authenticated
      // But let's double-check by looking at stored data to prevent false negatives
      const storedToken = await AsyncStorage.getItem('access_token');
      const storedUser = await AsyncStorage.getItem('auth_user');
      
      if (storedToken && storedUser) {

        // Wait a bit for auth state to be restored
        setTimeout(() => {
          checkAppState();
        }, 500);
        return;
      }

      // User is not authenticated, check onboarding status
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');

      // Small delay to show loading
      setTimeout(() => {
        if (onboardingCompleted === 'true') {

          // User has completed onboarding but not signed in, go to sign-in
          router.replace('/sign-in');
        } else {

          // User needs to go through onboarding
          router.replace('/onboarding/splash');
        }
        setIsChecking(false);
      }, 800);
    } catch (error) {
      console.error('Error checking app state:', error);
      // Default to onboarding on error
      router.replace('/onboarding/splash');
      setIsChecking(false);
    }
  };

  // Only show loading screen on root path - other pages handle their own loading
  const isRootPath = pathname === '/' || pathname === '';

  if (isChecking && isRootPath) {
    return (
      <View style={styles.container}>
        <LoadingScreen duration={1000} />
      </View>
    );
  }

  // Not on root path or done checking - render nothing (let the actual page render)
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});