import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Text,
  RefreshControl,
  Image,
} from 'react-native';
import { showAlert } from '@/components/common/CrossPlatformAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useEarnFromSocialMedia } from '@/hooks/useEarnFromSocialMedia';
import EarnSocialData from '@/data/earnSocialData';
import ordersService, { Order } from '@/services/ordersApi';
import socialMediaApi, { SocialPost } from '@/services/socialMediaApi';
import CashbackInfoModal from '@/components/earnings/CashbackInfoModal';
import CompletedOrderCard from '@/components/earnings/CompletedOrderCard';
import * as ImagePicker from 'expo-image-picker';

// Type for tracking submission status per order
interface OrderSubmissionMap {
  [orderId: string]: {
    status: 'pending' | 'approved' | 'rejected' | 'credited';
    postId: string;
  };
}

const { width } = Dimensions.get('window');

type PlatformType = 'instagram' | 'facebook' | 'twitter' | 'tiktok';
type SubmissionMode = 'url' | 'media';
type PageStep = 'orders_list' | 'platform_select' | 'url_input' | 'media_upload' | 'uploading' | 'success' | 'error';

interface SelectedOrderInfo {
  orderId: string;
  orderNumber: string;
  productName: string;
  productImage?: string;
  storeName: string;
  totalAmount: number;
  cashbackAmount: number;
}

const PLATFORM_CONFIG: Record<PlatformType, { label: string; icon: string; color: string; placeholder: string }> = {
  instagram: {
    label: 'Instagram',
    icon: 'logo-instagram',
    color: '#E1306C',
    placeholder: 'Paste Instagram post URL here...\ne.g. https://instagram.com/p/ABC123',
  },
  facebook: {
    label: 'Facebook',
    icon: 'logo-facebook',
    color: '#1877F2',
    placeholder: 'Paste Facebook post URL here...\ne.g. https://facebook.com/user/posts/123',
  },
  twitter: {
    label: 'X (Twitter)',
    icon: 'logo-twitter',
    color: '#1DA1F2',
    placeholder: 'Paste X/Twitter post URL here...\ne.g. https://x.com/user/status/123',
  },
  tiktok: {
    label: 'TikTok',
    icon: 'logo-tiktok',
    color: '#000000',
    placeholder: 'Paste TikTok video URL here...\ne.g. https://tiktok.com/@user/video/123',
  },
};

export default function EarnFromSocialMediaPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // State
  const [currentStep, setCurrentStep] = useState<PageStep>('orders_list');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSubmissions, setOrderSubmissions] = useState<OrderSubmissionMap>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SelectedOrderInfo | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // New state for multi-platform + media
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('instagram');
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>('url');
  const [selectedMedia, setSelectedMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);

  // Extract product context from params (for direct product links)
  const productContext = {
    productId: params.productId as string | undefined,
    productName: params.productName as string | undefined,
    productPrice: params.productPrice ? parseFloat(params.productPrice as string) : undefined,
    productImage: params.productImage as string | undefined,
    storeId: params.storeId as string | undefined,
    storeName: params.storeName as string | undefined,
  };

  const { handlers } = useEarnFromSocialMedia(productContext.productId);

  // Fetch completed orders and existing social media submissions
  const fetchCompletedOrders = useCallback(async () => {
    try {
      const [ordersResponse, postsResponse] = await Promise.all([
        ordersService.getOrders({ status: 'delivered' }),
        socialMediaApi.getUserPosts({ limit: 100 })
      ]);

      if (ordersResponse.success && ordersResponse.data?.orders) {
        const deliveredOrders = ordersResponse.data.orders.filter(
          (order) => order.status === 'delivered'
        );
        setOrders(deliveredOrders);
      } else {
        setOrders([]);
      }

      const submissionsMap: OrderSubmissionMap = {};
      if (postsResponse.posts && postsResponse.posts.length > 0) {
        postsResponse.posts.forEach((post: SocialPost) => {
          if (post.order) {
            submissionsMap[post.order] = {
              status: post.status,
              postId: post._id
            };
          }
        });
      }
      setOrderSubmissions(submissionsMap);
    } catch (err) {
      console.error('[EARN SOCIAL] Error fetching orders:', err);
      setOrders([]);
      setOrderSubmissions({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCompletedOrders();
  }, [fetchCompletedOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCompletedOrders();
  }, [fetchCompletedOrders]);

  // Handle "Earn" button press on order card
  const handleEarnPress = (order: Order) => {
    const firstItem = order.items?.[0];
    const totalAmount = order.totals?.total || 0;

    setSelectedOrder({
      orderId: order._id || order.id,
      orderNumber: order.orderNumber,
      productName: firstItem?.product?.name || 'Product',
      productImage: firstItem?.product?.images?.[0]?.url,
      storeName: firstItem?.product?.store?.name || 'Store',
      totalAmount,
      cashbackAmount: (totalAmount * 5) / 100,
    });
    setModalVisible(true);
  };

  // Handle "Upload" button press in modal -> go to platform select
  const handleUploadPress = () => {
    setModalVisible(false);
    setCurrentStep('platform_select');
  };

  // Handle platform selection continue
  const handlePlatformContinue = () => {
    if (submissionMode === 'url') {
      setCurrentStep('url_input');
    } else {
      setCurrentStep('media_upload');
    }
  };

  // Handle media picker
  const handlePickMedia = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission Required', 'Please grant access to your photo library to upload media.', undefined, 'error');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        selectionLimit: 5 - selectedMedia.length,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const total = [...selectedMedia, ...result.assets].slice(0, 5);
        setSelectedMedia(total);
      }
    } catch (err) {
      console.error('[EARN SOCIAL] Image picker error:', err);
      showAlert('Error', 'Failed to open gallery. Please try again.', undefined, 'error');
    }
  };

  // Remove a selected media item
  const handleRemoveMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
  };

  // Handle URL submission
  const handleSubmitUrl = async () => {
    if (!urlInput.trim()) {
      showAlert('Error', `Please enter a ${PLATFORM_CONFIG[selectedPlatform].label} post URL`, undefined, 'error');
      return;
    }

    if (!selectedOrder?.orderId) {
      showAlert('Error', 'Please select an order first', undefined, 'error');
      return;
    }

    try {
      const { validators } = await import('@/services/socialMediaApi');

      const validation = validators.validatePostUrl(selectedPlatform, urlInput.trim());
      if (!validation.isValid) {
        showAlert('Invalid URL', validation.error || `Please enter a valid ${PLATFORM_CONFIG[selectedPlatform].label} post URL`, undefined, 'error');
        return;
      }

      setSubmitting(true);
      setCurrentStep('uploading');
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const response = await socialMediaApi.submitPost({
        platform: selectedPlatform,
        postUrl: urlInput.trim(),
        orderId: selectedOrder.orderId,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const postId = response?.post?.id || (response as any)?.id || 'unknown';
      setOrderSubmissions(prev => ({
        ...prev,
        [selectedOrder.orderId]: { status: 'pending', postId }
      }));

      setCurrentStep('success');
    } catch (err: any) {
      console.error('[EARN SOCIAL] Submission error:', err);
      setError(err.message || 'Failed to submit post. Please try again.');
      setCurrentStep('error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle media submission
  const handleSubmitMedia = async () => {
    if (selectedMedia.length === 0) {
      showAlert('Error', 'Please select at least one photo or video', undefined, 'error');
      return;
    }

    if (!selectedOrder?.orderId) {
      showAlert('Error', 'Please select an order first', undefined, 'error');
      return;
    }

    try {
      setSubmitting(true);
      setCurrentStep('uploading');
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 5;
        });
      }, 500);

      const files = selectedMedia.map((asset, index) => ({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
        name: `proof_${index}.${asset.type === 'video' ? 'mp4' : 'jpg'}`,
      }));

      const response = await socialMediaApi.submitPostWithMedia({
        platform: selectedPlatform,
        orderId: selectedOrder.orderId,
        files,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const postId = response?.post?.id || (response as any)?.id || 'unknown';
      setOrderSubmissions(prev => ({
        ...prev,
        [selectedOrder.orderId]: { status: 'pending', postId }
      }));

      setCurrentStep('success');
    } catch (err: any) {
      console.error('[EARN SOCIAL] Media submission error:', err);
      setError(err.message || 'Failed to upload media. Please try again.');
      setCurrentStep('error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setUrlInput('');
    setSelectedMedia([]);
    setCurrentStep('platform_select');
  };

  // Handle go back
  const handleGoBack = () => {
    if (currentStep === 'orders_list') {
      router.back();
    } else if (currentStep === 'url_input' || currentStep === 'media_upload') {
      setCurrentStep('platform_select');
    } else if (currentStep === 'platform_select') {
      setCurrentStep('orders_list');
      setSelectedOrder(null);
    } else {
      setCurrentStep('orders_list');
      setSelectedOrder(null);
      setUrlInput('');
      setSelectedMedia([]);
      setError(null);
    }
  };

  // Render orders list
  const renderOrdersList = () => (
    <ScrollView
      style={styles.ordersContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />
      }
    >
      <View style={styles.infoCard}>
        <View style={styles.infoIconContainer}>
          <Ionicons name="gift-outline" size={24} color="#8B5CF6" />
        </View>
        <View style={styles.infoContent}>
          <ThemedText style={styles.infoTitle}>Earn Cashback</ThemedText>
          <ThemedText style={styles.infoDescription}>
            Share your delivered orders on social media and earn 5% cashback in coins!
          </ThemedText>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <ThemedText style={styles.loadingText}>Loading your orders...</ThemedText>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={64} color="#D1D5DB" />
          <ThemedText style={styles.emptyTitle}>No Delivered Orders</ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Complete orders to earn cashback by sharing on social media!
          </ThemedText>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={() => router.push('/')}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.shopNowText}>Shop Now</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.ordersList}>
          <ThemedText style={styles.ordersTitle}>
            Your Delivered Orders ({orders.length})
          </ThemedText>
          {orders.map((order) => {
            const orderId = order._id || order.id;
            const submission = orderSubmissions[orderId];
            return (
              <CompletedOrderCard
                key={orderId}
                order={order}
                onEarnPress={handleEarnPress}
                submissionStatus={submission?.status || null}
              />
            );
          })}
        </View>
      )}

      <View style={styles.bottomSpace} />
    </ScrollView>
  );

  // Render platform select step
  const renderPlatformSelect = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Selected Order Context */}
      {selectedOrder && (
        <View style={styles.selectedOrderCard}>
          <View style={styles.selectedOrderHeader}>
            <Ionicons name="receipt-outline" size={20} color="#8B5CF6" />
            <ThemedText style={styles.selectedOrderTitle}>Earning for:</ThemedText>
          </View>
          <ThemedText style={styles.selectedOrderName}>{selectedOrder.productName}</ThemedText>
          <ThemedText style={styles.selectedStoreName}>
            Order #{selectedOrder.orderNumber} • {selectedOrder.storeName}
          </ThemedText>
        </View>
      )}

      {/* Platform Selection */}
      <View style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>Choose Platform</ThemedText>
        <View style={styles.platformGrid}>
          {(Object.keys(PLATFORM_CONFIG) as PlatformType[]).map((platform) => {
            const config = PLATFORM_CONFIG[platform];
            const isSelected = selectedPlatform === platform;
            return (
              <TouchableOpacity
                key={platform}
                style={[styles.platformButton, isSelected && styles.platformButtonSelected]}
                onPress={() => setSelectedPlatform(platform)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={config.icon as any}
                  size={28}
                  color={isSelected ? config.color : '#9CA3AF'}
                />
                <ThemedText style={[styles.platformLabel, isSelected && { color: config.color }]}>
                  {config.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Submission Mode */}
      <View style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>How do you want to submit?</ThemedText>
        <View style={styles.modeOptions}>
          <TouchableOpacity
            style={[styles.modeCard, submissionMode === 'url' && styles.modeCardSelected]}
            onPress={() => setSubmissionMode('url')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="link-outline"
              size={28}
              color={submissionMode === 'url' ? '#8B5CF6' : '#9CA3AF'}
            />
            <ThemedText style={[styles.modeTitle, submissionMode === 'url' && styles.modeTitleSelected]}>
              Paste Post URL
            </ThemedText>
            <ThemedText style={styles.modeDescription}>
              Share the link to your social media post
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeCard, submissionMode === 'media' && styles.modeCardSelected]}
            onPress={() => setSubmissionMode('media')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="images-outline"
              size={28}
              color={submissionMode === 'media' ? '#8B5CF6' : '#9CA3AF'}
            />
            <ThemedText style={[styles.modeTitle, submissionMode === 'media' && styles.modeTitleSelected]}>
              Upload Photo/Video
            </ThemedText>
            <ThemedText style={styles.modeDescription}>
              Upload screenshot or screen recording as proof
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={handlePlatformContinue}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={EarnSocialData.ui.gradients.primary as any}
          style={styles.continueButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <ThemedText style={styles.continueButtonText}>Continue</ThemedText>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );

  // Render URL input step
  const renderUrlInputStep = () => {
    const platformConfig = PLATFORM_CONFIG[selectedPlatform];
    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Platform Header */}
        <View style={styles.platformHeader}>
          <Ionicons name={platformConfig.icon as any} size={24} color={platformConfig.color} />
          <ThemedText style={styles.platformHeaderText}>{platformConfig.label} Post</ThemedText>
        </View>

        {/* Selected Order Context */}
        {selectedOrder && (
          <View style={styles.selectedOrderCard}>
            <View style={styles.selectedOrderHeader}>
              <Ionicons name="receipt-outline" size={20} color="#8B5CF6" />
              <ThemedText style={styles.selectedOrderTitle}>Earning for:</ThemedText>
            </View>
            <ThemedText style={styles.selectedOrderName}>{selectedOrder.productName}</ThemedText>
            <ThemedText style={styles.selectedStoreName}>
              Order #{selectedOrder.orderNumber} • {selectedOrder.storeName}
            </ThemedText>
            <ThemedText style={styles.selectedCashback}>
              5% cashback = {selectedOrder.cashbackAmount.toFixed(0)} coins
            </ThemedText>
          </View>
        )}

        {/* URL Input */}
        <View style={styles.stepsContainer}>
          <View style={styles.stepCard}>
            <ThemedText style={styles.stepSubtitle}>{platformConfig.label} Post URL</ThemedText>
            <View style={styles.urlInputContainer}>
              <TextInput
                style={styles.urlInput}
                placeholder={platformConfig.placeholder}
                value={urlInput}
                onChangeText={setUrlInput}
                multiline
                textAlignVertical="top"
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleSubmitUrl}
          activeOpacity={0.8}
          disabled={submitting}
        >
          <LinearGradient
            colors={EarnSocialData.ui.gradients.primary as any}
            style={[styles.uploadButtonGradient, { pointerEvents: 'none' } as any]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {submitting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <ThemedText style={[styles.uploadButtonText, { pointerEvents: 'none' } as any]}>Submit</ThemedText>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    );
  };

  // Render media upload step
  const renderMediaUpload = () => {
    const platformConfig = PLATFORM_CONFIG[selectedPlatform];
    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Platform Header */}
        <View style={styles.platformHeader}>
          <Ionicons name={platformConfig.icon as any} size={24} color={platformConfig.color} />
          <ThemedText style={styles.platformHeaderText}>{platformConfig.label} Proof</ThemedText>
        </View>

        {/* Selected Order Context */}
        {selectedOrder && (
          <View style={styles.selectedOrderCard}>
            <View style={styles.selectedOrderHeader}>
              <Ionicons name="receipt-outline" size={20} color="#8B5CF6" />
              <ThemedText style={styles.selectedOrderTitle}>Earning for:</ThemedText>
            </View>
            <ThemedText style={styles.selectedOrderName}>{selectedOrder.productName}</ThemedText>
            <ThemedText style={styles.selectedStoreName}>
              Order #{selectedOrder.orderNumber} • {selectedOrder.storeName}
            </ThemedText>
            <ThemedText style={styles.selectedCashback}>
              5% cashback = {selectedOrder.cashbackAmount.toFixed(0)} coins
            </ThemedText>
          </View>
        )}

        {/* Media Upload Area */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>
            Upload Proof ({selectedMedia.length}/5)
          </ThemedText>
          <ThemedText style={styles.sectionSubtext}>
            Upload a screenshot or screen recording of your {platformConfig.label} post
          </ThemedText>

          {/* Pick Button */}
          {selectedMedia.length < 5 && (
            <TouchableOpacity
              style={styles.pickMediaButton}
              onPress={handlePickMedia}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={32} color="#8B5CF6" />
              <ThemedText style={styles.pickMediaText}>Pick from Gallery</ThemedText>
            </TouchableOpacity>
          )}

          {/* Media Grid */}
          {selectedMedia.length > 0 && (
            <View style={styles.mediaGrid}>
              {selectedMedia.map((asset, index) => (
                <View key={index} style={styles.mediaItem}>
                  <Image source={{ uri: asset.uri }} style={styles.mediaThumbnail} />
                  {asset.type === 'video' && (
                    <View style={styles.videoOverlay}>
                      <Ionicons name="play-circle" size={24} color="white" />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeMediaButton}
                    onPress={() => handleRemoveMedia(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={22} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.uploadButton, selectedMedia.length === 0 && styles.buttonDisabled]}
          onPress={handleSubmitMedia}
          activeOpacity={0.8}
          disabled={submitting || selectedMedia.length === 0}
        >
          <LinearGradient
            colors={selectedMedia.length > 0 ? EarnSocialData.ui.gradients.primary as any : ['#D1D5DB', '#9CA3AF']}
            style={[styles.uploadButtonGradient, { pointerEvents: 'none' } as any]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {submitting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <ThemedText style={[styles.uploadButtonText, { pointerEvents: 'none' } as any]}>Submit</ThemedText>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    );
  };

  // Render uploading step
  const renderUploadingStep = () => (
    <View style={styles.uploadingContainer}>
      <View style={styles.uploadProgressContainer}>
        <ActivityIndicator size="large" color={EarnSocialData.ui.colors.primary} />
        <ThemedText style={styles.uploadingText}>
          {submissionMode === 'media' ? 'Uploading your media...' : 'Submitting your post...'}
        </ThemedText>
        <ThemedText style={styles.progressText}>{uploadProgress}%</ThemedText>
      </View>
    </View>
  );

  // Render success step
  const renderSuccessStep = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={80} color={EarnSocialData.ui.colors.success} />
      </View>
      <ThemedText style={styles.successTitle}>Post Submitted Successfully!</ThemedText>
      <ThemedText style={styles.successDescription}>
        Your post is under review. The merchant will verify within 24 hours.{'\n'}
        You'll receive {selectedOrder?.cashbackAmount.toFixed(0) || '0'} REZ Coins once approved.
      </ThemedText>
      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => {
          setCurrentStep('orders_list');
          setSelectedOrder(null);
          setUrlInput('');
          setSelectedMedia([]);
        }}
        activeOpacity={0.8}
      >
        <ThemedText style={styles.doneButtonText}>Done</ThemedText>
      </TouchableOpacity>
    </View>
  );

  // Render error step
  const renderErrorStep = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorIcon}>
        <Ionicons name="alert-circle" size={80} color={EarnSocialData.ui.colors.error} />
      </View>
      <ThemedText style={styles.errorTitle}>Upload Failed</ThemedText>
      <ThemedText style={styles.errorDescription}>{error}</ThemedText>
      <View style={styles.errorActions}>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={20} color="#fff" />
          <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleGoBack}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.cancelButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render content based on current step
  const renderContent = () => {
    switch (currentStep) {
      case 'platform_select':
        return renderPlatformSelect();
      case 'url_input':
        return renderUrlInputStep();
      case 'media_upload':
        return renderMediaUpload();
      case 'uploading':
        return renderUploadingStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderOrdersList();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <LinearGradient
        colors={EarnSocialData.ui.gradients.primary as any}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.8}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle}>Earn from social media</ThemedText>

          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.mainContent}>{renderContent()}</View>

      {/* Cashback Info Modal */}
      <CashbackInfoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onUpload={handleUploadPress}
        orderInfo={selectedOrder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header Styles
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginLeft: -40,
  },
  headerRight: {
    width: 40,
  },

  // Main Content
  mainContent: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // Orders Container
  ordersContainer: {
    flex: 1,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F3E8FF',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopNowText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // Orders List
  ordersList: {
    paddingHorizontal: 20,
  },
  ordersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },

  // Platform Header
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  platformHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },

  // Section Container
  sectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },

  // Platform Grid
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  platformButton: {
    width: (width - 64) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  platformButtonSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F9F5FF',
  },
  platformLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },

  // Mode Options
  modeOptions: {
    gap: 12,
  },
  modeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  modeCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F9F5FF',
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  modeTitleSelected: {
    color: '#8B5CF6',
  },
  modeDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    position: 'absolute',
    bottom: 8,
    left: 64,
    right: 16,
  },

  // Continue Button
  continueButton: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 25,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // Selected Order Card
  selectedOrderCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  selectedOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  selectedOrderTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedOrderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  selectedStoreName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  selectedCashback: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },

  // Steps Container
  stepsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },

  // Step Card
  stepCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },

  // URL Input
  urlInputContainer: {
    marginTop: 8,
  },
  urlInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlignVertical: 'top',
  },

  // Pick Media Button
  pickMediaButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  pickMediaText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },

  // Media Grid
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaItem: {
    width: (width - 64) / 3,
    height: (width - 64) / 3,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 11,
  },

  // Upload Button
  uploadButton: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 25,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Uploading State
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  uploadProgressContainer: {
    alignItems: 'center',
    gap: 16,
  },
  uploadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  progressText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },

  // Success State
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  successDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  errorIcon: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },

  // Bottom Space
  bottomSpace: {
    height: 100,
  },
});
