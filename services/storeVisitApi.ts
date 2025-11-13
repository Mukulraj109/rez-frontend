// Store Visit API Service
// Handles store visit scheduling and queue management

import apiClient, { ApiResponse } from './apiClient';

export interface ScheduleVisitRequest {
  storeId: string;
  visitDate: string; // ISO string
  visitTime: string; // e.g., "02:00 PM"
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}

export interface ScheduleVisitResponse {
  visitNumber: string;
  visitDate: string;
  visitTime: string;
  storeName: string;
  message: string;
}

export interface GetQueueNumberRequest {
  storeId: string;
  customerName: string;
  customerPhone: string;
}

export interface GetQueueNumberResponse {
  queueNumber: number;
  estimatedWaitTime: string;
  currentQueueSize: number;
  message: string;
}

class StoreVisitService {
  /**
   * Schedule a store visit
   * POST /stores/:storeId/visits/schedule
   */
  async scheduleStoreVisit(
    request: ScheduleVisitRequest
  ): Promise<ApiResponse<ScheduleVisitResponse>> {
    const { storeId, ...visitData } = request;
    return apiClient.post(`/stores/${storeId}/visits/schedule`, visitData);
  }

  /**
   * Get a queue number for immediate visit
   * POST /stores/:storeId/queue
   */
  async getQueueNumber(
    request: GetQueueNumberRequest
  ): Promise<ApiResponse<GetQueueNumberResponse>> {
    const { storeId, ...queueData } = request;
    return apiClient.post(`/stores/${storeId}/queue`, queueData);
  }

  /**
   * Get current store queue status
   * GET /stores/:storeId/queue/status
   */
  async getQueueStatus(storeId: string): Promise<ApiResponse<{
    currentQueueSize: number;
    averageWaitTime: string;
    crowdLevel: 'Low' | 'Medium' | 'High';
  }>> {
    return apiClient.get(`/stores/${storeId}/queue/status`);
  }

  /**
   * Get user's scheduled visits
   * GET /store-visits/user
   */
  async getUserVisits(): Promise<ApiResponse<Array<{
    id: string;
    visitNumber: string;
    visitDate: string;
    visitTime: string;
    store: {
      id: string;
      name: string;
      logo?: string;
    };
    status: 'pending' | 'checked_in' | 'completed' | 'cancelled';
  }>>> {
    return apiClient.get('/store-visits/user');
  }

  /**
   * Cancel a scheduled visit
   * PUT /store-visits/:visitId/cancel
   */
  async cancelVisit(visitId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put(`/store-visits/${visitId}/cancel`, {});
  }

  /**
   * Check store availability and crowd status
   * GET /store-visits/availability/:storeId
   */
  async checkStoreAvailability(storeId: string): Promise<ApiResponse<{
    storeId: string;
    storeName: string;
    crowdStatus: 'Low' | 'Medium' | 'High';
    currentVisitors: number;
    isOpen: boolean;
    nextAvailableSlot: string;
    recommendedAction: string;
  }>> {
    return apiClient.get(`/store-visits/availability/${storeId}`);
  }

  /**
   * Get current queue status
   * GET /store-visits/queue-status/:storeId
   */
  async getCurrentQueueStatus(storeId: string): Promise<ApiResponse<{
    storeId: string;
    storeName: string;
    totalInQueue: number;
    currentlyServing: number;
    completed: number;
    lastServedNumber: number | undefined;
    estimatedWaitTime: string;
    queueList: Array<{
      queueNumber: number;
      status: string;
      visitNumber: string;
      customerName: string;
    }>;
  }>> {
    return apiClient.get(`/store-visits/queue-status/${storeId}`);
  }
}

// Create singleton instance
const storeVisitService = new StoreVisitService();

export default storeVisitService;
