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

// Type for tracking submission status per order
interface OrderSubmissionMap {
  [orderId: string]: {
    status: 'pending' | 'approved' | 'rejected' | 'credited';
    postId: string;
  };
}

const { width } = Dimensions.get('window');

type PageStep = 'orders_list' | 'url_input' | 'uploading' | 'success' | 'error';

interface SelectedOrderInfo {
  orderId: string;
  orderNumber: string;
  productName: string;
  productImage?: string;
  storeName: string;
  totalAmount: number;
  cashbackAmount: number;
}

export default function EarnFromSocialMediaPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // State for new flow
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
      console.log('📦 [EARN SOCIAL] Fetching completed orders and submissions...');

      // Fetch both orders and existing social media posts in parallel
      const [ordersResponse, postsResponse] = await Promise.all([
        ordersService.getOrders({ status: 'delivered' }),
        socialMediaApi.getUserPosts({ limit: 100 }) // Get all user's submissions
      ]);

      // Process orders
      if (ordersResponse.success && ordersResponse.data?.orders) {
        const deliveredOrders = ordersResponse.data.orders.filter(
          (order) => order.status === 'delivered'
        );
        setOrders(deliveredOrders);
        console.log(`✅ [EARN SOCIAL] Fetched ${deliveredOrders.length} delivered orders`);
      } else {
        console.warn('⚠️ [EARN SOCIAL] No orders found');
        setOrders([]);
      }

      // Build submission map from existing posts
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
        console.log(`✅ [EARN SOCIAL] Found ${Object.keys(submissionsMap).length} existing submissions`);
      }
      setOrderSubmissions(submissionsMap);

    } catch (err) {
      console.error('❌ [EARN SOCIAL] Error fetching orders:', err);
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

  // Handle refresh
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

  // Handle "Upload" button press in modal
  const handleUploadPress = () => {
    setModalVisible(false);
    setCurrentStep('url_input');
  };

  // Handle URL submission
  const handleSubmitUrl = async () => {
    console.log('========================================');
    console.log('📤 [EARN SOCIAL] SUBMIT URL START');
    console.log('========================================');
    console.log('📤 [EARN SOCIAL] URL:', urlInput);
    console.log('📤 [EARN SOCIAL] Selected Order:', selectedOrder?.orderId);

    if (!urlInput.trim()) {
      console.log('❌ [EARN SOCIAL] Empty URL');
      showAlert('Error', 'Please enter an Instagram post URL', undefined, 'error');
      return;
    }

    if (!selectedOrder?.orderId) {
      console.log('❌ [EARN SOCIAL] No order selected');
      showAlert('Error', 'Please select an order first', undefined, 'error');
      return;
    }

    try {
      console.log('📤 [EARN SOCIAL] Importing validators...');
      const { validators } = await import('@/services/socialMediaApi');
      console.log('📤 [EARN SOCIAL] Validators imported:', !!validators);

      // Validate URL format
      const validation = validators.validatePostUrl('instagram', urlInput.trim());
      console.log('📤 [EARN SOCIAL] Validation result:', validation);

      if (!validation.isValid) {
        console.log('❌ [EARN SOCIAL] Invalid URL:', validation.error);
        showAlert('Invalid URL', validation.error || 'Please enter a valid Instagram post URL', undefined, 'error');
        return;
      }

      console.log('✅ [EARN SOCIAL] URL valid, proceeding to upload...');
      setSubmitting(true);
      setCurrentStep('uploading');
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // IMPORTANT: Submit directly with the correct orderId
      console.log('📤 [EARN SOCIAL] Calling socialMediaApi.submitPost with orderId:', selectedOrder.orderId);
      const response = await socialMediaApi.submitPost({
        platform: 'instagram',
        postUrl: urlInput.trim(),
        orderId: selectedOrder.orderId, // Pass the correct order ID!
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('✅ [EARN SOCIAL] Post submitted successfully:', JSON.stringify(response, null, 2));

      // Update local state to reflect the new submission (with defensive checks)
      const postId = response?.post?.id || response?.id || 'unknown';
      console.log('📤 [EARN SOCIAL] Extracted postId:', postId);

      setOrderSubmissions(prev => ({
        ...prev,
        [selectedOrder.orderId]: {
          status: 'pending',
          postId: postId
        }
      }));

      setCurrentStep('success');
    } catch (err: any) {
      console.error('❌ [EARN SOCIAL] Submission error:', err);
      setError(err.message || 'Failed to submit post. Please try again.');
      setCurrentStep('error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setUrlInput('');
    setCurrentStep('url_input');
  };

  // Handle go back
  const handleGoBack = () => {
    if (currentStep === 'orders_list') {
      router.back();
    } else {
      setCurrentStep('orders_list');
      setSelectedOrder(null);
      setUrlInput('');
      setError(null);
    }
  };

  // Render step indicator
  const renderStepIndicator = (stepNumber: number, isActive: boolean, isCompleted: boolean) => (
    <View
      style={[
        styles.stepIndicator,
        isActive && styles.stepIndicatorActive,
        isCompleted && styles.stepIndicatorCompleted,
      ]}
    >
      {isCompleted ? (
        <Ionicons name="checkmark" size={16} color="white" />
      ) : (
        <ThemedText style={[styles.stepNumber, isActive && styles.stepNumberActive]}>
          {stepNumber}
        </ThemedText>
      )}
    </View>
  );

  // Render orders list
  const renderOrdersList = () => (
    <ScrollView
      style={styles.ordersContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />
      }
    >
      {/* Header Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoIconContainer}>
          <Ionicons name="gift-outline" size={24} color="#8B5CF6" />
        </View>
        <View style={styles.infoContent}>
          <ThemedText style={styles.infoTitle}>Earn Cashback</ThemedText>
          <ThemedText style={styles.infoDescription}>
            Share your delivered orders on Instagram and earn 5% cashback in coins!
          </ThemedText>
        </View>
      </View>

      {/* Orders List */}
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
            Complete orders to earn cashback by sharing on Instagram!
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

  // Render URL input step
  const renderUrlInputStep = () => (
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
          <ThemedText style={styles.selectedCashback}>
            ₹{selectedOrder.totalAmount.toFixed(2)} • 5% cashback = ₹
            {selectedOrder.cashbackAmount.toFixed(2)}
          </ThemedText>
        </View>
      )}

      {/* Steps Container */}
      <View style={styles.stepsContainer}>
        {/* Step 1 */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            {renderStepIndicator(1, false, true)}
            <ThemedText style={styles.stepTitle}>Step 1: Share a post on Instagram</ThemedText>
          </View>
          <View style={styles.stepIllustration}>
            <View style={styles.phoneIllustration}>
              <View style={styles.phoneScreen}>
                <View style={styles.instagramPost}>
                  <Text style={styles.instagramIcon}>💜</Text>
                  <View style={styles.postContent}>
                    <Text style={styles.postImage}>📱</Text>
                    <ThemedText style={styles.percentageText}>%</ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Step 2 */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            {renderStepIndicator(2, true, false)}
            <ThemedText style={styles.stepTitle}>Step 2: Submit your post</ThemedText>
          </View>
          <ThemedText style={styles.stepSubtitle}>Instagram Post URL</ThemedText>

          {/* URL Input */}
          <View style={styles.urlInputContainer}>
            <TextInput
              style={styles.urlInput}
              placeholder="Paste Instagram post URL here..."
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

      {/* Upload Button */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleSubmitUrl}
        activeOpacity={0.8}
        disabled={submitting}
        accessibilityLabel={submitting ? 'Uploading post' : 'Upload post'}
        accessibilityRole="button"
        accessibilityState={{ disabled: submitting, busy: submitting }}
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
            <ThemedText style={[styles.uploadButtonText, { pointerEvents: 'none' } as any]}>Upload</ThemedText>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.bottomText}>
        <ThemedText style={styles.getCashbackText}>Get Cashback</ThemedText>
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );

  // Render uploading step
  const renderUploadingStep = () => (
    <View style={styles.uploadingContainer}>
      <View style={styles.uploadProgress}>
        <ActivityIndicator size="large" color={EarnSocialData.ui.colors.primary} />
        <ThemedText style={styles.uploadingText}>Uploading your post...</ThemedText>
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
        }}
        activeOpacity={0.8}
        accessibilityLabel="Done"
        accessibilityRole="button"
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
          accessibilityLabel="Try again"
          accessibilityRole="button"
        >
          <Ionicons name="refresh-outline" size={20} color="#fff" />
          <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleGoBack}
          activeOpacity={0.8}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ThemedText style={styles.cancelButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render content based on current step
  const renderContent = () => {
    switch (currentStep) {
      case 'url_input':
        return renderUrlInputStep();
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
            accessibilityLabel="Go back"
            accessibilityRole="button"
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
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepIndicatorActive: {
    backgroundColor: '#8B5CF6',
  },
  stepIndicatorCompleted: {
    backgroundColor: '#10B981',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepNumberActive: {
    color: 'white',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },

  // Step Illustration
  stepIllustration: {
    alignItems: 'center',
    marginVertical: 16,
  },
  phoneIllustration: {
    width: 120,
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  phoneScreen: {
    width: 100,
    height: 160,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  instagramPost: {
    alignItems: 'center',
    gap: 8,
  },
  instagramIcon: {
    fontSize: 24,
  },
  postContent: {
    alignItems: 'center',
    gap: 4,
  },
  postImage: {
    fontSize: 40,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F59E0B',
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

  // Uploading State
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  uploadProgress: {
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

  // Bottom Text
  bottomText: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  getCashbackText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  // Bottom Space - account for bottom tab navigation
  bottomSpace: {
    height: 100,
  },
});
