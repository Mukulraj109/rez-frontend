import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, LogBox, Platform } from 'react-native';
import * as Router from 'expo-router';

// Warnings to suppress
const SUPPRESSED_WARNINGS = [
  'Require cycle: node_modules/react-native-gesture-handler',
  'Require cycle: node_modules/react-native-reanimated',
  'Require cycle:',
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
  'AsyncStorage has been extracted',
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
  'Each child in a list should have a unique "key" prop',
  'componentWillReceiveProps has been renamed',
  'componentWillMount has been renamed',
  'props.pointerEvents is deprecated',
  '"shadow*" style props are deprecated',
  '"textShadow*" style props are deprecated',
  'shadow* style props are deprecated',
  'textShadow* style props are deprecated',
];

// Suppress known harmless warnings from third-party libraries (native)
LogBox.ignoreLogs(SUPPRESSED_WARNINGS);

// Suppress warnings on web by patching console.warn
if (Platform.OS === 'web') {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    const shouldSuppress = SUPPRESSED_WARNINGS.some(warning => message.includes(warning));
    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };
}


import NetInfo from '@react-native-community/netinfo';
import 'react-native-reanimated';

// Brand fonts for ReZ identity
import {
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';

import { useColorScheme } from '@/hooks/useColorScheme';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { OffersProvider } from '@/contexts/OffersContext';
import { CategoryProvider } from '@/contexts/CategoryContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { LocationProvider } from '@/contexts/LocationContext';
import { GreetingProvider } from '@/contexts/GreetingContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { SecurityProvider } from '@/contexts/SecurityContext';
import { AppPreferencesProvider } from '@/contexts/AppPreferencesContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { GamificationProvider } from '@/contexts/GamificationContext';
import { OfflineQueueProvider } from '@/contexts/OfflineQueueContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { RecommendationProvider } from '@/contexts/RecommendationContext';
import { HomeTabProvider } from '@/contexts/HomeTabContext';
import ToastManager from '@/components/common/ToastManager';
import { RewardPopupProvider } from '@/contexts/RewardPopupContext';
import RewardPopupManager from '@/components/gamification/RewardPopupManager';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { billUploadAnalytics } from '@/services/billUploadAnalytics';
import { errorReporter } from '@/utils/errorReporter';
import apiClient from '@/services/apiClient';
import { API_CONFIG, APP_CONFIG, getApiUrl, EXTERNAL_SERVICES, FEATURE_FLAGS } from '@/config/env';
import { CrossPlatformAlertProvider } from '@/components/common/CrossPlatformAlert';
import cacheWarmingService from '@/services/cacheWarmingService';
import cacheService from '@/services/cacheService';
// import AuthDebugger from '@/components/common/AuthDebugger';

/**
 * Root Layout Component
 *
 * Initializes all app-wide providers, contexts, and services.
 * Sets up proper error handling, analytics, and network monitoring.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // ReZ Brand Fonts
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
  });
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const [cacheWarmed, setCacheWarmed] = useState(false);
  const netInfoUnsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize app services on mount
  useEffect(() => {
    initializeApp();

    // Cleanup on unmount
    return () => {
      if (netInfoUnsubscribeRef.current) {
        console.log('🧹 [APP] Cleaning up network listener');
        netInfoUnsubscribeRef.current();
        netInfoUnsubscribeRef.current = null;
      }
    };
  }, []);

  // Monitor app state for cache warming
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      const previousState = appState.current;
      appState.current = nextAppState;

      // App came to foreground
      if (previousState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 [APP] App came to foreground, refreshing stale cache...');
        cacheWarmingService.refreshStaleCache().catch(error => {
          console.error('❌ [APP] Failed to refresh stale cache:', error);
        });
      }

      // App went to background
      if (previousState === 'active' && nextAppState.match(/inactive|background/)) {
        console.log('📱 [APP] App went to background');
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Start cache warming after initialization
  useEffect(() => {
    if (loaded && !cacheWarmed) {
      startCacheWarming();
    }
  }, [loaded, cacheWarmed]);

  /**
   * Initialize app-level services and monitoring
   */
  const initializeApp = async () => {
    try {
      console.log('🚀 [APP] Initializing application services...');

      // 1. Configure API Client
      // Use environment-based URL or fallback to baseUrl
      const apiUrl = API_CONFIG.baseUrl || getApiUrl() || 'http://localhost:5001/api';
      apiClient.setBaseURL(apiUrl);
      console.log('✅ [APP] API Client configured:', apiUrl);
      console.log('   Environment:', APP_CONFIG.environment);
      console.log('   Dev URL:', API_CONFIG.devUrl);
      console.log('   Prod URL:', API_CONFIG.prodUrl);

      // Set up system page callbacks for maintenance and version checks
      apiClient.setCurrentAppVersion(APP_CONFIG.version);
      apiClient.setMaintenanceCallback(() => {
        console.log('🔧 [APP] Navigating to maintenance page...');
        try {
          Router.router.replace('/system/maintenance' as any);
        } catch (e) {
          console.warn('[APP] Could not navigate to maintenance page:', e);
        }
      });
      apiClient.setAppUpdateCallback((minVersion) => {
        console.log(`📱 [APP] App update required. Minimum version: ${minVersion}`);
        try {
          Router.router.replace('/system/app-update' as any);
        } catch (e) {
          console.warn('[APP] Could not navigate to app update page:', e);
        }
      });
      console.log('✅ [APP] System page callbacks configured');

      // 2. Initialize Error Reporter
      errorReporter.setAppVersion(APP_CONFIG.version);
      
      // Enable error reporting based on environment and feature flag
      const shouldEnableErrorReporting = Boolean(
        EXTERNAL_SERVICES.analytics.sentry || 
        FEATURE_FLAGS.enableCrashReporting ||
        APP_CONFIG.environment === 'production'
      );
      
      errorReporter.setEnabled(shouldEnableErrorReporting);
      
      if (shouldEnableErrorReporting) {
        console.log('✅ [APP] Error Reporter initialized and enabled');
        if (EXTERNAL_SERVICES.analytics.sentry) {
          console.log('   Sentry DSN configured');
        } else {
          console.warn('   ⚠️ Sentry DSN not configured - errors will be logged locally only');
        }
      } else {
        console.log('ℹ️ [APP] Error Reporter initialized but disabled (development mode)');
      }

      // 3. Initialize Analytics
      // Note: Analytics flush interval is already configured in billUploadAnalytics constructor (30s)
      console.log('✅ [APP] Analytics initialized');

      // 4. Initialize Cache Warming Service
      await cacheWarmingService.initialize();
      console.log('✅ [APP] Cache warming service initialized');

      // 5. Setup Network Monitoring
      // Clean up existing listener if any
      if (netInfoUnsubscribeRef.current) {
        netInfoUnsubscribeRef.current();
        netInfoUnsubscribeRef.current = null;
      }

      netInfoUnsubscribeRef.current = NetInfo.addEventListener(state => {
        const isConnected = state.isConnected ?? false;
        console.log(`📡 [APP] Network status changed: ${isConnected ? 'ONLINE' : 'OFFLINE'}`);

        // Log network events to analytics
        billUploadAnalytics.trackUserAction('network_status_changed', {
          isConnected,
          type: state.type,
          isInternetReachable: state.isInternetReachable,
        });

        // Add breadcrumb for error tracking
        errorReporter.addBreadcrumb({
          type: 'network',
          message: `Network ${isConnected ? 'connected' : 'disconnected'}`,
          data: {
            type: state.type,
            isInternetReachable: state.isInternetReachable,
          },
        });
      });

      console.log('✅ [APP] Network monitoring initialized');
      console.log('🎉 [APP] Application initialization complete!');
    } catch (error) {
      console.error('❌ [APP] Failed to initialize app:', error);
      errorReporter.captureError(
        error instanceof Error ? error : new Error('App initialization failed'),
        { context: 'RootLayout.initializeApp' }
      );
    }
  };

  /**
   * Start cache warming process
   */
  const startCacheWarming = async () => {
    try {
      console.log('🔥 [APP] Starting cache warming...');

      // Start warming in background (non-blocking)
      cacheWarmingService.startWarming().then(() => {
        setCacheWarmed(true);
        const stats = cacheWarmingService.getStats();
        console.log('✅ [APP] Cache warming complete!', stats);
      }).catch(error => {
        console.error('❌ [APP] Cache warming failed:', error);
        setCacheWarmed(true); // Mark as done even if failed
      });

    } catch (error) {
      console.error('❌ [APP] Failed to start cache warming:', error);
    }
  };

  /**
   * Handle offline queue sync errors
   */
  const handleQueueSyncError = (error: Error) => {
    console.error('❌ [APP] Offline queue sync failed:', error);
    errorReporter.captureError(error, {
      context: 'OfflineQueue.syncError',
      component: 'RootLayout',
    });
    // Don't show user error for sync failures - they will retry automatically
  };

  /**
   * Handle offline queue sync completion
   */
  const handleQueueSyncComplete = (result: any) => {
    console.log('✅ [APP] Offline queue synced:', result);
    billUploadAnalytics.trackSyncCompleted(result.processed || 0);
  };

  /**
   * Handle error boundary errors
   */
  const handleErrorBoundaryError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('❌ [APP] Error Boundary caught error:', error);
    errorReporter.captureError(error, {
      context: 'ErrorBoundary',
      component: 'RootLayout',
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });
  };

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ErrorBoundary onError={handleErrorBoundaryError}>
      <CrossPlatformAlertProvider>
        <ToastProvider>
          <OfflineQueueProvider
            autoSync={true}
            onSyncComplete={handleQueueSyncComplete}
            onSyncError={handleQueueSyncError}
          >
            <AppProvider>
            <AuthProvider>
              <SubscriptionProvider>
                <GamificationProvider>
                  <SocketProvider>
                    <LocationProvider>
                      <GreetingProvider>
                        <CartProvider>
                          <OffersProvider>
                            <CategoryProvider>
                              <ProfileProvider>
                                <WishlistProvider>
                                  <NotificationProvider>
                                    <SecurityProvider>
                                      <AppPreferencesProvider>
                                        <RecommendationProvider>
                                          <HomeTabProvider>
                                            <RewardPopupProvider>
                                          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                  {/* App Entry Point */}
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  
                  {/* Authentication Screens */}
                  <Stack.Screen name="sign-in" options={{ headerShown: false }} />
                  
                  {/* Onboarding Screens */}
                  <Stack.Screen name="onboarding/splash"  options={{ headerShown: false }}/>
                  <Stack.Screen name="onboarding/registration" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/otp-verification" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/location-permission" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/loading" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/category-selection" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/rewards-intro" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/transactions-preview" options={{ headerShown: false }} />
                  
                  {/* Main App Screens */}
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  {/* FashionPage removed - use /MainCategory/fashion instead */}
                   <Stack.Screen name="ProductPage" options={{ headerShown: false }} />
                   <Stack.Screen name="products-videos" options={{ headerShown: false }} />
                   <Stack.Screen name="articles" options={{ headerShown: false }} />
                   <Stack.Screen name="article/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="CartPage" options={{ headerShown: false }} />
                  <Stack.Screen name="MainStorePage" options={{ headerShown: false }} />
                   <Stack.Screen name="Store" options={{ headerShown: false }} />
                   <Stack.Screen name="store-visit" options={{ headerShown: false }} />
                   <Stack.Screen name="EventPage" options={{ headerShown: false }} />
                   <Stack.Screen name="UGCDetailScreen" options={{ headerShown: false }} />
                   <Stack.Screen name="CoinPage" options={{ headerShown: false }} />
                    <Stack.Screen name="WalletScreen" options={{ headerShown: false }} />
                    <Stack.Screen name="StoreListPage" options={{ headerShown: false }} />
                    <Stack.Screen name="how-rez-works" options={{ headerShown: false }} />
                    <Stack.Screen name="EventsListPage" options={{ headerShown: false }} />
                    <Stack.Screen name="ReviewPage" options={{ headerShown: false }} />
                    <Stack.Screen name="offers/index" options={{ headerShown: false }} />
                    <Stack.Screen name="offers/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="offers/view-all" options={{ headerShown: false }} />
                    <Stack.Screen name="offers/birthday" options={{ headerShown: false }} />
                    <Stack.Screen name="offers/zones/student" options={{ headerShown: false }} />
                    <Stack.Screen name="offers/zones/corporate" options={{ headerShown: false }} />
                    <Stack.Screen name="offers/zones/women" options={{ headerShown: false }} />
                    <Stack.Screen name="offers/zones/heroes" options={{ headerShown: false }} />
                    <Stack.Screen name="offers/zones/loyalty" options={{ headerShown: false }} />
                    <Stack.Screen name="offers/zones/birthday" options={{ headerShown: false }} />
                    <Stack.Screen name="offers/zones/senior" options={{ headerShown: false }} />
                    <Stack.Screen name="offers/zones/first-time" options={{ headerShown: false }} />
                    
                    {/* Profile System Screens */}
                    <Stack.Screen name="wallet/index" options={{ headerShown: false }} />
                    <Stack.Screen name="account/index" options={{ headerShown: false }} />
                    <Stack.Screen name="profile/index" options={{ headerShown: false }} />
                    <Stack.Screen name="profile/partner" options={{ headerShown: false }} />
                    <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
                    <Stack.Screen name="profile/achievements" options={{ headerShown: false }} />
                    <Stack.Screen name="profile/activity" options={{ headerShown: false }} />

                    {/* Profile Icon Grid Pages */}
                    <Stack.Screen name="my-products" options={{ headerShown: false }} />
                    <Stack.Screen name="my-services" options={{ headerShown: false }} />
                    <Stack.Screen name="my-vouchers" options={{ headerShown: false }} />
                    <Stack.Screen name="my-earnings" options={{ headerShown: false }} />

                    {/* Messaging System */}
                    <Stack.Screen name="messages/index" options={{ headerShown: false }} />
                    <Stack.Screen name="search" options={{ headerShown: false }} />
                    <Stack.Screen name="going-out" options={{ headerShown: false }} />
                    <Stack.Screen name="home-delivery" options={{ headerShown: false }} />
                    <Stack.Screen name="home-delivery/section/[sectionId]" options={{ headerShown: false }} />
                    <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="transactions/index" options={{ headerShown: false }} />
                    <Stack.Screen name="transactions/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="transactions/incomplete" options={{ headerShown: false }} />
                    <Stack.Screen name="account/delivery" options={{ headerShown: false }} />
                    <Stack.Screen name="account/payment-methods" options={{ headerShown: false }} />
                    <Stack.Screen name="account/payment" options={{ headerShown: false }} />
                    <Stack.Screen name="payment" options={{ headerShown: false }} />
                    <Stack.Screen name="account/settings" options={{ headerShown: false }} />
                    <Stack.Screen name="account/language" options={{ headerShown: false }} />
                    <Stack.Screen name="account/notifications" options={{ headerShown: false }} />
                    <Stack.Screen name="account/push-notifications" options={{ headerShown: false }} />
                    <Stack.Screen name="account/email-notifications" options={{ headerShown: false }} />
                    <Stack.Screen name="account/sms-notifications" options={{ headerShown: false }} />
                    <Stack.Screen name="account/notification-history" options={{ headerShown: false }} />
                    <Stack.Screen name="account/profile-visibility" options={{ headerShown: false }} />
                    <Stack.Screen name="account/two-factor-auth" options={{ headerShown: false }} />
                    <Stack.Screen name="account/change-password" options={{ headerShown: false }} />
                    <Stack.Screen name="account/delete-account" options={{ headerShown: false }} />
                    <Stack.Screen name="account/addresses" options={{ headerShown: false }} />
                    <Stack.Screen name="account/cashback" options={{ headerShown: false }} />
                    <Stack.Screen name="account/coupons" options={{ headerShown: false }} />
                    <Stack.Screen name="account/courier-preferences" options={{ headerShown: false }} />
                    <Stack.Screen name="account/products" options={{ headerShown: false }} />
                    <Stack.Screen name="account/product-detail" options={{ headerShown: false }} />
                    <Stack.Screen name="tracking" options={{ headerShown: false }} />
                    <Stack.Screen name="order-history" options={{ headerShown: false }} />
                    <Stack.Screen name="ring-sizer" options={{ headerShown: false }} />
                    <Stack.Screen name="scratch-card" options={{ headerShown: false }} />
                    
                    {/* Checkout System Screens */}
                    <Stack.Screen name="checkout" options={{ headerShown: false }} />
                    <Stack.Screen name="payment-methods" options={{ headerShown: false }} />
                    <Stack.Screen name="payment-success" options={{ headerShown: false }} />
                    
                    {/* Social Media Earning Screen */}
                    <Stack.Screen name="earn-from-social-media" options={{ headerShown: false }} />

                    {/* Play and Earn Screen */}
                    <Stack.Screen name="playandearn" options={{ headerShown: false }} />
                    
                    {/* Play and Earn Sub-pages */}
                    <Stack.Screen name="playandearn/CollegeAmbassador" options={{ headerShown: false }} />
                    <Stack.Screen name="playandearn/BrandTasks" options={{ headerShown: false }} />
                    <Stack.Screen name="playandearn/UGCCreator" options={{ headerShown: false }} />
                    <Stack.Screen name="playandearn/CorporateEmployee" options={{ headerShown: false }} />
                    <Stack.Screen name="playandearn/SocialImpact" options={{ headerShown: false }} />
                    <Stack.Screen name="playandearn/SocialImpactEventDetail" options={{ headerShown: false }} />
                    <Stack.Screen name="playandearn/TournamentDetail" options={{ headerShown: false }} />
                    <Stack.Screen name="playandearn/quiz" options={{ headerShown: false }} />
                    <Stack.Screen name="playandearn/memorymatch" options={{ headerShown: false }} />
                    <Stack.Screen name="playandearn/luckydraw" options={{ headerShown: false }} />
                    <Stack.Screen name="playandearn/guessprice" options={{ headerShown: false }} />
                    <Stack.Screen name="playandearn/coinhunt" options={{ headerShown: false }} />
                    <Stack.Screen name="playandearn/leaderboard" options={{ headerShown: false }} />
                    <Stack.Screen name="playandearn/achievements" options={{ headerShown: false }} />
                    
                    {/* Online Voucher System */}
                    <Stack.Screen name="online-voucher" options={{ headerShown: false }} />
                    <Stack.Screen name="voucher/[brandId]" options={{ headerShown: false }} />
                    <Stack.Screen name="voucher/category/[slug]" options={{ headerShown: false }} />
                    
                    {/* Location System Screens */}
                    <Stack.Screen name="location/history" options={{ headerShown: false }} />
                    <Stack.Screen name="location/settings" options={{ headerShown: false }} />
                    
                    {/* Root Settings Screen */}
                    <Stack.Screen name="settings" options={{ headerShown: false }} />

                    {/* Subscription System Screens */}
                    <Stack.Screen name="subscription/plans" options={{ headerShown: false }} />
                    <Stack.Screen name="subscription/manage" options={{ headerShown: false }} />
                    <Stack.Screen name="subscription/billing" options={{ headerShown: false }} />
                    <Stack.Screen name="subscription/payment-confirmation" options={{ headerShown: false }} />
                    <Stack.Screen name="subscription/upgrade-confirmation" options={{ headerShown: false }} />
                    <Stack.Screen name="subscription/cancel-feedback" options={{ headerShown: false }} />
                    <Stack.Screen name="subscription/trial" options={{ headerShown: false }} />
                    <Stack.Screen name="subscription/benefits" options={{ headerShown: false }} />
                    <Stack.Screen name="subscription/downgrade-confirmation" options={{ headerShown: false }} />

                  {/* Dynamic Category Pages */}
                  <Stack.Screen name="category/[slug]" options={{ headerShown: false }} />
                  <Stack.Screen name="MainCategory/[slug]" options={{ headerShown: false }} />

                  {/* Services Pages */}
                  <Stack.Screen name="services" options={{ headerShown: false }} />

                  {/* Pay In Store Flow */}
                  <Stack.Screen name="pay-in-store/index" options={{ headerShown: false }} />
                  <Stack.Screen name="pay-in-store/store-search" options={{ headerShown: false }} />
                  <Stack.Screen name="pay-in-store/enter-amount" options={{ headerShown: false }} />
                  <Stack.Screen name="pay-in-store/offers" options={{ headerShown: false }} />
                  <Stack.Screen name="pay-in-store/payment" options={{ headerShown: false }} />
                  <Stack.Screen name="pay-in-store/success" options={{ headerShown: false }} />

                  {/* Mall Module */}
                  <Stack.Screen name="mall" options={{ headerShown: false }} />

                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />

                {/* Toast Manager for notifications */}
                <ToastManager />

                {/* Reward Popup Manager for coin/reward notifications */}
                <RewardPopupManager />

                {/* Global Bottom Navigation - appears on all pages */}
                <BottomNavigation />

                {/* Debug component for development */}
                {/* {process.env.NODE_ENV === 'development' && <AuthDebugger />} */}

                                          </ThemeProvider>
                                            </RewardPopupProvider>
                                          </HomeTabProvider>
                                        </RecommendationProvider>
                                      </AppPreferencesProvider>
                                    </SecurityProvider>
                                </NotificationProvider>
                              </WishlistProvider>
                            </ProfileProvider>
                          </CategoryProvider>
                        </OffersProvider>
                      </CartProvider>
                    </GreetingProvider>
                  </LocationProvider>
                </SocketProvider>
              </GamificationProvider>
            </SubscriptionProvider>
          </AuthProvider>
          </AppProvider>
        </OfflineQueueProvider>
        </ToastProvider>
      </CrossPlatformAlertProvider>
    </ErrorBoundary>
  );
}
