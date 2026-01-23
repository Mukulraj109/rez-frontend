/**
 * Cab Details Page - Dedicated page for cab bookings
 * Production-ready with complete booking flow
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import productsApi from '@/services/productsApi';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProductReviews } from '@/hooks/useProductReviews';
import { useRegion } from '@/contexts/RegionContext';
import ProductReviewsSection from '@/components/reviews/ProductReviewsSection';
import CabBookingFlow from '../../components/cab/CabBookingFlow';
import CabBookingConfirmation from '../../components/cab/CabBookingConfirmation';
import RelatedCabsSection from '../../components/cab/RelatedCabsSection';
import CabInfoCard from '../../components/cab/CabInfoCard';
import CabAmenities from '../../components/cab/CabAmenities';
import CabCancellationPolicy from '../../components/cab/CabCancellationPolicy';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CabDetails {
  id: string;
  name: string;
  route?: {
    from: string;
    to: string;
  };
  cabType?: string;
  price: number;
  pricePerKm?: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  description: string;
  duration: number; // in minutes
  distance?: number; // in km
  pickupTime?: string;
  dropoffTime?: string;
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
    cancellationDeadline: string;
    refundPercentage: number;
  };
  vehicleOptions: {
    sedan: { price: number; available: boolean };
    suv: { price: number; available: boolean };
    premium: { price: number; available: boolean };
  };
}

interface BookingData {
  pickupDate: Date;
  pickupTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  tripType: 'one-way' | 'round-trip';
  passengers: {
    adults: number;
    children: number;
  };
  vehicleType: 'sedan' | 'suv' | 'premium';
  selectedExtras: {
    driver?: boolean;
    tollCharges?: boolean;
    parking?: boolean;
    waitingTime?: boolean;
  };
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  passengerDetails: Array<{
    firstName: string;
    lastName: string;
    age: number;
  }>;
  bookingId?: string;
  bookingNumber?: string;
}

export default function CabDetailsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { getCurrencySymbol, getLocale } = useRegion();
  const currencySymbol = getCurrencySymbol();
  const locale = getLocale();

  const [cab, setCab] = useState<CabDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  // Animation for button
  const buttonScale = useRef(new Animated.Value(1)).current;

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
      loadCabDetails();
    }
  }, [id]);

  const loadCabDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productsApi.getProductById(id as string);

      if (!response.success || !response.data) {
        setError('Cab not found');
        return;
      }

      const productData = response.data;

      // Check if this is a cab service
      const isCab = productData.serviceCategory?.slug === 'cab' || 
                   productData.category?.slug === 'cab' ||
                   productData.name?.toLowerCase().includes('cab') ||
                   productData.name?.toLowerCase().includes('taxi');

      if (!isCab) {
        router.replace(`/product/${id}`);
        return;
      }

      // Extract route from name if available
      let from = 'Pickup Location';
      let to = 'Dropoff Location';
      const routePatterns = [
        /(.+?)\s+to\s+(.+?)\s+cab/i,
        /(.+?)\s*-\s*(.+?)\s+cab/i,
        /(.+?)\s+→\s+(.+?)\s+cab/i,
      ];
      
      for (const pattern of routePatterns) {
        const match = productData.name.match(pattern);
        if (match) {
          from = match[1].trim();
          to = match[2] ? match[2].trim() : 'Dropoff Location';
          break;
        }
      }

      // Calculate times based on duration - ensure valid number
      const rawDuration = productData.serviceDetails?.duration;
      const duration = (typeof rawDuration === 'number' && !isNaN(rawDuration) && rawDuration > 0) 
        ? rawDuration 
        : 60; // Default to 60 minutes if invalid
      
      const durationHours = Math.floor(duration / 60);
      const durationMins = duration % 60;
      const basePickupHour = 9;
      const basePickupMin = 0;
      const dropoffHour = (basePickupHour + durationHours + Math.floor((basePickupMin + durationMins) / 60)) % 24;
      const dropoffMin = (basePickupMin + durationMins) % 60;
      
      const formatTime = (hours: number, mins: number) => {
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      };

      // Get cashback
      const cashbackPercentage = (() => {
        if (productData.cashback?.percentage) return productData.cashback.percentage;
        if (productData.serviceCategory?.cashbackPercentage) return productData.serviceCategory.cashbackPercentage;
        if (typeof productData.cashback === 'number') return productData.cashback;
        return 20;
      })();

      // Calculate price
      const basePrice = productData.pricing?.selling || productData.pricing?.basePrice || productData.price?.current || 0;
      const originalPrice = productData.pricing?.original || productData.pricing?.basePrice || productData.price?.original;
      const calculatedDiscount = originalPrice && basePrice && originalPrice > basePrice
        ? Math.round(((originalPrice - basePrice) / originalPrice) * 100)
        : productData.pricing?.discount || 0;

      // Extract distance if price is per km - validate to prevent NaN
      let pricePerKm: number | undefined = undefined;
      let estimatedDistance: number | undefined = undefined;
      
      // Try to get pricePerKm from various sources
      if (productData.price && typeof productData.price === 'number' && productData.price > 0) {
        pricePerKm = productData.price;
      } else if (basePrice > 0 && basePrice < 100) {
        pricePerKm = basePrice;
      }
      
      // Calculate distance only if we have valid values
      if (pricePerKm && basePrice > 0 && pricePerKm > 0) {
        const calculatedDistance = basePrice / pricePerKm;
        if (!isNaN(calculatedDistance) && isFinite(calculatedDistance) && calculatedDistance > 0) {
          estimatedDistance = Math.round(calculatedDistance);
        }
      }
      
      // If still no distance, try to get from serviceDetails
      if (!estimatedDistance && productData.serviceDetails?.distance) {
        const serviceDistance = productData.serviceDetails.distance;
        if (typeof serviceDistance === 'number' && !isNaN(serviceDistance) && serviceDistance > 0) {
          estimatedDistance = Math.round(serviceDistance);
        }
      }

      // Transform to CabDetails
      const cabDetails: CabDetails = {
        id: productData.id || productData._id,
        name: productData.name,
        route: {
          from,
          to,
        },
        cabType: (() => {
          if (productData.name.toLowerCase().includes('outstation')) return 'Outstation';
          if (productData.name.toLowerCase().includes('airport')) return 'Airport Transfer';
          if (productData.name.toLowerCase().includes('city')) return 'City Ride';
          return 'Intercity';
        })(),
        price: basePrice,
        pricePerKm: pricePerKm,
        originalPrice: originalPrice && originalPrice > basePrice ? originalPrice : undefined,
        discount: calculatedDiscount > 0 ? calculatedDiscount : undefined,
        images: (() => {
          if (!productData.images || !Array.isArray(productData.images)) {
            return ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop'];
          }
          
          const processedImages = productData.images
            .map((img: any) => {
              if (typeof img === 'string') return img.trim();
              if (img && typeof img === 'object') return img.url || img.uri || img.src || null;
              return null;
            })
            .filter((url: string | null): url is string => Boolean(url && typeof url === 'string' && url.length > 0));
          
          // Validate images are cab-related
          const validatedImages = processedImages.map(url => {
            // Replace non-cab images
            if ((url.toLowerCase().includes('bus') || url.toLowerCase().includes('train') || 
                 url.toLowerCase().includes('airplane') || url.toLowerCase().includes('hotel')) &&
                !url.toLowerCase().includes('cab') && !url.toLowerCase().includes('taxi') && !url.toLowerCase().includes('car')) {
              return 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop';
            }
            return url;
          });
          
          return validatedImages.length > 0 ? validatedImages : ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop'];
        })(),
        description: productData.description || productData.shortDescription || 'Comfortable cab service with professional drivers.',
        duration: duration, // Use validated duration
        distance: estimatedDistance, // Will be undefined if not calculated, which is fine
        pickupTime: formatTime(basePickupHour, basePickupMin),
        dropoffTime: formatTime(dropoffHour, dropoffMin),
        cashback: {
          percentage: cashbackPercentage,
          amount: Math.round(basePrice * cashbackPercentage / 100),
        },
        rating: reviewSummary?.averageRating || productData.ratings?.average || 0,
        reviewCount: reviewSummary?.totalReviews || productData.ratings?.count || 0,
        store: {
          id: productData.store?.id || productData.store?._id,
          name: productData.store?.name || 'CityRide Cabs',
          logo: productData.store?.logo,
        },
        amenities: (() => {
          const tagAmenities: Record<string, string[]> = {
            'premium': ['AC', 'GPS', 'Music', 'Wi-Fi', 'Charging Point', 'Professional Driver'],
            'comfort': ['AC', 'GPS', 'Music', 'Professional Driver'],
            'budget': ['AC', 'GPS', 'Professional Driver'],
          };
          
          const tags = productData.tags || [];
          for (const [key, amenities] of Object.entries(tagAmenities)) {
            if (tags.some((tag: string) => tag.toLowerCase().includes(key))) {
              return amenities;
            }
          }
          return ['AC', 'GPS', 'Music', 'Professional Driver'];
        })(),
        cancellationPolicy: {
          freeCancellation: productData.specifications?.some((s: any) => 
            s.key?.toLowerCase().includes('cancellation') && s.value?.toLowerCase().includes('free')
          ) || true,
          cancellationDeadline: '2',
          refundPercentage: 90,
        },
        vehicleOptions: {
          sedan: { 
            price: basePrice, 
            available: true 
          },
          suv: { 
            price: Math.round(basePrice * 1.5), 
            available: true 
          },
          premium: { 
            price: Math.round(basePrice * 2), 
            available: true 
          },
        },
      };

      setCab(cabDetails);
    } catch (error) {
      console.error('Error loading cab details:', error);
      setError('Failed to load cab details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
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
    if (!cab) return;
    
    try {
      if (isInWishlist(cab.id)) {
        await removeFromWishlist(cab.id);
      } else {
        await addToWishlist(cab.id);
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
            <ActivityIndicator size="large" color="#EAB308" />
            <Text style={styles.loadingText}>Loading cab details...</Text>
            <Text style={styles.loadingSubtext}>Please wait</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !cab) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error || 'Cab not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCabDetails}>
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
            const imageUrl = cab.images?.[selectedImageIndex] || cab.images?.[0];
            const hasValidImage = imageUrl && typeof imageUrl === 'string' && imageUrl.length > 0;
            
            if (hasValidImage && !imageError) {
              return (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.headerImage}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                  onLoadStart={() => setImageError(false)}
                />
              );
            }
            
            return (
              <View style={[styles.headerImage, styles.placeholderImage]}>
                <Ionicons name="car" size={64} color="#9CA3AF" />
                <Text style={styles.placeholderText}>Cab Image</Text>
              </View>
            );
          })()}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.headerGradient}
          />
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.headerRightActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleFavorite}>
                <Ionicons
                  name={isInWishlist(cab.id) ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isInWishlist(cab.id) ? '#EF4444' : '#FFFFFF'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Image Indicators */}
          {cab.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {cab.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    selectedImageIndex === index && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Cab Info Card */}
        <View style={styles.infoCardWrapper}>
          <CabInfoCard cab={cab} />
        </View>

        {/* Store/Provider Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business" size={24} color="#EAB308" />
            <Text style={styles.sectionTitle}>Service Provider</Text>
          </View>
          <View style={styles.storeCard}>
            {cab.store.logo && (
              <Image source={{ uri: cab.store.logo }} style={styles.storeLogo} />
            )}
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{cab.store.name}</Text>
              <View style={styles.storeBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                <Text style={styles.storeBadgeText}>Verified</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.viewStoreButton}>
              <Text style={styles.viewStoreButtonText}>View Store</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price & Cashback */}
        <View style={styles.section}>
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>Price</Text>
                <View style={styles.priceValueContainer}>
                  <Text style={styles.priceValue}>
                    {cab.pricePerKm ? `${currencySymbol}${cab.pricePerKm}/km` : `${currencySymbol}${cab.price.toLocaleString(locale)}`}
                  </Text>
                  {cab.originalPrice && cab.originalPrice > cab.price && (
                    <Text style={styles.originalPrice}>{currencySymbol}{cab.originalPrice.toLocaleString(locale)}</Text>
                  )}
                </View>
              </View>
              <View style={styles.cashbackBadge}>
                <Ionicons name="cash" size={20} color="#FFFFFF" />
                <Text style={styles.cashbackText}>
                  {cab.cashback.percentage}% Cashback
                </Text>
                <Text style={styles.cashbackAmount}>{currencySymbol}{cab.cashback.amount}</Text>
              </View>
            </View>
            {cab.discount && cab.discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{cab.discount}% OFF</Text>
              </View>
            )}
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#EAB308" />
            <Text style={styles.sectionTitle}>Trip Details</Text>
          </View>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="time-outline" size={20} color="#EAB308" />
              </View>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>
                {Math.floor(cab.duration / 60)}h {cab.duration % 60}m
              </Text>
            </View>
            {cab.distance && (
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="location-outline" size={20} color="#EAB308" />
                </View>
                <Text style={styles.detailLabel}>Distance</Text>
                <Text style={styles.detailValue}>{cab.distance} km</Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="car-outline" size={20} color="#EAB308" />
              </View>
              <Text style={styles.detailLabel}>Cab Type</Text>
              <Text style={styles.detailValue}>{cab.cabType || 'Intercity'}</Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="star" size={20} color="#EAB308" />
              </View>
              <Text style={styles.detailLabel}>Rating</Text>
              <Text style={styles.detailValue}>{cab.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={24} color="#EAB308" />
            <Text style={styles.sectionTitle}>Amenities</Text>
          </View>
          <CabAmenities amenities={cab.amenities} />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.descriptionTitle}>About This Service</Text>
          <Text style={styles.description}>{cab.description}</Text>
        </View>

        {/* Cancellation Policy */}
        <View style={styles.section}>
          <CabCancellationPolicy policy={cab.cancellationPolicy} />
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <ProductReviewsSection
            productId={id as string}
            productName={cab.name}
            reviews={reviews}
            summary={reviewSummary}
            isLoading={reviewsLoading}
            onRefresh={refreshReviews}
          />
        </View>

        {/* Related Cabs */}
        <View style={styles.section}>
          <RelatedCabsSection currentCabId={cab.id} />
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.bookButtonContainer}>
        {/* Price Info Card */}
        <View style={styles.priceInfoCard}>
          <View style={styles.priceInfoRow}>
            <View style={styles.priceInfoLeft}>
              <Text style={styles.priceInfoLabel}>Total Price</Text>
              <View style={styles.priceInfoValueContainer}>
                <Text style={styles.priceInfoValue}>
                  {cab.pricePerKm ? `${currencySymbol}${cab.pricePerKm}/km` : `${currencySymbol}${cab.price.toLocaleString(locale)}`}
                </Text>
                {cab.originalPrice && cab.originalPrice > cab.price && (
                  <Text style={styles.priceInfoOriginal}>{currencySymbol}{cab.originalPrice.toLocaleString(locale)}</Text>
                )}
              </View>
            </View>
            <View style={styles.cashbackInfo}>
              <Ionicons name="cash" size={18} color="#EAB308" />
              <Text style={styles.cashbackInfoText}>{cab.cashback.percentage}% Cashback</Text>
            </View>
          </View>
        </View>
        
        {/* Book Now Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity 
            style={styles.bookButton} 
            onPress={handleBookNow}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#EAB308', '#CA8A04', '#A16207']}
              style={styles.bookButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.bookButtonContent}>
                <View style={styles.bookButtonLeft}>
                  <Ionicons name="calendar" size={22} color="#FFFFFF" />
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </View>
                <View style={styles.bookButtonRight}>
                  <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Booking Flow Modal */}
      <Modal
        visible={showBookingFlow}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBookingFlow(false)}
      >
        {cab && (
          <CabBookingFlow
            cab={cab}
            onComplete={handleBookingComplete}
            onClose={() => setShowBookingFlow(false)}
          />
        )}
      </Modal>

      {/* Booking Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowConfirmation(false);
          router.back();
        }}
      >
        {bookingData && cab && (
          <CabBookingConfirmation
            cab={cab}
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
    paddingBottom: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#EAB308',
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    width: screenWidth,
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
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
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  indicatorActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  infoCardWrapper: {
    marginTop: -20,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  storeLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeBadgeText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },
  viewStoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EAB308',
    borderRadius: 8,
  },
  viewStoreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  priceContainer: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  priceValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#EAB308',
  },
  originalPrice: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  cashbackBadge: {
    backgroundColor: '#EAB308',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cashbackText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  cashbackAmount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    width: (screenWidth - 48) / 2,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4B5563',
  },
  bookButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 16,
    zIndex: 1001,
  },
  priceInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  priceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInfoLeft: {
    flex: 1,
  },
  priceInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceInfoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInfoValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  priceInfoOriginal: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  cashbackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  cashbackInfoText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  bookButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  bookButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  bookButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bookButtonRight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
