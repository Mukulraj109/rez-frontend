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
    console.log('🔥 [HANDLE ITEM PRESS] Called with:', { sectionId, itemId: item.id, itemType: item.type });
    
    // Track click
    actions.trackItemClick(sectionId, item.id);
    
    try {
      // For "Just for you" and "New Arrivals" sections, navigate to dynamic StorePage
      if (sectionId === 'just_for_you' || sectionId === 'new_arrivals') {
        console.log('✅ [DYNAMIC NAVIGATION] Condition matched! Processing dynamic navigation...');
        console.log(`Navigate to dynamic StorePage from ${sectionId}:`, item.id);
        console.log('Original item data:', item);
        
        // Pass complete item data to StorePage for dynamic content
        try {
          // Extract price from complex price object
          let extractedPrice = 999; // default
          if (item.price) {
            if (typeof item.price === 'number') {
              extractedPrice = item.price;
            } else if (typeof item.price === 'object') {
              // Handle price objects like { current: 8999, original: 12999, ... }
              extractedPrice = item.price.current || item.price.amount || 999;
            } else if (typeof item.price === 'string') {
              extractedPrice = parseFloat(item.price) || 999;
            }
          }

          // Extract rating from complex rating object
          let extractedRating = 4.5; // default
          if (item.rating) {
            if (typeof item.rating === 'number') {
              extractedRating = item.rating;
            } else if (typeof item.rating === 'object') {
              // Handle rating objects like { value: 4.6, count: 567 }
              extractedRating = item.rating.value || 4.5;
            } else if (typeof item.rating === 'string') {
              extractedRating = parseFloat(item.rating) || 4.5;
            }
          }

          const cardData = {
            id: item.id,
            title: item.title || item.name,
            description: item.description,
            image: item.image,
            price: extractedPrice,
            rating: extractedRating,
            category: item.category,
            merchant: item.merchant || item.store || item.brand,
            type: item.type,
            section: sectionId,
            // Include original price structure for reference
            originalPrice: item.price,
            originalRating: item.rating
            // Don't spread the item object since it overwrites our extracted values
          };

          console.log('Extracted cardData for StorePage:', {
            extractedPrice,
            extractedRating,
            finalPrice: cardData.price,
            finalRating: cardData.rating,
            title: cardData.title,
            merchant: cardData.merchant
          });

          router.push({
            pathname: '/StorePage',
            params: {
              cardId: item.id,
              cardType: sectionId,
              cardData: JSON.stringify(cardData)
            }
          });
        } catch (error) {
          console.error('Failed to serialize card data:', error);
          // Fallback to basic navigation
          router.push('/StorePage');
        }
        return;
      }

      // Store sections navigation to dynamic MainStorePage  
      if (sectionId === 'trending_stores' || sectionId === 'new_stores' || sectionId === 'top_stores') {
        console.log(`✅ [STORE NAVIGATION] Navigate to dynamic MainStorePage from ${sectionId}:`, item.id);
        console.log('Store data:', item);
        
        // Pass complete store data to MainStorePage for dynamic content
        try {
          // Extract store data for MainStorePage
          const storeData = {
            id: item.id,
            name: item.name || item.title,
            title: item.title || item.name,
            description: item.description,
            image: item.image,
            logo: item.logo,
            // Extract rating from complex rating object
            rating: typeof item.rating === 'object' ? item.rating.value || 4.5 : item.rating || 4.5,
            ratingCount: typeof item.rating === 'object' ? item.rating.count || 0 : 0,
            // Extract cashback info
            cashback: item.cashback,
            category: item.category,
            location: item.location,
            deliveryTime: item.deliveryTime,
            minimumOrder: item.minimumOrder,
            isTrending: item.isTrending,
            isPartner: item.isPartner,
            partnerLevel: item.partnerLevel,
            discount: item.discount,
            backgroundColor: item.backgroundColor,
            brandName: item.brandName,
            type: item.type,
            section: sectionId,
            // Include original data for reference
            originalData: item
          };

          console.log('Extracted store data for MainStorePage:', {
            name: storeData.name,
            category: storeData.category,
            rating: storeData.rating,
            section: sectionId
          });

          router.push({
            pathname: '/MainStorePage',
            params: {
              storeId: item.id,
              storeType: sectionId,
              storeData: JSON.stringify(storeData)
            }
          });
        } catch (error) {
          console.error('Failed to serialize store data:', error);
          // Fallback to basic navigation
          router.push('/MainStorePage');
        }
        return;
      }

      // Events section navigation to dynamic EventPage
      if (sectionId === 'events' || item.type === 'event') {
        console.log('✅ [EVENT NAVIGATION] Navigate to dynamic EventPage:', item.id);
        console.log('Event data:', item);
        
        // Pass complete event data to EventPage for dynamic content
        try {
          const eventData = {
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            description: item.description,
            image: item.image,
            price: item.price,
            location: item.location,
            date: item.date,
            time: item.time,
            category: item.category,
            organizer: item.organizer,
            isOnline: item.isOnline,
            registrationRequired: item.registrationRequired,
            bookingUrl: item.bookingUrl, // For online events
            availableSlots: item.availableSlots, // For offline events
            type: item.type,
            section: sectionId,
            originalData: item
          };

          console.log('Extracted event data for EventPage:', {
            title: eventData.title,
            isOnline: eventData.isOnline,
            price: eventData.price,
            section: sectionId
          });

          router.push({
            pathname: '/EventPage',
            params: {
              eventId: item.id,
              eventType: sectionId,
              eventData: JSON.stringify(eventData)
            }
          });
        } catch (error) {
          console.error('Failed to serialize event data:', error);
          // Fallback to basic navigation
          router.push('/EventPage');
        }
        return;
      }

      // Original navigation logic for other sections
      switch (item.type) {
        case 'event':
          // Fallback for events not from events section
          console.log('Navigate to event (fallback):', item.id);
          router.push('/EventPage');
          break;
        case 'store':
          // Navigate to store page (fallback)
          console.log('Navigate to store:', item.id);
          router.push('/StorePage');
          break;
        case 'product':
          // Navigate to product detail
          console.log('Navigate to product:', item.id);
          router.push(`/product/${item.id}`);
          break;
        case 'branded_store':
          // Navigate to brand store (fallback)
          console.log('Navigate to brand store:', item.id);
          router.push('/MainStorePage');
          break;
        default:
          console.log('❓ [DEFAULT NAVIGATION] Navigate to item:', item.id, 'from section:', sectionId);
          // Fallback navigation to dynamic StorePage with item data
          router.push({
            pathname: '/StorePage',
            params: {
              cardId: item.id,
              cardType: sectionId,
              cardData: JSON.stringify(item)
            }
          });
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