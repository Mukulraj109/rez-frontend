import { 
  Notification, 
  Project, 
  Category, 
  ProjectStatus, 
  EarningsData, 
  ReferralData, 
  WalletInfo 
} from '@/types/earnPage.types';
import { CATEGORY_COLOR_MAP } from '@/constants/EarnPageColors';

// Mock Notifications Data
export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Easily high-value Angel One',
    description: 'New high-paying project available for Angel One account setup',
    type: 'info',
    isRead: false,
    createdAt: '2025-08-19T10:30:00Z',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Last applied project',
    description: 'Your application for Graphics Design project is under review',
    type: 'warning',
    isRead: false,
    createdAt: '2025-08-19T09:15:00Z',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Next recommended project',
    description: 'Based on your skills, we recommend the UGC Content project',
    type: 'success',
    isRead: false,
    createdAt: '2025-08-19T08:45:00Z',
    priority: 'medium',
  },
];

// Mock Project Status Data
export const mockProjectStatus: ProjectStatus = {
  completeNow: 2,
  inReview: 0,
  completed: 0,
};

// Mock Earnings Data
export const mockEarningsData: EarningsData = {
  totalEarned: 1,
  breakdown: {
    projects: 0,
    referrals: 0,
    shareAndEarn: 0,
    spin: 1,
  },
  currency: '₹',
};

// Mock Recent Projects Data
export const mockRecentProjects: Project[] = [
  {
    id: '1',
    title: 'Open a Tank One account and earn',
    description: 'Create a new Tank One account and complete verification process',
    payment: 180,
    duration: '15 Min',
    status: 'available',
    category: 'finance',
    difficulty: 'easy',
    requirements: ['Valid phone number', 'Valid ID proof'],
    createdAt: '2025-08-19T10:00:00Z',
  },
  {
    id: '2',
    title: 'Open a Tank One account and earn',
    description: 'Create a new Tank One account and complete verification process',
    payment: 180,
    duration: '15 Min',
    status: 'available',
    category: 'finance',
    difficulty: 'easy',
    requirements: ['Valid phone number', 'Valid ID proof'],
    createdAt: '2025-08-19T09:30:00Z',
  },
  {
    id: '3',
    title: 'Open a Tank One account and earn',
    description: 'Create a new Tank One account and complete verification process',
    payment: 180,
    duration: '15 Min',
    status: 'available',
    category: 'finance',
    difficulty: 'easy',
    requirements: ['Valid phone number', 'Valid ID proof'],
    createdAt: '2025-08-19T09:00:00Z',
  },
  {
    id: '4',
    title: 'Open a Tank One account and earn',
    description: 'Create a new Tank One account and complete verification process',
    payment: 180,
    duration: '15 Min',
    status: 'available',
    category: 'finance',
    difficulty: 'easy',
    requirements: ['Valid phone number', 'Valid ID proof'],
    createdAt: '2025-08-19T08:30:00Z',
  },
  {
    id: '5',
    title: 'Open a Tank One account and earn',
    description: 'Create a new Tank One account and complete verification process',
    payment: 180,
    duration: '15 Min',
    status: 'available',
    category: 'finance',
    difficulty: 'easy',
    requirements: ['Valid phone number', 'Valid ID proof'],
    createdAt: '2025-08-19T08:00:00Z',
  },
];

// Mock Categories Data (based on screenshots)
export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Review',
    icon: 'create-outline',
    color: 'purple',
    description: 'Write reviews for products and services',
    projectCount: 25,
    averagePayment: 50,
    isActive: true,
  },
  {
    id: '2',
    name: 'Social Share',
    icon: 'share-social',
    color: 'teal',
    description: 'Share content on social media platforms',
    projectCount: 18,
    averagePayment: 30,
    isActive: true,
  },
  {
    id: '3',
    name: 'UGC Content',
    icon: 'videocam',
    color: 'pink',
    description: 'Create user-generated content',
    projectCount: 15,
    averagePayment: 100,
    isActive: true,
  },
  {
    id: '4',
    name: 'Research',
    icon: 'search',
    color: 'pink',
    description: 'Conduct market research and data collection',
    projectCount: 12,
    averagePayment: 75,
    isActive: true,
  },
  {
    id: '5',
    name: 'Games',
    icon: 'game-controller',
    color: 'purple',
    description: 'Test games and provide feedback',
    projectCount: 20,
    averagePayment: 40,
    isActive: true,
  },
  {
    id: '6',
    name: 'Sales',
    icon: 'trending-up',
    color: 'teal',
    description: 'Sales and lead generation activities',
    projectCount: 30,
    averagePayment: 120,
    isActive: true,
  },
  {
    id: '7',
    name: 'Video Creation',
    icon: 'videocam-outline',
    color: 'purple',
    description: 'Create and edit video content',
    projectCount: 8,
    averagePayment: 200,
    isActive: true,
  },
  {
    id: '8',
    name: 'Website Design',
    icon: 'desktop-outline',
    color: 'teal',
    description: 'Design and develop websites',
    projectCount: 10,
    averagePayment: 300,
    isActive: true,
  },
  {
    id: '9',
    name: 'Social Media Marketing',
    icon: 'megaphone-outline',
    color: 'pink',
    description: 'Manage social media marketing campaigns',
    projectCount: 15,
    averagePayment: 150,
    isActive: true,
  },
  {
    id: '10',
    name: 'Mobile App Development',
    icon: 'phone-portrait-outline',
    color: 'pink',
    description: 'Develop mobile applications',
    projectCount: 5,
    averagePayment: 500,
    isActive: true,
  },
  {
    id: '11',
    name: 'Website Design',
    icon: 'code-slash-outline',
    color: 'purple',
    description: 'Frontend and backend web development',
    projectCount: 12,
    averagePayment: 350,
    isActive: true,
  },
  {
    id: '12',
    name: 'Video Creation',
    icon: 'film-outline',
    color: 'teal',
    description: 'Professional video production',
    projectCount: 7,
    averagePayment: 250,
    isActive: true,
  },
  {
    id: '13',
    name: 'Sales',
    icon: 'cash-outline',
    color: 'purple',
    description: 'B2B and B2C sales activities',
    projectCount: 22,
    averagePayment: 180,
    isActive: true,
  },
  {
    id: '14',
    name: 'Voice Over',
    icon: 'mic-outline',
    color: 'teal',
    description: 'Professional voice recording services',
    projectCount: 9,
    averagePayment: 100,
    isActive: true,
  },
  {
    id: '15',
    name: 'Influencer',
    icon: 'star-outline',
    color: 'pink',
    description: 'Influencer marketing and brand promotion',
    projectCount: 18,
    averagePayment: 400,
    isActive: true,
  },
  {
    id: '16',
    name: 'Graphics Design',
    icon: 'color-palette-outline',
    color: 'pink',
    description: 'Create graphics and visual designs',
    projectCount: 25,
    averagePayment: 80,
    isActive: true,
  },
  {
    id: '17',
    name: 'Meme marketing',
    icon: 'happy-outline',
    color: 'purple',
    description: 'Create viral meme content for marketing',
    projectCount: 30,
    averagePayment: 60,
    isActive: true,
  },
  {
    id: '18',
    name: 'Brand storyteller',
    icon: 'library-outline',
    color: 'teal',
    description: 'Create compelling brand stories',
    projectCount: 12,
    averagePayment: 200,
    isActive: true,
  },
];

// Mock Referral Data
export const mockReferralData: ReferralData = {
  totalReferrals: 5,
  totalEarningsFromReferrals: 250,
  pendingReferrals: 2,
  referralBonus: 50,
  referralLink: 'https://rez-app.com/ref/user123',
};

// Mock Wallet Info
export const mockWalletInfo: WalletInfo = {
  balance: 1,
  pendingBalance: 180,
  totalWithdrawn: 0,
  lastTransaction: {
    id: 'tx_001',
    amount: 1,
    type: 'earned',
    date: '2025-08-19T10:30:00Z',
    description: 'Spin reward',
  },
};

// API Mock Functions
export const fetchEarnPageData = async (): Promise<any> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    data: {
      notifications: mockNotifications,
      projectStatus: mockProjectStatus,
      earnings: mockEarningsData,
      recentProjects: mockRecentProjects,
      categories: mockCategories,
      referralData: mockReferralData,
      walletInfo: mockWalletInfo,
    },
    timestamp: new Date().toISOString(),
  };
};

export const fetchRecentProjects = async (limit = 10): Promise<Project[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockRecentProjects.slice(0, limit);
};

export const fetchCategories = async (): Promise<Category[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockCategories;
};

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  // In real app, this would call API to mark notification as read
  return true;
};

export const startProject = async (projectId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // In real app, this would call API to start the project
  return true;
};

export const shareReferralLink = async (): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockReferralData.referralLink;
};