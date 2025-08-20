// Account Settings Mock Data
// Dummy data for account settings, preferences, and configuration

import { 
  AccountSettings,
  AccountTab,
  AccountSettingsCategory,
  DeliveryAddress,
  SavedCard,
  SavedBankAccount,
  DEFAULT_ACCOUNT_TABS,
  DEFAULT_SETTINGS_CATEGORIES,
  AccountTabType 
} from '@/types/account.types';

// Mock Account Settings
export const mockAccountSettings: AccountSettings = {
  id: 'settings_123',
  userId: 'user_123',
  general: {
    language: 'en',
    currency: 'USD',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    theme: 'auto',
  },
  delivery: {
    defaultAddress: null, // Will be set to first address below
    savedAddresses: [],   // Will be populated below
    deliveryInstructions: 'Please ring the doorbell and wait',
    deliveryTime: {
      preferred: 'ASAP',
      timeSlots: [
        {
          id: 'slot_1',
          label: '9 AM - 12 PM',
          startTime: '09:00',
          endTime: '12:00',
          isAvailable: true,
        },
        {
          id: 'slot_2',
          label: '12 PM - 3 PM',
          startTime: '12:00',
          endTime: '15:00',
          isAvailable: true,
        },
        {
          id: 'slot_3',
          label: '3 PM - 6 PM',
          startTime: '15:00',
          endTime: '18:00',
          isAvailable: true,
        },
        {
          id: 'slot_4',
          label: '6 PM - 9 PM',
          startTime: '18:00',
          endTime: '21:00',
          isAvailable: false,
        },
      ],
      workingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    },
    contactlessDelivery: true,
    deliveryNotifications: true,
  },
  payment: {
    defaultPaymentMethod: null,
    savedCards: [],
    savedBankAccounts: [],
    autoPayEnabled: false,
    paymentPinEnabled: true,
    biometricPaymentEnabled: true,
    transactionLimits: {
      dailyLimit: 5000,
      weeklyLimit: 25000,
      monthlyLimit: 100000,
      singleTransactionLimit: 10000,
    },
  },
  notifications: {
    push: {
      enabled: true,
      orderUpdates: true,
      promotions: false,
      recommendations: true,
      priceAlerts: true,
      deliveryUpdates: true,
      paymentUpdates: true,
      securityAlerts: true,
      chatMessages: true,
    },
    email: {
      enabled: true,
      newsletters: false,
      orderReceipts: true,
      weeklyDigest: true,
      promotions: false,
      securityAlerts: true,
      accountUpdates: true,
    },
    sms: {
      enabled: true,
      orderUpdates: true,
      deliveryAlerts: true,
      paymentConfirmations: true,
      securityAlerts: true,
      otpMessages: true,
    },
    inApp: {
      enabled: true,
      showBadges: true,
      soundEnabled: true,
      vibrationEnabled: true,
      bannerStyle: 'BANNER',
    },
  },
  privacy: {
    profileVisibility: 'FRIENDS',
    showActivity: false,
    showPurchaseHistory: false,
    allowMessaging: true,
    allowFriendRequests: true,
    dataSharing: {
      shareWithPartners: false,
      shareForMarketing: false,
      shareForRecommendations: true,
      shareForAnalytics: false,
      sharePurchaseData: false,
    },
    analytics: {
      allowUsageTracking: true,
      allowCrashReporting: true,
      allowPerformanceTracking: true,
      allowLocationTracking: false,
    },
  },
  security: {
    twoFactorAuth: {
      enabled: true,
      method: '2FA_SMS',
      backupCodes: ['ABC123', 'DEF456', 'GHI789'],
      lastUpdated: '2025-08-01T10:00:00Z',
    },
    biometric: {
      fingerprintEnabled: true,
      faceIdEnabled: true,
      voiceEnabled: false,
      availableMethods: ['FINGERPRINT', 'FACE_ID'],
    },
    sessionManagement: {
      autoLogoutTime: 30, // 30 minutes
      allowMultipleSessions: true,
      activeSessions: [
        {
          id: 'session_1',
          deviceName: 'iPhone 14 Pro',
          deviceType: 'MOBILE',
          ipAddress: '192.168.1.100',
          location: 'New York, US',
          lastActive: '2025-08-19T12:00:00Z',
          isCurrent: true,
        },
        {
          id: 'session_2',
          deviceName: 'MacBook Air',
          deviceType: 'DESKTOP',
          ipAddress: '192.168.1.101',
          location: 'New York, US',
          lastActive: '2025-08-18T16:30:00Z',
          isCurrent: false,
        },
      ],
      rememberMe: true,
    },
    loginAlerts: true,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordHistory: 5,
      expiryDays: 90,
    },
  },
  preferences: {
    startupScreen: 'HOME',
    defaultView: 'CARD',
    autoRefresh: true,
    offlineMode: false,
    dataSaver: false,
    highQualityImages: true,
    animations: true,
    sounds: true,
    hapticFeedback: true,
  },
  lastUpdated: '2025-08-19T10:00:00Z',
};

// Mock Delivery Addresses
export const mockDeliveryAddresses: DeliveryAddress[] = [
  {
    id: 'addr_001',
    type: 'HOME',
    title: 'Home',
    addressLine1: '123 Elm Street',
    addressLine2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
    coordinates: {
      latitude: 40.7589,
      longitude: -73.9851,
    },
    isDefault: true,
    instructions: 'Ring doorbell twice, leave at door if no answer',
  },
  {
    id: 'addr_002',
    type: 'OFFICE',
    title: 'Office',
    addressLine1: '456 Business Ave',
    addressLine2: 'Suite 200',
    city: 'New York',
    state: 'NY',
    postalCode: '10002',
    country: 'US',
    coordinates: {
      latitude: 40.7614,
      longitude: -73.9776,
    },
    isDefault: false,
    instructions: 'Call when you arrive, security will direct you',
  },
  {
    id: 'addr_003',
    type: 'OTHER',
    title: 'Mom\'s House',
    addressLine1: '789 Oak Road',
    city: 'Brooklyn',
    state: 'NY',
    postalCode: '11201',
    country: 'US',
    isDefault: false,
    instructions: 'Use side entrance, main door is usually locked',
  },
];

// Mock Saved Cards
export const mockSavedCards: SavedCard[] = [
  {
    id: 'card_001',
    type: 'CREDIT',
    brand: 'VISA',
    lastFourDigits: '4242',
    expiryMonth: 12,
    expiryYear: 2026,
    cardholderName: 'Sarah Johnson',
    nickname: 'Main Card',
    isDefault: true,
    isActive: true,
  },
  {
    id: 'card_002',
    type: 'DEBIT',
    brand: 'MASTERCARD',
    lastFourDigits: '5555',
    expiryMonth: 8,
    expiryYear: 2027,
    cardholderName: 'Sarah Johnson',
    nickname: 'Backup Card',
    isDefault: false,
    isActive: true,
  },
];

// Mock Saved Bank Accounts
export const mockSavedBankAccounts: SavedBankAccount[] = [
  {
    id: 'bank_001',
    bankName: 'Chase Bank',
    accountType: 'SAVINGS',
    accountNumber: '****1234',
    ifscCode: 'CHASUS33',
    nickname: 'Primary Savings',
    isDefault: true,
    isVerified: true,
  },
  {
    id: 'bank_002',
    bankName: 'Bank of America',
    accountType: 'CURRENT',
    accountNumber: '****5678',
    ifscCode: 'BOFAUS3N',
    nickname: 'Business Account',
    isDefault: false,
    isVerified: true,
  },
];

// Update mock settings with addresses and payment methods
mockAccountSettings.delivery.savedAddresses = mockDeliveryAddresses;
mockAccountSettings.delivery.defaultAddress = mockDeliveryAddresses[0];
mockAccountSettings.payment.savedCards = mockSavedCards;
mockAccountSettings.payment.savedBankAccounts = mockSavedBankAccounts;

// Account Tabs (as shown in screenshot 3)
export const accountTabs: AccountTab[] = [
  { id: 'CUSTOMER_SUPPORT', title: 'Customer Support', isActive: false },
  { id: 'SETTINGS', title: 'Setting', isActive: true },
  { id: 'NOTIFICATIONS', title: 'Notification', isActive: false },
];

// Settings Categories (as shown in screenshot 3)
export const accountSettingsCategories: AccountSettingsCategory[] = [
  {
    id: 'delivery',
    title: 'Delivery',
    icon: 'car-outline',
    route: '/account/delivery',
    description: 'Manage delivery addresses and preferences',
    isEnabled: true,
    showArrow: true,
  },
  {
    id: 'voucher',
    title: 'Voucher',
    icon: 'ticket-outline',
    route: '/account/voucher',
    description: 'View and manage your vouchers',
    badge: '3',
    isEnabled: true,
    showArrow: true,
  },
  {
    id: 'wasilpay',
    title: 'RezPay',
    icon: 'card-outline',
    route: '/account/wasilpay',
    description: 'Manage your RezPay settings',
    isEnabled: true,
    showArrow: true,
  },
  {
    id: 'payment',
    title: 'Payment',
    icon: 'wallet-outline',
    route: '/account/payment',
    description: 'Manage payment methods and settings',
    isEnabled: true,
    showArrow: true,
  },
  {
    id: 'coupon',
    title: 'Coupon codes',
    icon: 'pricetag-outline',
    route: '/account/coupon',
    description: 'View available coupon codes',
    badge: 'New',
    isEnabled: true,
    showArrow: true,
  },
  {
    id: 'account_related',
    title: 'Account related',
    icon: 'person-outline',
    route: '/account/profile',
    description: 'Manage your account information',
    isEnabled: true,
    showArrow: true,
  },
  {
    id: 'cashback',
    title: 'Cashback',
    icon: 'cash-outline',
    route: '/account/cashback',
    description: 'View cashback earnings and history',
    isEnabled: true,
    showArrow: true,
  },
  {
    id: 'product_service',
    title: 'Product/Service',
    icon: 'cube-outline',
    route: '/account/products',
    description: 'Manage your products and services',
    isEnabled: true,
    showArrow: true,
  },
  {
    id: 'courier',
    title: 'Courier',
    icon: 'bicycle-outline',
    route: '/account/courier',
    description: 'Courier and delivery preferences',
    isEnabled: true,
    showArrow: true,
  },
];

// Customer Support Categories
export const customerSupportCategories: AccountSettingsCategory[] = [
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    icon: 'help-circle-outline',
    route: '/support/faq',
    description: 'Find answers to common questions',
    isEnabled: true,
    showArrow: true,
  },
  {
    id: 'chat',
    title: 'Live Chat',
    icon: 'chatbubble-outline',
    route: '/support/chat',
    description: 'Chat with our support team',
    badge: 'Online',
    isEnabled: true,
    showArrow: true,
  },
  {
    id: 'email',
    title: 'Email Support',
    icon: 'mail-outline',
    route: '/support/email',
    description: 'Send us an email',
    isEnabled: true,
    showArrow: true,
  },
  {
    id: 'phone',
    title: 'Phone Support',
    icon: 'call-outline',
    route: '/support/phone',
    description: 'Call our support hotline',
    isEnabled: true,
    showArrow: true,
  },
  {
    id: 'feedback',
    title: 'Send Feedback',
    icon: 'thumbs-up-outline',
    route: '/support/feedback',
    description: 'Share your thoughts with us',
    isEnabled: true,
    showArrow: true,
  },
];

// Notification Categories
export const notificationCategories: AccountSettingsCategory[] = [
  {
    id: 'push_notifications',
    title: 'Push Notifications',
    icon: 'notifications-outline',
    route: '/notifications/push',
    description: 'Manage push notification preferences',
    isEnabled: true,
    showArrow: true,
  },
  {
    id: 'email_notifications',
    title: 'Email Notifications',
    icon: 'mail-outline',
    route: '/notifications/email',
    description: 'Manage email notification settings',
    isEnabled: true,
    showArrow: true,
  },
  {
    id: 'sms_notifications',
    title: 'SMS Notifications',
    icon: 'phone-portrait-outline',
    route: '/notifications/sms',
    description: 'Manage SMS notification preferences',
    isEnabled: true,
    showArrow: true,
  },
  {
    id: 'notification_history',
    title: 'Notification History',
    icon: 'time-outline',
    route: '/notifications/history',
    description: 'View all past notifications',
    isEnabled: true,
    showArrow: true,
  },
];

// API Mock Functions
export const fetchAccountSettings = async (userId: string): Promise<AccountSettings> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockAccountSettings;
};

export const updateAccountSettings = async (
  userId: string,
  updates: Partial<AccountSettings>
): Promise<AccountSettings> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In real app, this would update settings on the server
  return { ...mockAccountSettings, ...updates, lastUpdated: new Date().toISOString() };
};

export const fetchDeliveryAddresses = async (userId: string): Promise<DeliveryAddress[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockDeliveryAddresses;
};

export const addDeliveryAddress = async (
  userId: string,
  address: Omit<DeliveryAddress, 'id'>
): Promise<DeliveryAddress> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newAddress: DeliveryAddress = {
    ...address,
    id: `addr_${Date.now()}`,
  };
  
  return newAddress;
};

export const updateDeliveryAddress = async (
  addressId: string,
  updates: Partial<DeliveryAddress>
): Promise<DeliveryAddress> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const address = mockDeliveryAddresses.find(addr => addr.id === addressId);
  if (!address) throw new Error('Address not found');
  
  return { ...address, ...updates };
};

export const deleteDeliveryAddress = async (addressId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  // In real app, this would delete the address from the server
  console.log(`Address ${addressId} deleted`);
};

export const fetchPaymentMethods = async (userId: string) => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    cards: mockSavedCards,
    bankAccounts: mockSavedBankAccounts,
  };
};

// Helper Functions
export const getCategoryIcon = (categoryId: string): string => {
  const category = accountSettingsCategories.find(cat => cat.id === categoryId);
  return category?.icon || 'settings-outline';
};

export const formatAccountSettings = (settings: AccountSettings) => {
  return {
    ...settings,
    formattedLastUpdated: new Date(settings.lastUpdated).toLocaleDateString(),
    addressCount: settings.delivery.savedAddresses.length,
    paymentMethodCount: settings.payment.savedCards.length + settings.payment.savedBankAccounts.length,
  };
};

export const validateDeliveryAddress = (address: Partial<DeliveryAddress>): string[] => {
  const errors: string[] = [];
  
  if (!address.addressLine1?.trim()) {
    errors.push('Street address is required');
  }
  
  if (!address.city?.trim()) {
    errors.push('City is required');
  }
  
  if (!address.state?.trim()) {
    errors.push('State is required');
  }
  
  if (!address.postalCode?.trim()) {
    errors.push('Postal code is required');
  }
  
  return errors;
};

export const getSettingsCategoryForTab = (tab: AccountTabType): AccountSettingsCategory[] => {
  switch (tab) {
    case 'CUSTOMER_SUPPORT':
      return customerSupportCategories;
    case 'NOTIFICATIONS':
      return notificationCategories;
    case 'SETTINGS':
    default:
      return accountSettingsCategories;
  }
};