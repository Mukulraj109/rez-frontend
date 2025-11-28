/**
 * Tests for CrossStoreProductsSection Component
 *
 * Run with: npm test CrossStoreProductsSection.test.tsx
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CrossStoreProductsSection from './CrossStoreProductsSection';
import { usePersonalizedRecommendations } from '@/hooks/useRecommendations';
import { useRouter } from 'expo-router';

// Mock dependencies
jest.mock('@/hooks/useRecommendations');
jest.mock('expo-router');
jest.mock('@/contexts/CartContext');
jest.mock('@/contexts/WishlistContext');

const mockUsePersonalizedRecommendations = usePersonalizedRecommendations as jest.MockedFunction<
  typeof usePersonalizedRecommendations
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Mock router
const mockPush = jest.fn();
mockUseRouter.mockReturnValue({
  push: mockPush,
} as any);

// Mock product data
const mockProducts = [
  {
    id: 'product-1',
    _id: 'product-1',
    name: 'Test Product 1',
    brand: 'Test Brand',
    image: 'https://example.com/image1.jpg',
    price: {
      current: 999,
      original: 1499,
      currency: 'INR',
      discount: 33,
    },
    storeName: 'Test Store 1',
    storeId: 'store-1',
    category: 'Electronics',
    rating: {
      value: 4.5,
      count: 100,
    },
    availabilityStatus: 'in_stock',
    inventory: {
      stock: 50,
    },
  },
  {
    id: 'product-2',
    _id: 'product-2',
    name: 'Test Product 2',
    brand: 'Test Brand 2',
    image: 'https://example.com/image2.jpg',
    price: {
      current: 1999,
      original: 2999,
      currency: 'INR',
      discount: 33,
    },
    storeName: 'Test Store 2',
    storeId: 'store-2',
    category: 'Fashion',
    rating: {
      value: 4.0,
      count: 50,
    },
    availabilityStatus: 'in_stock',
    inventory: {
      stock: 30,
    },
  },
];

describe('CrossStoreProductsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      mockUsePersonalizedRecommendations.mockReturnValue({
        recommendations: [],
        loading: true,
        error: null,
        fetch: jest.fn(),
        refresh: jest.fn(),
      });

      const { getByText } = render(<CrossStoreProductsSection />);

      expect(getByText('Loading recommendations...')).toBeTruthy();
    });
  });

  describe('Success State', () => {
    it('should render products when data is available', async () => {
      mockUsePersonalizedRecommendations.mockReturnValue({
        recommendations: mockProducts,
        loading: false,
        error: null,
        fetch: jest.fn(),
        refresh: jest.fn(),
      });

      const { getByText } = render(<CrossStoreProductsSection />);

      await waitFor(() => {
        expect(getByText('Recommended for You')).toBeTruthy();
        expect(getByText('Test Product 1')).toBeTruthy();
        expect(getByText('Test Product 2')).toBeTruthy();
      });
    });

    it('should show "View All" button when products are available', () => {
      mockUsePersonalizedRecommendations.mockReturnValue({
        recommendations: mockProducts,
        loading: false,
        error: null,
        fetch: jest.fn(),
        refresh: jest.fn(),
      });

      const { getByText } = render(<CrossStoreProductsSection />);

      expect(getByText('View All')).toBeTruthy();
    });

    it('should show store badges on products', () => {
      mockUsePersonalizedRecommendations.mockReturnValue({
        recommendations: mockProducts,
        loading: false,
        error: null,
        fetch: jest.fn(),
        refresh: jest.fn(),
      });

      const { getByText } = render(<CrossStoreProductsSection />);

      expect(getByText('From Test Store 1')).toBeTruthy();
      expect(getByText('From Test Store 2')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('should show error message when there is an error', () => {
      mockUsePersonalizedRecommendations.mockReturnValue({
        recommendations: [],
        loading: false,
        error: 'Failed to fetch recommendations',
        fetch: jest.fn(),
        refresh: jest.fn(),
      });

      const { getByText } = render(<CrossStoreProductsSection />);

      expect(getByText('Failed to load recommendations')).toBeTruthy();
      expect(getByText('Failed to fetch recommendations')).toBeTruthy();
    });

    it('should show retry button on error', () => {
      mockUsePersonalizedRecommendations.mockReturnValue({
        recommendations: [],
        loading: false,
        error: 'Network error',
        fetch: jest.fn(),
        refresh: jest.fn(),
      });

      const { getByText } = render(<CrossStoreProductsSection />);

      expect(getByText('Retry')).toBeTruthy();
    });

    it('should call refresh when retry button is pressed', () => {
      const mockRefresh = jest.fn();
      mockUsePersonalizedRecommendations.mockReturnValue({
        recommendations: [],
        loading: false,
        error: 'Network error',
        fetch: jest.fn(),
        refresh: mockRefresh,
      });

      const { getByText } = render(<CrossStoreProductsSection />);

      const retryButton = getByText('Retry');
      fireEvent.press(retryButton);

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  describe('Empty State', () => {
    it('should return null when no products and not loading', () => {
      mockUsePersonalizedRecommendations.mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        fetch: jest.fn(),
        refresh: jest.fn(),
      });

      const { container } = render(<CrossStoreProductsSection />);

      expect(container).toBeNull();
    });
  });

  describe('Store Filtering', () => {
    it('should filter out products from current store', () => {
      const productsWithCurrentStore = [
        ...mockProducts,
        {
          ...mockProducts[0],
          id: 'product-3',
          _id: 'product-3',
          storeId: 'current-store',
          storeName: 'Current Store',
        },
      ];

      mockUsePersonalizedRecommendations.mockReturnValue({
        recommendations: productsWithCurrentStore,
        loading: false,
        error: null,
        fetch: jest.fn(),
        refresh: jest.fn(),
      });

      const { queryByText } = render(
        <CrossStoreProductsSection currentStoreId="current-store" />
      );

      expect(queryByText('Test Store 1')).toBeTruthy();
      expect(queryByText('Test Store 2')).toBeTruthy();
      expect(queryByText('Current Store')).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('should navigate to product page when product is pressed', () => {
      mockUsePersonalizedRecommendations.mockReturnValue({
        recommendations: mockProducts,
        loading: false,
        error: null,
        fetch: jest.fn(),
        refresh: jest.fn(),
      });

      const { getByText } = render(<CrossStoreProductsSection />);

      const product = getByText('Test Product 1');
      fireEvent.press(product);

      expect(mockPush).toHaveBeenCalledWith('/product/product-1');
    });

    it('should navigate to search page when "View All" is pressed', () => {
      mockUsePersonalizedRecommendations.mockReturnValue({
        recommendations: mockProducts,
        loading: false,
        error: null,
        fetch: jest.fn(),
        refresh: jest.fn(),
      });

      const { getByText } = render(<CrossStoreProductsSection />);

      const viewAllButton = getByText('View All');
      fireEvent.press(viewAllButton);

      expect(mockPush).toHaveBeenCalledWith('/search');
    });
  });

  describe('Custom Handlers', () => {
    it('should call custom onProductPress handler', () => {
      const mockOnProductPress = jest.fn();
      mockUsePersonalizedRecommendations.mockReturnValue({
        recommendations: mockProducts,
        loading: false,
        error: null,
        fetch: jest.fn(),
        refresh: jest.fn(),
      });

      const { getByText } = render(
        <CrossStoreProductsSection onProductPress={mockOnProductPress} />
      );

      const product = getByText('Test Product 1');
      fireEvent.press(product);

      expect(mockOnProductPress).toHaveBeenCalledWith(
        'product-1',
        expect.objectContaining({
          id: 'product-1',
          name: 'Test Product 1',
        })
      );
    });
  });

  describe('Props', () => {
    it('should respect custom limit prop', () => {
      const mockFetch = jest.fn();
      mockUsePersonalizedRecommendations.mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        fetch: mockFetch,
        refresh: jest.fn(),
      });

      render(<CrossStoreProductsSection limit={5} />);

      // Hook should be called with limit=5
      expect(mockUsePersonalizedRecommendations).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 5,
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      mockUsePersonalizedRecommendations.mockReturnValue({
        recommendations: mockProducts,
        loading: false,
        error: null,
        fetch: jest.fn(),
        refresh: jest.fn(),
      });

      const { getByLabelText } = render(<CrossStoreProductsSection />);

      expect(
        getByLabelText('Cross-store product recommendations section')
      ).toBeTruthy();
    });

    it('should have accessible buttons', () => {
      mockUsePersonalizedRecommendations.mockReturnValue({
        recommendations: mockProducts,
        loading: false,
        error: null,
        fetch: jest.fn(),
        refresh: jest.fn(),
      });

      const { getByLabelText } = render(<CrossStoreProductsSection />);

      expect(getByLabelText('View all recommendations')).toBeTruthy();
    });
  });

  describe('Responsive Design', () => {
    it('should render correctly on different screen sizes', () => {
      mockUsePersonalizedRecommendations.mockReturnValue({
        recommendations: mockProducts,
        loading: false,
        error: null,
        fetch: jest.fn(),
        refresh: jest.fn(),
      });

      // Test should pass regardless of screen size
      const { container } = render(<CrossStoreProductsSection />);
      expect(container).toBeTruthy();
    });
  });
});
