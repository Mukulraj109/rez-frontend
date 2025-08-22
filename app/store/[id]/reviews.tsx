// Store Reviews Page
// Shows reviews and ratings for a specific store

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import ReviewSystem, { Review, ReviewSummary } from '@/components/common/ReviewSystem';

interface Store {
  id: string;
  name: string;
  category: string;
  address: string;
  rating: number;
  reviewCount: number;
  image: string;
}

export default function StoreReviewsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [store, setStore] = useState<Store | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({
    totalReviews: 0,
    averageRating: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoreData(id as string);
  }, [id]);

  const loadStoreData = async (storeId: string) => {
    try {
      // Mock store data
      const mockStore: Store = {
        id: storeId,
        name: 'TechHub Electronics',
        category: 'Electronics & Gadgets',
        address: '123 Tech Street, Digital City',
        rating: 4.3,
        reviewCount: 847,
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500',
      };

      // Mock reviews for the store
      const mockReviews: Review[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'Alex Thompson',
          userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          rating: 5,
          title: 'Excellent service and products!',
          content: 'Amazing store with a great selection of electronics. The staff is knowledgeable and helpful. I\'ve been shopping here for years and they never disappoint. Fast delivery and genuine products.',
          images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300'],
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          helpfulCount: 34,
          isHelpful: false,
          isVerifiedPurchase: true,
          canEdit: false,
          canDelete: false,
          response: {
            id: 'resp1',
            content: 'Thank you Alex! We really appreciate your loyalty and support. Our team works hard to provide the best service possible.',
            author: 'TechHub Team',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          }
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Sarah Johnson',
          userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b95d6667?w=150',
          rating: 4,
          title: 'Good variety, competitive prices',
          content: 'Nice store with good prices and variety. The online ordering system works well and pickup is convenient. Sometimes the store can get busy during sales events but overall good experience.',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          helpfulCount: 22,
          isHelpful: true,
          isVerifiedPurchase: true,
          canEdit: false,
          canDelete: false,
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'Mike Chen',
          rating: 3,
          title: 'Average experience',
          content: 'The store is okay but nothing special. Products are genuine but prices could be better. Customer service could be more responsive. Had to wait quite a bit for assistance.',
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          helpfulCount: 15,
          isHelpful: false,
          isVerifiedPurchase: true,
          canEdit: false,
          canDelete: false,
        },
        {
          id: '4',
          userId: 'user4',
          userName: 'Emma Rodriguez',
          rating: 5,
          title: 'Outstanding customer support',
          content: 'Had an issue with a purchase and their customer support was exceptional. They resolved it quickly and professionally. The store manager personally followed up to ensure I was satisfied.',
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          helpfulCount: 28,
          isHelpful: false,
          isVerifiedPurchase: true,
          canEdit: false,
          canDelete: false,
        },
        {
          id: '5',
          userId: 'current-user',
          userName: 'You',
          rating: 4,
          title: 'Great store for tech needs',
          content: 'Really impressed with the product selection and store layout. Easy to find what you\'re looking for. The staff recommendations were spot on for my requirements.',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          helpfulCount: 5,
          isHelpful: false,
          isVerifiedPurchase: true,
          canEdit: true,
          canDelete: true,
        }
      ];

      // Calculate review summary
      const totalReviews = mockReviews.length;
      const averageRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
      const ratingBreakdown = mockReviews.reduce((breakdown, review) => {
        breakdown[review.rating as keyof typeof breakdown]++;
        return breakdown;
      }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

      setStore(mockStore);
      setReviews(mockReviews);
      setReviewSummary({
        totalReviews,
        averageRating,
        ratingBreakdown,
      });
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  // Review handlers
  const handleAddReview = async (review: Omit<Review, 'id' | 'createdAt' | 'helpfulCount' | 'isHelpful' | 'canEdit' | 'canDelete'>): Promise<void> => {
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
      isHelpful: false,
      canEdit: true,
      canDelete: true,
    };

    setReviews(prev => [newReview, ...prev]);
    
    // Recalculate summary
    const updatedReviews = [newReview, ...reviews];
    const totalReviews = updatedReviews.length;
    const averageRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    const ratingBreakdown = updatedReviews.reduce((breakdown, r) => {
      breakdown[r.rating as keyof typeof breakdown]++;
      return breakdown;
    }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    
    setReviewSummary({ totalReviews, averageRating, ratingBreakdown });
  };

  const handleEditReview = async (reviewId: string, updatedReview: Partial<Review>): Promise<void> => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, ...updatedReview, updatedAt: new Date().toISOString() }
        : review
    ));
  };

  const handleDeleteReview = async (reviewId: string): Promise<void> => {
    setReviews(prev => {
      const updatedReviews = prev.filter(review => review.id !== reviewId);
      
      // Recalculate summary
      const totalReviews = updatedReviews.length;
      if (totalReviews > 0) {
        const averageRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
        const ratingBreakdown = updatedReviews.reduce((breakdown, r) => {
          breakdown[r.rating as keyof typeof breakdown]++;
          return breakdown;
        }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
        
        setReviewSummary({ totalReviews, averageRating, ratingBreakdown });
      } else {
        setReviewSummary({ totalReviews: 0, averageRating: 0, ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
      }
      
      return updatedReviews;
    });
  };

  const handleMarkHelpful = async (reviewId: string): Promise<void> => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? {
            ...review,
            isHelpful: !review.isHelpful,
            helpfulCount: review.isHelpful ? review.helpfulCount - 1 : review.helpfulCount + 1,
          }
        : review
    ));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading store reviews...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!store) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#666" />
          <ThemedText style={styles.errorTitle}>Store Not Found</ThemedText>
          <ThemedText style={styles.errorText}>
            The store you're looking for could not be found.
          </ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerTitle}>
          <ThemedText style={styles.headerTitleText}>Store Reviews</ThemedText>
          <ThemedText style={styles.headerSubtitle}>{store.name}</ThemedText>
        </View>
        
        <View style={styles.headerRight} />
      </View>

      {/* Store Info Header */}
      <View style={styles.storeHeader}>
        <View style={styles.storeInfo}>
          <ThemedText style={styles.storeName}>{store.name}</ThemedText>
          <ThemedText style={styles.storeCategory}>{store.category}</ThemedText>
          <ThemedText style={styles.storeAddress}>{store.address}</ThemedText>
          
          <View style={styles.storeRating}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <ThemedText style={styles.ratingText}>{store.rating}</ThemedText>
            <ThemedText style={styles.reviewCountText}>({store.reviewCount} reviews)</ThemedText>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ReviewSystem
          entityId={store.id}
          entityType="store"
          reviews={reviews}
          reviewSummary={reviewSummary}
          onAddReview={handleAddReview}
          onEditReview={handleEditReview}
          onDeleteReview={handleDeleteReview}
          onMarkHelpful={handleMarkHelpful}
          currentUserId="current-user"
          allowPhotos={true}
          maxPhotos={5}
          showSummary={true}
          showFilters={true}
          placeholder="Share your experience with this store..."
          style={styles.reviewSystem}
        />
        
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  storeHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  storeInfo: {
    alignItems: 'center',
  },
  storeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  storeCategory: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  storeRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviewCountText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  reviewSystem: {
    backgroundColor: 'white',
  },
  bottomSpace: {
    height: 20,
  },
});