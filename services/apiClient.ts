// API Client
// Base client for all backend API communications

import { parseConnectionError, formatConnectionError, isConnectionError } from '@/utils/connectionUtils';
import { globalDeduplicator, createRequestKey } from '@/utils/requestDeduplicator';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: { [key: string]: string[] };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    timestamp?: string;
    [key: string]: any;
  };
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  deduplicate?: boolean; // Enable/disable deduplication per-request
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;
  private refreshTokenCallback: (() => Promise<boolean>) | null = null;
  private logoutCallback: (() => void) | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    // Use environment variable or fallback to user backend localhost
    this.baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
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
      return false;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.refreshTokenCallback();

    try {
      const success = await this.refreshPromise;
      return success;
    } catch (error) {
      return false;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  // Make HTTP request
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

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (!response.ok) {
        console.error(`[API] ${method} ${endpoint} failed:`, response.status, responseData.message || response.statusText);

        // Handle 401 Unauthorized - try to refresh token
        if (response.status === 401 && this.authToken) {
          // Check if the error is due to expired token
          const errorMessage = responseData.message?.toLowerCase() || '';
          const isTokenExpired = errorMessage.includes('expired') || errorMessage.includes('invalid') || errorMessage.includes('jwt') || errorMessage.includes('token');

          // Only try to refresh if we have a refresh callback and token appears expired
          if (isTokenExpired && this.refreshTokenCallback) {
            const refreshSuccess = await this.handleTokenRefresh();
            if (refreshSuccess) {
              // Retry the original request with new token
              return this.makeRequest<T>(endpoint, options);
            } else {
              // Only logout if refresh explicitly failed
              if (this.logoutCallback) {
                this.logoutCallback();
              }
            }
          }
        }

        return {
          success: false,
          error: responseData.message || `HTTP ${response.status}: ${response.statusText}`,
          errors: responseData.errors
        };
      }

      return {
        success: true,
        data: responseData.data || responseData,
        message: responseData.message,
        meta: responseData.meta // Preserve meta field for pagination info
      };

    } catch (error) {
      console.error(`[API] ${method} ${endpoint} error:`, error instanceof Error ? error.message : 'Unknown');

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

  // GET request (with automatic deduplication)
  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    options?: { deduplicate?: boolean }
  ): Promise<ApiResponse<T>> {
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

    // Deduplicate GET requests by default (can be disabled per-request)
    const shouldDeduplicate = options?.deduplicate !== false;

    if (shouldDeduplicate) {
      const requestKey = createRequestKey(`${this.baseURL}${url}`, params);

      return globalDeduplicator.dedupe(
        requestKey,
        () => this.makeRequest<T>(url, { method: 'GET' })
      );
    }

    return this.makeRequest<T>(url, { method: 'GET' });
  }

  // POST request (optional deduplication)
  async post<T>(
    endpoint: string,
    data?: any,
    options?: { deduplicate?: boolean }
  ): Promise<ApiResponse<T>> {
    // POST requests are NOT deduplicated by default (usually mutating)
    const shouldDeduplicate = options?.deduplicate === true;

    if (shouldDeduplicate) {
      const requestKey = createRequestKey(`POST:${this.baseURL}${endpoint}`, data);

      return globalDeduplicator.dedupe(
        requestKey,
        () => this.makeRequest<T>(endpoint, { method: 'POST', body: data })
      );
    }

    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data
    });
  }

  // PUT request (optional deduplication)
  async put<T>(
    endpoint: string,
    data?: any,
    options?: { deduplicate?: boolean }
  ): Promise<ApiResponse<T>> {
    // PUT requests are NOT deduplicated by default (usually mutating)
    const shouldDeduplicate = options?.deduplicate === true;

    if (shouldDeduplicate) {
      const requestKey = createRequestKey(`PUT:${this.baseURL}${endpoint}`, data);

      return globalDeduplicator.dedupe(
        requestKey,
        () => this.makeRequest<T>(endpoint, { method: 'PUT', body: data })
      );
    }

    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data
    });
  }

  // PATCH request (optional deduplication)
  async patch<T>(
    endpoint: string,
    data?: any,
    options?: { deduplicate?: boolean }
  ): Promise<ApiResponse<T>> {
    // PATCH requests are NOT deduplicated by default (usually mutating)
    const shouldDeduplicate = options?.deduplicate === true;

    if (shouldDeduplicate) {
      const requestKey = createRequestKey(`PATCH:${this.baseURL}${endpoint}`, data);

      return globalDeduplicator.dedupe(
        requestKey,
        () => this.makeRequest<T>(endpoint, { method: 'PATCH', body: data })
      );
    }

    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data
    });
  }

  // DELETE request (optional deduplication)
  async delete<T>(
    endpoint: string,
    data?: any,
    options?: { deduplicate?: boolean }
  ): Promise<ApiResponse<T>> {
    // DELETE requests are NOT deduplicated by default (usually mutating)
    const shouldDeduplicate = options?.deduplicate === true;

    if (shouldDeduplicate) {
      const requestKey = createRequestKey(`DELETE:${this.baseURL}${endpoint}`, data);

      return globalDeduplicator.dedupe(
        requestKey,
        () => this.makeRequest<T>(endpoint, { method: 'DELETE', body: data })
      );
    }

    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
      body: data
    });
  }

  // Upload file
  async uploadFile<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: formData
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

  // Get deduplication statistics
  getDeduplicationStats() {
    return globalDeduplicator.getStats();
  }

  // Print deduplication statistics
  printDeduplicationStats() {
    globalDeduplicator.printStats();
  }

  // Cancel all in-flight requests
  cancelAllRequests() {
    globalDeduplicator.cancelAll();
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
export type { ApiResponse, RequestOptions };