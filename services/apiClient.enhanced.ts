// API Client (Enhanced with Retry Logic)
// Base client for all backend API communications with automatic retry and error handling

import { parseConnectionError, formatConnectionError, isConnectionError } from '@/utils/connectionUtils';
import { retryWithExponentialBackoff, isRetryableError as isRetryable } from '@/utils/retryLogic';
import { handleNetworkError } from '@/utils/networkErrorHandler';
import { errorReporter } from '@/utils/errorReporter';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: { [key: string]: string[] };
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retryOptions?: {
    maxRetries?: number;
    baseDelay?: number;
    shouldRetry?: boolean;
  };
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;
  private refreshTokenCallback: (() => Promise<boolean>) | null = null;
  private logoutCallback: (() => void) | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;

  // Default retry configuration
  private defaultRetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    shouldRetry: true,
  };

  constructor() {
    // Use environment variable or fallback to user backend localhost
    this.baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add interceptor-like logging
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  // Setup request interceptor (logging)
  private setupRequestInterceptor() {
    // This is called before each request in makeRequest
  }

  // Setup response interceptor (error handling)
  private setupResponseInterceptor() {
    // This is called after each request in makeRequest
  }

  // Set authentication token
  setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  // Get current auth token
  getAuthToken(): string | null {
    return this.authToken;
  }

  // Set refresh token callback
  setRefreshTokenCallback(callback: (() => Promise<boolean>) | null) {
    this.refreshTokenCallback = callback;
  }

  // Set logout callback
  setLogoutCallback(callback: (() => void) | null) {
    this.logoutCallback = callback;
  }

  // Handle token refresh
  private async handleTokenRefresh(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.refreshTokenCallback) {
      console.warn('⚠️ [API CLIENT] No refresh token callback set');
      return false;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.refreshTokenCallback();

    try {
      const success = await this.refreshPromise;
      return success;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  // Handle HTTP errors with status codes
  private async handleHttpError<T>(response: Response, responseData: any, endpoint: string): Promise<ApiResponse<T>> {
    const status = response.status;
    const errorMessage = responseData.message || response.statusText;

    console.error('❌ [API CLIENT] Request failed (non-200 status)');
    console.error('Error message:', errorMessage);
    console.error('Status code:', status);

    // Add error tracking breadcrumb
    errorReporter.addBreadcrumb({
      type: 'network',
      message: `HTTP ${status} error on ${endpoint}`,
      data: {
        status,
        endpoint,
        error: errorMessage,
      },
    });

    // Handle 401 Unauthorized - try to refresh token
    if (status === 401 && this.authToken) {
      const errorMessageLower = errorMessage?.toLowerCase() || '';
      const isTokenExpired = errorMessageLower.includes('expired') || errorMessageLower.includes('invalid') || errorMessageLower.includes('jwt') || errorMessageLower.includes('token');

      console.log('⚠️ [API CLIENT] 401 Unauthorized detected', {
        hasToken: !!this.authToken,
        errorMessage: errorMessage,
        isTokenExpired,
        hasRefreshCallback: !!this.refreshTokenCallback,
      });

      if (isTokenExpired && this.refreshTokenCallback) {
        console.log('🔄 [API CLIENT] Attempting token refresh...');

        const refreshSuccess = await this.handleTokenRefresh();
        if (refreshSuccess) {
          console.log('✅ [API CLIENT] Token refreshed successfully, will retry on next call');
          // Don't retry here - let the calling code retry
        } else {
          console.error('❌ [API CLIENT] Token refresh failed');
          if (this.logoutCallback) {
            console.log('🚪 [API CLIENT] Triggering logout callback (refresh failed)');
            this.logoutCallback();
          }
        }
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      errorReporter.captureError(
        new Error(`Forbidden: ${errorMessage}`),
        {
          context: 'ApiClient.handleHttpError',
          metadata: { status, endpoint },
        },
        'warning'
      );
    }

    // Handle 404 Not Found
    if (status === 404) {
      errorReporter.addBreadcrumb({
        type: 'network',
        message: `Resource not found: ${endpoint}`,
        data: { status, endpoint },
      });
    }

    // Handle 429 Rate Limit
    if (status === 429) {
      errorReporter.captureError(
        new Error(`Rate limit exceeded on ${endpoint}`),
        {
          context: 'ApiClient.handleHttpError',
          metadata: { status, endpoint },
        },
        'warning'
      );
    }

    // Handle 500+ Server Errors
    if (status >= 500) {
      errorReporter.captureError(
        new Error(`Server error on ${endpoint}: ${errorMessage}`),
        {
          context: 'ApiClient.handleHttpError',
          metadata: { status, endpoint, error: errorMessage },
        },
        'error'
      );
    }

    return {
      success: false,
      error: errorMessage || `HTTP ${status}: ${response.statusText}`,
      errors: responseData.errors
    };
  }

  // Make HTTP request with retry logic
  private async makeRequestWithRetry<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const retryConfig = {
      ...this.defaultRetryConfig,
      ...options.retryOptions,
    };

    // Don't retry if explicitly disabled
    if (retryConfig.shouldRetry === false) {
      return this.makeRequest<T>(endpoint, options);
    }

    try {
      return await retryWithExponentialBackoff(
        () => this.makeRequest<T>(endpoint, options),
        {
          maxRetries: retryConfig.maxRetries,
          baseDelay: retryConfig.baseDelay,
          shouldRetry: (error) => {
            // Don't retry on client errors (4xx except 429)
            if (error?.response?.status >= 400 && error?.response?.status < 500) {
              return error?.response?.status === 429; // Only retry on rate limit
            }
            // Retry on network errors, timeouts, and server errors
            return isRetryable(error);
          },
          onRetry: (error, attempt, delay) => {
            console.log(`🔄 [API CLIENT] Retrying ${endpoint} (attempt ${attempt}/${retryConfig.maxRetries}) after ${delay}ms`);

            // Add breadcrumb for retry
            errorReporter.addBreadcrumb({
              type: 'network',
              message: `Retrying request to ${endpoint}`,
              data: {
                attempt,
                maxRetries: retryConfig.maxRetries,
                delay,
                error: error instanceof Error ? error.message : String(error),
              },
            });
          },
        }
      );
    } catch (error) {
      // Handle and classify the error
      const errorInfo = handleNetworkError(error);

      return {
        success: false,
        error: errorInfo.userMessage,
      };
    }
  }

  // Make HTTP request (core implementation)
  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 30000
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    console.log('\n┌─────────────────────────────────────────┐');
    console.log('│        API CLIENT REQUEST               │');
    console.log('└─────────────────────────────────────────┘');
    console.log('🌐 URL:', url);
    console.log('📤 Method:', method);
    console.log('📋 Headers:', JSON.stringify(requestHeaders, null, 2));
    console.log('📦 Body:', body ? JSON.stringify(body, null, 2) : 'none');
    console.log('⏱️  Timeout:', timeout + 'ms');
    console.log('─────────────────────────────────────────');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const config: RequestInit = {
        method,
        headers: requestHeaders,
        signal: controller.signal,
      };

      // Add body for non-GET requests
      if (body && method !== 'GET') {
        if (body instanceof FormData) {
          // Remove Content-Type for FormData (let browser set it)
          delete requestHeaders['Content-Type'];
          config.body = body;
        } else {
          config.body = JSON.stringify(body);
        }
      }

      console.log('🚀 [API CLIENT] Sending request...');
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      console.log('\n📥 [API CLIENT] Response received:');
      console.log('Status:', response.status, response.statusText);
      console.log('OK:', response.ok);

      const responseData = await response.json();
      console.log('Response Data:', JSON.stringify(responseData, null, 2));

      if (!response.ok) {
        return this.handleHttpError<T>(response, responseData, endpoint);
      }

      console.log('✅ [API CLIENT] Request successful');
      console.log('└─────────────────────────────────────────┘\n');

      return {
        success: true,
        data: responseData.data || responseData,
        message: responseData.message
      };

    } catch (error) {
      console.error('\n❌❌❌ [API CLIENT] REQUEST EXCEPTION ❌❌❌');
      console.error('URL:', url);
      console.error('Method:', method);
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown');

      // Parse connection error for better diagnostics
      if (isConnectionError(error)) {
        const connectionError = parseConnectionError(error);
        console.error('\n📋 [API CLIENT] Connection Error Details:');
        console.error('Type:', connectionError.type);
        console.error('Message:', connectionError.message);
        console.error('Suggestions:');
        connectionError.suggestions.forEach((suggestion, index) => {
          console.error(`  ${index + 1}. ${suggestion}`);
        });
      }

      console.error('└─────────────────────────────────────────┘\n');

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout - Backend server may be slow or unresponsive'
          };
        }

        // Provide better error messages for connection issues
        if (isConnectionError(error)) {
          const connectionError = parseConnectionError(error);
          return {
            success: false,
            error: `${connectionError.message}. ${connectionError.suggestions[0] || ''}`
          };
        }

        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: false,
        error: 'Unknown error occurred'
      };
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>, retryOptions?: RequestOptions['retryOptions']): Promise<ApiResponse<T>> {
    let url = endpoint;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          searchParams.append(key, String(params[key]));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    return this.makeRequestWithRetry<T>(url, { method: 'GET', retryOptions });
  }

  // POST request
  async post<T>(endpoint: string, data?: any, retryOptions?: RequestOptions['retryOptions']): Promise<ApiResponse<T>> {
    return this.makeRequestWithRetry<T>(endpoint, {
      method: 'POST',
      body: data,
      retryOptions
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any, retryOptions?: RequestOptions['retryOptions']): Promise<ApiResponse<T>> {
    return this.makeRequestWithRetry<T>(endpoint, {
      method: 'PUT',
      body: data,
      retryOptions
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any, retryOptions?: RequestOptions['retryOptions']): Promise<ApiResponse<T>> {
    return this.makeRequestWithRetry<T>(endpoint, {
      method: 'PATCH',
      body: data,
      retryOptions
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, data?: any, retryOptions?: RequestOptions['retryOptions']): Promise<ApiResponse<T>> {
    return this.makeRequestWithRetry<T>(endpoint, {
      method: 'DELETE',
      body: data,
      retryOptions
    });
  }

  // Upload file (no auto-retry by default for uploads)
  async uploadFile<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      const data = await response.json();

      return {
        success: response.ok,
        data,
        error: response.ok ? undefined : data.error
      };
    } catch (error) {
      return {
        success: false,
        error: 'Cannot connect to server'
      };
    }
  }

  // Set base URL (useful for testing or different environments)
  setBaseURL(url: string) {
    this.baseURL = url;
  }

  // Get base URL
  getBaseURL(): string {
    return this.baseURL;
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
export type { ApiResponse, RequestOptions };
