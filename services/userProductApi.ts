import apiClient, { ApiResponse } from './apiClient';

// ============================================================================
// USER PRODUCT API SERVICE
// ============================================================================

/**
 * Warranty Details
 */
export interface Warranty {
  hasWarranty: boolean;
  startDate?: string;
  endDate?: string;
  duration?: number;
  warrantyCard?: string;
  terms?: string[];
}

/**
 * Registration Details
 */
export interface Registration {
  isRegistered: boolean;
  registrationDate?: string;
  serialNumber?: string;
  registrationNumber?: string;
}

/**
 * Installation Details
 */
export interface Installation {
  required: boolean;
  scheduled: boolean;
  scheduledDate?: string;
  completed: boolean;
  completedDate?: string;
  technician?: string;
  notes?: string;
}

/**
 * AMC Details
 */
export interface AMC {
  hasAMC: boolean;
  startDate?: string;
  endDate?: string;
  serviceCount: number;
  amount?: number;
  renewalDue: boolean;
}

/**
 * User Product
 */
export interface UserProduct {
  _id: string;
  user: string;
  product: {
    _id: string;
    name: string;
    images: string[];
    category: string;
    basePrice: number;
    description?: string;
  };
  order: {
    _id: string;
    orderNumber: string;
    totalAmount: number;
    createdAt: string;
  };
  purchaseDate: string;
  quantity: number;
  totalPrice: number;
  warranty: Warranty;
  registration: Registration;
  installation: Installation;
  amc: AMC;
  status: 'active' | 'warranty_expired' | 'returned' | 'replaced';
  serviceRequests: string[];
  documents: string[];
  notes: string;
  warrantyDaysRemaining?: number;
  warrantyStatus?: 'active' | 'expiring_soon' | 'expired' | 'no_warranty';
  isWarrantyExpiringSoon?: boolean;
  amcDaysRemaining?: number;
  isAMCExpiringSoon?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Technician Details
 */
export interface Technician {
  id?: string;
  name: string;
  phone: string;
  rating?: number;
}

/**
 * Service Request Cost
 */
export interface ServiceRequestCost {
  estimatedCost: number;
  actualCost?: number;
  warrantyCovered: boolean;
  payment?: {
    method: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
  };
}

/**
 * Service Request
 */
export interface ServiceRequest {
  _id: string;
  requestNumber: string;
  user: string;
  userProduct: string;
  product: {
    _id: string;
    name: string;
    images: string[];
    category: string;
  };
  requestType: 'repair' | 'replacement' | 'installation' | 'maintenance' | 'inspection';
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  technician?: Technician;
  issueDescription: string;
  issueCategory?: string;
  images: string[];
  diagnosis?: string;
  resolution?: string;
  cost: ServiceRequestCost;
  address: {
    _id: string;
    fullAddress: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  rating?: number;
  feedback?: string;
  daysUntilScheduled?: number;
  isOverdue?: boolean;
}

/**
 * Product Filters
 */
export interface ProductFilters {
  status?: 'active' | 'warranty_expired' | 'returned' | 'replaced';
  category?: string;
  hasWarranty?: boolean;
  hasAMC?: boolean;
}

/**
 * Service Request Filters
 */
export interface ServiceRequestFilters {
  status?: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  requestType?: 'repair' | 'replacement' | 'installation' | 'maintenance' | 'inspection';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

/**
 * Service Requests Response
 */
export interface ServiceRequestsResponse {
  requests: ServiceRequest[];
  total: number;
  pages: number;
}

/**
 * Create Service Request Data
 */
export interface CreateServiceRequestData {
  userProductId: string;
  productId: string;
  requestType: 'repair' | 'replacement' | 'installation' | 'maintenance' | 'inspection';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  issueDescription: string;
  issueCategory?: string;
  images?: string[];
  addressId: string;
  estimatedCost?: number;
}

/**
 * Register Product Data
 */
export interface RegisterProductData {
  serialNumber: string;
  registrationNumber?: string;
}

/**
 * Schedule Installation Data
 */
export interface ScheduleInstallationData {
  scheduledDate: string;
  technician?: string;
  notes?: string;
}

/**
 * Renew AMC Data
 */
export interface RenewAMCData {
  duration: number; // months
  amount: number;
}

/**
 * Reschedule Service Data
 */
export interface RescheduleServiceData {
  newDate: string;
  newTimeSlot: string;
}

/**
 * Rate Service Data
 */
export interface RateServiceData {
  rating: number;
  feedback?: string;
}

/**
 * UserProduct API Service Class
 */
class UserProductService {
  /**
   * Get user's products
   */
  async getUserProducts(filters?: ProductFilters): Promise<ApiResponse<UserProduct[]>> {
    console.log('📦 [USER PRODUCT API] Getting user products', filters);
    return apiClient.get('/user-products', filters);
  }

  /**
   * Get product details
   */
  async getProductDetails(productId: string): Promise<ApiResponse<UserProduct>> {
    console.log('📦 [USER PRODUCT API] Getting product details:', productId);
    return apiClient.get(`/user-products/${productId}`);
  }

  /**
   * Get products with expiring warranties
   */
  async getExpiringWarranties(days: number = 30): Promise<ApiResponse<{
    products: UserProduct[];
    count: number;
  }>> {
    console.log('⚠️ [USER PRODUCT API] Getting expiring warranties');
    return apiClient.get('/user-products/expiring-warranties', { days });
  }

  /**
   * Get products with expiring AMC
   */
  async getExpiringAMC(days: number = 30): Promise<ApiResponse<{
    products: UserProduct[];
    count: number;
  }>> {
    console.log('⚠️ [USER PRODUCT API] Getting expiring AMC');
    return apiClient.get('/user-products/expiring-amc', { days });
  }

  /**
   * Register product
   */
  async registerProduct(
    productId: string,
    data: RegisterProductData
  ): Promise<ApiResponse<UserProduct>> {
    console.log('📝 [USER PRODUCT API] Registering product:', productId);
    return apiClient.post(`/user-products/${productId}/register`, data);
  }

  /**
   * Schedule installation
   */
  async scheduleInstallation(
    productId: string,
    data: ScheduleInstallationData
  ): Promise<ApiResponse<UserProduct>> {
    console.log('🔧 [USER PRODUCT API] Scheduling installation:', productId);
    return apiClient.post(`/user-products/${productId}/schedule-installation`, data);
  }

  /**
   * Renew AMC
   */
  async renewAMC(
    productId: string,
    data: RenewAMCData
  ): Promise<ApiResponse<UserProduct>> {
    console.log('🔄 [USER PRODUCT API] Renewing AMC:', productId);
    return apiClient.post(`/user-products/${productId}/renew-amc`, data);
  }

  /**
   * Get warranty details
   */
  async getWarrantyDetails(productId: string): Promise<ApiResponse<{
    warranty: Warranty;
    warrantyDaysRemaining?: number;
    warrantyStatus?: string;
    isWarrantyExpiringSoon?: boolean;
  }>> {
    console.log('🛡️ [USER PRODUCT API] Getting warranty details:', productId);
    return apiClient.get(`/user-products/${productId}/warranty`);
  }

  /**
   * Get AMC details
   */
  async getAMCDetails(productId: string): Promise<ApiResponse<{
    amc: AMC;
    amcDaysRemaining?: number;
    isAMCExpiringSoon?: boolean;
  }>> {
    console.log('🛡️ [USER PRODUCT API] Getting AMC details:', productId);
    return apiClient.get(`/user-products/${productId}/amc`);
  }

  // ============================================================================
  // SERVICE REQUEST METHODS
  // ============================================================================

  /**
   * Create service request
   */
  async createServiceRequest(
    data: CreateServiceRequestData
  ): Promise<ApiResponse<ServiceRequest>> {
    console.log('🔧 [USER PRODUCT API] Creating service request');
    return apiClient.post('/user-products/service-requests', data);
  }

  /**
   * Get service requests
   */
  async getServiceRequests(
    filters?: ServiceRequestFilters
  ): Promise<ApiResponse<ServiceRequestsResponse>> {
    console.log('🔧 [USER PRODUCT API] Getting service requests', filters);
    return apiClient.get('/user-products/service-requests', filters);
  }

  /**
   * Get active service requests
   */
  async getActiveServiceRequests(): Promise<ApiResponse<{
    requests: ServiceRequest[];
    count: number;
  }>> {
    console.log('🔧 [USER PRODUCT API] Getting active service requests');
    return apiClient.get('/user-products/service-requests/active');
  }

  /**
   * Get service request details
   */
  async getServiceRequestDetails(
    requestId: string
  ): Promise<ApiResponse<ServiceRequest>> {
    console.log('🔧 [USER PRODUCT API] Getting service request details:', requestId);
    return apiClient.get(`/user-products/service-requests/${requestId}`);
  }

  /**
   * Cancel service request
   */
  async cancelServiceRequest(
    requestId: string,
    reason: string
  ): Promise<ApiResponse<ServiceRequest>> {
    console.log('❌ [USER PRODUCT API] Cancelling service request:', requestId);
    return apiClient.post(`/user-products/service-requests/${requestId}/cancel`, { reason });
  }

  /**
   * Reschedule service request
   */
  async rescheduleServiceRequest(
    requestId: string,
    data: RescheduleServiceData
  ): Promise<ApiResponse<ServiceRequest>> {
    console.log('📅 [USER PRODUCT API] Rescheduling service request:', requestId);
    return apiClient.post(`/user-products/service-requests/${requestId}/reschedule`, data);
  }

  /**
   * Rate service request
   */
  async rateServiceRequest(
    requestId: string,
    data: RateServiceData
  ): Promise<ApiResponse<ServiceRequest>> {
    console.log('⭐ [USER PRODUCT API] Rating service request:', requestId);
    return apiClient.post(`/user-products/service-requests/${requestId}/rate`, data);
  }
}

// Export singleton instance
const userProductService = new UserProductService();
export default userProductService;
