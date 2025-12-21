// Admin Dashboard - Social Media Posts Review
// Allows admins to approve, reject, and credit social media posts

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';

interface SocialPost {
  _id: string;
  user: { _id: string; name: string; email: string };
  order?: { _id: string; orderNumber: string; totals: { total: number } };
  platform: 'instagram' | 'facebook' | 'twitter' | 'tiktok';
  postUrl: string;
  status: 'pending' | 'approved' | 'rejected' | 'credited';
  cashbackAmount: number;
  submittedAt: string;
  reviewedAt?: string;
  creditedAt?: string;
  rejectionReason?: string;
  submissionIp?: string;
  deviceFingerprint?: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  credited: number;
}

export default function AdminSocialMediaPosts() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    credited: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'credited'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (!authState.token) {
      router.replace('/sign-in');
      return;
    }
    apiClient.setAuthToken(authState.token);
    loadPosts();
  }, [authState.token, selectedStatus]);

  const loadPosts = async () => {
    setLoading(true);
    try {

      // Get all posts
      const params: any = { limit: 100 };
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      const response = await apiClient.get('/social-media/posts', params);
      const postsData = (response.data as any)?.posts || [];

      // Calculate stats
      const allPosts = await apiClient.get('/social-media/posts', { limit: 1000 });
      const allPostsData = (allPosts.data as any)?.posts || [];

      setStats({
        total: allPostsData.length,
        pending: allPostsData.filter((p: SocialPost) => p.status === 'pending').length,
        approved: allPostsData.filter((p: SocialPost) => p.status === 'approved').length,
        rejected: allPostsData.filter((p: SocialPost) => p.status === 'rejected').length,
        credited: allPostsData.filter((p: SocialPost) => p.status === 'credited').length,
      });

      setPosts(postsData);

    } catch (error: any) {
      console.error('❌ [ADMIN] Error loading posts:', error);
      Alert.alert('Error', 'Failed to load posts. ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId: string) => {
    setActionLoading(postId);
    try {

      await apiClient.patch(`/social-media/posts/${postId}/status`, {
        status: 'approved'
      });

      Alert.alert('Success', 'Post approved successfully!', [
        { text: 'OK', onPress: loadPosts }
      ]);
    } catch (error: any) {
      console.error('❌ [ADMIN] Error approving post:', error);
      Alert.alert('Error', 'Failed to approve post. ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (post: SocialPost) => {
    setSelectedPost(post);
    setRejectionModalVisible(true);
  };

  const submitRejection = async () => {
    if (!selectedPost) return;

    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      return;
    }

    setActionLoading(selectedPost._id);
    try {

      await apiClient.patch(`/social-media/posts/${selectedPost._id}/status`, {
        status: 'rejected',
        rejectionReason: rejectionReason.trim()
      });

      setRejectionModalVisible(false);
      setRejectionReason('');
      setSelectedPost(null);

      Alert.alert('Success', 'Post rejected successfully!', [
        { text: 'OK', onPress: loadPosts }
      ]);
    } catch (error: any) {
      console.error('❌ [ADMIN] Error rejecting post:', error);
      Alert.alert('Error', 'Failed to reject post. ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCredit = async (postId: string, cashbackAmount: number) => {
    Alert.alert(
      'Credit Cashback',
      `Credit ₹${cashbackAmount} cashback to user's wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Credit',
          style: 'default',
          onPress: async () => {
            setActionLoading(postId);
            try {

              await apiClient.patch(`/social-media/posts/${postId}/status`, {
                status: 'credited'
              });

              Alert.alert('Success', `₹${cashbackAmount} credited successfully!`, [
                { text: 'OK', onPress: loadPosts }
              ]);
            } catch (error: any) {
              console.error('❌ [ADMIN] Error crediting cashback:', error);
              Alert.alert('Error', 'Failed to credit cashback. ' + (error.response?.data?.message || error.message));
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: SocialPost['status']) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      case 'credited': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'logo-instagram';
      case 'facebook': return 'logo-facebook';
      case 'twitter': return 'logo-twitter';
      case 'tiktok': return 'musical-notes';
      default: return 'link';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return '#E4405F';
      case 'facebook': return '#1877F2';
      case 'twitter': return '#1DA1F2';
      case 'tiktok': return '#000000';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.header}
        accessibilityRole="header"
        accessibilityLabel="Admin Social Media Posts Dashboard"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityHint="Returns to previous screen"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Social Media Posts</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadPosts}
          accessibilityLabel="Refresh posts"
          accessibilityRole="button"
          accessibilityHint="Double tap to reload all social media posts"
        >
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats */}
      <View
        style={styles.statsContainer}
        accessibilityRole="summary"
        accessibilityLabel={`Post statistics: ${stats.total} total, ${stats.pending} pending, ${stats.approved} approved, ${stats.credited} credited, ${stats.rejected} rejected`}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          accessibilityLabel="Filter posts by status"
        >
          <TouchableOpacity
            style={[styles.statCard, selectedStatus === 'all' && styles.statCardActive]}
            onPress={() => setSelectedStatus('all')}
            accessibilityRole="button"
            accessibilityLabel={`All posts: ${stats.total}`}
            accessibilityHint="Double tap to show all posts"
            accessibilityState={{ selected: selectedStatus === 'all' }}
          >
            <Text style={[styles.statValue, selectedStatus === 'all' && styles.statValueActive]}>
              {stats.total}
            </Text>
            <Text style={[styles.statLabel, selectedStatus === 'all' && styles.statLabelActive]}>
              Total
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, selectedStatus === 'pending' && styles.statCardActive]}
            onPress={() => setSelectedStatus('pending')}
            accessibilityRole="button"
            accessibilityLabel={`Pending posts: ${stats.pending}`}
            accessibilityHint="Double tap to show pending posts requiring review"
            accessibilityState={{ selected: selectedStatus === 'pending' }}
          >
            <Text style={[styles.statValue, selectedStatus === 'pending' && styles.statValueActive]}>
              {stats.pending}
            </Text>
            <Text style={[styles.statLabel, selectedStatus === 'pending' && styles.statLabelActive]}>
              Pending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, selectedStatus === 'approved' && styles.statCardActive]}
            onPress={() => setSelectedStatus('approved')}
            accessibilityRole="button"
            accessibilityLabel={`Approved posts: ${stats.approved}`}
            accessibilityHint="Double tap to show approved posts awaiting credit"
            accessibilityState={{ selected: selectedStatus === 'approved' }}
          >
            <Text style={[styles.statValue, selectedStatus === 'approved' && styles.statValueActive]}>
              {stats.approved}
            </Text>
            <Text style={[styles.statLabel, selectedStatus === 'approved' && styles.statLabelActive]}>
              Approved
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, selectedStatus === 'credited' && styles.statCardActive]}
            onPress={() => setSelectedStatus('credited')}
            accessibilityRole="button"
            accessibilityLabel={`Credited posts: ${stats.credited}`}
            accessibilityHint="Double tap to show posts with credited cashback"
            accessibilityState={{ selected: selectedStatus === 'credited' }}
          >
            <Text style={[styles.statValue, selectedStatus === 'credited' && styles.statValueActive]}>
              {stats.credited}
            </Text>
            <Text style={[styles.statLabel, selectedStatus === 'credited' && styles.statLabelActive]}>
              Credited
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, selectedStatus === 'rejected' && styles.statCardActive]}
            onPress={() => setSelectedStatus('rejected')}
            accessibilityRole="button"
            accessibilityLabel={`Rejected posts: ${stats.rejected}`}
            accessibilityHint="Double tap to show rejected posts"
            accessibilityState={{ selected: selectedStatus === 'rejected' }}
          >
            <Text style={[styles.statValue, selectedStatus === 'rejected' && styles.statValueActive]}>
              {stats.rejected}
            </Text>
            <Text style={[styles.statLabel, selectedStatus === 'rejected' && styles.statLabelActive]}>
              Rejected
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Posts List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        accessibilityLabel={`${posts.length} ${selectedStatus} social media posts`}
      >
        {loading ? (
          <View
            style={styles.loadingContainer}
            accessibilityLabel="Loading posts"
            accessibilityRole="progressbar"
          >
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View
            style={styles.emptyContainer}
            accessibilityRole="text"
            accessibilityLabel={selectedStatus === 'all' ? 'No submissions yet' : `No ${selectedStatus} posts found`}
          >
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Posts Found</Text>
            <Text style={styles.emptyText}>
              {selectedStatus === 'all' ? 'No submissions yet' : `No ${selectedStatus} posts`}
            </Text>
          </View>
        ) : (
          posts.map((post) => (
            <View
              key={post._id}
              style={styles.postCard}
              accessibilityRole="article"
              accessibilityLabel={`${post.platform} post from ${post.user.name}, status: ${post.status}, cashback: ${post.cashbackAmount} rupees`}
            >
              {/* Post Header */}
              <View
                style={styles.postHeader}
                accessibilityRole="header"
              >
                <View
                  style={styles.postPlatform}
                  accessibilityLabel={`Platform: ${post.platform}`}
                >
                  <Ionicons
                    name={getPlatformIcon(post.platform) as any}
                    size={20}
                    color={getPlatformColor(post.platform)}
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
                  accessibilityRole="text"
                  accessibilityLabel={`Status: ${post.status}`}
                >
                  <Text style={[styles.postStatusText, { color: getStatusColor(post.status) }]}>
                    {post.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* User Info */}
              <View
                style={styles.userInfo}
                accessibilityRole="text"
                accessibilityLabel={`User: ${post.user.name}, Email: ${post.user.email}`}
              >
                <Ionicons name="person-circle" size={20} color="#6B7280" />
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{post.user.name}</Text>
                  <Text style={styles.userEmail}>{post.user.email}</Text>
                </View>
              </View>

              {/* Order Info */}
              {post.order && (
                <View
                  style={styles.orderInfo}
                  accessibilityRole="text"
                  accessibilityLabel={`Order number ${post.order.orderNumber}, total amount ${post.order.totals.total} rupees`}
                >
                  <Ionicons name="receipt" size={16} color="#8B5CF6" />
                  <Text style={styles.orderText}>
                    Order #{post.order.orderNumber} • ₹{post.order.totals.total}
                  </Text>
                </View>
              )}

              {/* Post URL */}
              <TouchableOpacity
                style={styles.postUrlContainer}
                onPress={() => Linking.openURL(post.postUrl)}
                accessibilityRole="link"
                accessibilityLabel={`Open post URL: ${post.postUrl}`}
                accessibilityHint="Double tap to open in browser"
              >
                <Ionicons name="link" size={16} color="#6B7280" />
                <Text style={styles.postUrl} numberOfLines={1}>
                  {post.postUrl}
                </Text>
                <Ionicons name="open-outline" size={16} color="#8B5CF6" />
              </TouchableOpacity>

              {/* Metadata */}
              <View
                style={styles.metadata}
                accessibilityRole="summary"
                accessibilityLabel={`Submitted on ${formatDate(post.submittedAt)}, Cashback amount: ${post.cashbackAmount} rupees${post.submissionIp ? `, IP address: ${post.submissionIp}` : ''}`}
              >
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Submitted:</Text>
                  <Text style={styles.metaValue}>{formatDate(post.submittedAt)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Cashback:</Text>
                  <Text style={[styles.metaValue, { color: '#10B981', fontWeight: '700' }]}>
                    ₹{post.cashbackAmount}
                  </Text>
                </View>
                {post.submissionIp && (
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>IP:</Text>
                    <Text style={styles.metaValue}>{post.submissionIp}</Text>
                  </View>
                )}
              </View>

              {/* Rejection Reason */}
              {post.rejectionReason && (
                <View
                  style={styles.rejectionBox}
                  accessibilityRole="alert"
                  accessibilityLabel={`Rejection reason: ${post.rejectionReason}`}
                >
                  <Ionicons name="alert-circle" size={16} color="#EF4444" />
                  <Text style={styles.rejectionText}>{post.rejectionReason}</Text>
                </View>
              )}

              {/* Actions */}
              {post.status === 'pending' && (
                <View
                  style={styles.actions}
                  accessibilityRole="toolbar"
                  accessibilityLabel="Post review actions"
                >
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApprove(post._id)}
                    disabled={actionLoading === post._id}
                    accessibilityRole="button"
                    accessibilityLabel={`Approve post from ${post.user.name}`}
                    accessibilityHint="Double tap to approve this social media post"
                    accessibilityState={{ disabled: actionLoading === post._id }}
                  >
                    {actionLoading === post._id ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={18} color="white" />
                        <Text style={styles.actionButtonText}>Approve</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(post)}
                    disabled={actionLoading === post._id}
                    accessibilityRole="button"
                    accessibilityLabel={`Reject post from ${post.user.name}`}
                    accessibilityHint="Double tap to reject this post with a reason"
                    accessibilityState={{ disabled: actionLoading === post._id }}
                  >
                    <Ionicons name="close-circle" size={18} color="white" />
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              {post.status === 'approved' && (
                <View
                  style={styles.actions}
                  accessibilityRole="toolbar"
                  accessibilityLabel="Cashback credit action"
                >
                  <TouchableOpacity
                    style={[styles.actionButton, styles.creditButton]}
                    onPress={() => handleCredit(post._id, post.cashbackAmount)}
                    disabled={actionLoading === post._id}
                    accessibilityRole="button"
                    accessibilityLabel={`Credit ${post.cashbackAmount} rupees cashback to ${post.user.name}`}
                    accessibilityHint="Double tap to credit cashback to user's wallet. Requires confirmation"
                    accessibilityState={{ disabled: actionLoading === post._id }}
                  >
                    {actionLoading === post._id ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Ionicons name="cash" size={18} color="white" />
                        <Text style={styles.actionButtonText}>
                          Credit ₹{post.cashbackAmount}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Rejection Modal */}
      <Modal
        visible={rejectionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRejectionModalVisible(false)}
        accessibilityViewIsModal
        accessibilityLabel="Reject post modal"
      >
        <View
          style={styles.modalOverlay}
          accessibilityRole="none"
        >
          <View
            style={styles.modalContent}
            accessibilityRole="dialog"
            accessibilityLabel="Reject post form"
          >
            <View
              style={styles.modalHeader}
              accessibilityRole="header"
            >
              <Text style={styles.modalTitle}>Reject Post</Text>
              <TouchableOpacity
                onPress={() => setRejectionModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close rejection modal"
                accessibilityHint="Double tap to cancel and close this dialog"
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text
              style={styles.modalLabel}
              accessibilityRole="text"
            >
              Rejection Reason
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter reason for rejection..."
              placeholderTextColor="#9CA3AF"
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              accessibilityLabel="Rejection reason input"
              accessibilityHint="Enter the reason why you are rejecting this post"
              accessibilityRole="none"
            />

            <TouchableOpacity
              style={[styles.modalButton, !rejectionReason.trim() && styles.modalButtonDisabled]}
              onPress={submitRejection}
              disabled={!rejectionReason.trim() || !!actionLoading}
              accessibilityRole="button"
              accessibilityLabel="Submit rejection"
              accessibilityHint="Double tap to reject the post with the provided reason"
              accessibilityState={{ disabled: !rejectionReason.trim() || !!actionLoading }}
            >
              {actionLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.modalButtonText}>Submit Rejection</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  refreshButton: {
    padding: 8,
  },
  statsContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  statCardActive: {
    backgroundColor: '#8B5CF6',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statValueActive: {
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  statLabelActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    paddingVertical: 60,
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
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  orderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  postUrlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  postUrl: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
  },
  metadata: {
    gap: 6,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  rejectionBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  rejectionText: {
    flex: 1,
    fontSize: 13,
    color: '#EF4444',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  creditButton: {
    backgroundColor: '#8B5CF6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
