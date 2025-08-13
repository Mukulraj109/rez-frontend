// types/cart.ts - TypeScript definitions for Cart functionality

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string | number; // string for URL, number for require()
  cashback: string;
  category: 'products' | 'service';
}

export interface CartState {
  products: CartItem[];
  services: CartItem[];
  activeTab: 'products' | 'service';
}

export type TabType = 'products' | 'service';

// Component Props Interfaces
export interface CartPageProps {
  navigation?: any; // React Navigation type
  route?: any;
}

export interface CartHeaderProps {
  onBack: () => void;
  title?: string;
}

export interface SlidingTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  tabs?: TabData[];
}

export interface TabData {
  key: TabType;
  title: string;
  icon: string;
}

export interface CartItemProps {
  item: CartItem;
  onRemove: (id: string) => void;
  showAnimation?: boolean;
}

export interface PriceSectionProps {
  totalPrice: number;
  onBuyNow: () => void;
  itemCount?: number;
  loading?: boolean;
}

// Animation Configuration
export interface AnimationConfig {
  duration: number;
  easing: any;
  useNativeDriver: boolean;
}

// Event Handler Types
export type RemoveItemHandler = (id: string) => void;
export type TabChangeHandler = (tab: TabType) => void;
export type BuyNowHandler = () => void;

// State Updater Types
export type CartUpdater = (updater: (prev: CartState) => CartState) => void;

// Style Types
export interface ResponsiveValues {
  headerHeight: number;
  tabHeight: number;
  itemHeight: number;
  bottomHeight: number;
  padding: number;
  margin: number;
  fontSize: {
    title: number;
    subtitle: number;
    price: number;
  };
}