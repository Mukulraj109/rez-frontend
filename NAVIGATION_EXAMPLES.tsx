/**
 * Navigation System Examples
 * Complete examples of all navigation patterns and features
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeNavigation, useNavigationGuard, useNavigationEvent, useBackButton } from '@/hooks/useSafeNavigation';
import {
  SafeBackButton,
  ThemedSafeBackButton,
  SafeCloseButton,
  MinimalBackButton,
  HeaderBackButton,
} from '@/components/navigation';
import { NavigationEvent } from '@/types/navigation.types';

// =============================================================================
// Example 1: Basic Navigation
// =============================================================================

export function BasicNavigationExample() {
  const { navigate, goBack, canGoBack } = useSafeNavigation();

  return (
    <View style={styles.container}>
      <HeaderBackButton onPress={() => goBack('/')} />

      <TouchableOpacity onPress={() => navigate('/profile' as any)}>
        <Text>Go to Profile</Text>
      </TouchableOpacity>

      <Text>Can go back: {canGoBack ? 'Yes' : 'No'}</Text>
    </View>
  );
}

// =============================================================================
// Example 2: Navigation with Options
// =============================================================================

export function NavigationWithOptionsExample() {
  const { navigate } = useSafeNavigation();

  const handleNavigate = async () => {
    const result = await navigate('/profile' as any, {
      fallbackRoute: '/home' as any,
      onSuccess: () => {
        console.log('Navigation successful!');
      },
      onError: (error) => {
        Alert.alert('Error', 'Failed to navigate');
        console.error('Navigation error:', error);
      },
      replace: false,
    });

    if (result.status === 'success') {
      console.log('Navigated to:', result.route);
    } else if (result.status === 'fallback') {
      console.log('Used fallback route:', result.route);
    }
  };

  return (
    <TouchableOpacity onPress={handleNavigate}>
      <Text>Navigate with Options</Text>
    </TouchableOpacity>
  );
}

// =============================================================================
// Example 3: All Back Button Variants
// =============================================================================

export function BackButtonVariantsExample() {
  const { goBack } = useSafeNavigation();

  return (
    <View style={styles.container}>
      {/* Basic Safe Back Button */}
      <SafeBackButton
        fallbackRoute="/home" as any
        onPress={() => goBack('/')}
      />

      {/* Themed Variants */}
      <ThemedSafeBackButton
        variant="light"
        fallbackRoute="/home" as any
      />

      <ThemedSafeBackButton
        variant="dark"
        fallbackRoute="/home" as any
      />

      <ThemedSafeBackButton
        variant="transparent"
        fallbackRoute="/home" as any
      />

      {/* Close Button (for modals) */}
      <SafeCloseButton
        fallbackRoute="/home" as any
        onPress={() => goBack('/')}
      />

      {/* Minimal Button (no styling) */}
      <MinimalBackButton
        fallbackRoute="/home" as any
      />

      {/* Header Back Button */}
      <HeaderBackButton
        fallbackRoute="/home" as any
        iconColor="#FFFFFF"
      />
    </View>
  );
}

// =============================================================================
// Example 4: Back Button with Confirmation
// =============================================================================

export function BackButtonWithConfirmationExample() {
  const { goBack } = useSafeNavigation();

  return (
    <SafeBackButton
      fallbackRoute="/home" as any
      showConfirmation={true}
      confirmationMessage="Are you sure you want to leave? Unsaved changes will be lost."
      onPress={() => goBack('/')}
    />
  );
}

// =============================================================================
// Example 5: Navigation Guards
// =============================================================================

export function NavigationGuardExample() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Add authentication guard
  useNavigationGuard(async (to, from) => {
    // Check if route requires authentication
    const protectedRoutes = ['/profile', '/settings', '/orders'];

    if (protectedRoutes.some(route => to.startsWith(route))) {
      if (!isAuthenticated) {
        Alert.alert('Authentication Required', 'Please sign in to continue');
        return false; // Block navigation
      }
    }

    return true; // Allow navigation
  });

  return (
    <View style={styles.container}>
      <Text>Protected routes require authentication</Text>
    </View>
  );
}

// =============================================================================
// Example 6: Navigation Events
// =============================================================================

export function NavigationEventsExample() {
  const [navigationLog, setNavigationLog] = useState<string[]>([]);

  // Listen to before navigate event
  useNavigationEvent(
    NavigationEvent.BEFORE_NAVIGATE,
    (data) => {
      console.log('Before navigate:', data);
      setNavigationLog(prev => [...prev, `Before: ${data.from} -> ${data.to}`]);
    }
  );

  // Listen to after navigate event
  useNavigationEvent(
    NavigationEvent.AFTER_NAVIGATE,
    (data) => {
      console.log('After navigate:', data);
      setNavigationLog(prev => [...prev, `After: ${data.from} -> ${data.to}`]);
    }
  );

  // Listen to navigation error event
  useNavigationEvent(
    NavigationEvent.NAVIGATION_ERROR,
    (data) => {
      console.error('Navigation error:', data);
      setNavigationLog(prev => [...prev, `Error: ${data.error.message}`]);
    }
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Navigation Log:</Text>
      <ScrollView>
        {navigationLog.map((log, index) => (
          <Text key={index}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// Example 7: Hardware/Browser Back Button Handler
// =============================================================================

export function BackButtonHandlerExample() {
  // Handle hardware back button (Android) and browser back button (Web)
  useBackButton(() => {
    Alert.alert(
      'Exit App',
      'Are you sure you want to exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => true },
      ]
    );
    return true; // Prevent default back behavior
  });

  return (
    <View style={styles.container}>
      <Text>Press device back button to see custom handler</Text>
    </View>
  );
}

// =============================================================================
// Example 8: Complex Screen with Safe Navigation
// =============================================================================

export function CompleteScreenExample() {
  const { navigate, goBack, canGoBack, isNavigating } = useSafeNavigation();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleGoBack = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => goBack('/home' as any),
          },
        ]
      );
    } else {
      goBack('/home' as any);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <View style={styles.headerContent}>
          <HeaderBackButton
            onPress={handleGoBack}
            iconColor="#FFFFFF"
          />
          <Text style={styles.headerTitle}>My Screen</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Text>Can go back: {canGoBack ? 'Yes' : 'No'}</Text>
        <Text>Is navigating: {isNavigating ? 'Yes' : 'No'}</Text>

        {/* Navigation Buttons */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigate('/profile' as any)}
          disabled={isNavigating}
        >
          <Text>Go to Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigate('/settings' as any, {
            fallbackRoute: '/home' as any,
          })}
          disabled={isNavigating}
        >
          <Text>Go to Settings (with fallback)</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// =============================================================================
// Example 9: Modal with Close Button
// =============================================================================

export function ModalExample() {
  const { goBack } = useSafeNavigation();

  return (
    <View style={styles.modal}>
      <View style={styles.modalContent}>
        <SafeCloseButton
          onPress={() => goBack('/' as any)}
          style={styles.closeButton}
        />

        <Text style={styles.modalTitle}>Modal Title</Text>
        <Text>Modal content goes here</Text>
      </View>
    </View>
  );
}

// =============================================================================
// Example 10: Navigation with Loading State
// =============================================================================

export function NavigationWithLoadingExample() {
  const { navigate, isNavigating } = useSafeNavigation();
  const [customLoading, setCustomLoading] = useState(false);

  const handleNavigateWithLoading = async () => {
    setCustomLoading(true);

    const result = await navigate('/profile' as any, {
      fallbackRoute: '/home' as any,
    });

    setCustomLoading(false);

    if (result.status !== 'success') {
      Alert.alert('Error', 'Navigation failed. Please try again.');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, (isNavigating || customLoading) && styles.buttonDisabled]}
      onPress={handleNavigateWithLoading}
      disabled={isNavigating || customLoading}
    >
      <Text>
        {isNavigating || customLoading ? 'Navigating...' : 'Navigate'}
      </Text>
    </TouchableOpacity>
  );
}

// =============================================================================
// Example 11: Profile Screen with All Features
// =============================================================================

export function ProfileScreenExample() {
  const { goBack, navigate } = useSafeNavigation();
  const [isAuthenticated] = useState(true);

  // Guard profile access
  useNavigationGuard(async (to) => {
    if (to === '/profile' && !isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to view your profile');
      return false;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedSafeBackButton
            variant="light"
            fallbackRoute="/home" as any
            onPress={() => goBack('/' as any)}
          />
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => navigate('/settings' as any)}>
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <TouchableOpacity onPress={() => navigate('/profile/edit' as any)}>
          <Text>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigate('/orders' as any)}>
          <Text>My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigate('/wishlist' as any)}>
          <Text>My Wishlist</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
});

// =============================================================================
// Export all examples
// =============================================================================

export default {
  BasicNavigationExample,
  NavigationWithOptionsExample,
  BackButtonVariantsExample,
  BackButtonWithConfirmationExample,
  NavigationGuardExample,
  NavigationEventsExample,
  BackButtonHandlerExample,
  CompleteScreenExample,
  ModalExample,
  NavigationWithLoadingExample,
  ProfileScreenExample,
};
