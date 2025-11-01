import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import realOffersApi, { Offer, OfferCategory, HeroBanner, OffersPageData } from '@/services/realOffersApi';
import { useLocation } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';

export interface OffersPageState {
  pageData: OffersPageData | null;
  categories: OfferCategory[];
  heroBanners: HeroBanner[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface OffersPageActions {
  loadOffersPageData: () => Promise<void>;
  refreshOffersPageData: () => Promise<void>;
  toggleOfferLike: (offerId: string) => Promise<void>;
  shareOffer: (offerId: string, platform?: string) => Promise<void>;
  trackOfferView: (offerId: string) => Promise<void>;
  trackOfferClick: (offerId: string) => Promise<void>;
  clearError: () => void;
}

export interface OffersPageHandlers {
  handleBack: () => void;
  handleShare: () => Promise<void>;
  handleFavorite: () => void;
  handleOfferPress: (offer: Offer) => void;
  handleViewAll: (sectionTitle: string) => void;
  handleLocationPermission: () => Promise<void>;
}

export interface UseOffersPageReturn {
  state: OffersPageState;
  actions: OffersPageActions;
  handlers: OffersPageHandlers;
}

export function useOffersPage(): UseOffersPageReturn {
  const { state: authState } = useAuth();
  const { state: locationState, requestLocationPermission } = useLocation();
  
  const [state, setState] = useState<OffersPageState>({
    pageData: null,
    categories: [],
    heroBanners: [],
    loading: true,
    error: null,
    refreshing: false,
    userLocation: null
  });

  // Load offers page data
  const loadOffersPageData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const params: any = {};
      if (state.userLocation) {
        params.lat = state.userLocation.latitude;
        params.lng = state.userLocation.longitude;
      }

      const [pageDataResponse, categoriesResponse, bannersResponse] = await Promise.all([
        realOffersApi.getOffersPageData(params),
        realOffersApi.getOfferCategories(),
        realOffersApi.getHeroBanners({ page: 'offers' })
      ]);

      if (pageDataResponse.success && pageDataResponse.data) {
        console.log('💰 [OFFERS PAGE] API Response:', {
          userPoints: pageDataResponse.data.userEngagement?.userPoints,
          hasUserEngagement: !!pageDataResponse.data.userEngagement,
          fullResponse: pageDataResponse.data.userEngagement
        });
        
        setState(prev => ({
          ...prev,
          pageData: pageDataResponse.data || null,
          categories: categoriesResponse.success ? (categoriesResponse.data || []) : [],
          heroBanners: bannersResponse.success ? (bannersResponse.data || []) : [],
          loading: false,
          error: null
        }));
      } else {
        throw new Error('Failed to load offers page data');
      }
    } catch (error) {
      console.error('Error loading offers page data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load offers'
      }));
    }
  }, [state.userLocation]);

  // Refresh offers page data
  const refreshOffersPageData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, refreshing: true, error: null }));

      const params: any = {};
      if (state.userLocation) {
        params.lat = state.userLocation.latitude;
        params.lng = state.userLocation.longitude;
      }

      const [pageDataResponse, categoriesResponse, bannersResponse] = await Promise.all([
        realOffersApi.getOffersPageData(params),
        realOffersApi.getOfferCategories(),
        realOffersApi.getHeroBanners({ page: 'offers' })
      ]);

      if (pageDataResponse.success && pageDataResponse.data) {
        setState(prev => ({
          ...prev,
          pageData: pageDataResponse.data || null,
          categories: categoriesResponse.success ? (categoriesResponse.data || []) : [],
          heroBanners: bannersResponse.success ? (bannersResponse.data || []) : [],
          refreshing: false,
          error: null
        }));
      } else {
        throw new Error('Failed to refresh offers page data');
      }
    } catch (error) {
      console.error('Error refreshing offers page data:', error);
      setState(prev => ({
        ...prev,
        refreshing: false,
        error: error instanceof Error ? error.message : 'Failed to refresh offers'
      }));
    }
  }, [state.userLocation]);

  // Toggle offer like
  const toggleOfferLike = useCallback(async (offerId: string) => {
    try {
      const response = await realOffersApi.toggleOfferLike(offerId);
      
      if (response.success && response.data) {
        // Update the offer in pageData
        setState(prev => {
          if (!prev.pageData) return prev;

          const updateOfferInSection = (section: any) => ({
            ...section,
            offers: section.offers.map((offer: Offer) =>
              offer._id === offerId
                ? {
                    ...offer,
                    engagement: {
                      ...offer.engagement,
                      isLikedByUser: response.data!.isLiked,
                      likesCount: response.data!.likesCount
                    }
                  }
                : offer
            )
          });

          return {
            ...prev,
            pageData: {
              ...prev.pageData,
              sections: {
                mega: updateOfferInSection(prev.pageData.sections.mega),
                students: updateOfferInSection(prev.pageData.sections.students),
                newArrivals: updateOfferInSection(prev.pageData.sections.newArrivals),
                trending: updateOfferInSection(prev.pageData.sections.trending)
              },
              userEngagement: {
                ...prev.pageData.userEngagement,
                likedOffers: response.data!.isLiked
                  ? [...prev.pageData.userEngagement.likedOffers, offerId]
                  : prev.pageData.userEngagement.likedOffers.filter(id => id !== offerId)
              }
            }
          };
        });
      }
    } catch (error) {
      console.error('Error toggling offer like:', error);
    }
  }, []);

  // Share offer
  const shareOffer = useCallback(async (offerId: string, platform?: string) => {
    try {
      await realOffersApi.shareOffer(offerId, { platform });
    } catch (error) {
      console.error('Error sharing offer:', error);
    }
  }, []);

  // Track offer view
  const trackOfferView = useCallback(async (offerId: string) => {
    try {
      await realOffersApi.trackOfferView(offerId);
    } catch (error) {
      console.error('Error tracking offer view:', error);
    }
  }, []);

  // Track offer click
  const trackOfferClick = useCallback(async (offerId: string) => {
    try {
      await realOffersApi.trackOfferClick(offerId);
    } catch (error) {
      console.error('Error tracking offer click:', error);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Handlers
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, []);

  const handleShare = useCallback(async () => {
    // Share the offers page - could be implemented with React Native Share API
    console.log('Share offers page');
  }, []);

  const handleFavorite = useCallback(() => {
    // This could be implemented to show a favorites modal or navigate to favorites page

  }, []);

  const handleOfferPress = useCallback((offer: Offer) => {
    // Track the click
    trackOfferClick(offer._id);
    
    // Navigate to offer details page
    router.push(`/offers/${offer._id}`);
  }, [trackOfferClick]);

  const handleViewAll = useCallback((sectionTitle: string) => {
    // Map section titles to actual category values from backend
    const categoryMap: { [key: string]: string } = {
      'MEGA OFFERS': 'mega',
      'Mega Offers': 'mega',
      'Offer for the students': 'student',
      'Student Offers': 'student',
      'New arrival': 'new_arrival',
      'New Arrivals': 'new_arrival',
      'Trending Now': 'trending',
      'Trending': 'trending'
    };

    const category = categoryMap[sectionTitle] || null;
    
    if (category) {
      router.push({
        pathname: '/offers/view-all',
        params: { category }
      } as any);
    } else {
      // Fallback: show all offers
      router.push('/offers/view-all' as any);
    }
  }, []);

  const handleLocationPermission = useCallback(async () => {
    try {
      const granted = await requestLocationPermission();
      if (granted && locationState.currentLocation) {
        setState(prev => ({
          ...prev,
          userLocation: {
            latitude: locationState.currentLocation!.coordinates.latitude,
            longitude: locationState.currentLocation!.coordinates.longitude
          }
        }));
        // Reload data with location
        await loadOffersPageData();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  }, [requestLocationPermission, locationState, loadOffersPageData]);

  // Load data on mount
  useEffect(() => {
    loadOffersPageData();
  }, [loadOffersPageData]);

  // Update user location when location context changes
  useEffect(() => {
    if (locationState.currentLocation) {
      setState(prev => ({
        ...prev,
        userLocation: {
          latitude: locationState.currentLocation!.coordinates.latitude,
          longitude: locationState.currentLocation!.coordinates.longitude
        }
      }));
    }
  }, [locationState.currentLocation]);

  return {
    state,
    actions: {
      loadOffersPageData,
      refreshOffersPageData,
      toggleOfferLike,
      shareOffer,
      trackOfferView,
      trackOfferClick,
      clearError
    },
    handlers: {
      handleBack,
      handleShare,
      handleFavorite,
      handleOfferPress,
      handleViewAll,
      handleLocationPermission
    }
  };
}
