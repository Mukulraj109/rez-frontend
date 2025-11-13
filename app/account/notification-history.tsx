import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import notificationService from '../../services/notificationService';

interface NotificationHistoryItem {
  id: string;
  title: string;
  message: string;
  type: 'push' | 'email' | 'sms' | 'inapp';
  timestamp: string;
  read: boolean;
  category: string;
}

export default function NotificationHistoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);

  useEffect(() => {
    loadNotificationHistory();
  }, []);

  const loadNotificationHistory = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications({ limit: 50 });

      if (response.success && response.data) {
        // Transform backend data to frontend format
        const transformedNotifications: NotificationHistoryItem[] = response.data.notifications.map((notification: any) => ({
          id: notification._id,
          title: notification.title,
          message: notification.message,
          type: getNotificationTypeFromChannels(notification.deliveryChannels),
          timestamp: notification.createdAt,
          read: notification.isRead,
          category: notification.category
        }));

        setNotifications(transformedNotifications);
      } else {
        console.warn('Failed to load notification history:', response.error);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notification history:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationTypeFromChannels = (channels: string[]): 'push' | 'email' | 'sms' | 'inapp' => {
    // Determine the primary channel type based on delivery channels
    if (channels.includes('push')) return 'push';
    if (channels.includes('email')) return 'email';
    if (channels.includes('sms')) return 'sms';
    return 'inapp';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotificationHistory();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'push':
        return 'notifications';
      case 'email':
        return 'mail';
      case 'sms':
        return 'chatbox';
      case 'inapp':
        return 'phone-portrait';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'push':
        return '#3B82F6';
      case 'email':
        return '#10B981';
      case 'sms':
        return '#F59E0B';
      case 'inapp':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'order':
        return '#3B82F6';
      case 'delivery':
        return '#10B981';
      case 'payment':
        return '#F59E0B';
      case 'promotion':
        return '#EF4444';
      case 'security':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead([notificationId]);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAllAsRead(true);
      await notificationService.markAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotificationItem = (item: NotificationHistoryItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.notificationItem}
      onPress={() => !item.read && markNotificationAsRead(item.id)}
      accessibilityLabel={`${item.read ? 'Read' : 'Unread'} notification from ${item.category}: ${item.title}. ${item.message}. ${formatDate(item.timestamp)}`}
      accessibilityRole="button"
      accessibilityHint={!item.read ? "Double tap to mark as read" : "Notification already read"}
      accessibilityState={{ disabled: item.read }}
    >
      <View style={styles.notificationIcon}>
        <Ionicons 
          name={getNotificationIcon(item.type) as any} 
          size={20} 
          color={getNotificationColor(item.type)} 
        />
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.notificationTime}>
            {formatDate(item.timestamp)}
          </Text>
        </View>
        
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        
        <View style={styles.notificationFooter}>
          <View style={[styles.categoryBadge, { backgroundColor: `${getCategoryColor(item.category)}20` }]}>
            <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </Text>
          </View>
          
          {!item.read && <View style={styles.unreadDot} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View
        style={styles.loadingContainer}
        accessibilityLabel="Loading notification history"
        accessibilityRole="progressbar"
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading notification history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityHint="Returns to previous screen"
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notification History</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadCount}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
            disabled={markingAllAsRead}
            accessibilityLabel="Mark all notifications as read"
            accessibilityRole="button"
            accessibilityHint="Double tap to mark all notifications as read"
            accessibilityState={{ disabled: markingAllAsRead }}
          >
            {markingAllAsRead ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <Text style={styles.markAllText}>Mark All Read</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length > 0 ? (
          notifications.map(renderNotificationItem)
        ) : (
          <View
            style={styles.emptyContainer}
            accessibilityLabel="No notifications. You haven't received any notifications yet."
            accessibilityRole="text"
          >
            <Ionicons name="notifications-off" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>
              You haven't received any notifications yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  unreadCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  notificationTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
