import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface ApiConfig {
  baseURL: string;
  timeout: number;
  defaultHeaders: Record<string, string>;
}

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Configuration
const config: ApiConfig = {
  baseURL: __DEV__ ? 'http://localhost:3000/api' : 'https://api.rezapp.com',
  timeout: 10000, // 10 seconds
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
};

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;

  constructor(config: ApiConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.defaultHeaders = config.defaultHeaders;
    this.loadAuthToken();
  }

  // Load auth token from storage
  private async loadAuthToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      this.authToken = token;
    } catch (error) {
      console.error('Failed to load auth token:', error);
    }
  }

  // Set auth token
  public async setAuthToken(token: string | null): Promise<void> {
    this.authToken = token;
    try {
      if (token) {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
    } catch (error) {
      console.error('Failed to save auth token:', error);
    }
  }

  // Get auth headers
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  // Create request with timeout
  private createRequestWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    return Promise.race([
      fetch(url, options),
      new Promise<Response>((_, reject) =>
        setTimeout(
          () => reject(new Error('Request timeout')),
          this.timeout
        )
      ),
    ]);
  }

  // Handle API response
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let data: any;
    
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
    } catch (error) {
      throw new ApiError({
        message: 'Invalid JSON response',
        status: response.status,
        code: 'INVALID_JSON',
      });
    }

    if (!response.ok) {
      throw new ApiError({
        message: data?.message || `HTTP ${response.status}`,
        status: response.status,
        code: data?.code || 'HTTP_ERROR',
        details: data?.details,
      });
    }

    return {
      data: data?.data || data,
      message: data?.message,
      status: response.status,
      success: true,
    };
  }

  // Make API request
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      ...this.defaultHeaders,
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const requestOptions: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await this.createRequestWithTimeout(url, requestOptions);
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError({
        message: error instanceof Error ? error.message : 'Network error',
        status: 0,
        code: 'NETWORK_ERROR',
      });
    }
  }

  // HTTP Methods
  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    return this.request<T>(url, { method: 'GET' });
  }

  public async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Upload file
  public async upload<T>(
    endpoint: string,
    file: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      ...this.getAuthHeaders(),
      // Don't set Content-Type for FormData, let browser set it with boundary
    };

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        try {
          const response = new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
          });
          const result = await this.handleResponse<T>(response);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      xhr.addEventListener('error', () => {
        reject(new ApiError({
          message: 'Upload failed',
          status: 0,
          code: 'UPLOAD_ERROR',
        }));
      });

      xhr.addEventListener('timeout', () => {
        reject(new ApiError({
          message: 'Upload timeout',
          status: 0,
          code: 'UPLOAD_TIMEOUT',
        }));
      });

      xhr.open('POST', url);
      xhr.timeout = this.timeout;

      // Set headers
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(file);
    });
  }

  // Refresh auth token
  public async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.post<{ token: string; refreshToken: string }>('/auth/refresh', {
        refreshToken,
      });

      await this.setAuthToken(response.data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);

      return response.data.token;
    } catch (error) {
      // Clear tokens on refresh failure
      await this.setAuthToken(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      throw error;
    }
  }

  // Clear auth
  public async clearAuth(): Promise<void> {
    await this.setAuthToken(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }
}

// Custom error class
class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: any;

  constructor(error: { message: string; status: number; code?: string; details?: any }) {
    super(error.message);
    this.name = 'ApiError';
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient(config);
export { ApiError };
export type { ApiResponse, ApiConfig };