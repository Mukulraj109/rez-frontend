// useOrderHistory Hook
// Custom hook for managing order history data and operations

import { useState, useCallback, useEffect } from 'react';
import { Order, OrderFilter } from '@/types/order';
import orderApi from '@/services/orderApi';

interface UseOrderHistoryReturn {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  searchOrders: (query: string) => Order[];
  filterOrders: (orders: Order[], filter: OrderFilter) => Order[];
}

export const useOrderHistory = (): UseOrderHistoryReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  // Fetch orders from API
  const fetchOrders = useCallback(async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await orderApi.getOrders({
        page: pageNum,
        limit: 20,
      });

      if (response.success && response.data) {
        const newOrders = response.data.orders;
        
        if (refresh || pageNum === 1) {
          setOrders(newOrders);
          setAllOrders(newOrders);
        } else {
          setOrders(prev => [...prev, ...newOrders]);
          setAllOrders(prev => [...prev, ...newOrders]);
        }

        setHasMore(newOrders.length === 20);
        setPage(pageNum);
      } else {
        throw new Error(response.error || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load more orders
  const loadMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      await fetchOrders(page + 1);
    }
  }, [fetchOrders, page, isLoading, hasMore]);

  // Refresh orders
  const refresh = useCallback(async () => {
    await fetchOrders(1, true);
  }, [fetchOrders]);

  // Search orders
  const searchOrders = useCallback((query: string): Order[] => {
    if (!query.trim()) return allOrders;
    
    const searchTerm = query.toLowerCase();
    return allOrders.filter(order => 
      order.orderNumber.toLowerCase().includes(searchTerm) ||
      order.items.some(item => 
        item.productName.toLowerCase().includes(searchTerm)
      ) ||
      order.shippingAddress.name.toLowerCase().includes(searchTerm)
    );
  }, [allOrders]);

  // Filter orders
  const filterOrders = useCallback((ordersToFilter: Order[], filter: OrderFilter): Order[] => {
    let filtered = [...ordersToFilter];

    // Filter by status
    if (filter.status !== 'all') {
      filtered = filtered.filter(order => order.status === filter.status);
    }

    // Filter by date range
    if (filter.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (filter.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'custom':
          if (filter.startDate && filter.endDate) {
            startDate = new Date(filter.startDate);
            const endDate = new Date(filter.endDate);
            filtered = filtered.filter(order => {
              const orderDate = new Date(order.createdAt);
              return orderDate >= startDate && orderDate <= endDate;
            });
          }
          break;
        default:
          startDate = new Date(0);
      }

      if (filter.dateRange !== 'custom') {
        filtered = filtered.filter(order => new Date(order.createdAt) >= startDate);
      }
    }

    // Sort orders
    filtered.sort((a, b) => {
      switch (filter.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount_high':
          return b.total - a.total;
        case 'amount_low':
          return a.total - b.total;
        default:
          return 0;
      }
    });

    return filtered;
  }, []);

  // Initial load
  useEffect(() => {
    fetchOrders(1, true);
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    searchOrders,
    filterOrders,
  };
};

export default useOrderHistory;
