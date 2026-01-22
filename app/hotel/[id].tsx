/**
 * Hotel Details Page - Dedicated page for hotel bookings
 * Production-ready with complete booking flow
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import productsApi from '@/services/productsApi';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProductReviews } from '@/hooks/useProductReviews';
import { useRegion } from '@/contexts/RegionContext';
import ProductReviewsSection from '@/components/reviews/ProductReviewsSection';
import HotelBookingFlow from '../../components/hotel/HotelBookingFlow';
import HotelBookingConfirmation from '../../components/hotel/HotelBookingConfirmation';
import RelatedHotelsSection from '../../components/hotel/RelatedHotelsSection';
import HotelInfoCard from '../../components/hotel/HotelInfoCard';
import HotelAmenities from '../../components/hotel/HotelAmenities';
import HotelCancellationPolicy from '../../components/hotel/HotelCancellationPolicy';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface HotelDetails {
  id: string;
  name: string;
  location: {
    city: string;
    address?: string;
    coordinates?: [number, number];
  };
  starRating?: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  pricePerNight: number;
  images: string[];
  description: string;
  checkInTime: string;
  checkOutTime: string;
  cashback: {
    percentage: number;
    amount: number;
  };
  rating: number;
  reviewCount: number;
  store: {
    id: string;
    name: string;
    logo?: string;
  };
  amenities: string[];
  cancellationPolicy: {
    freeCancellation: boolean;
    cancellationDeadline: string; // hours before check-in
    refundPercentage: number;
  };
  roomTypes: {
    standard: { price: number; available: boolean; description?: string };
    deluxe: { price: number; available: boolean; description?: string };
    suite: { price: number; available: boolean; description?: string };
  };
  roomFeatures: {
    beds: string;
    size: string;
    maxGuests: number;
  };
}

interface BookingData {
  checkInDate: Date;
  checkOutDate: Date;
  rooms: number;
  guests: {
    adults: number;
    children: number;
  };
  roomType: 'standard' | 'deluxe' | 'suite';
  selectedExtras: {
    breakfast?: boolean;
    wifi?: boolean;
    parking?: boolean;
    lateCheckout?: boolean;
  };
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  guestDetails: Array<{
    firstName: string;
    lastName: string;
    email?: string;
  }>;
  bookingId?: string;
  bookingNumber?: string;
}

export default function HotelDetailsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();

  const [hotel, setHotel] = useState<HotelDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Reviews
  const {
    reviews,
    summary: reviewSummary,
    isLoading: reviewsLoading,
    refreshReviews,
  } = useProductReviews({
    productId: id as string,
    autoLoad: true,
  });

  useEffect(() => {
    if (id) {
      loadHotelDetails();
    }
  }, [id]);

  const loadHotelDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productsApi.getProductById(id as string);

      if (!response.success || !response.data) {
        setError('Hotel not found');
        return;
      }

      const productData = response.data;

      // Check if this is a hotel service
      const isHotel = productData.serviceCategory?.slug === 'hotels' || 
                       productData.category?.slug === 'hotels' ||
                       productData.name?.toLowerCase().includes('hotel');

      if (!isHotel) {
        // Redirect to regular product page
        router.replace(`/product/${id}`);
        return;
      }

      // Extract location from name or use defaults
      const locationMatch = productData.name.match(/(.+?)\s+(hotel|resort|inn|lodge)/i);
      const city = locationMatch ? locationMatch[1].trim() : 'City Center';

      // Get cashback from multiple sources (handle all possible formats)
      const cashbackPercentage = (() => {
        if (productData.cashback?.percentage) {
          return productData.cashback.percentage;
        }
        if (productData.serviceCategory?.cashbackPercentage) {
          return productData.serviceCategory.cashbackPercentage;
        }
        if (productData.category?.maxCashback) {
          return productData.category.maxCashback;
        }
        if (typeof productData.cashback === 'number') {
          return productData.cashback;
        }
        return 15;
      })();

      // Calculate price properly
      const basePrice = productData.pricing?.selling || productData.pricing?.basePrice || productData.price?.current || 0;
      const originalPrice = productData.pricing?.original || productData.pricing?.basePrice || productData.price?.original;
      const calculatedDiscount = originalPrice && basePrice && originalPrice > basePrice
        ? Math.round(((originalPrice - basePrice) / originalPrice) * 100)
        : productData.pricing?.discount || 0;

      // Transform to HotelDetails
      const hotelDetails: HotelDetails = {
        id: productData.id || productData._id,
        name: productData.name,
        location: {
          city,
          address: productData.store?.location?.address || `${city} City Center`,
          coordinates: productData.store?.location?.coordinates,
        },
        starRating: (() => {
          // Extract from name or use defaults
          const starMatch = productData.name.match(/(\d+)\s*star/i);
          if (starMatch) return parseInt(starMatch[1]);
          // Default based on price
          if (basePrice >= 10000) return 5;
          if (basePrice >= 5000) return 4;
          if (basePrice >= 2000) return 3;
          return 2;
        })(),
        price: basePrice,
        originalPrice: originalPrice && originalPrice > basePrice ? originalPrice : undefined,
        discount: calculatedDiscount > 0 ? calculatedDiscount : undefined,
        pricePerNight: basePrice,
        images: (() => {
          // Handle different image formats from backend
          if (!productData.images || !Array.isArray(productData.images)) {
            console.log('⚠️ [HOTEL] No images array found, using fallback');
            return ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'];
          }
          
          const processedImages = productData.images
            .map((img: any) => {
              if (typeof img === 'string') {
                return img.trim();
              }
              if (img && typeof img === 'object') {
                return img.url || img.uri || img.src || null;
              }
              return null;
            })
            .filter((url: string | null): url is string => {
              return Boolean(url && typeof url === 'string' && url.length > 0);
            });
          
          console.log('📸 [HOTEL] Processed images:', processedImages.length, processedImages);
          
          if (processedImages.length === 0) {
            console.log('⚠️ [HOTEL] No valid images found, using fallback');
            return ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'];
          }
          
          return processedImages;
        })(),
        description: productData.description || productData.shortDescription || 'Comfortable accommodation with excellent service.',
        checkInTime: '14:00',
        checkOutTime: '11:00',
        cashback: {
          percentage: cashbackPercentage,
          amount: Math.round(basePrice * cashbackPercentage / 100),
        },
        rating: reviewSummary?.averageRating || productData.ratings?.average || 0,
        reviewCount: reviewSummary?.totalReviews || productData.ratings?.count || 0,
        store: {
          id: productData.store?.id || productData.store?._id,
          name: productData.store?.name || 'Premium Hotels',
          logo: productData.store?.logo,
        },
        // Extract amenities from tags or use defaults
        amenities: (() => {
          const tagAmenities: Record<string, string[]> = {
            'luxury': ['Wi-Fi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Room Service', 'Concierge', 'Parking'],
            'budget': ['Wi-Fi', 'Parking', '24/7 Reception'],
            'business': ['Wi-Fi', 'Business Center', 'Meeting Rooms', 'Gym', 'Restaurant'],
          };
          
          const tags = productData.tags || [];
          for (const [key, amenities] of Object.entries(tagAmenities)) {
            if (tags.some((tag: string) => tag.toLowerCase().includes(key))) {
              return amenities;
            }
          }
          
          // Default amenities based on price
          if (basePrice >= 10000) {
            return ['Wi-Fi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Room Service'];
          } else if (basePrice >= 5000) {
            return ['Wi-Fi', 'Pool', 'Gym', 'Restaurant'];
          }
          return ['Wi-Fi', 'Parking', '24/7 Reception'];
        })(),
        cancellationPolicy: {
          freeCancellation: productData.specifications?.some((s: any) => 
            s.key?.toLowerCase().includes('cancellation') && s.value?.toLowerCase().includes('free')
          ) || true,
          cancellationDeadline: '24',
          refundPercentage: 80,
        },
        roomTypes: {
          standard: { 
            price: basePrice, 
            available: true,
            description: 'Comfortable room with essential amenities'
          },
          deluxe: { 
            price: Math.round(basePrice * 1.5), 
            available: true,
            description: 'Spacious room with premium amenities'
          },
          suite: { 
            price: Math.round(basePrice * 2.5), 
            available: true,
            description: 'Luxury suite with premium features'
          },
        },
        roomFeatures: {
          beds: '1 King Bed',
          size: '25 sqm',
          maxGuests: 2,
        },
      };

      setHotel(hotelDetails);
    } catch (error) {
      console.error('Error loading hotel details:', error);
      setError('Failed to load hotel details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = () => {
    setShowBookingFlow(true);
  };

  const handleBookingComplete = (data: BookingData) => {
    setBookingData(data);
    setShowBookingFlow(false);
    setShowConfirmation(true);
  };

  const handleBack = () => {
    router.back();
  };

  const handleFavorite = async () => {
    if (!hotel) return;
    
    try {
      if (isInWishlist(hotel.id)) {
        await removeFromWishlist(hotel.id);
      } else {
        await addToWishlist(hotel.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#EC4899" />
            <Text style={styles.loadingText}>Loading hotel details...</Text>
            <Text style={styles.loadingSubtext}>Please wait</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !hotel) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error || 'Hotel not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadHotelDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Image */}
        <View style={styles.headerContainer}>
          {(() => {
            const imageUrl = hotel.images?.[selectedImageIndex] || hotel.images?.[0];
            const hasValidImage = imageUrl && typeof imageUrl === 'string' && imageUrl.length > 0;
            
            if (hasValidImage && !imageError) {
              return (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.headerImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error('❌ [HOTEL] Image load error:', error);
                    console.error('❌ [HOTEL] Failed URL:', imageUrl);
                    setImageError(true);
                  }}
                  onLoadStart={() => {
                    console.log('🔄 [HOTEL] Loading image:', imageUrl);
                    setImageError(false);
                  }}
                  onLoad={() => {
                    console.log('✅ [HOTEL] Image loaded successfully:', imageUrl);
                  }}
                />
              );
            }
            
            return (
              <View style={[styles.headerImage, styles.placeholderImage]}>
                <Ionicons name="bed" size={64} color="#9CA3AF" />
                <Text style={styles.placeholderText}>Hotel Image</Text>
                {imageUrl && (
                  <Text style={styles.placeholderSubtext}>
                    {imageError ? 'Failed to load image' : 'Loading...'}
                  </Text>
                )}
              </View>
            );
          })()}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.headerGradient}
          />
          
          {/* Back and Action Buttons */}
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleFavorite}
              >
                <Ionicons
                  name={isInWishlist(hotel.id) ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isInWishlist(hotel.id) ? '#EF4444' : '#FFFFFF'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Discount Badge */}
          {hotel.discount && hotel.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{hotel.discount}% OFF</Text>
            </View>
          )}

          {/* Image Carousel Indicators */}
          {hotel.images && hotel.images.length > 1 && (
            <View style={styles.carouselIndicators}>
              {hotel.images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.indicator,
                    selectedImageIndex === index && styles.indicatorActive,
                  ]}
                  onPress={() => setSelectedImageIndex(index)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Hotel Info Card */}
        <View style={styles.hotelInfoWrapper}>
          <HotelInfoCard hotel={hotel} />
        </View>

        {/* Store/Hotel Chain Info */}
        {hotel.store && (
          <View style={styles.storeSection}>
            <View style={styles.storeHeader}>
              {hotel.store.logo ? (
                <Image
                  source={{ uri: hotel.store.logo }}
                  style={styles.storeLogo}
                  resizeMode="contain"
                  onError={() => {
                    // Logo failed to load
                  }}
                />
              ) : (
                <View style={styles.storeLogoPlaceholder}>
                  <Ionicons name="bed" size={24} color="#EC4899" />
                </View>
              )}
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{hotel.store.name}</Text>
                <View style={styles.storeBadges}>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                  {hotel.rating > 0 && (
                    <View style={styles.ratingBadgeSmall}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.ratingTextSmall}>
                        {hotel.rating.toFixed(1)} ({hotel.reviewCount})
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewStoreButton}
                onPress={() => router.push(`/store/${hotel.store.id}` as any)}
              >
                <Text style={styles.viewStoreButtonText}>View</Text>
                <Ionicons name="chevron-forward" size={16} color="#EC4899" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Price and Cashback - Enhanced UI */}
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <View style={styles.priceLeft}>
              <Text style={styles.priceLabel}>Starting from</Text>
              <View style={styles.priceContainer}>
                {hotel.originalPrice && hotel.originalPrice > hotel.price && (
                  <Text style={styles.originalPrice}>{currencySymbol}{hotel.originalPrice.toLocaleString('en-IN')}</Text>
                )}
                <Text style={styles.price}>{currencySymbol}{hotel.price.toLocaleString('en-IN')}</Text>
              </View>
              <Text style={styles.pricePerNight}>per night</Text>
              {hotel.discount && hotel.discount > 0 && (
                <View style={styles.discountTag}>
                  <Text style={styles.discountTagText}>Save {hotel.discount}%</Text>
                </View>
              )}
            </View>
            <View style={styles.cashbackBadge}>
              <View style={styles.cashbackIconContainer}>
                <Ionicons name="gift" size={20} color="#22C55E" />
              </View>
              <View style={styles.cashbackContent}>
                <Text style={styles.cashbackText}>
                  {hotel.cashback.percentage}% Cashback
                </Text>
                <Text style={styles.cashbackAmount}>
                  Earn {currencySymbol}{hotel.cashback.amount.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Hotel Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#EC4899" />
            <Text style={styles.sectionTitle}>Hotel Details</Text>
          </View>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="time" size={24} color="#EC4899" />
              </View>
              <Text style={styles.detailLabel}>Check-in</Text>
              <Text style={styles.detailValue}>{hotel.checkInTime}</Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="time-outline" size={24} color="#EC4899" />
              </View>
              <Text style={styles.detailLabel}>Check-out</Text>
              <Text style={styles.detailValue}>{hotel.checkOutTime}</Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="star" size={24} color="#EC4899" />
              </View>
              <Text style={styles.detailLabel}>Rating</Text>
              <Text style={styles.detailValue}>
                {hotel.starRating ? `${hotel.starRating} Star` : 'N/A'}
              </Text>
            </View>
          </View>
          
          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color="#6B7280" />
              <Text style={styles.infoText}>{hotel.location.address || hotel.location.city}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="bed-outline" size={18} color="#6B7280" />
              <Text style={styles.infoText}>{hotel.roomFeatures.beds} • {hotel.roomFeatures.size}</Text>
            </View>
          </View>
        </View>

        {/* Amenities */}
        <HotelAmenities amenities={hotel.amenities} />

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color="#EC4899" />
            <Text style={styles.sectionTitle}>About This Hotel</Text>
          </View>
          <Text style={styles.description}>{hotel.description}</Text>
          
          {/* Key Highlights */}
          <View style={styles.highlightsContainer}>
            <View style={styles.highlightItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text style={styles.highlightText}>Best price guaranteed</Text>
            </View>
            <View style={styles.highlightItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text style={styles.highlightText}>Instant confirmation</Text>
            </View>
            <View style={styles.highlightItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text style={styles.highlightText}>Free cancellation</Text>
            </View>
          </View>
        </View>

        {/* Cancellation Policy */}
        <HotelCancellationPolicy policy={hotel.cancellationPolicy} />

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {hotel.rating.toFixed(1)} ({hotel.reviewCount})
              </Text>
            </View>
          </View>
          <ProductReviewsSection
            productId={hotel.id}
            reviews={reviews}
            summary={reviewSummary}
            isLoading={reviewsLoading}
            onRefresh={refreshReviews}
          />
        </View>

        {/* Related Hotels */}
        <RelatedHotelsSection
          currentHotelId={hotel.id}
          location={hotel.location}
        />

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.bookButtonContainer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#EC4899', '#DB2777']}
            style={styles.bookButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Booking Flow Modal */}
      <Modal
        visible={showBookingFlow}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <HotelBookingFlow
          hotel={hotel}
          onComplete={handleBookingComplete}
          onClose={() => setShowBookingFlow(false)}
        />
      </Modal>

      {/* Booking Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {bookingData && (
          <HotelBookingConfirmation
            hotel={hotel}
            bookingData={bookingData}
            onClose={() => {
              setShowConfirmation(false);
              router.back();
            }}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 200, // Extra padding to ensure content is not hidden behind button and nav bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '600',
    marginTop: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#EC4899',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    width: screenWidth,
    height: 320,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  placeholderSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#9CA3AF',
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  headerActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 100,
    right: 16,
    backgroundColor: '#22C55E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  carouselIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 5,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  indicatorActive: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  hotelInfoWrapper: {
    marginHorizontal: 20,
    marginTop: -40,
    marginBottom: 20,
    zIndex: 5,
  },
  storeSection: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storeLogo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storeLogoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  storeBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  ratingBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingTextSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  viewStoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EC4899',
    backgroundColor: '#FCE7F3',
  },
  viewStoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EC4899',
  },
  priceSection: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  priceLeft: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  pricePerNight: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  discountTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  discountTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  cashbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    minWidth: 140,
  },
  cashbackIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cashbackContent: {
    flex: 1,
  },
  cashbackText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 2,
  },
  cashbackAmount: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 6,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  additionalInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: '#4B5563',
    marginTop: 4,
  },
  highlightsContainer: {
    marginTop: 20,
    gap: 12,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  highlightText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  bookButtonContainer: {
    position: 'absolute',
    bottom: 95, // Position above bottom navigation bar (95px height)
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 1001, // Higher than bottom nav (1000)
  },
  bookButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 10,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
