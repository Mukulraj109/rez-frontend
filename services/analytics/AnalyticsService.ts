/**
 * Comprehensive Analytics Service
 *
 * Centralized analytics tracking with multi-provider support
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsProvider, AnalyticsConfig, PurchaseTransaction, UserProperties, AnalyticsEvent } from './types';
import { CustomAnalyticsProvider } from './providers/CustomProvider';
import { FirebaseAnalyticsProvider } from './providers/FirebaseProvider';
import { ANALYTICS_EVENTS } from './events';

const DEFAULT_CONFIG: AnalyticsConfig = {
  enabled: true,
  debug: __DEV__,
  providers: [
    { name: 'custom', enabled: true, config: {} },
  ],
  batchSize: 50,
  flushInterval: 30000,
  offlineQueueEnabled: true,
  privacyMode: false,
};

export class AnalyticsService {
  private static instance: AnalyticsService;
  private providers: AnalyticsProvider[] = [];
  private config: AnalyticsConfig;
  private sessionId: string;
  private userId?: string;
  private userProperties: UserProperties = {};
  private sessionStartTime: number;
  private consentGranted: boolean = true;
  private readonly CONSENT_KEY = '@analytics:consent';
  private readonly SESSION_KEY = '@analytics:session';

  private constructor() {
    this.config = DEFAULT_CONFIG;
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize analytics with configuration
   */
  async initialize(config?: Partial<AnalyticsConfig>): Promise<void> {
    this.config = { ...DEFAULT_CONFIG, ...config };

    console.log('📊 [Analytics] Initializing with config:', this.config);

    // Load consent
    await this.loadConsent();

    if (!this.consentGranted) {
      console.log('📊 [Analytics] Consent not granted, analytics disabled');
      this.config.enabled = false;
      return;
    }

    // Initialize providers
    await this.initializeProviders();

    // Track session start
    this.trackEvent(ANALYTICS_EVENTS.SESSION_STARTED, {
      platform: Platform.OS,
      platform_version: Platform.Version,
      session_id: this.sessionId,
    });

    console.log('📊 [Analytics] Initialized successfully');
  }

  /**
   * Initialize configured providers
   */
  private async initializeProviders(): Promise<void> {
    this.providers = [];

    for (const providerConfig of this.config.providers) {
      if (!providerConfig.enabled) continue;

      let provider: AnalyticsProvider | null = null;

      switch (providerConfig.name) {
        case 'custom':
          provider = new CustomAnalyticsProvider();
          await provider.initialize({
            apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api',
            ...providerConfig.config,
          });
          break;

        case 'firebase':
          provider = new FirebaseAnalyticsProvider();
          await provider.initialize(providerConfig.config);
          break;

        // Add more providers here
        case 'google_analytics':
        case 'mixpanel':
        case 'amplitude':
          console.warn(`📊 [Analytics] Provider ${providerConfig.name} not implemented yet`);
          break;

        default:
          console.warn(`📊 [Analytics] Unknown provider: ${providerConfig.name}`);
      }

      if (provider) {
        this.providers.push(provider);
        console.log(`📊 [Analytics] Provider ${provider.name} initialized`);
      }
    }
  }

  /**
   * Track a custom event
   */
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.config.enabled || !this.consentGranted) return;

    const enrichedProperties = {
      ...properties,
      timestamp: Date.now(),
      session_id: this.sessionId,
      user_id: this.userId,
      platform: Platform.OS,
    };

    if (this.config.debug) {
      console.log('📊 [Analytics] Event:', eventName, enrichedProperties);
    }

    this.providers.forEach(provider => {
      try {
        provider.trackEvent(eventName, enrichedProperties);
      } catch (error) {
        console.error(`📊 [Analytics] Provider ${provider.name} failed:`, error);
      }
    });
  }

  /**
   * Track screen view
   */
  trackScreen(screenName: string, properties?: Record<string, any>): void {
    if (!this.config.enabled || !this.consentGranted) return;

    const enrichedProperties = {
      ...properties,
      screen_name: screenName,
      timestamp: Date.now(),
    };

    if (this.config.debug) {
      console.log('📊 [Analytics] Screen:', screenName, enrichedProperties);
    }

    this.providers.forEach(provider => {
      try {
        provider.trackScreen(screenName, enrichedProperties);
      } catch (error) {
        console.error(`📊 [Analytics] Provider ${provider.name} failed:`, error);
      }
    });
  }

  /**
   * Set user ID
   */
  setUserId(userId: string): void {
    this.userId = userId;

    if (!this.config.enabled || !this.consentGranted) return;

    if (this.config.debug) {
      console.log('📊 [Analytics] User ID set:', userId);
    }

    this.providers.forEach(provider => {
      try {
        provider.setUserId(userId);
      } catch (error) {
        console.error(`📊 [Analytics] Provider ${provider.name} failed:`, error);
      }
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties): void {
    this.userProperties = { ...this.userProperties, ...properties };

    if (!this.config.enabled || !this.consentGranted) return;

    if (this.config.debug) {
      console.log('📊 [Analytics] User properties:', properties);
    }

    this.providers.forEach(provider => {
      try {
        provider.setUserProperties(properties);
      } catch (error) {
        console.error(`📊 [Analytics] Provider ${provider.name} failed:`, error);
      }
    });
  }

  /**
   * Track purchase transaction
   */
  trackPurchase(transaction: PurchaseTransaction): void {
    if (!this.config.enabled || !this.consentGranted) return;

    if (this.config.debug) {
      console.log('📊 [Analytics] Purchase:', transaction);
    }

    this.providers.forEach(provider => {
      try {
        provider.trackPurchase(transaction);
      } catch (error) {
        console.error(`📊 [Analytics] Provider ${provider.name} failed:`, error);
      }
    });

    // Also track as event
    this.trackEvent(ANALYTICS_EVENTS.CHECKOUT_COMPLETED, {
      transaction_id: transaction.transactionId,
      revenue: transaction.revenue,
      currency: transaction.currency,
      item_count: transaction.items.length,
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>): void {
    if (!this.config.enabled) return; // Track errors even without consent

    const errorData = {
      error_message: error.message,
      error_name: error.name,
      error_stack: error.stack,
      ...context,
    };

    if (this.config.debug) {
      console.log('📊 [Analytics] Error:', errorData);
    }

    this.providers.forEach(provider => {
      try {
        provider.trackError(error, context);
      } catch (err) {
        console.error(`📊 [Analytics] Provider ${provider.name} failed:`, err);
      }
    });
  }

  /**
   * Flush all pending events
   */
  async flush(): Promise<void> {
    if (!this.config.enabled) return;

    if (this.config.debug) {
      console.log('📊 [Analytics] Flushing all providers');
    }

    await Promise.all(
      this.providers.map(async provider => {
        try {
          await provider.flush();
        } catch (error) {
          console.error(`📊 [Analytics] Provider ${provider.name} flush failed:`, error);
        }
      })
    );
  }

  /**
   * Set analytics consent
   */
  async setConsent(granted: boolean): Promise<void> {
    this.consentGranted = granted;
    await AsyncStorage.setItem(this.CONSENT_KEY, JSON.stringify({ granted, timestamp: Date.now() }));

    if (!granted) {
      // Disable analytics and clear data
      this.config.enabled = false;
      await this.clearAllData();
    } else {
      this.config.enabled = true;
    }

    console.log(`📊 [Analytics] Consent ${granted ? 'granted' : 'revoked'}`);
  }

  /**
   * Get current consent status
   */
  async getConsent(): Promise<boolean> {
    return this.consentGranted;
  }

  /**
   * Load consent from storage
   */
  private async loadConsent(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.CONSENT_KEY);
      if (stored) {
        const { granted } = JSON.parse(stored);
        this.consentGranted = granted;
      }
    } catch (error) {
      console.error('📊 [Analytics] Failed to load consent:', error);
    }
  }

  /**
   * Clear all analytics data
   */
  private async clearAllData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const analyticsKeys = keys.filter(key => key.startsWith('@analytics:'));
      await AsyncStorage.multiRemove(analyticsKeys);
      console.log('📊 [Analytics] All data cleared');
    } catch (error) {
      console.error('📊 [Analytics] Failed to clear data:', error);
    }
  }

  /**
   * Track session end
   */
  async trackSessionEnd(): Promise<void> {
    const sessionDuration = Date.now() - this.sessionStartTime;

    this.trackEvent(ANALYTICS_EVENTS.SESSION_ENDED, {
      session_id: this.sessionId,
      duration: sessionDuration,
    });

    await this.flush();
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: this.sessionStartTime,
      duration: Date.now() - this.sessionStartTime,
      consentGranted: this.consentGranted,
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`📊 [Analytics] ${enabled ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled && this.consentGranted;
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance();
export default analytics;
