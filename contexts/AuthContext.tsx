import React, { createContext, useContext, useReducer, useEffect, ReactNode, useRef, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import authService, { User, AuthResponse, UnifiedUser } from '@/services/authApi';
import apiClient from '@/services/apiClient';
import * as authStorage from '@/utils/authStorage';
import {
  User as UnifiedUserType,
  toUser,
  validateUser,
  isUserVerified
} from '@/types/unified';

// Use types from unified type system
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  token: string | null;
}

type AuthAction =
  | { type: 'AUTH_LOADING'; payload: boolean }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' };

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'auth_user',
};

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  token: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    
    case 'AUTH_SUCCESS':

      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
}

// Context
interface AuthContextType {
  state: AuthState;
  actions: {
    sendOTP: (phoneNumber: string, email?: string, referralCode?: string) => Promise<void>;
    login: (phoneNumber: string, otp: string) => Promise<void>;
    register: (phoneNumber: string, email: string, referralCode?: string) => Promise<void>;
    verifyOTP: (phoneNumber: string, otp: string) => Promise<void>;
    logout: () => Promise<void>;
    forceLogout: () => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
    completeOnboarding: (data: Partial<User>) => Promise<void>;
    clearError: () => void;
    checkAuthStatus: () => Promise<void>;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [hasExplicitlyLoggedOut, setHasExplicitlyLoggedOut] = React.useState(false);
  const [lastNavigationTime, setLastNavigationTime] = React.useState(0);
  const [shouldRedirectToSignIn, setShouldRedirectToSignIn] = React.useState(false);
  const router = useRouter();
  const segments = useSegments();

  // Refs to prevent race conditions
  const isRefreshingToken = useRef(false);
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);
  const pendingRefreshCallbacks = useRef<Array<(success: boolean) => void>>([]);

  // Set up API client callbacks
  useEffect(() => {
    // Set refresh token callback
    apiClient.setRefreshTokenCallback(async () => {
      try {
        await tryRefreshToken();
        return true;
      } catch (error) {
        console.error('❌ [AUTH PROVIDER] Refresh callback failed:', error);
        return false;
      }
    });

    // Set logout callback - called when token expires
    apiClient.setLogoutCallback(async () => {
      console.log('🔐 [AUTH PROVIDER] Token expired, logging out');
      
      try {
        // Clear all stored auth data (AsyncStorage + localStorage)
        await authStorage.clearAuthData();

        // Clear API client tokens
        apiClient.setAuthToken(null);
        authService.setAuthToken(null);

        // Dispatch logout
        dispatch({ type: 'AUTH_LOGOUT' });
        
        // Set explicit logout flag to prevent auto-restoration
        setHasExplicitlyLoggedOut(true);

        // Navigate to sign-in
        router.replace('/sign-in');
      } catch (error) {
        console.error('❌ [AUTH PROVIDER] Error during token expiration logout:', error);
        // Still try to navigate even if cleanup fails
        router.replace('/sign-in');
      }
    });
  }, []);

  // Check auth status on app start (but not after explicit logout)
  useEffect(() => {
    if (!hasExplicitlyLoggedOut) {
      checkAuthStatus();
    }
  }, [hasExplicitlyLoggedOut]);

  // Navigation guard: Redirect to sign-in when user is logged out
  useEffect(() => {
    // Don't navigate during initial loading
    if (state.isLoading) {
      return;
    }

    const currentRoute = segments.join('/');
    const isSignInRoute = currentRoute === 'sign-in';
    const isOnboardingRoute = currentRoute.startsWith('onboarding/');

    // Force redirect if flag is set (from token expiration)
    if (shouldRedirectToSignIn && !isSignInRoute) {

      router.replace('/sign-in');
      setShouldRedirectToSignIn(false);
      return;
    }

    // If user is not authenticated
    if (!state.isAuthenticated) {
      // Don't redirect if already on sign-in
      if (isSignInRoute) {
        return;
      }

      // Allow onboarding ONLY if user explicitly logged out or never logged in
      // If they had a session that expired/invalidated, redirect to sign-in
      if (isOnboardingRoute && !hasExplicitlyLoggedOut && !state.error) {
        // This is likely a new user going through initial onboarding
        // Let them continue
        return;
      }

      // Use replace to prevent back navigation
      router.replace('/sign-in');
    }
  }, [state.isAuthenticated, state.isLoading, state.error, segments, hasExplicitlyLoggedOut, shouldRedirectToSignIn]);

  // Backend service integration (dummy + real API ready)

  // Actions
  const sendOTP = async (phoneNumber: string, email?: string, referralCode?: string) => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });

      const requestData: any = { phoneNumber };
      if (email) requestData.email = email;
      if (referralCode) requestData.referralCode = referralCode;

      const response = await authService.sendOtp(requestData);

      // Check if API returned an error
      if (!response.success) {
        const errorMessage = response.error || response.message || 'Failed to send OTP';
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        throw new Error(errorMessage);
      }

      dispatch({ type: 'AUTH_LOADING', payload: false });
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error?.message || 'Failed to send OTP'
      });

      // Re-throw error so calling components know it failed
      throw error;
    }
  };
  const login = async (phoneNumber: string, otp: string) => {
    try {

      dispatch({ type: 'AUTH_LOADING', payload: true });

      const response = await authService.verifyOtp({ phoneNumber, otp });

      // Check if API returned an error
      if (!response.success) {
        const errorMessage = response.error || response.message || 'Login failed';
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        throw new Error(errorMessage);
      }

      // Store in AsyncStorage + localStorage (for web persistence across Stripe redirects)
      if (!response.data || !response.data.tokens || !response.data.user) {
        throw new Error('Invalid response data from server');
      }

      // Use authStorage utility (saves to both AsyncStorage and localStorage on web)
      await authStorage.saveAuthData(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken,
        response.data.user
      );

      // Verify storage (debug)
      const storedToken = await authStorage.getAuthToken();
      const storedUser = await authStorage.getUser();

      // Set auth token in API client (authService sets it in apiClient)

      authService.setAuthToken(response.data.tokens.accessToken);

      // Double-check: Also set directly in apiClient to be safe
      const apiClient = require('@/services/apiClient').default;
      apiClient.setAuthToken(response.data.tokens.accessToken);


      dispatch({ type: 'AUTH_SUCCESS', payload: { user: response.data.user, token: response.data.tokens.accessToken } });

      // Reset explicit logout flag since user is logging in again
      setHasExplicitlyLoggedOut(false);
    } catch (error: any) {
      console.error('[AuthContext] Login failed:', error);
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error?.message || 'Login failed'
      });

      // Re-throw error so calling components know it failed
      throw error;
    }
  };

  const register = async (phoneNumber: string, email: string, referralCode?: string) => {
    // Note: Registration is handled through OTP verification in this backend
    // This method can be used for additional registration data after OTP verification
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });

      // Send OTP first
      await sendOTP(phoneNumber, email, referralCode);

      dispatch({ type: 'AUTH_LOADING', payload: false });
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error?.message || 'Registration failed'
      });

      // Re-throw error so calling components know it failed
      throw error;
    }
  };

  const verifyOTP = async (phoneNumber: string, otp: string) => {
    // Use login for OTP verification
    await login(phoneNumber, otp);
  };

  const logout = async () => {
    try {

      // Call backend logout (invalidate token) - but don't fail if it errors
      try {

        const response = await authService.logout();

        // Check if logout request failed
        if (!response.success) {
          console.warn('⚠️ [AUTH] Backend logout failed:', response.error);
          // Continue with local logout even if backend fails
        } else {

        }
      } catch (error: any) {
        console.warn('⚠️ [AUTH] Backend logout failed (continuing with local logout):', error?.message || error);
        // Continue with local logout even if backend fails
        // This is especially important for cases where the token is already invalid
      }

      // Always proceed with local cleanup regardless of backend response
      await performLocalLogout();
      
    } catch (error) {
      console.error('❌ [AUTH] Logout error:', error);
      // Even if there's an error, try to perform local logout
      try {
        await performLocalLogout();
      } catch (localError) {
        console.error('❌ [AUTH] Local logout also failed:', localError);
      }
      // Don't re-throw - logout should always succeed from user perspective
    }
  };

  const performLocalLogout = async () => {
    try {
      // Clear from AsyncStorage and localStorage (web)
      await authStorage.clearAuthData();

      // Clear auth token from API client
      authService.setAuthToken(null);
      apiClient.setAuthToken(null);

      dispatch({ type: 'AUTH_LOGOUT' });

      // Set explicit logout flag to prevent auto-restoration
      setHasExplicitlyLoggedOut(true);

      // Double-check that state is properly cleared

    } catch (error) {
      console.error('❌ [AUTH] Local logout error:', error);
      throw error;
    }
  };

  const forceLogout = () => {

    try {
      // Clear AsyncStorage synchronously if possible
      AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN, 
        STORAGE_KEYS.REFRESH_TOKEN, 
        STORAGE_KEYS.USER
      ]).catch(console.error);

      // Clear API client token
      authService.setAuthToken(null);
      apiClient.setAuthToken(null);
      
      // Force state update
      dispatch({ type: 'AUTH_LOGOUT' });
      
      // Set explicit logout flag to prevent auto-restoration
      setHasExplicitlyLoggedOut(true);

    } catch (error) {
      console.error('❌ [FORCE LOGOUT] Error:', error);
      // Still dispatch logout even if clearing fails
      dispatch({ type: 'AUTH_LOGOUT' });
      setHasExplicitlyLoggedOut(true);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!state.user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await authService.updateProfile({
        profile: data.profile,
        preferences: data.preferences
      });

      // Check if API returned an error
      if (!response.success) {
        const errorMessage = response.error || response.message || 'Profile update failed';
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        throw new Error(errorMessage);
      }

      // Update AsyncStorage with proper null check
      if (response.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
        dispatch({ type: 'UPDATE_USER', payload: response.data });
      } else {
        throw new Error('No user data received from server');
      }
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error?.message || 'Profile update failed'
      });

      // Re-throw error so calling components know it failed
      throw error;
    }
  };

  const completeOnboarding = async (data: Partial<User>) => {
    try {

      if (!state.user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await authService.completeOnboarding({
        profile: data.profile,
        preferences: data.preferences
      });

      // Check if API returned an error
      if (!response.success) {
        const errorMessage = response.error || response.message || 'Onboarding completion failed';
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        throw new Error(errorMessage);
      }

      // Update AsyncStorage with new user data
      if (response.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
      } else {
        throw new Error('No user data received from server');
      }

      // Verify the storage update
      const storedUserData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      const parsedUser = storedUserData ? JSON.parse(storedUserData) : null;

      dispatch({ type: 'UPDATE_USER', payload: response.data });

    } catch (error: any) {
      console.error('❌ [COMPLETE ONBOARDING] Error:', error);
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error?.message || 'Onboarding completion failed'
      });

      // Re-throw error so calling components know it failed
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const checkAuthStatus = async () => {
    try {

      dispatch({ type: 'AUTH_LOADING', payload: true });

      // Use authStorage utility (checks localStorage first on web, then AsyncStorage)
      const storedToken = await authStorage.getAuthToken();
      const storedUser = await authStorage.getUser();


      if (storedToken && storedUser) {
        // Set auth token in API client FIRST (critical for transaction page)
        authService.setAuthToken(storedToken);

        // Also ensure apiClient has the token (import and set directly)
        const apiClient = require('@/services/apiClient').default;
        apiClient.setAuthToken(storedToken);

        // For better UX, restore auth state immediately and validate in background

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: storedUser, token: storedToken }
        });

        // Reset explicit logout flag since auth is restored
        setHasExplicitlyLoggedOut(false);

        // Validate token with backend in background (don't wait)
        // Use a more immediate validation to prevent race conditions
        Promise.resolve().then(async () => {
          try {

            const response = await authService.getProfile();

            // Check if API returned an error
            if (!response.success) {
              console.warn('⚠️ [AUTH CHECK] Token validation failed, trying refresh...', response.error);
              // Only try refresh if it's a 401/403 error, not other errors
              if (response.error?.includes('401') || response.error?.includes('403') || response.error?.includes('Access token') || response.error?.includes('expired') || response.error?.includes('invalid')) {
                const refreshSuccess = await tryRefreshToken();
                // If refresh fails, logout callback will be triggered automatically
                if (!refreshSuccess) {

                }
              } else {

              }
            } else if (response.data) {

              // Update stored user data if changed
              if (JSON.stringify(response.data) !== JSON.stringify(storedUser)) {
                await authStorage.saveUser(response.data);
                dispatch({ type: 'UPDATE_USER', payload: response.data });
              }
            } else {
              console.warn('⚠️ [AUTH CHECK] Token validation returned no data, trying refresh...');
              const refreshSuccess = await tryRefreshToken();
              if (!refreshSuccess) {

              }
            }
          } catch (error: any) {
            console.warn('⚠️ [AUTH CHECK] Token validation failed, trying refresh...', error);
            // Only try refresh if it's a 401/403 error, not other errors
            if (error?.message?.includes('401') || error?.message?.includes('403') || error?.message?.includes('Access token') || error?.message?.includes('expired') || error?.message?.includes('invalid')) {
              const refreshSuccess = await tryRefreshToken();
              if (!refreshSuccess) {

              }
            } else {

            }
          }
        });

      } else {

        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      console.error('❌ [AUTH CHECK] Auth check failed:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const tryRefreshToken = useCallback(async (): Promise<boolean> => {
    // If already refreshing, return the existing promise
    if (isRefreshingToken.current && refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    // Mark as refreshing
    isRefreshingToken.current = true;

    // Create refresh promise
    const refreshPromise = (async () => {
      try {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (refreshToken) {
          const response = await authService.refreshToken(refreshToken);

          // Check if API returned an error
          if (!response.success) {
            console.warn('❌ [REFRESH TOKEN] Token refresh failed:', response.error);
            throw new Error(response.error || 'Token refresh failed');
          }

          // Update stored tokens
          if (!response.data || !response.data.tokens) {
            throw new Error('Invalid response data from server');
          }

          await AsyncStorage.multiSet([
            [STORAGE_KEYS.ACCESS_TOKEN, response.data.tokens.accessToken],
            [STORAGE_KEYS.REFRESH_TOKEN, response.data.tokens.refreshToken],
          ]);

          // Set auth token in API client
          authService.setAuthToken(response.data.tokens.accessToken);
          apiClient.setAuthToken(response.data.tokens.accessToken);

          // Get user data safely
          const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
          let storedUser = null;

          if (userJson && userJson !== 'undefined') {
            try {
              storedUser = JSON.parse(userJson);
            } catch (parseError) {
              console.error('🔄 [REFRESH TOKEN] Error parsing stored user data:', parseError);
              // Clear corrupt data
              await AsyncStorage.removeItem(STORAGE_KEYS.USER);
              storedUser = null;
            }
          }

          if (storedUser) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: storedUser, token: response.data.tokens.accessToken }
            });
            return true; // Success
          } else {
            console.warn('⚠️ [REFRESH TOKEN] No stored user data after refresh');
            dispatch({ type: 'AUTH_LOGOUT' });
            return false; // Failed - no user data
          }
        } else {
          console.warn('⚠️ [REFRESH TOKEN] No refresh token available');
          return false; // No refresh token available
        }
      } catch (error: any) {
        console.warn('❌ [REFRESH TOKEN] Token refresh failed:', error);
        // Don't immediately logout on refresh failure - could be network issue
        // Only logout if it's a 401/403 (invalid refresh token)
        const errorMessage = error?.message?.toLowerCase() || '';
        const isInvalidToken = error?.response?.status === 401 ||
                              error?.response?.status === 403 ||
                              errorMessage.includes('401') ||
                              errorMessage.includes('403') ||
                              errorMessage.includes('invalid') ||
                              errorMessage.includes('expired');

        if (isInvalidToken) {
          // Clear all stored auth data
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.ACCESS_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER
          ]).catch(console.error);

          // Clear API client token
          apiClient.setAuthToken(null);
          authService.setAuthToken(null);

          // Dispatch logout with error so navigation guard knows to redirect
          dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired. Please sign in again.' });

          // Set redirect flag to trigger navigation guard
          setShouldRedirectToSignIn(true);

          // Also try immediate redirect (in case it works)
          try {
            router.replace('/sign-in');
          } catch (navError) {
            console.error('⚠️ [REFRESH TOKEN] Immediate navigation failed, will use guard:', navError);
          }

          return false; // Failed - invalid token
        } else {
          return false; // Failed - network error
        }
      } finally {
        // Reset refreshing flag
        isRefreshingToken.current = false;
        refreshPromiseRef.current = null;

        // Resolve all pending callbacks
        const callbacks = pendingRefreshCallbacks.current;
        pendingRefreshCallbacks.current = [];
        const success = !(error instanceof Error);
        callbacks.forEach(cb => cb(success));
      }
    })();

    // Store promise for subsequent calls
    refreshPromiseRef.current = refreshPromise;

    return refreshPromise;
  }, [router]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: AuthContextType = useMemo(() => ({
    state,
    actions: {
      sendOTP,
      login,
      register,
      verifyOTP,
      logout,
      forceLogout,
      updateProfile,
      completeOnboarding,
      clearError,
      checkAuthStatus,
    },
  }), [
    state,
    sendOTP,
    login,
    register,
    verifyOTP,
    logout,
    forceLogout,
    updateProfile,
    completeOnboarding,
    clearError,
    checkAuthStatus,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };