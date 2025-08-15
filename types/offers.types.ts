export interface Offer {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  originalPrice?: number;
  discountedPrice?: number;
  cashBackPercentage: number;
  distance: string;
  category: string;
  isNew?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isSpecial?: boolean;
  description?: string;
  store: {
    name: string;
    rating?: number;
    verified?: boolean;
  };
}

export interface OfferSection {
  id: string;
  title: string;
  subtitle?: string;
  offers: Offer[];
  viewAllEnabled: boolean;
  backgroundColor?: string;
  titleColor?: string;
}

export interface OfferCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  offers: Offer[];
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaAction: string;
  backgroundColor: string;
}

export interface OffersPageData {
  heroBanner: HeroBanner;
  sections: OfferSection[];
  categories: OfferCategory[];
  userPoints: number;
}

export interface OfferFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  cashBackMin?: number;
  distance?: string;
  sortBy?: 'distance' | 'cashback' | 'price' | 'newest';
}

export interface OfferState {
  offers: OffersPageData | null;
  loading: boolean;
  error: string | null;
  filters: OfferFilters;
  favorites: string[];
}