import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushNotification {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  badge?: number;
}

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<string | null> {
    try {
      // Check if running on a physical device
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Permission not granted for push notifications');
        return null;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.expoPushToken = token.data;
      console.log('Push token:', this.expoPushToken);

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366f1',
        });

        // Create order-specific channel
        await Notifications.setNotificationChannelAsync('orders', {
          name: 'Order Updates',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#10b981',
          sound: 'default',
        });
      }

      // Setup notification listeners
      this.setupListeners();

      return this.expoPushToken;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return null;
    }
  }

  /**
   * Setup notification listeners
   */
  private setupListeners(): void {
    // Listener for when a notification is received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      // You can handle foreground notifications here
    });

    // Listener for when user taps on a notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      const data = response.notification.request.content.data;

      // Handle navigation based on notification data
      this.handleNotificationTap(data);
    });
  }

  /**
   * Handle notification tap
   */
  private handleNotificationTap(data: any): void {
    if (data?.type === 'order_update' && data?.orderId) {
      // Navigate to order tracking page
      // Note: You'll need to implement navigation using your router
      console.log('Navigate to order:', data.orderId);
      // router.push(`/orders/${data.orderId}/tracking`);
    }
  }

  /**
   * Send local notification
   */
  async sendLocalNotification(notification: PushNotification): Promise<string | null> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound !== false ? 'default' : undefined,
          badge: notification.badge,
        },
        trigger: null, // Send immediately
      });

      return identifier;
    } catch (error) {
      console.error('Error sending local notification:', error);
      return null;
    }
  }

  /**
   * Send order notification
   */
  async sendOrderNotification(
    status: string,
    orderNumber: string,
    orderId: string,
    message?: string
  ): Promise<void> {
    const notifications: { [key: string]: PushNotification } = {
      confirmed: {
        title: 'Order Confirmed!',
        body: `Your order ${orderNumber} has been confirmed by the store.`,
        data: { type: 'order_update', orderId, status: 'confirmed' },
      },
      preparing: {
        title: 'Order Being Prepared',
        body: `Your order ${orderNumber} is being prepared.`,
        data: { type: 'order_update', orderId, status: 'preparing' },
      },
      ready: {
        title: 'Order Ready!',
        body: `Your order ${orderNumber} is ready for pickup/dispatch.`,
        data: { type: 'order_update', orderId, status: 'ready' },
      },
      dispatched: {
        title: 'Order Dispatched!',
        body: `Your order ${orderNumber} has been dispatched.`,
        data: { type: 'order_update', orderId, status: 'dispatched' },
      },
      out_for_delivery: {
        title: 'Out for Delivery!',
        body: `Your order ${orderNumber} is out for delivery.`,
        data: { type: 'order_update', orderId, status: 'out_for_delivery' },
        sound: true,
        badge: 1,
      },
      delivered: {
        title: 'Order Delivered!',
        body: `Your order ${orderNumber} has been delivered successfully.`,
        data: { type: 'order_update', orderId, status: 'delivered' },
        sound: true,
      },
      cancelled: {
        title: 'Order Cancelled',
        body: `Your order ${orderNumber} has been cancelled.`,
        data: { type: 'order_update', orderId, status: 'cancelled' },
      },
    };

    const notification = notifications[status];

    if (notification) {
      // Override body with custom message if provided
      if (message) {
        notification.body = message;
      }

      await this.sendLocalNotification(notification);
    }
  }

  /**
   * Send delivery partner assigned notification
   */
  async sendPartnerAssignedNotification(
    orderNumber: string,
    orderId: string,
    partnerName: string
  ): Promise<void> {
    await this.sendLocalNotification({
      title: 'Delivery Partner Assigned',
      body: `${partnerName} will deliver your order ${orderNumber}.`,
      data: { type: 'order_update', orderId, event: 'partner_assigned' },
      sound: true,
    });
  }

  /**
   * Send delivery partner arrived notification
   */
  async sendPartnerArrivedNotification(
    orderNumber: string,
    orderId: string
  ): Promise<void> {
    await this.sendLocalNotification({
      title: 'Delivery Partner Arrived!',
      body: `Your delivery partner has arrived for order ${orderNumber}.`,
      data: { type: 'order_update', orderId, event: 'partner_arrived' },
      sound: true,
      badge: 1,
    });
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Cancel notification by identifier
   */
  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear badge
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Cleanup listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

// Export singleton instance
const pushNotificationService = new PushNotificationService();
export default pushNotificationService;

// Export type
export { PushNotificationService };
