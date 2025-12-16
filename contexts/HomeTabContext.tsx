/**
 * HomeTabContext
 *
 * Provides shared state for the active home tab (rez, rez-mall, cash-store)
 * Used by BottomNavigation to conditionally render different tabs
 *
 * Tab configurations:
 * - rez (default): Home, Categories, Pay in Store (center), Play, Earn
 * - rez-mall: Home, Explore, Pay at Store (center), Offers, Profile
 * - cash-store: Home, Wallet, Coins, Profile (4 tabs, no center button)
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type HomeTabId = 'rez' | 'rez-mall' | 'cash-store';

interface HomeTabContextType {
  activeHomeTab: HomeTabId;
  setActiveHomeTab: (tab: HomeTabId) => void;
  isRezMallActive: boolean;
  isCashStoreActive: boolean;
}

const HomeTabContext = createContext<HomeTabContextType | undefined>(undefined);

interface HomeTabProviderProps {
  children: ReactNode;
}

export const HomeTabProvider: React.FC<HomeTabProviderProps> = ({ children }) => {
  const [activeHomeTab, setActiveHomeTabState] = useState<HomeTabId>('rez');

  const setActiveHomeTab = useCallback((tab: HomeTabId) => {
    setActiveHomeTabState(tab);
  }, []);

  const isRezMallActive = activeHomeTab === 'rez-mall';
  const isCashStoreActive = activeHomeTab === 'cash-store';

  return (
    <HomeTabContext.Provider value={{ activeHomeTab, setActiveHomeTab, isRezMallActive, isCashStoreActive }}>
      {children}
    </HomeTabContext.Provider>
  );
};

export const useHomeTab = (): HomeTabContextType => {
  const context = useContext(HomeTabContext);
  if (!context) {
    throw new Error('useHomeTab must be used within a HomeTabProvider');
  }
  return context;
};

export default HomeTabContext;
