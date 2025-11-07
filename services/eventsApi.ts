import { EventItem } from '@/types/homepage.types';

export interface EventFilters {
  category?: string;
  location?: string;
  date?: string;
  priceMin?: number;
  priceMax?: number;
  isOnline?: boolean;
  featured?: boolean;
  upcoming?: boolean;
  search?: string;
}

export interface EventSearchResult {
  events: EventItem[];
  total: number;
  hasMore: boolean;
  suggestions?: string[];
}

export interface BookingRequest {
  slotId?: string;
  attendeeInfo: {
    name: string;
    email: string;
    phone?: string;
    age?: number;
    specialRequirements?: string;
  };
}

export interface BookingResult {
  success: boolean;
  booking?: any;
  payment?: {
    paymentIntentId?: string;
    clientSecret?: string;
    sessionId?: string;
  } | null;
  message: string;
  error?: string;
}

export interface UserBooking {
  _id: string;
  eventId: any;
  slotId?: string;
  bookingDate: string;
  status: string;
  amount: number;
  currency: string;
  attendeeInfo: any;
  bookingReference: string;
  createdAt: string;
}

class EventsApiService {
  private baseUrl: string;
  private backendAvailable: boolean | null = null;
  private lastBackendCheck: number = 0;
  private BACKEND_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Use environment variable or default to localhost
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';
  }

  /**
   * Check if backend is available
   * Only cache successful checks, not failures
   */
  async isBackendAvailable(): Promise<boolean> {
    const now = Date.now();

    // Use cached result if recent AND it was successful
    // Don't cache failures - always retry if last check failed
    if (this.backendAvailable === true && 
        (now - this.lastBackendCheck) < this.BACKEND_CHECK_INTERVAL) {
      return true;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    
    try {
      // Try a simple health check endpoint or the events endpoint
      // Use a timeout to prevent hanging (5 seconds)
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.baseUrl}/events?limit=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const isAvailable = response.ok;
      
      // Only cache successful checks
      if (isAvailable) {
        this.backendAvailable = true;
        this.lastBackendCheck = now;
        console.log('✅ Events API is available');
      } else {
        // Don't cache failures - allow retry on next request
        console.log('⚠️ Events API returned non-OK status:', response.status);
      }

      return isAvailable;
    } catch (error) {
      // Clear timeout if it was set
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Don't cache failures - allow retry on next request
      console.warn('❌ Events API availability check failed:', error);
      this.backendAvailable = null; // Reset to null so we retry
      return false;
    }
  }

  /**
   * Get all events with filters
   */
  async getEvents(filters: EventFilters = {}, limit = 20, offset = 0): Promise<EventSearchResult> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      queryParams.append('limit', limit.toString());
      queryParams.append('offset', offset.toString());

      const response = await fetch(`${this.baseUrl}/events?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Transform backend events to frontend format
        const events = data.data.events.map(this.transformEventToFrontend);
        
        return {
          events,
          total: data.data.total,
          hasMore: data.data.hasMore,
          suggestions: data.data.suggestions
        };
      } else {
        throw new Error(data.message || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(id: string): Promise<EventItem | null> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return this.transformEventToFrontend(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch event');
      }
    } catch (error) {
      console.error('❌ Error fetching event:', error);
      throw error;
    }
  }

  /**
   * Get events by category
   */
  async getEventsByCategory(category: string, limit = 20, offset = 0): Promise<EventSearchResult> {
    try {

      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit.toString());
      queryParams.append('offset', offset.toString());

      const response = await fetch(`${this.baseUrl}/events/category/${encodeURIComponent(category)}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const events = data.data.events.map(this.transformEventToFrontend);
        
        return {
          events,
          total: data.data.total,
          hasMore: data.data.hasMore
        };
      } else {
        throw new Error(data.message || 'Failed to fetch events by category');
      }
    } catch (error) {
      console.error('❌ Error fetching events by category:', error);
      throw error;
    }
  }

  /**
   * Search events
   */
  async searchEvents(query: string, filters: EventFilters = {}, limit = 20, offset = 0): Promise<EventSearchResult> {
    try {

      const queryParams = new URLSearchParams();
      queryParams.append('q', query);
      
      // Add additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      queryParams.append('limit', limit.toString());
      queryParams.append('offset', offset.toString());

      const response = await fetch(`${this.baseUrl}/events/search?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const events = data.data.events.map(this.transformEventToFrontend);
        
        return {
          events,
          total: data.data.total,
          hasMore: data.data.hasMore,
          suggestions: data.data.suggestions
        };
      } else {
        throw new Error(data.message || 'Failed to search events');
      }
    } catch (error) {
      console.error('❌ Error searching events:', error);
      throw error;
    }
  }

  /**
   * Get featured events for homepage
   */
  async getFeaturedEvents(limit = 10): Promise<EventItem[]> {
    try {

      const response = await fetch(`${this.baseUrl}/events/featured?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data.map(this.transformEventToFrontend);
      } else {
        throw new Error(data.message || 'Failed to fetch featured events');
      }
    } catch (error) {
      console.error('❌ Error fetching featured events:', error);
      throw error;
    }
  }

  /**
   * Book event slot
   */
  async bookEventSlot(eventId: string, bookingData: BookingRequest): Promise<BookingResult> {
    try {

      // Get auth token from storage (you'll need to implement this)
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.baseUrl}/events/${eventId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to book event');
      }

      const data = await response.json();
      
      return {
        success: data.success,
        booking: data.data?.booking || data.data, // Handle both old and new response format
        payment: data.data?.payment || null, // Payment data from backend
        message: data.message
      };
    } catch (error) {
      console.error('❌ Error booking event:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to book event'
      };
    }
  }

  /**
   * Get related events (similar events based on category, location, or date)
   */
  async getRelatedEvents(eventId: string, limit = 6): Promise<EventItem[]> {
    try {

      const response = await fetch(`${this.baseUrl}/events/${eventId}/related?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If endpoint doesn't exist yet, fall back to same category
        if (response.status === 404) {
          console.warn('⚠️ [RELATED EVENTS] Related events endpoint not found, using category fallback');
          // Get event first to find category
          const event = await this.getEventById(eventId);
          if (event) {
            return this.getEventsByCategory(event.category, limit, 0).then(result => result.events.filter(e => e.id !== eventId));
          }
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return Array.isArray(data.data) 
          ? data.data.map(this.transformEventToFrontend)
          : (data.data.events || []).map(this.transformEventToFrontend);
      } else {
        // Fallback to category-based events
        const event = await this.getEventById(eventId);
        if (event) {
          return this.getEventsByCategory(event.category, limit, 0).then(result => result.events.filter(e => e.id !== eventId));
        }
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching related events:', error);
      // Fallback to category-based events
      try {
        const event = await this.getEventById(eventId);
        if (event) {
          return this.getEventsByCategory(event.category, limit, 0).then(result => result.events.filter(e => e.id !== eventId));
        }
      } catch (fallbackError) {
        console.error('❌ Error in related events fallback:', fallbackError);
      }
      return [];
    }
  }

  /**
   * Get user's event bookings
   */
  async getUserBookings(status?: string, limit = 20, offset = 0): Promise<{ bookings: UserBooking[], total: number, hasMore: boolean }> {
    try {

      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);
      queryParams.append('limit', limit.toString());
      queryParams.append('offset', offset.toString());

      const response = await fetch(`${this.baseUrl}/events/my-bookings?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          bookings: data.data.bookings,
          total: data.data.total,
          hasMore: data.data.hasMore
        };
      } else {
        throw new Error(data.message || 'Failed to fetch user bookings');
      }
    } catch (error) {
      console.error('❌ Error fetching user bookings:', error);
      throw error;
    }
  }

  /**
   * Confirm booking after payment
   */
  async confirmBooking(bookingId: string, paymentIntentId?: string): Promise<{ success: boolean, message: string }> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.baseUrl}/events/bookings/${bookingId}/confirm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentIntentId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to confirm booking');
      }

      const data = await response.json();
      
      return {
        success: data.success,
        message: data.message || 'Booking confirmed successfully'
      };
    } catch (error) {
      console.error('❌ Error confirming booking:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to confirm booking'
      };
    }
  }

  /**
   * Cancel event booking
   */
  async cancelBooking(bookingId: string): Promise<{ success: boolean, message: string }> {
    try {

      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.baseUrl}/events/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel booking');
      }

      const data = await response.json();
      
      return {
        success: data.success,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel booking'
      };
    }
  }

  /**
   * Toggle event favorite
   */
  async toggleEventFavorite(eventId: string): Promise<{ success: boolean, message: string }> {
    try {

      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.baseUrl}/events/${eventId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle favorite');
      }

      const data = await response.json();
      
      return {
        success: data.success,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to toggle favorite'
      };
    }
  }

  /**
   * Share event
   */
  async shareEvent(eventId: string): Promise<{ success: boolean, message: string }> {
    try {

      const response = await fetch(`${this.baseUrl}/events/${eventId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to share event');
      }

      const data = await response.json();
      
      return {
        success: data.success,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Error sharing event:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to share event'
      };
    }
  }

  /**
   * Transform backend event to frontend format
   */
  private transformEventToFrontend = (backendEvent: any): EventItem => {
    return {
      id: backendEvent._id,
      type: 'event',
      title: backendEvent.title,
      subtitle: backendEvent.subtitle || `${backendEvent.price.isFree ? 'Free' : `${backendEvent.price.currency}${backendEvent.price.amount}`} • ${backendEvent.isOnline ? 'Online' : 'Venue'}`,
      description: backendEvent.description,
      image: backendEvent.image,
      price: {
        amount: backendEvent.price.amount,
        currency: backendEvent.price.currency,
        isFree: backendEvent.price.isFree
      },
      location: backendEvent.isOnline ? 'Online' : backendEvent.location.name,
      date: backendEvent.date.split('T')[0], // Convert to YYYY-MM-DD format
      time: backendEvent.time,
      category: backendEvent.category,
      organizer: backendEvent.organizer.name,
      isOnline: backendEvent.isOnline,
      registrationRequired: backendEvent.registrationRequired,
      bookingUrl: backendEvent.bookingUrl,
      availableSlots: backendEvent.availableSlots
    };
  };

  /**
   * Get authentication token from auth storage
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      // Use authStorage utility which handles both web (localStorage) and native (AsyncStorage)
      const { getAuthToken } = await import('@/utils/authStorage');
      const token = await getAuthToken();
      return token;
    } catch (error) {
      console.error('❌ [EVENTS API] Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Force refresh backend availability check
   */
  async refreshBackendStatus(): Promise<boolean> {
    // Availability check removed - always return true
    // The actual fetch requests will handle errors
    return true;
  }

  /**
   * Get current backend status
   */
  getBackendStatus(): {
    available: boolean | null;
    lastChecked: Date | null;
    nextCheck: Date | null;
  } {
    return {
      available: this.backendAvailable,
      lastChecked: this.lastBackendCheck > 0 ? new Date(this.lastBackendCheck) : null,
      nextCheck: this.lastBackendCheck > 0
        ? new Date(this.lastBackendCheck + this.BACKEND_CHECK_INTERVAL)
        : null
    };
  }
}

// Create singleton instance
const eventsApiService = new EventsApiService();

export default eventsApiService;
export { EventsApiService };

