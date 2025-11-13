// Social Media Page
// Earn cashback by sharing purchases on social media platforms

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import * as socialMediaApi from '@/services/socialMediaApi';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/services/apiClient';
import ordersApi, { Order } from '@/services/ordersApi';

interface SocialPost {
  id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'tiktok';
  url: string;
  status: 'pending' | 'approved' | 'rejected' | 'credited';
  submittedAt: Date;
  cashbackAmount: number;
  thumbnailUrl?: string;
  orderNumber?: string;
}

interface EarningsData {
  totalEarned: number;
  pendingAmount: number;
  creditedAmount: number;
  postsSubmitted: number;
  approvalRate: number;
}

export default function SocialMediaPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const { state: authState } = useAuth();
  const [activeTab, setActiveTab] = useState<'earn' | 'history'>('earn');
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'facebook' | 'twitter' | 'tiktok'>('instagram');
  const [postUrl, setPostUrl] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(params.orderId);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarned: 0,
    pendingAmount: 0,
    creditedAmount: 0,
    postsSubmitted: 0,
    approvalRate: 0,
  });

  useEffect(() => {
    // Wait for auth to finish loading
    if (authState.isLoading) {

      return;
    }

    // Check if user is authenticated
    if (!authState.token || !authState.user) {

      router.replace('/sign-in');
      return;
    }

    // Token is available, set it and load data
    apiClient.setAuthToken(authState.token);
    loadData();
    loadCompletedOrders();
  }, [authState.token, authState.user, authState.isLoading]);

  const loadCompletedOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await ordersApi.getOrders({ status: 'delivered' });

      // Filter for delivered/completed orders only
      const delivered = (response.data?.orders || []).filter((order: Order) =>
        order.status === 'delivered' || order.status === 'cancelled'
      );
      setCompletedOrders(delivered);

    } catch (error: any) {
      console.error('❌ [SOCIAL MEDIA] Failed to load orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Verify token is set
      const currentToken = apiClient.getAuthToken();

      if (!currentToken) {
        console.error('❌ [SOCIAL MEDIA] No token in apiClient! Setting it now...');
        if (authState.token) {
          apiClient.setAuthToken(authState.token);
        } else {
          throw new Error('No authentication token available');
        }
      }

      // Fetch earnings and posts from API
      const [earningsData, postsData] = await Promise.all([
        socialMediaApi.getUserEarnings(),
        socialMediaApi.getUserPosts({ page: 1, limit: 50 })
      ]);

      // Set earnings data
      setEarnings({
        totalEarned: earningsData.totalEarned || 0,
        pendingAmount: earningsData.pendingAmount || 0,
        creditedAmount: earningsData.creditedAmount || 0,
        postsSubmitted: earningsData.postsSubmitted || 0,
        approvalRate: earningsData.approvalRate || 0,
      });

      // Transform and set posts data
      const transformedPosts: SocialPost[] = postsData.posts.map(post => ({
        id: post._id,
        platform: post.platform,
        url: post.postUrl,
        status: post.status,
        submittedAt: new Date(post.submittedAt),
        cashbackAmount: post.cashbackAmount,
        thumbnailUrl: post.metadata?.thumbnailUrl,
        orderNumber: post.metadata?.orderNumber,
      }));

      setPosts(transformedPosts);

    } catch (error: any) {
      console.error('❌ [SOCIAL MEDIA] Error loading data:', error);

      // Check for auth error
      if (error.response?.status === 401 || error.message?.includes('Access token')) {

        if (typeof window !== 'undefined' && window.alert) {
          window.alert('Please sign in to continue');
        } else {
          Alert.alert('Authentication Required', 'Please sign in to continue');
        }
        router.replace('/sign-in');
        return;
      }

      // Show error alert
      const errorMessage = error.response?.data?.message || 'Failed to load social media data';
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async () => {
    if (!postUrl.trim()) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Please enter a valid post URL');
      } else {
        Alert.alert('Error', 'Please enter a valid post URL');
      }
      return;
    }

    setSubmitting(true);
    try {

      // Submit post to API with optional orderId
      const response = await socialMediaApi.submitPost({
        platform: selectedPlatform,
        postUrl: postUrl.trim(),
        ...(selectedOrderId && { orderId: selectedOrderId })
      });

      // Calculate cashback message
      const selectedOrder = completedOrders.find(o => o._id === selectedOrderId);
      const cashbackAmount = selectedOrder ? Math.round((selectedOrder.totals?.total || 0) * 0.05) : 0;

      let successMessage = `Post submitted successfully! We will review it within ${response.post.estimatedReview}.`;
      if (cashbackAmount > 0) {
        successMessage += `\n\nYou'll earn ₹${cashbackAmount} (5% cashback) once approved!`;
      }

      if (typeof window !== 'undefined' && window.alert) {
        window.alert(successMessage);
      } else {
        Alert.alert('Success', successMessage);
      }

      // Clear form and reload data
      setPostUrl('');
      setSelectedOrderId(undefined);
      loadData();

    } catch (error: any) {
      console.error('❌ [SOCIAL MEDIA] Error submitting post:', error);

      const errorMessage = error.response?.data?.message || 'Failed to submit post. Please try again.';
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Failed to submit post. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to submit post. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const platforms = [
    { id: 'instagram' as const, name: 'Instagram', icon: 'logo-instagram', color: '#E4405F' },
    { id: 'facebook' as const, name: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
    { id: 'twitter' as const, name: 'Twitter', icon: 'logo-twitter', color: '#1DA1F2' },
    { id: 'tiktok' as const, name: 'TikTok', icon: 'musical-notes', color: '#000000' },
  ];

  const getStatusColor = (status: SocialPost['status']) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      case 'credited': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: SocialPost['status']) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Under Review';
      case 'rejected': return 'Rejected';
      case 'credited': return 'Credited';
      default: return 'Unknown';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

        {/* Header */}
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Returns to previous screen"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Social Media Earnings</Text>
          <TouchableOpacity
            style={styles.infoButton}
            accessibilityLabel="Information"
            accessibilityRole="button"
            accessibilityHint="View information about social media earnings"
          >
            <Ionicons name="information-circle-outline" size={24} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'earn' && styles.activeTab]}
            onPress={() => setActiveTab('earn')}
            accessibilityLabel="Earn Cashback tab"
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'earn' }}
            accessibilityHint="View how to earn cashback by sharing on social media"
          >
            <Text style={[styles.tabText, activeTab === 'earn' && styles.activeTabText]}>
              Earn Cashback
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
            accessibilityLabel="History tab"
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'history' }}
            accessibilityHint="View your submission history and earnings"
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              History
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'earn' ? (
            <>
              {/* Earnings Summary */}
              <View style={styles.summaryCard}>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.summaryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.summaryHeader}>
                    <Text style={styles.summaryTitle}>Total Earned</Text>
                    <View style={styles.badge}>
                      <Ionicons name="trending-up" size={16} color="white" />
                    </View>
                  </View>
                  <Text style={styles.summaryAmount}>₹{earnings.totalEarned}</Text>
                  <View style={styles.summaryStats}>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Pending</Text>
                      <Text style={styles.statValue}>₹{earnings.pendingAmount}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Credited</Text>
                      <Text style={styles.statValue}>₹{earnings.creditedAmount}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {/* How it Works */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>How It Works</Text>
                <View style={styles.stepsContainer}>
                  <View style={styles.step}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Make a Purchase</Text>
                      <Text style={styles.stepDescription}>
                        Buy any product from our stores
                      </Text>
                    </View>
                  </View>

                  <View style={styles.step}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Share on Social Media</Text>
                      <Text style={styles.stepDescription}>
                        Post about your purchase on Instagram, Facebook, or Twitter
                      </Text>
                    </View>
                  </View>

                  <View style={styles.step}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Submit Your Post</Text>
                      <Text style={styles.stepDescription}>
                        Copy and paste the post URL below
                      </Text>
                    </View>
                  </View>

                  <View style={styles.step}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>4</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Get Cashback</Text>
                      <Text style={styles.stepDescription}>
                        Earn 5% cashback credited to your wallet within 48 hours
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Order Selection (Optional) */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Link to Order (Optional)</Text>
                  {selectedOrderId && (
                    <Text style={styles.cashbackBadge}>+5% Cashback!</Text>
                  )}
                </View>
                <Text style={styles.sectionDescription}>
                  Select a completed order to earn 5% cashback when your post is approved
                </Text>

                {loadingOrders ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#8B5CF6" />
                    <Text style={styles.loadingText}>Loading orders...</Text>
                  </View>
                ) : completedOrders.length > 0 ? (
                  <View style={styles.orderDropdown}>
                    <TouchableOpacity
                      style={styles.orderSelectButton}
                      onPress={() => setSelectedOrderId(undefined)}
                    >
                      <View style={styles.orderOption}>
                        <Ionicons
                          name={selectedOrderId ? "radio-button-off" : "radio-button-on"}
                          size={20}
                          color={selectedOrderId ? "#9CA3AF" : "#8B5CF6"}
                        />
                        <Text style={[styles.orderText, !selectedOrderId && styles.orderTextActive]}>
                          No order (₹0 cashback)
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {completedOrders.map((order) => (
                      <TouchableOpacity
                        key={order._id}
                        style={styles.orderSelectButton}
                        onPress={() => setSelectedOrderId(order._id)}
                      >
                        <View style={styles.orderOption}>
                          <Ionicons
                            name={selectedOrderId === order._id ? "radio-button-on" : "radio-button-off"}
                            size={20}
                            color={selectedOrderId === order._id ? "#8B5CF6" : "#9CA3AF"}
                          />
                          <View style={styles.orderInfo}>
                            <Text style={[styles.orderText, selectedOrderId === order._id && styles.orderTextActive]}>
                              Order #{order.orderNumber}
                            </Text>
                            <Text style={styles.orderAmount}>
                              ₹{order.totals?.total || 0} • Earn ₹{Math.round((order.totals?.total || 0) * 0.05)}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noOrdersContainer}>
                    <Ionicons name="receipt-outline" size={40} color="#9CA3AF" />
                    <Text style={styles.noOrdersText}>No completed orders yet</Text>
                    <Text style={styles.noOrdersSubtext}>Complete an order first to earn cashback!</Text>
                  </View>
                )}
              </View>

              {/* Platform Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Platform</Text>
                <View style={styles.platformsContainer}>
                  {platforms.map((platform) => (
                    <TouchableOpacity
                      key={platform.id}
                      style={[
                        styles.platformButton,
                        selectedPlatform === platform.id && styles.platformButtonActive
                      ]}
                      onPress={() => setSelectedPlatform(platform.id)}
                      accessibilityLabel={`Select ${platform.name}`}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: selectedPlatform === platform.id }}
                      accessibilityHint={`Choose ${platform.name} as your social media platform`}
                    >
                      <Ionicons
                        name={platform.icon as any}
                        size={24}
                        color={selectedPlatform === platform.id ? platform.color : '#6B7280'}
                      />
                      <Text
                        style={[
                          styles.platformName,
                          selectedPlatform === platform.id && { color: platform.color }
                        ]}
                      >
                        {platform.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Submit Post */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Submit Your Post</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="link" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={`Paste your ${selectedPlatform} post URL here`}
                    placeholderTextColor="#9CA3AF"
                    value={postUrl}
                    onChangeText={setPostUrl}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {postUrl.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setPostUrl('')}
                      accessibilityLabel="Clear URL"
                      accessibilityRole="button"
                      accessibilityHint="Clears the entered post URL"
                    >
                      <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                  onPress={handleSubmitPost}
                  disabled={submitting}
                  accessibilityLabel={submitting ? "Submitting post" : "Submit post for verification"}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: submitting, busy: submitting }}
                  accessibilityHint="Submits your social media post URL for cashback approval"
                >
                  {submitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="white" />
                      <Text style={styles.submitButtonText}>Submit for Verification</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={16} color="#8B5CF6" />
                  <Text style={styles.infoText}>
                    Your post will be reviewed within 48 hours. Cashback will be credited upon approval.
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* History Tab */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statCardValue}>{earnings.postsSubmitted}</Text>
                  <Text style={styles.statCardLabel}>Posts Submitted</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statCardValue}>{earnings.approvalRate}%</Text>
                  <Text style={styles.statCardLabel}>Approval Rate</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Submission History</Text>
                {loading ? (
                  <View style={styles.historyLoadingContainer}>
                    <ActivityIndicator size="large" color="#8B5CF6" />
                  </View>
                ) : posts.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>No Submissions Yet</Text>
                    <Text style={styles.emptyText}>
                      Start earning by sharing your purchases on social media!
                    </Text>
                    <TouchableOpacity
                      style={styles.emptyButton}
                      onPress={() => setActiveTab('earn')}
                      accessibilityLabel="Submit your first post"
                      accessibilityRole="button"
                      accessibilityHint="Opens the earn tab to submit your first social media post"
                    >
                      <Text style={styles.emptyButtonText}>Submit Your First Post</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.postsContainer}>
                    {posts.map((post) => (
                      <View key={post.id} style={styles.postCard}>
                        <View style={styles.postHeader}>
                          <View style={styles.postPlatform}>
                            <Ionicons
                              name={
                                post.platform === 'instagram' ? 'logo-instagram' :
                                post.platform === 'facebook' ? 'logo-facebook' :
                                post.platform === 'twitter' ? 'logo-twitter' :
                                'musical-notes'
                              }
                              size={20}
                              color={
                                post.platform === 'instagram' ? '#E4405F' :
                                post.platform === 'facebook' ? '#1877F2' :
                                post.platform === 'twitter' ? '#1DA1F2' :
                                '#000000'
                              }
                            />
                            <Text style={styles.postPlatformName}>
                              {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.postStatus,
                              { backgroundColor: getStatusColor(post.status) + '20' }
                            ]}
                          >
                            <Text style={[styles.postStatusText, { color: getStatusColor(post.status) }]}>
                              {getStatusText(post.status)}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.postDate}>{formatDate(post.submittedAt)}</Text>
                        {post.orderNumber && (
                          <Text style={styles.postOrderNumber}>Order: {post.orderNumber}</Text>
                        )}

                        <View style={styles.postFooter}>
                          <View style={styles.postCashback}>
                            <Ionicons name="cash" size={16} color="#10B981" />
                            <Text style={styles.postCashbackAmount}>₹{post.cashbackAmount}</Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => Linking.openURL(post.url)}
                            style={styles.postLink}
                            accessibilityLabel={`View ${post.platform} post`}
                            accessibilityRole="link"
                            accessibilityHint="Opens your social media post in browser"
                          >
                            <Text style={styles.postLinkText}>View Post</Text>
                            <Ionicons name="open-outline" size={14} color="#8B5CF6" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: StatusBar.currentHeight || 16,
      },
      web: {
        paddingTop: 16,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  infoButton: {
    padding: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#8B5CF6',
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryGradient: {
    padding: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 6,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
    marginBottom: 20,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cashbackBadge: {
    backgroundColor: '#10B981',
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  orderDropdown: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  orderSelectButton: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  orderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  orderTextActive: {
    color: '#8B5CF6',
  },
  orderAmount: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  noOrdersContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  noOrdersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
  },
  noOrdersSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  stepsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  platformsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  platformButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  platformButtonActive: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  platformName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  historyLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  postsContainer: {
    gap: 12,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postPlatform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postPlatformName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  postStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  postStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  postDate: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  postOrderNumber: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  postCashback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postCashbackAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  postLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
  },
});
