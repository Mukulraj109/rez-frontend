import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from '@/components/onboarding/LoadingScreen';

export default function AppEntry() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
      
      // Small delay to show loading
      setTimeout(() => {
        if (onboardingCompleted === 'true') {
          // User has completed onboarding, go to main app
          router.replace('/(tabs)/' as any);
        } else {
          // User needs to go through onboarding
          router.replace('/onboarding/splash');
        }
        setIsChecking(false);
      }, 1000);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
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