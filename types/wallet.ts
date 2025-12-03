import { ImageSourcePropType } from 'react-native';

// Core Wallet Types
export interface CoinBalance {
  id: string;
  type: 'wasil' | 'promotion' | 'cashback' | 'reward';
  name: string;
  amount: number;
  currency: string;
  formattedAmount: string;
  description: string;
  iconPath: ImageSourcePropType;
  backgroundColor: string;
  isActive: boolean;
  expiryDate?: Date;
  restrictions?: string[];
  earnedDate?: Date;
  lastUsed?: Date;
}

export interface WalletTransaction {
  id: string;
  type: 'earned' | 'spent' | 'expired' | 'bonus';
  coinType: 'wasil' | 'promotion' | 'cashback' | 'reward';
  amount: number;
  currency: string;
  formattedAmount: string;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  merchantName?: string;
  orderId?: string;
  balanceAfter: number;
}

export interface WalletData {
  userId: string;
  totalBalance: number;
  availableBalance: number; // Actual wallet balance (excludes paybill)
  currency: string;
  formattedTotalBalance: string;
  coins: CoinBalance[];
  recentTransactions: WalletTransaction[];
  lastUpdated: Date;
  isActive: boolean;
}

// Component Props Types
export interface WalletBalanceCardProps {
  coin: CoinBalance;
  onPress?: (coin: CoinBalance) => void;
  isLoading?: boolean;
  showChevron?: boolean;
  testID?: string;
}

export interface WalletScreenProps {
  userId?: string;
  onNavigateBack?: () => void;
  onCoinPress?: (coin: CoinBalance) => void;
  onTransactionPress?: (transaction: WalletTransaction) => void;
}

// State Management Types
export interface WalletState {
  data: WalletData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: WalletError | null;
  lastFetched: Date | null;
}

export interface WalletError {
  code: 'NETWORK_ERROR' | 'SERVER_ERROR' | 'PARSING_ERROR' | 'UNAUTHORIZED' | 'TIMEOUT';
  message: string;
  details?: string;
  timestamp: Date;
  recoverable: boolean;
}

// API Types
export interface WalletApiResponse {
  success: boolean;
  data: WalletData;
  message?: string;
  error?: string;
}

export interface RefreshWalletRequest {
  userId: string;
  forceRefresh?: boolean;
}

// Utility Types
export type CoinType = 'wasil' | 'promotion' | 'cashback' | 'reward';
export type TransactionType = 'earned' | 'spent' | 'expired' | 'bonus';
export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type WalletErrorCode = 'NETWORK_ERROR' | 'SERVER_ERROR' | 'PARSING_ERROR' | 'UNAUTHORIZED' | 'TIMEOUT';

// Constants
export const COIN_TYPES: Record<CoinType, { name: string; color: string; icon: string }> = {
  wasil: {
    name: 'Wasil Coin',
    color: '#FFE9A9',
    icon: 'wasil-coin.png'
  },
  promotion: {
    name: 'Promotion Coins',
    color: '#E8F4FD',
    icon: 'promo-coin.png'
  },
  cashback: {
    name: 'Cashback Coins',
    color: '#F0FDF4',
    icon: 'cashback-coin.png'
  },
  reward: {
    name: 'Reward Coins',
    color: '#FDF2F8',
    icon: 'reward-coin.png'
  }
};

export const DEFAULT_CURRENCY = '₹';
export const DEFAULT_LOCALE = 'en-IN';
