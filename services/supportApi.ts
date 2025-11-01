import apiClient, { ApiResponse } from './apiClient';

// ============================================================================
// SUPPORT API SERVICE
// ============================================================================

/**
 * Support Ticket Message
 */
export interface TicketMessage {
  sender: string;
  senderType: 'user' | 'agent' | 'system';
  message: string;
  attachments: string[];
  timestamp: string;
  isRead: boolean;
}

/**
 * Support Ticket
 */
export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  user: string;
  subject: string;
  category: 'order' | 'payment' | 'product' | 'account' | 'technical' | 'delivery' | 'refund' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  relatedEntity?: {
    type: 'order' | 'product' | 'transaction' | 'none';
    id?: string;
  };
  messages: TicketMessage[];
  assignedTo?: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  resolution?: string;
  rating?: {
    score: number;
    comment: string;
    ratedAt: string;
  };
  attachments: string[];
  tags: string[];
  responseTime?: number;
  resolutionTime?: number;
}

/**
 * FAQ
 */
export interface FAQ {
  _id: string;
  category: string;
  subcategory?: string;
  question: string;
  answer: string;
  shortAnswer?: string;
  isActive: boolean;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  tags: string[];
  relatedQuestions: FAQ[];
  order: number;
  imageUrl?: string;
  videoUrl?: string;
  relatedArticles: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * FAQ Category
 */
export interface FAQCategory {
  category: string;
  count: number;
  subcategories: string[];
}

/**
 * Create Ticket Request
 */
export interface CreateTicketRequest {
  subject: string;
  category: 'order' | 'payment' | 'product' | 'account' | 'technical' | 'delivery' | 'refund' | 'other';
  message: string;
  relatedEntity?: {
    type: 'order' | 'product' | 'transaction' | 'none';
    id?: string;
  };
  attachments?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

/**
 * Get Tickets Filters
 */
export interface GetTicketsFilters {
  status?: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  category?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

/**
 * Get Tickets Response
 */
export interface GetTicketsResponse {
  tickets: SupportTicket[];
  total: number;
  pages: number;
}

/**
 * Tickets Summary
 */
export interface TicketsSummary {
  total: number;
  byStatus: { [key: string]: number };
  byCategory: { [key: string]: number };
}

/**
 * Support API Service Class
 */
class SupportService {
  /**
   * Create new support ticket
   */
  async createTicket(data: CreateTicketRequest): Promise<ApiResponse<{ ticket: SupportTicket }>> {

    return apiClient.post('/support/tickets', data);
  }

  /**
   * Get user's tickets with filters
   */
  async getMyTickets(filters?: GetTicketsFilters): Promise<ApiResponse<GetTicketsResponse>> {
    try {
      const response = await apiClient.get<GetTicketsResponse>('/support/tickets', filters);
      return response;
    } catch (error) {
      console.error('\n❌ [SUPPORT API] EXCEPTION IN getMyTickets');
      console.error('Error:', error);
      console.error('╚════════════════════════════════════════╝\n');
      throw error;
    }
  }

  /**
   * Get ticket by ID
   */
  async getTicketById(ticketId: string): Promise<ApiResponse<{ ticket: SupportTicket }>> {

    return apiClient.get(`/support/tickets/${ticketId}`);
  }

  /**
   * Add message to ticket
   */
  async addMessageToTicket(
    ticketId: string,
    message: string,
    attachments?: string[]
  ): Promise<ApiResponse<{ ticket: SupportTicket }>> {

    return apiClient.post(`/support/tickets/${ticketId}/messages`, {
      message,
      attachments,
    });
  }

  /**
   * Close ticket
   */
  async closeTicket(ticketId: string): Promise<ApiResponse<{ ticket: SupportTicket }>> {

    return apiClient.post(`/support/tickets/${ticketId}/close`);
  }

  /**
   * Reopen ticket
   */
  async reopenTicket(
    ticketId: string,
    reason: string
  ): Promise<ApiResponse<{ ticket: SupportTicket }>> {

    return apiClient.post(`/support/tickets/${ticketId}/reopen`, { reason });
  }

  /**
   * Rate ticket
   */
  async rateTicket(
    ticketId: string,
    score: number,
    comment?: string
  ): Promise<ApiResponse<{ ticket: SupportTicket }>> {

    return apiClient.post(`/support/tickets/${ticketId}/rate`, {
      score,
      comment,
    });
  }

  /**
   * Get tickets summary
   */
  async getTicketsSummary(): Promise<ApiResponse<TicketsSummary>> {

    return apiClient.get('/support/tickets/summary');
  }

  /**
   * Get all FAQs
   */
  async getAllFAQs(category?: string, subcategory?: string): Promise<ApiResponse<{ faqs: FAQ[]; total: number }>> {

    return apiClient.get('/support/faq', { category, subcategory });
  }

  /**
   * Search FAQs
   */
  async searchFAQs(query: string, limit: number = 10): Promise<ApiResponse<{ faqs: FAQ[]; total: number }>> {

    return apiClient.get('/support/faq/search', { q: query, limit });
  }

  /**
   * Get FAQ categories
   */
  async getFAQCategories(): Promise<ApiResponse<{ categories: FAQCategory[] }>> {

    return apiClient.get('/support/faq/categories');
  }

  /**
   * Get popular FAQs
   */
  async getPopularFAQs(limit: number = 10): Promise<ApiResponse<{ faqs: FAQ[]; total: number }>> {

    return apiClient.get('/support/faq/popular', { limit });
  }

  /**
   * Mark FAQ as helpful
   */
  async markFAQHelpful(faqId: string, helpful: boolean): Promise<ApiResponse<{ message: string }>> {

    return apiClient.post(`/support/faq/${faqId}/helpful`, { helpful });
  }

  /**
   * Track FAQ view
   */
  async trackFAQView(faqId: string): Promise<ApiResponse<{ message: string }>> {

    return apiClient.post(`/support/faq/${faqId}/view`);
  }

  /**
   * Create order issue ticket (quick action)
   */
  async createOrderIssueTicket(
    orderId: string,
    issueType: string,
    description: string
  ): Promise<ApiResponse<{ ticket: SupportTicket }>> {

    return apiClient.post('/support/quick-actions/order-issue', {
      orderId,
      issueType,
      description,
    });
  }

  /**
   * Report product issue (quick action)
   */
  async reportProductIssue(
    productId: string,
    issueType: string,
    description: string,
    images?: string[]
  ): Promise<ApiResponse<{ ticket: SupportTicket }>> {

    return apiClient.post('/support/quick-actions/report-product', {
      productId,
      issueType,
      description,
      images,
    });
  }
}

// Export singleton instance
const supportService = new SupportService();
export default supportService;
