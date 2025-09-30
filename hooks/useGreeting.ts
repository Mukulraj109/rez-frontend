import { useState, useEffect, useCallback } from 'react';
import { useGreeting as useGreetingContext } from '@/contexts/GreetingContext';
import { useLocation } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  getCurrentGreeting,
  getGreetingForTime,
  getSmartGreeting,
  formatTimeForDisplay,
} from '@/utils/greetingUtils';
import {
  GreetingData,
  GreetingConfig,
  TimeOfDay,
} from '@/types/greeting.types';

/**
 * Hook for greeting display
 */
export function useGreetingDisplay() {
  const { state } = useGreetingContext();
  
  return {
    greeting: state.currentGreeting,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,
  };
}

/**
 * Hook for time-based greeting
 */
export function useTimeBasedGreeting() {
  const { getGreetingForTime } = useGreetingContext();
  const { state: locationState } = useLocation();
  const { state: authState } = useAuth();
  
  const getGreetingForCurrentTime = useCallback((config?: GreetingConfig) => {
    const greetingConfig: GreetingConfig = {
      userName: authState.user?.profile?.firstName || undefined,
      timezone: locationState.currentLocation?.timezone || 'Asia/Kolkata',
      language: 'en',
      includeEmoji: true,
      personalized: true,
      ...config,
    };

    return getGreetingForTime(new Date(), greetingConfig);
  }, [getGreetingForTime, authState.user, locationState.currentLocation]);

  const getGreetingForSpecificTime = useCallback((date: Date, config?: GreetingConfig) => {
    const greetingConfig: GreetingConfig = {
      userName: authState.user?.profile?.firstName || undefined,
      timezone: locationState.currentLocation?.timezone || 'Asia/Kolkata',
      language: 'en',
      includeEmoji: true,
      personalized: true,
      ...config,
    };

    return getGreetingForTime(date, greetingConfig);
  }, [getGreetingForTime, authState.user, locationState.currentLocation]);

  return {
    getGreetingForCurrentTime,
    getGreetingForSpecificTime,
  };
}

/**
 * Hook for greeting with location context
 */
export function useLocationBasedGreeting() {
  const { state: greetingState } = useGreetingContext();
  const { state: locationState } = useLocation();
  const { state: authState } = useAuth();
  
  const getGreetingWithLocation = useCallback((config?: GreetingConfig) => {
    const greetingConfig: GreetingConfig = {
      userName: authState.user?.profile?.firstName || undefined,
      timezone: locationState.currentLocation?.timezone || 'Asia/Kolkata',
      language: 'en',
      includeEmoji: true,
      personalized: true,
      location: locationState.currentLocation?.address.city || undefined,
      ...config,
    };

    return getSmartGreeting(new Date(), greetingConfig);
  }, [authState.user, locationState.currentLocation]);

  const getGreetingForTimeWithLocation = useCallback((date: Date, config?: GreetingConfig) => {
    const greetingConfig: GreetingConfig = {
      userName: authState.user?.profile?.firstName || undefined,
      timezone: locationState.currentLocation?.timezone || 'Asia/Kolkata',
      language: 'en',
      includeEmoji: true,
      personalized: true,
      location: locationState.currentLocation?.address.city || undefined,
      ...config,
    };

    return getSmartGreeting(date, greetingConfig);
  }, [authState.user, locationState.currentLocation]);

  return {
    currentGreeting: greetingState.currentGreeting,
    getGreetingWithLocation,
    getGreetingForTimeWithLocation,
  };
}

/**
 * Hook for greeting customization
 */
export function useGreetingCustomization() {
  const { updateGreeting } = useGreetingContext();
  const { state: locationState } = useLocation();
  const { state: authState } = useAuth();
  
  const [customConfig, setCustomConfig] = useState<GreetingConfig>({
    language: 'en',
    includeEmoji: true,
    personalized: true,
  });

  const updateCustomGreeting = useCallback(async (config: Partial<GreetingConfig>) => {
    const newConfig = { ...customConfig, ...config };
    setCustomConfig(newConfig);
    
    const greetingConfig: GreetingConfig = {
      userName: authState.user?.profile?.firstName || undefined,
      timezone: locationState.currentLocation?.timezone || 'Asia/Kolkata',
      ...newConfig,
    };

    await updateGreeting(greetingConfig);
  }, [customConfig, updateGreeting, authState.user, locationState.currentLocation]);

  const setLanguage = useCallback((language: 'en' | 'hi' | 'te' | 'ta' | 'bn') => {
    updateCustomGreeting({ language });
  }, [updateCustomGreeting]);

  const setEmojiEnabled = useCallback((enabled: boolean) => {
    updateCustomGreeting({ includeEmoji: enabled });
  }, [updateCustomGreeting]);

  const setPersonalized = useCallback((personalized: boolean) => {
    updateCustomGreeting({ personalized });
  }, [updateCustomGreeting]);

  return {
    customConfig,
    updateCustomGreeting,
    setLanguage,
    setEmojiEnabled,
    setPersonalized,
  };
}

/**
 * Hook for greeting time display
 */
export function useGreetingTime() {
  const { state: greetingState } = useGreetingContext();
  const { state: locationState } = useLocation();
  
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getFormattedTime = useCallback((date?: Date) => {
    const timeToFormat = date || currentTime;
    const timezone = locationState.currentLocation?.timezone || 'Asia/Kolkata';
    return formatTimeForDisplay(timeToFormat, timezone);
  }, [currentTime, locationState.currentLocation]);

  const getTimeOfDay = useCallback((date?: Date): TimeOfDay => {
    const timeToCheck = date || currentTime;
    const hour = timeToCheck.getHours();
    
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }, [currentTime]);

  const isGreetingTime = useCallback((timeOfDay: TimeOfDay, date?: Date) => {
    const currentTimeOfDay = getTimeOfDay(date);
    return currentTimeOfDay === timeOfDay;
  }, [getTimeOfDay]);

  return {
    currentTime,
    formattedTime: getFormattedTime(),
    timeOfDay: getTimeOfDay(),
    getFormattedTime,
    getTimeOfDay,
    isGreetingTime,
  };
}

/**
 * Hook for greeting animations
 */
export function useGreetingAnimation() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const triggerAnimation = useCallback(() => {
    setIsAnimating(true);
    setAnimationKey(prev => prev + 1);
    
    // Reset animation after duration
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  }, []);

  const resetAnimation = useCallback(() => {
    setIsAnimating(false);
    setAnimationKey(0);
  }, []);

  return {
    isAnimating,
    animationKey,
    triggerAnimation,
    resetAnimation,
  };
}

/**
 * Hook for greeting preferences
 */
export function useGreetingPreferences() {
  const [preferences, setPreferences] = useState({
    showEmoji: true,
    showTime: true,
    showLocation: true,
    animationType: 'fade' as 'fade' | 'slide' | 'bounce' | 'none',
    maxLength: 50,
  });

  const updatePreference = useCallback((key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences({
      showEmoji: true,
      showTime: true,
      showLocation: true,
      animationType: 'fade',
      maxLength: 50,
    });
  }, []);

  return {
    preferences,
    updatePreference,
    resetPreferences,
  };
}
