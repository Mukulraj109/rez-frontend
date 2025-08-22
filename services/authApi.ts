// Authentication API Service
// Handles user authentication, registration, and profile management

import apiClient, { ApiResponse } from './apiClient';

export interface User {
  id: string;
  phoneNumber: string;
  email?: string;
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    location?: {
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
      coordinates?: [number, number];
    };
  };
  preferences: {
    language?: string;
    notifications?: boolean;
    categories?: string[];
    theme?: 'light' | 'dark';
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
  };
  wallet: {
    balance: number;
    totalEarned: number;
    totalSpent: number;
    pendingAmount: number;
  };
  role: 'user' | 'admin' | 'merchant';
  isVerified: boolean;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface OtpRequest {
  phoneNumber: string;
  email?: string;
  referralCode?: string;
}

export interface OtpVerification {
  phoneNumber: string;
  otp: string;
}

export interface ProfileUpdate {
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    location?: {
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
      coordinates?: [number, number];
    };
  };
  preferences?: {
    language?: string;
    theme?: 'light' | 'dark';
    notifications?: boolean;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
  };
}

class AuthService {
  // Send OTP for registration or login
  async sendOtp(data: OtpRequest): Promise<ApiResponse<{ message: string; expiresIn: number }>> {
    return apiClient.post('/auth/send-otp', data);
  }

  // Verify OTP and authenticate/register user
  async verifyOtp(data: OtpVerification): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post('/auth/verify-otp', data);
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ tokens: { accessToken: string; refreshToken: string; expiresIn: number } }>> {
    return apiClient.post('/auth/refresh-token', { refreshToken });
  }

  // Logout user
  async logout(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/auth/logout');
  }

  // Get current user profile
  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get('/auth/me');
  }

  // Update user profile
  async updateProfile(data: ProfileUpdate): Promise<ApiResponse<User>> {
    return apiClient.put('/auth/profile', data);
  }

  // Complete onboarding
  async completeOnboarding(data: ProfileUpdate): Promise<ApiResponse<User>> {
    return apiClient.post('/auth/complete-onboarding', data);
  }

  // Delete account
  async deleteAccount(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete('/auth/account');
  }

  // Set authentication token
  setAuthToken(token: string | null) {
    apiClient.setAuthToken(token);
  }

  // Get current auth token
  getAuthToken(): string | null {
    return apiClient.getAuthToken();
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;