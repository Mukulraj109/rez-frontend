import {
  PartnerProfile,
  PartnerLevel,
  PartnerBenefit,
  OrderMilestone,
  RewardItem,
  RewardTask,
  JackpotMilestone,
  ClaimableOffer,
  FAQItem,
  PartnerDashboardData,
} from '@/types/partner.types';

// Partner Levels Configuration
export const partnerLevels: PartnerLevel[] = [
  {
    id: 'level-1',
    name: 'Partner',
    level: 1,
    requirements: {
      orders: 15,
      timeframe: 44, // days
    },
    benefits: [
      {
        id: 'benefit-1-1',
        name: 'Cashback',
        description: 'Up to 10% cashback on orders',
        type: 'cashback',
        value: 10,
        icon: 'cash-outline',
        isActive: true,
      },
      {
        id: 'benefit-1-2',
        name: 'Birthday Discount',
        description: '15% off on birthday month',
        type: 'discount',
        value: 15,
        icon: 'gift-outline',
        isActive: true,
      },
    ],
    color: '#8B5CF6',
    icon: 'star-outline',
  },
  {
    id: 'level-2',
    name: 'Influencer',
    level: 2,
    requirements: {
      orders: 45,
      timeframe: 44,
    },
    benefits: [
      {
        id: 'benefit-2-1',
        name: 'Cashback',
        description: 'Up to 15% cashback on orders',
        type: 'cashback',
        value: 15,
        icon: 'cash-outline',
        isActive: true,
      },
      {
        id: 'benefit-2-2',
        name: 'Birthday Discount',
        description: '20% off on birthday month',
        type: 'discount',
        value: 20,
        icon: 'gift-outline',
        isActive: true,
      },
      {
        id: 'benefit-2-3',
        name: 'Free Delivery',
        description: 'Free delivery on all orders',
        type: 'freebie',
        value: 'Free',
        icon: 'bicycle-outline',
        isActive: true,
      },
    ],
    color: '#10B981',
    icon: 'trophy-outline',
  },
  {
    id: 'level-3',
    name: 'Ambassador',
    level: 3,
    requirements: {
      orders: 100,
      timeframe: 90,
    },
    benefits: [
      {
        id: 'benefit-3-1',
        name: 'Cashback',
        description: 'Up to 20% cashback on orders',
        type: 'cashback',
        value: 20,
        icon: 'cash-outline',
        isActive: true,
      },
      {
        id: 'benefit-3-2',
        name: 'VIP Support',
        description: 'Priority customer support',
        type: 'special',
        value: 'VIP',
        icon: 'headset-outline',
        isActive: true,
      },
      {
        id: 'benefit-3-3',
        name: 'Exclusive Access',
        description: 'Early access to sales and products',
        type: 'special',
        value: 'Exclusive',
        icon: 'lock-open-outline',
        isActive: true,
      },
    ],
    color: '#F59E0B',
    icon: 'medal-outline',
  },
];

// Sample Partner Profile
export const samplePartnerProfile: PartnerProfile = {
  id: 'partner-001',
  name: 'Rajaul',
  email: 'rajaul@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  level: partnerLevels[0], // Partner level
  joinDate: '2024-01-15',
  validUntil: '15 Feb 25',
  totalOrders: 12,
  ordersThisLevel: 12,
  daysRemaining: 44,
  currentBenefits: ['10% Cashback', 'Birthday Discount', 'Exclusive Offers'],
};

// Order Milestones
export const orderMilestones: OrderMilestone[] = [
  {
    id: 'milestone-5',
    orderNumber: 5,
    isCompleted: true,
    isLocked: false,
    reward: {
      id: 'reward-5',
      title: '₹50 Cashback',
      description: 'Congratulations on your 5th order!',
      type: 'cashback',
      value: 50,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop',
      isClaimed: true,
    },
  },
  {
    id: 'milestone-10',
    orderNumber: 10,
    isCompleted: true,
    isLocked: false,
    reward: {
      id: 'reward-10',
      title: 'Free Delivery Voucher',
      description: 'Free delivery for your next 3 orders',
      type: 'discount',
      value: '3 Orders',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
      validUntil: '2025-03-15',
      isClaimed: false,
    },
  },
  {
    id: 'milestone-15',
    orderNumber: 15,
    isCompleted: false,
    isLocked: false,
    reward: {
      id: 'reward-15',
      title: '₹200 Shopping Voucher',
      description: 'Use on any purchase above ₹500',
      type: 'discount',
      value: 200,
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&h=100&fit=crop',
      isClaimed: false,
    },
  },
  {
    id: 'milestone-20',
    orderNumber: 20,
    isCompleted: false,
    isLocked: true,
    reward: {
      id: 'reward-20',
      title: 'Premium Gift Box',
      description: 'Exclusive curated premium products',
      type: 'product',
      value: '₹1000 Value',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&h=100&fit=crop',
      isClaimed: false,
    },
  },
];

// Reward Tasks
export const rewardTasks: RewardTask[] = [
  {
    id: 'task-review',
    title: 'Write Product Reviews',
    description: 'Review 3 products you\'ve purchased',
    type: 'review',
    reward: {
      id: 'task-reward-1',
      title: '₹25 Cashback',
      description: 'For each review',
      type: 'cashback',
      value: 25,
      isClaimed: false,
    },
    isCompleted: false,
    progress: {
      current: 1,
      target: 3,
    },
  },
  {
    id: 'task-referral',
    title: 'Refer Friends',
    description: 'Invite friends to join and shop',
    type: 'referral',
    reward: {
      id: 'task-reward-2',
      title: '₹100 for each friend',
      description: 'When they make their first purchase',
      type: 'cashback',
      value: 100,
      isClaimed: false,
    },
    isCompleted: false,
    progress: {
      current: 0,
      target: 5,
    },
  },
  {
    id: 'task-social',
    title: 'Share on Social Media',
    description: 'Share your favorite products',
    type: 'social',
    reward: {
      id: 'task-reward-3',
      title: '50 Rez Points',
      description: 'For each share (max 5/day)',
      type: 'points',
      value: 50,
      isClaimed: false,
    },
    isCompleted: true,
  },
];

// Jackpot Milestones
export const jackpotMilestones: JackpotMilestone[] = [
  {
    id: 'jackpot-25k',
    amount: 25000,
    title: '₹25K Shopping Milestone',
    description: 'Shop for ₹25K & More to win our jackpot',
    isUnlocked: true,
    isCompleted: false,
    reward: {
      id: 'jackpot-reward-25k',
      title: 'iPhone 15',
      description: 'Latest iPhone with accessories',
      type: 'product',
      value: '₹79,999',
      image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&h=200&fit=crop',
      isClaimed: false,
    },
  },
  {
    id: 'jackpot-50k',
    amount: 50000,
    title: '₹50K Shopping Milestone',
    description: 'Ultimate shopping achievement',
    isUnlocked: false,
    isCompleted: false,
    reward: {
      id: 'jackpot-reward-50k',
      title: 'MacBook Air',
      description: 'Latest MacBook Air M3',
      type: 'product',
      value: '₹1,14,900',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop',
      isClaimed: false,
    },
  },
];

// Claimable Offers
export const claimableOffers: ClaimableOffer[] = [
  {
    id: 'offer-1',
    title: 'Flat 15% on clothes',
    description: 'Valid on fashion category',
    discount: '15% OFF',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&h=150&fit=crop',
    validUntil: '2025-02-28',
    termsAndConditions: [
      'Valid on minimum purchase of ₹999',
      'Cannot be combined with other offers',
      'Valid for single use only',
    ],
    isClaimed: false,
  },
  {
    id: 'offer-2',
    title: 'Flat 15% on gadgets',
    description: 'Electronics & accessories',
    discount: '15% OFF',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=150&h=150&fit=crop',
    validUntil: '2025-02-28',
    termsAndConditions: [
      'Valid on minimum purchase of ₹1999',
      'Applicable on selected brands only',
      'Valid for single use only',
    ],
    isClaimed: false,
  },
  {
    id: 'offer-3',
    title: 'Flat 15% on collection',
    description: 'Home & lifestyle products',
    discount: '15% OFF',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop',
    validUntil: '2025-02-28',
    termsAndConditions: [
      'Valid on minimum purchase of ₹799',
      'Free delivery included',
      'Valid for single use only',
    ],
    isClaimed: true,
  },
  {
    id: 'offer-4',
    title: 'Flat 15% on collection',
    description: 'Beauty & personal care',
    discount: '15% OFF',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=150&h=150&fit=crop',
    validUntil: '2025-02-28',
    termsAndConditions: [
      'Valid on minimum purchase of ₹599',
      'Applicable on premium brands',
      'Valid for single use only',
    ],
    isClaimed: false,
  },
];

// FAQ Data
export const partnerFAQs: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What is considered as a transaction?',
    answer: 'Any successful purchase made through the app counts as a transaction. This includes orders, subscriptions, and in-app purchases.',
    category: 'transactions',
  },
  {
    id: 'faq-2',
    question: 'How do I maintain my partner level?',
    answer: 'To maintain your partner level, you need to complete the required number of orders within the specified timeframe. The requirements reset every period.',
    category: 'levels',
  },
  {
    id: 'faq-3',
    question: 'When do my rewards expire?',
    answer: 'Rewards typically have a validity period mentioned in their details. Cashback rewards expire after 12 months, while discount vouchers have specific expiry dates.',
    category: 'rewards',
  },
  {
    id: 'faq-4',
    question: 'Can I combine multiple offers?',
    answer: 'Most offers cannot be combined with other promotions unless explicitly stated. Each offer has its own terms and conditions.',
    category: 'general',
  },
  {
    id: 'faq-5',
    question: 'How is cashback calculated?',
    answer: 'Cashback is calculated as a percentage of your order value after discounts. The percentage depends on your partner level and product category.',
    category: 'rewards',
  },
  {
    id: 'faq-6',
    question: 'What happens if I don\'t meet level requirements?',
    answer: 'If you don\'t meet the requirements within the timeframe, you\'ll be moved to the previous level. Your progress will reset, but you can work towards upgrading again.',
    category: 'levels',
  },
];

// Complete Dummy Data for Partner Dashboard
export const partnerDummyData: PartnerDashboardData = {
  profile: samplePartnerProfile,
  milestones: orderMilestones,
  tasks: rewardTasks,
  jackpotProgress: jackpotMilestones,
  claimableOffers: claimableOffers,
  faqs: partnerFAQs,
};

// Utility functions for data management
export const getPartnerLevelById = (levelId: string): PartnerLevel | undefined => {
  return partnerLevels.find(level => level.id === levelId);
};

export const getNextLevel = (currentLevel: number): PartnerLevel | undefined => {
  return partnerLevels.find(level => level.level === currentLevel + 1);
};

export const calculateProgressPercentage = (current: number, target: number): number => {
  return Math.min((current / target) * 100, 100);
};

export const getCompletedMilestones = (milestones: OrderMilestone[]): OrderMilestone[] => {
  return milestones.filter(milestone => milestone.isCompleted);
};

export const getUnclaimedRewards = (milestones: OrderMilestone[]): RewardItem[] => {
  return milestones
    .filter(milestone => milestone.isCompleted && milestone.reward && !milestone.reward.isClaimed)
    .map(milestone => milestone.reward!);
};

export const getAvailableOffers = (offers: ClaimableOffer[]): ClaimableOffer[] => {
  return offers.filter(offer => !offer.isClaimed);
};

export const getFAQsByCategory = (faqs: FAQItem[], category: string): FAQItem[] => {
  return faqs.filter(faq => faq.category === category);
};

// Mock API functions (for future backend integration)
export const mockPartnerAPI = {
  getPartnerProfile: async (userId: string): Promise<PartnerProfile> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return samplePartnerProfile;
  },

  getPartnerDashboard: async (userId: string): Promise<PartnerDashboardData> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    return partnerDummyData;
  },

  claimReward: async (rewardId: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, message: 'Reward claimed successfully!' };
  },

  completeTask: async (taskId: string): Promise<{ success: boolean; task: RewardTask }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const task = rewardTasks.find(t => t.id === taskId);
    if (task) {
      task.isCompleted = true;
    }
    return { success: true, task: task! };
  },
};

export default {
  partnerLevels,
  samplePartnerProfile,
  orderMilestones,
  rewardTasks,
  jackpotMilestones,
  claimableOffers,
  partnerFAQs,
  partnerDummyData,
  mockPartnerAPI,
  // Utility functions
  getPartnerLevelById,
  getNextLevel,
  calculateProgressPercentage,
  getCompletedMilestones,
  getUnclaimedRewards,
  getAvailableOffers,
  getFAQsByCategory,
};