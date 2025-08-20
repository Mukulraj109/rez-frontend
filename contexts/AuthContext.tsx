import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackendService } from '@/services/dummyBackend';
import type { User, AuthResponse } from '@/services/dummyBackend';

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
  TOKEN: 'auth_token',
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
    sendOTP: (phoneNumber: string) => Promise<void>;
    login: (phoneNumber: string, otp: string) => Promise<void>;
    register: (phoneNumber: string, email: string, referralCode?: string) => Promise<void>;
    verifyOTP: (phoneNumber: string, otp: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
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

  // Check auth status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Backend service integration (dummy + real API ready)

  // Actions
  const sendOTP = async (phoneNumber: string) => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      
      await BackendService.sendOTP(phoneNumber);
      
      dispatch({ type: 'AUTH_LOADING', payload: false });
    } catch (error) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error instanceof Error ? error.message : 'Failed to send OTP' 
      });
    }
  };
  const login = async (phoneNumber: string, otp: string) => {
    try {
      console.log('[AuthContext] Starting login for:', phoneNumber);
      dispatch({ type: 'AUTH_LOADING', payload: true });
      
      const response = await BackendService.verifyOTP(phoneNumber, otp);
      console.log('[AuthContext] Backend response:', { user: response.user.id, token: response.token ? 'exists' : 'missing' });
      
      // Store in AsyncStorage
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.TOKEN, response.token],
        [STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken],
        [STORAGE_KEYS.USER, JSON.stringify(response.user)],
      ]);

      console.log('[AuthContext] Stored in AsyncStorage, dispatching AUTH_SUCCESS');
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: response.user, token: response.token } });
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  };

  const register = async (phoneNumber: string, email: string, referralCode?: string) => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      
      const response = await BackendService.register(phoneNumber, email, referralCode);
      
      // Store in AsyncStorage
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.TOKEN, response.token],
        [STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken],
        [STORAGE_KEYS.USER, JSON.stringify(response.user)],
      ]);

      dispatch({ type: 'AUTH_SUCCESS', payload: { user: response.user, token: response.token } });
    } catch (error) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error instanceof Error ? error.message : 'Registration failed' 
      });
    }
  };

  const verifyOTP = async (phoneNumber: string, otp: string) => {
    // Use login for OTP verification
    await login(phoneNumber, otp);
  };

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      
      // Call backend logout (invalidate token)
      if (token) {
        try {
          await BackendService.logout(token);
        } catch (error) {
          console.warn('Backend logout failed:', error);
          // Continue with local logout even if backend fails
        }
      }
      
      // Remove from AsyncStorage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN, 
        STORAGE_KEYS.REFRESH_TOKEN, 
        STORAGE_KEYS.USER
      ]);
      
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!state.user?.id) {
        throw new Error('User not authenticated');
      }

      const updatedUser = await BackendService.updateProfile(state.user.id, data.profile || {});
      
      // Update AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error instanceof Error ? error.message : 'Profile update failed' 
      });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      
      const [token, userJson] = await AsyncStorage.multiGet([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
      ]);

      const storedToken = token[1];
      const storedUser = userJson[1] ? JSON.parse(userJson[1]) : null;

      if (storedToken && storedUser) {
        // Validate token with backend
        try {
          const isValidToken = await BackendService.validateToken(storedToken);
          
          if (isValidToken) {
            dispatch({ 
              type: 'AUTH_SUCCESS', 
              payload: { user: storedUser, token: storedToken } 
            });
          } else {
            // Token invalid, try to refresh
            await tryRefreshToken();
          }
        } catch (error) {
          console.warn('Token validation failed:', error);
          await tryRefreshToken();
        }
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const tryRefreshToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (refreshToken) {
        const response = await BackendService.refreshToken(refreshToken);
        
        // Update stored tokens
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.TOKEN, response.token],
          [STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken],
        ]);

        // Get user data
        const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        const storedUser = userJson ? JSON.parse(userJson) : null;

        if (storedUser) {
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: { user: storedUser, token: response.token } 
          });
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      console.warn('Token refresh failed:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
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
      updateProfile,
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