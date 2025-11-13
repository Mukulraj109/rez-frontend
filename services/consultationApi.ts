import apiClient from '@/services/apiClient';

// TypeScript Interfaces
interface CreateConsultationRequest {
  storeId: string;
  consultationType: string;
  consultationDate: string; // ISO date
  consultationTime: string; // HH:MM format
  duration?: number; // default 30 minutes
  patientName: string;
  patientAge: number;
  patientPhone: string;
  patientEmail?: string;
  reasonForConsultation: string;
  medicalHistory?: string;
}

interface Consultation {
  _id: string;
  consultationNumber: string;
  storeId: string;
  userId: string;
  consultationType: string;
  consultationDate: string;
  consultationTime: string;
  duration: number;
  patientName: string;
  patientAge: number;
  patientPhone: string;
  patientEmail?: string;
  reasonForConsultation: string;
  medicalHistory?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  doctorName?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Consultation API Service
const consultationApi = {
  /**
   * Create a new medical consultation
   * @param data - Consultation details
   * @returns Promise with API response containing consultation data
   */
  createConsultation: async (data: CreateConsultationRequest): Promise<ApiResponse<Consultation>> => {
    try {
      console.log('[consultationApi] Creating consultation with data:', data);
      console.log('[consultationApi] Store ID:', data.storeId);
      console.log('[consultationApi] Consultation Type:', data.consultationType);
      console.log('[consultationApi] Date:', data.consultationDate);
      console.log('[consultationApi] Time:', data.consultationTime);
      console.log('[consultationApi] Patient:', data.patientName);

      const response = await apiClient.post('/consultations', data);

      console.log('[consultationApi] Consultation created successfully:', response);
      if (response.success && response.data) {
        console.log('[consultationApi] Consultation Number:', response.data.consultationNumber);
        console.log('[consultationApi] Status:', response.data.status);
      }

      return response;
    } catch (error) {
      console.error('[consultationApi] Error creating consultation:', error);
      throw error;
    }
  },

  /**
   * Get all consultations for the current user
   * @returns Promise with API response containing array of consultations
   */
  getUserConsultations: async (): Promise<ApiResponse<Consultation[]>> => {
    try {
      console.log('[consultationApi] Fetching user consultations');

      const response = await apiClient.get('/consultations/user');

      console.log('[consultationApi] User consultations fetched successfully');
      if (response.success && response.data) {
        console.log('[consultationApi] Total consultations:', response.data.length);
        console.log('[consultationApi] Consultations:', response.data);
      }

      return response;
    } catch (error) {
      console.error('[consultationApi] Error fetching user consultations:', error);
      throw error;
    }
  },

  /**
   * Get details of a specific consultation
   * @param consultationId - ID of the consultation
   * @returns Promise with API response containing consultation data
   */
  getConsultation: async (consultationId: string): Promise<ApiResponse<Consultation>> => {
    try {
      console.log('[consultationApi] Fetching consultation with ID:', consultationId);

      const response = await apiClient.get(`/consultations/${consultationId}`);

      console.log('[consultationApi] Consultation fetched successfully');
      if (response.success && response.data) {
        console.log('[consultationApi] Consultation Number:', response.data.consultationNumber);
        console.log('[consultationApi] Status:', response.data.status);
        console.log('[consultationApi] Patient:', response.data.patientName);
        console.log('[consultationApi] Doctor:', response.data.doctorName || 'Not assigned');
      }

      return response;
    } catch (error) {
      console.error('[consultationApi] Error fetching consultation:', error);
      throw error;
    }
  },

  /**
   * Cancel a consultation
   * @param consultationId - ID of the consultation to cancel
   * @returns Promise with API response containing updated consultation data
   */
  cancelConsultation: async (consultationId: string): Promise<ApiResponse<Consultation>> => {
    try {
      console.log('[consultationApi] Cancelling consultation with ID:', consultationId);

      const response = await apiClient.put(`/consultations/${consultationId}/cancel`, {});

      console.log('[consultationApi] Consultation cancelled successfully');
      if (response.success && response.data) {
        console.log('[consultationApi] Updated Status:', response.data.status);
        console.log('[consultationApi] Consultation Number:', response.data.consultationNumber);
      }

      return response;
    } catch (error) {
      console.error('[consultationApi] Error cancelling consultation:', error);
      throw error;
    }
  },

  /**
   * Check available time slots for a store on a specific date
   * @param storeId - ID of the store/clinic
   * @param date - Date to check availability (ISO format)
   * @returns Promise with API response containing availability data
   */
  checkAvailability: async (storeId: string, date: string): Promise<ApiResponse<any>> => {
    try {
      console.log('[consultationApi] Checking availability');
      console.log('[consultationApi] Store ID:', storeId);
      console.log('[consultationApi] Date:', date);

      const response = await apiClient.get(`/consultations/availability/${storeId}?date=${date}`);

      console.log('[consultationApi] Availability data fetched successfully');
      if (response.success && response.data) {
        console.log('[consultationApi] Availability:', response.data);
      }

      return response;
    } catch (error) {
      console.error('[consultationApi] Error checking availability:', error);
      throw error;
    }
  },
};

// Export types for use in other files
export type {
  CreateConsultationRequest,
  Consultation,
  ApiResponse,
};

export default consultationApi;
