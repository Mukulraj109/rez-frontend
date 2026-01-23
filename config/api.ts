/**
 * API Client Configuration
 * Configures axios instance with environment variables
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ENV } from './env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance with base configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.getApiUrl(),
  timeout: ENV.API.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    try {
      // Add auth token if available
      const token = await AsyncStorage.getItem(ENV.AUTH.jwtStorageKey);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add debug logging in development
      if (ENV.isDevelopment() && ENV.DEV.debugMode) {
      }

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Handle common error scenarios
    if (error.response) {
      const { status, data } = error.response;

      // Log error in development
      if (ENV.isDevelopment() && ENV.DEV.debugMode) {
        console.error('❌ API Error:', {
          status,
          statusText: error.response.statusText,
          url: error.config?.url,
          data,
          message: error.message,
        });
      }

      // Handle authentication errors
      if (status === 401) {
        // Token expired or invalid
        await AsyncStorage.multiRemove([
          ENV.AUTH.jwtStorageKey,
          ENV.AUTH.refreshTokenKey,
          ENV.AUTH.userDataKey,
        ]);

        // Could trigger a navigation to login screen here
        // NavigationService.navigate('Login');
      }

      // Handle specific error codes
      switch (status) {
        case 400:
          console.warn('Bad Request:', data);
          break;
        case 403:
          console.warn('Forbidden:', data);
          break;
        case 404:
          console.warn('Not Found:', error.config?.url);
          break;
        case 429:
          console.warn('Rate Limited:', data);
          break;
        case 500:
          console.error('Server Error:', data);
          break;
        default:
          console.error('API Error:', data);
      }
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.message);
      
      if (ENV.isDevelopment()) {
        console.error('Request details:', error.request);
      }
    } else {
      // Other errors
      console.error('API Setup Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// API endpoint builders
export const buildEndpoint = (endpoint: string, params?: Record<string, string | number>): string => {
  let url = endpoint;
  
  if (params) {
    // Replace path parameters
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  
  return url;
};

// Common API methods
export const apiMethods = {
  // GET request
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },

  // POST request
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },

  // PUT request
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },

  // PATCH request
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },
};

// Specific API endpoints using environment configuration
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${ENV.ENDPOINTS.auth}/login`,
    REGISTER: `${ENV.ENDPOINTS.auth}/register`,
    VERIFY_OTP: `${ENV.ENDPOINTS.auth}/verify-otp`,
    RESEND_OTP: `${ENV.ENDPOINTS.auth}/resend-otp`,
    LOGOUT: `${ENV.ENDPOINTS.auth}/logout`,
    REFRESH_TOKEN: `${ENV.ENDPOINTS.auth}/refresh-token`,
    FORGOT_PASSWORD: `${ENV.ENDPOINTS.auth}/forgot-password`,
    RESET_PASSWORD: `${ENV.ENDPOINTS.auth}/reset-password`,
  },

  // Products
  PRODUCTS: {
    LIST: ENV.ENDPOINTS.products,
    DETAIL: `${ENV.ENDPOINTS.products}/:id`,
    SEARCH: `${ENV.ENDPOINTS.products}/search`,
    CATEGORIES: `${ENV.ENDPOINTS.products}/categories`,
    FEATURED: `${ENV.ENDPOINTS.products}/featured`,
  },

  // Cart
  CART: {
    GET: ENV.ENDPOINTS.cart,
    ADD: `${ENV.ENDPOINTS.cart}/add`,
    UPDATE: `${ENV.ENDPOINTS.cart}/update/:itemId`,
    REMOVE: `${ENV.ENDPOINTS.cart}/remove/:itemId`,
    CLEAR: `${ENV.ENDPOINTS.cart}/clear`,
    APPLY_COUPON: `${ENV.ENDPOINTS.cart}/coupon`,
  },

  // Orders
  ORDERS: {
    LIST: ENV.ENDPOINTS.orders,
    CREATE: ENV.ENDPOINTS.orders,
    DETAIL: `${ENV.ENDPOINTS.orders}/:id`,
    CANCEL: `${ENV.ENDPOINTS.orders}/:id/cancel`,
    TRACK: `${ENV.ENDPOINTS.orders}/:id/track`,
    RATE: `${ENV.ENDPOINTS.orders}/:id/rate`,
  },

  // Categories
  CATEGORIES: {
    LIST: ENV.ENDPOINTS.categories,
    DETAIL: `${ENV.ENDPOINTS.categories}/:id`,
    PRODUCTS: `${ENV.ENDPOINTS.categories}/:id/products`,
  },

  // Stores
  STORES: {
    LIST: ENV.ENDPOINTS.stores,
    DETAIL: `${ENV.ENDPOINTS.stores}/:id`,
    PRODUCTS: `${ENV.ENDPOINTS.stores}/:id/products`,
    NEARBY: `${ENV.ENDPOINTS.stores}/nearby`,
  },

  // Videos
  VIDEOS: {
    LIST: ENV.ENDPOINTS.videos,
    DETAIL: `${ENV.ENDPOINTS.videos}/:id`,
    TRENDING: `${ENV.ENDPOINTS.videos}/trending`,
    UPLOAD: `${ENV.ENDPOINTS.videos}/upload`,
    LIKE: `${ENV.ENDPOINTS.videos}/:id/like`,
    COMMENT: `${ENV.ENDPOINTS.videos}/:id/comments`,
  },

  // Projects
  PROJECTS: {
    LIST: ENV.ENDPOINTS.projects,
    DETAIL: `${ENV.ENDPOINTS.projects}/:id`,
    APPLY: `${ENV.ENDPOINTS.projects}/:id/apply`,
    SUBMIT: `${ENV.ENDPOINTS.projects}/:id/submit`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: ENV.ENDPOINTS.notifications,
    MARK_READ: `${ENV.ENDPOINTS.notifications}/:id/read`,
    MARK_ALL_READ: `${ENV.ENDPOINTS.notifications}/read-all`,
  },

  // Reviews
  REVIEWS: {
    LIST: `${ENV.ENDPOINTS.reviews}/:targetType/:targetId`,
    CREATE: ENV.ENDPOINTS.reviews,
    HELPFUL: `${ENV.ENDPOINTS.reviews}/:id/helpful`,
    REPLY: `${ENV.ENDPOINTS.reviews}/:id/reply`,
  },

  // Wishlist
  WISHLIST: {
    LIST: ENV.ENDPOINTS.wishlist,
    ADD: ENV.ENDPOINTS.wishlist,
    REMOVE: `${ENV.ENDPOINTS.wishlist}/:wishlistId/items/:itemId`,
    CREATE: ENV.ENDPOINTS.wishlist,
  },
} as const;

export default apiClient;