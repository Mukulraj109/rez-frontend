// My Services Page
// Shows user's service bookings or video projects (as service-like feature)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import projectsService from '@/services/realProjectsApi';
import { useAuth } from '@/contexts/AuthContext';

interface ServiceProject {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'pending' | 'cancelled';
  createdAt: string;
  reward: number;
  type: 'video' | 'content' | 'review';
}

const MyServicesPage = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { state: authState } = useAuth();
  const [projects, setProjects] = useState<ServiceProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleBackPress = useCallback(() => {
    // Always go to profile page to avoid "no page exists" error
    router.push('/profile' as any);
  }, [router]);

  const mapSubmissionStatus = (status: string): 'active' | 'completed' | 'pending' | 'cancelled' => {
    const statusMap: Record<string, 'active' | 'completed' | 'pending' | 'cancelled'> = {
      'approved': 'completed',
      'pending': 'pending',
      'under_review': 'active',
      'rejected': 'cancelled'
    };
    return statusMap[status] || 'pending';
  };

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);

      // Wait for auth to be ready
      if (authState.isLoading) {
        console.log('⏳ Auth still loading, waiting...');
        return;
      }

      if (!authState.isAuthenticated || !authState.token) {
        console.log('❌ Not authenticated, cannot fetch projects');
        setProjects([]);
        setLoading(false);
        return;
      }

      // Fetch user's project submissions from API
      // Note: Backend endpoint may not be fully implemented yet
      const response = await projectsService.getMySubmissions();

      if (response.success && response.data?.submissions) {
        // Map backend submission format to frontend ServiceProject format
        const mappedProjects: ServiceProject[] = response.data.submissions.map((submission: any) => ({
          id: submission._id || submission.id,
          title: submission.project?.title || 'Untitled Project',
          description: submission.project?.description || 'No description available',
          status: mapSubmissionStatus(submission.status),
          createdAt: submission.submittedAt || submission.createdAt,
          reward: submission.paidAmount || submission.project?.reward?.amount || 0,
          type: (submission.content?.type === 'video' ? 'video' :
                 submission.content?.type === 'text' ? 'content' : 'review') as 'video' | 'content' | 'review'
        }));

        setProjects(mappedProjects);
      } else {
        console.log('No submissions in response');
        setProjects([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching projects:', error);
      console.error('❌ Error response:', error?.response?.data);
      console.error('❌ Error status:', error?.response?.status);
      console.error('❌ Full error:', JSON.stringify(error, null, 2));
      setProjects([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authState.isLoading, authState.isAuthenticated, authState.token]);

  useEffect(() => {
    // Only fetch when auth is ready
    if (!authState.isLoading && authState.isAuthenticated) {
      fetchProjects();
    }
  }, [fetchProjects, authState.isLoading, authState.isAuthenticated]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects();
  }, [fetchProjects]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'active':
        return '#3B82F6';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return 'videocam';
      case 'content':
        return 'create';
      case 'review':
        return 'star';
      default:
        return 'document';
    }
  };

  const renderProject = ({ item }: { item: ServiceProject }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => {
        // TODO: Navigate to project details
        console.log('View project:', item.id);
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: '#10B98120' }]}>
        <Ionicons name={getTypeIcon(item.type) as any} size={28} color="#10B981" />
      </View>

      <View style={styles.projectInfo}>
        <Text style={styles.projectTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.projectDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.projectMeta}>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            />
            <Text
              style={[styles.statusText, { color: getStatusColor(item.status) }]}
            >
              {getStatusText(item.status)}
            </Text>
          </View>

          <Text style={styles.rewardText}>₹{item.reward}</Text>
        </View>

        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="construct-outline" size={80} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Services Yet</Text>
      <Text style={styles.emptyText}>
        Start creating content and earning rewards
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/(tabs)/earn' as any)}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.createButtonText}>Create Content</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#10B981" />
        <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Services</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#10B981" />

      {/* Header */}
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Services</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/earn' as any)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.headerSubtitle}>
          Video projects and content creation
        </Text>
      </LinearGradient>

      {/* Projects List */}
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#10B981"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  listContainer: {
    padding: 16,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default MyServicesPage;
