/**
 * HomeTabContext
 *
 * Provides shared state for the active tab (near-u, mall, cash, prive)
 * Used by BottomNavigation and HomeTabSection components.
 *
 * Tab configurations:
 * - near-u (default): Rewards Near You - local offers, everyday savings
 * - mall: ReZ Mall - curated brands, premium shopping
 * - cash: Cash Store - cashback focus, money-back deals
 * - prive: Privé - exclusive, reputation-based access (6-pillar system)
 *
 * Features:
 * - AsyncStorage persistence for last used tab
 * - Privé eligibility integration
 * - Backward compatibility with old 3-tab API
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabId } from '@/components/homepage/HomeTabSection';

// Storage key
const TAB_STORAGE_KEY = '@rez_active_tab';

// Legacy type alias for backward compatibility
export type HomeTabId = 'rez' | 'rez-mall' | 'cash-store';

// Tab mapping for backward compatibility
const TAB_TO_LEGACY: Record<TabId, HomeTabId> = {
  'near-u': 'rez',
  'mall': 'rez-mall',
  'cash': 'cash-store',
  'prive': 'rez', // Privé defaults to rez for bottom nav
};

const LEGACY_TO_TAB: Record<HomeTabId, TabId> = {
  'rez': 'near-u',
  'rez-mall': 'mall',
  'cash-store': 'cash',
};

// Privé eligibility interface
interface PriveEligibility {
  isEligible: boolean;
  score: number;
  tier: 'none' | 'entry' | 'elite';
  pillars: any[];
  trustScore: number;
  hasSeenGlowThisSession: boolean;
}

const DEFAULT_PRIVE_ELIGIBILITY: PriveEligibility = {
  isEligible: false,
  score: 0,
  tier: 'none',
  pillars: [],
  trustScore: 0,
  hasSeenGlowThisSession: false,
};

interface HomeTabContextType {
  // New 4-tab API
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isLoaded: boolean;
  isTransitioning: boolean;

  // Privé eligibility
  priveEligibility: PriveEligibility;
  isPriveEligible: boolean;
  refreshPriveEligibility: () => Promise<void>;
  markPriveGlowSeen: () => void;

  // Tab-specific flags (new API)
  isNearUActive: boolean;
  isMallActive: boolean;
  isCashActive: boolean;
  isPriveActive: boolean;

  // Legacy API (backward compatibility)
  activeHomeTab: HomeTabId;
  setActiveHomeTab: (tab: HomeTabId) => void;
  isRezMallActive: boolean;
  isCashStoreActive: boolean;

  // Scroll to top functionality
  scrollToTop: () => void;
  registerScrollToTop: (callback: () => void) => void;
}

const HomeTabContext = createContext<HomeTabContextType | undefined>(undefined);

interface HomeTabProviderProps {
  children: ReactNode;
}

export const HomeTabProvider: React.FC<HomeTabProviderProps> = ({ children }) => {
  // State
  const [activeTab, setActiveTabState] = useState<TabId>('near-u');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [priveEligibility, setPriveEligibility] = useState<PriveEligibility>(DEFAULT_PRIVE_ELIGIBILITY);
  const [hasSeenGlow, setHasSeenGlow] = useState(false);

  // Scroll to top callback ref
  const scrollToTopCallbackRef = React.useRef<(() => void) | null>(null);

  // Load persisted tab on mount
  useEffect(() => {
    const loadPersistedTab = async () => {
      try {
        const storedTab = await AsyncStorage.getItem(TAB_STORAGE_KEY);
        if (storedTab && ['near-u', 'mall', 'cash', 'prive'].includes(storedTab)) {
          setActiveTabState(storedTab as TabId);
        }
      } catch (error) {
        console.warn('[HomeTabContext] Failed to load persisted tab:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadPersistedTab();
  }, []);

  // Set active tab with persistence
  const setActiveTab = useCallback(
    async (tab: TabId) => {
      // Allow switching to Privé tab - content will show based on eligibility
      // (Previously blocked non-eligible users, but now we show rich content for all)

      // Set transitioning state for animations
      setIsTransitioning(true);

      // Update state immediately
      setActiveTabState(tab);

      // Persist to storage
      try {
        await AsyncStorage.setItem(TAB_STORAGE_KEY, tab);
      } catch (error) {
        console.warn('[HomeTabContext] Failed to persist tab:', error);
      }

      // End transition after animation duration
      setTimeout(() => {
        setIsTransitioning(false);
      }, 250);
    },
    []
  );

  // Refresh Privé eligibility (placeholder - integrate with backend)
  const refreshPriveEligibility = useCallback(async () => {
    // TODO: Fetch from backend API /api/prive/eligibility
    console.log('[HomeTabContext] Refreshing Privé eligibility...');
  }, []);

  // Mark Privé glow as seen
  const markPriveGlowSeen = useCallback(() => {
    setHasSeenGlow(true);
    setPriveEligibility(prev => ({
      ...prev,
      hasSeenGlowThisSession: true,
    }));
  }, []);

  // Tab-specific flags (new API)
  const isNearUActive = activeTab === 'near-u';
  const isMallActive = activeTab === 'mall';
  const isCashActive = activeTab === 'cash';
  const isPriveActive = activeTab === 'prive';

  // Legacy API (backward compatibility)
  const activeHomeTab = TAB_TO_LEGACY[activeTab];
  const isRezMallActive = activeTab === 'mall';
  const isCashStoreActive = activeTab === 'cash';

  // Legacy setter (maps to new API)
  const setActiveHomeTab = useCallback(
    (tab: HomeTabId) => {
      const newTab = LEGACY_TO_TAB[tab] || 'near-u';
      setActiveTab(newTab);
    },
    [setActiveTab]
  );

  // Scroll to top functionality
  const registerScrollToTop = useCallback((callback: () => void) => {
    scrollToTopCallbackRef.current = callback;
  }, []);

  const scrollToTop = useCallback(() => {
    if (scrollToTopCallbackRef.current) {
      scrollToTopCallbackRef.current();
    }
  }, []);

  const contextValue: HomeTabContextType = {
    // New API
    activeTab,
    setActiveTab,
    isLoaded,
    isTransitioning,

    // Privé
    priveEligibility: {
      ...priveEligibility,
      hasSeenGlowThisSession: hasSeenGlow,
    },
    isPriveEligible: priveEligibility.isEligible,
    refreshPriveEligibility,
    markPriveGlowSeen,

    // Tab flags (new)
    isNearUActive,
    isMallActive,
    isCashActive,
    isPriveActive,

    // Legacy API
    activeHomeTab,
    setActiveHomeTab,
    isRezMallActive,
    isCashStoreActive,

    // Scroll to top
    scrollToTop,
    registerScrollToTop,
  };

  return (
    <HomeTabContext.Provider value={contextValue}>
      {children}
    </HomeTabContext.Provider>
  );
};

/**
 * Hook to access tab context
 */
export const useHomeTab = (): HomeTabContextType => {
  const context = useContext(HomeTabContext);
  if (!context) {
    throw new Error('useHomeTab must be used within a HomeTabProvider');
  }
  return context;
};

export default HomeTabContext;
