import apiClient from '@/services/apiClient';

// TypeScript Interfaces
interface EmergencyContact {
  _id: string;
  name: string;
  type: 'ambulance' | 'hospital' | 'blood_bank' | 'fire' | 'police' | 'poison_control' | 'mental_health' | 'women_helpline' | 'child_helpline' | 'disaster' | 'covid' | 'other';
  phoneNumbers: string[];
  tollFree?: string;
  isNational: boolean;
  city?: string;
  state?: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  operatingHours: string;
  description?: string;
  icon?: string;
  priority: number;
  isActive: boolean;
  isVerified: boolean;
  services?: string[];
  website?: string;
  email?: string;
  distance?: number; // Added for nearby queries
}

interface EmergencyContactsResponse {
  contacts: EmergencyContact[];
  groupedContacts: Record<string, EmergencyContact[]>;
  total: number;
}

interface NearbyContactsResponse {
  nearbyContacts: EmergencyContact[];
  nationalContacts: EmergencyContact[];
  searchLocation: {
    latitude: number;
    longitude: number;
  };
  searchRadius: number;
}

interface AssignedUnit {
  name: string;
  phone: string;
  vehicleNumber?: string;
  driverName?: string;
}

interface EmergencyBooking {
  _id: string;
  bookingNumber: string;
  userId: string;
  serviceType: 'ambulance' | 'doctor_visit' | 'hospital_admission';
  emergencyType: 'accident' | 'cardiac' | 'respiratory' | 'pregnancy' | 'injury' | 'other';
  status: 'pending' | 'confirmed' | 'dispatched' | 'en_route' | 'arrived' | 'completed' | 'cancelled';
  patientName: string;
  patientAge?: number;
  patientPhone: string;
  patientCondition?: string;
  pickupAddress: {
    address: string;
    landmark?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  destinationAddress?: {
    address: string;
    hospitalName?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  assignedUnit?: AssignedUnit;
  estimatedArrival?: string;
  actualArrival?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateEmergencyBookingRequest {
  serviceType: EmergencyBooking['serviceType'];
  emergencyType: EmergencyBooking['emergencyType'];
  patientName: string;
  patientAge?: number;
  patientPhone: string;
  patientCondition?: string;
  pickupAddress: {
    address: string;
    landmark?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  destinationAddress?: {
    address: string;
    hospitalName?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  notes?: string;
}

interface EmergencyBookingsResponse {
  bookings: EmergencyBooking[];
  total: number;
  hasMore: boolean;
  limit: number;
  offset: number;
  activeBooking: EmergencyBooking | null;
}

interface ActiveBookingResponse {
  hasActiveBooking: boolean;
  activeBooking: EmergencyBooking | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Emergency API Service
const emergencyApi = {
  /**
   * Get all emergency contacts
   * @param filters - Optional filters (type, city, state, isNational)
   * @returns Promise with API response containing emergency contacts
   */
  getContacts: async (filters?: {
    type?: string;
    city?: string;
    state?: string;
    isNational?: boolean;
  }): Promise<ApiResponse<EmergencyContactsResponse>> => {
    try {
      console.log('[emergencyApi] Fetching emergency contacts with filters:', filters);

      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.city) params.append('city', filters.city);
      if (filters?.state) params.append('state', filters.state);
      if (typeof filters?.isNational === 'boolean') params.append('isNational', String(filters.isNational));

      const queryString = params.toString();
      const url = queryString ? `/emergency/contacts?${queryString}` : '/emergency/contacts';

      const response = await apiClient.get(url);
      console.log('[emergencyApi] Emergency contacts fetched successfully');
      return response;
    } catch (error) {
      console.error('[emergencyApi] Error fetching emergency contacts:', error);
      throw error;
    }
  },

  /**
   * Get nearby emergency services based on location
   * @param latitude - User's latitude
   * @param longitude - User's longitude
   * @param maxDistance - Maximum distance in km (default 50)
   * @param type - Optional filter by service type
   * @returns Promise with API response containing nearby contacts
   */
  getNearbyContacts: async (
    latitude: number,
    longitude: number,
    maxDistance: number = 50,
    type?: string
  ): Promise<ApiResponse<NearbyContactsResponse>> => {
    try {
      console.log('[emergencyApi] Fetching nearby emergency services:', { latitude, longitude, maxDistance });

      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        maxDistance: String(maxDistance),
      });
      if (type) params.append('type', type);

      const response = await apiClient.get(`/emergency/contacts/nearby?${params.toString()}`);
      console.log('[emergencyApi] Nearby contacts fetched successfully');
      return response;
    } catch (error) {
      console.error('[emergencyApi] Error fetching nearby contacts:', error);
      throw error;
    }
  },

  /**
   * Book an emergency service (ambulance, doctor visit)
   * @param data - Emergency booking details
   * @returns Promise with API response containing booking data
   */
  bookEmergency: async (data: CreateEmergencyBookingRequest): Promise<ApiResponse<EmergencyBooking>> => {
    try {
      console.log('[emergencyApi] Booking emergency service:', data.serviceType);
      const response = await apiClient.post('/emergency/book', data);
      console.log('[emergencyApi] Emergency service booked successfully');
      return response;
    } catch (error) {
      console.error('[emergencyApi] Error booking emergency service:', error);
      throw error;
    }
  },

  /**
   * Get emergency booking status
   * @param id - Booking ID
   * @returns Promise with API response containing booking status
   */
  getBookingStatus: async (id: string): Promise<ApiResponse<EmergencyBooking>> => {
    try {
      console.log('[emergencyApi] Fetching emergency booking status:', id);
      const response = await apiClient.get(`/emergency/booking/${id}`);
      console.log('[emergencyApi] Booking status fetched successfully');
      return response;
    } catch (error) {
      console.error('[emergencyApi] Error fetching booking status:', error);
      throw error;
    }
  },

  /**
   * Get user's emergency bookings history
   * @param status - Optional status filter
   * @param limit - Number of bookings to fetch
   * @param offset - Offset for pagination
   * @returns Promise with API response containing bookings
   */
  getBookings: async (
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ApiResponse<EmergencyBookingsResponse>> => {
    try {
      console.log('[emergencyApi] Fetching user emergency bookings');

      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });
      if (status) params.append('status', status);

      const response = await apiClient.get(`/emergency/bookings?${params.toString()}`);
      console.log('[emergencyApi] Emergency bookings fetched successfully');
      return response;
    } catch (error) {
      console.error('[emergencyApi] Error fetching emergency bookings:', error);
      throw error;
    }
  },

  /**
   * Cancel an emergency booking
   * @param id - Booking ID
   * @param reason - Optional cancellation reason
   * @returns Promise with API response containing updated booking
   */
  cancelBooking: async (id: string, reason?: string): Promise<ApiResponse<EmergencyBooking>> => {
    try {
      console.log('[emergencyApi] Cancelling emergency booking:', id);
      const response = await apiClient.put(`/emergency/booking/${id}/cancel`, { reason });
      console.log('[emergencyApi] Emergency booking cancelled successfully');
      return response;
    } catch (error) {
      console.error('[emergencyApi] Error cancelling booking:', error);
      throw error;
    }
  },

  /**
   * Get user's active emergency booking if any
   * @returns Promise with API response containing active booking status
   */
  getActiveBooking: async (): Promise<ApiResponse<ActiveBookingResponse>> => {
    try {
      console.log('[emergencyApi] Checking for active emergency booking');
      const response = await apiClient.get('/emergency/active');
      console.log('[emergencyApi] Active booking status fetched');
      return response;
    } catch (error) {
      console.error('[emergencyApi] Error checking active booking:', error);
      throw error;
    }
  },

  /**
   * Make a phone call to an emergency number (utility for mobile)
   * This is a client-side utility, not an API call
   * @param phoneNumber - Phone number to call
   */
  callEmergency: (phoneNumber: string): void => {
    console.log('[emergencyApi] Initiating call to:', phoneNumber);
    // This will be handled by the mobile app's native linking
    if (typeof window !== 'undefined' && window.location) {
      window.location.href = `tel:${phoneNumber}`;
    }
  },
};

// Export types for use in other files
export type {
  EmergencyContact,
  EmergencyContactsResponse,
  NearbyContactsResponse,
  EmergencyBooking,
  CreateEmergencyBookingRequest,
  EmergencyBookingsResponse,
  ActiveBookingResponse,
  AssignedUnit,
  ApiResponse,
};

export default emergencyApi;
