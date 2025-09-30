// Checkout Mock Data
// This file contains sample data for the checkout system

import {
  CheckoutItem,
  CheckoutStore,
  PromoCode,
  CoinSystem,
  BillSummary,
  PaymentMethod,
  CheckoutPageState,
  CheckoutInitResponse,
  PromoCodeValidationResponse,
  PaymentProcessResponse,
} from '@/types/checkout.types';

// Sample Checkout Items
export const checkoutItems: CheckoutItem[] = [
  {
    id: 'item_001',
    name: 'Premium Coffee',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
    price: 75,
    quantity: 1,
    originalPrice: 80,
    discount: 5,
    cashbackPercentage: 10,
    category: 'Food',
    storeId: 'store_001',
    storeName: 'Café Delight',
  },
  {
    id: 'item_002',
    name: 'Chocolate Croissant',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
    price: 25,
    quantity: 1,
    originalPrice: 30,
    discount: 5,
    cashbackPercentage: 10,
    category: 'Food',
    storeId: 'store_001',
    storeName: 'Café Delight',
  },
];

// Sample Store
export const checkoutStore: CheckoutStore = {
  id: 'store_001',
  name: 'Café Delight',
  distance: '3 km',
  deliveryFee: 0,
  minimumOrder: 50,
  estimatedDelivery: '30-45 mins',
};

// Sample Promo Codes
export const availablePromoCodes: PromoCode[] = [
  {
    id: 'promo_001',
    code: 'FIRST10',
    title: 'First Order Discount',
    description: 'Get ₹10 off on your first order',
    discountType: 'fixed',
    discountValue: 10,
    minOrderValue: 50,
    validUntil: '2024-12-31',
    isActive: true,
    termsAndConditions: [
      'Valid for first-time users only',
      'Cannot be combined with other offers',
      'Minimum order value ₹50',
    ],
  },
  {
    id: 'promo_002',
    code: 'SAVE15',
    title: '15% Off',
    description: 'Get 15% off up to ₹20',
    discountType: 'percentage',
    discountValue: 15,
    maxDiscount: 20,
    minOrderValue: 80,
    validUntil: '2024-12-31',
    isActive: true,
    termsAndConditions: [
      'Maximum discount ₹20',
      'Valid on all items',
      'Minimum order value ₹80',
    ],
  },
  {
    id: 'promo_003',
    code: 'CASHBACK5',
    title: 'Cashback Offer',
    description: 'Get ₹5 cashback on orders above ₹100',
    discountType: 'cashback',
    discountValue: 5,
    minOrderValue: 100,
    validUntil: '2024-12-31',
    isActive: true,
    termsAndConditions: [
      'Cashback will be credited within 24 hours',
      'Valid on all categories',
      'Minimum order value ₹100',
    ],
  },
];

// Sample Coin System
export const coinSystem: CoinSystem = {
  wasilCoin: {
    available: 32,
    used: 0,
    conversionRate: 1, // 1 Rupee = 1 Wasil Coin
    maxUsagePercentage: 10,
  },
  promoCoin: {
    available: 23.5,
    used: 0,
    conversionRate: 1,
    maxUsagePercentage: 20,
    promoCode: 'PROMOCOIN20',
  },
};

// Calculate Bill Summary
export const calculateBillSummary = (
  items: CheckoutItem[],
  store: CheckoutStore,
  appliedPromoCode?: PromoCode,
  coinUsage?: { wasil: number; promo: number }
): BillSummary => {
  const itemTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const getAndItemTotal = Math.round(itemTotal * 0.05); // 5% get & item charge
  const deliveryFee = store.deliveryFee;
  const platformFee = 2; // Reduced platform fee for small orders
  const taxes = Math.round(itemTotal * 0.05); // 5% tax for food items
  
  let promoDiscount = 0;
  if (appliedPromoCode) {
    if (appliedPromoCode.discountType === 'fixed') {
      promoDiscount = appliedPromoCode.discountValue;
    } else if (appliedPromoCode.discountType === 'percentage') {
      promoDiscount = Math.min(
        Math.round((itemTotal * appliedPromoCode.discountValue) / 100),
        appliedPromoCode.maxDiscount || Infinity
      );
    }
  }
  
  const coinDiscount = (coinUsage?.wasil || 0) + (coinUsage?.promo || 0);
  
  // Calculate subtotal before discounts
  const subtotalBeforeDiscounts = itemTotal + getAndItemTotal + deliveryFee + platformFee + taxes;
  
  // Apply all discounts
  const totalAfterDiscounts = subtotalBeforeDiscounts - promoDiscount - coinDiscount;
  
  // Calculate round off to nearest rupee
  const roundOff = Math.round(totalAfterDiscounts) - totalAfterDiscounts;
  const totalPayable = Math.max(0, totalAfterDiscounts + roundOff);
  
  const cashbackEarned = Math.round(items.reduce((total, item) => 
    total + ((item.price * item.quantity * (item.cashbackPercentage || 0)) / 100), 0
  ));
  
  const savings = Math.round(promoDiscount + coinDiscount);
  
  return {
    itemTotal,
    getAndItemTotal,
    deliveryFee,
    platformFee,
    taxes,
    promoDiscount,
    coinDiscount,
    roundOff,
    totalPayable,
    cashbackEarned,
    savings,
  };
};

// Sample Payment Methods
export const recentPaymentMethods: PaymentMethod[] = [
  {
    id: 'paytm',
    type: 'wallet',
    name: 'Paytm',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg',
    isRecent: true,
  },
  {
    id: 'phonepe',
    type: 'upi',
    name: 'PhonePe',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/0/09/PhonePe-Logo.wine.svg',
    isRecent: true,
  },
  {
    id: 'amazonpay',
    type: 'wallet',
    name: 'Amazon Pay',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Amazon_Pay_logo.svg',
    isRecent: true,
  },
  {
    id: 'mobikwik',
    type: 'wallet',
    name: 'MobiKwik',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/9/90/MobiKwik_Logo.svg',
    isRecent: true,
  },
];

export const allPaymentMethods: PaymentMethod[] = [
  ...recentPaymentMethods,
  {
    id: 'sbi_card',
    type: 'card',
    name: 'SBI Credit Card',
    icon: 'visa',
    details: {
      cardNumber: '****4545',
      cardType: 'credit',
      bank: 'SBI',
    },
  },
  {
    id: 'upi_new',
    type: 'upi',
    name: 'Add New UPI ID',
    icon: 'upi',
  },
  {
    id: 'netbanking',
    type: 'netbanking',
    name: 'Net Banking',
    icon: 'bank',
  },
  {
    id: 'simple_pay',
    type: 'paylater',
    name: 'Simple Pay',
    icon: 'simplepay',
  },
  {
    id: 'amazon_paylater',
    type: 'paylater',
    name: 'Amazon Pay Later',
    icon: 'amazon',
  },
  {
    id: 'debit_emi',
    type: 'emi',
    name: 'Debit Card EMIs',
    icon: 'card',
  },
  {
    id: 'credit_emi',
    type: 'emi',
    name: 'Credit Card EMIs',
    icon: 'card',
  },
];

// Initial Checkout State
export const initialCheckoutState: CheckoutPageState = {
  items: checkoutItems,
  store: checkoutStore,
  billSummary: calculateBillSummary(checkoutItems, checkoutStore),
  availablePromoCodes,
  coinSystem,
  availablePaymentMethods: allPaymentMethods,
  recentPaymentMethods,
  showPromoCodeSection: false,
  showBillSummary: false,
  loading: false,
  error: null,
  currentStep: 'checkout',
};

// Mock API Functions
export const initializeCheckout = async (): Promise<CheckoutInitResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    items: checkoutItems,
    store: checkoutStore,
    billSummary: calculateBillSummary(checkoutItems, checkoutStore),
    availablePromoCodes,
    coinSystem,
    paymentMethods: allPaymentMethods,
  };
};

export const validatePromoCode = async (
  code: string,
  items: CheckoutItem[],
  store: CheckoutStore
): Promise<PromoCodeValidationResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const promoCode = availablePromoCodes.find(p => p.code === code && p.isActive);
  
  if (!promoCode) {
    return {
      isValid: false,
      error: 'Invalid or expired promo code',
      updatedBillSummary: calculateBillSummary(items, store),
    };
  }
  
  const itemTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  if (itemTotal < promoCode.minOrderValue) {
    return {
      isValid: false,
      error: `Minimum order value ₹${promoCode.minOrderValue} required`,
      updatedBillSummary: calculateBillSummary(items, store),
    };
  }
  
  return {
    isValid: true,
    promoCode,
    updatedBillSummary: calculateBillSummary(items, store, promoCode),
  };
};

export const processPayment = async (
  paymentMethod: PaymentMethod,
  amount: number,
  orderDetails: any
): Promise<PaymentProcessResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate payment success/failure
  const isSuccess = Math.random() > 0.1; // 90% success rate
  
  if (isSuccess) {
    return {
      success: true,
      transactionId: `TXN${Date.now()}`,
      orderId: `ORD${Date.now()}`,
      paymentMethod,
      amount,
    };
  } else {
    return {
      success: false,
      error: 'Payment failed. Please try again.',
      paymentMethod,
      amount,
    };
  }
};

export const addUPIPaymentMethod = async (upiId: string): Promise<PaymentMethod> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    id: `upi_${Date.now()}`,
    type: 'upi',
    name: upiId,
    icon: 'upi',
    details: {
      upiId,
    },
  };
};

export const addCardPaymentMethod = async (cardDetails: any): Promise<PaymentMethod> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    id: `card_${Date.now()}`,
    type: 'card',
    name: `${cardDetails.bank} ${cardDetails.cardType} Card`,
    icon: cardDetails.cardNumber.startsWith('4') ? 'visa' : 'mastercard',
    details: {
      cardNumber: `****${cardDetails.cardNumber.slice(-4)}`,
      cardType: cardDetails.cardType,
      bank: cardDetails.bank,
    },
  };
};

// Export everything as a namespace for easier imports
export const CheckoutData = {
  items: checkoutItems,
  store: checkoutStore,
  promoCodes: availablePromoCodes,
  coinSystem,
  paymentMethods: allPaymentMethods,
  recentMethods: recentPaymentMethods,
  initialState: initialCheckoutState,
  helpers: {
    calculateBillSummary,
  },
  api: {
    initializeCheckout,
    validatePromoCode,
    processPayment,
    addUPIPaymentMethod,
    addCardPaymentMethod,
  },
};