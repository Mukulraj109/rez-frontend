import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@/utils/apiClient';

// Types
interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

interface PushToken {
  token: string;
  type: 'expo' | 'apns' | 'fcm';
}

interface NotificationPermissions {
  status: Notifications.PermissionStatus;
  canAskAgain: boolean;
  granted: boolean;
}

// Storage keys
const STORAGE_KEYS = {
  PUSH_TOKEN: 'push_notification_token',
  NOTIFICATION_SETTINGS: 'notification_settings',
  LAST_TOKEN_SYNC: 'last_token_sync',
};

// Default notification settings
const defaultSettings = {
  enabled: true,
  sound: true,
  badge: true,
  alert: true,
  offers: true,
  orders: true,
  promotions: true,
  reminders: true,
};

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private pushToken: string | null = null;
  private isInitialized = false;

  // Initialize the notification service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request permissions
      const permissions = await this.requestPermissions();
      
      if (permissions.granted) {
        // Get push token
        await this.registerForPushNotifications();
        
        // Set up notification listeners
        this.setupNotificationListeners();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  // Request notification permissions
  async requestPermissions(): Promise<NotificationPermissions> {
    try {
      if (!Device.isDevice) {
        console.warn('Notifications require a physical device');
        return {
          status: Notifications.PermissionStatus.DENIED,
          canAskAgain: false,
          granted: false,
        };
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== Notifications.PermissionStatus.GRANTED) {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }

      // For Android, configure the notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#8B5CF6',
        });

        // Create additional channels for different notification types
        await this.createNotificationChannels();
      }

      const granted = finalStatus === Notifications.PermissionStatus.GRANTED;

      return {
        status: finalStatus,
        canAskAgain: finalStatus !== Notifications.PermissionStatus.DENIED,
        granted,
      };
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return {
        status: Notifications.PermissionStatus.DENIED,
        canAskAgain: false,
        granted: false,
      };
    }
  }

  // Create notification channels for Android
  private async createNotificationChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    const channels = [
      {
        id: 'offers',
        name: 'Offers & Deals',
        importance: Notifications.AndroidImportance.HIGH,
        description: 'Notifications about new offers and deals',
      },
      {
        id: 'orders',
        name: 'Order Updates',
        importance: Notifications.AndroidImportance.MAX,
        description: 'Updates about your orders',
      },
      {
        id: 'promotions',
        name: 'Promotions',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'Promotional notifications',
      },
      {
        id: 'reminders',
        name: 'Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        description: 'App reminders and alerts',
      },
    ];

    for (const channel of channels) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        importance: channel.importance,
        description: channel.description,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8B5CF6',
      });
    }
  }

  // Register for push notifications
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.warn('Push notifications require a physical device');
        return null;
      }

      // Get the token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

      this.pushToken = tokenData.data;

      // Store token locally
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, this.pushToken);

      // Send token to backend
      await this.syncTokenWithBackend();

      return this.pushToken;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  // Sync token with backend
  private async syncTokenWithBackend(): Promise<void> {
    try {
      if (!this.pushToken) return;

      const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_TOKEN_SYNC);
      const now = new Date().toISOString();

      // Only sync if token hasn't been synced recently (within 24 hours)
      if (lastSync) {
        const lastSyncDate = new Date(lastSync);
        const hoursSinceSync = (Date.now() - lastSyncDate.getTime()) / (1000 * 60 * 60);
        if (hoursSinceSync < 24) return;
      }

      await apiClient.post('/notifications/register', {
        token: this.pushToken,
        platform: Platform.OS,
        deviceId: Device.osInternalBuildId,
      });

      await AsyncStorage.setItem(STORAGE_KEYS.LAST_TOKEN_SYNC, now);
    } catch (error) {
      console.error('Failed to sync token with backend:', error);
    }
  }

  // Set up notification listeners
  private setupNotificationListeners(): void {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      this.handleNotificationTapped(response);
    });
  }

  // Handle notification received
  private handleNotificationReceived(notification: Notifications.Notification): void {
    // Update badge count
    this.updateBadgeCount();
    
    // You can add custom logic here based on notification type
    const { data } = notification.request.content;
    
    if (data?.type === 'order_update') {
      // Handle order update notification
      console.log('Order update received:', data);
    } else if (data?.type === 'new_offer') {
      // Handle new offer notification
      console.log('New offer received:', data);
    }
  }

  // Handle notification tapped
  private handleNotificationTapped(response: Notifications.NotificationResponse): void {
    const { data } = response.notification.request.content;
    
    // Navigate based on notification data
    if (data?.screen) {
      // You can integrate this with your navigation system
      console.log('Navigate to screen:', data.screen);
    }
  }

  // Schedule local notification
  async scheduleLocalNotification(
    notification: NotificationData,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string | null> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: 'default',
        },
        trigger: trigger || null,
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      return null;
    }
  }

  // Cancel scheduled notification
  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  // Update badge count
  async updateBadgeCount(count?: number): Promise<void> {
    try {
      if (count !== undefined) {
        await Notifications.setBadgeCountAsync(count);
      } else {
        // Get current badge count and increment
        const currentCount = await Notifications.getBadgeCountAsync();
        await Notifications.setBadgeCountAsync(currentCount + 1);
      }
    } catch (error) {
      console.error('Error updating badge count:', error);
    }
  }

  // Clear badge count
  async clearBadgeCount(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error clearing badge count:', error);
    }
  }

  // Get notification settings
  async getNotificationSettings(): Promise<any> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
      return settings ? JSON.parse(settings) : defaultSettings;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return defaultSettings;
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  }

  // Get push token
  getPushToken(): string | null {
    return this.pushToken;
  }

  // Check if notifications are enabled
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === Notifications.PermissionStatus.GRANTED;
    } catch (error) {
      console.error('Error checking notification status:', error);
      return false;
    }
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService();
export default notificationService;