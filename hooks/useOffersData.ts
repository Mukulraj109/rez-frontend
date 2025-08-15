import { useState, useEffect, useMemo } from 'react';
import { Offer, OfferFilters, OfferSection } from '@/types/offers.types';
import { offersPageData } from '@/data/offersData';

export function useOffersData() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFilters] = useState<OfferFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    setLoading(true);
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Filter offers based on current filters
  const filteredSections = useMemo(() => {
    if (!filters.category && !filters.priceRange && !filters.cashBackMin && !filters.sortBy) {
      return offersPageData.sections;
    }

    return offersPageData.sections.map(section => {
      let filteredOffers = [...section.offers];

      // Filter by category
      if (filters.category) {
        filteredOffers = filteredOffers.filter(offer => 
          offer.category.toLowerCase() === filters.category?.toLowerCase()
        );
      }

      // Filter by cash back minimum
      if (filters.cashBackMin) {
        filteredOffers = filteredOffers.filter(offer => 
          offer.cashBackPercentage >= filters.cashBackMin!
        );
      }

      // Filter by price range
      if (filters.priceRange && filters.priceRange.min >= 0) {
        filteredOffers = filteredOffers.filter(offer => {
          const price = offer.discountedPrice || offer.originalPrice || 0;
          return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
        });
      }

      // Sort offers
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'cashback':
            filteredOffers.sort((a, b) => b.cashBackPercentage - a.cashBackPercentage);
            break;
          case 'price':
            filteredOffers.sort((a, b) => {
              const priceA = a.discountedPrice || a.originalPrice || 0;
              const priceB = b.discountedPrice || b.originalPrice || 0;
              return priceA - priceB;
            });
            break;
          case 'newest':
            filteredOffers.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
            break;
          case 'distance':
            // Simple distance sorting (would be more complex in real app)
            filteredOffers.sort((a, b) => a.distance.localeCompare(b.distance));
            break;
        }
      }

      return {
        ...section,
        offers: filteredOffers
      };
    }).filter(section => section.offers.length > 0);
  }, [filters]);

  // Get favorite offers
  const favoriteOffers = useMemo(() => {
    const allOffers = offersPageData.sections.flatMap(section => section.offers);
    return allOffers.filter(offer => favorites.includes(offer.id));
  }, [favorites]);

  // Toggle favorite
  const toggleFavorite = (offerId: string) => {
    setFavorites(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  // Clear all favorites
  const clearFavorites = () => {
    setFavorites([]);
  };

  // Update filters
  const updateFilters = (newFilters: Partial<OfferFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({});
  };

  // Get offers by category
  const getOffersByCategory = (category: string): Offer[] => {
    const allOffers = offersPageData.sections.flatMap(section => section.offers);
    return allOffers.filter(offer => 
      offer.category.toLowerCase() === category.toLowerCase()
    );
  };

  // Get trending offers
  const getTrendingOffers = (): Offer[] => {
    const allOffers = offersPageData.sections.flatMap(section => section.offers);
    return allOffers.filter(offer => offer.isTrending);
  };

  // Get new offers
  const getNewOffers = (): Offer[] => {
    const allOffers = offersPageData.sections.flatMap(section => section.offers);
    return allOffers.filter(offer => offer.isNew);
  };

  // Get best sellers
  const getBestSellers = (): Offer[] => {
    const allOffers = offersPageData.sections.flatMap(section => section.offers);
    return allOffers.filter(offer => offer.isBestSeller);
  };

  // Search offers
  const searchOffers = (query: string): Offer[] => {
    if (!query.trim()) return [];
    
    const allOffers = offersPageData.sections.flatMap(section => section.offers);
    const lowercaseQuery = query.toLowerCase();
    
    return allOffers.filter(offer =>
      offer.title.toLowerCase().includes(lowercaseQuery) ||
      offer.category.toLowerCase().includes(lowercaseQuery) ||
      offer.store.name.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    // Data
    offersData: offersPageData,
    sections: filteredSections,
    favorites,
    favoriteOffers,
    filters,
    loading,
    error,
    
    // Actions
    toggleFavorite,
    clearFavorites,
    updateFilters,
    resetFilters,
    
    // Utilities
    getOffersByCategory,
    getTrendingOffers,
    getNewOffers,
    getBestSellers,
    searchOffers,
  };
}