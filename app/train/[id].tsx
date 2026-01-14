/**
 * Train Details Page - Dedicated page for train bookings
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
import ProductReviewsSection from '@/components/reviews/ProductReviewsSection';
import TrainBookingFlow from '../../components/train/TrainBookingFlow';
import TrainBookingConfirmation from '../../components/train/TrainBookingConfirmation';
import RelatedTrainsSection from '../../components/train/RelatedTrainsSection';
import TrainInfoCard from '../../components/train/TrainInfoCard';
import TrainAmenities from '../../components/train/TrainAmenities';
import TrainCancellationPolicy from '../../components/train/TrainCancellationPolicy';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TrainDetails {
  id: string;
  name: string;
  route: {
    from: string;
    to: string;
    fromStation?: string;
    toStation?: string;
  };
  trainNumber?: string;
  trainType?: string;
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
  classOptions: {
    sleeper: { price: number; available: boolean };
    ac3: { price: number; available: boolean };
    ac2: { price: number; available: boolean };
    ac1: { price: number; available: boolean };
  };
}

interface BookingData {
  travelDate: Date;
  returnDate?: Date;
  tripType: 'one-way' | 'round-trip';
  passengers: {
    adults: number;
    children: number;
  };
  trainClass: 'sleeper' | 'ac3' | 'ac2' | 'ac1';
  selectedExtras: {
    meals?: boolean;
    bedding?: boolean;
    insurance?: boolean;
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
    gender: 'male' | 'female' | 'other';
    berthPreference?: 'lower' | 'middle' | 'upper' | 'side-lower' | 'side-upper';
  }>;
  bookingId?: string;
  bookingNumber?: string;
}

export default function TrainDetailsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  const [train, setTrain] = useState<TrainDetails | null>(null);
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
      loadTrainDetails();
    }
  }, [id]);

  const loadTrainDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productsApi.getProductById(id as string);

      if (!response.success || !response.data) {
        setError('Train not found');
        return;
      }

      const productData = response.data;

      // Check if this is a train service
      const isTrain = productData.serviceCategory?.slug === 'trains' || 
                       productData.category?.slug === 'trains' ||
                       productData.name?.toLowerCase().includes('train') ||
                       productData.name?.toLowerCase().includes('express');

      if (!isTrain) {
        // Redirect to regular product page
        router.replace(`/product/${id}`);
        return;
      }

      // Extract route from name (e.g., "Rajdhani Express Booking" or "Delhi to Mumbai Train")
      const routePatterns = [
        /(.+?)\s+to\s+(.+?)\s+train/i,
        /(.+?)\s*-\s*(.+?)\s+train/i,
        /(.+?)\s+→\s+(.+?)\s+train/i,
        /(.+?)\s+express/i,
      ];
      
      let from = 'Origin';
      let to = 'Destination';
      for (const pattern of routePatterns) {
        const match = productData.name.match(pattern);
        if (match) {
          from = match[1].trim();
          to = match[2] ? match[2].trim() : 'Destination';
          break;
        }
      }

      // If no route found, use defaults based on train name
      if (from === 'Origin') {
        if (productData.name.toLowerCase().includes('rajdhani')) {
          from = 'Delhi';
          to = 'Mumbai';
        } else if (productData.name.toLowerCase().includes('shatabdi')) {
          from = 'Delhi';
          to = 'Chandigarh';
        }
      }

      // Calculate times based on duration
      const durationHours = Math.floor((productData.serviceDetails?.duration || 480) / 60);
      const durationMins = (productData.serviceDetails?.duration || 480) % 60;
      const baseDepartureHour = 8;
      const baseDepartureMin = 0;
      const arrivalHour = (baseDepartureHour + durationHours + Math.floor((baseDepartureMin + durationMins) / 60)) % 24;
      const arrivalMin = (baseDepartureMin + durationMins) % 60;
      
      const formatTime = (hours: number, mins: number) => {
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      };

      // Get cashback from multiple sources
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
        return 10;
      })();

      // Calculate price properly
      const basePrice = productData.pricing?.selling || productData.pricing?.basePrice || productData.price?.current || 0;
      const originalPrice = productData.pricing?.original || productData.pricing?.basePrice || productData.price?.original;
      const calculatedDiscount = originalPrice && basePrice && originalPrice > basePrice
        ? Math.round(((originalPrice - basePrice) / originalPrice) * 100)
        : productData.pricing?.discount || 0;

      // Extract train number from SKU or generate
      const trainNumber = productData.sku || productData.barcode || 
        `${productData.name.substring(0, 3).toUpperCase()}${(productData.id || productData._id || '').toString().slice(-4)}`;

      // Transform to TrainDetails
      const trainDetails: TrainDetails = {
        id: productData.id || productData._id,
        name: productData.name,
        route: {
          from,
          to,
          fromStation: `${from} Railway Station`,
          toStation: `${to} Railway Station`,
        },
        trainNumber,
        trainType: (() => {
          if (productData.name.toLowerCase().includes('rajdhani')) return 'Rajdhani Express';
          if (productData.name.toLowerCase().includes('shatabdi')) return 'Shatabdi Express';
          if (productData.name.toLowerCase().includes('duronto')) return 'Duronto Express';
          if (productData.name.toLowerCase().includes('garib')) return 'Garib Rath';
          return 'Express';
        })(),
        price: basePrice,
        originalPrice: originalPrice && originalPrice > basePrice ? originalPrice : undefined,
        discount: calculatedDiscount > 0 ? calculatedDiscount : undefined,
        images: (() => {
          // Handle different image formats from backend
          // Ensure train images, not bus images
          if (!productData.images || !Array.isArray(productData.images)) {
            console.log('⚠️ [TRAIN] No images array found, using train fallback');
            return ['https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&h=600&fit=crop'];
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
          
          console.log('📸 [TRAIN] Processed images:', processedImages.length, processedImages);
          
          // Validate images are train-related (basic check)
          // If image URL contains 'bus', replace with train image
          const validatedImages = processedImages.map(url => {
            if (url.toLowerCase().includes('bus') && !url.toLowerCase().includes('train')) {
              console.log('⚠️ [TRAIN] Replacing bus image with train image:', url);
              return 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&h=600&fit=crop';
            }
            return url;
          });
          
          if (validatedImages.length === 0) {
            console.log('⚠️ [TRAIN] No valid images found, using train fallback');
            return ['https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&h=600&fit=crop'];
          }
          
          return validatedImages;
        })(),
        description: productData.description || productData.shortDescription || 'Comfortable train journey with excellent service.',
        duration: productData.serviceDetails?.duration || 480,
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
          name: productData.store?.name || 'RailConnect',
          logo: productData.store?.logo,
        },
        // Extract amenities from tags or use defaults
        amenities: (() => {
          const tagAmenities: Record<string, string[]> = {
            'premium': ['AC Coach', 'Meals', 'Bedding', 'Reading Light', 'Charging Point', 'Wi-Fi'],
            'express': ['AC Coach', 'Meals', 'Reading Light', 'Charging Point'],
            'sleeper': ['Fans', 'Reading Light', 'Charging Point'],
          };
          
          const tags = productData.tags || [];
          for (const [key, amenities] of Object.entries(tagAmenities)) {
            if (tags.some((tag: string) => tag.toLowerCase().includes(key))) {
              return amenities;
            }
          }
          
          // Default amenities based on train type
          if (productData.name.toLowerCase().includes('rajdhani') || 
              productData.name.toLowerCase().includes('shatabdi')) {
            return ['AC Coach', 'Meals', 'Bedding', 'Reading Light', 'Charging Point'];
          }
          return ['AC Coach', 'Meals', 'Reading Light', 'Charging Point'];
        })(),
        cancellationPolicy: {
          freeCancellation: productData.specifications?.some((s: any) => 
            s.key?.toLowerCase().includes('cancellation') && s.value?.toLowerCase().includes('free')
          ) || true,
          cancellationDeadline: '24',
          refundPercentage: 80,
        },
        classOptions: {
          sleeper: { 
            price: basePrice, 
            available: true 
          },
          ac3: { 
            price: Math.round(basePrice * 1.5), 
            available: true 
          },
          ac2: { 
            price: Math.round(basePrice * 2), 
            available: true 
          },
          ac1: { 
            price: Math.round(basePrice * 3), 
            available: true 
          },
        },
      };

      setTrain(trainDetails);
    } catch (error) {
      console.error('Error loading train details:', error);
      setError('Failed to load train details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAvailableDates = (): string[] => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < 60; i++) {
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
    if (!train) return;
    
    try {
      if (isInWishlist(train.id)) {
        await removeFromWishlist(train.id);
      } else {
        await addToWishlist(train.id);
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
            <ActivityIndicator size="large" color="#22C55E" />
            <Text style={styles.loadingText}>Loading train details...</Text>
            <Text style={styles.loadingSubtext}>Please wait</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !train) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error || 'Train not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadTrainDetails}>
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
            const imageUrl = train.images?.[selectedImageIndex] || train.images?.[0];
            const hasValidImage = imageUrl && typeof imageUrl === 'string' && imageUrl.length > 0;
            
            if (hasValidImage && !imageError) {
              return (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.headerImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error('❌ [TRAIN] Image load error:', error);
                    console.error('❌ [TRAIN] Failed URL:', imageUrl);
                    setImageError(true);
                  }}
                  onLoadStart={() => {
                    console.log('🔄 [TRAIN] Loading image:', imageUrl);
                    setImageError(false);
                  }}
                  onLoad={() => {
                    console.log('✅ [TRAIN] Image loaded successfully:', imageUrl);
                  }}
                />
              );
            }
            
            return (
              <View style={[styles.headerImage, styles.placeholderImage]}>
                <Ionicons name="train" size={64} color="#9CA3AF" />
                <Text style={styles.placeholderText}>Train Image</Text>
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
                  name={isInWishlist(train.id) ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isInWishlist(train.id) ? '#EF4444' : '#FFFFFF'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Discount Badge */}
          {train.discount && train.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{train.discount}% OFF</Text>
            </View>
          )}

          {/* Image Carousel Indicators */}
          {train.images && train.images.length > 1 && (
            <View style={styles.carouselIndicators}>
              {train.images.map((_, index) => (
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

        {/* Train Info Card */}
        <View style={styles.trainInfoWrapper}>
          <TrainInfoCard train={train} />
        </View>

        {/* Store/Railway Info */}
        {train.store && (
          <View style={styles.storeSection}>
            <View style={styles.storeHeader}>
              {train.store.logo ? (
                <Image
                  source={{ uri: train.store.logo }}
                  style={styles.storeLogo}
                  resizeMode="contain"
                  onError={() => {
                    // Logo failed to load
                  }}
                />
              ) : (
                <View style={styles.storeLogoPlaceholder}>
                  <Ionicons name="train" size={24} color="#22C55E" />
                </View>
              )}
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{train.store.name}</Text>
                <View style={styles.storeBadges}>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                  {train.rating > 0 && (
                    <View style={styles.ratingBadgeSmall}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.ratingTextSmall}>
                        {train.rating.toFixed(1)} ({train.reviewCount})
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewStoreButton}
                onPress={() => router.push(`/store/${train.store.id}` as any)}
              >
                <Text style={styles.viewStoreButtonText}>View</Text>
                <Ionicons name="chevron-forward" size={16} color="#22C55E" />
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
                {train.originalPrice && train.originalPrice > train.price && (
                  <Text style={styles.originalPrice}>₹{train.originalPrice.toLocaleString('en-IN')}</Text>
                )}
                <Text style={styles.price}>₹{train.price.toLocaleString('en-IN')}</Text>
              </View>
              {train.discount && train.discount > 0 && (
                <View style={styles.discountTag}>
                  <Text style={styles.discountTagText}>Save {train.discount}%</Text>
                </View>
              )}
            </View>
            <View style={styles.cashbackBadge}>
              <View style={styles.cashbackIconContainer}>
                <Ionicons name="gift" size={20} color="#22C55E" />
              </View>
              <View style={styles.cashbackContent}>
                <Text style={styles.cashbackText}>
                  {train.cashback.percentage}% Cashback
                </Text>
                <Text style={styles.cashbackAmount}>
                  Earn ₹{train.cashback.amount.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Train Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#22C55E" />
            <Text style={styles.sectionTitle}>Train Details</Text>
          </View>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="time" size={24} color="#22C55E" />
              </View>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>
                {Math.floor(train.duration / 60)}h {train.duration % 60}m
              </Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="train" size={24} color="#22C55E" />
              </View>
              <Text style={styles.detailLabel}>Train Type</Text>
              <Text style={styles.detailValue} numberOfLines={2}>{train.trainType}</Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="ticket" size={24} color="#22C55E" />
              </View>
              <Text style={styles.detailLabel}>Train Number</Text>
              <Text style={styles.detailValue} numberOfLines={2}>{train.trainNumber}</Text>
            </View>
          </View>
          
          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color="#6B7280" />
              <Text style={styles.infoText}>Flexible dates available</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color="#6B7280" />
              <Text style={styles.infoText}>{train.route.fromStation} → {train.route.toStation}</Text>
            </View>
          </View>
        </View>

        {/* Amenities */}
        <TrainAmenities amenities={train.amenities} />

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color="#22C55E" />
            <Text style={styles.sectionTitle}>About This Train</Text>
          </View>
          <Text style={styles.description}>{train.description}</Text>
          
          {/* Key Highlights */}
          <View style={styles.highlightsContainer}>
            <View style={styles.highlightItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text style={styles.highlightText}>Confirmed tickets</Text>
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
        <TrainCancellationPolicy policy={train.cancellationPolicy} />

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {train.rating.toFixed(1)} ({train.reviewCount})
              </Text>
            </View>
          </View>
          <ProductReviewsSection
            productId={train.id}
            reviews={reviews}
            summary={reviewSummary}
            isLoading={reviewsLoading}
            onRefresh={refreshReviews}
          />
        </View>

        {/* Related Trains */}
        <RelatedTrainsSection
          currentTrainId={train.id}
          route={train.route}
        />

        {/* Bottom Spacing */}
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
            colors={['#22C55E', '#16A34A']}
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
        <TrainBookingFlow
          train={train}
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
          <TrainBookingConfirmation
            train={train}
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
    backgroundColor: '#22C55E',
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
  trainInfoWrapper: {
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
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
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
    borderColor: '#22C55E',
    backgroundColor: '#D1FAE5',
  },
  viewStoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
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
    backgroundColor: '#D1FAE5',
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
    bottom: 95,
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
    zIndex: 1001,
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
