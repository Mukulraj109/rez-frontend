import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import LoadingScreen from '@/components/onboarding/LoadingScreen';

export default function OnboardingLoadingScreen() {
  const router = useRouter();

  const handleLoadingComplete = () => {
    router.push('/onboarding/category-selection');
  };

  return (
    <LoadingScreen 
      duration={5000} 
      onComplete={handleLoadingComplete} 
    />
  );
}