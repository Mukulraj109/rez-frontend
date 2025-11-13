/**
 * Firebase Analytics Provider
 *
 * Integrates with Firebase Analytics for event tracking
 */

import { BaseAnalyticsProvider } from './BaseProvider';
import { PurchaseTransaction } from '../types';

// Note: This is a stub implementation
// To use Firebase Analytics, install: expo install @react-native-firebase/analytics
// Then import: import analytics from '@react-native-firebase/analytics';

interface FirebaseProviderConfig {
  debug?: boolean;
}

export class FirebaseAnalyticsProvider extends BaseAnalyticsProvider {
  name = 'Firebase';
  private analytics: any = null;
  private userId?: string;

  async initialize(config: FirebaseProviderConfig): Promise<void> {
    this.log('Initializing Firebase Analytics');

    try {
      // Dynamically import Firebase Analytics if available
      // const { default: analytics } = await import('@react-native-firebase/analytics');
      // this.analytics = analytics();

      // For now, just log (Firebase not installed)
      this.warn('Firebase Analytics not installed. Install with: expo install @react-native-firebase/analytics');

      this.setDebug(config.debug || false);
      this.log('Firebase Analytics initialized');
    } catch (error) {
      this.error('Failed to initialize Firebase Analytics:', error);
      this.setEnabled(false);
    }
  }

  trackEvent(name: string, properties?: Record<string, any>): void {
    if (!this.enabled || !this.analytics) return;

    try {
      // Firebase has event name restrictions
      const sanitizedName = this.sanitizeEventName(name);
      const sanitizedProps = this.sanitizeProperties(properties);

      this.log('Tracking event:', sanitizedName, sanitizedProps);

      // this.analytics.logEvent(sanitizedName, sanitizedProps);

      // Stub for now
      console.log('[Firebase Stub] Event:', sanitizedName, sanitizedProps);
    } catch (error) {
      this.error('Failed to track event:', error);
    }
  }

  trackScreen(name: string, properties?: Record<string, any>): void {
    if (!this.enabled || !this.analytics) return;

    try {
      this.log('Tracking screen:', name);

      // this.analytics.logScreenView({
      //   screen_name: name,
      //   screen_class: name,
      // });

      // Stub for now
      console.log('[Firebase Stub] Screen:', name, properties);

      // Also track as event
      this.trackEvent('screen_view', {
        screen_name: name,
        ...properties,
      });
    } catch (error) {
      this.error('Failed to track screen:', error);
    }
  }

  setUserId(userId: string): void {
    this.userId = userId;

    if (!this.enabled || !this.analytics) return;

    try {
      this.log('Setting user ID:', userId);
      // this.analytics.setUserId(userId);

      // Stub for now
      console.log('[Firebase Stub] User ID:', userId);
    } catch (error) {
      this.error('Failed to set user ID:', error);
    }
  }

  setUserProperties(properties: Record<string, any>): void {
    if (!this.enabled || !this.analytics) return;

    try {
      this.log('Setting user properties:', properties);

      // Firebase only allows string values
      const sanitizedProps: Record<string, string> = {};
      Object.entries(properties).forEach(([key, value]) => {
        sanitizedProps[key] = String(value);
      });

      // Object.entries(sanitizedProps).forEach(([key, value]) => {
      //   this.analytics.setUserProperty(key, value);
      // });

      // Stub for now
      console.log('[Firebase Stub] User Properties:', sanitizedProps);
    } catch (error) {
      this.error('Failed to set user properties:', error);
    }
  }

  trackPurchase(transaction: PurchaseTransaction): void {
    if (!this.enabled || !this.analytics) return;

    try {
      this.log('Tracking purchase:', transaction);

      // this.analytics.logEvent('purchase', {
      //   transaction_id: transaction.transactionId,
      //   value: transaction.revenue,
      //   currency: transaction.currency,
      //   tax: transaction.tax,
      //   shipping: transaction.shipping,
      //   coupon: transaction.coupon,
      //   items: transaction.items.map(item => ({
      //     item_id: item.productId,
      //     item_name: item.name,
      //     item_category: item.category,
      //     price: item.price,
      //     quantity: item.quantity,
      //   })),
      // });

      // Stub for now
      console.log('[Firebase Stub] Purchase:', transaction);
    } catch (error) {
      this.error('Failed to track purchase:', error);
    }
  }

  private sanitizeEventName(name: string): string {
    // Firebase event names must be alphanumeric with underscores
    // Max 40 characters
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .substring(0, 40);
  }

  private sanitizeProperties(properties?: Record<string, any>): Record<string, any> {
    if (!properties) return {};

    const sanitized: Record<string, any> = {};

    Object.entries(properties).forEach(([key, value]) => {
      // Firebase has parameter name restrictions
      const sanitizedKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 40);

      // Firebase only accepts string, number, or boolean values
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        sanitized[sanitizedKey] = value;
      } else if (value !== null && value !== undefined) {
        sanitized[sanitizedKey] = JSON.stringify(value);
      }
    });

    return sanitized;
  }
}
