import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useLocationPermission } from '@/hooks/useLocation';
import { useAuth } from '@/contexts/AuthContext';
import { navigationDebugger } from '@/utils/navigationDebug';

// ReZ Design System Colors
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00A16B',
  deepTeal: '#00796B',
  gold: '#FFC857',
  goldDark: '#FF9F1C',
  textPrimary: '#0B2240',
  textMuted: '#9AA7B2',
  surface: '#F7FAFC',
  glassWhite: 'rgba(255, 255, 255, 0.9)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
};

export default function LocationPermissionScreen() {
  const router = useRouter();
  const { updateUserData, setLoading, state } = useOnboarding();
  const { state: authState } = useAuth();
  const { permissionStatus, isRequesting, requestPermission } = useLocationPermission();
  const [permissionRequested, setPermissionRequested] = useState(false);

  const requestLocationPermission = async () => {
    if (permissionRequested || isRequesting) return;

    setPermissionRequested(true);
    setLoading(true);

    try {
      const granted = await requestPermission();

      if (!granted) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to find the best deals near you.',
          [
            { text: 'Skip', onPress: () => router.push('/onboarding/loading') },
            { text: 'Try Again', onPress: () => setPermissionRequested(false) }
          ]
        );
        setLoading(false);
        setPermissionRequested(false);
        return;
      }

      updateUserData({
        location: {
          latitude: 0,
          longitude: 0,
        }
      });

      if (authState.user?.isOnboarded) {
        navigationDebugger.logNavigation('location-permission', '(tabs)', 'location-granted-onboarded-user');
        router.replace('/(tabs)');
      } else {
        navigationDebugger.logNavigation('location-permission', 'loading', 'location-granted');
        router.push('/onboarding/loading');
      }

    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your location. Please try again.',
        [
          { text: 'Skip', onPress: () => router.push('/onboarding/loading') },
          { text: 'Retry', onPress: () => setPermissionRequested(false) }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={[COLORS.surface, '#EDF2F7', COLORS.surface]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Elements */}
      <View style={styles.decorativeCircles}>
        <View style={[styles.circle, styles.circleGreen]} />
        <View style={[styles.circle, styles.circleGold]} />
      </View>

      <View style={styles.content}>
        <View style={styles.glassCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
            style={styles.glassShine}
          />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Enable Location</Text>
            <Text style={styles.subtitle}>
              Allow location access to discover{'\n'}the best deals near you
            </Text>

            <View style={styles.underlineContainer}>
              <LinearGradient
                colors={[COLORS.gold, COLORS.goldDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.underline}
              />
            </View>
          </View>

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.phoneContainer}>
              {/* Phone Frame */}
              <View style={styles.phone}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8FAFC']}
                  style={styles.phoneScreen}
                >
                  {/* Map Lines */}
                  <View style={styles.mapLines}>
                    <View style={[styles.mapLine, styles.mapLine1]} />
                    <View style={[styles.mapLine, styles.mapLine2]} />
                    <View style={[styles.mapLine, styles.mapLine3]} />
                  </View>

                  {/* Store Icons */}
                  <View style={[styles.storeIcon, styles.store1]}>
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.deepTeal]}
                      style={styles.storeIconInner}
                    >
                      <Ionicons name="restaurant" size={12} color="#FFF" />
                    </LinearGradient>
                  </View>
                  <View style={[styles.storeIcon, styles.store2]}>
                    <LinearGradient
                      colors={[COLORS.gold, COLORS.goldDark]}
                      style={styles.storeIconInner}
                    >
                      <Ionicons name="cart" size={12} color="#FFF" />
                    </LinearGradient>
                  </View>
                  <View style={[styles.storeIcon, styles.store3]}>
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.deepTeal]}
                      style={styles.storeIconInner}
                    >
                      <Ionicons name="cafe" size={12} color="#FFF" />
                    </LinearGradient>
                  </View>
                </LinearGradient>
                <View style={styles.phoneButton} />
              </View>

              {/* Location Pin */}
              <View style={styles.locationPin}>
                <LinearGradient
                  colors={[COLORS.gold, COLORS.goldDark]}
                  style={styles.pinTop}
                >
                  <Ionicons name="location" size={16} color="#FFF" />
                </LinearGradient>
                <View style={styles.pinShadow} />
              </View>

              {/* Pulse Rings */}
              <View style={styles.pulseRings}>
                <View style={[styles.pulseRing, styles.pulseRing1]} />
                <View style={[styles.pulseRing, styles.pulseRing2]} />
              </View>
            </View>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="storefront-outline" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.featureText}>Find nearby stores</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="pricetags-outline" size={18} color={COLORS.gold} />
              </View>
              <Text style={styles.featureText}>Exclusive local deals</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="flash-outline" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.featureText}>Quick delivery options</Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.primaryButtonWrapper}
            onPress={requestLocationPermission}
            disabled={state.isLoading || isRequesting}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={
                (state.isLoading || isRequesting)
                  ? ['#D1D5DB', '#D1D5DB']
                  : [COLORS.primary, COLORS.deepTeal]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Ionicons name="location" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>
                {(state.isLoading || isRequesting) ? 'Getting Location...' : 'Allow Location Access'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  // Decorative
  decorativeCircles: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circleGreen: {
    width: 200,
    height: 200,
    top: -60,
    right: -60,
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
  },
  circleGold: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -50,
    backgroundColor: 'rgba(255, 200, 87, 0.1)',
  },

  // Glass Card
  glassCard: {
    backgroundColor: COLORS.glassWhite,
    borderRadius: 28,
    padding: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 15,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(30px)',
    }),
  },
  glassShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  underlineContainer: {
    alignItems: 'center',
  },
  underline: {
    width: 50,
    height: 4,
    borderRadius: 2,
  },

  // Illustration
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  phoneContainer: {
    position: 'relative',
    width: 160,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    width: 120,
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  phoneScreen: {
    flex: 1,
    margin: 6,
    borderRadius: 14,
    position: 'relative',
  },
  mapLines: {
    flex: 1,
    position: 'relative',
  },
  mapLine: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 192, 106, 0.2)',
    borderRadius: 2,
  },
  mapLine1: {
    width: 50,
    height: 2,
    top: '25%',
    left: '15%',
  },
  mapLine2: {
    width: 60,
    height: 2,
    top: '50%',
    right: '10%',
  },
  mapLine3: {
    width: 35,
    height: 2,
    top: '75%',
    left: '25%',
  },
  storeIcon: {
    position: 'absolute',
  },
  storeIconInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  store1: {
    top: '20%',
    left: '20%',
  },
  store2: {
    top: '45%',
    right: '15%',
  },
  store3: {
    bottom: '25%',
    left: '35%',
  },
  phoneButton: {
    width: 30,
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 6,
  },
  locationPin: {
    position: 'absolute',
    top: 30,
    right: 20,
    alignItems: 'center',
  },
  pinTop: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  pinShadow: {
    width: 16,
    height: 4,
    backgroundColor: 'rgba(255, 200, 87, 0.3)',
    borderRadius: 8,
    marginTop: 4,
  },
  pulseRings: {
    position: 'absolute',
    top: 30,
    right: 12,
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255, 200, 87, 0.3)',
  },
  pulseRing1: {
    width: 48,
    height: 48,
    top: -8,
    left: -8,
  },
  pulseRing2: {
    width: 64,
    height: 64,
    top: -16,
    left: -16,
  },

  // Features
  features: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },

  // Primary Button
  primaryButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
