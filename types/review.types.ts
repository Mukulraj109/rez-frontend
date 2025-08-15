export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  text: string;
  cashbackEarned: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CashbackEarning {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  amount: number;
  productId: string;
  reviewId: string;
  createdAt: Date;
  status: 'pending' | 'credited' | 'failed';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  averageRating: number;
  totalReviews: number;
  cashbackPercentage: number;
}

export interface ReviewFormData {
  rating: number;
  text: string;
}

export interface ReviewSubmissionResponse {
  success: boolean;
  reviewId?: string;
  cashbackAmount?: number;
  message?: string;
  error?: string;
}

export interface RecentCashbackResponse {
  earnings: CashbackEarning[];
  totalCount: number;
}

// Mock data interfaces
export interface MockReviewData {
  recentEarnings: CashbackEarning[];
  productInfo: Product;
}