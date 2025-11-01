// Bill Upload Service
// Handles all bill upload and verification API calls

import apiClient, { ApiResponse } from './apiClient';
import { Platform } from 'react-native';
import {
  OCRExtractedData,
  BillVerificationResult,
  FraudDetectionResult,
  CashbackCalculation,
} from '@/types/billVerification.types';

export interface BillUploadData {
  billImage: string; // Local file URI
  merchantId: string;
  amount: number;
  billDate: Date;
  billNumber?: string;
  notes?: string;
  // Enhanced fields for verification
  ocrData?: OCRExtractedData;
  verificationResult?: BillVerificationResult;
  fraudCheck?: FraudDetectionResult;
  cashbackCalculation?: CashbackCalculation;
}

export interface Bill {
  _id: string;
  user: string;
  merchant: {
    _id: string;
    name: string;
    logo?: string;
  };
  billImage: {
    url: string;
    thumbnailUrl?: string;
    cloudinaryId: string;
  };
  extractedData?: {
    merchantName?: string;
    amount?: number;
    date?: string;
    billNumber?: string;
    items?: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
  amount: number;
  billDate: string;
  billNumber?: string;
  notes?: string;
  verificationStatus: 'pending' | 'processing' | 'approved' | 'rejected';
  verificationMethod?: 'automatic' | 'manual';
  rejectionReason?: string;
  cashbackAmount?: number;
  cashbackStatus?: 'pending' | 'credited' | 'failed';
  metadata?: {
    ocrConfidence?: number;
    processingTime?: number;
    verifiedBy?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BillHistoryFilters {
  status?: 'pending' | 'processing' | 'approved' | 'rejected';
  startDate?: Date;
  endDate?: Date;
  merchantId?: string;
  limit?: number;
  page?: number;
}

class BillUploadService {
  /**
   * Upload a bill with photo (Enhanced with verification data)
   */
  async uploadBill(data: BillUploadData): Promise<ApiResponse<Bill>> {
    try {

      // Create FormData for file upload
      const formData = new FormData();

      // Add image file
      const imageUri = data.billImage;
      const filename = imageUri.split('/').pop() || 'bill.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // For web
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('billImage', blob, filename);
      } else {
        // For mobile (React Native)
        formData.append('billImage', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      // Add basic fields
      formData.append('merchantId', data.merchantId);
      formData.append('amount', data.amount.toString());
      formData.append('billDate', data.billDate.toISOString());

      if (data.billNumber) {
        formData.append('billNumber', data.billNumber);
      }

      if (data.notes) {
        formData.append('notes', data.notes);
      }

      // Add verification metadata if available
      if (data.ocrData) {
        formData.append('ocrData', JSON.stringify(data.ocrData));
      }

      if (data.verificationResult) {
        formData.append('verificationResult', JSON.stringify(data.verificationResult));
      }

      if (data.fraudCheck) {
        formData.append('fraudCheck', JSON.stringify(data.fraudCheck));
      }

      if (data.cashbackCalculation) {
        formData.append('cashbackCalculation', JSON.stringify(data.cashbackCalculation));
      }

      const response = await apiClient.uploadFile<Bill>('/bills/upload', formData);

      if (response.success) {

      } else {
        console.error('❌ [BILL UPLOAD] Upload failed:', response.error);
      }

      return response;
    } catch (error) {
      console.error('❌ [BILL UPLOAD] Exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload bill',
      };
    }
  }

  /**
   * Get bill history with optional filters
   */
  async getBillHistory(filters?: BillHistoryFilters): Promise<ApiResponse<Bill[]>> {
    try {

      if (filters) {

      }

      const params: Record<string, any> = {};

      if (filters) {
        if (filters.status) params.status = filters.status;
        if (filters.merchantId) params.merchantId = filters.merchantId;
        if (filters.startDate) params.startDate = filters.startDate.toISOString();
        if (filters.endDate) params.endDate = filters.endDate.toISOString();
        if (filters.limit) params.limit = filters.limit;
        if (filters.page) params.page = filters.page;
      }

      const response = await apiClient.get<{ bills: Bill[]; pagination: any }>('/bills', params);

      // Extract bills from the nested response
      if (response.success && response.data) {
        const bills = response.data.bills || [];

        return {
          ...response,
          data: bills as Bill[]
        };
      } else {
        console.error('❌ [BILL HISTORY] Failed:', response.error);
        return response as any;
      }

      return response as any;
    } catch (error) {
      console.error('❌ [BILL HISTORY] Exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bill history',
      };
    }
  }

  /**
   * Get a single bill by ID
   */
  async getBillById(billId: string): Promise<ApiResponse<Bill>> {
    try {

      const response = await apiClient.get<Bill>(`/bills/${billId}`);

      if (response.success) {

      } else {
        console.error('❌ [BILL DETAIL] Failed:', response.error);
      }

      return response;
    } catch (error) {
      console.error('❌ [BILL DETAIL] Exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bill',
      };
    }
  }

  /**
   * Resubmit a rejected bill with new photo
   */
  async resubmitBill(billId: string, newPhoto: string): Promise<ApiResponse<Bill>> {
    try {

      // Create FormData for file upload
      const formData = new FormData();

      // Add image file
      const imageUri = newPhoto;
      const filename = imageUri.split('/').pop() || 'bill.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // For web
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('billImage', blob, filename);
      } else {
        // For mobile (React Native)
        formData.append('billImage', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      const response = await apiClient.uploadFile<Bill>(`/bills/${billId}/resubmit`, formData);

      if (response.success) {

      } else {
        console.error('❌ [BILL RESUBMIT] Failed:', response.error);
      }

      return response;
    } catch (error) {
      console.error('❌ [BILL RESUBMIT] Exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resubmit bill',
      };
    }
  }

  /**
   * Get bill statistics
   */
  async getBillStatistics(): Promise<ApiResponse<{
    totalBills: number;
    pendingBills: number;
    approvedBills: number;
    rejectedBills: number;
    totalCashback: number;
    pendingCashback: number;
  }>> {
    try {

      const response = await apiClient.get<{
        totalBills: number;
        pendingBills: number;
        approvedBills: number;
        rejectedBills: number;
        totalCashback: number;
        pendingCashback: number;
      }>('/bills/statistics');

      if (response.success) {

      } else {
        console.error('❌ [BILL STATS] Failed:', response.error);
      }

      return response;
    } catch (error) {
      console.error('❌ [BILL STATS] Exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics',
      };
    }
  }
}

// Create singleton instance
export const billUploadService = new BillUploadService();

export default billUploadService;
