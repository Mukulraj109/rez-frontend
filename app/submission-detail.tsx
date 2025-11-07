import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
  Animated,
  Dimensions,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { showAlert } from '@/utils/alert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProjectSubmission {
  _id: string;
  user: string | { _id: string };
  submittedAt: string;
  content: {
    type: 'text' | 'image' | 'video' | 'rating' | 'checkin' | 'receipt';
    data: string | string[];
    metadata?: any;
  };
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
  qualityScore?: number;
  paidAmount?: number;
  paidAt?: string;
  rejectionReason?: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  reward: {
    amount: number;
    currency: string;
  };
}

export default function SubmissionDetailPage() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { state: authState } = useAuth();
  const submissionId = params.submissionId as string;
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [submission, setSubmission] = useState<ProjectSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Hide the default navigation header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    loadSubmission();
  }, [submissionId, projectId]);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      
      // Fetch project with submissions
      const response = await apiClient.get<{ project: Project & { submissions?: ProjectSubmission[] } }>(
        `/projects/${projectId}`
      );

      if (response.success && response.data) {
        const projectData = response.data.project || response.data as any;
        setProject(projectData);

        // Find the specific submission
        if (projectData.submissions) {
          const foundSubmission = projectData.submissions.find(
            (sub: ProjectSubmission) => sub._id === submissionId
          );
          
          if (foundSubmission) {
            setSubmission(foundSubmission);
            
            Animated.parallel([
              Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
              Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]).start();
          } else {
            showAlert('Error', 'Submission not found');
            router.back();
          }
        } else {
          showAlert('Error', 'Submission not found');
          router.back();
        }
      } else {
        throw new Error('Failed to load submission');
      }
    } catch (error) {
      console.error('❌ [SUBMISSION DETAIL] Error loading submission:', error);
      showAlert('Error', 'Failed to load submission details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      case 'under_review':
        return '#F59E0B';
      case 'pending':
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'under_review':
        return 'Under Review';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  const renderContent = () => {
    if (!submission) return null;

    const { content } = submission;

    switch (content.type) {
      case 'text':
        return (
          <View style={styles.contentContainer}>
            <ThemedText style={styles.contentLabel}>Submission Content</ThemedText>
            <View style={styles.textContentContainer}>
              <ThemedText style={styles.textContent}>
                {typeof content.data === 'string' ? content.data : content.data.join('\n')}
              </ThemedText>
            </View>
            {content.metadata?.wordCount && (
              <ThemedText style={styles.metadataText}>
                Word count: {content.metadata.wordCount}
              </ThemedText>
            )}
          </View>
        );

      case 'image':
        const imageUrls = Array.isArray(content.data) ? content.data : [content.data];
        return (
          <View style={styles.contentContainer}>
            <ThemedText style={styles.contentLabel}>Submitted Photos ({imageUrls.length})</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
              {imageUrls.map((url, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: url }} style={styles.submissionImage} resizeMode="cover" />
                </View>
              ))}
            </ScrollView>
            {content.metadata?.imageCount && (
              <ThemedText style={styles.metadataText}>
                {content.metadata.imageCount} photo(s) submitted
              </ThemedText>
            )}
          </View>
        );

      case 'video':
        const videoUrl = typeof content.data === 'string' ? content.data : content.data[0];
        return (
          <View style={styles.contentContainer}>
            <ThemedText style={styles.contentLabel}>Submitted Video</ThemedText>
            <View style={styles.videoContainer}>
              <Image 
                source={{ uri: content.metadata?.uploadedVideo?.thumbnailUrl || videoUrl }} 
                style={styles.videoThumbnail} 
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => {
                  if (Platform.OS === 'web') {
                    window.open(videoUrl, '_blank');
                  } else {
                    Linking.openURL(videoUrl);
                  }
                }}
              >
                <Ionicons name="play-circle" size={60} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            {content.metadata?.uploadedVideo?.duration && (
              <ThemedText style={styles.metadataText}>
                Duration: {content.metadata.uploadedVideo.duration}s
              </ThemedText>
            )}
          </View>
        );

      case 'rating':
        const rating = parseInt(typeof content.data === 'string' ? content.data : content.data[0] || '0');
        return (
          <View style={styles.contentContainer}>
            <ThemedText style={styles.contentLabel}>Rating</ThemedText>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color={star <= rating ? '#F59E0B' : '#D1D5DB'}
                />
              ))}
            </View>
            <ThemedText style={styles.ratingText}>{rating} out of 5 stars</ThemedText>
            {content.metadata?.rating && (
              <ThemedText style={styles.metadataText}>
                Additional comments available
              </ThemedText>
            )}
          </View>
        );

      case 'checkin':
        return (
          <View style={styles.contentContainer}>
            <ThemedText style={styles.contentLabel}>Check-In Details</ThemedText>
            {content.metadata?.location && (
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={20} color="#10B981" />
                <ThemedText style={styles.locationText}>
                  {content.metadata.locationName || 
                   `${content.metadata.location[1].toFixed(4)}, ${content.metadata.location[0].toFixed(4)}`}
                </ThemedText>
              </View>
            )}
            {typeof content.data === 'string' && content.data.trim() && (
              <View style={styles.textContentContainer}>
                <ThemedText style={styles.textContent}>{content.data}</ThemedText>
              </View>
            )}
            {content.metadata?.uploadedImages && content.metadata.uploadedImages.length > 0 && (
              <View style={styles.checkinImagesContainer}>
                <ThemedText style={styles.contentLabel}>Check-In Photos</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
                  {content.metadata.uploadedImages.map((img: any, index: number) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri: img.url }} style={styles.submissionImage} resizeMode="cover" />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        );

      default:
        return (
          <View style={styles.contentContainer}>
            <ThemedText style={styles.contentLabel}>Submission Content</ThemedText>
            <ThemedText style={styles.textContent}>
              {typeof content.data === 'string' ? content.data : JSON.stringify(content.data)}
            </ThemedText>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <ThemedText style={styles.loadingText}>Loading submission...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!submission || !project) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <ThemedText style={styles.errorText}>Submission not found</ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.backButtonGradient}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Submission Details</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Status Badge */}
          <View style={styles.statusSection}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(submission.status) }]}>
              <Ionicons
                name={
                  submission.status === 'approved' ? 'checkmark-circle' :
                  submission.status === 'rejected' ? 'close-circle' :
                  submission.status === 'under_review' ? 'time' :
                  'hourglass'
                }
                size={20}
                color="#FFFFFF"
              />
              <ThemedText style={styles.statusBadgeText}>
                {getStatusLabel(submission.status)}
              </ThemedText>
            </View>
            <ThemedText style={styles.submittedDate}>
              Submitted {formatDate(submission.submittedAt)}
            </ThemedText>
          </View>

          {/* Project Info */}
          <View style={styles.projectInfoContainer}>
            <ThemedText style={styles.projectInfoLabel}>Project</ThemedText>
            <ThemedText style={styles.projectTitle}>{project.title}</ThemedText>
            <View style={styles.rewardContainer}>
              <Ionicons name="cash" size={16} color="#10B981" />
              <ThemedText style={styles.rewardText}>
                Reward: ₹{project.reward?.amount || 0}
              </ThemedText>
            </View>
          </View>

          {/* Submission Content */}
          {renderContent()}

          {/* Review Feedback */}
          {submission.reviewComments && (
            <View style={styles.reviewSection}>
              <ThemedText style={styles.sectionTitle}>Review Feedback</ThemedText>
              <View style={styles.reviewCommentsContainer}>
                <ThemedText style={styles.reviewCommentsText}>
                  {submission.reviewComments}
                </ThemedText>
              </View>
            </View>
          )}

          {/* Quality Score */}
          {submission.qualityScore && (
            <View style={styles.qualitySection}>
              <ThemedText style={styles.sectionTitle}>Quality Score</ThemedText>
              <View style={styles.qualityScoreContainer}>
                <ThemedText style={styles.qualityScoreValue}>
                  {submission.qualityScore}/10
                </ThemedText>
                <View style={styles.qualityScoreBar}>
                  <View
                    style={[
                      styles.qualityScoreFill,
                      { width: `${(submission.qualityScore / 10) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Payment Info */}
          {submission.paidAmount && submission.paidAmount > 0 && (
            <View style={styles.paymentSection}>
              <ThemedText style={styles.sectionTitle}>Payment</ThemedText>
              <View style={styles.paymentContainer}>
                <Ionicons name="cash" size={24} color="#10B981" />
                <View style={styles.paymentInfo}>
                  <ThemedText style={styles.paymentAmount}>
                    ₹{submission.paidAmount}
                  </ThemedText>
                  {submission.paidAt && (
                    <ThemedText style={styles.paymentDate}>
                      Paid on {formatDate(submission.paidAt)}
                    </ThemedText>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Rejection Reason */}
          {submission.status === 'rejected' && submission.rejectionReason && (
            <View style={styles.rejectionSection}>
              <ThemedText style={styles.sectionTitle}>Rejection Reason</ThemedText>
              <View style={styles.rejectionContainer}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <ThemedText style={styles.rejectionText}>
                  {submission.rejectionReason}
                </ThemedText>
              </View>
            </View>
          )}
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  statusSection: {
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 8,
  },
  statusBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  submittedDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  projectInfoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  projectInfoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contentLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textContentContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  textContent: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 24,
  },
  metadataText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  imageScrollView: {
    marginVertical: 8,
  },
  imageWrapper: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submissionImage: {
    width: SCREEN_WIDTH * 0.7,
    height: 300,
    backgroundColor: '#F3F4F6',
  },
  videoContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  videoThumbnail: {
    width: '100%',
    height: 300,
    backgroundColor: '#F3F4F6',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -30,
    marginLeft: -30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 16,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#059669',
    flex: 1,
  },
  checkinImagesContainer: {
    marginTop: 16,
  },
  reviewSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
  },
  reviewCommentsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  reviewCommentsText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 24,
  },
  qualitySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  qualityScoreContainer: {
    marginTop: 8,
  },
  qualityScoreValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#7C3AED',
    marginBottom: 12,
  },
  qualityScoreBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  qualityScoreFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 4,
  },
  paymentSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    gap: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  rejectionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rejectionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    gap: 12,
  },
  rejectionText: {
    flex: 1,
    fontSize: 15,
    color: '#991B1B',
    lineHeight: 22,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C3AED',
    marginTop: 16,
  },
});


