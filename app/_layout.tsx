import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ErrorBoundary } from '@/components/ErrorBoundary';
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
// import AuthDebugger from '@/components/common/AuthDebugger';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ErrorBoundary>
      <AppProvider>
        <AuthProvider>
          <SocketProvider>
            <LocationProvider>
              <GreetingProvider>
                <CartProvider>
                  <OffersProvider>
                    <CategoryProvider>
                      <ProfileProvider>
                        <WishlistProvider>
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
                   <Stack.Screen name="StorePage" options={{ headerShown: false }} />
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
                    
                    {/* Profile System Screens */}
                    <Stack.Screen name="wallet/index" options={{ headerShown: false }} />
                    <Stack.Screen name="account/index" options={{ headerShown: false }} />
                    <Stack.Screen name="profile/index" options={{ headerShown: false }} />
                    <Stack.Screen name="profile/partner" options={{ headerShown: false }} />
                    <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
                    <Stack.Screen name="search" options={{ headerShown: false }} />
                    <Stack.Screen name="going-out" options={{ headerShown: false }} />
                    <Stack.Screen name="home-delivery" options={{ headerShown: false }} />
                    <Stack.Screen name="transactions" options={{ headerShown: false }} />
                    <Stack.Screen name="account/delivery" options={{ headerShown: false }} />
                    <Stack.Screen name="tracking" options={{ headerShown: false }} />
                    
                    {/* Checkout System Screens */}
                    <Stack.Screen name="checkout" options={{ headerShown: false }} />
                    <Stack.Screen name="payment-methods" options={{ headerShown: false }} />
                    <Stack.Screen name="payment-success" options={{ headerShown: false }} />
                    
                    {/* Social Media Earning Screen */}
                    <Stack.Screen name="earn-from-social-media" options={{ headerShown: false }} />
                    
                    {/* Online Voucher System */}
                    <Stack.Screen name="online-voucher" options={{ headerShown: false }} />
                    <Stack.Screen name="voucher/[brandId]" options={{ headerShown: false }} />
                    
                    {/* Location System Screens */}
                    <Stack.Screen name="location/history" options={{ headerShown: false }} />
                    <Stack.Screen name="location/settings" options={{ headerShown: false }} />
                    
                  {/* Dynamic Category Pages */}
                  <Stack.Screen name="category/[slug]" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />
                
                {/* Debug component for development */}
                {/* {process.env.NODE_ENV === 'development' && <AuthDebugger />} */}
                
                        </ThemeProvider>
                      </WishlistProvider>
                    </ProfileProvider>
                  </CategoryProvider>
                </OffersProvider>
              </CartProvider>
            </GreetingProvider>
          </LocationProvider>
          </SocketProvider>
        </AuthProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}
