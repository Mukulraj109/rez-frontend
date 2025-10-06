// API Client
// Base client for all backend API communications

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
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;

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
      console.log('Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

      const responseData = await response.json();
      console.log('Response Data:', JSON.stringify(responseData, null, 2));

      if (!response.ok) {
        console.error('❌ [API CLIENT] Request failed (non-200 status)');
        console.error('Error message:', responseData.message || response.statusText);
        console.error('Status code:', response.status);
        console.error('Response:', responseData);

        return {
          success: false,
          error: responseData.message || `HTTP ${response.status}: ${response.statusText}`,
          errors: responseData.errors
        };
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
      console.error('Full error:', error);
      console.error('└─────────────────────────────────────────┘\n');

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout'
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
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
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

    return this.makeRequest<T>(url, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
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
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
export type { ApiResponse, RequestOptions };