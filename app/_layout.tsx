import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import 'react-native-reanimated';

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
import ToastManager from '@/components/common/ToastManager';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { billUploadAnalytics } from '@/services/billUploadAnalytics';
import { errorReporter } from '@/utils/errorReporter';
import apiClient from '@/services/apiClient';
import { API_CONFIG, APP_CONFIG } from '@/config/env';
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
  });

  // Initialize app services on mount
  useEffect(() => {
    initializeApp();
  }, []);

  /**
   * Initialize app-level services and monitoring
   */
  const initializeApp = async () => {
    try {
      console.log('🚀 [APP] Initializing application services...');

      // 1. Configure API Client
      apiClient.setBaseURL(API_CONFIG.baseUrl);
      console.log('✅ [APP] API Client configured:', API_CONFIG.baseUrl);

      // 2. Initialize Error Reporter
      errorReporter.setAppVersion(APP_CONFIG.version);
      errorReporter.setEnabled(true);
      console.log('✅ [APP] Error Reporter initialized');

      // 3. Initialize Analytics
      // Note: Analytics flush interval is already configured in billUploadAnalytics constructor (30s)
      console.log('✅ [APP] Analytics initialized');

      // 4. Setup Network Monitoring
      const unsubscribe = NetInfo.addEventListener(state => {
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

      // Return cleanup function
      return () => {
        console.log('🧹 [APP] Cleaning up network listener');
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ [APP] Failed to initialize app:', error);
      errorReporter.captureError(
        error instanceof Error ? error : new Error('App initialization failed'),
        { context: 'RootLayout.initializeApp' }
      );
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
                  <Stack.Screen name="FashionPage" options={{ headerShown: false }} />
                   <Stack.Screen name="ProductPage" options={{ headerShown: false }} />
                  <Stack.Screen name="CartPage" options={{ headerShown: false }} />
                  <Stack.Screen name="MainStorePage" options={{ headerShown: false }} />
                   <Stack.Screen name="Store" options={{ headerShown: false }} />
                   <Stack.Screen name="EventPage" options={{ headerShown: false }} />
                   <Stack.Screen name="UGCDetailScreen" options={{ headerShown: false }} />
                   <Stack.Screen name="CoinPage" options={{ headerShown: false }} />
                    <Stack.Screen name="WalletScreen" options={{ headerShown: false }} />
                    <Stack.Screen name="StoreListPage" options={{ headerShown: false }} />
                    <Stack.Screen name="StoreSearch" options={{ headerShown: false }} />
                    <Stack.Screen name="ReviewPage" options={{ headerShown: false }} />
                    <Stack.Screen name="offers/index" options={{ headerShown: false }} />
                    <Stack.Screen name="offers/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="offers/view-all" options={{ headerShown: false }} />
                    
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
                    <Stack.Screen name="search" options={{ headerShown: false }} />
                    <Stack.Screen name="going-out" options={{ headerShown: false }} />
                    <Stack.Screen name="home-delivery" options={{ headerShown: false }} />
                    <Stack.Screen name="home-delivery/section/[sectionId]" options={{ headerShown: false }} />
                    <Stack.Screen name="paybill-transactions" options={{ headerShown: false }} />
                    <Stack.Screen name="paybill-add-money" options={{ headerShown: false }} />
                    <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="transactions/index" options={{ headerShown: false }} />
                    <Stack.Screen name="transactions/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="transactions/incomplete" options={{ headerShown: false }} />
                    <Stack.Screen name="account/delivery" options={{ headerShown: false }} />
                    <Stack.Screen name="account/payment-methods" options={{ headerShown: false }} />
                    <Stack.Screen name="account/payment" options={{ headerShown: false }} />
                    <Stack.Screen name="account/wasilpay" options={{ headerShown: false }} />
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
                    <Stack.Screen name="coin-detail" options={{ headerShown: false }} />
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
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />

                {/* Toast Manager for notifications */}
                <ToastManager />

                {/* Global Bottom Navigation - appears on all pages */}
                <BottomNavigation />

                {/* Debug component for development */}
                {/* {process.env.NODE_ENV === 'development' && <AuthDebugger />} */}

                                      </ThemeProvider>
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
    </ErrorBoundary>
  );
}
