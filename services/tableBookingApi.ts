// Table Booking API Service
// Handles restaurant table booking operations

import apiClient from '@/services/apiClient';

/**
 * Create Table Booking Request Interface
 */
interface CreateTableBookingRequest {
  storeId: string;
  bookingDate: string; // ISO date
  bookingTime: string; // HH:MM format
  partySize: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  specialRequests?: string;
}

/**
 * Table Booking Interface
 */
interface TableBooking {
  _id: string;
  bookingNumber: string;
  storeId: string;
  userId: string;
  bookingDate: string;
  bookingTime: string;
  partySize: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

/**
 * API Response Interface
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Table Booking API Service
 * Handles all table booking related API calls
 */
const tableBookingApi = {
  /**
   * Create a new table booking
   * @param data - Table booking details
   * @returns Promise with created booking data
   */
  createTableBooking: async (data: CreateTableBookingRequest): Promise<ApiResponse<TableBooking>> => {
    try {
      console.log('[tableBookingApi] Creating table booking:', {
        storeId: data.storeId,
        date: data.bookingDate,
        time: data.bookingTime,
        partySize: data.partySize,
      });

      const response = await apiClient.post('/table-bookings', data);

      console.log('[tableBookingApi] Table booking created successfully:', {
        bookingId: response.data?._id,
        bookingNumber: response.data?.bookingNumber,
        status: response.data?.status,
      });

      return response;
    } catch (error) {
      console.error('[tableBookingApi] Error creating table booking:', error);
      throw error;
    }
  },

  /**
   * Get all table bookings for the current user
   * @returns Promise with array of user's bookings
   */
  getUserTableBookings: async (): Promise<ApiResponse<TableBooking[]>> => {
    try {
      console.log('[tableBookingApi] Fetching user table bookings');

      const response = await apiClient.get('/table-bookings/user');

      console.log('[tableBookingApi] User table bookings fetched successfully:', {
        count: response.data?.length || 0,
      });

      return response;
    } catch (error) {
      console.error('[tableBookingApi] Error fetching user table bookings:', error);
      throw error;
    }
  },

  /**
   * Get a specific table booking by ID
   * @param bookingId - Booking ID
   * @returns Promise with booking details
   */
  getTableBooking: async (bookingId: string): Promise<ApiResponse<TableBooking>> => {
    try {
      console.log('[tableBookingApi] Fetching table booking:', { bookingId });

      const response = await apiClient.get(`/table-bookings/${bookingId}`);

      console.log('[tableBookingApi] Table booking fetched successfully:', {
        bookingId: response.data?._id,
        bookingNumber: response.data?.bookingNumber,
        status: response.data?.status,
      });

      return response;
    } catch (error) {
      console.error('[tableBookingApi] Error fetching table booking:', error);
      throw error;
    }
  },

  /**
   * Cancel a table booking
   * @param bookingId - Booking ID to cancel
   * @returns Promise with cancelled booking data
   */
  cancelTableBooking: async (bookingId: string): Promise<ApiResponse<TableBooking>> => {
    try {
      console.log('[tableBookingApi] Cancelling table booking:', { bookingId });

      const response = await apiClient.put(`/table-bookings/${bookingId}/cancel`, {});

      console.log('[tableBookingApi] Table booking cancelled successfully:', {
        bookingId: response.data?._id,
        status: response.data?.status,
      });

      return response;
    } catch (error) {
      console.error('[tableBookingApi] Error cancelling table booking:', error);
      throw error;
    }
  },

  /**
   * Check table availability for a store on a specific date
   * @param storeId - Store ID
   * @param date - Date to check availability (ISO format)
   * @returns Promise with availability data
   */
  checkAvailability: async (storeId: string, date: string): Promise<ApiResponse<any>> => {
    try {
      console.log('[tableBookingApi] Checking availability:', { storeId, date });

      const response = await apiClient.get(`/table-bookings/availability/${storeId}?date=${date}`);

      console.log('[tableBookingApi] Availability checked successfully:', {
        storeId,
        date,
        hasAvailability: response.success,
      });

      return response;
    } catch (error) {
      console.error('[tableBookingApi] Error checking availability:', error);
      throw error;
    }
  },
};

export default tableBookingApi;
export type { CreateTableBookingRequest, TableBooking, ApiResponse };
