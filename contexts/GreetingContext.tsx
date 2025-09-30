import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useLocation } from './LocationContext';
import { useAuth } from './AuthContext';
import {
  getCurrentGreeting,
  getGreetingForTime,
  getSmartGreeting,
} from '@/utils/greetingUtils';
import {
  GreetingState,
  GreetingContextType,
  GreetingConfig,
  GreetingData,
} from '@/types/greeting.types';

// Action types
type GreetingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GREETING'; payload: GreetingData }
  | { type: 'SET_LAST_UPDATED'; payload: Date }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: GreetingState = {
  currentGreeting: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Reducer
function greetingReducer(state: GreetingState, action: GreetingAction): GreetingState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_GREETING':
      return { 
        ...state, 
        currentGreeting: action.payload, 
        isLoading: false,
        lastUpdated: new Date()
      };
    
    case 'SET_LAST_UPDATED':
      return { ...state, lastUpdated: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Create context
const GreetingContext = createContext<GreetingContextType | undefined>(undefined);

// Provider component
interface GreetingProviderProps {
  children: ReactNode;
}

export function GreetingProvider({ children }: GreetingProviderProps) {
  const [state, dispatch] = useReducer(greetingReducer, initialState);
  const { state: locationState } = useLocation();
  const { state: authState } = useAuth();

  // Initialize greeting
  useEffect(() => {
    updateGreeting();
  }, []);

  // Update greeting when location or user changes
  useEffect(() => {
    if (locationState.currentLocation || authState.user) {
      updateGreeting();
    }
  }, [locationState.currentLocation, authState.user]);

  // Update greeting every hour
  useEffect(() => {
    const interval = setInterval(() => {
      updateGreeting();
    }, 60 * 60 * 1000); // Update every hour

    return () => clearInterval(interval);
  }, []);

  const updateGreeting = async (config?: GreetingConfig): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Build greeting configuration
      const greetingConfig: GreetingConfig = {
        userName: authState.user?.profile?.firstName || undefined,
        timezone: locationState.currentLocation?.timezone || 'Asia/Kolkata',
        language: 'en', // You can get this from user preferences
        includeEmoji: true,
        personalized: true,
        ...config,
      };

      // Get current greeting
      const greeting = getSmartGreeting(new Date(), greetingConfig);
      
      dispatch({ type: 'SET_GREETING', payload: greeting });
    } catch (error) {
      console.error('Update greeting error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update greeting' });
    }
  };

  const getGreetingForTime = (date: Date, config?: GreetingConfig): GreetingData => {
    const greetingConfig: GreetingConfig = {
      userName: authState.user?.profile?.firstName || undefined,
      timezone: locationState.currentLocation?.timezone || 'Asia/Kolkata',
      language: 'en',
      includeEmoji: true,
      personalized: true,
      ...config,
    };

    return getGreetingForTime(date, greetingConfig);
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: GreetingContextType = {
    state,
    updateGreeting,
    getGreetingForTime,
    clearError,
  };

  return (
    <GreetingContext.Provider value={contextValue}>
      {children}
    </GreetingContext.Provider>
  );
}

// Custom hook to use greeting context
export function useGreeting(): GreetingContextType {
  const context = useContext(GreetingContext);
  if (context === undefined) {
    throw new Error('useGreeting must be used within a GreetingProvider');
  }
  return context;
}

// Custom hook for greeting display
export function useGreetingDisplay() {
  const { state } = useGreeting();
  
  return {
    greeting: state.currentGreeting,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,
  };
}

// Custom hook for time-based greeting
export function useTimeBasedGreeting() {
  const { getGreetingForTime } = useGreeting();
  
  const getGreetingForCurrentTime = (config?: GreetingConfig) => {
    return getGreetingForTime(new Date(), config);
  };

  const getGreetingForSpecificTime = (date: Date, config?: GreetingConfig) => {
    return getGreetingForTime(date, config);
  };

  return {
    getGreetingForCurrentTime,
    getGreetingForSpecificTime,
  };
}
