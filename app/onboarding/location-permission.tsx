import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function LocationPermissionScreen() {
  const router = useRouter();
  const { updateUserData, setLoading, state } = useOnboarding();
  const [permissionRequested, setPermissionRequested] = useState(false);

  const requestLocationPermission = async () => {
    if (permissionRequested) return;
    
    setPermissionRequested(true);
    setLoading(true);

    try {
      // Check if location services are enabled
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to find the best deals near you.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        setLoading(false);
        setPermissionRequested(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Update user data with location
      updateUserData({
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
      });

      // Navigate to loading screen
      router.push('/onboarding/loading');
      
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
    <OnboardingContainer useGradient={false} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Please grant a{'\n'}location access</Text>
          <View style={styles.underline} />
        </View>

        <View style={styles.illustrationContainer}>
          {/* 3D Phone with Location Pin Illustration */}
          <View style={styles.phoneContainer}>
            <View style={styles.phone}>
              <View style={styles.phoneScreen}>
                <View style={styles.mapLines}>
                  <View style={[styles.mapLine, styles.mapLine1]} />
                  <View style={[styles.mapLine, styles.mapLine2]} />
                  <View style={[styles.mapLine, styles.mapLine3]} />
                </View>
              </View>
              <View style={styles.phoneButton} />
            </View>
            
            {/* Location Pin */}
            <View style={styles.locationPin}>
              <View style={styles.pinTop} />
              <View style={styles.pinBottom} />
            </View>
            
            {/* Phone Shadow */}
            <View style={styles.phoneShadow} />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            state.isLoading && styles.submitButtonDisabled
          ]}
          onPress={requestLocationPermission}
          disabled={state.isLoading}
        >
          <Text style={styles.submitButtonText}>
            {state.isLoading ? 'Getting Location...' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>
    </OnboardingContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 32,
    marginBottom: 8,
  },
  underline: {
    width: 60,
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  phoneContainer: {
    position: 'relative',
    width: 200,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phone: {
    width: 140,
    height: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    transform: [{ perspective: 1000 }, { rotateX: '15deg' }, { rotateY: '-10deg' }],
  },
  phoneScreen: {
    flex: 1,
    margin: 8,
    backgroundColor: '#F3F0FF',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    position: 'relative',
  },
  mapLines: {
    flex: 1,
    position: 'relative',
  },
  mapLine: {
    position: 'absolute',
    backgroundColor: '#8B5CF6',
    opacity: 0.3,
    borderRadius: 2,
  },
  mapLine1: {
    width: 60,
    height: 2,
    top: '30%',
    left: '20%',
  },
  mapLine2: {
    width: 80,
    height: 2,
    top: '50%',
    right: '15%',
  },
  mapLine3: {
    width: 40,
    height: 2,
    top: '70%',
    left: '30%',
  },
  phoneButton: {
    width: 30,
    height: 4,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  locationPin: {
    position: 'absolute',
    top: 60,
    right: 30,
    zIndex: 10,
  },
  pinTop: {
    width: 24,
    height: 24,
    backgroundColor: '#EC4899',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  pinBottom: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 8,
    borderRightWidth: 6,
    borderBottomWidth: 0,
    borderLeftWidth: 6,
    borderTopColor: '#EC4899',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    alignSelf: 'center',
    marginTop: -2,
  },
  phoneShadow: {
    position: 'absolute',
    bottom: -20,
    width: 160,
    height: 20,
    backgroundColor: '#8B5CF6',
    borderRadius: 80,
    opacity: 0.2,
    transform: [{ scaleY: 0.3 }],
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});