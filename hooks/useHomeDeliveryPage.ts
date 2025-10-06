import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';

import {
  HomeDeliveryPageState,
  HomeDeliveryFilters,
  UseHomeDeliveryPageReturn,
  HomeDeliveryProduct,
  HomeDeliveryCategory,
} from '@/types/home-delivery.types';
import productsApi from '@/services/productsApi';
import categoriesApi from '@/services/categoriesApi';

// Helper function to map backend product to HomeDeliveryProduct
const mapBackendProductToHomeDelivery = (product: any): HomeDeliveryProduct => {
  // Calculate availability status from backend or inventory
  const stock = product.inventory?.stock || 0;
  let availabilityStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'out_of_stock';

  // Use backend availabilityStatus if available, otherwise calculate from stock
  if (product.availabilityStatus) {
    availabilityStatus = product.availabilityStatus.replace(/-/g, '_') as 'in_stock' | 'low_stock' | 'out_of_stock';
  } else if (stock > 10) {
    availabilityStatus = 'in_stock';
  } else if (stock > 0) {
    availabilityStatus = 'low_stock';
  }

  // Determine delivery time based on product category and availability
  let deliveryTime = product.store?.deliveryInfo?.estimatedTime;
  if (!deliveryTime) {
    // Vary delivery time based on category and stock
    const categoryName = product.category?.name?.toLowerCase() || '';
    if (categoryName.includes('fashion') || categoryName.includes('book')) {
      deliveryTime = '1-2 days';
    } else if (categoryName.includes('electronics') && stock > 50) {
      deliveryTime = 'Under 30min'; // Express delivery for electronics with good stock
    } else if (stock > 20) {
      deliveryTime = '2-3 days';
    } else {
      deliveryTime = '3-5 days'; // Longer for low stock items
    }
  }

  // Calculate cashback percentage (if available from product metadata)
  const cashbackPercentage = product.cashback?.percentage || product.discountPercentage || 5;

  return {
    id: product._id || product.id,
    name: product.name || product.title,
    brand: product.brand,
    image: (Array.isArray(product.images) && product.images[0]) || product.image || product.thumbnail || '',
    price: {
      current: product.price?.current || product.pricing?.selling || 0,
      original: product.price?.original || product.pricing?.compare,
      currency: product.price?.currency || '₹',
      discount: product.price?.discount || (product.price?.original && product.price?.current
        ? Math.round(((product.price.original - product.price.current) / product.price.original) * 100)
        : (product.pricing?.compare && product.pricing?.selling
          ? Math.round(((product.pricing.compare - product.pricing.selling) / product.pricing.compare) * 100)
          : 0)),
    },
    cashback: {
      percentage: cashbackPercentage,
      maxAmount: product.cashback?.maxAmount,
    },
    category: product.category?.name || product.category || 'Uncategorized',
    categoryId: product.category?._id || product.category?.id || product.categoryId || 'all',
    shipping: {
      type: product.shipping?.type || ((product.price?.current || product.pricing?.selling || 0) > 500 ? 'free' : 'paid'),
      cost: product.shipping?.cost || ((product.price?.current || product.pricing?.selling || 0) > 500 ? 0 : 40),
      estimatedDays: deliveryTime,
      freeShippingEligible: (product.price?.current || product.pricing?.selling || 0) > 500,
    },
    rating: product.rating ? {
      value: product.rating.value || product.rating.average || 0,
      count: product.rating.count || 0,
    } : (product.ratings ? {
      value: product.ratings.average || 0,
      count: product.ratings.count || 0,
    } : undefined),
    deliveryTime,
    isNew: product.isNew || product.isNewArrival || false,
    isFeatured: product.isFeatured || product.isRecommended || false,
    isUnderDollarShipping: (product.shipping?.cost || 40) <= 50,
    availabilityStatus,
    tags: product.tags || [],
    description: product.description || '',
    store: {
      id: product.store?._id || product.store?.id || '',
      name: product.store?.name || '',
      logo: product.store?.logo || product.store?.image,
    },
  };
};

// Helper to map backend categories
const mapBackendCategories = (categories: any[]): HomeDeliveryCategory[] => {
  // Icon mapping based on category name
  const getIconForCategory = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('electronic')) return 'phone-portrait';
    if (lowerName.includes('fashion')) return 'shirt';
    if (lowerName.includes('book')) return 'book';
    if (lowerName.includes('sport')) return 'basketball';
    if (lowerName.includes('home') || lowerName.includes('kitchen')) return 'home';
    return 'cube';
  };

  const mapped = categories.map(cat => ({
    id: cat._id || cat.id,
    name: cat.name,
    icon: cat.icon || getIconForCategory(cat.name),
    productCount: cat.productCount || 0,
    isActive: false,
  }));

  // Add "All" category at the beginning
  return [
    {
      id: 'all',
      name: 'All',
      icon: 'apps',
      productCount: categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0),
      isActive: true,
    },
    ...mapped,
  ];
};

// Initial state
const initialState: HomeDeliveryPageState = {
  categories: [],
  products: [],
  filteredProducts: [],
  sections: [],
  activeCategory: 'all',
  searchQuery: '',
  sortBy: 'newest',
  filters: {
    shipping: [],
    ratings: [],
    deliveryTime: [],
    priceRange: { min: 0, max: Infinity },
    brands: [],
    availability: [],
  },
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  showSearchBar: false,
};

export function useHomeDeliveryPage(): UseHomeDeliveryPageReturn {
  const router = useRouter();
  const [state, setState] = useState<HomeDeliveryPageState>(initialState);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    console.log('🏠 [HOME DELIVERY] Loading initial data from real API...');
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch categories and products in parallel
      const [categoriesResponse, productsResponse] = await Promise.all([
        categoriesApi.getCategories(),
        productsApi.getProducts({ page: 1, limit: 20 }),
      ]);

      console.log('📦 [HOME DELIVERY] API responses:', {
        categoriesSuccess: categoriesResponse.success,
        productsSuccess: productsResponse.success,
        categoriesCount: categoriesResponse.data?.length || 0,
        productsCount: Array.isArray(productsResponse.data) ? productsResponse.data.length : (productsResponse.data?.products?.length || 0),
      });

      // Map categories
      const categories = categoriesResponse.success && categoriesResponse.data
        ? mapBackendCategories(categoriesResponse.data)
        : [initialState.categories[0]]; // Fallback to "All" category

      // Map products - handle both data structures: data[] or data.products[]
      const rawProducts = productsResponse.success && productsResponse.data
        ? (Array.isArray(productsResponse.data) ? productsResponse.data : productsResponse.data.products || [])
        : [];

      const products = rawProducts.map(mapBackendProductToHomeDelivery);

      console.log('📦 [HOME DELIVERY] Mapped products sample:', {
        total: products.length,
        first: products[0] ? {
          name: products[0].name,
          price: products[0].price,
          shipping: products[0].shipping,
          deliveryTime: products[0].deliveryTime,
          category: products[0].category,
        } : null
      });

      // Create sections from products
      const featuredProducts = products.filter(p => p.isFeatured);
      const newProducts = products.filter(p => p.isNew);

      console.log('📊 [HOME DELIVERY] Section products:', {
        total: products.length,
        featured: featuredProducts.length,
        new: newProducts.length,
        sampleProduct: products[0] ? {
          name: products[0].name,
          isFeatured: products[0].isFeatured,
          isNew: products[0].isNew
        } : null
      });

      const sections = [
        {
          id: 'featured',
          title: 'Featured Products',
          subtitle: 'Handpicked for you',
          products: featuredProducts.slice(0, 10),
          showViewAll: true,
          maxProducts: 10,
        },
        {
          id: 'new-arrivals',
          title: 'New Arrivals',
          subtitle: 'Latest additions',
          products: newProducts.slice(0, 10),
          showViewAll: true,
          maxProducts: 10,
        },
      ];

      const hasMore = (productsResponse.meta?.pagination?.pages || productsResponse.data?.pagination?.pages || 1) > 1;

      setState(prev => ({
        ...prev,
        products,
        filteredProducts: products,
        categories,
        sections,
        loading: false,
        error: null,
        hasMore,
      }));

      console.log('✅ [HOME DELIVERY] Initial data loaded successfully');
    } catch (error) {
      console.error('❌ [HOME DELIVERY] Failed to load initial data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load products. Please try again.',
      }));
    }
  };

  // Actions
  const setActiveCategory = useCallback(async (categoryId: string) => {
    console.log('🏠 [HOME DELIVERY] Changing category to:', categoryId);
    setState(prev => ({ ...prev, loading: true, activeCategory: categoryId }));

    try {
      // Fetch products for the selected category
      const query = categoryId === 'all'
        ? { page: 1, limit: 20 }
        : { page: 1, limit: 20, category: categoryId };

      const response = await productsApi.getProducts(query);

      if (response.success && response.data) {
        const rawProducts = Array.isArray(response.data) ? response.data : (response.data.products || []);
        const products = rawProducts.map(mapBackendProductToHomeDelivery);
        const hasMore = (response.meta?.pagination?.pages || response.data?.pagination?.pages || 1) > 1;

        setState(prev => ({
          ...prev,
          products,
          filteredProducts: products,
          loading: false,
          hasMore,
          page: 1,
        }));

        console.log('✅ [HOME DELIVERY] Category products loaded:', products.length);
      }
    } catch (error) {
      console.error('❌ [HOME DELIVERY] Failed to load category products:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load products for this category.',
      }));
    }
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => {
      let filteredProducts = prev.products;
      
      // Apply category filter first
      if (prev.activeCategory !== 'all') {
        filteredProducts = getProductsByCategory(prev.activeCategory);
      }
      
      // Apply search filter
      if (query.trim()) {
        const searchTerm = query.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.brand?.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      
      return {
        ...prev,
        searchQuery: query,
        filteredProducts,
      };
    });
  }, []);

  const setSortBy = useCallback((sortBy: HomeDeliveryPageState['sortBy']) => {
    setState(prev => {
      const sortedProducts = [...prev.filteredProducts].sort((a, b) => {
        switch (sortBy) {
          case 'price_low':
            return a.price.current - b.price.current;
          case 'price_high':
            return b.price.current - a.price.current;
          case 'cashback_high':
            return b.cashback.percentage - a.cashback.percentage;
          case 'rating':
            return (b.rating?.value || 0) - (a.rating?.value || 0);
          case 'delivery_time':
            // Sort by delivery time (Under 30min first)
            const timeOrder = { 'Under 30min': 0, '1-2 days': 1, '2-3 days': 2, '3-5 days': 3 };
            const aTime = timeOrder[a.deliveryTime as keyof typeof timeOrder] ?? 999;
            const bTime = timeOrder[b.deliveryTime as keyof typeof timeOrder] ?? 999;
            return aTime - bTime;
          default:
            return 0;
        }
      });

      return {
        ...prev,
        sortBy,
        filteredProducts: sortedProducts,
      };
    });
  }, []);

  const setFilters = useCallback((filters: HomeDeliveryFilters) => {
    setState(prev => ({ ...prev, filters }));
  }, []);

  const loadProducts = useCallback(async () => {
    console.log('🏠 [HOME DELIVERY] Reloading products...');
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const query = state.activeCategory === 'all'
        ? { page: 1, limit: 20 }
        : { page: 1, limit: 20, category: state.activeCategory };

      const response = await productsApi.getProducts(query);

      if (response.success && response.data) {
        const rawProducts = Array.isArray(response.data) ? response.data : (response.data.products || []);
        const products = rawProducts.map(mapBackendProductToHomeDelivery);
        const hasMore = (response.meta?.pagination?.pages || response.data?.pagination?.pages || 1) > 1;

        setState(prev => ({
          ...prev,
          products,
          filteredProducts: products,
          loading: false,
          hasMore,
          page: 1,
        }));
      }
    } catch (error) {
      console.error('❌ [HOME DELIVERY] Failed to reload products:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load products.',
      }));
    }
  }, [state.activeCategory]);

  const loadMoreProducts = useCallback(async () => {
    if (state.loading || !state.hasMore) return;

    console.log('🏠 [HOME DELIVERY] Loading more products, page:', state.page + 1);
    setState(prev => ({ ...prev, loading: true }));

    try {
      const query = state.activeCategory === 'all'
        ? { page: state.page + 1, limit: 20 }
        : { page: state.page + 1, limit: 20, category: state.activeCategory };

      const response = await productsApi.getProducts(query);

      if (response.success && response.data) {
        const rawProducts = Array.isArray(response.data) ? response.data : (response.data.products || []);
        const newProducts = rawProducts.map(mapBackendProductToHomeDelivery);
        const pagination = response.meta?.pagination || response.data?.pagination;
        const hasMore = pagination ? pagination.page < pagination.pages : false;

        setState(prev => ({
          ...prev,
          products: [...prev.products, ...newProducts],
          filteredProducts: [...prev.filteredProducts, ...newProducts],
          hasMore,
          page: prev.page + 1,
          loading: false,
        }));

        console.log('✅ [HOME DELIVERY] Loaded', newProducts.length, 'more products');
      }
    } catch (error) {
      console.error('❌ [HOME DELIVERY] Failed to load more products:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load more products.',
      }));
    }
  }, [state.activeCategory, state.page, state.loading, state.hasMore]);

  const searchProductsAction = useCallback(async (query: string) => {
    if (!query.trim()) {
      // If empty, reload products
      loadProducts();
      return;
    }

    console.log('🏠 [HOME DELIVERY] Searching products:', query);
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const searchQuery = {
        q: query,
        category: state.activeCategory !== 'all' ? state.activeCategory : undefined,
        page: 1,
        limit: 20,
      };

      const response = await productsApi.searchProducts(searchQuery);

      if (response.success && response.data?.products) {
        const products = response.data.products.map(mapBackendProductToHomeDelivery);

        setState(prev => ({
          ...prev,
          filteredProducts: products,
          loading: false,
        }));

        console.log('✅ [HOME DELIVERY] Search results:', products.length);
      }
    } catch (error) {
      console.error('❌ [HOME DELIVERY] Search failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Search failed. Please try again.',
      }));
    }
  }, [state.activeCategory, loadProducts]);

  const refreshProducts = useCallback(async () => {
    await loadProducts();
  }, [loadProducts]);

  const applyFilters = useCallback(async (filters: HomeDeliveryFilters) => {
    console.log('🔍 [HOME DELIVERY] Applying filters:', filters);
    setState(prev => ({ ...prev, loading: true, filters }));

    try {
      // Apply filters to existing products
      let filteredProducts = state.products;
      
      // Shipping filter
      if (filters.shipping.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          filters.shipping.includes(product.shipping.type)
        );
      }
      
      // Price range filter
      if (filters.priceRange.min > 0 || filters.priceRange.max < Infinity) {
        filteredProducts = filteredProducts.filter(product => 
          product.price.current >= filters.priceRange.min && 
          product.price.current <= filters.priceRange.max
        );
      }
      
      // Ratings filter
      if (filters.ratings.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          product.rating && filters.ratings.some(rating => product.rating!.value >= rating)
        );
      }
      
      // Delivery time filter
      if (filters.deliveryTime.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          filters.deliveryTime.includes(product.deliveryTime)
        );
      }
      
      // Brand filter
      if (filters.brands.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          product.brand && filters.brands.includes(product.brand)
        );
      }
      
      // Availability filter
      if (filters.availability.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          filters.availability.includes(product.availabilityStatus)
        );
      }

      setState(prev => ({
        ...prev,
        filteredProducts,
        loading: false,
      }));

      console.log('✅ [HOME DELIVERY] Filters applied, showing', filteredProducts.length, 'products');
    } catch (error) {
      console.error('❌ [HOME DELIVERY] Failed to apply filters:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to apply filters.',
      }));
    }
  }, [state.products]);

  const resetFilters = useCallback(async () => {
    console.log('🏠 [HOME DELIVERY] Resetting filters');
    setState(prev => ({
      ...prev,
      filters: initialState.filters,
      filteredProducts: prev.products, // Show all loaded products
    }));
  }, []);

  // Handlers
  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
  }, [setActiveCategory]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  const handleSearchSubmit = useCallback((query: string) => {
    searchProductsAction(query);
  }, [searchProductsAction]);

  const handleProductPress = useCallback((product: HomeDeliveryProduct) => {
    console.log(`🏠 [HOME DELIVERY] Product pressed: ${product.name}`);
    router.push(`/product/${product.id}` as any);
  }, [router]);

  const handleSortChange = useCallback((sortBy: HomeDeliveryPageState['sortBy']) => {
    setSortBy(sortBy);
  }, [setSortBy]);

  const handleFilterChange = useCallback((filters: HomeDeliveryFilters) => {
    applyFilters(filters);
  }, [applyFilters]);

  const handleLoadMore = useCallback(() => {
    loadMoreProducts();
  }, [loadMoreProducts]);

  const handleRefresh = useCallback(() => {
    refreshProducts();
  }, [refreshProducts]);

  const handleHideSearch = useCallback(() => {
    setState(prev => ({ ...prev, showSearchBar: false }));
  }, []);

  const handleShowSearch = useCallback(() => {
    setState(prev => ({ ...prev, showSearchBar: true }));
  }, []);

  return {
    state,
    actions: {
      setActiveCategory,
      setSearchQuery,
      setSortBy,
      setFilters,
      loadProducts,
      loadMoreProducts,
      searchProducts: searchProductsAction,
      refreshProducts,
      applyFilters,
      resetFilters,
    },
    handlers: {
      handleCategoryChange,
      handleSearchChange,
      handleSearchSubmit,
      handleProductPress,
      handleSortChange,
      handleFilterChange,
      handleLoadMore,
      handleRefresh,
      handleHideSearch,
      handleShowSearch,
    },
  };
}