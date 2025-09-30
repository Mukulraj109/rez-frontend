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
  
  console.log('🏠 [HOMEPAGE HOOK] Hook initialized, current state:', {
    sectionsCount: state.sections.length,
    loading: state.loading,
    error: state.error,
    sectionsIds: state.sections.map(s => `${s.id}:${s.items.length}`)
  });

  // Load all homepage sections
  const refreshAllSections = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Get base homepage data (for sections that don't need API integration)
      const data = await fetchHomepageData();
      
      console.log('🏠 Initial homepage sections:', data.sections.length, data.sections.map(s => s.id));
      
      // Update specific sections with backend data
      const updatedSections = await Promise.all(
        data.sections.map(async (section) => {
          console.log(`🔍 Processing section: ${section.id} (${section.items.length} items)`);
          
          if (section.id === 'just_for_you') {
            console.log('🔄 Loading "Just for You" section with backend data...');
            try {
              const backendSection = await homepageDataService.getJustForYouSection();
              console.log('✅ Backend "Just for You":', backendSection.items.length, 'items');
              return backendSection;
            } catch (error) {
              console.warn('⚠️ Failed to load "Just for You" from backend, using fallback:', error);
              return section; // fallback to original section
            }
          } else if (section.id === 'new_arrivals') {
            console.log('🔄 Loading "New Arrivals" section with backend data...');
            try {
              const backendSection = await homepageDataService.getNewArrivalsSection();
              console.log('✅ Backend "New Arrivals":', backendSection.items.length, 'items');
              return backendSection;
            } catch (error) {
              console.warn('⚠️ Failed to load "New Arrivals" from backend, using fallback:', error);
              return section; // fallback to original section
            }
          } else if (section.id === 'trending_stores') {
            console.log('🔄 Loading "Trending Stores" section with backend data...');
            try {
              const backendSection = await homepageDataService.getTrendingStoresSection();
              console.log('✅ Backend "Trending Stores":', backendSection.items.length, 'items');
              return backendSection;
            } catch (error) {
              console.warn('⚠️ Failed to load "Trending Stores" from backend, using fallback:', error);
              return section; // fallback to original section
            }
          } else {
            // Keep other sections unchanged
            console.log(`✅ Keeping section "${section.id}" unchanged (${section.items.length} items)`);
            return section;
          }
        })
      );
      
      console.log('🎯 Final updated sections:', updatedSections.length, updatedSections.map(s => `${s.id}:${s.items.length}`));
      
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
        console.log('🔄 Refreshing "Just for You" section with backend data...');
        sectionData = await homepageDataService.getJustForYouSection();
      } else if (sectionId === 'new_arrivals') {
        console.log('🔄 Refreshing "New Arrivals" section with backend data...');
        sectionData = await homepageDataService.getNewArrivalsSection();
      } else if (sectionId === 'trending_stores') {
        console.log('🔄 Refreshing "Trending Stores" section with backend data...');
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
    console.log('Section viewed:', sectionId);
  }, []);

  const trackItemClick = useCallback((sectionId: string, itemId: string) => {
    // TODO: Send analytics event to backend
    console.log('Item clicked:', { sectionId, itemId });
  }, []);

  // Auto-refresh on mount
  useEffect(() => {
    console.log('🏠 [HOMEPAGE HOOK] useEffect triggered - sections length:', state.sections.length, 'loading:', state.loading);
    // Since we now have fallback data, sections.length will not be 0, so let's trigger refresh anyway
    console.log('🏠 [HOMEPAGE HOOK] Calling refreshAllSections to get real backend data');
    refreshAllSections();
  }, [refreshAllSections]);

  // Debug effect to test service directly
  useEffect(() => {
    const testService = async () => {
      console.log('🧪 [HOMEPAGE HOOK] Testing homepage service...');
      try {
        const justForYouSection = await homepageDataService.getJustForYouSection();
        console.log('🧪 [HOMEPAGE HOOK] Direct service test - Just for you:', justForYouSection.items.length, 'items');
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

  const handleAddToCart = useCallback(async (item: any) => {
    try {
      console.log('🛒 [Add to Cart] Adding item - Full object:', JSON.stringify(item, null, 2));
      console.log('🛒 [Add to Cart] Image fields:', {
        image: item.image,
        imageUrl: item.imageUrl,
        images: item.images,
        allKeys: Object.keys(item)
      });

      // Extract product ID - handle both product._id and product.id formats
      const productId = item._id || item.id;

      if (!productId) {
        console.error('❌ [Add to Cart] No product ID found');
        Alert.alert('Error', 'Cannot add item to cart - invalid product');
        return;
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

      console.log('🛒 [Add to Cart] Using image URL:', imageUrl);

      // Check if item already exists in cart
      const existingItem = cartActions.isItemInCart(productId);

      if (existingItem) {
        console.log('🛒 [Add to Cart] Item already in cart, will increase quantity automatically');
      }

      // Add to cart via CartContext (CartContext will handle increasing quantity if it exists)
      await cartActions.addItem({
        id: productId,
        productId: productId,
        name: item.name || item.title || 'Product',
        image: imageUrl,
        originalPrice: item.originalPrice || item.price || 0,
        discountedPrice: item.price || item.originalPrice || 0,
        discount: item.discount || 0,
        quantity: 1,
        store: item.store,
        variant: item.variant,
      });

      console.log('✅ [Add to Cart] Item added successfully');
      Alert.alert('Success', `${item.name || 'Item'} added to cart!`);

    } catch (error) {
      console.error('❌ [Add to Cart] Failed:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
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