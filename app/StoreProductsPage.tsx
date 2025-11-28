// StoreProductsPage.tsx
// Displays all products for a specific store in an Amazon-style grid layout

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Stack } from 'expo-router';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
  Text,
  TextInput,
  ScrollView,
  Modal,
  Share,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, usePathname } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import ProductCard from '@/components/homepage/cards/ProductCard';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductItem } from '@/types/homepage.types';
import storesApi from '@/services/storesApi';
import { useStoreData } from '@/hooks/useStoreData';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { triggerImpact } from '@/utils/haptics';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import apiClient from '@/services/apiClient';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { handleNetworkError, isRetryableError } from '@/utils/networkErrorHandler';
import ProductGridSkeleton from '@/components/skeletons/ProductGridSkeleton';
import { RetryButton } from '@/components/common/RetryButton';
import analyticsService from '@/services/analyticsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '@/components/common/ToastManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Calculate card width for responsive grid (2 columns on mobile, 3+ on tablet)
const getCardWidth = () => {
  const padding = 16 * 2; // Horizontal padding
  const gap = 12; // Gap between cards
  const columns = SCREEN_WIDTH >= 768 ? 3 : 2;
  return (SCREEN_WIDTH - padding - (gap * (columns - 1))) / columns;
};

interface StoreProductsPageProps {}

function StoreProductsPage({}: StoreProductsPageProps) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const pathname = usePathname();
  const storeId = params.storeId as string;
  const storeName = params.storeName as string | undefined;

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ message: string; isRetryable: boolean; suggestions?: string[] } | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'rating' | 'popular'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  
  // Search history and suggestions
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  
  // Performance tracking
  const pageLoadStartTime = useRef<number>(Date.now());
  const productViewTimes = useRef<Map<string, number>>(new Map());

  // Quick view and product details modal states
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<ProductItem | null>(null);

  // URL params for web (sync filters with URL) - moved after state declarations
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Load filters from URL on mount
      const urlSearch = urlParams.get('search');
      const urlCategory = urlParams.get('category');
      const urlSort = urlParams.get('sort');
      
      if (urlSearch && urlSearch !== searchQuery) {
        setSearchQuery(urlSearch);
      }
      if (urlCategory && urlCategory !== selectedCategory) {
        setSelectedCategory(urlCategory);
      }
      if (urlSort && urlSort !== sortBy) {
        setSortBy(urlSort as typeof sortBy);
      }
    }
  }, []); // Only on mount

  // Update URL params when filters change (web only)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams();
      
      if (searchQuery.trim()) {
        urlParams.set('search', searchQuery.trim());
      }
      if (selectedCategory) {
        urlParams.set('category', selectedCategory);
      }
      if (sortBy !== 'newest') {
        urlParams.set('sort', sortBy);
      }
      
      const newUrl = urlParams.toString() 
        ? `${pathname}?${urlParams.toString()}`
        : pathname;
      
      // Update URL without page reload
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchQuery, selectedCategory, sortBy, pathname]);

  // Keyboard shortcuts for web (accessibility)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl/Cmd + K: Focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // Focus search input if available
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Ctrl/Cmd + F: Open filters
      if ((event.ctrlKey || event.metaKey) && event.key === 'f' && !event.shiftKey) {
        event.preventDefault();
        setShowFilters(true);
      }

      // Escape: Close modals
      if (event.key === 'Escape') {
        if (showQuickView) {
          setShowQuickView(false);
        }
        if (showProductDetails) {
          setShowProductDetails(false);
        }
        if (showFilters) {
          setShowFilters(false);
        }
      }

      // /: Focus search (when not in input)
      if (event.key === '/' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showQuickView, showProductDetails, showFilters]);

  // Offline caching: Save products to cache
  useEffect(() => {
    if (!storeId || products.length === 0 || loading) return;

    const cacheProducts = async () => {
      try {
        const cacheKey = `products_cache_${storeId}`;
        const cacheData = {
          products,
          timestamp: Date.now(),
          filters: {
            searchQuery,
            selectedCategory,
            sortBy,
          },
        };
        await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (error) {
        console.error('Failed to cache products:', error);
      }
    };

    // Cache after a short delay to avoid excessive writes
    const timeoutId = setTimeout(cacheProducts, 1000);
    return () => clearTimeout(timeoutId);
  }, [products, storeId, searchQuery, selectedCategory, sortBy, loading]);

  // Load cached products on mount (offline support) - moved after network status hook

  // Fetch store data for header
  const { data: storeData, loading: storeLoading } = useStoreData(storeId || '');

  // Cart and Wishlist context
  const { state: cartState, actions: cartActions } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  // Toast notifications (using showToast from ToastManager directly)

  // Authentication context
  const { state: authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated && !!authState.user;

  // Network status
  const { isOnline, isOffline, connectionQuality, waitForNetwork } = useNetworkStatus();

  // Animation refs
  const backButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const cartButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const wishlistButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const coinButtonScaleAnim = useRef(new Animated.Value(1)).current;

  // Cart item count
  const cartItemCount = useMemo(() => {
    return cartState.items.reduce((total, item) => total + item.quantity, 0);
  }, [cartState.items]);

  const cardWidth = useMemo(() => getCardWidth(), []);

  // Animation helper
  const animateScale = (animValue: Animated.Value, toValue: number) => {
    Animated.spring(animValue, {
      toValue,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  // Header handlers
  const handleBack = () => {
    triggerImpact('Medium');
    router.back();
  };

  const handleCartPress = () => {
    triggerImpact('Medium');
    router.push('/CartPage');
  };

  const handleWishlistPress = () => {
    triggerImpact('Medium');
    router.push('/wishlist');
  };

  const handleCoinPress = () => {
    triggerImpact('Medium');
    if (Platform.OS === 'web') {
      setTimeout(() => router.push('/CoinPage'), 50);
    } else {
      router.push('/CoinPage');
    }
  };

  // Fetch categories from Category API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await apiClient.get('/categories', {
          type: 'home_delivery', // Get home delivery categories for products
        });
        
        if (response.success && response.data) {
          const categoryList = Array.isArray(response.data) 
            ? response.data 
            : ((response.data as any).categories || []);
          
          setCategories(categoryList.map((cat: any) => ({
            id: cat._id || cat.id || '',
            name: cat.name || '',
            slug: cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-') || '',
          })));
        }
      } catch (error: any) {
        console.error('Failed to load categories:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, []);

  // Fetch products with comprehensive error handling and retry logic
  const fetchProducts = useCallback(async (pageNum: number = 1, append: boolean = false, retryAttempt: number = 0) => {
    if (!storeId) {
      const errorMsg = 'Store ID is required';
      setError(errorMsg);
      setErrorInfo({ message: errorMsg, isRetryable: false });
      setLoading(false);
      return;
    }

    // Check network status before making request
    if (isOffline) {
      const errorMsg = 'No internet connection. Please check your network and try again.';
      setError(errorMsg);
      setErrorInfo({ 
        message: errorMsg, 
        isRetryable: true,
        suggestions: [
          'Check your WiFi or mobile data connection',
          'Try switching between WiFi and mobile data',
          'Move to an area with better reception'
        ]
      });
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      return;
    }

    try {
      if (!append) {
        setLoading(true);
        setError(null);
        setErrorInfo(null);
      } else {
        setLoadingMore(true);
      }

      // Build query parameters
      const queryParams: any = {
        page: pageNum,
        limit: 20,
      };

      // Add search query
      if (searchQuery.trim()) {
        queryParams.search = searchQuery.trim();
      }

      // Add category filter
      if (selectedCategory) {
        queryParams.category = selectedCategory;
      }

      // Add sort
      if (sortBy) {
        queryParams.sortBy = sortBy;
      }

      const response = await storesApi.getStoreProducts(storeId, queryParams);

      if (response.success && response.data) {
        // Validate response structure
        if (!response.data.products || !Array.isArray(response.data.products)) {
          throw new Error('Invalid response format from server');
        }

        const newProducts: ProductItem[] = (response.data.products || []).map((product: any) => {
          const productId = product._id || product.id;
          
          // Validate product data
          if (!productId) {
            console.warn('Product missing ID, skipping:', product);
            return null;
          }
          
          // Handle images - API returns array of strings (URLs)
          const productImage = Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : product.image || 'https://via.placeholder.com/200x200?text=No+Image';
          
          // Validate image URL
          const isValidImageUrl = typeof productImage === 'string' && 
            (productImage.startsWith('http') || productImage.startsWith('https') || productImage.startsWith('/'));
          
          // Handle pricing - API uses pricing.selling and pricing.original
          const sellingPrice = product.pricing?.selling || product.pricing?.basePrice || 0;
          const originalPrice = product.pricing?.original || product.pricing?.basePrice || 0;
          const discount = product.pricing?.discount || (originalPrice > sellingPrice
            ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
            : 0);
          
          // Validate prices
          if (isNaN(sellingPrice) || sellingPrice < 0) {
            console.warn('Invalid price for product:', productId, sellingPrice);
          }
          
          // Handle inventory - API uses inventory.stock and inventory.isAvailable
          const stock = product.inventory?.stock || 0;
          const isAvailable = product.inventory?.isAvailable !== false && stock > 0;
          
          return {
          id: productId,
          _id: productId,
          type: 'product' as const,
          name: product.name || 'Unnamed Product',
          title: product.name || 'Unnamed Product',
          brand: product.brand || storeData?.name || 'Store',
          image: isValidImageUrl ? productImage : 'https://via.placeholder.com/200x200?text=No+Image',
          description: product.description || product.shortDescription || '',
          price: {
            current: Math.max(0, sellingPrice),
            original: originalPrice > sellingPrice ? Math.max(0, originalPrice) : undefined,
            currency: product.pricing?.currency || 'INR',
            discount: Math.max(0, Math.min(100, discount)),
          },
          category: product.category?.name || product.category || 'General',
          subcategory: product.subcategory,
          rating: product.ratings ? {
            value: typeof product.ratings.average === 'string'
              ? parseFloat(product.ratings.average) || 0
              : (product.ratings.average || 0),
            count: product.ratings.count || 0,
          } : undefined,
          cashback: product.cashback ? {
            percentage: product.cashback.percentage || 0,
            maxAmount: product.cashback.maxAmount,
          } : undefined,
          availabilityStatus: isAvailable ? 'in_stock' : 'out_of_stock',
          inventory: {
            stock: Math.max(0, stock),
            lowStockThreshold: product.inventory?.lowStockThreshold || 5,
          },
          tags: Array.isArray(product.tags) ? product.tags : [],
          isNewArrival: product.isNewArrival,
          isRecommended: product.isFeatured || product.isRecommended,
          storeName: storeData?.name || storeName || 'Store',
          storeId: storeId,
        } as ProductItem;
        }).filter((product): product is ProductItem => product !== null);

        if (append) {
          setProducts(prev => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }

        // Check if there are more pages
        const pagination = response.data.pagination;
        setHasMore(pagination ? (pageNum < pagination.pages) : false);
        
        // Reset retry count on success
        setRetryCount(0);
      } else {
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (err: any) {
      // Handle network errors with proper classification
      const networkError = handleNetworkError(err);
      const errorMessage = networkError.userMessage;
      const isRetryable = networkError.isRetryable && retryAttempt < maxRetries;

      setError(errorMessage);
      setErrorInfo({
        message: errorMessage,
        isRetryable,
        suggestions: networkError.suggestions,
      });

      if (!append) {
        setProducts([]);
      }

      // Auto-retry for retryable errors
      if (isRetryable && retryAttempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryAttempt), 5000); // Exponential backoff, max 5s
        setTimeout(() => {
          setRetryCount(retryAttempt + 1);
          fetchProducts(pageNum, append, retryAttempt + 1);
        }, delay);
        return; // Don't set loading to false yet
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [storeId, storeData, storeName, searchQuery, selectedCategory, sortBy, isOffline]);

  // Save search history - defined before useEffects that use it
  const saveSearchHistory = useCallback(async (query: string) => {
    if (!query.trim() || !storeId) return;
    
    try {
      const sanitizedQuery = query.trim().toLowerCase();
      setSearchHistory(prev => {
        const updatedHistory = [
          sanitizedQuery,
          ...prev.filter(item => item !== sanitizedQuery)
        ].slice(0, 10);
        
        // Save to storage asynchronously
        AsyncStorage.setItem(`search_history_${storeId}`, JSON.stringify(updatedHistory)).catch(err => {
          console.error('Failed to save search history:', err);
        });
        
        return updatedHistory;
      });
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, [storeId]);

  // Debounced search with analytics
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (!storeId) return;
    
    searchTimeoutRef.current = setTimeout(() => {
      // Track search if query is not empty
      if (searchQuery.trim()) {
        analyticsService.track('product_search', {
          storeId,
          query: searchQuery.trim(),
          hasCategoryFilter: !!selectedCategory,
          sortBy,
          resultCount: products.length,
        });
        
        // Save to search history
        saveSearchHistory(searchQuery);
      }
      
      // Reset to page 1 when search changes
      setPage(1);
      setHasMore(true);
      fetchProducts(1, false);
    }, 300); // Reduced to 300ms for better UX

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, storeId, fetchProducts, selectedCategory, sortBy, products.length, saveSearchHistory]);

  // Refetch when filters change with analytics
  useEffect(() => {
    if (!storeId) return;
    
    // Track filter changes
    if (selectedCategory || sortBy !== 'newest') {
      analyticsService.track('product_filter_applied', {
        storeId,
        category: selectedCategory,
        sortBy,
        availabilityFilter,
        hasPriceFilter: !!(minPrice || maxPrice),
      });
    }
    
    setPage(1);
    setHasMore(true);
    fetchProducts(1, false);
  }, [selectedCategory, sortBy, storeId, fetchProducts, availabilityFilter, minPrice, maxPrice]);

  // Filter products client-side for price and availability (since backend doesn't support these yet)
  // Memoized for performance - only recalculates when dependencies change
  const filteredProducts = useMemo(() => {
    if (products.length === 0) return [];

    let filtered = [...products];

    // Filter by availability
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(product => {
        if (availabilityFilter === 'in_stock') {
          return product.availabilityStatus === 'in_stock';
        } else {
          return product.availabilityStatus === 'out_of_stock';
        }
      });
    }

    // Filter by price range
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min) && min > 0) {
        filtered = filtered.filter(product => product.price.current >= min);
      }
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max) && max > 0) {
        filtered = filtered.filter(product => product.price.current <= max);
      }
    }

    return filtered;
  }, [products, availabilityFilter, minPrice, maxPrice]);

  // Load search history from storage
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const history = await AsyncStorage.getItem(`search_history_${storeId}`);
        if (history) {
          const parsed = JSON.parse(history);
          setSearchHistory(Array.isArray(parsed) ? parsed.slice(0, 10) : []);
        }
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    };
    
    if (storeId) {
      loadSearchHistory();
    }
  }, [storeId]);

  // Generate search suggestions from products and history
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      setShowSearchSuggestions(false);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const suggestions: string[] = [];

    // Add matching search history
    searchHistory
      .filter(item => item.includes(query) && item !== query)
      .slice(0, 3)
      .forEach(item => suggestions.push(item));

    // Add matching product names
    products
      .filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .forEach(product => {
        if (!suggestions.includes(product.name.toLowerCase())) {
          suggestions.push(product.name);
        }
      });

    setSearchSuggestions(suggestions.slice(0, 5));
    setShowSearchSuggestions(suggestions.length > 0);
  }, [searchQuery, products, searchHistory]);

  // Enhanced error boundary handler with analytics
  const handleErrorBoundaryError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    analyticsService.track('error_boundary_caught', {
      storeId,
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 500), // Limit stack trace length
      componentStack: errorInfo.componentStack?.substring(0, 500),
      timestamp: new Date().toISOString(),
    });

    // Log to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught error:', error, errorInfo);
    }
  }, [storeId]);

  // Track page view on mount
  useEffect(() => {
    if (storeId) {
      const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      pageLoadStartTime.current = startTime;
      
      analyticsService.trackPageView('store_products_page', {
        storeId,
        storeName: storeData?.name || storeName,
        productCount: products.length,
        platform: Platform.OS,
        screenWidth: SCREEN_WIDTH,
      });
    }
  }, [storeId, storeData?.name, storeName, products.length]);

  // Track performance when products finish loading (single tracking point)
  useEffect(() => {
    if (!loading && products.length > 0 && pageLoadStartTime.current) {
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const startTime = pageLoadStartTime.current;
      const loadTime = typeof performance !== 'undefined' 
        ? Math.round(endTime - startTime)
        : Date.now() - startTime;
      
      // Calculate performance metrics
      const metrics = {
        storeId,
        loadTime,
        productCount: products.length,
        hasFilters: !!(selectedCategory || searchQuery || sortBy !== 'newest'),
        networkStatus: isOnline ? 'online' : 'offline',
        connectionQuality: connectionQuality || 'unknown',
        platform: Platform.OS,
        screenWidth: SCREEN_WIDTH,
      };

      analyticsService.track('store_products_page_load_performance', metrics);

      // Warn if load time is too slow
      if (loadTime > 3000) {
        analyticsService.track('performance_warning', {
          ...metrics,
          warning: 'slow_load_time',
          threshold: 3000,
        });
      }
    }
  }, [loading, products.length, storeId, selectedCategory, searchQuery, sortBy, isOnline, connectionQuality]);

  // Initial load
  useEffect(() => {
    if (storeId) {
      fetchProducts(1, false);
    }
  }, [storeId, fetchProducts]);

  // Load more products
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, true);
    }
  }, [page, hasMore, loadingMore, loading, fetchProducts]);

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, false);
  }, [fetchProducts]);

  // Handle product press with analytics
  const handleProductPress = useCallback((product: ProductItem) => {
    const productId = (product as any)._id || product.id;
    
    // Track product view
    analyticsService.trackProductView({
      productId,
      productName: product.name,
      productPrice: product.price.current,
      category: product.category || 'General',
      brand: product.brand || storeData?.name || 'Store',
    });

    // Track time spent viewing (if available)
    const viewStartTime = productViewTimes.current.get(productId);
    if (viewStartTime) {
      const timeSpent = Date.now() - viewStartTime;
      analyticsService.track('product_time_spent', {
        productId,
        timeSpent,
        storeId,
      });
    }

    router.push({
      pathname: '/ProductPage',
      params: {
        cardId: productId,
        cardType: 'product',
      },
    } as any);
  }, [router, storeData?.name, storeId]);

  // Handle add to cart with authentication check, analytics, and toast feedback
  const handleAddToCart = useCallback(async (product: ProductItem) => {
    // Track add to cart attempt
    analyticsService.trackAddToCart({
      productId: product.id,
      productName: product.name,
      price: product.price.current,
      quantity: 1,
      totalValue: product.price.current,
    });

    // Check authentication
    if (!isAuthenticated) {
      analyticsService.track('add_to_cart_blocked', {
        reason: 'not_authenticated',
        productId: product.id,
        productName: product.name,
      });

      // Show login prompt or navigate to login
      if (Platform.OS === 'web') {
        if (window.confirm('Please sign in to add items to your cart. Would you like to sign in now?')) {
          router.push('/sign-in');
        }
      } else {
        // Use Alert for native
        const { Alert } = require('react-native');
        Alert.alert(
          'Sign In Required',
          'Please sign in to add items to your cart.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', onPress: () => router.push('/sign-in') },
          ]
        );
      }
      return;
    }

    // Check network status
    if (isOffline) {
      analyticsService.track('add_to_cart_blocked', {
        reason: 'offline',
        productId: product.id,
        productName: product.name,
      });

      if (Platform.OS === 'web') {
        alert('No internet connection. Please check your network and try again.');
      } else {
        const { Alert } = require('react-native');
        Alert.alert('No Internet', 'Please check your network connection and try again.');
      }
      return;
    }

    // Add to cart via CartContext
    try {
      if (cartActions && typeof cartActions.addItem === 'function') {
        await cartActions.addItem({
          id: product.id,
          name: product.name,
          price: product.price.current,
          image: product.image,
          cashback: product.cashback ? `${product.cashback.percentage}% cashback` : '',
          category: (product.category || 'products') as 'products' | 'service',
          quantity: 1,
        });

        // Success feedback
        triggerImpact('Medium');
        analyticsService.track('add_to_cart_success', {
          productId: product.id,
          productName: product.name,
          price: product.price.current,
        });

        // Show success toast notification
        showToast({
          message: `${product.name} added to cart`,
          type: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      analyticsService.track('add_to_cart_error', {
        productId: product.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      // Show error toast
      showToast({
        message: 'Failed to add item to cart. Please try again.',
        type: 'error',
        duration: 3000,
      });
    }
  }, [isAuthenticated, isOffline, router, cartActions]);

  // Handle wishlist toggle with analytics
  const handleWishlistToggle = useCallback(async (product: ProductItem) => {
    const productId = (product as any)._id || product.id;
    const isInWishlistNow = isInWishlist(productId);

    try {
      if (isInWishlistNow) {
        await removeFromWishlist(productId);
        analyticsService.trackWishlist('remove', productId, product.name);
        triggerImpact('Light');
        
        showToast({
          message: `${product.name} removed from wishlist`,
          type: 'info',
          duration: 2000,
        });
      } else {
        // Check authentication
        if (!isAuthenticated) {
          if (Platform.OS === 'web') {
            if (window.confirm('Please sign in to add items to your wishlist. Would you like to sign in now?')) {
              router.push('/sign-in');
            }
          } else {
            const { Alert } = require('react-native');
            Alert.alert(
              'Sign In Required',
              'Please sign in to add items to your wishlist.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign In', onPress: () => router.push('/sign-in') },
              ]
            );
          }
          return;
        }

        await addToWishlist({
          productId,
          productName: product.name,
          productImage: product.image,
          price: product.price.current,
          originalPrice: typeof product.price.original === 'number' ? product.price.original : undefined,
          discount: (() => {
            const discount = product.price.discount;
            if (typeof discount === 'number') return discount;
            if (typeof discount === 'string') {
              const parsed = parseFloat(discount);
              return isNaN(parsed) ? 0 : parsed;
            }
            return 0;
          })(),
          rating: (() => {
            const ratingValue = product.rating?.value;
            if (typeof ratingValue === 'number') return ratingValue;
            if (typeof ratingValue === 'string') {
              const parsed = parseFloat(ratingValue);
              return isNaN(parsed) ? 0 : parsed;
            }
            return 0;
          })(),
          reviewCount: product.rating?.count || 0,
          brand: product.brand || storeData?.name || 'Store',
          category: product.category || 'General',
          availability: product.availabilityStatus === 'in_stock' ? 'IN_STOCK' : 'OUT_OF_STOCK',
        });
        analyticsService.trackWishlist('add', productId, product.name);
        triggerImpact('Medium');
        
        showToast({
          message: `${product.name} added to wishlist`,
          type: 'success',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist, isAuthenticated, router, storeData?.name]);

  // Handle share product
  const handleShareProduct = useCallback(async (product: ProductItem) => {
    const productId = (product as any)._id || product.id;
    const productUrl = Platform.OS === 'web' 
      ? `${window.location.origin}/ProductPage?cardId=${productId}&cardType=product`
      : `rez://product/${productId}`;

    try {
      const shareMessage = `Check out ${product.name} at ${storeData?.name || storeName || 'this store'} for ₹${product.price.current}${product.price.original ? ` (was ₹${product.price.original})` : ''}`;

      if (Platform.OS === 'web' && navigator.share) {
        await navigator.share({
          title: product.name,
          text: shareMessage,
          url: productUrl,
        });
      } else {
        const result = await Share.share({
          message: `${shareMessage}\n\n${productUrl}`,
          title: product.name,
        });

        if (result.action === Share.sharedAction) {
          analyticsService.track('product_shared', {
            productId,
            productName: product.name,
            platform: result.activityType || 'unknown',
            storeId,
          });
        }
      }

      analyticsService.track('product_share_attempt', {
        productId,
        productName: product.name,
        storeId,
      });
    } catch (error: any) {
      if (error?.name !== 'AbortError' && error?.message !== 'User did not share') {
        console.error('Error sharing product:', error);
      }
    }
  }, [storeData?.name, storeName, storeId]);

  // Handle quick view
  const handleQuickView = useCallback((product: ProductItem) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
    
    analyticsService.track('product_quick_view_opened', {
      productId: (product as any)._id || product.id,
      productName: product.name,
      storeId,
    });
  }, [storeId]);

  // Handle product details
  const handleProductDetails = useCallback((product: ProductItem) => {
    setSelectedProductForDetails(product);
    setShowProductDetails(true);
    
    analyticsService.track('product_details_opened', {
      productId: (product as any)._id || product.id,
      productName: product.name,
      storeId,
    });
  }, [storeId]);

  // Render product item - memoized for performance with analytics
  const renderProduct = useCallback(({ item, index }: { item: ProductItem; index: number }) => {
    const productId = (item as any)._id || item.id;
    
    // Track when product comes into view (for view time calculation)
    // Use ref to avoid re-renders
    if (!productViewTimes.current.has(productId)) {
      productViewTimes.current.set(productId, Date.now());
    }

    return (
      <View
        style={[styles.productWrapper, { width: cardWidth }]}
        accessible={true}
        accessibilityLabel={`Product ${index + 1} of ${filteredProducts.length}. ${item.name}. ${item.price.current} rupees. ${item.availabilityStatus === 'in_stock' ? 'In stock' : 'Out of stock'}`}
        accessibilityRole="button"
        accessibilityHint="Double tap to view product details or add to cart"
      >
        <ProductCard
          product={item}
          onPress={handleProductPress}
          onAddToCart={handleAddToCart}
          width={cardWidth}
          showAddToCart={true}
        />
        
        {/* Quick Actions Overlay */}
        <View style={styles.quickActionsOverlay}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleQuickView(item)}
            accessible={true}
            accessibilityLabel="Quick view product"
            accessibilityRole="button"
          >
            <Ionicons name="eye-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleWishlistToggle(item)}
            accessible={true}
            accessibilityLabel={isInWishlist(productId) ? "Remove from wishlist" : "Add to wishlist"}
            accessibilityRole="button"
          >
            <Ionicons 
              name={isInWishlist(productId) ? "heart" : "heart-outline"} 
              size={18} 
              color={isInWishlist(productId) ? "#EF4444" : "#FFFFFF"} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleShareProduct(item)}
            accessible={true}
            accessibilityLabel="Share product"
            accessibilityRole="button"
          >
            <Ionicons name="share-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [cardWidth, filteredProducts.length, handleProductPress, handleAddToCart, handleQuickView, handleWishlistToggle, handleShareProduct, isInWishlist]);

  // Render empty state with improved error handling
  const renderEmpty = () => {
    if (loading) {
      // Show skeleton loader instead of spinner
      return (
        <View style={styles.emptyContainer}>
          <ProductGridSkeleton count={6} columns={SCREEN_WIDTH >= 768 ? 3 : 2} />
        </View>
      );
    }

    if (error && errorInfo) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name={isOffline ? "cloud-offline-outline" : "alert-circle-outline"} 
            size={64} 
            color="#EF4444" 
          />
          <ThemedText style={styles.emptyTitle}>
            {isOffline ? 'No Internet Connection' : 'Unable to load products'}
          </ThemedText>
          <ThemedText style={styles.emptyText}>{errorInfo.message}</ThemedText>
          
          {errorInfo.suggestions && errorInfo.suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <ThemedText style={styles.suggestionsTitle}>Try:</ThemedText>
              {errorInfo.suggestions.map((suggestion, index) => (
                <ThemedText key={index} style={styles.suggestionText}>
                  • {suggestion}
                </ThemedText>
              ))}
            </View>
          )}

          {errorInfo.isRetryable && (
            <View style={styles.retryContainer}>
              <RetryButton
                onRetry={() => {
                  setRetryCount(0);
                  setError(null);
                  setErrorInfo(null);
                  fetchProducts(1, false, 0);
                }}
                label="Try Again"
                variant="primary"
              />
            </View>
          )}

          {isOffline && (
            <TouchableOpacity
              style={styles.waitForNetworkButton}
              onPress={async () => {
                const connected = await waitForNetwork(10000);
                if (connected) {
                  setError(null);
                  setErrorInfo(null);
                  fetchProducts(1, false, 0);
                } else {
                  setError('Still offline. Please check your connection.');
                }
              }}
            >
              <Ionicons name="refresh" size={20} color="#8B5CF6" />
              <ThemedText style={styles.waitForNetworkText}>Wait for Network</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
          <ThemedText style={styles.emptyTitle}>Unable to load products</ThemedText>
          <ThemedText style={styles.emptyText}>{error}</ThemedText>
          <RetryButton
            onRetry={() => {
              setRetryCount(0);
              setError(null);
              setErrorInfo(null);
              fetchProducts(1, false, 0);
            }}
            label="Try Again"
            variant="primary"
          />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={64} color="#9CA3AF" />
        <ThemedText style={styles.emptyTitle}>No products found</ThemedText>
        <ThemedText style={styles.emptyText}>
          {searchQuery || selectedCategory || availabilityFilter !== 'all' || minPrice || maxPrice
            ? 'Try adjusting your filters or search terms.'
            : 'This store doesn\'t have any products yet.'}
        </ThemedText>
        {(searchQuery || selectedCategory || availabilityFilter !== 'all' || minPrice || maxPrice) && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => {
              analyticsService.track('filters_cleared', {
                storeId,
                hadSearch: !!searchQuery,
                hadCategory: !!selectedCategory,
                hadSort: sortBy !== 'newest',
                hadAvailability: availabilityFilter !== 'all',
                hadPrice: !!(minPrice || maxPrice),
              });
              
              setSearchQuery('');
              setSelectedCategory(null);
              setAvailabilityFilter('all');
              setMinPrice('');
              setMaxPrice('');
              setSortBy('newest');
            }}
            accessible={true}
            accessibilityLabel="Clear all filters"
            accessibilityRole="button"
          >
            <ThemedText style={styles.clearFiltersText}>Clear All Filters</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render footer (loading more indicator) - memoized
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#8B5CF6" />
        <ThemedText style={styles.footerText}>Loading more products...</ThemedText>
      </View>
    );
  }, [loadingMore]);

  const displayStoreName = storeData?.name || storeName || 'Store';
  const { height } = Dimensions.get('window');
  const topPadding = Platform.OS === 'ios' ? (height >= 812 ? 44 : 20) : StatusBar.currentHeight ?? 24;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ErrorBoundary onError={handleErrorBoundaryError}>
        <ThemedView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
        
        {/* Network Status Indicator */}
        {isOffline && (
          <View style={styles.networkBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color="#FFFFFF" />
            <ThemedText style={styles.networkBannerText}>
              No internet connection
            </ThemedText>
          </View>
        )}

        {/* Modern Gradient Header */}
        <LinearGradient
          colors={['#7C3AED', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.headerGradient, { paddingTop: topPadding + 12 }]}
        >
          <View style={styles.headerInner}>
            {/* Back Button */}
            <Animated.View style={{ transform: [{ scale: backButtonScaleAnim }] }}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleBack}
                onPressIn={() => animateScale(backButtonScaleAnim, 0.92)}
                onPressOut={() => animateScale(backButtonScaleAnim, 1)}
                accessibilityLabel="Go back"
                accessibilityRole="button"
              >
                <View style={styles.iconButtonBackground}>
                  <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Title Section */}
            <View style={styles.headerContent}>
              <ThemedText style={styles.headerTitle} numberOfLines={1}>
                {displayStoreName}
              </ThemedText>
              <ThemedText style={styles.headerSubtitle} numberOfLines={1}>
                {products.length} product{products.length !== 1 ? 's' : ''}
              </ThemedText>
            </View>

            {/* Action Buttons */}
            <View style={styles.headerActions}>
              {/* Coin Page Button (Star Icon) */}
              <Animated.View style={{ transform: [{ scale: coinButtonScaleAnim }] }}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleCoinPress}
                  onPressIn={() => animateScale(coinButtonScaleAnim, 0.92)}
                  onPressOut={() => animateScale(coinButtonScaleAnim, 1)}
                  accessibilityLabel="View coins"
                  accessibilityRole="button"
                >
                  <View style={styles.iconButtonBackground}>
                    <Ionicons name="star" size={22} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {/* Wishlist Button (Heart Icon) */}
              <Animated.View style={{ transform: [{ scale: wishlistButtonScaleAnim }] }}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleWishlistPress}
                  onPressIn={() => animateScale(wishlistButtonScaleAnim, 0.92)}
                  onPressOut={() => animateScale(wishlistButtonScaleAnim, 1)}
                  accessibilityLabel="View wishlist"
                  accessibilityRole="button"
                >
                  <View style={styles.iconButtonBackground}>
                    <Ionicons name="heart" size={22} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {/* Cart Button with Badge */}
              <Animated.View style={{ transform: [{ scale: cartButtonScaleAnim }] }}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleCartPress}
                  onPressIn={() => animateScale(cartButtonScaleAnim, 0.92)}
                  onPressOut={() => animateScale(cartButtonScaleAnim, 1)}
                  accessibilityLabel={`Cart. ${cartItemCount} items`}
                  accessibilityRole="button"
                >
                  <View style={styles.iconButtonBackground}>
                    <Ionicons name="bag" size={22} color="#FFFFFF" />
                    {cartItemCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {cartItemCount > 99 ? '99+' : cartItemCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </LinearGradient>

        {/* Search and Filter Bar */}
        <View style={styles.searchFilterBar}>
          <View style={styles.searchWrapper}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={(text) => {
                  // Sanitize input - remove special characters that could cause issues
                  const sanitized = text.replace(/[<>{}[\]\\]/g, '').slice(0, 100); // Limit to 100 chars
                  setSearchQuery(sanitized);
                  setShowSearchSuggestions(sanitized.trim().length > 0);
                }}
                onFocus={() => {
                  if (searchQuery.trim() || searchHistory.length > 0) {
                    setShowSearchSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay to allow suggestion click
                  setTimeout(() => setShowSearchSuggestions(false), 200);
                }}
                returnKeyType="search"
                onSubmitEditing={() => {
                  if (searchQuery.trim()) {
                    saveSearchHistory(searchQuery);
                    setShowSearchSuggestions(false);
                  }
                }}
                accessible={true}
                accessibilityLabel="Search products"
                accessibilityRole="search"
                accessibilityHint="Type to search for products. Press / to focus, Ctrl+K for quick search"
                data-search-input={true}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setShowSearchSuggestions(false);
                  }}
                  style={styles.clearButton}
                  accessible={true}
                  accessibilityLabel="Clear search"
                  accessibilityRole="button"
                >
                  <Ionicons name="close-circle" size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Suggestions Dropdown */}
            {showSearchSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0) && (
              <View style={styles.suggestionsDropdown}>
                <ScrollView 
                  style={styles.suggestionsList}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Search History */}
                  {searchHistory.length > 0 && !searchQuery.trim() && (
                    <>
                      <ThemedText style={styles.suggestionsHeader}>Recent Searches</ThemedText>
                      {searchHistory.slice(0, 5).map((item, index) => (
                        <TouchableOpacity
                          key={`history-${index}`}
                          style={styles.suggestionItem}
                          onPress={() => {
                            setSearchQuery(item);
                            setShowSearchSuggestions(false);
                            saveSearchHistory(item);
                          }}
                          accessible={true}
                          accessibilityLabel={`Recent search: ${item}`}
                          accessibilityRole="button"
                        >
                          <Ionicons name="time-outline" size={18} color="#6B7280" />
                          <ThemedText style={styles.suggestionItemText}>{item}</ThemedText>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  {/* Search Suggestions */}
                  {searchSuggestions.length > 0 && searchQuery.trim() && (
                    <>
                      <ThemedText style={styles.suggestionsHeader}>Suggestions</ThemedText>
                      {searchSuggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={`suggestion-${index}`}
                          style={styles.suggestionItem}
                          onPress={() => {
                            setSearchQuery(suggestion);
                            setShowSearchSuggestions(false);
                            saveSearchHistory(suggestion);
                          }}
                          accessible={true}
                          accessibilityLabel={`Search suggestion: ${suggestion}`}
                          accessibilityRole="button"
                        >
                          <Ionicons name="search-outline" size={18} color="#6B7280" />
                          <ThemedText style={styles.suggestionItemText}>{suggestion}</ThemedText>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}
                </ScrollView>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              setShowFilters(true);
              analyticsService.track('filter_modal_opened', { storeId });
            }}
            accessible={true}
            accessibilityLabel="Open filters"
            accessibilityRole="button"
            accessibilityHint="Double tap to open filter options"
          >
            <Ionicons name="filter" size={20} color="#FFFFFF" />
            {(selectedCategory || sortBy !== 'newest' || availabilityFilter !== 'all' || minPrice || maxPrice) && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filters Display */}
        {(selectedCategory || sortBy !== 'newest' || availabilityFilter !== 'all' || minPrice || maxPrice) && (
          <View style={styles.activeFiltersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFilters}>
              {selectedCategory && (
                <View style={styles.activeFilterTag}>
                  <ThemedText style={styles.activeFilterText}>
                    {categories.find(c => c.id === selectedCategory)?.name || 'Category'}
                  </ThemedText>
                  <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                    <Ionicons name="close" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              )}
              {sortBy !== 'newest' && (
                <View style={styles.activeFilterTag}>
                  <ThemedText style={styles.activeFilterText}>
                    Sort: {sortBy.replace('_', ' ')}
                  </ThemedText>
                  <TouchableOpacity onPress={() => setSortBy('newest')}>
                    <Ionicons name="close" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              )}
              {availabilityFilter !== 'all' && (
                <View style={styles.activeFilterTag}>
                  <ThemedText style={styles.activeFilterText}>
                    {availabilityFilter === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                  </ThemedText>
                  <TouchableOpacity onPress={() => setAvailabilityFilter('all')}>
                    <Ionicons name="close" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              )}
              {(minPrice || maxPrice) && (
                <View style={styles.activeFilterTag}>
                  <ThemedText style={styles.activeFilterText}>
                    ₹{minPrice || '0'} - ₹{maxPrice || '∞'}
                  </ThemedText>
                  <TouchableOpacity onPress={() => { setMinPrice(''); setMaxPrice(''); }}>
                    <Ionicons name="close" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={() => {
                  setSelectedCategory(null);
                  setSortBy('newest');
                  setAvailabilityFilter('all');
                  setMinPrice('');
                  setMaxPrice('');
                }}
              >
                <ThemedText style={styles.clearAllText}>Clear All</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        <View style={styles.content}>
        {loading && products.length === 0 ? (
            // Show skeleton loader on initial load
            <View style={styles.skeletonContainer}>
              <ProductGridSkeleton count={6} columns={SCREEN_WIDTH >= 768 ? 3 : 2} />
            </View>
          ) : filteredProducts.length === 0 ? (
            renderEmpty()
          ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item, index) => (item as any)._id || item.id || `product-${index}`}
            numColumns={SCREEN_WIDTH >= 768 ? 3 : 2}
            columnWrapperStyle={SCREEN_WIDTH >= 768 ? styles.row : undefined}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#8B5CF6']}
                tintColor="#8B5CF6"
                enabled={isOnline}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            accessibilityLabel={`${filteredProducts.length} products`}
            accessibilityRole="list"
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={10}
          />
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
               <ThemedText style={styles.modalTitle}>Filters</ThemedText>
               <TouchableOpacity 
                 onPress={() => {
                   setShowFilters(false);
                   analyticsService.track('filter_modal_closed', { storeId });
                 }}
                 accessible={true}
                 accessibilityLabel="Close filters"
                 accessibilityRole="button"
               >
                 <Ionicons name="close" size={24} color="#111827" />
               </TouchableOpacity>
             </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Category Filter */}
              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>Category</ThemedText>
                {loadingCategories ? (
                  <ActivityIndicator size="small" color="#8B5CF6" />
                ) : (
                  <View style={styles.categoryGrid}>
                    <TouchableOpacity
                      style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
                      onPress={() => setSelectedCategory(null)}
                    >
                      <ThemedText style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
                        All
                      </ThemedText>
                    </TouchableOpacity>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipActive]}
                        onPress={() => setSelectedCategory(category.id)}
                      >
                        <ThemedText style={[styles.categoryChipText, selectedCategory === category.id && styles.categoryChipTextActive]}>
                          {category.name}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Sort Filter */}
              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>Sort By</ThemedText>
                {(['newest', 'price_low', 'price_high', 'rating', 'popular'] as const).map((sort) => (
                  <TouchableOpacity
                    key={sort}
                    style={[styles.sortOption, sortBy === sort && styles.sortOptionActive]}
                    onPress={() => setSortBy(sort)}
                  >
                    <ThemedText style={[styles.sortOptionText, sortBy === sort && styles.sortOptionTextActive]}>
                      {sort === 'price_low' ? 'Price: Low to High' :
                       sort === 'price_high' ? 'Price: High to Low' :
                       sort === 'newest' ? 'Newest First' :
                       sort === 'rating' ? 'Highest Rated' :
                       'Most Popular'}
                    </ThemedText>
                    {sortBy === sort && (
                      <Ionicons name="checkmark" size={20} color="#8B5CF6" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Price Range Filter */}
              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>Price Range</ThemedText>
                <View style={styles.priceRangeContainer}>
                   <View style={styles.priceInputContainer}>
                     <ThemedText style={styles.priceLabel}>Min (₹)</ThemedText>
                     <TextInput
                       style={styles.priceInput}
                       placeholder="0"
                       value={minPrice}
                       onChangeText={(text) => {
                         // Validate and sanitize - only allow numbers
                         const sanitized = text.replace(/[^0-9]/g, '').slice(0, 10);
                         setMinPrice(sanitized);
                       }}
                       keyboardType="numeric"
                       accessible={true}
                       accessibilityLabel="Minimum price filter"
                       accessibilityHint="Enter minimum price in rupees"
                     />
                   </View>
                   <View style={styles.priceInputContainer}>
                     <ThemedText style={styles.priceLabel}>Max (₹)</ThemedText>
                     <TextInput
                       style={styles.priceInput}
                       placeholder="∞"
                       value={maxPrice}
                       onChangeText={(text) => {
                         // Validate and sanitize - only allow numbers
                         const sanitized = text.replace(/[^0-9]/g, '').slice(0, 10);
                         setMaxPrice(sanitized);
                       }}
                       keyboardType="numeric"
                       accessible={true}
                       accessibilityLabel="Maximum price filter"
                       accessibilityHint="Enter maximum price in rupees"
                     />
                   </View>
                </View>
              </View>

              {/* Availability Filter */}
              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>Availability</ThemedText>
                {(['all', 'in_stock', 'out_of_stock'] as const).map((availability) => (
                  <TouchableOpacity
                    key={availability}
                    style={[styles.sortOption, availabilityFilter === availability && styles.sortOptionActive]}
                    onPress={() => setAvailabilityFilter(availability)}
                  >
                    <ThemedText style={[styles.sortOptionText, availabilityFilter === availability && styles.sortOptionTextActive]}>
                      {availability === 'all' ? 'All Products' :
                       availability === 'in_stock' ? 'In Stock Only' :
                       'Out of Stock'}
                    </ThemedText>
                    {availabilityFilter === availability && (
                      <Ionicons name="checkmark" size={20} color="#8B5CF6" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

             <View style={styles.modalFooter}>
               <TouchableOpacity
                 style={styles.applyButton}
                 onPress={() => {
                   setShowFilters(false);
                   analyticsService.track('filters_applied', {
                     storeId,
                     category: selectedCategory,
                     sortBy,
                     availabilityFilter,
                     hasPriceFilter: !!(minPrice || maxPrice),
                   });
                 }}
                 accessible={true}
                 accessibilityLabel="Apply filters"
                 accessibilityRole="button"
                 accessibilityHint="Apply the selected filters to the product list"
               >
                 <ThemedText style={styles.applyButtonText}>Apply Filters</ThemedText>
               </TouchableOpacity>
             </View>
          </View>
        </View>
      </Modal>

      {/* Quick View Modal */}
      <Modal
        visible={showQuickView}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQuickView(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.quickViewContainer}>
            {quickViewProduct && (
              <>
                <View style={styles.quickViewHeader}>
                  <ThemedText style={styles.quickViewTitle} numberOfLines={1}>
                    {quickViewProduct.name}
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => setShowQuickView(false)}
                    accessible={true}
                    accessibilityLabel="Close quick view"
                    accessibilityRole="button"
                  >
                    <Ionicons name="close" size={24} color="#111827" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.quickViewContent} showsVerticalScrollIndicator={false}>
                  <Image
                    source={{ uri: quickViewProduct.image }}
                    style={styles.quickViewImage}
                    resizeMode="cover"
                  />
                  
                  <View style={styles.quickViewInfo}>
                    <View style={styles.quickViewPriceRow}>
                      <ThemedText style={styles.quickViewPrice}>
                        ₹{quickViewProduct.price.current.toLocaleString()}
                      </ThemedText>
                      {quickViewProduct.price.original && quickViewProduct.price.original > quickViewProduct.price.current && (
                        <>
                          <ThemedText style={styles.quickViewOriginalPrice}>
                            ₹{quickViewProduct.price.original.toLocaleString()}
                          </ThemedText>
                          <ThemedText style={styles.quickViewDiscount}>
                            {quickViewProduct.price.discount}% OFF
                          </ThemedText>
                        </>
                      )}
                    </View>

                    {quickViewProduct.rating && (
                      <View style={styles.quickViewRating}>
                        <Ionicons name="star" size={16} color="#FBBF24" />
                        <ThemedText style={styles.quickViewRatingText}>
                          {quickViewProduct.rating.value} ({quickViewProduct.rating.count} reviews)
                        </ThemedText>
                      </View>
                    )}

                      <ThemedText style={styles.quickViewDescription} numberOfLines={3}>
                        {quickViewProduct.description || 'No description available'}
                      </ThemedText>

                    <View style={styles.quickViewActions}>
                      <TouchableOpacity
                        style={[styles.quickViewButton, styles.quickViewButtonPrimary]}
                        onPress={() => {
                          setShowQuickView(false);
                          handleAddToCart(quickViewProduct);
                        }}
                        accessible={true}
                        accessibilityLabel="Add to cart"
                        accessibilityRole="button"
                      >
                        <Ionicons name="bag-outline" size={20} color="#FFFFFF" />
                        <ThemedText style={styles.quickViewButtonText}>Add to Cart</ThemedText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.quickViewButton}
                        onPress={() => {
                          setShowQuickView(false);
                          handleProductPress(quickViewProduct);
                        }}
                        accessible={true}
                        accessibilityLabel="View full details"
                        accessibilityRole="button"
                      >
                        <ThemedText style={styles.quickViewButtonTextSecondary}>View Details</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Product Details Modal */}
      <Modal
        visible={showProductDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProductDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.productDetailsContainer}>
            {selectedProductForDetails && (
              <>
                <View style={styles.productDetailsHeader}>
                  <ThemedText style={styles.productDetailsTitle}>Product Details</ThemedText>
                  <TouchableOpacity
                    onPress={() => setShowProductDetails(false)}
                    accessible={true}
                    accessibilityLabel="Close product details"
                    accessibilityRole="button"
                  >
                    <Ionicons name="close" size={24} color="#111827" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.productDetailsContent} showsVerticalScrollIndicator={false}>
                    <Image
                      source={{ uri: selectedProductForDetails.image }}
                      style={styles.productDetailsImage}
                      resizeMode="cover"
                    />

                  <View style={styles.productDetailsInfo}>
                    <ThemedText style={styles.productDetailsName}>
                      {selectedProductForDetails.name}
                    </ThemedText>

                    <View style={styles.productDetailsPriceRow}>
                      <ThemedText style={styles.productDetailsPrice}>
                        ₹{selectedProductForDetails.price.current.toLocaleString()}
                      </ThemedText>
                      {selectedProductForDetails.price.original && selectedProductForDetails.price.original > selectedProductForDetails.price.current && (
                        <>
                          <ThemedText style={styles.productDetailsOriginalPrice}>
                            ₹{selectedProductForDetails.price.original.toLocaleString()}
                          </ThemedText>
                          <ThemedText style={styles.productDetailsDiscount}>
                            {selectedProductForDetails.price.discount}% OFF
                          </ThemedText>
                        </>
                      )}
                    </View>

                    {selectedProductForDetails.rating && (
                      <View style={styles.productDetailsRating}>
                        <Ionicons name="star" size={18} color="#FBBF24" />
                        <ThemedText style={styles.productDetailsRatingText}>
                          {selectedProductForDetails.rating.value} ({selectedProductForDetails.rating.count} reviews)
                        </ThemedText>
                      </View>
                    )}

                      <View style={styles.productDetailsSection}>
                        <ThemedText style={styles.productDetailsSectionTitle}>Description</ThemedText>
                        <ThemedText style={styles.productDetailsSectionText}>
                          {selectedProductForDetails.description || 'No description available'}
                        </ThemedText>
                      </View>

                    <View style={styles.productDetailsSection}>
                      <ThemedText style={styles.productDetailsSectionTitle}>Availability</ThemedText>
                      <ThemedText style={styles.productDetailsSectionText}>
                        {selectedProductForDetails.availabilityStatus === 'in_stock' ? '✅ In Stock' : '❌ Out of Stock'}
                      </ThemedText>
                    </View>

                    {selectedProductForDetails.brand && (
                      <View style={styles.productDetailsSection}>
                        <ThemedText style={styles.productDetailsSectionTitle}>Brand</ThemedText>
                        <ThemedText style={styles.productDetailsSectionText}>
                          {selectedProductForDetails.brand}
                        </ThemedText>
                      </View>
                    )}

                    {selectedProductForDetails.category && (
                      <View style={styles.productDetailsSection}>
                        <ThemedText style={styles.productDetailsSectionTitle}>Category</ThemedText>
                        <ThemedText style={styles.productDetailsSectionText}>
                          {selectedProductForDetails.category}
                        </ThemedText>
                      </View>
                    )}

                    {selectedProductForDetails.cashback && (
                      <View style={styles.productDetailsSection}>
                        <ThemedText style={styles.productDetailsSectionTitle}>Cashback</ThemedText>
                        <ThemedText style={styles.productDetailsSectionText}>
                          {selectedProductForDetails.cashback.percentage}% cashback
                        </ThemedText>
                      </View>
                    )}

                    <View style={styles.productDetailsActions}>
                      <TouchableOpacity
                        style={[styles.productDetailsButton, styles.productDetailsButtonPrimary]}
                        onPress={() => {
                          setShowProductDetails(false);
                          handleAddToCart(selectedProductForDetails);
                        }}
                        accessible={true}
                        accessibilityLabel="Add to cart"
                        accessibilityRole="button"
                      >
                        <Ionicons name="bag-outline" size={20} color="#FFFFFF" />
                        <ThemedText style={styles.productDetailsButtonText}>Add to Cart</ThemedText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.productDetailsButton}
                        onPress={() => {
                          setShowProductDetails(false);
                          handleProductPress(selectedProductForDetails);
                        }}
                        accessible={true}
                        accessibilityLabel="View full product page"
                        accessibilityRole="button"
                      >
                        <ThemedText style={styles.productDetailsButtonTextSecondary}>View Full Page</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
        </Modal>
      </ThemedView>
      </ErrorBoundary>
    </>
  );
}

// Performance optimization: Memoize component to prevent unnecessary re-renders
const MemoizedStoreProductsPage = React.memo(StoreProductsPage);
export default MemoizedStoreProductsPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContainer: {
    paddingBottom: 24,
    gap: 16,
  },
  row: {
    justifyContent: 'space-between',
    gap: 16,
  },
  productWrapper: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  networkBanner: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  networkBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  skeletonContainer: {
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  suggestionsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 20,
  },
  retryContainer: {
    marginTop: 20,
  },
  waitForNetworkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    gap: 8,
  },
  waitForNetworkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  clearFiltersButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  searchFilterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
    position: 'relative',
    zIndex: 10,
  },
  searchWrapper: {
    flex: 1,
    position: 'relative',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 300,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionsHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionItemText: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  activeFiltersContainer: {
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  activeFilters: {
    paddingHorizontal: 16,
    gap: 8,
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  activeFilterText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  clearAllText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sortOptionActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#8B5CF6',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  priceInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  applyButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Quick Actions Overlay
  quickActionsOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'column',
    gap: 8,
    zIndex: 10,
  },
  quickActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Quick View Modal Styles
  quickViewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  quickViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  quickViewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  quickViewContent: {
    maxHeight: '70%',
  },
  quickViewImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#F3F4F6',
  },
  quickViewInfo: {
    padding: 16,
  },
  quickViewPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  quickViewPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  quickViewOriginalPrice: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  quickViewDiscount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  quickViewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  quickViewRatingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  quickViewDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  quickViewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickViewButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickViewButtonPrimary: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    flexDirection: 'row',
    gap: 8,
  },
  quickViewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickViewButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  // Product Details Modal Styles
  productDetailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 600,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  productDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  productDetailsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  productDetailsContent: {
    maxHeight: '80%',
  },
  productDetailsImage: {
    width: '100%',
    height: 350,
    backgroundColor: '#F3F4F6',
  },
  productDetailsInfo: {
    padding: 16,
  },
  productDetailsName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  productDetailsPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  productDetailsPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  productDetailsOriginalPrice: {
    fontSize: 20,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  productDetailsDiscount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  productDetailsRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  productDetailsRatingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  productDetailsSection: {
    marginBottom: 20,
  },
  productDetailsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  productDetailsSectionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  productDetailsActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  productDetailsButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productDetailsButtonPrimary: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    flexDirection: 'row',
    gap: 8,
  },
  productDetailsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  productDetailsButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});

