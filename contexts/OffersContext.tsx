import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { OfferState, OffersPageData, OfferFilters } from '@/types/offers.types';
import { offersApi } from '@/services/offersApi';
// Note: Using offersApi which contains mock data since offers backend is not implemented yet

// Action Types
type OffersAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_OFFERS'; payload: OffersPageData }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: OfferFilters }
  | { type: 'ADD_FAVORITE'; payload: string }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  | { type: 'CLEAR_FAVORITES' }
  | { type: 'RESET_FILTERS' };

// Initial State
const initialState: OfferState = {
  offers: null,
  loading: false,
  error: null,
  filters: {},
  favorites: [],
};

// Reducer
function offersReducer(state: OfferState, action: OffersAction): OfferState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_OFFERS':
      return { ...state, offers: action.payload, loading: false, error: null };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    
    case 'ADD_FAVORITE':
      return {
        ...state,
        favorites: [...state.favorites, action.payload]
      };
    
    case 'REMOVE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.filter(id => id !== action.payload)
      };
    
    case 'CLEAR_FAVORITES':
      return { ...state, favorites: [] };
    
    case 'RESET_FILTERS':
      return { ...state, filters: {} };
    
    default:
      return state;
  }
}

// Context
interface OffersContextType {
  state: OfferState;
  dispatch: React.Dispatch<OffersAction>;
  actions: {
    loadOffers: () => Promise<void>;
    setFilters: (filters: OfferFilters) => void;
    toggleFavorite: (offerId: string) => void;
    clearFavorites: () => void;
    resetFilters: () => void;
  };
}

const OffersContext = createContext<OffersContextType | undefined>(undefined);

// Provider
interface OffersProviderProps {
  children: ReactNode;
}

export function OffersProvider({ children }: OffersProviderProps) {
  const [state, dispatch] = useReducer(offersReducer, initialState);

  // Actions
  const loadOffers = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Using mock API since offers backend is not implemented yet
      const offersResponse = await offersApi.getOffers({ page: 1, pageSize: 50 });
      const categoriesResponse = await offersApi.getCategories();
      
      if (!categoriesResponse.data || !offersResponse.data) {
        throw new Error('Failed to fetch offers data');
      }
      
      // Transform API response to match OffersPageData structure
      const offersPageData: OffersPageData = {
        title: 'Special Offers',
        subtitle: 'Exclusive deals and cashback offers',
        categories: categoriesResponse.data,
        sections: [
          {
            id: 'featured-offers',
            title: 'Featured Offers', 
            subtitle: 'Best deals available now',
            offers: offersResponse.data.items
          }
        ],
        trending: offersResponse.data.items.filter(offer => offer.isTrending).slice(0, 5),
        featured: offersResponse.data.items.slice(0, 3), // Remove isFeatured filter since property doesn't exist
        banners: []
      };
      
      dispatch({ type: 'SET_OFFERS', payload: offersPageData });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to load offers' 
      });
    }
  };

  const setFilters = (filters: OfferFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const toggleFavorite = (offerId: string) => {
    if (state.favorites.includes(offerId)) {
      dispatch({ type: 'REMOVE_FAVORITE', payload: offerId });
    } else {
      dispatch({ type: 'ADD_FAVORITE', payload: offerId });
    }
  };

  const clearFavorites = () => {
    dispatch({ type: 'CLEAR_FAVORITES' });
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  const contextValue: OffersContextType = {
    state,
    dispatch,
    actions: {
      loadOffers,
      setFilters,
      toggleFavorite,
      clearFavorites,
      resetFilters,
    },
  };

  return (
    <OffersContext.Provider value={contextValue}>
      {children}
    </OffersContext.Provider>
  );
}

// Hook
export function useOffers() {
  const context = useContext(OffersContext);
  if (context === undefined) {
    throw new Error('useOffers must be used within an OffersProvider');
  }
  return context;
}

export { OffersContext };