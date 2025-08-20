import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { 
  CategoryState, 
  CategoryContextType, 
  Category, 
  CategoryItem, 
  SortOption 
} from '@/types/category.types';

// Initial State
const initialState: CategoryState = {
  currentCategory: null,
  categories: [],
  filters: {},
  searchQuery: '',
  sortBy: 'featured',
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
};

// Action Types
type CategoryAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_CURRENT_CATEGORY'; payload: Category | null }
  | { type: 'UPDATE_FILTERS'; payload: Record<string, any> }
  | { type: 'UPDATE_SEARCH'; payload: string }
  | { type: 'UPDATE_SORT'; payload: string }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_PAGINATION'; payload: Partial<CategoryState['pagination']> }
  | { type: 'APPEND_ITEMS'; payload: CategoryItem[] };

// Reducer
function categoryReducer(state: CategoryState, action: CategoryAction): CategoryState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload, loading: false, error: null };
    
    case 'SET_CURRENT_CATEGORY':
      return { 
        ...state, 
        currentCategory: action.payload, 
        loading: false, 
        error: null,
        // Reset pagination when category changes
        pagination: { ...initialState.pagination }
      };
    
    case 'UPDATE_FILTERS':
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload },
        // Reset pagination when filters change
        pagination: { ...initialState.pagination }
      };
    
    case 'UPDATE_SEARCH':
      return { 
        ...state, 
        searchQuery: action.payload,
        // Reset pagination when search changes
        pagination: { ...initialState.pagination }
      };
    
    case 'UPDATE_SORT':
      return { 
        ...state, 
        sortBy: action.payload,
        // Reset pagination when sort changes
        pagination: { ...initialState.pagination }
      };
    
    case 'RESET_FILTERS':
      return { 
        ...state, 
        filters: {}, 
        searchQuery: '',
        sortBy: 'featured',
        pagination: { ...initialState.pagination }
      };
    
    case 'SET_PAGINATION':
      return { 
        ...state, 
        pagination: { ...state.pagination, ...action.payload }
      };
    
    case 'APPEND_ITEMS':
      if (!state.currentCategory) return state;
      
      return {
        ...state,
        currentCategory: {
          ...state.currentCategory,
          items: [...state.currentCategory.items, ...action.payload]
        }
      };
    
    default:
      return state;
  }
}

// Context
const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

// Provider Props
interface CategoryProviderProps {
  children: ReactNode;
}

// Category Provider Component
export function CategoryProvider({ children }: CategoryProviderProps) {
  const [state, dispatch] = useReducer(categoryReducer, initialState);

  // Load single category by slug
  const loadCategory = useCallback(async (slug: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Import category data dynamically
      const { getCategoryBySlug } = await import('@/data/categoryData');
      const category = getCategoryBySlug(slug);
      
      if (!category) {
        throw new Error(`Category '${slug}' not found`);
      }
      
      dispatch({ type: 'SET_CURRENT_CATEGORY', payload: category });
      
      // Set initial pagination
      dispatch({ 
        type: 'SET_PAGINATION', 
        payload: { 
          total: category.items.length,
          hasMore: category.items.length > initialState.pagination.limit
        }
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load category';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, []);

  // Load all categories
  const loadCategories = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { getAllCategories } = await import('@/data/categoryData');
      const categories = getAllCategories();
      
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load categories';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((filters: Record<string, any>) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: filters });
  }, []);

  // Update search query
  const updateSearch = useCallback((query: string) => {
    dispatch({ type: 'UPDATE_SEARCH', payload: query });
  }, []);

  // Update sort option
  const updateSort = useCallback((sortBy: string) => {
    dispatch({ type: 'UPDATE_SORT', payload: sortBy });
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  // Load more items (pagination)
  const loadMore = useCallback(async () => {
    if (!state.currentCategory || !state.pagination.hasMore || state.loading) {
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const nextPage = state.pagination.page + 1;
      const startIndex = (nextPage - 1) * state.pagination.limit;
      const endIndex = startIndex + state.pagination.limit;
      
      // Get more items from current category
      const allItems = state.currentCategory.items;
      const newItems = allItems.slice(startIndex, endIndex);
      
      if (newItems.length > 0) {
        dispatch({ type: 'APPEND_ITEMS', payload: newItems });
        dispatch({ 
          type: 'SET_PAGINATION', 
          payload: { 
            page: nextPage,
            hasMore: endIndex < allItems.length
          }
        });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load more items';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, [state.currentCategory, state.pagination, state.loading]);

  // Add to cart
  const addToCart = useCallback(async (item: CategoryItem) => {
    try {
      // Import cart context
      // This would integrate with existing cart functionality
      console.log('Adding to cart:', item.name);
      
      // You could dispatch a cart action here or call cart context methods
      // Example: cartContext.addItem(item);
      
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(async (item: CategoryItem) => {
    try {
      // This would integrate with user favorites functionality
      console.log('Toggling favorite:', item.name);
      
      // You could dispatch a favorites action here
      // Example: favoritesContext.toggleItem(item);
      
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, []);

  // Context value
  const contextValue: CategoryContextType = {
    state,
    actions: {
      loadCategory,
      loadCategories,
      updateFilters,
      updateSearch,
      updateSort,
      loadMore,
      resetFilters,
      addToCart,
      toggleFavorite,
    },
  };

  return (
    <CategoryContext.Provider value={contextValue}>
      {children}
    </CategoryContext.Provider>
  );
}

// Hook to use category context
export function useCategory(): CategoryContextType {
  const context = useContext(CategoryContext);
  
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  
  return context;
}

// Utility hook for filtered and sorted items
export function useCategoryItems() {
  const { state } = useCategory();
  
  const filteredAndSortedItems = React.useMemo(() => {
    if (!state.currentCategory) return [];
    
    let items = [...state.currentCategory.items];
    
    // Apply search filter
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.metadata.description?.toLowerCase().includes(query) ||
        item.metadata.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply category-specific filters
    Object.entries(state.filters).forEach(([filterKey, filterValue]) => {
      if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
        return;
      }
      
      items = items.filter(item => {
        const metadata = item.metadata;
        
        switch (filterKey) {
          case 'mealType':
            return metadata.mealType === filterValue;
          case 'occasion':
            return metadata.occasion === filterValue;
          case 'brand':
            return metadata.brand === filterValue;
          case 'priceRange':
            if (item.price && filterValue.min !== undefined && filterValue.max !== undefined) {
              return item.price.current >= filterValue.min && item.price.current <= filterValue.max;
            }
            return true;
          case 'rating':
            if (item.rating && filterValue.min !== undefined) {
              return item.rating.value >= filterValue.min;
            }
            return true;
          case 'isVeg':
            return metadata.isVeg === filterValue;
          case 'prescription':
            return metadata.prescription === filterValue;
          case 'availability':
            return item.timing?.availability === filterValue;
          default:
            return true;
        }
      });
    });
    
    // Apply sorting
    items.sort((a, b) => {
      switch (state.sortBy) {
        case 'price_low':
          return (a.price?.current || 0) - (b.price?.current || 0);
        case 'price_high':
          return (b.price?.current || 0) - (a.price?.current || 0);
        case 'rating':
          return (b.rating?.value || 0) - (a.rating?.value || 0);
        case 'newest':
          // Assuming newer items have higher IDs
          return b.id.localeCompare(a.id);
        case 'popular':
          return (b.rating?.count || 0) - (a.rating?.count || 0);
        case 'featured':
        default:
          // Featured items first, then by rating
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return (b.rating?.value || 0) - (a.rating?.value || 0);
      }
    });
    
    // Apply pagination for displayed items
    const limit = state.pagination.limit;
    const currentPage = state.pagination.page;
    const endIndex = currentPage * limit;
    
    return items.slice(0, endIndex);
  }, [
    state.currentCategory,
    state.filters,
    state.searchQuery,
    state.sortBy,
    state.pagination.page,
    state.pagination.limit
  ]);
  
  return {
    items: filteredAndSortedItems,
    totalCount: state.currentCategory?.items.length || 0,
    filteredCount: filteredAndSortedItems.length,
    hasMore: state.pagination.hasMore,
    loading: state.loading,
  };
}

export default CategoryContext;