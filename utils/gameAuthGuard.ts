/**
 * Game Authentication Guard
 *
 * Ensures all game routes require authentication
 * Validates tokens before API calls
 * Redirects to login if not authenticated
 */

import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Token storage key
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Session timeout (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Last activity key
const LAST_ACTIVITY_KEY = 'last_activity';

/**
 * Authentication result
 */
export interface AuthResult {
  isAuthenticated: boolean;
  token?: string;
  userId?: string;
  reason?: string;
}

/**
 * Game Auth Guard Class
 */
export class GameAuthGuard {
  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<AuthResult> {
    try {
      // Check if token exists
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        return {
          isAuthenticated: false,
          reason: 'NO_TOKEN',
        };
      }

      // Check if token is expired
      const isValid = await this.validateToken(token);
      if (!isValid) {
        await this.clearAuth();
        return {
          isAuthenticated: false,
          reason: 'INVALID_TOKEN',
        };
      }

      // Check session timeout
      const lastActivity = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
      if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity, 10);
        if (timeSinceActivity > SESSION_TIMEOUT) {
          await this.clearAuth();
          return {
            isAuthenticated: false,
            reason: 'SESSION_TIMEOUT',
          };
        }
      }

      // Update last activity
      await this.updateActivity();

      // Get user data
      const userStr = await AsyncStorage.getItem(USER_KEY);
      const user = userStr ? JSON.parse(userStr) : null;

      return {
        isAuthenticated: true,
        token,
        userId: user?.id || user?._id,
      };
    } catch (error) {
      console.error('[GameAuthGuard] Error checking authentication:', error);
      return {
        isAuthenticated: false,
        reason: 'ERROR',
      };
    }
  }

  /**
   * Require authentication for game access
   * Redirects to login if not authenticated
   */
  async requireAuth(gameName?: string): Promise<boolean> {
    const authResult = await this.isAuthenticated();

    if (!authResult.isAuthenticated) {
      console.warn(
        `[GameAuthGuard] Unauthorized access attempt to ${gameName || 'game'}`,
        authResult.reason
      );

      // Redirect to login with return path
      const returnPath = gameName ? `/games/${gameName}` : '/games';
      router.replace({
        pathname: '/sign-in',
        params: { returnTo: returnPath },
      } as any);

      return false;
    }

    return true;
  }

  /**
   * Get authentication token
   */
  async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) return null;

      // Validate token before returning
      const isValid = await this.validateToken(token);
      if (!isValid) {
        await this.clearAuth();
        return null;
      }

      return token;
    } catch (error) {
      console.error('[GameAuthGuard] Error getting token:', error);
      return null;
    }
  }

  /**
   * Get user ID
   */
  async getUserId(): Promise<string | null> {
    try {
      const userStr = await AsyncStorage.getItem(USER_KEY);
      if (!userStr) return null;

      const user = JSON.parse(userStr);
      return user?.id || user?._id || null;
    } catch (error) {
      console.error('[GameAuthGuard] Error getting user ID:', error);
      return null;
    }
  }

  /**
   * Validate token
   */
  async validateToken(token: string): Promise<boolean> {
    if (!token || token.trim().length === 0) {
      return false;
    }

    // Basic JWT structure validation (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    try {
      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));

      // Check if token is expired
      if (payload.exp) {
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        if (Date.now() >= expirationTime) {
          console.warn('[GameAuthGuard] Token expired');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('[GameAuthGuard] Error validating token:', error);
      return false;
    }
  }

  /**
   * Update last activity timestamp
   */
  async updateActivity(): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    } catch (error) {
      console.error('[GameAuthGuard] Error updating activity:', error);
    }
  }

  /**
   * Clear authentication data
   */
  async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, LAST_ACTIVITY_KEY]);
    } catch (error) {
      console.error('[GameAuthGuard] Error clearing auth:', error);
    }
  }

  /**
   * Refresh token if needed
   */
  async refreshTokenIfNeeded(): Promise<string | null> {
    const token = await this.getToken();
    if (!token) return null;

    try {
      // Decode payload
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1]));

      // Check if token will expire soon (within 5 minutes)
      if (payload.exp) {
        const expirationTime = payload.exp * 1000;
        const fiveMinutes = 5 * 60 * 1000;

        if (Date.now() >= expirationTime - fiveMinutes) {
          console.log('[GameAuthGuard] Token expiring soon, should refresh');
          // In production, call refresh token API here
          // const newToken = await authApi.refreshToken();
          // await AsyncStorage.setItem(TOKEN_KEY, newToken);
          // return newToken;
        }
      }

      return token;
    } catch (error) {
      console.error('[GameAuthGuard] Error refreshing token:', error);
      return token;
    }
  }
}

// Singleton instance
const gameAuthGuard = new GameAuthGuard();

/**
 * Hook for using auth guard in components
 */
export function useGameAuthGuard() {
  const requireAuth = async (gameName?: string) => {
    return await gameAuthGuard.requireAuth(gameName);
  };

  const getToken = async () => {
    return await gameAuthGuard.getToken();
  };

  const getUserId = async () => {
    return await gameAuthGuard.getUserId();
  };

  const isAuthenticated = async () => {
    return await gameAuthGuard.isAuthenticated();
  };

  const updateActivity = async () => {
    await gameAuthGuard.updateActivity();
  };

  return {
    requireAuth,
    getToken,
    getUserId,
    isAuthenticated,
    updateActivity,
  };
}

// Export singleton
export default gameAuthGuard;
