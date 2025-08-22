import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { User, AuthResponse } from '@/services/authApi';

// Use types from backend service
// interface User is imported from dummyBackend

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
      console.log('[AuthReducer] AUTH_SUCCESS:', { user: action.payload.user.id, isAuthenticated: true });
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

  // Check auth status on app start (but not after explicit logout)
  useEffect(() => {
    if (!hasExplicitlyLoggedOut) {
      checkAuthStatus();
    }
  }, [hasExplicitlyLoggedOut]);

  // Backend service integration (dummy + real API ready)

  // Actions
  const sendOTP = async (phoneNumber: string, email?: string, referralCode?: string) => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      
      const requestData: any = { phoneNumber };
      if (email) requestData.email = email;
      if (referralCode) requestData.referralCode = referralCode;
      
      const response = await authService.sendOtp(requestData);
      console.log('[AuthContext] OTP sent successfully:', response.data || response);
      
      dispatch({ type: 'AUTH_LOADING', payload: false });
    } catch (error: any) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error?.response?.data?.message || error?.message || 'Failed to send OTP' 
      });
      
      // Re-throw error so calling components know it failed
      throw error;
    }
  };
  const login = async (phoneNumber: string, otp: string) => {
    try {
      console.log('[AuthContext] Starting login for:', phoneNumber);
      dispatch({ type: 'AUTH_LOADING', payload: true });
      
      const response = await authService.verifyOtp({ phoneNumber, otp });
      console.log('[AuthContext] Backend response:', { user: response.data.user.id, token: response.data.tokens.accessToken ? 'exists' : 'missing' });
      
      // Store in AsyncStorage
      console.log('[AuthContext] Storing auth data...', {
        token: response.data.tokens.accessToken ? 'exists' : 'missing',
        refreshToken: response.data.tokens.refreshToken ? 'exists' : 'missing',
        user: response.data.user?.id || 'no-id'
      });
      
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, response.data.tokens.accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, response.data.tokens.refreshToken],
        [STORAGE_KEYS.USER, JSON.stringify(response.data.user)],
      ]);
      
      // Verify storage (debug)
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      console.log('[AuthContext] Verification - stored data:', {
        tokenStored: !!storedToken,
        userStored: !!storedUser
      });

      // Set auth token in API client
      authService.setAuthToken(response.data.tokens.accessToken);

      console.log('[AuthContext] Stored in AsyncStorage, dispatching AUTH_SUCCESS');
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: response.data.user, token: response.data.tokens.accessToken } });
      
      // Reset explicit logout flag since user is logging in again
      setHasExplicitlyLoggedOut(false);
    } catch (error: any) {
      console.error('[AuthContext] Login failed:', error);
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error?.response?.data?.message || error?.message || 'Login failed' 
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
        payload: error?.response?.data?.message || error?.message || 'Registration failed' 
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
      console.log('🔓 [AUTH] Starting logout process...');
      
      // Call backend logout (invalidate token)
      try {
        console.log('🔓 [AUTH] Calling backend logout...');
        await authService.logout();
        console.log('✅ [AUTH] Backend logout successful');
      } catch (error) {
        console.warn('⚠️ [AUTH] Backend logout failed:', error);
        // Continue with local logout even if backend fails
      }
      
      // Remove from AsyncStorage
      console.log('🔓 [AUTH] Clearing AsyncStorage...');
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN, 
        STORAGE_KEYS.REFRESH_TOKEN, 
        STORAGE_KEYS.USER
      ]);
      console.log('✅ [AUTH] AsyncStorage cleared');

      // Clear auth token from API client
      console.log('🔓 [AUTH] Clearing API client token...');
      authService.setAuthToken(null);
      console.log('✅ [AUTH] API client token cleared');
      
      console.log('🔓 [AUTH] Dispatching AUTH_LOGOUT...');
      dispatch({ type: 'AUTH_LOGOUT' });
      
      // Set explicit logout flag to prevent auto-restoration
      setHasExplicitlyLoggedOut(true);
      
      // Double-check that state is properly cleared
      console.log('✅ [AUTH] Logout complete - Auth state should be:', {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
        token: null
      });
    } catch (error) {
      console.error('❌ [AUTH] Logout error:', error);
      throw error; // Re-throw so calling component knows it failed
    }
  };

  const forceLogout = () => {
    console.log('💥 [FORCE LOGOUT] Forcing immediate logout...');
    try {
      // Clear AsyncStorage synchronously if possible
      AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN, 
        STORAGE_KEYS.REFRESH_TOKEN, 
        STORAGE_KEYS.USER
      ]).catch(console.error);

      // Clear API client token
      authService.setAuthToken(null);
      
      // Force state update
      dispatch({ type: 'AUTH_LOGOUT' });
      
      // Set explicit logout flag to prevent auto-restoration
      setHasExplicitlyLoggedOut(true);
      
      console.log('✅ [FORCE LOGOUT] Forced logout complete');
    } catch (error) {
      console.error('❌ [FORCE LOGOUT] Error:', error);
      // Still dispatch logout even if clearing fails
      dispatch({ type: 'AUTH_LOGOUT' });
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
        payload: error?.response?.data?.message || error?.message || 'Profile update failed' 
      });
      
      // Re-throw error so calling components know it failed
      throw error;
    }
  };

  const completeOnboarding = async (data: Partial<User>) => {
    try {
      console.log('🎯 [COMPLETE ONBOARDING] Starting onboarding completion...', {
        userId: state.user?.id,
        currentOnboardedStatus: state.user?.isOnboarded
      });
      
      if (!state.user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await authService.completeOnboarding({
        profile: data.profile,
        preferences: data.preferences
      });
      
      console.log('🎯 [COMPLETE ONBOARDING] Backend response:', {
        userId: response.data.id,
        isOnboarded: response.data.isOnboarded
      });
      
      // Update AsyncStorage with new user data
      if (response.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
      } else {
        throw new Error('No user data received from server');
      }
      
      // Verify the storage update
      const storedUserData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      const parsedUser = storedUserData ? JSON.parse(storedUserData) : null;
      console.log('🎯 [COMPLETE ONBOARDING] Verified stored user:', {
        isOnboarded: parsedUser?.isOnboarded,
        userId: parsedUser?.id
      });

      dispatch({ type: 'UPDATE_USER', payload: response.data });
      
      console.log('✅ [COMPLETE ONBOARDING] Onboarding completion successful');
    } catch (error: any) {
      console.error('❌ [COMPLETE ONBOARDING] Error:', error);
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error?.response?.data?.message || error?.message || 'Onboarding completion failed' 
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
      console.log('🔍 [AUTH CHECK] Starting auth status check...');
      dispatch({ type: 'AUTH_LOADING', payload: true });
      
      const [token, userJson] = await AsyncStorage.multiGet([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.USER,
      ]);

      const storedToken = token[1];
      let storedUser = null;
      
      // Safely parse stored user data
      if (userJson[1] && userJson[1] !== 'undefined') {
        try {
          storedUser = JSON.parse(userJson[1]);
        } catch (parseError) {
          console.error('🔍 [AUTH CHECK] Error parsing stored user data:', parseError);
          // Clear corrupt data
          await AsyncStorage.removeItem(STORAGE_KEYS.USER);
          storedUser = null;
        }
      }

      console.log('🔍 [AUTH CHECK] Stored data:', { 
        hasToken: !!storedToken, 
        hasUser: !!storedUser,
        userId: storedUser?.id,
        isOnboarded: storedUser?.isOnboarded
      });

      if (storedToken && storedUser) {
        // Set auth token in API client
        authService.setAuthToken(storedToken);

        // For better UX, restore auth state immediately and validate in background
        console.log('✅ [AUTH CHECK] Restoring auth state from storage');
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
            console.log('🔍 [AUTH CHECK] Validating token with backend...');
            const response = await authService.getProfile();
            
            if (response.data) {
              console.log('✅ [AUTH CHECK] Token validation successful');
              // Update stored user data if changed
              if (JSON.stringify(response.data) !== JSON.stringify(storedUser)) {
                await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
                dispatch({ type: 'UPDATE_USER', payload: response.data });
              }
            } else {
              console.warn('⚠️ [AUTH CHECK] Token validation returned no data, trying refresh...');
              await tryRefreshToken();
            }
          } catch (error) {
            console.warn('⚠️ [AUTH CHECK] Token validation failed, trying refresh...', error);
            await tryRefreshToken();
          }
        });

      } else {
        console.log('❌ [AUTH CHECK] No stored auth data found');
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      console.error('❌ [AUTH CHECK] Auth check failed:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const tryRefreshToken = async () => {
    try {
      console.log('🔄 [REFRESH TOKEN] Attempting token refresh...');
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (refreshToken) {
        console.log('🔄 [REFRESH TOKEN] Refresh token found, calling backend...');
        const response = await authService.refreshToken(refreshToken);
        
        console.log('✅ [REFRESH TOKEN] Token refresh successful');
        
        // Update stored tokens
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.ACCESS_TOKEN, response.data.tokens.accessToken],
          [STORAGE_KEYS.REFRESH_TOKEN, response.data.tokens.refreshToken],
        ]);

        // Set auth token in API client
        authService.setAuthToken(response.data.tokens.accessToken);

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
        } else {
          console.warn('⚠️ [REFRESH TOKEN] No stored user data after refresh');
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } else {
        console.warn('⚠️ [REFRESH TOKEN] No refresh token available');
        // Don't immediately logout - maybe the user is still valid
        // Just log the warning and let the current state persist
        console.log('🔄 [REFRESH TOKEN] Keeping current auth state since no refresh token');
      }
    } catch (error) {
      console.warn('❌ [REFRESH TOKEN] Token refresh failed:', error);
      // Don't immediately logout on refresh failure - could be network issue
      // Only logout if it's a 401/403 (invalid refresh token)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.log('❌ [REFRESH TOKEN] Refresh token invalid, logging out');
        dispatch({ type: 'AUTH_LOGOUT' });
      } else {
        console.log('🔄 [REFRESH TOKEN] Network/temporary error, keeping current state');
      }
    }
  };

  const contextValue: AuthContextType = {
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
  };

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