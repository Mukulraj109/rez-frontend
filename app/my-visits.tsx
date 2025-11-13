import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import storeVisitApi from '@/services/storeVisitApi';
import { useAuth } from '@/contexts/AuthContext';
import { showAlert } from '@/components/common/CrossPlatformAlert';

interface Visit {
  id: string;
  visitNumber: string;
  visitDate: string;
  visitTime: string;
  store: {
    id: string;
    name: string;
    logo?: string;
  };
  status: 'pending' | 'checked_in' | 'completed' | 'cancelled';
}

export default function MyVisitsPage() {
  const router = useRouter();
  const { state: { isAuthenticated, isLoading } } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    // Wait for auth state to be loaded before checking
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      showAlert(
        'Login Required',
        'Please sign in to view your visits',
        [
          { text: 'Go to Login', onPress: () => router.push('/sign-in') },
          { text: 'Cancel', style: 'cancel', onPress: () => router.back() }
        ],
        'warning'
      );
      return;
    }

    loadVisits();
  }, [isAuthenticated, isLoading]);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const response = await storeVisitApi.getUserVisits();

      if (response.success && response.data) {
        // Transform backend data structure to match frontend interface
        const transformedVisits = response.data.map((visit: any) => ({
          id: visit.id || visit._id,
          visitNumber: visit.visitNumber,
          visitDate: visit.visitDate,
          visitTime: visit.visitTime,
          store: {
            id: visit.storeId?._id || visit.storeId?.id || visit.storeId,
            name: visit.storeId?.name || 'Unknown Store',
            logo: visit.storeId?.images?.[0] || visit.storeId?.logo
          },
          status: visit.status
        }));

        setVisits(transformedVisits);
      } else {
        showAlert('Error', response.message || 'Failed to load visits', undefined, 'error');
      }
    } catch (error: any) {
      console.error('Error loading visits:', error);
      showAlert('Error', 'Unable to load your visits. Please try again.', undefined, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadVisits();
  };

  const handleCancelVisit = async (visitId: string) => {
    showAlert(
      'Cancel Visit',
      'Are you sure you want to cancel this visit?',
      [
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await storeVisitApi.cancelVisit(visitId);
              if (response.success) {
                showAlert('Cancelled', 'Your visit has been cancelled', undefined, 'success');
                loadVisits(); // Reload visits
              } else {
                showAlert('Error', response.message || 'Failed to cancel visit', undefined, 'error');
              }
            } catch (error) {
              console.error('Error cancelling visit:', error);
              showAlert('Error', 'Unable to cancel visit. Please try again.', undefined, 'error');
            }
          }
        },
        { text: 'No', style: 'cancel' }
      ],
      'warning'
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#10B981'; // Green
      case 'checked_in':
        return '#3B82F6'; // Blue
      case 'completed':
        return '#6B7280'; // Gray
      case 'cancelled':
        return '#EF4444'; // Red
      default:
        return '#8B5CF6'; // Purple
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'pending':
        return 'calendar';
      case 'checked_in':
        return 'log-in';
      case 'completed':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'time';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Scheduled';
      case 'checked_in':
        return 'Checked In';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const upcomingVisits = visits.filter(v => v.status === 'pending' || v.status === 'checked_in');
  const pastVisits = visits.filter(v => v.status === 'completed' || v.status === 'cancelled');
  const displayedVisits = activeTab === 'upcoming' ? upcomingVisits : pastVisits;

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Visits</Text>
          </LinearGradient>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading your visits...</Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Visits</Text>
        <TouchableOpacity onPress={loadVisits} style={styles.refreshButton}>
          <Ionicons name="refresh" size={22} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming ({upcomingVisits.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past ({pastVisits.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Visits List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
      >
        {displayedVisits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>
              {activeTab === 'upcoming' ? 'No Upcoming Visits' : 'No Past Visits'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming'
                ? 'You haven\'t scheduled any store visits yet'
                : 'Your visit history will appear here'}
            </Text>
          </View>
        ) : (
          displayedVisits.map((visit) => (
            <View key={visit.id} style={styles.visitCard}>
              {/* Store Info */}
              <View style={styles.storeHeader}>
                <View style={styles.storeIconContainer}>
                  <Ionicons name="storefront" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{visit.store.name}</Text>
                  <Text style={styles.visitNumber}>#{visit.visitNumber}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(visit.status)}20` }]}>
                  <Ionicons name={getStatusIcon(visit.status)} size={16} color={getStatusColor(visit.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(visit.status) }]}>
                    {getStatusLabel(visit.status)}
                  </Text>
                </View>
              </View>

              {/* Visit Details */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                  <Text style={styles.detailText}>{formatDate(visit.visitDate)}</Text>
                </View>
                {visit.visitTime && (
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={18} color="#6B7280" />
                    <Text style={styles.detailText}>{visit.visitTime}</Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              {(visit.status === 'pending' || visit.status === 'checked_in') && (
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelVisit(visit.id)}
                  >
                    <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                    <Text style={styles.cancelButtonText}>Cancel Visit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 16,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  visitCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  storeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  visitNumber: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  actionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
});
