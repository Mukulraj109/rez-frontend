/**
 * Flight Details Page - Dedicated page for flight bookings
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
  Alert,
  SafeAreaView,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import productsApi from '@/services/productsApi';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProductReviews } from '@/hooks/useProductReviews';
import ProductReviewsSection from '@/components/reviews/ProductReviewsSection';
import FlightBookingFlow from '../../components/flight/FlightBookingFlow';
import FlightBookingConfirmation from '../../components/flight/FlightBookingConfirmation';
import RelatedFlightsSection from '../../components/flight/RelatedFlightsSection';
import FlightInfoCard from '../../components/flight/FlightInfoCard';
import FlightAmenities from '../../components/flight/FlightAmenities';
import FlightCancellationPolicy from '../../components/flight/FlightCancellationPolicy';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FlightDetails {
  id: string;
  name: string;
  route: {
    from: string;
    to: string;
    fromCode: string;
    toCode: string;
  };
  airline?: string;
  flightNumber?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  description: string;
  duration: number; // in minutes
  departureTime?: string;
  arrivalTime?: string;
  availableDates: string[];
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
    cancellationDeadline: string; // hours before departure
    refundPercentage: number;
  };
  baggage: {
    cabin: string;
    checked: string;
  };
  classOptions: {
    economy: { price: number; available: boolean };
    business: { price: number; available: boolean };
    first: { price: number; available: boolean };
  };
}

interface BookingData {
  departureDate: Date;
  returnDate?: Date;
  tripType: 'one-way' | 'round-trip';
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  flightClass: 'economy' | 'business' | 'first';
  selectedExtras: {
    baggage?: string;
    meals?: string[];
    seatSelection?: boolean;
    specialAssistance?: string;
  };
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  passengerDetails: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    passportNumber?: string;
    nationality?: string;
  }>;
  bookingId?: string;
  bookingNumber?: string;
}

export default function FlightDetailsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  const [flight, setFlight] = useState<FlightDetails | null>(null);
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
      loadFlightDetails();
    }
  }, [id]);

  const loadFlightDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productsApi.getProductById(id as string);

      if (!response.success || !response.data) {
        setError('Flight not found');
        return;
      }

      const productData = response.data;

      // Check if this is a flight service
      const isFlight = productData.serviceCategory?.slug === 'flights' || 
                       productData.category?.slug === 'flights' ||
                       productData.name?.toLowerCase().includes('flight');

      if (!isFlight) {
        // Redirect to regular product page
        router.replace(`/product/${id}`);
        return;
      }

      // Extract route from name (e.g., "Bangalore to Goa Flight" or "Delhi-Mumbai Flight")
      const routePatterns = [
        /(.+?)\s+to\s+(.+?)\s+flight/i,
        /(.+?)\s*-\s*(.+?)\s+flight/i,
        /(.+?)\s+→\s+(.+?)\s+flight/i,
        /(.+?)\s+flight\s+to\s+(.+?)/i,
      ];
      
      let from = 'Origin';
      let to = 'Destination';
      for (const pattern of routePatterns) {
        const match = productData.name.match(pattern);
        if (match) {
          from = match[1].trim();
          to = match[2].trim();
          break;
        }
      }

      // Calculate times based on duration
      const durationHours = Math.floor((productData.serviceDetails?.duration || 120) / 60);
      const durationMins = (productData.serviceDetails?.duration || 120) % 60;
      const baseDepartureHour = 9;
      const baseDepartureMin = 0;
      const arrivalHour = (baseDepartureHour + durationHours + Math.floor((baseDepartureMin + durationMins) / 60)) % 24;
      const arrivalMin = (baseDepartureMin + durationMins) % 60;
      
      const formatTime = (hours: number, mins: number) => {
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      };

      // Get cashback from multiple sources (handle all possible formats)
      const cashbackPercentage = (() => {
        // Priority 1: Product cashback object
        if (productData.cashback?.percentage) {
          return productData.cashback.percentage;
        }
        // Priority 2: Service category cashback
        if (productData.serviceCategory?.cashbackPercentage) {
          return productData.serviceCategory.cashbackPercentage;
        }
        // Priority 3: Category maxCashback
        if (productData.category?.maxCashback) {
          return productData.category.maxCashback;
        }
        // Priority 4: Direct cashback number (legacy format)
        if (typeof productData.cashback === 'number') {
          return productData.cashback;
        }
        // Default fallback
        return 15;
      })();

      // Calculate price properly
      const basePrice = productData.pricing?.selling || productData.pricing?.basePrice || productData.price?.current || 0;
      const originalPrice = productData.pricing?.original || productData.pricing?.basePrice || productData.price?.original;
      const calculatedDiscount = originalPrice && basePrice && originalPrice > basePrice
        ? Math.round(((originalPrice - basePrice) / originalPrice) * 100)
        : productData.pricing?.discount || 0;

      // Transform to FlightDetails
      const flightDetails: FlightDetails = {
        id: productData.id || productData._id,
        name: productData.name,
        route: {
          from,
          to,
          fromCode: from.substring(0, 3).toUpperCase(),
          toCode: to.substring(0, 3).toUpperCase(),
        },
        airline: productData.store?.name || 'SkyWings Airlines',
        flightNumber: productData.sku || productData.barcode || `SW${(productData.id || productData._id || '').toString().slice(-6).toUpperCase()}`,
        price: basePrice,
        originalPrice: originalPrice && originalPrice > basePrice ? originalPrice : undefined,
        discount: calculatedDiscount > 0 ? calculatedDiscount : undefined,
        images: (() => {
          // Handle different image formats from backend
          if (!productData.images || !Array.isArray(productData.images)) {
            console.log('⚠️ [FLIGHT] No images array found, using fallback');
            return ['https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop'];
          }
          
          const processedImages = productData.images
            .map((img: any) => {
              // Handle string URLs
              if (typeof img === 'string') {
                return img.trim();
              }
              // Handle objects with url property
              if (img && typeof img === 'object') {
                return img.url || img.uri || img.src || null;
              }
              return null;
            })
            .filter((url: string | null): url is string => {
              // Filter out null/undefined/empty strings and validate URLs
              return Boolean(url && typeof url === 'string' && url.length > 0);
            });
          
          console.log('📸 [FLIGHT] Processed images:', processedImages.length, processedImages);
          
          // Always ensure at least one image (fallback)
          if (processedImages.length === 0) {
            console.log('⚠️ [FLIGHT] No valid images found, using fallback');
            return ['https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop'];
          }
          
          return processedImages;
        })(),
        description: productData.description || productData.shortDescription || 'Direct flight with excellent service.',
        duration: productData.serviceDetails?.duration || 120,
        departureTime: formatTime(baseDepartureHour, baseDepartureMin),
        arrivalTime: formatTime(arrivalHour, arrivalMin),
        availableDates: generateAvailableDates(),
        cashback: {
          percentage: cashbackPercentage,
          amount: Math.round(basePrice * cashbackPercentage / 100),
        },
        rating: reviewSummary?.averageRating || productData.ratings?.average || 0,
        reviewCount: reviewSummary?.totalReviews || productData.ratings?.count || 0,
        store: {
          id: productData.store?.id || productData.store?._id,
          name: productData.store?.name || 'SkyWings Airlines',
          logo: productData.store?.logo,
        },
        // Extract amenities from tags or use defaults
        amenities: (() => {
          const tagAmenities: Record<string, string[]> = {
            'premium': ['Wi-Fi', 'Entertainment', 'Meals', 'Extra Legroom', 'Priority Boarding'],
            'business': ['Wi-Fi', 'Entertainment', 'Meals', 'Extra Legroom'],
            'economy': ['Wi-Fi', 'Entertainment', 'Meals'],
          };
          
          const tags = productData.tags || [];
          for (const [key, amenities] of Object.entries(tagAmenities)) {
            if (tags.some((tag: string) => tag.toLowerCase().includes(key))) {
              return amenities;
            }
          }
          
          // Default amenities based on flight duration
          const duration = productData.serviceDetails?.duration || 120;
          if (duration >= 180) {
            return ['Wi-Fi', 'Entertainment', 'Meals', 'Extra Legroom', 'Blankets'];
          } else if (duration >= 120) {
            return ['Wi-Fi', 'Entertainment', 'Meals'];
          }
          return ['Wi-Fi', 'Entertainment'];
        })(),
        cancellationPolicy: {
          // Extract from specifications or use defaults
          freeCancellation: productData.specifications?.some((s: any) => 
            s.key?.toLowerCase().includes('cancellation') && s.value?.toLowerCase().includes('free')
          ) || true,
          cancellationDeadline: '24',
          refundPercentage: 80,
        },
        baggage: {
          // Extract from specifications or use defaults
          cabin: (() => {
            const baggageSpec = productData.specifications?.find((s: any) => 
              s.key?.toLowerCase().includes('baggage') || s.key?.toLowerCase().includes('cabin')
            );
            return baggageSpec?.value || '7 kg';
          })(),
          checked: (() => {
            const checkedSpec = productData.specifications?.find((s: any) => 
              s.key?.toLowerCase().includes('checked') || s.key?.toLowerCase().includes('luggage')
            );
            return checkedSpec?.value || '15 kg';
          })(),
        },
        classOptions: {
          economy: { price: productData.pricing?.selling || 0, available: true },
          business: { price: (productData.pricing?.selling || 0) * 2, available: true },
          first: { price: (productData.pricing?.selling || 0) * 4, available: true },
        },
      };

      setFlight(flightDetails);
    } catch (error) {
      console.error('Error loading flight details:', error);
      setError('Failed to load flight details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAvailableDates = (): string[] => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
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
    if (!flight) return;
    
    try {
      if (isInWishlist(flight.id)) {
        await removeFromWishlist(flight.id);
      } else {
        await addToWishlist(flight.id);
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
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading flight details...</Text>
            <Text style={styles.loadingSubtext}>Please wait</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !flight) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error || 'Flight not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadFlightDetails}>
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
            const imageUrl = flight.images?.[selectedImageIndex] || flight.images?.[0];
            const hasValidImage = imageUrl && typeof imageUrl === 'string' && imageUrl.length > 0;
            
            if (hasValidImage && !imageError) {
              return (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.headerImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error('❌ [FLIGHT] Image load error:', error);
                    console.error('❌ [FLIGHT] Failed URL:', imageUrl);
                    setImageError(true);
                  }}
                  onLoadStart={() => {
                    console.log('🔄 [FLIGHT] Loading image:', imageUrl);
                    setImageError(false);
                  }}
                  onLoad={() => {
                    console.log('✅ [FLIGHT] Image loaded successfully:', imageUrl);
                  }}
                />
              );
            }
            
            return (
              <View style={[styles.headerImage, styles.placeholderImage]}>
                <Ionicons name="airplane" size={64} color="#9CA3AF" />
                <Text style={styles.placeholderText}>Flight Image</Text>
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
                  name={isInWishlist(flight.id) ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isInWishlist(flight.id) ? '#EF4444' : '#FFFFFF'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Discount Badge */}
          {flight.discount && flight.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{flight.discount}% OFF</Text>
            </View>
          )}

          {/* Image Carousel Indicators */}
          {flight.images && flight.images.length > 1 && (
            <View style={styles.carouselIndicators}>
              {flight.images.map((_, index) => (
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

        {/* Flight Info Card */}
        <View style={styles.flightInfoWrapper}>
          <FlightInfoCard flight={flight} />
        </View>

        {/* Store/Airline Info */}
        {flight.store && (
          <View style={styles.storeSection}>
            <View style={styles.storeHeader}>
              {flight.store.logo ? (
                <Image
                  source={{ uri: flight.store.logo }}
                  style={styles.storeLogo}
                  resizeMode="contain"
                  onError={() => {
                    // Logo failed to load, will show airline name only
                  }}
                />
              ) : (
                <View style={styles.storeLogoPlaceholder}>
                  <Ionicons name="airplane" size={24} color="#3B82F6" />
                </View>
              )}
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{flight.store.name}</Text>
                <View style={styles.storeBadges}>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                  {flight.rating > 0 && (
                    <View style={styles.ratingBadgeSmall}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.ratingTextSmall}>
                        {flight.rating.toFixed(1)} ({flight.reviewCount})
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewStoreButton}
                onPress={() => router.push(`/store/${flight.store.id}` as any)}
              >
                <Text style={styles.viewStoreButtonText}>View</Text>
                <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
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
                {flight.originalPrice && flight.originalPrice > flight.price && (
                  <Text style={styles.originalPrice}>₹{flight.originalPrice.toLocaleString('en-IN')}</Text>
                )}
                <Text style={styles.price}>₹{flight.price.toLocaleString('en-IN')}</Text>
              </View>
              {flight.discount && flight.discount > 0 && (
                <View style={styles.discountTag}>
                  <Text style={styles.discountTagText}>Save {flight.discount}%</Text>
                </View>
              )}
            </View>
            <View style={styles.cashbackBadge}>
              <View style={styles.cashbackIconContainer}>
                <Ionicons name="gift" size={20} color="#22C55E" />
              </View>
              <View style={styles.cashbackContent}>
                <Text style={styles.cashbackText}>
                  {flight.cashback.percentage}% Cashback
                </Text>
                <Text style={styles.cashbackAmount}>
                  Earn ₹{flight.cashback.amount.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Flight Details - Enhanced */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Flight Details</Text>
          </View>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="time" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>
                {Math.floor(flight.duration / 60)}h {flight.duration % 60}m
              </Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="airplane" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.detailLabel}>Airline</Text>
              <Text style={styles.detailValue} numberOfLines={2}>{flight.airline}</Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="bag" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.detailLabel}>Baggage</Text>
              <Text style={styles.detailValue} numberOfLines={2}>
                {flight.baggage.cabin} + {flight.baggage.checked}
              </Text>
            </View>
          </View>
          
          {/* Additional Flight Info */}
          <View style={styles.additionalInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color="#6B7280" />
              <Text style={styles.infoText}>Flexible dates available</Text>
            </View>
            {flight.flightNumber && (
              <View style={styles.infoRow}>
                <Ionicons name="ticket-outline" size={18} color="#6B7280" />
                <Text style={styles.infoText}>Flight: {flight.flightNumber}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Amenities */}
        <FlightAmenities amenities={flight.amenities} />

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>About This Flight</Text>
          </View>
          <Text style={styles.description}>{flight.description}</Text>
          
          {/* Key Highlights */}
          <View style={styles.highlightsContainer}>
            <View style={styles.highlightItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text style={styles.highlightText}>Direct flight</Text>
            </View>
            <View style={styles.highlightItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text style={styles.highlightText}>Best price guaranteed</Text>
            </View>
            <View style={styles.highlightItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text style={styles.highlightText}>Instant confirmation</Text>
            </View>
          </View>
        </View>

        {/* Cancellation Policy */}
        <FlightCancellationPolicy policy={flight.cancellationPolicy} />

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {flight.rating.toFixed(1)} ({flight.reviewCount})
              </Text>
            </View>
          </View>
          <ProductReviewsSection
            productId={flight.id}
            reviews={reviews}
            summary={reviewSummary}
            isLoading={reviewsLoading}
            onRefresh={refreshReviews}
          />
        </View>

        {/* Related Flights */}
        <RelatedFlightsSection
          currentFlightId={flight.id}
          route={flight.route}
        />

        {/* Bottom Spacing - Increased to ensure button is visible and content is scrollable */}
        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.bookButtonContainer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
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
        <FlightBookingFlow
          flight={flight}
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
          <FlightBookingConfirmation
            flight={flight}
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
    backgroundColor: '#3B82F6',
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
    marginBottom: 8,
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
    backgroundColor: '#EFF6FF',
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
  flightInfoWrapper: {
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
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
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
  viewStoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  viewStoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
});
