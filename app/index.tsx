import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from '@/components/onboarding/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';

export default function AppEntry() {
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {

    // Wait for auth context to initialize and react to auth changes
    if (!state.isLoading) {
      // Check app state immediately to prevent navigation race conditions
      checkAppState();
    }
  }, [state.isLoading, state.isAuthenticated, state.user]); // Listen for all auth changes

  const checkAppState = async () => {
    try {

      setIsChecking(true);
      
      // Check authentication first
      if (state.isAuthenticated && state.user) {

        // User is authenticated, check onboarding status
        if (state.user.isOnboarded) {

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

  if (isChecking) {
    return (
      <View style={styles.container}>
        <LoadingScreen duration={1000} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});