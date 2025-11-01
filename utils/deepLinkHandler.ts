import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const REFERRAL_CODE_KEY = '@rez_pending_referral_code';

interface DeepLinkData {
  type: 'referral' | 'product' | 'store' | 'offer' | 'unknown';
  data: any;
}

export class DeepLinkHandler {
  /**
   * Parse deep link URL
   */
  parseDeepLink(url: string): DeepLinkData {
    try {
      const parsed = Linking.parse(url);
      const { hostname, path, queryParams } = parsed;

      // Handle referral links: rez://invite/ABC123 or https://rez.app/invite/ABC123
      if (hostname === 'invite' || path?.includes('/invite/')) {
        const code = path?.split('/invite/')[1] || hostname;
        return {
          type: 'referral',
          data: {
            code: code?.toUpperCase(),
            source: queryParams?.source || 'direct'
          }
        };
      }

      // Handle product links: rez://product/123
      if (hostname === 'product' || path?.includes('/product/')) {
        const productId = path?.split('/product/')[1] || hostname;
        return {
          type: 'product',
          data: { productId }
        };
      }

      // Handle store links: rez://store/456
      if (hostname === 'store' || path?.includes('/store/')) {
        const storeId = path?.split('/store/')[1] || hostname;
        return {
          type: 'store',
          data: { storeId }
        };
      }

      // Handle offer links: rez://offer/789
      if (hostname === 'offer' || path?.includes('/offer/')) {
        const offerId = path?.split('/offer/')[1] || hostname;
        return {
          type: 'offer',
          data: { offerId }
        };
      }

      return {
        type: 'unknown',
        data: { url }
      };
    } catch (error) {
      console.error('Deep link parsing error:', error);
      return {
        type: 'unknown',
        data: { url }
      };
    }
  }

  /**
   * Handle referral deep link
   */
  async handleReferralLink(code: string, source: string = 'direct'): Promise<void> {
    try {
      // Store referral code for later (if user needs to register first)
      await AsyncStorage.setItem(
        REFERRAL_CODE_KEY,
        JSON.stringify({
          code,
          source,
          timestamp: Date.now()
        })
      );
    } catch (error) {
      console.error('Error storing referral code:', error);
    }
  }

  /**
   * Get pending referral code
   */
  async getPendingReferralCode(): Promise<{
    code: string;
    source: string;
    timestamp: number;
  } | null> {
    try {
      const stored = await AsyncStorage.getItem(REFERRAL_CODE_KEY);
      if (stored) {
        const data = JSON.parse(stored);

        // Check if not expired (7 days)
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - data.timestamp < sevenDays) {
          return data;
        } else {
          // Expired, clear it
          await this.clearPendingReferralCode();
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting pending referral code:', error);
      return null;
    }
  }

  /**
   * Clear pending referral code
   */
  async clearPendingReferralCode(): Promise<void> {
    try {
      await AsyncStorage.removeItem(REFERRAL_CODE_KEY);
    } catch (error) {
      console.error('Error clearing referral code:', error);
    }
  }

  /**
   * Generate deep link URL
   */
  generateDeepLink(type: 'referral' | 'product' | 'store' | 'offer', id: string): string {
    const baseUrl = 'https://rez.app';

    switch (type) {
      case 'referral':
        return `${baseUrl}/invite/${id}`;
      case 'product':
        return `${baseUrl}/product/${id}`;
      case 'store':
        return `${baseUrl}/store/${id}`;
      case 'offer':
        return `${baseUrl}/offer/${id}`;
      default:
        return baseUrl;
    }
  }

  /**
   * Track deep link attribution
   */
  async trackAttribution(type: string, data: any): Promise<void> {
    try {
      // Store attribution data
      const attribution = {
        type,
        data,
        timestamp: Date.now()
      };

      await AsyncStorage.setItem(
        '@rez_attribution',
        JSON.stringify(attribution)
      );
      // TODO: Send to analytics

    } catch (error) {
      console.error('Error tracking attribution:', error);
    }
  }
}

/**
 * React hook for handling deep links
 */
export function useDeepLinkHandler() {
  const [deepLink, setDeepLink] = useState<DeepLinkData | null>(null);
  const router = useRouter();
  const handler = new DeepLinkHandler();

  useEffect(() => {
    // Handle initial URL (app opened from link)
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        const parsed = handler.parseDeepLink(initialUrl);
        setDeepLink(parsed);
        handleDeepLink(parsed);
      }
    };

    // Handle URL when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const parsed = handler.parseDeepLink(url);
      setDeepLink(parsed);
      handleDeepLink(parsed);
    });

    handleInitialURL();

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = async (linkData: DeepLinkData) => {
    switch (linkData.type) {
      case 'referral':
        await handler.handleReferralLink(
          linkData.data.code,
          linkData.data.source
        );
        await handler.trackAttribution('referral', linkData.data);

        // Navigate to registration or apply code
        // Check if user is logged in
        // If not, navigate to registration
        // If yes, prompt to apply code (if not already used)
        break;

      case 'product':
        await handler.trackAttribution('product', linkData.data);
        router.push(`/ProductPage?id=${linkData.data.productId}`);
        break;

      case 'store':
        await handler.trackAttribution('store', linkData.data);
        router.push(`/Store?id=${linkData.data.storeId}`);
        break;

      case 'offer':
        await handler.trackAttribution('offer', linkData.data);
        router.push(`/offers?id=${linkData.data.offerId}`);
        break;

      default:

    }
  };

  return {
    deepLink,
    handler
  };
}

export default new DeepLinkHandler();
