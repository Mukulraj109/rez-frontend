export interface ReferralTier {
  name: string;
  referralsRequired: number;
  badge: string;
  rewards: {
    tierBonus?: number;
    perReferral?: number;
    voucher?: {
      type: string;
      amount: number;
    };
    lifetimePremium?: boolean;
  };
}

export interface ReferralReward {
  type: 'coins' | 'voucher' | 'premium';
  amount?: number;
  voucherCode?: string;
  voucherType?: string;
  claimed: boolean;
  claimedAt?: Date;
  expiresAt?: Date;
  description?: string;
  referralId?: string;
  rewardIndex?: number;
}

export interface ReferralStats {
  totalReferrals: number;
  qualifiedReferrals: number;
  pendingReferrals: number;
  lifetimeEarnings: number;
  currentTier: string;
  currentTierData: ReferralTier;
  nextTier: string | null;
  progressToNextTier: number;
  successRate: number;
}

export interface ReferralProgress {
  currentTier: string;
  nextTier: string | null;
  nextTierData?: ReferralTier;
  progress: number;
  referralsNeeded: number;
  qualifiedReferrals: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  fullName?: string;
  avatar?: string;
  totalReferrals: number;
  lifetimeEarnings: number;
  tier: string;
}

export interface ReferralMilestone {
  tier: string;
  name: string;
  referralsRequired: number;
  referralsRemaining: number;
  rewards: ReferralTier['rewards'];
}

export interface ShareTemplate {
  type: 'whatsapp' | 'facebook' | 'twitter' | 'sms' | 'email' | 'instagram' | 'telegram';
  message: string;
  subject?: string;
  icon: string;
  color: string;
}

export const REFERRAL_TIERS: Record<string, ReferralTier> = {
  STARTER: {
    name: 'REZ Starter',
    referralsRequired: 0,
    badge: 'Starter',
    rewards: {
      perReferral: 50
    }
  },
  PRO: {
    name: 'REZ Pro',
    referralsRequired: 5,
    badge: 'Pro',
    rewards: {
      tierBonus: 500,
      perReferral: 100
    }
  },
  ELITE: {
    name: 'REZ Elite',
    referralsRequired: 10,
    badge: 'Elite',
    rewards: {
      tierBonus: 1000,
      perReferral: 150,
      voucher: { type: 'Amazon', amount: 200 }
    }
  },
  CHAMPION: {
    name: 'REZ Champion',
    referralsRequired: 20,
    badge: 'Champion',
    rewards: {
      tierBonus: 2000,
      perReferral: 200,
      voucher: { type: 'Amazon', amount: 1000 }
    }
  },
  LEGEND: {
    name: 'REZ Legend',
    referralsRequired: 50,
    badge: 'Legend',
    rewards: {
      tierBonus: 5000,
      perReferral: 300,
      voucher: { type: 'Amazon', amount: 5000 },
      lifetimePremium: true
    }
  }
};

export const TIER_COLORS: Record<string, string> = {
  STARTER: '#64748b', // Slate
  PRO: '#3b82f6',     // Blue
  ELITE: '#8b5cf6',   // Purple
  CHAMPION: '#f59e0b', // Amber
  LEGEND: '#ef4444'   // Red
};

export const TIER_GRADIENTS: Record<string, string[]> = {
  STARTER: ['#64748b', '#94a3b8'],
  PRO: ['#3b82f6', '#60a5fa'],
  ELITE: ['#8b5cf6', '#a78bfa'],
  CHAMPION: ['#f59e0b', '#fbbf24'],
  LEGEND: ['#ef4444', '#f87171']
};

export const SHARE_TEMPLATES: ShareTemplate[] = [
  {
    type: 'whatsapp',
    icon: 'logo-whatsapp',
    color: '#25D366',
    message: '🎉 Join me on REZ and get ₹30 off your first order! Use my code: {CODE}\n\n✨ Shop from top brands and stores\n💰 Earn rewards on every purchase\n\n{LINK}'
  },
  {
    type: 'facebook',
    icon: 'logo-facebook',
    color: '#1877f2',
    message: 'Just discovered REZ - amazing deals from local stores! 🛍️\n\nUse my code {CODE} to get ₹30 off your first order!\n\n{LINK}'
  },
  {
    type: 'twitter',
    icon: 'logo-twitter',
    color: '#1DA1F2',
    message: 'Loving @REZapp! 🎉 Use code {CODE} for ₹30 off your first order. {LINK}'
  },
  {
    type: 'instagram',
    icon: 'logo-instagram',
    color: '#E4405F',
    message: '💎 Shop smarter with REZ!\n\nUse code: {CODE}\nGet ₹30 off instantly!\n\n{LINK}'
  },
  {
    type: 'telegram',
    icon: 'paper-plane',
    color: '#0088cc',
    message: '🚀 Hey! Check out REZ - I\'m loving it!\n\nUse my referral code {CODE} to get ₹30 off your first order.\n\n{LINK}'
  },
  {
    type: 'sms',
    icon: 'chatbox',
    color: '#10b981',
    message: 'Hey! Join me on REZ and get ₹30 off. Use code: {CODE}\n{LINK}'
  },
  {
    type: 'email',
    icon: 'mail',
    color: '#6366f1',
    subject: 'Get ₹30 off on REZ - My referral gift for you!',
    message: 'Hi!\n\nI\'ve been using REZ to shop from local stores and get amazing deals. I thought you\'d like it too!\n\nUse my referral code {CODE} to get ₹30 off your first order.\n\n{LINK}\n\nHappy shopping!\n'
  }
];
