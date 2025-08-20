// Dummy Backend Service - Production-Ready Mock API
// This service mimics real backend behavior and can be easily replaced with actual API calls

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, ApiResponse } from '@/utils/apiClient';

// Types
interface User {
  id: string;
  phoneNumber: string;
  email: string;
  name?: string;
  avatar?: string;
  isVerified: boolean;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  location?: UserLocation;
  preferences?: UserPreferences;
}

interface UserLocation {
  city: string;
  state: string;
  country: string;
  pincode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface UserPreferences {
  categories: string[];
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  language: string;
  currency: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

interface OTPResponse {
  success: boolean;
  message: string;
  expiresIn: number;
}

interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Dummy Data Storage
class DummyDatabase {
  private static users: Map<string, User> = new Map();
  private static otps: Map<string, { otp: string; expiresAt: number }> = new Map();
  private static tokens: Map<string, { userId: string; expiresAt: number }> = new Map();
  private static initialized = false;

  // Initialize with some dummy users
  private static initialize(): void {
    if (this.initialized) return;
    
    this.users.set('+919876543210', {
      id: 'user_1',
      phoneNumber: '+919876543210',
      email: 'john.doe@example.com',
      name: 'John Doe',
      isVerified: true,
      isOnboarded: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          pincode: '400001'
        },
        preferences: {
          categories: ['electronics', 'fashion', 'food'],
          notifications: {
            email: true,
            sms: true,
            push: true
          },
          language: 'en',
          currency: 'INR'
        }
      }
    });

    this.initialized = true;
  }

  static getUser(phoneNumber: string): User | undefined {
    this.initialize();
    return this.users.get(phoneNumber);
  }

  static createUser(userData: Partial<User>): User {
    this.initialize();
    const user: User = {
      id: `user_${Date.now()}`,
      phoneNumber: userData.phoneNumber!,
      email: userData.email!,
      name: userData.name,
      isVerified: false,
      isOnboarded: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...userData
    };

    this.users.set(user.phoneNumber, user);
    return user;
  }

  static updateUser(phoneNumber: string, updates: Partial<User>): User | null {
    this.initialize();
    const user = this.users.get(phoneNumber);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.users.set(phoneNumber, updatedUser);
    return updatedUser;
  }

  static setOTP(phoneNumber: string, otp: string, expiresInMs: number = 300000): void {
    this.otps.set(phoneNumber, {
      otp,
      expiresAt: Date.now() + expiresInMs
    });
  }

  static verifyOTP(phoneNumber: string, otp: string): boolean {
    const storedOTP = this.otps.get(phoneNumber);
    if (!storedOTP) return false;

    if (Date.now() > storedOTP.expiresAt) {
      this.otps.delete(phoneNumber);
      return false;
    }

    if (storedOTP.otp === otp) {
      this.otps.delete(phoneNumber);
      return true;
    }

    return false;
  }

  static createToken(userId: string): string {
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    this.tokens.set(token, { userId, expiresAt });
    return token;
  }

  static verifyToken(token: string): { userId: string } | null {
    const tokenData = this.tokens.get(token);
    if (!tokenData) return null;

    if (Date.now() > tokenData.expiresAt) {
      this.tokens.delete(token);
      return null;
    }

    return { userId: tokenData.userId };
  }

  static revokeToken(token: string): void {
    this.tokens.delete(token);
  }
}

// Dummy Backend Service
export class DummyBackendService {
  // Simulate network delay
  private static delay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Simulate API errors
  private static shouldSimulateError(errorRate: number = 0.05): boolean {
    return Math.random() < errorRate;
  }

  // Authentication Methods

  static async sendOTP(phoneNumber: string): Promise<OTPResponse> {
    await this.delay(800);

    if (this.shouldSimulateError()) {
      throw new Error('Failed to send OTP. Please try again.');
    }

    // In production, this would send actual OTP via SMS
    const otp = __DEV__ ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    
    DummyDatabase.setOTP(phoneNumber, otp);

    console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`); // Remove in production

    return {
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 300 // 5 minutes
    };
  }

  static async verifyOTP(phoneNumber: string, otp: string): Promise<AuthResponse> {
    await this.delay(1200);

    if (this.shouldSimulateError()) {
      throw new Error('Verification failed. Please try again.');
    }

    // Verify OTP
    const isValidOTP = DummyDatabase.verifyOTP(phoneNumber, otp);
    if (!isValidOTP) {
      throw new Error('Invalid or expired OTP');
    }

    // Get or create user
    let user = DummyDatabase.getUser(phoneNumber);
    if (!user) {
      // Create new user for sign-in (simplified flow)
      console.log(`[DEV] Creating new user for phone: ${phoneNumber}`);
      user = DummyDatabase.createUser({
        phoneNumber,
        email: `user${Date.now()}@example.com`, // Generate email
        name: 'New User',
        isVerified: false,
        isOnboarded: false
      });
    }

    // Mark user as verified
    user = DummyDatabase.updateUser(phoneNumber, { isVerified: true })!;

    // Generate tokens
    const token = DummyDatabase.createToken(user.id);
    const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      user,
      token,
      refreshToken,
      expiresIn: 86400 // 24 hours
    };
  }

  static async register(phoneNumber: string, email: string, referralCode?: string): Promise<AuthResponse> {
    await this.delay(1500);

    if (this.shouldSimulateError()) {
      throw new Error('Registration failed. Please try again.');
    }

    // Check if user already exists
    const existingUser = DummyDatabase.getUser(phoneNumber);
    if (existingUser) {
      throw new Error('User already exists with this phone number');
    }

    // Create new user
    const user = DummyDatabase.createUser({
      phoneNumber,
      email,
      name: email.split('@')[0], // Extract name from email
      isVerified: false,
      isOnboarded: false
    });

    // Generate tokens
    const token = DummyDatabase.createToken(user.id);
    const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      user,
      token,
      refreshToken,
      expiresIn: 86400 // 24 hours
    };
  }

  static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    await this.delay(500);

    if (this.shouldSimulateError()) {
      throw new Error('Token refresh failed');
    }

    // In real backend, validate refresh token
    // For dummy, just generate new tokens
    const newToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newRefreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: 86400 // 24 hours
    };
  }

  static async logout(token: string): Promise<{ success: boolean }> {
    await this.delay(300);

    DummyDatabase.revokeToken(token);

    return { success: true };
  }

  // User Profile Methods

  static async getProfile(userId: string): Promise<User> {
    await this.delay(600);

    // Find user by ID
    DummyDatabase['initialize'](); // Initialize the database
    for (const user of DummyDatabase['users'].values()) {
      if (user.id === userId) {
        return user;
      }
    }

    throw new Error('User not found');
  }

  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<User> {
    await this.delay(800);

    if (this.shouldSimulateError()) {
      throw new Error('Profile update failed');
    }

    // Find user by ID and update
    DummyDatabase['initialize'](); // Initialize the database
    for (const [phoneNumber, user] of DummyDatabase['users']) {
      if (user.id === userId) {
        const updatedUser = DummyDatabase.updateUser(phoneNumber, {
          profile: { ...user.profile, ...updates }
        });
        
        if (!updatedUser) {
          throw new Error('Failed to update profile');
        }
        
        return updatedUser;
      }
    }

    throw new Error('User not found');
  }

  static async completeOnboarding(userId: string): Promise<User> {
    await this.delay(500);

    // Find user by ID and mark onboarding complete
    DummyDatabase['initialize'](); // Initialize the database
    for (const [phoneNumber, user] of DummyDatabase['users']) {
      if (user.id === userId) {
        const updatedUser = DummyDatabase.updateUser(phoneNumber, {
          isOnboarded: true
        });
        
        if (!updatedUser) {
          throw new Error('Failed to complete onboarding');
        }
        
        return updatedUser;
      }
    }

    throw new Error('User not found');
  }

  // Homepage Data Methods

  static async getHomepageData(): Promise<any> {
    await this.delay(1000);

    if (this.shouldSimulateError(0.02)) { // Lower error rate for homepage
      throw new Error('Failed to load homepage data');
    }

    // Return dummy homepage data
    return {
      banners: [
        {
          id: '1',
          title: 'Welcome to REZ App',
          subtitle: 'Discover amazing deals',
          image: 'https://picsum.photos/400/200?random=1'
        }
      ],
      sections: [
        {
          id: 'events',
          title: 'Events',
          type: 'events',
          items: []
        },
        {
          id: 'trending_stores',
          title: 'Trending Stores',
          type: 'stores',
          items: []
        }
      ]
    };
  }

  // Utility Methods

  static async validateToken(token: string): Promise<boolean> {
    await this.delay(200);
    return DummyDatabase.verifyToken(token) !== null;
  }

  static async checkConnection(): Promise<{ status: 'ok' | 'error', message: string }> {
    await this.delay(100);
    
    if (this.shouldSimulateError(0.01)) {
      return { status: 'error', message: 'Service temporarily unavailable' };
    }
    
    return { status: 'ok', message: 'Backend service is running' };
  }
}

// Backend-Ready API Service (Easy to replace with real API)
export class BackendService {
  // Authentication
  static async sendOTP(phoneNumber: string): Promise<OTPResponse> {
    if (__DEV__) {
      return DummyBackendService.sendOTP(phoneNumber);
    }
    
    // REPLACE WITH REAL API CALL
    const response = await apiClient.post<OTPResponse>('/auth/send-otp', { phoneNumber });
    return response.data;
  }

  static async verifyOTP(phoneNumber: string, otp: string): Promise<AuthResponse> {
    if (__DEV__) {
      return DummyBackendService.verifyOTP(phoneNumber, otp);
    }
    
    // REPLACE WITH REAL API CALL
    const response = await apiClient.post<AuthResponse>('/auth/verify-otp', { phoneNumber, otp });
    return response.data;
  }

  static async register(phoneNumber: string, email: string, referralCode?: string): Promise<AuthResponse> {
    if (__DEV__) {
      return DummyBackendService.register(phoneNumber, email, referralCode);
    }
    
    // REPLACE WITH REAL API CALL
    const response = await apiClient.post<AuthResponse>('/auth/register', { 
      phoneNumber, 
      email, 
      referralCode 
    });
    return response.data;
  }

  static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    if (__DEV__) {
      return DummyBackendService.refreshToken(refreshToken);
    }
    
    // REPLACE WITH REAL API CALL
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', { refreshToken });
    return response.data;
  }

  static async logout(token: string): Promise<{ success: boolean }> {
    if (__DEV__) {
      return DummyBackendService.logout(token);
    }
    
    // REPLACE WITH REAL API CALL
    const response = await apiClient.post<{ success: boolean }>('/auth/logout', { token });
    return response.data;
  }

  // User Profile
  static async getProfile(userId: string): Promise<User> {
    if (__DEV__) {
      return DummyBackendService.getProfile(userId);
    }
    
    // REPLACE WITH REAL API CALL
    const response = await apiClient.get<User>(`/user/profile/${userId}`);
    return response.data;
  }

  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<User> {
    if (__DEV__) {
      return DummyBackendService.updateProfile(userId, updates);
    }
    
    // REPLACE WITH REAL API CALL
    const response = await apiClient.patch<User>(`/user/profile/${userId}`, updates);
    return response.data;
  }

  // Homepage
  static async getHomepageData(): Promise<any> {
    if (__DEV__) {
      return DummyBackendService.getHomepageData();
    }
    
    // REPLACE WITH REAL API CALL
    const response = await apiClient.get<any>('/homepage');
    return response.data;
  }

  // Utility
  static async validateToken(token: string): Promise<boolean> {
    if (__DEV__) {
      return DummyBackendService.validateToken(token);
    }
    
    // REPLACE WITH REAL API CALL
    try {
      await apiClient.get('/auth/validate');
      return true;
    } catch {
      return false;
    }
  }
}

export type { User, UserProfile, AuthResponse, OTPResponse, RefreshTokenResponse };