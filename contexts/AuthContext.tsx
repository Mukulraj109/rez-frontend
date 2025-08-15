import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface User {
  id: string;
  phoneNumber: string;
  email: string;
  name?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

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

  // Mock API functions (replace with real API calls)
  const mockAPI = {
    login: async (phoneNumber: string, otp: string) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (otp !== '123456') {
        throw new Error('Invalid OTP');
      }

      return {
        user: {
          id: '1',
          phoneNumber,
          email: `user@example.com`,
          name: 'John Doe',
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
        token: 'mock_jwt_token_' + Date.now(),
      };
    },

    register: async (phoneNumber: string, email: string, referralCode?: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        user: {
          id: '1',
          phoneNumber,
          email,
          isVerified: false,
          createdAt: new Date().toISOString(),
        },
        token: 'mock_jwt_token_' + Date.now(),
      };
    },

    updateProfile: async (data: Partial<User>) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return data;
    },
  };

  // Actions
  const login = async (phoneNumber: string, otp: string) => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      
      const response = await mockAPI.login(phoneNumber, otp);
      
      // Store in AsyncStorage
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.TOKEN, response.token],
        [STORAGE_KEYS.USER, JSON.stringify(response.user)],
      ]);

      dispatch({ type: 'AUTH_SUCCESS', payload: response });
    } catch (error) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  };

  const register = async (phoneNumber: string, email: string, referralCode?: string) => {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      
      const response = await mockAPI.register(phoneNumber, email, referralCode);
      
      // Store in AsyncStorage
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.TOKEN, response.token],
        [STORAGE_KEYS.USER, JSON.stringify(response.user)],
      ]);

      dispatch({ type: 'AUTH_SUCCESS', payload: response });
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
      // Remove from AsyncStorage
      await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
      
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedData = await mockAPI.updateProfile(data);
      
      // Update AsyncStorage
      if (state.user) {
        const updatedUser = { ...state.user, ...updatedData };
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      }

      dispatch({ type: 'UPDATE_USER', payload: updatedData });
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
        // Validate token (in real app, verify with backend)
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: { user: storedUser, token: storedToken } 
        });
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const contextValue: AuthContextType = {
    state,
    actions: {
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