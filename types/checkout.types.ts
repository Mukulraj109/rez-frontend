// Checkout Types and Interfaces
// This file contains all TypeScript interfaces for the checkout system

export interface CheckoutItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  originalPrice?: number;
  discount?: number;
  cashbackPercentage?: number;
  category: string;
  storeId: string;
  storeName: string;
}

export interface CheckoutStore {
  id: string;
  name: string;
  distance: string;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDelivery: string;
}

export interface PromoCode {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'cashback';
  discountValue: number;
  maxDiscount?: number;
  minOrderValue: number;
  validUntil: string;
  isActive: boolean;
  termsAndConditions: string[];
}

export interface CoinSystem {
  wasilCoin: {
    available: number;
    used: number;
    conversionRate: number; // 1 Rupee = X Wasil Coins
    maxUsagePercentage: number;
  };
  promoCoin: {
    available: number;
    used: number;
    conversionRate: number;
    maxUsagePercentage: number;
    promoCode?: string;
  };
}

export interface BillSummary {
  itemTotal: number;
  getAndItemTotal: number;
  deliveryFee: number;
  platformFee: number;
  taxes: number;
  promoDiscount: number;
  coinDiscount: number;
  roundOff: number;
  totalPayable: number;
  cashbackEarned: number;
  savings: number;
}

export interface PaymentMethod {
  id: string;
  type: 'upi' | 'card' | 'netbanking' | 'wallet' | 'paylater' | 'emi';
  name: string;
  icon: string;
  isRecent?: boolean;
  details?: {
    // For UPI
    upiId?: string;
    // For Cards
    cardNumber?: string;
    cardType?: 'credit' | 'debit';
    bank?: string;
    expiryMonth?: number;
    expiryYear?: number;
    // For Net Banking
    bankCode?: string;
    // For Pay Later
    provider?: string;
    emiTenure?: number;
    emiAmount?: number;
  };
}

export interface CheckoutPageState {
  // Cart and Items
  items: CheckoutItem[];
  store: CheckoutStore;
  
  // Pricing and Calculations
  billSummary: BillSummary;
  
  // Promotions and Coins
  appliedPromoCode?: PromoCode;
  availablePromoCodes: PromoCode[];
  coinSystem: CoinSystem;
  
  // Payment
  selectedPaymentMethod?: PaymentMethod;
  availablePaymentMethods: PaymentMethod[];
  recentPaymentMethods: PaymentMethod[];
  
  // UI State
  showPromoCodeSection: boolean;
  showBillSummary: boolean;
  loading: boolean;
  error: string | null;
  
  // Flow State
  currentStep: 'checkout' | 'payment_methods' | 'payment_details' | 'processing' | 'success';
}

export interface CheckoutAction {
  type: 'SET_LOADING' | 'SET_ERROR' | 'APPLY_PROMO_CODE' | 'REMOVE_PROMO_CODE' | 
        'TOGGLE_WASIL_COIN' | 'TOGGLE_PROMO_COIN' | 'SET_PAYMENT_METHOD' | 
        'UPDATE_BILL_SUMMARY' | 'SET_CURRENT_STEP' | 'TOGGLE_PROMO_SECTION' | 
        'TOGGLE_BILL_SUMMARY';
  payload?: any;
}

// Component Props Interfaces
export interface CheckoutHeaderProps {
  onBack: () => void;
  totalAmount: number;
  coinsBalance: number;
  title?: string;
}

export interface AmountDisplayProps {
  amount: number;
  cashbackPercentage: number;
  currency?: string;
}

export interface StoreConfirmationProps {
  store: CheckoutStore;
  onConfirm: () => void;
}

export interface PromoCodeSectionProps {
  promoCodes: PromoCode[];
  appliedPromoCode?: PromoCode;
  onApplyPromoCode: (code: PromoCode) => void;
  onRemovePromoCode: () => void;
  showSection: boolean;
  onToggleSection: () => void;
}

export interface CoinTogglesProps {
  coinSystem: CoinSystem;
  onToggleWasilCoin: (enabled: boolean) => void;
  onTogglePromoCoin: (enabled: boolean) => void;
}

export interface BillSummaryProps {
  billSummary: BillSummary;
  showDetails: boolean;
  onToggleDetails: () => void;
}

export interface PaymentMethodsProps {
  recentMethods: PaymentMethod[];
  allMethods: PaymentMethod[];
  selectedMethod?: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  onAddNewUPI: (upiId: string) => void;
  onAddNewCard: () => void;
}

export interface RecentMethodsProps {
  methods: PaymentMethod[];
  onSelectMethod: (method: PaymentMethod) => void;
}

export interface UPISectionProps {
  onAddUPI: (upiId: string) => void;
  existingUPIs: PaymentMethod[];
}

export interface CardsSectionProps {
  cards: PaymentMethod[];
  onSelectCard: (card: PaymentMethod) => void;
  onAddNewCard: () => void;
}

export interface NetBankingSectionProps {
  onSelectBank: (bankCode: string) => void;
  popularBanks: PaymentMethod[];
}

export interface PayLaterSectionProps {
  payLaterOptions: PaymentMethod[];
  onSelectOption: (option: PaymentMethod) => void;
}

// Hook Return Types
export interface UseCheckoutReturn {
  state: CheckoutPageState;
  actions: {
    applyPromoCode: (code: PromoCode) => Promise<void>;
    removePromoCode: () => void;
    toggleWasilCoin: (enabled: boolean) => void;
    togglePromoCoin: (enabled: boolean) => void;
    selectPaymentMethod: (method: PaymentMethod) => void;
    updateBillSummary: () => void;
    proceedToPayment: () => Promise<void>;
    processPayment: () => Promise<void>;
  };
  handlers: {
    handlePromoCodeApply: (code: string) => void;
    handleCoinToggle: (coinType: 'wasil' | 'promo', enabled: boolean) => void;
    handlePaymentMethodSelect: (method: PaymentMethod) => void;
    handleProceedToPayment: () => void;
    handleBackNavigation: () => void;
    handleWalletPayment: () => Promise<void>;
    removePromoCode: () => void;
    navigateToOtherPaymentMethods: () => void;
  };
}

// API Response Types
export interface CheckoutInitResponse {
  items: CheckoutItem[];
  store: CheckoutStore;
  billSummary: BillSummary;
  availablePromoCodes: PromoCode[];
  coinSystem: CoinSystem;
  paymentMethods: PaymentMethod[];
}

export interface PromoCodeValidationResponse {
  isValid: boolean;
  promoCode?: PromoCode;
  error?: string;
  updatedBillSummary: BillSummary;
}

export interface PaymentProcessResponse {
  success: boolean;
  transactionId?: string;
  orderId?: string;
  paymentMethod: PaymentMethod;
  amount: number;
  error?: string;
  redirectUrl?: string;
}

// Form Interfaces
export interface UPIPaymentForm {
  upiId: string;
  saveForFuture: boolean;
}

export interface CardPaymentForm {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  nameOnCard: string;
  saveCard: boolean;
}

export interface NetBankingForm {
  bankCode: string;
  accountType: 'savings' | 'current';
}

// Validation Interfaces
export interface CheckoutValidation {
  isValid: boolean;
  errors: {
    items?: string;
    store?: string;
    payment?: string;
    address?: string;
  };
}

// Constants
export const CHECKOUT_STEPS = {
  CHECKOUT: 'checkout',
  PAYMENT_METHODS: 'payment_methods',
  PAYMENT_DETAILS: 'payment_details',
  PROCESSING: 'processing',
  SUCCESS: 'success',
} as const;

export const PAYMENT_TYPES = {
  UPI: 'upi',
  CARD: 'card',
  NETBANKING: 'netbanking',
  WALLET: 'wallet',
  PAY_LATER: 'paylater',
  EMI: 'emi',
} as const;

export const COIN_TYPES = {
  WASIL: 'wasil',
  PROMO: 'promo',
} as const;