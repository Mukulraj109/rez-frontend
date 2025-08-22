import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from '@/components/onboarding/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';

export default function AppEntry() {
  const router = useRouter();
  const { state } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log('📱 [APP ENTRY] Auth state changed:', { 
      isLoading: state.isLoading, 
      isAuthenticated: state.isAuthenticated, 
      hasUser: !!state.user,
      isOnboarded: state.user?.isOnboarded
    });
    
    // Wait for auth context to initialize and react to auth changes
    if (!state.isLoading) {
      // Check app state immediately to prevent navigation race conditions
      checkAppState();
    }
  }, [state.isLoading, state.isAuthenticated, state.user]); // Listen for all auth changes

  const checkAppState = async () => {
    try {
      console.log('📱 [APP ENTRY] Checking app state...', {
        isAuthenticated: state.isAuthenticated,
        hasUser: !!state.user,
        isOnboarded: state.user?.isOnboarded
      });
      
      setIsChecking(true);
      
      // Check authentication first
      if (state.isAuthenticated && state.user) {
        console.log('📱 [APP ENTRY] User is authenticated');
        // User is authenticated, check onboarding status
        if (state.user.isOnboarded) {
          console.log('📱 [APP ENTRY] User is onboarded, going to main app');
          // User is fully onboarded, go to main app
          router.replace('/(tabs)/' as any);
        } else {
          console.log('📱 [APP ENTRY] User is not onboarded, continuing onboarding');
          // User is authenticated but not onboarded, continue onboarding
          // Check if we're already in an onboarding flow to prevent loops
          const currentPath = router.pathname || '';
          if (!currentPath.includes('/onboarding/')) {
            router.replace('/onboarding/location-permission');
          }
        }
        setIsChecking(false);
        return;
      }

      console.log('📱 [APP ENTRY] User is not authenticated');
      // User is not authenticated, check onboarding status
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
      console.log('📱 [APP ENTRY] Onboarding completed:', onboardingCompleted);
      
      // Small delay to show loading
      setTimeout(() => {
        if (onboardingCompleted === 'true') {
          console.log('📱 [APP ENTRY] Going to sign-in page');
          // User has completed onboarding but not signed in, go to sign-in
          router.replace('/sign-in');
        } else {
          console.log('📱 [APP ENTRY] Going to onboarding splash');
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