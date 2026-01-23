import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPARISON_STORAGE_KEY = '@comparison_products';
const MAX_COMPARISON_ITEMS = 4;

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  brand: string;
  specs?: Record<string, string>;
  features?: string[];
  discount?: number;
  cashback?: number;
  [key: string]: any;
}

interface ComparisonContextType {
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  isInComparison: (productId: string) => boolean;
  count: number;
  isLoading: boolean;
  canAddMore: boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

/**
 * ComparisonProvider Component
 *
 * Manages global product comparison state with:
 * - Persistent storage using AsyncStorage
 * - Maximum 4 products limit
 * - Toast notifications for user feedback
 * - Optimistic updates
 */
export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load comparison data from storage on mount
  useEffect(() => {
    loadComparisonData();
  }, []);

  // Save comparison data whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveComparisonData();
    }
  }, [products, isLoading]);

  /**
   * Load comparison data from AsyncStorage
   */
  const loadComparisonData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(COMPARISON_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setProducts(parsedData);
      }
    } catch (error) {
      console.error('Failed to load comparison data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save comparison data to AsyncStorage
   */
  const saveComparisonData = async () => {
    try {
      await AsyncStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
      console.error('Failed to save comparison data:', error);
    }
  };

  /**
   * Add a product to comparison
   */
  const addProduct = useCallback(async (product: Product) => {
    setProducts((prev) => {
      // Check if product already exists
      if (prev.find((p) => p.id === product.id)) {
        return prev;
      }

      // Check if maximum limit reached
      if (prev.length >= MAX_COMPARISON_ITEMS) {
        console.warn(`You can compare up to ${MAX_COMPARISON_ITEMS} products at a time`);
        return prev;
      }

      // Add product

      return [...prev, product];
    });
  }, []);

  /**
   * Remove a product from comparison
   */
  const removeProduct = useCallback(async (productId: string) => {
    setProducts((prev) => {
      const product = prev.find(p => p.id === productId);
      if (product) {
        console.log(`${product.name} removed from comparison`);
      }
      return prev.filter((p) => p.id !== productId);
    });
  }, []);

  /**
   * Clear all products from comparison
   */
  const clearAll = useCallback(async () => {
    if (products.length === 0) {
      return;
    }

    setProducts([]);
  }, [products.length]);

  /**
   * Check if a product is in comparison
   */
  const isInComparison = useCallback(
    (productId: string) => products.some((p) => p.id === productId),
    [products]
  );

  /**
   * Check if more products can be added
   */
  const canAddMore = products.length < MAX_COMPARISON_ITEMS;

  const value: ComparisonContextType = {
    products,
    addProduct,
    removeProduct,
    clearAll,
    isInComparison,
    count: products.length,
    isLoading,
    canAddMore,
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
}

/**
 * Hook to use comparison context
 */
export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return context;
}

/**
 * Hook to get comparison actions only (for components that don't need the full state)
 */
export function useComparisonActions() {
  const { addProduct, removeProduct, clearAll, isInComparison } = useComparison();
  return { addProduct, removeProduct, clearAll, isInComparison };
}

/**
 * Hook to get comparison status (for badges/counters)
 */
export function useComparisonStatus() {
  const { count, isInComparison, canAddMore } = useComparison();
  return { count, isInComparison, canAddMore };
}

export default ComparisonContext;
