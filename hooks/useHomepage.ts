import { useReducer, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
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
import homepageDataService from '@/services/homepageDataService';
import { useCart } from '@/contexts/CartContext';
import { showToast } from '@/components/common/ToastManager';

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
      
      // Get base homepage data (for sections that don't need API integration)
      const data = await fetchHomepageData();
      
      // Update specific sections with backend data
      const updatedSections = await Promise.all(
        data.sections.map(async (section) => {
          if (section.id === 'events') {

            try {
              const backendSection = await homepageDataService.getEventsSection();

              return backendSection;
            } catch (error) {
              console.warn('⚠️ Failed to load "Events" from backend, using fallback:', error);
              return section; // fallback to original section
            }
          } else if (section.id === 'just_for_you') {

            try {
              const backendSection = await homepageDataService.getJustForYouSection();

              return backendSection;
            } catch (error) {
              console.warn('⚠️ Failed to load "Just for You" from backend, using fallback:', error);
              return section; // fallback to original section
            }
          } else if (section.id === 'new_arrivals') {

            try {
              const backendSection = await homepageDataService.getNewArrivalsSection();

              return backendSection;
            } catch (error) {
              console.warn('⚠️ Failed to load "New Arrivals" from backend, using fallback:', error);
              return section; // fallback to original section
            }
          } else if (section.id === 'trending_stores') {

            try {
              const backendSection = await homepageDataService.getTrendingStoresSection();

              return backendSection;
            } catch (error) {
              console.warn('⚠️ Failed to load "Trending Stores" from backend, using fallback:', error);
              return section; // fallback to original section
            }
          } else if (section.id === 'offers' || section.id === 'special_offers') {

            try {
              const backendSection = await homepageDataService.getOffersSection();

              return backendSection;
            } catch (error) {
              console.warn('⚠️ Failed to load "Offers" from backend, using fallback:', error);
              return section; // fallback to original section
            }
          } else if (section.id === 'flash_sales') {

            try {
              const backendSection = await homepageDataService.getFlashSalesSection();

              return backendSection;
            } catch (error) {
              console.warn('⚠️ Failed to load "Flash Sales" from backend, using fallback:', error);
              return section; // fallback to original section
            }
          } else {
            // Keep other sections unchanged
            return section;
          }
        })
      );
      
      dispatch({ type: 'SET_SECTIONS', payload: updatedSections });
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
      
      let sectionData: HomepageSection;
      
      // Use new backend service for specific sections
      if (sectionId === 'just_for_you') {

        sectionData = await homepageDataService.getJustForYouSection();
      } else if (sectionId === 'new_arrivals') {

        sectionData = await homepageDataService.getNewArrivalsSection();
      } else if (sectionId === 'trending_stores') {

        sectionData = await homepageDataService.getTrendingStoresSection();
      } else {
        // Use fallback for other sections
        sectionData = await fetchSectionData(sectionId);
      }
      
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

  }, []);

  const trackItemClick = useCallback((sectionId: string, itemId: string) => {
    // TODO: Send analytics event to backend

  }, []);

  // Auto-refresh on mount
  useEffect(() => {

    // Since we now have fallback data, sections.length will not be 0, so let's trigger refresh anyway

    refreshAllSections();
  }, [refreshAllSections]);

  // Debug effect to test service directly
  useEffect(() => {
    const testService = async () => {

      try {
        const justForYouSection = await homepageDataService.getJustForYouSection();

      } catch (error) {
        console.error('🧪 [HOMEPAGE HOOK] Direct service test failed:', error);
      }
    };
    
    // Run test only once
    if (state.sections.length > 0) {
      testService();
    }
  }, [state.sections.length]);

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
  const { actions: cartActions } = useCart();

  const handleItemPress = useCallback((sectionId: string, item: any) => {

    // Track click
    actions.trackItemClick(sectionId, item.id);
    
    try {
      // For "Just for you" and "New Arrivals" sections, navigate to dynamic StorePage
      if (sectionId === 'just_for_you' || sectionId === 'new_arrivals') {

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
            storeId: item.store?._id || item.store?.id || item.storeId || item.store,
            storeName: item.store?.name || item.storeName || 'Store',
            type: item.type,
            section: sectionId,
            // Include original price structure for reference
            originalPrice: item.price,
            originalRating: item.rating,
            // Include full item data for reference
            fullData: item
          };

          router.push({
            pathname: '/ProductPage',
            params: {
              cardId: item.id,
              cardType: sectionId,
              cardData: JSON.stringify(cardData)
            }
          });
        } catch (error) {
          console.error('Failed to serialize card data:', error);
          // Fallback to basic navigation
          router.push('/ProductPage');
        }
        return;
      }

      // Store sections navigation to dynamic MainStorePage  
      if (sectionId === 'trending_stores' || sectionId === 'new_stores' || sectionId === 'top_stores') {

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
          router.push('/EventPage');
          break;
        case 'store':
          // Navigate to store page (fallback)

          router.push('/StorePage' as any);
          break;
        case 'product':
          // Navigate to product detail

          router.push(`/product/${item.id}`);
          break;
        case 'branded_store':
          // Navigate to brand store (fallback)

          router.push('/MainStorePage');
          break;
        default:

          // Fallback navigation to dynamic StorePage with item data
          router.push({
            pathname: '/StorePage',
            params: {
              cardId: item.id,
              cardType: sectionId,
              cardData: JSON.stringify(item)
            }
          } as any);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Prevent the animation error by ensuring navigation completes
    }
  }, [actions, router]);

  const handleAddToCart = useCallback(async (item: any) => {
    try {
      // Extract product ID - handle both product._id and product.id formats
      const productId = item._id || item.id;

      if (!productId) {
        console.error('❌ [Add to Cart] No product ID found');
        Alert.alert('Error', 'Cannot add item to cart - invalid product');
        return;
      }

      // Extract price - handle complex price objects
      let currentPrice = 0;
      let originalPrice = 0;

      if (item.price) {
        if (typeof item.price === 'number') {
          currentPrice = item.price;
          originalPrice = item.originalPrice || item.price;
        } else if (typeof item.price === 'object') {
          currentPrice = item.price.current || item.price.amount || 0;
          originalPrice = item.price.original || item.price.current || item.price.amount || 0;
        }
      }

      // Extract image - handle multiple possible formats
      let imageUrl = '';
      if (item.image) {
        imageUrl = item.image;
      } else if (item.imageUrl) {
        imageUrl = item.imageUrl;
      } else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        imageUrl = item.images[0].url || item.images[0];
      } else if (item.images && typeof item.images === 'string') {
        imageUrl = item.images;
      }

      // Check if item already exists in cart
      const existingItem = cartActions.isItemInCart(productId);

      if (existingItem) {

      }

      // Add to cart via CartContext (CartContext will handle increasing quantity if it exists)
      await cartActions.addItem({
        id: productId,
        name: item.name || item.title || 'Product',
        image: imageUrl,
        price: currentPrice,
        originalPrice: originalPrice,
        discountedPrice: currentPrice,
        quantity: 1,
        cashback: item.cashback || 0,
        category: item.category || 'general',
      });

      // Wait a bit for the cart state to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Show success toast
      showToast({
        message: `${item.name || item.title || 'Item'} added to cart`,
        type: 'success',
        duration: 3000
      });

    } catch (error) {
      console.error('❌ [Add to Cart] Failed:', error);
      showToast({
        message: 'Failed to add item to cart',
        type: 'error',
        duration: 3000
      });
    }
  }, [cartActions]);

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