import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import LoadingScreen from '@/components/onboarding/LoadingScreen';
import { navigationDebugger } from '@/utils/navigationDebug';

export default function OnboardingLoadingScreen() {
  const router = useRouter();

  const handleLoadingComplete = () => {
    navigationDebugger.logNavigation('loading', 'category-selection', 'loading-completed');
    router.push('/onboarding/category-selection' as any);
  };

  return (
    <LoadingScreen 
      duration={5000} 
      onComplete={handleLoadingComplete} 
    />
  );
}