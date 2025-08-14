export interface Deal {
  id: string;
  title: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumBill: number;
  maxDiscount?: number;
  isOfflineOnly: boolean;
  terms: string[];
  isActive: boolean;
  validUntil: Date;
  category: DealCategory;
  description?: string;
  priority: number; // For sorting deals
  usageLimit?: number; // How many times this deal can be used
  usageCount?: number; // How many times it has been used
  applicableProducts?: string[]; // Product categories this deal applies to
  badge?: DealBadge; // Visual badge information
}

export type DealCategory = 
  | 'instant-discount'
  | 'cashback'
  | 'buy-one-get-one'
  | 'seasonal'
  | 'first-time'
  | 'loyalty'
  | 'clearance';

export interface DealBadge {
  text: string;
  backgroundColor: string;
  textColor: string;
  icon?: string;
}

export interface DealModalProps {
  visible: boolean;
  onClose: () => void;
  storeId?: string;
  deals?: Deal[];
}

export interface DealCardProps {
  deal: Deal;
  onAdd: (dealId: string) => void;
  onRemove: (dealId: string) => void;
  isAdded: boolean;
  onMoreDetails: (dealId: string) => void;
}

export interface DealState {
  selectedDeals: string[];
  isLoading: boolean;
  error: string | null;
  appliedDeals: AppliedDeal[];
  totalDiscount: number;
  validationErrors: DealValidationError[];
}

export interface AppliedDeal {
  dealId: string;
  discountAmount: number;
  appliedAt: Date;
  orderId?: string;
}

export interface DealValidationError {
  dealId: string;
  errorType: 'MINIMUM_BILL' | 'EXPIRED' | 'USAGE_LIMIT' | 'PRODUCT_RESTRICTION' | 'STORE_RESTRICTION';
  message: string;
}

export interface DealCalculationResult {
  isValid: boolean;
  discountAmount: number;
  finalAmount: number;
  errors: DealValidationError[];
  warnings: string[];
}

export interface StoreDealConfig {
  storeId: string;
  storeName: string;
  availableDeals: Deal[];
  dealCategories: DealCategory[];
  maxConcurrentDeals: number;
  allowDealStacking: boolean;
}