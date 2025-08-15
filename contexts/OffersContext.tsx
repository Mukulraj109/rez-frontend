import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { OfferState, OffersPageData, OfferFilters } from '@/types/offers.types';
import { offersPageData } from '@/data/offersData';

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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, this would be an API call
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