import { useReducer, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { 
  HomepageState, 
  HomepageAction, 
  UseHomepageDataResult,
  HomepageSection 
} from '@/types/homepage.types';
import { 
  initialHomepageState, 
  fetchHomepageData, 
  fetchSectionData 
} from '@/data/homepageData';

// Homepage Reducer
function homepageReducer(state: HomepageState, action: HomepageAction): HomepageState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case 'SET_SECTIONS':
      return {
        ...state,
        sections: action.payload,
        loading: false,
        error: null
      };

    case 'UPDATE_SECTION':
      return {
        ...state,
        sections: state.sections.map(section =>
          section.id === action.payload.sectionId
            ? { ...section, ...action.payload.section }
            : section
        )
      };

    case 'SET_USER_PREFERENCES':
      return {
        ...state,
        user: {
          ...state.user,
          preferences: action.payload
        }
      };

    case 'REFRESH_SECTION':
      return {
        ...state,
        sections: state.sections.map(section =>
          section.id === action.payload
            ? { ...section, loading: true, error: null }
            : section
        )
      };

    case 'SET_LAST_REFRESH':
      return {
        ...state,
        lastRefresh: action.payload
      };

    default:
      return state;
  }
}

// Main Homepage Hook
export function useHomepage(): UseHomepageDataResult {
  const [state, dispatch] = useReducer(homepageReducer, initialHomepageState);

  // Load all homepage sections
  const refreshAllSections = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const data = await fetchHomepageData();
      
      dispatch({ type: 'SET_SECTIONS', payload: data.sections });
      dispatch({ type: 'SET_LAST_REFRESH', payload: new Date().toISOString() });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load homepage data';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, []);

  // Refresh a specific section
  const refreshSection = useCallback(async (sectionId: string) => {
    try {
      dispatch({ type: 'REFRESH_SECTION', payload: sectionId });
      
      const sectionData = await fetchSectionData(sectionId);
      
      dispatch({ 
        type: 'UPDATE_SECTION', 
        payload: { 
          sectionId, 
          section: { 
            ...sectionData,
            loading: false,
            lastUpdated: new Date().toISOString()
          } 
        } 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh section';
      dispatch({ 
        type: 'UPDATE_SECTION', 
        payload: { 
          sectionId, 
          section: { 
            loading: false,
            error: errorMessage
          } 
        } 
      });
    }
  }, []);

  // Update user preferences
  const updateUserPreferences = useCallback((preferences: string[]) => {
    dispatch({ type: 'SET_USER_PREFERENCES', payload: preferences });
  }, []);

  // Analytics tracking (placeholder for backend integration)
  const trackSectionView = useCallback((sectionId: string) => {
    // TODO: Send analytics event to backend
    console.log('Section viewed:', sectionId);
  }, []);

  const trackItemClick = useCallback((sectionId: string, itemId: string) => {
    // TODO: Send analytics event to backend
    console.log('Item clicked:', { sectionId, itemId });
  }, []);

  // Auto-refresh on mount
  useEffect(() => {
    if (state.sections.length === 0 && !state.loading) {
      refreshAllSections();
    }
  }, [refreshAllSections, state.sections.length, state.loading]);

  return {
    state,
    actions: {
      refreshAllSections,
      refreshSection,
      updateUserPreferences,
      trackSectionView,
      trackItemClick
    }
  };
}

// Individual Section Hook
export function useHomepageSection(sectionId: string) {
  const { state, actions } = useHomepage();
  
  const section = state.sections.find(s => s.id === sectionId);
  
  const refresh = useCallback(async () => {
    await actions.refreshSection(sectionId);
  }, [actions, sectionId]);

  return {
    section: section || null,
    loading: section?.loading || false,
    error: section?.error || null,
    refresh
  };
}

// Events Section Hook
export function useEvents() {
  return useHomepageSection('events');
}

// Just for You Section Hook
export function useRecommendations() {
  return useHomepageSection('just_for_you');
}

// Trending Stores Section Hook
export function useTrendingStores() {
  return useHomepageSection('trending_stores');
}

// New Stores Section Hook
export function useNewStores() {
  return useHomepageSection('new_stores');
}

// Top Stores Section Hook
export function useTopStores() {
  return useHomepageSection('top_stores');
}

// New Arrivals Section Hook
export function useNewArrivals() {
  return useHomepageSection('new_arrivals');
}

// Helper hook for navigation actions
export function useHomepageNavigation() {
  const { actions } = useHomepage();
  const router = useRouter();

  const handleItemPress = useCallback((sectionId: string, item: any) => {
    // Track click
    actions.trackItemClick(sectionId, item.id);
    
    try {
      // Navigation logic based on item type
      switch (item.type) {
        case 'event':
          // Navigate to event detail
          console.log('Navigate to event:', item.id);
          // router.push(`/events/${item.id}`);
          break;
        case 'store':
          // Navigate to store page
          console.log('Navigate to store:', item.id);
          router.push('/StorePage');
          break;
        case 'product':
          // Navigate to product detail
          console.log('Navigate to product:', item.id);
          // router.push(`/products/${item.id}`);
          break;
        case 'branded_store':
          // Navigate to brand store
          console.log('Navigate to brand store:', item.id);
          router.push('/MainStorePage');
          break;
        default:
          console.log('Navigate to item:', item.id);
          // Fallback navigation
          router.push('/StorePage');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Prevent the animation error by ensuring navigation completes
    }
  }, [actions, router]);

  const handleAddToCart = useCallback((item: any) => {
    // Add to cart logic
    console.log('Add to cart:', item);
    // TODO: Integrate with cart context/state
  }, []);

  return {
    handleItemPress,
    handleAddToCart
  };
}

// Performance tracking hook
export function useHomepagePerformance() {
  const { state } = useHomepage();
  
  const getLoadingStats = useCallback(() => {
    const totalSections = state.sections.length;
    const loadingSections = state.sections.filter(s => s.loading).length;
    const errorSections = state.sections.filter(s => s.error).length;
    
    return {
      total: totalSections,
      loading: loadingSections,
      errors: errorSections,
      loaded: totalSections - loadingSections - errorSections
    };
  }, [state.sections]);

  const getSectionPerformance = useCallback((sectionId: string) => {
    const section = state.sections.find(s => s.id === sectionId);
    
    if (!section) return null;
    
    return {
      id: section.id,
      itemCount: section.items.length,
      lastUpdated: section.lastUpdated,
      isLoading: section.loading,
      hasError: !!section.error,
      refreshable: section.refreshable
    };
  }, [state.sections]);

  return {
    getLoadingStats,
    getSectionPerformance,
    lastRefresh: state.lastRefresh
  };
}