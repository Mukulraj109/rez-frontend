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
    // Wait for auth context to initialize
    if (!state.isLoading) {
      checkAppState();
    }
  }, [state.isLoading]);

  const checkAppState = async () => {
    try {
      setIsChecking(true);
      
      // Check authentication first
      if (state.isAuthenticated) {
        // User is already signed in, go to main app
        router.replace('/(tabs)/' as any);
        setIsChecking(false);
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