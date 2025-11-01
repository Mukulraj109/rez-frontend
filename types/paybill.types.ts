// PayBill System Types
// Comprehensive type definitions for PayBill functionality

export interface PayBillTransaction {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  createdAt: string;
  updatedAt?: string;
  status: {
    current: 'pending' | 'completed' | 'failed' | 'cancelled';
    message?: string;
  };
  category?: string;
  source?: {
    type: 'stripe' | 'upi' | 'wallet' | 'refund' | 'bonus' | 'manual';
    description?: string;
    referenceId?: string;
  };
  metadata?: {
    orderId?: string;
    productId?: string;
    storeId?: string;
    discountApplied?: number;
    bonusEarned?: number;
  };
}

export interface PayBillBalance {
  paybillBalance: number;
  currency: string;
  statistics: {
    totalPayBill: number;
    totalPayBillDiscount: number;
    totalTransactions: number;
    lastTransactionDate?: string;
  };
}

export interface PayBillTransactionResponse {
  transactions: PayBillTransaction[];
  currentBalance: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PayBillFilters {
  type: 'all' | 'credit' | 'debit';
  status: 'all' | 'pending' | 'completed' | 'failed' | 'cancelled';
  dateRange: {
    start?: string;
    end?: string;
  };
  amountRange: {
    min?: number;
    max?: number;
  };
}

export interface PayBillPageState {
  // Data
  transactions: PayBillTransaction[];
  currentBalance: number;
  filteredTransactions: PayBillTransaction[];
  
  // UI State
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  
  // Filters
  filters: PayBillFilters;
  
  // Search
  searchQuery: string;
}

export interface PayBillPageActions {
  // Data Management
  loadTransactions: (page?: number, showLoader?: boolean) => Promise<void>;
  loadMoreTransactions: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  
  // Filtering
  setFilter: (filter: PayBillFilters['type']) => void;
  setStatusFilter: (status: PayBillFilters['status']) => void;
  setDateRange: (start?: string, end?: string) => void;
  setAmountRange: (min?: number, max?: number) => void;
  clearFilters: () => void;
  
  // Search
  setSearchQuery: (query: string) => void;
  searchTransactions: (query: string) => void;
  
  // Balance
  refreshBalance: () => Promise<void>;
}

export interface PayBillPageHandlers {
  // Navigation
  handleBack: () => void;
  handleTransactionPress: (transaction: PayBillTransaction) => void;
  
  // UI Interactions
  handleRefresh: () => void;
  handleLoadMore: () => void;
  handleFilterChange: (filter: PayBillFilters['type']) => void;
  handleSearchChange: (query: string) => void;
  handleSearchSubmit: (query: string) => void;
}

export interface UsePayBillPageReturn {
  state: PayBillPageState;
  actions: PayBillPageActions;
  handlers: PayBillPageHandlers;
}

// Component Props
export interface PayBillHeaderProps {
  currentBalance: number;
  onBack: () => void;
  loading?: boolean;
}

export interface PayBillBalanceCardProps {
  balance: number;
  loading?: boolean;
  onRefresh?: () => void;
}

export interface PayBillFilterTabsProps {
  activeFilter: PayBillFilters['type'];
  onFilterChange: (filter: PayBillFilters['type']) => void;
  transactionCounts: {
    all: number;
    credit: number;
    debit: number;
  };
}

export interface PayBillTransactionCardProps {
  transaction: PayBillTransaction;
  onPress?: (transaction: PayBillTransaction) => void;
}

export interface PayBillTransactionListProps {
  transactions: PayBillTransaction[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  onTransactionPress: (transaction: PayBillTransaction) => void;
  onRefresh: () => void;
  onLoadMore: () => void;
  onEndReached?: () => void;
}

export interface PayBillEmptyStateProps {
  filter: PayBillFilters['type'];
  searchQuery?: string;
  onClearSearch?: () => void;
  onClearFilters?: () => void;
}

// API Request/Response Types
export interface AddPayBillRequest {
  amount: number;
  paymentMethod?: 'stripe' | 'upi' | 'wallet';
  paymentId?: string;
  discountPercentage?: number;
  source?: string;
}

export interface AddPayBillResponse {
  transaction: PayBillTransaction;
  paybillBalance: number;
  originalAmount: number;
  discount: number;
  finalAmount: number;
  discountPercentage: number;
  wallet: {
    balance: {
      total: number;
      available: number;
      pending: number;
      paybill: number;
    };
    currency: string;
  };
  message: string;
}

export interface UsePayBillRequest {
  amount: number;
  orderId?: string;
  description?: string;
  productId?: string;
  storeId?: string;
}

export interface UsePayBillResponse {
  transaction: PayBillTransaction;
  paybillBalance: number;
  orderId?: string;
  message: string;
}

// Utility Types
export type PayBillTransactionType = 'credit' | 'debit';
export type PayBillTransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type PayBillSourceType = 'stripe' | 'upi' | 'wallet' | 'refund' | 'bonus' | 'manual';

// Constants
export const PAYBILL_CONSTANTS = {
  MIN_AMOUNT: 50,
  MAX_AMOUNT: 100000,
  DEFAULT_DISCOUNT_PERCENTAGE: 20,
  DEFAULT_PAGE_SIZE: 20,
  CURRENCY: 'INR',
  CURRENCY_SYMBOL: '₹',
} as const;

export const PAYBILL_FILTERS = {
  TYPE: {
    ALL: 'all' as const,
    CREDIT: 'credit' as const,
    DEBIT: 'debit' as const,
  },
  STATUS: {
    ALL: 'all' as const,
    PENDING: 'pending' as const,
    COMPLETED: 'completed' as const,
    FAILED: 'failed' as const,
    CANCELLED: 'cancelled' as const,
  },
} as const;


