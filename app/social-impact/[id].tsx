import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Linking,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import socialImpactApi, { SocialImpactEvent } from '@/services/socialImpactApi';

// ReZ Brand Colors
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00A159',
  white: '#FFFFFF',
  textDark: '#1A1A2E',
  textMuted: '#6B7280',
  background: '#F9FAFB',
  border: 'rgba(0, 0, 0, 0.08)',
};

// Helper function for event type icon background colors
const getEventTypeIconBg = (eventType?: string): string => {
  const bgMap: Record<string, string> = {
    'blood-donation': 'rgba(239, 68, 68, 0.15)',
    'tree-plantation': 'rgba(16, 185, 129, 0.15)',
    'beach-cleanup': 'rgba(59, 130, 246, 0.15)',
    'digital-literacy': 'rgba(99, 102, 241, 0.15)',
    'food-drive': 'rgba(249, 115, 22, 0.15)',
    'health-camp': 'rgba(6, 182, 212, 0.15)',
    'skill-training': 'rgba(236, 72, 153, 0.15)',
    'women-empowerment': 'rgba(236, 72, 153, 0.15)',
    'education': 'rgba(99, 102, 241, 0.15)',
    'environment': 'rgba(16, 185, 129, 0.15)',
  };
  return bgMap[eventType || ''] || 'rgba(139, 92, 246, 0.15)';
};

// Helper function for event type emoji
const getEventTypeEmoji = (eventType?: string): string => {
  const emojiMap: Record<string, string> = {
    'blood-donation': '🩸',
    'tree-plantation': '🌳',
    'beach-cleanup': '🏖️',
    'digital-literacy': '💻',
    'food-drive': '🍛',
    'health-camp': '🏥',
    'skill-training': '👩‍💼',
    'women-empowerment': '👩‍💼',
    'education': '📚',
    'environment': '🌍',
  };
  return emojiMap[eventType || ''] || '✨';
};

// Format event time for display
const formatEventTime = (eventTime?: { start: string; end: string }): string => {
  if (!eventTime) return 'TBD';
  return `${eventTime.start} - ${eventTime.end}`;
};

// Format date for display
const formatEventDate = (dateString?: string): string => {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function SocialImpactEventDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // State
  const [event, setEvent] = useState<SocialImpactEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalState, setModalState] = useState<'loading' | 'success' | 'error'>('loading');
  const [modalMessage, setModalMessage] = useState('');

  // Fetch event data
  const fetchEvent = useCallback(async (isRefresh = false) => {
    if (!id) return;

    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const response = await socialImpactApi.getEventById(id);

      if (response.success && response.data) {
        setEvent(response.data);
      } else {
        setError('Event not found');
      }
    } catch (err: any) {
      console.error('Error fetching event:', err);
      setError(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  // Initial fetch
  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvent(true);
  }, [fetchEvent]);

  // Handle registration
  const handleRegister = async () => {
    if (!id || !event) return;

    setShowModal(true);
    setModalState('loading');
    setModalMessage('Processing your registration...');
    setActionLoading(true);

    try {
      const response = await socialImpactApi.registerForEvent(id);

      if (response.success) {
        setModalState('success');
        setModalMessage('Registration successful!');
        // Update local state
        setEvent(prev => prev ? {
          ...prev,
          isEnrolled: true,
          enrollmentStatus: 'registered',
          capacity: prev.capacity ? {
            ...prev.capacity,
            enrolled: prev.capacity.enrolled + 1
          } : undefined
        } : null);

        // Close modal after delay
        setTimeout(() => {
          setShowModal(false);
        }, 1500);
      } else {
        setModalState('error');
        setModalMessage(response.message || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setModalState('error');
      setModalMessage(err.message || 'Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle cancel registration
  const handleCancelRegistration = () => {
    Alert.alert(
      'Cancel Registration',
      'Are you sure you want to cancel your registration for this event?',
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            if (!id || !event) return;

            setShowModal(true);
            setModalState('loading');
            setModalMessage('Cancelling registration...');
            setActionLoading(true);

            try {
              const response = await socialImpactApi.cancelRegistration(id);

              if (response.success) {
                setModalState('success');
                setModalMessage('Registration cancelled');
                // Update local state
                setEvent(prev => prev ? {
                  ...prev,
                  isEnrolled: false,
                  enrollmentStatus: undefined,
                  enrollmentId: undefined,
                  capacity: prev.capacity ? {
                    ...prev.capacity,
                    enrolled: Math.max(0, prev.capacity.enrolled - 1)
                  } : undefined
                } : null);

                setTimeout(() => {
                  setShowModal(false);
                }, 1500);
              } else {
                setModalState('error');
                setModalMessage(response.message || 'Cancellation failed');
              }
            } catch (err: any) {
              console.error('Cancel error:', err);
              setModalState('error');
              setModalMessage(err.message || 'Something went wrong');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const openMaps = () => {
    if (!event?.location?.address) return;
    const address = `${event.location.address}${event.location.city ? ', ' + event.location.city : ''}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
    });
    if (url) Linking.openURL(url);
  };

  const callPhone = () => {
    if (event?.contact?.phone) {
      Linking.openURL(`tel:${event.contact.phone}`);
    }
  };

  const sendEmail = () => {
    if (event?.contact?.email) {
      Linking.openURL(`mailto:${event.contact.email}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Loading...</Text>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading event details...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Event Not Found</Text>
            </View>
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorText}>{error || 'Event not found'}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchEvent()}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const isEventFull = event.capacity && event.capacity.enrolled >= event.capacity.goal;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle} numberOfLines={1}>{event.name}</Text>
              {event.isCsrActivity && (
                <View style={styles.csrBadge}>
                  <Text style={styles.csrBadgeText}>CSR</Text>
                </View>
              )}
            </View>
            <Text style={styles.headerSubtitle}>{event.organizer?.name || 'Unknown Organizer'}</Text>
            {event.sponsor && (
              <View style={styles.sponsorRow}>
                <Ionicons name="business" size={11} color="#8B5CF6" />
                <Text style={styles.sponsorText}>Sponsored by {event.sponsor.name}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Hero Icon */}
          <View style={[styles.heroSection, { backgroundColor: getEventTypeIconBg(event.eventType) }]}>
            <Text style={styles.heroEmoji}>{getEventTypeEmoji(event.eventType)}</Text>
            {event.isEnrolled && (
              <View style={styles.enrolledBadgeHero}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.white} />
                <Text style={styles.enrolledBadgeHeroText}>
                  {event.enrollmentStatus === 'completed' ? 'Completed' :
                   event.enrollmentStatus === 'checked_in' ? 'Checked In' : 'Enrolled'}
                </Text>
              </View>
            )}
          </View>

          {/* Quick Info */}
          <View style={styles.quickInfoGrid}>
            <View style={styles.quickInfoCard}>
              <View style={styles.quickInfoHeader}>
                <Ionicons name="calendar" size={16} color="#3B82F6" />
                <Text style={styles.quickInfoLabel}>Date</Text>
              </View>
              <Text style={styles.quickInfoValue}>{formatEventDate(event.eventDate)}</Text>
            </View>
            <View style={styles.quickInfoCard}>
              <View style={styles.quickInfoHeader}>
                <Ionicons name="time" size={16} color="#F97316" />
                <Text style={styles.quickInfoLabel}>Time</Text>
              </View>
              <Text style={styles.quickInfoValue}>{formatEventTime(event.eventTime)}</Text>
            </View>
          </View>

          {/* Location */}
          {event.location && (
            <View style={styles.sectionCard}>
              <View style={styles.locationHeader}>
                <Ionicons name="location" size={18} color="#EF4444" />
                <View style={styles.locationContent}>
                  <Text style={styles.locationTitle}>{event.location.address || 'Location'}</Text>
                  {event.location.city && (
                    <Text style={styles.locationAddress}>{event.location.city}</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity style={styles.mapsButton} onPress={openMaps}>
                <Text style={styles.mapsButtonText}>Open in Maps</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Description */}
          {event.description && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>About This Event</Text>
              <Text style={styles.descriptionText}>{event.description}</Text>
            </View>
          )}

          {/* Impact & Progress */}
          {(event.impact || event.capacity) && (
            <View style={styles.impactCard}>
              <View style={styles.impactHeader}>
                <Ionicons name="trending-up" size={18} color={COLORS.primary} />
                <Text style={styles.impactTitle}>Expected Impact</Text>
              </View>
              {event.impact?.description && (
                <Text style={styles.impactText}>{event.impact.description}</Text>
              )}
              {event.capacity && event.capacity.goal > 0 && (
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Participants</Text>
                    <Text style={styles.progressValue}>{event.capacity.enrolled}/{event.capacity.goal}</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min((event.capacity.enrolled / event.capacity.goal) * 100, 100)}%` }
                      ]}
                    />
                  </View>
                  {isEventFull && (
                    <Text style={styles.eventFullText}>This event is full</Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Rewards */}
          {event.rewards && (event.rewards.rezCoins > 0 || event.rewards.brandCoins > 0) && (
            <View style={styles.rewardsCard}>
              <View style={styles.rewardsHeader}>
                <Ionicons name="trophy" size={18} color="#F59E0B" />
                <Text style={styles.rewardsTitle}>Participation Rewards</Text>
              </View>
              {event.sponsor && (
                <Text style={styles.rewardsSubtitle}>
                  Double rewards: ReZ Coins + Brand Coins from CSR sponsor
                </Text>
              )}
              <View style={styles.rewardsGrid}>
                {event.rewards.rezCoins > 0 && (
                  <View style={styles.rewardItem}>
                    <View style={styles.rewardIconRow}>
                      <Ionicons name="wallet" size={18} color={COLORS.primary} />
                      <Text style={styles.rewardLabel}>ReZ Coins</Text>
                    </View>
                    <Text style={styles.rewardValue}>+{event.rewards.rezCoins}</Text>
                  </View>
                )}
                {event.rewards.brandCoins > 0 && event.sponsor && (
                  <View style={[styles.rewardItem, styles.rewardItemPurple]}>
                    <View style={styles.rewardIconRow}>
                      <Ionicons name="sparkles" size={18} color="#8B5CF6" />
                      <Text style={styles.rewardLabel}>Brand Coins</Text>
                    </View>
                    <Text style={[styles.rewardValue, { color: '#8B5CF6' }]}>+{event.rewards.brandCoins}</Text>
                    <Text style={styles.brandName}>{event.sponsor.brandCoinName}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Requirements */}
          {event.eventRequirements && event.eventRequirements.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="information-circle" size={18} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Requirements</Text>
              </View>
              {event.eventRequirements.map((req, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Ionicons
                    name={req.isMandatory ? "alert-circle" : "checkmark-circle"}
                    size={16}
                    color={req.isMandatory ? "#EF4444" : COLORS.primary}
                  />
                  <Text style={styles.listText}>
                    {req.text}
                    {req.isMandatory && <Text style={styles.mandatoryText}> (Required)</Text>}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Benefits */}
          {event.benefits && event.benefits.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="heart" size={18} color="#EF4444" />
                <Text style={styles.sectionTitle}>What You Get</Text>
              </View>
              {event.benefits.map((benefit, idx) => (
                <View key={idx} style={styles.listItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.listText}>{benefit}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Schedule */}
          {event.schedule && event.schedule.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Event Schedule</Text>
              {event.schedule.map((item, idx) => (
                <View key={idx} style={styles.scheduleItem}>
                  <Text style={styles.scheduleTime}>{item.time}</Text>
                  <Text style={styles.scheduleActivity}>{item.activity}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Contact */}
          {event.contact && (event.contact.phone || event.contact.email) && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Contact Organizer</Text>
              {event.contact.phone && (
                <TouchableOpacity style={styles.contactItem} onPress={callPhone}>
                  <Ionicons name="call" size={18} color={COLORS.primary} />
                  <Text style={styles.contactText}>{event.contact.phone}</Text>
                </TouchableOpacity>
              )}
              {event.contact.email && (
                <TouchableOpacity style={styles.contactItem} onPress={sendEmail}>
                  <Ionicons name="mail" size={18} color="#EF4444" />
                  <Text style={styles.contactText}>{event.contact.email}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Fixed Action Button */}
        <View style={styles.fixedButtonContainer}>
          {event.eventStatus === 'completed' ? (
            <View style={styles.completedButtonContainer}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.textMuted} />
              <Text style={styles.completedButtonText}>Event Completed</Text>
            </View>
          ) : event.isEnrolled ? (
            event.enrollmentStatus === 'completed' ? (
              <View style={styles.completedButtonContainer}>
                <Ionicons name="trophy" size={20} color="#F59E0B" />
                <Text style={styles.completedButtonText}>You completed this event!</Text>
              </View>
            ) : event.enrollmentStatus === 'checked_in' ? (
              <View style={styles.checkedInButtonContainer}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                <Text style={styles.checkedInButtonText}>Checked In - Awaiting Completion</Text>
              </View>
            ) : (
              <View style={styles.enrolledButtonsRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelRegistration}
                  disabled={actionLoading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <View style={styles.enrolledStatus}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                  <Text style={styles.enrolledStatusText}>You're Registered!</Text>
                </View>
              </View>
            )
          ) : isEventFull ? (
            <View style={styles.eventFullContainer}>
              <Ionicons name="people" size={20} color={COLORS.textMuted} />
              <Text style={styles.eventFullButtonText}>Event is Full</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={actionLoading}
            >
              <LinearGradient
                colors={[COLORS.primary, '#14B8A6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Register Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Modal */}
        <Modal visible={showModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {modalState === 'loading' ? (
                <>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.modalTitle}>{modalMessage}</Text>
                </>
              ) : modalState === 'success' ? (
                <>
                  <View style={[styles.modalIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Ionicons name="checkmark-circle" size={48} color={COLORS.primary} />
                  </View>
                  <Text style={styles.modalTitle}>{modalMessage}</Text>
                </>
              ) : (
                <>
                  <View style={[styles.modalIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <Ionicons name="close-circle" size={48} color="#EF4444" />
                  </View>
                  <Text style={styles.modalTitle}>{modalMessage}</Text>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setShowModal(false)}
                  >
                    <Text style={styles.modalButtonText}>OK</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
  },
  csrBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  csrBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#3B82F6',
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sponsorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  sponsorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  shareButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
  },
  heroSection: {
    height: 140,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  heroEmoji: {
    fontSize: 72,
  },
  enrolledBadgeHero: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  enrolledBadgeHeroText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  quickInfoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickInfoCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  quickInfoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  quickInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  locationContent: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  mapsButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  mapsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  impactCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  impactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  impactText: {
    fontSize: 13,
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  progressSection: {},
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  progressValue: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  eventFullText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 8,
    fontWeight: '500',
  },
  rewardsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  rewardsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  rewardsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  rewardsSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  rewardsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardItem: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  rewardItemPurple: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  rewardIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  rewardLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  rewardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  brandName: {
    fontSize: 10,
    color: '#8B5CF6',
    marginTop: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginTop: 6,
  },
  listText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  mandatoryText: {
    color: '#EF4444',
    fontWeight: '500',
  },
  scheduleItem: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  scheduleTime: {
    width: 70,
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  scheduleActivity: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 13,
    color: '#3B82F6',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  registerButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  completedButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingVertical: 16,
    borderRadius: 14,
  },
  completedButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  checkedInButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  checkedInButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  enrolledButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  enrolledStatus: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  enrolledStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  eventFullContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingVertical: 16,
    borderRadius: 14,
  },
  eventFullButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 32,
    minWidth: 200,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    marginTop: 12,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});
