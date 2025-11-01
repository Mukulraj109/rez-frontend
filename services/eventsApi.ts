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
   */
  async isBackendAvailable(): Promise<boolean> {
    const now = Date.now();

    // Use cached result if recent
    if (this.backendAvailable !== null && 
        (now - this.lastBackendCheck) < this.BACKEND_CHECK_INTERVAL) {
      return this.backendAvailable;
    }

    try {
      const response = await fetch(`${this.baseUrl}/events/featured?limit=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.backendAvailable = response.ok;
      this.lastBackendCheck = now;
      
      if (this.backendAvailable) {
        console.log('✅ Events API is available');
      } else {
        console.log('⚠️ Events API is not available');
      }

      return this.backendAvailable;
    } catch (error) {
      console.warn('❌ Events API availability check failed:', error);
      this.backendAvailable = false;
      this.lastBackendCheck = now;
      return false;
    }
  }

  /**
   * Get all events with filters
   */
  async getEvents(filters: EventFilters = {}, limit = 20, offset = 0): Promise<EventSearchResult> {
    try {
      const isAvailable = await this.isBackendAvailable();
      if (!isAvailable) {
        throw new Error('Backend not available');
      }

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
      const isAvailable = await this.isBackendAvailable();
      if (!isAvailable) {
        throw new Error('Backend not available');
      }

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
      const isAvailable = await this.isBackendAvailable();
      if (!isAvailable) {
        throw new Error('Backend not available');
      }

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
      const isAvailable = await this.isBackendAvailable();
      if (!isAvailable) {
        throw new Error('Backend not available');
      }

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
      const isAvailable = await this.isBackendAvailable();
      if (!isAvailable) {
        throw new Error('Backend not available');
      }

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
      const isAvailable = await this.isBackendAvailable();
      if (!isAvailable) {
        throw new Error('Backend not available');
      }

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
        booking: data.data,
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
   * Get user's event bookings
   */
  async getUserBookings(status?: string, limit = 20, offset = 0): Promise<{ bookings: UserBooking[], total: number, hasMore: boolean }> {
    try {
      const isAvailable = await this.isBackendAvailable();
      if (!isAvailable) {
        throw new Error('Backend not available');
      }

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
   * Cancel event booking
   */
  async cancelBooking(bookingId: string): Promise<{ success: boolean, message: string }> {
    try {
      const isAvailable = await this.isBackendAvailable();
      if (!isAvailable) {
        throw new Error('Backend not available');
      }

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
      const isAvailable = await this.isBackendAvailable();
      if (!isAvailable) {
        throw new Error('Backend not available');
      }

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
      const isAvailable = await this.isBackendAvailable();
      if (!isAvailable) {
        throw new Error('Backend not available');
      }

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
   * Get authentication token (implement based on your auth system)
   */
  private async getAuthToken(): Promise<string | null> {
    // This should be implemented based on your authentication system
    // For now, return null to indicate no auth
    return null;
  }

  /**
   * Force refresh backend availability check
   */
  async refreshBackendStatus(): Promise<boolean> {
    this.backendAvailable = null;
    this.lastBackendCheck = 0;
    return await this.isBackendAvailable();
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

